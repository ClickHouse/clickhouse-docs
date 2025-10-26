---
'slug': '/use-cases/observability/clickstack/sdks/nodejs'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 5
'description': 'Node.js SDK for ClickStack - The ClickHouse 可観察性スタック'
'title': 'Node.js'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStackは、テレメトリデータ（ログ、メトリクス、トレース、例外）を収集するためにOpenTelemetry標準を使用します。トレースは自動計測によって自動生成されるため、トレースから価値を得るために手動の計測は必要ありません。

このガイドは以下を統合しています：

- **ログ**
- **メトリクス**
- **トレース**
- **例外**

## はじめに {#getting-started}

### HyperDX OpenTelemetry計測パッケージのインストール {#install-hyperdx-opentelemetry-instrumentation-package}

以下のコマンドを使用して、[ClickStack OpenTelemetryパッケージ](https://www.npmjs.com/package/@hyperdx/node-opentelemetry)をインストールします。

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

### SDKの初期化 {#initializin-the-sdk}

SDKを初期化するには、アプリケーションのエントリポイントの先頭で`init`関数を呼び出す必要があります。

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

これにより、Node.jsアプリケーションからのトレース、メトリクス、およびログが自動的にキャプチャされます。

### ログ収集の設定 {#setup-log-collection}

デフォルトでは、`console.*`ログが収集されます。`winston`や`pino`などのロガーを使用している場合は、ログをClickStackに送信するためにロガーにトランスポートを追加する必要があります。その他の種類のロガーを使用している場合は、[お問い合わせ](mailto:support@clickhouse.com)いただくか、適用可能であればプラットフォーム統合の1つ（例えば、[Kubernetes](/use-cases/observability/clickstack/ingesting-data/kubernetes)）を調査してください。

<Tabs groupId="logging">
<TabItem value="Winston" label="Winston" default>

`winston`をロガーとして使用している場合は、ロガーに以下のトランスポートを追加する必要があります。

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

`pino`をロガーとして使用している場合は、ロガーに以下のトランスポートを追加し、トレースとログを関連付けるために`mixin`を指定する必要があります。

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
デフォルトでは、`console.*`メソッドが標準でサポートされています。追加の設定は必要ありません。 

これを無効にするには、環境変数`HDX_NODE_CONSOLE_CAPTURE`を0に設定するか、`init`関数に`consoleCapture: false`を渡してください。

</TabItem>
</Tabs>

### エラー収集の設定 {#setup-error-collection}

ClickStack SDKは、アプリケーション内で発生した未捕捉の例外やエラーを、スタックトレースとコードコンテキストを含めて自動的にキャプチャできます。

これを有効にするには、アプリケーションのエラーハンドリングミドルウェアの最後に以下のコードを追加するか、`recordException`関数を使用して手動で例外をキャプチャする必要があります。

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

## トラブルシューティング {#troubleshooting}

SDKに問題がある場合は、環境変数`OTEL_LOG_LEVEL`を`debug`に設定することで詳細ログを有効にできます。

```shell
export OTEL_LOG_LEVEL=debug
```

## 高度な計測構成 {#advanced-instrumentation-configuration}

### コンソールログのキャプチャ {#capture-console-logs}

デフォルトでは、ClickStack SDKはコンソールログをキャプチャします。これを無効にするには、環境変数`HDX_NODE_CONSOLE_CAPTURE`を0に設定します。

```sh copy
export HDX_NODE_CONSOLE_CAPTURE=0
```

### ユーザー情報またはメタデータの添付 {#attach-user-information-or-metadata}

特定の属性や識別子（例：ユーザーIDまたはメール）に関連するすべてのイベントを簡単にタグ付けするには、`setTraceAttributes`関数を呼び出します。この関数を呼び出すと、宣言された属性で現在のトレースに関連するすべてのログ/spanがタグ付けされます。この関数は、リクエスト/トレース内でできるだけ早く呼び出すことをお勧めします（例：Expressミドルウェアスタックの早い段階で）。

これにより、すべてのログ/spanが適切な識別子で自動的にタグ付けされ、後で検索する際に便利になります。手動で識別子をタグ付けして伝播させる必要はありません。

`userId`、`userEmail`、`userName`、および`teamName`は、セッションUIに対応する値を埋め込みますが、省略することもできます。その他の追加値も指定でき、イベントの検索に使用できます。

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

トレース属性を有効にするには、環境変数`HDX_NODE_BETA_MODE`を1に設定するか、`init`関数に`betaMode: true`を渡してベータモードを有効にしてください。

```shell
export HDX_NODE_BETA_MODE=1
```

### Google Cloud Run {#google-cloud-run}

Google Cloud Runでアプリケーションを実行している場合、Cloud Traceは自動的に受信リクエストにサンプリングヘッダーを挿入し、現在のインスタンスあたり0.1リクエスト/秒でトレースがサンプリングされます。

`@hyperdx/node-opentelemetry`パッケージは、デフォルトでサンプルレートを1.0に上書きします。

この動作を変更するには、または他のOpenTelemetryインストールを構成するには、環境変数`OTEL_TRACES_SAMPLER=parentbased_always_on`および`OTEL_TRACES_SAMPLER_ARG=1`を手動で設定して同じ結果を得ることができます。

詳細について、特定のリクエストのトレーシングを強制する方法については、[Google Cloud Runのドキュメント](https://cloud.google.com/run/docs/trace)を参照してください。

### 自動計測されたライブラリ {#auto-instrumented-libraries}

次のライブラリは、SDKによって自動的に計測された（トレースされた）ものです：

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

## 代替インストール {#alternative-installation}

### ClickStack OpenTelemetry CLIでアプリケーションを実行 {#run-the-application-with-cli}

別の方法として、`opentelemetry-instrument` CLIを使用するか、Node.jsの`--require`フラグを使用して、コードの変更なしにアプリケーションを自動計測することができます。CLIインストールは、より広範な自動計測ライブラリやフレームワークを提供します。

<Tabs groupId="cli">
<TabItem value="npx" label="NPXを使用" default>

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' npx opentelemetry-instrument index.js
```

</TabItem>
<TabItem value="custom" label="カスタムエントリポイント（例：Nodemon、ts-nodeなど）">

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' ts-node -r '@hyperdx/node-opentelemetry/build/src/tracing' index.js
```

</TabItem>

<TabItem value="code_import" label="コードインポート">

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

_`OTEL_SERVICE_NAME`環境変数は、HyperDXアプリでサービスを識別するために使用されます。これは任意の名前を指定できます。_

### 例外キャプチャの有効化 {#enabling-exception-capturing}

未捕捉の例外キャプチャを有効にするには、環境変数`HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE`を1に設定する必要があります。

```shell
HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE=1
```

その後、Express、Koaから自動的に例外をキャプチャするか、手動で例外を捕まえるための指示に従ってください。[エラー収集の設定](#setup-error-collection)セクションを上記参照してください。

### 自動計測されたライブラリ {#auto-instrumented-libraries-2}

上記のインストール方法によって、次のライブラリが自動的に計測されます（トレースされます）：

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
