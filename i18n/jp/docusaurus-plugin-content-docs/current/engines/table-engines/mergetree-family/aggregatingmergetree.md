---
description: '同じ主キー（より正確には同じ[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を、集約関数の状態を組み合わせて保持する単一の行（単一のデータパーツ内）に置き換えます。'
sidebar_label: 'AggregatingMergeTree'
sidebar_position: 60
slug: /engines/table-engines/mergetree-family/aggregatingmergetree
title: 'AggregatingMergeTree テーブルエンジン'
doc_type: 'reference'
---

# AggregatingMergeTree テーブルエンジン {#aggregatingmergetree-table-engine}

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) から継承しており、データパーツのマージロジックを変更します。ClickHouse は、同じ主キー（より正確には、同じ[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を 1 行（単一のデータパーツ内）にまとめ、その行に集約関数の状態を組み合わせて格納します。

`AggregatingMergeTree` テーブルは、集約済みマテリアライズドビューを含むインクリメンタルなデータ集約に使用できます。

以下の動画で、AggregatingMergeTree と集約関数の使用例を確認できます。
<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="Aggregation States in ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

このエンジンは、次の型を持つすべてのカラムを処理します。

- [`AggregateFunction`](../../../sql-reference/data-types/aggregatefunction.md)
- [`SimpleAggregateFunction`](../../../sql-reference/data-types/simpleaggregatefunction.md)

行数を桁違いに削減できる場合には、`AggregatingMergeTree` を使用するのが適切です。

## テーブルを作成する {#creating-a-table}

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

リクエストパラメータの説明は、[リクエストの説明](../../../sql-reference/statements/create/table.md)を参照してください。

**クエリの句**

`AggregatingMergeTree` テーブルを作成する場合、`MergeTree` テーブルを作成する場合と同じ [句](../../../engines/table-engines/mergetree-family/mergetree.md) を指定する必要があります。

<details markdown="1">
  <summary>テーブル作成の非推奨の方法</summary>

  :::note
  新規プロジェクトではこの方法を使用しないでください。可能であれば、既存のプロジェクトも上で説明した方法へ移行してください。
  :::

  ```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] AggregatingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity)
```

  すべてのパラメータの意味は `MergeTree` と同じです。
</details>

## SELECT と INSERT {#select-and-insert}

データを挿入するには、集約関数の `-State` バージョンを用いた [INSERT SELECT](../../../sql-reference/statements/insert-into.md) クエリを使用します。
`AggregatingMergeTree` テーブルからデータを選択する場合は、`GROUP BY` 句と、挿入時と同じ集約関数を使用しますが、`-Merge` 接尾辞を付けて使用します。

`SELECT` クエリの結果において、`AggregateFunction` 型の値は、すべての ClickHouse 出力形式で実装依存のバイナリ表現になります。たとえば、`SELECT` クエリでデータを `TabSeparated` 形式にダンプした場合、このダンプは `INSERT` クエリを使用して再度ロードできます。

## 集約マテリアライズドビューの例 {#example-of-an-aggregated-materialized-view}

次の例では、`test` という名前のデータベースが既に存在すると仮定します。まだない場合は、以下のコマンドで作成してください。

```sql
CREATE DATABASE test;
```

次に、生データを格納するテーブル `test.visits` を作成します：

```sql
CREATE TABLE test.visits
 (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Sign Nullable(Int32),
    UserID Nullable(Int32)
) ENGINE = MergeTree ORDER BY (StartDate, CounterID);
```

次に、訪問数の合計とユニークユーザー数を追跡する `AggregationFunction` を格納するための `AggregatingMergeTree` テーブルが必要です。

`test.visits` テーブルを監視し、[`AggregateFunction`](/sql-reference/data-types/aggregatefunction) 型を使用する `AggregatingMergeTree` マテリアライズドビューを作成します。

```sql
CREATE TABLE test.agg_visits (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Visits AggregateFunction(sum, Nullable(Int32)),
    Users AggregateFunction(uniq, Nullable(Int32))
)
ENGINE = AggregatingMergeTree() ORDER BY (StartDate, CounterID);
```

`test.visits` からデータを取り込み、`test.agg_visits` を更新するマテリアライズドビューを作成します：

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

`test.visits` テーブルにデータを挿入します。`

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1667446031000, 1, 3, 4), (1667446031000, 1, 6, 3);
```

データは `test.visits` と `test.agg_visits` の両方に挿入されます。

集約されたデータを取得するには、マテリアライズドビュー `test.visits_mv` に対して `SELECT ... GROUP BY ...` といったクエリを実行します。

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

`test.visits` にさらに 2 件のレコードを追加します。ただし、今回はそのうち 1 件には別のタイムスタンプを指定してみてください。

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1669446031000, 2, 5, 10), (1667446031000, 3, 7, 5);
```

`SELECT` クエリを再度実行すると、次のような出力が返されます。

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │     16 │     3 │
│ 2022-11-26 07:00:31.000 │      5 │     1 │
└─────────────────────────┴────────┴───────┘
```

場合によっては、挿入時に行を事前集計せず、集計のコストを挿入時からマージ時へ移したいことがあります。通常は、エラーを避けるために、マテリアライズドビュー定義の `GROUP BY`
句に、集計の対象ではない列も含める必要があります。しかし、この動作を実現するには、`optimize_on_insert = 0`（デフォルトで有効になっています）を設定したうえで、[`initializeAggregation`](/sql-reference/functions/other-functions#initializeAggregation)
関数を利用できます。この場合、`GROUP BY`
を使用する必要はなくなります。

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
`initializeAggregation` を使用する場合、グループ化を行わずに各行に対して集約状態が作成されます。
各ソース行はマテリアライズドビュー内で 1 行を生成し、実際の集約は後で `AggregatingMergeTree` がパートをマージする際に行われます。
これは `optimize_on_insert = 0` の場合にのみ当てはまります。
:::

## 関連コンテンツ {#related-content}

- ブログ記事: [Using Aggregate Combinators in ClickHouse](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
