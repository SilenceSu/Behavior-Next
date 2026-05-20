# AGENTS.md

Behavior3 Editor 的 Agent 指导文件。完整架构详见 CLAUDE.md。

## 构建命令

```bash
npm install    # 首次构建前必须执行
npm run dev    # Vite 开发服务器，地址 http://127.0.0.1:8000，支持热重载
npm run build  # 生产构建（压缩），输出到 build/
npm run dist   # 生产构建 + Electron 打包到 dist/
```

本项目无测试套件。通过 `npm run dev` 手动验证修改。

## 关键约束

- **模块入口**：应用入口是 `src/main.js`，通过 `src/modules/editor-engine.js` 和 `src/modules/angular-app.js` 显式导入旧源码
- **兼容全局仍保留**：编辑器内部仍使用 `window.b3e` 命名空间和 IIFE 模式；`src/modules/compatibility.js` 负责集中暴露 `window.editor` 和 `window.startApp`
- **导入顺序很重要**：`src/modules/editor-engine.js` 中 `namespaces.js` 必须在其他编辑器源码之前导入，`src/start.js` 必须在编辑器和 AngularJS 源码之后由 `src/main.js` 导入
- **双层架构**：画布引擎（`src/editor/`）是纯 JS，UI 层（`src/app/`）是 AngularJS 1.4。引擎通过 `window.editor` 全局变量在 Angular 之前启动
- **依赖分离**：运行时库来自 `node_modules/` 和 `src/assets/libs/`，构建工具来自 npm
- **构建占位符**：源码中的 `[BUILD_VERSION]` 和 `[BUILD_DATE]` 在构建时被替换

## 文件命名

- Angular 文件：`name.type.js`（如 `editor.service.js`、`dragnode.directive.js`）
- 引擎文件：PascalCase 类名（如 `Block.js`、`ConnectionManager.js`）
- 样式：`c_component.less` 通过 `index.less` 导入

## 核心架构

- 实体层级：`Editor -> Project -> Tree -> Block/Connection`
- 管理器处理 CRUD，系统处理每帧更新
- 画布到 Angular：通过 `editor.trigger()` 派发 createjs.Event
- Angular 控制器间通信：`$rootScope.$broadcast`
- 存储：`storageService` 在 Web 中使用 localStorage，在 Electron 中使用 fs

## 编辑代码时

- 添加新 JS 文件需要更新对应模块入口导入列表（通常是 `src/modules/editor-engine.js` 或 `src/modules/angular-app.js`）；如果不在现有 watch 范围内，也需要更新 `scripts/legacy-build.js`
- CreateJS 继承使用 `createjs.extend()` 和 `createjs.promote()`
- Angular 使用 `controllerAs` 语法
