---
description: 'SimpleAggregateFunction データ型のドキュメント'
sidebar_label: 'SimpleAggregateFunction'
sidebar_position: 48
slug: /sql-reference/data-types/simpleaggregatefunction
title: 'SimpleAggregateFunction タイプ'
---


# SimpleAggregateFunction タイプ

## 説明 {#description}

`SimpleAggregateFunction` データ型は、集約関数の中間状態を格納しますが、[`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md) 型が持つ完全な状態は格納しません。

この最適化は、次の性質が成り立つ関数に適用できます：

> 行セット `S1 UNION ALL S2` に関数 `f` を適用した結果は、行セットの部分に `f` をそれぞれ適用し、その結果に再度 `f` を適用することによって得られます：`f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`。

この性質により、部分的な集約結果が結合された結果を計算するのに十分であり、余分なデータを保存したり処理したりする必要はありません。たとえば、`min` または `max` 関数の結果は、中間ステップから最終結果を計算するために余分なステップを必要とせず、`avg` 関数は合計とカウントを追跡する必要があります。これらは最終的な `Merge` ステップで平均を得るために分割されます。

集約関数の値は、[`-SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 組み合わせ子を関数名に追加して集約関数を呼び出すことで一般的に生成されます。

## 文法 {#syntax}

```sql
SimpleAggregateFunction(aggregate_function_name, types_of_arguments...)
```

**パラメータ**

- `aggregate_function_name` - 集約関数の名前。
- `Type` - 集約関数引数の型。

## サポートされている関数 {#supported-functions}

サポートされている集約関数は以下の通りです：

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
`SimpleAggregateFunction(func, Type)` の値は同じ `Type` を持つため、`AggregateFunction` 型とは異なり `-Merge` / `-State` 組み合わせ子を適用する必要はありません。

`SimpleAggregateFunction` 型は、同じ集約関数に対して `AggregateFunction` よりも優れたパフォーマンスを持ちます。
:::

## 例 {#example}

```sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```
## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における集約コンビネーターの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)  
- [AggregateFunction](/sql-reference/data-types/aggregatefunction) 型。
