---
slug: /use-cases/observability/clickstack/sdks/nextjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: '适用于 ClickStack 的 Next.js SDK - ClickHouse 可观测性栈'
title: 'Next.js'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 可以从 Next.js 13.2 及以上版本的
[Next.js serverless functions](https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry#manual-opentelemetry-configuration)
中摄取原生 OpenTelemetry 跟踪（traces）。

本指南将集成：

* **控制台日志（Console Logs）**
* **跟踪（Traces）**

:::note
如果你在寻找会话回放或浏览器端监控，请改为安装 [Browser integration](/use-cases/observability/clickstack/sdks/browser)。
:::

## 安装 \{#installing\}

### 启用 instrumentation hook（v15 及以下版本必需） \{#enable-instrumentation-hook\}

首先，您需要在 `next.config.js` 中将 `experimental.instrumentationHook` 设置为 `true`，以启用 Next.js instrumentation hook。

**示例：**

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

### 安装 ClickHouse OpenTelemetry SDK \{#install-sdk\}

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

### 创建 Instrumentation 文件 \{#create-instrumentation-files\}

在 Next.js 项目的根目录下创建一个名为 `instrumentation.ts`（或 `.js`）的文件，并写入以下内容：

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

这将使 Next.js 能在调用任何 Serverless 函数时导入 OpenTelemetry 插桩。

### 配置环境变量 \{#configure-environment-variables\}

如果您通过 OpenTelemetry 直接向 ClickStack 发送 trace，需要使用以下环境变量启动 Next.js
服务器，以便将 span 发送到 OTel collector：

<Tabs groupId="service-type">
<TabItem value="clickstack-managed" label="托管版 ClickStack" default>

```sh copy
OTEL_SERVICE_NAME=<MY_SERVICE_NAME> \
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-otel-collector:4318
npm run dev
```

</TabItem>

<TabItem value="clickstack-oss" label="ClickStack 开源版" >

```sh copy
HYPERDX_API_KEY=<YOUR_INGESTION_API_KEY> \
OTEL_SERVICE_NAME=<MY_SERVICE_NAME> \
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-otel-collector:4318
npm run dev
```
</TabItem>
</Tabs>

如果您在 Vercel 上进行部署，请确保上述所有环境变量都已为您的部署完成配置。