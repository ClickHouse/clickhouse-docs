---
description: "キュー内の保留中の非同期挿入に関する情報を含むシステムテーブル。"
slug: /operations/system-tables/asynchronous_inserts
title: "system.asynchronous_inserts"
keywords: ["システムテーブル", "非同期挿入"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

キュー内の保留中の非同期挿入に関する情報を含んでいます。

カラム:

- `query` ([String](../../sql-reference/data-types/string.md)) — クエリ文字列。
- `database` ([String](../../sql-reference/data-types/string.md)) — テーブルが存在するデータベースの名前。
- `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `format` ([String](/sql-reference/data-types/string.md)) — フォーマット名。
- `first_update` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒解像度の最初の挿入時間。
- `total_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — キュー内で待機しているバイトの合計数。
- `entries.query_id` ([Array(String)](../../sql-reference/data-types/array.md)) - キュー内で待機する挿入のクエリIDの配列。
- `entries.bytes` ([Array(UInt64)](../../sql-reference/data-types/array.md)) - キュー内で待機する各挿入クエリのバイトの配列。

**例**

クエリ:

``` sql
SELECT * FROM system.asynchronous_inserts LIMIT 1 \G;
```

結果:

``` text
行 1:
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

- [system.query_log](/operations/system-tables/query_log) — クエリ実行に関する一般情報を含む `query_log` システムテーブルの説明。
- [system.asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) — 実行された非同期挿入に関する情報を含むこのテーブル。
