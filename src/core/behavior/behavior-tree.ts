import { COMPOSITE, DECORATOR } from "./constants.ts";
import { Blackboard } from "./blackboard.ts";
import { Tick } from "./tick.ts";
import { createUUID } from "./uuid.ts";
import { defaultNodeRegistry } from "./default-nodes.ts";
import type {
  BehaviorNodeConstructor,
  BehaviorNodeRegistry,
  BehaviorTreeData
} from "./types.ts";
import type { BaseNode } from "./nodes/base-node.ts";

/**
 * 运行时行为树。
 *
 * 编辑器仍导出既有 Behavior3JS JSON 结构，但执行逻辑
 * 已经迁移到 TypeScript 实现。这个类负责：
 *
 * - 从 JSON 实例化节点并建立父子关系。
 * - 将运行时树重新 dump 为兼容 JSON。
 * - 每次 tick 时创建 Tick，并维护跨 tick 的 openNodes 状态。
 */
export class BehaviorTree {
  /** 树 ID，用作 Blackboard 中树级内存的 scope。 */
  id: string;

  /** 树标题，来自导入 JSON 或默认值。 */
  title: string;

  /** 树描述，来自导入 JSON 或默认值。 */
  description: string;

  /** 树级自定义属性。 */
  properties: Record<string, any>;

  /** 运行时根节点；空树时为 null。 */
  root: BaseNode | null;

  /** 调试器扩展点，保留旧 Behavior3JS 字段。 */
  debug: any;

  /**
   * 创建一棵空行为树。
   */
  constructor() {
    this.id = createUUID();
    this.title = "The behavior tree";
    this.description = "Default description";
    this.properties = {};
    this.root = null;
    this.debug = null;
  }

  /**
   * 从兼容 JSON 加载行为树。
   *
   * @param data 行为树 JSON 数据。
   * @param names 自定义节点名称到构造函数的映射；默认节点会从 defaultNodeRegistry 解析。
   */
  load(data: BehaviorTreeData, names?: BehaviorNodeRegistry): void {
    names = names || {};

    this.title = data.title || this.title;
    this.description = data.description || this.description;
    this.properties = data.properties || this.properties;

    var nodes: Record<string, any> = {};

    // 第一遍只创建节点，不建立连接；这样 children 可以引用 JSON 中后出现的节点。
    for (var id in data.nodes) {
      var spec = data.nodes[id];
      var cls: BehaviorNodeConstructor | undefined;

      if (spec.name in names) {
        cls = names[spec.name];
      } else if (spec.name in defaultNodeRegistry) {
        cls = defaultNodeRegistry[spec.name];
      } else {
        throw EvalError('BehaviorTree.load: Invalid node name + "' + spec.name + '".');
      }

      // 旧 Behavior3JS 会把 properties 直接作为构造参数传入节点。
      var node = new cls(spec.properties);

      // JSON 中显式提供的字段优先生效；未提供时保留节点构造函数默认值。
      node.id = spec.id || node.id;
      node.title = spec.title || node.title;
      node.description = spec.description || node.description;
      node.properties = spec.properties || node.properties;

      nodes[id] = node;
    }

    // 第二遍连接 composite 的 children 和 decorator 的 child 引用。
    for (var id in data.nodes) {
      var spec = data.nodes[id];
      var node = nodes[id];

      if (node.category === COMPOSITE && spec.children) {
        for (var i = 0; i < spec.children.length; i++) {
          var cid = spec.children[i];
          // children 数组中保存的是 ID，这里替换为运行时节点实例。
          node.children.push(nodes[cid]);
        }
      } else if (node.category === DECORATOR && spec.child) {
        // decorator 只有一个 child，同样由 ID 解析为运行时节点实例。
        node.child = nodes[spec.child];
      }
    }

    // data.root 是根节点 ID；为 null 时表示空树。
    this.root = data.root ? nodes[data.root] : null;
  }

