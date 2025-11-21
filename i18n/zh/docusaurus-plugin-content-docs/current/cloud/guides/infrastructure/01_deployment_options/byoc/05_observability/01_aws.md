---
title: '在 AWS 上的 BYOC 可观测性'
slug: /cloud/reference/byoc/observability
sidebar_label: 'AWS'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'AWS']
description: '在您自己的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc4 from '@site/static/images/cloud/reference/byoc-4.png';
import byoc3 from '@site/static/images/cloud/reference/byoc-3.png';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';


## 可观测性 {#observability}

### 内置监控工具 {#built-in-monitoring-tools}

ClickHouse BYOC 为各种使用场景提供了多种方案。

#### 可观测性仪表板 {#observability-dashboard}

ClickHouse Cloud 包含一个高级可观测性仪表板，显示内存使用、查询速率和 I/O 等指标。可在 ClickHouse Cloud Web 控制台的 **Monitoring** 部分访问该仪表板。

<br />

<Image img={byoc3} size='lg' alt='可观测性仪表板' border />

<br />

#### 高级仪表板 {#advanced-dashboard}

您可以使用来自 `system.metrics`、`system.events` 和 `system.asynchronous_metrics` 等系统表的指标自定义仪表板，以详细监控服务器性能和资源利用情况。

<br />

<Image img={byoc4} size='lg' alt='高级仪表板' border />

<br />

#### 访问 BYOC Prometheus 栈 {#prometheus-access}

ClickHouse BYOC 在您的 Kubernetes 集群上部署了一个 Prometheus 栈。您可以从该处访问并抓取指标，并将其与您自己的监控栈集成。

联系 ClickHouse 支持以启用 Private Load Balancer 并获取该 URL。请注意，此 URL 只能通过私有网络访问，且不支持身份验证。

**示例 URL**

```bash
https://prometheus-internal.<subdomain>.<region>.aws.clickhouse-byoc.com/query
```

#### Prometheus 集成 {#prometheus-integration}

<DeprecatedBadge />

请改为使用上文的 Prometheus 栈集成。除 ClickHouse Server 指标外，它还提供更多指标，包括 Kubernetes 指标和来自其他服务的指标。

ClickHouse Cloud 提供了一个 Prometheus 端点，您可以使用该端点抓取监控指标，从而与 Grafana 和 Datadog 等工具集成以进行可视化。

**通过 https 端点 /metrics_all 的示例请求**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**示例响应**


```bash
# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes 系统数据库中存储在 `s3disk` 磁盘上的字节数
# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929
# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts 损坏的已分离数据分片数量
# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_LostPartCount 最旧变更的存在时长(秒)
# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_NumberOfWarnings 服务器发出的警告数量。通常表示可能存在配置错误
# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2
# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST
# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1
# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE
# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8
# HELP ClickHouse_CustomMetric_TotalNumberOfErrors 自上次重启以来服务器的错误总数
# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**身份验证**

可以使用 ClickHouse 的用户名和密码组合进行身份验证。我们建议为抓取指标创建一个仅具备最小必要权限的专用用户。至少需要在各个副本上的 `system.custom_metrics` 表具备 `READ` 权限。例如：

```sql
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

**配置 Prometheus**

下面是一个示例配置。`targets` 端点与访问 ClickHouse 服务时使用的端点相同。

```bash
global:
 scrape_interval: 15s

scrape_configs:
 - job_name: "prometheus"
   static_configs:
   - targets: ["localhost:9090"]
 - job_name: "clickhouse"
   static_configs:
     - targets: ["<subdomain1>.<subdomain2>.aws.byoc.clickhouse.cloud:8443"]
   scheme: https
   metrics_path: "/metrics_all"
   basic_auth:
     username: <KEY_ID>
     password: <KEY_SECRET>
   honor_labels: true
```

另请参阅[这篇博客文章](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring)以及 [ClickHouse 的 Prometheus 设置文档](/integrations/prometheus)。
