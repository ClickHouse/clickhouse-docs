---
'slug': '/use-cases/observability/clickstack/sdks/nextjs'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 4
'description': 'Next.js SDK 用于 ClickStack - ClickHouse 观察堆栈'
'title': 'Next.js'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 可以从你的 [Next.js 无服务器函数](https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry#manual-opentelemetry-configuration) 中摄取原生的 OpenTelemetry 跟踪，适用于 Next 13.2 及更高版本。

本指南集成了：

- **控制台日志**
- **跟踪**

:::note
如果你正在寻找会话重放/浏览器端监控，建议安装 [浏览器集成](/use-cases/observability/clickstack/sdks/browser)。
:::

## 安装 {#installing}

### 启用仪器化钩子（v15 及以下版本所需） {#enable-instrumentation-hook}

要开始，你需要在 `next.config.js` 中设置 `experimental.instrumentationHook = true;` 以启用 Next.js 的仪器化钩子。

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

### 创建仪器化文件 {#create-instrumentation-files}

在你的 Next.js 项目根目录下创建一个名为 `instrumentation.ts`（或 `.js`）的文件，并包含以下内容：

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

这将允许 Next.js 导入任何无服务器函数调用的 OpenTelemetry 仪器化。

### 配置环境变量 {#configure-environment-variables}

如果你直接将跟踪发送到 ClickStack，你需要以以下环境变量启动你的 Next.js 服务器，以指向 OTel 收集器：

```sh copy
HYPERDX_API_KEY=<YOUR_INGESTION_API_KEY> \
OTEL_SERVICE_NAME=<MY_SERVICE_NAME> \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
npm run dev
```

如果你在 Vercel 部署，请确保为你的部署配置上述所有环境变量。
