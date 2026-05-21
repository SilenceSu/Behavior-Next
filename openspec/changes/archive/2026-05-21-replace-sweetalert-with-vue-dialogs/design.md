## Context

当前 Vue UI 已经通过 `dialogService` 集中调用弹窗能力，但 `alert()`、`confirm()` 和 `prompt()` 内部仍直接调用全局 `window.swal()`。SweetAlert 1 同时通过 `scripts/legacy-build.js` 注入 vendor JavaScript 和 CSS，使弹窗状态、样式和焦点行为游离在 Vue component tree 之外。

现有业务使用点主要包括：

- 未保存修改时离开项目或关闭窗口的确认。
- 新建项目、重命名项目的输入弹窗。
- 删除项目、树、节点和重置设置的确认弹窗。
- 错误/成功提示目前主要走 `notificationState`，但 `dialogService.alert()` 仍需要保留作为通用 API。

## Goals / Non-Goals

**Goals:**

- 用 Vue 自有 dialog host 替换 SweetAlert 1。
- 保持 `dialogService.alert()`、`dialogService.confirm()`、`dialogService.prompt()` 返回 Promise 的使用方式。
- 支持确认、取消、输入、基础类型样式、键盘确认和取消。
- 从构建输入和 npm 依赖中移除 `sweetalert`。
- 保留现有 Electron 文件打开/保存 dialog 行为。

**Non-Goals:**

- 不替换 Font Awesome 4、Mousetrap、CreateJS、creatine 或 Behavior3JS。
- 不重做通知系统；`notificationState` 仍负责非阻塞通知。
- 不改变项目、设置、导入导出和行为树数据格式。
- 不把所有 editor modal 迁移到同一套 dialog 组件。

## Decisions

### 1. 保持 `dialogService` 作为业务 API，内部改为 Vue state

业务组件已经通过 `dialogService` 调用弹窗，因此本变更不要求每个调用点直接导入组件或写局部状态。实现时新增 dialog state，例如 `src/app/vue/state/dialog-state.js`，由 `dialogService` 创建请求并返回 Promise。

`DialogHost` 作为 Vue 根组件的一部分订阅 dialog state 并渲染当前请求。这样弹窗生命周期归 Vue 管理，同时保留调用层的 Promise 语义。

### 2. 用队列或单当前请求模型处理阻塞式弹窗

当前 SweetAlert 调用本质是阻塞式交互，本项目没有并发弹窗需求。实现可以从“单当前请求”开始；如果发生嵌套调用，则后来的请求排队，前一个完成后再显示。

请求对象应包含 `id`、`kind`、`title`、`text`、`type`、`placeholder`、`defaultValue`、按钮文案和 resolve/reject 回调。组件销毁时应清理未完成请求，避免 Promise 悬挂。

### 3. 精确保留 Promise 结果语义

- `alert()`：点击 OK 后 resolve。
- `confirm()`：确认 resolve，取消或 Escape reject。
- `prompt()`：确认时 resolve 输入值，取消或 Escape reject；空字符串仍 resolve，由调用方按现有逻辑判断是否有效。

这个语义匹配当前 SweetAlert 封装，能避免项目创建/重命名等调用点发生行为变化。

### 4. 文件系统 dialog 不进入 Vue DialogHost

`dialogService.openFile()`、`saveAs()` 和 `openDirectory()` 依赖 Electron/NW 风格的原生 dialog 能力，返回的是文件路径，不是应用内 UI 弹窗。本变更只清理 SweetAlert 1，文件选择仍保留在 `dialogService` 中。

### 5. 不引入新的外部 UI 弹窗库

引入新弹窗库会继续保留第三方 UI 行为和样式约束。当前需求简单，使用 Vue 组件和项目自有 LESS primitives 足够覆盖，并且能和后续视觉刷新保持一致。

## Risks / Trade-offs

- [Risk] 键盘焦点和 Escape 行为遗漏，导致弹窗难用。→ DialogHost 必须在打开时聚焦主按钮或输入框，并绑定 Enter/Escape。
- [Risk] Promise reject 未被调用点捕获时产生控制台噪声。→ 保持与当前取消行为一致，但在实现中只对用户取消 reject，不额外抛异常。
- [Risk] 弹窗 z-index 与已有 editor modal 冲突。→ 新 dialog 样式必须高于 `.b3modal`，并在 Home、Projects、Settings、Editor modal 场景检查。
- [Risk] 删除 SweetAlert CSS 后旧 class 或 DOM 依赖残留。→ 用 `rg` 确认 `swal`、`sweetalert` 和 `node_modules/sweetalert` 不再出现在运行时源码和构建脚本中。
- [Risk] 真实浏览器手动验证不足。→ 至少运行 `npm run build` 和 `npm run dev`，并在可用浏览器中验证所有 dialog 触发点。

## Migration Plan

1. 盘点 `dialogService` 调用点，确认 alert、confirm、prompt 和文件 dialog 边界。
2. 新增 dialog state、DialogHost 组件和 LESS 样式，并挂载到 `App`。
3. 改造 `dialogService`，让 SweetAlert 相关方法转发到 Vue dialog state。
4. 替换或删除 SweetAlert vendor JS/CSS 输入，移除 npm 依赖并更新 lockfile。
5. 运行构建和本地开发服务器，验证主要确认、输入和取消路径。
6. 若出现无法快速修复的交互回归，可回滚服务实现到 SweetAlert 封装；数据格式和业务状态不会受影响。

## Open Questions

- Dialog 按钮文案是否统一为 `OK` / `Cancel`，还是为删除类操作引入更明确的确认文案？建议本变更先保持当前文案语义，视觉文案优化留给后续。
- 是否把 `dialogService.alert()` 的使用逐步转为 `notificationState`？建议暂不处理，先保留 API 兼容。
