---
description: 'プロジェクション操作に関するドキュメント'
sidebar_label: 'PROJECTION'
sidebar_position: 49
slug: /sql-reference/statements/alter/projection
title: 'プロジェクション'
doc_type: 'reference'
---

プロジェクションは、クエリ実行を最適化する形式でデータを保存します。この機能は次のような用途に有効です:
- プライマリキーに含まれていないカラムに対してクエリを実行する場合
- カラムを事前集約する場合。計算量と I/O の両方を削減できます

テーブルに対して 1 つ以上のプロジェクションを定義できます。クエリ解析時には、ユーザーが指定したクエリを変更することなく、スキャンするデータ量が最も少ないプロジェクションが ClickHouse によって自動的に選択されます。

:::note Disk usage

プロジェクションは内部的に新しい非表示テーブルを作成します。そのため、より多くの I/O とディスク容量が必要になります。
たとえば、プロジェクションで異なるプライマリキーを定義した場合、元のテーブルのすべてのデータが複製されます。
:::

プロジェクションの内部動作に関する、より技術的な詳細はこの[ページ](/guides/best-practices/sparse-primary-indexes.md/#option-3-projections)を参照してください。

## プライマリキーを使わずにフィルタリングする例 {#example-filtering-without-using-primary-keys}

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

`ALTER TABLE` を使って、既存のテーブルに Projection を追加できます。

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

この Projection により、元のテーブルで `user_name` が `PRIMARY_KEY` として定義されていなくても、`user_name` で高速にフィルタリングできるようになります。
クエリ実行時に ClickHouse は、データが `user_name` でソートされているため、Projection を使用した方が処理すべきデータ量が少なくなると判断しました。

```sql
SELECT
    *
FROM visits_order
WHERE user_name='test'
LIMIT 2
```

クエリが Projection を使用しているか確認するには、`system.query_log` テーブルを確認します。`projections` フィールドには、使用された Projection の名前が格納されており、使用されていない場合は空です。

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


## 事前集計クエリの例 {#example-pre-aggregation-query}

Projection を使用したテーブルの作成：

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

データの挿入

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

`user_agent` フィールドで `GROUP BY` を行う最初のクエリを実行します。このクエリでは、事前集約の条件が一致しないため、定義済みのプロジェクションは使用されません。

```sql
SELECT
    user_agent,
    count(DISTINCT user_id)
FROM visits
GROUP BY user_agent
```

このプロジェクションを利用するには、事前集約および `GROUP BY` で使用されるフィールドの一部またはすべてを選択するクエリを実行します。

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

前述のとおり、`system.query_log` テーブルを参照できます。`projections` フィールドには、使用されたプロジェクション名が格納されており、プロジェクションが使用されていない場合は空になります。

```sql
SELECT query, projections FROM system.query_log WHERE query_id='<query_id>'
```


## `_part_offset` フィールドを用いた通常のプロジェクション {#normal-projection-with-part-offset-field}

`_part_offset` フィールドを利用する通常のプロジェクションを持つテーブルを作成します。

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


### `_part_offset` をセカンダリインデックスとして使用する {#normal-projection-secondary-index}

`_part_offset` フィールドはマージやミューテーション後も値が保持されるため、セカンダリインデックスとして有用です。クエリでこれを活用できます。

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


# プロジェクションの操作 {#manipulating-projections}

[プロジェクション](/engines/table-engines/mergetree-family/mergetree.md/#projections)に対して、次の操作を実行できます。

## PROJECTION を追加する {#add-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] ADD PROJECTION [IF NOT EXISTS] name ( SELECT <COLUMN LIST EXPR> [GROUP BY] [ORDER BY] ) [WITH SETTINGS ( setting_name1 = setting_value1, setting_name2 = setting_value2, ...)]` - テーブルのメタデータに PROJECTION の定義を追加します。

### `WITH SETTINGS` 句 {#with-settings}

`WITH SETTINGS` は **PROJECTION レベルの設定**を定義し、`index_granularity` や `index_granularity_bytes` のような設定によって、PROJECTION がデータをどのように保存するかをカスタマイズします。
これらは **MergeTree テーブル設定**に直接対応しますが、**この PROJECTION に対してのみ適用**されます。

例:

```sql
ALTER TABLE t
ADD PROJECTION p (
    SELECT x ORDER BY x
) WITH SETTINGS (
    index_granularity = 4096,
    index_granularity_bytes = 1048576
);
```

Projection の設定は、検証ルールに従う範囲で、その Projection に対して有効となるテーブル設定を上書きします（たとえば、無効または非互換な上書きは拒否されます）。


## DROP PROJECTION {#drop-projection}

`ALTER TABLE [db.]name [ON CLUSTER cluster] DROP PROJECTION [IF EXISTS] name` - テーブルのメタデータからプロジェクションの定義を削除し、ディスクからプロジェクションファイルを削除します。[mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

## MATERIALIZE PROJECTION {#materialize-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] MATERIALIZE PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - このクエリは、パーティション `partition_name` 内でプロジェクション `name` を再構築します。[mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。

## CLEAR PROJECTION {#clear-projection}

`ALTER TABLE [db.]table [ON CLUSTER cluster] CLEAR PROJECTION [IF EXISTS] name [IN PARTITION partition_name]` - 定義は削除せずに、ディスクからプロジェクションファイルを削除します。[mutation](/sql-reference/statements/alter/index.md#mutations)として実装されています。

`ADD`、`DROP`、`CLEAR` コマンドは、メタデータを変更するかファイルを削除するだけの軽量な操作です。

また、これらの操作はレプリケートされ、ClickHouse Keeper または ZooKeeper を介してプロジェクションのメタデータを同期します。

:::note
プロジェクションの操作がサポートされるのは、[`*MergeTree`](/engines/table-engines/mergetree-family/mergetree.md) エンジン（[replicated](/engines/table-engines/mergetree-family/replication.md) バリアントを含む）のテーブルのみです。
:::