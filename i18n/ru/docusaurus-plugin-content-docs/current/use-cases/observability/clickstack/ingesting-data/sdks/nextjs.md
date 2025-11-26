---
slug: /use-cases/observability/clickstack/sdks/nextjs
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'SDK Next.js для ClickStack — стека наблюдаемости ClickHouse'
title: 'Next.js'
doc_type: 'руководство'
keywords: ['clickstack', 'sdk', 'логирование', 'интеграция', 'мониторинг приложений']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack может осуществлять приём нативных трасс OpenTelemetry из ваших
[серверлесс‑функций Next.js](https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry#manual-opentelemetry-configuration)
в Next 13.2+.

Это руководство охватывает интеграцию:

* **Консольных логов**
* **Трассировок**

:::note
Если вам нужно воспроизведение сессий и мониторинг в браузере, вместо этого установите [интеграцию для браузера](/use-cases/observability/clickstack/sdks/browser).
:::


## Установка

### Включение хука инструментирования (обязательно для v15 и ниже)

Для начала включите хук инструментирования Next.js, установив `experimental.instrumentationHook = true;` в файле `next.config.js`.

**Пример:**

```javascript
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  // Игнорировать предупреждения пакетов OTel 
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

### Установите ClickHouse OpenTelemetry SDK

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

### Создайте файлы инструментирования

Создайте файл `instrumentation.ts` (или `.js`) в корневом каталоге проекта Next.js со следующим содержимым:

```javascript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init } = await import('@hyperdx/node-opentelemetry');
    init({
      apiKey: '<YOUR_INGESTION_API_KEY>', // опционально: настраивается через переменную окружения `HYPERDX_API_KEY`
      service: '<MY_SERVICE_NAME>', // опционально: настраивается через переменную окружения `OTEL_SERVICE_NAME`
      additionalInstrumentations: [], // опционально; по умолчанию: []
    });
  }
}
```

Это позволит Next.js импортировать инструментирование OpenTelemetry для любого вызова серверлесс‑функции.

### Настройка переменных окружения

Если вы отправляете трейсы напрямую в ClickStack, вам потребуется запустить сервер Next.js
со следующими переменными окружения, чтобы направить спаны в OTel collector:

```sh copy
HYPERDX_API_KEY=<YOUR_INGESTION_API_KEY> \
OTEL_SERVICE_NAME=<MY_SERVICE_NAME> \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
npm run dev
```

Если вы развёртываете приложение на Vercel, убедитесь, что все перечисленные выше переменные окружения заданы для этого развёртывания.
