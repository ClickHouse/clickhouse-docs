---
title: '社区与合作伙伴集成'
slug: /cloud/monitoring/integrations
description: '用于 ClickHouse Cloud 的第三方监控集成和计费和用量 API'
keywords: ['cloud', 'monitoring', 'datadog', 'grafana', 'community', 'billing', 'usage api']
sidebar_label: '集成'
sidebar_position: 6
doc_type: 'guide'
---

import CommunityMonitoring from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_community_monitoring.md';

# 社区与合作伙伴集成 \{#community-and-partner-integrations\}

## Datadog 直接集成 \{#direct-datadog\}

Datadog 为其 agent 提供了一个 ClickHouse Monitoring 插件，可直接查询系统表。该集成通过 `clusterAllReplicas` 功能提供具备集群感知能力的全面数据库监控。

:::warning[不推荐用于 ClickHouse Cloud]
由于与成本优化的空闲行为以及云代理层的运行限制不兼容，因此不建议在 ClickHouse Cloud 部署中使用直接查询系统表的 Datadog agent 集成。
:::

请改用 Datadog 的 [Agent](https://docs.datadoghq.com/agent/?tab=Linux) 和 [OpenMetrics 集成](https://docs.datadoghq.com/integrations/openmetrics/)，从 ClickHouse Cloud Prometheus 端点收集指标。这种方式既能遵循服务空闲行为，又能保持监控与生产工作负载之间的运行隔离。有关配置指导，请参阅 [Datadog 的 Prometheus 和 OpenMetrics 集成文档](https://docs.datadoghq.com/integrations/openmetrics/)。

有关 Prometheus 端点配置的详细信息，请参阅 [Prometheus 集成页面](/integrations/prometheus#integrating-with-datadog)。

<CommunityMonitoring />

## 计费和用量 API \{#billing-usage-api\}

计费和用量 API 可用于以编程方式访问您的 Cloud 组织的计费和用量记录。这对于构建自定义成本监控仪表板，或将计费数据集成到现有财务报告工作流中非常有用。

有关完整的 API 参考，请参阅 [Billing API 文档](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Billing)。