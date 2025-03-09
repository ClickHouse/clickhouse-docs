---
slug: /engines/table-engines/special/time_series
sidebar_position: 60
sidebar_label: 时间序列
title: "时间序列引擎"
description: "一个存储时间序列的表引擎，即与时间戳和标签（或标记）相关联的一组值。"
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 时间序列引擎

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

一个存储时间序列的表引擎，即与时间戳和标签（或标记）相关联的一组值：

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
这是一个实验性功能，未来版本中可能会以不向后兼容的方式进行更改。
使用 [allow_experimental_time_series_table](/operations/settings/settings#allow_experimental_time_series_table) 设置启用时间序列表引擎。
输入命令 `set allow_experimental_time_series_table = 1`。
:::

## 语法 {#syntax}

```sql
CREATE TABLE name [(columns)] ENGINE=TimeSeries
[SETTINGS var1=value1, ...]
[DATA db.data_table_name | DATA ENGINE data_table_engine(arguments)]
[TAGS db.tags_table_name | TAGS ENGINE tags_table_engine(arguments)]
[METRICS db.metrics_table_name | METRICS ENGINE metrics_table_engine(arguments)]
```

## 用法 {#usage}

默认设置下开始会更容易（可以创建一个不指定列列表的 `TimeSeries` 表）：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

然后这个表可以通过以下协议使用（必须在服务器配置中分配一个端口）：
- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)

## 目标表 {#target-tables}

