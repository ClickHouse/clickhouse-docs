---
slug: /use-cases/observability/clickstack/ingesting-data
pagination_prev: null
pagination_next: null
description: 'ClickStack 的数据摄取 - ClickHouse 可观测性栈'
title: '数据摄取'
doc_type: 'landing-page'
keywords: ['ClickStack 数据摄取', '可观测性数据摄取', 'ClickStack OpenTelemetry', 'ClickHouse 可观测性摄取', '遥测数据采集']
---

ClickStack 提供多种方式将可观测性数据摄取到 ClickHouse 实例中。无论是在收集日志、指标、追踪还是会话数据，都可以使用 OpenTelemetry (OTel) 收集器作为统一的摄取入口，或利用特定平台的集成来支持特定场景。

| Section | Description |
|------|-------------|
| [Overview](/use-cases/observability/clickstack/ingesting-data/overview) | 数据摄取方法和架构简介 |
| [Ingesting data with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) | 适用于使用 OpenTelemetry 并希望快速与 ClickStack 集成的用户 |
| [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) | ClickStack OpenTelemetry 收集器的高级配置和实现细节 |
| [Tables and Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) | ClickStack 使用的 ClickHouse 表及其表结构概览 |
| [Language SDKs](/use-cases/observability/clickstack/sdks) | 用于对编程语言进行插桩并收集遥测数据的 ClickStack SDKs |