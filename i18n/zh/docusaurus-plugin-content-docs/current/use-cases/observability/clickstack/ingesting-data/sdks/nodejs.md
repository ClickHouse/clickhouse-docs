---
slug: /use-cases/observability/clickstack/sdks/nodejs
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: '适用于 ClickStack 的 Node.js SDK——ClickHouse 可观测性栈'
title: 'Node.js'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', '日志记录', '集成', '应用监控']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 使用 OpenTelemetry 标准来采集遥测数据（日志 logs、指标 metrics、追踪 traces 和异常 exceptions）。Traces 通过自动插桩自动生成，因此无需手动插桩即可从 tracing 中获益。

本指南集成了：

* **Logs**
* **Metrics**
* **Traces**
* **Exceptions**

## 开始使用 {#getting-started}

### 安装 HyperDX OpenTelemetry Instrumentation 包 {#install-hyperdx-opentelemetry-instrumentation-package}

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

要初始化 SDK，需要在应用程序入口文件的顶部调用 `init` 函数。

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

这将自动从你的 Node.js 应用程序中采集跟踪、指标和日志数据。

### 设置日志采集 {#setup-log-collection}

默认情况下，会自动采集 `console.*` 日志。如果您使用的是 `winston` 或 `pino` 等 logger，则需要在 logger 中添加一个 transport，将日志发送到 ClickStack。 如果您使用的是其他类型的 logger，欢迎[联系我们](mailto:support@clickhouse.com)，或者根据需要使用我们的平台集成（例如 [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes)）。

<Tabs groupId="logging">
<TabItem value="Winston" label="Winston" default>

如果您使用 `winston` 作为 logger，需要在 logger 中添加以下 transport。

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

如果您使用 `pino` 作为 logger，需要在 logger 中添加以下 transport，并指定一个 `mixin`，以便将日志与 trace 关联。

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
默认情况下，`console.*` 方法开箱即用，无需任何额外配置。 

您可以通过将环境变量 `HDX_NODE_CONSOLE_CAPTURE` 设置为 0，或在调用 `init` 函数时传入 `consoleCapture: false` 来禁用该功能。

</TabItem>
</Tabs>

### 设置错误收集 {#setup-error-collection}

ClickStack SDK 可以自动捕获应用程序中未捕获的异常和错误，并附带完整的堆栈跟踪和代码上下文。 

要启用此功能，您需要将以下代码添加到应用程序错误处理中间件链路的末尾，或者使用 `recordException` 函数手动捕获异常。

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

如果在使用 SDK 时遇到问题，可以通过将 `OTEL_LOG_LEVEL` 环境变量设置为 `debug` 来启用详细日志输出。

```shell
export OTEL_LOG_LEVEL=debug
```

## 高级埋点配置 {#advanced-instrumentation-configuration}

### 捕获控制台日志 {#capture-console-logs}

默认情况下，ClickStack SDK 会捕获控制台日志。可以通过将环境变量 `HDX_NODE_CONSOLE_CAPTURE` 设置为 0 来禁用此功能。

```sh copy
export HDX_NODE_CONSOLE_CAPTURE=0
```

### Attach user information or metadata {#attach-user-information-or-metadata}

To easily tag all events related to a given attribute or identifier (ex. user id
or email), you can call the `setTraceAttributes` function which will tag every
log/span associated with the current trace after the call with the declared
attributes. It's recommended to call this function as early as possible within a
given request/trace (ex. as early in an Express middleware stack as possible).

This is a convenient way to ensure all logs/spans are automatically tagged with
the right identifiers to be searched on later, instead of needing to manually
tag and propagate identifiers yourself.

`userId`, `userEmail`, `userName`, and `teamName` will populate the sessions UI
with the corresponding values, but can be omitted. Any other additional values
can be specified and used to search for events.

```typescript
import * as HyperDX from '@hyperdx/node-opentelemetry';

app.use((req, res, next) => {
  // 从请求中获取用户信息...

  // 将用户信息附加到当前跟踪
  HyperDX.setTraceAttributes({
    userId,
    userEmail,
  });

  next();
});
```

Make sure to enable beta mode by setting `HDX_NODE_BETA_MODE` environment
variable to 1 or by passing `betaMode: true` to the `init` function to
enable trace attributes.

```shell
export HDX_NODE_BETA_MODE=1
```

### Google Cloud Run {#google-cloud-run}

If you're running your application on Google Cloud Run, Cloud Trace
automatically injects sampling headers into incoming requests, currently
restricting traces to be sampled at 0.1 requests per second for each instance.

The `@hyperdx/node-opentelemetry` package overwrites the sample rate to 1.0 by
default.

To change this behavior, or to configure other OpenTelemetry installations, you
can manually configure the environment variables
`OTEL_TRACES_SAMPLER=parentbased_always_on` and `OTEL_TRACES_SAMPLER_ARG=1` to
achieve the same result.

To learn more, and to force tracing of specific requests, please refer to the
[Google Cloud Run documentation](https://cloud.google.com/run/docs/trace).

### Auto-instrumented libraries {#auto-instrumented-libraries}

The following libraries will be automatically instrumented (traced) by the SDK:

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

## Alternative installation {#alternative-installation}

### Run the Application with ClickStack OpenTelemetry CLI {#run-the-application-with-cli}

Alternatively, you can auto-instrument your application without any code changes by using the `opentelemetry-instrument` CLI or using the
Node.js `--require` flag. The CLI installation exposes a wider range of auto-instrumented libraries and frameworks.

<Tabs groupId="cli">
<TabItem value="npx" label="Using NPX" default>

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' npx opentelemetry-instrument index.js
```

</TabItem>
<TabItem value="custom" label="Custom Entry Point (ex. Nodemon, ts-node, etc.)">

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' ts-node -r '@hyperdx/node-opentelemetry/build/src/tracing' index.js
```

</TabItem>

<TabItem value="code_import" label="Code Import">

```javascript 
// 在应用程序中第一个被加载的文件最顶部引入此代码
// 你仍然需要通过 `HYPERDX_API_KEY` 环境变量来指定你的 API 密钥
import { initSDK } from '@hyperdx/node-opentelemetry';

initSDK({
    consoleCapture: true, // 可选，默认值：true
    additionalInstrumentations: [], // 可选，默认值：[]
});
```

</TabItem>

</Tabs>

_The `OTEL_SERVICE_NAME` environment variable is used to identify your service in the HyperDX app, it can be any name you want._

### Enabling exception capturing {#enabling-exception-capturing}

To enable uncaught exception capturing, you'll need to set the `HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE` environment variable to 1.

```shell
HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE=1
```

随后，如需自动捕获来自 Express、Koa 的异常或手动捕获异常，请按照上文 [设置错误收集](#setup-error-collection) 一节中的说明进行配置。

### 自动插桩的库 {#auto-instrumented-libraries-2}

通过上述安装方法，以下库将被自动插桩（用于追踪）：

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