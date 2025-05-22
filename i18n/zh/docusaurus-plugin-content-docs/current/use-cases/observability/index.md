---
'slug': '/use-cases/observability'
'title': '可观测性'
'pagination_prev': null
'pagination_next': null
'description': '可观测性用例指南的首页'
---

欢迎来到我们的可观察性用例指南。在本指南中，您将学习如何设置和使用 ClickHouse 进行可观察性。

请导航到以下页面，探索本指南的不同部分。

| 页面                                                        | 描述                                                                                                                                                                                                                 |
|-------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [介绍](./introduction.md)                                   | 本指南旨在为希望使用 ClickHouse 构建自己的 SQL 基础可观察性解决方案的用户设计，重点关注日志和跟踪。                                                                                                                  |
| [架构设计](./schema-design.md)                             | 了解为什么建议用户为日志和跟踪创建自己的架构，以及一些最佳实践。                                                                                                                                                     |
| [数据管理](./managing-data.md)                             | 可观察性中的 ClickHouse 部署通常涉及大量需要管理的数据集。ClickHouse 提供了一些功能来协助数据管理。                                                                                                               |
| [集成 OpenTelemetry](./integrating-opentelemetry.md)       | 任何可观察性解决方案都需要一种收集和导出日志及跟踪的方法。为此，ClickHouse 推荐使用 OpenTelemetry (OTel) 项目。了解更多关于如何将其与 ClickHouse 集成的信息。                                                      |
| [使用 Grafana](./grafana.md)                               | 了解如何使用 Grafana，这是 ClickHouse 中可观察性数据的首选可视化工具。                                                                                                                                            |
| [演示应用程序](./demo-application.md)                     | Open Telemetry 项目包括一个演示应用程序。可以在此页面找到以 ClickHouse 作为日志和跟踪数据源的此应用程序的维护分支链接。                                                                                          |
