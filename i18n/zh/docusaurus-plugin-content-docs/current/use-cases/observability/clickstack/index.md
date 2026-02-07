---
slug: /use-cases/observability/clickstack
title: 'ClickStack - ClickHouse 可观测性栈'
pagination_prev: null
pagination_next: null
description: 'ClickHouse 可观测性栈首页'
keywords: ['ClickStack', 'observability stack', 'HyperDX', 'OpenTelemetry', 'logs', 'traces', 'metrics']
doc_type: 'landing-page'
---

**ClickStack** 是一个开源的、基于 ClickHouse 和 OpenTelemetry (OTel) 构建的生产级可观测性平台，将日志、追踪、指标和会话数据统一到一个高性能解决方案中。ClickStack 专为监控和调试复杂系统而设计，使开发人员和 SRE 能够进行端到端问题追踪，而无需在多个工具之间切换，或手动关联数据。

ClickStack 可以通过两种方式进行部署。使用 **ClickStack Open Source** 时，需要自行运行和管理包括 ClickHouse、ClickStack UI（HyperDX）以及 OpenTelemetry Collector 在内的所有组件。使用 **Managed ClickStack** 时，ClickHouse 和 ClickStack UI（HyperDX）在 ClickHouse Cloud 中以完全托管的方式运行，涵盖认证和运维等事项，只需运行 OpenTelemetry Collector，用于接收来自工作负载的遥测数据，并通过 OTLP 将其转发到 ClickHouse Cloud。

| 章节 | 描述 |
|---------|-------------|
| [Overview](/use-cases/observability/clickstack/overview) | ClickStack 及其关键特性简介 |
| [Getting Started](/use-cases/observability/clickstack/getting-started) | 快速入门指南和基础设置说明 |
| [Sample Datasets](/use-cases/observability/clickstack/sample-datasets) | 示例数据集和使用场景 |
| [Architecture](/use-cases/observability/clickstack/architecture) | 系统架构与组件概览 |
| [Deployment](/use-cases/observability/clickstack/deployment) | 部署指南和可选方案 |
| [Configuration](/use-cases/observability/clickstack/config) | 详细配置选项和设置说明 |
| [Ingesting Data](/use-cases/observability/clickstack/ingesting-data) | 向 ClickStack 摄取数据的指南 |
| [Search](/use-cases/observability/clickstack/search) | 如何搜索和查询可观测性数据 |
| [Production](/use-cases/observability/clickstack/production) | 生产环境部署最佳实践 |