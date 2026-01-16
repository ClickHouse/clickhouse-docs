---
description: '用于存储时间序列的表引擎，即一组与时间戳和标签（或标记）相关联的值。'
sidebar_label: 'TimeSeries'
sidebar_position: 60
slug: /engines/table-engines/special/time_series
title: 'TimeSeries 表引擎'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# TimeSeries 表引擎 \{#timeseries-table-engine\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

一种用于存储时间序列数据的表引擎，即一组与时间戳和标签（或 label）关联的值：

```sql
metric_name1[tag1=value1, tag2=value2, ...] = {timestamp1: value1, timestamp2: value2, ...}
metric_name2[...] = ...
```

:::info
这是一个实验性功能，将来版本中可能会有向后不兼容的变更。
通过配置 [allow&#95;experimental&#95;time&#95;series&#95;table](/operations/settings/settings#allow_experimental_time_series_table) 设置来启用 TimeSeries 表引擎。
输入命令 `set allow_experimental_time_series_table = 1`。
:::


## 语法 \{#syntax\}

```sql
CREATE TABLE name [(columns)] ENGINE=TimeSeries
[SETTINGS var1=value1, ...]
[DATA db.data_table_name | DATA ENGINE data_table_engine(arguments)]
[TAGS db.tags_table_name | TAGS ENGINE tags_table_engine(arguments)]
[METRICS db.metrics_table_name | METRICS ENGINE metrics_table_engine(arguments)]
```


## 用法 \{#usage\}

使用全部默认设置开始会更简单（允许在不指定列列表的情况下创建 `TimeSeries` 表）：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

然后即可通过以下协议使用该表（必须在服务器配置中分配端口）：

* [prometheus remote-write](/interfaces/prometheus#remote-write)
* [prometheus remote-read](/interfaces/prometheus#remote-read)


## 目标表 \\{#target-tables\\}

`TimeSeries` 表本身不存储数据，所有数据都存储在其目标表中。
这类似于 [materialized view（物化视图）](../../../sql-reference/statements/create/view#materialized-view) 的工作方式，
不同之处在于物化视图只有一个目标表，
而 `TimeSeries` 表有三个目标表，分别命名为 [data](#data-table)、[tags](#tags-table) 和 [metrics](#metrics-table)。

目标表可以在 `CREATE TABLE` 查询中显式指定，
也可以由 `TimeSeries` 表引擎自动生成内部目标表。

目标表如下：

### Data 表 \\{#data-table\\}

_data_ 表包含与某个标识符关联的时间序列。

_data_ 表必须包含以下列：

| Name | Mandatory? | Default type | Possible types | Description |
|---|---|---|---|---|
| `id` | [x] | `UUID` | any | 标识一组度量名称和标签的组合 |
| `timestamp` | [x] | `DateTime64(3)` | `DateTime64(X)` | 时间点 |
| `value` | [x] | `Float64` | `Float32` or `Float64` | 与该 `timestamp` 关联的值 |

### Tags 表 \\{#tags-table\\}

_tags_ 表包含为每种度量名称与标签组合计算得到的标识符。

_tags_ 表必须包含以下列：

| Name | Mandatory? | Default type | Possible types | Description |
|---|---|---|---|---|
| `id` | [x] | `UUID` | any (必须与 [data](#data-table) 表中 `id` 的类型匹配) | `id` 用于标识度量名称与标签的组合。`DEFAULT` 表达式用于指定如何计算该标识符 |
| `metric_name` | [x] | `LowCardinality(String)` | `String` or `LowCardinality(String)` | 度量名称 |
| `<tag_value_column>` | [ ] | `String` | `String` or `LowCardinality(String)` or `LowCardinality(Nullable(String))` | 某个特定标签的值，该标签的名称以及对应列的名称在 [tags_to_columns](#settings) 设置中指定 |
| `tags` | [x] | `Map(LowCardinality(String), String)` | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | 标签的 Map，排除包含度量名称的标签 `__name__`，以及名称在 [tags_to_columns](#settings) 设置中列出的标签 |
| `all_tags` | [ ] | `Map(String, String)` | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | 临时列，每一行是所有标签的 Map，仅排除包含度量名称的标签 `__name__`。该列唯一的用途是用于计算 `id` |
| `min_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` or `Nullable(DateTime64(X))` | 具有该 `id` 的时间序列的最小时间戳。当 [store_min_time_and_max_time](#settings) 为 `true` 时创建该列 |
| `max_time` | [ ] | `Nullable(DateTime64(3))` | `DateTime64(X)` or `Nullable(DateTime64(X))` | 具有该 `id` 的时间序列的最大时间戳。当 [store_min_time_and_max_time](#settings) 为 `true` 时创建该列 |

### Metrics 表 \\{#metrics-table\\}

_metrics_ 表包含关于已收集指标的一些信息、这些指标的类型以及它们的描述。

_metrics_ 表必须包含以下列：

| Name | Mandatory? | Default type | Possible types | Description |
|---|---|---|---|---|
| `metric_family_name` | [x] | `String` | `String` or `LowCardinality(String)` | 指标族名称 |
| `type` | [x] | `String` | `String` or `LowCardinality(String)` | 指标族类型，可选值为 "counter"、"gauge"、"summary"、"stateset"、"histogram"、"gaugehistogram" |
| `unit` | [x] | `String` | `String` or `LowCardinality(String)` | 指标使用的单位 |
| `help` | [x] | `String` | `String` or `LowCardinality(String)` | 指标的描述信息 |

插入到 `TimeSeries` 表中的任何一行实际上都会被写入这三个目标表中。  
`TimeSeries` 表包含来自 [data](#data-table)、[tags](#tags-table)、[metrics](#metrics-table) 三张表的所有列。

## 创建 \{#creation\}

使用 `TimeSeries` 表引擎创建表有多种方式。
最简单的语句如下：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

实际上会创建如下所示的表（你可以通过执行 `SHOW CREATE TABLE my_table` 来查看）：

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

因此，这些列是自动生成的，并且在该语句中还有三个内部 UUID——
为每个创建的内部目标表各有一个。
（内部 UUID 在默认情况下不会显示，除非将
[show&#95;table&#95;uuid&#95;in&#95;table&#95;create&#95;query&#95;if&#95;not&#95;nil](../../../operations/settings/settings#show_table_uuid_in_table_create_query_if_not_nil)
设为启用。）

内部目标表的名称类似于 `.inner_id.data.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、`.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`，
并且每个目标表的列都是主 `TimeSeries` 表列的一个子集：

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


## 调整列类型 \{#adjusting-column-types\}

在定义主表时，通过显式指定列类型，可以调整内部目标表中几乎任意列的类型。例如，

```sql
CREATE TABLE my_table
(
    timestamp DateTime64(6)
) ENGINE=TimeSeries
```

将使内部的 [data](#data-table) 表以微秒而非毫秒存储时间戳：

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


## `id` 列 \{#id-column\}

`id` 列包含标识符，每个标识符是根据指标名称与标签的组合计算得到的。
`id` 列的 DEFAULT 表达式是用于计算这些标识符的表达式。
可以通过显式指定 `id` 列的类型以及该表达式来进行调整：

```sql
CREATE TABLE my_table
(
  id UInt64 DEFAULT sipHash64(metric_name, all_tags)
)
ENGINE=TimeSeries
```


## `tags` 与 `all_tags` 列 \{#tags-and-all-tags\}

有两列包含标签映射——`tags` 和 `all_tags`。在本例中它们含义相同，但在使用 `tags_to_columns` 设置项时，它们可能会不同。该设置项允许指定某个特定标签应存储在单独的列中，而不是作为映射存储在 `tags` 列中：

```sql
CREATE TABLE my_table
ENGINE = TimeSeries 
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

该语句将添加列：

```sql
`instance` String,
`job` String
```

到 `my_table` 以及其内部目标表 [tags](#tags-table) 的定义中。在这种情况下，`tags` 列将不会包含标签 `instance` 和 `job`，
但 `all_tags` 列会包含它们。`all_tags` 列是一个临时列，其唯一用途是用于在 `id` 列的 DEFAULT 表达式中使用。

可以通过显式指定列类型来调整列的类型：

```sql
CREATE TABLE my_table (
  instance LowCardinality(String),
  job LowCardinality(Nullable(String))
)
ENGINE=TimeSeries
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```


## 内部目标表的表引擎 \{#inner-table-engines\}

默认情况下，内部目标表使用以下表引擎：

* [data](#data-table) 表使用 [MergeTree](../mergetree-family/mergetree)；
* [tags](#tags-table) 表使用 [AggregatingMergeTree](../mergetree-family/aggregatingmergetree)，因为相同的数据经常会多次插入到该表中，所以我们需要一种方式
  来去重，同时还因为需要对 `min_time` 和 `max_time` 列进行聚合；
* [metrics](#metrics-table) 表使用 [ReplacingMergeTree](../mergetree-family/replacingmergetree)，因为相同的数据经常会多次插入到该表中，所以我们需要一种方式
  来去重。

如果有相应指定，内部目标表也可以使用其他表引擎：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
DATA ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```


## 外部目标表 \{#external-target-tables\}

可以让 `TimeSeries` 表使用一个手动创建的表：

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


## 设置 \\{#settings\\}

下面是定义 `TimeSeries` 表时可以指定的设置列表：

| 名称 | 类型 | 默认值 | 描述 |
|---|---|---|---|
| `tags_to_columns` | Map | {} | 映射，用于指定哪些 tag 应该写入到 [tags](#tags-table) 表中的独立列。语法：`{'tag1': 'column1', 'tag2' : column2, ...}` |
| `use_all_tags_column_to_generate_id` | Bool | true | 在生成用于计算时间序列标识符的表达式时，此开关允许在该计算中使用 `all_tags` 列 |
| `store_min_time_and_max_time` | Bool | true | 如果设置为 true，则表会为每个时间序列存储 `min_time` 和 `max_time` |
| `aggregate_min_time_and_max_time` | Bool | true | 在创建内部目标 `tags` 表时，此开关允许将 `min_time` 列的类型从 `Nullable(DateTime64(3))` 替换为 `SimpleAggregateFunction(min, Nullable(DateTime64(3)))`，`max_time` 列同理 |
| `filter_by_min_time_and_max_time` | Bool | true | 如果设置为 true，则表在过滤时间序列时会使用 `min_time` 和 `max_time` 列 |

# 函数 \\{#functions\\}

以下是支持以 `TimeSeries` 表作为参数的函数列表：

- [timeSeriesData](../../../sql-reference/table-functions/timeSeriesData.md)
- [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
- [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)