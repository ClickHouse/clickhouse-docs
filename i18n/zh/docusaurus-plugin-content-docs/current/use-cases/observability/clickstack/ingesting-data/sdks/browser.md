---
'slug': '/use-cases/observability/clickstack/sdks/browser'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 0
'description': 'ClickStack 的浏览器 SDK - ClickHouse 观测堆栈'
'title': '浏览器 JS'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The ClickStack browser SDK allows you to instrument your frontend application to
send events to ClickStack. This allows you to view network 
requests and exceptions alongside backend events in a single timeline.

Additionally, it'll automatically capture and correlate session replay data, so
you can visually step through and debug what a user was seeing while using your
application.

This guide integrates the following:

- **控制台日志**
- **会话重放**
- **XHR/Fetch/Websocket 请求**
- **异常**

## 入门 {#getting-started}

<br/>

<Tabs groupId="install">
<TabItem value="package_import" label="包导入" default>

**通过包导入安装（推荐）**

使用以下命令安装 [browser package](https://www.npmjs.com/package/@hyperdx/browser)。

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
    tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
    consoleCapture: true, // Capture console logs (default false)
    advancedNetworkCapture: true, // Capture full HTTP request/response headers and bodies (default false)
});
```

</TabItem>
<TabItem value="script_tag" label="脚本标签">

**通过脚本标签安装（替代方法）**

您也可以通过脚本标签而不是通过 NPM 安装来包含和安装脚本。这将暴露 `HyperDX` 全局变量，并可以与 NPM 包以相同的方式使用。

如果您的网站当前不是使用捆绑工具构建的，建议使用此方法。

```html
<script src="//www.unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
  });
</script>
```

</TabItem>
</Tabs>

### 选项 {#options}

- `apiKey` - 您的 ClickStack 数据接收 API 密钥。
- `service` - 事件在 HyperDX UI 中显示的服务名称。
- `tracePropagationTargets` - 匹配 HTTP 请求的正则表达式模式列表，以链接前端和后端追踪，它将向所有匹配任何模式的请求添加额外的 `traceparent` 头。此值应设置为您的后端 API 域（例如 `api.yoursite.com`）。
- `consoleCapture` - （可选）捕获所有控制台日志（默认 `false`）。
- `advancedNetworkCapture` - （可选）捕获完整的请求/响应头和主体（默认 false）。
- `url` - （可选）OpenTelemetry 收集器 URL，仅需要用于自托管实例。
- `maskAllInputs` - （可选）是否在会话重放中掩盖所有输入字段（默认 `false`）。
- `maskAllText` - （可选）是否在会话重放中掩盖所有文本（默认 `false`）。
- `disableIntercom` - （可选）是否禁用 Intercom 集成（默认 `false`）
- `disableReplay` - （可选）是否禁用会话重放（默认 `false`）

## 其他配置 {#additional-configuration}

### 附加用户信息或元数据 {#attach-user-information-or-metadata}

附加用户信息将允许您在 HyperDX UI 中搜索/过滤会话和事件。此操作可以在客户端会话的任何时候调用。当前客户端会话及呼叫后发送的所有事件将与用户信息关联。

`userEmail`、`userName` 和 `teamName` 将在会话 UI 中填充相应的值，但可以省略。可以指定并使用任何其他附加值来搜索事件。

```javascript
HyperDX.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Other custom properties...
});
```

### 自动捕获 React 错误边界错误 {#auto-capture-react-error-boundary-errors}

如果您使用 React，可以通过将您的错误边界组件传入 `attachToReactErrorBoundary` 函数，自动捕获发生在 React 错误边界中的错误。

```javascript
// Import your ErrorBoundary (we're using react-error-boundary as an example)
import { ErrorBoundary } from 'react-error-boundary';

// This will hook into the ErrorBoundary component and capture any errors that occur
// within any instance of it.
HyperDX.attachToReactErrorBoundary(ErrorBoundary);
```

### 发送自定义操作 {#send-custom-actions}

要显式跟踪特定应用事件（例如注册、提交等），可以调用 `addAction` 函数，并传入事件名称和可选事件元数据。

示例：

```javascript
HyperDX.addAction('Form-Completed', {
  formId: 'signup-form',
  formName: 'Signup Form',
  formType: 'signup',
});
```

### 动态启用网络捕获 {#enable-network-capture-dynamically}

要动态启用或禁用网络捕获，只需在需要时调用 `enableAdvancedNetworkCapture` 或 `disableAdvancedNetworkCapture` 函数。

```javascript
HyperDX.enableAdvancedNetworkCapture();
```

### 为 CORS 请求启用资源计时 {#enable-resource-timing-for-cors-requests}

如果您的前端应用程序向不同域发出 API 请求，您可以选择性地启用 `Timing-Allow-Origin`[header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin) 以与请求一起发送。这将允许 ClickStack 捕获细粒度的资源计时信息，如 DNS 查找、响应下载等，通过 [`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)。

如果您在使用 `express` 和 `cors` 包，您可以使用以下代码片段来启用头：

```javascript
var cors = require('cors');
var onHeaders = require('on-headers');

// ... all your stuff

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
