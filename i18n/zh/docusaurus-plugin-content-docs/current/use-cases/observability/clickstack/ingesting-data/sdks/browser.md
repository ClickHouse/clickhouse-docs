---
slug: /use-cases/observability/clickstack/sdks/browser
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'ClickStack 浏览器 SDK - ClickHouse 可观测性技术栈'
title: '浏览器 JS'
doc_type: 'guide'
keywords: ['ClickStack', 'browser-sdk', 'javascript', 'session-replay', 'frontend']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 浏览器 SDK 允许您对前端应用进行埋点采集，
将事件发送到 ClickStack。这样您就可以在同一条时间线上，将网络
请求和异常与后端事件一起查看。

此外，它会自动捕获并关联会话回放数据，
从而让您可以以可视化方式逐步回放并调试用户在使用
您的应用时所看到的内容。

本指南将集成以下内容：

* **控制台日志（Console Logs）**
* **会话回放（Session Replays）**
* **XHR/Fetch/Websocket 请求**
* **异常（Exceptions）**


## 入门 {#getting-started}

<br/>

<Tabs groupId="install">
<TabItem value="package_import" label="Package Import" default>

**通过包导入安装（推荐）**

使用以下命令安装 [browser 包](https://www.npmjs.com/package/@hyperdx/browser)。

```shell
npm install @hyperdx/browser
```

**初始化 ClickStack**

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // 设置为将前端与后端请求的 trace 关联起来
    consoleCapture: true, // 捕获控制台日志（默认 false）
    advancedNetworkCapture: true, // 捕获完整 HTTP 请求/响应头和 body（默认 false）
});
```

</TabItem>
<TabItem value="script_tag" label="Script Tag">

**通过 Script 标签安装（替代方案）**

你也可以通过 `script` 标签引入并安装该脚本，而不是
通过 NPM 安装。这样会暴露一个 `HyperDX` 全局变量，可以像
使用 NPM 包一样使用它。

如果你的网站当前不是通过打包工具构建，推荐使用这种方式。

```html
<script src="//www.unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // 设置为将前端与后端请求的 trace 关联起来
  });
</script>
```

</TabItem>
</Tabs>

### 选项 {#options}

- `apiKey` - 你的 ClickStack 摄取 API key。
- `service` - 事件在 HyperDX UI 中展示时对应的服务名称。
- `tracePropagationTargets` - 一个用于匹配 HTTP 请求的正则表达式列表，
  用于将前端与后端的 trace 关联；它会为所有匹配任一模式的请求
  添加一个额外的 `traceparent` 头。应设置为你的后端 API 域名（例如 `api.yoursite.com`）。
- `consoleCapture` -（可选）是否捕获所有控制台日志（默认 `false`）。
- `advancedNetworkCapture` -（可选）是否捕获完整请求/响应头和请求/响应体
  （默认 `false`）。
- `url` -（可选）OpenTelemetry collector 的 URL，仅在
  自托管实例中需要。
- `maskAllInputs` -（可选）是否在会话回放中对所有输入字段进行脱敏
  （默认 `false`）。
- `maskAllText` -（可选）是否在会话回放中对所有文本进行脱敏（默认
  `false`）。
- `disableIntercom` -（可选）是否禁用 Intercom 集成（默认 `false`）。
- `disableReplay` -（可选）是否禁用会话回放（默认 `false`）。



## 其他配置

### 附加用户信息或元数据

附加用户信息可以让你在 HyperDX UI 中搜索和筛选会话及事件。你可以在客户端会话期间的任意时间调用此操作。当前客户端会话以及调用之后发送的所有事件都会与该用户信息关联。

`userEmail`、`userName` 和 `teamName` 会在会话 UI 中显示相应的值，但也可以省略。你也可以指定任何其他附加字段，并用于搜索事件。

```javascript
HyperDX.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // 其他自定义属性...
});
```

### 自动捕获 React 错误边界中的错误

如果你使用 React，可以通过将错误边界组件传递给 `attachToReactErrorBoundary` 函数，自动捕获发生在 React 错误边界中的错误。

```javascript
// 导入您的 ErrorBoundary(我们以 react-error-boundary 为例)
import { ErrorBoundary } from 'react-error-boundary';

// 这将接入 ErrorBoundary 组件并捕获其任何实例中发生的错误
HyperDX.attachToReactErrorBoundary(ErrorBoundary);
```

### 发送自定义行为

要明确跟踪某个特定的应用事件（例如注册、提交等），可以调用 `addAction` 函数，传入事件名称和可选的事件元数据。

示例：

```javascript
HyperDX.addAction('Form-Completed', {
  formId: 'signup-form',
  formName: '注册表单',
  formType: 'signup',
});
```

### 动态启用网络捕获

要动态启用或禁用网络捕获，只需根据需要调用 `enableAdvancedNetworkCapture` 或 `disableAdvancedNetworkCapture` 函数。

```javascript
HyperDX.enableAdvancedNetworkCapture();
```

### 为 CORS 请求启用资源计时

如果你的前端应用向不同的域名发起 API 请求，你可以选择启用 `Timing-Allow-Origin` [header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin) 随请求一起发送。这样 ClickStack 就可以通过 [`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming) 捕获该请求的细粒度资源计时信息，例如 DNS 解析、响应下载等。

如果你在使用带有 `cors` 包的 `express`，可以使用以下代码片段来启用该 header：

```javascript
var cors = require('cors');
var onHeaders = require('on-headers');

// ... 你的所有代码

app.use(function (req, res, next) {
  onHeaders(res, function () {
    var allowOrigin = res.getHeader('Access-Control-Allow-Origin');
    if (allowOrigin) {
      res.setHeader('Timing-Allow-Origin', allowOrigin);
    }
  });
  next();
});
app.use(cors());
```
