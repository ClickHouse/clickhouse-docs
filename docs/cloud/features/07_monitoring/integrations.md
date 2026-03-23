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

# Community and partner integrations

## Direct Datadog integration {#direct-datadog}

Datadog offers a ClickHouse Monitoring plugin for its agent which queries system tables directly. This integration provides comprehensive database monitoring with cluster awareness through `clusterAllReplicas` functionality.

:::warning[Not recommended for ClickHouse Cloud]
The direct Datadog agent integration that queries system tables isn't recommended for ClickHouse Cloud deployments due to incompatibility with cost-optimizing idle behavior and operational limitations of the cloud proxy layer.
:::

Instead, use the Datadog [Agent](https://docs.datadoghq.com/agent/?tab=Linux) and [OpenMetrics integration](https://docs.datadoghq.com/integrations/openmetrics/) to collect metrics from the ClickHouse Cloud Prometheus endpoint. This approach respects service idling behavior and maintains operational separation between monitoring and production workloads. For configuration guidance, see [Datadog's Prometheus and OpenMetrics integration documentation](https://docs.datadoghq.com/integrations/openmetrics/).

For Prometheus endpoint setup details, see the [Prometheus integration page](/integrations/prometheus#integrating-with-datadog).

<CommunityMonitoring/>

## Billing and Usage API {#billing-usage-api}

The Billing & Usage API can be used to programmatically access your Cloud organization's billing and usage records. This is useful for building custom cost monitoring dashboards or integrating billing data into existing financial reporting workflows.

For full API reference, see the [Billing API documentation](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Billing).
