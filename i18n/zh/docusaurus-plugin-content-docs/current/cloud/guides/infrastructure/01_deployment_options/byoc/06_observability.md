---
title: 'BYOC 可观测性'
slug: /cloud/reference/byoc/observability
sidebar_label: '可观测性'
keywords: ['BYOC', 'cloud', '自带 Cloud', '可观测性', '监控', 'Prometheus', 'Grafana']
description: '使用内置仪表盘和 Prometheus 指标监控 BYOC ClickHouse 部署'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_mixin_1 from '@site/static/images/cloud/reference/byoc-mixin-1.png';
import byoc_mixin_2 from '@site/static/images/cloud/reference/byoc-mixin-2.png';
import byoc_mixin_3 from '@site/static/images/cloud/reference/byoc-mixin-3.png';
import byoc_mixin_4 from '@site/static/images/cloud/reference/byoc-mixin-4.png';
import byoc_mixin_5 from '@site/static/images/cloud/reference/byoc-mixin-5.png';

BYOC 部署提供完善的可观测性功能，使你能够通过专用的 Prometheus 监控栈，以及来自 ClickHouse 服务器的直接指标端点来监控你的 ClickHouse 服务。所有可观测性数据都会保留在你的云账号中，使你能够对监控基础设施实现完全掌控。


## Prometheus 监控方式 \{#prometheus-monitoring\}

BYOC 提供两种主要方式，使用 Prometheus 来收集和可视化指标：

1. **连接到内置 Prometheus Stack**：访问运行在 BYOC Kubernetes 集群内的集中式、预先安装好的 Prometheus 实例。
2. **直接抓取 ClickHouse 指标**：将自有的 Prometheus 部署指向每个 ClickHouse 服务暴露的 `/metrics_all` 端点。

### 比较监控方法 \{#monitoring-approaches-comparison\}

| 功能                     | 内置 Prometheus 栈                                               | 直接从 ClickHouse 服务抓取                                  |
|--------------------------|------------------------------------------------------------------|------------------------------------------------------------|
| **指标范围**             | 汇总来自 ClickHouse、Kubernetes 以及相关服务的指标（集群全局可见性） | 仅来自单个 ClickHouse 服务器的指标                         |
| **设置流程**             | 需要配置私有网络访问（例如通过私有负载均衡器）                   | 只需将 Prometheus 配置为抓取公共或私有的 ClickHouse 端点   |
| **连接方式**             | 通过你的 VPC/网络内的私有负载均衡器                             | 与用于数据库访问相同的端点                                 |
| **认证方式**             | 无需（受限于私有网络）                                           | 使用 ClickHouse 服务凭证                                   |
| **网络前提条件**         | 私有负载均衡器以及相应的网络连通性                             | 任何能够访问你的 ClickHouse 端点的网络均可                 |
| **最适用场景**           | 全面性的基础设施与服务监控                                      | 面向特定服务的监控与集成                                   |
| **如何集成**             | 在外部 Prometheus 中配置联邦来摄取集群指标                      | 将 ClickHouse 指标端点直接添加到你的 Prometheus 配置中     |

**推荐做法**：对于大多数使用场景，我们建议集成内置 Prometheus 栈，因为它能够提供 BYOC 部署中所有组件（ClickHouse 服务、Kubernetes 集群以及相关服务）的完整指标，而不仅仅是 ClickHouse 服务器指标。 

## 内置 BYOC Prometheus 堆栈 \{#builtin-prometheus-stack\}

ClickHouse BYOC 会在 Kubernetes 集群中部署一个完整的 Prometheus 监控堆栈，包括 Prometheus、Grafana、AlertManager，以及可选用于长期指标存储的 Thanos。该堆栈会收集以下来源的指标：

- ClickHouse 服务器和 ClickHouse Keeper
- Kubernetes 集群及系统组件
- 底层基础设施节点

### 访问 Prometheus Stack \{#accessing-prometheus-stack\}

要连接内置的 Prometheus Stack：

1. **联系 ClickHouse 支持团队**，为你的 BYOC 环境启用私有负载均衡器。
2. **向 ClickHouse 支持团队获取 Prometheus 端点 URL**。
3. **验证到 Prometheus 端点的私有网络连通性**——通常通过 VPC 对等连接或其他私有网络配置实现。

Prometheus 端点将采用以下格式：

```bash
https://prometheus-internal.<subdomain>.<region>.<cloud>.clickhouse-byoc.com
```

:::note
Prometheus stack 的 URL 只能通过私有网络连接访问，且不需要身份验证。访问仅限于那些能够通过 VPC peering 或其他私有连接方式访问你的 BYOC VPC 的网络。
:::


### 与现有监控工具集成 \{#prometheus-stack-integration\}

你可以通过多种方式在你的监控体系中使用 BYOC Prometheus 栈：

**选项 1：查询 Prometheus API**

* 从你首选的监控平台或自定义仪表盘直接访问 Prometheus API 端点。
* 使用 PromQL 查询来提取、聚合并可视化所需的指标。
* 非常适合构建定制化仪表盘或告警管道。

Prometheus 查询端点：

```text
https://prometheus-internal.<subdomain>.<region>.<cloud>.clickhouse-byoc.com/query
```

**选项 2：通过联邦方式将指标导入你自己的 Prometheus**

