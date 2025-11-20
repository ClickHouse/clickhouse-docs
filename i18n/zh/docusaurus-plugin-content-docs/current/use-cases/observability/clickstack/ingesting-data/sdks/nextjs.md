---
slug: /use-cases/observability/clickstack/sdks/nextjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: '面向 ClickStack 的 Next.js SDK - ClickHouse 可观测性技术栈'
title: 'Next.js'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 可以从 Next 13.2+ 的
[Next.js 无服务器函数](https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry#manual-opentelemetry-configuration)
中摄取原生 OpenTelemetry 追踪数据。

本指南涵盖集成：

* **控制台日志（Console Logs）**
* **追踪（Traces）**

:::note
如果你需要会话回放 / 浏览器端监控，请改为安装 [浏览器集成（Browser integration）](/use-cases/observability/clickstack/sdks/browser)。
:::


## 安装 {#installing}

### 启用 instrumentation hook(v15 及以下版本必需){#enable-instrumentation-hook}

首先,您需要在 `next.config.js` 中设置 `experimental.instrumentationHook = true;` 来启用 Next.js instrumentation hook。

**示例:**

```javascript
const nextConfig = {
  experimental: {
    instrumentationHook: true
  },
  // 忽略 otel 包警告
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

### 安装 ClickHouse OpenTelemetry SDK {#install-sdk}

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

### 创建 instrumentation 文件 {#create-instrumentation-files}

在 Next.js 项目根目录中创建一个名为 `instrumentation.ts`(或 `.js`)的文件,内容如下:

```javascript
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { init } = await import("@hyperdx/node-opentelemetry")
    init({
      apiKey: "<YOUR_INGESTION_API_KEY>", // 可选,可通过 `HYPERDX_API_KEY` 环境变量配置
      service: "<MY_SERVICE_NAME>", // 可选,可通过 `OTEL_SERVICE_NAME` 环境变量配置
      additionalInstrumentations: [] // 可选,默认值:[]
    })
  }
}
```

这将允许 Next.js 为任何无服务器函数调用导入 OpenTelemetry instrumentation。

### 配置环境变量 {#configure-environment-variables}

如果您要将追踪数据直接发送到 ClickStack,则需要使用以下环境变量启动 Next.js 服务器,以将 span 指向 OTel collector:

```sh copy
HYPERDX_API_KEY=<YOUR_INGESTION_API_KEY> \
OTEL_SERVICE_NAME=<MY_SERVICE_NAME> \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
npm run dev
```

如果您在 Vercel 上部署,请确保为您的部署配置了上述所有环境变量。
