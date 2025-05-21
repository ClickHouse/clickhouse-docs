---
'description': 'Documentation for the SimpleAggregateFunction data type'
'sidebar_label': 'SimpleAggregateFunction'
'sidebar_position': 48
'slug': '/sql-reference/data-types/simpleaggregatefunction'
'title': 'SimpleAggregateFunction Type'
---




# SimpleAggregateFunction 类型

## 描述 {#description}

`SimpleAggregateFunction` 数据类型存储聚合函数的中间状态，而不是像 [`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md) 类型那样的完整状态。

这种优化可以应用于满足以下性质的函数：

> 应用函数 `f` 到行集 `S1 UNION ALL S2` 的结果可以通过将 `f` 分别应用于行集的各个部分，然后再将 `f` 应用于结果来获得： `f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`。

这个性质保证了部分聚合结果足以计算组合结果，因此我们不必存储和处理任何额外的数据。例如，`min` 或 `max` 函数的结果计算从中间步骤到最终结果不需要额外的步骤，而 `avg` 函数需要跟踪一个总和和一个计数，最后在合并步骤中将它们相除以获取平均值。

聚合函数值通常是通过调用聚合函数并在函数名后面附加 [`-SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 组合器产生的。

## 语法 {#syntax}

```sql
SimpleAggregateFunction(aggregate_function_name, types_of_arguments...)
```

**参数**

- `aggregate_function_name` - 聚合函数的名称。
- `Type` - 聚合函数参数的类型。

## 支持的函数 {#supported-functions}

支持以下聚合函数：

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
`SimpleAggregateFunction(func, Type)` 的值具有相同的 `Type`，因此与 `AggregateFunction` 类型不同，不需要应用 `-Merge` / `-State` 组合器。

`SimpleAggregateFunction` 类型在相同聚合函数下的性能优于 `AggregateFunction` 。
:::

## 示例 {#example}

```sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```
## 相关内容 {#related-content}

- 博客: [在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)    - 博客: [在 ClickHouse 中使用聚合组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 类型。
