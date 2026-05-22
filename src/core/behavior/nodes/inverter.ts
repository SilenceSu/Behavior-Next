import { ERROR, FAILURE, SUCCESS } from "../constants.ts";
import type { Tick } from "../tick.ts";
import { Decorator } from "./decorator.ts";

/**
 * 反转节点。
 *
 * 执行 child 后反转 SUCCESS 和 FAILURE；RUNNING 和 ERROR 保持不变。
 * 没有 child 时返回 ERROR。
 */
export class Inverter extends Decorator {
  /**
   * 执行 child 并反转成功/失败状态。
   */
  tick(tick: Tick): number {
    if (!this.child) return ERROR;

    var status = this.child._execute(tick);
    if (status === SUCCESS) status = FAILURE;
    else if (status === FAILURE) status = SUCCESS;

    return status;
  }
}

// 默认节点名用于编辑器注册和 JSON load/dump。
(Inverter.prototype as any).name = "Inverter";
