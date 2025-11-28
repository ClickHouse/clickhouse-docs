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


## はじめに {#getting-started}

### HyperDX OpenTelemetry インストルメンテーションパッケージのインストール {#install-hyperdx-opentelemetry-instrumentation-package}

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

### SDK の初期化 {#initializin-the-sdk}

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

### ログ収集のセットアップ {#setup-log-collection}

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
        HyperDX.getWinstonTransport('info', { // info 以上のログを送信
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
        HyperDX.getPinoTransport('info', { // info 以上のログを送信
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

### エラー収集のセットアップ {#setup-error-collection}

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

// ここにルートなどを追加します

// すべてのルートを追加した後、
// 他のエラー処理ミドルウェアが定義される前にこれを追加します
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

// ここにルートなどを追加します

app.listen(3030);
```

</TabItem>
<TabItem value="Manual" label="Manual">

```javascript
const HyperDX = require('@hyperdx/node-opentelemetry');

function myErrorHandler(error, req, res, next) {
    // アプリケーション内のどこからでも使用できます
    HyperDX.recordException(error);
}
```

</TabItem>
</Tabs>

## トラブルシューティング

SDK で問題が発生している場合は、`OTEL_LOG_LEVEL` 環境変数を `debug` に設定することで詳細なログ出力を有効化できます。

```shell
export OTEL_LOG_LEVEL=debug
```


## 高度な計装設定 {#advanced-instrumentation-configuration}

### コンソールログのキャプチャ

デフォルトでは、ClickStack SDK はコンソールログをキャプチャします。これを無効にするには、
`HDX_NODE_CONSOLE_CAPTURE` 環境変数を 0 に設定してください。

```sh copy
export HDX_NODE_CONSOLE_CAPTURE=0
```


### ユーザー情報やメタデータを付与する

特定の属性や識別子（例: ユーザー ID やメールアドレス）に関連するすべてのイベントに簡単にタグ付けするには、`setTraceAttributes` 関数を呼び出します。この関数は、呼び出し以降の現在のトレースに関連するすべてのログやスパンに、指定した属性をタグとして付与します。この関数は、特定のリクエスト/トレース内で可能な限り早いタイミング（例: Express のミドルウェアスタックの先頭付近）で呼び出すことを推奨します。

これにより、識別子を自分で手動でタグ付けおよび伝播させる必要がなくなり、後から検索するために必要な識別子が、すべてのログやスパンに自動的にタグ付けされるようになります。

`userId`、`userEmail`、`userName`、`teamName` は、対応する値を Sessions UI に表示するために利用されますが、必須ではありません。その他の任意の追加値も指定可能であり、イベント検索に利用できます。

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

トレース属性を有効にするには、`HDX_NODE_BETA_MODE` 環境変数を 1 に設定するか、`init` 関数に `betaMode: true` を渡してベータモードを有効にしてください。

```shell
export HDX_NODE_BETA_MODE=1
```


### Google Cloud Run {#google-cloud-run}

アプリケーションを Google Cloud Run 上で実行している場合、Cloud Trace は
受信リクエストに対して自動的にサンプリングヘッダーを付与し、
各インスタンスごとに 1 秒あたり 0.1 リクエストのみが
トレースとしてサンプリングされるように制限します。

`@hyperdx/node-opentelemetry` パッケージは、デフォルトでサンプルレートを
1.0 に上書きします。

この挙動を変更したい場合、あるいは他の OpenTelemetry のインストール環境を
構成したい場合は、環境変数
`OTEL_TRACES_SAMPLER=parentbased_always_on` と `OTEL_TRACES_SAMPLER_ARG=1`
を手動で設定することで、同じ結果を得ることができます。

詳細や特定のリクエストに対してトレースを強制する方法については、
[Google Cloud Run ドキュメント](https://cloud.google.com/run/docs/trace) を参照してください。

### 自動インストルメント対象ライブラリ {#auto-instrumented-libraries}

次のライブラリは、SDK によって自動的にインストルメント（トレース）されます。

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

## 別のインストール方法 {#alternative-installation}

### ClickStack OpenTelemetry CLI を使用してアプリケーションを実行する {#run-the-application-with-cli}

別の方法として、`opentelemetry-instrument` CLI を使用するか、Node.js の `--require` フラグを利用することで、コードを変更せずにアプリケーションを自動インストルメンテーションできます。CLI を使用すると、自動インストルメンテーションに対応した、より幅広いライブラリやフレームワークを利用できます。

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

_`OTEL_SERVICE_NAME` 環境変数は HyperDX アプリ内でサービスを識別するために使用されます。任意の名前を指定できます。_

### 例外キャプチャの有効化

未処理の例外キャプチャを有効にするには、環境変数 `HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE` を 1 に設定してください。

```shell
HDX_NODE_EXPERIMENTAL_EXCEPTION_CAPTURE=1
```

その後、Express や Koa で発生した例外を自動的に収集したり、例外を手動で捕捉したりするには、上記の [Setup Error Collection](#setup-error-collection) セクションの手順に従ってください。


### 自動インストルメントされるライブラリ {#auto-instrumented-libraries-2}

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