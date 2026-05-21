## MODIFIED Requirements

### Requirement: Vite build output compatibility
构建系统 MUST 使用基于 Vite 的命令生成静态资源，并保持这些资源兼容 Vue 应用运行时、项目自有 UI 样式系统、Vue 自有 dialog 系统和现有编辑器引擎运行时。

#### Scenario: Production web build
- **WHEN** 开发者运行生产构建命令
- **THEN** 系统必须把 Web 应用写入 `build/`
- **AND** 输出必须包含生成后的应用 JavaScript、应用 CSS、preload JavaScript、preload CSS、必要运行时 vendor assets、fonts、images 和入口 HTML
- **AND** 由 `src/index.html` 派生的输出必须使用与 Vue 启动路径兼容的路径引用这些文件
- **AND** 输出不得依赖 AngularJS template cache bundle 来启动应用
- **AND** 输出不得依赖 Bootstrap 3 CSS 来呈现 Vue UI 的按钮、表单、布局、表格或面板样式
- **AND** 输出不得依赖 SweetAlert 1 JavaScript 或 CSS 来呈现 alert、confirm 或 prompt 弹窗
