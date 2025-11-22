---
description: '同じ主キー（より正確には同じ[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md))
  を持つすべての行を、集約関数の状態を組み合わせて保持する、単一のデータパーツ内の 1 行に置き換えます。'
sidebar_label: 'AggregatingMergeTree'
sidebar_position: 60
slug: /engines/table-engines/mergetree-family/aggregatingmergetree
title: 'AggregatingMergeTree テーブルエンジン'
doc_type: 'reference'
---



# AggregatingMergeTree テーブルエンジン

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) を継承し、データパーツのマージ処理ロジックを変更します。ClickHouse は、同じ主キー（より正確には、同じ [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を、集約関数の状態を組み合わせて格納する 1 つの行（単一のデータパーツ内）に置き換えます。

`AggregatingMergeTree` テーブルは、インクリメンタルなデータ集約に使用できます。集約済みマテリアライズドビューにも使用できます。

以下の動画で、AggregatingMergeTree と集約関数の使用例を確認できます。
<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="ClickHouse における集約状態" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

このエンジンは、次の型を持つすべてのカラムを処理します。

- [`AggregateFunction`](../../../sql-reference/data-types/aggregatefunction.md)
- [`SimpleAggregateFunction`](../../../sql-reference/data-types/simpleaggregatefunction.md)

行数を桁違いに削減できる場合は、`AggregatingMergeTree` を使用するのが適しています。



## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = AggregatingMergeTree()
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[TTL expr]
[SETTINGS name=value, ...]
```

リクエストパラメータの詳細については、[リクエストの説明](../../../sql-reference/statements/create/table.md)を参照してください。

**クエリ句**

`AggregatingMergeTree`テーブルを作成する際は、`MergeTree`テーブルを作成する場合と同じ[句](../../../engines/table-engines/mergetree-family/mergetree.md)が必要です。

<details markdown="1">

<summary>非推奨のテーブル作成方法</summary>

:::note
新しいプロジェクトではこの方法を使用せず、可能であれば既存のプロジェクトを上記で説明した方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] AggregatingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

すべてのパラメータは`MergeTree`と同じ意味を持ちます。

</details>


## SELECTとINSERT {#select-and-insert}

データを挿入するには、集約関数の`-State-`形式を使用した[INSERT SELECT](../../../sql-reference/statements/insert-into.md)クエリを使用します。
`AggregatingMergeTree`テーブルからデータを選択する際は、`GROUP BY`句と、データ挿入時と同じ集約関数を使用しますが、`-Merge`接尾辞を付けます。

`SELECT`クエリの結果において、`AggregateFunction`型の値は、すべてのClickHouse出力形式で実装固有のバイナリ表現を持ちます。例えば、`SELECT`クエリで`TabSeparated`形式にデータをダンプした場合、そのダンプを`INSERT`クエリで読み込むことができます。


## 集約マテリアライズドビューの例 {#example-of-an-aggregated-materialized-view}

以下の例では、`test`という名前のデータベースが存在することを前提としています。まだ存在しない場合は、以下のコマンドを使用して作成してください:

```sql
CREATE DATABASE test;
```

次に、生データを格納する`test.visits`テーブルを作成します:

```sql
CREATE TABLE test.visits
 (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Sign Nullable(Int32),
    UserID Nullable(Int32)
) ENGINE = MergeTree ORDER BY (StartDate, CounterID);
```

次に、訪問数の合計とユニークユーザー数を追跡する`AggregationFunction`を格納する`AggregatingMergeTree`テーブルが必要です。

`test.visits`テーブルを監視し、[`AggregateFunction`](/sql-reference/data-types/aggregatefunction)型を使用する`AggregatingMergeTree`マテリアライズドビューを作成します:

```sql
CREATE TABLE test.agg_visits (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Visits AggregateFunction(sum, Nullable(Int32)),
    Users AggregateFunction(uniq, Nullable(Int32))
)
ENGINE = AggregatingMergeTree() ORDER BY (StartDate, CounterID);
```

`test.visits`から`test.agg_visits`にデータを投入するマテリアライズドビューを作成します:

```sql
CREATE MATERIALIZED VIEW test.visits_mv TO test.agg_visits
AS SELECT
    StartDate,
    CounterID,
    sumState(Sign) AS Visits,
    uniqState(UserID) AS Users
FROM test.visits
GROUP BY StartDate, CounterID;
```

`test.visits`テーブルにデータを挿入します:

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1667446031000, 1, 3, 4), (1667446031000, 1, 6, 3);
```

データは`test.visits`と`test.agg_visits`の両方に挿入されます。

集約されたデータを取得するには、マテリアライズドビュー`test.visits_mv`から`SELECT ... GROUP BY ...`のようなクエリを実行します:

```sql
SELECT
    StartDate,
    sumMerge(Visits) AS Visits,
    uniqMerge(Users) AS Users
FROM test.visits_mv
GROUP BY StartDate
ORDER BY StartDate;
```

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │      9 │     2 │
└─────────────────────────┴────────┴───────┘
```

`test.visits`にさらに2つのレコードを追加しますが、今回は1つのレコードに異なるタイムスタンプを使用してみてください:

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1669446031000, 2, 5, 10), (1667446031000, 3, 7, 5);
```

`SELECT`クエリを再度実行すると、以下の出力が返されます:

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │     16 │     3 │
│ 2022-11-26 07:00:31.000 │      5 │     1 │
└─────────────────────────┴────────┴───────┘
```

場合によっては、挿入時に行を事前集約することを避け、集約のコストを挿入時からマージ時に移行したいことがあります。通常、エラーを回避するために、マテリアライズドビュー定義の`GROUP BY`句に集約の対象ではない列を含める必要があります。ただし、`optimize_on_insert = 0`設定(デフォルトでは有効)で[`initializeAggregation`](/sql-reference/functions/other-functions#initializeAggregation)関数を使用することで、これを実現できます。この場合、`GROUP BY`の使用は不要になります:

```sql
CREATE MATERIALIZED VIEW test.visits_mv TO test.agg_visits
AS SELECT
    StartDate,
    CounterID,
    initializeAggregation('sumState', Sign) AS Visits,
    initializeAggregation('uniqState', UserID) AS Users
FROM test.visits;
```


:::note
`initializeAggregation` を使用する場合、グループ化は行われず、各行に対して個別の集約状態が作成されます。
各ソース行はマテリアライズドビュー内で 1 行を生成し、実際の集約処理が行われるのは後で、
`AggregatingMergeTree` がパーツをマージするときです。これは `optimize_on_insert = 0` の場合にのみ成り立ちます。
:::



## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
