---
description: 'SimpleAggregateFunction 数据类型的文档'
sidebar_label: 'SimpleAggregateFunction'
sidebar_position: 48
slug: /sql-reference/data-types/simpleaggregatefunction
title: 'SimpleAggregateFunction 类型'
doc_type: 'reference'
---

# SimpleAggregateFunction 类型 {#simpleaggregatefunction-type}

## 描述 {#description}

`SimpleAggregateFunction` 数据类型用于存储聚合函数的中间状态，但不会像 [`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md) 类型那样存储其完整状态。

此类优化适用于满足以下性质的函数：

> 将函数 `f` 应用于行集 `S1 UNION ALL S2` 的结果，可以通过分别对行集的各个部分应用 `f`，然后再对这些结果应用一次 `f` 获得：`f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`。

该性质保证仅使用部分聚合结果就足以计算出合并后的结果，因此无需存储和处理额外数据。例如，`min` 或 `max` 函数在从中间结果计算最终结果时不需要额外步骤；而 `avg` 函数则需要同时记录总和与计数，在最终的 `Merge` 步骤中合并中间状态后，再将两者相除即可得到平均值。

聚合函数的值通常是通过调用在函数名后追加 [`-SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 组合器的聚合函数来生成的。

## 语法 {#syntax}

```sql
SimpleAggregateFunction(聚合函数名, 参数类型...)
```

**参数**

* `aggregate_function_name` - 聚合函数名称。
* `Type` - 聚合函数参数类型。

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
`SimpleAggregateFunction(func, Type)` 的值都为相同的 `Type`，
因此与 `AggregateFunction` 类型不同，无需应用 `-Merge`/`-State` 组合器。

在使用相同聚合函数时，`SimpleAggregateFunction` 类型相比 `AggregateFunction`
具有更好的性能。
:::

## 示例 {#example}

```sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```

## 相关内容 {#related-content}

* 博文：[在 ClickHouse 中使用聚合函数组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)    - 博文：[在 ClickHouse 中使用聚合函数组合器](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
* [AggregateFunction](/sql-reference/data-types/aggregatefunction) 类型。
