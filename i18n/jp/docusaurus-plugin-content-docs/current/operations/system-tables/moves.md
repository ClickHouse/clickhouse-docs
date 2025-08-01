---
description: 'MergeTree テーブルの進行中のデータパーツ移動に関する情報を含むシステムテーブルです。各データパーツの移動が単一の行で表されます。'
keywords:
- 'system table'
- 'moves'
slug: '/operations/system-tables/moves'
title: 'system.moves'
---




# system.moves

このテーブルには、進行中の [data part moves](/sql-reference/statements/alter/partition#move-partitionpart) に関する情報が含まれています。これは [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) テーブルのデータパーツの移動を表しており、各データパートの移動は1行で表現されます。

列:

- `database` ([String](/sql-reference/data-types/string.md)) — データベースの名前。

- `table` ([String](/sql-reference/data-types/string.md)) — 移動中のデータパートを含むテーブルの名前。

- `elapsed` ([Float64](../../sql-reference/data-types/float.md)) — データパートの移動が開始してからの経過時間（秒）。

- `target_disk_name` ([String](disks.md)) — データパートが移動する [disk](/operations/system-tables/disks/) の名前。

- `target_disk_path` ([String](disks.md)) — ファイルシステム内の [disk](/operations/system-tables/disks/) のマウントポイントへのパス。

- `part_name` ([String](/sql-reference/data-types/string.md)) — 移動中のデータパートの名前。

- `part_size` ([UInt64](../../sql-reference/data-types/int-uint.md)) — データパートのサイズ。

- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 移動を行っているスレッドの識別子。

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

- [MergeTree](/engines/table-engines/mergetree-family/mergetree.md) テーブルエンジン
- [データストレージのための複数のブロックデバイスの使用](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes)
- [ALTER TABLE ... MOVE PART](/sql-reference/statements/alter/partition#move-partitionpart) コマンド
