---
description: 'SimpleAggregateFunction データ型に関するドキュメント'
sidebar_label: 'SimpleAggregateFunction'
sidebar_position: 48
slug: /sql-reference/data-types/simpleaggregatefunction
title: 'SimpleAggregateFunction 型'
doc_type: 'reference'
---

# SimpleAggregateFunction 型 \{#simpleaggregatefunction-type\}

## 説明 \{#description\}

`SimpleAggregateFunction` データ型は、[`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md) 型が保持するような集約関数の完全な状態ではなく、集約関数の中間状態のみを格納します。

この最適化は、次の性質を満たす関数に適用できます。

> 行集合 `S1 UNION ALL S2` に関数 `f` を適用した結果が、行集合の各部分に個別に `f` を適用し、その結果に対して再度 `f` を適用することで得られる場合:
> `f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`。

この性質により、結合された集約結果を計算するには部分集約結果だけで十分であり、余分なデータを保存および処理する必要がないことが保証されます。たとえば、`min` や `max` 関数の結果は、中間ステップから最終結果を計算するために追加の処理を必要としません。一方、`avg` 関数では、最終的に中間状態を結合する `Merge` ステップで平均値を求めるために、合計値と件数を保持しておく必要があります。これら 2 つを割り算することで平均値を求めます。

集約関数の値は通常、関数名に [`-SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) コンビネータを付与した集約関数を呼び出すことで生成されます。

## 構文 \{#syntax\}

```sql
SimpleAggregateFunction(aggregate_function_name, types_of_arguments...)
```

**パラメータ**

* `aggregate_function_name` - 集約関数の名前。
* `Type` - 集約関数の引数の型。


## サポートされている関数 \{#supported-functions\}

次の集約関数がサポートされています：

- [`any`](/sql-reference/aggregate-functions/reference/any.md)
- [`any_respect_nulls`](/sql-reference/aggregate-functions/reference/any.md)
- [`anyLast`](/sql-reference/aggregate-functions/reference/anyLast.md)
- [`anyLast_respect_nulls`](/sql-reference/aggregate-functions/reference/anyLast.md)
- [`min`](/sql-reference/aggregate-functions/reference/min.md)
- [`max`](/sql-reference/aggregate-functions/reference/max.md)
- [`sum`](/sql-reference/aggregate-functions/reference/sum.md)
- [`sumWithOverflow`](/sql-reference/aggregate-functions/reference/sumWithOverflow.md)
- [`groupBitAnd`](/sql-reference/aggregate-functions/reference/groupBitAnd.md)
- [`groupBitOr`](/sql-reference/aggregate-functions/reference/groupBitOr.md)
- [`groupBitXor`](/sql-reference/aggregate-functions/reference/groupBitXor.md)
- [`groupArrayArray`](/sql-reference/aggregate-functions/reference/groupArrayArray.md)
- [`groupUniqArrayArray`](../../sql-reference/aggregate-functions/reference/groupUniqArray.md)
- [`groupUniqArrayArrayMap`](../../sql-reference/aggregate-functions/combinators#-map)
- [`sumMap`](/sql-reference/aggregate-functions/reference/sumMap.md)
- [`minMap`](/sql-reference/aggregate-functions/reference/minMap.md)
- [`maxMap`](/sql-reference/aggregate-functions/reference/maxMap.md)

:::note
`SimpleAggregateFunction(func, Type)` の値はすべて同じ `Type` であるため、
`AggregateFunction` 型とは異なり `-Merge` / `-State` コンビネータを適用する
必要はありません。

同じ集約関数であれば、`SimpleAggregateFunction` 型のほうが
`AggregateFunction` よりも高いパフォーマンスを発揮します。
:::

## 例 \{#example\}

```sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```


## 関連コンテンツ \{#related-content\}

* ブログ: [ClickHouse で集約関数コンビネータを使用する](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)    - ブログ: [ClickHouse で集約関数コンビネータを使用する](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
* [AggregateFunction](/sql-reference/data-types/aggregatefunction) 型。