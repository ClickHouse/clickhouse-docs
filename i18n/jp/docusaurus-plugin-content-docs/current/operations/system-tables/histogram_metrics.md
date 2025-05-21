---
description: 'このテーブルには、瞬時に計算され、Prometheus形式でエクスポート可能なヒストグラムメトリクスが含まれています。常に最新の情報です。'
keywords: ['system table', 'histogram_metrics']
slug: /ja/operations/system-tables/histogram_metrics
title: 'system.histogram_metrics'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# histogram_metrics {#histogram_metrics}

<SystemTableCloud/>

このテーブルには、瞬時に計算され、Prometheus形式でエクスポート可能なヒストグラムメトリクスが含まれています。常に最新の情報です。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリクス名。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — メトリクスの値。
- `description` ([String](../../sql-reference/data-types/string.md)) — メトリクスの説明。
- `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — メトリクスのラベル。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric`のエイリアス。

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

## メトリクスの説明 {#metric_descriptions}

### keeper_response_time_ms_bucket {#keeper_response_time_ms_bucket}
Keeperの応答時間（ミリ秒単位）。

**関連情報**
- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されたメトリクスが含まれています。
- [system.events](/operations/system-tables/events) — 発生したイベントの数が含まれています。
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics`および`system.events`のメトリクス値の履歴が含まれています。
- [Monitoring](../../operations/monitoring.md) — ClickHouseモニタリングの基本概念。
