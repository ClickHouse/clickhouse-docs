---
slug: /sql-reference/data-types/aggregatefunction
sidebar_position: 46
sidebar_label: AggregateFunction
---


# AggregateFunction

聚合函数具有实现定义的中间状态，可以序列化为 `AggregateFunction(...)` 数据类型并存储在表中，通常通过 [物化视图](../../sql-reference/statements/create/view.md) 实现。生成聚合函数状态的常见方法是调用带有 `-State` 后缀的聚合函数。要在将来获取聚合的最终结果，必须使用相同的聚合函数并添加 `-Merge` 后缀。

`AggregateFunction(name, types_of_arguments...)` — 参数化数据类型。

**参数**

- 聚合函数的名称。如果函数是参数化的，请同时指定其参数。

- 聚合函数参数的类型。

**示例**

``` sql
CREATE TABLE t
(
    column1 AggregateFunction(uniq, UInt64),
    column2 AggregateFunction(anyIf, String, UInt8),
    column3 AggregateFunction(quantiles(0.5, 0.9), UInt64)
) ENGINE = ...
```

[uniq](/sql-reference/aggregate-functions/reference/uniq)、anyIf ([any](/sql-reference/aggregate-functions/reference/any)+[If](/sql-reference/aggregate-functions/combinators#-if)) 和 [quantiles](../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) 是 ClickHouse 中支持的聚合函数。

## 用法 {#usage}

### 数据插入 {#data-insertion}

要插入数据，使用带有聚合 `-State` 函数的 `INSERT SELECT`。

**函数示例**

``` sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

与相应的函数 `uniq` 和 `quantiles` 相比，`-State` 函数返回状态，而不是最终值。换句话说，它们返回 `AggregateFunction` 类型的值。

在 `SELECT` 查询的结果中，`AggregateFunction` 类型的值具有实现特定的二进制表示，适用于所有 ClickHouse 输出格式。如果将数据导出到，比如说 `TabSeparated` 格式的 `SELECT` 查询中，那么可以使用 `INSERT` 查询将其加载回来。

### 数据选择 {#data-selection}

从 `AggregatingMergeTree` 表选择数据时，请使用 `GROUP BY` 子句和与插入数据时相同的聚合函数，但使用 `-Merge` 后缀。

带有 `-Merge` 后缀的聚合函数接受一组状态，结合这些状态并返回完整数据聚合的结果。

例如，以下两个查询返回相同的结果：

``` sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## 用法示例 {#usage-example}

请参阅 [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 引擎说明。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
