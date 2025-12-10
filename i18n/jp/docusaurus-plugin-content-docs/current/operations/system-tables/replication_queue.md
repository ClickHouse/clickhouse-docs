---
description: 'ClickHouse Keeper または ZooKeeper に保存されている、`ReplicatedMergeTree`
  ファミリーのテーブル用レプリケーションキュー内のタスクに関する情報を保持するシステムテーブル。'
keywords: ['system table', 'replication_queue']
slug: /operations/system-tables/replication_queue
title: 'system.replication_queue'
doc_type: 'reference'
---

# system.replication&#95;queue {#systemreplication&#95;queue}

ClickHouse Keeper または ZooKeeper に保存されている、`ReplicatedMergeTree` ファミリーのテーブル用のレプリケーションキュー内のタスクに関する情報が含まれます。

カラム:

* `database` ([String](../../sql-reference/data-types/string.md)) — データベース名。

* `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。

* `replica_name` ([String](../../sql-reference/data-types/string.md)) — ClickHouse Keeper 内のレプリカ名。同じテーブルの異なるレプリカは、それぞれ異なる名前を持ちます。

* `position` ([UInt32](../../sql-reference/data-types/int-uint.md)) — キュー内でのタスクの位置。

* `node_name` ([String](../../sql-reference/data-types/string.md)) — ClickHouse Keeper 内のノード名。

* `type` ([String](../../sql-reference/data-types/string.md)) — キュー内のタスクの種類。次のいずれか:

  * `GET_PART` — 他のレプリカからパーツを取得します。
  * `ATTACH_PART` — パーツをアタッチします。`detached` フォルダ内で見つかった場合は、同じレプリカからのパーツである可能性があります。`GET_PART` とほぼ同一で、一部が最適化されたものと考えることができます。
  * `MERGE_PARTS` — パーツをマージします。
  * `DROP_RANGE` — 指定されたパーティション内の、指定された範囲のパーツを削除します。
  * `CLEAR_COLUMN` — 注: 非推奨。指定したパーティションから特定のカラムを削除します。
  * `CLEAR_INDEX` — 注: 非推奨。指定したパーティションから特定のインデックスを削除します。
  * `REPLACE_RANGE` — 特定の範囲のパーツを削除し、新しいパーツで置き換えます。
  * `MUTATE_PART` — パーツに対して 1 つまたは複数のミューテーション (mutation) を適用します。
  * `ALTER_METADATA` — グローバルな /metadata および /columns パスに従って ALTER による変更を適用します。

* `create_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — タスクが実行のために投入された日時。

* `required_quorum` ([UInt32](../../sql-reference/data-types/int-uint.md)) — タスクの完了および完了確認を待っているレプリカの数。このカラムは `GET_PARTS` タスクにのみ関連します。

* `source_replica` ([String](../../sql-reference/data-types/string.md)) — ソースレプリカ名。

* `new_part_name` ([String](../../sql-reference/data-types/string.md)) — 新しいパーツ名。

* `parts_to_merge` ([Array](../../sql-reference/data-types/array.md) ([String](../../sql-reference/data-types/string.md))) — マージまたは更新の対象となるパーツ名。

* `is_detach` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `DETACH_PARTS` タスクがキューにあるかどうかを示すフラグ。

* `is_currently_executing` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 特定のタスクが現在実行中かどうかを示すフラグ。

* `num_tries` ([UInt32](../../sql-reference/data-types/int-uint.md)) — タスクの実行に失敗した試行回数。

* `last_exception` ([String](../../sql-reference/data-types/string.md)) — 発生した最後のエラー (存在する場合) に関するテキストメッセージ。

* `last_attempt_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 最後にタスクの実行を試行した日時。

* `num_postponed` ([UInt32](../../sql-reference/data-types/int-uint.md)) — アクションが延期された回数。

* `postpone_reason` ([String](../../sql-reference/data-types/string.md)) — タスクが延期された理由。

* `last_postpone_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 最後にタスクが延期された日時。

* `merge_type` ([String](../../sql-reference/data-types/string.md)) — 現在実行中のマージの種類。ミューテーションの場合は空になります。

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

**関連情報**

* [ReplicatedMergeTree テーブルの管理](/sql-reference/statements/system#managing-replicatedmergetree-tables)
