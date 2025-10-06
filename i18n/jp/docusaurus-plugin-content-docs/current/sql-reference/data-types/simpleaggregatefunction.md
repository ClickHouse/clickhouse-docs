---
'description': 'SimpleAggregateFunction データ型に関する Documentation'
'sidebar_label': 'SimpleAggregateFunction'
'sidebar_position': 48
'slug': '/sql-reference/data-types/simpleaggregatefunction'
'title': 'SimpleAggregateFunction タイプ'
'doc_type': 'reference'
---


# SimpleAggregateFunction タイプ

## 説明 {#description}

`SimpleAggregateFunction` データタイプは、集約関数の中間状態を格納しますが、完全な状態は [`AggregateFunction`](../../sql-reference/data-types/aggregatefunction.md) タイプが行います。

この最適化は、次のプロパティが成り立つ関数に適用できます：

> 行セット `S1 UNION ALL S2` に関数 `f` を適用した結果は、行セットの各部分に対して `f` を別々に適用し、その結果に再び `f` を適用することで得られます：`f(S1 UNION ALL S2) = f(f(S1) UNION ALL f(S2))`。

このプロパティは、部分的な集計結果が結合された結果を計算するのに十分であることを保証します。したがって、追加のデータを格納して処理する必要はありません。たとえば、`min` または `max` 関数の結果は、中間的なステップから最終結果を計算するために追加の手順を必要としませんが、`avg` 関数は合計とカウントを追跡する必要があり、最終的な `Merge` ステップでこれを割って平均を取得します。

集約関数の値は、関数名に [`-SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) コンビネータを付加することで、集約関数を呼び出すことによって一般的に生成されます。

## 構文 {#syntax}

```sql
SimpleAggregateFunction(aggregate_function_name, types_of_arguments...)
```

**パラメータ**

- `aggregate_function_name` - 集約関数の名前。
- `Type` - 集約関数引数の型。

## サポートされる関数 {#supported-functions}

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
`SimpleAggregateFunction(func, Type)` の値は同じ `Type` を持ちます。したがって、`AggregateFunction` タイプとは異なり、`-Merge` / `-State` コンビネータを適用する必要はありません。

`SimpleAggregateFunction` タイプは、同じ集約関数に対して `AggregateFunction` よりも優れたパフォーマンスを持っています。
:::

## 例 {#example}

```sql
CREATE TABLE simple (id UInt64, val SimpleAggregateFunction(sum, Double)) ENGINE=AggregatingMergeTree ORDER BY id;
```
## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)    - ブログ: [ClickHouseにおける集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [AggregateFunction](/sql-reference/data-types/aggregatefunction) タイプ。
