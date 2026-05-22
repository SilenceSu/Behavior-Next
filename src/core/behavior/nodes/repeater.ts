import { ERROR, FAILURE, SUCCESS } from "../constants.ts";
import type { Tick } from "../tick.ts";
import type { NodeSettings } from "../types.ts";
import { Decorator } from "./decorator.ts";

/**
 * 重复节点。
 *
 * 在一个 tick 内反复执行 child。child 返回 SUCCESS 或 FAILURE 时计数并继续；
 * child 返回 RUNNING 或 ERROR 时停止并返回该状态。maxLoop 为 -1 表示无限循环，
 * 需要 child 最终返回 RUNNING/ERROR 才能跳出。
 */
export class Repeater extends Decorator {
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
   * 重复执行 child，直到达到循环上限或 child 返回 RUNNING/ERROR。
   */
  tick(tick: Tick): number {
    if (!this.child) return ERROR;

    var i = tick.blackboard.get("i", tick.tree.id, this.id);
    var status = SUCCESS;

    // 重复执行直到达到循环上限，或子节点返回 RUNNING/ERROR。
    while (this.maxLoop < 0 || i < this.maxLoop) {
      status = this.child._execute(tick);
      if (status === SUCCESS || status === FAILURE) i++;
      else break;
    }

    tick.blackboard.set("i", i, tick.tree.id, this.id);
    return status;
  }
}

// 以下 prototype 元数据用于编辑器默认节点面板和 JSON 兼容。
(Repeater.prototype as any).name = "Repeater";
(Repeater.prototype as any).title = "Repeat <maxLoop>x";
(Repeater.prototype as any).parameters = { maxLoop: -1 };
