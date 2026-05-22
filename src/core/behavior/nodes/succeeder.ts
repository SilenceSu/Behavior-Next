import { SUCCESS } from "../constants.ts";
import type { Tick } from "../tick.ts";
import { Action } from "./action.ts";

/**
 * 永远返回 SUCCESS 的动作节点。
 *
 * 常用于测试树分支或作为默认示例节点。
 */
export class Succeeder extends Action {
  /**
   * 固定返回 SUCCESS。
   */
  tick(_tick: Tick): number {
    return SUCCESS;
  }
}

// 默认节点名用于编辑器注册和 JSON load/dump。
(Succeeder.prototype as any).name = "Succeeder";
