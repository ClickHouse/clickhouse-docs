
# AggregateFunction 类型

## 描述 {#description}

所有 [聚合函数](/sql-reference/aggregate-functions) 在 ClickHouse 中都有
特定实现的中间状态，可以序列化为 `AggregateFunction` 数据类型并存储在表中。这通常通过  
[物化视图](../../sql-reference/statements/create/view.md) 实现。

有两个聚合函数 [组合器](/sql-reference/aggregate-functions/combinators)
通常与 `AggregateFunction` 类型一起使用：

- [`-State`](/sql-reference/aggregate-functions/combinators#-state) 聚合函数组合器，当它附加到聚合
  函数名称时，产生 `AggregateFunction` 中间状态。
- [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 聚合
  函数组合器，用于从中间状态获取聚合的最终结果。

## 语法 {#syntax}

```sql
AggregateFunction(aggregate_function_name, types_of_arguments...)
```

**参数**

- `aggregate_function_name` - 聚合函数的名称。如果函数 
   是参数化的，则其参数也应指定。
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

要向具有 `AggregateFunction` 类型列的表中插入数据，可以 
使用带有聚合函数的 `INSERT SELECT` 和 
[`-State`](/sql-reference/aggregate-functions/combinators#-state) 聚合 
函数组合器。

例如，要插入 `AggregateFunction(uniq, UInt64)` 和 
`AggregateFunction(quantiles(0.5, 0.9), UInt64)` 类型的列，您可以使用以下 
组合器的聚合函数。

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

与函数 `uniq` 和 `quantiles` 相比，`uniqState` 和 `quantilesState`
（附加了 `-State` 组合器）返回状态，而不是最终值。
换句话说，它们返回 `AggregateFunction` 类型的值。

在 `SELECT` 查询的结果中，`AggregateFunction` 类型的值对于所有 ClickHouse 输出
格式都有特定实现的二进制表示。

例如，如果您通过 `SELECT` 查询将数据转储为 `TabSeparated` 格式，则可以使用 `INSERT` 查询将该转储加载回。

### 数据选择 {#data-selection}

从 `AggregatingMergeTree` 表中选择数据时，使用 `GROUP BY` 子句
和与插入数据时相同的聚合函数，但使用 [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 组合器。

带有 `-Merge` 组合器的聚合函数接收一组 
状态，组合它们，并返回完整数据聚合的结果。

例如，以下两个查询返回相同的结果：

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## 用法示例 {#usage-example}

有关 [AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) 引擎的描述，请参见。

## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate)
  组合器。
- [State](/sql-reference/aggregate-functions/combinators#-state) 组合器。
