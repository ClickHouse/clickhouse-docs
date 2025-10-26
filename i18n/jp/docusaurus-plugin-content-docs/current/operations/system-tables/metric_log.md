---
'description': 'システムテーブルは、テーブル `system.metrics` と `system.events` からのメトリック値の履歴を含み、定期的にディスクにフラッシュされます。'
'keywords':
- 'system table'
- 'metric_log'
'slug': '/operations/system-tables/metric_log'
'title': 'system.metric_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.metric_log

<SystemTableCloud/>

`system.metrics` および `system.events` テーブルからのメトリック値の履歴が含まれ、定期的にディスクにフラッシュされます。

Columns:
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの時間。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒単位の精度を持つイベント時間。

**Example**

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

**Schema**
このテーブルは、XMLタグ `<schema_type>` を使用して異なるスキーマタイプで構成できます。デフォルトのスキーマタイプは `wide` であり、各メトリックまたはプロファイルイベントが別々のカラムとして保存されます。このスキーマは、単一カラムの読み取りに最もパフォーマンスが高く効率的です。

`transposed` スキーマは、メトリックとイベントが行として保存される `system.asynchronous_metric_log` に似た形式でデータを保存します。このスキーマは、マージ中のリソース消費を減少させるため、リソースが限られたセットアップに適しています。

互換性のあるスキーマ `transposed_with_wide_view` もあり、これはトランスポーズスキーマ（`system.transposed_metric_log`）を使用して実際のデータをテーブルに保存し、広いスキーマを使用してその上にビューを作成します。このビューはトランスポーズテーブルをクエリし、`wide` スキーマから `transposed` スキーマへの移行に便利です。

**See also**

- [metric_log setting](../../operations/server-configuration-parameters/settings.md#metric_log) — 設定の有効化と無効化。
- [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md) — 定期的に計算されるメトリックを含む。
- [system.events](/operations/system-tables/events) — 発生した多くのイベントを含む。
- [system.metrics](../../operations/system-tables/metrics.md) — 即時計算されたメトリックを含む。
- [Monitoring](../../operations/monitoring.md) — ClickHouseモニタリングの基本概念。
