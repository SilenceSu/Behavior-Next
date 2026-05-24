# Behavior Next

![界面预览](preview.png)

**Behavior Next** 是一个面向行为树编辑的可视化工具，用于创建、组织、导入和导出行为树项目。它可以作为 Web 应用运行，也可以通过 Electron 打包成桌面应用来管理本地项目。


## 项目来源

Behavior Next 基于 Behavior3 Editor 构建。原项目提供了行为树编辑器的早期基础、JSON 数据模型和部分画布运行时经验；当前项目已经围绕新的应用结构重构了绝大多数组件，包括 UI、构建系统、桌面打包、依赖管理、项目/设置服务、弹窗、通知和快捷键系统。除历史来源说明外，本文档均以 Behavior Next 作为当前项目名称。


## 当前版本状态

当前仓库主体已经完成现代化。项目使用 npm + Vite + TypeScript 作为源码和构建基础，Web 端使用 Vue 3，桌面端通过 Electron 打包；行为树核心由 Behavior Next Core 的 TypeScript 模块维护，并通过兼容层继续暴露旧的 `window.b3` API。CreateJS 仍用于画布渲染和交互层，但它属于长期画布层演进项，不阻塞当前项目作为现代化应用维护。

主要运行时和构建依赖：

- **Vue 3 + Vue Router**：应用 UI 和路由。
- **Element Plus**：UI 组件库，通过 IIFE 全局变量引入（`window.ElementPlus`），与 `window.Vue` 模式一致。
- **Vite**：开发服务器、热重载和生产构建入口。
- **TypeScript**：应用源码、编辑器源码和行为树核心均以 TypeScript 维护。
- **Electron 42 + @electron/packager**：桌面应用打包。
- **Font Awesome 7**：通过 `@fortawesome/fontawesome-free` 提供图标，并加载 v4 shims 兼容旧的 `fa fa-*` 类名。
- **Behavior Next Core**：`src/core/behavior/` 中的 TypeScript 行为树核心，维护状态常量、黑板、Tick、行为树加载/导出和默认节点。
- **CreateJS**：画布渲染和交互层依赖，暂时保留在 `src/assets/libs/`，后续按画布层演进计划评估。


## 为什么选择 Behavior Next？

Behavior Next 专注于用可视化方式设计、组织和维护行为树，同时保留开放数据格式，便于和游戏、机器人、仿真或其他运行时系统集成。

- **开源软件**：基于 MIT 许可证，你可以自由使用本软件，根据需求进行修改，甚至在公司内部使用定制版本。你也可以通过提交 bug 修复、建议和补丁来帮助改进它。

- **开放格式**：Behavior Next 可以将建模的行为树导出为 JSON 文件，遵循开放格式。如果你喜欢的编程语言还没有现成解析库，可以开发自己的库来使用这里创建的行为树。

- **行为树建模**：编辑器面向组合节点、装饰节点、动作节点和条件节点等常见行为树结构，适合为游戏 AI、机器人和通用仿真中的智能体建模。

- **现代化应用结构**：UI、构建、桌面打包、依赖管理和行为树核心已经由 npm/Vite/TypeScript/Vue 3/Element Plus/Electron 工作流维护。

- **深色/亮色主题**：内置深色和亮色两套 UI 主题，可在设置中切换；画布配色预设独立管理，支持 Dark、Light、Midnight、Solarized 四套预设。

- **简约而实用**：界面尽量减少非必要信息，重点放在设计、编辑和管理行为树上。

- **可定制**：创建你自己的节点类型，并单独定制节点实例。创建多个项目和行为树，修改标题并添加属性。

- **不依赖其他工具/编辑器/引擎**。



## 主要功能

- **自定义节点**：你可以在四个基本类别中创建自己的节点类型——*组合节点（composite）*、*装饰节点（decorator）*、*动作节点（action）* 或 *条件节点（condition）*。
- **节点独立属性**：你可以修改节点标题、描述和自定义属性。
- **手动和自动排列**：通过拖拽节点进行手动排列，或按 "a" 键自动排列整棵树。
- **创建和管理多棵树**：你可以创建和管理无限数量的行为树。
- **JSON 导入导出**：将项目、行为树或节点导出为 JSON 格式，也可以重新导入。在你自己的库或工具中使用 JSON，由你决定。


## 兼容性说明

Behavior Next 主要在现代 Chromium 浏览器和 Electron 中验证。非 Chromium 浏览器可能存在画布拖拽、滚动条样式或文件访问能力差异；IE 不支持。


## 项目结构

- `src/main.ts`：应用模块入口，按顺序导入兼容层、编辑器引擎和 Vue 应用。
- `src/core/behavior/`：Behavior Next Core，提供 TypeScript 行为树运行时，并通过兼容层暴露 `window.b3`。
- `src/modules/editor-engine.ts`：显式导入画布编辑器源码，保留 `window.b3e` 等全局兼容行为。
- `src/app/vue/`：Vue 3 UI、路由、状态和服务。
- `src/assets/libs/`：CreateJS 画布运行时 vendor。
- `scripts/legacy-build.js`：Vite 插件调用的资源构建脚本，负责合并 JS/CSS、编译 Less、复制图片和字体；压缩由 esbuild 处理。
- `scripts/package-electron.js`：生产构建后调用 `@electron/packager` 打包桌面应用。
- `build/`：Web 静态构建产物。
- `dist/`：Electron 桌面应用打包产物。


## 构建指南

你可以在两种环境下构建编辑器：开发环境和生产环境。在开发环境中，你可以运行一个本地 Web 服务器，每次修改项目后会自动构建并重新加载应用。生产模式则会构建并打包编辑器到不同平台。


### 环境要求

运行编辑器需要以下软件：

**必需：**
- [Node.js](https://nodejs.org)，建议使用 22.12 或更新版本

*如果你需要构建桌面版本：*
- Electron 由 npm optional dependency 安装


### 配置

在构建之前，你需要安装 npm 依赖。在控制台中运行以下命令：

    npm install

该命令会安装运行时依赖、Vite 构建工具和桌面应用打包依赖。Electron 位于 `optionalDependencies`，用于桌面打包。


### 开发环境

在开发过程中，你可以在浏览器中运行编辑器，并自动构建和重新加载：

    npm run dev

这将在 `http://127.0.0.1:8000` 上启动一个 Web 服务器。

如果只想生成 `build/` 目录中的 Web 静态产物：

    npm run build


### 桌面应用打包

只需运行：

    npm run dist

该命令会先执行生产构建，再将 Electron 桌面应用打包到 `dist/`。当前打包目标由 `scripts/package-electron.js` 配置为 Linux 和 Windows。


## 维护说明

- 新增编辑器引擎源码时，需要检查 `src/modules/editor-engine.ts` 的导入顺序。
- 新增 Vue 应用文件通常会被 `src/app/**/*.ts` 或 `src/app/**/*.vue` 监听；如果新增资源不在现有范围内，需要更新 `scripts/legacy-build.js`。
- 行为树运行时位于 `src/core/behavior/`，修改后应运行 `npm run test` 和 `npm run typecheck`。
- 源码中的 `[BUILD_VERSION]` 和 `[BUILD_DATE]` 会在构建时替换。
- 旧图标类名通过 Font Awesome v4 shims 兼容；新增图标可以优先使用 Font Awesome 7 的类名。


## 寻找行为树库？

- https://github.com/behavior3/behavior3js
- https://github.com/behavior3/behavior3py
