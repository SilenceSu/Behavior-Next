# 依赖清理与替换路线图

本文档只记录 Behavior Next 里仍需要长期演进或继续观察的依赖。已经完成的清理项不再保留在本文档中，避免路线图和当前代码状态脱节。

## 当前结论

当前项目主体已经完成现代化，剩余关注点只剩两类：

- `src/assets/libs/createjs.min.js`：画布渲染/交互层核心依赖，属于长期画布层演进项，不是当前必须清理的阻塞项。
- `scripts/legacy-build.js` 里的 Less 编译职责：样式链路待观察项。

## 长期演进：CreateJS

### `createjs.min.js`

路径：`src/assets/libs/createjs.min.js`

状态：画布渲染、显示对象、事件、Ticker 和鼠标交互的核心依赖。它仍是 legacy vendor bundle，但当前不阻塞项目现代化；应作为长期画布层演进处理。

当前本地 bundle 包含：

- EaselJS `0.8.1`
- PreloadJS `0.6.1`
- SoundJS `0.6.1`
- TweenJS `0.6.1`

当前使用范围：

- `src/editor/editor/Editor.ts`
- `src/editor/runtime/Runtime.ts`
- `src/editor/tree/**`
- `src/editor/project/**`
- `src/editor/utils/**`
- `src/editor/draw/**`

处理建议：

- 短期保留当前 vendor，不把它作为当前依赖清理的阻塞项。
- 中期优先评估升级到 CreateJS 1.x npm 包或重新生成 bundle。
- 长期如果重写画布对象层，再评估 Konva / PixiJS。

推荐顺序：

1. 梳理当前实际用到的 CreateJS API。
2. 确认是否可以只保留 EaselJS/Ticker 相关模块。
3. 尝试同系列升级到 CreateJS 1.x。
4. 如果同系列升级收益不足，再评估 Konva / PixiJS 重写成本。

不要做：

- 不要直接把 CreateJS 替换成 Konva/PixiJS。
- 不要在同一个变更里同时重写画布对象层和编辑器交互系统。
- 不要改变 `createjs.extend()` / `createjs.promote()` 继承语义，除非同时迁移相关类。

潜在替代：

| 替代项 | 适用性 | 备注 |
| ------ | ------ | ---- |
| CreateJS 1.x | 高 | 最小迁移路径，仍保留 display list 模型 |
| Konva | 中高 | 适合节点编辑器，但需要重写画布对象层 |
| PixiJS | 中 | 渲染性能强，但编辑器命中测试和交互能力需要自建 |
| Fabric.js | 中低 | 更偏图形编辑器，不一定适合行为树编辑器 |
| Paper.js | 低 | 更偏矢量路径，不适合作为主渲染层 |

验收：

```bash
rg -n "createjs\\." src scripts package.json
npm run test
npm run typecheck
npm run build
```

还应手动验证：

- 新建项目
- 新建树
- 拖拽节点
- 框选节点
- 连接节点
- 缩放和移动画布
- 导入/导出项目 JSON

## 优先级二：Less 样式链路

### `less`

状态：Less 仍活跃，当前不是淘汰风险；保留为待观察项。

当前用途：

- 编译 `src/assets/less/index.less`。

替代方向：

- 继续保留 Less。
- 后续迁移到 plain CSS / PostCSS。
- 如果 Vue 组件样式继续增加，可逐步迁移到组件内样式或统一 CSS 层。

建议：

- 当前不处理。
- 等 UI 样式体系稳定后再决定是否迁移。

验收：

```bash
rg -n "\\.less|less" src scripts package.json package-lock.json
npm run build
```

## 通用验证

每轮依赖清理后至少执行：

```bash
npm run test
npm run typecheck
npm run build
npm audit --omit=optional
rg -n "<被移除依赖名>" src scripts package.json package-lock.json README.md docs
```

如果改动涉及运行时行为，还应手动验证：

- 新建项目
- 新建树
- 新建自定义节点
- 拖拽节点
- 连接节点
- 保存项目
- 导入/导出项目 JSON
