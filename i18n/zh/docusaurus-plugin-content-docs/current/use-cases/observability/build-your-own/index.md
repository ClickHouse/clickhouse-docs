---
slug: /use-cases/observability/build-your-own
title: '自建可观测性栈'
pagination_prev: null
pagination_next: null
description: '自建可观测性栈的着陆页'
doc_type: 'landing-page'
keywords: ['可观测性', '自定义栈', '自主构建', 'logs', 'traces', 'metrics', 'OpenTelemetry']
---

本指南将帮助您以 ClickHouse 为基础自建可观测性栈。您将学习如何围绕日志、指标与追踪设计、实现并优化可观测性解决方案，并结合实践示例与最佳实践进行指导。

| Page                                                        | Description                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | 本指南面向希望基于 ClickHouse 自行构建可观测性解决方案的用户，重点聚焦日志与追踪。                                                                                              |
| [Schema design](/use-cases/observability/schema-design)          | 了解为何建议为日志和追踪设计自定义数据模式（schema），以及在此过程中可遵循的一些最佳实践。                                                                                      |
| [Managing data](/observability/managing-data)          | 面向可观测性的 ClickHouse 部署通常涉及海量数据集，这些数据需要妥善管理。ClickHouse 提供了一系列便于高效数据管理的功能。                                                            |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | 使用 OpenTelemetry 将日志与追踪数据采集并导出到 ClickHouse。                                                                               |
| [Using Visualization Tools](/observability/grafana)    | 学习如何将 ClickHouse 与可观测性可视化工具集成使用，包括 HyperDX 和 Grafana。                                                             |
| [Demo Application](/observability/demo-application)    | 体验为 ClickHouse 日志与追踪场景改造的 OpenTelemetry 演示应用。                                                                           |