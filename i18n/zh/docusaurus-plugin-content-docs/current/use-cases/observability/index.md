---
'slug': '/use-cases/observability'
'title': '可观察性'
'pagination_prev': null
'pagination_next': null
'description': '可观察性用例指南的登录页面'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'doc_type': 'guide'
---

ClickHouse 提供了无与伦比的速度、规模和成本效率，用于可观测性。该指南根据您的需求提供了两条路径：

## ClickStack - ClickHouse 可观测性堆栈 {#clickstack}

ClickHouse 可观测性堆栈是我们 **推荐的方法**，适用于大多数用户。

**ClickStack** 是一个生产级的可观测性平台，建立在 ClickHouse 和 OpenTelemetry (OTel) 之上，统一了日志、跟踪、指标和会话，形成一个高性能的可扩展解决方案，适用于从单节点部署到 **多 PB** 规模。

| 部分                              | 描述                                      |
|-----------------------------------|-------------------------------------------|
| [概述](/use-cases/observability/clickstack/overview)         | ClickStack 及其主要特征的介绍                     |
| [入门](/use-cases/observability/clickstack/getting-started)    | 快速入门指南和基本设置说明                        |
| [示例数据集](/use-cases/observability/clickstack/sample-datasets)  | 示例数据集和用例                                |
| [架构](/use-cases/observability/clickstack/architecture)        | 系统架构和组件概述                              |
| [部署](/use-cases/observability/clickstack/deployment)         | 部署指南和选项                                |
| [配置](/use-cases/observability/clickstack/config)             | 详细的配置选项和设置                             |
| [数据摄取](/use-cases/observability/clickstack/ingesting-data) | 将数据摄取到 ClickStack 的指南                   |
| [搜索](/use-cases/observability/clickstack/search)             | 如何搜索和查询您的可观测性数据                   |
| [生产](/use-cases/observability/clickstack/production)         | 生产部署的最佳实践                              |

## 自建堆栈 {#build-your-own-stack}

对于具有 **定制需求** 的用户 — 例如高度专业化的摄取管道、模式设计或极限扩展需求 — 我们提供指导，以构建以 ClickHouse 为核心数据库的自定义可观测性堆栈。

| 页面                                                        | 描述                                                                                                                                                                     |
|-------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [介绍](/use-cases/observability/introduction)            | 本指南旨在帮助用户构建自己的可观测性解决方案，使用 ClickHouse，重点关注日志和跟踪。                                                                                       |
| [模式设计](/use-cases/observability/schema-design)          | 了解为何推荐用户为日志和跟踪创建自己的模式，以及一些最佳实践。                                                                                                         |
| [管理数据](/observability/managing-data)          | ClickHouse在可观测性的部署不可避免地涉及大量数据集，需要进行管理。ClickHouse 提供了一些特性来协助数据管理。                                                               |
| [集成 OpenTelemetry](/observability/integrating-opentelemetry) | 使用 OpenTelemetry 在 ClickHouse 中收集和导出日志和跟踪。                                                                                                           |
| [使用可视化工具](/observability/grafana)    | 了解如何使用可观测性可视化工具，如 HyperDX 和 Grafana 来支持 ClickHouse。                                                                                          |
| [演示应用](/observability/demo-application)    | 探索与 ClickHouse 兼容的 OpenTelemetry 演示应用程序。                                                                                                                |
