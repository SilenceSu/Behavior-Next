# SweetAlert / Dialog 使用点盘点

## 运行时依赖

- `src/app/vue/services/dialog.js`: 通过 `root.swal(options, callback)` 实现 `alert()`、`confirm()` 和 `prompt()`。
- `scripts/legacy-build.js`: 在 `vendorJs` 中注入 `node_modules/sweetalert/dist/sweetalert.min.js`。
- `scripts/legacy-build.js`: 在 `vendorCss` 中注入 `node_modules/sweetalert/dist/sweetalert.css`。
- `package.json` / `package-lock.json`: 声明 `sweetalert@1.1.3`。

## 业务 API 使用点

- `dialogService.confirm()`:
  - `src/app/vue/state/app-init.js`: 未保存修改时关闭窗口确认。
  - `src/app/vue/components/editor/Menubar.js`: 未保存修改时关闭项目确认。
  - `src/app/vue/components/editor/NodesPanel.js`: 删除 tree 确认。
  - `src/app/vue/components/modals/EditNodeModal.js`: 删除 node 确认。
  - `src/app/vue/views/ProjectsView.js`: 未保存修改时新建/打开/关闭项目确认，删除项目确认。
  - `src/app/vue/views/SettingsView.js`: 重置设置确认。
- `dialogService.prompt()`:
  - `src/app/vue/views/ProjectsView.js`: 新建项目名称、重命名项目。
- `dialogService.alert()`:
  - 当前 Vue 代码中没有直接调用点，但作为 dialog service 公共 API 保留。
- 文件 dialog:
  - `dialogService.openFile()` 被 `ProjectsView` 和 `ImportModal` 使用。
  - `dialogService.saveAs()` 被 `ProjectsView` 和 `ExportModal` 使用。
  - `dialogService.openDirectory()` 当前无直接调用点，但保留原生路径语义。

## 范围边界

本变更只替换 SweetAlert 1。以下依赖和系统不在本次范围内：

- Font Awesome 4：图标 class 仍保留。
- Mousetrap：编辑器快捷键仍保留。
- CreateJS、creatine、Behavior3JS：画布和行为树引擎仍保留。
- `notificationState`：非阻塞通知系统不重写。
- Electron/NW 原生文件 dialog：继续通过现有 `dialogService` 文件方法访问。

## 并行变更边界

`improve-current-page-visual-design` 是独立视觉刷新提案。本变更只新增 Vue 自有 dialog 的必要结构和等价样式，不主动调整全局视觉方向、配色体系或编辑器页面层级。
