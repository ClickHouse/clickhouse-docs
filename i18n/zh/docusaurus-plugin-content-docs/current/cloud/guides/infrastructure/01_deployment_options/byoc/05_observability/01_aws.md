---
title: 'AWS 上 BYOC 的可观测性'
slug: /cloud/reference/byoc/observability
sidebar_label: 'AWS'
keywords: ['BYOC', '云', '自带云', 'AWS']
description: '在您自己的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc4 from '@site/static/images/cloud/reference/byoc-4.png';
import byoc3 from '@site/static/images/cloud/reference/byoc-3.png';
import DeprecatedBadge from '@theme/badges/DeprecatedBadge';

## 可观测性 {#observability}

### 内置监控工具 {#built-in-monitoring-tools}

ClickHouse BYOC 为不同使用场景提供多种方案。

#### 可观测性仪表板 {#observability-dashboard}

ClickHouse Cloud 提供高级可观测性仪表板，用于展示内存使用量、查询速率以及 I/O 等指标。可以在 ClickHouse Cloud Web 控制台界面的 **Monitoring** 部分访问该仪表板。

<br />

<Image img={byoc3} size="lg" alt="Observability dashboard" border />

<br />

#### 高级仪表板 {#advanced-dashboard}

可以使用来自 `system.metrics`、`system.events`、`system.asynchronous_metrics` 等系统表的指标，自定义仪表板，以更细粒度地监控服务器性能和资源使用情况。

<br />

<Image img={byoc4} size="lg" alt="Advanced dashboard" border />

<br />

#### 访问 BYOC Prometheus 栈 {#prometheus-access}

ClickHouse BYOC 会在你的 Kubernetes 集群中部署一个 Prometheus 栈。你可以从该栈访问并抓取监控指标，并将其集成到你自己的监控栈中。

联系 ClickHouse 支持以启用 Private Load balancer 并索取对应 URL。请注意，该 URL 只能通过私有网络访问，且不支持身份验证。

**示例 URL**

```bash
https://prometheus-internal.<subdomain>.<region>.aws.clickhouse-byoc.com/query
```

#### Prometheus 集成 {#prometheus-integration}

<DeprecatedBadge />

请改为使用上文中的 Prometheus Stack 集成。除了 ClickHouse Server 指标之外，它还提供更多指标，包括 K8S 指标以及来自其他服务的指标。

ClickHouse Cloud 提供一个 Prometheus 端点，可用于抓取指标以进行监控。这样就可以与 Grafana 和 Datadog 等工具集成进行可视化展示。

**通过 https 端点 /metrics&#95;all 的示例请求**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**示例响应**

```bash
# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes 系统数据库中存储在 `s3disk` 磁盘上的字节数
# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929
# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts 已损坏的分离数据分片数量
# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0
# HELP ClickHouse_CustomMetric_LostPartCount 最早变更的存在时长(秒)
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

可以使用 ClickHouse 的用户名和密码组合进行身份验证。我们建议为抓取指标创建一个权限最小化的专用用户。至少需要对所有副本上的 `system.custom_metrics` 表具有 `READ` 权限。例如：

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

示例配置如下所示。`targets` 端点与访问 ClickHouse 服务时使用的端点相同。

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

另请参阅[这篇博客文章](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring)以及[针对 ClickHouse 的 Prometheus 设置文档](/integrations/prometheus)。
