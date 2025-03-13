---
description: "システム内で発生したイベントの数に関する情報を含むシステムテーブル。"
slug: /operations/system-tables/events
title: "system.events"
keywords: ["システムテーブル", "イベント"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

システム内で発生したイベントの数に関する情報を含んでいます。たとえば、このテーブルでは、ClickHouseサーバーが起動してから処理された `SELECT` クエリの数を見つけることができます。

カラム:

- `event` ([String](../../sql-reference/data-types/string.md)) — イベント名。
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 発生したイベントの数。
- `description` ([String](../../sql-reference/data-types/string.md)) — イベントの説明。
- `name` ([String](../../sql-reference/data-types/string.md)) — `event` のエイリアス。

サポートされているすべてのイベントは、ソースファイル [src/Common/ProfileEvents.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/ProfileEvents.cpp) で確認できます。

**例**

``` sql
SELECT * FROM system.events LIMIT 5
```

``` text
┌─event─────────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Query                                 │    12 │ 解釈され、潜在的に実行されるクエリの数。パースに失敗したクエリや、ASTサイズ制限、クオータ制限、同時実行クエリ数の制限により拒否されたクエリは含まれません。ClickHouse自体によって開始される内部クエリが含まれる場合があります。サブクエリはカウントされません。                    │
│ SelectQuery                           │     8 │ Query と同じですが、SELECT クエリのみに該当します。                                                                                                                                                                                                                │
│ FileOpen                              │    73 │ 開かれたファイルの数。                                                                                                                                                                                                                                    │
│ ReadBufferFromFileDescriptorRead      │   155 │ ファイルディスクリプタからの読み取り数 (read/pread)。ソケットは含まれません。                                                                                                                                                                             │
│ ReadBufferFromFileDescriptorReadBytes │  9931 │ ファイルディスクリプタから読み取られたバイト数。ファイルが圧縮されている場合、これは圧縮データサイズを示します。                                                                                                                                              │
└───────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**関連情報**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されたメトリクスを含みます。
- [system.metrics](/operations/system-tables/metrics) — 即時に計算されたメトリクスを含みます。
- [system.metric_log](/operations/system-tables/metric_log) — テーブル `system.metrics` と `system.events` からのメトリクス値の履歴を含みます。
- [Monitoring](../../operations/monitoring.md) — ClickHouse監視の基本概念。
