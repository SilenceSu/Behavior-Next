/**
 * Behavior Next Core 公开出口。
 *
 * 应用代码和兼容层都从这里导入行为树运行时，避免直接耦合内部文件结构。
 */
export * from "./constants.ts";
export { Blackboard } from "./blackboard.ts";
export { BehaviorTree } from "./behavior-tree.ts";
export { Tick } from "./tick.ts";
export { createUUID } from "./uuid.ts";
export { legacyClass } from "./legacy-class.ts";
export { defaultNodeRegistry } from "./default-nodes.ts";
export type {
  BehaviorNodeConstructor,
  BehaviorNodeRegistry,
  BehaviorTreeData,
  CustomNodeSpec,
  NodeSettings,
  NodeSpec
} from "./types.ts";
export {
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
