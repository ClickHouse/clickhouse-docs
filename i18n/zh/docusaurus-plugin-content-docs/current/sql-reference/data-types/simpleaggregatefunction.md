---
'description': 'SimpleAggregateFunction 数据类型的文档'
'sidebar_label': 'SimpleAggregateFunction'
'sidebar_position': 48
'slug': '/sql-reference/data-types/simpleaggregatefunction'
'title': 'SimpleAggregateFunction 类型'
'doc_type': 'reference'
---


# SimpleAggregateFunction 类型

## 描述 {#description}

`SimpleAggregateFunction` 数据类型存储了聚合函数的中间状态，但不包括其完整状态，如 [`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md) 类型所做的那样。

此优化可应用于满足以下属性的函数：

> 对于行集 `S1 UNION ALL S2`，应用函数 `f` 的结果可以通过分别对行集的部分应用 `f`，然后再对结果应用 `f` 得到：`f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`。

该属性保证部分聚合结果足以计算组合结果，因此我们无需存储和处理任何额外数据。例如，`min` 或 `max` 函数的结果在从中间步骤计算最终结果时不需要额外步骤，而 `avg` 函数需要跟踪一个总和和一个计数，这将在最终的 `Merge` 步骤中进行除法以获得平均值。

聚合函数的值通常是通过调用附有 [`-SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 组合器的聚合函数来生成的。

## 语法 {#syntax}

```sql
SimpleAggregateFunction(aggregate_function_name, types_of_arguments...)
```

**参数**

- `aggregate_function_name` - 聚合函数的名称。
- `Type` - 聚合函数参数的类型。

## 支持的函数 {#supported-functions}

以下聚合函数是受支持的：

- [`any`](/sql-reference/aggregate-functions/reference/any)
- [`any_respect_nulls`](/sql-reference/aggregate-functions/reference/any)
- [`anyLast`](/sql-reference/aggregate-functions/reference/anylast)
- [`anyLast_respect_nulls`](/sql-reference/aggregate-functions/reference/anylast)
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`sumWithOverflow`](/sql-reference/aggregate-functions/reference/sumwithoverflow)
- [`groupBitAnd`](/sql-reference/aggregate-functions/reference/groupbitand)
- [`groupBitOr`](/sql-reference/aggregate-functions/reference/groupbitor)
- [`groupBitXor`](/sql-reference/aggregate-functions/reference/groupbitxor)
- [`groupArrayArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`groupUniqArrayArray`](../../sql-reference/aggregate-functions/reference/groupuniqarray.md)
- [`groupUniqArrayArrayMap`](../../sql-reference/aggregate-functions/combinators#-map)
- [`sumMap`](/sql-reference/aggregate-functions/reference/summap)
- [`minMap`](/sql-reference/aggregate-functions/reference/minmap)
- [`maxMap`](/sql-reference/aggregate-functions/reference/maxmap)

:::note
`SimpleAggregateFunction(func, Type)` 的值具有相同的 `Type`，因此与 `AggregateFunction` 类型不同，无需应用 `-Merge`/`-State` 组合器。

`SimpleAggregateFunction` 类型在相同聚合函数下比 `AggregateFunction` 类型具有更好的性能。
:::

## 示例 {#example}

```sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```
## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)    - 博客: [在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 类型。
