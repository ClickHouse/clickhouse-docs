---
description: '集約関数の中間状態を格納する ClickHouse の AggregateFunction データ型に関するドキュメント'
keywords: ['AggregateFunction', 'Type']
sidebar_label: 'AggregateFunction'
sidebar_position: 46
slug: /sql-reference/data-types/aggregatefunction
title: 'AggregateFunction 型'
doc_type: 'reference'
---

# AggregateFunction 型 {#aggregatefunction-type}

## 説明 {#description}

ClickHouse のすべての [集約関数](/sql-reference/aggregate-functions) には、
実装固有の中間状態があり、それを `AggregateFunction` データ型としてシリアル化して
テーブルに保存できます。これは通常、[マテリアライズドビュー](../../sql-reference/statements/create/view.md)
を用いて行うのが一般的です。

`AggregateFunction` 型とともに一般的に用いられる集約関数の
[コンビネータ](/sql-reference/aggregate-functions/combinators) が 2 つあります:

- 集約関数名に付けると `AggregateFunction` の中間状態を生成する
  [`-State`](/sql-reference/aggregate-functions/combinators#-state) 集約関数コンビネータ。
- 中間状態から集約の最終結果を取得するために使用される
  [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 集約関数コンビネータ。

## 構文 {#syntax}

```sql
AggregateFunction(aggregate_function_name, types_of_arguments...)
```

**パラメータ**

* `aggregate_function_name` - 集約関数の名前。関数がパラメータ付きである場合は、そのパラメータも指定する必要があります。
* `types_of_arguments` - 集約関数の引数の型。

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

### データ挿入 {#data-insertion}

`AggregateFunction` 型のカラムを持つテーブルにデータを挿入するには、
集約関数と
[`-State`](/sql-reference/aggregate-functions/combinators#-state)
という集約関数コンビネータを用いた `INSERT SELECT` を使用できます。

例えば、型が `AggregateFunction(uniq, UInt64)` および
`AggregateFunction(quantiles(0.5, 0.9), UInt64)` のカラムにデータを挿入する場合は、
次のようなコンビネータ付きの集約関数を使用します。

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

`uniq` および `quantiles` 関数とは対照的に、`uniqState` と `quantilesState`
（`-State` コンビネータが付与されたもの）は、最終値ではなく状態を返します。
言い換えると、これらは `AggregateFunction` 型の値を返します。

`SELECT` クエリの結果では、`AggregateFunction` 型の値は、
すべての ClickHouse の出力フォーマットにおいて、実装依存のバイナリ表現を持ちます。

入力値から状態を構築できるようにする、セッションレベルの特別な設定 `aggregate_function_input_format` があります。
これは次のフォーマットをサポートします。

* `state` - シリアライズされた状態を含むバイナリ文字列（デフォルト）。
  たとえば、`SELECT` クエリで `TabSeparated` フォーマットにデータをダンプした場合、
  このダンプは `INSERT` クエリを使って再読み込みできます。
* `value` - フォーマットは集約関数の引数の単一の値、もしくは複数引数の場合はそれらのタプルを受け取り、それをデシリアライズして対応する状態を構成します。
* `array` - フォーマットは上記の `value` オプションで説明したような値の Array を受け取り、その配列内のすべての要素を集約して状態を構成します。

### データの選択 {#data-selection}

`AggregatingMergeTree` テーブルからデータを選択する場合は、データを挿入したときと同じ集約関数を `GROUP BY` 句とともに使用しますが、[`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) コンビネータを付けて使用します。

`-Merge` コンビネータが付いた集約関数は、一連の状態を受け取り、それらを結合して、完全なデータ集約の結果を返します。

例えば、次の 2 つのクエリは同じ結果を返します。

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## 使用例 {#usage-example}

[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) エンジンの説明を参照してください。

## 関連コンテンツ {#related-content}

- ブログ記事: [Using Aggregate Combinators in ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate)
  コンビネータ
- [State](/sql-reference/aggregate-functions/combinators#-state) コンビネータ