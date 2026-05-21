## Why

Vue 3 UI 迁移后，确认框、输入框和提示框仍依赖 `sweetalert@1.1.3` 以及全局 `window.swal()`。这个库已经明显老旧，并且把 UI 状态、Promise 结果和样式控制留在 Vue 应用之外，影响后续统一交互和视觉维护。

本变更先替换 SweetAlert，不同时处理 Font Awesome、Mousetrap、CreateJS、creatine 或 Behavior3JS，保持依赖清理可以分步验证和回滚。

## What Changes

- 新增 Vue 自有 dialog host/state/service，用来渲染 alert、confirm 和 prompt 交互。
- 保持现有 `dialogService.alert()`、`dialogService.confirm()`、`dialogService.prompt()` 的 Promise 使用方式，减少业务组件改动。
- 让离开未保存项目、创建/重命名项目、删除项目/树/节点、重置设置等流程继续通过统一 dialog API 工作。
- 从 `package.json`、`package-lock.json` 和 `scripts/legacy-build.js` 移除 `sweetalert` 运行时 JS/CSS 依赖。
- 保留 Electron 原生 `showOpenDialog()` / `showSaveDialog()` 文件选择能力，不把文件系统 dialog 纳入本次 UI 重写。
- **BREAKING（内部依赖）**：迁移后应用运行时不再提供或依赖 `window.swal()`。

## Capabilities

### New Capabilities

- `vue-dialog-system`: 定义 Vue 自有 dialog 系统的 alert、confirm、prompt、状态管理、键盘行为和 Promise 结果语义。

### Modified Capabilities

- `build-system`: 更新 vendor JS/CSS 输出要求，确保构建产物不再依赖 SweetAlert 1。

## Impact

- 影响 `src/app/vue/services/dialog.js`、Vue 根组件/宿主组件、相关 LESS 样式、`scripts/legacy-build.js`、`package.json` 和 `package-lock.json`。
- 需要新增 Vue dialog 组件和状态模块，并把 `App` 挂载 dialog host。
- 需要验证 Home/Projects/Settings/Editor 中触发的确认、输入和提示流程，尤其是未保存离开确认、项目创建/重命名、删除项目/树/节点和重置设置。
- 不改变行为树数据格式、编辑器画布引擎、Vue Router 路由、Electron 文件打开/保存接口或通知系统。
