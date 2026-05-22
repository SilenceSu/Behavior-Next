/**
 * 单次行为树执行的上下文。
 *
 * BehaviorTree.tick 每次调用都会创建一个 Tick。节点通过它访问当前树、
 * 目标对象、黑板，并记录本次遍历访问到的 open nodes。
 */
export class Tick {
  /** 当前执行的行为树，由 BehaviorTree.tick 设置。 */
  tree: any;

  /** 调试器占位，保留旧 Behavior3JS 的扩展点。 */
  debug: any;

  /** 调用方传入的业务对象，默认节点不使用，通常留给自定义节点读取。 */
  target: any;

  /** 本次执行使用的黑板。 */
  blackboard: any;

  /** 本 tick 访问并保持打开的节点栈。 */
  _openNodes: any[];

  /** 本 tick 进入过的节点数量，用于调试和统计。 */
  _nodeCount: number;

  constructor() {
    this.tree = null;
    this.debug = null;
    this.target = null;
    this.blackboard = null;
    this._openNodes = [];
    this._nodeCount = 0;
  }

  /**
   * 节点进入时调用：记录访问次数，并把节点放入当前打开节点栈。
   */
  _enterNode(node: any): void {
    this._nodeCount++;
    this._openNodes.push(node);
  }

  /**
   * 节点打开时调用。
   *
   * 当前没有调试器实现，所以保留为空方法，维持旧扩展点。
   */
  _openNode(_node: any): void {}

  /**
   * 节点 tick 前调用，保留给调试器或可视化执行轨迹扩展。
   */
  _tickNode(_node: any): void {}

  /**
   * 节点关闭时调用：从当前打开节点栈弹出。
   */
  _closeNode(_node: any): void {
    this._openNodes.pop();
  }

  /**
   * 节点退出时调用，保留给调试器或可视化执行轨迹扩展。
   */
  _exitNode(_node: any): void {}
}
