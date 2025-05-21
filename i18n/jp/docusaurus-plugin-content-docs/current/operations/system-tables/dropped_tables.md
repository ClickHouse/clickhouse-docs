---
description: 'DROP TABLEが実行されたテーブルに関する情報を含むシステムテーブルですが、データクリーンアップはまだ行われていません。'
keywords: ['system table', 'dropped_tables']
slug: /operations/system-tables/dropped_tables
title: 'system.dropped_tables'
---

DROP TABLEが実行されたテーブルに関する情報を含むシステムテーブルですが、データクリーンアップはまだ行われていません。

カラム:

- `index` ([UInt32](../../sql-reference/data-types/int-uint.md)) — marked_dropped_tables キューのインデックス。
- `database` ([String](../../sql-reference/data-types/string.md)) — データベース。
- `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — テーブルのUUID。
- `engine` ([String](../../sql-reference/data-types/string.md)) — テーブルエンジン名。
- `metadata_dropped_path` ([String](../../sql-reference/data-types/string.md)) — metadata_dropped ディレクトリ内のテーブルのメタデータファイルのパス。
- `table_dropped_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 次回テーブルのデータを削除する試行が予定されている時刻。通常、DROP TABLEが行われた時刻に `database_atomic_delay_before_drop_table_sec` を加えたものです。

**例**

以下の例は、`dropped_tables` に関する情報を取得する方法を示しています。

```sql
SELECT *
FROM system.dropped_tables\G
```

```text
行 1:
──────
index:                 0
database:              default
table:                 test
uuid:                  03141bb2-e97a-4d7c-a172-95cc066bb3bd
engine:                MergeTree
metadata_dropped_path: /data/ClickHouse/build/programs/data/metadata_dropped/default.test.03141bb2-e97a-4d7c-a172-95cc066bb3bd.sql
table_dropped_time:    2023-03-16 23:43:31
```
