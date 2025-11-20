---
slug: /use-cases/observability/clickstack/ingesting-data
pagination_prev: null
pagination_next: null
description: 'ClickStack 的数据摄取 - ClickHouse 可观测性技术栈'
title: '数据摄取'
doc_type: 'landing-page'
keywords: ['ClickStack data ingestion', 'observability data ingestion
', 'ClickStack OpenTelemetry', 'ClickHouse observability ingestion', 'telemetry data collection']
---

ClickStack 提供多种方式，将可观测性数据摄取到你的 ClickHouse 实例中。无论你是在收集日志、指标、追踪数据还是会话数据，都可以使用 OpenTelemetry (OTel) Collector 作为统一的接入点，也可以利用特定平台的集成来满足更专业的使用场景。

| Section | Description |
|------|-------------|
| [Overview](/use-cases/observability/clickstack/ingesting-data/overview) | 数据摄取方法与架构概览 |
| [Ingesting data with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) | 适用于使用 OpenTelemetry 并希望快速与 ClickStack 集成的用户 |
| [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) | ClickStack OpenTelemetry Collector 的高级细节说明 |
| [Tables and Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) | ClickStack 使用的 ClickHouse 表及其表结构概览 |
| [Language SDKs](/use-cases/observability/clickstack/sdks) | 用于对编程语言进行观测埋点并收集遥测数据的 ClickStack SDK |