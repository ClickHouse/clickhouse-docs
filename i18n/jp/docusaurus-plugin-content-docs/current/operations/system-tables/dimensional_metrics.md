---
'description': 'このテーブルには、即座に計算でき、Prometheusフォーマットでエクスポートできる次元メトリックが含まれています。常に最新です。'
'keywords':
- 'system table'
- 'dimensional_metrics'
'slug': '/operations/system-tables/dimensional_metrics'
'title': 'system.dimensional_metrics'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# dimensional_metrics {#dimensional_metrics}

<SystemTableCloud/>

このテーブルには、即座に計算され、Prometheus形式でエクスポートできる次元メトリクスが含まれています。常に最新の状態です。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリック名。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — メトリック値。
- `description` ([String](../../sql-reference/data-types/string.md)) — メトリックの説明。
- `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — メトリックラベル。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric`の別名。

**例**

次のようなクエリを使用して、すべての次元メトリクスをPrometheus形式でエクスポートできます。
```sql
SELECT
  metric AS name,
  toFloat64(value) AS value,
  description AS help,
  labels,
  'gauge' AS type
FROM system.dimensional_metrics
FORMAT Prometheus
```

## メトリックの説明 {#metric_descriptions}

### merge_failures {#merge_failures}
起動以来のすべての失敗したマージの数です。

### startup_scripts_failure_reason {#startup_scripts_failure_reason}
エラータイプごとの起動スクリプトの失敗を示します。起動スクリプトが失敗したときに1に設定され、エラー名でラベル付けされます。

### merge_tree_parts {#merge_tree_parts}
マージツリーデータパーツの数で、パーツの状態、パーツタイプ、およびそれがプロジェクションパーツかどうかでラベル付けされています。

**参照**
- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されたメトリクスを含む。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を含む。
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics`および`system.events`からのメトリクス値の履歴を含む。
- [Monitoring](../../operations/monitoring.md) — ClickHouseの監視の基本概念。
