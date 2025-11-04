---
'description': 'ClickHouse 中 AggregateFunction 数据类型的文档，存储聚合函数的中间状态'
'keywords':
- 'AggregateFunction'
- 'Type'
'sidebar_label': 'AggregateFunction'
'sidebar_position': 46
'slug': '/sql-reference/data-types/aggregatefunction'
'title': 'AggregateFunction 类型'
'doc_type': 'reference'
---


# AggregateFunction 类型

## 描述 {#description}

在 ClickHouse 中，所有的 [聚合函数](/sql-reference/aggregate-functions) 都有特定实现的中间状态，可以序列化为 `AggregateFunction` 数据类型并存储在表中。这通常通过 [物化视图](../../sql-reference/statements/create/view.md) 来完成。

有两种常用的聚合函数 [组合器](/sql-reference/aggregate-functions/combinators) 与 `AggregateFunction` 类型一起使用：

- [`-State`](/sql-reference/aggregate-functions/combinators#-state) 聚合函数组合器，当附加到聚合函数名称时，会生成 `AggregateFunction` 中间状态。
- [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 聚合函数组合器，用于从中间状态获取聚合的最终结果。

## 语法 {#syntax}

```sql
AggregateFunction(aggregate_function_name, types_of_arguments...)
```

**参数**

- `aggregate_function_name` - 聚合函数的名称。如果函数是参数化的，则还应指定其参数。
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

要向包含 `AggregateFunction` 类型列的表中插入数据，可以使用带有聚合函数和 [`-State`](/sql-reference/aggregate-functions/combinators#-state) 聚合函数组合器的 `INSERT SELECT`。

例如，要插入类型为 `AggregateFunction(uniq, UInt64)` 和 `AggregateFunction(quantiles(0.5, 0.9), UInt64)` 的列，可以使用以下带组合器的聚合函数。

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

与函数 `uniq` 和 `quantiles` 相对，`uniqState` 和 `quantilesState`（附加 `-State` 组合器）返回的是状态，而不是最终值。换句话说，它们返回的是 `AggregateFunction` 类型的值。

在 `SELECT` 查询的结果中，类型为 `AggregateFunction` 的值具有特定实现的二进制表示，适用于所有 ClickHouse 输出格式。

如果你将数据以 `TabSeparated` 格式转储到，例如，使用 `SELECT` 查询，则可以使用 `INSERT` 查询将其加载回。

### 数据选择 {#data-selection}

在从 `AggregatingMergeTree` 表中选择数据时，请使用 `GROUP BY` 子句和与插入数据时相同的聚合函数，但请使用 [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 组合器。

附加 `-Merge` 组合器的聚合函数接受一组状态，将它们组合，并返回完整数据聚合的结果。

例如，以下两个查询返回相同的结果：

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## 使用示例 {#usage-example}

参见 [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 引擎描述。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate) 组合器。
- [State](/sql-reference/aggregate-functions/combinators#-state) 组合器。
