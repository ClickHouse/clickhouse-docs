---
slug: /sql-reference/data-types/aggregatefunction
sidebar_position: 46
sidebar_label: AggregateFunction
---

# AggregateFunction

集約関数は、実装に依存した中間状態を持ち、この状態は`AggregateFunction(...)`データ型にシリアライズされ、通常は[マテリアライズドビュー](../../sql-reference/statements/create/view.md)を介してテーブルに保存されます。集約関数の状態を生成する一般的な方法は、`-State`サフィックスを付けて集約関数を呼び出すことです。将来的に集約の最終結果を取得するには、同じ集約関数を`-Merge`サフィックス付きで使用する必要があります。

`AggregateFunction(name, types_of_arguments...)` — パラメトリックデータ型です。

**パラメータ**

- 集約関数の名前。関数がパラメトリックである場合、パラメータも指定します。

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

[uniq](../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq)、anyIf ([any](../../sql-reference/aggregate-functions/reference/any.md#agg_function-any)+[If](../../sql-reference/aggregate-functions/combinators.md#agg-functions-combinator-if))、および[quantiles](../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)は、ClickHouseでサポートされている集約関数です。

## 使用法 {#usage}

### データ挿入 {#data-insertion}

データを挿入するには、集約`-State`関数で`INSERT SELECT`を使用します。

**関数の例**

``` sql
uniqState(UserID)
quantilesState(0.5, 0.9)(SendTiming)
```

対応する関数`uniq`および`quantiles`とは対照的に、`-State`関数は最終値ではなく状態を返します。言い換えれば、これらは`AggregateFunction`型の値を返します。

`SELECT`クエリの結果では、`AggregateFunction`型の値は、すべてのClickHouse出力フォーマットに対して実装固有のバイナリ表現を持ちます。たとえば、`TabSeparated`フォーマットにデータをダンプする場合、`SELECT`クエリを使用して、このダンプは`INSERT`クエリを使用して再度ロードされることができます。

### データ選択 {#data-selection}

`AggregatingMergeTree`テーブルからデータを選択する際は、`GROUP BY`句を使用し、データ挿入時と同じ集約関数を使用しますが、`-Merge`サフィックスを使用します。

`-Merge`サフィックスを持つ集約関数は、一連の状態を受け取り、これを結合して完全なデータ集約の結果を返します。

たとえば、次の2つのクエリは同じ結果を返します：

``` sql
SELECT uniq(UserID) FROM table

SELECT uniqMerge(state) FROM (SELECT uniqState(UserID) AS state FROM table GROUP BY RegionID)
```

## 使用例 {#usage-example}

[AggregatingMergeTree](../../engines/table-engines/mergetree-family/aggregatingmergetree.md)エンジンの説明を参照してください。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける集約コムビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
