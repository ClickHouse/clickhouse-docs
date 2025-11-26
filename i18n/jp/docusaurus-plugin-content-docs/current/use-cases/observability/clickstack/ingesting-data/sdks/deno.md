---
slug: /use-cases/observability/clickstack/sdks/deno
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'ClickStack 用 Deno SDK - ClickHouse オブザーバビリティスタック'
title: 'Deno'
doc_type: 'guide'
keywords: ['Deno ClickStack SDK', 'Deno OpenTelemetry', 'ClickStack Deno 連携', 'Deno オブザーバビリティ', 'Deno ログ記録 SDK']
---

このガイドでは、次の機能を統合します。

- **Logs**

:::note
現在は OpenTelemetry のログ機能のみをサポートしています。トレーシングのサポートについては、[次のガイドを参照してください](https://dev.to/grunet/leveraging-opentelemetry-in-deno-45bj#a-minimal-interesting-example)。
:::



## ロギング

`std/log` モジュール向けにカスタムロガーをエクスポートすることで、ロギングをサポートします。

**使用例:**

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

log.getLogger('my-otel-logger').info('Denoからこんにちは！');
```

### アプリケーションを実行する

```shell
OTEL_EXPORTER_OTLP_HEADERS="authorization=<インジェストAPIキー>" \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_SERVICE_NAME="<アプリまたはサービスの名前>" \
deno run --allow-net --allow-env --allow-read --allow-sys --allow-run app.ts
```
