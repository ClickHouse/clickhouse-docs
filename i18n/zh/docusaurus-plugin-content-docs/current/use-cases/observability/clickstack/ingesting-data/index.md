---
slug: /use-cases/observability/clickstack/ingesting-data
pagination_prev: null
pagination_next: null
description: 'ClickStack 的数据接入 - ClickHouse 可观测性技术栈'
title: '数据接入'
doc_type: 'landing-page'
keywords: ['ClickStack 数据接入', '可观测性数据接入', 'ClickStack OpenTelemetry', 'ClickHouse 可观测性接入', '遥测数据采集']
---

ClickStack 提供多种方式将可观测性数据接入到您的 ClickHouse 实例中。无论您在收集日志、指标、链路追踪还是会话数据，都可以使用 OpenTelemetry (OTel) 采集器作为统一的接入点，或者利用特定平台的集成来满足专门的使用场景。

| Section | Description |
|------|-------------|
| [Overview](/use-cases/observability/clickstack/ingesting-data/overview) | 数据接入方法和架构简介 |
| [Ingesting data with OpenTelemetry](/use-cases/observability/clickstack/ingesting-data/opentelemetry) | 适用于使用 OpenTelemetry 并希望快速集成 ClickStack 的用户 |
| [OpenTelemetry collector](/use-cases/observability/clickstack/ingesting-data/otel-collector) | 关于 ClickStack OpenTelemetry 采集器的进阶细节 |
| [Tables and Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) | ClickStack 使用的 ClickHouse 表及其表结构概览 |
| [Language SDKs](/use-cases/observability/clickstack/sdks) | 用于对编程语言进行埋点并采集遥测数据的 ClickStack SDK |