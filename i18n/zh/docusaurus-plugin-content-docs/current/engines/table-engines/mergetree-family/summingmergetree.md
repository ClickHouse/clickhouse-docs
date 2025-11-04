---
'description': 'SummingMergeTree 继承自 MergeTree 引擎。它的主要特点是在分区合并期间自动对数值数据进行求和。'
'sidebar_label': 'SummingMergeTree'
'sidebar_position': 50
'slug': '/engines/table-engines/mergetree-family/summingmergetree'
'title': 'SummingMergeTree'
'doc_type': 'reference'
---


# SummingMergeTree

该引擎继承自 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)。不同之处在于，在合并 `SummingMergeTree` 表的数据部分时，ClickHouse 会用一行包含数值列的汇总值替换所有具有相同主键（更准确地说，是相同的 [排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的行。如果排序键的构成方式使得单个键值对应大量行，这将显著减少存储量并加快数据选择速度。

我们建议将该引擎与 `MergeTree` 一起使用。在 `MergeTree` 表中存储完整数据，并使用 `SummingMergeTree` 存储聚合数据，例如，在准备报告时。这样的做法将防止由于主键构成不当而导致宝贵数据的丢失。

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

有关请求参数的描述，请参见 [请求描述](../../../sql-reference/statements/create/table.md)。

### SummingMergeTree 参数 {#parameters-of-summingmergetree}

#### 列 {#columns}

`columns` - 一个元组，包含将被汇总的列名。可选参数。
这些列必须是数值类型，且不得在分区或排序键中。

如果未指定 `columns`，ClickHouse 会汇总所有不在排序键中的数值类型列的值。

### 查询子句 {#query-clauses}

创建 `SummingMergeTree` 表时，所需的 [子句](../../../engines/table-engines/mergetree-family/mergetree.md) 与创建 `MergeTree` 表时相同。

<details markdown="1">

<summary>创建表的过时方法</summary>

:::note
在新项目中请勿使用此方法，并尽可能将旧项目切换到上述描述的方法。
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

- `columns` — 包含将被汇总的列名的元组。可选参数。有关描述，请参见上面的文本。

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

向其中插入数据：

```sql
INSERT INTO summtt VALUES(1,1),(1,2),(2,1)
```

ClickHouse 可能不会完全对所有行进行求和（[见下文](#data-processing)），因此在查询中我们使用聚合函数 `sum` 和 `GROUP BY` 子句。

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

当数据插入到表中时，它们将按原样保存。ClickHouse 定期合并插入的数据部分，此时具有相同主键的行会被求和并用每个结果数据部分的一行替换。

ClickHouse 可以合并数据部分，因此不同的结果数据部分可以包含相同主键的行，即求和会不完整。因此，在查询中应该使用聚合函数 [sum()](/sql-reference/aggregate-functions/reference/sum) 和 `GROUP BY` 子句，如上例所示。

### 求和的通用规则 {#common-rules-for-summation}

具有数值数据类型的列中的值会被求和。列的集合由参数 `columns` 定义。

如果在求和的所有列中的值均为 0，则行将被删除。

如果某列不在主键中且未被求和，则从现有值中选择一个任意值。

主键中的列的值不进行求和。

### AggregateFunction 列中的求和 {#the-summation-in-the-aggregatefunction-columns}

对于 [AggregateFunction 类型](../../../sql-reference/data-types/aggregatefunction.md) 的列，ClickHouse 的行为类似于 [AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 引擎，根据函数进行聚合。

### 嵌套结构 {#nested-structures}

表可以具有特殊处理的嵌套数据结构。

如果嵌套表的名称以 `Map` 结尾，并且它至少包含两列，且满足以下条件：

- 第一列为数值型 `(*Int*, Date, DateTime)` 或字符串类型 `(String, FixedString)`，我们称之为 `key`，
- 其他列为算术型 `(*Int*, Float32/64)`，我们称之为 `(values...)`，

则该嵌套表被解释为 `key => (values...)` 的映射，在合并其行时，两个数据集的元素按 `key` 进行合并，并求和对应的 `(values...)`。

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

请求数据时，使用 [sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/summap.md) 函数对 `Map` 进行聚合。

对于嵌套数据结构，您无需在汇总列的元组中指定其列。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
