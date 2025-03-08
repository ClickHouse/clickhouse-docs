---
slug: /use-cases/observability
title: '可观察性'
pagination_prev: null
pagination_next: null
---
```

欢迎来到我们的可观察性用例指南。在本指南中，您将学习如何设置并使用 ClickHouse 进行可观察性。

导航到以下页面以探索本指南的不同部分。

| 页面                                                        | 描述                                                                                                                                                                                                                    |
|-------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [介绍](./introduction.md)                                   | 本指南旨在为希望使用 ClickHouse 构建自己的基于 SQL 的可观察性解决方案的用户提供支持，重点关注日志和追踪。                                                                                                          |
| [架构设计](./schema-design.md)                             | 了解为什么建议用户为日志和追踪创建自己的架构，以及一些最佳实践。                                                                                                                                                      |
| [管理数据](./managing-data.md)                             | 用于可观察性的 ClickHouse 部署通常涉及大规模数据集，这些数据集需要管理。ClickHouse 提供了多种功能来协助数据管理。                                                                                                   |
| [整合 OpenTelemetry](./integrating-opentelemetry.md)       | 任何可观察性解决方案都需要一种收集和导出日志与追踪的方法。为此，ClickHouse 推荐使用 OpenTelemetry (OTel) 项目。了解如何将其与 ClickHouse 集成。                                                                   |
| [使用 Grafana](./grafana.md)                               | 学习如何使用 Grafana，这是 ClickHouse 中可观察性数据的首选可视化工具。                                                                                                                                                   |
| [演示应用程序](./demo-application.md)                     | Open Telemetry 项目包含一个演示应用程序。该应用程序的维护分支链接在此页面，使用 ClickHouse 作为日志和追踪的数据源。                                                                                            |
