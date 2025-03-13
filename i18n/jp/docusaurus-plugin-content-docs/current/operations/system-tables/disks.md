---
description: "サーバ構成に定義されたディスクに関する情報を含むシステムテーブル"
slug: /operations/system-tables/disks
title: "system.disks"
keywords: ["system table", "disks"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

[サーバ構成](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure)に定義されたディスクに関する情報を含みます。

カラム：

- `name` ([String](../../sql-reference/data-types/string.md)) — サーバ構成におけるディスクの名前。
- `path` ([String](../../sql-reference/data-types/string.md)) — ファイルシステムにおけるマウントポイントへのパス。
- `free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ディスク上の空き領域（バイト単位）。
- `total_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ディスクボリューム（バイト単位）。
- `unreserved_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 予約によって取られていない空きスペース（`free_space` からマージ、挿入、および現在実行中の他のディスク書き込み操作によって取られた予約のサイズを引いたもの）。
- `keep_free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ディスク上で空きのままであるべきディスクスペースの量（バイト単位）。ディスク構成の `keep_free_space_bytes` パラメーターで定義されます。

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
