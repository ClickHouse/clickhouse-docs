---
'description': '一种表引擎，用于存储时间序列，即与时间戳和标签（或标签）相关联的一组值。'
'sidebar_label': '时间序列'
'sidebar_position': 60
'slug': '/engines/table-engines/special/time_series'
'title': '时间序列引擎'
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
这是一个实验性功能，未来版本可能会以向后不兼容的方式更改。
使用 [allow_experimental_time_series_table](/operations/settings/settings#allow_experimental_time_series_table) 设置启用时间序列表引擎的使用。
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

从默认设置开始更容易（允许在不指定列列表的情况下创建 `TimeSeries` 表）：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

然后，此表可以通过以下协议使用（必须在服务器配置中分配端口）：
- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)

## 目标表 {#target-tables}

`TimeSeries` 表没有自己的数据，所有内容都存储在其目标表中。
这类似于 [物化视图](../../../sql-reference/statements/create/view#materialized-view) 的工作方式，
不同之处在于物化视图有一个目标表，
而 `TimeSeries` 表有三个目标表，分别称为 [data](#data-table)、[tags](#tags-table) 和 [metrics](#metrics-table)。

目标表可以在 `CREATE TABLE` 查询中显式指定，
或者 `TimeSeries` 表引擎可以自动生成内部目标表。

目标表如下：

### 数据表 {#data-table}

_data_ 表包含与某个标识符相关的时间序列。

_data_ 表必须具有以下列：

| 名称 | 必需？ | 默认类型 | 可能类型 | 描述 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | 任意 | 标识指标名称和标签的组合 |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | 时间点 |
| `value` | [x] | `Float64` | `Float32` 或 `Float64` | 与 `timestamp` 相关联的值 |


### 标签表 {#tags-table}

_tags_ 表包含为指标名称和标签的每个组合计算的标识符。

_tags_ 表必须具有以下列：

| 名称 | 必需？ | 默认类型 | 可能类型 | 描述 |
|---|---|---|---|---|
| `id` | [x] | `UUID` | 任意（必须与 [data](#data-table) 表中的 `id` 类型匹配） | `id` 标识指标名称和标签的组合。DEFAULT 表达式指定了如何计算该标识符 |
| `metric_name` | [x] | `LowCardinality(String)` | `String` 或 `LowCardinality(String)` | 指标名称 |
| `<tag_value_column>` | [ ] | `String` | `String` 或 `LowCardinality(String)` 或 `LowCardinality(Nullable(String))` | 特定标签的值，标签名称和对应列的名称在 [tags_to_columns](#settings) 设置中指定 |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` 或 `Map(LowCardinality(String), String)` 或 `Map(LowCardinality(String), LowCardinality(String))` | 标签的映射，不包括标签 `__name__`，该标签包含指标名称，并排除在 [tags_to_columns](#settings) 设置中列出的标签名称 |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` 或 `Map(LowCardinality(String), String)` 或 `Map(LowCardinality(String), LowCardinality(String))` | 瞬态列，每一行是所有标签的映射，仅排除标签 `__name__`，该标签包含指标名称。该列的唯一目的是在计算 `id` 时使用 |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` 或 `Nullable(DateTime64(X))` | 具有该 `id` 的时间序列的最小时间戳。如果 [store_min_time_and_max_time](#settings) 设置为 `true`，则创建此列 |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` 或 `Nullable(DateTime64(X))` | 具有该 `id` 的时间序列的最大时间戳。如果 [store_min_time_and_max_time](#settings) 设置为 `true`，则创建此列 |

### 指标表 {#metrics-table}

_metrics_ 表包含收集的指标的某些信息、这些指标的类型及其描述。

_metrics_ 表必须具有以下列：

| 名称 | 必需？ | 默认类型 | 可能类型 | 描述 |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` 或 `LowCardinality(String)` | 指标系列名称 |
| `type` | [x] | `String` | `String` 或 `LowCardinality(String)` | 指标系列的类型，可能是 "counter"、"gauge"、"summary"、"stateset"、"histogram"、"gaugehistogram" 之一 |
| `unit` | [x] | `String` | `String` 或 `LowCardinality(String)` | 指标中使用的单位 |
| `help` | [x] | `String` | `String` 或 `LowCardinality(String)` | 指标的描述 |

插入到 `TimeSeries` 表中的任何行实际上都会存储在这三个目标表中。
`TimeSeries` 表包含来自 [data](#data-table)、[tags](#tags-table)、[metrics](#metrics-table) 表的所有这些列。

## 创建 {#creation}

有多种方法可以使用 `TimeSeries` 表引擎创建表。
最简单的语句

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

实际上会创建以下表（您可以通过执行 `SHOW CREATE TABLE my_table` 来查看）：

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

所以这些列是自动生成的，并且在此语句中还有三个内部 UUID -
每个内部目标表对应一个 UUID。
（内部 UUID 通常不会显示，直到设置
[show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil)
被设置为 `true`。）

内部目标表的名称类似于 `.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`，
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`，`.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
每个目标表的列是主 `TimeSeries` 表的列的子集：

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

您可以通过在定义主表时显式指定几乎任何内部目标表的列的类型进行调整。例如，

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

这将使内部 [data](#data-table) 表以微秒而不是毫秒存储时间戳：

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

`id` 列包含标识符，每个标识符是为指标名称和标签的组合计算的。
`id` 列的 DEFAULT 表达式是将用于计算这种标识符的表达式。
可以通过显式指定它们来调整 `id` 列的类型和该表达式：

```sql
CREATE TABLE my_table
(
    id UInt64 DEFAULT sipHash64(metric_name, all_tags)
) ENGINE=TimeSeries
```

## `tags` 和 `all_tags` 列 {#tags-and-all-tags}

有两个包含标签映射的列 - `tags` 和 `all_tags`。在此示例中，它们的含义相同，然而，如果使用 `tags_to_columns` 设置时它们可以不同。该设置允许指定特定标签应存储在单独的列中，而不是存储在 `tags` 列中的映射中：

```sql
CREATE TABLE my_table ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

此语句将在 `my_table` 及其内部 [tags](#tags-table) 目标表的定义中添加列
```sql
`instance` String,
`job` String
```。在此情况下，`tags` 列将不包含标签 `instance` 和 `job`，
但 `all_tags` 列将包含它们。`all_tags` 列是瞬态的，唯一的目的在于用于计算 `id` 列的 DEFAULT 表达式。

列的类型可以通过显式指定进行调整：

```sql
CREATE TABLE my_table (instance LowCardinality(String), job LowCardinality(Nullable(String)))
ENGINE=TimeSeries SETTINGS = {'instance': 'instance', 'job': 'job'}
```

## 内部目标表的表引擎 {#inner-table-engines}

默认情况下，内部目标表使用以下表引擎：
- [data](#data-table) 表使用 [MergeTree](../mergetree-family/mergetree)；
- [tags](#tags-table) 表使用 [AggregatingMergeTree](../mergetree-family/aggregatingmergetree)，因为相同的数据通常多次插入到此表中，因此我们需要一种方式
去除重复，并且因为需要对 `min_time` 和 `max_time` 列进行聚合；
- [metrics](#metrics-table) 表使用 [ReplacingMergeTree](../mergetree-family/replacingmergetree)，因为相同的数据通常多次插入到此表中，因此我们需要一种方式
去除重复。

如果指定了其他表引擎，也可以用于内部目标表：

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

| 名称 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `tags_to_columns` | Map | {} | 指定应放入 [tags](#tags-table) 表中单独列的标签的映射。语法： `{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | 在生成用于计算时间序列标识符的表达式时，此标志启用在该计算中使用 `all_tags` 列 |
| `store_min_time_and_max_time` | Bool | true | 如果设置为 true，则该表将为每个时间序列存储 `min_time` 和 `max_time` |
| `aggregate_min_time_and_max_time` | Bool | true | 在创建内部目标 `tags` 表时，此标志启用使用 `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` 而不是仅将 `Nullable(DateTime64(3))` 作为 `min_time` 列的类型，`max_time` 列也是如此 |
| `filter_by_min_time_and_max_time` | Bool | true | 如果设置为 true，则该表将使用 `min_time` 和 `max_time` 列进行过滤时间序列 |


# 函数 {#functions}

以下是支持 `TimeSeries` 表作为参数的函数列表：
- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
