---
slug: /use-cases/observability/clickstack/deployment/oss
title: '开源部署选项'
pagination_prev: null
pagination_next: null
description: '部署开源 ClickStack - ClickHouse 可观测性栈'
doc_type: 'reference'
keywords: ['ClickStack', '可观测性', 'Open Source']
---

开源 ClickStack 提供多种部署选项，以适配不同的使用场景。

下文对各部署选项进行了汇总。[开源快速入门指南](/use-cases/observability/clickstack/getting-started/oss) 重点演示了第 1 种选项，此处为完整起见一并列出。

| Name             | Description                                                                                                          | Suitable For                                                                                         | Limitations                                                                                                 | Example Link                                                                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| All-in-One       | 单个 Docker 容器，打包了所有 ClickStack 组件。                                                                       | 非生产环境部署、演示、概念验证                                                                        | 不建议用于生产环境                                                                                          | [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one)                               |
| Helm             | 基于 Kubernetes 部署的官方 Helm 图表。支持 ClickHouse Cloud 和生产级扩展。                                          | 在 Kubernetes 上的生产环境部署                                                                        | 需要具备 Kubernetes 相关知识，通过 Helm 进行自定义配置                                                      | [Helm](/use-cases/observability/clickstack/deployment/helm)                                          |
| Docker Compose   | 通过 Docker Compose 单独部署每个 ClickStack 组件。                                                                   | 本地测试、概念验证、单台服务器上的生产环境、自带 ClickHouse                                           | 无容错能力，需要管理多个容器                                                                                | [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)                       |
| HyperDX Only     | 独立使用 HyperDX，并配合您自己的 ClickHouse 和 schema。                                                             | 现有 ClickHouse 用户、自定义事件管道                                                                  | 不包含 ClickHouse，用户必须自行管理数据摄取和 schema                                                       | [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)                           |
| Local Mode Only  | 完全在浏览器中运行并使用本地存储。无后端或持久化。                                                                  | 演示、调试、与 HyperDX 集成的开发                                                                      | 无认证、无持久化、无告警、仅限单用户使用                                                                    | [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)                     |