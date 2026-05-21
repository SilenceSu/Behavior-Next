## 1. 盘点和边界确认

- [x] 1.1 扫描 `src/app/vue/**` 中所有 `dialogService`、`window.swal` 和 SweetAlert 使用点，记录 alert、confirm、prompt、文件 dialog 的调用清单。
- [x] 1.2 确认本变更只替换 SweetAlert 1，不处理 Font Awesome 4、Mousetrap、CreateJS、creatine、Behavior3JS 或通知系统重写。
- [x] 1.3 确认 `improve-current-page-visual-design` 的视觉范围，避免本变更主动做弹窗视觉重设计。

## 2. 建立 Vue Dialog 基础设施

- [x] 2.1 新增 dialog state 模块，支持当前请求、请求队列、resolve/reject 回调和统一关闭清理。
- [x] 2.2 新增 `DialogHost` Vue 组件，支持 alert、confirm 和 prompt 的标题、正文、输入框、确认/取消按钮。
- [x] 2.3 在 `App` 根组件中挂载 `DialogHost`，确保全局路由和 editor modal 场景都能显示弹窗。
- [x] 2.4 新增或复用 LESS 样式，覆盖遮罩、窗口、按钮区、输入框、状态类型、z-index 和紧凑布局。

## 3. 迁移 dialogService

- [x] 3.1 改造 `dialogService.alert()`，移除 `window.swal()` 调用并保持确认后 resolve。
- [x] 3.2 改造 `dialogService.confirm()`，保持确认 resolve、取消或 Escape reject 的语义。
- [x] 3.3 改造 `dialogService.prompt()`，保持提交输入值 resolve、取消 reject，空字符串交给调用方处理。
- [x] 3.4 保留 `saveAs()`、`openFile()` 和 `openDirectory()` 的原生文件 dialog 实现和路径返回语义。
- [x] 3.5 实现基础键盘和焦点行为：打开时聚焦输入框或主要按钮，Enter 确认，Escape 取消。

## 4. 移除 SweetAlert 依赖

- [x] 4.1 从 `scripts/legacy-build.js` 的 `vendorJs` 和 `vendorCss` 中移除 SweetAlert 输入。
- [x] 4.2 从 `package.json` 移除 `sweetalert`，并更新 `package-lock.json`。
- [x] 4.3 使用 `rg` 确认 `src/`、`scripts/` 和包文件中没有 `swal`、`sweetalert` 或 `node_modules/sweetalert` 运行时依赖。

## 5. 验证和收尾

- [x] 5.1 运行 Vue 源码语法检查，例如 `find src/app/vue -name '*.js' -print | sort | xargs -r -n1 node --check`。
- [x] 5.2 运行 `npm run build`，确认生产构建输出可用且不包含 SweetAlert JS/CSS。
- [ ] 5.3 运行 `npm run dev`，在本地浏览器验证未保存离开确认、项目创建/重命名、删除项目/树/节点和重置设置。
- [ ] 5.4 验证 prompt 空字符串、confirm 取消、Escape 取消、Enter 确认和输入框自动聚焦行为。
- [x] 5.5 更新 OpenSpec 任务状态和验证记录，记录未自动化覆盖的残余风险。
