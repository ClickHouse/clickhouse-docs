---
'slug': '/use-cases/observability/clickstack/sdks/deno'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 6
'description': 'Deno SDK 用于 ClickStack - ClickHouse 观察性堆栈'
'title': 'Deno'
'doc_type': 'guide'
---

本指南整合了以下内容：

- **日志**

:::note
当前仅支持 OpenTelemetry 日志记录。如需支持跟踪，请[查看以下指南](https://dev.to/grunet/leveraging-opentelemetry-in-deno-45bj#a-minimal-interesting-example)。
:::

## 日志 {#logging}

通过为 `std/log` 模块导出自定义日志记录器来支持日志记录。

**示例用法：**

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

### 运行应用程序 {#run-the-application}

```shell
OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>" \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_SERVICE_NAME="<NAME_OF_YOUR_APP_OR_SERVICE>" \
deno run --allow-net --allow-env --allow-read --allow-sys --allow-run app.ts
```
