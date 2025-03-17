---
slug: /engines/table-engines/mergetree-family/aggregatingmergetree
sidebar_position: 60
sidebar_label:  AggregatingMergeTree
title: 'AggregatingMergeTree'
description: '替换所有具有相同主键（更准确地说，具有相同的 [排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的行为单行（在单个数据部分内），该行存储聚合函数状态的组合。'
---


# AggregatingMergeTree

该引擎继承自 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)，并修改了数据部分合并的逻辑。ClickHouse 将所有具有相同主键（更准确地说，具有相同的 [排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的行替换为单行（在单个数据部分内），该行存储聚合函数状态的组合。

您可以使用 `AggregatingMergeTree` 表进行增量数据聚合，包括聚合物化视图。

您可以在以下视频中查看如何使用 AggregatingMergeTree 和 Aggregate 函数的示例：
<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="Aggregation States in ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

该引擎处理所有以下类型的列：

## [AggregateFunction](../../../sql-reference/data-types/aggregatefunction.md) {#aggregatefunction}
## [SimpleAggregateFunction](../../../sql-reference/data-types/simpleaggregatefunction.md) {#simpleaggregatefunction}

如果它按数量减少了行数，则适合使用 `AggregatingMergeTree`。

## 创建表 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = AggregatingMergeTree()
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[TTL expr]
[SETTINGS name=value, ...]
```

有关请求参数的描述，请参阅 [请求描述](../../../sql-reference/statements/create/table.md)。

**查询子句**

创建 `AggregatingMergeTree` 表时，与创建 `MergeTree` 表时所需的[子句](../../../engines/table-engines/mergetree-family/mergetree.md)相同。

<details markdown="1">

<summary>创建表的弃用方法</summary>

:::note
请勿在新项目中使用此方法，如果可能，请将旧项目切换到上述描述的方法。
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] AggregatingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

所有参数的含义与 `MergeTree` 中相同。
</details>

## SELECT 和 INSERT {#select-and-insert}

要插入数据，请使用带有聚合状态函数的 [INSERT SELECT](../../../sql-reference/statements/insert-into.md) 查询。
从 `AggregatingMergeTree` 表中选择数据时，请使用 `GROUP BY` 子句和与插入数据时相同的聚合函数，但使用 `-Merge` 后缀。

在 `SELECT` 查询的结果中，类型为 `AggregateFunction` 的值具有特定实现的二进制表示，适用于所有 ClickHouse 输出格式。例如，如果您通过 `SELECT` 查询将数据转储到 `TabSeparated` 格式中，那么此转储可以通过 `INSERT` 查询重新加载。

## 聚合物化视图示例 {#example-of-an-aggregated-materialized-view}

以下示例假设您有一个名为 `test` 的数据库，如果不存在，请创建它：

```sql
CREATE DATABASE test;
```

现在创建包含原始数据的表 `test.visits`：

``` sql
CREATE TABLE test.visits
 (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Sign Nullable(Int32),
    UserID Nullable(Int32)
) ENGINE = MergeTree ORDER BY (StartDate, CounterID);
```

接下来，您需要一个 `AggregatingMergeTree` 表，以存储跟踪访问总数和唯一用户数的 `AggregationFunction`。

创建一个监视 `test.visits` 表并使用 `AggregateFunction` 类型的 `AggregatingMergeTree` 物化视图：

``` sql
CREATE TABLE test.agg_visits (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Visits AggregateFunction(sum, Nullable(Int32)),
    Users AggregateFunction(uniq, Nullable(Int32))
)
ENGINE = AggregatingMergeTree() ORDER BY (StartDate, CounterID);
```

创建一个物化视图，将 `test.visits` 的数据填充到 `test.agg_visits` 中：

```sql
CREATE MATERIALIZED VIEW test.visits_mv TO test.agg_visits
AS SELECT
    StartDate,
    CounterID,
    sumState(Sign) AS Visits,
    uniqState(UserID) AS Users
FROM test.visits
GROUP BY StartDate, CounterID;
```

插入数据到 `test.visits` 表中：

``` sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1667446031000, 1, 3, 4), (1667446031000, 1, 6, 3);
```

数据已插入到 `test.visits` 和 `test.agg_visits` 中。

要获取聚合数据，执行一个如 `SELECT ... GROUP BY ...` 的查询，从物化视图 `test.mv_visits` 中获取的数据：

```sql
SELECT
    StartDate,
    sumMerge(Visits) AS Visits,
    uniqMerge(Users) AS Users
FROM test.agg_visits
GROUP BY StartDate
ORDER BY StartDate;
```

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │      9 │     2 │
└─────────────────────────┴────────┴───────┘
```

向 `test.visits` 添加另一两个记录，但这次尝试使用不同的时间戳插入其中一条记录：

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1669446031000, 2, 5, 10), (1667446031000, 3, 7, 5);
```

再次运行 `SELECT` 查询，将返回以下输出：

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │     16 │     3 │
│ 2022-11-26 07:00:31.000 │      5 │     1 │
└─────────────────────────┴────────┴───────┘
```

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
