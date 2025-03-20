---
description: "進行中のデータパーツ移動に関する情報を含むシステムテーブル。各データパーツの移動は単一の行で表されます。"
slug: /operations/system-tables/moves
title: "system.moves"
keywords: ["システムテーブル", "移動"]
---

このテーブルは、[MergeTree](/engines/table-engines/mergetree-family/mergetree.md)テーブルの進行中の[data part moves](/sql-reference/statements/alter/partition#move-partitionpart)に関する情報を含んでいます。各データパーツの移動は単一の行で表されます。

カラム:

- `database` ([String](/sql-reference/data-types/string.md)) — データベースの名前。

- `table` ([String](/sql-reference/data-types/string.md)) — 移動中のデータパーツを含むテーブルの名前。

- `elapsed` ([Float64](../../sql-reference/data-types/float.md)) — データパーツの移動が開始されてから経過した時間（秒単位）。

- `target_disk_name` ([String](disks.md)) — データパーツが移動している[disk](/operations/system-tables/disks/)の名前。

- `target_disk_path` ([String](disks.md)) — ファイルシステム内の[ディスク](/operations/system-tables/disks/)のマウントポイントへのパス。

- `part_name` ([String](/sql-reference/data-types/string.md)) — 移動中のデータパーツの名前。

- `part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパーツのサイズ。

- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 移動を実行しているスレッドの識別子。

**例**

```sql
SELECT * FROM system.moves
```

```response
┌─database─┬─table─┬─────elapsed─┬─target_disk_name─┬─target_disk_path─┬─part_name─┬─part_size─┬─thread_id─┐
│ default  │ test2 │ 1.668056039 │ s3               │ ./disks/s3/      │ all_3_3_0 │       136 │    296146 │
└──────────┴───────┴─────────────┴──────────────────┴──────────────────┴───────────┴───────────┴───────────┘
```

**関連情報**

- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md)テーブルエンジン
- [データストレージ用の複数ブロックデバイスの使用](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)
- [ALTER TABLE ... MOVE PART](/sql-reference/statements/alter/partition#move-partitionpart) コマンド
