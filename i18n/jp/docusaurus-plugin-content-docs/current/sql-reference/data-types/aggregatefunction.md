---
slug: /sql-reference/data-types/aggregatefunction
sidebar_position: 46
sidebar_label: AggregateFunction
---


# AggregateFunction

集約関数は、実装によって定義された中間状態を持ち、これを `AggregateFunction(...)` データ型にシリアライズしてテーブルに保存することができ、通常は [マテリアライズドビュー](../../sql-reference/statements/create/view.md) を介して行われます。
集約関数の状態を生成する一般的な方法は、`-State` 接尾辞を付けて集約関数を呼び出すことです。
将来、集約の最終結果を得るには、同じ集約関数に `-Merge` 接尾辞を使用する必要があります。

`AggregateFunction(name, types_of_arguments...)` — パラメトリックデータ型です。

**パラメーター**

- 集約関数の名前。関数がパラメトリックの場合、パラメーターも指定してください。

- 集約関数引数の型。

**例**

``` sql
CREATE TABLE t
(
    column1 AggregateFunction(uniq, UInt64),
    column2 AggregateFunction(anyIf, String, UInt8),
    column3 AggregateFunction(quantiles(0.5, 0.9), UInt64)
) ENGINE = ...
```

[uniq](../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq)、anyIf ([any](../../sql-reference/aggregate-functions/reference/any.md#agg_function-any)+[If](../../sql-reference/aggregate-functions/combinators.md#agg-functions-combinator-if)) および [quantiles](../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles) は ClickHouse でサポートされている集約関数です。

## 使用方法 {#usage}

### データ挿入 {#data-insertion}

データを挿入するには、集約 `-State` 関数を使用して `INSERT SELECT` を利用します。

**関数の例**

``` sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

対応する関数 `uniq` および `quantiles` と対照的に、`-State` 関数は最終値ではなく、状態を返します。言い換えれば、これらは `AggregateFunction` 型の値を返します。

`SELECT` クエリの結果において、`AggregateFunction` 型の値は ClickHouse の出力形式のすべてに対して実装依存のバイナリ表現を持っています。たとえば、`SELECT` クエリで `TabSeparated` 形式にダンプデータを出力すると、次に `INSERT` クエリを使用してそのダンプを再び読み込むことができます。

### データ選択 {#data-selection}

`AggregatingMergeTree` テーブルからデータを選択する際には、`GROUP BY` 句を使用し、データ挿入時と同じ集約関数を、`-Merge` 接尾辞を付けて使用してください。

`-Merge` 接尾辞付きの集約関数は、状態のセットを受け取り、それらを結合し、完全なデータ集約の結果を返します。

たとえば、次の2つのクエリは同じ結果を返します：

``` sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## 使用例 {#usage-example}

[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md) エンジンの説明を参照してください。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
