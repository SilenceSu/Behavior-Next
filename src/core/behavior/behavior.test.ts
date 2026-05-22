import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ACTION,
  Action,
  BaseNode,
  BehaviorTree,
  Blackboard,
  ERROR,
  ErrorNode,
  FAILURE,
  Failer,
  Inverter,
  Limiter,
  MaxTime,
  MemPriority,
  MemSequence,
  Priority,
  Repeater,
  RepeatUntilFailure,
  RepeatUntilSuccess,
  RUNNING,
  Runner,
  SUCCESS,
  Sequence,
  Succeeder,
  Tick,
  Wait,
  createUUID,
  legacyClass
} from "./index.ts";
import { installBehaviorCompat } from "./compat.ts";

class ScriptedAction extends Action {
  statuses: number[];
  calls: number;
  events: string[];

  constructor(statuses: number[] = [SUCCESS], events: string[] = []) {
    super();
    this.statuses = statuses;
    this.calls = 0;
    this.events = events;
  }

  enter(): void {
    this.events.push(this.name + ":enter");
  }

  open(): void {
    this.events.push(this.name + ":open");
  }

  tick(): number {
    this.events.push(this.name + ":tick");
    var index = Math.min(this.calls, this.statuses.length - 1);
    this.calls++;
    return this.statuses[index];
  }

  close(): void {
    this.events.push(this.name + ":close");
  }

  exit(): void {
    this.events.push(this.name + ":exit");
  }
}

(ScriptedAction.prototype as any).name = "ScriptedAction";

function tickNode(node: BaseNode): number {
  var tree = new BehaviorTree();
  tree.root = node;
  return tree.tick({}, new Blackboard());
}

