---
slug: /use-cases/observability/build-your-own
title: '自建可观测性技术栈'
pagination_prev: null
pagination_next: null
description: '自建可观测性技术栈的入口页'
doc_type: 'landing-page'
keywords: ['observability', 'custom stack', 'build your own', 'logs', 'traces', 'metrics', 'OpenTelemetry']
---

本指南将帮助你以 ClickHouse 为核心构建自定义可观测性技术栈。通过实践示例和最佳实践，学习如何为日志、指标和链路追踪设计、实现并优化你的可观测性方案。

| Page                                                        | Description                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | 本指南面向希望使用 ClickHouse 自建可观测性解决方案的用户，重点聚焦日志和链路追踪。                                                                                             |
| [Schema design](/use-cases/observability/schema-design)          | 了解为什么推荐用户为日志和链路追踪自定义表结构，并参考相应的设计最佳实践。                                                                                                     |
| [Managing data](/observability/managing-data)          | 用于可观测性的 ClickHouse 部署通常涉及超大规模数据集，需要进行有效管理。ClickHouse 提供了一系列功能来帮助进行数据管理。                                                         |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | 借助 OpenTelemetry 在 ClickHouse 中采集并导出日志和链路追踪数据。                                                                                 |
| [Using Visualization Tools](/observability/grafana)    | 学习如何将 HyperDX、Grafana 等可观测性可视化工具与 ClickHouse 集成使用。                                                                  |
| [Demo Application](/observability/demo-application)    | 体验为支持在 ClickHouse 中处理日志和链路追踪而 fork 的 OpenTelemetry 示例应用。                                                              |