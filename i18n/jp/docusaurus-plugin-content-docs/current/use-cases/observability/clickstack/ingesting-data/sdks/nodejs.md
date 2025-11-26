---
slug: /use-cases/observability/clickstack/sdks/nodejs
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'ClickStack 向け Node.js SDK - ClickHouse の Observability スタック'
title: 'Node.js'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'ロギング', '連携', 'アプリケーション監視']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack はテレメトリデータ（ログ、メトリクス、トレース、例外）を収集するために OpenTelemetry の標準仕様を使用します。トレースは自動インスツルメンテーションによって自動生成されるため、トレースを有効活用するために手動でインスツルメンテーションを行う必要はありません。

このガイドでは、以下を統合します:

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

SDKを初期化するには、アプリケーションのエントリーポイントの先頭で`init`関数を呼び出します。

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

これにより、Node.jsアプリケーションからトレース、メトリクス、ログが自動的に取得されます。

### ログ収集の設定 {#setup-log-collection}

デフォルトでは、`console.*`ログが収集されます。`winston`や`pino`などのロガーを使用している場合は、ClickStackにログを送信するためにロガーにトランスポートを追加する必要があります。別のタイプのロガーを使用している場合は、[お問い合わせ](mailto:support@clickhouse.com)いただくか、該当する場合は当社のプラットフォーム統合（[Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes)など）をご確認ください。

<Tabs groupId="logging">
<TabItem value="Winston" label="Winston" default>

ロガーとして`winston`を使用している場合は、以下のトランスポートをロガーに追加します。

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

ロガーとして`pino`を使用している場合は、以下のトランスポートをロガーに追加し、ログとトレースを相関付けるために`mixin`を指定します。

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
デフォルトでは、`console.*`メソッドが標準でサポートされています。追加の設定は不要です。

これを無効にするには、`HDX_NODE_CONSOLE_CAPTURE`環境変数を0に設定するか、`init`関数に`consoleCapture: false`を渡します。

</TabItem>
</Tabs>

### エラー収集の設定 {#setup-error-collection}

ClickStack SDKは、完全なスタックトレースとコードコンテキストを含む、アプリケーション内の未捕捉例外とエラーを自動的に取得できます。

これを有効にするには、アプリケーションのエラーハンドリングミドルウェアの最後に以下のコードを追加するか、`recordException`関数を使用して手動で例外を取得します。

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
<TabItem value="Manual" label="手動">

```javascript
const HyperDX = require("@hyperdx/node-opentelemetry")

function myErrorHandler(error, req, res, next) {
  // アプリケーション内の任意の場所で使用可能
  HyperDX.recordException(error)
}
```

</TabItem>
</Tabs>


## トラブルシューティング

SDK で問題が発生している場合は、`OTEL_LOG_LEVEL` 環境変数を `debug` に設定して詳細ログを有効にできます。

```shell
export OTEL_LOG_LEVEL=debug
```


## 高度なインストルメンテーション設定

### コンソールログの取得

デフォルトでは、ClickStack SDK はコンソールログを取得します。これを無効化するには、
環境変数 `HDX_NODE_CONSOLE_CAPTURE` を 0 に設定します。

```sh copy
export HDX_NODE_CONSOLE_CAPTURE=0
```

### ユーザー情報やメタデータを付与する

特定の属性や識別子（例: ユーザー ID やメールアドレス）に関連するすべてのイベントに簡単にタグ付けするには、`setTraceAttributes` 関数を呼び出します。この関数は、呼び出し後の現在のトレースに関連するすべての log/span に、指定した属性をタグとして付与します。この関数は、特定のリクエスト/トレース内で可能な限り早いタイミング（例: Express のミドルウェアスタック内でできるだけ早い位置）で呼び出すことが推奨されます。

これにより、後から検索するために適切な識別子でログやスパンが自動的にタグ付けされるようになり、自分で識別子を手動でタグ付けして伝搬させる必要がなくなります。

`userId`、`userEmail`、`userName`、`teamName` を指定すると、sessions UI に対応する値が表示されますが、必須ではありません。その他の任意の値も指定でき、イベントの検索に利用できます。

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

トレース属性を有効化するには、`HDX_NODE_BETA_MODE` 環境変数を 1 に設定するか、`init` 関数に `betaMode: true` を渡してベータモードを有効にしてください。

