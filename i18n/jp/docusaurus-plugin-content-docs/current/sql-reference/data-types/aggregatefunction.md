---
slug: '/sql-reference/data-types/aggregatefunction'
sidebar_position: 46
sidebar_label: 'AggregateFunction'
keywords: ['AggregateFunction', 'ClickHouse', 'SQL', 'データベース']
description: 'Aggregate functions in ClickHouse provide a method for calculating and storing intermediate states.'
---


# AggregateFunction

集約関数は、`AggregateFunction(...)` データ型にシリアライズされ、通常は [マテリアライズドビュー](../../sql-reference/statements/create/view.md) を介してテーブルに格納できる実装依存の中間状態を持ちます。
集約関数の状態を生成する一般的な方法は、`-State` サフィックスを付けて集約関数を呼び出すことです。
将来的に集約の最終結果を得るには、同じ集約関数を `-Merge` サフィックスを付けて使用する必要があります。

`AggregateFunction(name, types_of_arguments...)` — パラメトリックデータ型。

**パラメータ**

- 集約関数の名前。関数がパラメトリックである場合は、そのパラメータも指定します。

- 集約関数の引数の型。

**例**

``` sql
CREATE TABLE t
(
    column1 AggregateFunction(uniq, UInt64),
    column2 AggregateFunction(anyIf, String, UInt8),
    column3 AggregateFunction(quantiles(0.5, 0.9), UInt64)
) ENGINE = ...
```

[uniq](/sql-reference/aggregate-functions/reference/uniq)、anyIf ([any](/sql-reference/aggregate-functions/reference/any)+[If](/sql-reference/aggregate-functions/combinators#-if)) および [quantiles](../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) は、ClickHouse でサポートされている集約関数です。

## 使用方法 {#usage}

### データ挿入 {#data-insertion}

データを挿入するには、集約 `-State` 関数を使って `INSERT SELECT` を使用します。

**関数の例**

``` sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

対応する関数 `uniq` および `quantiles` に対して、`-State` 関数は最終値の代わりに状態を返します。言い換えれば、これらは `AggregateFunction` 型の値を返します。

`SELECT` クエリの結果において、`AggregateFunction` 型の値は、すべての ClickHouse 出力形式に対して実装特有のバイナリ表現を持ちます。例えば、`TabSeparated` 形式にダンプされたデータは、`SELECT` クエリを通じて、後で `INSERT` クエリを使用して再ロードできます。

### データ選択 {#data-selection}

`AggregatingMergeTree` テーブルからデータを選択する際は、挿入時に使用したのと同じ集約関数を使用して、`GROUP BY` 句を使いますが、`-Merge` サフィックスを使用します。

`-Merge` サフィックス付きの集約関数は、一連の状態を取り、それらを組み合わせて、完全なデータ集約の結果を返します。

例えば、次の2つのクエリは、同じ結果を返します：

``` sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## 使用例 {#usage-example}

[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) エンジンの説明を参照してください。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
