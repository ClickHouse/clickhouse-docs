---
slug: /use-cases/observability/clickstack/sdks/nodejs
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'ClickStack 用 Node.js SDK - ClickHouse オブザーバビリティ スタック'
title: 'Node.js'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'ロギング', 'インテグレーション', 'アプリケーション監視']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack は、テレメトリデータ（ログ、メトリクス、
トレース、例外）を収集するために OpenTelemetry の標準を使用します。トレースは自動インストルメンテーションによって生成されるため、
トレースから価値を得るために手動でインストルメンテーションを行う必要はありません。

このガイドでは次の内容を統合します:

* **ログ**
* **メトリクス**
* **トレース**
* **例外**

## はじめに \\{#getting-started\\}

### HyperDX OpenTelemetry インストルメンテーションパッケージのインストール \\{#install-hyperdx-opentelemetry-instrumentation-package\\}

以下のコマンドを使用して、[ClickStack OpenTelemetry パッケージ](https://www.npmjs.com/package/@hyperdx/node-opentelemetry) をインストールします。

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

### SDK の初期化 \\{#initializin-the-sdk\\}

SDK を初期化するには、アプリケーションのエントリポイントの先頭で `init` 関数を呼び出す必要があります。

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

これにより、Node.js アプリケーションからトレース、メトリクス、ログが自動的に収集されます。

### ログ収集のセットアップ \\{#setup-log-collection\\}

デフォルトでは、`console.*` ログが収集されます。`winston` や `pino` などのロガーを使用している場合は、ログを ClickStack に送信するためのトランスポートをロガーに追加する必要があります。別の種類のロガーを使用している場合は、
[お問い合わせ](mailto:support@clickhouse.com)いただくか、該当する場合は [Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes) などのプラットフォームインテグレーションを確認してください。

<Tabs groupId="logging">
<TabItem value="Winston" label="Winston" default>

ロガーとして `winston` を使用している場合は、次のトランスポートをロガーに追加する必要があります。

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

ロガーとして `pino` を使用している場合は、次のトランスポートをロガーに追加し、ログをトレースと相関付けるために `mixin` を指定する必要があります。

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
デフォルトで `console.*` メソッドのログ収集がサポートされています。追加の設定は不要です。

これを無効にするには、環境変数 `HDX_NODE_CONSOLE_CAPTURE` を 0 に設定するか、`init` 関数に `consoleCapture: false` を渡してください。

</TabItem>
</Tabs>

### エラー収集のセットアップ \\{#setup-error-collection\\}

ClickStack SDK を使用すると、アプリケーション内で捕捉されていない例外やエラーを、スタックトレースおよびコードコンテキストとともに自動的に収集できます。

これを有効にするには、アプリケーションのエラー処理ミドルウェアの末尾に次のコードを追加するか、`recordException` 関数を使用して例外を手動で記録します。

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

## トラブルシューティング \\{#troubleshooting\\}

SDK で問題が発生している場合は、`OTEL_LOG_LEVEL` 環境変数を `debug` に設定することで詳細なログ出力を有効化できます。

```shell
export OTEL_LOG_LEVEL=debug
```

## 高度な計装設定 \\{#advanced-instrumentation-configuration\\}

### コンソールログのキャプチャ \\{#capture-console-logs\\}

デフォルトでは、ClickStack SDK はコンソールログをキャプチャします。これを無効にするには、
`HDX_NODE_CONSOLE_CAPTURE` 環境変数を 0 に設定してください。

```sh copy
export HDX_NODE_CONSOLE_CAPTURE=0
```

### Attach user information or metadata \\{#attach-user-information-or-metadata\\}

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
  // リクエストからユーザー情報を取得...

  // 現在のトレースにユーザー情報をアタッチ
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

### Google Cloud Run \\{#google-cloud-run\\}

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

### Auto-instrumented libraries \\{#auto-instrumented-libraries\\}

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

## Alternative installation \\{#alternative-installation\\}

### Run the Application with ClickStack OpenTelemetry CLI \\{#run-the-application-with-cli\\}

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
// アプリケーションで最初に読み込まれるファイルの先頭でこれをインポートします
// API キーは `HYPERDX_API_KEY` 環境変数で指定します
import { initSDK } from '@hyperdx/node-opentelemetry';

initSDK({
    consoleCapture: true, // オプション、デフォルト: true
    additionalInstrumentations: [], // オプション、デフォルト: []
});
```

</TabItem>

</Tabs>

_The `OTEL_SERVICE_NAME` environment variable is used to identify your service in the HyperDX app, it can be any name you want._

### Enabling exception capturing \\{#enabling-exception-capturing\\}

To enable uncaught exception capturing, you'll need to set the `HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE` environment variable to 1.

```shell
HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE=1
```

その後、Express や Koa で発生した例外を自動的に収集したり、例外を手動で捕捉したりするには、上記の [Setup Error Collection](#setup-error-collection) セクションの手順に従ってください。

### 自動インストルメントされるライブラリ \\{#auto-instrumented-libraries-2\\}

上記のインストール方法により、次のライブラリが自動的にインストルメント（トレース）されます：

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