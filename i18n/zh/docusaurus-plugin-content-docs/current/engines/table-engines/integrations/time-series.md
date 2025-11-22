---
description: '一种存储时间序列的表引擎，即一组与时间戳和标签（或标记）关联的值。'
sidebar_label: 'TimeSeries'
sidebar_position: 60
slug: /engines/table-engines/special/time_series
title: 'TimeSeries 表引擎'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TimeSeries 表引擎

<ExperimentalBadge />

<CloudNotSupportedBadge />

用于存储时间序列的表引擎，其数据由与时间戳和标签（或标记）关联的一组值组成：

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
这是一个实验性特性，在未来的版本中可能会发生向后不兼容的更改。
通过 [allow&#95;experimental&#95;time&#95;series&#95;table](/operations/settings/settings#allow_experimental_time_series_table) 设置来启用 TimeSeries 表引擎。
执行命令 `set allow_experimental_time_series_table = 1`。
:::


## 语法 {#syntax}

```sql
CREATE TABLE name [(columns)] ENGINE=TimeSeries
[SETTINGS var1=value1, ...]
[DATA db.data_table_name | DATA ENGINE data_table_engine(arguments)]
[TAGS db.tags_table_name | TAGS ENGINE tags_table_engine(arguments)]
[METRICS db.metrics_table_name | METRICS ENGINE metrics_table_engine(arguments)]
```


## 使用方法 {#usage}

最简单的方式是使用默认设置（允许创建 `TimeSeries` 表而不指定列列表）：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

然后可以通过以下协议使用该表（需要在服务器配置中指定端口）：

- [prometheus remote-write](../../../interfaces/prometheus.md#remote-write)
- [prometheus remote-read](../../../interfaces/prometheus.md#remote-read)


## 目标表 {#target-tables}

`TimeSeries` 表本身不存储数据,所有数据都存储在其目标表中。
这类似于[物化视图](../../../sql-reference/statements/create/view#materialized-view)的工作方式,
不同之处在于物化视图只有一个目标表,
而 `TimeSeries` 表有三个目标表,分别命名为 [data](#data-table)、[tags](#tags-table) 和 [metrics](#metrics-table)。

目标表可以在 `CREATE TABLE` 查询中显式指定,
也可以由 `TimeSeries` 表引擎自动生成内部目标表。

目标表如下:

### 数据表 {#data-table}

_数据_表包含与某个标识符关联的时间序列。

_数据_表必须包含以下列:

| 名称        | 是否必需? | 默认类型    | 可能的类型         | 描述                                         |
| ----------- | ---------- | --------------- | ---------------------- | --------------------------------------------------- |
| `id`        | [x]        | `UUID`          | 任意类型                    | 标识指标名称和标签的组合 |
| `timestamp` | [x]        | `DateTime64(3)` | `DateTime64(X)`        | 时间点                                        |
| `value`     | [x]        | `Float64`       | `Float32` 或 `Float64` | 与 `timestamp` 关联的值             |

### 标签表 {#tags-table}

_标签_表包含为每个指标名称和标签组合计算的标识符。

_标签_表必须包含以下列:

| 名称                 | 是否必需? | 默认类型                          | 可能的类型                                                                                                          | 描述                                                                                                                                                                                 |
| -------------------- | ---------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                 | [x]        | `UUID`                                | 任意类型(必须与[数据](#data-table)表中 `id` 的类型匹配)                                                      | `id` 标识指标名称和标签的组合。DEFAULT 表达式指定如何计算此标识符                                                            |
| `metric_name`        | [x]        | `LowCardinality(String)`              | `String` 或 `LowCardinality(String)`                                                                                    | 指标的名称                                                                                                                                                                        |
| `<tag_value_column>` | [ ]        | `String`                              | `String` 或 `LowCardinality(String)` 或 `LowCardinality(Nullable(String))`                                              | 特定标签的值,标签名称和对应列的名称在 [tags_to_columns](#settings) 设置中指定                                                |
| `tags`               | [x]        | `Map(LowCardinality(String), String)` | `Map(String, String)` 或 `Map(LowCardinality(String), String)` 或 `Map(LowCardinality(String), LowCardinality(String))` | 标签映射,不包括包含指标名称的 `__name__` 标签,也不包括在 [tags_to_columns](#settings) 设置中列举的标签                               |
| `all_tags`           | [ ]        | `Map(String, String)`                 | `Map(String, String)` 或 `Map(LowCardinality(String), String)` 或 `Map(LowCardinality(String), LowCardinality(String))` | 临时列,每行是所有标签的映射,仅排除包含指标名称的 `__name__` 标签。该列的唯一用途是在计算 `id` 时使用 |
| `min_time`           | [ ]        | `Nullable(DateTime64(3))`             | `DateTime64(X)` 或 `Nullable(DateTime64(X))`                                                                            | 具有该 `id` 的时间序列的最小时间戳。如果 [store_min_time_and_max_time](#settings) 为 `true`,则创建该列                                                                |
| `max_time`           | [ ]        | `Nullable(DateTime64(3))`             | `DateTime64(X)` 或 `Nullable(DateTime64(X))`                                                                            | 具有该 `id` 的时间序列的最大时间戳。如果 [store_min_time_and_max_time](#settings) 为 `true`,则创建该列                                                                |

### 指标表 {#metrics-table}

_指标_表包含有关已收集指标的信息、这些指标的类型及其描述。

_指标_表必须包含以下列:


| 名称 | 必填？ | 默认类型 | 可能的类型 | 描述 |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` 或 `LowCardinality(String)` | 指标族的名称 |
| `type` | [x] | `String` | `String` 或 `LowCardinality(String)` | 指标族的类型，可为 "counter"、"gauge"、"summary"、"stateset"、"histogram"、"gaugehistogram" 之一 |
| `unit` | [x] | `String` | `String` 或 `LowCardinality(String)` | 指标使用的单位 |
| `help` | [x] | `String` | `String` 或 `LowCardinality(String)` | 指标的描述 |

插入到 `TimeSeries` 表中的任何一行实际上都会被存储到这三个目标表中。  
`TimeSeries` 表包含来自 [data](#data-table)、[tags](#tags-table)、[metrics](#metrics-table) 三个表的所有列。



## 创建 {#creation}

使用 `TimeSeries` 表引擎创建表有多种方式。
最简单的语句

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

实际上会创建以下表(可以通过执行 `SHOW CREATE TABLE my_table` 查看):

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

可以看到,列是自动生成的,并且该语句中包含三个内部 UUID,
每个内部目标表对应一个。
(除非设置了
[show_table_uuid_in_table_create_query_if_not_nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil)
配置项,否则内部 UUID 通常不会显示。)

内部目标表的名称类似于 `.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、`.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`,
每个目标表的列都是主 `TimeSeries` 表列的子集:

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


## 调整列类型 {#adjusting-column-types}

在定义主表时,您可以通过显式指定列类型来调整内部目标表中几乎任何列的类型。例如:

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

这将使内部 [data](#data-table) 表以微秒而非毫秒来存储时间戳:

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

`id` 列包含标识符,每个标识符根据指标名称和标签的组合计算得出。
`id` 列的 DEFAULT 表达式用于计算这些标识符。
可以通过显式指定来调整 `id` 列的类型和该表达式:

```sql
CREATE TABLE my_table
(
  id UInt64 DEFAULT sipHash64(metric_name, all_tags)
)
ENGINE=TimeSeries
```


## `tags` 和 `all_tags` 列 {#tags-and-all-tags}

有两个包含标签映射的列 - `tags` 和 `all_tags`。在此示例中它们的含义相同,但如果使用了 `tags_to_columns` 设置,它们可能会有所不同。此设置允许指定将特定标签存储在单独的列中,而不是存储在 `tags` 列内的映射中:

```sql
CREATE TABLE my_table
ENGINE = TimeSeries
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

此语句将添加以下列:

```sql
`instance` String,
`job` String
```

到 `my_table` 及其内部 [tags](#tags-table) 目标表的定义中。在这种情况下,`tags` 列将不包含 `instance` 和 `job` 标签,但 `all_tags` 列会包含它们。`all_tags` 列是临时列,其唯一用途是在 `id` 列的 DEFAULT 表达式中使用。

可以通过显式指定列类型来调整:

```sql
CREATE TABLE my_table (
  instance LowCardinality(String),
  job LowCardinality(Nullable(String))
)
ENGINE=TimeSeries
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```


## 内部目标表的表引擎 {#inner-table-engines}

默认情况下,内部目标表使用以下表引擎:

- [data](#data-table) 表使用 [MergeTree](../mergetree-family/mergetree);
- [tags](#tags-table) 表使用 [AggregatingMergeTree](../mergetree-family/aggregatingmergetree),因为相同的数据经常会多次插入该表,因此需要一种去重方法,同时还需要对 `min_time` 和 `max_time` 列进行聚合;
- [metrics](#metrics-table) 表使用 [ReplacingMergeTree](../mergetree-family/replacingmergetree),因为相同的数据经常会多次插入该表,因此需要一种去重方法。

如果明确指定,内部目标表也可以使用其他表引擎:

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```


## 外部目标表 {#external-target-tables}

可以让 `TimeSeries` 表使用手动创建的表:

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

以下是定义 `TimeSeries` 表时可指定的设置列表:

| 名称                                 | 类型 | 默认值 | 描述                                                                                                                                                                                                                                        |
| ------------------------------------ | ---- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tags_to_columns`                    | Map  | {}      | 指定哪些标签应放入 [tags](#tags-table) 表的单独列中的映射。语法:`{'tag1': 'column1', 'tag2' : column2, ...}`                                                                                                 |
| `use_all_tags_column_to_generate_id` | Bool | true    | 生成用于计算时间序列标识符的表达式时,此标志启用在计算中使用 `all_tags` 列                                                                                                       |
| `store_min_time_and_max_time`        | Bool | true    | 如果设置为 true,表将为每个时间序列存储 `min_time` 和 `max_time`                                                                                                                                                            |
| `aggregate_min_time_and_max_time`    | Bool | true    | 创建内部目标 `tags` 表时,此标志启用使用 `SimpleAggregateFunction(min, Nullable(DateTime64(3)))` 而非 `Nullable(DateTime64(3))` 作为 `min_time` 列的类型,`max_time` 列同理 |
| `filter_by_min_time_and_max_time`    | Bool | true    | 如果设置为 true,表将使用 `min_time` 和 `max_time` 列过滤时间序列                                                                                                                                             |


# 函数 {#functions}

以下函数支持将 `TimeSeries` 表作为参数：

- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)
