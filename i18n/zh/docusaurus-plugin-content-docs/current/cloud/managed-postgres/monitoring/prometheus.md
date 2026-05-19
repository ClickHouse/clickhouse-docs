---
slug: /cloud/managed-postgres/monitoring/prometheus
sidebar_label: 'Prometheus 端点'
title: 'Managed Postgres Prometheus 端点'
description: '将 Managed Postgres 指标采集到 Prometheus、Grafana、Datadog 或任何兼容 OpenMetrics 的采集器中'
keywords: ['managed postgres', 'prometheus', 'grafana', 'datadog', '指标', 'openmetrics', '可观测性']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# Prometheus 集成 \{#prometheus-integration\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="monitoring-prometheus" />

Managed Postgres 提供两个与 Prometheus 兼容的指标端点，
可通过 [ClickHouse Cloud API][cloud-api] 访问：

| 端点       | 路径                                                     | 返回值                          |
| -------- | ------------------------------------------------------ | ---------------------------- |
| Org      | `/v1/organizations/{orgId}/postgres/prometheus`        | 组织内所有 Managed Postgres 服务的指标 |
| Instance | `/v1/organizations/{orgId}/postgres/{pgId}/prometheus` | 单个服务的指标                      |

:::note
组织级端点最多返回 100 个服务的指标。如果您的
组织拥有超过 100 个 Managed Postgres 服务，请[联系
支持团队](https://clickhouse.com/support/program)。
:::

## 身份验证 \{#authentication\}

该端点使用与 OpenAPI 其余部分相同的 [API 密钥]；有关如何创建这些密钥，
以及如何查找你的组织 ID 和服务 ID，请参阅
[OpenAPI 指南](/cloud/managed-postgres/openapi)。

```bash
KEY_ID=mykeyid
KEY_SECRET=mykeysecret
ORG_ID=myorgid
PG_ID=mypgid
```

## 抓取组织内的所有服务 \{#scrape-org\}

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/prometheus"
```

## 抓取单个服务 \{#scrape-instance\}

```bash
curl -s --user "$KEY_ID:$KEY_SECRET" \
    "https://api.clickhouse.cloud/v1/organizations/$ORG_ID/postgres/$PG_ID/prometheus"
```

## 响应示例 \{#sample-response\}

```response
# HELP PostgresServiceInfo Information about PostgreSQL service, including status and version.
# TYPE PostgresServiceInfo gauge
PostgresServiceInfo{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres",postgres_status="running",postgres_version="18"} 1

# HELP PostgresServer_ActiveConnections Number of active connections by state.
# TYPE PostgresServer_ActiveConnections gauge
PostgresServer_ActiveConnections{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres",state="active"} 1
PostgresServer_ActiveConnections{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres",state="idle"} 4

# HELP PostgresServer_CacheHitRatio Buffer cache hit ratio: blocks served from cache vs. total blocks accessed (%).
# TYPE PostgresServer_CacheHitRatio gauge
PostgresServer_CacheHitRatio{clickhouse_org="ca04a310-730d-4ce0-93dd-39f2cd2d5e6f",postgres_service="0c330583-6396-86d0-82cd-ed0f23b0d38c",postgres_service_name="my-postgres"} 100
```

有关所有指标及其含义的完整列表，请参阅
[指标参考](/cloud/managed-postgres/monitoring/metrics)。

## 配置 Prometheus \{#configuring-prometheus\}

此配置每 30 秒抓取一次组织级端点：

```yaml
scrape_configs:
  - job_name: "managed-postgres"
    scheme: https
    metrics_path: "/v1/organizations/<ORG_ID>/postgres/prometheus"
    static_configs:
      - targets: ["api.clickhouse.cloud"]
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
    honor_labels: true
    scrape_interval: 30s
```

将 `honor_labels: true` 设为启用，这样来自端点的 `postgres_service` 和
`postgres_service_name` 标签将被保留，而不会
被 Prometheus 覆盖。

要抓取单个服务，请在 `metrics_path` 后追加 `/<PG_ID>`。

## 与 Grafana 和 Datadog 集成 \{#third-party-integrations\}

该端点与 [ClickHouse Prometheus
端点](/integrations/prometheus) 采用相同的形态，因此，其中介绍的 Grafana Cloud、Grafana
Alloy 和 Datadog OpenMetrics agent 配置
同样适用于此处。将 `metrics_path` 指向 Managed Postgres 的组织或
实例路径，而不是 ClickHouse 的路径。

[cloud-api]: /cloud/manage/cloud-api "Cloud API"

[API keys]: /cloud/manage/openapi "管理 API 密钥"