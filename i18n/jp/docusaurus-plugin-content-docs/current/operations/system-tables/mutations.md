---
description: "MergeTreeテーブルの変異およびその進捗に関する情報を含むシステムテーブル。各変異コマンドは1つの行で表されます。"
slug: /operations/system-tables/mutations
title: "system.mutations"
keywords: ["システムテーブル", "変異"]
---

このテーブルは、[変異](/sql-reference/statements/alter/index.md#mutations)の情報を含んでおり、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)テーブルの進捗を示します。各変異コマンドは1つの行で表されます。

## カラム: {#columns}

- `database` ([String](/sql-reference/data-types/string.md)) — 変異が適用されたデータベースの名前。

- `table` ([String](/sql-reference/data-types/string.md)) — 変異が適用されたテーブルの名前。

- `mutation_id` ([String](/sql-reference/data-types/string.md)) — 変異のID。レプリケーションされたテーブルでは、これらのIDはClickHouse Keeperの`<table_path_in_clickhouse_keeper>/mutations/`ディレクトリ内のznode名に対応します。非レプリケーションテーブルでは、IDはテーブルのデータディレクトリ内のファイル名に対応します。

- `command` ([String](/sql-reference/data-types/string.md)) — 変異コマンド文字列（`ALTER TABLE [db.]table`の後のクエリ部分）。

- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 変異コマンドが実行のために送信された日時。

- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — レプリケーションされたテーブルの変異に対して、この配列はパーティションのIDを含みます（各パーティションの1レコード）。非レプリケーションテーブルの変異の場合、配列は空です。

- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — レプリケーションされたテーブルの変異に対して、この配列は各パーティションの1レコードを含み、変異によって取得されたブロック番号を示します。この番号より小さい番号のブロックを含むパーツのみがパーティション内で変異されます。

    非レプリケーションテーブルでは、すべてのパーティションのブロック番号が単一のシーケンスを形成します。つまり、非レプリケーションテーブルの変異に対して、このカラムは変異によって取得された単一のブロック番号を持つ1レコードを含みます。

- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 変異を完了させるために変異が必要なデータパーツの名前の配列。

- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — 変異を完了させるために変異が必要なデータパーツの数。

- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — 変異が終了したかどうかを示します。**ClickHouse Cloudでのみ利用可能です。**

:::note 
`is_killed=1`は必ずしも変異が完全に終了したことを意味するわけではありません。変異が`is_killed=1`かつ`is_done=0`の状態のまま長時間保持される可能性があります。これは、別の長時間実行中の変異が殺された変異をブロックしている場合に発生します。これは正常な状況です。
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — 変異が終了したかどうかのフラグ。可能な値:
    - `1` 変異が完了している場合、
    - `0` 変異がまだ進行中の場合。

:::note
`parts_to_do = 0`であっても、レプリケーションされたテーブルの変異が長時間実行されている`INSERT`クエリの影響で完了していない可能性があります。このクエリは、変異が必要な新しいデータパートを生成します。
:::

データパーツの変異に問題があった場合、以下のカラムには追加情報が含まれます。

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — 最も最近変異できなかったパートの名前。

- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 最も最近のパートの変異失敗の日時。

- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 最も最近のパートの変異失敗を引き起こした例外メッセージ。

## 変異の監視 {#monitoring-mutations}

system.mutationsテーブルの進捗を追跡するには、次のようなクエリを使用します - これにはsystem.*テーブルに対する読み取り権限が必要です：

``` sql
SELECT * FROM clusterAllReplicas('cluster_name', 'db', system.mutations)
WHERE is_done=0 AND table='tmp';
```

:::tip
`table='tmp'`の`tmp`を、変異を確認しているテーブルの名前に置き換えてください。
:::

**関連情報**

- [変異](/sql-reference/statements/alter/index.md#mutations)
- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) テーブルエンジン
- [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md) ファミリー
