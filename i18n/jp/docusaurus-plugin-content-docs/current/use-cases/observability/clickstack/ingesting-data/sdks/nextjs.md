---
'slug': '/use-cases/observability/clickstack/sdks/nextjs'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 4
'description': 'Next.js SDK for ClickStack - ClickHouse 見える化スタック'
'title': 'Next.js'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStackは、Next 13.2以上の[Next.jsサーバーレス関数](https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry#manual-opentelemetry-configuration)からネイティブなOpenTelemetryトレースを取り込むことができます。

このガイドには以下が統合されています：

- **コンソールログ**
- **トレース**

:::note
セッションリプレイやブラウザ側の監視を探している場合は、[ブラウザ統合](/use-cases/observability/clickstack/sdks/browser)をインストールしてください。
:::

## インストール {#installing}

### 計測フックの有効化（v15以下に必要） {#enable-instrumentation-hook}

まず、`next.config.js`内で`experimental.instrumentationHook = true;`を設定して、Next.jsの計測フックを有効にする必要があります。

**例：**

```javascript
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  // Ignore otel pkgs warnings 
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

### 計測ファイルの作成 {#create-instrumentation-files}

Next.jsプロジェクトのルートに`instrumentation.ts`（または`.js`）というファイルを以下の内容で作成します：

```javascript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init } = await import('@hyperdx/node-opentelemetry');
    init({
      apiKey: '<YOUR_INGESTION_API_KEY>', // optionally configure via `HYPERDX_API_KEY` env var
      service: '<MY_SERVICE_NAME>', // optionally configure via `OTEL_SERVICE_NAME` env var
      additionalInstrumentations: [], // optional, default: []
    });
  }
}
```

これにより、Next.jsはサーバーレス関数の呼び出しに対してOpenTelemetryの計測をインポートできるようになります。

### 環境変数の設定 {#configure-environment-variables}

もしトレースを直接ClickStackに送信する場合は、スパンをOTelコレクタに指し示すために、次の環境変数を設定してNext.jsサーバーを起動する必要があります：

```sh copy
HYPERDX_API_KEY=<YOUR_INGESTION_API_KEY> \
OTEL_SERVICE_NAME=<MY_SERVICE_NAME> \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
npm run dev
```

Vercelにデプロイしている場合は、上記のすべての環境変数がデプロイに対して設定されていることを確認してください。
