---
'description': '同じ主キーを持つすべての行（より正確には、同じ[ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)を持つ行）を、集約関数の状態の組み合わせを保存する単一の行（単一のデータパーツ内）に置き換えます。'
'sidebar_label': 'AggregatingMergeTree'
'sidebar_position': 60
'slug': '/engines/table-engines/mergetree-family/aggregatingmergetree'
'title': 'AggregatingMergeTree'
'doc_type': 'reference'
---


# AggregatingMergeTree

このエンジンは [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) から継承され、データパーツのマージに関するロジックを変更します。ClickHouse は、同じ主キー（または正確には、同じ [ソートキー](../../../engines/table-engines/mergetree-family/mergetree.md)）を持つすべての行を、集約関数の状態の組み合わせを保存する単一の行（単一のデータパート内）に置き換えます。

`AggregatingMergeTree` テーブルを使用して、集計されたマテリアライズドビューを含む増分データ集計を行うことができます。

以下のビデオでは、AggregatingMergeTree と集約関数の使用例を見ることができます：
<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="Aggregation States in ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

このエンジンは、以下のタイプのすべてのカラムを処理します：

- [`AggregateFunction`](../../../sql-reference/data-types/aggregatefunction.md)
- [`SimpleAggregateFunction`](../../../sql-reference/data-types/simpleaggregatefunction.md)

行数をオーダー単位で削減できる場合に `AggregatingMergeTree` を使用するのが適切です。

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

`AggregatingMergeTree` テーブルを作成する場合、`MergeTree` テーブルを作成する場合と同じ [句](../../../engines/table-engines/mergetree-family/mergetree.md) が必要です。

<details markdown="1">

<summary>テーブル作成のための非推奨メソッド</summary>

:::note
新しいプロジェクトではこの方法を使用せず、可能な限り古いプロジェクトを上記に記載の方法に切り替えてください。
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

データを挿入するには、集約 -State- 関数を使った [INSERT SELECT](../../../sql-reference/statements/insert-into.md) クエリを使用します。`AggregatingMergeTree` テーブルからデータを選択する際は、`GROUP BY` 句を使用し、挿入時と同じ集約関数を使用しますが、`-Merge` サフィックスを付けます。

`SELECT` クエリの結果では、`AggregateFunction` タイプの値はすべての ClickHouse 出力フォーマットに対して実装固有のバイナリ表現を持っています。例えば、`SELECT` クエリでデータを `TabSeparated` フォーマットにダンプすると、このダンプは `INSERT` クエリを使用して再度読み込むことができます。

## 集約されたマテリアライズドビューの例 {#example-of-an-aggregated-materialized-view}

以下の例では、`test` というデータベースがあると仮定しています。存在しない場合は、以下のコマンドで作成してください：

```sql
CREATE DATABASE test;
```

次に、原データを含むテーブル `test.visits` を作成します：

```sql
CREATE TABLE test.visits
 (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Sign Nullable(Int32),
    UserID Nullable(Int32)
) ENGINE = MergeTree ORDER BY (StartDate, CounterID);
```

次に、訪問回数とユニークユーザー数を追跡する `AggregationFunction`s を保存する `AggregatingMergeTree` テーブルが必要です。

`test.visits` テーブルを監視し、[`AggregateFunction`](/sql-reference/data-types/aggregatefunction) タイプを使用する `AggregatingMergeTree` マテリアライズドビューを作成します：

```sql
CREATE TABLE test.agg_visits (
    StartDate DateTime64 NOT NULL,
    CounterID UInt64,
    Visits AggregateFunction(sum, Nullable(Int32)),
    Users AggregateFunction(uniq, Nullable(Int32))
)
ENGINE = AggregatingMergeTree() ORDER BY (StartDate, CounterID);
```

`test.visits` から `test.agg_visits` にデータを埋め込むマテリアライズドビューを作成します：

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

集約データを取得するには、マテリアライズドビュー `test.visits_mv` から `SELECT ... GROUP BY ...` のようなクエリを実行します：

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

`test.visits` にさらに別のレコードを追加しますが、一方のレコードには異なるタイムスタンプを使ってみてください：

```sql
INSERT INTO test.visits (StartDate, CounterID, Sign, UserID)
 VALUES (1669446031000, 2, 5, 10), (1667446031000, 3, 7, 5);
```

再度 `SELECT` クエリを実行すると、次の出力が返されます：

```text
┌───────────────StartDate─┬─Visits─┬─Users─┐
│ 2022-11-03 03:27:11.000 │     16 │     3 │
│ 2022-11-26 07:00:31.000 │      5 │     1 │
└─────────────────────────┴────────┴───────┘
```

場合によっては、挿入時に行を事前集約することを避けて、集約のコストを挿入時からマージ時に移すことが望ましいことがあります。通常、エラーを避けるために、マテリアライズドビュー定義の `GROUP BY` 句に集約に含まれないカラムを含める必要があります。しかし、`optimize_on_insert = 0`（デフォルトでオンになっています）の設定で [`initializeAggregation`](/sql-reference/functions/other-functions#initializeaggregation) 関数を利用することでこれを達成できます。この場合には `GROUP BY` の使用はもはや必要ありません：

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
`initializeAggregation` を使用すると、グループ化せずに個々の行ごとに集約状態が作成されます。
各ソース行はマテリアライズドビューに1行を生成し、実際の集約は後で `AggregatingMergeTree` がパーツをマージするときに行われます。これは `optimize_on_insert = 0` の場合にのみ当てはまります。
:::

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouse における集約コンビネータの使用](https://clickhouse.com/blog/aggregate-functions-combinators-in-clickhouse-for-arrays-maps-and-states)
