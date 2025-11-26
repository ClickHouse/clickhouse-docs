---
slug: /use-cases/observability
title: '可观测性'
pagination_prev: null
pagination_next: null
description: '可观测性用例指南的着陆页'
keywords: ['可观测性', '日志', '链路追踪', '指标', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

ClickHouse 为可观测性提供了无与伦比的速度、可扩展性和成本效率。本指南提供两种方案，可根据你的需求进行选择：

## ClickStack - ClickHouse 可观测性栈 {#clickstack}

ClickHouse Observability Stack 是我们向大多数用户**重点推荐的方案**。

**ClickStack** 是基于 ClickHouse 和 OpenTelemetry (OTel) 构建的生产级可观测性平台，将日志、链路追踪、指标和会话统一在单一高性能、可扩展的解决方案中，可从单节点部署扩展到 **多 PB** 规模。

| Section | Description |
|---------|-------------|
| [Overview](/use-cases/observability/clickstack/overview) | ClickStack 及其关键特性的介绍 |
| [Getting Started](/use-cases/observability/clickstack/getting-started) | 快速入门指南和基础设置步骤 |
| [Example Datasets](/use-cases/observability/clickstack/sample-datasets) | 示例数据集和使用场景 |
| [Architecture](/use-cases/observability/clickstack/architecture) | 系统架构和组件概览 |
| [Deployment](/use-cases/observability/clickstack/deployment) | 部署指南和可选方案 |
| [Configuration](/use-cases/observability/clickstack/config) | 详细配置选项和设置说明 |
| [Ingesting Data](/use-cases/observability/clickstack/ingesting-data) | 向 ClickStack 摄取数据的指导 |
| [Search](/use-cases/observability/clickstack/search) | 如何搜索和查询可观测性数据 |
| [Production](/use-cases/observability/clickstack/production) | 生产环境部署的最佳实践 |

## 自建技术栈 {#build-your-own-stack}

对于具有**自定义需求**的用户——例如高度定制的数据摄取流水线、模式设计或极端扩展性需求——我们提供指导，帮助以 ClickHouse 作为核心数据库构建自定义可观测性技术栈。

| Page                                                        | Description                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | 本指南面向希望使用 ClickHouse 自行构建可观测性解决方案的用户，重点关注日志和追踪数据。                                             |
| [Schema design](/use-cases/observability/schema-design)          | 了解为何推荐用户为日志和追踪数据创建自己的模式（schema），以及相关的一些最佳实践。                                                  |
| [Managing data](/observability/managing-data)          | 用于可观测性的 ClickHouse 部署通常涉及海量数据集，这些数据需要进行管理。ClickHouse 提供了多种功能来辅助数据管理。           |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | 使用 OpenTelemetry 配合 ClickHouse 收集并导出日志和追踪数据。                                                           |
| [Using Visualization Tools](/observability/grafana)    | 了解如何在 ClickHouse 上使用可观测性可视化工具，包括 HyperDX 和 Grafana。                                       |
| [Demo Application](/observability/demo-application)    | 体验为适配 ClickHouse 日志和追踪而派生的 OpenTelemetry Demo Application。                                           |