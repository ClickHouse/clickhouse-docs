---
'description': 'This table contains histogram metrics that can be calculated instantly
  and exported in the Prometheus format. It is always up to date.'
'keywords':
- 'system table'
- 'histogram_metrics'
'slug': '/en/operations/system-tables/histogram_metrics'
'title': 'system.histogram_metrics'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# histogram_metrics {#histogram_metrics}

<SystemTableCloud/>

このテーブルには、即座に計算可能で、Prometheus形式でエクスポートできるヒストグラムメトリクスが含まれています。常に最新の状態です。

カラム：

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリクス名。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — メトリクスの値。
- `description` ([String](../../sql-reference/data-types/string.md)) — メトリクスの説明。
- `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — メトリクスのラベル。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric` のエイリアス。

**例**

次のようなクエリを使用して、Prometheus形式で全てのヒストグラムメトリクスをエクスポートできます。
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

## メトリクスの説明 {#metric_descriptions}

### keeper_response_time_ms_bucket {#keeper_response_time_ms_bucket}
Keeperの応答時間（ミリ秒単位）。

**関連情報**
- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されるメトリクスが含まれています。
- [system.events](/operations/system-tables/events) — 発生したイベントの数が含まれています。
- [system.metric_log](/operations/system-tables/metric_log) — テーブル `system.metrics` と `system.events` からのメトリクス値の履歴が含まれています。
- [Monitoring](../../operations/monitoring.md) — ClickHouse監視の基本概念。
