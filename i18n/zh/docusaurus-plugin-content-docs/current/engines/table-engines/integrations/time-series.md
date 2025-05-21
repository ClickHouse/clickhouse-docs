---
'description': 'A table engine storing time series, i.e. a set of values associated
  with timestamps and tags (or labels).'
'sidebar_label': 'TimeSeries'
'sidebar_position': 60
'slug': '/engines/table-engines/special/time_series'
'title': 'TimeSeries Engine'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TimeSeries 引擎

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

一个存储时间序列的表引擎，即一组与时间戳和标签（或标签）关联的值：

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
这是一个实验性功能，未来版本可能会以向后不兼容的方式更改。
启用 TimeSeries 表引擎的使用
通过设置 [allow_experimental_time_series_table](/operations/settings/settings#allow_experimental_time_series_table)。
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

从一开始就可以将所有设置为默认（允许在不指定列列表的情况下创建 `TimeSeries` 表）：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

然后可以使用以下协议来使用该表（必须在服务器配置中分配一个端口）：
- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)

## 目标表 {#target-tables}

`TimeSeries` 表没有自己的数据，所有数据都存储在其目标表中。
这类似于 [物化视图](../../../sql-reference/statements/create/view#materialized-view) 的工作方式，
区别在于物化视图只有一个目标表
而 `TimeSeries` 表有三个目标表，分别名为 [data](#data-table)，[tags](#tags-table) 和 [metrics](#metrics-table)。

目标表可以在 `CREATE TABLE` 查询中显式指定，
或者 `TimeSeries` 表引擎可以自动生成内部目标表。

目标表如下：

### 数据表 {#data-table}

_data_ 表包含与某个标识符关联的时间序列。

_data_ 表必须具有以下列：

| 名称 | 必填? | 默认类型 | 可能的类型 | 描述 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | 任何 | 标识一组指标名称和标签的组合 |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | 一个时间点 |
| `value` | [x] | `Float64` | `Float32` 或 `Float64` | 与 `timestamp` 关联的值 |


### 标签表 {#tags-table}

_tags_ 表包含为每个指标名称和标签组合计算得出的标识符。

_tags_ 表必须具有以下列：

| 名称 | 必填? | 默认类型 | 可能的类型 | 描述 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | 任何（必须与 [data](#data-table) 表中的 `id` 类型匹配） | 一个 `id` 标识一个指标名称和标签的组合。DEFAULT 表达式指定如何计算此标识符 |
| `metric_name` | [x] | `LowCardinality(String)` | `String` 或 `LowCardinality(String)` | 指标的名称 |
| `<tag_value_column>` | [ ] | `String` | `String` 或 `LowCardinality(String)` 或 `LowCardinality(Nullable(String))` | 特定标签的值，标签名称和相应列的名称在 [tags_to_columns](#settings) 设置中指定 |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` 或 `Map(LowCardinality(String), String)` 或 `Map(LowCardinality(String), LowCardinality(String))` | 标签的映射，不包括标签 `__name__`，该标签包含一个指标的名称，并且不包括在 [tags_to_columns](#settings) 设置中列举的标签名称 |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` 或 `Map(LowCardinality(String), String)` 或 `Map(LowCardinality(String), LowCardinality(String))` | 瞬态列，每行是所有标签的映射，仅排除标签 `__name__`，该标签包含一个指标的名称。该列的唯一目的是在计算 `id` 时使用 |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` 或 `Nullable(DateTime64(X))` | 带有该 `id` 的时间序列的最小时间戳。该列在 [store_min_time_and_max_time](#settings) 设置为 `true` 时创建 |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` 或 `Nullable(DateTime64(X))` | 带有该 `id` 的时间序列的最大时间戳。该列在 [store_min_time_and_max_time](#settings) 设置为 `true` 时创建 |

### 指标表 {#metrics-table}

_metrics_ 表包含有关收集的指标、这些指标的类型及其描述的一些信息。

_metrics_ 表必须具有以下列：

| 名称 | 必填? | 默认类型 | 可能的类型 | 描述 |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` 或 `LowCardinality(String)` | 指标系列的名称 |
| `type` | [x] | `String` | `String` 或 `LowCardinality(String)` | 指标系列的类型，可以是 "counter"、"gauge"、"summary"、"stateset"、"histogram"、"gaugehistogram" |
| `unit` | [x] | `String` | `String` 或 `LowCardinality(String)` | 指标使用的单位 |
| `help` | [x] | `String` | `String` 或 `LowCardinality(String)` | 指标的描述 |

插入到 `TimeSeries` 表中的任何行实际上会存储在这三张目标表中。
`TimeSeries` 表包含来自 [data](#data-table)、[tags](#tags-table)、[metrics](#metrics-table) 表的所有这些列。

## 创建 {#creation}

有多种方法可以创建使用 `TimeSeries` 表引擎的表。
最简单的语句

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

实际上会创建以下表（可以通过执行 `SHOW CREATE TABLE my_table` 来查看）：

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

因此，列是自动生成的，并且在该语句中还有三个内部 UUID -
每个创建的内部目标表一个。
（内部 UUID 通常不显示，直到设置
[show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil)
被设置。）

内部目标表的名称类似于 `.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, `.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
每个目标表都有列，列是主 `TimeSeries` 表列的子集：

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

可以在定义主表时显式指定几乎任何内部目标表的列类型。比如，

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

将使内部 [data](#data-table) 表以微秒而不是毫秒存储时间戳：

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

`id` 列包含标识符，每个标识符是针对指标名称和标签的组合计算得出的。
`id` 列的 DEFAULT 表达式是用于计算此类标识符的表达式。
`id` 列的类型和该表达式可以通过显式指定来调整：

```sql
CREATE TABLE my_table
(
    id UInt64 DEFAULT sipHash64(metric_name, all_tags)
) ENGINE=TimeSeries
```

## `tags` 和 `all_tags` 列 {#tags-and-all-tags}

有两个包含标签映射的列 - `tags` 和 `all_tags`。在这个例子中，它们的含义相同，但如果使用了设置 `tags_to_columns`，它们可能不同。该设置允许指定特定标签应存储在单独的列中，而不是在 `tags` 列中存储一个映射：

```sql
CREATE TABLE my_table ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

该语句将向 `my_table` 和其内部 [tags](#tags-table) 目标表的定义中添加列
```sql
    `instance` String,
    `job` String
```。在这种情况下，`tags` 列将不包含标签 `instance` 和 `job`，
但 `all_tags` 列将包含它们。`all_tags` 列是瞬态的，其唯一目的是用于 `id` 列的 DEFAULT 表达式。

可以通过显式指定来调整列的类型：

```sql
CREATE TABLE my_table (instance LowCardinality(String), job LowCardinality(Nullable(String)))
ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

## 内部目标表的表引擎 {#inner-table-engines}

默认情况下，内部目标表使用以下表引擎：
- [data](#data-table) 表使用 [MergeTree](../mergetree-family/mergetree)；
- [tags](#tags-table) 表使用 [AggregatingMergeTree](../mergetree-family/aggregatingmergetree)，因为这张表中的同一数据通常会多次插入，所以我们需要一种方法来删除重复数据，同时也是为了对列 `min_time` 和 `max_time` 进行聚合；
- [metrics](#metrics-table) 表使用 [ReplacingMergeTree](../mergetree-family/replacingmergetree)，因为这张表中的同一数据通常会多次插入，所以我们需要一种方法来删除重复数据。

如果指定，还可以为内部目标表使用其他表引擎：

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
| `tags_to_columns` | Map | {} | 映射，指定哪些标签应放入 [tags](#tags-table) 表的单独列中。语法： `{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | 在生成计算时间序列标识符的表达式时，此标志启用在该计算中使用 `all_tags` 列 |
| `store_min_time_and_max_time` | Bool | true | 如果设置为 true，则该表将为每个时间序列存储 `min_time` 和 `max_time` |
| `aggregate_min_time_and_max_time` | Bool | true | 创建内部目标 `tags` 表时，此标志启用使用 `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` 而不是仅使用 `Nullable(DateTime64(3))` 作为 `min_time` 列的类型，对 `max_time` 列也相同 |
| `filter_by_min_time_and_max_time` | Bool | true | 如果设置为 true，则表将使用 `min_time` 和 `max_time` 列来过滤时间序列 |


# 函数 {#functions}

以下是支持 `TimeSeries` 表作为参数的函数列表：
- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
