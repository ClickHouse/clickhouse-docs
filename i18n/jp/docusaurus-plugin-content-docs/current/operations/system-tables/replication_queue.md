---
description: 'ClickHouse Keeper または ZooKeeper に保存されている、`ReplicatedMergeTree`
  ファミリーのテーブル用のレプリケーションキューに含まれるタスクに関する情報を格納するシステムテーブルです。'
keywords: ['system table', 'replication_queue']
slug: /operations/system-tables/replication_queue
title: 'system.replication_queue'
doc_type: 'reference'
---

# system.replication&#95;queue

`ReplicatedMergeTree` ファミリーのテーブルについて、ClickHouse Keeper または ZooKeeper に保存されているレプリケーションキュー内のタスクに関する情報を保持します。

Columns:

* `database` ([String](../../sql-reference/data-types/string.md)) — データベース名。

* `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。

* `replica_name` ([String](../../sql-reference/data-types/string.md)) — ClickHouse Keeper におけるレプリカ名。同一テーブルの異なるレプリカは、それぞれ異なる名前を持ちます。

* `position` ([UInt32](../../sql-reference/data-types/int-uint.md)) — キュー内でのタスクの位置。

* `node_name` ([String](../../sql-reference/data-types/string.md)) — ClickHouse Keeper におけるノード名。

* `type` ([String](../../sql-reference/data-types/string.md)) — キュー内のタスクの種類。次のいずれか:

  * `GET_PART` — 別のレプリカからパーツを取得します。
  * `ATTACH_PART` — パーツをアタッチします。`detached` フォルダ内で見つかった場合は、自身のレプリカからのパーツの可能性があります。`GET_PART` とほぼ同一であり、一部の最適化が入ったものとみなすことができます。
  * `MERGE_PARTS` — パーツをマージします。
  * `DROP_RANGE` — 指定されたパーティション内の、指定された範囲のパーツを削除します。
  * `CLEAR_COLUMN` — 注意：非推奨。指定されたパーティションから特定のカラムを削除します。
  * `CLEAR_INDEX` — 注意：非推奨。指定されたパーティションから特定のインデックスを削除します。
  * `REPLACE_RANGE` — 一定範囲のパーツを削除し、新しいパーツで置き換えます。
  * `MUTATE_PART` — パーツに 1 つまたは複数のミューテーションを適用します。
  * `ALTER_METADATA` — グローバルな /metadata および /columns パスに従って ALTER による変更を適用します。

* `create_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — タスクが実行のために投入された日時。

* `required_quorum` ([UInt32](../../sql-reference/data-types/int-uint.md)) — タスク完了の確認を待っているレプリカの数。このカラムは `GET_PARTS` タスクに対してのみ該当します。

* `source_replica` ([String](../../sql-reference/data-types/string.md)) — ソースレプリカの名前。

* `new_part_name` ([String](../../sql-reference/data-types/string.md)) — 新しいパーツの名前。

* `parts_to_merge` ([Array](../../sql-reference/data-types/array.md) ([String](../../sql-reference/data-types/string.md))) — マージまたは更新対象のパーツ名。

* `is_detach` ([UInt8](../../sql-reference/data-types/int-uint.md)) — `DETACH_PARTS` タスクがキューに存在するかどうかを示すフラグ。

* `is_currently_executing` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 特定のタスクが現在実行中かどうかを示すフラグ。

* `num_tries` ([UInt32](../../sql-reference/data-types/int-uint.md)) — タスクの実行に失敗した試行回数。

* `last_exception` ([String](../../sql-reference/data-types/string.md)) — 発生した最後のエラーに関するテキストメッセージ（存在する場合）。

* `last_attempt_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — タスクが最後に実行を試みられた日時。

* `num_postponed` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 処理が延期された回数。

* `postpone_reason` ([String](../../sql-reference/data-types/string.md)) — タスクが延期された理由。

* `last_postpone_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — タスクが最後に延期された日時。

* `merge_type` ([String](../../sql-reference/data-types/string.md)) — 現在のマージの種類。ミューテーションである場合は空になります。

**Example**

```sql
SELECT * FROM system.replication_queue LIMIT 1 FORMAT Vertical;
```


```text
行 1:
──────
データベース:           merge
テーブル:               visits_v2
レプリカ名:             mtgiga001-1t
位置:                   15
ノード名:               queue-0009325559
タイプ:                 MERGE_PARTS
作成時刻:               2020-12-07 14:04:21
必要なクォーラム:       0
ソースレプリカ:         mtgiga001-1t
新しいパート名:         20201130_121373_121384_2
マージ対象パーツ:       ['20201130_121373_121378_1','20201130_121379_121379_0','20201130_121380_121380_0','20201130_121381_121381_0','20201130_121382_121382_0','20201130_121383_121383_0','20201130_121384_121384_0']
切り離しフラグ:         0
実行中フラグ:           0
試行回数:               36
最後の例外:             Code: 226, e.displayText() = DB::Exception: Marks file '/opt/clickhouse/data/merge/visits_v2/tmp_fetch_20201130_121373_121384_2/CounterID.mrk' does not exist (version 20.8.7.15 (official build))
最後の試行時刻:         2020-12-08 17:35:54
保留回数:               0
保留理由:
最後の保留時刻:         1970-01-01 03:00:00
```

**関連項目**

* [ReplicatedMergeTree テーブルの管理](/sql-reference/statements/system#managing-replicatedmergetree-tables)
