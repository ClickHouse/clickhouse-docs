---
'description': 'Documentation for Manipulating Projections'
'sidebar_label': 'PROJECTION'
'sidebar_position': 49
'slug': '/sql-reference/statements/alter/projection'
'title': 'Projections'
---



Projectionsはクエリ実行を最適化する形式でデータを格納します。この機能は次のような場合に便利です：
- 主キーの一部ではないカラムに対してクエリを実行する場合
- カラムを前集約することで、計算とIOの両方を削減します

テーブルに1つ以上のプロジェクションを定義でき、クエリ分析の際には、ユーザーが提供したクエリを変更することなく、スキャンするデータが最も少ないプロジェクションをClickHouseが選択します。

:::note ディスク使用量

プロジェクションは内部で新しい隠しテーブルを作成します。これは、より多くのIOとディスクスペースが必要になることを意味します。例えば、プロジェクションが異なる主キーを定義している場合、元のテーブルのすべてのデータが重複します。
:::

プロジェクションが内部でどのように機能するかについての詳細な技術情報は、この [ページ](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections) で確認できます。

## 主キーを使用しないフィルタリングの例 {#example-filtering-without-using-primary-keys}

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
`ALTER TABLE` を使用して、既存のテーブルにプロジェクションを追加することができます：
```sql
ALTER TABLE visits_order ADD PROJECTION user_name_projection (
SELECT
*
ORDER BY user_name
)

ALTER TABLE visits_order MATERIALIZE PROJECTION user_name_projection
```
データを挿入する：
```sql
INSERT INTO visits_order SELECT
    number,
    'test',
    1.5 * (number / 2),
    'Android'
FROM numbers(1, 100);
```

プロジェクションを使用することで、元のテーブルで `user_name` が `PRIMARY_KEY` として定義されていなくても、`user_name` によるフィルターを高速に行うことができます。
クエリ時にClickHouseは、データが `user_name` の順に並んでいるため、プロジェクションを使用する方が処理するデータが少なくなると判断しました。
```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

クエリがプロジェクションを使用しているかどうかを確認するには、`system.query_log` テーブルを確認することができます。`projections` フィールドには、使用されたプロジェクションの名前が表示されます。使用されていない場合は空になります：
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## 前集約クエリの例 {#example-pre-aggregation-query}

プロジェクションを使ったテーブルの作成：
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
データを挿入する：
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
最初のクエリでは `GROUP BY` を使用して `user_agent` フィールドを利用します。このクエリは、前集約が一致しないため、定義されたプロジェクションを使用しません。
```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

プロジェクションを使用するには、前集約および `GROUP BY` フィールドの一部またはすべてを選択するクエリを実行します。
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

前述の通り、`system.query_log` テーブルを確認することも可能です。`projections` フィールドには、使用されたプロジェクションの名前が表示されます。使用されていない場合は空になります：
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## `_part_offset` フィールドを持つ通常のプロジェクション {#normal-projection-with-part-offset-field}

`_part_offset` フィールドを利用する通常のプロジェクションを持つテーブルを作成：

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

サンプルデータを挿入する：

```sql
INSERT INTO events SELECT * FROM generateRandom() LIMIT 100000;
```

### `_part_offset` をセカンダリインデックスとして使用 {#normal-projection-secondary-index}

`_part_offset` フィールドはマージや変異を通じてその値を保持し、セカンダリインデックスとして有用です。これをクエリで活用できます：

```sql
SELECT
    count()
FROM events
WHERE (_part, _part_offset) IN (
    SELECT _part, _part_offset
    FROM events
    WHERE user_id = 42
)
```


# プロジェクションの操作

次の操作が可能です [プロジェクション](/engines/table-engines/mergetree-family/mergetree.md/#projections):

## ADD PROJECTION {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] )` - テーブルメタデータにプロジェクションの説明を追加します。

## DROP PROJECTION {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - テーブルメタデータからプロジェクションの説明を削除し、ディスクからプロジェクションファイルを削除します。[変異](/sql-reference/statements/alter/index.md#mutations)として実装されています。

## MATERIALIZE PROJECTION {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - クエリは `partition_name` 内のプロジェクション `name` を再構築します。[変異](/sql-reference/statements/alter/index.md#mutations)として実装されています。

## CLEAR PROJECTION {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 説明を削除することなくディスクからプロジェクションファイルを削除します。[変異](/sql-reference/statements/alter/index.md#mutations)として実装されています。

コマンド `ADD`、`DROP` および `CLEAR` は、メタデータを変更するか、ファイルを削除するだけの軽量です。

また、これらはレプリケートされ、ClickHouse Keeper または ZooKeeper を介してプロジェクションメタデータが同期されます。

:::note
プロジェクションの操作は、[`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) エンジン（[レプリケーション](/engines/table-engines/mergetree-family/replication.md) バリアントを含む）を持つテーブルに対してのみサポートされています。
:::
