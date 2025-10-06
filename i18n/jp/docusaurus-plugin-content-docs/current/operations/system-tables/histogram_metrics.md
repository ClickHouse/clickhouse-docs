---
'description': 'このテーブルには、即座に計算でき、Prometheus形式でエクスポートできるヒストグラムメトリクスが含まれています。常に最新の状態です。'
'keywords':
- 'system table'
- 'histogram_metrics'
'slug': '/operations/system-tables/histogram_metrics'
'title': 'system.histogram_metrics'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# histogram_metrics {#histogram_metrics}

<SystemTableCloud/>

このテーブルは、瞬時に計算され、Prometheus形式でエクスポートできるヒストグラムメトリクスを含んでいます。常に最新の情報が反映されています。非推奨の `system.latency_log` に代わります。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリクス名。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — メトリクス値。
- `description` ([String](../../sql-reference/data-types/string.md)) — メトリクスの説明。
- `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — メトリクスラベル。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric` のエイリアス。

**例**

以下のクエリを使用して、すべてのヒストグラムメトリクスをPrometheus形式でエクスポートできます。
```sql
SELECT
  metric AS name,
  toFloat64(value) AS value,
  description AS help,
  labels,
  'histogram' AS type
FROM system.histogram_metrics
FORMAT Prometheus
```

## Metric descriptions {#metric_descriptions}

### keeper_response_time_ms_bucket {#keeper_response_time_ms_bucket}
Keeperの応答時間（ミリ秒単位）。

**関連情報**
- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されるメトリクスを含んでいます。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を含んでいます。
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics` と `system.events` のメトリクス値の履歴を含んでいます。
- [Monitoring](../../operations/monitoring.md) — ClickHouse監視の基本概念。
