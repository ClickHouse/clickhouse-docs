import Image from '@theme/IdealImage';
import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';



## 集成示例 {#examples}

外部集成使组织能够保持既有的监控工作流程,充分利用团队对熟悉工具的专业知识,并将 ClickHouse 监控与更广泛的基础设施可观测性集成,而无需中断当前流程或投入大量的重新培训成本。
团队可以将现有的告警规则和升级流程应用于 ClickHouse 指标,同时在统一的可观测性平台内关联数据库性能与应用程序及基础设施的健康状况。这种方法可最大化当前监控设置的投资回报率,并通过整合的仪表板和熟悉的工具界面加快故障排查速度。

### Grafana Cloud 监控 {#grafana}

Grafana 通过直接插件集成和基于 Prometheus 的方法提供 ClickHouse 监控。Prometheus 端点集成在监控和生产工作负载之间保持操作隔离,同时支持在现有 Grafana Cloud 基础设施内进行可视化。配置指导请参阅 [Grafana 的 ClickHouse 文档](https://grafana.com/docs/grafana-cloud/monitor-infrastructure/integrations/integration-reference/integration-clickhouse/)。

### Datadog 监控 {#datadog}

Datadog 正在开发专用的 API 集成,该集成将提供完善的云服务监控,同时遵循服务空闲行为。在此期间,团队可以通过 ClickHouse Prometheus 端点使用 OpenMetrics 集成方法,以实现操作隔离和成本高效的监控。配置指导请参阅 [Datadog 的 Prometheus 和 OpenMetrics 集成文档](https://docs.datadoghq.com/integrations/openmetrics/)。

### ClickStack {#clickstack}

ClickStack 是 ClickHouse 推荐的可观测性解决方案,用于深度系统分析和调试,使用 ClickHouse 作为存储引擎提供日志、指标和追踪的统一平台。该方法依赖于 HyperDX(ClickStack 的用户界面),直接连接到您的 ClickHouse 实例内的系统表。
HyperDX 附带一个专注于 ClickHouse 的仪表板,包含 Selects、Inserts 和 Infrastructure 选项卡。团队还可以使用 Lucene 或 SQL 语法搜索系统表和日志,并通过 Chart Explorer 创建自定义可视化以进行详细的系统分析。
该方法非常适合调试复杂问题、性能分析和深度系统内省,而非实时生产告警。

:::note
请注意,由于 HyperDX 直接查询系统表,该方法会唤醒空闲服务。
:::
