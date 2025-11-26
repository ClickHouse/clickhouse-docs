---
slug: /use-cases/observability/build-your-own
title: '构建自有可观测性技术栈'
pagination_prev: null
pagination_next: null
description: '用于构建自有可观测性技术栈的入口页'
doc_type: 'landing-page'
keywords: ['可观测性', '自定义技术栈', '自建', '日志', '链路追踪', '指标', 'OpenTelemetry']
---

本指南将帮助你以 ClickHouse 为基础构建自定义可观测性技术栈。你将学习如何为日志、指标和链路追踪设计、实现并优化可观测性解决方案，并结合实践示例和最佳实践进行指导。

| Page                                                        | Description                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | 本指南面向希望使用 ClickHouse 构建自有可观测性解决方案的用户，重点关注日志和链路追踪。                                                                                              |
| [Schema design](/use-cases/observability/schema-design)          | 了解为什么推荐用户为日志和链路追踪创建自定义 schema，以及在这样做时的一些最佳实践。                                                                                                  |
| [Managing data](/observability/managing-data)          | 面向可观测性的 ClickHouse 部署通常涉及海量数据集，需要进行有效管理。ClickHouse 提供了一系列有助于数据管理的特性。                                                                   |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | 使用 OpenTelemetry 结合 ClickHouse 收集和导出日志与链路追踪数据。                                                                          |
| [Using Visualization Tools](/observability/grafana)    | 学习如何在 ClickHouse 上使用可观测性可视化工具，包括 HyperDX 和 Grafana。                                                                  |
| [Demo Application](/observability/demo-application)    | 体验为在 ClickHouse 上处理日志和链路追踪而分叉并适配的 OpenTelemetry Demo Application。                                                     |