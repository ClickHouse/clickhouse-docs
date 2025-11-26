---
slug: /use-cases/observability/build-your-own
title: '构建自有可观测性栈'
pagination_prev: null
pagination_next: null
description: '用于构建自有可观测性栈的着陆页'
doc_type: 'landing-page'
keywords: ['observability', 'custom stack', 'build your own', 'logs', 'traces', 'metrics', 'OpenTelemetry']
---

本指南将帮助您基于 ClickHouse 构建自定义可观测性栈。您将学习如何为日志、指标和追踪设计、实现并优化可观测性解决方案，并结合实践示例和最佳实践进行指导。

| Page                                                        | Description                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | 本指南适用于希望使用 ClickHouse 构建自有可观测性解决方案的用户，重点关注日志和追踪。                                             |
| [Schema design](/use-cases/observability/schema-design)          | 了解为何推荐用户为日志和追踪创建自定义模式（schema），以及在此过程中可采用的一些最佳实践。                                                  |
| [Managing data](/observability/managing-data)          | 基于 ClickHouse 的可观测性部署通常涉及海量数据集，这些数据需要进行有效管理。ClickHouse 提供了一系列有助于数据管理的功能。           |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | 使用 OpenTelemetry 与 ClickHouse 采集并导出日志和追踪。                                                           |
| [Using Visualization Tools](/observability/grafana)    | 了解如何在 ClickHouse 上使用可观测性可视化工具，包括 HyperDX 和 Grafana。                                       |
| [Demo Application](/observability/demo-application)    | 了解为适配 ClickHouse 日志和追踪而分叉改造的 OpenTelemetry Demo Application。                                           |