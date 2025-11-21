---
slug: /use-cases/observability/clickstack/sdks/nodejs
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: '适用于 ClickStack 的 Node.js SDK——ClickHouse 可观测性栈'
title: 'Node.js'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', '日志', '集成', '应用监控']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 使用 OpenTelemetry 标准来收集遥测数据（日志、指标、链路追踪和异常）。链路追踪通过自动插桩自动生成，因此无需手动插桩即可从追踪数据中获益。

本指南集成了：

* **日志**
* **指标**
* **链路追踪**
* **异常**


## 入门指南 {#getting-started}

### 安装 HyperDX OpenTelemetry 插桩包 {#install-hyperdx-opentelemetry-instrumentation-package}

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

要初始化 SDK,需要在应用程序入口点的顶部调用 `init` 函数。

<Tabs groupId="initialize">
<TabItem value="require" label="require" default>

```javascript
const HyperDX = require("@hyperdx/node-opentelemetry")

HyperDX.init({
  apiKey: "YOUR_INGESTION_API_KEY",
  service: "my-service"
})
```

</TabItem>
<TabItem value="import" label="import">

```javascript
import * as HyperDX from "@hyperdx/node-opentelemetry"

HyperDX.init({
  apiKey: "YOUR_INGESTION_API_KEY",
  service: "my-service"
})
```

</TabItem>
</Tabs>

这将自动捕获 Node.js 应用程序的追踪、指标和日志。

### 设置日志收集 {#setup-log-collection}

默认情况下,`console.*` 日志会被自动收集。如果使用 `winston` 或 `pino` 等日志记录器,需要为日志记录器添加传输器以将日志发送到 ClickStack。如果使用其他类型的日志记录器,请[联系我们](mailto:support@clickhouse.com)或探索适用的平台集成(例如 [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes))。

<Tabs groupId="logging">
<TabItem value="Winston" label="Winston" default>

如果使用 `winston` 作为日志记录器,需要为日志记录器添加以下传输器。

```typescript
import winston from "winston"
import * as HyperDX from "@hyperdx/node-opentelemetry"

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    HyperDX.getWinstonTransport("info", {
      // 发送 info 级别及以上的日志
      detectResources: true
    })
  ]
})

export default logger
```

</TabItem>
<TabItem value="Pino" label="Pino">

如果使用 `pino` 作为日志记录器,需要为日志记录器添加以下传输器,并指定 `mixin` 以将日志与追踪关联。

```typescript
import pino from "pino"
import * as HyperDX from "@hyperdx/node-opentelemetry"

const logger = pino(
  pino.transport({
    mixin: HyperDX.getPinoMixinFunction,
    targets: [
      HyperDX.getPinoTransport("info", {
        // 发送 info 级别及以上的日志
        detectResources: true
      })
    ]
  })
)

export default logger
```

</TabItem>

<TabItem value="console.log" label="console.log">
默认情况下,`console.*` 方法开箱即用,无需额外配置。

可以通过将 `HDX_NODE_CONSOLE_CAPTURE` 环境变量设置为 0 或向 `init` 函数传递 `consoleCapture: false` 来禁用此功能。

</TabItem>
</Tabs>

### 设置错误收集 {#setup-error-collection}

ClickStack SDK 可以自动捕获应用程序中的未捕获异常和错误,并提供完整的堆栈追踪和代码上下文。

要启用此功能,需要将以下代码添加到应用程序错误处理中间件的末尾,或使用 `recordException` 函数手动捕获异常。

<Tabs groupId="setup">
<TabItem value="Express" label="Express" default>

```javascript
const HyperDX = require("@hyperdx/node-opentelemetry")
HyperDX.init({
  apiKey: "YOUR_INGESTION_API_KEY",
  service: "my-service"
})
const app = express()

// 添加路由等

// 在所有路由之后添加此代码,
// 但要在定义任何其他错误处理中间件之前
HyperDX.setupExpressErrorHandler(app)

app.listen(3000)
```


</TabItem>
<TabItem value="Koa" label="Koa">

```javascript
const Koa = require("koa")
const Router = require("@koa/router")
const HyperDX = require("@hyperdx/node-opentelemetry")
HyperDX.init({
  apiKey: "YOUR_INGESTION_API_KEY",
  service: "my-service"
})

const router = new Router()
const app = new Koa()

HyperDX.setupKoaErrorHandler(app)

// 添加您的路由等配置

app.listen(3030)
```

</TabItem>
<TabItem value="Manual" label="手动">

```javascript
const HyperDX = require("@hyperdx/node-opentelemetry")

function myErrorHandler(error, req, res, next) {
  // 此方法可在应用程序的任何位置使用
  HyperDX.recordException(error)
}
```

