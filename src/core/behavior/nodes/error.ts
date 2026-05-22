import { ERROR } from "../constants.ts";
import type { Tick } from "../tick.ts";
import { Action } from "./action.ts";

/**
 * 永远返回 ERROR 的动作节点。
 *
 * 类名使用 ErrorNode，避免和 JavaScript 内置 Error 混淆；兼容层仍会暴露为 b3.Error。
 */
export class ErrorNode extends Action {
  /**
   * 固定返回 ERROR。
   */
  tick(_tick: Tick): number {
    return ERROR;
  }
}

// 默认节点名仍保持旧格式中的 "Error"。
(ErrorNode.prototype as any).name = "Error";
