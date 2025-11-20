---
slug: /use-cases/observability/cloud-monitoring
title: 'ClickHouse Cloud 监控'
sidebar_label: 'ClickHouse Cloud 监控'
description: 'ClickHouse Cloud 监控指南'
doc_type: 'guide'
keywords: ['observability', 'monitoring', 'cloud', 'metrics', 'system health']
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import Image from '@theme/IdealImage';
import ObservabilityIntegrations from '@site/docs/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/docs/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/docs/_snippets/_community_monitoring.md';


# ClickHouse Cloud 监控 {#cloud-monitoring}

本指南为正在评估 ClickHouse Cloud 的企业团队提供生产环境部署中监控和可观测性能力的全面信息。企业客户经常关注的问题包括:开箱即用的监控功能、与现有可观测性技术栈(如 Datadog 和 AWS CloudWatch 等工具)的集成,以及 ClickHouse 监控与自托管部署方式的对比。


## 高级可观测性仪表板 {#advanced-observability}

ClickHouse Cloud 通过内置的仪表板界面提供全面的监控功能,可通过监控部分访问。这些仪表板无需额外配置即可实时可视化系统和性能指标,是 ClickHouse Cloud 中实时生产环境监控的主要工具。

- **高级仪表板**:通过监控 → 高级仪表板访问的主仪表板界面,可实时查看查询速率、资源使用情况、系统健康状况和存储性能。此仪表板无需单独身份验证,不会阻止实例进入空闲状态,也不会给生产系统增加查询负载。每个可视化图表都由可自定义的 SQL 查询驱动,开箱即用的图表分为 ClickHouse 特定指标、系统健康指标和云服务特定指标。用户可以直接在 SQL 控制台中创建自定义查询来扩展监控功能。

:::note
访问这些指标不会向底层服务发出查询,也不会唤醒空闲服务。
:::

<Image img={AdvancedDashboard} size='lg' alt='高级仪表板' />

希望扩展这些可视化功能的用户可以使用 ClickHouse Cloud 中的仪表板功能,直接查询系统表。

- **原生高级仪表板**:可通过监控部分中的"您仍然可以访问原生高级仪表板"访问的替代仪表板界面。它会在单独的标签页中打开并需要身份验证,为系统和服务健康监控提供替代 UI。此仪表板支持高级分析,用户可以修改底层 SQL 查询。

<Image img={NativeAdvancedDashboard} size='lg' alt='原生高级仪表板' />

这两个仪表板都能立即提供服务健康状况和性能的可见性,无需外部依赖,这使它们区别于 ClickStack 等专注于外部调试的工具。

有关详细的仪表板功能和可用指标,请参阅[高级仪表板文档](/cloud/manage/monitor/advanced-dashboard)。


## 查询洞察与资源监控 {#query-insights}

ClickHouse Cloud 提供以下额外的监控功能:

- 查询洞察:用于查询性能分析和故障排查的内置界面
- 资源利用率仪表板:跟踪内存、CPU 分配和数据传输模式。CPU 使用率和内存使用率图表显示特定时间段内的最大利用率指标。CPU 使用率图表显示的是系统级 CPU 利用率指标(而非 ClickHouse 的 CPU 利用率指标)。

有关详细功能,请参阅[查询洞察](/cloud/get-started/query-insights)和[资源利用率](/operations/monitoring#resource-utilization)文档。


## Prometheus 兼容的指标端点 {#prometheus}

ClickHouse Cloud 提供 Prometheus 端点。用户可以保持现有工作流程,充分利用团队现有专业知识,并将 ClickHouse 指标集成到企业监控平台中,包括 Grafana、Datadog 和其他 Prometheus 兼容工具。

组织级端点聚合所有服务的指标,而服务级端点则提供细粒度监控。主要功能包括:

- 过滤指标选项:可选的 filtered_metrics=true 参数可将有效负载从 1000 多个可用指标减少到 125 个"关键任务"指标,从而优化成本并更容易聚焦监控重点
- 缓存指标交付:使用每分钟刷新的物化视图来最小化生产系统的查询负载

:::note
此方法遵循服务空闲行为,允许在服务未主动处理查询时进行成本优化。此 API 端点依赖于 ClickHouse Cloud API 凭据。有关完整的端点配置详细信息,请参阅云 [Prometheus 文档](/integrations/prometheus)。
:::

<ObservabilityIntegrations />

### ClickStack 部署选项 {#clickstack-deployment}

- **ClickHouse Cloud 中的 HyperDX**(私有预览):HyperDX 可以在任何 ClickHouse Cloud 服务上启动。
- [Helm](/use-cases/observability/clickstack/deployment/helm):推荐用于基于 Kubernetes 的调试环境。支持与 ClickHouse Cloud 集成,并允许通过 `values.yaml` 进行特定环境配置、资源限制和扩展。
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose):单独部署每个组件(ClickHouse、HyperDX、OTel 收集器、MongoDB)。用户可以修改 compose 文件,在与 ClickHouse Cloud 集成时删除任何未使用的组件,特别是 ClickHouse 和 OpenTelemetry Collector。
- [仅 HyperDX](/use-cases/observability/clickstack/deployment/hyperdx-only):独立的 HyperDX 容器。

有关完整的部署选项和架构详细信息,请参阅 [ClickStack 文档](/use-cases/observability/clickstack/overview)和[数据摄取指南](/use-cases/observability/clickstack/ingesting-data/overview)。

:::note
用户还可以通过 OpenTelemetry Collector 从 ClickHouse Cloud Prometheus 端点收集指标,并将其转发到单独的 ClickStack 部署进行可视化。
:::

<DirectIntegrations />

<CommunityMonitoring />


## 系统影响注意事项 {#system-impact}

上述所有方法都混合使用了以下方式：依赖 Prometheus 端点、由 ClickHouse Cloud 管理，或直接查询系统表。
最后一种方式依赖于查询生产环境的 ClickHouse 服务。这会增加被监控系统的查询负载，并阻止 ClickHouse Cloud 实例进入空闲状态，从而影响成本优化。此外，如果生产系统发生故障，监控也可能受到影响，因为两者是耦合的。这种方法非常适合深度分析和调试，但不太适合实时生产监控。在评估直接 Grafana 集成与下一节讨论的外部工具集成方法时，请权衡详细系统分析能力与运营开销之间的取舍。
