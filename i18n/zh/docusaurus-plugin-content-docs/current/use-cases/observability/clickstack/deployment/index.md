---
'slug': '/use-cases/observability/clickstack/deployment'
'title': '部署选项'
'pagination_prev': null
'pagination_next': null
'description': '部署 ClickStack - ClickHouse 可观察性堆栈'
'doc_type': 'reference'
---

ClickStack 提供多种部署选项以适应不同的使用场景。

以下是每个部署选项的总结。 [入门指南](/use-cases/observability/clickstack/getting-started) 特别演示了选项 1 和 2。它们在这里列出以便完整性。

| 名称               | 描述                                                                                                               | 适合于                                                                                           | 限制                                                                                                       | 示例链接                                                                                                                                     |
|--------------------|--------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|
| All-in-One         | 单个 Docker 容器，包含所有 ClickStack 组件。                                                                       | 生产部署，演示，概念验证                                                                               | 不推荐用于生产                                                                                               | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                                 |
| ClickHouse Cloud    | 在 ClickHouse Cloud 中托管的 ClickHouse 和 HyperDX。                                                             | 演示，本地全栈测试                                                                                   | 不推荐用于生产                                                                                               | [All-in-One](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)                                 |
| Helm               | 用于基于 Kubernetes 的部署的官方 Helm 图表。支持 ClickHouse Cloud 和生产扩展。                                       | 在 Kubernetes 上进行生产部署                                                                        | 需要 Kubernetes 知识，通过 Helm 进行自定义                                                                   | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose     | 通过 Docker Compose 单独部署每个 ClickStack 组件。                                                               | 本地测试，概念验证，单服务器上的生产，BYO ClickHouse                                                     | 无故障容错，需要管理多个容器                                                                                  | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only       | 独立使用 HyperDX，配合您自己的 ClickHouse 和模式。                                                               | 现有 ClickHouse 用户，自定义事件管道                                                                       | 不包含 ClickHouse，用户必须管理数据摄取和模式                                                               | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only    | 完全在浏览器中运行，使用本地存储。没有后端或持久化。                                                            | 演示，调试，开发时使用 HyperDX                                                                          | 没有身份验证，没有持久性，没有警报，仅限单用户                                                             | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |
