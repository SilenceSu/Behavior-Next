import { SUCCESS } from "../constants.ts";
import type { Tick } from "../tick.ts";
import { Composite } from "./composite.ts";

/**
 * 顺序节点。
 *
 * 从左到右依次执行 children：
 * - 任一 child 返回非 SUCCESS 时立即返回该状态。
 * - 所有 children 都返回 SUCCESS 时返回 SUCCESS。
 */
export class Sequence extends Composite {
  /**
   * 执行顺序遍历。
   */
  tick(tick: Tick): number {
    for (var i = 0; i < this.children.length; i++) {
      var status = this.children[i]._execute(tick);
      if (status !== SUCCESS) return status;
    }

    return SUCCESS;
  }
}

// 默认节点名用于编辑器注册和 JSON load/dump。
(Sequence.prototype as any).name = "Sequence";
