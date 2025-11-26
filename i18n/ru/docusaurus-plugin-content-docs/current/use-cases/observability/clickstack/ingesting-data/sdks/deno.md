---
slug: /use-cases/observability/clickstack/sdks/deno
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'Deno SDK для ClickStack — стек наблюдаемости ClickHouse'
title: 'Deno'
doc_type: 'guide'
keywords: ['Deno ClickStack SDK', 'Deno OpenTelemetry', 'интеграция ClickStack с Deno', 'наблюдаемость в Deno', 'SDK логирования для Deno']
---

В этом руководстве рассматривается интеграция следующих компонентов:

- **Логи**

:::note
Сейчас поддерживается только логирование через OpenTelemetry. Для поддержки трассировки см. [следующее руководство](https://dev.to/grunet/leveraging-opentelemetry-in-deno-45bj#a-minimal-interesting-example).
:::



## Логирование

Логирование поддерживается экспортом пользовательского логгера для модуля `std/log`.

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

log.getLogger('my-otel-logger').info('Привет из Deno!');
```

### Запуск приложения

```shell
OTEL_EXPORTER_OTLP_HEADERS="authorization=<ВАШ_КЛЮЧ_API_ПРИЁМА>" \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_SERVICE_NAME="<НАЗВАНИЕ_ВАШЕГО_ПРИЛОЖЕНИЯ_ИЛИ_СЕРВИСА>" \
deno run --allow-net --allow-env --allow-read --allow-sys --allow-run app.ts
```
