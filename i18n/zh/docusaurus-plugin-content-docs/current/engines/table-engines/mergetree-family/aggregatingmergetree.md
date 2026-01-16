---
description: '将具有相同主键（更准确地说，具有相同[排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的所有行替换为一行（位于同一个数据片段中），该行存储聚合函数状态的组合。'
sidebar_label: 'AggregatingMergeTree'
sidebar_position: 60
slug: /engines/table-engines/mergetree-family/aggregatingmergetree
title: 'AggregatingMergeTree 表引擎'
doc_type: 'reference'
---

# AggregatingMergeTree 表引擎 \\{#aggregatingmergetree-table-engine\\}

该引擎继承自 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)，并对数据部分的合并逻辑进行了调整。ClickHouse 会将所有具有相同主键（更准确地说，是具有相同[排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的行在单个数据部分内合并为一行，该行存储了聚合函数状态的组合。

可以将 `AggregatingMergeTree` 表用于增量数据聚合，包括聚合型物化视图。

你可以在下面的视频中查看如何使用 AggregatingMergeTree 和聚合函数的示例：
<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="Aggregation States in ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

该引擎会处理所有具有以下类型的列：

- [`AggregateFunction`](../../../sql-reference/data-types/aggregatefunction.md)
- [`SimpleAggregateFunction`](../../../sql-reference/data-types/simpleaggregatefunction.md)

当使用 `AggregatingMergeTree` 能够将行数减少若干个数量级时，就适合采用该引擎。

## 创建表 \\{#creating-a-table\\}

```sql
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

有关请求参数的说明，请参阅[请求描述](../../../sql-reference/statements/create/table.md)。

**查询子句**

在创建 `AggregatingMergeTree` 表时，所需的[子句](../../../engines/table-engines/mergetree-family/mergetree.md)与创建 `MergeTree` 表时相同。

<details markdown="1">
  <summary>已弃用的建表方法</summary>

  :::note
  不要在新项目中使用此方法，并尽可能将旧项目迁移到上文所述的方法。
  :::

  ```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] AggregatingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

  所有参数的含义都与 `MergeTree` 引擎中的相同。
</details>

## SELECT 和 INSERT \\{#select-and-insert\\}

要插入数据，请使用包含带有 `-State` 后缀聚合函数的 [INSERT SELECT](../../../sql-reference/statements/insert-into.md) 查询。
从 `AggregatingMergeTree` 表中选择数据时，使用 `GROUP BY` 子句，并使用与插入数据时相同的聚合函数，但需改用带有 `-Merge` 后缀的版本。

在 `SELECT` 查询的结果中，`AggregateFunction` 类型的值在所有 ClickHouse 输出格式中都采用与实现相关的二进制表示形式。例如，如果使用 `SELECT` 查询将数据转储为 `TabSeparated` 格式，则可以通过 `INSERT` 查询将该转储重新加载回去。

## 聚合物化视图示例 \\{#example-of-an-aggregated-materialized-view\\}

以下示例假设已存在名为 `test` 的数据库。如尚不存在，请使用以下命令创建：

```sql
CREATE DATABASE test;
```

现在创建表 `test.visits`，用于存放原始数据：

```sql
CREATE TABLE test.visits
 (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Sign Nullable(Int32),
    UserID Nullable(Int32)
) ENGINE = MergeTree ORDER BY (StartDate, CounterID);
```

接下来，您需要一个 `AggregatingMergeTree` 表，用于存储 `AggregationFunction`，以记录访问总次数和唯一用户数量。

创建一个使用 `AggregatingMergeTree` 的物化视图，用于监听 `test.visits` 表，并使用 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 类型：

```sql
CREATE TABLE test.agg_visits (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Visits AggregateFunction(sum, Nullable(Int32)),
    Users AggregateFunction(uniq, Nullable(Int32))
)
ENGINE = AggregatingMergeTree() ORDER BY (StartDate, CounterID);
```

创建一个物化视图，将 `test.visits` 的数据写入 `test.agg_visits`：

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

向 `test.visits` 表中插入数据：

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1667446031000, 1, 3, 4), (1667446031000, 1, 6, 3);
```

数据会被插入到 `test.visits` 和 `test.agg_visits` 表中。

要获取聚合后的数据，可以对物化视图 `test.visits_mv` 执行类似 `SELECT ... GROUP BY ...` 的查询：

```sql
SELECT
    StartDate,
    sumMerge(Visits) AS Visits,
    uniqMerge(Users) AS Users
FROM test.visits_mv
GROUP BY StartDate
ORDER BY StartDate;
```

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │      9 │     2 │
└─────────────────────────┴────────┴───────┘
```

向 `test.visits` 再添加两条记录，但这次请为其中一条记录使用不同的时间戳：

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1669446031000, 2, 5, 10), (1667446031000, 3, 7, 5);
```

再次运行 `SELECT` 查询，此时会返回如下输出：

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │     16 │     3 │
│ 2022-11-26 07:00:31.000 │      5 │     1 │
└─────────────────────────┴────────┴───────┘
```

在某些情况下，您可能希望在插入时避免对行进行预聚合，而是将聚合的开销从插入阶段转移到合并阶段。通常，为了避免报错，必须在物化视图定义的 `GROUP BY` 子句中包含那些不参与聚合的列。不过，您可以结合使用 [`initializeAggregation`](/sql-reference/functions/other-functions#initializeAggregation) 函数，并将 `optimize_on_insert = 0`（默认值为开启）来实现这一点。在这种情况下，就不再需要使用 `GROUP BY` 了：

```sql
CREATE MATERIALIZED VIEW test.visits_mv TO test.agg_visits
AS SELECT
    StartDate,
    CounterID,
    initializeAggregation('sumState', Sign) AS Visits,
    initializeAggregation('uniqState', UserID) AS Users
FROM test.visits;
```

:::note
在使用 `initializeAggregation` 时，会为每一行单独创建一个聚合状态，而不进行分组。
每一行源数据会在物化视图中生成一行，实际的聚合操作会在稍后 `AggregatingMergeTree` 合并数据分片（parts）时进行。仅当 `optimize_on_insert = 0` 时才是如此。
:::

## 相关内容 \\{#related-content\\}

- 博客文章：[在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
