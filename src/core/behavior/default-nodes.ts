import type { BehaviorNodeRegistry } from "./types.ts";
import {
  Action,
  BaseNode,
  Composite,
  Condition,
  Decorator,
  ErrorNode,
  Failer,
  Inverter,
  Limiter,
  MaxTime,
  MemPriority,
  MemSequence,
  Priority,
  Repeater,
  RepeatUntilFailure,
  RepeatUntilSuccess,
  Runner,
  Sequence,
  Succeeder,
  Wait
} from "./nodes/index.ts";

/**
 * 默认节点注册表。
 *
 * BehaviorTree.load 会用 JSON 里的 `name` 字段从这里找到构造函数。
 * 注册表同时包含基础类和可直接使用的默认节点：
 *
 * - 基础类用于兼容旧代码可能直接引用 b3.Action / b3.Composite 等名称。
 * - 默认节点用于恢复编辑器导出的树，例如 Sequence、Limiter、Wait。
 */
export const defaultNodeRegistry: BehaviorNodeRegistry = {
  BaseNode,
  Composite,
  Decorator,
  Action,
  Condition,
  Sequence,
  Priority,
  MemSequence,
  MemPriority,
  Inverter,
  Limiter,
  MaxTime,
  Repeater,
  RepeatUntilFailure,
  RepeatUntilSuccess,
  Succeeder,
  Failer,
  Runner,
  Error: ErrorNode,
  Wait
};
