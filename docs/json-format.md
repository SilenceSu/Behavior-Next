# Behavior Next JSON 文件格式说明

本文档描述 Behavior Next 导入/导出的 JSON 数据格式。该格式继承自 Behavior3 Editor 的行为树数据模型，当前项目在保留兼容性的基础上重构了应用层和导入/导出界面。所有文件均可使用 `.b3` 或 `.json` 作为扩展名。

导入/导出由以下文件实现：

- `src/editor/editor/managers/ExportManager.js`
- `src/editor/editor/managers/ImportManager.js`
- `src/app/vue/components/modals/ExportModal.js`
- `src/app/vue/components/modals/ImportModal.js`

---

## 1. 文件类型

通过顶层字段 `scope` 区分三种文件：

| 类型      | `scope`     | 内容                       |
| --------- | ----------- | -------------------------- |
| Project   | `"project"` | 整个项目（多棵树 + 自定义节点） |
| Tree      | `"tree"`    | 单棵行为树                 |
| Node      | `"node"`    | 单个自定义节点定义          |

所有文件都包含 `version`（编辑器版本，如 `"0.1.0"`）和 `scope` 字段。

---

## 2. Project 文件（`scope: "project"`）

### 2.1 结构

```json
{
  "version": "0.1.0",
  "scope": "project",
  "selectedTree": "tree-uuid-or-null",
  "trees": [ /* Tree 对象数组 */ ],
  "custom_nodes": [ /* Node 对象数组 */ ]
}
```

### 2.2 字段

| 字段           | 类型           | 必填 | 说明                              |
| -------------- | -------------- | ---- | --------------------------------- |
| `version`      | string         | 是   | 编辑器版本号                      |
| `scope`        | string         | 是   | 固定值 `"project"`                |
| `selectedTree` | string \| null | 是   | 当前选中树的 ID；无选中则为 `null` |
| `trees`        | array          | 是   | Tree 对象数组（结构见第 3 节）     |
| `custom_nodes` | array          | 是   | 自定义节点定义数组（结构见第 4 节） |

> 注：在 Project 文件中，每个 Tree 对象会附加一个 `id` 字段（值与 Tree 自身的 `id` 相同）。

---

## 3. Tree 文件（`scope: "tree"`）

### 3.1 结构

```json
{
  "version": "0.1.0",
  "scope": "tree",
  "id": "tree-uuid",
  "title": "My Behavior Tree",
  "description": "Tree description",
  "root": "first-child-node-uuid",
  "properties": {},
  "nodes": {
    "node-uuid-1": { /* Node Block */ },
    "node-uuid-2": { /* Node Block */ }
  },
  "display": {
    "camera_x": 0,
    "camera_y": 0,
    "camera_z": 1,
    "x": 400,
    "y": 50
  },
  "custom_nodes": [ /* 仅在单独导出 Tree 时存在 */ ]
}
```

### 3.2 字段

| 字段           | 类型           | 必填 | 说明                                            |
| -------------- | -------------- | ---- | ----------------------------------------------- |
| `version`      | string         | 是   | 编辑器版本号                                    |
| `scope`        | string         | 是   | 固定值 `"tree"`                                 |
| `id`           | string         | 是   | 树的 UUID                                       |
| `title`        | string         | 是   | 树标题（取自 Root 节点）                        |
| `description`  | string         | 否   | 树描述                                          |
| `root`         | string \| null | 是   | Root 节点的第一个子节点 ID；无子则为 `null`     |
| `properties`   | object         | 是   | Root 节点的属性，通常为 `{}`                    |
| `nodes`        | object         | 是   | 节点字典，key 为节点 UUID（结构见第 5 节）      |
| `display`      | object         | 是   | 画布相机与 Root 节点位置                        |
| `custom_nodes` | array          | 否   | 仅当作为独立 Tree 文件导出时附带；Project 内省略 |

### 3.3 `display` 字段

