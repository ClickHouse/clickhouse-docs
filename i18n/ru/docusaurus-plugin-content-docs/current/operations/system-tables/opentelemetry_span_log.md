---
description: 'Системная таблица, содержащая информацию о спанах трассировки для выполненных запросов.'
keywords: ['system table', 'opentelemetry_span_log']
slug: /operations/system-tables/opentelemetry_span_log
title: 'system.opentelemetry_span_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.opentelemetry&#95;span&#95;log

<SystemTableCloud />

Содержит информацию о [trace spans](https://opentracing.io/docs/overview/spans/) для выполненных запросов.

Столбцы:

* `trace_id` ([UUID](../../sql-reference/data-types/uuid.md)) — Идентификатор трассы выполненного запроса.
* `span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Идентификатор `trace span`.
* `parent_span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Идентификатор родительского `trace span`.
* `operation_name` ([String](../../sql-reference/data-types/string.md)) — Имя операции.
* `kind` ([Enum8](../../sql-reference/data-types/enum.md)) — [SpanKind](https://opentelemetry.io/docs/reference/specification/trace/api/#spankind) спана.
  * `INTERNAL` — Указывает, что спан представляет внутреннюю операцию в приложении.
  * `SERVER` — Указывает, что спан охватывает обработку на стороне сервера синхронного RPC или другого удалённого запроса.
  * `CLIENT` — Указывает, что спан описывает запрос к некоторому удалённому сервису.
  * `PRODUCER` — Указывает, что спан описывает инициаторов асинхронного запроса. Этот родительский спан часто заканчивается раньше соответствующего дочернего спана CONSUMER, возможно, ещё до начала дочернего спана.
  * `CONSUMER` — Указывает, что спан описывает дочерний спан асинхронного запроса PRODUCER.
* `start_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Время начала `trace span` (в микросекундах).
* `finish_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — Время окончания `trace span` (в микросекундах).
* `finish_date` ([Date](../../sql-reference/data-types/date.md)) — Дата окончания `trace span`.
* `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Имена [Attribute](https://opentelemetry.io/docs/go/instrumentation/#attributes) для данного `trace span`. Они заполняются в соответствии с рекомендациями стандарта [OpenTelemetry](https://opentelemetry.io/).
* `attribute.values` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — Значения атрибутов для данного `trace span`. Они заполняются в соответствии с рекомендациями стандарта `OpenTelemetry`.

**Пример**

Запрос:

```sql
SELECT * FROM system.opentelemetry_span_log LIMIT 1 FORMAT Vertical;
```

Результат:

```text
Строка 1:
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

* [OpenTelemetry](../../operations/opentelemetry.md)
