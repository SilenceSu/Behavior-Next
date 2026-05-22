import { RUNNING, SUCCESS } from "../constants.ts";
import type { Tick } from "../tick.ts";
import { Composite } from "./composite.ts";

/**
 * 带记忆的顺序节点。
 *
 * 与 Sequence 类似，但 child 返回 RUNNING 后，下一 tick 会从该 child 继续，
 * 而不是从第一个 child 重新开始。
 */
export class MemSequence extends Composite {
  /**
   * 节点打开时从第一个 child 开始。
   */
  open(tick: Tick): void {
    tick.blackboard.set("runningChild", 0, tick.tree.id, this.id);
  }

  /**
   * 从 runningChild 开始执行，直到遇到非 SUCCESS 状态。
   */
  tick(tick: Tick): number {
    // 从上一 tick 返回 RUNNING 的子节点继续执行。
    var child = tick.blackboard.get("runningChild", tick.tree.id, this.id);

    for (var i = child; i < this.children.length; i++) {
      var status = this.children[i]._execute(tick);

      if (status !== SUCCESS) {
        if (status === RUNNING) {
          tick.blackboard.set("runningChild", i, tick.tree.id, this.id);
        }
        return status;
      }
    }

    return SUCCESS;
  }
}

// 默认节点名用于编辑器注册和 JSON load/dump。
(MemSequence.prototype as any).name = "MemSequence";
