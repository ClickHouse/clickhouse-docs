---
slug: /sql-reference/data-types/simpleaggregatefunction
sidebar_position: 48
sidebar_label: SimpleAggregateFunction
---
# SimpleAggregateFunction

`SimpleAggregateFunction(name, types_of_arguments...)` データ型は、集約関数の現在の値（中間状態）を保存しますが、[`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md) のようにその完全な状態は保存しません。この最適化は、以下の特性を持つ関数に適用できます：関数 `f` を行セット `S1 UNION ALL S2` に適用した結果は、行セットの部分にそれぞれ `f` を適用し、さらにその結果に `f` を再適用することによって得られます：`f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`。この特性は、部分的な集約結果が組み合わせた結果を計算するのに十分であることを保証するため、追加のデータを保存したり処理する必要はありません。

集約関数の値を生成する一般的な方法は、[-SimpleState](../../sql-reference/aggregate-functions/combinators.md#agg-functions-combinator-simplestate) サフィックスを持つ集約関数を呼び出すことです。

以下の集約関数がサポートされています：

- [`any`](../../sql-reference/aggregate-functions/reference/any.md#agg_function-any)
- [`anyLast`](../../sql-reference/aggregate-functions/reference/anylast.md#anylastx)
- [`min`](../../sql-reference/aggregate-functions/reference/min.md#agg_function-min)
- [`max`](../../sql-reference/aggregate-functions/reference/max.md#agg_function-max)
- [`sum`](../../sql-reference/aggregate-functions/reference/sum.md#agg_function-sum)
- [`sumWithOverflow`](../../sql-reference/aggregate-functions/reference/sumwithoverflow.md#sumwithoverflowx)
- [`groupBitAnd`](../../sql-reference/aggregate-functions/reference/groupbitand.md#groupbitand)
- [`groupBitOr`](../../sql-reference/aggregate-functions/reference/groupbitor.md#groupbitor)
- [`groupBitXor`](../../sql-reference/aggregate-functions/reference/groupbitxor.md#groupbitxor)
- [`groupArrayArray`](../../sql-reference/aggregate-functions/reference/grouparray.md#agg_function-grouparray)
- [`groupUniqArrayArray`](../../sql-reference/aggregate-functions/reference/groupuniqarray.md)
- [`groupUniqArrayArrayMap`](../../sql-reference/aggregate-functions/combinators#-map)
- [`sumMap`](../../sql-reference/aggregate-functions/reference/summap.md#agg_functions-summap)
- [`minMap`](../../sql-reference/aggregate-functions/reference/minmap.md#agg_functions-minmap)
- [`maxMap`](../../sql-reference/aggregate-functions/reference/maxmap.md#agg_functions-maxmap)

:::note
`SimpleAggregateFunction(func, Type)` の値は、`Type` と同じように見え、保存されるため、`-Merge`/`-State` サフィックスを使って関数を適用する必要はありません。

`SimpleAggregateFunction` は、同じ集約関数を持つ `AggregateFunction` よりもパフォーマンスが優れています。
:::

**パラメータ**

- 集約関数の名前。
- 集約関数引数の型。

**例**

``` sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```
