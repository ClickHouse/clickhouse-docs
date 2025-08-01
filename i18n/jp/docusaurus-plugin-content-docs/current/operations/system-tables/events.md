---
description: 'System table containing information about the number of events that
  have occurred in the system.'
keywords:
- 'system table'
- 'events'
slug: '/operations/system-tables/events'
title: 'system.events'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

システムで発生したイベントの数に関する情報を含んでいます。たとえば、このテーブルでは、ClickHouseサーバーが起動してから処理された `SELECT` クエリの数を確認できます。

カラム:

- `event` ([String](../../sql-reference/data-types/string.md)) — イベント名。
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 発生したイベントの数。
- `description` ([String](../../sql-reference/data-types/string.md)) — イベントの説明。
- `name` ([String](../../sql-reference/data-types/string.md)) — `event` のエイリアス。

すべてのサポートされているイベントは、ソースファイル [src/Common/ProfileEvents.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/ProfileEvents.cpp) で確認できます。

**例**

```sql
SELECT * FROM system.events LIMIT 5
```

```text
┌─event─────────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Query                                 │    12 │ 解釈され、潜在的に実行されるクエリの数。解析に失敗したクエリや、ASTサイズ制限、クォータ制限、または同時実行クエリ数の制限により拒否されたクエリは含まれません。ClickHouse自身によって発行された内部クエリを含む場合があります。サブクエリはカウントされません。                  │
│ SelectQuery                           │     8 │ Queryと同様ですが、SELECTクエリのみ対象です。                                                                                                                                                                                                                │
│ FileOpen                              │    73 │ 開かれたファイルの数。                                                                                                                                                                                                                                    │
│ ReadBufferFromFileDescriptorRead      │   155 │ ファイルディスクリプタからの読み取り (read/pread) の数。ソケットは含まれません。                                                                                                                                                                             │
│ ReadBufferFromFileDescriptorReadBytes │  9931 │ ファイルディスクリプタから読み取られたバイト数。ファイルが圧縮されている場合、これは圧縮データサイズを示します。                                                                                                                                              │
└───────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**関連情報**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されるメトリックを含む。
- [system.metrics](/operations/system-tables/metrics) — 即座に計算されたメトリックを含む。
- [system.metric_log](/operations/system-tables/metric_log) — テーブル `system.metrics` と `system.events` からのメトリック値の履歴を含む。
- [Monitoring](../../operations/monitoring.md) — ClickHouseモニタリングの基本概念。
