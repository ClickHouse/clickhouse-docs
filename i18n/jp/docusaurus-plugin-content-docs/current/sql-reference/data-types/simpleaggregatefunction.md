---
description: 'SimpleAggregateFunction データ型に関するドキュメント'
sidebar_label: 'SimpleAggregateFunction'
sidebar_position: 48
slug: /sql-reference/data-types/simpleaggregatefunction
title: 'SimpleAggregateFunction 型'
doc_type: 'reference'
---



# SimpleAggregateFunction 型



## 説明 {#description}

`SimpleAggregateFunction`データ型は集約関数の中間状態を格納しますが、[`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md)型のような完全な状態は格納しません。

この最適化は、以下の性質を満たす関数に適用できます:

> 行セット`S1 UNION ALL S2`に関数`f`を適用した結果は、行セットの各部分に個別に`f`を適用し、その結果に再度`f`を適用することで得られる: `f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`。

この性質により、部分的な集約結果のみで結合後の結果を計算できることが保証されるため、余分なデータを保存・処理する必要がありません。例えば、`min`や`max`関数の結果は、中間ステップから最終結果を計算する際に追加の手順を必要としませんが、`avg`関数は合計と件数を追跡する必要があり、中間状態を結合する最終的な`Merge`ステップでこれらを除算して平均を求めます。

集約関数の値は、通常、関数名に[`-SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate)コンビネータを付加して集約関数を呼び出すことで生成されます。


## 構文 {#syntax}

```sql
SimpleAggregateFunction(aggregate_function_name, types_of_arguments...)
```

**パラメータ**

- `aggregate_function_name` - 集約関数の名前
- `Type` - 集約関数の引数の型


## サポートされている関数 {#supported-functions}

以下の集約関数がサポートされています：

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
`SimpleAggregateFunction(func, Type)` の値は同じ `Type` を持つため、`AggregateFunction` 型とは異なり、`-Merge`/`-State` コンビネータを適用する必要がありません。

`SimpleAggregateFunction` 型は、同じ集約関数において `AggregateFunction` 型よりも優れたパフォーマンスを発揮します。
:::


## 例 {#example}


```sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [AggregateFunction](/sql-reference/data-types/aggregatefunction) 型
