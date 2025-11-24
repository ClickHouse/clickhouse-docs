---
'slug': '/use-cases/observability/clickstack/sdks/nextjs'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 4
'description': 'Next.js SDK для ClickStack - ClickHouse 가시성 스택'
'title': 'Next.js'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'sdk'
- 'logging'
- 'integration'
- 'application monitoring'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack는 Next 13.2+에서 당신의 [Next.js 서버리스 함수](https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry#manual-opentelemetry-configuration)로부터 네이티브 OpenTelemetry 트레이스를 수집할 수 있습니다.

이 가이드는 다음을 통합합니다:

- **콘솔 로그**
- **트레이스**

:::note
세션 재생/브라우저 측 모니터링을 찾고 있다면, 대신 [브라우저 통합](/use-cases/observability/clickstack/sdks/browser)을 설치해야 합니다.
:::

## 설치 {#installing}

### 계측 훅 활성화 (v15 및 이하에 필요) {#enable-instrumentation-hook}

시작하려면, `next.config.js`에서 `experimental.instrumentationHook = true;`를 설정하여 Next.js 계측 훅을 활성화해야 합니다.

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

### ClickHouse OpenTelemetry SDK 설치 {#install-sdk}

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

### 계측 파일 생성 {#create-instrumentation-files}

다음 내용을 포함하는 `instrumentation.ts` (또는 `.js`)라는 파일을 Next.js 프로젝트 루트에 생성합니다:

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

이렇게 하면 Next.js가 서버리스 함수 호출에 대한 OpenTelemetry 계측을 가져올 수 있습니다.

### 환경 변수 구성 {#configure-environment-variables}

ClickStack으로 직접 트레이스를 전송하는 경우, OTel 수집기를 가리키도록 스팬을 지정하기 위해 다음 환경 변수를 사용하여 Next.js 서버를 시작해야 합니다:

```sh copy
HYPERDX_API_KEY=<YOUR_INGESTION_API_KEY> \
OTEL_SERVICE_NAME=<MY_SERVICE_NAME> \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
npm run dev
```

Vercel에 배포하는 경우, 위의 모든 환경 변수가 배포를 위해 구성되었는지 확인하십시오.