`TimeSeries` 表没有自己的数据，所有数据都存储在其目标表中。
这与 [物化视图](../../../sql-reference/statements/create/view#materialized-view) 的工作方式类似，
不同之处在于物化视图只有一个目标表，
而 `TimeSeries` 表有三个目标表，分别命名为 [data](#data-table)、[tags](#tags-table) 和 [metrics](#metrics-table)。

目标表既可以在 `CREATE TABLE` 查询中显式指定，
也可以让 `TimeSeries` 表引擎自动生成内部目标表。

目标表如下：

### 数据表 {#data-table}

_数据_ 表包含与某个标识符相关的时间序列。

_数据_ 表必须包含以下列：

| 名称 | 必需？ | 默认类型 | 可能类型 | 描述 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | 任意 | 标识一组度量名称和标签的组合 |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | 时间点 |
| `value` | [x] | `Float64` | `Float32` 或 `Float64` | 与 `timestamp` 相关联的值 |


### 标签表 {#tags-table}

_标签_ 表包含为每个度量名称和标签组合计算出的标识符。

_标签_ 表必须包含以下列：

| 名称 | 必需？ | 默认类型 | 可能类型 | 描述 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | 任何（必须与 [data](#data-table) 表中的 `id` 类型匹配） | 一个 `id` 标识度量名称和标签的组合。DEFAULT 表达式指定如何计算该标识符 |
| `metric_name` | [x] | `LowCardinality(String)` | `String` 或 `LowCardinality(String)` | 一个度量的名称 |
| `<tag_value_column>` | [ ] | `String` | `String` 或 `LowCardinality(String)` 或 `LowCardinality(Nullable(String))` | 特定标签的值，标签的名称和相应列的名称在 [tags_to_columns](#settings) 设置中指定 |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` 或 `Map(LowCardinality(String), String)` 或 `Map(LowCardinality(String), LowCardinality(String))` | 标签的映射，排除标签 `__name__`，包含度量名称，并排除在 [tags_to_columns](#settings) 设置中列举的标签 |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` 或 `Map(LowCardinality(String), String)` 或 `Map(LowCardinality(String), LowCardinality(String))` | 瞬态列，每一行是所有标签的映射，仅排除标签 `__name__`，包含度量名称。该列的唯一目的是在计算 `id` 时使用 |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` 或 `Nullable(DateTime64(X))` | 具有该 `id` 的时间序列的最小时间戳。若 [store_min_time_and_max_time](#settings) 为 `true`，则会创建该列 |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` 或 `Nullable(DateTime64(X))` | 具有该 `id` 的时间序列的最大时间戳。若 [store_min_time_and_max_time](#settings) 为 `true`，则会创建该列 |

### 度量表 {#metrics-table}

_度量_ 表包含有关收集的度量、这些度量的类型及其描述的一些信息。

_度量_ 表必须包含以下列：

| 名称 | 必需？ | 默认类型 | 可能类型 | 描述 |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` 或 `LowCardinality(String)` | 度量系列的名称 |
| `type` | [x] | `String` | `String` 或 `LowCardinality(String)` | 度量系列的类型，可以是 "counter"、"gauge"、"summary"、"stateset"、"histogram"、"gaugehistogram" 之一 |
| `unit` | [x] | `String` | `String` 或 `LowCardinality(String)` | 度量中使用的单位 |
| `help` | [x] | `String` | `String` 或 `LowCardinality(String)` | 度量的描述 |

插入到 `TimeSeries` 表中的任何行实际上将存储在这三个目标表中。
`TimeSeries` 表包含来自 [data](#data-table)、[tags](#tags-table)、[metrics](#metrics-table) 表的所有这些列。

## 创建 {#creation}

可以通过多种方法创建使用 `TimeSeries` 表引擎的表。
最简单的语句

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

实际上会创建如下表（您可以通过执行 `SHOW CREATE TABLE my_table` 查看）：

```sql
CREATE TABLE my_table
(
    `id` UUID DEFAULT reinterpretAsUUID(sipHash128(metric_name, all_tags)),
    `timestamp` DateTime64(3),
    `value` Float64,
    `metric_name` LowCardinality(String),
    `tags` Map(LowCardinality(String), String),
    `all_tags` Map(String, String),
    `min_time` Nullable(DateTime64(3)),
    `max_time` Nullable(DateTime64(3)),
    `metric_family_name` String,
    `type` String,
    `unit` String,
    `help` String
)
ENGINE = TimeSeries
DATA ENGINE = MergeTree ORDER BY (id, timestamp)
DATA INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
TAGS ENGINE = AggregatingMergeTree PRIMARY KEY metric_name ORDER BY (metric_name, id)
TAGS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
METRICS ENGINE = ReplacingMergeTree ORDER BY metric_family_name
METRICS INNER UUID '01234567-89ab-cdef-0123-456789abcdef'
```

因此列是自动生成的，并且该语句中还有三个内部 UUID -
每个内部目标表一个 UUID。
（内部 UUID 通常不会显示，直到设置
[show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil)
被设置。）

内部目标表的名称类似于 `.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、`.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`，
每个目标表的列是主 `TimeSeries` 表列的一个子集：

```sql
CREATE TABLE default.`.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
(
    `id` UUID,
    `timestamp` DateTime64(3),
    `value` Float64
)
ENGINE = MergeTree
ORDER BY (id, timestamp)
```

```sql
CREATE TABLE default.`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
(
    `id` UUID DEFAULT reinterpretAsUUID(sipHash128(metric_name, all_tags)),
    `metric_name` LowCardinality(String),
    `tags` Map(LowCardinality(String), String),
    `all_tags` Map(String, String) EPHEMERAL,
    `min_time` SimpleAggregateFunction(min, Nullable(DateTime64(3))),
    `max_time` SimpleAggregateFunction(max, Nullable(DateTime64(3)))
)
ENGINE = AggregatingMergeTree
PRIMARY KEY metric_name
ORDER BY (metric_name, id)
```

```sql
CREATE TABLE default.`.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
(
    `metric_family_name` String,
    `type` String,
    `unit` String,
    `help` String
)
ENGINE = ReplacingMergeTree
ORDER BY metric_family_name
```

## 调整列的类型 {#adjusting-column-types}

您可以通过在定义主表时显式指定几乎任何内部目标表的列类型来调整它们的类型。例如，

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

将使内部 [data](#data-table) 表以微秒存储时间戳，而不是毫秒：

```sql
CREATE TABLE default.`.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
(
    `id` UUID,
    `timestamp` DateTime64(6),
    `value` Float64
)
ENGINE = MergeTree
ORDER BY (id, timestamp)
```

## `id` 列 {#id-column}

`id` 列包含标识符，每个标识符是为度量名称和标签组合计算得出的。
`id` 列的 DEFAULT 表达式是用于计算这些标识符的表达式。
您可以通过显式指定它们来调整 `id` 列的类型和该表达式：

```sql
CREATE TABLE my_table
(
    id UInt64 DEFAULT sipHash64(metric_name, all_tags)
) ENGINE=TimeSeries
```

## `tags` 和 `all_tags` 列 {#tags-and-all-tags}

有两个包含标签映射的列 - `tags` 和 `all_tags`。在此示例中，它们的意思是相同的，然而如果使用设置 `tags_to_columns`，它们可能会不同。该设置允许指定特定标签应该存储在单独的列中，而不是存储在 `tags` 列中的映射内：

```sql
CREATE TABLE my_table ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

该语句将添加列
```sql
    `instance` String,
    `job` String
```
到 `my_table` 和其内部 [tags](#tags-table) 目标表的定义中。这种情况下 `tags` 列将不包含标签 `instance` 和 `job`，
但 `all_tags` 列将包含它们。`all_tags` 列是瞬态的，其唯一目的用于 `id` 列的 DEFAULT 表达式。

可以通过显式指定它们来调整列的类型：

```sql
CREATE TABLE my_table (instance LowCardinality(String), job LowCardinality(Nullable(String)))
ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

## 内部目标表的表引擎 {#inner-table-engines}

默认情况下，内部目标表使用以下表引擎：
- [data](#data-table) 表使用 [MergeTree](../mergetree-family/mergetree)；
- [tags](#tags-table) 表使用 [AggregatingMergeTree](../mergetree-family/aggregatingmergetree)，因为该表通常多次插入相同的数据，因此我们需要一种去除重复项的方法，同时也因为需要对 `min_time` 和 `max_time` 列进行聚合；
- [metrics](#metrics-table) 表使用 [ReplacingMergeTree](../mergetree-family/replacingmergetree)，因为该表通常多次插入相同的数据，因此我们需要一种去除重复项的方法。

如果指定，也可以为内部目标表使用其他表引擎：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```

## 外部目标表 {#external-target-tables}

可以使 `TimeSeries` 表使用手动创建的表：

```sql
CREATE TABLE data_for_my_table
(
    `id` UUID,
    `timestamp` DateTime64(3),
    `value` Float64
)
ENGINE = MergeTree
ORDER BY (id, timestamp);

CREATE TABLE tags_for_my_table ...

CREATE TABLE metrics_for_my_table ...

CREATE TABLE my_table ENGINE=TimeSeries DATA data_for_my_table TAGS tags_for_my_table METRICS metrics_for_my_table;
```

## 设置 {#settings}

以下是定义 `TimeSeries` 表时可以指定的设置列表：

| 名称 | 类型 | 默认 | 描述 |
|---|---|---|---|
| `tags_to_columns` | Map | {} | 映射，指定哪些标签应该放到 [tags](#tags-table) 表中的单独列中。语法： `{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | 当生成计算时间序列标识符的表达式时，该标志启用使用 `all_tags` 列进行该计算 |
| `store_min_time_and_max_time` | Bool | true | 如果设置为 true，则该表将存储每个时间序列的 `min_time` 和 `max_time` |
| `aggregate_min_time_and_max_time` | Bool | true | 在创建内部目标 `tags` 表时，该标志启用使用 `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` 而不是仅仅使用 `Nullable(DateTime64(3))` 作为 `min_time` 列的类型，最大时间列同理 |
| `filter_by_min_time_and_max_time` | Bool | true | 如果设置为 true，则该表将使用 `min_time` 和 `max_time` 列过滤时间序列 |


# 函数 {#functions}

以下是支持 `TimeSeries` 表作为参数的函数列表：
- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
