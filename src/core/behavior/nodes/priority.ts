import { FAILURE } from "../constants.ts";
import type { Tick } from "../tick.ts";
import { Composite } from "./composite.ts";

/**
 * 优先选择节点。
 *
 * 从左到右依次执行 children：
 * - 任一 child 返回非 FAILURE 时立即返回该状态。
 * - 所有 children 都返回 FAILURE 时返回 FAILURE。
 */
export class Priority extends Composite {
  /**
   * 执行优先选择遍历。
   */
  tick(tick: Tick): number {
    for (var i = 0; i < this.children.length; i++) {
      var status = this.children[i]._execute(tick);
      if (status !== FAILURE) return status;
    }

    return FAILURE;
  }
}

// 默认节点名用于编辑器注册和 JSON load/dump。
(Priority.prototype as any).name = "Priority";
