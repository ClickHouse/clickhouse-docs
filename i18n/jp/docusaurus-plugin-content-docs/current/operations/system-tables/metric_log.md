---
description: 'テーブル `system.metrics` と `system.events` に由来するメトリクス値の履歴を保持し、定期的にディスクにフラッシュされるシステムテーブル。'
keywords: ['システムテーブル', 'metric_log']
slug: /operations/system-tables/metric_log
title: 'system.metric_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.metric_log {#systemmetric_log}

<SystemTableCloud />

`system.metrics` および `system.events` テーブルのメトリクス値の履歴を保持しており、定期的にディスクにフラッシュされます。

Columns:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行するサーバーのホスト名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの時刻。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度のイベント時刻。

**例**

```sql
SELECT * FROM system.metric_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:                                                        clickhouse.eu-central1.internal
event_date:                                                      2020-09-05
event_time:                                                      2020-09-05 16:22:33
event_time_microseconds:                                         2020-09-05 16:22:33.196807
milliseconds:                                                    196
ProfileEvent_Query:                                              0
ProfileEvent_SelectQuery:                                        0
ProfileEvent_InsertQuery:                                        0
ProfileEvent_FailedQuery:                                        0
ProfileEvent_FailedSelectQuery:                                  0
...
...
CurrentMetric_Revision:                                          54439
CurrentMetric_VersionInteger:                                    20009001
CurrentMetric_RWLockWaitingReaders:                              0
CurrentMetric_RWLockWaitingWriters:                              0
CurrentMetric_RWLockActiveReaders:                               0
CurrentMetric_RWLockActiveWriters:                               0
CurrentMetric_GlobalThread:                                      74
CurrentMetric_GlobalThreadActive:                                26
CurrentMetric_LocalThread:                                       0
CurrentMetric_LocalThreadActive:                                 0
CurrentMetric_DistributedFilesToInsert:                          0
```

**スキーマ**
このテーブルは、XML タグ `<schema_type>` を使用して、異なるスキーマ種別に構成できます。デフォルトのスキーマ種別は `wide` であり、各メトリクスまたはプロファイルイベントが個別の列として保存されます。このスキーマは、単一列の読み取りに対して最も高いパフォーマンスと効率を発揮します。

`transposed` スキーマは、メトリクスやイベントが行として保存される `system.asynchronous_metric_log` と類似した形式でデータを保存します。このスキーマは、マージ時のリソース消費を削減するため、リソースの限られた環境での利用に有効です。

**関連項目**

* [metric&#95;log 設定](../../operations/server-configuration-parameters/settings.md#metric_log) — 設定の有効化と無効化。
* [system.asynchronous&#95;metrics](../../operations/system-tables/asynchronous_metrics.md) — 定期的に計算されるメトリクスを含みます。
* [system.events](/operations/system-tables/events) — 発生した各種イベントを含みます。
* [system.metrics](../../operations/system-tables/metrics.md) — 即時に計算されるメトリクスを含みます。
* [Monitoring](../../operations/monitoring.md) — ClickHouse モニタリングの基本概念。
