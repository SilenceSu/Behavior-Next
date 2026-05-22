import { DECORATOR } from "../constants.ts";
import type { NodeSettings } from "../types.ts";
import { BaseNode } from "./base-node.ts";

/**
 * 装饰节点基类。
 *
 * Decorator 只包装一个 child，并由子类决定如何转换、重复、限制或中断 child
 * 的执行状态。
 */
export class Decorator extends BaseNode {
  /** 被装饰的单个子节点。 */
  child: BaseNode | null;

  /**
   * @param settings.child 初始子节点；没有 child 时多数装饰节点会返回 ERROR。
   */
  constructor(settings?: NodeSettings) {
    super();
    settings = settings || {};
    this.child = settings.child || null;
  }
}

// 分类放在 prototype 上，兼容编辑器读取 b3.Decorator.prototype.category。
(Decorator.prototype as any).category = DECORATOR;
