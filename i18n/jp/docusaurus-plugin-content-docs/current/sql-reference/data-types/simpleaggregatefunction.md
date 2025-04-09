---
slug: '/sql-reference/data-types/simpleaggregatefunction'
sidebar_position: 48
sidebar_label: 'SimpleAggregateFunction'
keywords:
  - SimpleAggregateFunction
description: 'SimpleAggregateFunction は、集約関数の中間的な状態を保存するデータ型です。'
---


# SimpleAggregateFunction

`SimpleAggregateFunction(name, types_of_arguments...)` データ型は、[`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md) が保持する完全な状態ではなく、集約関数の現在の値（中間状態）を保存します。この最適化は、次の特性を持つ関数に適用できます: 行セット `S1 UNION ALL S2` に関数 `f` を適用した結果は、行セットの部分にそれぞれ `f` を適用し、次にその結果に再度 `f` を適用することで得られます: `f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`。この特性は、部分的な集約結果が結合された結果を計算するのに十分であることを保証するため、余分なデータを保存および処理する必要がありません。

集約関数の値を生成する一般的な方法は、[-SimpleState](/sql-reference/aggregate-functions/combinators#-simplestate) サフィックスを付けて集約関数を呼び出すことです。

サポートされている集約関数は次のとおりです:

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
`SimpleAggregateFunction(func, Type)` の値は `Type` と同じように見え、保存されるため、`-Merge` / `-State` サフィックスのある関数を適用する必要はありません。

`SimpleAggregateFunction` は、同じ集約関数を持つ `AggregateFunction` よりも優れたパフォーマンスを持っています。
:::

**パラメータ**

- 集約関数の名前。
- 集約関数の引数のタイプ。

**例**

``` sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```
