---
slug: /use-cases/observability
title: '可观测性'
pagination_prev: null
pagination_next: null
description: '可观测性用例指南的入口页'
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

ClickHouse 在可观测性方面提供无与伦比的速度、扩展性和成本效益。本指南根据您的需求提供两种路径：



## ClickStack - ClickHouse 可观测性技术栈 {#clickstack}

ClickHouse 可观测性技术栈是我们为大多数用户**推荐的方案**。

**ClickStack** 是一个基于 ClickHouse 和 OpenTelemetry (OTel) 构建的生产级可观测性平台,将日志、追踪、指标和会话统一到单个高性能可扩展解决方案中,支持从单节点部署到**多 PB** 规模。

| 章节                                                                 | 说明                                     |
| ----------------------------------------------------------------------- | ----------------------------------------------- |
| [概述](/use-cases/observability/clickstack/overview)                | ClickStack 简介及其核心功能 |
| [快速入门](/use-cases/observability/clickstack/getting-started)  | 快速入门指南和基本设置说明  |
| [示例数据集](/use-cases/observability/clickstack/sample-datasets) | 示例数据集和使用场景                   |
| [架构](/use-cases/observability/clickstack/architecture)        | 系统架构和组件概述     |
| [部署](/use-cases/observability/clickstack/deployment)            | 部署指南和选项                   |
| [配置](/use-cases/observability/clickstack/config)             | 详细的配置选项和设置     |
| [数据摄取](/use-cases/observability/clickstack/ingesting-data)    | 向 ClickStack 摄取数据的指南     |
| [搜索](/use-cases/observability/clickstack/search)                    | 如何搜索和查询可观测性数据 |
| [生产环境](/use-cases/observability/clickstack/production)            | 生产环境部署的最佳实践        |


## 构建自定义技术栈 {#build-your-own-stack}

对于有**自定义需求**的用户——例如高度专业化的数据摄取管道、模式设计或极端扩展需求——我们提供指导,帮助您以 ClickHouse 作为核心数据库构建自定义可观测性技术栈。

| 页面                                                                  | 描述                                                                                                                                                         |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [简介](/use-cases/observability/introduction)                 | 本指南专为希望使用 ClickHouse 构建自己的可观测性解决方案的用户设计,重点关注日志和链路追踪。                                   |
| [模式设计](/use-cases/observability/schema-design)               | 了解为什么建议用户为日志和链路追踪创建自己的模式,以及相关的最佳实践。                                        |
| [数据管理](/observability/managing-data)                         | 用于可观测性的 ClickHouse 部署通常涉及大规模数据集,需要进行管理。ClickHouse 提供了协助数据管理的功能。 |
| [集成 OpenTelemetry](/observability/integrating-opentelemetry) | 使用 OpenTelemetry 与 ClickHouse 收集和导出日志和链路追踪数据。                                                                                       |
| [使用可视化工具](/observability/grafana)                   | 了解如何使用 ClickHouse 的可观测性可视化工具,包括 HyperDX 和 Grafana。                                                                   |
| [演示应用程序](/observability/demo-application)                   | 探索为与 ClickHouse 配合使用而分叉的 OpenTelemetry 演示应用程序,用于日志和链路追踪。                                                                      |
