---
description: '同じ主キー（より正確には、同じ [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を、集約関数の状態の組み合わせを格納する単一の行（単一のデータパーツ内）で置き換えます。'
sidebar_label: 'AggregatingMergeTree'
sidebar_position: 60
slug: /engines/table-engines/mergetree-family/aggregatingmergetree
title: 'AggregatingMergeTree'
---


# AggregatingMergeTree

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) から継承し、データパーツのマージに関するロジックを変更します。 ClickHouse は、同じ主キー（より正確には、同じ [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を、集約関数の状態の組み合わせを格納する単一の行（単一のデータパーツ内）で置き換えます。

`AggregatingMergeTree` テーブルを使用して、集約されたマテリアライズドビューを含む、増分データ集約を行うことができます。

以下のビデオで、AggregatingMergeTree と集約関数の使い方の例を見ることができます：
<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="Aggregation States in ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

このエンジンは、以下のタイプのすべてのカラムを処理します：

## [AggregateFunction](../../../sql-reference/data-types/aggregatefunction.md) {#aggregatefunction}
## [SimpleAggregateFunction](../../../sql-reference/data-types/simpleaggregatefunction.md) {#simpleaggregatefunction}

`AggregatingMergeTree` を使用するのは、行数を大幅に減少させる場合に適しています。

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

リクエストパラメータの説明については、[リクエストの説明](../../../sql-reference/statements/create/table.md)を参照してください。

**クエリ句**

`AggregatingMergeTree` テーブルを作成する際には、`MergeTree` テーブルを作成するときと同様の [句](../../../engines/table-engines/mergetree-family/mergetree.md) が必要です。

<details markdown="1">

<summary>テーブルを作成するための非推奨メソッド</summary>

:::note
新しいプロジェクトではこの方法を使用せず、可能であれば古いプロジェクトを上記の方法に切り替えてください。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] AggregatingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

すべてのパラメータは `MergeTree` と同じ意味を持ちます。
</details>

## SELECT と INSERT {#select-and-insert}

データを挿入するには、集約 -State- 関数を用いた [INSERT SELECT](../../../sql-reference/statements/insert-into.md) クエリを使用します。
`AggregatingMergeTree` テーブルからデータを選択する際には、データ挿入時と同じ集約関数を使用し、`GROUP BY` 句を用いて、`-Merge` 接尾辞を付けます。

`SELECT` クエリの結果において、`AggregateFunction` タイプの値は、すべての ClickHouse 出力形式に対して実装依存のバイナリ表現を持ちます。例えば、`TabSeparated` 形式にデータをダンプする場合、このダンプは `INSERT` クエリを使用して再ロード可能です。

## 集約されたマテリアライズドビューの例 {#example-of-an-aggregated-materialized-view}

以下の例では、`test` というデータベースがあることを前提としているので、存在しない場合は作成してください：

```sql
CREATE DATABASE test;
```

次に、生データを含むテーブル `test.visits` を作成します：

```sql
CREATE TABLE test.visits
 (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Sign Nullable(Int32),
    UserID Nullable(Int32)
) ENGINE = MergeTree ORDER BY (StartDate, CounterID);
```

次に、訪問の総数とユニークユーザーの数を追跡する `AggregationFunction` を保持する `AggregatingMergeTree` テーブルが必要です。

`test.visits` テーブルを監視し、`AggregateFunction` タイプを使用する `AggregatingMergeTree` マテリアライズドビューを作成します：

```sql
CREATE TABLE test.agg_visits (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Visits AggregateFunction(sum, Nullable(Int32)),
    Users AggregateFunction(uniq, Nullable(Int32))
)
ENGINE = AggregatingMergeTree() ORDER BY (StartDate, CounterID);
```

`test.visits` から `test.agg_visits` にデータをポピュレートするマテリアライズドビューを作成します：

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

`test.visits` テーブルにデータを挿入します：

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1667446031000, 1, 3, 4), (1667446031000, 1, 6, 3);
```

データは `test.visits` と `test.agg_visits` の両方に挿入されます。

集約データを取得するには、マテリアライズドビュー `test.visits_mv` から `SELECT ... GROUP BY ...` といったクエリを実行します：

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

`test.visits` にさらに数件のレコードを追加しますが、今回は一つのレコードに異なるタイムスタンプを使用してみてください：

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1669446031000, 2, 5, 10), (1667446031000, 3, 7, 5);
```

再度 `SELECT` クエリを実行すると、次の出力が得られます：

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │     16 │     3 │
│ 2022-11-26 07:00:31.000 │      5 │     1 │
└─────────────────────────┴────────┴───────┘
```

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse での集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
