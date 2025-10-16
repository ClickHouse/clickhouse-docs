---
'description': 'サーバー構成に定義されたディスクに関する情報を含むシステムテーブル'
'keywords':
- 'system table'
- 'disks'
'slug': '/operations/system-tables/disks'
'title': 'system.disks'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

サーバー設定に定義されたディスクに関する情報を含みます。[server configuration](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes_configure).

カラム:

- `name` ([String](../../sql-reference/data-types/string.md)) — サーバー構成におけるディスクの名前。
- `path` ([String](../../sql-reference/data-types/string.md)) — ファイルシステムにおけるマウントポイントへのパス。
- `free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ディスク上の空き容量（バイト）。
- `total_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ディスクボリューム（バイト）。
- `unreserved_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 予約されていない空き容量（`free_space`から現在実行中のマージ、挿入、およびその他のディスク書き込み操作によって取られている予約のサイズを引いたもの）。
- `keep_free_space` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ディスク上に空きとして維持する必要があるディスクスペースの量（バイト）。ディスク構成の`keep_free_space_bytes`パラメータで定義されています。

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
