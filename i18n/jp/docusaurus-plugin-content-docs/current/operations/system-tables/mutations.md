---
'description': 'システムテーブルは、MergeTree テーブルの変異とその進行状況に関する情報を含んでいます。各変異コマンドは、単一の行で表されます。'
'keywords':
- 'system table'
- 'mutations'
'slug': '/operations/system-tables/mutations'
'title': 'system.mutations'
'doc_type': 'reference'
---


# system.mutations

このテーブルは、[mutations](/sql-reference/statements/alter/index.md#mutations)の情報を含み、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)テーブルとその進行状況を示します。各ミューテーションコマンドは、1行で表されます。

## Columns: {#columns}

- `database` ([String](/sql-reference/data-types/string.md)) — ミューテーションが適用されたデータベースの名前。

- `table` ([String](/sql-reference/data-types/string.md)) — ミューテーションが適用されたテーブルの名前。

- `mutation_id` ([String](/sql-reference/data-types/string.md)) — ミューテーションのID。レプリケートテーブルの場合、これらのIDはClickHouse Keeperの`<table_path_in_clickhouse_keeper>/mutations/`ディレクトリ内のznode名に対応します。非レプリケートテーブルの場合、これらのIDはテーブルのデータディレクトリ内のファイル名に対応します。

- `command` ([String](/sql-reference/data-types/string.md)) — ミューテーションコマンドの文字列（`ALTER TABLE [db.]table`の後のクエリの部分）。

- `create_time` ([DateTime](/sql-reference/data-types/datetime.md)) — ミューテーションコマンドが実行のために提出された日時。

- `block_numbers.partition_id` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — レプリケートテーブルのミューテーションの場合、配列にはパーティションのIDが含まれます（各パーティションごとに1レコード）。非レプリケートテーブルのミューテーションの場合、配列は空です。

- `block_numbers.number` ([Array](/sql-reference/data-types/array.md)([Int64](/sql-reference/data-types/int-uint.md))) — レプリケートテーブルのミューテーションの場合、配列には各パーティションごとに1レコードが含まれ、ミューテーションによって取得されたブロック番号が示されます。この番号より小さい番号のブロックを含むパーツのみがパーティション内でミューテートされます。

    非レプリケートテーブルの場合、すべてのパーティションのブロック番号は単一のシーケンスを形成します。これは、非レプリケートテーブルのミューテーションの場合、カラムにはミューテーションによって取得された単一のブロック番号を持つ1レコードが含まれることを意味します。

- `parts_to_do_names` ([Array](/sql-reference/data-types/array.md)([String](/sql-reference/data-types/string.md))) — ミューテーションが完了するためにミューテートされる必要があるデータパーツの名前の配列。

- `parts_to_do` ([Int64](/sql-reference/data-types/int-uint.md)) — ミューテーションが完了するためにミューテートされる必要があるデータパーツの数。

- `is_killed` ([UInt8](/sql-reference/data-types/int-uint.md)) — ミューテーションがキャンセルされたかどうかを示します。 **ClickHouse Cloudでのみ使用可能です。**

:::note 
`is_killed=1`は、ミューテーションが完全に最終化されたことを必ずしも意味するわけではありません。ミューテーションが`is_killed=1`かつ`is_done=0`の状態を長期間維持することが可能です。これは、別の長時間実行中のミューテーションが殺されたミューテーションをブロックしている場合に発生する可能性があります。これは通常の状況です。
:::

- `is_done` ([UInt8](/sql-reference/data-types/int-uint.md)) — ミューテーションが完了したかどうかを示すフラグ。可能な値:
  - `1` はミューテーションが完了したことを示し、
  - `0` はミューテーションがまだ処理中であることを示します。

:::note
`parts_to_do = 0`であっても、レプリケートテーブルのミューテーションがまだ完了していない可能性があります。これは、新しいデータパーツを作成するために長時間実行される`INSERT`クエリが原因である可能性があります。
:::

データパーツのミューテーションに問題があった場合、以下のカラムに追加情報が含まれます。

- `latest_failed_part` ([String](/sql-reference/data-types/string.md)) — ミューテートできなかった最新のパーツの名前。

- `latest_fail_time` ([DateTime](/sql-reference/data-types/datetime.md)) — 最新のパーツミューテーション失敗の日時。

- `latest_fail_reason` ([String](/sql-reference/data-types/string.md)) — 最新のパーツミューテーション失敗の原因となった例外メッセージ。

## Monitoring Mutations {#monitoring-mutations}

system.mutations テーブルの進捗を追跡するには、次のようなクエリを使用します - これは、system.*テーブルに対する読み取り権限を必要とします。

```sql
SELECT * FROM clusterAllReplicas('cluster_name', 'db', system.mutations)
WHERE is_done=0 AND table='tmp';
```

:::tip
`table='tmp'`の`tmp`を、ミューテーションを確認するテーブルの名前に置き換えてください。
:::

**参照**

- [Mutations](/sql-reference/statements/alter/index.md#mutations)
- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) テーブルエンジン
- [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication.md) ファミリー
