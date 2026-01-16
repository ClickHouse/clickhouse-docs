import Image from '@theme/IdealImage';
import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';



## 集成示例 \{#examples\}

外部集成使组织能够保持既有的监控工作流，利用团队对熟悉工具的既有专业经验，并在不扰乱当前流程或需要大量再培训投入的情况下，将 ClickHouse 监控纳入更广泛的基础设施可观测性体系。
团队可以将现有的告警规则和升级策略应用到 ClickHouse 指标上，同时在统一的可观测性平台中，将数据库性能与应用和基础设施的健康状况进行关联。此方法最大化当前监控体系的投资回报，并通过整合的仪表盘和熟悉的工具界面实现更快速的故障排查。

### Grafana Cloud 监控 \{#grafana\}

Grafana 既支持通过直接插件集成，也支持通过基于 Prometheus 的方案对 ClickHouse 进行监控。通过 Prometheus endpoint 的集成，可以在保持监控与生产工作负载相互隔离的同时，在现有的 Grafana Cloud 基础设施中实现可视化。有关配置说明，请参阅 [Grafana 的 ClickHouse 文档](https://grafana.com/docs/grafana-cloud/monitor-infrastructure/integrations/integration-reference/integration-clickhouse/)。

### Datadog 监控 \{#datadog\}
Datadog 正在开发专用的 API 集成，以在充分考虑服务空闲行为的前提下，提供完善的云服务监控。在此期间，团队可以通过 ClickHouse 的 Prometheus endpoint 使用 OpenMetrics 集成方案，以实现运行隔离和具成本效益的监控。有关配置说明，请参阅 [Datadog 的 Prometheus 和 OpenMetrics 集成文档](https://docs.datadoghq.com/integrations/openmetrics/)。

### ClickStack \{#clickstack\}

ClickStack 是 ClickHouse 推荐的、用于深度系统分析和调试的可观测性解决方案，使用 ClickHouse 作为存储引擎，为日志、指标和追踪提供统一的平台。此方案依赖 HyperDX（ClickStack 的 UI），直接连接到 ClickHouse 实例内部的系统表。
HyperDX 内置了一个面向 ClickHouse 的仪表盘，包含 Selects、Inserts 和 Infrastructure 选项卡。团队还可以使用 Lucene 或 SQL 语法搜索系统表和日志，并通过 Chart Explorer 创建自定义可视化，以进行更细致的系统分析。
此方案更适合用于调试复杂问题、性能分析和深度系统内省，而非实时生产告警。

:::note
请注意，由于 HyperDX 会直接查询系统表，此方案会唤醒处于空闲状态的服务。
:::