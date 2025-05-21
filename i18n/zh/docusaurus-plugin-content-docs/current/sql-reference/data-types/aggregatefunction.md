---
'description': 'Documentation for the AggregateFunction data type in ClickHouse, which
  stores intermediate states of aggregate functions'
'keywords':
- 'AggregateFunction'
- 'Type'
'sidebar_label': 'AggregateFunction'
'sidebar_position': 46
'slug': '/sql-reference/data-types/aggregatefunction'
'title': 'AggregateFunction Type'
---




# AggregateFunction 类型

## 描述 {#description}

所有 [聚合函数](/sql-reference/aggregate-functions) 在 ClickHouse 中都有一个特定实现的中间状态，该状态可以序列化为 `AggregateFunction` 数据类型并存储在表中。这通常是通过 [物化视图](../../sql-reference/statements/create/view.md) 完成的。

有两种聚合函数 [组合器](/sql-reference/aggregate-functions/combinators) 通常与 `AggregateFunction` 类型一起使用：

- [`-State`](/sql-reference/aggregate-functions/combinators#-state) 聚合函数组合器，当附加到聚合函数名称时，会生成 `AggregateFunction` 的中间状态。
- [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 聚合函数组合器，用于从中间状态获取聚合的最终结果。

## 语法 {#syntax}

```sql
AggregateFunction(aggregate_function_name, types_of_arguments...)
```

**参数**

- `aggregate_function_name` - 聚合函数的名称。如果该函数是参数化的，则应同时指定其参数。
- `types_of_arguments` - 聚合函数参数的数据类型。

例如：

```sql
CREATE TABLE t
(
    column1 AggregateFunction(uniq, UInt64),
    column2 AggregateFunction(anyIf, String, UInt8),
    column3 AggregateFunction(quantiles(0.5, 0.9), UInt64)
) ENGINE = ...
```

## 使用方法 {#usage}

### 数据插入 {#data-insertion}

要将数据插入到具有 `AggregateFunction` 类型列的表中，可以使用 `INSERT SELECT` 结合聚合函数和 [`-State`](/sql-reference/aggregate-functions/combinators#-state) 聚合函数组合器。

例如，要插入到类型为 `AggregateFunction(uniq, UInt64)` 和 `AggregateFunction(quantiles(0.5, 0.9), UInt64)` 的列中，可以使用以下聚合函数和组合器。

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

与函数 `uniq` 和 `quantiles` 相比，`uniqState` 和 `quantilesState`（附加了 `-State` 组合器）返回的是状态，而不是最终值。换句话说，它们返回的是 `AggregateFunction` 类型的值。

在 `SELECT` 查询的结果中，类型为 `AggregateFunction` 的值在所有 ClickHouse 输出格式中都有特定实现的二进制表示。

如果您将数据转储到例如 `TabSeparated` 格式中，可以使用 `SELECT` 查询进行此操作，则可以使用 `INSERT` 查询将此转储加载回去。

### 数据选择 {#data-selection}

从 `AggregatingMergeTree` 表中选择数据时，使用 `GROUP BY` 子句和与插入数据时相同的聚合函数，但要使用 [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 组合器。

附加具有 `-Merge` 组合器的聚合函数接受一组状态，将其组合，并返回完整数据聚合的结果。

例如，以下两个查询返回相同的结果：

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## 使用示例 {#usage-example}

请参见 [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 引擎描述。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate) 组合器。
- [State](/sql-reference/aggregate-functions/combinators#-state) 组合器。
