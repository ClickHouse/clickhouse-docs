---
slug: /use-cases/observability/clickstack/sdks/nextjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'Next.js SDK for ClickStack - The ClickHouse Observability Stack'
title: 'Next.js'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack can ingest native OpenTelemetry traces from your
[Next.js serverless functions](https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry#manual-opentelemetry-configuration)
in Next 13.2+.

This Guide Integrates:

- **Console Logs**
- **Traces**

:::note
If you're looking for session replay/browser-side monitoring, you'll want to install the [Browser integration](/use-cases/observability/clickstack/sdks/browser) instead.
:::

## Installing {#installing}

### Enable instrumentation hook (required for v15 and below) {#enable-instrumentation-hook}

To get started, you'll need to enable the Next.js instrumentation hook by setting `experimental.instrumentationHook = true;` in your `next.config.js`.

**Example:**

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

### Install ClickHouse OpenTelemetry SDK {#install-sdk}

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

### Create instrumentation files {#create-instrumentation-files}

Create a file called `instrumentation.ts` (or `.js`) in your Next.js project root with the following contents:

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

This will allow Next.js to import the OpenTelemetry instrumentation for any serverless function invocation.

### Configure environment variables {#configure-environment-variables}

If you're sending traces directly to ClickStack, you'll need to start your Next.js
server with the following environment variables to point spans towards the OTel collector:

```sh copy
HYPERDX_API_KEY=<YOUR_INGESTION_API_KEY> \
OTEL_SERVICE_NAME=<MY_SERVICE_NAME> \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
npm run dev
```

If you're deploying in Vercel, ensure that all the environment variables above are configured
for your deployment.
