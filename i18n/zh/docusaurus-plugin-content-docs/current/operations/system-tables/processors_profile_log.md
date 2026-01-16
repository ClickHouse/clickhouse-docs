---
description: '包含处理器级别性能分析信息的系统表（可在 `EXPLAIN PIPELINE` 中查看）'
keywords: ['系统表', 'processors_profile_log', 'EXPLAIN PIPELINE']
slug: /operations/system-tables/processors_profile_log
title: 'system.processors_profile_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.processors&#95;profile&#95;log \\{#systemprocessors&#95;profile&#95;log\\}

<SystemTableCloud />

此表包含处理器级别的性能分析信息（可以在 [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline) 中查看）。

Columns:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器主机名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件发生的日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件发生的日期和时间。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 事件发生的日期和时间（精确到微秒）。
* `id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 处理器 ID。
* `parent_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 父处理器 ID 列表。
* `plan_step` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 创建此处理器的查询计划步骤 ID。如果处理器不是由任何步骤添加，则该值为零。
* `plan_group` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 如果由查询计划步骤创建，则为处理器所属的分组。分组是对由同一查询计划步骤添加的处理器进行逻辑划分。分组仅用于美化 EXPLAIN PIPELINE 结果的展示。
* `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 初始查询的 ID（用于分布式查询执行）。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 查询 ID。
* `name` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — 处理器名称。
* `elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 此处理器执行所用的微秒数。
* `input_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 此处理器等待数据（来自其他处理器）所用的微秒数。
* `output_wait_elapsed_us` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 此处理器因输出端口已满而等待所用的微秒数。
* `input_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 处理器消耗的行数。
* `input_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 处理器消耗的字节数。
* `output_rows` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 处理器生成的行数。
* `output_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 处理器生成的字节数。

**Example**

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

这里可以看到：

* `ExpressionTransform` 在执行 `sleep(1)` 函数，因此它的 `work` 将耗时约 1e6 微秒，所以 `elapsed_us` &gt; 1e6。
* `SourceFromSingleChunk` 需要等待，因为 `ExpressionTransform` 在执行 `sleep(1)` 期间不接受任何数据，所以它将处于 `PortFull` 状态约 1e6 微秒，因此 `output_wait_elapsed_us` &gt; 1e6。
* `LimitsCheckingTransform`/`NullSource`/`LazyOutputFormat` 需要等到 `ExpressionTransform` 执行完 `sleep(1)` 后才能处理结果，因此 `input_wait_elapsed_us` &gt; 1e6。

**另请参阅**

* [`EXPLAIN PIPELINE`](../../sql-reference/statements/explain.md#explain-pipeline)
