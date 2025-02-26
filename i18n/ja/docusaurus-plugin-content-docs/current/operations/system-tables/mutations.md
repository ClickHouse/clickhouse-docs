---
description: "MergeTree テーブルの変異とその進行状況に関する情報を含むシステムテーブルです。各変異コマンドは単一の行で表されます。"
slug: /operations/system-tables/mutations
title: "mutations"
keywords: ["システムテーブル", "変異"]
---

このテーブルは、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) テーブルの[変異](/sql-reference/statements/alter/index.md#mutations)とその進行状況に関する情報を含みます。各変異コマンドは単一の行で表されます。

## カラム: {#columns}

- `database` ([String](/sql-reference/data-types/string.md)) — 変異が適用されたデータベースの名前。

- `table` ([String](/sql-reference/data-types/string.md)) — 変異が適用されたテーブルの名前。

- `mutation_id` ([String](/sql-reference/data-types/string.md)) — 変異の ID。レプリケートテーブルの場合、これらの ID は ClickHouse Keeper の `<table_path_in_clickhouse_keeper>/mutations/` ディレクトリ内の znode 名に対応しています。非レプリケートテーブルの場合、これらの ID はテーブルのデータディレクトリ内のファイル名に対応しています。

- `command` ([String](/sql-reference/data-types/string.md)) — 変異コマンド文字列（`ALTER TABLE [db.]table` の後のクエリ部分）。

- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 変異コマンドが実行のために提出された日時。

- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — レプリケートテーブルの変異に対して、配列はパーティションの ID を含みます（各パーティションごとに1レコード）。非レプリケートテーブルの変異の場合、配列は空です。

- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — レプリケートテーブルの変異に対して、配列は各パーティションごとの1レコードを含み、変異によって取得されたブロック番号が記載されています。この番号より小さい番号のブロックを含むパーツのみが、そのパーティションで変異されます。

    非レプリケートテーブルでは、すべてのパーティションのブロック番号は単一のシーケンスを形成します。つまり、非レプリケートテーブルの変異に対して、カラムは変異によって取得された単一のブロック番号の1レコードを含みます。

- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — 変異を完了するために変異する必要があるデータパーツの名前の配列。

- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — 変異を完了するために変異する必要があるデータパーツの数。

- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — 変異が終了されたかどうかを示します。**ClickHouse Cloud でのみ利用可能です。**

:::note 
`is_killed=1` は、変異が完全に確定されたことを必ずしも意味しません。他の長時間実行中の変異が終了された変異をブロックしている場合、`is_killed=1` かつ `is_done=0` の状態のままとなることがあります。これは正常な状況です。
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — 変異が完了したかどうかのフラグ。可能な値:
    - `1` 変異が完了している場合、
    - `0` 変異がまだ進行中の場合。

:::note
`parts_to_do = 0` であっても、レプリケートテーブルの変異が完了していない可能性があります。これは、新しいデータパーツを作成する必要がある長時間実行中の `INSERT` クエリのためです。
:::

データパーツの変異に問題があった場合、以下のカラムには追加の情報が含まれています：

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — 最も最近変異できなかったパーツの名前。

- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 最も最近のパーツ変異失敗の日時。

- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 最も最近のパーツ変異失敗の原因となった例外メッセージ。

## 変異の監視 {#monitoring-mutations}

system.mutations テーブルでの進行状況を追跡するには、以下のようなクエリを使用します - これは system.* テーブルに対する読み取り権限を必要とします：

``` sql
SELECT * FROM clusterAllReplicas('cluster_name', 'db', system.mutations)
WHERE is_done=0 AND table='tmp';
```

:::tip
`table='tmp'` の `tmp` を、変異をチェックするテーブルの名前に置き換えてください。
:::

**関連項目**

- [変異](/sql-reference/statements/alter/index.md#mutations)
- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) テーブルエンジン
- [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md) ファミリー
