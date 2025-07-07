---
'description': 'System table containing information about disks defined in the server
  configuration'
'keywords':
- 'system table'
- 'disks'
'slug': '/operations/system-tables/disks'
'title': 'system.disks'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

サーバー設定に定義されたディスクに関する情報を含みます。[server configuration](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure)を参照してください。

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — サーバー設定におけるディスクの名前。
- `path` ([String](../../sql-reference/data-types/string.md)) — ファイルシステム内のマウントポイントへのパス。
- `free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ディスクの空き容量（バイト単位）。
- `total_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ディスクの総容量（バイト単位）。
- `unreserved_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 予約に取られていない空き容量（`free_space` から、現在実行中のマージ、挿入、およびその他のディスク書き込み操作によって取られた予約のサイズを引いたもの）。
- `keep_free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ディスクに空けておくべき空きスペースの量（バイト単位）。ディスク設定の `keep_free_space_bytes` パラメータで定義されています。

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