</TabItem>
</Tabs>


## 故障排查 {#troubleshooting}

如果您在使用 SDK 时遇到问题,可以通过将 `OTEL_LOG_LEVEL` 环境变量设置为 `debug` 来启用详细日志。

```shell
export OTEL_LOG_LEVEL=debug
```


## 高级插桩配置 {#advanced-instrumentation-configuration}

### 捕获控制台日志 {#capture-console-logs}

默认情况下,ClickStack SDK 会捕获控制台日志。您可以通过将 `HDX_NODE_CONSOLE_CAPTURE` 环境变量设置为 0 来禁用此功能。

```sh copy
export HDX_NODE_CONSOLE_CAPTURE=0
```

### 附加用户信息或元数据 {#attach-user-information-or-metadata}

为了便于标记与特定属性或标识符(例如用户 ID 或电子邮件)相关的所有事件,您可以调用 `setTraceAttributes` 函数,该函数会使用声明的属性标记调用后与当前跟踪关联的每个日志/span。建议在给定请求/跟踪中尽早调用此函数(例如在 Express 中间件堆栈中尽早调用)。

这是一种便捷的方式,可确保所有日志/span 自动标记正确的标识符以便后续搜索,而无需手动标记和传播标识符。

`userId`、`userEmail`、`userName` 和 `teamName` 会在会话 UI 中填充相应的值,但可以省略。可以指定任何其他附加值并用于搜索事件。

```typescript
import * as HyperDX from "@hyperdx/node-opentelemetry"

app.use((req, res, next) => {
  // 从请求中获取用户信息...

  // 将用户信息附加到当前跟踪
  HyperDX.setTraceAttributes({
    userId,
    userEmail
  })

  next()
})
```

确保通过将 `HDX_NODE_BETA_MODE` 环境变量设置为 1 或向 `init` 函数传递 `betaMode: true` 来启用 beta 模式以启用跟踪属性。

```shell
export HDX_NODE_BETA_MODE=1
```

### Google Cloud Run {#google-cloud-run}

如果您在 Google Cloud Run 上运行应用程序,Cloud Trace 会自动将采样标头注入传入请求,目前将每个实例的跟踪采样限制为每秒 0.1 个请求。

`@hyperdx/node-opentelemetry` 包默认将采样率覆盖为 1.0。

要更改此行为或配置其他 OpenTelemetry 安装,您可以手动配置环境变量 `OTEL_TRACES_SAMPLER=parentbased_always_on` 和 `OTEL_TRACES_SAMPLER_ARG=1` 以实现相同的结果。

要了解更多信息并强制跟踪特定请求,请参阅 [Google Cloud Run 文档](https://cloud.google.com/run/docs/trace)。

### 自动插桩库 {#auto-instrumented-libraries}

SDK 会自动对以下库进行插桩(跟踪):

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


## 替代安装方式 {#alternative-installation}

### 使用 ClickStack OpenTelemetry CLI 运行应用程序 {#run-the-application-with-cli}

或者,您可以使用 `opentelemetry-instrument` CLI 或 Node.js `--require` 标志来自动检测您的应用程序,无需修改任何代码。CLI 安装方式支持更广泛的自动检测库和框架。

<Tabs groupId="cli">
<TabItem value="npx" label="使用 NPX" default>

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' npx opentelemetry-instrument index.js
```

</TabItem>
<TabItem value="custom" label="自定义入口点(例如 Nodemon、ts-node 等)">

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' ts-node -r '@hyperdx/node-opentelemetry/build/src/tracing' index.js
```

</TabItem>

<TabItem value="code_import" label="代码导入">

```javascript
// 在应用程序加载的第一个文件的最顶部导入此内容
// 您仍需通过 `HYPERDX_API_KEY` 环境变量指定 API 密钥
import { initSDK } from "@hyperdx/node-opentelemetry"

initSDK({
  consoleCapture: true, // 可选,默认值:true
  additionalInstrumentations: [] // 可选,默认值:[]
})
```

</TabItem>

</Tabs>

_`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用程序中标识您的服务,可以是任意名称。_

### 启用异常捕获 {#enabling-exception-capturing}

要启用未捕获异常的捕获,需要将 `HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE` 环境变量设置为 1。

```shell
HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE=1
```

之后,要自动捕获来自 Express、Koa 的异常,或手动捕获异常,请参照上文[设置错误收集](#setup-error-collection)部分的说明进行操作。

### 自动检测的库 {#auto-instrumented-libraries-2}

通过上述安装方法,以下库将被自动检测(追踪):


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
