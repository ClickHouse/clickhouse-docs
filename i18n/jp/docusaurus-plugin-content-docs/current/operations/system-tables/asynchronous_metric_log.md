---
'description': 'システムテーブルは`system.asynchronous_metrics`の履歴値を含み、これは時間間隔ごとに一度保存されます（デフォルトでは1秒）'
'keywords':
- 'system table'
- 'asynchronous_metric_log'
'slug': '/operations/system-tables/asynchronous_metric_log'
'title': 'system.asynchronous_metric_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

`system.asynchronous_metrics` の履歴値を含み、時間間隔（デフォルトでは1秒）ごとに保存されます。デフォルトで有効です。

カラム:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベント日。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベント時間。
- `metric` ([String](../../sql-reference/data-types/string.md)) — メトリック名。
- `value` ([Float64](../../sql-reference/data-types/float.md)) — メトリック値。

**例**

```sql
SELECT * FROM system.asynchronous_metric_log LIMIT 3 \G
```

```text
Row 1:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2023-11-14
event_time: 2023-11-14 14:39:07
metric:     AsynchronousHeavyMetricsCalculationTimeSpent
value:      0.001

Row 2:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2023-11-14
event_time: 2023-11-14 14:39:08
metric:     AsynchronousHeavyMetricsCalculationTimeSpent
value:      0

Row 3:
──────
hostname:   clickhouse.eu-central1.internal
event_date: 2023-11-14
event_time: 2023-11-14 14:39:09
metric:     AsynchronousHeavyMetricsCalculationTimeSpent
value:      0
```

**関連情報**

- [asynchronous_metric_log 設定](../../operations/server-configuration-parameters/settings.md#asynchronous_metric_log) — 設定の有効化と無効化。
- [system.asynchronous_metrics](../system-tables/asynchronous_metrics.md) — バックグラウンドで定期的に計算されるメトリックを含む。
- [system.metric_log](../system-tables/metric_log.md) — 定期的にディスクにフラッシュされる `system.metrics` と `system.events` テーブルのメトリック値の履歴を含む。