| 子字段     | 类型   | 说明           |
| ---------- | ------ | -------------- |
| `camera_x` | number | 相机 X 偏移    |
| `camera_y` | number | 相机 Y 偏移    |
| `camera_z` | number | 相机缩放       |
| `x`        | number | Root 节点 X 坐标 |
| `y`        | number | Root 节点 Y 坐标 |

> Root 节点本身**不**出现在 `nodes` 字典中，其属性、坐标分别记录在树级别的 `properties`、`display.x`、`display.y` 字段。

---

## 4. Node 定义文件（`scope: "node"`）

用于描述一个自定义节点（节点类型）。

### 4.1 结构

```json
{
  "version": "0.1.0",
  "scope": "node",
  "name": "CustomSequence",
  "category": "composite",
  "title": "Custom <maxLoop>x Sequence",
  "description": "A custom sequence node",
  "properties": {
    "maxLoop": -1,
    "customParam": "value"
  }
}
```

### 4.2 字段

| 字段          | 类型   | 必填 | 说明                                                                |
| ------------- | ------ | ---- | ------------------------------------------------------------------- |
| `version`     | string | 是   | 编辑器版本号                                                        |
| `scope`       | string | 是   | 固定值 `"node"`                                                     |
| `name`        | string | 是   | 节点类型名（唯一）                                                  |
| `category`    | string | 是   | `composite` / `decorator` / `action` / `condition`                  |
| `title`       | string | 否   | 显示标题，可使用 `<propertyName>` 占位符引用 `properties` 中的字段 |
| `description` | string | 否   | 描述                                                                |
| `properties`  | object | 否   | 默认属性键值对                                                      |

> 在 Project 文件的 `custom_nodes` 数组中，每个元素结构与上述相同（包含 `version`、`scope`）。

---

## 5. Node Block 结构（Tree 内的节点实例）

`nodes` 字典中的每个值描述一个**节点实例**（即画布上的一个 Block）。

### 5.1 通用字段

| 字段          | 类型           | 说明                       |
| ------------- | -------------- | -------------------------- |
| `id`          | string         | 节点实例 UUID（与 key 一致） |
| `name`        | string         | 节点类型名，如 `"Sequence"` |
| `title`       | string         | 显示标题                   |
| `description` | string         | 描述                       |
| `properties`  | object         | 节点参数值                 |
| `display`     | `{x, y}` 对象  | 画布坐标                   |

### 5.2 不同类别的差异

#### Composite（复合节点）

```json
{
  "id": "uuid",
  "name": "Sequence",
  "title": "My Sequence",
  "description": "",
  "properties": {},
  "display": { "x": 100, "y": 200 },
  "children": ["child-uuid-1", "child-uuid-2"]
}
```

- 多出 `children`：子节点 ID 数组（按布局方向排序）

#### Decorator（装饰器节点）

```json
{
  "id": "uuid",
  "name": "Repeater",
  "title": "Repeat <maxLoop>x",
  "description": "",
  "properties": { "maxLoop": -1 },
  "display": { "x": 100, "y": 200 },
  "child": "child-uuid"
}
```

- 多出 `child`：单个子节点 ID

#### Action / Condition（叶子节点）

```json
{
  "id": "uuid",
  "name": "Wait",
  "title": "Wait <milliseconds>ms",
  "description": "",
  "properties": { "milliseconds": 100 },
  "display": { "x": 100, "y": 200 }
}
```

- **没有** `children` 或 `child` 字段

---

## 6. 连接（Connection）的表示

连接信息**不单独存储**，而是通过父节点的引用字段隐式表达：

| 父节点类别  | 引用字段          | 类型      |
| ----------- | ----------------- | --------- |
| `root`      | 树级别 `root`     | string    |
| `composite` | `children`        | string[]  |
| `decorator` | `child`           | string    |
| `action`    | 无（叶子节点）     | -         |
| `condition` | 无（叶子节点）     | -         |

