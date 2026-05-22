import { RUNNING } from "../constants.ts";
import { createUUID } from "../uuid.ts";
import type { Tick } from "../tick.ts";

/**
 * 所有行为节点的基础类。
 *
 * BaseNode 负责 Behavior3JS 生命周期约定：
 * enter -> open -> tick -> close -> exit。
 *
 * 子类通常只需要覆盖 enter/open/tick/close/exit 中的业务钩子，不应该直接
 * 调用下划线开头的包装方法。包装方法负责通知 Tick、维护 Blackboard 中的
 * isOpen 状态，并保证 RUNNING 节点能跨 tick 保持打开。
 */
export class BaseNode {
  /** 节点实例 ID，用于 Blackboard 节点作用域和 JSON 序列化。 */
  id: string;

  /** 节点类型名，例如 Sequence、Wait；编辑器用它注册节点模板。 */
  name: string | null;

  /** 节点分类，必须是 composite/decorator/action/condition 之一。 */
  category: string | null;

  /** 编辑器展示标题；缺省时使用 name。 */
  title: string | null;

  /** 编辑器展示说明。 */
  description: string;

  /** 节点类型参数定义，主要用于编辑器属性面板。 */
  parameters: Record<string, any>;

  /** 节点实例属性，来自 JSON 的 properties。 */
  properties: Record<string, any>;

  /**
   * 初始化节点实例默认字段。
   *
   * name/category/title 通常定义在 prototype 上，这里会把 prototype 默认值
   * 复制到实例字段，保持旧 Behavior3JS 的对象形态。
   */
  constructor() {
    this.id = createUUID();
    this.name = (this as any).name || null;
    this.category = (this as any).category || null;
    this.title = (this as any).title || this.name;
    this.description = "";
    this.parameters = {};
    this.properties = {};
  }

  /**
   * 执行节点生命周期包装。
   *
   * 这是行为树遍历时调用的主入口；它负责根据上次状态判断是否需要 open，
   * 并在非 RUNNING 状态时自动 close。
   */
  _execute(tick: Tick): number {
    this._enter(tick);

    // RUNNING 节点会跨 tick 保持打开；其他状态会在产生状态的同一个 tick 中关闭。
    if (!tick.blackboard.get("isOpen", tick.tree.id, this.id)) {
      this._open(tick);
    }

    var status = this._tick(tick);

    if (status !== RUNNING) {
      this._close(tick);
    }

    this._exit(tick);
    return status;
  }

  /**
   * enter 包装：通知 Tick 并调用用户钩子。
   */
  _enter(tick: Tick): void {
    tick._enterNode(this);
    this.enter(tick);
  }

  /**
   * open 包装：标记节点打开并调用用户钩子。
   */
  _open(tick: Tick): void {
    tick._openNode(this);
    tick.blackboard.set("isOpen", true, tick.tree.id, this.id);
    this.open(tick);
  }

  /**
   * tick 包装：通知 Tick 并执行节点真实逻辑。
   */
  _tick(tick: Tick): number {
    tick._tickNode(this);
    return this.tick(tick);
  }

  /**
   * close 包装：标记节点关闭并调用用户钩子。
   */
  _close(tick: Tick): void {
    tick._closeNode(this);
    tick.blackboard.set("isOpen", false, tick.tree.id, this.id);
    this.close(tick);
  }

  /**
   * exit 包装：通知 Tick 并调用用户钩子。
   */
  _exit(tick: Tick): void {
    tick._exitNode(this);
    this.exit(tick);
  }

  /** 每次节点被执行时最先调用。 */
  enter(_tick: Tick): void {}

  /** 节点从关闭状态转为打开状态时调用。 */
  open(_tick: Tick): void {}

  /** 节点核心逻辑，子类应返回 SUCCESS/FAILURE/RUNNING/ERROR。 */
  tick(_tick: Tick): number {
    return 0;
  }

  /** 节点返回非 RUNNING 状态后调用。 */
  close(_tick: Tick): void {}

  /** 每次节点执行结束时调用，无论状态如何都会触发。 */
  exit(_tick: Tick): void {}
}

// prototype 默认值用于兼容旧 Behavior3JS 的元数据读取方式。
(BaseNode.prototype as any).name = null;
(BaseNode.prototype as any).category = null;
(BaseNode.prototype as any).title = null;
(BaseNode.prototype as any).description = null;
(BaseNode.prototype as any).parameters = null;
(BaseNode.prototype as any).properties = null;
