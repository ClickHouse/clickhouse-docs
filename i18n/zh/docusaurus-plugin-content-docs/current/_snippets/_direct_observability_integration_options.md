import Image from '@theme/IdealImage';
import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';

### 直接集成 Grafana 插件

Grafana 中的 ClickHouse 数据源插件可以利用系统表直接从 ClickHouse 可视化和探索数据。此方式非常适合用于监控性能，以及为深入的系统分析创建自定义仪表板。
有关插件安装和配置的详细信息，请参阅 ClickHouse 的 [data source plugin](/integrations/grafana)。若要使用带有预构建仪表板和告警规则的 Prometheus-Grafana mix-in 搭建完整的监控方案，请参阅 [Monitor ClickHouse with the new Prometheus-Grafana mix-in](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in)。

### 直接集成 Datadog

Datadog 为其 agent 提供了 ClickHouse 监控插件，该插件会直接查询系统表。此集成通过 `clusterAllReplicas` 功能提供具备集群感知能力的全面数据库监控。
:::note
由于与用于节省成本的空闲优化行为不兼容，并且受到云代理层运行限制，不建议在 ClickHouse Cloud 部署中使用此集成。
:::

### 直接使用系统表

用户可以通过连接 ClickHouse 系统表（尤其是 `system.query_log`）并直接进行查询来执行深入的查询性能分析。使用 SQL 控制台或 `clickhouse` 客户端，团队可以识别慢查询、分析资源使用情况，并在整个组织范围内跟踪使用模式。

**查询性能分析**

用户可以使用系统表中的查询日志执行查询性能分析。

**示例查询**：查找整个集群中所有副本里运行时间最长的前 5 个查询：

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
