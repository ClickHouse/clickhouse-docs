---
slug: /use-cases/observability/clickstack/ingesting-data/schemas
pagination_prev: null
pagination_next: null
description: 'Tables and schemas used by ClickStack - The ClickHouse Observability Stack'
sidebar_label: 'Tables and schemas'
title: 'Tables and schemas used by ClickStack'
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

The ClickStack OpenTelemetry (OTel) collector uses the [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md) to create tables in ClickHouse and insert data.

The following tables are created for each data type in the `default` database. You can change this target database by modifying the environment variable `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE` for the image hosting the OTel collector.

## Logs {#logs}

<OtelLogsSchema />

## Traces {#traces}

<OtelTracesSchema />

## Metrics {#metrics}

### Gauge metrics {#gauge}

<OtelMetricsGaugeSchema />

### Sum metrics {#sum}

<OtelMetricsSumSchema />

### Histogram metrics {#histogram}

<OtelMetricsHistogramSchema />

### Exponential histograms {#exponential-histograms}

:::note
HyperDX doesn't support fetching/displaying exponential histogram metrics yet. You may configure them in the metrics source but future support is forthcoming.
:::

<OtelMetricsExponentialHistogramSchema />

### Summary table {#summary-table}

<OtelMetricsSummarySchema />

## Sessions {#sessions}

<HyperdxSessionsSchema />
