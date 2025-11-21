---
slug: /use-cases/observability/clickstack/sdks/deno
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: '适用于 ClickStack 的 Deno SDK - ClickHouse 可观测性技术栈'
title: 'Deno'
doc_type: 'guide'
keywords: ['Deno ClickStack SDK', 'Deno OpenTelemetry', 'ClickStack Deno 集成', 'Deno 可观测性', 'Deno 日志 SDK']
---

本指南集成了以下功能：

- **日志**

:::note
当前仅支持 OpenTelemetry 日志功能。若需跟踪（tracing）支持，[请参阅以下指南](https://dev.to/grunet/leveraging-opentelemetry-in-deno-45bj#a-minimal-interesting-example)。
:::



## 日志记录 {#logging}

通过为 `std/log` 模块导出自定义日志记录器来支持日志记录功能。

**使用示例：**

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

### 运行应用程序 {#run-the-application}

```shell
OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>" \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_SERVICE_NAME="<NAME_OF_YOUR_APP_OR_SERVICE>" \
deno run --allow-net --allow-env --allow-read --allow-sys --allow-run app.ts
```
