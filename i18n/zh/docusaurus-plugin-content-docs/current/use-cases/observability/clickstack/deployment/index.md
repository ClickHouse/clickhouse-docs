---
'slug': '/use-cases/observability/clickstack/deployment'
'title': '部署选项'
'pagination_prev': null
'pagination_next': null
'description': '部署 ClickStack - ClickHouse 可观察性栈'
---

ClickStack 提供多种部署选项以适应不同的用例。

以下是对每个部署选项的总结。 [入门指南](/use-cases/observability/clickstack/getting-started) 特别演示了选项 1 和 2。它们在此处包含以求完整。

| 名称             | 描述                                                                                                                  | 适用对象                                                                                             | 限制                                                                                                       | 示例链接                                                                                                                                          |
|------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| All-in-One       | 单个 Docker 容器，捆绑了所有 ClickStack 组件。                                                                        | 演示、局部全栈测试                                                                                      | 不推荐用于生产                                                                                             | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                               |
| Helm             | 官方的 Helm 图表，用于基于 Kubernetes 的部署。支持 ClickHouse Cloud 和生产扩展。                                 | Kubernetes 上的生产部署                                                                                  | 需要 Kubernetes 知识，需通过 Helm 进行自定义                                                                    | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose   | 通过 Docker Compose 单独部署每个 ClickStack 组件。                                                                   | 本地测试、概念验证、在单个服务器上的生产、自管理 ClickHouse                                             | 无容错能力，需要管理多个容器                                                                                | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only     | 独立使用 HyperDX，并使用您自己的 ClickHouse 和架构。                                                               | 现有 ClickHouse 用户、自定义事件管道                                                                      | 不包括 ClickHouse，用户必须管理数据摄取和架构                                                              | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only  | 完全在浏览器中运行，使用本地存储。没有后端或持久性。                                                                | 演示、调试、与 HyperDX 的开发                                                                           | 无身份验证，无持久性，无警报，仅限单用户                                                                    | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |
