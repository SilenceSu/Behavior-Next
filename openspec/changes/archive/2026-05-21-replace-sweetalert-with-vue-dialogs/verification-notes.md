# 验证记录

## 已完成

- `find src/app/vue -name '*.js' -print | sort | xargs -r -n1 node --check` 通过。
- `npm run build` 通过，生成 `build/` 产物。
- `rg -n "swal|sweetalert|sweet-alert|node_modules/sweetalert" src scripts package.json package-lock.json build` 无结果。
- `npm ls sweetalert` 显示依赖为空。
- `npm run dev -- --port 8001` 启动成功；通过 HTTP 验证 `/`、`js/app.min.js` 和 `css/app.min.css` 可访问。
- 本次验证启动的 `8001` dev server 已停止；原有 `8000` 进程未改动。

## 未完成的人工验证

当前执行环境没有可用的 Chrome、Chromium、Firefox、Playwright 或 Puppeteer 浏览器运行时，因此还没有完成真实浏览器点击验证：

- 未保存离开确认。
- 项目创建和重命名 prompt。
- 删除项目、tree、node 的 confirm。
- 重置设置 confirm。
- prompt 空字符串提交。
- confirm 取消、Escape 取消、Enter 确认。
- 输入框打开后自动聚焦。

这些交互的代码路径已经实现并通过构建，但仍需要在可用浏览器中复核。
