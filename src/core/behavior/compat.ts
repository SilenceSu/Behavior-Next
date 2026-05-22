import * as behavior from "./index.ts";

/**
 * 可安装 b3 兼容命名空间的目标对象。
 *
 * 浏览器运行时传入 window；测试中可以传入普通对象模拟 window。
 */
export type BehaviorCompatTarget = Window & typeof globalThis & { b3?: any };

/**
 * 安装旧版 `window.b3` 兼容层。
 *
 * src/editor 仍然通过全局 `b3.*` 访问行为树核心。本函数必须在
 * editor-engine 导入旧编辑器源码前执行，否则 Project 初始化默认节点时会找不到 b3。
 */
export function installBehaviorCompat(target: BehaviorCompatTarget): any {
  target.b3 = Object.assign(target.b3 || {}, {
    VERSION: behavior.VERSION,
    SUCCESS: behavior.SUCCESS,
    FAILURE: behavior.FAILURE,
    RUNNING: behavior.RUNNING,
    ERROR: behavior.ERROR,
    COMPOSITE: behavior.COMPOSITE,
    DECORATOR: behavior.DECORATOR,
    ACTION: behavior.ACTION,
    CONDITION: behavior.CONDITION,
    createUUID: behavior.createUUID,
    Class: behavior.legacyClass,
    BehaviorTree: behavior.BehaviorTree,
    Blackboard: behavior.Blackboard,
    Tick: behavior.Tick,
    BaseNode: behavior.BaseNode,
    Composite: behavior.Composite,
    Decorator: behavior.Decorator,
    Action: behavior.Action,
    Condition: behavior.Condition,
    Sequence: behavior.Sequence,
    Priority: behavior.Priority,
    MemSequence: behavior.MemSequence,
    MemPriority: behavior.MemPriority,
    Inverter: behavior.Inverter,
    Limiter: behavior.Limiter,
    MaxTime: behavior.MaxTime,
    Repeater: behavior.Repeater,
    RepeatUntilFailure: behavior.RepeatUntilFailure,
    RepeatUntilSuccess: behavior.RepeatUntilSuccess,
    Succeeder: behavior.Succeeder,
    Failer: behavior.Failer,
    Runner: behavior.Runner,
    // 模块内避免导出名为 Error 的类，但全局上保留历史 b3.Error 名称。
    Error: behavior.ErrorNode,
    Wait: behavior.Wait
  });

  return target.b3;
}
