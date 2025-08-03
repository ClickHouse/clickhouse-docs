---
description: 'MergeTree テーブルとその進行状況に関する変異に関する情報を含むシステムテーブル。各変異コマンドは単一の行で表されます。'
keywords:
- 'system table'
- 'mutations'
slug: '/operations/system-tables/mutations'
title: 'system.mutations'
---




# system.mutations

このテーブルは、[mutations](/sql-reference/statements/alter/index.md#mutations) の情報を含んでおり、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) テーブルの進捗を示します。各ミューテーションコマンドは単一の行で表されています。

## Columns: {#columns}

- `database` ([String](/sql-reference/data-types/string.md)) — ミューテーションが適用されたデータベースの名前。

- `table` ([String](/sql-reference/data-types/string.md)) — ミューテーションが適用されたテーブルの名前。

- `mutation_id` ([String](/sql-reference/data-types/string.md)) — ミューテーションのID。レプリケーションされたテーブルでは、これらのIDは ClickHouse Keeper の `<table_path_in_clickhouse_keeper>/mutations/` ディレクトリ内の znode 名に対応します。非レプリケーションテーブルでは、これらのIDはテーブルのデータディレクトリ内のファイル名に対応します。

- `command` ([String](/sql-reference/data-types/string.md)) — ミューテーションコマンドの文字列（`ALTER TABLE [db.]table` の後のクエリの部分）。

- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — ミューテーションコマンドが実行のために提出された日時。

- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — レプリケーションテーブルのミューテーションについて、配列にはパーティションのIDが含まれています（各パーティションごとに1レコード）。非レプリケーションテーブルのミューテーションについては、配列は空です。

- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — レプリケーションテーブルのミューテーションについて、配列には各パーティションごとに1レコードが含まれ、ミューテーションによって取得されたブロック番号が示されます。この番号未満のブロックを含むパーツのみが、パーティション内でミューテートされます。

    非レプリケーションテーブルでは、すべてのパーティションのブロック番号が単一のシーケンスを形成します。これは、非レプリケーションテーブルのミューテーションの場合、カラムがミューテーションによって取得された単一のブロック番号を持つ1レコードを含むことを意味します。

- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — ミューテーションを完了させるためにミューテートする必要のあるデータパーツの名前の配列。

- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — ミューテーションを完了させるためにミューテートする必要のあるデータパーツの数。

- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — ミューテーションが中断されたかどうかを示します。**ClickHouse Cloud でのみ利用可能。**

:::note 
`is_killed=1` は、ミューテーションが完全に終了したことを意味するわけではありません。`is_killed=1` かつ `is_done=0` の状態が長時間続く可能性があります。これは、別の長時間実行中のミューテーションが中断されたミューテーションをブロックしている場合に発生することがあります。これは通常の状況です。
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — ミューテーションが完了したかどうかのフラグ。可能な値：
    - `1` ミューテーションが完了した場合、
    - `0` ミューテーションがまだ進行中の場合。

:::note
`parts_to_do = 0` でも、長時間実行されている `INSERT` クエリによって新しいデータパートが作成され、そのためにミューテートが必要な場合、レプリケーションテーブルのミューテーションが未完了の可能性があります。
:::

データパーツのミューテーションに問題が発生した場合、以下のカラムに追加情報が含まれます：

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — ミューテートできなかった最も最近のパートの名前。

- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 最も最近のパートのミューテーション失敗の日時。

- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 最も最近のパートのミューテーション失敗を引き起こした例外メッセージ。

## Monitoring Mutations {#monitoring-mutations}

system.mutations テーブルの進捗を追跡するには、次のようなクエリを使用します - これは system.* テーブルに対する読み取り権限を必要とします：

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'db', system.mutations)
WHERE is_done=0 AND table='tmp';
```

:::tip
`table='tmp'` の `tmp` を、ミューテーションをチェックしているテーブルの名前に置き換えてください。
:::

**See Also**

- [Mutations](/sql-reference/statements/alter/index.md#mutations)
- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) テーブルエンジン
- [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md) ファミリー