```shell
export HDX_NODE_BETA_MODE=1
```

### Google Cloud Run

アプリケーションを Google Cloud Run 上で実行している場合、Cloud Trace は
受信リクエストにサンプリングヘッダーを自動的に挿入し、現在は各インスタンスごとに
トレースのサンプリング頻度が 1 秒あたり 0.1 リクエストに制限されています。

`@hyperdx/node-opentelemetry` パッケージは、デフォルトでサンプリングレートを 1.0 に
上書きします。

この動作を変更したい場合や、他の OpenTelemetry 環境を設定したい場合は、
環境変数
`OTEL_TRACES_SAMPLER=parentbased_always_on` と `OTEL_TRACES_SAMPLER_ARG=1` を
手動で設定することで、同じ結果を得ることができます。

詳細や特定のリクエストのトレースを強制する方法については、
[Google Cloud Run のドキュメント](https://cloud.google.com/run/docs/trace) を参照してください。

### 自動インストルメンテーション対象のライブラリ

以下のライブラリは、SDK によって自動的にインストルメンテーション（トレース）が行われます。

* [`dns`](https://nodejs.org/dist/latest/docs/api/dns.html)
* [`express`](https://www.npmjs.com/package/express)
* [`graphql`](https://www.npmjs.com/package/graphql)
* [`hapi`](https://www.npmjs.com/package/@hapi/hapi)
* [`http`](https://nodejs.org/dist/latest/docs/api/http.html)
* [`ioredis`](https://www.npmjs.com/package/ioredis)
* [`knex`](https://www.npmjs.com/package/knex)
* [`koa`](https://www.npmjs.com/package/koa)
* [`mongodb`](https://www.npmjs.com/package/mongodb)
* [`mongoose`](https://www.npmjs.com/package/mongoose)
* [`mysql`](https://www.npmjs.com/package/mysql)
* [`mysql2`](https://www.npmjs.com/package/mysql2)
* [`net`](https://nodejs.org/dist/latest/docs/api/net.html)
* [`pg`](https://www.npmjs.com/package/pg)
* [`pino`](https://www.npmjs.com/package/pino)
* [`redis`](https://www.npmjs.com/package/redis)
* [`winston`](https://www.npmjs.com/package/winston)


## 代替インストール

### ClickStack OpenTelemetry CLI を使用してアプリケーションを実行する

別の方法として、`opentelemetry-instrument` CLI を利用するか、Node.js の `--require` フラグを利用することで、コードを変更せずにアプリケーションを自動計測できます。CLI を使ったインストールでは、より幅広い自動計測対応ライブラリやフレームワークを利用できます。

<Tabs groupId="cli">
  <TabItem value="npx" label="NPX を使用する" default>
    ```shell
    HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' npx opentelemetry-instrument index.js
    ```
  </TabItem>

  <TabItem value="custom" label="カスタムエントリーポイント（例: Nodemon, ts-node など）">
    ```shell
    HYPERDX_API_KEY='<YOUR_INGESTION_KEY>' OTEL_SERVICE_NAME='<YOUR_APP_NAME>' ts-node -r '@hyperdx/node-opentelemetry/build/src/tracing' index.js
    ```
  </TabItem>

  <TabItem value="code_import" label="コードインポート">
    ```javascript
    // アプリケーションで最初に読み込まれるファイルの先頭でインポートしてください
    // API キーは `HYPERDX_API_KEY` 環境変数で指定します
    import { initSDK } from '@hyperdx/node-opentelemetry';

    initSDK({
        consoleCapture: true, // 任意、デフォルト: true
        additionalInstrumentations: [], // 任意、デフォルト: []
    });
    ```
  </TabItem>
</Tabs>

*`OTEL_SERVICE_NAME` 環境変数は HyperDX アプリ内でサービスを識別するために使用されます。任意の名前を指定できます。*

### 例外キャプチャの有効化

未捕捉の例外のキャプチャを有効にするには、`HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE` 環境変数を 1 に設定する必要があります。

```shell
HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE=1
```

その後、Express や Koa からの例外を自動的に収集したり、例外を手動で捕捉したりするには、上記の [エラー収集のセットアップ](#setup-error-collection) セクションの手順に従ってください。

### 自動インストルメントされるライブラリ

次のライブラリは、上記のインストール方法によって自動的にインストルメント（トレース）されます。


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
