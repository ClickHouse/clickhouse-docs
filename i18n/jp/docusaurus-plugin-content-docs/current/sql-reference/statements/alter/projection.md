---
slug: /sql-reference/statements/alter/projection
sidebar_position: 49
sidebar_label: PROJECTION
title: "プロジェクション"
---

プロジェクションはクエリ実行を最適化する形式でデータを格納します。この機能は以下の用途に便利です:
- 主キーの一部ではないカラムに対してクエリを実行すること
- カラムの事前集計を行うことで、計算とI/Oの両方を削減すること

テーブルに対して1つ以上のプロジェクションを定義することができ、クエリ分析中に必要なデータを最小限にスキャンするプロジェクションがClickHouseによって選択されます。ユーザーが提供したクエリは変更されません。

:::note ディスク使用量

プロジェクションは内部に新しい隠れたテーブルを作成します。このため、より多くのI/Oおよびディスクスペースが必要になります。
例えば、プロジェクションが異なる主キーを定義している場合、元のテーブルのすべてのデータが重複します。
:::

プロジェクションの内部動作に関する詳細な技術情報はこの [ページ](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections) で見ることができます。

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
`ALTER TABLE` を使用して、既存のテーブルにプロジェクションを追加できます:
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

プロジェクションを使用することで、元のテーブルで `user_name` が `PRIMARY_KEY` として定義されていなくても、`user_name` で高速にフィルタリングできます。
クエリ実行時にClickHouseは、プロジェクションを使用することで処理するデータが少なくなることを判断しました。データは `user_name` によって順序付けられています。
```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

クエリがプロジェクションを使用しているか確認するには、`system.query_log` テーブルを確認できます。`projections` フィールドには、使用されたプロジェクションの名前が表示され、使用されていない場合は空になります:
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## 事前集計クエリの例 {#example-pre-aggregation-query}

プロジェクションを含むテーブルを作成:
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
最初のクエリを `GROUP BY` を使用して `user_agent` フィールドで実行します。このクエリはプロジェクションを使用しません。事前集計が一致しないためです。
```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

プロジェクションを使用するには、事前集計または `GROUP BY` フィールドの一部またはすべてを選択するクエリを実行できます。
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

前述のように、`system.query_log` テーブルを確認できます。`projections` フィールドには、使用されたプロジェクションの名前が表示され、使用されていない場合は空になります:
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


# プロジェクションの操作

次の操作は [プロジェクション](/engines/table-engines/mergetree-family/mergetree.md/#projections) に対して利用可能です:

## ADD PROJECTION {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] )` - テーブルのメタデータにプロジェクションの説明を追加します。

## DROP PROJECTION {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - テーブルのメタデータからプロジェクションの説明を削除し、ディスクからプロジェクションファイルを削除します。これは [変異](/sql-reference/statements/alter/index.md#mutations) として実装されています。

## MATERIALIZE PROJECTION {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - このクエリは `partition_name` のパーティションでプロジェクション `name` を再構築します。これは [変異](/sql-reference/statements/alter/index.md#mutations) として実装されています。

## CLEAR PROJECTION {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 説明を削除せずに、ディスクからプロジェクションファイルを削除します。これは [変異](/sql-reference/statements/alter/index.md#mutations) として実装されています。

`ADD`、`DROP`、および `CLEAR` コマンドは、メタデータを変更するかファイルを削除するだけであるため、軽量です。

また、これらはレプリケートされており、ClickHouse Keeper または ZooKeeper を介してプロジェクションのメタデータを同期します。

:::note
プロジェクションの操作は、[`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) エンジン（[レプリケート](/engines/table-engines/mergetree-family/replication.md) バリアントを含む）を持つテーブルに対してのみサポートされています。
:::
