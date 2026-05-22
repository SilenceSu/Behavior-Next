import type { NodeCategory } from "./constants.ts";

/**
 * 节点构造参数。
 *
 * 这里有意保持宽松：默认节点只会读取自己需要的字段，但自定义行为节点
 * 可能携带导出 JSON 中的任意参数。
 */
export interface NodeSettings {
  /** Decorator 节点的单个子节点。 */
  child?: any;

  /** Composite 节点的有序子节点列表。 */
  children?: any[];

  /** 自定义节点参数，例如 maxLoop、milliseconds。 */
  [key: string]: any;
}

/**
 * 行为树 JSON 中的节点描述。
 *
 * 这是持久化格式，不直接等同于运行时 BaseNode 实例。
 */
export interface NodeSpec {
  /** 节点唯一 ID；缺省时运行时会生成新 UUID。 */
  id?: string;

  /** 节点类型名，用于从默认节点表或自定义节点表中解析构造函数。 */
  name: string;

  /** 编辑器展示标题。 */
  title?: string;

  /** 编辑器展示说明。 */
  description?: string;

  /** 节点实例属性，会传给构造函数并保留在导出数据中。 */
  properties?: Record<string, any>;

  /** 节点类型参数，主要用于编辑器面板展示默认配置项。 */
  parameters?: Record<string, any>;

  /** Composite 节点的子节点 ID 列表。 */
  children?: string[];

  /** Decorator 节点的子节点 ID。 */
  child?: string;
}

/**
 * 自定义节点类型描述。
 *
 * 这些数据用于编辑器恢复自定义节点面板，不负责提供真实执行逻辑。
 * 执行逻辑仍需要在 BehaviorTree.load(names) 的 names 中提供构造函数。
 */
export interface CustomNodeSpec {
  name: string;
  title?: string;
  category: NodeCategory;
  properties?: Record<string, any>;
}

/**
 * 行为树导入/导出的核心 JSON 结构。
 *
 * 字段命名对齐原 Behavior3 Editor / Behavior3JS 格式；旧格式使用
 * snake_case 的字段继续保持原样，避免破坏已有 .b3/.json 文件。
 */
export interface BehaviorTreeData {
  /** 树标题。 */
  title?: string;

  /** 树描述。 */
  description?: string;

  /** 根节点 ID；空树或只存在编辑器 Root 节点时为 null。 */
  root: string | null;

  /** 树级属性。 */
  properties?: Record<string, any>;

  /** 节点字典，key 通常与 NodeSpec.id 一致。 */
  nodes: Record<string, NodeSpec>;

  /** 自定义节点类型元数据。 */
  custom_nodes?: CustomNodeSpec[];
}

/**
 * 可被 BehaviorTree.load 实例化的节点构造函数。
 */
export type BehaviorNodeConstructor = new (settings?: NodeSettings) => any;

/**
 * 节点名称到构造函数的注册表。
 */
export type BehaviorNodeRegistry = Record<string, BehaviorNodeConstructor>;
