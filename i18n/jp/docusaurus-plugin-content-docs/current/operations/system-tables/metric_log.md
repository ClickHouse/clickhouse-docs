---
'description': 'System table containing history of metrics values from tables `system.metrics`
  and `system.events`, periodically flushed to disk.'
'keywords':
- 'system table'
- 'metric_log'
'slug': '/operations/system-tables/metric_log'
'title': 'system.metric_log'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.metric_log

<SystemTableCloud/>

`system.metrics` および `system.events` テーブルからのメトリック値の履歴を含み、定期的にディスクにフラッシュされます。

カラム:
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベント日付。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベント時刻。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒の解像度でのイベント時刻。

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
このテーブルは、XMLタグ `<schema_type>` を使用して異なるスキーマタイプを設定できます。デフォルトのスキーマタイプは `wide` で、各メトリックまたはプロファイルイベントは別々のカラムに保存されます。このスキーマは、単一カラムの読み取りに最もパフォーマンスが高く効率的です。

`transposed` スキーマはデータを `system.asynchronous_metric_log` に似た形式で保存し、メトリックとイベントを行として格納します。このスキーマは、マージ中のリソース消費を削減するため、リソースの少ないセットアップに便利です。

互換性スキーマとして `transposed_with_wide_view` もあり、実際のデータが変換スキーマ（`system.transposed_metric_log`）を使用してテーブルに保存され、上に広いスキーマを使用してビューが作成されます。このビューは変換テーブルをクエリし、`wide` スキーマから `transposed` スキーマへの移行に役立ちます。

**関連情報**

- [metric_log 設定](../../operations/server-configuration-parameters/settings.md#metric_log) — 設定の有効化と無効化。
- [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md) — 定期的に計算されたメトリックを含む。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を含む。
- [system.metrics](../../operations/system-tables/metrics.md) — 即座に計算されたメトリックを含む。
- [Monitoring](../../operations/monitoring.md) — ClickHouse モニタリングの基本概念。
