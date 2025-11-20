---
slug: /use-cases/observability/clickstack/sdks/nextjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack 向け Next.js SDK - ClickHouse オブザーバビリティ・スタック'
title: 'Next.js'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack は、Next 13.2 以降の
[Next.js serverless functions](https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry#manual-opentelemetry-configuration)
からネイティブな OpenTelemetry トレースを取り込むことができます。

このガイドでは次のものを統合します:

* **コンソールログ**
* **トレース**

:::note
セッションリプレイやブラウザ側のモニタリングを行いたい場合は、代わりに [Browser integration](/use-cases/observability/clickstack/sdks/browser) をインストールしてください。
:::


## インストール {#installing}

### インストルメンテーションフックの有効化（v15以下で必須） {#enable-instrumentation-hook}

開始するには、`next.config.js`で`experimental.instrumentationHook = true;`を設定し、Next.jsインストルメンテーションフックを有効にする必要があります。

**例:**

```javascript
const nextConfig = {
  experimental: {
    instrumentationHook: true
  },
  // otelパッケージの警告を無視
  // https://github.com/open-telemetry/opentelemetry-js/issues/4173#issuecomment-1822938936
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    if (isServer) {
      config.ignoreWarnings = [{ module: /opentelemetry/ }]
    }
    return config
  }
}

module.exports = nextConfig
```

### ClickHouse OpenTelemetry SDKのインストール {#install-sdk}

<Tabs groupId="npm">
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

### インストルメンテーションファイルの作成 {#create-instrumentation-files}

Next.jsプロジェクトのルートディレクトリに`instrumentation.ts`（または`.js`）という名前のファイルを作成し、以下の内容を記述します:

```javascript
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { init } = await import("@hyperdx/node-opentelemetry")
    init({
      apiKey: "<YOUR_INGESTION_API_KEY>", // オプション: `HYPERDX_API_KEY`環境変数で設定可能
      service: "<MY_SERVICE_NAME>", // オプション: `OTEL_SERVICE_NAME`環境変数で設定可能
      additionalInstrumentations: [] // オプション、デフォルト: []
    })
  }
}
```

これにより、Next.jsはサーバーレス関数の呼び出しごとにOpenTelemetryインストルメンテーションをインポートできるようになります。

### 環境変数の設定 {#configure-environment-variables}

トレースをClickStackに直接送信する場合は、スパンをOTelコレクターに向けるために、以下の環境変数を設定してNext.jsサーバーを起動する必要があります:

```sh copy
HYPERDX_API_KEY=<YOUR_INGESTION_API_KEY> \
OTEL_SERVICE_NAME=<MY_SERVICE_NAME> \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
npm run dev
```

Vercelにデプロイする場合は、上記のすべての環境変数がデプロイメント用に設定されていることを確認してください。
