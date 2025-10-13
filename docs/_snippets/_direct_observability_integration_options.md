import Image from '@theme/IdealImage';
import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';

### Direct Grafana plugin integration {#direct-grafana}

The ClickHouse data source plugin for Grafana enables visualization and exploration of data directly from ClickHouse using system tables. This approach works well for monitoring performance and creating custom dashboards for detailed system analysis.
For plugin installation and configuration details, see the ClickHouse [data source plugin](/integrations/grafana). For a complete monitoring setup using the Prometheus-Grafana mix-in with pre-built dashboards and alerting rules, see [Monitor ClickHouse with the new Prometheus-Grafana mix-in](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in).

### Direct Datadog Integration {#direct-datadog}

Datadog offers a Clickhouse Monitoring plugin for its agent which queries system tables directly. This integration provides comprehensive database monitoring with cluster awareness through clusterAllReplicas functionality. 
:::note
This integration is not recommended for ClickHouse Cloud deployments due to incompatibility with cost-optimizing idle behavior and operational limitations of the cloud proxy layer.
:::

### Using system tables directly {#system-tables}

Users can perform deep query performance analysis by connecting to ClickHouse system tables, particularly `system.query_log` and querying directly. Using either the SQL console or clickhouse client, teams can identify slow queries, analyze resource usage, and track usage patterns across the organization.

**Query Performance Analysis**

Users can use the system table query logs to perform Query Performance Analysis.

**Example query**: Find the top 5 long-running queries across all cluster replicas:

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