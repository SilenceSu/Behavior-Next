import { ERROR, FAILURE } from "../constants.ts";
import type { Tick } from "../tick.ts";
import type { NodeSettings } from "../types.ts";
import { Decorator } from "./decorator.ts";

/**
 * 最大执行时间节点。
 *
 * MaxTime 不会抢占 child 的执行；它会先执行 child，然后检查从 open 到现在
 * 是否超过 maxTime。超时则将结果转换为 FAILURE。
 */
export class MaxTime extends Decorator {
  /** 最大允许执行时长，单位毫秒。 */
  maxTime: number;

  /**
   * @param settings.maxTime 最大毫秒数，必须提供。
   * @param settings.child 被限制执行时间的子节点。
   */
  constructor(settings?: NodeSettings) {
    settings = settings || {};
    super(settings);

    if (!settings.maxTime) {
      throw "maxTime parameter in MaxTime decorator is an obligatory parameter";
    }

    this.maxTime = settings.maxTime;
  }

  /**
   * 节点打开时记录开始时间。
   */
  open(tick: Tick): void {
    tick.blackboard.set("startTime", new Date().getTime(), tick.tree.id, this.id);
  }

  /**
   * 执行 child，然后根据耗时决定是否返回 FAILURE。
   */
  tick(tick: Tick): number {
    if (!this.child) return ERROR;

    var currTime = new Date().getTime();
    var startTime = tick.blackboard.get("startTime", tick.tree.id, this.id);
    var status = this.child._execute(tick);

    // 这是非抢占式检查：子节点会先执行一次，超时后再转换为 FAILURE，保持旧行为。
    if (currTime - startTime > this.maxTime) {
      return FAILURE;
    }

    return status;
  }
}

// 以下 prototype 元数据用于编辑器默认节点面板和 JSON 兼容。
(MaxTime.prototype as any).name = "MaxTime";
(MaxTime.prototype as any).title = "Max <maxTime>ms";
(MaxTime.prototype as any).parameters = { maxTime: 0 };
