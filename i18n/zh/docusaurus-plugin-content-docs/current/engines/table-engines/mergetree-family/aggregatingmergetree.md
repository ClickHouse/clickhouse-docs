---
description: '将具有相同主键（更准确地说，具有相同[排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的所有行替换为单行（在单个数据部分内），该行存储聚合函数状态的组合。'
sidebar_label: 'AggregatingMergeTree'
sidebar_position: 60
slug: /engines/table-engines/mergetree-family/aggregatingmergetree
title: 'AggregatingMergeTree 表引擎'
doc_type: 'reference'
---



# AggregatingMergeTree 表引擎

该引擎继承自 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)，并修改了数据部分合并的逻辑。ClickHouse 会将所有具有相同主键（更准确地说，是相同[排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的行，在单个数据部分内合并为一行，该行存储的是各聚合函数状态的组合。

可以使用 `AggregatingMergeTree` 表进行增量数据聚合，包括用作聚合型物化视图的基础表。

下面的视频展示了一个使用 AggregatingMergeTree 和聚合函数的示例：
<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="Aggregation States in ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

该引擎会处理所有具有以下类型的列：

- [`AggregateFunction`](../../../sql-reference/data-types/aggregatefunction.md)
- [`SimpleAggregateFunction`](../../../sql-reference/data-types/simpleaggregatefunction.md)

当使用 `AggregatingMergeTree` 能够将行数减少若干数量级时，它是一个合适的选择。



## 创建表 {#creating-a-table}

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

有关请求参数的描述,请参阅[请求说明](../../../sql-reference/statements/create/table.md)。

**查询子句**

创建 `AggregatingMergeTree` 表时,所需的[子句](../../../engines/table-engines/mergetree-family/mergetree.md)与创建 `MergeTree` 表时相同。

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
) ENGINE [=] AggregatingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

所有参数的含义与 `MergeTree` 中相同。

</details>


## SELECT 和 INSERT {#select-and-insert}

要插入数据,请使用带有聚合 -State- 函数的 [INSERT SELECT](../../../sql-reference/statements/insert-into.md) 查询。
从 `AggregatingMergeTree` 表中查询数据时,使用 `GROUP BY` 子句以及与插入数据时相同的聚合函数,但需使用 `-Merge` 后缀。

在 `SELECT` 查询的结果中,`AggregateFunction` 类型的值在所有 ClickHouse 输出格式中都具有特定于实现的二进制表示形式。例如,如果使用 `SELECT` 查询将数据导出为 `TabSeparated` 格式,则可以使用 `INSERT` 查询将此导出数据重新加载。


## 聚合物化视图示例 {#example-of-an-aggregated-materialized-view}

以下示例假设您已有一个名为 `test` 的数据库。如果该数据库尚不存在,请使用以下命令创建:

```sql
CREATE DATABASE test;
```

现在创建包含原始数据的表 `test.visits`:

```sql
CREATE TABLE test.visits
 (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Sign Nullable(Int32),
    UserID Nullable(Int32)
) ENGINE = MergeTree ORDER BY (StartDate, CounterID);
```

接下来,您需要一个 `AggregatingMergeTree` 表来存储 `AggregationFunction`,用于跟踪访问总数和唯一用户数。

创建一个 `AggregatingMergeTree` 物化视图来监视 `test.visits` 表,并使用 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 类型:

```sql
CREATE TABLE test.agg_visits (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Visits AggregateFunction(sum, Nullable(Int32)),
    Users AggregateFunction(uniq, Nullable(Int32))
)
ENGINE = AggregatingMergeTree() ORDER BY (StartDate, CounterID);
```

创建一个物化视图,从 `test.visits` 填充 `test.agg_visits`:

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

向 `test.visits` 表插入数据:

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1667446031000, 1, 3, 4), (1667446031000, 1, 6, 3);
```

数据会同时插入到 `test.visits` 和 `test.agg_visits` 中。

要获取聚合数据,请从物化视图 `test.visits_mv` 执行类似 `SELECT ... GROUP BY ...` 的查询:

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

向 `test.visits` 再添加几条记录,但这次为其中一条记录使用不同的时间戳:

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1669446031000, 2, 5, 10), (1667446031000, 3, 7, 5);
```

再次运行 `SELECT` 查询,将返回以下输出:

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │     16 │     3 │
│ 2022-11-26 07:00:31.000 │      5 │     1 │
└─────────────────────────┴────────┴───────┘
```

在某些情况下,您可能希望避免在插入时预聚合行,以将聚合开销从插入时转移到合并时。通常情况下,需要在物化视图定义的 `GROUP BY` 子句中包含不参与聚合的列以避免错误。但是,您可以使用 [`initializeAggregation`](/sql-reference/functions/other-functions#initializeAggregation) 函数并设置 `optimize_on_insert = 0`(默认为开启)来实现这一点。在这种情况下,不再需要使用 `GROUP BY`:

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
在使用 `initializeAggregation` 时，会为每一行单独创建一个未分组的聚合状态。
每一行源数据都会在物化视图中生成一行，实际的聚合会在之后由 `AggregatingMergeTree` 在合并数据分片时完成。这仅在 `optimize_on_insert = 0` 时成立。
:::



## 相关内容 {#related-content}

- 博客：[在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
