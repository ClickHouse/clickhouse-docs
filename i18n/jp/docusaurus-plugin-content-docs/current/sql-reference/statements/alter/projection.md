---
description: 'プロジェクションの操作に関するドキュメンテーション'
sidebar_label: 'プロジェクション'
sidebar_position: 49
slug: /sql-reference/statements/alter/projection
title: 'プロジェクション'
---

プロジェクションは、クエリの実行を最適化する形式でデータを保存します。この機能は以下の目的に役立ちます：
- 主キーの一部でないカラムに対してクエリを実行する
- カラムを事前に集約することで、計算と入出力 (IO) を削減する

テーブルのために1つ以上のプロジェクションを定義でき、クエリ分析中にClickHouseはスキャンするデータが最も少ないプロジェクションを選択します。ユーザーが提供したクエリは変更されません。

:::note ディスク使用量

プロジェクションは内部的に新しい隠しテーブルを作成するため、より多くの入出力およびディスク上のスペースが必要になります。
例：プロジェクションが異なる主キーを定義した場合、元のテーブルのすべてのデータが重複します。
:::

プロジェクションが内部でどのように機能するかについてのさらなる技術的詳細は、この [ページ](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections) で確認できます。

## 主キーを使用しないフィルタリングの例 {#example-filtering-without-using-primary-keys}

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
`ALTER TABLE`を使用して、既存のテーブルにプロジェクションを追加できます：
```sql
ALTER TABLE visits_order ADD PROJECTION user_name_projection (
SELECT
*
ORDER BY user_name
)

ALTER TABLE visits_order MATERIALIZE PROJECTION user_name_projection
```
データを挿入:
```sql
INSERT INTO visits_order SELECT
    number,
    'test',
    1.5 * (number / 2),
    'Android'
FROM numbers(1, 100);
```

このプロジェクションによって、元のテーブルで`user_name`が`PRIMARY_KEY`として定義されていなくても、`user_name`による高速なフィルタリングが可能になります。
クエリ実行時にClickHouseは、プロジェクションが使用される場合、処理されるデータが少なくなることを判断します。データは`user_name`で順序付けられています。
```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

プロジェクションが使用されているかどうかを確認するには、`system.query_log`テーブルをレビューできます。`projections`フィールドには使用されたプロジェクションの名前が表示され、使用されていなければ空になります：
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## 事前集約クエリの例 {#example-pre-aggregation-query}

プロジェクションを持つテーブルを作成:
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
データを挿入:
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
最初のクエリで`GROUP BY`を使用して`user_agent`のフィールドを選択します。このクエリは、事前集約が一致しないため、定義されたプロジェクションを使用しません。
```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

プロジェクションを使用するには、事前集約および`GROUP BY`フィールドの一部またはすべてを選択するクエリを実行できます。
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

前述のように、`system.query_log`テーブルを確認できます。`projections`フィールドには使用されたプロジェクションの名前が表示され、使用されていなければ空になります：
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## `_part_offset`フィールドを持つ通常のプロジェクション {#normal-projection-with-part-offset-field}

`_part_offset`フィールドを利用する通常のプロジェクションを持つテーブルを作成:

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

サンプルデータを挿入:

```sql
INSERT INTO events SELECT * FROM generateRandom() LIMIT 100000;
```

### `_part_offset`をセカンダリインデックスとして使用 {#normal-projection-secondary-index}

`_part_offset`フィールドはマージや変異を通じてその値を保持し、セカンダリインデックスにとって価値があります。これをクエリで活用できます：

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

以下の[プロジェクション](/engines/table-engines/mergetree-family/mergetree.md/#projections)に関する操作が可能です：

## ADD PROJECTION {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] )` - テーブルメタデータにプロジェクションの説明を追加します。

## DROP PROJECTION {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - テーブルメタデータからプロジェクションの説明を削除し、ディスクからプロジェクションファイルを削除します。これは[変異](/sql-reference/statements/alter/index.md#mutations)として実装されています。

## MATERIALIZE PROJECTION {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - クエリは`partition_name`のパーティションでプロジェクション`name`を再構築します。これは[変異](/sql-reference/statements/alter/index.md#mutations)として実装されています。

## CLEAR PROJECTION {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 説明を削除せずにディスクからプロジェクションファイルを削除します。これは[変異](/sql-reference/statements/alter/index.md#mutations)として実装されています。

コマンド`ADD`、`DROP`、および`CLEAR`は、メタデータを変更するか、ファイルを削除するだけで軽量です。

これらはレプリケート可能で、ClickHouse KeeperやZooKeeperを介してプロジェクションメタデータを同期します。

:::note
プロジェクションの操作は[`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md)エンジン（[レプリケート](/engines/table-engines/mergetree-family/replication.md)バリアントを含む）を持つテーブルに対してのみサポートされています。
:::
