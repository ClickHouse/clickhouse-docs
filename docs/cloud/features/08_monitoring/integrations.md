---
title: 'Community and partner integrations'
slug: /cloud/monitoring/integrations
description: 'Third-party monitoring integrations and the Billing & Usage API for ClickHouse Cloud'
keywords: ['cloud', 'monitoring', 'datadog', 'grafana', 'community', 'billing', 'usage api']
sidebar_label: 'Integrations'
sidebar_position: 6
doc_type: 'guide'
---

import CommunityMonitoring from '@site/docs/_snippets/_community_monitoring.md';
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

## Direct Datadog integration {#direct-datadog}

Datadog offers a ClickHouse Monitoring plugin for its agent which queries system tables directly. This integration provides comprehensive database monitoring with cluster awareness through `clusterAllReplicas` functionality.

:::warning[Not recommended for ClickHouse Cloud]
The direct Datadog agent integration that queries system tables isn't recommended for ClickHouse Cloud deployments due to incompatibility with cost-optimizing idle behavior and operational limitations of the cloud proxy layer.
:::

Instead, use the Datadog [Agent](https://docs.datadoghq.com/agent/?tab=Linux) and [OpenMetrics integration](https://docs.datadoghq.com/integrations/openmetrics/) to collect metrics from the ClickHouse Cloud Prometheus endpoint. This approach respects service idling behavior and maintains operational separation between monitoring and production workloads. For configuration guidance, see [Datadog's Prometheus and OpenMetrics integration documentation](https://docs.datadoghq.com/integrations/openmetrics/).

For Prometheus endpoint setup details, see the [Prometheus integration page](/integrations/prometheus#integrating-with-datadog).

ClickHouse has multiple ways of integrating with Datadog, suited to different deployment modes. Each has its own tradeoffs, and some are owned by ClickHouse while others are owned by Datadog. Integrations are listed in recommended order.

| Integration | Docs | Deployment | Signals |
|---|---|---|---|
| [ClickHouse Cloud Datadog API integration](#clickhouse-cloud-datadog-api-integration) *(recommended)* | [docs.datadoghq.com](https://docs.datadoghq.com/integrations/clickhouse-cloud/) | Cloud | Metrics |
| [ClickHouse Cloud Prometheus integration](#clickhouse-cloud-prometheus-integration) | [clickhouse.com/docs](https://clickhouse.com/docs/integrations/prometheus) | Cloud | Metrics |
| [ClickHouse Datadog Agent integration](#clickhouse-datadog-agent-integration) | [docs.datadoghq.com](https://docs.datadoghq.com/integrations/clickhouse/?tab=host) | OSS / Cloud | Logs, Metrics |
| [ClickHouse Datadog DBM](#clickhouse-datadog-dbm) | [datadoghq.com](https://www.datadoghq.com/product-preview/database-monitoring-for-clickhouse/) | OSS / Cloud | Logs, Metrics, Query Insights |

### ClickHouse Cloud Datadog API integration {#clickhouse-cloud-datadog-api-integration}

<PrivatePreviewBadge/>

The recommended way to serve service-level metrics from ClickHouse Cloud in Datadog.

The customer provides a Datadog API key, and Datadog periodically polls the ClickHouse Cloud API to collect metrics using a push-based method authenticated via an OAuth handshake.

- **Cloud only** — not suitable for OSS ClickHouse
- Metrics are **not** treated as custom metrics by Datadog
- Does **not** prevent the service from idling
- Ships with a pre-configured set of dashboards and monitors
For onboarding steps, see [ClickHouse Cloud & Datadog - Integration](#).

### ClickHouse Cloud Prometheus integration {#clickhouse-cloud-prometheus-integration}

The most common and universal way to collect service-level and org-level telemetry from ClickHouse Cloud.

The customer configures the Datadog Agent with the [OpenMetrics integration](https://docs.datadoghq.com/integrations/openmetrics/) to periodically poll the ClickHouse Cloud API and collect metrics. See the [Prometheus integration page](/integrations/prometheus#integrating-with-datadog) for configuration details.

- **Cloud only** — not suitable for OSS ClickHouse
- Metrics are treated as **custom metrics** by Datadog
- Does **not** prevent the service from going idle

### ClickHouse Datadog Agent integration {#clickhouse-datadog-agent-integration}

The most common way to get data from on-premises ClickHouse services into Datadog. It also works with ClickHouse Cloud, with some caveats.

The Datadog Agent periodically polls the ClickHouse instance and collects metrics and logs. This integration ships with a pre-configured set of dashboards.

**OSS ClickHouse:** logs and metrics fully supported.

**ClickHouse Cloud (partial support):**
- Metrics only — logs are not supported
- Requires `datadog-cluster-agent` instead of `datadog-agent`
- **Will prevent the service from going idle**

### ClickHouse Datadog DBM {#clickhouse-datadog-dbm}

Database Monitoring (DBM) for ClickHouse is developed and maintained  by Datadog. It works by configuring the Datadog Agent to collect system tables data from the ClickHouse instance, providing query-level performance insights similar to what the ClickHouse Cloud Console provides natively. ClickHouse has no involvement in this integration — issues should be directed to Datadog or resolved by the customer.

- Metrics are free; the customer pays extra for logs and system tables data ingestion
- **OSS ClickHouse:** fully supported
- **ClickHouse Cloud (partial support):** requires `datadog-cluster-agent` instead of `datadog-agent`; **will prevent the service from going idle**

<CommunityMonitoring/>

## Billing and Usage API {#billing-usage-api}

The Billing & Usage API can be used to programmatically access your Cloud organization's billing and usage records. This is useful for building custom cost monitoring dashboards or integrating billing data into existing financial reporting workflows.

For full API reference, see the [Billing API documentation](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Billing).
