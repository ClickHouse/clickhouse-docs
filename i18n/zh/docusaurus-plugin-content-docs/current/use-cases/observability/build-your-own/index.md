---
slug: /use-cases/observability/build-your-own
title: '构建自有可观测性栈'
pagination_prev: null
pagination_next: null
description: '构建自有可观测性栈的落地页'
doc_type: 'landing-page'
keywords: ['observability', 'custom stack', 'build your own', 'logs', 'traces', 'metrics', 'OpenTelemetry']
---

本指南帮助你以 ClickHouse 为基础构建自定义的可观测性栈。你将学习如何为日志、指标和追踪设计、实现并优化可观测性解决方案，并结合实际示例和最佳实践。

| Page                                                        | Description                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | 本指南面向希望基于 ClickHouse 构建自有可观测性解决方案的用户，重点关注日志和追踪。                                             |
| [Schema design](/use-cases/observability/schema-design)          | 了解为什么推荐用户为日志和追踪创建自己的 schema，以及实现这一目标的一些最佳实践。                                                  |
| [Managing data](/observability/managing-data)          | 用于可观测性的 ClickHouse 部署通常涉及超大规模数据集，这些数据集需要妥善管理。ClickHouse 提供了一系列特性来协助进行数据管理。           |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | 使用 OpenTelemetry 与 ClickHouse 采集和导出日志与追踪数据。                                                           |
| [Using Visualization Tools](/observability/grafana)    | 学习如何在 ClickHouse 上使用可观测性可视化工具，包括 HyperDX 和 Grafana。                                       |
| [Demo Application](/observability/demo-application)    | 体验为 ClickHouse 日志和追踪适配的 OpenTelemetry 演示应用。                                           |