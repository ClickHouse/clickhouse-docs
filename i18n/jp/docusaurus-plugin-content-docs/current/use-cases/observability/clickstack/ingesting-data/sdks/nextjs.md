---
slug: /use-cases/observability/clickstack/sdks/nextjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'Next.js SDK for ClickStack - ClickHouse オブザーバビリティ スタック'
title: 'Next.js'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'ログ収集', '連携', 'アプリケーション監視']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack は、Next.js 13.2 以降の
[Next.js serverless functions](https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry#manual-opentelemetry-configuration)
からネイティブな OpenTelemetry トレースを取り込むことができます。

このガイドで統合する内容は次のとおりです。

* **コンソールログ**
* **トレース**

:::note
セッションリプレイやブラウザ側でのモニタリングを行いたい場合は、代わりに [Browser integration](/use-cases/observability/clickstack/sdks/browser) をインストールしてください。
:::


## インストール

### インストルメンテーションフックを有効化する（v15 以前では必須）

まず、`next.config.js` 内で `experimental.instrumentationHook = true;` を設定して、Next.js のインストルメンテーションフックを有効化する必要があります。

**例:**

```javascript
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  // OTelパッケージの警告を無視する 
  // https://github.com/open-telemetry/opentelemetry-js/issues/4173#issuecomment-1822938936
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack },
  ) => {
    if (isServer) {
      config.ignoreWarnings = [{ module: /opentelemetry/ }];
    }
    return config;
  },
};

module.exports = nextConfig;
```

### ClickHouse OpenTelemetry SDK をインストールする

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

### インストルメンテーションファイルを作成する

以下の内容を記述した `instrumentation.ts`（または `.js`）ファイルを、Next.js プロジェクトのルートに作成します。

```javascript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init } = await import('@hyperdx/node-opentelemetry');
    init({
      apiKey: '<YOUR_INGESTION_API_KEY>', // `HYPERDX_API_KEY` 環境変数で設定することも可能
      service: '<MY_SERVICE_NAME>', // `OTEL_SERVICE_NAME` 環境変数で設定することも可能
      additionalInstrumentations: [], // 省略可能、デフォルト: []
    });
  }
}
```

これにより、Next.js はすべてのサーバーレス関数の呼び出しに対して、OpenTelemetry のインストルメンテーションをインポートできるようになります。

### 環境変数を設定する

トレースを直接 ClickStack に送信する場合、スパンの送信先として OTel collector を指定するために、次の環境変数を設定して Next.js サーバーを起動する必要があります。

```sh copy
HYPERDX_API_KEY=<YOUR_INGESTION_API_KEY> \
OTEL_SERVICE_NAME=<MY_SERVICE_NAME> \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
npm run dev
```

Vercel にデプロイする場合は、そのデプロイメントで上記のすべての環境変数が設定されていることを確認してください。
