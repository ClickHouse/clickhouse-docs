---
slug: /integrations/prometheus
sidebar_label: 'Prometheus'
title: 'Prometheus'
description: '将 ClickHouse 指标导出至 Prometheus'
keywords: ['prometheus', 'grafana', 'monitoring', 'metrics', 'exporter']
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

该功能支持集成 [Prometheus](https://prometheus.io/) 来监控 ClickHouse Cloud 服务。对 Prometheus 指标的访问通过 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 端点暴露，用户可以安全地连接并将这些指标导出到其 Prometheus 指标采集器中。随后即可将这些指标集成到 Grafana、Datadog 等可视化看板中进行展示。

要开始使用，请先[生成一个 API 密钥](/cloud/manage/openapi)。



## 用于获取 ClickHouse Cloud 指标的 Prometheus 端点 API

### API 参考

| Method | Path                                                                                                                            | Description    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | 返回指定服务的指标      |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]`                     | 返回某个组织下所有服务的指标 |

**请求参数**

| Name                 | Location         | Type     |
| -------------------- | ---------------- | -------- |
| Organization ID      | Endpoint address | UUID     |
| Service ID           | Endpoint address | UUID（可选） |
| filtered&#95;metrics | Query param      | 布尔值（可选）  |

### 认证

使用您的 ClickHouse Cloud API key 进行 Basic Authentication（基本身份验证）：

```bash
用户名：<KEY_ID>
密码：<KEY_SECRET>
请求示例
export KEY_SECRET=&lt;key_secret&gt;
export KEY_ID=&lt;key_id&gt;
export ORG_ID=&lt;org_id&gt;
```


# 适用于 $ORG_ID 中的所有服务
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true



# 仅限单个服务

export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true
```

### 示例响应 {#sample-response}


```response
# HELP ClickHouse_ServiceInfo 有关服务的信息，包括集群状态和 ClickHouse 版本
# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="测试服务",clickhouse_cluster_status="运行中",clickhouse_version="24.5",scrape="全量"} 1
```


# HELP ClickHouseProfileEvents_Query 需要被解析并可能被执行的查询数量。不包括解析失败或因 AST 大小限制、配额限制或同时运行查询数量限制而被拒绝的查询。可能包括由 ClickHouse 自身发起的内部查询。不统计子查询。
# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6



# HELP ClickHouseProfileEvents_QueriesWithSubqueries 统计包含子查询的查询次数
# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230



# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries 统计带有子查询的 SELECT 查询数量
# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224



# HELP ClickHouseProfileEvents_FileOpen 打开的文件总数。
# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157



# HELP ClickHouseProfileEvents_Seek 调用“lseek”函数的次数。
# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840



