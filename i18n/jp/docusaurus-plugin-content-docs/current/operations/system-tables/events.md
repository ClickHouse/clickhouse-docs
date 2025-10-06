---
'description': 'システムの中で発生したイベントの数に関する情報を含むシステムテーブル。'
'keywords':
- 'system table'
- 'events'
'slug': '/operations/system-tables/events'
'title': 'system.events'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

システムで発生したイベントの数に関する情報を含みます。例えば、このテーブルでは、ClickHouseサーバーが起動してから処理された `SELECT` クエリの数を確認できます。

カラム:

- `event` ([String](../../sql-reference/data-types/string.md)) — イベント名。
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 発生したイベントの数。
- `description` ([String](../../sql-reference/data-types/string.md)) — イベントの説明。
- `name` ([String](../../sql-reference/data-types/string.md)) — `event` のエイリアス。

サポートされているすべてのイベントは、ソースファイル [src/Common/ProfileEvents.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/ProfileEvents.cpp) で確認できます。

**例**

```sql
SELECT * FROM system.events LIMIT 5
```

```text
┌─event─────────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Query                                 │    12 │ Number of queries to be interpreted and potentially executed. Does not include queries that failed to parse or were rejected due to AST size limits, quota limits or limits on the number of simultaneously running queries. May include internal queries initiated by ClickHouse itself. Does not count subqueries.                  │
│ SelectQuery                           │     8 │ Same as Query, but only for SELECT queries.                                                                                                                                                                                                                │
│ FileOpen                              │    73 │ Number of files opened.                                                                                                                                                                                                                                    │
│ ReadBufferFromFileDescriptorRead      │   155 │ Number of reads (read/pread) from a file descriptor. Does not include sockets.                                                                                                                                                                             │
│ ReadBufferFromFileDescriptorReadBytes │  9931 │ Number of bytes read from file descriptors. If the file is compressed, this will show the compressed data size.                                                                                                                                              │
└───────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**関連項目**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されたメトリックを含みます。
- [system.metrics](/operations/system-tables/metrics) — 即座に計算されたメトリックを含みます。
- [system.metric_log](/operations/system-tables/metric_log) — テーブル `system.metrics` と `system.events` のメトリック値の履歴を含みます。
- [Monitoring](../../operations/monitoring.md) — ClickHouseモニタリングの基本概念。
