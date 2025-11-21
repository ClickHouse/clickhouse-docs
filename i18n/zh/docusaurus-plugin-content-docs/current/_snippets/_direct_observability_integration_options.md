import Image from "@theme/IdealImage"
import AdvancedDashboard from "@site/static/images/cloud/manage/monitoring/advanced_dashboard.png"
import NativeAdvancedDashboard from "@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png"

### 直接集成 Grafana 插件 {#direct-grafana}

ClickHouse 的 Grafana 数据源插件支持通过系统表直接从 ClickHouse 可视化和探索数据。此方法非常适合性能监控以及创建用于详细系统分析的自定义仪表板。
有关插件安装和配置的详细信息,请参阅 ClickHouse [数据源插件](/integrations/grafana)。有关使用 Prometheus-Grafana 混合组件(包含预构建仪表板和告警规则)进行完整监控设置的信息,请参阅[使用新的 Prometheus-Grafana 混合组件监控 ClickHouse](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in)。

### 直接集成 Datadog {#direct-datadog}

Datadog 为其代理提供了 ClickHouse 监控插件,该插件直接查询系统表。此集成通过 clusterAllReplicas 功能提供具有集群感知能力的全面数据库监控。
:::note
不建议在 ClickHouse Cloud 部署中使用此集成,因为它与成本优化的空闲行为不兼容,并且存在云代理层的操作限制。
:::

### 直接使用系统表 {#system-tables}

用户可以通过连接到 ClickHouse 系统表(特别是 `system.query_log`)并直接查询来执行深入的查询性能分析。使用 SQL 控制台或 ClickHouse 客户端,团队可以识别慢查询、分析资源使用情况并跟踪整个组织的使用模式。

**查询性能分析**

用户可以使用系统表查询日志来执行查询性能分析。

**示例查询**:查找所有集群副本中运行时间最长的前 5 个查询:

```sql
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM clusterAllReplicas(default, system.query_log)
WHERE event_time >= (now() - toIntervalMinute(60)) AND type='QueryFinish'
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL
```
