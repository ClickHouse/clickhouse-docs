---
description: '在处理器级别包含性能分析信息的系统表（可在 `EXPLAIN PIPELINE` 中查看）'
keywords: ['系统表', 'processors_profile_log', 'EXPLAIN PIPELINE']
slug: /operations/system-tables/processors_profile_log
title: 'system.processors_profile_log'
doc_type: '参考'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.processors&#95;profile&#95;log

<SystemTableCloud />

该表包含处理器级别的性能分析信息（可在 [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline) 中查看这些处理器）。

Columns:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器主机名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件发生的日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件发生的日期和时间。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 事件发生的日期和时间（精确到微秒）。
* `id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 处理器 ID。
* `parent_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 父处理器的 ID。
* `plan_step` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 创建此处理器的查询计划步骤 ID。如果该处理器不是由任何步骤添加的，则该值为零。
* `plan_group` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 若处理器由某个查询计划步骤创建，则为该处理器所属的分组。分组是对来自同一查询计划步骤添加的处理器进行的逻辑划分。该分组仅用于美化 EXPLAIN PIPELINE 的结果。
* `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 初始查询的 ID（用于分布式查询执行）。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 查询 ID。
* `name` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — 处理器名称。
* `elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 该处理器实际执行所消耗的时间（微秒数）。
* `input_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 该处理器为等待输入数据（来自其他处理器）所消耗的时间（微秒数）。
* `output_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 该处理器因输出端口已满而等待所消耗的时间（微秒数）。
* `input_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 处理器消费的行数。
* `input_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 处理器消费的字节数。
* `output_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 处理器产生的行数。
* `output_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 处理器产生的字节数。
  **示例**

Query:

```sql
EXPLAIN PIPELINE
SELECT sleep(1)
┌─explain─────────────────────────┐
│ (Expression)                    │
│ ExpressionTransform             │
│   (SettingQuotaAndLimits)       │
│     (ReadFromStorage)           │
│     SourceFromSingleChunk 0 → 1 │
└─────────────────────────────────┘

SELECT sleep(1)
SETTINGS log_processors_profiles = 1
Query id: feb5ed16-1c24-4227-aa54-78c02b3b27d4
┌─sleep(1)─┐
│        0 │
└──────────┘
1 rows in set. Elapsed: 1.018 sec.

SELECT
    name,
    elapsed_us,
    input_wait_elapsed_us,
    output_wait_elapsed_us
FROM system.processors_profile_log
WHERE query_id = 'feb5ed16-1c24-4227-aa54-78c02b3b27d4'
ORDER BY name ASC
```

结果：


```text
┌─name────────────────────┬─elapsed_us─┬─input_wait_elapsed_us─┬─output_wait_elapsed_us─┐
│ ExpressionTransform     │    1000497 │                  2823 │                    197 │
│ LazyOutputFormat        │         36 │               1002188 │                      0 │
│ LimitsCheckingTransform │         10 │               1002994 │                    106 │
│ NullSource              │          5 │               1002074 │                      0 │
│ NullSource              │          1 │               1002084 │                      0 │
│ SourceFromSingleChunk   │         45 │                  4736 │                1000819 │
└─────────────────────────┴────────────┴───────────────────────┴────────────────────────┘
```

在这里可以看到：

* `ExpressionTransform` 正在执行 `sleep(1)` 函数，因此它的 `work` 将耗时 1e6 微秒，故 `elapsed_us` &gt; 1e6。
* `SourceFromSingleChunk` 需要等待，因为 `ExpressionTransform` 在执行 `sleep(1)` 期间不会接收任何数据，因此它将处于 `PortFull` 状态 1e6 微秒，故 `output_wait_elapsed_us` &gt; 1e6。
* `LimitsCheckingTransform`/`NullSource`/`LazyOutputFormat` 需要等待 `ExpressionTransform` 执行完 `sleep(1)` 后才能处理结果，因此 `input_wait_elapsed_us` &gt; 1e6。

**另请参阅**

* [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)
