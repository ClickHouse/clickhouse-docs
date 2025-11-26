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
        HyperDX.getWinstonTransport('info', { // 发送 info 级别及以上的日志
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
        HyperDX.getPinoTransport('info', { // 发送 info 级别及以上的日志
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

// 在这里添加您的路由等

// 在所有路由之后添加此行，
// 但要在定义任何其他错误处理中间件之前
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

// 在这里添加您的路由等

app.listen(3030);
```

</TabItem>
<TabItem value="Manual" label="Manual">

```javascript
const HyperDX = require('@hyperdx/node-opentelemetry');

function myErrorHandler(error, req, res, next) {
    // 这可以在应用程序的任何位置使用
    HyperDX.recordException(error);
}
```

</TabItem>
</Tabs>

## 故障排除

如果在使用 SDK 时遇到问题，可以通过将 `OTEL_LOG_LEVEL` 环境变量设置为 `debug` 来启用详细日志输出。

```shell
export OTEL_LOG_LEVEL=debug
```


## 高级埋点配置 {#advanced-instrumentation-configuration}

### 捕获控制台日志

默认情况下，ClickStack SDK 会捕获控制台日志。可以通过将环境变量 `HDX_NODE_CONSOLE_CAPTURE` 设置为 0 来禁用此功能。

```sh copy
export HDX_NODE_CONSOLE_CAPTURE=0
```


### 附加用户信息或元数据

若要轻松为与给定属性或标识符（例如 user id 或 email）相关的所有事件添加标签，可以调用 `setTraceAttributes` 函数。该函数会在调用后，将声明的属性附加到与当前 trace 关联的每一条 log/span 上。建议在给定 request/trace 的生命周期中尽可能早地调用该函数（例如在 Express middleware 栈中尽量靠前的位置）。

通过这种方式，可以方便地确保所有 logs/spans 都会自动带上正确的标识符，便于后续检索，而无需手动为每条日志打标签并自行传播这些标识符。

`userId`、`userEmail`、`userName` 和 `teamName` 会在 sessions UI 中填充相应的值，但它们是可选的。还可以指定任意其他附加字段，并使用这些字段来搜索事件。

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

要启用跟踪属性，请确保通过将环境变量 `HDX_NODE_BETA_MODE` 设置为 1，或在调用 `init` 函数时传入 `betaMode: true` 来开启 beta 模式。

```shell
export HDX_NODE_BETA_MODE=1
```


### Google Cloud Run {#google-cloud-run}

如果你在 Google Cloud Run 上运行应用程序，Cloud Trace 会自动向传入请求注入采样请求头，目前会将每个实例的跟踪采样率限制为每秒 0.1 个请求。

`@hyperdx/node-opentelemetry` 包默认会将采样率重写为 1.0。

要更改此行为，或配置其他 OpenTelemetry 部署，你可以手动设置环境变量
`OTEL_TRACES_SAMPLER=parentbased_always_on` 和 `OTEL_TRACES_SAMPLER_ARG=1` 来达到相同效果。

若要了解更多信息，以及如何强制对特定请求进行跟踪，请参阅
[Google Cloud Run 文档](https://cloud.google.com/run/docs/trace)。

### 自动插桩的库 {#auto-instrumented-libraries}

以下库将由 SDK 自动插桩（追踪）：

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

## 其他安装方式 {#alternative-installation}

### 使用 ClickStack OpenTelemetry CLI 运行应用程序 {#run-the-application-with-cli}

或者，你可以使用 `opentelemetry-instrument` CLI，或使用 Node.js 的 `--require` 标志，在无需修改任何代码的情况下对应用程序进行自动插桩。安装该 CLI 后，可以使用更多已支持自动插桩的库和框架。

<Tabs groupId="cli">
<TabItem value="npx" label="使用 NPX" default>

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' npx opentelemetry-instrument index.js
```

</TabItem>
<TabItem value="custom" label="自定义入口点（例如：Nodemon、ts-node 等）">

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' ts-node -r '@hyperdx/node-opentelemetry/build/src/tracing' index.js
```

</TabItem>

<TabItem value="code_import" label="通过代码引入">

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

_`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中标识你的服务，可以是任意你指定的名称。_

### 启用异常捕获

要启用未捕获异常的捕获功能，需要将环境变量 `HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE` 设置为 1。

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