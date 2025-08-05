---
description: 'ClickHouse における AggregateFunction データ型のドキュメント。集約関数の中間状態を保存します。'
keywords:
- 'AggregateFunction'
- 'Type'
sidebar_label: 'AggregateFunction'
sidebar_position: 46
slug: '/sql-reference/data-types/aggregatefunction'
title: 'AggregateFunction Type'
---




# AggregateFunction タイプ

## 説明 {#description}

ClickHouse におけるすべての [Aggregate functions](/sql-reference/aggregate-functions) は、シリアル化されて `AggregateFunction` データ型としてテーブルに保存される実装依存の中間状態を持っています。これは通常、[materialized view](../../sql-reference/statements/create/view.md) を介して行われます。

`AggregateFunction` タイプで一般的に使用される 2 つの集約関数 [combinators](/sql-reference/aggregate-functions/combinators) は次のとおりです。

- [`-State`](/sql-reference/aggregate-functions/combinators#-state) 集約関数コンビネーター。これは集約関数名に追加されると、`AggregateFunction` の中間状態を生成します。
- [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) 集約関数コンビネーター。これは中間状態から集約の最終結果を取得するために使用されます。

## 構文 {#syntax}

```sql
AggregateFunction(aggregate_function_name, types_of_arguments...)
```

**パラメータ**

- `aggregate_function_name` - 集約関数の名前。関数がパラメトリックな場合、そのパラメータも指定する必要があります。
- `types_of_arguments` - 集約関数引数の型。

例えば：

```sql
CREATE TABLE t
(
    column1 AggregateFunction(uniq, UInt64),
    column2 AggregateFunction(anyIf, String, UInt8),
    column3 AggregateFunction(quantiles(0.5, 0.9), UInt64)
) ENGINE = ...
```

## 使用法 {#usage}

### データ挿入 {#data-insertion}

`AggregateFunction` 型のカラムを持つテーブルにデータを挿入するには、集約関数と [`-State`](/sql-reference/aggregate-functions/combinators#-state) 集約関数コンビネーターを使用して `INSERT SELECT` を実行できます。

例えば、`AggregateFunction(uniq, UInt64)` および `AggregateFunction(quantiles(0.5, 0.9), UInt64)` 型のカラムに挿入するには、次の集約関数とコンビネーターを使用します。

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

関数 `uniq` と `quantiles` に対して、`uniqState` と `quantilesState` （`-State` コンビネーターが追加されたもの）は、最終値ではなく状態を返します。つまり、`AggregateFunction` 型の値を返します。

`SELECT` クエリの結果において、`AggregateFunction` 型の値は、すべての ClickHouse 出力形式に対応する実装特有のバイナリ表現を持っています。

例えば、`SELECT` クエリで `TabSeparated` 形式にデータをダンプした場合、このダンプは `INSERT` クエリを使用して再びロードできます。

### データ選択 {#data-selection}

`AggregatingMergeTree` テーブルからデータを選択する場合、`GROUP BY` 句を使用し、データ挿入時と同じ集約関数を使用しますが、[`-Merge`](/sql-reference/aggregate-functions/combinators#-merge) コンビネーターを使用します。

`-Merge` コンビネーターが追加された集約関数は、状態のセットを受け取り、それらを結合してデータの集約結果を返します。

例えば、次の 2 つのクエリは同じ結果を返します。

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## 使用例 {#usage-example}

[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) エンジンの説明を参照してください。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における Aggregate Combinators の使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate) コンビネーター。
- [State](/sql-reference/aggregate-functions/combinators#-state) コンビネーター。
