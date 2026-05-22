import { ERROR, FAILURE, SUCCESS } from "../constants.ts";
import type { Tick } from "../tick.ts";
import type { NodeSettings } from "../types.ts";
import { Decorator } from "./decorator.ts";

/**
 * 激活次数限制节点。
 *
 * child 每次返回 SUCCESS 或 FAILURE 才计为一次完成的激活。达到 maxLoop 后，
 * Limiter 不再执行 child，并直接返回 FAILURE。RUNNING 不计数。
 */
export class Limiter extends Decorator {
  /** 最多允许 child 完成多少次。 */
  maxLoop: number;

  /**
   * @param settings.maxLoop 最大完成次数，必须提供。
   * @param settings.child 被限制的子节点。
   */
  constructor(settings?: NodeSettings) {
    settings = settings || {};
    super(settings);

    if (!settings.maxLoop) {
      throw "maxLoop parameter in Limiter decorator is an obligatory parameter";
    }

    this.maxLoop = settings.maxLoop;
  }

  /**
   * 节点打开时重置计数器。
   */
  open(tick: Tick): void {
    tick.blackboard.set("i", 0, tick.tree.id, this.id);
  }

  /**
   * 在计数未达到上限时执行 child，否则返回 FAILURE。
   */
  tick(tick: Tick): number {
    if (!this.child) return ERROR;

    var i = tick.blackboard.get("i", tick.tree.id, this.id);
    if (i < this.maxLoop) {
      var status = this.child._execute(tick);
      // 只有已完成的尝试才计入激活次数限制。
      if (status === SUCCESS || status === FAILURE) {
        tick.blackboard.set("i", i + 1, tick.tree.id, this.id);
      }
      return status;
    }

    return FAILURE;
  }
}

// 以下 prototype 元数据用于编辑器默认节点面板和 JSON 兼容。
(Limiter.prototype as any).name = "Limiter";
(Limiter.prototype as any).title = "Limit <maxLoop> Activations";
(Limiter.prototype as any).parameters = { maxLoop: 1 };
