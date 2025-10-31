---
slug: /use-cases/observability/cloud-monitoring
title: 'ClickHouse Cloud monitoring'
sidebar_label: 'ClickHouse Cloud monitoring'
description: 'ClickHouse Cloud Monitoring Guide'
doc_type: 'guide'
keywords: ['observability', 'monitoring', 'cloud', 'metrics', 'system health']
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import Image from '@theme/IdealImage';
import ObservabilityIntegrations from '@site/docs/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/docs/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/docs/_snippets/_community_monitoring.md';

# ClickHouse Cloud monitoring {#cloud-monitoring}

This guide provides enterprise teams evaluating ClickHouse Cloud with comprehensive information on monitoring and observability capabilities for production deployments. Enterprise customers frequently ask about out-of-the-box monitoring features, integration with existing observability stacks including tools like Datadog and AWS CloudWatch, and how ClickHouse’s monitoring compares to self-hosted deployments.

## Advanced observability dashboard {#advanced-observability}

ClickHouse Cloud provides comprehensive monitoring through built-in dashboard interfaces accessible via the Monitoring section. These dashboards visualize system and performance metrics in real-time without requiring additional setup and serve as the primary tools for real-time production monitoring within ClickHouse Cloud.

- **Advanced Dashboard**: The main dashboard interface accessible via Monitoring → Advanced dashboard provides real-time visibility into query rates, resource usage, system health, and storage performance. This dashboard doesn't require separate authentication, won't prevent instances from idling, and doesn't add query load to your production system. Each visualization is powered by customizable SQL queries, with out-of-the-box charts grouped into ClickHouse-specific, system health, and Cloud-specific metrics. Users can extend monitoring by creating custom queries directly in the SQL console.

:::note
Accessing these metrics does not issue a query to the underlying service and will not wake idle services. 
:::

<Image img={AdvancedDashboard} size="lg" alt="Advanced dashboard"/>

Users looking to extend these visualizations can use the dashboards feature in ClickHouse Cloud, querying system tables directly.

- **Native advanced dashboard**: An alternative dashboard interface accessible through "You can still access the native advanced dashboard" within the Monitoring section. This opens in a separate tab with authentication and provides an alternative UI for system and service health monitoring. This dashboard allows advanced analytics, where users can modify the underlying SQL queries.

<Image img={NativeAdvancedDashboard} size="lg" alt="Advanced dashboard"/>

Both dashboards offer immediate visibility into service health and performance without external dependencies, distinguishing them from external debugging-focused tools like ClickStack.

For detailed dashboard features and available metrics, see the [advanced dashboard documentation](/cloud/manage/monitor/advanced-dashboard).

## Query insights and resource monitoring {#query-insights}

ClickHouse Cloud includes additional monitoring capabilities:

- Query Insights: Built-in interface for query performance analysis and troubleshooting
- Resource Utilization Dashboard: Tracks memory, CPU allocation, and data transfer patterns. CPU usage and memory usage graphs show the maximum utilization metric in a particular time period. The CPU usage graph shows a system-level CPU utilization metric (NOT a ClickHouse CPU utilization metric). 

See the [query insights](/cloud/get-started/query-insights) and [resource utilization](/operations/monitoring#resource-utilization) documentation for detailed features.

## Prometheus-compatible metrics endpoint {#prometheus}

ClickHouse Cloud provides a Prometheus endpoint. This allows users to maintain current workflows, leverage existing team expertise, and integrate ClickHouse metrics into enterprise monitoring platforms including Grafana, Datadog, and other Prometheus-compatible tools. 

The organization-level endpoint federates metrics from all services, while per-service endpoints provide granular monitoring. Key features include:
- Filtered metrics option: The optional filtered_metrics=true parameter reduces payload from 1000+ available metrics to 125 'mission critical' metrics for cost optimization and easier monitoring focus
- Cached metric delivery: Uses materialized views refreshed every minute to minimize query load on production systems

:::note
This approach respects service idling behavior, allowing for cost optimization when services are not actively processing queries. This API endpoint relies on ClickHouse Cloud API credentials. For complete endpoint configuration details, see the cloud [Prometheus documentation](/integrations/prometheus).
:::

<ObservabilityIntegrations/>

### ClickStack deployment options {#clickstack-deployment}

- **HyperDX in Clickhouse Cloud**  (private preview): HyperDX can be launched on any Clickhouse Cloud service.
- [Helm](/use-cases/observability/clickstack/deployment/helm): Recommended for Kubernetes-based debugging environments. Supports integration with ClickHouse Cloud and allows for environment-specific configuration, resource limits, and scaling via `values.yaml`.
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose): Deploys each component (ClickHouse, HyperDX, OTel collector, MongoDB) individually. Users can modify the compose file to remove any unused components when integrating with ClickHouse Cloud, specifically ClickHouse and the Open Telemetry Collector.
- [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only): Standalone HyperDX container.

For complete deployment options and architecture details, see the [ClickStack documentation](/use-cases/observability/clickstack/overview) and [data ingestion guide](/use-cases/observability/clickstack/ingesting-data/overview).

:::note
Users can also collect metrics from the ClickHouse Cloud Prometheus endpoint via an OpenTelemetry Collector and forward them to a separate ClickStack deployment for visualization.
:::

<DirectIntegrations/>

<CommunityMonitoring/>

## System impact considerations {#system-impact}

All of the above approaches use a mixture of either relying on Prometheus endpoints, being managed by ClickHouse Cloud, or querying of system tables directly.
The latter of these options relies on querying the production ClickHouse service. This adds query load to the system under observation and prevents ClickHouse Cloud instances from idling, impacting cost optimization. Additionally, if the production system fails, monitoring may also be affected, since the two are coupled. This approach works well for deep introspection and debugging but is less appropriate for real-time production monitoring. Consider these trade-offs between detailed system analysis capabilities and operational overhead when evaluating direct Grafana integration versus the external tool integration approaches discussed in the following section.
