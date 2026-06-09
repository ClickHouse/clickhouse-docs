---
slug: /use-cases/observability/clickstack/ingesting-data/schemas
pagination_prev: null
pagination_next: null
description: 'ClickStack 使用的表和模式 - ClickHouse 可观测性栈'
sidebar_label: '表和模式'
title: 'ClickStack 使用的表和模式'
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

ClickStack 的 OpenTelemetry (OTel) collector 使用 [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md) 在 ClickHouse 中创建表并插入数据。

在 `default` 数据库中，会为每种数据类型创建以下表。你可以通过修改承载 OTel collector 的镜像的环境变量 `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE` 来更改此目标数据库。

## 日志 \{#logs\}

<OtelLogsSchema />

## 追踪 \{#traces\}

<OtelTracesSchema />

## 指标 \{#metrics\}

### Gauge 指标 \{#gauge\}

<OtelMetricsGaugeSchema />

### 求和 (Sum) 指标 \{#sum\}

<OtelMetricsSumSchema />

### 直方图指标 \{#histogram\}

<OtelMetricsHistogramSchema />

### 指数直方图 \{#exponential-histograms\}

:::note
HyperDX 目前尚不支持拉取和展示指数直方图指标。你可以在指标数据源中对其进行配置，后续版本将提供支持。
:::

<OtelMetricsExponentialHistogramSchema />

### 汇总表 \{#summary-table\}

<OtelMetricsSummarySchema />

## 会话 \{#sessions\}

<HyperdxSessionsSchema />