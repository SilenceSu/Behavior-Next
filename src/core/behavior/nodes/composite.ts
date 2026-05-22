import { COMPOSITE } from "../constants.ts";
import type { NodeSettings } from "../types.ts";
import { BaseNode } from "./base-node.ts";

/**
 * 组合节点基类。
 *
 * Composite 持有有序 children 列表，并由子类决定遍历策略。Sequence 和
 * Priority 每次从第一个 child 开始；MemSequence 和 MemPriority 会记住
 * 上次 RUNNING 的 child。
 */
export class Composite extends BaseNode {
  /** 有序子节点列表。 */
  children: BaseNode[];

  /**
   * @param settings.children 初始子节点列表；会复制一份，避免外部数组被直接共享。
   */
  constructor(settings?: NodeSettings) {
    super();
    settings = settings || {};
    this.children = (settings.children || []).slice(0);
  }
}

// 分类放在 prototype 上，兼容编辑器读取 b3.Composite.prototype.category。
(Composite.prototype as any).category = COMPOSITE;
