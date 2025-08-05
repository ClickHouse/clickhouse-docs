---
description: 'System table containing a history of memory and metric values from
  table `system.events` for individual queries, periodically flushed to disk.'
keywords:
- 'system table'
- 'query_metric_log'
slug: '/operations/system-tables/query_metric_log'
title: 'system.query_metric_log'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_metric_log

<SystemTableCloud/>

クエリごとの `system.events` テーブルからのメモリおよびメトリック値の履歴を含み、定期的にディスクに書き込まれます。

クエリが開始されると、データは `query_metric_log_interval` ミリ秒の定期的な間隔で収集されます（デフォルトは 1000 に設定されています）。また、クエリが `query_metric_log_interval` より長くかかる場合、クエリが終了するときにもデータが収集されます。

列:
- `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリの ID。
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの時間。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒解像度のイベント時間。

**例**

```sql
SELECT * FROM system.query_metric_log LIMIT 1 FORMAT Vertical;
```

```text
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

**参考**

- [query_metric_log setting](../../operations/server-configuration-parameters/settings.md#query_metric_log) — 設定の有効化と無効化。
- [query_metric_log_interval](../../operations/settings/settings.md#query_metric_log_interval)
- [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md) — 定期的に計算されるメトリックを含む。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を含む。
- [system.metrics](../../operations/system-tables/metrics.md) — 即座に計算されたメトリックを含む。
- [Monitoring](../../operations/monitoring.md) — ClickHouse モニタリングの基本概念。