* 将你的外部 Prometheus 实例配置为以联邦方式（pull）从 ClickHouse BYOC Prometheus 堆栈拉取指标。
* 这样可以统一并集中管理来自多个环境或集群的指标采集。
* Prometheus 联邦配置示例：

```yaml
scrape_configs:
  - job_name: 'federate-clickhouse-byoc'
    scrape_interval: 15s
    honor_labels: true
    metrics_path: '/federate'
    params:
      'match[]':
        - '{job="clickhouse"}'
        - '{job="kubernetes"}'
    static_configs:
      - targets:
        - 'prometheus-internal.<subdomain>.<region>.<cloud>.clickhouse-byoc.com'
```


## ClickHouse 服务 Prometheus 集成 \{#direct-prometheus-integration\}

ClickHouse 服务会暴露一个兼容 Prometheus 的指标端点，你可以使用自己的 Prometheus 实例直接对其进行抓取。此方式能够提供 ClickHouse 特定的指标，但不包括 Kubernetes 或其他配套服务的指标。

### 访问 Metrics 端点 \{#metrics-endpoint\}

Metrics 端点可在 ClickHouse 服务的 `/metrics_all` 路径访问：

```bash
curl --user <username>:<password> https://<service-subdomain>.<byoc-subdomain>.<region>.<provider>.byoc.clickhouse-byoc.com:8443/metrics_all
```

**响应示例：**

```bash
# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes The amount of bytes stored on disk `s3disk` in system database
# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929
# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts The number of broken detached parts
# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_TotalNumberOfErrors The total number of errors on server since the last restart
# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```


### 认证 \{#authentication\}

该指标 endpoint 需要使用 ClickHouse 凭证进行认证。我们建议使用 `default` 用户，或专门创建一个仅具有最小权限、专用于抓取指标的用户。

**所需权限：**

* 用于连接到服务的 `REMOTE` 权限
* 对相关系统表的 `SELECT` 权限

**示例用户配置：**

```sql
CREATE USER scrapping_user IDENTIFIED BY 'secure_password';
GRANT REMOTE ON *.* TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_custom_metrics_tables TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_database_replicated_recovery_time TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_failed_mutations TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_group TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_shared_catalog_recovery_time TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_table_read_only_duration_seconds TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_error_metrics TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_histograms TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_metrics_and_events TO scrapping_user;
GRANT SELECT(description, metric, value) ON system.asynchronous_metrics TO scrapping_user;
GRANT SELECT ON system.custom_metrics TO scrapping_user;
GRANT SELECT(name, value) ON system.errors TO scrapping_user;
GRANT SELECT(description, event, value) ON system.events TO scrapping_user;
GRANT SELECT(description, labels, metric, value) ON system.histogram_metrics TO scrapping_user;
GRANT SELECT(description, metric, value) ON system.metrics TO scrapping_user;
```


### 配置 Prometheus \{#configuring-prometheus\}

将 Prometheus 实例配置为从 ClickHouse 指标端点抓取数据：

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "clickhouse"
    static_configs:
      - targets: ["<service-subdomain>.<byoc-subdomain>.<region>.<provider>.byoc.clickhouse-byoc.com:8443"]
    scheme: https
    metrics_path: "/metrics_all"
    basic_auth:
      username: <username>
      password: <password>
    honor_labels: true
```

替换：

* 将 `<service-subdomain>.<byoc-subdomain>.<region>.<provider>.byoc.clickhouse-byoc.com:8443` 替换为您的实际服务端点
* 将 `<username>` 和 `<password>` 替换为用于抓取的用户凭据


## ClickHouse Mixin \{#clickhouse-mixin\}

对于希望使用现成监控仪表盘的团队，ClickHouse 提供了一个 Prometheus 的 **ClickHouse Mixin**。这是一个专门为监控 ClickHouse 集群而设计的预构建 Grafana 仪表盘。

### 配置 Grafana 并导入 ClickHouse Mix-in \{#setup-grafana-mixin\}

在 Prometheus 实例与 ClickHouse 监控栈集成完成后，可以按照以下步骤在 Grafana 中对指标进行可视化展示：

1. **在 Grafana 中添加 Prometheus 数据源**  
   在 Grafana 侧边栏进入 "Data sources"，点击 "Add data source"，选择 "Prometheus"。输入 Prometheus 实例的 URL 以及连接所需的凭据。

<Image img={byoc_mixin_1} size="lg" alt="BYOC Mixin 1" background='black'/>

<Image img={byoc_mixin_2} size="lg" alt="BYOC Mixin 2" background='black'/>

<Image img={byoc_mixin_3} size="lg" alt="BYOC Mixin 3" background='black'/>

2. **导入 ClickHouse Dashboard**  
   在 Grafana 中，进入 dashboard 区域并选择 "Import"。你可以上传 dashboard 的 JSON 文件，或直接粘贴其内容。JSON 文件可从 ClickHouse mixin 仓库获取：  
   [ClickHouse Mix-in Dashboard JSON](https://github.com/ClickHouse/clickhouse-mixin/blob/main/dashboard_byoc.json)

<Image img={byoc_mixin_4} size="lg" alt="BYOC Mixin 4" background='black'/>

3. **探索你的指标**  
   当 dashboard 已导入并配置为使用你的 Prometheus 数据源后，就可以看到来自 ClickHouse Cloud 服务的实时指标。

<Image img={byoc_mixin_5} size="lg" alt="BYOC Mixin 5" background='black'/>