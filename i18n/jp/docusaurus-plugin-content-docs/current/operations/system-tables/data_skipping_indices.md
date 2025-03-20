---
description: "既存のデータスキッピングインデックスに関する情報を含むシステムテーブル。"
slug: /operations/system-tables/data_skipping_indices
title: "system.data_skipping_indices"
keywords: ["system table", "data_skipping_indices"]
---

すべてのテーブルに存在するデータスキッピングインデックスに関する情報を含んでいます。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — データベース名。
- `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `name` ([String](../../sql-reference/data-types/string.md)) — インデックス名。
- `type` ([String](../../sql-reference/data-types/string.md)) — インデックスタイプ。
- `type_full` ([String](../../sql-reference/data-types/string.md)) — CREATE文からのインデックスタイプ表現。
- `expr` ([String](../../sql-reference/data-types/string.md)) — インデックス計算のための式。
- `granularity` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ブロック内のグラニュール数。
- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 圧縮データのサイズ（バイト）。
- `data_uncompressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 非圧縮データのサイズ（バイト）。
- `marks_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — マークのサイズ（バイト）。

**例**

```sql
SELECT * FROM system.data_skipping_indices LIMIT 2 FORMAT Vertical;
```

```text
Row 1:
──────
database:    default
table:       user_actions
name:        clicks_idx
type:        minmax
type_full:   minmax
expr:        clicks
granularity: 1
data_compressed_bytes:   58
data_uncompressed_bytes: 6
marks_bytes:             48

Row 2:
──────
database:    default
table:       users
name:        contacts_null_idx
type:        minmax
type_full:   minmax
expr:        assumeNotNull(contacts_null)
granularity: 1
data_compressed_bytes:   58
data_uncompressed_bytes: 6
marks_bytes:             48
```
