---
description: 'キュー内の保留中の非同期挿入に関する情報を含むシステムテーブル。'
keywords: ['system table', 'asynchronous_inserts']
slug: /operations/system-tables/asynchronous_inserts
title: 'system.asynchronous_inserts'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

キュー内の保留中の非同期挿入に関する情報を含みます。

カラム:

- `query` ([String](../../sql-reference/data-types/string.md)) — クエリ文字列。
- `database` ([String](../../sql-reference/data-types/string.md)) — テーブルが存在するデータベースの名前。
- `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `format` ([String](/sql-reference/data-types/string.md)) — フォーマット名。
- `first_update` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒の精度での初回挿入時間。
- `total_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — キュー内で待機しているバイトの合計数。
- `entries.query_id` ([Array(String)](../../sql-reference/data-types/array.md)) - キュー内で待機している挿入のクエリIDの配列。
- `entries.bytes` ([Array(UInt64)](../../sql-reference/data-types/array.md)) - キュー内で待機している各挿入クエリのバイトの配列。

**例**

クエリ:

```sql
SELECT * FROM system.asynchronous_inserts LIMIT 1 \G;
```

結果:

```text
Row 1:
──────
query:            INSERT INTO public.data_guess (user_id, datasource_id, timestamp, path, type, num, str) FORMAT CSV
database:         public
table:            data_guess
format:           CSV
first_update:     2023-06-08 10:08:54.199606
total_bytes:      133223
entries.query_id: ['b46cd4c4-0269-4d0b-99f5-d27668c6102e']
entries.bytes:    [133223]
```

**関連情報**

- [system.query_log](/operations/system-tables/query_log) — クエリの実行に関する一般的な情報を含む `query_log` システムテーブルの説明。
- [system.asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) — このテーブルには実行された非同期挿入に関する情報が含まれています。
