---
description: 'ディスクにフラッシュされたヒストグラムメトリクスの定期スナップショットを格納するsystem テーブル。'
keywords: ['system テーブル', 'histogram_metric_log']
sidebar_label: 'histogram_metric_log'
sidebar_position: 65
slug: /operations/system-tables/histogram_metric_log
title: 'system.histogram_metric_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud />

## 説明 \{#description\}

`system.histogram_metrics` の履歴。`collect_interval_milliseconds` ごとに取得され、ディスクにフラッシュされるスナップショット。

## カラム \{#columns\}

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — サーバーのホスト名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの時刻。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度のイベント時刻。
* `metric` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — メトリクス名。
* `labels` ([Map(String, String)](../../sql-reference/data-types/map.md)) — メトリクスのラベル。
* `histogram` ([Map(Float64, UInt64)](../../sql-reference/data-types/map.md)) — バケットの上限値から累積カウントへのマップ。`+inf` は最後のバケットです。
* `count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 観測の総数。`histogram[+inf]` と等しくなります。
* `sum` ([Float64](../../sql-reference/data-types/float.md)) — 観測値の合計。

## 例 \{#example\}

```sql
SELECT event_time, metric, labels, histogram
FROM system.histogram_metric_log
WHERE metric = 'keeper_response_time_ms'
ORDER BY event_time DESC
LIMIT 1
FORMAT Vertical;
```

## 関連項目 \{#see-also\}

* [system.histogram&#95;metrics](/operations/system-tables/histogram_metrics) — ライブヒストグラムメトリクス。
* [system.metric&#95;log](/operations/system-tables/metric_log) — `system.metrics` と `system.events` の履歴。