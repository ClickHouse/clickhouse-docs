---
'slug': '/use-cases/observability'
'title': '可观察性'
'pagination_prev': null
'pagination_next': null
'description': '可观察性用例指南的登陆页面'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
---

ClickHouse 为可观察性提供无与伦比的速度、规模和成本效率。本指南根据您的需求提供了两条路径：

## ClickStack - ClickHouse 可观察性堆栈 {#clickstack}

ClickHouse 可观察性堆栈是我们**推荐的方法**，适用于大多数用户。

**ClickStack** 是一个基于 ClickHouse 和 OpenTelemetry (OTel) 的生产级可观察性平台，将日志、跟踪、指标和会话统一在一个高性能的可扩展解决方案中，从单节点部署到**多PB**规模均可适用。

| 部分                         | 描述                                       |
|-----------------------------|------------------------------------------|
| [概述](/use-cases/observability/clickstack/overview)       | ClickStack 及其主要功能的介绍               |
| [入门](/use-cases/observability/clickstack/getting-started)     | 快速入门指南和基本设置说明                 |
| [示例数据集](/use-cases/observability/clickstack/sample-datasets) | 示例数据集和用例                           |
| [架构](/use-cases/observability/clickstack/architecture)         | 系统架构和组件概述                         |
| [部署](/use-cases/observability/clickstack/deployment)           | 部署指南及选项                             |
| [配置](/use-cases/observability/clickstack/config)               | 详细的配置选项和设置                       |
| [数据摄取](/use-cases/observability/clickstack/ingesting-data)  | 将数据摄取到 ClickStack 的指南               |
| [搜索](/use-cases/observability/clickstack/search)               | 如何搜索和查询您的可观察性数据              |
| [生产](/use-cases/observability/clickstack/production)           | 生产部署的最佳实践                         |


## 自建堆栈 {#build-your-own-stack}

对于具有**自定义需求**的用户——例如高度专业化的摄取管道、模式设计或极端的扩展需求——我们提供指导，以帮助您以 ClickHouse 作为核心数据库构建自定义可观察性堆栈。

| 页面                                                | 描述                                                                                                                                                                     |
|-----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [介绍](/use-cases/observability/introduction)             | 本指南旨在帮助希望使用 ClickHouse 构建自己的可观察性解决方案的用户，重点关注日志和跟踪。                                                                           |
| [模式设计](/use-cases/observability/schema-design)         | 了解为什么建议用户为日志和跟踪创建自己的模式，以及这样做的一些最佳实践。                                                                                           |
| [管理数据](/observability/managing-data)            | ClickHouse 的可观察性部署必然涉及大型数据集，需要进行管理。ClickHouse 提供了数据管理的功能以助力于此。                                                                 |
| [集成 OpenTelemetry](/observability/integrating-opentelemetry) | 使用 OpenTelemetry 在 ClickHouse 中收集和导出日志和跟踪。                                                                                                         |
| [使用可视化工具](/observability/grafana)             | 了解如何使用可观察性可视化工具为 ClickHouse 提供支持，包括 HyperDX 和 Grafana。                                                                                     |
| [演示应用程序](/observability/demo-application)      | 探索 OpenTelemetry 演示应用程序，该应用程序分支已调整为与 ClickHouse 一起处理日志和跟踪。                                                                             |
