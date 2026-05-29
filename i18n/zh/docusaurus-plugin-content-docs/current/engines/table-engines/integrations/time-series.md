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

一种用于存储时间序列数据的表引擎，即一组与时间戳和标签 (或 label) 关联的值：

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
[SAMPLES db.samples_table_name | [SAMPLES INNER COLUMNS (...)] [SAMPLES INNER ENGINE engine(arguments)]]
[TAGS db.tags_table_name | [TAGS INNER COLUMNS (...)] [TAGS INNER ENGINE engine(arguments)]]
[METRICS db.metrics_table_name | [METRICS INNER COLUMNS (...)] [METRICS INNER ENGINE engine(arguments)]]
```

:::note
关键字 `SAMPLES` 有一个别名 `DATA`，保留该别名是为了向后兼容。
:::

## 用法 \{#usage\}

使用全部默认设置开始会更简单 (允许在不指定列列表的情况下创建 `TimeSeries` 表) ：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

然后即可通过以下协议使用该表 (必须在服务器配置中分配端口) ：

* [prometheus remote-write](/interfaces/prometheus#remote-write)
* [prometheus remote-read](/interfaces/prometheus#remote-read)

### 外部列 \{#outer-columns\}

TimeSeries 表的列会自动生成。这些列属于外部列，不存储任何数据，仅作为 `SELECT`/`INSERT` 的接口。实际数据存储在[目标表](#target-tables)中。以下是外部列列表：

| Name            | Type                                       | Description                                                                                                                         |
| --------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `metric_name`   | `String`                                   | 指标名称                                                                                                                                |
| `tags`          | `Map(String, String)`                      | 时间序列的 标签 映射 (标记)                                                                                                                |
| `time_series`   | 默认为 `Array(Tuple(DateTime64(3), Float64))` | 时间序列的 (timestamp, value) 对数组。该 Tuple 的 timestamp 和 scalar 元素类型可根据样本的 `INNER COLUMNS` 声明推导得出 (参见[指定外部列](#specifying-outer-columns))  |
| `metric_family` | `String`                                   | 指标族名称 (用于指标元数据)                                                                                                                    |
| `type`          | `String`                                   | 指标类型 (例如 &quot;counter&quot;、&quot;gauge&quot;)                                                                                     |
| `unit`          | `String`                                   | 指标单位                                                                                                                                |
| `help`          | `String`                                   | 指标说明                                                                                                                                |

示例：

```sql
INSERT INTO my_table (metric_name, tags, time_series) VALUES
    ('cpu_usage', {'job': 'node_exporter', 'instance': 'host1:9100'},
     [(toDateTime64('2024-01-01 00:00:00', 3), 0.5), (toDateTime64('2024-01-01 00:01:00', 3), 0.7)])
```

插入时，`metric_name` 可以为空，这表示指标名称是在 `tags` 中通过 `__name__` 指定的，例如：

```sql
INSERT INTO my_table (tags, time_series) VALUES
    ({'__name__': 'cpu_usage', 'job': 'test'},
     [(toDateTime64('2024-01-01 00:00:00', 3), 0.5)])
```

要插入指标元数据，请向 `metric_family`、`type`、`unit` 和 `help` 列写入数据：

```sql
INSERT INTO my_table (metric_name, tags, time_series, metric_family, type, unit, help) VALUES
    ('http_requests_total', {'method': 'GET'}, [(now64(), 100.0)],
     'http_requests_total', 'counter', 'requests', 'Total HTTP requests')
```

### 指定外部列 \{#specifying-outer-columns\}

可以在 `CREATE TABLE` 语句中显式列出外层 `time_series` 列，以覆盖其默认的 `Array(Tuple(DateTime64(3), Float64))` 类型。ClickHouse 会从该元组中提取时间戳和标量类型，并将它们传递到内部样本表中：

```sql
CREATE TABLE my_table (time_series Array(Tuple(UInt32, Float32))) ENGINE=TimeSeries
```

这相当于直接在 samples `INNER COLUMNS` 子句中声明时间戳列和值列的类型：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES INNER COLUMNS (timestamp UInt32, value Float32)
```

如果在同一条 `CREATE TABLE` 语句中同时使用这两种形式，则声明的类型必须一致。

## 目标表 \{#target-tables\}

