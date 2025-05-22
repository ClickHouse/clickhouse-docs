
# SummingMergeTree

该引擎继承自 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)。不同之处在于，当合并 `SummingMergeTree` 表的数据分片时，ClickHouse 会将所有具有相同主键（更准确地说，是具有相同 [排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的行替换为一行，该行包含具有数字数据类型的列的汇总值。如果排序键的构成使得单个键值对应大量行，这将显著减少存储量并加快数据选择速度。

我们建议将该引擎与 `MergeTree` 一起使用。将完整数据存储在 `MergeTree` 表中，使用 `SummingMergeTree` 存储聚合数据，例如，在准备报告时。这样的方法可以防止因主键构成不正确而丢失有价值的数据。

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

### SummingMergeTree 的参数 {#parameters-of-summingmergetree}

#### columns {#columns}

`columns` - 一个元组，包含将被汇总值的列名。可选参数。
    列必须是数字类型，并且不得出现在分区或排序键中。

如果未指定 `columns`，ClickHouse 会汇总所有不在排序键中的数字数据类型的列中的值。

### 查询子句 {#query-clauses}

创建 `SummingMergeTree` 表时，所需的 [子句](../../../engines/table-engines/mergetree-family/mergetree.md) 与创建 `MergeTree` 表时相同。

<details markdown="1">

<summary>创建表的弃用方法</summary>

:::note
请勿在新项目中使用此方法，并尽可能将旧项目切换到上述方法。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] SummingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

除了 `columns` 外，所有参数的含义与 `MergeTree` 中相同。

- `columns` — 元组，包含将被汇总的列的值名。可选参数。有关描述，请参见上述文本。

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
INSERT INTO summtt Values(1,1),(1,2),(2,1)
```

ClickHouse 可能不会完全汇总所有行 ([见下文](#data-processing))，因此我们在查询中使用聚合函数 `sum` 和 `GROUP BY` 子句。

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

当数据插入到表中时，它们按原样保存。ClickHouse 会定期合并插入的数据分片，这时，主键相同的行会被汇总并用每个结果数据分片中的一行替换。

ClickHouse 可以合并数据分片，以便不同的结果数据分片可以包含具有相同主键的行，即汇总将是不完全的。因此，查询时应使用聚合函数 [sum()](/sql-reference/aggregate-functions/reference/sum) 和 `GROUP BY` 子句，如上面的示例所述。

### 汇总的通用规则 {#common-rules-for-summation}

具有数字数据类型的列中的值将被汇总。列的集合由参数 `columns` 定义。

如果所有用于汇总的列中的值为 0，则该行将被删除。

如果列不在主键中且未被汇总，则从现有值中选择任意值。

主键中的列值不进行汇总。

### 聚合函数列中的汇总 {#the-summation-in-the-aggregatefunction-columns}

对于 [AggregateFunction 类型](../../../sql-reference/data-types/aggregatefunction.md) 的列，ClickHouse 的行为类似于 [AggregatingMergeTree](../../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 引擎，根据函数进行聚合。

### 嵌套结构 {#nested-structures}

表可以具有以特殊方式处理的嵌套数据结构。

如果嵌套表的名称以 `Map` 结尾，并且至少包含两个满足以下条件的列：

- 第一个列是数字 `(*Int*, Date, DateTime)` 或字符串 `(String, FixedString)`，我们称之为 `key`，
- 其他列是算术 `(*Int*, Float32/64)`，我们称之为 `(values...)`，

则此嵌套表将被解释为 `key => (values...)` 的映射，并且在合并其行时，两个数据集的元素将根据 `key` 合并，并对相应的 `(values...)` 进行汇总。

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

在请求数据时，使用 [sumMap(key, value)](../../../sql-reference/aggregate-functions/reference/summap.md) 函数对 `Map` 进行聚合。

对于嵌套数据结构，您无需在汇总的列元组中指定其列。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
