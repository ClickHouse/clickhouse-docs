---
slug: /use-cases/observability/clickstack/session-replay
title: '会话回放'
sidebar_label: '会话回放'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: '在 ClickStack 中捕获并回放用户会话，以便调试前端问题、分析用户行为，并将浏览器活动与后端日志和链路追踪数据进行关联。'
doc_type: 'guide'
keywords: ['clickstack', '会话回放', 'browser sdk', '前端可观测性', '用户会话', '调试']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import session_replay from '@site/static/images/clickstack/session-replay/session-replay.png';
import replay_search from '@site/static/images/clickstack/session-replay/replay-search-view.png';
import trace_to_replay from '@site/static/images/clickstack/session-replay/trace-to-replay.png';
import clickpy_trace from '@site/static/images/clickstack/session-replay/clickpy-trace.gif';

ClickStack 中的会话回放功能会捕获并重建用户在 Web 应用中的交互，使你能够在界面中精确重放用户在整个会话期间所看到的内容和执行的操作。SDK 并非录制视频，而是记录 DOM 变更、鼠标移动、点击、滚动、键盘输入、控制台日志输出、网络请求（XHR、Fetch、WebSocket）以及 JavaScript 异常，然后在浏览器中还原整个使用体验。

由于会话回放与日志、追踪数据（traces）和指标一同存储在 ClickHouse 中，你可以从观看用户体验无缝切换到检查支撑该体验的后端追踪和数据库查询——只需点击几下即可完成。这使得会话回放非常适合用于调试生产问题、理解用户行为、识别用户体验中的阻碍点，以及以可视化方式确认用户反馈给支持团队的问题。


## 为应用添加埋点 \{#instrumentation\}

ClickStack 与 OpenTelemetry 完全兼容，因此你可以使用标准的 OpenTelemetry JavaScript SDK 或任意一种 [ClickStack 语言 SDK](/use-cases/observability/clickstack/sdks) 来发送浏览器遥测数据（trace 和异常）。但是，**session replay 需要使用 ClickStack Browser SDK**（`@hyperdx/browser`），它在 OpenTelemetry SDK 的基础上扩展了会话录制、控制台捕获和网络请求捕获功能。如果你只需要 trace 而不需要 session replay，任何兼容 OTel 的浏览器 SDK 都可以与 ClickStack 一起配合使用。

下面的示例使用 ClickStack Browser SDK。为你的应用添加 session replay 只需三步：安装依赖包、初始化 SDK，之后所有用户交互都会被自动捕获——无需再修改任何代码。

:::tip
请在应用启动时一定会被加载的位置初始化 SDK。比如在 Next.js 应用中，可以将其放在根组件 `layout.js` 中。这样可以确保会话录制能立即开始，并完整捕获整个用户体验。
:::

<Tabs groupId="install">
<TabItem value="npm" label="NPM" default>

```shell
npm install @hyperdx/browser
```

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
  url: 'http://your-otel-collector:4318',
  apiKey: 'YOUR_INGESTION_API_KEY', // 托管版 ClickStack 可省略
  service: 'my-frontend-app',
  tracePropagationTargets: [/api.myapp.domain/i],
  consoleCapture: true,
  advancedNetworkCapture: true,
});
```

</TabItem>
<TabItem value="yarn" label="Yarn">

```shell
yarn add @hyperdx/browser
```

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
  url: 'http://your-otel-collector:4318',
  apiKey: 'YOUR_INGESTION_API_KEY', // 托管版 ClickStack 可省略
  service: 'my-frontend-app',
  tracePropagationTargets: [/api.myapp.domain/i],
  consoleCapture: true,
  advancedNetworkCapture: true,
});
```

</TabItem>
<TabItem value="script_tag" label="Script 标签">

对于未使用打包工具的应用，可以直接通过 script 标签引入 SDK。这会暴露全局变量 `HyperDX`，其使用方式与 NPM 包相同。

```html
<script src="https://unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://your-otel-collector:4318',
    apiKey: 'YOUR_INGESTION_API_KEY', // 托管版 ClickStack 可省略
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i],
    consoleCapture: true,
    advancedNetworkCapture: true,
  });
</script>
```

</TabItem>
</Tabs>

:::note
`tracePropagationTargets` 选项是将 session replay 与后端 trace 关联起来的关键——将其设置为你的 API 域名即可启用完整的前端到后端分布式追踪。有关包括隐私控制、自定义动作、React 错误边界以及 source map 在内的完整 SDK 配置列表，请参阅 [Browser SDK 参考](/use-cases/observability/clickstack/sdks/browser)。
:::