describe("behavior core", function() {
  afterEach(function() {
    vi.useRealTimers();
  });

  it("creates UUID strings without immediate collisions", function() {
    var first = createUUID();
    var second = createUUID();

    expect(first).toMatch(/^[0-9a-f-]{36}$/);
    expect(second).toMatch(/^[0-9a-f-]{36}$/);
    expect(first).not.toBe(second);
  });

  it("stores global, tree, and node scoped blackboard values", function() {
    var blackboard = new Blackboard();

    blackboard.set("value", "global");
    blackboard.set("value", "tree", "tree-a");
    blackboard.set("value", "node", "tree-a", "node-a");

    expect(blackboard.get("value")).toBe("global");
    expect(blackboard.get("value", "tree-a")).toBe("tree");
    expect(blackboard.get("value", "tree-a", "node-a")).toBe("node");
  });

  it("runs the node lifecycle and keeps running nodes open", function() {
    var events: string[] = [];
    var node = new ScriptedAction([RUNNING, SUCCESS], events);
    var tree = new BehaviorTree();
    var blackboard = new Blackboard();

    tree.root = node;

    expect(tree.tick({}, blackboard)).toBe(RUNNING);
    expect(events).toEqual([
      "ScriptedAction:enter",
      "ScriptedAction:open",
      "ScriptedAction:tick",
      "ScriptedAction:exit"
    ]);

    expect(tree.tick({}, blackboard)).toBe(SUCCESS);
    expect(events.slice(4)).toEqual([
      "ScriptedAction:enter",
      "ScriptedAction:tick",
      "ScriptedAction:close",
      "ScriptedAction:exit"
    ]);
  });

  it("closes nodes left open by the previous tick when traversal changes", function() {
    var events: string[] = [];
    var first = new ScriptedAction([FAILURE, RUNNING], events);
    var second = new ScriptedAction([RUNNING], events);
    var root = new Priority({ children: [first, second] });
    var tree = new BehaviorTree();
    var blackboard = new Blackboard();

    (first as any).name = "first";
    (second as any).name = "second";
    tree.root = root;

    expect(tree.tick({}, blackboard)).toBe(RUNNING);
    expect(tree.tick({}, blackboard)).toBe(RUNNING);
    expect(events).toContain("second:close");
  });

  it("loads and dumps trees with built-in and custom nodes", function() {
    class CustomAction extends Action {
      tick(): number {
        return SUCCESS;
      }
    }

    (CustomAction.prototype as any).name = "CustomAction";
    (CustomAction.prototype as any).title = "Custom Action";

    var tree = new BehaviorTree();
    tree.load({
      title: "Loaded tree",
      description: "Loaded description",
      root: "sequence",
      properties: { speed: 1 },
      nodes: {
        sequence: {
          id: "sequence",
          name: "Sequence",
          children: ["inverter", "custom"]
        },
        inverter: {
          id: "inverter",
          name: "Inverter",
          child: "failer"
        },
        failer: {
          id: "failer",
          name: "Failer"
        },
        custom: {
          id: "custom",
          name: "CustomAction"
        }
      }
    }, {
      CustomAction
    });

    expect(tree.title).toBe("Loaded tree");
    expect(tree.properties).toEqual({ speed: 1 });
    expect(tree.root).toBeInstanceOf(Sequence);
    expect((tree.root as Sequence).children[0]).toBeInstanceOf(Inverter);
    expect((tree.root as Sequence).children[1]).toBeInstanceOf(CustomAction);

    var dump = tree.dump();
    expect(dump.root).toBe("sequence");
    expect(dump.nodes.sequence.name).toBe("Sequence");
    expect(dump.nodes.custom.name).toBe("CustomAction");
    expect(dump.custom_nodes).toEqual([
      {
        name: "CustomAction",
        title: "Custom Action",
        category: ACTION
      }
    ]);
  });

  it("throws when loading an unknown node name", function() {
    var tree = new BehaviorTree();

    expect(function() {
      tree.load({
        root: "missing",
        nodes: {
          missing: {
            id: "missing",
            name: "Missing"
          }
        }
      });
    }).toThrow(/Invalid node name/);
  });

  it("runs composite nodes", function() {
    var success = new ScriptedAction([SUCCESS]);
    var failure = new ScriptedAction([FAILURE]);
    var runningThenSuccess = new ScriptedAction([RUNNING, SUCCESS]);
    var runningThenFailure = new ScriptedAction([RUNNING, FAILURE]);

    expect(tickNode(new Sequence({ children: [success, new Succeeder()] }))).toBe(SUCCESS);
    expect(tickNode(new Sequence({ children: [new Succeeder(), failure] }))).toBe(FAILURE);
    expect(tickNode(new Priority({ children: [new Failer(), new Succeeder()] }))).toBe(SUCCESS);
    expect(tickNode(new Priority({ children: [new Failer(), new Failer()] }))).toBe(FAILURE);

    var memSequence = new MemSequence({ children: [new Succeeder(), runningThenSuccess] });
    var sequenceTree = new BehaviorTree();
    var sequenceBlackboard = new Blackboard();
    sequenceTree.root = memSequence;
    expect(sequenceTree.tick({}, sequenceBlackboard)).toBe(RUNNING);
    expect(sequenceTree.tick({}, sequenceBlackboard)).toBe(SUCCESS);
    expect(runningThenSuccess.calls).toBe(2);

    var memPriority = new MemPriority({ children: [new Failer(), runningThenFailure] });
    var priorityTree = new BehaviorTree();
    var priorityBlackboard = new Blackboard();
    priorityTree.root = memPriority;
    expect(priorityTree.tick({}, priorityBlackboard)).toBe(RUNNING);
    expect(priorityTree.tick({}, priorityBlackboard)).toBe(FAILURE);
    expect(runningThenFailure.calls).toBe(2);
  });

  it("runs decorator nodes", function() {
    expect(tickNode(new Inverter({ child: new Succeeder() }))).toBe(FAILURE);
    expect(tickNode(new Inverter({ child: new Failer() }))).toBe(SUCCESS);
    expect(tickNode(new Inverter())).toBe(ERROR);
    expect(tickNode(new Limiter({ maxLoop: 1, child: new Succeeder() }))).toBe(SUCCESS);
    expect(function() {
      return new Limiter();
    }).toThrow(/maxLoop parameter/);

    var repeated = new ScriptedAction([SUCCESS]);
    expect(tickNode(new Repeater({ maxLoop: 2, child: repeated }))).toBe(SUCCESS);
    expect(repeated.calls).toBe(2);

    var untilFailure = new ScriptedAction([SUCCESS, FAILURE]);
    expect(tickNode(new RepeatUntilFailure({ maxLoop: 3, child: untilFailure }))).toBe(FAILURE);
    expect(untilFailure.calls).toBe(2);

    var untilSuccess = new ScriptedAction([FAILURE, SUCCESS]);
    expect(tickNode(new RepeatUntilSuccess({ maxLoop: 3, child: untilSuccess }))).toBe(SUCCESS);
    expect(untilSuccess.calls).toBe(2);
  });

  it("runs time based decorators and actions", function() {
    vi.useFakeTimers();
    vi.setSystemTime(0);

    var tree = new BehaviorTree();
    var blackboard = new Blackboard();
    tree.root = new MaxTime({ maxTime: 10, child: new Runner() });

    expect(tree.tick({}, blackboard)).toBe(RUNNING);
    vi.setSystemTime(11);
    expect(tree.tick({}, blackboard)).toBe(FAILURE);

    var waitTree = new BehaviorTree();
    var waitBlackboard = new Blackboard();
    waitTree.root = new Wait({ milliseconds: 10 });
    expect(waitTree.tick({}, waitBlackboard)).toBe(RUNNING);
    vi.setSystemTime(22);
    expect(waitTree.tick({}, waitBlackboard)).toBe(SUCCESS);
  });

  it("runs action nodes", function() {
    expect(tickNode(new Succeeder())).toBe(SUCCESS);
    expect(tickNode(new Failer())).toBe(FAILURE);
    expect(tickNode(new Runner())).toBe(RUNNING);
    expect(tickNode(new ErrorNode())).toBe(ERROR);
  });

  it("exposes the legacy b3 namespace", function() {
    var target = {} as Window & typeof globalThis & { b3?: any };

    installBehaviorCompat(target);

    expect(target.b3.SUCCESS).toBe(SUCCESS);
    expect(target.b3.BehaviorTree).toBe(BehaviorTree);
    expect(target.b3.Blackboard).toBe(Blackboard);
    expect(target.b3.Error).toBe(ErrorNode);
    expect(target.b3.createUUID()).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("keeps the legacy Class helper behavior", function() {
    var Parent = legacyClass();
    Parent.prototype.initialize = function(settings: any) {
      this.value = settings.value;
    };

    var Child = legacyClass(Parent);
    Child.prototype.initialize = function(settings: any) {
      Parent.prototype.initialize.call(this, settings);
      this.extra = "child";
    };

    var instance = new Child({ value: 7 });

    expect(instance).toBeInstanceOf(Child);
    expect(instance).toBeInstanceOf(Parent);
    expect(instance.value).toBe(7);
    expect(instance.extra).toBe("child");
  });

  it("initializes ticks with traversal counters", function() {
    var tick = new Tick();
    var node = new Succeeder();

    tick._enterNode(node);
    expect(tick._nodeCount).toBe(1);
    expect(tick._openNodes).toEqual([node]);
    tick._closeNode(node);
    expect(tick._openNodes).toEqual([]);
  });
});
