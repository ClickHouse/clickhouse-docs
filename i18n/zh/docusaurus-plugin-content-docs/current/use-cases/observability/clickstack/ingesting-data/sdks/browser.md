---
slug: /use-cases/observability/clickstack/sdks/browser
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'ClickStack 浏览器 SDK - ClickHouse 观测栈'
title: '浏览器 JS'
doc_type: 'guide'
keywords: ['ClickStack', 'browser-sdk', 'javascript', 'session-replay', 'frontend']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 浏览器 SDK 允许你在前端应用中接入埋点，
将事件发送到 ClickStack。借此，你可以在同一时间轴中，
将网络请求和异常与后端事件一并查看。

此外，它会自动捕获并关联会话回放数据，
这样你就可以以可视化方式逐步回放和调试用户在使用
应用时所看到的内容。

本指南集成以下内容：

* **控制台日志（Console Logs）**
* **会话回放（Session Replays）**
* **XHR/Fetch/Websocket 请求**
* **异常（Exceptions）**


## 快速开始 {#getting-started}

<br/>

<Tabs groupId="install">
<TabItem value="package_import" label="包导入" default>

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
    tracePropagationTargets: [/api.myapp.domain/i], // 配置用于将前端与后端请求的链路关联起来
    consoleCapture: true, // 捕获 console 日志（默认 false）
    advancedNetworkCapture: true, // 捕获完整 HTTP 请求/响应头和请求/响应体（默认 false）
});
```

</TabItem>
<TabItem value="script_tag" label="Script 标签">

**通过 Script 标签安装（可选方式）**

你也可以通过 script 标签引入并安装该脚本，而不是
通过 npm 安装。这样会暴露 `HyperDX` 全局变量，并且可以
像使用 npm 包一样使用它。

如果你的站点目前不是通过打包工具构建的，推荐使用这种方式。

```html
<script src="//www.unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // 配置用于将前端与后端请求的链路关联起来
  });
</script>
```

</TabItem>
</Tabs>

### 选项 {#options}

- `apiKey` - 您的 ClickStack 摄取 API key。
- `service` - 事件在 HyperDX UI 中显示时使用的服务名称。
- `tracePropagationTargets` - 用于匹配 HTTP 请求的一组正则表达式模式，用来关联前端和后端的跟踪；它会为匹配任一模式的所有请求添加一个额外的 `traceparent` 头。该值应设置为您的后端 API 域名（例如 `api.yoursite.com`）。
- `consoleCapture` -（可选）是否捕获所有控制台日志（默认值为 `false`）。
- `advancedNetworkCapture` -（可选）是否捕获完整的请求/响应头和消息体（默认值为 `false`）。
- `url` -（可选）OpenTelemetry collector 的 URL，仅在自托管部署中需要。
- `maskAllInputs` -（可选）是否在会话回放中对所有输入字段进行掩码处理（默认值为 `false`）。
- `maskAllText` -（可选）是否在会话回放中对所有文本进行掩码处理（默认值为 `false`）。
- `disableIntercom` -（可选）是否禁用 Intercom 集成（默认值为 `false`）。
- `disableReplay` -（可选）是否禁用会话回放（默认值为 `false`）。

## 其他配置 {#additional-configuration}

### 附加用户信息或元数据

附加用户信息可以让你在 HyperDX UI 中搜索和筛选会话与事件。
可以在客户端会话期间的任意时刻调用该方法。当前客户端会话以及调用之后发送的所有事件都会与该用户信息关联。

`userEmail`、`userName` 和 `teamName` 会使用相应的值填充会话界面，但它们是可选的。你也可以指定任何其他附加字段或值，并将其用于搜索事件。

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

如果你使用 React，可以通过将错误边界组件传入 `attachToReactErrorBoundary` 函数，自动捕获出现在 React 错误边界内的错误。

```javascript
// 导入您的 ErrorBoundary(此处以 react-error-boundary 为例)
import { ErrorBoundary } from 'react-error-boundary';

// 这将接入 ErrorBoundary 组件并捕获其任何实例中发生的所有错误
HyperDX.attachToReactErrorBoundary(ErrorBoundary);
```


### 发送自定义操作

要对特定的应用程序事件进行明确跟踪（例如注册、提交
等），可以调用 `addAction` 函数，并传入事件名称以及可选的事件元数据。

示例：

```javascript
HyperDX.addAction('Form-Completed', {
  formId: 'signup-form',
  formName: '注册表单',
  formType: 'signup',
});
```


### 动态启用网络捕获

要动态启用或禁用网络捕获，只需视需要调用 `enableAdvancedNetworkCapture` 或 `disableAdvancedNetworkCapture` 函数即可。

```javascript
HyperDX.enableAdvancedNetworkCapture();
```


### 为 CORS 请求启用资源计时

如果前端应用向其他域名发起 API 请求，可以选择启用随请求发送的 `Timing-Allow-Origin` [头](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin)。这将允许 ClickStack 通过 [`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming) 捕获该请求的精细资源计时信息，例如 DNS 查询、响应下载等。

如果在 `express` 中使用 `cors` 包，可以使用以下代码片段来启用该头：

```javascript
var cors = require('cors');
var onHeaders = require('on-headers');

// ... 您的其他代码

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