# HELP ClickPipes_Info 始终为 1。"clickpipe_state" 标签包含该管道的当前状态：Stopped/Provisioning/Running/Paused/Failed
# TYPE ClickPipes_Info gauge
ClickPipes_Info{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent",clickpipe_status="Running"} 1



# HELP ClickPipes_SentEvents_Total 发送到 ClickHouse 的记录总量
# TYPE ClickPipes_SentEvents_Total counter
ClickPipes_SentEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5534250



# HELP ClickPipes_SentBytesCompressed_Total 发送到 ClickHouse 的压缩后字节总数。

# TYPE ClickPipes_SentBytesCompressed_Total counter

ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name
="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 380837520
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name


# HELP ClickPipes_FetchedBytes_Total 从源端获取的未压缩字节总量。
# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202



# HELP ClickPipes_Errors_Total 摄取数据时发生的错误总数。
# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes 演示实例",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent 演示管道",clickpipe_source="confluent"} 0



# HELP ClickPipes_SentBytes_Total 发送到 ClickHouse 的未压缩数据总字节数。
# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes 演示实例",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent 演示管道",clickpipe_source="confluent"} 477187967



# HELP ClickPipes_FetchedBytesCompressed_Total 从源端获取的压缩字节总数。如果源端数据未压缩，则该值等于 ClickPipes_FetchedBytes_Total
# TYPE ClickPipes_FetchedBytesCompressed_Total counter
ClickPipes_FetchedBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202



# HELP ClickPipes&#95;FetchedEvents&#95;Total 从源端获取的记录总数。

# TYPE ClickPipes&#95;FetchedEvents&#95;Total counter

ClickPipes&#95;FetchedEvents&#95;Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5535376

````

### 指标标签 {#metric-labels}

所有指标都包含以下标签：

|标签|说明|
|---|---|
|clickhouse_org|组织 ID|
|clickhouse_service|服务 ID|
|clickhouse_service_name|服务名称|

对于 ClickPipes，指标还会包含以下标签：

| 标签 | 说明 |
| --- | --- |
| clickpipe_id | ClickPipe ID |
| clickpipe_name | ClickPipe 名称 |
| clickpipe_source | ClickPipe 源类型 |

### 信息类指标 {#information-metrics}

ClickHouse Cloud 提供了一个特殊的指标 `ClickHouse_ServiceInfo`，它是一个始终为 `1` 的 `gauge`。该指标包含所有的**指标标签**，以及下列标签：

|标签|说明|
|---|---|
|clickhouse_cluster_status|服务的状态。可能是以下值之一：[`awaking` \| `running` \| `degraded` \| `idle` \| `stopped`]|
|clickhouse_version|服务当前运行的 ClickHouse 服务器版本|
|scrape|表示上一次抓取（scrape）的状态。可能为 `full` 或 `partial`|
|full|表示在上一次指标抓取过程中没有发生任何错误|
|partial|表示在上一次指标抓取过程中发生了一些错误，并且只返回了 `ClickHouse_ServiceInfo` 指标。|

获取指标的请求不会唤醒处于空闲状态的服务。当服务处于 `idle` 状态时，只会返回 `ClickHouse_ServiceInfo` 指标。

对于 ClickPipes，还提供了一个类似的 `ClickPipes_Info` `gauge` 指标，除了包含所有**指标标签**之外，还包含以下标签：

| 标签 | 说明 |
| --- | --- |
| clickpipe_state | ClickPipe 的当前状态 |

### 配置 Prometheus {#configuring-prometheus}

Prometheus 服务器会以指定的时间间隔从已配置的目标收集指标。下面是一个示例配置，用于让 Prometheus 服务器使用 ClickHouse Cloud 的 Prometheus 端点：

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
````

请注意，必须将 `honor_labels` 配置参数设置为 `true`，才能正确填充 instance 标签。此外，在上述示例中，`filtered_metrics` 被设置为 `true`，但应根据用户偏好进行配置。


## 与 Grafana 集成

用户有两种主要方式与 Grafana 集成：

* **Metrics Endpoint（指标端点）** – 此方式的优点是不需要任何额外组件或基础设施。该方案仅适用于 Grafana Cloud，只需要 ClickHouse Cloud Prometheus Endpoint 的 URL 和凭据。
* **Grafana Alloy** - Grafana Alloy 是供应商中立的 OpenTelemetry (OTel) Collector 发行版，用于替代 Grafana Agent。它可以作为抓取器（scraper）使用，可部署在您自己的基础设施中，并兼容任何 Prometheus endpoint。

下面我们提供使用这些选项的说明，重点介绍与 ClickHouse Cloud Prometheus Endpoint 相关的具体细节。

### 使用 Metrics Endpoint 的 Grafana Cloud

* 登录您的 Grafana Cloud 账户
* 通过选择 **Metrics Endpoint** 添加一个新的连接
* 将抓取 URL（Scrape URL）配置为指向 Prometheus endpoint，并使用 basic auth，将 API key/secret 配置为连接凭据
* 测试连接以确保能够成功连接

<Image img={prometheus_grafana_metrics_endpoint} size="md" alt="配置 Grafana Metrics Endpoint" border />

<br />

配置完成后，您应能在下拉列表中看到可用于配置仪表盘的指标：

<Image img={prometheus_grafana_dropdown} size="md" alt="Grafana Metrics Explorer 下拉列表" border />

<br />

<Image img={prometheus_grafana_chart} size="md" alt="Grafana Metrics Explorer 图表" border />

### 使用 Alloy 的 Grafana Cloud

如果您在使用 Grafana Cloud，可以通过在 Grafana 中导航到 Alloy 菜单并按照屏幕上的说明安装 Alloy：

<Image img={prometheus_grafana_alloy} size="md" alt="Grafana Alloy" border />

<br />

这会将 Alloy 配置为使用 `prometheus.remote_write` 组件，将数据发送到带有身份验证令牌的 Grafana Cloud endpoint。之后，用户只需修改 Alloy 配置（在 Linux 中位于 `/etc/alloy/config.alloy`），为 ClickHouse Cloud Prometheus Endpoint 添加一个 scraper 即可。

下面展示了一个 Alloy 配置示例，其中包含用于从 ClickHouse Cloud Endpoint 抓取指标的 `prometheus.scrape` 组件，以及自动配置的 `prometheus.remote_write` 组件。请注意，`basic_auth` 配置组件中包含我们的 Cloud API key ID 和 secret，分别作为用户名和密码使用。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // 从默认侦听地址收集指标。
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
  // 转发到下方的 metrics_service
}

