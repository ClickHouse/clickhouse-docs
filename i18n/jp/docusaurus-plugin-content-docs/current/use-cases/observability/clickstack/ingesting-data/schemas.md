---
slug: /use-cases/observability/clickstack/ingesting-data/schemas
pagination_prev: null
pagination_next: null
description: 'ClickStack が使用するテーブルとスキーマ - ClickHouse Observability Stack'
sidebar_label: 'テーブルとスキーマ'
title: 'ClickStack が使用するテーブルとスキーマ'
doc_type: 'reference'
keywords: ['clickstack', 'schema', 'data model', 'table design', 'logs']
---

import OtelLogsSchema from './_snippets/_schema_otel_logs.md';
import OtelTracesSchema from './_snippets/_schema_otel_traces.md';
import OtelMetricsGaugeSchema from './_snippets/_schema_otel_metrics_gauge.md';
import OtelMetricsSumSchema from './_snippets/_schema_otel_metrics_sum.md';
import OtelMetricsHistogramSchema from './_snippets/_schema_otel_metrics_histogram.md';
import OtelMetricsExponentialHistogramSchema from './_snippets/_schema_otel_metrics_exponential_histogram.md';
import OtelMetricsSummarySchema from './_snippets/_schema_otel_metrics_summary.md';
import HyperdxSessionsSchema from './_snippets/_schema_hyperdx_sessions.md';

ClickStack の OpenTelemetry (OTel) collector は、[ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md) を使用して ClickHouse にテーブルを作成し、データを挿入します。

各データタイプごとに、`default` データベース内に次のテーブルが作成されます。OTel collector を実行しているコンテナイメージの環境変数 `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE` を変更することで、この対象データベースを変更できます。

## ログ \{#logs\}

<OtelLogsSchema />

## トレース \{#traces\}

<OtelTracesSchema />

## メトリクス \{#metrics\}

### ゲージ型メトリクス \{#gauge\}

<OtelMetricsGaugeSchema />

### Sum 型メトリクス \{#sum\}

<OtelMetricsSumSchema />

### ヒストグラム・メトリクス \{#histogram\}

<OtelMetricsHistogramSchema />

### 指数ヒストグラム \{#exponential-histograms\}

:::note
HyperDX は、指数ヒストグラム・メトリクスの取得および表示をまだサポートしていません。メトリクスの送信元でこれらを設定することはできますが、今後のバージョンでのサポートを予定しています。
:::

<OtelMetricsExponentialHistogramSchema />

### 概要表 \{#summary-table\}

<OtelMetricsSummarySchema />

## セッション \{#sessions\}

<HyperdxSessionsSchema />