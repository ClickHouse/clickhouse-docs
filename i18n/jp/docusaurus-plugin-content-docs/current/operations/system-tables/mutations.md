---
description: 'MergeTree テーブルに対する mutation（データ変更処理）とその進行状況に関する情報を含むシステムテーブルです。各 mutation コマンドは 1 行として表現されます。'
keywords: ['system table', 'mutations']
slug: /operations/system-tables/mutations
title: 'system.mutations'
doc_type: 'reference'
---

# system.mutations

このテーブルには、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) テーブルに対する[ミューテーション](/sql-reference/statements/alter/index.md#mutations)とその進捗状況に関する情報が含まれます。各ミューテーションコマンドは 1 行として表されます。

## 列: \{#columns\}

- `database` ([String](/sql-reference/data-types/string.md)) — ミューテーションが適用されたデータベース名。
- `table` ([String](/sql-reference/data-types/string.md)) — ミューテーションが適用されたテーブル名。
- `mutation_id` ([String](/sql-reference/data-types/string.md)) — ミューテーションの ID。レプリケーテッドテーブルの場合、これらの ID は ClickHouse Keeper 内の `<table_path_in_clickhouse_keeper>/mutations/` ディレクトリにある znode 名に対応します。非レプリケーテッドテーブルの場合、ID はテーブルのデータディレクトリ内のファイル名に対応します。
- `command` ([String](/sql-reference/data-types/string.md)) — ミューテーションコマンド文字列（クエリ中の `ALTER TABLE [db.]table` 以降の部分）。
- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) —  ミューテーションコマンドが実行用に送信された日時。
- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — レプリケーテッドテーブルのミューテーションの場合、パーティション ID を格納する配列（各パーティションにつき 1 レコード）。非レプリケーテッドテーブルのミューテーションの場合、この配列は空です。
- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — レプリケーテッドテーブルのミューテーションの場合、各パーティションごとに 1 レコードを格納する配列で、ミューテーションによって取得されたブロック番号を含みます。パーティション内では、この番号より小さい番号を持つブロックを含むパーツのみがミューテートされます。非レプリケーテッドテーブルでは、すべてのパーティションにわたるブロック番号が単一のシーケンスを形成します。つまり、非レプリケーテッドテーブルのミューテーションでは、この列にはミューテーションによって取得された単一のブロック番号を持つ 1 レコードのみが含まれます。
- `parts_in_progress_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 現在ミューテート中のデータパーツの名前の配列。
- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — ミューテーション完了のためにミューテートする必要があるデータパーツの名前の配列。
- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — ミューテーション完了のためにミューテートする必要があるデータパーツの数。
- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — ミューテーションが kill されているかどうかを示します。**ClickHouse Cloud でのみ利用可能です。**

:::note 
`is_killed=1` は、ミューテーションが完全に確定していることを必ずしも意味しません。`is_killed=1` かつ `is_done=0` の状態のまま長時間残り続けることがあります。これは、別の長時間実行中のミューテーションが kill されたミューテーションをブロックしている場合に発生します。この状況は想定された動作です。
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — ミューテーションが完了しているかどうかを示すフラグ。取りうる値:
  - ミューテーションが完了している場合は `1`
  - ミューテーションがまだ進行中の場合は `0`

:::note
`parts_to_do = 0` の場合でも、レプリケーテッドテーブルのミューテーションがまだ完了していない可能性があります。これは、新しいデータパーツを作成し、そのパーツをミューテートする必要がある長時間実行中の `INSERT` クエリが存在する場合に発生します。
:::

一部のデータパーツのミューテートに問題があった場合、次の列に追加情報が格納されます:

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — ミューテートに失敗した最新のパーツ名。
- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 最新のパーツミューテーション失敗の発生日時。
- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 最新のパーツミューテーション失敗を引き起こした例外メッセージ。

## ミューテーションの監視

`system.mutations` テーブルの進捗状況を追跡するには、次のクエリを使用します。

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'system', 'mutations')
WHERE is_done = 0 AND table = 'tmp';

-- もしくは

SELECT * FROM clusterAllReplicas('cluster_name', 'system.mutations')
WHERE is_done = 0 AND table = 'tmp';
```

注意: これには `system.*` テーブルに対する読み取り権限が必要です。

:::tip Cloud usage
ClickHouse Cloud では、各ノード上の `system.mutations` テーブルにクラスター内のすべての変更操作が含まれているため、`clusterAllReplicas` を使用する必要はありません。
:::

**関連項目**

* [Mutations](/sql-reference/statements/alter/index.md#mutations)
* [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) テーブルエンジン
* [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md) ファミリー