prometheus.remote_write "metrics_service" {
  endpoint {
        url = "https://prometheus-prod-10-prod-us-central-0.grafana.net/api/prom/push"
        basic_auth {
          username = "<Grafana API 用户名>"
          password = "<Grafana API 令牌>"
    }
  }
}
```

请注意，需要将 `honor_labels` 配置参数设置为 `true`，才能正确填充实例标签。

### 使用 Alloy 的自托管 Grafana

自托管 Grafana 用户可以在[此处](https://grafana.com/docs/alloy/latest/get-started/install/)找到安装 Alloy agent 的说明。我们假定用户已将 Alloy 配置为将 Prometheus 指标发送到所需的目标端。下面的 `prometheus.scrape` 组件会使 Alloy 抓取 ClickHouse Cloud 端点的数据。我们假定 `prometheus.remote_write` 用于接收已抓取的指标。如果该目标不存在，请将 `forward_to` 键调整为实际目标。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // 从默认监听地址收集指标。
  targets = [{
        __address__ = "https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=true",
// 例如：https://api.clickhouse.cloud/v1/organizations/97a33bdb-4db3-4067-b14f-ce40f621aae1/prometheus?filtered_metrics=true
  }]

  honor_labels = true

  basic_auth {
        username = "KEY_ID"
        password = "KEY_SECRET"
  }
```


forward&#95;to = [prometheus.remote&#95;write.metrics&#95;service.receiver]
// 转发到 metrics&#95;service。根据你的首选接收端进行修改
&#125;

```

配置完成后，你应该能在指标浏览器中看到与 ClickHouse 相关的指标：

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Grafana 指标浏览器" border/>

<br />

请注意，必须将 `honor_labels` 配置参数设置为 `true`，才能正确填充 instance 标签。
```


## 与 Datadog 集成

你可以使用 Datadog 的 [Agent](https://docs.datadoghq.com/agent/?tab=Linux) 和 [OpenMetrics 集成](https://docs.datadoghq.com/integrations/openmetrics/) 从 ClickHouse Cloud 端点收集指标。下面是该 Agent 和集成的一份简单示例配置。请注意，你可能只想选择对你最关心的那些指标。下面这个“全量抓取”的示例会导出成千上万种指标与实例的组合，Datadog 会将这些都视为自定义指标。

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

<Image img={prometheus_datadog} size="md" alt="Prometheus 与 Datadog 集成" />
