import { RUNNING } from "../constants.ts";
import type { Tick } from "../tick.ts";
import { Action } from "./action.ts";

/**
 * 永远返回 RUNNING 的动作节点。
 *
 * 用于模拟长时间运行的行为。由于返回 RUNNING，BaseNode 会让它保持 open。
 */
export class Runner extends Action {
  /**
   * 固定返回 RUNNING。
   */
  tick(_tick: Tick): number {
    return RUNNING;
  }
}

// 默认节点名用于编辑器注册和 JSON load/dump。
(Runner.prototype as any).name = "Runner";
