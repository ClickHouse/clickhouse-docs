---
slug: /use-cases/observability/clickstack/deployment
title: '部署选项'
pagination_prev: null
pagination_next: null
description: '部署 ClickStack - ClickHouse 可观测性栈'
doc_type: 'reference'
keywords: ['ClickStack', 'observability']
---

ClickStack 提供多种部署选项，以满足不同的使用场景。

下面对各部署选项进行概述。[入门指南](/use-cases/observability/clickstack/getting-started) 重点演示了选项 1 和 2，这里一并列出以保证完整性。

| Name             | Description                                                                                                          | Suitable For                                                                                         | Limitations                                                                                                 | Example Link                                                                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| All-in-One       | 将所有 ClickStack 组件打包在一个单独的 Docker 容器中。                                                              | 生产部署、演示、概念验证（PoC）                                                                        | 不推荐用于生产环境                                                                               | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                               |
| ClickHouse Cloud       | 在 ClickHouse Cloud 中托管 ClickHouse 和 HyperDX。                                                      | 演示、本地全栈测试                                                                        | 不推荐用于生产环境                                                                               | [All-in-One](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)                               |
| Helm             | 用于基于 Kubernetes 部署的官方 Helm 图表，支持 ClickHouse Cloud 和生产级扩展。             | 在 Kubernetes 上的生产部署                                                                   | 需要具备 Kubernetes 相关知识，通过 Helm 进行自定义配置                                                        | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose   | 通过 Docker Compose 分别部署每个 ClickStack 组件。                                                    | 本地测试、概念验证、单台服务器上的生产部署、自带 ClickHouse（BYO ClickHouse）                                       | 无容错能力，需要管理多个容器                                                    | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only     | 独立使用 HyperDX，配合你自己的 ClickHouse 和 schema（模式）。                                                       | 现有 ClickHouse 用户、自定义事件管道                                                       | 不包含 ClickHouse，用户必须自行管理数据摄取和 schema（模式）                                                | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only  | 完全在浏览器中运行并使用本地存储，无后端且无持久化。                                          | 演示、调试、配合 HyperDX 的开发                                                                     | 无认证、无持久化、无告警、仅限单用户                                                      | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |