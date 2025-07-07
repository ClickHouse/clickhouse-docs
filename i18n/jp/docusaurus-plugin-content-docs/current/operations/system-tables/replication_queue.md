---
'description': 'System table containing information about tasks from replication queues
  stored in ClickHouse Keeper, or ZooKeeper, for tables in the `ReplicatedMergeTree`
  family.'
'keywords':
- 'system table'
- 'replication_queue'
'slug': '/operations/system-tables/replication_queue'
'title': 'system.replication_queue'
---

# system.replication_queue

ClickHouse Keeper または ZooKeeper に保存されている複製キューからのタスクに関する情報を含んでいます。この情報は `ReplicatedMergeTree` ファミリーのテーブルに関連しています。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — データベースの名前。

- `table` ([String](../../sql-reference/data-types/string.md)) — テーブルの名前。

- `replica_name` ([String](../../sql-reference/data-types/string.md)) — ClickHouse Keeper におけるレプリカの名前。同じテーブルの異なるレプリカには異なる名前があります。

- `position` ([UInt32](../../sql-reference/data-types/int-uint.md)) — キュー内のタスクの位置。

- `node_name` ([String](../../sql-reference/data-types/string.md)) — ClickHouse Keeper におけるノードの名前。

- `type` ([String](../../sql-reference/data-types/string.md)) — キュー内のタスクの種類。次のいずれかです:

    - `GET_PART` — 他のレプリカからパーツを取得します。
    - `ATTACH_PART` — パーツをアタッチします。これは、`detached` フォルダに見つかった場合、通常、自分のレプリカからの可能性があります。これを、ほぼ同じである `GET_PART` にいくつかの最適化を加えたものとして考えてください。
    - `MERGE_PARTS` — パーツをマージします。
    - `DROP_RANGE` — 指定された番号範囲内の指定されたパーティションのパーツを削除します。
    - `CLEAR_COLUMN` — 注意: 非推奨。指定されたパーティションから特定のカラムを削除します。
    - `CLEAR_INDEX` — 注意: 非推奨。指定されたパーティションから特定のインデックスを削除します。
    - `REPLACE_RANGE` — 特定の範囲のパーツを削除し、新しいもので置き換えます。
    - `MUTATE_PART` — パーツに1つまたは複数の変更を適用します。
    - `ALTER_METADATA` — グローバルの /metadata および /columns パスに従って変更を適用します。

- `create_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — タスクが実行のために提出された日時。

- `required_quorum` ([UInt32](../../sql-reference/data-types/int-uint.md)) — タスクが完了するのを確認するために待機しているレプリカの数。このカラムは `GET_PARTS` タスクにのみ関連します。

- `source_replica` ([String](../../sql-reference/data-types/string.md)) — ソースレプリカの名前。

- `new_part_name` ([String](../../sql-reference/data-types/string.md)) — 新しいパーツの名前。

- `parts_to_merge` ([Array](../../sql-reference/data-types/array.md) ([String](../../sql-reference/data-types/string.md))) — マージまたは更新するパーツの名前。

- `is_detach` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `DETACH_PARTS` タスクがキューにあるかどうかを示すフラグ。

- `is_currently_executing` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 特定のタスクが現在実行中かどうかを示すフラグ。

- `num_tries` ([UInt32](../../sql-reference/data-types/int-uint.md)) — タスクを完了するための失敗した試行の回数。

- `last_exception` ([String](../../sql-reference/data-types/string.md)) — 発生した最後のエラーに関するテキストメッセージ（ある場合）。

- `last_attempt_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — タスクが最後に試行された日時。

- `num_postponed` ([UInt32](../../sql-reference/data-types/int-uint.md)) — アクションが延期された回数。

- `postpone_reason` ([String](../../sql-reference/data-types/string.md)) — タスクが延期された理由。

- `last_postpone_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — タスクが最後に延期された日時。

- `merge_type` ([String](../../sql-reference/data-types/string.md)) — 現在のマージの種類。変異の場合は空です。

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

**参照先**

- [ReplicatedMergeTree テーブルの管理](/sql-reference/statements/system#managing-replicatedmergetree-tables)
