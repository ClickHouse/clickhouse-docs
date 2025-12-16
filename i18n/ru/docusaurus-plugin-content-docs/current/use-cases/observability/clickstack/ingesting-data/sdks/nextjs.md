---
slug: /use-cases/observability/clickstack/sdks/nextjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'SDK Next.js для ClickStack — стек наблюдаемости ClickHouse'
title: 'Next.js'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'логирование', 'интеграция', 'мониторинг приложений']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack может выполнять приём трасс OpenTelemetry в нативном формате из ваших
[бессерверных функций Next.js](https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry#manual-opentelemetry-configuration)
в Next 13.2+.

В этом руководстве интегрируются:

* **Логи консоли**
* **Трейсы**

:::note
Если вам нужна запись пользовательских сессий и мониторинг на стороне браузера, вместо этого установите [интеграцию для браузера](/use-cases/observability/clickstack/sdks/browser).
:::

## Установка {#installing}

### Включите хук инструментирования (требуется для версий v15 и ниже) {#enable-instrumentation-hook}

Для начала необходимо включить хук инструментирования Next.js, установив `experimental.instrumentationHook = true;` в вашем `next.config.js`.

**Пример:**

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

### Установите SDK OpenTelemetry для ClickHouse {#install-sdk}

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

### Создайте файл инструментирования {#create-instrumentation-files}

Создайте файл с именем `instrumentation.ts` (или `.js`) в корне вашего проекта Next.js со следующим содержимым:

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

Это позволит Next.js импортировать инструментацию OpenTelemetry при любом вызове бессерверной функции.

### Настройка переменных окружения {#configure-environment-variables}

Если вы отправляете трассировки напрямую в ClickStack, вам потребуется запустить сервер Next.js
со следующими переменными окружения, чтобы направлять спаны на OTel collector:

```sh copy
HYPERDX_API_KEY=<YOUR_INGESTION_API_KEY> \
OTEL_SERVICE_NAME=<MY_SERVICE_NAME> \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
npm run dev
```

Если вы разворачиваете приложение на Vercel, убедитесь, что все перечисленные выше переменные окружения настроены
для этого развертывания.
