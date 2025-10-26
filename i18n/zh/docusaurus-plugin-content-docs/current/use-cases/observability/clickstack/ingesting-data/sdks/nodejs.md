---
'slug': '/use-cases/observability/clickstack/sdks/nodejs'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 5
'description': 'Node.js SDK 用于 ClickStack - ClickHouse 可观测性堆栈'
'title': 'Node.js'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 使用 OpenTelemetry 标准收集遥测数据（日志、指标、跟踪和异常）。跟踪通过自动仪器化自动生成，因此不需要手动仪器化即可从跟踪中获取价值。

本指南集成了：

- **日志**
- **指标**
- **跟踪**
- **异常**

## 入门 {#getting-started}

### 安装 HyperDX OpenTelemetry 仪器化包 {#install-hyperdx-opentelemetry-instrumentation-package}

使用以下命令安装 [ClickStack OpenTelemetry 包](https://www.npmjs.com/package/@hyperdx/node-opentelemetry)。

<Tabs groupId="install">
<TabItem value="npm" label="NPM" default>

```shell
npm install @hyperdx/node-opentelemetry 
```

</TabItem>
<TabItem value="yarn" label="Yarn" default>

```shell
yarn add @hyperdx/node-opentelemetry 
```

</TabItem>
</Tabs>

### 初始化 SDK {#initializin-the-sdk}

要初始化 SDK，您需要在应用程序的入口点顶部调用 `init` 函数。

<Tabs groupId="initialize">
<TabItem value="require" label="require" default>

```javascript
const HyperDX = require('@hyperdx/node-opentelemetry');

HyperDX.init({
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-service'
});
```

</TabItem>
<TabItem value="import" label="import">

```javascript
import * as HyperDX from '@hyperdx/node-opentelemetry';

HyperDX.init({
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-service'
});
```

</TabItem>
</Tabs>

这将自动捕获来自您的 Node.js 应用程序的跟踪、指标和日志。

### 设置日志收集 {#setup-log-collection}

默认情况下，`console.*` 日志会被收集。如果您使用的是 `winston` 或 `pino` 等日志记录器，则需要向日志记录器添加传输，以将日志发送到 ClickStack。如果您使用其他类型的日志记录器，可以 [联系](mailto:support@clickhouse.com) 或探索我们的平台集成（如 [Kubernetes](/use-cases/observability/clickstack/ingesting-data/kubernetes)）。

<Tabs groupId="logging">
<TabItem value="Winston" label="Winston" default>

如果您使用 `winston` 作为日志记录器，则需要将以下传输添加到您的日志记录器中。

```typescript
import winston from 'winston';
import * as HyperDX from '@hyperdx/node-opentelemetry';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    HyperDX.getWinstonTransport('info', { // Send logs info and above
      detectResources: true,
    }),
  ],
});

export default logger;
```

</TabItem>
<TabItem value="Pino" label="Pino">

如果您使用 `pino` 作为日志记录器，则需要将以下传输添加到您的日志记录器，并指定一个 `mixin` 以将日志与跟踪关联。

```typescript
import pino from 'pino';
import * as HyperDX from '@hyperdx/node-opentelemetry';

const logger = pino(
    pino.transport({
    mixin: HyperDX.getPinoMixinFunction,
    targets: [
        HyperDX.getPinoTransport('info', { // Send logs info and above
        detectResources: true,
        }),
    ],
    }),
);

export default logger;
```

</TabItem>

<TabItem value="console.log" label="console.log">
默认情况下，`console.*` 方法开箱即用地支持。无需额外配置。

您可以通过将 `HDX_NODE_CONSOLE_CAPTURE` 环境变量设置为 0 或向 `init` 函数传递 `consoleCapture: false` 来禁用此功能。

</TabItem>
</Tabs>

### 设置错误收集 {#setup-error-collection}

ClickStack SDK 可以自动捕获应用程序中的未捕获异常和错误，并提供完整的堆栈跟踪和代码上下文。

要启用此功能，您需要将以下代码添加到应用程序的错误处理中间件末尾，或者使用 `recordException` 函数手动捕获异常。

<Tabs groupId="setup">
<TabItem value="Express" label="Express" default>

```javascript
const HyperDX = require('@hyperdx/node-opentelemetry');
HyperDX.init({
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-service'
});
const app = express();

// Add your routes, etc.

// Add this after all routes,
// but before any and other error-handling middlewares are defined
HyperDX.setupExpressErrorHandler(app);

app.listen(3000);
```

</TabItem>
<TabItem value="Koa" label="Koa">

```javascript
const Koa = require("koa");
const Router = require("@koa/router");
const HyperDX = require('@hyperdx/node-opentelemetry');
HyperDX.init({
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-service'
});

const router = new Router();
const app = new Koa();

HyperDX.setupKoaErrorHandler(app);

// Add your routes, etc.

app.listen(3030);
```

</TabItem>
<TabItem value="Manual" label="Manual">

```javascript
const HyperDX = require('@hyperdx/node-opentelemetry');

function myErrorHandler(error, req, res, next) {
    // This can be used anywhere in your application
    HyperDX.recordException(error);
}
```

</TabItem>
</Tabs>

## 故障排除 {#troubleshooting}

如果您在使用 SDK 时遇到问题，可以通过将 `OTEL_LOG_LEVEL` 环境变量设置为 `debug` 来启用详细日志记录。

```shell
export OTEL_LOG_LEVEL=debug
```

## 高级仪器化配置 {#advanced-instrumentation-configuration}

### 捕获控制台日志 {#capture-console-logs}

默认情况下，ClickStack SDK 会捕获控制台日志。您可以通过将 `HDX_NODE_CONSOLE_CAPTURE` 环境变量设置为 0 来禁用它。

```sh copy
export HDX_NODE_CONSOLE_CAPTURE=0
```

### 附加用户信息或元数据 {#attach-user-information-or-metadata}

为了轻松标记与给定属性或标识符（例如用户 ID 或电子邮件）相关的所有事件，您可以调用 `setTraceAttributes` 函数，它将在调用后为与当前跟踪相关的每个日志/span 标记声明的属性。建议在给定请求/跟踪中尽早调用此函数（例如，在 Express 中间件栈中尽早）。

这是一种便捷的方式，确保所有日志/spans 自动标记了正确的标识符，以便在以后进行搜索，而无需手动标记和传播标识符。

`userId`、`userEmail`、`userName` 和 `teamName` 将填充会话 UI 以显示相应的值，但可以省略。还可以指定和使用其他附加值来搜索事件。

```typescript
import * as HyperDX from '@hyperdx/node-opentelemetry';

app.use((req, res, next) => {
  // Get user information from the request...

  // Attach user information to the current trace
  HyperDX.setTraceAttributes({
    userId,
    userEmail,
  });

  next();
});
```

确保通过将 `HDX_NODE_BETA_MODE` 环境变量设置为 1 或向 `init` 函数传递 `betaMode: true` 来启用 beta 模式，以启用跟踪属性。

```shell
export HDX_NODE_BETA_MODE=1
```

### Google Cloud Run {#google-cloud-run}

如果您在 Google Cloud Run 上运行应用程序，Cloud Trace 会自动将采样头注入到传入请求中，并且当前限制每个实例的跟踪采样为每秒 0.1 个请求。

`@hyperdx/node-opentelemetry` 包默认将采样率覆盖为 1.0。

要更改此行为或配置其他 OpenTelemetry 安装，您可以手动配置环境变量 `OTEL_TRACES_SAMPLER=parentbased_always_on` 和 `OTEL_TRACES_SAMPLER_ARG=1` 来实现相同的结果。

要了解更多信息并强制跟踪特定请求，请参阅 [Google Cloud Run 文档](https://cloud.google.com/run/docs/trace)。

### 自动仪器化库 {#auto-instrumented-libraries}

以下库将由 SDK 自动仪器化（跟踪）：

- [`dns`](https://nodejs.org/dist/latest/docs/api/dns.html)
- [`express`](https://www.npmjs.com/package/express)
- [`graphql`](https://www.npmjs.com/package/graphql)
- [`hapi`](https://www.npmjs.com/package/@hapi/hapi)
- [`http`](https://nodejs.org/dist/latest/docs/api/http.html)
- [`ioredis`](https://www.npmjs.com/package/ioredis)
- [`knex`](https://www.npmjs.com/package/knex)
- [`koa`](https://www.npmjs.com/package/koa)
- [`mongodb`](https://www.npmjs.com/package/mongodb)
- [`mongoose`](https://www.npmjs.com/package/mongoose)
- [`mysql`](https://www.npmjs.com/package/mysql)
- [`mysql2`](https://www.npmjs.com/package/mysql2)
- [`net`](https://nodejs.org/dist/latest/docs/api/net.html)
- [`pg`](https://www.npmjs.com/package/pg)
- [`pino`](https://www.npmjs.com/package/pino)
- [`redis`](https://www.npmjs.com/package/redis)
- [`winston`](https://www.npmjs.com/package/winston)

## 替代安装 {#alternative-installation}

### 使用 ClickStack OpenTelemetry CLI 运行应用程序 {#run-the-application-with-cli}

另外，您可以使用 `opentelemetry-instrument` CLI 或使用 Node.js `--require` 标志来在不进行任何代码更改的情况下自动仪器化您的应用程序。CLI 安装提供了更广泛的自动仪器化库和框架。

<Tabs groupId="cli">
<TabItem value="npx" label="使用 NPX" default>

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' npx opentelemetry-instrument index.js
```

</TabItem>
<TabItem value="custom" label="自定义入口点（例如 Nodemon、ts-node 等）">

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' ts-node -r '@hyperdx/node-opentelemetry/build/src/tracing' index.js
```

</TabItem>

<TabItem value="code_import" label="代码导入">

```javascript
// Import this at the very top of the first file loaded in your application
// You'll still specify your API key via the `HYPERDX_API_KEY` environment variable
import { initSDK } from '@hyperdx/node-opentelemetry';

initSDK({
    consoleCapture: true, // optional, default: true
    additionalInstrumentations: [], // optional, default: []
});
```

</TabItem>

</Tabs>

_`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中识别您的服务，可以是您想要的任何名称。_

### 启用异常捕获 {#enabling-exception-capturing}

要启用未捕获异常捕获，您需要将 `HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE` 环境变量设置为 1。

```shell
HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE=1
```

之后，自动捕获来自 Express、Koa 的异常，或者手动捕获异常，请遵循上面[设置错误收集](#setup-error-collection)部分中的说明。

### 自动仪器化库 {#auto-instrumented-libraries-2}

以下库将通过上述安装方法自动仪器化（跟踪）：

- [`amqplib`](https://www.npmjs.com/package/amqplib)
- [`AWS Lambda Functions`](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html)
- [`aws-sdk`](https://www.npmjs.com/package/aws-sdk)
- [`bunyan`](https://www.npmjs.com/package/bunyan)
- [`cassandra-driver`](https://www.npmjs.com/package/cassandra-driver)
- [`connect`](https://www.npmjs.com/package/connect)
- [`cucumber`](https://www.npmjs.com/package/@cucumber/cucumber)
- [`dataloader`](https://www.npmjs.com/package/dataloader)
- [`dns`](https://nodejs.org/dist/latest/docs/api/dns.html)
- [`express`](https://www.npmjs.com/package/express)
- [`fastify`](https://www.npmjs.com/package/fastify)
- [`generic-pool`](https://www.npmjs.com/package/generic-pool)
- [`graphql`](https://www.npmjs.com/package/graphql)
- [`grpc`](https://www.npmjs.com/package/@grpc/grpc-js)
- [`hapi`](https://www.npmjs.com/package/@hapi/hapi)
- [`http`](https://nodejs.org/dist/latest/docs/api/http.html)
- [`ioredis`](https://www.npmjs.com/package/ioredis)
- [`knex`](https://www.npmjs.com/package/knex)
- [`koa`](https://www.npmjs.com/package/koa)
- [`lru-memoizer`](https://www.npmjs.com/package/lru-memoizer)
- [`memcached`](https://www.npmjs.com/package/memcached)
- [`mongodb`](https://www.npmjs.com/package/mongodb)
- [`mongoose`](https://www.npmjs.com/package/mongoose)
- [`mysql`](https://www.npmjs.com/package/mysql)
- [`mysql2`](https://www.npmjs.com/package/mysql2)
- [`nestjs-core`](https://www.npmjs.com/package/@nestjs/core)
- [`net`](https://nodejs.org/dist/latest/docs/api/net.html)
- [`pg`](https://www.npmjs.com/package/pg)
- [`pino`](https://www.npmjs.com/package/pino)
- [`redis`](https://www.npmjs.com/package/redis)
- [`restify`](https://www.npmjs.com/package/restify)
- [`socket.io`](https://www.npmjs.com/package/socket.io)
- [`winston`](https://www.npmjs.com/package/winston)
