---
slug: /integrations/prometheus
sidebar_label: 'Prometheus'
title: 'Prometheus'
description: '将 ClickHouse 指标导出到 Prometheus'
keywords: ['prometheus', 'grafana', '监控', '指标', '导出器']
doc_type: 'reference'
---

import prometheus_grafana_metrics_endpoint from '@site/static/images/integrations/prometheus-grafana-metrics-endpoint.png';
import prometheus_grafana_dropdown from '@site/static/images/integrations/prometheus-grafana-dropdown.png';
import prometheus_grafana_chart from '@site/static/images/integrations/prometheus-grafana-chart.png';
import prometheus_grafana_alloy from '@site/static/images/integrations/prometheus-grafana-alloy.png';
import prometheus_grafana_metrics_explorer from '@site/static/images/integrations/prometheus-grafana-metrics-explorer.png';
import prometheus_datadog from '@site/static/images/integrations/prometheus-datadog.png';
import Image from '@theme/IdealImage';


# Prometheus 集成

该功能支持集成 [Prometheus](https://prometheus.io/) 来监控 ClickHouse Cloud 服务。Prometheus 指标通过 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 端点对外提供访问，用户可以安全连接并将指标导出到 Prometheus 指标采集器中。这些指标可以与仪表盘（例如 Grafana、Datadog）集成，用于可视化。

要开始使用，请先[生成一个 API 密钥](/cloud/manage/openapi)。

## 用于获取 ClickHouse Cloud 指标的 Prometheus 端点 API {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### API 参考 {#api-reference}

| Method | Path                                                                                                               | Description                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | 返回指定服务的指标数据 |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | 返回某个组织下所有服务的指标数据 |

**请求参数**

| Name             | Location      | Type               |
| ---------------- | ------------- |------------------ |
| Organization ID  | 端点地址       | uuid               |
| Service ID       | 端点地址       | uuid（可选）        |
| filtered_metrics | 查询参数       | boolean（可选）     |

### 身份验证

使用 ClickHouse Cloud API 密钥进行基本身份验证：

```bash
用户名：<KEY_ID>
密码：<KEY_SECRET>
请求示例
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>

# 针对 $ORG_ID 中的所有服务
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true

# 仅针对单个服务
export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true
```


### 示例响应 {#sample-response}

```response
# HELP ClickHouse_ServiceInfo 服务信息,包括集群状态和 ClickHouse 版本
# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1

# HELP ClickHouseProfileEvents_Query 待解释并可能执行的查询数量。不包括解析失败的查询,或因 AST 大小限制、配额限制或并发查询数量限制而被拒绝的查询。可能包括 ClickHouse 自身发起的内部查询。不计入子查询。
# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6

# HELP ClickHouseProfileEvents_QueriesWithSubqueries 包含所有子查询的查询计数
# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230

# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries 包含所有子查询的 SELECT 查询计数
# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224

# HELP ClickHouseProfileEvents_FileOpen 已打开的文件数量。
# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157

# HELP ClickHouseProfileEvents_Seek 'lseek' 函数的调用次数。
# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840

# HELP ClickPipes_Info 始终等于 1。标签 "clickpipe_state" 包含管道的当前状态:Stopped/Provisioning/Running/Paused/Failed
# TYPE ClickPipes_Info gauge
ClickPipes_Info{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent",clickpipe_status="Running"} 1

# HELP ClickPipes_SentEvents_Total 发送至 ClickHouse 的记录总数
# TYPE ClickPipes_SentEvents_Total counter
ClickPipes_SentEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5534250

# HELP ClickPipes_SentBytesCompressed_Total 发送至 ClickHouse 的压缩字节总数。
# TYPE ClickPipes_SentBytesCompressed_Total counter
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name
="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 380837520
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name

# HELP ClickPipes_FetchedBytes_Total 从源获取的未压缩字节总数。
# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202

# HELP ClickPipes_Errors_Total 数据摄取错误总数。
# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 0

# HELP ClickPipes_SentBytes_Total 发送至 ClickHouse 的未压缩字节总数。
# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 477187967

# HELP ClickPipes_FetchedBytesCompressed_Total 从源获取的压缩字节总数。如果源数据未压缩,则此值等于 ClickPipes_FetchedBytes_Total
# TYPE ClickPipes_FetchedBytesCompressed_Total counter
ClickPipes_FetchedBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202

# HELP ClickPipes_FetchedEvents_Total 从数据源获取的记录总数。
# TYPE ClickPipes_FetchedEvents_Total counter
ClickPipes_FetchedEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes 演示实例",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent 演示管道",clickpipe_source="confluent"} 5535376
```

### 指标标签 {#metric-labels}

所有指标都包含以下标签：

| 标签 | 说明 |
| --- | --- |
| clickhouse_org | 组织 ID |
| clickhouse_service | 服务 ID |
| clickhouse_service_name | 服务名称 |

对于 ClickPipes，指标还将包含以下标签：

| 标签 | 说明 |
| --- | --- |
| clickpipe_id | ClickPipe ID |
| clickpipe_name | ClickPipe 名称 |
| clickpipe_source | ClickPipe 源类型 |

### 信息指标 {#information-metrics}

ClickHouse Cloud 提供了一个特殊指标 `ClickHouse_ServiceInfo`，这是一个始终为 `1` 的 `gauge` 类型指标。该指标包含所有 **Metric Labels**，以及以下标签：

|Label|Description|
|---|---|
|clickhouse_cluster_status|服务的状态。可能是以下之一：[`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`]|
|clickhouse_version|服务正在运行的 ClickHouse 服务器版本|
|scrape|表示上次抓取的状态。可能是 `full` 或 `partial`|
|full|表示在上一次指标抓取期间没有发生错误|
|partial|表示在上一次指标抓取期间发生了一些错误，并且只返回了 `ClickHouse_ServiceInfo` 指标。|

获取指标的请求不会唤醒处于空闲状态的服务。如果服务处于 `idle` 状态，则只会返回 `ClickHouse_ServiceInfo` 指标。

对于 ClickPipes，有一个类似的 `ClickPipes_Info` `gauge` 指标，除 **Metric Labels** 外，还包含以下标签：

| Label | Description |
| --- | --- |
| clickpipe_state | 当前管道的状态 |

### 配置 Prometheus

Prometheus 服务器会以指定的时间间隔从已配置的目标采集指标。下面是一个 Prometheus 服务器使用 ClickHouse Cloud 的 Prometheus 端点（Prometheus Endpoint）的示例配置：

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

请注意，必须将 `honor_labels` 配置参数设置为 `true`，才能正确填充实例标签。此外，上述示例中将 `filtered_metrics` 设置为 `true`，但实际应根据用户偏好进行配置。


## 与 Grafana 集成 {#integrating-with-grafana}

用户可以通过两种主要方式与 Grafana 集成：

- **Metrics Endpoint** – 这种方式的优点是不需要任何额外组件或基础设施。该功能目前仅适用于 Grafana Cloud，并且只需要 ClickHouse Cloud Prometheus Endpoint 的 URL 和凭证。
- **Grafana Alloy** - Grafana Alloy 是一个供应商中立的 OpenTelemetry (OTel) Collector 发行版，用于替代 Grafana Agent。它可以用作抓取器（scraper），可部署在您自己的基础设施中，并兼容任何 Prometheus 端点。

下面我们提供使用这些选项的说明，重点介绍 ClickHouse Cloud Prometheus Endpoint 的相关细节。

### 使用带有指标端点的 Grafana Cloud {#grafana-cloud-with-metrics-endpoint}

- 登录 Grafana Cloud 账户
- 选择 **Metrics Endpoint** 新建连接
- 将 Scrape URL 配置为指向 Prometheus 端点，并使用 basic auth 结合 API key/secret 配置连接
- 测试该连接以确保能够成功连通

<Image img={prometheus_grafana_metrics_endpoint} size="md" alt="配置 Grafana Metrics Endpoint" border/>

<br />

配置完成后，应能在下拉菜单中看到可用于配置仪表板的指标：

<Image img={prometheus_grafana_dropdown} size="md" alt="Grafana Metrics Explorer 下拉菜单" border/>

<br />

<Image img={prometheus_grafana_chart} size="md" alt="Grafana Metrics Explorer 图表" border/>

### 使用 Grafana Cloud 搭配 Alloy

如果您使用 Grafana Cloud，可以通过进入 Grafana 中的 Alloy 菜单，并按照屏幕上的指引安装 Alloy：

<Image img={prometheus_grafana_alloy} size="md" alt="Grafana Alloy" border />

<br />

这会为 Alloy 配置一个 `prometheus.remote_write` 组件，用于使用认证令牌向 Grafana Cloud 端点发送数据。随后，您只需修改 Alloy 配置（在 Linux 上位于 `/etc/alloy/config.alloy`），以添加一个用于 ClickHouse Cloud Prometheus Endpoint 的抓取器（scraper）。

下面展示了一个 Alloy 配置示例，其中包含一个 `prometheus.scrape` 组件，用于从 ClickHouse Cloud Endpoint 抓取指标，以及自动配置的 `prometheus.remote_write` 组件。请注意，在 `basic_auth` 配置组件中，Cloud API 密钥 ID 和密钥分别作为用户名和密码进行配置。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // 从默认监听地址采集指标。
  targets = [{
        __address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// 例如：https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
  }]

  honor_labels = true

  basic_auth {
        username = "KEY_ID"
        password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // 转发至下方的 metrics_service
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

请注意，必须将 `honor_labels` 配置参数设置为 `true`，才能使 instance 标签被正确填充。


### 使用 Alloy 的自托管 Grafana

Grafana 自托管用户可以在[此处](https://grafana.com/docs/alloy/latest/get-started/install/)找到安装 Alloy agent 的说明。我们假定用户已经将 Alloy 配置为将 Prometheus 指标发送到所需的目标端点。下面的 `prometheus.scrape` 组件会让 Alloy 抓取 ClickHouse Cloud 端点。我们假定 `prometheus.remote_write` 会接收已抓取的指标。如果该目标不存在，请将 `forward_to key` 调整为实际的目标端点。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // 从默认监听地址收集指标。
  targets = [{
        __address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// 例如:https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
  }]

  honor_labels = true

  basic_auth {
        username = "KEY_ID"
        password = "KEY_SECRET"
  }

  forward_to = [prometheus.remote_write.metrics_service.receiver]
  // 转发至 metrics_service。可根据需要修改为您偏好的接收器
}
```

配置完成后，你应当可以在 Metrics Explorer 中看到与 ClickHouse 相关的指标：

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Grafana Metrics Explorer" border />

<br />

请注意，需要将 `honor_labels` 配置参数设置为 `true`，才能正确填充实例（`instance`）标签。


## 集成 Datadog

可以使用 Datadog 的 [Agent](https://docs.datadoghq.com/agent/?tab=Linux) 和 [OpenMetrics 集成](https://docs.datadoghq.com/integrations/openmetrics/) 从 ClickHouse Cloud 端点采集指标。下面是该 Agent 和集成的一个简单示例配置。请注意，您可能只希望选择自己最关心的那部分指标。下面这个「兜底式」示例会导出成千上万种指标与实例的组合，Datadog 会将它们视为自定义指标。

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

<Image img={prometheus_datadog} size="md" alt="Prometheus 与 Datadog 的集成" />
