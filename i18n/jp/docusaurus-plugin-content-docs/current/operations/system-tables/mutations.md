---
description: 'MergeTreeテーブルの変異とその進捗に関する情報を含むシステムテーブルです。各変異コマンドは単一の行で表されます。'
keywords: ['system table', 'mutations']
slug: /operations/system-tables/mutations
title: 'system.mutations'
---


# system.mutations

このテーブルは、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) テーブルの[変異](/sql-reference/statements/alter/index.md#mutations)とその進捗に関する情報を含んでいます。各変異コマンドは単一の行で表されます。

## カラム: {#columns}

- `database` ([String](/sql-reference/data-types/string.md)) — 変異が適用されたデータベースの名前。

- `table` ([String](/sql-reference/data-types/string.md)) — 変異が適用されたテーブルの名前。

- `mutation_id` ([String](/sql-reference/data-types/string.md)) — 変異のID。レプリケーションされたテーブルでは、これらのIDはClickHouse Keeperの`<table_path_in_clickhouse_keeper>/mutations/`ディレクトリ内のznode名に対応します。非レプリケーションテーブルでは、これらのIDはテーブルのデータディレクトリ内のファイル名に対応します。

- `command` ([String](/sql-reference/data-types/string.md)) — 変異コマンドの文字列（`ALTER TABLE [db.]table`の後のクエリ部分）。

- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 変異コマンドが実行のために提出された日付と時間。

- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — レプリケーションされたテーブルの変異では、配列にはパーティションのIDが含まれます（各パーティションごとに1件のレコード）。非レプリケーションテーブルの変異では、配列は空です。

- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — レプリケーションされたテーブルの変異では、配列には各パーティションのレコードが含まれ、変異によって取得されたブロック番号が記録されています。この番号未満の番号を持つブロックがあるパーツのみがそのパーティション内で変異されます。

    非レプリケーションテーブルでは、すべてのパーティションのブロック番号は一つのシーケンスを形成します。つまり、非レプリケーションテーブルの変異の場合、カラムには変異によって取得された単一のブロック番号を含む1件のレコードが含まれます。

- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 変異を完了させるために変異が必要なデータパーツの名前の配列。

- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — 変異を完了させるために変異が必要なデータパーツの数。

- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — 変異が殺されたかどうかを示します。 **ClickHouse Cloud のみで利用可能です。**

:::note 
`is_killed=1` が必ずしも変異が完全に終了したことを意味するわけではありません。`is_killed=1` で `is_done=0` の状態が長期間続くこともあります。これは、他の長時間実行中の変異が殺された変異をブロックしている場合に発生する可能性があります。これは正常な状況です。
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — 変異が完了したかどうかを示すフラグ。可能な値:
    - `1` 変異が完了している場合、
    - `0` 変異がまだ進行中の場合。

:::note
`parts_to_do = 0` であっても、レプリケーションされたテーブルの変異がまだ完了していない場合があります。これは、新たに変異が必要なデータパーツを作成する長時間実行中の `INSERT` クエリが原因です。
:::

データパーツの変異に問題があった場合、次のカラムには追加の情報が含まれます。

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — 変異できなかった最も最近のパーツの名前。

- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 最も最近のパーツ変異失敗の日時。

- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 最も最近のパーツ変異失敗を引き起こした例外メッセージ。

## 変異の監視 {#monitoring-mutations}

system.mutations テーブルの進捗を追跡するには、次のようなクエリを使用します これは system.* テーブルに対する読み取り権限が必要です:

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'db', system.mutations)
WHERE is_done=0 AND table='tmp';
```

:::tip
`table='tmp'` の `tmp` を、変異を確認しているテーブルの名前に置き換えてください。
:::

**関連情報**

- [変異](/sql-reference/statements/alter/index.md#mutations)
- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) テーブルエンジン
- [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md) ファミリー
