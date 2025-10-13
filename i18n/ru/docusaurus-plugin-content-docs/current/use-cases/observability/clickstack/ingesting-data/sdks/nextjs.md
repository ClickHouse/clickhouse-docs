---
'slug': '/use-cases/observability/clickstack/sdks/nextjs'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 4
'description': 'Next.js SDK для ClickStack - Стек мониторинга ClickHouse'
'title': 'Next.js'
'doc_type': 'guide'
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack может принимать нативные трассировки OpenTelemetry от ваших
[безсерверных функций Next.js](https://nextjs.org/docs/pages/building-your-application/optimizing/open-telemetry#manual-opentelemetry-configuration)
в Next 13.2+.

Этот Гид интегрирует:

- **Логи консоли**
- **Трассировки**

:::note
Если вы ищете воспроизведение сессий/мониторинг со стороны браузера, вам следует установить [интеграцию браузера](/use-cases/observability/clickstack/sdks/browser).
:::

## Установка {#installing}

### Включите хук инструментирования (требуется для v15 и ниже) {#enable-instrumentation-hook}

Для начала вам нужно включить хук инструментирования Next.js, установив `experimental.instrumentationHook = true;` в вашем `next.config.js`.

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

### Установите ClickHouse OpenTelemetry SDK {#install-sdk}

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

### Создайте файлы инструментирования {#create-instrumentation-files}

Создайте файл под названием `instrumentation.ts` (или `.js`) в корне вашего проекта Next.js с следующим содержимым:

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

Это позволит Next.js импортировать инструментирование OpenTelemetry для любого вызова безсерверной функции.

### Настройте переменные окружения {#configure-environment-variables}

Если вы отправляете трассировки непосредственно в ClickStack, вам нужно запустить ваш сервер Next.js с следующими переменными окружения, чтобы указать на OTel коллектор:

```sh copy
HYPERDX_API_KEY=<YOUR_INGESTION_API_KEY> \
OTEL_SERVICE_NAME=<MY_SERVICE_NAME> \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
npm run dev
```

Если вы развертываете в Vercel, убедитесь, что все переменные окружения выше настроены для вашего развертывания.