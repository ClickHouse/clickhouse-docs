---
description: "個々のクエリのためにテーブル `system.events` からのメモリとメトリック値の履歴を含むシステムテーブルで、定期的にディスクにフラッシュされます。"
slug: /operations/system-tables/query_metric_log
title: "system.query_metric_log"
keywords: ["システムテーブル", "query_metric_log"]
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

個々のクエリのためにテーブル `system.events` からのメモリとメトリック値の履歴を含むシステムテーブルで、定期的にディスクにフラッシュされます。

クエリが開始されると、データは `query_metric_log_interval` ミリ秒（デフォルトでは1000に設定）ごとに収集されます。また、クエリが `query_metric_log_interval` よりも長くかかる場合、クエリが終了する際にもデータが収集されます。

カラム:
- `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリのID。
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの時刻。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒単位でのイベントの時刻。

**例**

``` sql
SELECT * FROM system.query_metric_log LIMIT 1 FORMAT Vertical;
```

``` text
Row 1:
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

**関連項目**

- [query_metric_log 設定](../../operations/server-configuration-parameters/settings.md#query_metric_log) — 設定の有効化と無効化。
- [query_metric_log_interval](../../operations/settings/settings.md#query_metric_log_interval)
- [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md) — 定期的に計算されたメトリックを含みます。
- [system.events](/operations/system-tables/events) — 発生したイベントの一覧を含みます。
- [system.metrics](../../operations/system-tables/metrics.md) — 即座に計算されたメトリックを含みます。
- [Monitoring](../../operations/monitoring.md) — ClickHouseモニタリングの基本概念。
