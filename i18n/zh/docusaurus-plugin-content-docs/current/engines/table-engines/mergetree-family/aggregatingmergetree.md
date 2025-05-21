---
'description': '使用相同主键(或更准确地说，使用相同的[排序键](../../../engines/table-engines/mergetree-family/mergetree.md))的所有行替换为存储聚合函数状态组合的单个行(在单个数据部分内)。'
'sidebar_label': '聚合 MergeTree'
'sidebar_position': 60
'slug': '/engines/table-engines/mergetree-family/aggregatingmergetree'
'title': 'AggregatingMergeTree'
---




# AggregatingMergeTree

该引擎继承自 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)，改变了数据部分合并的逻辑。 ClickHouse 用一个单独的行（在一个数据部分内）替换所有具有相同主键（更准确地说，具有相同 [排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的行，该行存储聚合函数状态的结合。

您可以使用 `AggregatingMergeTree` 表进行增量数据聚合，包括聚合物化视图。

您可以在下面的视频中查看如何使用 AggregatingMergeTree 和聚合函数的示例：
<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="Aggregation States in ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

该引擎处理所有以下类型的列：

## [AggregateFunction](../../../sql-reference/data-types/aggregatefunction.md) {#aggregatefunction}
## [SimpleAggregateFunction](../../../sql-reference/data-types/simpleaggregatefunction.md) {#simpleaggregatefunction}

如果 `AggregatingMergeTree` 表减少了行数的数量级，那么使用它是合适的。

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

有关请求参数的说明，请参见 [请求描述](../../../sql-reference/statements/create/table.md)。

**查询子句**

创建 `AggregatingMergeTree` 表时，所需的 [子句](../../../engines/table-engines/mergetree-family/mergetree.md) 与创建 `MergeTree` 表时相同。

<details markdown="1">

<summary>创建表的已弃用方法</summary>

:::note
请勿在新项目中使用此方法，并尽可能将旧项目切换到上述描述的方法。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] AggregatingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

所有参数的含义与 `MergeTree` 中的相同。
</details>

## SELECT 和 INSERT {#select-and-insert}

要插入数据，请使用带有聚合状态函数的 [INSERT SELECT](../../../sql-reference/statements/insert-into.md) 查询。
从 `AggregatingMergeTree` 表中选择数据时，请使用 `GROUP BY` 子句和与插入数据时相同的聚合函数，但使用 `-Merge` 后缀。

在 `SELECT` 查询的结果中，`AggregateFunction` 类型的值对 ClickHouse 所有输出格式具有特定实现的二进制表示。例如，如果您将数据转储到 `TabSeparated` 格式中，然后使用 `SELECT` 查询，则该转储可以使用 `INSERT` 查询重新加载。

## 聚合物化视图示例 {#example-of-an-aggregated-materialized-view}

以下示例假设您有一个名为 `test` 的数据库，如果尚不存在，请创建它：

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

接下来，您需要一个 `AggregatingMergeTree` 表，该表将存储跟踪访问总次数和唯一用户数量的 `AggregationFunction`。

创建一个 `AggregatingMergeTree` 物化视图，监视 `test.visits` 表，并使用 `AggregateFunction` 类型：

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

向 `test.visits` 表插入数据：

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1667446031000, 1, 3, 4), (1667446031000, 1, 6, 3);
```

数据同时插入 `test.visits` 和 `test.agg_visits`。

要获取聚合数据，可以从物化视图 `test.visits_mv` 执行类似 `SELECT ... GROUP BY ...` 的查询：

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

向 `test.visits` 添加另外几条记录，但这次尝试为其中一条记录使用不同的时间戳：

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
