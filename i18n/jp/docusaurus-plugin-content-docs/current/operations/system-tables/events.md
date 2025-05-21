---
description: 'システム内で発生したイベントの数に関する情報を含むシステムテーブル。'
keywords: ['system table', 'events']
slug: /operations/system-tables/events
title: 'system.events'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

システム内で発生したイベントの数に関する情報を含みます。例えば、このテーブルでは、ClickHouseサーバーが起動してから処理された `SELECT` クエリの数を確認できます。

カラム:

- `event` ([String](../../sql-reference/data-types/string.md)) — イベント名。
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 発生したイベントの数。
- `description` ([String](../../sql-reference/data-types/string.md)) — イベントの説明。
- `name` ([String](../../sql-reference/data-types/string.md)) — `event` のエイリアス。

すべてのサポートされているイベントは、ソースファイル [src/Common/ProfileEvents.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/ProfileEvents.cpp) にあります。

**例**

```sql
SELECT * FROM system.events LIMIT 5
```

```text
┌─event─────────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Query                                 │    12 │ 解釈され、潜在的に実行されるクエリの数。解析に失敗したり、ASTのサイズ制限、クォータ制限、または同時実行クエリの数の制限により拒否されたクエリは含まれません。ClickHouse自体によって開始された内部クエリが含まれる可能性があります。サブクエリはカウントされません。                  │
│ SelectQuery                           │     8 │ Queryと同じですが、SELECTクエリのみに限ります。                                                                                                                                                                                                                │
│ FileOpen                              │    73 │ 開かれたファイルの数。                                                                                                                                                                                                                                    │
│ ReadBufferFromFileDescriptorRead      │   155 │ ファイル記述子からの読み取りの数 (read/pread)。ソケットは含まれません。                                                                                                                                                                             │
│ ReadBufferFromFileDescriptorReadBytes │  9931 │ ファイル記述子から読み取ったバイト数。ファイルが圧縮されている場合、これは圧縮データのサイズを示します。                                                                                                                                              │
└───────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**関連情報**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されるメトリクスを含む。
- [system.metrics](/operations/system-tables/metrics) — 即座に計算されるメトリクスを含む。
- [system.metric_log](/operations/system-tables/metric_log) — テーブル `system.metrics` と `system.events` からのメトリクス値の履歴を含む。
- [Monitoring](../../operations/monitoring.md) — ClickHouse監視の基本概念。
