import { CONDITION } from "../constants.ts";
import { BaseNode } from "./base-node.ts";

/**
 * 条件节点基类。
 *
 * 条件节点用于表达判断，通常只返回 SUCCESS 或 FAILURE。核心库不内置具体
 * 条件节点，项目可以通过自定义节点扩展。
 */
export class Condition extends BaseNode {}

// 分类放在 prototype 上，兼容编辑器读取 b3.Condition.prototype.category。
(Condition.prototype as any).category = CONDITION;
