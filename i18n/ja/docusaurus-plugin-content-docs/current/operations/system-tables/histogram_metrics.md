---
slug: /ja/operations/system-tables/histogram_metrics
---
import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';

# histogram_metrics {#histogram_metrics}

<SystemTableCloud/>

このテーブルには、即座に計算でき、Prometheus形式でエクスポート可能なヒストグラムメトリクスが含まれています。常に最新の情報が反映されています。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリック名。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — メトリック値。
- `description` ([String](../../sql-reference/data-types/string.md)) — メトリックの説明。
- `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — メトリックラベル。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric` のエイリアス。

**例**

以下のクエリを使用して、すべてのヒストグラムメトリクスをPrometheus形式でエクスポートできます。
``` sql
SELECT
  metric AS name,
  toFloat64(value) AS value,
  description AS help,
  labels,
  'histogram' AS type
FROM system.histogram_metrics
FORMAT Prometheus
```
## メトリックの説明 {#metric_descriptions}
### keeper_response_time_ms_bucket {#keeper_response_time_ms_bucket}
Keeperの応答時間（ミリ秒単位）。

**関連情報**
- [system.asynchronous_metrics](../../operations/system-tables/asynchronous_metrics.md#system_tables-asynchronous_metrics) — 定期的に計算されるメトリックが含まれています。
- [system.events](../../operations/system-tables/events.md#system_tables-events) — 発生したイベントの数が含まれています。
- [system.metric_log](../../operations/system-tables/metric_log.md#system_tables-metric_log) — `system.metrics` および `system.events` テーブルからのメトリック値の履歴が含まれています。
- [Monitoring](../../operations/monitoring.md) — ClickHouseの監視の基本概念。
