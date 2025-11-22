---
description: 'プロジェクション操作に関するドキュメント'
sidebar_label: 'プロジェクション'
sidebar_position: 49
slug: /sql-reference/statements/alter/projection
title: 'プロジェクション'
doc_type: 'reference'
---

プロジェクションは、クエリ実行を最適化できる形式でデータを保存します。この機能は次のような用途に有用です。
- 主キーに含まれないカラムに対してクエリを実行する場合
- カラムを事前に集計し、計算量と I/O の両方を削減する場合

1 つのテーブルに対して 1 つ以上のプロジェクションを定義できます。クエリの解析時に、ユーザーが記述したクエリ自体を変更することなく、スキャンするデータ量が最も少ないプロジェクションが ClickHouse によって自動的に選択されます。

:::note ディスク使用量

プロジェクションは内部的に新しい隠しテーブルを作成します。そのため、追加の I/O とディスク上の領域が必要となります。
例えば、プロジェクションで異なる主キーを定義した場合、元のテーブルのすべてのデータが複製されます。
:::

プロジェクションが内部的にどのように動作するかについてのより技術的な詳細は、この[ページ](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections)を参照してください。



## プライマリキーを使用しないフィルタリングの例 {#example-filtering-without-using-primary-keys}

テーブルの作成:

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

`ALTER TABLE`を使用して、既存のテーブルにプロジェクションを追加できます:

```sql
ALTER TABLE visits_order ADD PROJECTION user_name_projection (
SELECT
*
ORDER BY user_name
)

ALTER TABLE visits_order MATERIALIZE PROJECTION user_name_projection
```

データの挿入:

```sql
INSERT INTO visits_order SELECT
    number,
    'test',
    1.5 * (number / 2),
    'Android'
FROM numbers(1, 100);
```

プロジェクションを使用すると、元のテーブルで`user_name`が`PRIMARY_KEY`として定義されていない場合でも、`user_name`による高速なフィルタリングが可能になります。
クエリ実行時、ClickHouseはデータが`user_name`で順序付けられているため、プロジェクションを使用することで処理されるデータ量が少なくなると判断します。

```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

クエリがプロジェクションを使用しているかを確認するには、`system.query_log`テーブルを参照します。`projections`フィールドには、使用されたプロジェクションの名前が格納され、使用されていない場合は空になります:

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


## 事前集計クエリの例 {#example-pre-aggregation-query}

プロジェクションを含むテーブルの作成:

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

データの挿入:

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

まず、`user_agent`フィールドを使用した`GROUP BY`クエリを実行します。このクエリは、事前集計が一致しないため、定義されたプロジェクションを使用しません。

```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

プロジェクションを使用するには、事前集計フィールドと`GROUP BY`フィールドの一部または全部を選択するクエリを実行します。

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

前述のように、`system.query_log`テーブルを確認できます。`projections`フィールドには、使用されたプロジェクションの名前が格納され、使用されていない場合は空になります:

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


## `_part_offset`フィールドを使用した通常のプロジェクション {#normal-projection-with-part-offset-field}

`_part_offset`フィールドを利用した通常のプロジェクションを持つテーブルを作成します:

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

サンプルデータを挿入します:

```sql
INSERT INTO events SELECT * FROM generateRandom() LIMIT 100000;
```

### セカンダリインデックスとしての`_part_offset`の使用 {#normal-projection-secondary-index}

`_part_offset`フィールドはマージやミューテーションを通じてその値を保持するため、セカンダリインデックスとして有用です。クエリでこれを活用できます:

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

[プロジェクション](/engines/table-engines/mergetree-family/mergetree.md/#projections) に対して、次の操作を行えます。



## プロジェクションの追加 {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] )` - テーブルのメタデータにプロジェクションの記述を追加します。


## DROP PROJECTION {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - テーブルのメタデータからプロジェクションの記述を削除し、ディスクからプロジェクションファイルを削除します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。


## MATERIALIZE PROJECTION {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - このクエリは、パーティション `partition_name` 内のプロジェクション `name` を再構築します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。


## CLEAR PROJECTION {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 定義を削除せずに、ディスクからプロジェクションファイルを削除します。[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

`ADD`、`DROP`、`CLEAR`コマンドは、メタデータの変更またはファイルの削除のみを行うため軽量です。

また、これらはレプリケートされ、ClickHouse KeeperまたはZooKeeperを介してプロジェクションメタデータを同期します。

:::note
プロジェクションの操作は、[`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md)エンジン（[レプリケート](/engines/table-engines/mergetree-family/replication.md)バリアントを含む）を使用するテーブルでのみサポートされています。
:::
