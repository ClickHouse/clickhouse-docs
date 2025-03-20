---
slug: /integrations/prometheus
sidebar_label: Prometheus
title: Prometheus
description: 导出 ClickHouse 指标到 Prometheus
keywords: ['prometheus', 'grafana', 'monitoring', 'metrics', 'exporter']
---

import prometheus_grafana_metrics_endpoint from '@site/static/images/integrations/prometheus-grafana-metrics-endpoint.png';
import prometheus_grafana_dropdown from '@site/static/images/integrations/prometheus-grafana-dropdown.png';
import prometheus_grafana_chart from '@site/static/images/integrations/prometheus-grafana-chart.png';
import prometheus_grafana_alloy from '@site/static/images/integrations/prometheus-grafana-alloy.png';
import prometheus_grafana_metrics_explorer from '@site/static/images/integrations/prometheus-grafana-metrics-explorer.png';
import prometheus_datadog from '@site/static/images/integrations/prometheus-datadog.png';



# Prometheus 集成

该功能支持集成 [Prometheus](https://prometheus.io/) 来监控 ClickHouse Cloud 服务。通过 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 端点暴露 Prometheus 指标，允许用户安全地连接并将指标导出到他们的 Prometheus 指标收集器。这些指标可以与仪表板集成，例如 Grafana、Datadog 进行可视化。

要开始使用，请 [生成 API 密钥](/cloud/manage/openapi)。

## Prometheus 端点 API 以检索 ClickHouse Cloud 指标 {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### API 参考 {#api-reference}

| 方法   | 路径                                                                                                                    | 描述                                     |
| ------ | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | 返回特定服务的指标                       |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | 返回组织中的所有服务的指标               |

**请求参数**

| 名称             | 位置                 | 类型               |
| ---------------- | ------------------ |------------------ |
| Organization ID  | 端点地址           | uuid               |
| Service ID       | 端点地址           | uuid (可选)        |
| filtered_metrics | 查询参数           | boolean (可选)     |


### 认证 {#authentication}

使用你的 ClickHouse Cloud API 密钥进行基本认证：

```bash
Username: <KEY_ID>
Password: <KEY_SECRET>
示例请求
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>


# 对于 $ORG_ID 中的所有服务
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true


# 仅针对单个服务
export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true
```

### 示例响应 {#sample-response}

```response

# HELP ClickHouse_ServiceInfo 关于服务的信息，包括集群状态和 ClickHouse 版本

# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1


# HELP ClickHouseProfileEvents_Query 被解析并可能执行的查询数量。不包括未能解析或因 AST 大小限制、配额限制或同时运行的查询数量限制而被拒绝的查询。可能包括由 ClickHouse 本身发起的内部查询。不计入子查询。

# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6


# HELP ClickHouseProfileEvents_QueriesWithSubqueries 包含所有子查询的查询计数

# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230


# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries 包含所有子查询的 SELECT 查询计数

# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224


# HELP ClickHouseProfileEvents_FileOpen 打开的文件数量。

# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157


# HELP ClickHouseProfileEvents_Seek 调用 'lseek' 函数的次数。

# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840
```

### 指标标签 {#metric-labels}

所有指标都有以下标签：

| 标签                | 描述                       |
|---------------------|----------------------------|
| clickhouse_org      | 组织 ID                    |
| clickhouse_service   | 服务 ID                    |
| clickhouse_service_name | 服务名称                  |

### 信息指标 {#information-metrics}

ClickHouse Cloud 提供一个特殊指标 `ClickHouse_ServiceInfo`，这是一个 `gauge`，其值始终为 `1`。该指标包含所有 **指标标签** 以及以下标签：

| 标签                    | 描述                                                |
|------------------------|---------------------------------------------------|
| clickhouse_cluster_status | 服务状态，可以是以下之一：[`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`] |
| clickhouse_version     | 正在运行该服务的 ClickHouse 服务器的版本      |
| scrape                 | 表示最后一次抓取的状态，可以是 `full` 或 `partial` |
| full                   | 表示在最后一次抓取指标时没有错误发生           |
| partial                | 表示在最后一次抓取指标时发生了一些错误，仅返回 `ClickHouse_ServiceInfo` 指标。 |

检索指标的请求不会恢复处于休眠状态的服务。如果服务处于 `idle` 状态，则只会返回 `ClickHouse_ServiceInfo` 指标。

### 配置 Prometheus {#configuring-prometheus}

Prometheus 服务器在给定的间隔从配置的目标收集指标。以下是 Prometheus 服务器使用 ClickHouse Cloud Prometheus 端点的示例配置：

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
    - targets: ["localhost:9090"]
  - job_name: "clickhouse"
    static_configs:
      - targets: ["api.clickhouse.cloud"]
    scheme: https
    params:
      filtered_metrics: ["true"]
    metrics_path: "/v1/organizations/<ORG_ID>/prometheus"
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
    honor_labels: true
```

请注意，`honor_labels` 配置参数需要设置为 `true`，以便实例标签正确填充。此外，以上示例中的 `filtered_metrics` 设置为 `true`，但应根据用户偏好进行配置。

## 与 Grafana 集成 {#integrating-with-grafana}

用户有两种主要方式与 Grafana 集成：

- **指标端点** – 这种方法的优势在于不需要任何额外的组件或基础设施。该选项仅限于 Grafana Cloud，只需 ClickHouse Cloud Prometheus 端点 URL 和凭据即可。
- **Grafana Alloy** - Grafana Alloy 是 OpenTelemetry (OTel) Collector 的供应商中立分发，取代了 Grafana Agent。它可以用作抓取器，可以在自己的基础设施中部署，并与任何 Prometheus 端点兼容。

我们在下面提供有关使用这些选项的说明，重点是与 ClickHouse Cloud Prometheus 端点相关的细节。

### 使用指标端点与 Grafana Cloud 集成 {#grafana-cloud-with-metrics-endpoint}

- 登录你的 Grafana Cloud 账户
- 通过选择 **指标端点** 添加新连接
- 配置抓取 URL 指向 Prometheus 端点，并使用基本认证配置与 API 密钥/秘密的连接
- 测试连接以确保可以连接

<img src={prometheus_grafana_metrics_endpoint}
  class='image'
  alt='配置 Grafana 指标端点'
  style={{width: '600px'}} />

<br />

配置完成后，你应该会在下拉菜单中看到可以选择配置仪表板的指标：

<img src={prometheus_grafana_dropdown}
  class='image'
  alt='Grafana 指标浏览器下拉菜单'
  style={{width: '400px'}} />

<br />

<img src={prometheus_grafana_chart}
  class='image'
  alt='Grafana 指标浏览器图表'
  style={{width: '800px'}} />

### 使用 Alloy 与 Grafana Cloud 集成 {#grafana-cloud-with-alloy}

如果你正在使用 Grafana Cloud，可以通过导航到 Grafana 中的 Alloy 菜单并按照屏幕上的说明进行安装 Alloy：

<img src={prometheus_grafana_alloy}
  class='image'
  alt='Grafana Alloy'
  style={{width: '600px'}} />

<br />

这应配置 Alloy，带有 `prometheus.remote_write` 组件，将数据发送到具有身份验证令牌的 Grafana Cloud 端点。用户只需修改 Alloy 配置（在 Linux 中位于 `/etc/alloy/config.alloy`）以包括 ClickHouse Cloud Prometheus 端点的抓取器。

以下是使用 `prometheus.scrape` 组件为 ClickHouse Cloud 端点抓取指标的 Alloy 配置示例，以及自动配置的 `prometheus.remote_write` 组件。请注意，`basic_auth` 配置组件包含我们的 Cloud API 密钥 ID 和秘密，分别作为用户名和密码。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // 从默认监听地址收集指标。
  targets = [{
	__address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// e.g. https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
  }]

  honor_labels = true

  basic_auth {
  	username = "KEY_ID"
  	password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // 转发到下面的 metrics_service
}

prometheus.remote_write "metrics_service" {
  endpoint {
	url = "https://prometheus-prod-10-prod-us-central-0.grafana.net/api/prom/push"
	basic_auth {
  	  username = "<Grafana API username>"
  	  password = "<grafana API token>"
    }
  }
}
```

请注意，`honor_labels` 配置参数需要设置为 `true`，以便实例标签正确填充。

### 使用 Alloy 与 Grafana 自托管集成 {#grafana-self-managed-with-alloy}

Grafana 的自管理用户可以在这里找到安装 Alloy 代理的说明 [here](https://grafana.com/docs/alloy/latest/get-started/install/)。我们假设用户已配置 Alloy，将 Prometheus 指标发送到他们希望的目标。下面的 `prometheus.scrape` 组件会使 Alloy 抓取 ClickHouse Cloud 端点。我们假设 `prometheus.remote_write` 接收抓取的指标。如果不存在，请调整 `forward_to` 键以指向目标。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // 从默认监听地址收集指标。
  targets = [{
	__address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// e.g. https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
  }]

  honor_labels = true

  basic_auth {
  	username = "KEY_ID"
  	password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // 转发到 metrics_service。修改为你首选的接收者
}
```

配置完成后，你应该会在指标浏览器中看到与 ClickHouse 相关的指标：

<img src={prometheus_grafana_metrics_explorer}
  class='image'
  alt='Grafana 指标浏览器'
  style={{width: '800px'}} />

<br />

请注意，`honor_labels` 配置参数需要设置为 `true`，以便实例标签正确填充。

## 与 Datadog 集成 {#integrating-with-datadog}

你可以使用 Datadog [Agent](https://docs.datadoghq.com/agent/?tab=Linux) 和 [OpenMetrics 集成](https://docs.datadoghq.com/integrations/openmetrics/) 从 ClickHouse Cloud 端点收集指标。以下是该代理和集成的简单示例配置。请注意，你可能只想选择你最关心的指标。下面这个包罗万象的示例将导出成千上万的指标实例组合，Datadog 将把它们视为自定义指标。

```yaml
init_config:

instances:
   - openmetrics_endpoint: 'https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true'
     namespace: 'clickhouse'
     metrics:
         - '^ClickHouse.*'
     username: username
     password: password
```

<br />

<img src={prometheus_datadog}
  class='image'
  alt='Prometheus Datadog 集成'
  style={{width: '600px'}} />

