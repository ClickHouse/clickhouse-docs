---
description: 'ClickHouseにおけるAggregateFunctionデータ型のドキュメントであり、集約関数の中間状態を保存します'
keywords: ['AggregateFunction', 'Type']
sidebar_label: 'AggregateFunction'
sidebar_position: 46
slug: /sql-reference/data-types/aggregatefunction
title: 'AggregateFunctionタイプ'
---


# AggregateFunctionタイプ

## 説明 {#description}

ClickHouseのすべての[集約関数](/sql-reference/aggregate-functions)は、特定の実装に依存した中間状態を持ち、それをシリアライズして`AggregateFunction`データ型としてテーブルに保存することができます。これは通常、[マテリアライズドビュー](../../sql-reference/statements/create/view.md)を介して行われます。

`AggregateFunction`型で一般的に使用される2つの集約関数[コンビネータ](/sql-reference/aggregate-functions/combinators)があります：

- [`-State`](/sql-reference/aggregate-functions/combinators#-state)集約関数コンビネータは、集約関数の名前に付加されると、`AggregateFunction`中間状態を生成します。
- [`-Merge`](/sql-reference/aggregate-functions/combinators#-merge)集約関数コンビネータは、中間状態から集約の最終結果を取得するために使用されます。

## 構文 {#syntax}

```sql
AggregateFunction(集約関数名, 引数の型...)
```

**パラメータ**

- `集約関数名` - 集約関数の名前。関数がパラメトリックの場合は、そのパラメータも指定する必要があります。
- `引数の型` - 集約関数引数の型。

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

`AggregateFunction`型のカラムを持つテーブルにデータを挿入するには、集約関数と[`-State`](/sql-reference/aggregate-functions/combinators#-state)集約関数コンビネータを使った`INSERT SELECT`を使用できます。

例えば、`AggregateFunction(uniq, UInt64)`型および`AggregateFunction(quantiles(0.5, 0.9), UInt64)`型のカラムに挿入するには、次の集約関数をコンビネータと共に使用します。

```sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

`uniq`および`quantiles`関数とは異なり、`uniqState`と`quantilesState`（`-State`コンビネータが付加されたもの）は、最終的な値ではなく状態を返します。言い換えれば、これらは`AggregateFunction`型の値を返します。

`SELECT`クエリの結果では、`AggregateFunction`型の値は、すべてのClickHouse出力形式に対して実装に依存したバイナリ表現を持ちます。

例えば、`SELECT`クエリで`TabSeparated`形式にデータをダンプすると、このダンプは`INSERT`クエリを使用して再ロードすることができます。

### データ選択 {#data-selection}

`AggregatingMergeTree`テーブルからデータを選択する際には、`GROUP BY`句を使用し、データを挿入した時と同じ集約関数を使用しますが、[`-Merge`](/sql-reference/aggregate-functions/combinators#-merge)コンビネータを使用します。

`-Merge`コンビネータが付加された集約関数は、一連の状態を取り、それらを組み合わせて完全なデータ集約の結果を返します。

例えば、次の2つのクエリは同じ結果を返します：

```sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## 使用例 {#usage-example}

[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md)エンジンの説明を参照してください。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
- [MergeState](/sql-reference/aggregate-functions/combinators#-mergestate)コンビネータ。
- [State](/sql-reference/aggregate-functions/combinators#-state)コンビネータ。
