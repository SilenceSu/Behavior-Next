# vue-dialog-system 规格说明

## Purpose
定义 Behavior3 Editor 的 Vue 自有 dialog 系统要求，包括 alert、confirm、prompt、Promise 结果语义、键盘焦点行为以及文件系统 dialog 边界。

## Requirements
### Requirement: Vue 自有 Dialog Host
Vue UI MUST 使用应用自有的 Vue dialog host 渲染 alert、confirm 和 prompt，不得依赖 SweetAlert 1 或全局 `window.swal()`。

#### Scenario: 应用挂载 Dialog Host
- **WHEN** Vue 应用通过根组件启动
- **THEN** dialog host 必须作为 Vue component tree 的一部分挂载
- **AND** `dialogService.alert()`、`dialogService.confirm()` 和 `dialogService.prompt()` 必须通过该 host 呈现弹窗
- **AND** 运行时代码不得调用 `window.swal()`

### Requirement: Dialog Promise 语义兼容
Dialog service MUST 保持现有 Promise API 的调用语义，避免业务组件为替换弹窗库而重写流程。

#### Scenario: 用户确认 confirm 弹窗
- **WHEN** 调用方执行 `dialogService.confirm(title, text, type, options)` 并且用户确认
- **THEN** 返回的 Promise 必须 resolve
- **AND** 调用方原有的 `.then()` 后续流程必须继续执行

#### Scenario: 用户取消 confirm 弹窗
- **WHEN** 用户取消 confirm 弹窗、按 Escape 或关闭弹窗
- **THEN** 返回的 Promise 必须 reject
- **AND** 不得执行确认分支的业务逻辑

#### Scenario: 用户提交 prompt 弹窗
- **WHEN** 调用方执行 `dialogService.prompt(title, text, type, placeholder, options)` 并且用户提交输入
- **THEN** 返回的 Promise 必须 resolve 用户输入的字符串
- **AND** 空字符串必须继续交给调用方处理，而不是在 dialog service 中改写为取消

### Requirement: Dialog 交互行为
Dialog host MUST 提供阻塞式弹窗交互所需的基础键盘、焦点和按钮行为。

#### Scenario: 弹窗打开时聚焦
- **WHEN** alert、confirm 或 prompt 弹窗打开
- **THEN** 系统必须把焦点移动到输入框或主要操作按钮
- **AND** 用户必须可以通过键盘继续操作弹窗

#### Scenario: 键盘提交或取消
- **WHEN** 用户在 dialog 打开时按 Enter
- **THEN** 系统必须执行主要操作
- **AND** 如果用户按 Escape，系统必须执行取消或关闭操作

### Requirement: 文件系统 Dialog 保持原生路径
Electron/NW 文件打开和保存 dialog MUST 保持现有原生接口和路径返回语义，不得被应用内 Vue dialog 替代。

#### Scenario: 打开或保存文件
- **WHEN** 调用方执行 `dialogService.openFile()`、`dialogService.saveAs()` 或 `dialogService.openDirectory()`
- **THEN** 系统必须继续使用可用的原生文件 dialog API
- **AND** 返回值必须保持现有路径或路径数组语义
