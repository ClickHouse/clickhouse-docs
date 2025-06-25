---
'slug': '/use-cases/observability/clickstack/sdks/browser'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 0
'description': '浏览器 SDK 用于 ClickStack - ClickHouse 可观察性堆栈'
'title': '浏览器 JS'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The ClickStack browser SDK允许您为前端应用程序添加监控功能，向ClickStack发送事件。这使您能够在单一时间轴中查看网络请求和异常以及后端事件。

此外，它将自动捕获并关联会话重放数据，因此您可以直观地逐步调试用户在使用您的应用程序时所看到的内容。

本指南集成了以下内容：

- **控制台日志**
- **会话重放**
- **XHR/Fetch/Websocket 请求**
- **异常**

## 获取开始 {#getting-started}

<br/>

<Tabs groupId="install">
<TabItem value="package_import" label="包导入" default>

**通过包导入安装 (推荐)**

使用以下命令安装 [browser package](https://www.npmjs.com/package/@hyperdx/browser)。

```bash
npm install @hyperdx/browser
```

**初始化 ClickStack**

```js
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

**通过脚本标签安装 (备用)**

您还可以通过脚本标签包含并安装脚本，而不是通过NPM安装。如果这样做，将会暴露 `HyperDX` 全局变量，并可以像 NPM 包一样使用。

如果您的网站不是使用打包工具构建的，推荐使用这种方式。

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
- `tracePropagationTargets` - 用于匹配 HTTP 请求的正则表达式模式列表，以链接前端和后端跟踪，它将为匹配任何模式的所有请求添加一个额外的 `traceparent` 头。此项应设置为您的后端 API 域名（例如：`api.yoursite.com`）。
- `consoleCapture` - （可选）捕获所有控制台日志（默认 `false`）。
- `advancedNetworkCapture` - （可选）捕获完整的请求/响应头和主体（默认 `false`）。
- `url` - （可选）OpenTelemetry 收集器 URL，仅对自托管实例需要。
- `maskAllInputs` - （可选）是否在会话重放中掩盖所有输入字段（默认 `false`）。
- `maskAllText` - （可选）是否在会话重放中掩盖所有文本（默认 `false`）。
- `disableIntercom` - （可选）是否禁用 Intercom 集成（默认 `false`）。
- `disableReplay` - （可选）是否禁用会话重放（默认 `false`）。

## 附加配置 {#additional-configuration}

### 附加用户信息或元数据 {#attach-user-information-or-metadata}

附加用户信息将允许您在 HyperDX UI 中搜索/过滤会话和事件。此操作可以在客户端会话的任何时刻调用。当前客户端会话和在调用之后发送的所有事件将与用户信息关联。

`userEmail`、`userName` 和 `teamName` 将相应地填充会话 UI，但可以省略。可以指定任何其他附加值，并用于搜索事件。

```js
HyperDX.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Other custom properties...
});
```

### 自动捕获 React 错误边界错误 {#auto-capture-react-error-boundary-errors}

如果您正在使用 React，可以通过将您的错误边界组件传递给 `attachToReactErrorBoundary` 函数来自动捕获发生在 React 错误边界内的错误。

```js
// Import your ErrorBoundary (we're using react-error-boundary as an example)
import { ErrorBoundary } from 'react-error-boundary';

// This will hook into the ErrorBoundary component and capture any errors that occur
// within any instance of it.
HyperDX.attachToReactErrorBoundary(ErrorBoundary);
```

### 发送自定义操作 {#send-custom-actions}

要明确跟踪特定的应用程序事件（例如：注册、提交等），您可以调用 `addAction` 函数，传递事件名称和可选事件元数据。

示例：

```js
HyperDX.addAction('Form-Completed', {
  formId: 'signup-form',
  formName: 'Signup Form',
  formType: 'signup',
});
```

### 动态启用网络捕获 {#enable-network-capture-dynamically}

要动态启用或禁用网络捕获，只需按需调用 `enableAdvancedNetworkCapture` 或 `disableAdvancedNetworkCapture` 函数。

```js
HyperDX.enableAdvancedNetworkCapture();
```

### 为 CORS 请求启用资源计时 {#enable-resource-timing-for-cors-requests}

如果您的前端应用程序向不同的域发出 API 请求，您可以选择启用 `Timing-Allow-Origin`[header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin)随请求发送。这将允许 ClickStack 捕获请求的细粒度资源计时信息，例如 DNS 查找、响应下载等，通过 [`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)。

如果您使用 `express` 和 `cors` 包，可以使用以下代码片段来启用该头：

```js
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
