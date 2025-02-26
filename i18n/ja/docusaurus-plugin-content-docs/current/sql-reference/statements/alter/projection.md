---
slug: /sql-reference/statements/alter/projection
sidebar_position: 49
sidebar_label: PROJECTION
title: "プロジェクション"
---

プロジェクションはクエリ実行を最適化する形式でデータを保存します。この機能は以下の用途に役立ちます：
- 主キーの一部でないカラムに対してクエリを実行すること
- カラムを事前に集計することにより、計算とI/Oを削減します

テーブルに対して1つ以上のプロジェクションを定義でき、クエリ分析中にスキャンすべきデータが最も少ないプロジェクションが、ユーザーが提供したクエリを変更することなくClickHouseによって選択されます。

:::note ディスク使用量

プロジェクションは内部的に新しい隠しテーブルを作成します。これは、より多くのI/Oとディスクスペースが必要であることを意味します。たとえば、プロジェクションに異なる主キーが定義されている場合、元のテーブルのすべてのデータが重複します。
:::

プロジェクションの内部作業についての技術的な詳細は、この[ページ](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections)で確認できます。

## 主キーを使用せずにフィルタリングする例 {#example-filtering-without-using-primary-keys}

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

プロジェクションを使用することで、元のテーブルで`user_name`が`PRIMARY_KEY`として定義されていなくても、`user_name`で高速にフィルタリングできます。
クエリ実行時にClickHouseはプロジェクションを使用することで処理するデータが少なくなると判断しました。このデータは`user_name`で順序付けされています。
```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

クエリがプロジェクションを使用しているかどうかを確認するには、`system.query_log`テーブルを確認できます。`projections`フィールドには使用されたプロジェクションの名前が表示され、使用されなかった場合は空になります:
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

## プレ集計クエリの例 {#example-pre-aggregation-query}

プロジェクションを持つテーブルの作成:
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
最初のクエリを実行し、`user_agent`フィールドで`GROUP BY`を使用します。このクエリは、プレ集計が一致しないため、定義されたプロジェクションを使用しません。
```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

プロジェクションを使用するには、プレ集計の一部またはすべてのフィールドを選択するクエリを実行できます。
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

先ほど述べたように、`system.query_log`テーブルを確認することもできます。`projections`フィールドには使用されたプロジェクションの名前が表示され、使用されなかった場合は空になります:
```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```

# プロジェクションの操作

以下の操作が[プロジェクション](/engines/table-engines/mergetree-family/mergetree.md/#projections)で利用できます：

## ADD PROJECTION {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] )` - テーブルのメタデータにプロジェクションの説明を追加します。

## DROP PROJECTION {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - テーブルのメタデータからプロジェクションの説明を削除し、ディスクからプロジェクションファイルを削除します。これは[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

## MATERIALIZE PROJECTION {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - このクエリは、パーティション`partition_name`内でプロジェクション`name`を再構築します。これは[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

## CLEAR PROJECTION {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 説明を削除せずにディスクからプロジェクションファイルを削除します。これは[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。

`ADD`、`DROP`および`CLEAR`コマンドは、メタデータのみを変更するかファイルを削除するため、軽量です。

また、これらは複製され、ClickHouse KeeperまたはZooKeeperを介してプロジェクションメタデータを同期します。

:::note
プロジェクションの操作は、[`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md)エンジン（[レプリケート](/engines/table-engines/mergetree-family/replication.md)バリアントを含む）を持つテーブルのみでサポートされています。
:::
