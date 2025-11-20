---
slug: /use-cases/observability/clickstack/sdks/deno
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'ClickStack 向け Deno SDK - ClickHouse Observability スタック'
title: 'Deno'
doc_type: 'guide'
keywords: ['Deno ClickStack SDK', 'Deno OpenTelemetry', 'ClickStack Deno integration', 'Deno observability', 'Deno logging SDK']
---

このガイドでは、次の機能を扱います。

- **ログ**

:::note
現在は OpenTelemetry Logging のみをサポートしています。トレーシングのサポートについては、[こちらのガイドを参照してください](https://dev.to/grunet/leveraging-opentelemetry-in-deno-45bj#a-minimal-interesting-example)。
:::



## ロギング {#logging}

`std/log`モジュール用のカスタムロガーをエクスポートすることで、ロギングがサポートされます。

**使用例:**

```typescript
import * as log from "https://deno.land/std@0.203.0/log/mod.ts"
import { OpenTelemetryHandler } from "npm:@hyperdx/deno"

log.setup({
  handlers: {
    otel: new OpenTelemetryHandler("DEBUG")
  },

  loggers: {
    "my-otel-logger": {
      level: "DEBUG",
      handlers: ["otel"]
    }
  }
})

log.getLogger("my-otel-logger").info("Hello from Deno!")
```

### アプリケーションの実行 {#run-the-application}

```shell
OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>" \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_SERVICE_NAME="<NAME_OF_YOUR_APP_OR_SERVICE>" \
deno run --allow-net --allow-env --allow-read --allow-sys --allow-run app.ts
```