`TimeSeries` 表本身不存储数据，所有数据都存储在其目标表中。
这类似于 [materialized view (物化视图) ](../../../sql-reference/statements/create/view#materialized-view) 的工作方式，
不同之处在于物化视图只有一个目标表，
而 `TimeSeries` 表有三个目标表，分别命名为 [samples](#samples-table)、[tags](#tags-table) 和 [metrics](#metrics-table)。

目标表可以在 `CREATE TABLE` 查询中显式指定，
也可以由 `TimeSeries` 表引擎自动生成内部目标表。

插入到 `TimeSeries` 表中的行会被转换、拆分为块，并插入到这三个目标表中。

目标表如下：

### Samples 表 \{#samples-table\}

*samples* 表包含与某个标识符关联的时间序列。

*samples* 表必须包含以下列：

| Name        | Mandatory? | Default type    | Possible types         | Description         |
| ----------- | ---------- | --------------- | ---------------------- | ------------------- |
| `id`        | [x]        | `UUID`          | any                    | 标识一组度量名称和标签的组合      |
| `timestamp` | [x]        | `DateTime64(3)` | `DateTime64(X)`        | 时间点                 |
| `value`     | [x]        | `Float64`       | `Float32` or `Float64` | 与该 `timestamp` 关联的值 |

### Tags 表 \{#tags-table\}

*tags* 表包含为每种度量名称与标签组合计算得到的标识符。

*tags* 表必须包含以下列：

| Name                 | Mandatory? | Default type                          | Possible types                                                                                                          | Description                                                                                        |
| -------------------- | ---------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `id`                 | [x]        | `UUID`                                | any (必须与 [samples](#samples-table) 表中 `id` 的类型匹配)                                                                       | `id` 用于标识度量名称与标签的组合。`DEFAULT` 表达式用于指定如何计算该标识符                                                      |
| `metric_name`        | [x]        | `LowCardinality(String)`              | `String` or `LowCardinality(String)`                                                                                    | 度量名称                                                                                               |
| `<tag_value_column>` | [ ]        | `String`                              | `String` or `LowCardinality(String)` or `LowCardinality(Nullable(String))`                                              | 某个特定标签的值，该标签的名称以及对应列的名称在 [tags&#95;to&#95;columns](#settings) 设置中指定                                |
| `tags`               | [x]        | `Map(LowCardinality(String), String)` | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | 标签映射，排除包含度量名称的标签 `__name__`，以及名称在 [tags&#95;to&#95;columns](#settings) 设置中列出的标签                 |
| `all_tags`           | [ ]        | `Map(String, String)`                 | `Map(String, String)` or `Map(LowCardinality(String), String)` or `Map(LowCardinality(String), LowCardinality(String))` | 临时列，每一行是所有标签的标签映射，仅排除包含度量名称的标签 `__name__`。该列唯一的用途是用于计算 `id`                                        |
| `min_time`           | [ ]        | `Nullable(DateTime64(3))`             | `DateTime64(X)` or `Nullable(DateTime64(X))`                                                                            | 具有该 `id` 的时间序列的最小时间戳。当 [store&#95;min&#95;time&#95;and&#95;max&#95;time](#settings) 为 `true` 时创建该列 |
| `max_time`           | [ ]        | `Nullable(DateTime64(3))`             | `DateTime64(X)` or `Nullable(DateTime64(X))`                                                                            | 具有该 `id` 的时间序列的最大时间戳。当 [store&#95;min&#95;time&#95;and&#95;max&#95;time](#settings) 为 `true` 时创建该列 |

### Metrics 表 \{#metrics-table\}

*metrics* 表包含关于已收集指标的一些信息、这些指标的类型以及它们的描述。

*metrics* 表必须包含以下列：

| Name                 | Mandatory? | Default type             | Possible types                       | Description                                                                                                                                |
| -------------------- | ---------- | ------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `metric_family_name` | [x]        | `String`                 | `String` or `LowCardinality(String)` | 指标族名称                                                                                                                                      |
| `type`               | [x]        | `LowCardinality(String)` | `String` or `LowCardinality(String)` | 指标族类型，可选值为 &quot;counter&quot;、&quot;gauge&quot;、&quot;summary&quot;、&quot;stateset&quot;、&quot;histogram&quot;、&quot;gaugehistogram&quot; |
| `unit`               | [x]        | `LowCardinality(String)` | `String` or `LowCardinality(String)` | 指标使用的单位                                                                                                                                    |
| `help`               | [x]        | `String`                 | `String` or `LowCardinality(String)` | 指标的描述信息                                                                                                                                    |

## 创建 \{#creation\}

使用 `TimeSeries` 表引擎创建表有多种方式。
最简单的语句如下：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
```

实际上会创建如下所示的表 (你可以通过执行 `SHOW CREATE TABLE my_table` 来查看) ：

```sql
CREATE TABLE my_table
(
    `metric_name` String,
    `tags` Map(String, String),
    `time_series` Array(Tuple(DateTime64(3), Float64)),
    `metric_family` String,
    `type` String,
    `unit` String,
    `help` String
)
ENGINE = TimeSeries
SAMPLES INNER COLUMNS
(
    `id` UUID,
    `timestamp` DateTime64(3),
    `value` Float64
)
SAMPLES INNER ENGINE = MergeTree ORDER BY (id, timestamp)
TAGS INNER COLUMNS
(
    `id` UUID DEFAULT reinterpretAsUUID(sipHash128(metric_name, all_tags)),
    `metric_name` LowCardinality(String),
    `tags` Map(LowCardinality(String), String),
    `all_tags` Map(String, String) EPHEMERAL,
    `min_time` SimpleAggregateFunction(min, Nullable(DateTime64(3))),
    `max_time` SimpleAggregateFunction(max, Nullable(DateTime64(3)))
)
TAGS INNER ENGINE = AggregatingMergeTree PRIMARY KEY metric_name ORDER BY (metric_name, id)
METRICS INNER COLUMNS
(
    `metric_family_name` String,
    `type` LowCardinality(String),
    `unit` LowCardinality(String),
    `help` String
)
METRICS INNER ENGINE = ReplacingMergeTree ORDER BY metric_family_name
```

因此，这些列是自动生成的，并且还有三个内部目标表，它们各自的列定义存储在 `INNER COLUMNS` 子句中。

内部目标表的名称类似于 `.inner_id.samples.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、
`.inner_id.tags.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`、`.inner_id.metrics.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`，
并且每个目标表都有自己的一组列：

```sql
CREATE TABLE default.`.inner_id.samples.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
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
    `type` LowCardinality(String),
    `unit` LowCardinality(String),
    `help` String
)
ENGINE = ReplacingMergeTree
ORDER BY metric_family_name
```

## 基于现有表创建表 \{#create-as\}

语句 `CREATE TABLE new_table AS existing_table` 会从 `existing_table` 复制以下内容：

* `SETTINGS`
* 每种类型的 `INNER COLUMNS`
* 每种类型的 `INNER ENGINE`

如果 `existing_table` 存在外部目标，则不允许使用该语句。
外部列列表会重新生成，而不会被复制。

## 调整列类型 \{#adjusting-column-types\}

您可以使用 `INNER COLUMNS` 子句来调整内部目标表中各列的类型。例如，将时间戳以微秒存储，并将值存储为 `Float32`：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES INNER COLUMNS (timestamp DateTime64(6), value Float32)
```

同一子句还可用于指定编解码器及其他列属性：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES INNER COLUMNS (timestamp DateTime64(3) CODEC(DoubleDelta))
```

## `id` 列 \{#id-column\}

`id` 列包含标识符；每个标识符都是根据指标名称与标签的组合计算得出的。
用于生成标识符的类型和 `DEFAULT` 表达式可通过 `TAGS INNER COLUMNS` 子句进行自定义：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
TAGS INNER COLUMNS (id UInt64 DEFAULT sipHash64(metric_name, all_tags))
```

`id` 列的类型必须是 `UUID`、`UInt64`、`UInt128` 或 `FixedString(16)` 之一。如果未提供 `DEFAULT` 表达式，ClickHouse 将根据 `id` 类型自动选择。samples 和 tags 内部表中声明的 `id` 类型必须一致。

`id_generator` 设置可在不使用 `INNER COLUMNS` 子句的情况下提供相同的自定义能力：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SETTINGS id_generator = 'sipHash64(metric_name, all_tags)'
```

如果设置了该项设置，则会使用它来生成 `id`，即使该列的 `DEFAULT` 包含的是不同的表达式。

## `tags` 与 `all_tags` 列 \{#tags-and-all-tags\}

有两列包含标签映射——`tags` 和 `all_tags`。在本例中它们含义相同，但在使用 `tags_to_columns` 设置项时，它们可能会不同。该设置项允许指定某个特定标签应存储在单独的列中，而不是作为映射存储在 `tags` 列中：

```sql
CREATE TABLE my_table
ENGINE = TimeSeries 
SETTINGS tags_to_columns = {'instance': 'instance', 'job': 'job'}
```

该语句将把列 `instance` 和 `job` 添加到内部目标表 [tags](#tags-table) 中。
在这种情况下，`tags` 列将不会包含标签 `instance` 和 `job`，
但 `all_tags` 列会包含它们。`all_tags` 列是一个临时列，其唯一用途是用于在 `id` 列的 DEFAULT 表达式中使用。

## 内部目标表的表引擎 \{#inner-table-engines\}

默认情况下，内部目标表使用以下表引擎：

* [samples](#samples-table) 表使用 [MergeTree](../mergetree-family/mergetree)；
* [tags](#tags-table) 表使用 [AggregatingMergeTree](../mergetree-family/aggregatingmergetree)，因为相同的数据经常会多次插入到该表中，所以我们需要一种方式
  来去重，同时还因为需要对 `min_time` 和 `max_time` 列进行聚合；
* [metrics](#metrics-table) 表使用 [ReplacingMergeTree](../mergetree-family/replacingmergetree)，因为相同的数据经常会多次插入到该表中，所以我们需要一种方式
  来去重。

如果有相应指定，内部目标表也可以使用其他表引擎：

```sql
CREATE TABLE my_table ENGINE=TimeSeries
SAMPLES ENGINE=ReplicatedMergeTree
TAGS ENGINE=ReplicatedAggregatingMergeTree
METRICS ENGINE=ReplicatedReplacingMergeTree
```

## 外部目标表 \{#external-target-tables\}

也可以让 `TimeSeries` 表使用手动创建的表：

```sql
CREATE TABLE samples_for_my_table
(
    `id` UUID,
    `timestamp` DateTime64(3),
    `value` Float64
)
ENGINE = MergeTree
ORDER BY (id, timestamp);

CREATE TABLE tags_for_my_table ...

CREATE TABLE metrics_for_my_table ...

CREATE TABLE my_table ENGINE=TimeSeries SAMPLES samples_for_my_table TAGS tags_for_my_table METRICS metrics_for_my_table;
```

外部表的列类型 (`id`、`timestamp`、`value` 以及 [`tags_to_columns`](#settings) 中列出的 `<tag_value_column>`) 必须与 `TimeSeries` 表原本会在内部生成的类型一致 (类型约束见 [Samples table](#samples-table)、[Tags table](#tags-table) 和 [Metrics table](#metrics-table)) 。类型不匹配会在 `CREATE` 时被报告。

外部标签目标的 id 生成器表达式会在 INSERT 时按以下顺序解析：首先是 [`id_generator`](#settings) 设置 (如果已设置) ，其次是外部表 `id` 列上声明的 `DEFAULT` (如果有) ，最后是根据 `id` 类型派生出的规范生成器) 。因此，该设置会覆盖外部表上声明的任何 `DEFAULT`——详见 [The `id` column](#id-column)。

## 更改设置 \{#altering-settings\}

在 `CREATE` 之后，可以更改以下两个设置：

* `id_generator`
* `filter_by_min_time_and_max_time`

```sql
ALTER TABLE my_table MODIFY SETTING id_generator = 'sipHash64(metric_name, all_tags)';
ALTER TABLE my_table MODIFY SETTING filter_by_min_time_and_max_time = 0;
```

请注意，如果在标签表中已有数据时更改 `id_generator`，同一 metric+标签 组合可能会生成不同的 ID——旧行会保留原有 ID，新行则会使用新的生成器。

其他设置无法通过 `ALTER ... MODIFY SETTING` 修改，因为它们在 `CREATE` 时就已写入内部表的 schema 中。

## 设置 \{#settings\}

下面是定义 `TimeSeries` 表时可以指定的设置列表：

| 名称                                   | 类型         | 默认值         | 描述                                                                                                                                             |
| ------------------------------------ | ---------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `id_generator`                       | Expression | 取决于 `id` 类型 | 用于根据时间序列的 标签 计算其标识符 (指纹) 的表达式。如果未设置，则使用 `id` 列的默认表达式。如果 `id` 列的默认表达式也未设置，则会自动选择该表达式                                                          |
| `tags_to_columns`                    | Map        | {}          | 映射，用于指定哪些 标签 应该写入到 [tags](#tags-table) 表中的独立列。语法：`{'tag1': 'column1', 'tag2' : column2, ...}`                                                 |
| `use_all_tags_column_to_generate_id` | Bool       | true        | 在生成用于计算时间序列标识符的表达式时，此开关允许在该计算中使用 `all_tags` 列                                                                                                  |
| `store_min_time_and_max_time`        | Bool       | true        | 如果设置为 true，则表会为每个时间序列存储 `min_time` 和 `max_time`                                                                                                |
| `aggregate_min_time_and_max_time`    | Bool       | true        | 在创建内部目标 `tags` 表时，此开关允许将 `min_time` 列的类型从 `Nullable(DateTime64(3))` 替换为 `SimpleAggregateFunction(min, Nullable(DateTime64(3)))`，`max_time` 列同理 |
| `filter_by_min_time_and_max_time`    | Bool       | true        | 如果设置为 true，则表在过滤时间序列时会使用 `min_time` 和 `max_time` 列                                                                                             |

# 函数 \{#functions\}

以下是支持以 `TimeSeries` 表作为参数的函数列表：

* [timeSeriesSamples](../../../sql-reference/table-functions/timeSeriesSamples.md)
* [timeSeriesTags](../../../sql-reference/table-functions/timeSeriesTags.md)
* [timeSeriesMetrics](../../../sql-reference/table-functions/timeSeriesMetrics.md)