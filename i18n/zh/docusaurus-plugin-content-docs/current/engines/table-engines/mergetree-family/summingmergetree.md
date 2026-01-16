---
description: 'SummingMergeTree 继承自 MergeTree 引擎。其关键特性是在数据部分合并时可以自动对数值数据进行求和。'
sidebar_label: 'SummingMergeTree'
sidebar_position: 50
slug: /engines/table-engines/mergetree-family/summingmergetree
title: 'SummingMergeTree 表引擎'
doc_type: 'reference'
---

# SummingMergeTree 表引擎 \{#summingmergetree-table-engine\}

该引擎继承自 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)。不同之处在于，当对 `SummingMergeTree` 表的数据分区片段进行合并时，ClickHouse 会将所有具有相同主键（更准确地说，是具有相同[排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的多行，替换为一行，其中数值数据类型列的值为这些行的求和结果。如果排序键的设计使得单个键值对应大量行，这种方式可以显著减少存储体积并加速数据查询。

我们建议将此引擎与 `MergeTree` 结合使用。在 `MergeTree` 表中存储完整数据，并使用 `SummingMergeTree` 存储聚合后的数据，例如在生成报表时使用。这样的做法可以避免由于主键设计不当而导致有价值数据的丢失。

## 创建表 \{#creating-a-table\}

```sql
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

有关请求参数的描述，请参阅[请求描述](../../../sql-reference/statements/create/table.md)。


### SummingMergeTree 的参数 \\{#parameters-of-summingmergetree\\}

#### 列 \\{#columns\\}

`columns` — 一个包含需要求和的列名的元组（tuple）。可选参数。
这些列必须是数值类型，且不能出现在分区键或排序键中。

如果未指定 `columns`，ClickHouse 会对所有数值类型且不在排序键中的列进行求和。

### 查询子句 \\{#query-clauses\\}

在创建 `SummingMergeTree` 表时，需要与创建 `MergeTree` 表时相同的[子句](../../../engines/table-engines/mergetree-family/mergetree.md)。

<details markdown="1">
  <summary>创建表的已弃用方法</summary>

  :::note
  不要在新项目中使用此方法，并且在可能的情况下，将旧项目切换到上文描述的方法。
  :::

  ```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] SummingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

  除 `columns` 之外的所有参数与 `MergeTree` 中的含义相同。

  * `columns` — 一个由其值将被求和的列名组成的元组（tuple）。可选参数。说明见上文。
</details>

## 使用示例 \{#usage-example\}

请看下表：

```sql
CREATE TABLE summtt
(
    key UInt32,
    value UInt32
)
ENGINE = SummingMergeTree()
ORDER BY key
```

向其中写入数据：

```sql
INSERT INTO summtt VALUES(1,1),(1,2),(2,1)
```

ClickHouse 可能不会对所有行进行完整的求和处理（[见下文](#data-processing)），因此我们在查询中使用聚合函数 `sum` 和 `GROUP BY` 子句。

```sql
SELECT key, sum(value) FROM summtt GROUP BY key
```

```text
┌─key─┬─sum(value)─┐
│   2 │          1 │
│   1 │          3 │
└─────┴────────────┘
```


## 数据处理 \\{#data-processing\\}

当数据被插入到表中时，会按原样保存。ClickHouse 会定期合并已插入的数据部分，在此过程中，具有相同主键的行会被求和，并在每个合并结果的数据部分中替换为一行。

ClickHouse 合并数据部分的方式可能导致：不同的合并结果数据部分中仍然可能包含具有相同主键的行，即求和可能是不完整的。因此，在执行查询时（`SELECT`），应按照上面的示例使用聚合函数 [sum()](/sql-reference/aggregate-functions/reference/sum) 和 `GROUP BY` 子句。

### 求和的通用规则 \\{#common-rules-for-summation\\}

数值数据类型列中的值会被求和。参与求和的列集合由参数 `columns` 定义。

如果用于求和的所有列的值都为 0，则该行会被删除。

如果某列不在主键中且不参与求和，则会从已有值中任意选取一个值。

主键列中的值不会被求和。

### AggregateFunction 列中的求和 \\{#the-summation-in-the-aggregatefunction-columns\\}

对于 [AggregateFunction 类型](../../../sql-reference/data-types/aggregatefunction.md) 的列，ClickHouse 的行为类似于 [AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 引擎，会根据该函数对数据进行聚合。

### 嵌套结构 \{#nested-structures\}

表可以包含以特殊方式处理的嵌套数据结构。

如果嵌套表的名称以 `Map` 结尾，并且包含至少两个满足以下条件的列：

* 第一列是数值类型 `(*Int*, Date, DateTime)` 或字符串类型 `(String, FixedString)`，我们称其为 `key`，
* 其他列是算术类型 `(*Int*, Float32/64)`，我们称其为 `(values...)`，

则此嵌套表会被解释为 `key => (values...)` 的映射，并且在合并其行时，会以 `key` 进行匹配，将两个数据集中的元素按对应的 `(values...)` 进行求和合并。

示例：

```text
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

OPTIMIZE TABLE nested_sum FINAL; -- emulate merge 

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

在查询数据时，对 `Map` 类型进行聚合请使用 [sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/sumMap.md) 函数。

对于嵌套数据结构，无需在用于求和的列元组中显式指定其中的列。


## 相关内容 \\{#related-content\\}

- 博客文章：[在 ClickHouse 中使用聚合函数组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)