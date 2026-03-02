---
slug: /use-cases/observability/clickstack/sdks/nextjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack용 Next.js SDK - ClickHouse 관측성 스택'
title: 'Next.js'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack은 Next.js 13.2+ 환경의
[Next.js serverless functions](https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry#manual-opentelemetry-configuration)
에서 생성되는 네이티브 OpenTelemetry traces를 수집할 수 있습니다.

이 가이드에서는 다음을 통합합니다:

* **콘솔 로그(Console Logs)**
* **트레이스(Traces)**

:::note
세션 리플레이나 브라우저 측 모니터링이 필요한 경우에는, 대신 [Browser integration](/use-cases/observability/clickstack/sdks/browser)을 설치하십시오.
:::


## 설치 \{#installing\}

### 계측 훅 활성화하기 (v15 이하에서 필수) \{#enable-instrumentation-hook\}

먼저 `next.config.js`에서 `experimental.instrumentationHook = true;`를 설정하여 Next.js 계측 훅을 활성화해야 합니다.

**예시:**

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


### ClickHouse OpenTelemetry SDK 설치 \{#install-sdk\}

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

### 계측 파일 생성 \{#create-instrumentation-files\}

다음 내용을 포함하는 `instrumentation.ts`(또는 `.js`) 파일을 Next.js 프로젝트 루트 디렉터리에 생성합니다.

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

이렇게 하면 Next.js가 서버리스 FUNCTION이 호출될 때마다 OpenTelemetry 계측을 import할 수 있게 됩니다.


### 환경 변수 구성 \{#configure-environment-variables\}

OpenTelemetry를 통해 트레이스를 ClickStack으로 직접 전송하는 경우, span이 OTel collector로 전송되도록
다음 환경 변수를 지정하여 Next.js 서버를 시작해야 합니다:

<Tabs groupId="service-type">
<TabItem value="clickstack-managed" label="관리형 ClickStack" default>

```sh copy
OTEL_SERVICE_NAME=<MY_SERVICE_NAME> \
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-otel-collector:4318
npm run dev
```

</TabItem>

<TabItem value="clickstack-oss" label="ClickStack 오픈 소스" >

```sh copy
HYPERDX_API_KEY=<YOUR_INGESTION_API_KEY> \
OTEL_SERVICE_NAME=<MY_SERVICE_NAME> \
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-otel-collector:4318
npm run dev
```
</TabItem>
</Tabs>

Vercel에 배포하는 경우, 위에 나열된 모든 환경 변수가 해당 배포에 대해 올바르게 구성되어 있는지 확인하십시오.