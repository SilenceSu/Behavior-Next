/**
 * 单棵行为树的运行时内存。
 *
 * nodeMemory 保存树内每个节点的私有内存；openNodes、traversalDepth、
 * traversalCycle 是旧 Behavior3JS 预留/使用的树级执行状态。
 */
type TreeMemory = {
  nodeMemory: Record<string, Record<string, any>>;
  openNodes: any[];
  traversalDepth: number;
  traversalCycle: number;
  [key: string]: any;
};

/**
 * 行为树黑板。
 *
 * Blackboard 只保存运行时瞬时状态，不参与 JSON 导出。它支持三层作用域：
 *
 * - 不传 treeScope：全局内存。
 * - 传 treeScope：某棵树的内存。
 * - 同时传 treeScope 和 nodeScope：某棵树内某个节点的私有内存。
 */
export class Blackboard {
  _baseMemory: Record<string, any>;
  _treeMemory: Record<string, TreeMemory>;

  constructor() {
    this._baseMemory = {};
    this._treeMemory = {};
  }

  /**
   * 获取或创建某棵树的内存。
   */
  _getTreeMemory(treeScope: string): TreeMemory {
    if (!this._treeMemory[treeScope]) {
      this._treeMemory[treeScope] = {
        nodeMemory: {},
        openNodes: [],
        traversalDepth: 0,
        traversalCycle: 0
      };
    }

    return this._treeMemory[treeScope];
  }

  /**
   * 获取或创建某个节点在某棵树里的私有内存。
   */
  _getNodeMemory(treeMemory: TreeMemory, nodeScope: string): Record<string, any> {
    var memory = treeMemory.nodeMemory;
    if (!memory[nodeScope]) {
      memory[nodeScope] = {};
    }

    return memory[nodeScope];
  }

  /**
   * 根据作用域参数选择最终读写的内存对象。
   */
  _getMemory(treeScope?: string, nodeScope?: string): Record<string, any> {
    var memory: Record<string, any> = this._baseMemory;

    // 节点作用域只在树作用域内有意义，这里保持原 Behavior3JS 的内存布局。
    if (treeScope) {
      memory = this._getTreeMemory(treeScope);

      if (nodeScope) {
        memory = this._getNodeMemory(memory as TreeMemory, nodeScope);
      }
    }

    return memory;
  }

  /**
   * 写入黑板值。
   *
   * @param key 值名称。
   * @param value 任意运行时值。
   * @param treeScope 可选树 ID；提供后写入树级内存。
   * @param nodeScope 可选节点 ID；提供后写入节点级内存。
   */
  set(key: string, value: any, treeScope?: string, nodeScope?: string): void {
    var memory = this._getMemory(treeScope, nodeScope);
    memory[key] = value;
  }

  /**
   * 读取黑板值。
   */
  get(key: string, treeScope?: string, nodeScope?: string): any {
    var memory = this._getMemory(treeScope, nodeScope);
    return memory[key];
  }
}
