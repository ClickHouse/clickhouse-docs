---
slug: /use-cases/observability/clickstack/sdks/browser
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'ClickStack 的浏览器 SDK - ClickHouse 可观测性栈'
title: '浏览器 JS'
doc_type: 'guide'
keywords: ['ClickStack', 'browser-sdk', 'javascript', 'session-replay', 'frontend']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 浏览器 SDK 允许你在前端应用中进行埋点采集，
将事件发送到 ClickStack。这样，你就可以在统一的时间轴中，将网络请求和异常与后端事件一并查看。

此外，它会自动捕获并关联会话回放数据，
使你能够以可视化方式逐步回放并调试用户在使用应用程序时的实际操作过程。

本指南集成了以下内容：

* **控制台日志**
* **会话回放**
* **XHR/Fetch/WebSocket 请求**
* **异常**


## 快速入门 {#getting-started}

<br />

<Tabs groupId="install">
<TabItem value="package_import" label="包导入" default>

**通过包导入安装(推荐)**

使用以下命令安装 [browser 包](https://www.npmjs.com/package/@hyperdx/browser)。

```shell
npm install @hyperdx/browser
```

**初始化 ClickStack**

```javascript
import HyperDX from "@hyperdx/browser"

HyperDX.init({
  url: "http://localhost:4318",
  apiKey: "YOUR_INGESTION_API_KEY",
  service: "my-frontend-app",
  tracePropagationTargets: [/api.myapp.domain/i], // 设置以关联前端到后端请求的追踪
  consoleCapture: true, // 捕获控制台日志(默认为 false)
  advancedNetworkCapture: true // 捕获完整的 HTTP 请求/响应头和正文(默认为 false)
})
```

</TabItem>
<TabItem value="script_tag" label="脚本标签">

**通过脚本标签安装(替代方案)**

您也可以通过脚本标签包含并安装脚本,而不是通过 NPM 安装。这将暴露 `HyperDX` 全局变量,可以像使用 NPM 包一样使用。

如果您的站点当前未使用打包工具构建,建议使用此方法。

```html
<script src="//www.unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: "http://localhost:4318",
    apiKey: "YOUR_INGESTION_API_KEY",
    service: "my-frontend-app",
    tracePropagationTargets: [/api.myapp.domain/i] // Set to link traces from frontend to backend requests
  })
</script>
```

</TabItem>
</Tabs>

### 配置选项 {#options}

- `apiKey` - 您的 ClickStack 数据摄取 API 密钥。
- `service` - 事件在 HyperDX UI 中显示的服务名称。
- `tracePropagationTargets` - 用于匹配 HTTP 请求的正则表达式模式列表,以关联前端和后端追踪,它将向所有匹配任何模式的请求添加额外的 `traceparent` 头。应将其设置为您的后端 API 域名(例如 `api.yoursite.com`)。
- `consoleCapture` - (可选)捕获所有控制台日志(默认为 `false`)。
- `advancedNetworkCapture` - (可选)捕获完整的请求/响应头和正文(默认为 false)。
- `url` - (可选)OpenTelemetry 收集器 URL,仅自托管实例需要。
- `maskAllInputs` - (可选)是否在会话回放中屏蔽所有输入字段(默认为 `false`)。
- `maskAllText` - (可选)是否在会话回放中屏蔽所有文本(默认为 `false`)。
- `disableIntercom` - (可选)是否禁用 Intercom 集成(默认为 `false`)
- `disableReplay` - (可选)是否禁用会话回放(默认为 `false`)


## 附加配置 {#additional-configuration}

### 附加用户信息或元数据 {#attach-user-information-or-metadata}

附加用户信息后,您可以在 HyperDX UI 中搜索和过滤会话及事件。该方法可在客户端会话期间的任意时刻调用。当前客户端会话以及调用后发送的所有事件都将与用户信息关联。

`userEmail`、`userName` 和 `teamName` 将在会话 UI 中填充相应的值,但这些字段可以省略。您可以指定任何其他附加值,并用于搜索事件。

```javascript
HyperDX.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name
  // 其他自定义属性...
})
```

### 自动捕获 React 错误边界错误 {#auto-capture-react-error-boundary-errors}

如果您使用 React,可以通过将错误边界组件传递给 `attachToReactErrorBoundary` 函数来自动捕获 React 错误边界内发生的错误。

```javascript
// 导入您的 ErrorBoundary(此处以 react-error-boundary 为例)
import { ErrorBoundary } from "react-error-boundary"

// 这将挂钩到 ErrorBoundary 组件并捕获其任何实例中发生的错误。
HyperDX.attachToReactErrorBoundary(ErrorBoundary)
```

### 发送自定义操作 {#send-custom-actions}

要显式跟踪特定的应用程序事件(例如注册、提交等),可以使用事件名称和可选的事件元数据调用 `addAction` 函数。

示例:

```javascript
HyperDX.addAction("Form-Completed", {
  formId: "signup-form",
  formName: "Signup Form",
  formType: "signup"
})
```

### 动态启用网络捕获 {#enable-network-capture-dynamically}

要动态启用或禁用网络捕获,只需根据需要调用 `enableAdvancedNetworkCapture` 或 `disableAdvancedNetworkCapture` 函数即可。

```javascript
HyperDX.enableAdvancedNetworkCapture()
```

### 为 CORS 请求启用资源计时 {#enable-resource-timing-for-cors-requests}

如果您的前端应用程序向不同的域发出 API 请求,可以选择启用 `Timing-Allow-Origin` [标头](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin)随请求一起发送。这将允许 ClickStack 通过 [`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming) 捕获请求的细粒度资源计时信息,例如 DNS 查找、响应下载等。

如果您使用 `express` 和 `cors` 包,可以使用以下代码片段启用该标头:

```javascript
var cors = require("cors")
var onHeaders = require("on-headers")

// ... 您的所有其他代码

app.use(function (req, res, next) {
  onHeaders(res, function () {
    var allowOrigin = res.getHeader("Access-Control-Allow-Origin")
    if (allowOrigin) {
      res.setHeader("Timing-Allow-Origin", allowOrigin)
    }
  })
  next()
})
app.use(cors())
```