`children` 数组顺序根据画布布局方向（horizontal/vertical）按子节点 Y 或 X 坐标升序排序，参见 `ExportManager.js` 中的 `getBlockChildrenIds`。

---

## 7. 节点类别与默认节点

| 类别        | 形状     | 默认内置节点                                                                              |
| ----------- | -------- | ----------------------------------------------------------------------------------------- |
| `root`      | 圆角矩形 | `Root`                                                                                    |
| `composite` | 圆角矩形 | `Sequence`、`Priority`、`MemSequence`、`MemPriority`                                      |
| `decorator` | 菱形     | `Inverter`、`Limiter`、`MaxTime`、`Repeater`、`RepeatUntilFailure`、`RepeatUntilSuccess` |
| `action`    | 圆角矩形 | `Runner`、`Failer`、`Succeeder`、`Error`、`Wait`                                          |
| `condition` | 椭圆形   | -                                                                                         |

带占位符的默认 `title` / `properties` 示例：

| 节点                 | title                       | properties        |
| -------------------- | --------------------------- | ----------------- |
| `Limiter`            | `Limit <maxLoop> Activations` | `{ maxLoop: 1 }`  |
| `MaxTime`            | `Max <maxTime>ms`           | `{ maxTime: 0 }`  |
| `Repeater`           | `Repeat <maxLoop>x`         | `{ maxLoop: -1 }` |
| `RepeatUntilFailure` | `Repeat Until Failure`      | `{ maxLoop: -1 }` |
| `RepeatUntilSuccess` | `Repeat Until Success`      | `{ maxLoop: -1 }` |
| `Wait`               | `Wait <milliseconds>ms`     | `{ milliseconds: 0 }` |

`title` 内 `<key>` 形式的占位符在显示时会被替换为 `properties[key]` 的当前值。

---

## 8. 完整 Project 示例

```json
{
  "version": "0.1.0",
  "scope": "project",
  "selectedTree": "tree-1",
  "trees": [
    {
      "id": "tree-1",
      "version": "0.1.0",
      "scope": "tree",
      "title": "Patrol",
      "description": "Patrol behavior",
      "root": "node-1",
      "properties": {},
      "nodes": {
        "node-1": {
          "id": "node-1",
          "name": "Sequence",
          "title": "Patrol Sequence",
          "description": "",
          "properties": {},
          "display": { "x": 400, "y": 150 },
          "children": ["node-2", "node-3"]
        },
        "node-2": {
          "id": "node-2",
          "name": "Wait",
          "title": "Wait <milliseconds>ms",
          "description": "",
          "properties": { "milliseconds": 1000 },
          "display": { "x": 300, "y": 280 }
        },
        "node-3": {
          "id": "node-3",
          "name": "Repeater",
          "title": "Repeat <maxLoop>x",
          "description": "",
          "properties": { "maxLoop": 3 },
          "display": { "x": 500, "y": 280 },
          "child": "node-4"
        },
        "node-4": {
          "id": "node-4",
          "name": "Runner",
          "title": "Runner",
          "description": "",
          "properties": {},
          "display": { "x": 500, "y": 400 }
        }
      },
      "display": {
        "camera_x": 0,
        "camera_y": 0,
        "camera_z": 1,
        "x": 400,
        "y": 50
      }
    }
  ],
  "custom_nodes": []
}
```

---

## 9. 整体层级关系

```
Project (.b3 / .json, scope: "project")
├── version, scope, selectedTree
├── custom_nodes: Node[]              ← scope: "node"
└── trees: Tree[]                     ← scope: "tree"
    └── Tree
        ├── id, title, description
        ├── root (first child id)
        ├── properties (root's props)
        ├── display (camera + root pos)
        └── nodes: { [uuid]: Block }
            └── Block
                ├── id, name, title, description
                ├── properties
                ├── display: {x, y}
                └── children[] | child   ← 连接关系
```
