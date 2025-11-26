---
slug: /use-cases/observability/clickstack/sdks/nextjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack 向け Next.js SDK - ClickHouse のオブザーバビリティスタック'
title: 'Next.js'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'ロギング', '統合', 'アプリケーション監視']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack は、Next 13.2+ の
[Next.js serverless functions](https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry#manual-opentelemetry-configuration)
からネイティブな OpenTelemetry トレースを取り込むことができます。

このガイドで扱うのは次のデータです:

* **コンソールログ**
* **トレース**

:::note
セッションリプレイやブラウザー側のモニタリングを行いたい場合は、代わりに [Browser integration](/use-cases/observability/clickstack/sdks/browser) をインストールしてください。
:::


## インストール {#installing}

### インストルメンテーションフックを有効化する（v15 以前では必須）

セットアップを始めるには、`next.config.js` 内で `experimental.instrumentationHook = true;` を設定し、Next.js のインストルメンテーションフックを有効化する必要があります。

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


### ClickHouse OpenTelemetry SDK のインストール {#install-sdk}

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

### インストルメンテーションファイルの作成

Next.js プロジェクトのルートに `instrumentation.ts`（または `.js`）という名前のファイルを作成し、次の内容を記述します。

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

これにより、Next.js はあらゆるサーバーレス関数の呼び出しに対して OpenTelemetry のインストルメンテーションをインポートできるようになります。


### 環境変数を設定する

トレースを直接 ClickStack に送信する場合は、スパンの送信先を OTel collector に指定するため、Next.js サーバーを起動するときに以下の環境変数を指定する必要があります。

```sh copy
HYPERDX_API_KEY=<YOUR_INGESTION_API_KEY> \
OTEL_SERVICE_NAME=<MY_SERVICE_NAME> \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
npm run dev
```

Vercel にデプロイする場合は、上記のすべての環境変数が対象のデプロイメントで設定されていることを確認してください。
