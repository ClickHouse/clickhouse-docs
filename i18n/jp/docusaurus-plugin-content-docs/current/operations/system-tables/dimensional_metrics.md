---
description: 'このテーブルには、その場で計算して Prometheus 形式でエクスポートできるディメンショナルメトリクスが含まれています。常に最新の状態に保たれています。'
keywords: ['system table', 'dimensional_metrics']
slug: /operations/system-tables/dimensional_metrics
title: 'system.dimensional_metrics'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# dimensional_metrics {#dimensional_metrics}

<SystemTableCloud />

このテーブルには、即座に計算可能でPrometheus形式でエクスポートできるディメンショナルメトリクスが含まれています。常に最新の状態です。

カラム:

- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリクス名。
- `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — メトリクス値。
- `description` ([String](../../sql-reference/data-types/string.md)) — メトリクスの説明。
- `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — メトリクスラベル。
- `name` ([String](../../sql-reference/data-types/string.md)) — `metric`の別名。

**例**

次のようなクエリを使用して、すべてのディメンショナルメトリクスをPrometheus形式でエクスポートできます。

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

起動以降に失敗したマージの総数。

### startup_scripts_failure_reason {#startup_scripts_failure_reason}

エラータイプ別の起動スクリプトの失敗を示します。起動スクリプトが失敗した場合、エラー名でラベル付けされ、1に設定されます。

### merge_tree_parts {#merge_tree_parts}

マージツリーデータパートの数。パート状態、パートタイプ、およびプロジェクションパートであるかどうかでラベル付けされます。

**関連項目**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に計算されるメトリックが含まれます。
- [system.events](/operations/system-tables/events) — 発生したイベントの数が含まれます。
- [system.metric_log](/operations/system-tables/metric_log) — `system.metrics`および`system.events`テーブルからのメトリック値の履歴が含まれます。
- [Monitoring](../../operations/monitoring.md) — ClickHouse監視の基本概念。
