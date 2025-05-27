---
'description': 'ClickHouse 中 AggregateFunction 数据类型的文档，它存储聚合函数的中间状态'
'keywords':
- 'AggregateFunction'
- 'Type'
'sidebar_label': 'AggregateFunction'
'sidebar_position': 46
'slug': '/sql-reference/data-types/aggregatefunction'
'title': 'AggregateFunction 类型'
---


# AggregateFunction 类型

## 描述 {#description}

ClickHouse 中的所有 [聚合函数](/sql-reference/aggregate-functions) 都具有特定实现的中间状态，可以序列化为 `AggregateFunction` 数据类型并存储在表中。通常通过 [物化视图](../../sql-reference/statements/create/view.md) 来实现这一点。

常用的两种聚合函数 [组合子](/sql-reference/aggregate-functions/combinators) 与 `AggregateFunction` 类型一起使用：

- [`-State`](/sql-reference/aggregate-functions/combinators#-state) 聚合函数组合子，附加到聚合函数名称后，生成 `AggregateFunction` 中间状态。
- [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 聚合函数组合子，用于从中间状态中获取聚合的最终结果。

## 语法 {#syntax}

```sql
AggregateFunction(aggregate_function_name, types_of_arguments...)
```

**参数**

- `aggregate_function_name` - 聚合函数的名称。如果函数是参数化的，则其参数也应被指定。
- `types_of_arguments` - 聚合函数参数的类型。

例如：

```sql
CREATE TABLE t
(
    column1 AggregateFunction(uniq, UInt64),
    column2 AggregateFunction(anyIf, String, UInt8),
    column3 AggregateFunction(quantiles(0.5, 0.9), UInt64)
) ENGINE = ...
```

## 用法 {#usage}

### 数据插入 {#data-insertion}

要将数据插入到具有 `AggregateFunction` 类型的列的表中，可以使用 `INSERT SELECT` 与聚合函数以及
[`-State`](/sql-reference/aggregate-functions/combinators#-state) 聚合函数组合子。

例如，要插入类型为 `AggregateFunction(uniq, UInt64)` 和 `AggregateFunction(quantiles(0.5, 0.9), UInt64)` 的列，你可以使用以下带组合子的聚合函数。

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

与函数 `uniq` 和 `quantiles` 不同，`uniqState` 和 `quantilesState` 
（附加了 `-State` 组合子）返回状态，而不是最终值。
换句话说，它们返回的是 `AggregateFunction` 类型的值。

在 `SELECT` 查询的结果中，`AggregateFunction` 类型的值对于所有 ClickHouse 输出格式具有特定实现的二进制表示。

如果你将数据导出到例如 `TabSeparated` 格式并使用 `SELECT` 查询，则可以通过 `INSERT` 查询将此转储加载回。

### 数据选择 {#data-selection}

从 `AggregatingMergeTree` 表选择数据时，使用 `GROUP BY` 子句，以及在插入数据时所用的相同聚合函数，但使用 
[`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 组合子。

附加 `-Merge` 组合子的聚合函数接受一组状态，合并它们，并返回完整数据聚合的结果。

例如，以下两个查询返回相同的结果：

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## 用法示例 {#usage-example}

见 [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 引擎描述。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中使用聚合组合子](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate) 组合子。
- [State](/sql-reference/aggregate-functions/combinators#-state) 组合子。
