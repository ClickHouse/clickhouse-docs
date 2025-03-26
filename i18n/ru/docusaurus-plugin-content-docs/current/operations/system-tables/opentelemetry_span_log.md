---
description: 'Системная таблица, содержащая информацию о временных интервалах трассировки для выполненных запросов.'
keywords: ['системная таблица', 'opentelemetry_span_log']
slug: /operations/system-tables/opentelemetry_span_log
title: 'system.opentelemetry_span_log'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.opentelemetry_span_log

<SystemTableCloud/>

Содержит информацию о [временных интервалах трассировки](https://opentracing.io/docs/overview/spans/) для выполненных запросов.

Столбцы:

- `trace_id` ([UUID](../../sql-reference/data-types/uuid.md)) — ID трассировки для выполненного запроса.
- `span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ID `временного интервала трассировки`.
- `parent_span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ID родительского `временного интервала трассировки`.
- `operation_name` ([String](../../sql-reference/data-types/string.md)) — Название операции.
- `kind` ([Enum8](../../sql-reference/data-types/enum.md)) — [SpanKind](https://opentelemetry.io/docs/reference/specification/trace/api/#spankind) временного интервала.
    - `INTERNAL` — Указывает, что интервал представляет собой внутреннюю операцию внутри приложения.
    - `SERVER` — Указывает, что интервал охватывает серверную обработку синхронного RPC или другого удалённого запроса.
    - `CLIENT` — Указывает, что интервал описывает запрос к какому-либо удалённому сервису.
    - `PRODUCER` — Указывает, что интервал описывает инициаторов асинхронного запроса. Этот родительский интервал часто завершится раньше соответствующего дочернего интервала CONSUMER, возможно, даже до того, как дочерний интервал начнётся.
    - `CONSUMER` - Указывает, что интервал описывает потомка асинхронного запроса PRODUCER.
- `start_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Время начала `временного интервала трассировки` (в микросекундах).
- `finish_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Время завершения `временного интервала трассировки` (в микросекундах).
- `finish_date` ([Date](../../sql-reference/data-types/date.md)) — Дата завершения `временного интервала трассировки`.
- `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Имена [атрибутов](https://opentelemetry.io/docs/go/instrumentation/#attributes) в зависимости от `временного интервала трассировки`. Они заполняются в соответствии с рекомендациями стандарта [OpenTelemetry](https://opentelemetry.io/).
- `attribute.values` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Значения атрибутов в зависимости от `временного интервала трассировки`. Они заполняются в соответствии с рекомендациями стандарта `OpenTelemetry`.

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

**Смотрите также**

- [OpenTelemetry](../../operations/opentelemetry.md)
