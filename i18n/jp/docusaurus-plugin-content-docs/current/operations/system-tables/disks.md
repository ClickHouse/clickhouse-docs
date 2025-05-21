---
description: 'サーバー設定で定義されたディスクに関する情報を含むシステムテーブル'
keywords: ['system table', 'disks']
slug: /operations/system-tables/disks
title: 'system.disks'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

[サーバー設定](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure)で定義されたディスクに関する情報を含みます。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — サーバー設定におけるディスクの名前。
- `path` ([String](../../sql-reference/data-types/string.md)) — ファイルシステムにおけるマウントポイントへのパス。
- `free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ディスク上の空きスペース（バイト単位）。
- `total_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ディスク容量（バイト単位）。
- `unreserved_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 予約されていない空きスペース（`free_space` からマージや挿入、現在実行中のその他のディスク書き込み操作によって占有された予約のサイズを引いたもの）。
- `keep_free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ディスク上で空けておくべきディスクスペースの量（バイト単位）。ディスク設定の `keep_free_space_bytes` パラメータで定義されています。

**例**

```sql
SELECT * FROM system.disks;
```

```response
┌─name────┬─path─────────────────┬───free_space─┬──total_space─┬─keep_free_space─┐
│ default │ /var/lib/clickhouse/ │ 276392587264 │ 490652508160 │               0 │
└─────────┴──────────────────────┴──────────────┴──────────────┴─────────────────┘

1 rows in set. Elapsed: 0.001 sec.
```
