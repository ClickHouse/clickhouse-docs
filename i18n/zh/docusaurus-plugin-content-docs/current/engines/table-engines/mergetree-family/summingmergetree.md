---
slug: /engines/table-engines/mergetree-family/summingmergetree
sidebar_position: 50
sidebar_label:  'SummingMergeTree'
title: 'SummingMergeTree'
description: 'SummingMergeTree inherits from the MergeTree engine. Its key feature is the ability to automatically sum numeric data during part merges.'
---


# SummingMergeTree

该引擎继承自 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)。不同之处在于，在合并 `SummingMergeTree` 表的数据部分时，ClickHouse 会将具有相同主键（或者更准确地说，是具有相同 [排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的所有行替换为一行，这一行包含具有数值数据类型的列的汇总值。如果排序键的组成方式使得单个键值对应多个行，这将显著减少存储容量并加快数据选择速度。

我们建议将该引擎与 `MergeTree` 一起使用。将完整数据存储在 `MergeTree` 表中，并使用 `SummingMergeTree` 存储聚合数据，例如，在准备报告时。这样的做法将防止由于主键构成不正确而导致重要数据的丢失。

## 创建表 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = SummingMergeTree([columns])
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

有关请求参数的描述，请参阅 [请求描述](../../../sql-reference/statements/create/table.md)。

### SummingMergeTree的参数 {#parameters-of-summingmergetree}

#### columns {#columns}

`columns` - 一个包含将在其中汇总值的列名的元组。可选参数。
列必须为数值类型，并且不能在主键中。

如果未指定 `columns`，ClickHouse 将在所有不在主键中的数值数据类型的列中汇总值。

### 查询子句 {#query-clauses}

创建 `SummingMergeTree` 表时，需要使用与创建 `MergeTree` 表时相同的 [子句](../../../engines/table-engines/mergetree-family/mergetree.md)。

<details markdown="1">

<summary>已弃用的创建表方法</summary>

:::note
在新项目中请勿使用此方法，尽可能地将旧项目切换到上述描述的方法。
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] SummingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

除了 `columns` 以外，所有参数的意思与 `MergeTree` 中相同。

- `columns` — 包含将汇总值的列名的元组。可选参数。有关描述，请参见上述文本。

</details>

## 使用示例 {#usage-example}

考虑以下表：

``` sql
CREATE TABLE summtt
(
    key UInt32,
    value UInt32
)
ENGINE = SummingMergeTree()
ORDER BY key
```

插入数据：

``` sql
INSERT INTO summtt Values(1,1),(1,2),(2,1)
```

ClickHouse可能并不会完全汇总所有行（[见下文](#data-processing)），因此我们在查询中使用聚合函数 `sum` 和 `GROUP BY` 子句。

``` sql
SELECT key, sum(value) FROM summtt GROUP BY key
```

``` text
┌─key─┬─sum(value)─┐
│   2 │          1 │
│   1 │          3 │
└─────┴────────────┘
```

## 数据处理 {#data-processing}

当数据插入到表中时，它们会按原样保存。ClickHouse 定期合并插入的数据部分，这时具有相同主键的行会被汇总并替换为每个结果数据部分中的一行。

ClickHouse 可以合并数据部分，以便不同的结果数据部分可以包含具有相同主键的行，即汇总将是不完整的。因此（`SELECT`）查询中应使用聚合函数 [sum()](/sql-reference/aggregate-functions/reference/sum) 和 `GROUP BY` 子句，如上例所述。

### 汇总的通用规则 {#common-rules-for-summation}

数值数据类型列中的值将被汇总。汇总的列集合由参数 `columns` 定义。

如果用于汇总的列中的所有值均为 0，则该行将被删除。

如果列不在主键中且未被汇总，则从现有值中随机选择一个值。

对于主键中的列，值将不被汇总。

### 聚合函数列中的汇总 {#the-summation-in-the-aggregatefunction-columns}

对于 [AggregateFunction 类型](../../../sql-reference/data-types/aggregatefunction.md) 的列，ClickHouse 的行为与 [AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 引擎一致，根据该函数进行聚合。

### 嵌套结构 {#nested-structures}

表可以具有嵌套的数据结构，这些结构以特殊方式处理。

如果嵌套表的名称以 `Map` 结尾，并且至少包含两个满足以下标准的列：

- 第一个列为数值型 `(*Int*, Date, DateTime)` 或字符串型 `(String, FixedString)`，我们称之为 `key`，
- 其他列为算术型 `(*Int*, Float32/64)`，我们称之为 `(values...)`，

那么该嵌套表将被解释为 `key => (values...)` 的映射，并在合并其行时，两个数据集的元素将按 `key` 合并，并对应 `(values...)` 的汇总。

示例：

``` text
DROP TABLE IF EXISTS nested_sum;
CREATE TABLE nested_sum
(
    date Date,
    site UInt32,
    hitsMap Nested(
        browser String,
        imps UInt32,
        clicks UInt32
    )
) ENGINE = SummingMergeTree
PRIMARY KEY (date, site);

INSERT INTO nested_sum VALUES ('2020-01-01', 12, ['Firefox', 'Opera'], [10, 5], [2, 1]);
INSERT INTO nested_sum VALUES ('2020-01-01', 12, ['Chrome', 'Firefox'], [20, 1], [1, 1]);
INSERT INTO nested_sum VALUES ('2020-01-01', 12, ['IE'], [22], [0]);
INSERT INTO nested_sum VALUES ('2020-01-01', 10, ['Chrome'], [4], [3]);

OPTIMIZE TABLE nested_sum FINAL; -- 模拟合并 

SELECT * FROM nested_sum;
┌───────date─┬─site─┬─hitsMap.browser───────────────────┬─hitsMap.imps─┬─hitsMap.clicks─┐
│ 2020-01-01 │   10 │ ['Chrome']                        │ [4]          │ [3]            │
│ 2020-01-01 │   12 │ ['Chrome','Firefox','IE','Opera'] │ [20,11,22,5] │ [1,3,0,1]      │
└────────────┴──────┴───────────────────────────────────┴──────────────┴────────────────┘

SELECT
    site,
    browser,
    impressions,
    clicks
FROM
(
    SELECT
        site,
        sumMap(hitsMap.browser, hitsMap.imps, hitsMap.clicks) AS imps_map
    FROM nested_sum
    GROUP BY site
)
ARRAY JOIN
    imps_map.1 AS browser,
    imps_map.2 AS impressions,
    imps_map.3 AS clicks;

┌─site─┬─browser─┬─impressions─┬─clicks─┐
│   12 │ Chrome  │          20 │      1 │
│   12 │ Firefox │          11 │      3 │
│   12 │ IE      │          22 │      0 │
│   12 │ Opera   │           5 │      1 │
│   10 │ Chrome  │           4 │      3 │
└──────┴─────────┴─────────────┴────────┘
```

在请求数据时，使用 [sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/summap.md) 函数对 `Map` 进行聚合。

对于嵌套数据结构，您无需在汇总的列元组中指定其列。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
