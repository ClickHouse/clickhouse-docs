---
'description': 'プロジェクションを操作するためのドキュメント'
'sidebar_label': 'PROJECTION'
'sidebar_position': 49
'slug': '/sql-reference/statements/alter/projection'
'title': 'プロジェクション'
'doc_type': 'reference'
---

プロジェクションは、クエリの実行を最適化する形式でデータを保存します。この機能は以下に役立ちます。
- 主キーの一部でないカラムに対してクエリを実行する
- カラムを事前に集約することで、計算とIOの両方を削減します

テーブルに対して1つ以上のプロジェクションを定義でき、クエリ分析時に、ユーザーが提供したクエリを変更することなく、スキャンするデータが最も少ないプロジェクションがClickHouseによって選択されます。

:::note ディスク使用状況

プロジェクションは内部で新しい隠しテーブルを作成します。これは、より多くのIOとディスク上のスペースが必要になることを意味します。
例えば、プロジェクションに異なる主キーが定義されている場合、元のテーブルのすべてのデータが複製されます。
:::

プロジェクションが内部でどのように機能するかについての詳細な技術情報は、この [ページ](https://clickhouse.com/docs/ja/guides/best-practices/sparse-primary-indexes.md/#option-3-projections) で確認できます。

## 主キーを使用せずにフィルタリングの例 {#example-filtering-without-using-primary-keys}

テーブルの作成：
```sql
CREATE TABLE visits_order
(
   `user_id` UInt64,
   `user_name` String,
   `pages_visited` Nullable(Float64),
   `user_agent` String
)
ENGINE = MergeTree()
PRIMARY KEY user_agent
```
`ALTER TABLE`を使用して、既存のテーブルにプロジェクションを追加することができます：
```sql
ALTER TABLE visits_order ADD PROJECTION user_name_projection (
SELECT
*
ORDER BY user_name
)

ALTER TABLE visits_order MATERIALIZE PROJECTION user_name_projection
```
データの挿入：
```sql
INSERT INTO visits_order SELECT
    number,
    'test',
    1.5 * (number / 2),
    'Android'
FROM numbers(1, 100);
```

プロジェクションを使用することで、元のテーブルで`user_name`が`PRIMARY_KEY`として定義されていなくても、`user_name`によるフィルタリングを迅速に行うことができます。
クエリ実行時にClickHouseは、プロジェクションを使用することで処理されるデータが少なくなると判断しました。なぜなら、データは`user_name`で順序付けられているからです。
```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

クエリがプロジェクションを使用しているかどうかを確認するには、`system.query_log`テーブルを確認できます。`projections`フィールドには、使用されているプロジェクションの名前が表示され、使用されていない場合は空になります：
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## 事前集約クエリの例 {#example-pre-aggregation-query}

プロジェクションを持つテーブルの作成：
```sql
CREATE TABLE visits
(
   `user_id` UInt64,
   `user_name` String,
   `pages_visited` Nullable(Float64),
   `user_agent` String,
   PROJECTION projection_visits_by_user
   (
       SELECT
           user_agent,
           sum(pages_visited)
       GROUP BY user_id, user_agent
   )
)
ENGINE = MergeTree()
ORDER BY user_agent
```
データの挿入：
```sql
INSERT INTO visits SELECT
    number,
    'test',
    1.5 * (number / 2),
    'Android'
FROM numbers(1, 100);
```
```sql
INSERT INTO visits SELECT
    number,
    'test',
    1. * (number / 2),
   'IOS'
FROM numbers(100, 500);
```
最初のクエリを`GROUP BY`を使用して`user_agent`フィールドに対して実行します。このクエリは、事前集約が一致しないため、定義されたプロジェクションを使用しません。
```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

プロジェクションを使用するには、事前集約および`GROUP BY`フィールドの一部またはすべてを選択するクエリを実行することができます。
```sql
SELECT
    user_agent
FROM visits
WHERE user_id > 50 AND user_id < 150
GROUP BY user_agent
```
```sql
SELECT
    user_agent,
    sum(pages_visited)
FROM visits
GROUP BY user_agent
```

以前に述べたように、`system.query_log`テーブルを確認できます。`projections`フィールドには、使用されているプロジェクションの名前が表示され、使用されていない場合は空になります：
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## `_part_offset`フィールドを持つ通常のプロジェクション {#normal-projection-with-part-offset-field}

`_part_offset`フィールドを利用する通常のプロジェクションを持つテーブルの作成：

```sql
CREATE TABLE events
(
    `event_time` DateTime,
    `event_id` UInt64,
    `user_id` UInt64,
    `huge_string` String,
    PROJECTION order_by_user_id
    (
        SELECT
            _part_offset
        ORDER BY user_id
    )
)
ENGINE = MergeTree()
ORDER BY (event_id);
```

サンプルデータの挿入：

```sql
INSERT INTO events SELECT * FROM generateRandom() LIMIT 100000;
```

### `_part_offset`をセカンダリア索引として使用する {#normal-projection-secondary-index}

`_part_offset`フィールドはマージや変異を通じて値を保持するため、セカンダリア索引として価値があります。これをクエリで利用できます。

```sql
SELECT
    count()
FROM events
WHERE _part_starting_offset + _part_offset IN (
    SELECT _part_starting_offset + _part_offset
    FROM events
    WHERE user_id = 42
)
SETTINGS enable_shared_storage_snapshot_in_query = 1
```


# プロジェクションの操作

以下の操作が [プロジェクション](https://clickhouse.com/docs/ja/engines/table-engines/mergetree-family/mergetree.md/#projections) に対して可能です：

## PROJECTIONを追加 {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] )` - テーブルメタデータにプロジェクションの説明を追加します。

## PROJECTIONを削除 {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - テーブルメタデータからプロジェクションの説明を削除し、ディスクからプロジェクションファイルを削除します。[ミューテーション](https://clickhouse.com/docs/ja/sql-reference/statements/alter/index.md#mutations)として実装されています。

## PROJECTIONをマテリアライズ {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - クエリが`partition_name`においてプロジェクション`name`を再構築します。[ミューテーション](https://clickhouse.com/docs/ja/sql-reference/statements/alter/index.md#mutations)として実装されています。

## PROJECTIONをクリア {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 説明を削除せずにディスクからプロジェクションファイルを削除します。[ミューテーション](https://clickhouse.com/docs/ja/sql-reference/statements/alter/index.md#mutations)として実装されています。

コマンド`ADD`、`DROP`、`CLEAR`は、メタデータを変更するか、ファイルを削除するだけなので軽量です。

また、これらはレプリケーションされ、ClickHouse KeeperまたはZooKeeperを介してプロジェクションメタデータを同期します。

:::note
プロジェクションの操作は、[`*MergeTree`](https://clickhouse.com/docs/ja/engines/table-engines/mergetree-family/mergetree.md)エンジンを持つテーブルに対してのみサポートされています（[レプリケート](https://clickhouse.com/docs/ja/engines/table-engines/mergetree-family/replication.md)バリアントを含む）。
:::
