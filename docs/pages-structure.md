# Behavior Next 页面结构

## 概览

项目共有 **4 个主要页面 + 3 个编辑器内弹窗**，使用 Vue Router 管理 hash 路由。

默认路由：`/dash/home`

## Dashboard 区域（`/dash`）

父路由 `/dash` 使用 `DashLayout`，左侧为导航栏（Home / Projects / Settings）和返回编辑器按钮，右侧为子页面视图。

| 页面 | 路由 | Vue 模块 | 说明 |
|------|------|----------|------|
| Dash（布局） | `/dash` | `src/app/vue/layouts/DashLayout.js` | 父布局，提供侧边导航 |
| Home | `/dash/home` | `src/app/vue/views/HomeView.js` | 欢迎页，展示项目介绍和外部链接 |
| Projects | `/dash/projects` | `src/app/vue/views/ProjectsView.js` | 项目管理：新建、打开、最近项目列表 |
| Settings | `/dash/settings` | `src/app/vue/views/SettingsView.js` | 编辑器设置：编辑和重置配置 |

## Editor 区域（`/editor`）

| 页面 | 路由 | Vue 模块 | 说明 |
|------|------|----------|------|
| Editor | `/editor` | `src/app/vue/views/EditorView.js` | 主编辑器：顶部菜单栏、左侧节点面板、右侧属性面板、中间画布 |

编辑器内嵌组件：
- `src/app/vue/components/editor/Menubar.js` — 顶部菜单栏
- `src/app/vue/components/editor/NodesPanel.js` — 左侧节点和行为树面板
- `src/app/vue/components/editor/PropertiesPanel.js` — 右侧属性面板

## 编辑器弹窗（子路由）

| 弹窗 | 路由 | Vue 模块 | 说明 |
|------|------|----------|------|
| Edit Node | `/editor/node/:name?` | `src/app/vue/components/modals/EditNodeModal.js` | 编辑节点属性 |
| Export | `/editor/export/:type/:format` | `src/app/vue/components/modals/ExportModal.js` | 导出行为树 |
| Import | `/editor/import/:type/:format` | `src/app/vue/components/modals/ImportModal.js` | 导入行为树 |

## 页面层级关系

```
/dash (Dash 布局)
  ├── /dash/home        ← 默认首页
  ├── /dash/projects    ← 项目管理
  └── /dash/settings    ← 设置
/editor (编辑器主页)
  ├── /editor/node/:name?             ← 弹窗：编辑节点
  ├── /editor/export/:type/:format    ← 弹窗：导出
  └── /editor/import/:type/:format    ← 弹窗：导入
```

## 路由配置位置

`src/app/vue/router.js`
