---
slug: /use-cases/observability/clickstack/sdks/nodejs
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'ClickStack 向け Node.js SDK - ClickHouse オブザーバビリティスタック'
title: 'Node.js'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'ロギング', 'インテグレーション', 'アプリケーション監視']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack では、テレメトリデータ（ログ、メトリクス、トレース、例外）を収集するために OpenTelemetry の標準仕様を使用しています。トレースは自動インストルメンテーションによって自動生成されるため、トレースを有効活用するために手動インストルメンテーションを行う必要はありません。

このガイドでは、次の要素を統合します:

* **ログ**
* **メトリクス**
* **トレース**
* **例外**


## はじめに {#getting-started}

### HyperDX OpenTelemetryインストルメンテーションパッケージのインストール {#install-hyperdx-opentelemetry-instrumentation-package}

以下のコマンドを使用して[ClickStack OpenTelemetryパッケージ](https://www.npmjs.com/package/@hyperdx/node-opentelemetry)をインストールします。

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

SDKを初期化するには、アプリケーションのエントリーポイントの先頭で`init`関数を呼び出す必要があります。

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

これにより、Node.jsアプリケーションからトレース、メトリクス、ログが自動的にキャプチャされます。

### ログ収集の設定 {#setup-log-collection}

デフォルトでは、`console.*`ログが収集されます。`winston`や`pino`などのロガーを使用している場合は、ClickStackにログを送信するためにロガーにトランスポートを追加する必要があります。別のタイプのロガーを使用している場合は、[お問い合わせ](mailto:support@clickhouse.com)いただくか、該当する場合はプラットフォーム統合のいずれか（[Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes)など）をご確認ください。

<Tabs groupId="logging">
<TabItem value="Winston" label="Winston" default>

ロガーとして`winston`を使用している場合は、以下のトランスポートをロガーに追加する必要があります。

```typescript
import winston from "winston"
import * as HyperDX from "@hyperdx/node-opentelemetry"

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    HyperDX.getWinstonTransport("info", {
      // infoレベル以上のログを送信
      detectResources: true
    })
  ]
})

export default logger
```

</TabItem>
<TabItem value="Pino" label="Pino">

ロガーとして`pino`を使用している場合は、以下のトランスポートをロガーに追加し、ログとトレースを関連付けるために`mixin`を指定する必要があります。

```typescript
import pino from "pino"
import * as HyperDX from "@hyperdx/node-opentelemetry"

const logger = pino(
  pino.transport({
    mixin: HyperDX.getPinoMixinFunction,
    targets: [
      HyperDX.getPinoTransport("info", {
        // infoレベル以上のログを送信
        detectResources: true
      })
    ]
  })
)

export default logger
```

</TabItem>

<TabItem value="console.log" label="console.log">
デフォルトでは、`console.*`メソッドが標準でサポートされています。追加の設定は必要ありません。

これを無効にするには、`HDX_NODE_CONSOLE_CAPTURE`環境変数を0に設定するか、`init`関数に`consoleCapture: false`を渡します。

</TabItem>
</Tabs>

### エラー収集の設定 {#setup-error-collection}

ClickStack SDKは、完全なスタックトレースとコードコンテキストを含む、アプリケーション内の未捕捉例外とエラーを自動的にキャプチャできます。

これを有効にするには、アプリケーションのエラーハンドリングミドルウェアの最後に以下のコードを追加するか、`recordException`関数を使用して手動で例外をキャプチャする必要があります。

<Tabs groupId="setup">
<TabItem value="Express" label="Express" default>

```javascript
const HyperDX = require("@hyperdx/node-opentelemetry")
HyperDX.init({
  apiKey: "YOUR_INGESTION_API_KEY",
  service: "my-service"
})
const app = express()

// ルートなどを追加

// すべてのルートの後、
// ただし他のエラーハンドリングミドルウェアが定義される前に追加
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

// ルートなどを追加

app.listen(3030)
```

</TabItem>
<TabItem value="Manual" label="Manual">

```javascript
const HyperDX = require("@hyperdx/node-opentelemetry")

function myErrorHandler(error, req, res, next) {
  // アプリケーション内のどこでも使用可能
  HyperDX.recordException(error)
}
```

</TabItem>
</Tabs>


## トラブルシューティング {#troubleshooting}

SDKで問題が発生した場合は、環境変数`OTEL_LOG_LEVEL`を`debug`に設定することで詳細ログを有効化できます。

```shell
export OTEL_LOG_LEVEL=debug
```


## 高度な計装設定 {#advanced-instrumentation-configuration}

### コンソールログのキャプチャ {#capture-console-logs}

デフォルトでは、ClickStack SDKはコンソールログをキャプチャします。環境変数`HDX_NODE_CONSOLE_CAPTURE`を0に設定することで無効化できます。

```sh copy
export HDX_NODE_CONSOLE_CAPTURE=0
```

### ユーザー情報またはメタデータの付加 {#attach-user-information-or-metadata}

特定の属性または識別子(例: ユーザーIDまたはメールアドレス)に関連するすべてのイベントに簡単にタグを付けるには、`setTraceAttributes`関数を呼び出します。この関数は、呼び出し後に現在のトレースに関連付けられたすべてのログ/スパンに宣言された属性でタグを付けます。この関数は、特定のリクエスト/トレース内でできるだけ早期に呼び出すことを推奨します(例: Expressミドルウェアスタックのできるだけ早い段階)。

これは、識別子を手動でタグ付けして伝播させる必要なく、すべてのログ/スパンが後で検索できる適切な識別子で自動的にタグ付けされることを保証する便利な方法です。

`userId`、`userEmail`、`userName`、および`teamName`は、セッションUIに対応する値を入力しますが、省略可能です。その他の追加値を指定して、イベントの検索に使用することもできます。

```typescript
import * as HyperDX from "@hyperdx/node-opentelemetry"

app.use((req, res, next) => {
  // リクエストからユーザー情報を取得...

  // 現在のトレースにユーザー情報を付加
  HyperDX.setTraceAttributes({
    userId,
    userEmail
  })

  next()
})
```

環境変数`HDX_NODE_BETA_MODE`を1に設定するか、`init`関数に`betaMode: true`を渡してベータモードを有効にし、トレース属性を有効化してください。

```shell
export HDX_NODE_BETA_MODE=1
```

### Google Cloud Run {#google-cloud-run}

Google Cloud Run上でアプリケーションを実行している場合、Cloud Traceは受信リクエストにサンプリングヘッダーを自動的に注入し、現在、各インスタンスで毎秒0.1リクエストのサンプリングレートにトレースを制限しています。

`@hyperdx/node-opentelemetry`パッケージは、デフォルトでサンプリングレートを1.0に上書きします。

この動作を変更する場合、または他のOpenTelemetryインストールを設定する場合は、環境変数`OTEL_TRACES_SAMPLER=parentbased_always_on`および`OTEL_TRACES_SAMPLER_ARG=1`を手動で設定することで、同じ結果を得ることができます。

詳細および特定のリクエストのトレースを強制する方法については、[Google Cloud Runドキュメント](https://cloud.google.com/run/docs/trace)を参照してください。

### 自動計装されるライブラリ {#auto-instrumented-libraries}

以下のライブラリは、SDKによって自動的に計装(トレース)されます:

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


## 代替インストール方法 {#alternative-installation}

### ClickStack OpenTelemetry CLIでアプリケーションを実行する {#run-the-application-with-cli}

または、`opentelemetry-instrument` CLIまたはNode.jsの`--require`フラグを使用することで、コード変更なしでアプリケーションを自動計装できます。CLIインストールでは、より広範囲の自動計装ライブラリとフレームワークが利用可能になります。

<Tabs groupId="cli">
<TabItem value="npx" label="NPXを使用" default>

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' npx opentelemetry-instrument index.js
```

</TabItem>
<TabItem value="custom" label="カスタムエントリーポイント（例：Nodemon、ts-nodeなど）">

```shell
HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' ts-node -r '@hyperdx/node-opentelemetry/build/src/tracing' index.js
```

</TabItem>

<TabItem value="code_import" label="コードインポート">

```javascript
// アプリケーションで最初に読み込まれるファイルの最上部でこれをインポートしてください
// APIキーは引き続き`HYPERDX_API_KEY`環境変数で指定します
import { initSDK } from "@hyperdx/node-opentelemetry"

initSDK({
  consoleCapture: true, // オプション、デフォルト：true
  additionalInstrumentations: [] // オプション、デフォルト：[]
})
```

</TabItem>

</Tabs>

_`OTEL_SERVICE_NAME`環境変数は、HyperDXアプリでサービスを識別するために使用されます。任意の名前を指定できます。_

### 例外キャプチャの有効化 {#enabling-exception-capturing}

未捕捉例外のキャプチャを有効にするには、`HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE`環境変数を1に設定する必要があります。

```shell
HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE=1
```

その後、ExpressやKoaからの例外を自動的にキャプチャする場合、または例外を手動でキャッチする場合は、上記の[エラー収集の設定](#setup-error-collection)セクションの手順に従ってください。

### 自動計装ライブラリ {#auto-instrumented-libraries-2}

上記のインストール方法により、以下のライブラリが自動的に計装（トレース）されます：


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
