---
description: 'Системная таблица, содержащая информацию о следах (trace spans) для выполненных запросов.'
keywords: ['системная таблица', 'opentelemetry_span_log']
slug: /operations/system-tables/opentelemetry_span_log
title: 'system.opentelemetry_span_log'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.opentelemetry_span_log

<SystemTableCloud/>

Содержит информацию о [следах (trace spans)](https://opentracing.io/docs/overview/spans/) для выполненных запросов.

Колонки:

- `trace_id` ([UUID](../../sql-reference/data-types/uuid.md)) — Идентификатор следа для выполненного запроса.
- `span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Идентификатор `trace span`.
- `parent_span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Идентификатор родительского `trace span`.
- `operation_name` ([String](../../sql-reference/data-types/string.md)) — Название операции.
- `kind` ([Enum8](../../sql-reference/data-types/enum.md)) — [SpanKind](https://opentelemetry.io/docs/reference/specification/trace/api/#spankind) следа.
    - `INTERNAL` — Указывает, что след представляет собой внутреннюю операцию в приложении.
    - `SERVER` — Указывает, что след охватывает обработку на стороне сервера синхронного RPC или другого удаленного запроса.
    - `CLIENT` — Указывает, что след описывает запрос к какому-либо удаленному сервису.
    - `PRODUCER` — Указывает, что след описывает инициаторов асинхронного запроса. Этот родительский след часто заканчивается до того, как соответствующий дочерний CONSUMER след завершится, возможно, даже до начала дочернего следа.
    - `CONSUMER` - Указывает, что след описывает ребенка асинхронного запроса PRODUCER.
- `start_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Время начала `trace span` (в микросекундах).
- `finish_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Время завершения `trace span` (в микросекундах).
- `finish_date` ([Date](../../sql-reference/data-types/date.md)) — Дата завершения `trace span`.
- `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Имена [атрибутов](https://opentelemetry.io/docs/go/instrumentation/#attributes) в зависимости от `trace span`. Заполняются в соответствии с рекомендациями стандарта [OpenTelemetry](https://opentelemetry.io/).
- `attribute.values` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Значения атрибутов в зависимости от `trace span`. Заполняются в соответствии с рекомендациями стандарта `OpenTelemetry`.

**Пример**

Запрос:

```sql
SELECT * FROM system.opentelemetry_span_log LIMIT 1 FORMAT Vertical;
```

Результат:

```text
Row 1:
──────
trace_id:         cdab0847-0d62-61d5-4d38-dd65b19a1914
span_id:          701487461015578150
parent_span_id:   2991972114672045096
operation_name:   DB::Block DB::InterpreterSelectQuery::getSampleBlockImpl()
kind:             INTERNAL
start_time_us:    1612374594529090
finish_time_us:   1612374594529108
finish_date:      2021-02-03
attribute.names:  []
attribute.values: []
```

**См. также**

- [OpenTelemetry](../../operations/opentelemetry.md)
