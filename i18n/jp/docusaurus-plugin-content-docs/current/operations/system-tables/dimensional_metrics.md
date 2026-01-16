---
description: 'このテーブルには、その場で計算でき、Prometheus 形式でエクスポート可能なディメンションメトリクスが含まれています。常に最新の状態に保たれています。'
keywords: ['system table', 'dimensional_metrics']
slug: /operations/system-tables/dimensional_metrics
title: 'system.dimensional_metrics'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# dimensional&#95;metrics \\{#dimensional_metrics\\}

<SystemTableCloud />

このテーブルには、その場で計算でき、Prometheus 形式でエクスポート可能な次元メトリクスが含まれます。常に最新の状態に保たれます。

列:

* `metric` ([String](../../sql-reference/data-types/string.md)) — メトリクス名。
* `value` ([Int64](../../sql-reference/data-types/int-uint.md)) — メトリクス値。
* `description` ([String](../../sql-reference/data-types/string.md)) — メトリクスの説明。
* `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — メトリクスラベル。
* `name` ([String](../../sql-reference/data-types/string.md)) — `metric` のエイリアス。

**Example**

Prometheus 形式ですべての次元メトリクスをエクスポートするには、次のようなクエリを使用できます。

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

## メトリクスの説明 \\{#metric_descriptions\\}

### merge_failures \\{#merge_failures\\}
起動以降に失敗したマージの総数。

### startup_scripts_failure_reason \\{#startup_scripts_failure_reason\\}
エラー種別ごとに、起動スクリプトの失敗を示します。起動スクリプトが失敗した場合に 1 に設定され、エラー名でラベル付けされます。

### merge_tree_parts \\{#merge_tree_parts\\}
MergeTree のデータパーツ数。パーツの状態、パーツ種別、およびプロジェクションパーツかどうかでラベル付けされます。

**参照**
- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 定期的に算出されるメトリクスを格納します。
- [system.events](/operations/system-tables/events) — 発生したイベントの数を格納します。
- [system.metric_log](/operations/system-tables/metric_log) — テーブル `system.metrics` および `system.events` に由来するメトリクス値の履歴を格納します。
- [Monitoring](../../operations/monitoring.md) — ClickHouse のモニタリングに関する基本的な概念。
