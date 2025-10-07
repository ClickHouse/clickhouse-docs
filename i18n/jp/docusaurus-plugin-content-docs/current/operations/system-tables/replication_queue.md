---
'description': 'システムテーブルは、`ReplicatedMergeTree` ファミリーのテーブル用に ClickHouse Keeper または
  ZooKeeper に保存されているレプリケーションキューからのタスクに関する情報を含んでいます。'
'keywords':
- 'system table'
- 'replication_queue'
'slug': '/operations/system-tables/replication_queue'
'title': 'system.replication_queue'
'doc_type': 'reference'
---


# system.replication_queue

ClickHouse Keeper または ZooKeeper に保存されているレプリケーションキューからのタスクに関する情報が含まれています。これは `ReplicatedMergeTree` ファミリーのテーブルに関連しています。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — データベースの名前。

- `table` ([String](../../sql-reference/data-types/string.md)) — テーブルの名前。

- `replica_name` ([String](../../sql-reference/data-types/string.md)) — ClickHouse Keeper におけるレプリカ名。同じテーブルの異なるレプリカは異なる名前を持ちます。

- `position` ([UInt32](../../sql-reference/data-types/int-uint.md)) — キュー内のタスクの位置。

- `node_name` ([String](../../sql-reference/data-types/string.md)) — ClickHouse Keeper 内のノード名。

- `type` ([String](../../sql-reference/data-types/string.md)) — キュー内のタスクのタイプ、以下のいずれかです:

  - `GET_PART` — 他のレプリカからパーツを取得します。
  - `ATTACH_PART` — パーツを添付します。おそらく自分のレプリカから（`detached` フォルダ内に存在する場合）。これは `GET_PART` とほぼ同じなので、最適化された `GET_PART` と考えることができます。
  - `MERGE_PARTS` — パーツをマージします。
  - `DROP_RANGE` — 指定された数値範囲で指定されたパーティション内のパーツを削除します。
  - `CLEAR_COLUMN` — 注: 非推奨。指定されたパーティションから特定のカラムを削除します。
  - `CLEAR_INDEX` — 注: 非推奨。指定されたパーティションから特定のインデックスを削除します。
  - `REPLACE_RANGE` — 特定の範囲のパーツを削除し、新しいものと置き換えます。
  - `MUTATE_PART` — パーツに1つまたは複数のミューテーションを適用します。
  - `ALTER_METADATA` — グローバル /metadata と /columns パスに従って変更を適用します。

- `create_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — タスクが実行のために提出された日時。

- `required_quorum` ([UInt32](../../sql-reference/data-types/int-uint.md)) — タスクの完了を確認するために待機しているレプリカの数。これは `GET_PARTS` タスクにのみ関連します。

- `source_replica` ([String](../../sql-reference/data-types/string.md)) — ソースレプリカの名前。

- `new_part_name` ([String](../../sql-reference/data-types/string.md)) — 新しいパーツの名前。

- `parts_to_merge` ([Array](../../sql-reference/data-types/array.md) ([String](../../sql-reference/data-types/string.md))) — マージまたは更新するパーツの名前。

- `is_detach` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `DETACH_PARTS` タスクがキューにあるかどうかを示すフラグ。

- `is_currently_executing` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 特定のタスクが現在実行中かどうかを示すフラグ。

- `num_tries` ([UInt32](../../sql-reference/data-types/int-uint.md)) — タスクを完了させるための失敗した試行の回数。

- `last_exception` ([String](../../sql-reference/data-types/string.md)) — 最後に発生したエラーに関するテキストメッセージ（あれば）。

- `last_attempt_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — タスクが最後に試みられた日時。

- `num_postponed` ([UInt32](../../sql-reference/data-types/int-uint.md)) — アクションが延期された回数。

- `postpone_reason` ([String](../../sql-reference/data-types/string.md)) — タスクが延期された理由。

- `last_postpone_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — タスクが最後に延期された日時。

- `merge_type` ([String](../../sql-reference/data-types/string.md)) — 現在のマージのタイプ。ミューテーションの場合は空です。

**例**

```sql
SELECT * FROM system.replication_queue LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
database:               merge
table:                  visits_v2
replica_name:           mtgiga001-1t
position:               15
node_name:              queue-0009325559
type:                   MERGE_PARTS
create_time:            2020-12-07 14:04:21
required_quorum:        0
source_replica:         mtgiga001-1t
new_part_name:          20201130_121373_121384_2
parts_to_merge:         ['20201130_121373_121378_1','20201130_121379_121379_0','20201130_121380_121380_0','20201130_121381_121381_0','20201130_121382_121382_0','20201130_121383_121383_0','20201130_121384_121384_0']
is_detach:              0
is_currently_executing: 0
num_tries:              36
last_exception:         Code: 226, e.displayText() = DB::Exception: Marks file '/opt/clickhouse/data/merge/visits_v2/tmp_fetch_20201130_121373_121384_2/CounterID.mrk' does not exist (version 20.8.7.15 (official build))
last_attempt_time:      2020-12-08 17:35:54
num_postponed:          0
postpone_reason:
last_postpone_time:     1970-01-01 03:00:00
```

**参照**

- [ReplicatedMergeTree テーブルの管理](/sql-reference/statements/system#managing-replicatedmergetree-tables)
