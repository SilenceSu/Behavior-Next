/**
 * Behavior Next Core 的兼容版本号。
 *
 * 当前保持 `0.1.0`，用于兼容旧 Behavior3JS 运行时和已有导出文件中
 * 对行为树核心版本的认知。这里不是应用版本号，应用版本仍由 package.json 管理。
 */
export const VERSION = "0.1.0";

/**
 * 节点执行成功。
 *
 * 状态常量的数值不能随意调整：旧项目、自定义节点和测试可能直接比较数字。
 */
export const SUCCESS = 1;

/**
 * 节点执行失败，但不是异常错误。
 */
export const FAILURE = 2;

/**
 * 节点本 tick 尚未完成，需要后续 tick 继续执行。
 */
export const RUNNING = 3;

/**
 * 节点无法正常执行，例如装饰节点缺少 child。
 */
export const ERROR = 4;

/**
 * 组合节点：按顺序管理多个 children，例如 Sequence、Priority。
 */
export const COMPOSITE = "composite";

/**
 * 装饰节点：管理一个 child，并改变或限制 child 的执行结果。
 */
export const DECORATOR = "decorator";

/**
 * 动作节点：执行具体行为并返回状态。
 */
export const ACTION = "action";

/**
 * 条件节点：表达判断逻辑，通常返回 SUCCESS 或 FAILURE。
 */
export const CONDITION = "condition";

/**
 * 所有合法节点执行状态。
 */
export type NodeStatus =
  | typeof SUCCESS
  | typeof FAILURE
  | typeof RUNNING
  | typeof ERROR;

/**
 * 所有合法节点分类。
 *
 * 分类字符串会写入导出的行为树 JSON，因此保持旧格式中的小写字符串。
 */
export type NodeCategory =
  | typeof COMPOSITE
  | typeof DECORATOR
  | typeof ACTION
  | typeof CONDITION;
