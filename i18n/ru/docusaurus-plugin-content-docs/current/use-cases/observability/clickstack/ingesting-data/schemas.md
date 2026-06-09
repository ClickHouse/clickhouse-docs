---
slug: /use-cases/observability/clickstack/ingesting-data/schemas
pagination_prev: null
pagination_next: null
description: 'Таблицы и схемы, используемые ClickStack — ClickHouse Observability Stack'
sidebar_label: 'Таблицы и схемы'
title: 'Таблицы и схемы, используемые ClickStack'
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

OTel collector ClickStack использует [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md) для создания таблиц в ClickHouse и записи данных.

Следующие таблицы создаются для каждого типа данных в базе данных `default`. Целевую базу данных можно изменить, настроив переменную окружения `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE` для образа, на котором запущен OTel collector.

## Логи \{#logs\}

<OtelLogsSchema />

## Трейсы \{#traces\}

<OtelTracesSchema />

## Метрики \{#metrics\}

### Метрики типа Gauge \{#gauge\}

<OtelMetricsGaugeSchema />

### Суммирующие метрики \{#sum\}

<OtelMetricsSumSchema />

### Гистограммные метрики \{#histogram\}

<OtelMetricsHistogramSchema />

### Экспоненциальные гистограммы \{#exponential-histograms\}

:::note
HyperDX пока не поддерживает запрос и отображение метрик экспоненциальных гистограмм. Вы можете настроить их в источнике метрик, но поддержка этих метрик будет добавлена в будущем.
:::

<OtelMetricsExponentialHistogramSchema />

### Сводная таблица \{#summary-table\}

<OtelMetricsSummarySchema />

## Сеансы \{#sessions\}

<HyperdxSessionsSchema />