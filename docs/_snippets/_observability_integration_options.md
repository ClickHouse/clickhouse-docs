import Image from '@theme/IdealImage';
import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';

## Integration examples {#examples}

External integration allows organizations to maintain established monitoring workflows, leverage existing team expertise with familiar tools, and integrate ClickHouse monitoring with broader infrastructure observability without disrupting current processes or requiring significant retraining investments.
Teams can apply existing alerting rules and escalation procedures to ClickHouse metrics, while correlating database performance with application and infrastructure health within a unified observability platform. This approach maximizes ROI on current monitoring setups and enables faster troubleshooting through consolidated dashboards and familiar tooling interfaces.

### Grafana Cloud monitoring {#grafana}

Grafana provides ClickHouse monitoring through both direct plugin integration and Prometheus-based approaches. The Prometheus endpoint integration maintains operational separation between monitoring and production workloads while enabling visualization within existing Grafana Cloud infrastructure. See [Grafana's ClickHouse documentation](https://grafana.com/docs/grafana-cloud/monitor-infrastructure/integrations/integration-reference/integration-clickhouse/) for configuration guidance.

### Datadog monitoring {#datadog}
Datadog is developing a dedicated API integration that will provide proper cloud service monitoring while respecting service idling behavior. In the interim, teams can use the OpenMetrics integration approach via ClickHouse Prometheus endpoints for operational separation and cost-efficient monitoring. For configuration guidance, see [Datadog's Prometheus and OpenMetrics integration documentation](https://docs.datadoghq.com/integrations/openmetrics/).

### ClickStack {#clickstack}

ClickStack is ClickHouse's recommended observability solution for deep system analysis and debugging, providing a unified platform for logs, metrics, and traces using ClickHouse as the storage engine. This approach relies on HyperDX, the ClickStack UI, connecting directly to the system tables inside your ClickHouse instance.
HyperDX ships with a ClickHouse focused dashboard with tabs for Selects, Inserts, and Infrastructure. Teams can also use Lucene or SQL syntax to search system tables and logs, as well as create custom visualizations via Chart Explorer for detailed system analysis. 
This approach is ideal for debugging complex issues, performance analysis, and deep system introspection rather than real-time production alerting.

:::note
Note that this approach will wake idle services as HyperDX queries the system tables directly.
:::