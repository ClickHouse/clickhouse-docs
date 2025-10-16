---
'slug': '/integrations/prometheus'
'sidebar_label': 'Prometheus'
'title': 'Prometheus'
'description': '将 ClickHouse 指标导出到 Prometheus'
'keywords':
- 'prometheus'
- 'grafana'
- 'monitoring'
- 'metrics'
- 'exporter'
'doc_type': 'reference'
---

import prometheus_grafana_metrics_endpoint from '@site/static/images/integrations/prometheus-grafana-metrics-endpoint.png';
import prometheus_grafana_dropdown from '@site/static/images/integrations/prometheus-grafana-dropdown.png';
import prometheus_grafana_chart from '@site/static/images/integrations/prometheus-grafana-chart.png';
import prometheus_grafana_alloy from '@site/static/images/integrations/prometheus-grafana-alloy.png';
import prometheus_grafana_metrics_explorer from '@site/static/images/integrations/prometheus-grafana-metrics-explorer.png';
import prometheus_datadog from '@site/static/images/integrations/prometheus-datadog.png';
import Image from '@theme/IdealImage';


# Prometheus 集成

该功能支持将 [Prometheus](https://prometheus.io/) 集成到 ClickHouse Cloud 服务中，以监控服务。通过 [ClickHouse Cloud API](/cloud/manage/api/api-overview) 端点公开访问 Prometheus 指标，允许用户安全连接并将指标导出到他们的 Prometheus 指标收集器。这些指标可以与仪表盘结合使用，例如 Grafana、Datadog 进行可视化。

要开始，请 [生成一个 API 密钥](/cloud/manage/openapi)。

## Prometheus 端点 API 以检索 ClickHouse Cloud 指标 {#prometheus-endpoint-api-to-retrieve-clickhouse-cloud-metrics}

### API 参考 {#api-reference}

| 方法   | 路径                                                                                                                | 描述                                   |
| ------ | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/services/:serviceId/prometheus?filtered_metrics=[true \| false]` | 返回特定服务的指标                     |
| GET    | `https://api.clickhouse.cloud/v1/organizations/:organizationId/prometheus?filtered_metrics=[true \| false]` | 返回组织中所有服务的指标               |

**请求参数**

| 名称             | 位置               | 类型               |
| ---------------- | ------------------ | ------------------ |
| 组织 ID          | 端点地址           | uuid               |
| 服务 ID          | 端点地址           | uuid（可选）       |
| filtered_metrics  | 查询参数           | boolean（可选）    |

### 认证 {#authentication}

使用您的 ClickHouse Cloud API 密钥进行基本认证：

```bash
Username: <KEY_ID>
Password: <KEY_SECRET>
Example request
export KEY_SECRET=<key_secret>
export KEY_ID=<key_id>
export ORG_ID=<org_id>


# For all services in $ORG_ID
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/prometheus?filtered_metrics=true


# For a single service only
export SERVICE_ID=<service_id>
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$SERVICE_ID/prometheus?filtered_metrics=true
```

### 示例响应 {#sample-response}

```response

# HELP ClickHouse_ServiceInfo Information about service, including cluster status and ClickHouse version

# TYPE ClickHouse_ServiceInfo untyped
ClickHouse_ServiceInfo{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",clickhouse_cluster_status="running",clickhouse_version="24.5",scrape="full"} 1


# HELP ClickHouseProfileEvents_Query Number of queries to be interpreted and potentially executed. Does not include queries that failed to parse or were rejected due to AST size limits, quota limits or limits on the number of simultaneously running queries. May include internal queries initiated by ClickHouse itself. Does not count subqueries.

# TYPE ClickHouseProfileEvents_Query counter
ClickHouseProfileEvents_Query{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 6


# HELP ClickHouseProfileEvents_QueriesWithSubqueries Count queries with all subqueries

# TYPE ClickHouseProfileEvents_QueriesWithSubqueries counter
ClickHouseProfileEvents_QueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 230


# HELP ClickHouseProfileEvents_SelectQueriesWithSubqueries Count SELECT queries with all subqueries

# TYPE ClickHouseProfileEvents_SelectQueriesWithSubqueries counter
ClickHouseProfileEvents_SelectQueriesWithSubqueries{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 224


# HELP ClickHouseProfileEvents_FileOpen Number of files opened.

# TYPE ClickHouseProfileEvents_FileOpen counter
ClickHouseProfileEvents_FileOpen{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 4157


# HELP ClickHouseProfileEvents_Seek Number of times the 'lseek' function was called.

# TYPE ClickHouseProfileEvents_Seek counter
ClickHouseProfileEvents_Seek{clickhouse_org="c2ba4799-a76e-456f-a71a-b021b1fafe60",clickhouse_service="12f4a114-9746-4a75-9ce5-161ec3a73c4c",clickhouse_service_name="test service",hostname="c-cream-ma-20-server-3vd2ehh-0",instance="c-cream-ma-20-server-3vd2ehh-0",table="system.events"} 1840


# HELP ClickPipes_Info Always equal to 1. Label "clickpipe_state" contains the current state of the pipe: Stopped/Provisioning/Running/Paused/Failed

# TYPE ClickPipes_Info gauge
ClickPipes_Info{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent",clickpipe_status="Running"} 1


# HELP ClickPipes_SentEvents_Total Total number of records sent to ClickHouse

# TYPE ClickPipes_SentEvents_Total counter
ClickPipes_SentEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5534250


# HELP ClickPipes_SentBytesCompressed_Total Total compressed bytes sent to ClickHouse.

# TYPE ClickPipes_SentBytesCompressed_Total counter
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name
="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 380837520
ClickPipes_SentBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name


# HELP ClickPipes_FetchedBytes_Total Total uncompressed bytes fetched from the source.

# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202


# HELP ClickPipes_Errors_Total Total errors ingesting data.

# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 0


# HELP ClickPipes_SentBytes_Total Total uncompressed bytes sent to ClickHouse.

# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 477187967


# HELP ClickPipes_FetchedBytesCompressed_Total Total compressed bytes fetched from the source. If data is uncompressed at the source, this will equal ClickPipes_FetchedBytes_Total

# TYPE ClickPipes_FetchedBytesCompressed_Total counter
ClickPipes_FetchedBytesCompressed_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 873286202


# HELP ClickPipes_FetchedEvents_Total Total number of records fetched from the source.

# TYPE ClickPipes_FetchedEvents_Total counter
ClickPipes_FetchedEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="ClickPipes demo instace",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="Confluent demo pipe",clickpipe_source="confluent"} 5535376
```

### 指标标签 {#metric-labels}

所有指标具有以下标签：

| 标签                     | 描述              |
|------------------------|------------------|
| clickhouse_org         | 组织 ID          |
| clickhouse_service      | 服务 ID          |
| clickhouse_service_name | 服务名称         |

对于 ClickPipes，指标还将具有以下标签：

| 标签                     | 描述              |
|------------------------|------------------|
| clickpipe_id           | ClickPipe ID      |
| clickpipe_name         | ClickPipe 名称    |
| clickpipe_source       | ClickPipe 源类型  |

### 信息指标 {#information-metrics}

ClickHouse Cloud 提供一个特殊指标 `ClickHouse_ServiceInfo`，它是一个 `gauge` 且始终具有值 `1`。此指标包含所有 **指标标签** 以及以下标签：

| 标签                           | 描述                                      |
|-------------------------------|-----------------------------------------|
| clickhouse_cluster_status     | 服务的状态。可能是以下之一：[ `awaking` \| `running` \| `degraded` \| `idle` \| `stopped`] |
| clickhouse_version            | 服务运行的 ClickHouse 服务器版本          |
| scrape                        | 表示上次抓取的状态。可能是 `full` 或 `partial` |
| full                          | 表示上次抓取指标时没有错误                  |
| partial                       | 表示上次抓取指标时发生了一些错误，并且只返回了 `ClickHouse_ServiceInfo` 指标。 |

请求以检索指标不会恢复处于空闲状态的服务。如果服务处于 `idle` 状态，则只会返回 `ClickHouse_ServiceInfo` 指标。

对于 ClickPipes，还有一个类似的 `ClickPipes_Info` 指标 `gauge`，除了 **指标标签** 之外，还包含以下标签：

| 标签                       | 描述                                        |
|---------------------------|-------------------------------------------|
| clickpipe_state           | 管道的当前状态                              |

### 配置 Prometheus {#configuring-prometheus}

Prometheus 服务器按给定间隔从配置的目标收集指标。以下是 Prometheus 服务器使用 ClickHouse Cloud Prometheus 端点的示例配置：

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

请注意，`honor_labels` 配置参数需要设置为 `true`，以便实例标签能够正确填充。此外，上述示例中的 `filtered_metrics` 设置为 `true`，但应根据用户的喜好进行配置。

## 与 Grafana 集成 {#integrating-with-grafana}

用户有两种主要方法与 Grafana 集成：

- **指标端点** – 这种方法的优点是不需要任何额外的组件或基础设施。这种方式仅限于 Grafana Cloud，仅需 ClickHouse Cloud Prometheus 端点 URL 和凭证。
- **Grafana Alloy** - Grafana Alloy 是 OpenTelemetry (OTel) Collector 的中立供应商分发，替代了 Grafana Agent。这可以用作抓取器，部署在您自己的基础设施中，并与任何 Prometheus 端点兼容。

我们在下面提供了关于使用这些选项的说明，重点是与 ClickHouse Cloud Prometheus 端点特定的细节。

### 使用指标端点的 Grafana Cloud {#grafana-cloud-with-metrics-endpoint}

- 登录到您的 Grafana Cloud 账户
- 通过选择 **指标端点** 添加新连接
- 配置抓取 URL 以指向 Prometheus 端点，并使用基本身份验证与 API 密钥/密钥配置您的连接
- 测试连接以确保您能够连接

<Image img={prometheus_grafana_metrics_endpoint} size="md" alt="配置 Grafana 指标端点" border/>

<br />

配置完成后，您应该在下拉菜单中看到可以选择以配置仪表盘的指标：

<Image img={prometheus_grafana_dropdown} size="md" alt="Grafana 指标探索器下拉菜单" border/>

<br />

<Image img={prometheus_grafana_chart} size="md" alt="Grafana 指标探索器图表" border/>

### 使用 Alloy 的 Grafana Cloud {#grafana-cloud-with-alloy}

如果您使用的是 Grafana Cloud，可以通过导航到 Grafana 中的 Alloy 菜单并按照屏幕上的说明进行安装 Alloy：

<Image img={prometheus_grafana_alloy} size="md" alt="Grafana Alloy" border/>

<br />

这应该将 Alloy 配置为具有 `prometheus.remote_write` 组件，用于将数据发送到具有身份验证令牌的 Grafana Cloud 端点。用户只需修改 Alloy 配置（在 Linux 中位于 `/etc/alloy/config.alloy`），以添加用于 ClickHouse Cloud Prometheus 端点的抓取器。

以下展示了 Alloy 的示例配置，具有用于从 ClickHouse Cloud 端点抓取指标的 `prometheus.scrape` 组件，以及自动配置的 `prometheus.remote_write` 组件。请注意，`basic_auth` 配置组件包含我们的 Cloud API 密钥 ID 和秘密，分别作为用户名和密码。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Collect metrics from the default listen address.
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
  // forward to metrics_service below
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

请注意，`honor_labels` 配置参数需要设置为 `true`，以便实例标签能够正确填充。

### 使用 Alloy 的自管理 Grafana {#grafana-self-managed-with-alloy}

使用自管理 Grafana 的用户可以[在这里](https://grafana.com/docs/alloy/latest/get-started/install/)找到安装 Alloy 代理的说明。我们假设用户已配置 Alloy 以将 Prometheus 指标发送到他们希望的目标。以下的 `prometheus.scrape` 组件使 Alloy 从 ClickHouse Cloud 端点抓取指标。我们假设 `prometheus.remote_write` 接收抓取的指标。如果该目标不存在，请调整 `forward_to` 键，以指向目标位置。

```yaml
prometheus.scrape "clickhouse_cloud" {
  // Collect metrics from the default listen address.
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
  // forward to metrics_service. Modify to your preferred receiver
}
```

配置完成后，您应该在您的指标探索器中看到与 ClickHouse 相关的指标：

<Image img={prometheus_grafana_metrics_explorer} size="md" alt="Grafana 指标探索器" border/>

<br />

请注意，`honor_labels` 配置参数需要设置为 `true`，以便实例标签能够正确填充。

## 与 Datadog 集成 {#integrating-with-datadog}

您可以使用 Datadog [Agent](https://docs.datadoghq.com/agent/?tab=Linux) 和 [OpenMetrics 集成](https://docs.datadoghq.com/integrations/openmetrics/) 从 ClickHouse Cloud 端点收集指标。以下是此代理和集成的简单示例配置。请注意，您可能只想选择您最关心的那些指标。以下的笼统示例将导出成千上万的指标实例组合，Datadog 将其视为自定义指标。

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

<Image img={prometheus_datadog} size="md" alt="Prometheus Datadog 集成" />
