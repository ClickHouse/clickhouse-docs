---
description: 'MergeTree テーブルのミューテーションおよびその進行状況に関する情報を保持する system テーブルです。各ミューテーションコマンドは 1 行で表されます。'
keywords: ['system テーブル', 'ミューテーション']
slug: /operations/system-tables/mutations
title: 'system.mutations'
doc_type: 'reference'
---

# system.mutations \\{#systemmutations\\}

このテーブルには、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md) テーブルに対する[ミューテーション](/sql-reference/statements/alter/index.md#mutations)と、その進行状況に関する情報が含まれます。各ミューテーションコマンドは 1 行で表現されます。

## Columns: \\{#columns\\}

- `database` ([String](/sql-reference/data-types/string.md)) — ミューテーションが適用されたデータベースの名前。
- `table` ([String](/sql-reference/data-types/string.md)) — ミューテーションが適用されたテーブルの名前。
- `mutation_id` ([String](/sql-reference/data-types/string.md)) — ミューテーションのID。レプリケートされたテーブルの場合、これらのIDはClickHouse Keeperの`<table_path_in_clickhouse_keeper>/mutations/`ディレクトリ内のznode名に対応します。レプリケートされていないテーブルの場合、IDはテーブルのデータディレクトリ内のファイル名に対応します。
- `command` ([String](/sql-reference/data-types/string.md)) — ミューテーションコマンド文字列(`ALTER TABLE [db.]table`の後のクエリ部分)。
- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — ミューテーションコマンドが実行のために送信された日時。
- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — レプリケートされたテーブルのミューテーションの場合、配列にはパーティションのID(各パーティションに1つのレコード)が含まれます。レプリケートされていないテーブルのミューテーションの場合、配列は空です。
- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — レプリケートされたテーブルのミューテーションの場合、配列には各パーティションに対して1つのレコードが含まれ、ミューテーションによって取得されたブロック番号が格納されます。パーティション内では、この番号より小さい番号のブロックを含むパートのみがミューテーションされます。レプリケートされていないテーブルでは、すべてのパーティションのブロック番号が単一のシーケンスを形成します。つまり、レプリケートされていないテーブルのミューテーションの場合、この列にはミューテーションによって取得された単一のブロック番号を持つ1つのレコードが含まれます。
- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — ミューテーションを完了するためにミューテーションする必要があるデータパートの名前の配列。
- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — ミューテーションを完了するためにミューテーションする必要があるデータパートの数。
- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — ミューテーションが強制終了されたかどうかを示します。**ClickHouse Cloudでのみ利用可能です。**

:::note
`is_killed=1`は、必ずしもミューテーションが完全に終了したことを意味するわけではありません。`is_killed=1`かつ`is_done=0`の状態が長期間続くことがあります。これは、別の長時間実行されているミューテーションが強制終了されたミューテーションをブロックしている場合に発生する可能性があります。これは正常な状況です。
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — ミューテーションが完了しているかどうかを示すフラグ。可能な値:
  - `1` ミューテーションが完了している場合、
  - `0` ミューテーションがまだ処理中の場合。

:::note
`parts_to_do = 0`であっても、長時間実行されている`INSERT`クエリがミューテーションする必要がある新しいデータパートを作成するため、レプリケートされたテーブルのミューテーションがまだ完了していない可能性があります。
:::

一部のデータパートのミューテーションに問題があった場合、以下の列に追加情報が含まれます:

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — ミューテーションできなかった最新のパートの名前。
- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 最新のパートミューテーション失敗の日時。
- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 最新のパートミューテーション失敗の原因となった例外メッセージ。

## ミューテーションの監視 \\{#monitoring-mutations\\}

`system.mutations`テーブルで進行状況を追跡するには、以下のクエリを使用します：

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'system', 'mutations')
WHERE is_done = 0 AND table = 'tmp';

-- or

SELECT * FROM clusterAllReplicas('cluster_name', 'system.mutations')
WHERE is_done = 0 AND table = 'tmp';
```

注：これには`system.*`テーブルに対する読み取り権限が必要です。

:::tip Cloudでの使用
ClickHouse Cloudでは、各ノードの`system.mutations`テーブルにクラスタ内のすべてのミューテーションが含まれているため、`clusterAllReplicas`を使用する必要はありません。
:::

**関連項目**

- [ミューテーション](/sql-reference/statements/alter/index.md#mutations)
- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)テーブルエンジン
- [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md)ファミリー
