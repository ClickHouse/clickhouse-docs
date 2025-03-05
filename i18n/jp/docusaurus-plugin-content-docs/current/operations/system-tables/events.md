---
description: "システム内で発生したイベントの数に関する情報を含むシステムテーブルです。"
slug: /operations/system-tables/events
title: "system.events"
keywords: ["システムテーブル", "イベント"]
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

システム内で発生したイベントの数に関する情報を含んでいます。例えば、テーブルでは、ClickHouseサーバーが起動して以来処理された`SELECT`クエリの数を確認できます。

カラム：

- `event` ([String](../../sql-reference/data-types/string.md)) — イベント名。
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 発生したイベントの数。
- `description` ([String](../../sql-reference/data-types/string.md)) — イベントの説明。
- `name` ([String](../../sql-reference/data-types/string.md)) — `event`のエイリアス。

すべてのサポートされているイベントは、ソースファイル [src/Common/ProfileEvents.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/ProfileEvents.cpp) で確認できます。

**例**

``` sql
SELECT * FROM system.events LIMIT 5
```

``` text
┌─event─────────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Query                                 │    12 │ 解釈され、実行される可能性のあるクエリの数。解析に失敗したり、ASTサイズ制限、クォータ制限、同時実行クエリ数の制限によって拒否されたクエリは含まれません。ClickHouse自体によって開始された内部クエリを含む場合があります。サブクエリはカウントしません。                     │
│ SelectQuery                           │     8 │ クエリと同じですが、SELECTクエリのみに適用されます。                                                                                                                                                                                                            │
│ FileOpen                              │    73 │ 開かれたファイルの数。                                                                                                                                                                                                                                    │
│ ReadBufferFromFileDescriptorRead      │   155 │ ファイルディスクリプタからの読み取り（read/pread）の数。ソケットは含まれません。                                                                                                                                                                             │
│ ReadBufferFromFileDescriptorReadBytes │  9931 │ ファイルディスクリプタから読み取られたバイト数。ファイルが圧縮されている場合、これは圧縮されたデータサイズを表示します。                                                                                                                                              │
└───────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**関連項目**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されたメトリクスを含みます。
- [system.metrics](/operations/system-tables/metrics) — 即座に計算されたメトリクスを含みます。
- [system.metric_log](../../operations/system-tables/metric_log.md#system_tables-metric_log) — テーブル`system.metrics`および`system.events`からのメトリクス値の歴史を含みます。
- [Monitoring](../../operations/monitoring.md) — ClickHouseモニタリングの基本概念。
