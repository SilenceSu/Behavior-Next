import { ACTION } from "../constants.ts";
import { BaseNode } from "./base-node.ts";

/**
 * 动作节点基类。
 *
 * 动作节点通常代表一个实际行为，例如等待、播放动画或调用业务逻辑。
 * 默认节点中的 Succeeder/Failer/Runner/ErrorNode/Wait 都属于 action。
 */
export class Action extends BaseNode {}

// 分类放在 prototype 上，兼容编辑器读取 b3.Action.prototype.category 的旧方式。
(Action.prototype as any).category = ACTION;