Browser SDK 还支持为对隐私敏感的应用进行[输入和文本遮罩](/use-cases/observability/clickstack/sdks/browser#options)，以及[附加用户信息](/use-cases/observability/clickstack/sdks/browser#attach-user-information-or-metadata)，从而可以在 ClickStack UI 中按用户搜索和过滤会话。

## 查看会话回放 \{#viewing-replays\}

在 ClickStack UI（HyperDX）左侧边栏中导航到 **Client Sessions**。该视图列出所有已捕获的浏览器会话及其持续时间和事件数量。

<Image img={replay_search} alt="会话回放搜索视图" size="lg"/>

单击任意会话的播放按钮即可回放。回放视图在右侧显示还原后的用户体验，左侧则显示浏览器事件时间线，包括网络请求、控制台日志和错误。

<Image img={session_replay} alt="会话回放播放界面" size="lg"/>

在 **Highlighted** 和 **All Events** 模式之间切换，以调整时间线中显示的详细程度。错误会以红色标注，单击任意事件会将回放跳转到会话中的对应时间点。

### 从会话到 Trace \{#session-to-trace\}

在会话时间轴中选择某个网络请求或错误时，可以点击进入 **Trace** 选项卡，沿着该请求在后端服务中的执行路径进行追踪，查看这次用户交互所触发的相关日志、span 和数据库查询。

之所以能够实现这一点，是因为 `tracePropagationTargets` 配置通过 `traceparent` 头将浏览器 span 与服务器 span 关联起来，从用户点击一路到数据库，构建出一条完整连通的分布式 trace。要了解包含前端和后端插桩在内的详细实战步骤，请参阅 [Instrumenting your NextJS application with OpenTelemetry and ClickStack](https://clickhouse.com/blog/instrumenting-nextjs-opentelemetry-clickstack)。

<img src={clickpy_trace} alt="从会话回放深入到 ClickStack 中的后端 trace" />

### 从 trace 到会话 \{#trace-to-session\}

关联也可以从反方向进行。在 **Search** 视图中查看某个 trace 时，点击它以打开 trace 详情页，然后选择 **Session Replay** 选项卡，即可准确看到该 trace 发生时用户实际经历的情况。这在排查错误或慢请求时尤其有用——你可以从后端问题入手，立即看到用户视角。

<Image img={trace_to_replay} alt="Session replay trace view" size="lg"/>

## 会话数据如何存储 \{#data-storage\}

会话回放数据存储在 ClickHouse 中专用的 [`hyperdx_sessions`](/use-cases/observability/clickstack/ingesting-data/schemas#sessions) 表中，与日志和链路追踪数据分开存储。每个会话事件对应一行，其中 `Body` 字段包含事件负载，`LogAttributes` 映射存储事件元数据。`Body` 和 `LogAttributes` 列共同保存用于重建会话回放的实际事件详细信息。

有关完整的表结构（schema）信息，请参见 [ClickStack 使用的表和 schema](/use-cases/observability/clickstack/ingesting-data/schemas)。

## 试用一下 \{#try-it-out\}

有两种方式可以查看会话回放的实际效果：

- **在线示例** — 访问 [clickpy.clickhouse.com](https://clickpy.clickhouse.com)，与应用交互，然后在 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 的 **ClickPy Sessions** 数据源中查看你的会话回放。要了解 ClickPy 是如何完成埋点的，请参阅博客文章 [Instrumenting your NextJS application with OpenTelemetry and ClickStack](https://clickhouse.com/blog/instrumenting-your-app-with-otel-clickstack)。
- **本地演示** — [Session Replay Demo](/use-cases/observability/clickstack/example-datasets/session-replay-demo) 将一步步演示如何为一个示例应用进行埋点，包括在本地运行 ClickStack 并查看回放。

## 了解更多 \{#learn-more\}

- [Session Replay Demo](/use-cases/observability/clickstack/example-datasets/session-replay-demo) — 提供分步说明的交互式本地演示应用程序
- [Browser SDK Reference](/use-cases/observability/clickstack/sdks/browser) — 完整的 SDK 配置选项、source maps、自定义操作和高级配置
- [Search](/use-cases/observability/clickstack/search) — 用于筛选会话和事件的搜索语法
- [Dashboards](/use-cases/observability/clickstack/dashboards) — 基于会话和跟踪（trace）数据构建可视化和仪表板
- [Alerts](/use-cases/observability/clickstack/alerts) — 为错误、延迟和其他信号配置告警
- [ClickStack Architecture](/use-cases/observability/clickstack/architecture) — 了解 ClickHouse、HyperDX 和 OTel collector 如何协同工作