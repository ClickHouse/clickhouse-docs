---
'description': '系统表包含关于已执行查询的跟踪跨度的信息。'
'keywords':
- 'system table'
- 'opentelemetry_span_log'
'slug': '/operations/system-tables/opentelemetry_span_log'
'title': 'system.opentelemetry_span_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.opentelemetry_span_log

<SystemTableCloud/>

包含关于已执行查询的 [trace spans](https://opentracing.io/docs/overview/spans/) 的信息。

列：

- `trace_id` ([UUID](../../sql-reference/data-types/uuid.md)) — 已执行查询的 trace 的 ID。
- `span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span` 的 ID。
- `parent_span_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 父 `trace span` 的 ID。
- `operation_name` ([String](../../sql-reference/data-types/string.md)) — 操作的名称。
- `kind` ([Enum8](../../sql-reference/data-types/enum.md)) — span 的 [SpanKind](https://opentelemetry.io/docs/reference/specification/trace/api/#spankind)。
  - `INTERNAL` — 表示 span 代表应用程序内部的操作。
  - `SERVER` — 表示 span 涉及同步 RPC 或其他远程请求的服务器端处理。
  - `CLIENT` — 表示 span 描述对某个远程服务的请求。
  - `PRODUCER` — 表示 span 描述异步请求的发起者。该父 span 通常会在相应的子 CONSUMER span 之前结束，甚至可能在子 span 开始之前结束。
  - `CONSUMER` — 表示 span 描述异步 PRODUCER 请求的子项。
- `start_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span` 的开始时间（以微秒为单位）。
- `finish_time_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — `trace span` 的结束时间（以微秒为单位）。
- `finish_date` ([Date](../../sql-reference/data-types/date.md)) — `trace span` 的结束日期。
- `attribute.names` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 依赖于 `trace span` 的 [Attribute](https://opentelemetry.io/docs/go/instrumentation/#attributes) 名称。它们根据 [OpenTelemetry](https://opentelemetry.io/) 标准中的建议进行填充。
- `attribute.values` ([Array](../../sql-reference/data-types/array.md)([String](../../sql-reference/data-types/string.md))) — 依赖于 `trace span` 的属性值。它们根据 `OpenTelemetry` 标准中的建议进行填充。

**示例**

查询：

```sql
SELECT * FROM system.opentelemetry_span_log LIMIT 1 FORMAT Vertical;
```

结果：

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

**另见**

- [OpenTelemetry](../../operations/opentelemetry.md)
