---
slug: /use-cases/observability/clickstack/ingesting-data
pagination_prev: null
pagination_next: null
description: 'ClickStack 的数据引入 - ClickHouse 可观测性栈'
title: '数据引入'
doc_type: 'landing-page'
keywords: ['ClickStack data ingestion', 'observability data ingestion
', 'ClickStack OpenTelemetry', 'ClickHouse observability ingestion', 'telemetry data collection']
---

ClickStack 提供多种方式，将可观测性数据引入到你的 ClickHouse 实例中。无论你收集的是日志、指标、追踪还是会话数据，都可以使用 OpenTelemetry (OTel) collector 作为统一的引入入口，或者利用特定平台的集成来满足更专业的使用场景。

| Section | Description |
|------|-------------|
| [Overview](/use-cases/observability/clickstack/ingesting-data/overview) | 数据引入方法与整体架构简介 |
| [Ingesting data with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) | 适用于使用 OpenTelemetry 并希望快速接入 ClickStack 的用户 |
| [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) | 关于 ClickStack OpenTelemetry collector 的进阶说明 |
| [Tables and Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) | ClickStack 使用的 ClickHouse 表及其表结构概览 |
| [Language SDKs](/use-cases/observability/clickstack/sdks) | ClickStack 提供的、用于为各编程语言埋点并收集遥测数据的 SDK |