---
slug: /use-cases/observability
title: '可观测性'
pagination_prev: null
pagination_next: null
description: '可观测性用例指南的着陆页'
keywords: ['可观测性', '日志', '链路追踪', '指标', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

ClickHouse 为可观测性提供了无与伦比的速度、可扩展性和成本效益。本指南根据您的需求提供两种方案：



## ClickStack - ClickHouse 可观测性栈 {#clickstack}

ClickHouse Observability Stack 是我们为大多数用户提供的**推荐方案**。

**ClickStack** 是一个基于 ClickHouse 和 OpenTelemetry (OTel) 构建的生产级可观测性平台，将日志、追踪、指标和会话统一到一个高性能、可扩展的解决方案中，可从单节点部署平滑扩展到 **多 PB** 规模。

| Section | Description |
|---------|-------------|
| [Overview](/use-cases/observability/clickstack/overview) | ClickStack 及其关键特性的简介 |
| [Getting Started](/use-cases/observability/clickstack/getting-started) | 快速入门指南和基础配置说明 |
| [Example Datasets](/use-cases/observability/clickstack/sample-datasets) | 示例数据集与典型用例 |
| [Architecture](/use-cases/observability/clickstack/architecture) | 系统架构与组件概览 |
| [Deployment](/use-cases/observability/clickstack/deployment) | 部署指南与部署选项 |
| [Configuration](/use-cases/observability/clickstack/config) | 详细配置选项与参数说明 |
| [Ingesting Data](/use-cases/observability/clickstack/ingesting-data) | 将数据摄取到 ClickStack 的指导说明 |
| [Search](/use-cases/observability/clickstack/search) | 如何搜索和查询可观测性数据 |
| [Production](/use-cases/observability/clickstack/production) | 生产环境部署最佳实践 |



## 自建栈 {#build-your-own-stack}

对于具有**自定义需求**的用户——例如高度定制的摄取流水线、模式设计或极端规模的扩展需求——我们提供指导，帮助构建以 ClickHouse 作为核心数据库的自定义可观测性栈。

| 页面                                                        | 说明                                                                                                                                                                   |
|-------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | 本指南面向希望使用 ClickHouse 自行构建可观测性解决方案的用户，重点关注日志和链路追踪。                                             |
| [Schema design](/use-cases/observability/schema-design)          | 了解为何建议为日志和链路追踪创建自定义模式（schema），以及在此过程中可遵循的一些最佳实践。                                                  |
| [Managing data](/observability/managing-data)          | 用于可观测性的 ClickHouse 部署通常会涉及海量数据集，这些数据需要妥善管理。ClickHouse 提供了一系列有助于数据管理的功能。           |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | 使用 OpenTelemetry 与 ClickHouse 进行日志和链路追踪的收集与导出。                                                           |
| [Using Visualization Tools](/observability/grafana)    | 了解如何将包括 HyperDX 和 Grafana 在内的可观测性可视化工具与 ClickHouse 集成使用。                                       |
| [Demo Application](/observability/demo-application)    | 体验已 fork 并适配 ClickHouse 的 OpenTelemetry Demo Application，用于日志和链路追踪。                                           |
