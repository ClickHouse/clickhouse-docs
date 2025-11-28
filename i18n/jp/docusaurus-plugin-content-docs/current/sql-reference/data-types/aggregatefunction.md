---
description: 'ClickHouse における AggregateFunction データ型に関するドキュメントであり、AggregateFunction データ型は集約関数の中間状態を格納します'
keywords: ['AggregateFunction', 'Type']
sidebar_label: 'AggregateFunction'
sidebar_position: 46
slug: /sql-reference/data-types/aggregatefunction
title: 'AggregateFunction 型'
doc_type: 'reference'
---



# AggregateFunction 型



## 説明 {#description}

ClickHouse のすべての [集計関数](/sql-reference/aggregate-functions) には、
`AggregateFunction` データ型としてシリアライズしてテーブルに保存できる、
実装依存の中間状態があります。これは通常、
[マテリアライズドビュー](../../sql-reference/statements/create/view.md) を用いて行います。

`AggregateFunction` 型と組み合わせてよく使用される集計関数の
[コンビネータ](/sql-reference/aggregate-functions/combinators) が 2 つあります:

- 集計関数名に付加すると `AggregateFunction` の中間状態を生成する
  [`-State`](/sql-reference/aggregate-functions/combinators#-state) 集計関数コンビネータ。
- 中間状態から集約の最終結果を取得するために使用される
  [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 集計関数コンビネータ。



## 構文

```sql
AggregateFunction(集約関数名, 引数の型...)
```

**パラメータ**

* `aggregate_function_name` - 集約関数の名前。関数がパラメータを取る場合は、そのパラメータも指定する必要があります。
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


## 使用方法

### データ挿入

`AggregateFunction` 型のカラムを持つテーブルにデータを挿入するには、
集約関数と
[`-State`](/sql-reference/aggregate-functions/combinators#-state) 集約関数コンビネータを組み合わせた
`INSERT SELECT` を使用できます。

たとえば、`AggregateFunction(uniq, UInt64)` 型および
`AggregateFunction(quantiles(0.5, 0.9), UInt64)` 型のカラムにデータを挿入する場合は、
次のようなコンビネータ付きの集約関数を使用します。

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

`uniq` や `quantiles` 関数とは対照的に、`uniqState` および `quantilesState`
（`-State` コンビネータが付いたもの）は、最終的な値ではなく状態を返します。
言い換えると、これらは `AggregateFunction` 型の値を返します。

`SELECT` クエリの結果において、`AggregateFunction` 型の値は、
すべての ClickHouse の出力フォーマットで実装依存のバイナリ表現を持ちます。

たとえば、`SELECT` クエリで `TabSeparated` フォーマットにデータをダンプした場合、
このダンプは `INSERT` クエリを用いて再度読み込むことができます。

### データの選択

`AggregatingMergeTree` テーブルからデータを選択する際には、`GROUP BY` 句と、
データ挿入時と同じ集約関数を使用しますが、
その際に [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) コンビネータを付けて使用します。

`-Merge` コンビネータが付いた集約関数は、状態の集合を受け取り、それらをマージし、
完全なデータ集約の結果を返します。

たとえば、次の 2 つのクエリは同じ結果を返します。

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```


## 使用例 {#usage-example}

[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) エンジンの説明を参照してください。



## 関連コンテンツ {#related-content}

- ブログ記事: [Using Aggregate Combinators in ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate)
  コンビネータ。
- [State](/sql-reference/aggregate-functions/combinators#-state) コンビネータ。
