---
slug: /use-cases/observability/clickstack/sdks/deno
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'ClickStack용 Deno SDK - ClickHouse 관측성 스택'
title: 'Deno'
doc_type: 'guide'
keywords: ['Deno ClickStack SDK', 'Deno OpenTelemetry', 'ClickStack Deno 통합', 'Deno 관측성', 'Deno 로깅 SDK']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

이 가이드는 다음을 포함합니다:

* **로그(Logs)**

:::note
현재는 OpenTelemetry Logging만 지원합니다. 트레이싱을 사용하려면 [다음 가이드를 참고하십시오](https://dev.to/grunet/leveraging-opentelemetry-in-deno-45bj#a-minimal-interesting-example).
:::


## 로깅 \{#logging\}

`std/log` 모듈에서 사용할 커스텀 로거를 내보내면 로깅을 사용할 수 있습니다.

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


### 애플리케이션 실행 \{#run-the-application\}

<Tabs groupId="service-type">
<TabItem value="clickstack-managed" label="관리형 ClickStack" default>

```shell
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-otel-collector:4318 \
OTEL_SERVICE_NAME="<NAME_OF_YOUR_APP_OR_SERVICE>" \
deno run --allow-net --allow-env --allow-read --allow-sys --allow-run app.ts
```

</TabItem>

<TabItem value="clickstack-oss" label="오픈 소스 ClickStack" >

```shell
OTEL_EXPORTER_OTLP_HEADERS="authorization=<YOUR_INGESTION_API_KEY>" \
OTEL_EXPORTER_OTLP_ENDPOINT=http://your-otel-collector:4318 \
OTEL_SERVICE_NAME="<NAME_OF_YOUR_APP_OR_SERVICE>" \
deno run --allow-net --allow-env --allow-read --allow-sys --allow-run app.ts
```

</TabItem>
</Tabs>