# build-system 规格说明

## Purpose
定义 Behavior3 Editor 的构建系统要求，包括 Vite 兼容构建产物、Vue 3 UI 编译、旧式编辑器全局脚本执行顺序、构建元数据替换、开发服务器和 Electron 打包连续性。

## Requirements
### Requirement: Vue 编译集成
构建系统 MUST 在开发和生产构建中编译 Vue 3 UI 源码。

#### Scenario: 构建 Vue 源码
- **WHEN** 开发者运行开发或生产构建命令
- **THEN** Vue 3 应用源码，包括使用到的 Vue single-file components，必须被编译为浏览器可加载的 JavaScript 和 CSS
- **AND** 生成的应用脚本必须暴露或保留已记录的 `startApp()` 启动路径

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

### Requirement: Legacy script execution order
构建系统 MUST 保留现有编辑器全局命名空间和 Vue 应用启动架构所需的执行顺序。

#### Scenario: Application bundle generation
- **WHEN** 应用脚本 bundle 被生成
- **THEN** `src/editor/namespaces.js` 必须先于其他编辑器源码文件执行
- **AND** 编辑器工具文件必须先于依赖它们的编辑器 managers、systems、project、tree 和 drawing 代码执行
- **AND** Vue application entry code 必须在 editor engine module boundary 注册启动所需编辑器构造函数之后执行
- **AND** `src/start.js` 必须在启动所需的编辑器引擎和 Vue 应用依赖可用后执行

### Requirement: 构建元数据替换
构建系统 MUST 在生成的运行时文件中替换构建元数据占位符。

#### Scenario: 构建元数据被输出
- **WHEN** 应用被构建
- **THEN** `[BUILD_VERSION]` 必须被替换为根目录 `package.json` 中的版本号
- **AND** `[BUILD_DATE]` 必须被替换为当前构建日期，使用 ISO 日期格式
- **AND** 替换必须应用于从源文件生成的 JavaScript、HTML 和 Electron 包元数据

### Requirement: 开发服务器一致性
开发命令 MUST 提供一个适合手动验证当前编辑器的本地服务器。

#### Scenario: 开发者启动本地开发服务器
- **WHEN** 开发者运行开发服务器命令
- **THEN** Vite 必须从 `build/` 或等效的兼容输出根目录提供生成的应用
- **AND** 对源脚本、Vue UI、样式、资源或入口文件的更改必须触发输出重新生成
- **AND** 浏览器必须能够加载编辑器并成功调用 `startApp()`

### Requirement: Electron 打包连续性
构建系统 MUST 在移除旧式任务后保持 Electron 打包功能可用。

#### Scenario: 开发者打包桌面应用
- **WHEN** 开发者运行桌面分发命令
- **THEN** 该命令必须首先构建 Web 资源
- **AND** 该命令必须在 `build/` 中包含生成的 `package.json`、`desktop.js` 和 `preload-electron.js` 文件
- **AND** 该命令必须在 `dist/` 或文档中指定的分发目录下生成 Electron 打包输出
