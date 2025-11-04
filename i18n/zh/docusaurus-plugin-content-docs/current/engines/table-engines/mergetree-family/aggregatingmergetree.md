---
'description': '用单行替换所有具有相同主键（或更准确地说，具有相同[排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的行（在单个数据分区中），该行存储聚合函数状态的组合。'
'sidebar_label': 'AggregatingMergeTree'
'sidebar_position': 60
'slug': '/engines/table-engines/mergetree-family/aggregatingmergetree'
'title': 'AggregatingMergeTree'
'doc_type': 'reference'
---


# AggregatingMergeTree

该引擎继承自 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)，改变了数据部分合并的逻辑。 ClickHouse 用单行（在单个数据部分内）替换所有具有相同主键（更准确地说，具有相同的 [排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的行，该行存储聚合函数状态的组合。

您可以使用 `AggregatingMergeTree` 表进行增量数据聚合，包括用于聚合物化视图。

您可以在下面的视频中查看如何使用 AggregatingMergeTree 和聚合函数的示例：
<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="Aggregation States in ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

该引擎处理所有类型的列：

- [`AggregateFunction`](../../../sql-reference/data-types/aggregatefunction.md)
- [`SimpleAggregateFunction`](../../../sql-reference/data-types/simpleaggregatefunction.md)

如果 `AggregatingMergeTree` 可以将行数减少几个数量级，则使用它是合适的。

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

有关请求参数的描述，请参见 [请求描述](../../../sql-reference/statements/create/table.md)。

**查询子句**

创建 `AggregatingMergeTree` 表时，所需的 [子句](../../../engines/table-engines/mergetree-family/mergetree.md) 与创建 `MergeTree` 表时相同。

<details markdown="1">

<summary>创建表的弃用方法</summary>

:::note
在新项目中请勿使用此方法，并且如果可能，请将旧项目切换到上述描述的方法。
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

要插入数据，请使用带有聚合状态函数的 [INSERT SELECT](../../../sql-reference/statements/insert-into.md) 查询。
从 `AggregatingMergeTree` 表中选择数据时，请使用 `GROUP BY` 子句和与插入数据时相同的聚合函数，但使用 `-Merge` 后缀。

在 `SELECT` 查询的结果中，`AggregateFunction` 类型的值具有特定实现的二进制表示，适用于所有 ClickHouse 输出格式。 例如，如果您使用 `SELECT` 查询将数据转储为 `TabSeparated` 格式，则可以使用 `INSERT` 查询将此转储加载回。

## 聚合物化视图示例 {#example-of-an-aggregated-materialized-view}

以下示例假设您有一个名为 `test` 的数据库。 如果尚不存在，请使用以下命令创建它：

```sql
CREATE DATABASE test;
```

现在创建包含原始数据的表 `test.visits`：

```sql
CREATE TABLE test.visits
 (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Sign Nullable(Int32),
    UserID Nullable(Int32)
) ENGINE = MergeTree ORDER BY (StartDate, CounterID);
```

接下来，您需要一个 `AggregatingMergeTree` 表，该表将存储 `AggregationFunction`，以跟踪访问总数和唯一用户数。

创建一个监控 `test.visits` 表的 `AggregatingMergeTree` 物化视图，并使用 [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 类型：

```sql
CREATE TABLE test.agg_visits (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Visits AggregateFunction(sum, Nullable(Int32)),
    Users AggregateFunction(uniq, Nullable(Int32))
)
ENGINE = AggregatingMergeTree() ORDER BY (StartDate, CounterID);
```

创建一个从 `test.visits` 填充 `test.agg_visits` 的物化视图：

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

将数据插入到 `test.visits` 表中：

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1667446031000, 1, 3, 4), (1667446031000, 1, 6, 3);
```

数据同时插入到 `test.visits` 和 `test.agg_visits`。

要获取聚合数据，请执行如下查询 `SELECT ... GROUP BY ...` 从物化视图 `test.visits_mv`：

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

再向 `test.visits` 添加一两个记录，但这次尝试为其中一条记录使用不同的时间戳：

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

在某些情况下，您可能希望避免在插入时预聚合行，以将聚合成本从插入时间转移到合并时间。 通常，必须在物化视图定义的 `GROUP BY` 子句中包含不属于聚合的列，以避免错误。 但是，您可以利用 [`initializeAggregation`](/sql-reference/functions/other-functions#initializeaggregation) 函数，并设置 `optimize_on_insert = 0`（默认启用）来实现这一点。 在这种情况下，不再需要使用 `GROUP BY`：

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
使用 `initializeAggregation` 时，为每一行创建一个聚合状态，而不进行分组。 每个源行在物化视图中产生一行，实际的聚合将在 `AggregatingMergeTree` 合并部分时发生。 只有在 `optimize_on_insert = 0` 时，这才成立。
:::

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
