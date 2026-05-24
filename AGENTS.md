# AGENTS.md

Behavior Next 的 Agent 指导文件。完整架构详见 README.md。

## 构建命令

```bash
npm install    # 首次构建前必须执行
npm run dev    # Vite 开发服务器，地址 http://127.0.0.1:8000，支持热重载
npm run build  # 生产构建（压缩），输出到 build/
npm run dist   # 生产构建 + Electron 打包到 dist/
```

本项目无测试套件。通过 `npm run dev` 手动验证修改。

## 关键约束

- **模块入口**：应用入口是 `src/main.ts`，通过 `src/modules/editor-engine.ts` 显式导入画布引擎源码，Vue 应用由 `src/app/vue/main.ts` 启动
- **全局兼容层**：画布引擎内部仍使用 `window.b3e` 命名空间和 IIFE 模式；`src/modules/compatibility.js` 负责集中暴露 `window.editor` 和 `window.startApp`
- **导入顺序很重要**：`src/modules/editor-engine.ts` 中 `namespaces.js` 必须在其他编辑器源码之前导入，`src/start.js` 必须在编辑器源码之后由 `src/main.ts` 导入
- **双层架构**：画布引擎（`src/editor/`）是纯 JS/TS，UI 层（`src/app/vue/`）是 Vue 3。引擎通过 `window.editor` 全局变量在 Vue 之前启动
- **Element Plus**：通过 IIFE 全局变量引入（`window.ElementPlus`），与 `window.Vue` 模式一致，不走 ES module 按需导入；暗色模式通过 `html.classList.toggle('dark')` 触发官方变量集
- **依赖分离**：运行时库来自 `node_modules/` 和 `src/assets/libs/`，构建工具来自 npm
- **构建占位符**：源码中的 `[BUILD_VERSION]` 和 `[BUILD_DATE]` 在构建时被替换

## 文件命名

- Vue 文件：PascalCase（如 `NodesPanel.vue`、`SettingsView.vue`）
- 状态/服务文件：kebab-case + 类型后缀（如 `settings-state.ts`、`editor-bridge.ts`）
- 引擎文件：PascalCase 类名（如 `Block.ts`、`ConnectionManager.ts`）
- 样式：`c_component.less` 通过 `index.less` 导入

## 核心架构

- 实体层级：`Editor -> Project -> Tree -> Block/Connection`
- 管理器处理 CRUD，系统处理每帧更新
- 画布到 Vue：通过 `editor.trigger()` 派发 createjs.Event，Vue 侧通过 `editorBridge` 订阅
- Vue 组件间通信：通过共享状态模块（`*-state.ts`）
- 存储：`storageService` 在 Web 中使用 localStorage，在 Electron 中使用 fs

## 主题系统

- CSS 自定义属性定义在 `src/assets/less/themes.less`（深色/亮色两套）
- LESS 变量通过 `src/assets/less/variables.less` 桥接到 `var(--xxx)`
- Element Plus 暗色模式：`html.classList.add('dark')` 触发官方变量集
- 画布颜色预设（`CANVAS_THEMES`）在 `src/app/vue/state/settings-state.ts` 中定义，与 UI 主题独立
- 派生色使用 `color-mix(in srgb, ...)` 替代 LESS 的 `lighten()`/`darken()`

## 编辑代码时

- 添加新 Vue 组件或 TS 文件通常会被 `src/app/**/*.ts` 或 `src/app/**/*.vue` 自动监听；如果新增资源不在现有 watch 范围内，需要更新 `scripts/legacy-build.js`
- 添加新画布引擎文件需要更新 `src/modules/editor-engine.ts` 的导入列表，并检查 `scripts/legacy-build.js`
- CreateJS 继承使用 `createjs.extend()` 和 `createjs.promote()`
- Vue 组件使用 Options API（与现有代码保持一致）
- Element Plus 组件通过全局注册使用，无需在每个文件中单独导入
