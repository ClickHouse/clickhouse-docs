---
'slug': '/use-cases/observability/clickstack/sdks/deno'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 6
'description': 'Deno SDK for ClickStack - ClickHouse 가시성 스택'
'title': 'Deno'
'doc_type': 'guide'
'keywords':
- 'Deno ClickStack SDK'
- 'Deno OpenTelemetry'
- 'ClickStack Deno integration'
- 'Deno observability'
- 'Deno logging SDK'
---

이 가이드는 다음을 통합합니다:

- **로그**

:::note
현재 OpenTelemetry 로깅만 지원합니다. 트레이싱 지원에 대해서는 [다음 가이드를 참조하세요](https://dev.to/grunet/leveraging-opentelemetry-in-deno-45bj#a-minimal-interesting-example).
:::

## 로깅 {#logging}

로깅은 `std/log` 모듈의 사용자 지정 로거를 내보내는 방식으로 지원됩니다.

**사용 예:**

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

### 애플리케이션 실행 {#run-the-application}

```shell
OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>" \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 \
OTEL_SERVICE_NAME="<NAME_OF_YOUR_APP_OR_SERVICE>" \
deno run --allow-net --allow-env --allow-read --allow-sys --allow-run app.ts
```
