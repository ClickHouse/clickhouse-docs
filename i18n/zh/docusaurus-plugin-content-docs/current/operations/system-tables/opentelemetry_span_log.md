---
description: '包含已执行查询的跟踪 span 信息的系统表。'
keywords: ['系统表', 'opentelemetry_span_log']
slug: /operations/system-tables/opentelemetry_span_log
title: 'system.opentelemetry_span_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.opentelemetry&#95;span&#95;log

<SystemTableCloud />

包含已执行查询的 [trace span](https://opentracing.io/docs/overview/spans/) 相关信息。

列：

* `trace_id` ([UUID](../../sql-reference/data-types/uuid.md)) — 已执行查询所属 trace 的 ID。
* `span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span` 的 ID。
* `parent_span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 父 `trace span` 的 ID。
* `operation_name` ([String](../../sql-reference/data-types/string.md)) — 操作名称。
* `kind` ([Enum8](../../sql-reference/data-types/enum.md)) — span 的 [SpanKind](https://opentelemetry.io/docs/reference/specification/trace/api/#spankind)。
  * `INTERNAL` — 表示该 span 代表应用程序内部操作。
  * `SERVER` — 表示该 span 覆盖同步 RPC 或其他远程请求的服务端处理。
  * `CLIENT` — 表示该 span 描述发往某个远程服务的请求。
  * `PRODUCER` — 表示该 span 描述异步请求的发起方。该父 span 通常会在对应的子 CONSUMER span 之前结束，甚至可能早于子 span 开始。
  * `CONSUMER` — 表示该 span 描述异步 PRODUCER 请求的子 span。
* `start_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span` 的开始时间（微秒）。
* `finish_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span` 的结束时间（微秒）。
* `finish_date` ([Date](../../sql-reference/data-types/date.md)) — `trace span` 的结束日期。
* `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 与 `trace span` 对应的[属性（Attribute）](https://opentelemetry.io/docs/go/instrumentation/#attributes)名称。根据 [OpenTelemetry](https://opentelemetry.io/) 标准中的建议进行填充。
* `attribute.values` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 与 `trace span` 对应的属性值。根据 `OpenTelemetry` 标准中的建议进行填充。

**示例**

查询：

```sql
SELECT * FROM system.opentelemetry_span_log LIMIT 1 FORMAT Vertical;
```

结果：

```text
第 1 行：
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

**另请参阅**

* [OpenTelemetry](../../operations/opentelemetry.md)
