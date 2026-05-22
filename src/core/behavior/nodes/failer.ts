import { FAILURE } from "../constants.ts";
import type { Tick } from "../tick.ts";
import { Action } from "./action.ts";

/**
 * 永远返回 FAILURE 的动作节点。
 *
 * 常用于测试树分支或作为默认示例节点。
 */
export class Failer extends Action {
  /**
   * 固定返回 FAILURE。
   */
  tick(_tick: Tick): number {
    return FAILURE;
  }
}

// 默认节点名用于编辑器注册和 JSON load/dump。
(Failer.prototype as any).name = "Failer";
