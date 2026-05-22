import { ERROR, FAILURE } from "../constants.ts";
import type { Tick } from "../tick.ts";
import type { NodeSettings } from "../types.ts";
import { Decorator } from "./decorator.ts";

/**
 * 重复直到成功节点。
 *
 * 在一个 tick 内持续执行 child，只要 child 返回 FAILURE 就继续计数并重试；
 * child 返回 SUCCESS、RUNNING 或 ERROR 时停止并返回该状态。
 */
export class RepeatUntilSuccess extends Decorator {
  /** 最大循环次数；-1 表示不限制。 */
  maxLoop: number;

  /**
   * @param settings.maxLoop 最大循环次数，缺省为 -1。
   * @param settings.child 被重复执行的子节点。
   */
  constructor(settings?: NodeSettings) {
    settings = settings || {};
    super(settings);
    this.maxLoop = settings.maxLoop || -1;
  }

  /**
   * 节点打开时重置循环计数器。
   */
  open(tick: Tick): void {
    tick.blackboard.set("i", 0, tick.tree.id, this.id);
  }

  /**
   * 重复失败结果，直到 child 不再返回 FAILURE。
   */
  tick(tick: Tick): number {
    if (!this.child) return ERROR;

    var i = tick.blackboard.get("i", tick.tree.id, this.id);
    var status = FAILURE;

    // 持续重试失败的子节点执行，直到出现 SUCCESS/RUNNING/ERROR。
    while (this.maxLoop < 0 || i < this.maxLoop) {
      status = this.child._execute(tick);
      if (status === FAILURE) i++;
      else break;
    }

    tick.blackboard.set("i", i, tick.tree.id, this.id);
    return status;
  }
}

// 以下 prototype 元数据用于编辑器默认节点面板和 JSON 兼容。
(RepeatUntilSuccess.prototype as any).name = "RepeatUntilSuccess";
(RepeatUntilSuccess.prototype as any).title = "Repeat Until Success";
(RepeatUntilSuccess.prototype as any).parameters = { maxLoop: -1 };
