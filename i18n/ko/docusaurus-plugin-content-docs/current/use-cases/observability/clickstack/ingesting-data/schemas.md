---
slug: /use-cases/observability/clickstack/ingesting-data/schemas
pagination_prev: null
pagination_next: null
description: 'ClickStack에서 사용하는 테이블과 스키마 - ClickHouse 관측성(Observability) 스택'
sidebar_label: '테이블과 스키마'
title: 'ClickStack에서 사용하는 테이블과 스키마'
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

ClickStack OpenTelemetry(OTel) collector는 [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/exporter/clickhouseexporter/README.md)를 사용하여 ClickHouse에 테이블을 생성하고 데이터를 삽입합니다.

다음 테이블은 `default` 데이터베이스의 각 데이터 유형별로 생성됩니다. OTel collector를 호스팅하는 컨테이너 이미지에서 환경 변수 `HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE`를 수정하여 대상 데이터베이스를 변경할 수 있습니다.

## 로그 \{#logs\}

<OtelLogsSchema />

## 트레이스 \{#traces\}

<OtelTracesSchema />

## 메트릭 \{#metrics\}

### 게이지형 메트릭 \{#gauge\}

<OtelMetricsGaugeSchema />

### Sum 메트릭 \{#sum\}

<OtelMetricsSumSchema />

### 히스토그램 메트릭 \{#histogram\}

<OtelMetricsHistogramSchema />

### 지수 히스토그램 \{#exponential-histograms\}

:::note
HyperDX는 아직 지수 히스토그램 메트릭을 가져오거나 표시하는 기능을 지원하지 않습니다. 메트릭 소스에서 지수 히스토그램을 구성할 수는 있지만, 이에 대한 지원은 추후 제공될 예정입니다.
:::

<OtelMetricsExponentialHistogramSchema />

### 요약 표 \{#summary-table\}

<OtelMetricsSummarySchema />

## 세션 \{#sessions\}

<HyperdxSessionsSchema />