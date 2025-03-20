---
slug: /sql-reference/data-types/simpleaggregatefunction
sidebar_position: 48
sidebar_label: SimpleAggregateFunction
---

# SimpleAggregateFunction

`SimpleAggregateFunction(name, types_of_arguments...)` 数据类型存储聚合函数的当前值（中间状态），而不是其完整状态，如 [`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md) 所做的那样。 
此优化可以应用于满足以下属性的函数：将函数 `f` 应用于行集 `S1 UNION ALL S2` 的结果可以通过分别对行集的部分应用 `f`，然后对结果再次应用 `f` 来获得： `f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`。 
该属性保证部分聚合结果足以计算组合结果，因此我们不必存储和处理任何额外数据。

产生聚合函数值的常见方法是调用带有 `[-SimpleState](/sql-reference/aggregate-functions/combinators#-simplestate)` 后缀的聚合函数。

支持以下聚合函数：

- [`any`](/sql-reference/aggregate-functions/reference/any)
- [`anyLast`](/sql-reference/aggregate-functions/reference/anylast)
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
`SimpleAggregateFunction(func, Type)` 的值与 `Type` 的外观和存储方式相同，因此您不需要使用 `-Merge` / `-State` 后缀来应用函数。

`SimpleAggregateFunction` 的性能优于具有相同聚合函数的 `AggregateFunction`。
:::

**参数**

- 聚合函数的名称。
- 聚合函数参数的类型。

**示例**

``` sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```
