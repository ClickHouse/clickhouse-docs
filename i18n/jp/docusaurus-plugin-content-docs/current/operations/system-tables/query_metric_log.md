---
description: '`system.events` テーブルのメモリおよびメトリック値について、クエリごとの履歴を保持し、定期的にディスクにフラッシュするシステムテーブル。'
keywords: ['システムテーブル', 'query_metric_log']
slug: /operations/system-tables/query_metric_log
title: 'system.query_metric_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.query&#95;metric&#95;log \{#systemquery&#95;metric&#95;log\}

<SystemTableCloud />

個々のクエリに対して `system.events` テーブルから取得されたメモリおよびメトリック値の履歴を保持し、定期的にディスクへフラッシュします。

クエリが開始されると、`query_metric_log_interval` ミリ秒（デフォルトでは 1000 ミリ秒に設定）ごとの一定間隔でデータが収集されます。クエリの実行時間が `query_metric_log_interval` より長い場合は、クエリ終了時にもデータが収集されます。

カラム:

* `query_id` ([String](../../sql-reference/data-types/string.md)) — クエリの ID。
* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの時刻。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度のイベント時刻。

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

**関連項目**

* [query&#95;metric&#95;log 設定](../../operations/server-configuration-parameters/settings.md#query_metric_log) — この設定の有効化および無効化について。
* [query&#95;metric&#95;log&#95;interval](../../operations/settings/settings.md#query_metric_log_interval)
* [system.asynchronous&#95;metrics](../../operations/system-tables/asynchronous_metrics.md) — 定期的に計算されるメトリクスを格納します。
* [system.events](/operations/system-tables/events) — 発生した各種イベントの回数を格納します。
* [system.metrics](../../operations/system-tables/metrics.md) — 即時に計算されるメトリクスを格納します。
* [Monitoring](../../operations/monitoring.md) — ClickHouse における監視の基本概念。
