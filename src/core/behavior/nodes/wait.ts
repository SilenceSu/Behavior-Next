import { RUNNING, SUCCESS } from "../constants.ts";
import type { Tick } from "../tick.ts";
import type { NodeSettings } from "../types.ts";
import { Action } from "./action.ts";

/**
 * 等待节点。
 *
 * 节点打开时记录开始时间；每次 tick 比较经过时间。未达到 milliseconds 时返回
 * RUNNING，达到后返回 SUCCESS。
 */
export class Wait extends Action {
  /** 等待时长，单位毫秒。 */
  endTime: number;

  /**
   * @param settings.milliseconds 等待毫秒数，缺省为 0。
   */
  constructor(settings?: NodeSettings) {
    settings = settings || {};
    super();
    this.endTime = settings.milliseconds || 0;
  }

  /**
   * 节点打开时记录开始时间。
   */
  open(tick: Tick): void {
    // 将开始时间存入节点内存，让每个 Wait 实例独立计时。
    tick.blackboard.set("startTime", new Date().getTime(), tick.tree.id, this.id);
  }

  /**
   * 未达到等待时长时返回 RUNNING，超时后返回 SUCCESS。
   */
  tick(tick: Tick): number {
    var currTime = new Date().getTime();
    var startTime = tick.blackboard.get("startTime", tick.tree.id, this.id);

    if (currTime - startTime > this.endTime) {
      return SUCCESS;
    }

    return RUNNING;
  }
}

// 以下 prototype 元数据用于编辑器默认节点面板和 JSON 兼容。
(Wait.prototype as any).name = "Wait";
(Wait.prototype as any).title = "Wait <milliseconds>ms";
(Wait.prototype as any).parameters = { milliseconds: 0 };