  /**
   * 将运行时行为树导出为兼容 JSON。
   *
   * 导出结构用于运行时加载，不包含编辑器画布上的 display 信息；编辑器层
   * 的导入导出管理器会负责保存坐标、相机等 UI 数据。
   */
  dump(): BehaviorTreeData {
    var data: BehaviorTreeData = {
      title: this.title,
      description: this.description,
      root: this.root ? this.root.id : null,
      properties: this.properties,
      nodes: {},
      custom_nodes: []
    };
    var customNames: string[] = [];

    if (!this.root) return data;

    var stack: any[] = [this.root];
    while (stack.length > 0) {
      var node = stack.pop();

      // NodeSpec 使用可序列化的字段，不直接暴露运行时对象引用。
      var spec: any = {};
      spec.id = node.id;
      spec.name = node.name;
      spec.title = node.title;
      spec.description = node.description;
      spec.properties = node.properties;
      spec.parameters = node.parameters;

      // 每个自定义节点原型名只输出一次元数据。
      // 旧库依赖 prototype.name 判断是否为自定义节点；这里保留同样规则。
      var nodeName = Object.getPrototypeOf(node).name || node.name;
      if (!defaultNodeRegistry[nodeName] && customNames.indexOf(nodeName) < 0) {
        var subdata: any = {};
        subdata.name = nodeName;
        subdata.title = Object.getPrototypeOf(node).title || node.title;
        subdata.category = node.category;

        customNames.push(nodeName);
        data.custom_nodes!.push(subdata);
      }

      // 反向入栈以保持遍历和旧 dumper 的序列化顺序一致。
      if (node.category === COMPOSITE && node.children) {
        var children: string[] = [];
        for (var i = node.children.length - 1; i >= 0; i--) {
          // 输出里 children 只保存 ID，运行时引用由 load 的第二遍恢复。
          children.push(node.children[i].id);
          stack.push(node.children[i]);
        }
        spec.children = children;
      } else if (node.category === DECORATOR && node.child) {
        stack.push(node.child);
        spec.child = node.child.id;
      }

      data.nodes[node.id] = spec;
    }

    return data;
  }

  /**
   * 执行一帧行为树。
   *
   * @param target 业务对象，默认节点不使用，主要传给自定义节点。
   * @param blackboard 黑板，用于保存跨 tick 的运行状态。
   * @returns 根节点返回的执行状态常量。
   */
  tick(target: any, blackboard: Blackboard): number {
    if (!blackboard) {
      throw "The blackboard parameter is obligatory and must be an instance of b3.Blackboard";
    }

    // Tick 是本次执行的临时上下文，不能跨帧复用。
    var tick = new Tick();
    tick.debug = this.debug;
    tick.target = target;
    tick.blackboard = blackboard;
    tick.tree = this;

    // 从 root 向下传播执行信号。这里沿用旧库约定：调用方负责保证 root 存在。
    var state = this.root!._execute(tick);

    var lastOpenNodes = blackboard.get("openNodes", this.id) || [];
    var currOpenNodes = tick._openNodes.slice(0);

    // 关闭上一 tick 仍打开、但本 tick 没有访问到的节点；公共前缀跨帧保持打开。
    var start = 0;
    for (var i = 0; i < Math.min(lastOpenNodes.length, currOpenNodes.length); i++) {
      if (lastOpenNodes[i] !== currOpenNodes[i]) {
        break;
      }
      start = i + 1;
    }

    for (var i = lastOpenNodes.length - 1; i >= start; i--) {
      if (blackboard.get("isOpen", this.id, lastOpenNodes[i].id)) {
        lastOpenNodes[i]._close(tick);
      }
    }

    // 写回本 tick 的打开节点列表，供下一帧判断哪些节点需要补 close。
    blackboard.set("openNodes", currOpenNodes, this.id);
    blackboard.set("nodeCount", tick._nodeCount, this.id);

    return state;
  }
}
