---
slug: /ja/operations/system-tables/histogram_metrics
---
import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# histogram_metrics {#histogram_metrics}

<SystemTableCloud/>

このテーブルには、即座に計算され、Prometheus 形式でエクスポートできるヒストグラムメトリクスが含まれています。常に最新の情報を提供します。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリクス名。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — メトリクス値。
- `description` ([String](../../sql-reference/data-types/string.md)) — メトリクスの説明。
- `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — メトリクスラベル。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric` のエイリアス。

**例**

以下のクエリを使用して、Prometheus 形式で全てのヒストグラムメトリクスをエクスポートできます。
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

## メトリクスの説明 {#metric_descriptions}

### keeper_response_time_ms_bucket {#keeper_response_time_ms_bucket}
Keeper の応答時間（ミリ秒単位）。

**関連項目**
- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されたメトリクスを含む。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を含む。
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics` と `system.events` のメトリクス値の履歴を含む。
- [Monitoring](../../operations/monitoring.md) — ClickHouse モニタリングの基本概念。
