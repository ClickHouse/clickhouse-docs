---
slug: /use-cases/observability/clickstack/sdks/deno
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'Deno SDK для ClickStack — ClickHouse Observability Stack'
title: 'Deno'
doc_type: 'guide'
keywords: ['Deno ClickStack SDK', 'Deno OpenTelemetry', 'ClickStack Deno integration', 'Deno observability', 'Deno logging SDK']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

В этом руководстве рассматривается интеграция следующих компонентов:

* **Логи**

:::note
В настоящее время поддерживается только логирование OpenTelemetry. О поддержке трассировки [см. следующее руководство](https://dev.to/grunet/leveraging-opentelemetry-in-deno-45bj#a-minimal-interesting-example).
:::


## Логирование \{#logging\}

Логирование осуществляется посредством экспорта пользовательского логгера для модуля `std/log`.

**Пример использования:**

```typescript
import * as log from 'https://deno.land/std@0.203.0/log/mod.ts';
import { OpenTelemetryHandler } from 'npm:@hyperdx/deno';

log.setup({
  handlers: {
    otel: new OpenTelemetryHandler('DEBUG'),
  },

  loggers: {
    'my-otel-logger': {
      level: 'DEBUG',
      handlers: ['otel'],
    },
  },
});

log.getLogger('my-otel-logger').info('Hello from Deno!');
```

### Запустите приложение \{#run-the-application\}

<Tabs groupId="service-type">
<TabItem value="clickstack-managed" label="Управляемый ClickStack" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-otel-collector:4318 \
OTEL_SERVICE_NAME="<NAME_OF_YOUR_APP_OR_SERVICE>" \
deno run --allow-net --allow-env --allow-read --allow-sys --allow-run app.ts
```

</TabItem>

<TabItem value="clickstack-oss" label="ClickStack с открытым исходным кодом" >

```shell
OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>" \
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-otel-collector:4318 \
OTEL_SERVICE_NAME="<NAME_OF_YOUR_APP_OR_SERVICE>" \
deno run --allow-net --allow-env --allow-read --allow-sys --allow-run app.ts
```

</TabItem>
</Tabs>