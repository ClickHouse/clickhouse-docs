---
description: '集約関数の中間状態を保持する ClickHouse の AggregateFunction 型に関するドキュメント'
keywords: ['AggregateFunction', 'Type']
sidebar_label: 'AggregateFunction'
sidebar_position: 46
slug: /sql-reference/data-types/aggregatefunction
title: 'AggregateFunction 型'
doc_type: 'reference'
---



# AggregateFunction 型



## Description {#description}

ClickHouseのすべての[集約関数](/sql-reference/aggregate-functions)には、実装固有の中間状態があり、これを`AggregateFunction`データ型にシリアル化してテーブルに保存できます。これは通常、[マテリアライズドビュー](../../sql-reference/statements/create/view.md)を用いて行われます。

`AggregateFunction`型と共によく使用される2つの集約関数[コンビネータ](/sql-reference/aggregate-functions/combinators)があります:

- [`-State`](/sql-reference/aggregate-functions/combinators#-state)集約関数コンビネータ:集約関数名に付加すると、`AggregateFunction`の中間状態を生成します。
- [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge)集約関数コンビネータ:中間状態から集約の最終結果を取得するために使用されます。


## 構文 {#syntax}

```sql
AggregateFunction(aggregate_function_name, types_of_arguments...)
```

**パラメータ**

- `aggregate_function_name` - 集約関数の名前。関数がパラメトリックの場合、そのパラメータも指定する必要があります。
- `types_of_arguments` - 集約関数の引数の型。

例:

```sql
CREATE TABLE t
(
    column1 AggregateFunction(uniq, UInt64),
    column2 AggregateFunction(anyIf, String, UInt8),
    column3 AggregateFunction(quantiles(0.5, 0.9), UInt64)
) ENGINE = ...
```


## 使用方法 {#usage}

### データの挿入 {#data-insertion}

`AggregateFunction`型のカラムを持つテーブルにデータを挿入するには、集約関数と[`-State`](/sql-reference/aggregate-functions/combinators#-state)集約関数コンビネータを使用した`INSERT SELECT`を利用できます。

例えば、`AggregateFunction(uniq, UInt64)`型と`AggregateFunction(quantiles(0.5, 0.9), UInt64)`型のカラムに挿入する場合、以下のコンビネータ付き集約関数を使用します。

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

`uniq`関数や`quantiles`関数とは対照的に、`uniqState`と`quantilesState`（`-State`コンビネータが付加されたもの）は最終値ではなく状態を返します。つまり、これらは`AggregateFunction`型の値を返します。

`SELECT`クエリの結果において、`AggregateFunction`型の値は、すべてのClickHouse出力フォーマットに対して実装固有のバイナリ表現を持ちます。

例えば、`SELECT`クエリで`TabSeparated`フォーマットにデータをダンプした場合、このダンプは`INSERT`クエリを使用して再度読み込むことができます。

### データの選択 {#data-selection}

`AggregatingMergeTree`テーブルからデータを選択する際は、`GROUP BY`句とデータ挿入時と同じ集約関数を使用しますが、[`-Merge`](/sql-reference/aggregate-functions/combinators#-merge)コンビネータを使用します。

`-Merge`コンビネータが付加された集約関数は、状態のセットを受け取り、それらを結合して、完全なデータ集約の結果を返します。

例えば、以下の2つのクエリは同じ結果を返します:

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```


## 使用例 {#usage-example}

[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) エンジンの説明を参照してください。


## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate)
  コンビネータ
- [State](/sql-reference/aggregate-functions/combinators#-state) コンビネータ
