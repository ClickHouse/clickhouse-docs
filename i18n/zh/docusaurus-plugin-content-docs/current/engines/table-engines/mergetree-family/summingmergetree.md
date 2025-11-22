---
description: 'SummingMergeTree 继承自 MergeTree 引擎。其关键特性是在数据片段合并期间能够自动汇总数值数据。'
sidebar_label: 'SummingMergeTree'
sidebar_position: 50
slug: /engines/table-engines/mergetree-family/summingmergetree
title: 'SummingMergeTree 表引擎'
doc_type: 'reference'
---



# SummingMergeTree 表引擎

该引擎继承自 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)。不同之处在于，当对 `SummingMergeTree` 表中的数据分片进行合并时，ClickHouse 会将所有具有相同主键（更准确地说，是具有相同[排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的行合并为一行，其中数值类型列的值为这些行在对应列上的求和结果。如果排序键的设计使得单个键值对应大量行，这将显著减少存储占用并加速数据读取。

我们建议将该引擎与 `MergeTree` 结合使用：在 `MergeTree` 表中存储完整明细数据，并使用 `SummingMergeTree` 存储聚合后的数据，例如在准备报表时使用。此类做法可以避免由于主键设计不当而导致丢失有价值的数据。



## 创建表 {#creating-a-table}

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

有关请求参数的描述,请参阅[请求说明](../../../sql-reference/statements/create/table.md)。

### SummingMergeTree 的参数 {#parameters-of-summingmergetree}

#### 列 {#columns}

`columns` - 包含需要对其值进行求和的列名的元组。可选参数。
这些列必须是数值类型,且不能出现在分区键或排序键中。

如果未指定 `columns`,ClickHouse 将对所有不在排序键中的数值类型列的值进行求和。

### 查询子句 {#query-clauses}

创建 `SummingMergeTree` 表时,需要使用与创建 `MergeTree` 表相同的[子句](../../../engines/table-engines/mergetree-family/mergetree.md)。

<details markdown="1">

<summary>已弃用的创建表方法</summary>

:::note
请勿在新项目中使用此方法,如有可能,请将旧项目迁移到上述方法。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] SummingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

除 `columns` 外的所有参数与 `MergeTree` 中的含义相同。

- `columns` — 包含需要对其值进行求和的列名的元组。可选参数。有关描述,请参阅上文。

</details>


## 使用示例 {#usage-example}

考虑以下表：

```sql
CREATE TABLE summtt
(
    key UInt32,
    value UInt32
)
ENGINE = SummingMergeTree()
ORDER BY key
```

向其插入数据：

```sql
INSERT INTO summtt VALUES(1,1),(1,2),(2,1)
```

ClickHouse 可能不会完全合并所有行（[见下文](#data-processing)），因此我们在查询中使用聚合函数 `sum` 和 `GROUP BY` 子句。

```sql
SELECT key, sum(value) FROM summtt GROUP BY key
```

```text
┌─key─┬─sum(value)─┐
│   2 │          1 │
│   1 │          3 │
└─────┴────────────┘
```


## 数据处理 {#data-processing}

当数据插入表中时,会按原样保存。ClickHouse 会定期合并插入的数据分区,在此过程中,具有相同主键的行会被求和并替换为每个结果数据分区中的一行。

ClickHouse 可能会合并数据分区,使得不同的结果数据分区包含具有相同主键的行,即求和可能是不完整的。因此,在查询时应使用聚合函数 [sum()](/sql-reference/aggregate-functions/reference/sum) 和 `GROUP BY` 子句(`SELECT`),如上述示例所示。

### 求和的通用规则 {#common-rules-for-summation}

数值数据类型列中的值会被求和。列集由参数 `columns` 定义。

如果所有用于求和的列的值都为 0,则该行会被删除。

如果列不在主键中且不参与求和,则从现有值中选择任意一个值。

主键中的列不参与求和。

### AggregateFunction 列中的求和 {#the-summation-in-the-aggregatefunction-columns}

对于 [AggregateFunction 类型](../../../sql-reference/data-types/aggregatefunction.md)的列,ClickHouse 的行为类似于 [AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 引擎,根据函数进行聚合。

### 嵌套结构 {#nested-structures}

表可以包含以特殊方式处理的嵌套数据结构。

如果嵌套表的名称以 `Map` 结尾,并且包含至少两列满足以下条件:

- 第一列是数值类型 `(*Int*, Date, DateTime)` 或字符串类型 `(String, FixedString)`,我们称之为 `key`,
- 其他列是算术类型 `(*Int*, Float32/64)`,我们称之为 `(values...)`,

那么这个嵌套表会被解释为 `key => (values...)` 的映射,在合并其行时,两个数据集的元素会按 `key` 进行合并,并对相应的 `(values...)` 进行求和。

示例:

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


在请求数据时，对 `Map` 类型进行聚合请使用 [sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/summap.md) 函数。

对于嵌套数据结构，在求和时无需在用于求和的列元组中单独指定其内部列。



## 相关内容 {#related-content}

- 博客：[在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
