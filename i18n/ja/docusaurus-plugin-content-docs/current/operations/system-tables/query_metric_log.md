---
description: "個々のクエリのためのテーブル `system.events` からのメモリおよびメトリック値の履歴を含むシステムテーブルで、定期的にディスクにフラッシュされます。"
slug: /operations/system-tables/query_metric_log
title: "query_metric_log"
keywords: ["システムテーブル", "query_metric_log"]
---

import SystemTableCloud from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

個々のクエリのためのテーブル `system.events` からのメモリおよびメトリック値の履歴を含むシステムテーブルで、定期的にディスクにフラッシュされます。

クエリが開始されると、データは `query_metric_log_interval` ミリ秒（デフォルトは1000に設定）ごとに収集されます。クエリが `query_metric_log_interval` より長くかかる場合も、クエリが終了したときにデータが収集されます。

カラム:
- `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリのID。
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの時刻。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒の解像度を持つイベントの時刻。

**例**

``` sql
SELECT * FROM system.query_metric_log LIMIT 1 FORMAT Vertical;
```

``` text
行 1:
──────
query_id:                                                        97c8ba04-b6d4-4bd7-b13e-6201c5c6e49d
hostname:                                                        clickhouse.eu-central1.internal
event_date:                                                      2020-09-05
event_time:                                                      2020-09-05 16:22:33
event_time_microseconds:                                         2020-09-05 16:22:33.196807
memory_usage:                                                    313434219
peak_memory_usage:                                               598951986
ProfileEvent_Query:                                              0
ProfileEvent_SelectQuery:                                        0
ProfileEvent_InsertQuery:                                        0
ProfileEvent_FailedQuery:                                        0
ProfileEvent_FailedSelectQuery:                                  0
...
```

**参照**

- [query_metric_log設定](../../operations/server-configuration-parameters/settings.md#query_metric_log) — 設定の有効化と無効化。
- [query_metric_log_interval](../../operations/settings/settings.md#query_metric_log_interval)
- [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md) — 定期的に計算されたメトリックを含む。
- [system.events](../../operations/system-tables/events.md#system_tables-events) — 発生したイベントの数を含む。
- [system.metrics](../../operations/system-tables/metrics.md) — 即座に計算されたメトリックを含む。
- [監視](../../operations/monitoring.md) — ClickHouse監視の基本概念。
