---
slug: /use-cases/observability/cloud-monitoring
title: 'ClickHouse Cloud 监控'
sidebar_label: 'ClickHouse Cloud 监控'
description: 'ClickHouse Cloud 监控指南'
doc_type: 'guide'
keywords: ['可观测性', '监控', '云', '指标', '系统健康']
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import Image from '@theme/IdealImage';
import ObservabilityIntegrations from '@site/docs/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/docs/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/docs/_snippets/_community_monitoring.md';


# ClickHouse Cloud 监控 {#cloud-monitoring}

本指南为正在评估 ClickHouse Cloud 的企业团队提供有关生产环境部署中监控与可观测性能力的全面信息。企业客户经常询问开箱即用的监控功能、与现有可观测性技术栈（包括 Datadog 和 AWS CloudWatch 等工具）的集成方式，以及 ClickHouse 的监控能力与自托管部署之间的对比。

## 高级可观测性仪表板 {#advanced-observability}

ClickHouse Cloud 通过 Monitoring 部分中可访问的内置仪表板界面提供全面监控。这些仪表板无需额外配置即可实时可视化系统与性能指标，是在 ClickHouse Cloud 中进行生产环境实时监控的主要工具。

- **Advanced Dashboard（高级仪表板）**：可通过 Monitoring → Advanced dashboard 访问的主仪表板界面，提供对查询速率、资源使用情况、系统健康状况以及存储性能的实时可见性。该仪表板不需要单独身份验证，不会阻止实例进入空闲状态，也不会给生产系统增加查询负载。每个可视化都由可自定义的 SQL 查询驱动，默认提供的图表分组为 ClickHouse 特定指标、系统健康指标以及 Cloud 特定指标。用户可以在 SQL 控制台中直接创建自定义查询，以扩展监控能力。

:::note
访问这些指标不会向底层服务发出查询，也不会唤醒处于空闲状态的服务。 
:::

<Image img={AdvancedDashboard} size="lg" alt="高级仪表板"/>

希望扩展这些可视化的用户可以使用 ClickHouse Cloud 中的仪表板功能，直接查询系统表。

- **原生高级仪表板**：可通过 Monitoring 部分中的 "You can still access the native advanced dashboard" 入口访问的另一种仪表板界面。该界面会在单独的标签页中打开并需要身份验证，提供用于监控系统和服务健康状况的替代 UI。此仪表板支持高级分析，用户可以修改其底层 SQL 查询。

<Image img={NativeAdvancedDashboard} size="lg" alt="高级仪表板"/>

这两个仪表板在无需外部依赖的情况下，都可立即提供对服务健康状况和性能的可见性，使其有别于像 ClickStack 这类以调试为中心的外部工具。

有关仪表板功能和可用指标的详细信息，请参阅[高级仪表板文档](/cloud/manage/monitor/advanced-dashboard)。

## 查询洞察与资源监控 {#query-insights}

ClickHouse Cloud 提供了额外的监控能力：

- Query Insights：用于查询性能分析和故障排查的内置界面
- Resource Utilization Dashboard：用于跟踪内存、CPU 分配以及数据传输模式。CPU 使用率和内存使用率图表会显示特定时间段内的最大利用率指标。CPU 使用率图表展示的是系统级 CPU 利用率指标（而非 ClickHouse 的 CPU 利用率指标）。

有关功能的详细说明，请参阅 [query insights](/cloud/get-started/query-insights) 和 [resource utilization](/operations/monitoring#resource-utilization) 文档。

## 兼容 Prometheus 的指标端点 {#prometheus}

ClickHouse Cloud 提供一个 Prometheus 端点。这样可以让用户延续现有工作流、利用团队既有经验，并将 ClickHouse 指标集成到包括 Grafana、Datadog 在内的企业级监控平台以及其他兼容 Prometheus 的工具中。 

组织级端点会对所有服务的指标进行联邦汇总，而按服务划分的端点则提供更精细的监控能力。其主要特性包括：

- 过滤指标选项：可选参数 `filtered_metrics=true` 会将 1000+ 可用指标缩减为 125 个“关键业务级”指标，以实现成本优化并聚焦更易于监控的核心指标
- 缓存指标投递：使用每分钟刷新的物化视图，将生产系统上的查询负载降到最低

:::note
此方法遵循服务空闲行为，在服务未主动处理查询时有助于进行成本优化。该 API 端点依赖 ClickHouse Cloud 的 API 凭证。有关端点配置的完整细节，请参阅 ClickHouse Cloud 的 [Prometheus 文档](/integrations/prometheus)。
:::

<ObservabilityIntegrations/>

### ClickStack 部署选项 {#clickstack-deployment}

- **HyperDX in ClickHouse Cloud**（私有预览）：可以在任何 ClickHouse Cloud 服务上启动 HyperDX。
- [Helm](/use-cases/observability/clickstack/deployment/helm)：推荐用于基于 Kubernetes 的调试环境。支持与 ClickHouse Cloud 集成，并允许通过 `values.yaml` 进行环境特定配置、资源限制和扩缩容。
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose)：分别部署各个组件（ClickHouse、HyperDX、OTel collector、MongoDB）。在与 ClickHouse Cloud 集成时，用户可以修改 compose 文件以移除未使用的组件，尤其是 ClickHouse 和 OTel collector。
- [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only)：独立的 HyperDX 容器。

有关完整的部署选项和架构详细信息，请参阅 [ClickStack 文档](/use-cases/observability/clickstack/overview)和[数据摄取指南](/use-cases/observability/clickstack/ingesting-data/overview)。

:::note
用户还可以通过 OTel collector 从 ClickHouse Cloud 的 Prometheus 端点收集指标，并将其转发到单独的 ClickStack 部署进行可视化。
:::

<DirectIntegrations/>

<CommunityMonitoring/>

## 系统影响考量 {#system-impact}

以上所有方法都以不同方式组合了以下途径：依赖 Prometheus 端点、由 ClickHouse Cloud 管理，或直接查询系统表。
其中最后一种方式依赖于查询生产环境中的 ClickHouse 服务。这会为受监控系统增加查询负载，并阻止 ClickHouse Cloud 实例进入空闲状态，从而影响成本优化。此外，如果生产系统发生故障，由于二者是耦合的，监控也可能受到影响。该方法非常适合用于深入分析与调试，但不太适用于生产环境的实时监控。在评估直接与 Grafana 集成，还是采用下一节讨论的外部工具集成方案时，应权衡系统细粒度分析能力与运维开销之间的取舍。