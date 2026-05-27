---
slug: /cloud/managed-postgres/monitoring/prometheus
sidebar_label: 'Prometheus 端点'
title: 'Managed Postgres Prometheus 集成'
description: '将 Managed Postgres 的指标抓取到 Prometheus、Grafana、Datadog 或任何兼容 OpenMetrics 的收集器中'
keywords: ['managed postgres', 'prometheus', 'grafana', 'datadog', 'metrics', 'openmetrics', '可观测性']
doc_type: 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import grafanaDashboard from '@site/static/images/managed-postgres/monitoring/grafana-dashboard.png';

<BetaBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} galaxyEvent="docs.managed-postgres.monitoring-prometheus-beta" />

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

此配置每 60 秒抓取一次组织级端点：

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
    scrape_interval: 60s
```

该端点每分钟刷新一次指标。抓取频率快于
`60s` 会导致样本重复，并在 Gauge
面板上产生阶梯状模式。

将 `honor_labels: true` 设为启用，这样来自端点的 `postgres_service` 和
`postgres_service_name` 标签将被保留，而不会
被 Prometheus 覆盖。

要抓取单个服务，请在 `metrics_path` 后追加 `/<PG_ID>`。

## 预置 Grafana 仪表板 \{#grafana-dashboard\}

一个现成的 Grafana 仪表板可将该端点暴露的所有指标可视化——包括可排序的服务列表、CPU 和内存利用率、带阈值告警的磁盘使用情况、按状态划分的连接、事务和回滚比率、Tuple 活动、I/O、各数据库的存储使用情况以及死锁。

<Image img={grafanaDashboard} alt="Managed Postgres 服务的 Grafana 仪表板" size="md" border />

### 导入仪表板 \{#import-dashboard\}

<VerticalStepper headerLevel="h4">
  #### 下载仪表板 JSON \{#download\}

  <TrackedLink href={useBaseUrl('/examples/managed-postgres-grafana-dashboard.json')} download="managed-postgres-grafana-dashboard.json" eventName="docs.managed_postgres_grafana_dashboard.download">下载仪表板 JSON</TrackedLink>。

  #### 在 Grafana 中打开导入界面 \{#open-import\}

  前往 **Dashboards → New → Import**。上传 JSON 文件或粘贴其内容。

  #### 选择 Prometheus 数据源 \{#pick-datasource\}

  系统提示输入 `DS_PROMETHEUS` 时，选择抓取了[上一节](#configuring-prometheus)中所配置端点的 Prometheus 数据源。
</VerticalStepper>

对于通过预配方式管理的 Grafana 部署，将该 JSON 放入你的
仪表板预配路径中。Grafana 会将 `${DS_PROMETHEUS}`
引用匹配到实例中可用的 Prometheus 数据源。

### 模板变量 \{#template-variables\}

该仪表板提供了三个变量：

* **数据源** — 为该仪表板提供数据支持的 Prometheus 数据源。
* **服务** — 基于 `postgres_service_name` 的多选过滤器。
  默认为 *全部*；选择一个或多个服务，将每个面板限定到所选服务。
* **抓取间隔** — 隐藏常量，默认为 `60s`。它会影响
  Grafana 的 `$__rate_interval` 计算。如果你的抓取间隔不同，
  请在 JSON 中修改此值。

### 筛选到单个服务后进行下钻分析 \{#drill-in\}

通过 **Service** 变量将范围筛选到单个
服务后，多个面板都可用于下钻分析。例如，“按模式划分的 CPU”面板会堆叠显示 `user`、`system`、`iowait`、`steal` 以及其他 CPU
模式，这样你就可以判断某次峰值究竟是由应用程序代码、内核
工作、磁盘等待，还是虚拟机管理程序争用引起的。

## 与 Grafana 和 Datadog 集成 \{#third-party-integrations\}

该端点与 [ClickHouse Prometheus
端点](/integrations/prometheus) 采用相同的形态，因此，其中介绍的 Grafana Cloud、Grafana
Alloy 和 Datadog OpenMetrics agent 配置
同样适用于此处。将 `metrics_path` 指向 Managed Postgres 的组织或
实例路径，而不是 ClickHouse 的路径。

[cloud-api]: /cloud/manage/cloud-api "Cloud API"

[API keys]: /cloud/manage/openapi "管理 API 密钥"