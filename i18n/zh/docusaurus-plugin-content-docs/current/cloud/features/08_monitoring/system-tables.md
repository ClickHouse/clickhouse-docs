---
title: '查询系统表'
slug: /cloud/monitoring/system-tables
description: '通过直接查询系统表监控 ClickHouse Cloud'
keywords: ['Cloud', '监控', '系统表', 'query_log', 'clusterAllReplicas', '可观测性仪表板']
sidebar_label: '系统表'
sidebar_position: 5
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';

# 查询 ClickHouse 的 system 数据库 \{#querying-clickhouses-system-database\}

所有 ClickHouse 实例都附带一组位于 `system` 数据库中的[系统表](/operations/system-tables/overview)，其中包含以下信息：

* 服务器状态、进程和环境。
* 服务器内部进程。
* 构建 ClickHouse 二进制文件时使用的选项。

直接查询这些表有助于监控 ClickHouse 部署，尤其适用于深度排查和调试。

## 使用 ClickHouse Cloud 控制台 \{#using-cloud-console\}

ClickHouse Cloud 控制台自带 [SQL 控制台](/cloud/get-started/sql-console) 和 [仪表板工具](/cloud/manage/dashboards)，可用于查询系统表。例如，下面的查询用于查看过去两小时内新建了多少个 parts (以及创建频率) ：

```sql
SELECT
    count() AS new_parts,
    toStartOfMinute(event_time) AS modification_time_m,
    table,
    sum(rows) AS total_written_rows,
    formatReadableSize(sum(size_in_bytes)) AS total_bytes_on_disk
FROM clusterAllReplicas(default, system.part_log)
WHERE (event_type = 'NewPart') AND (event_time > (now() - toIntervalHour(2)))
GROUP BY
    modification_time_m,
    table
ORDER BY
    modification_time_m ASC,
    table DESC
```

:::tip[更多示例查询]
如需更多监控查询，请参阅以下资源：

* [用于故障排查的实用查询](/knowledgebase/useful-queries-for-troubleshooting)
* [监控和故障排查 insert 查询](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
* [监控和故障排查 select 查询](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)

您还可以使用这些查询在 [Cloud 控制台中创建自定义仪表板](https://clickhouse.com/blog/essential-monitoring-queries-creating-a-dashboard-in-clickHouse-cloud)。
:::

## 内置高级可观测性仪表板 \{#built-in-advanced-observability-dashboard\}

ClickHouse 提供内置高级可观测性仪表板功能，可通过 `$HOST:$PORT/dashboard` 访问 (需要用户名和密码) ，用于显示 `system.dashboards` 中包含的 Cloud Overview 指标。

<Image img={NativeAdvancedDashboard} size="lg" alt="内置高级可观测性仪表板" border />

:::note
此仪表板需要直接对 ClickHouse 实例进行身份验证，并且独立于 [Cloud 控制台高级仪表板](/cloud/monitoring/cloud-console#advanced-dashboard)；后者可通过 Cloud 控制台 UI 访问，无需额外身份验证。
:::

有关可用可视化及其故障排查用法的更多信息，请参见[高级仪表板文档](/cloud/manage/monitor/advanced-dashboard)。

## 跨节点和版本查询 \{#querying-across-nodes\}

为了全面查看整个集群，用户可以结合使用 `clusterAllReplicas` 函数和 `merge` 函数。`clusterAllReplicas` 函数允许在 &quot;default&quot; 集群中的所有副本上查询系统表，并将节点特定的数据整合为统一结果。与 `merge` 函数结合使用时，这可用于查询集群中特定表的全部系统数据。

例如，要查找过去一小时内所有副本中运行时间最长的前 5 个查询：

```sql
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM clusterAllReplicas(default, system.query_log)
WHERE event_time >= (now() - toIntervalMinute(60)) AND type = 'QueryFinish'
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL
```

这种方法对于监控和调试整个集群中的操作尤其有价值，能够帮助用户有效分析其 ClickHouse Cloud 部署的运行状况和性能。

更多详情，请参阅[跨节点查询](/operations/system-tables/overview#querying-across-nodes)。

## 系统注意事项 \{#system-considerations\}

:::warning
直接查询系统表会增加生产服务的查询负载，导致 ClickHouse Cloud 实例无法进入空闲状态 (这可能会影响成本) ，并使监控可用性与生产系统健康状况耦合。如果生产系统发生故障，监控也可能受到影响。
:::

如需在实现运维隔离的同时进行实时生产监控，请考虑使用[兼容 Prometheus 的指标端点](/integrations/prometheus)或[Cloud 控制台仪表板](/cloud/monitoring/cloud-console)。两者都使用预先抓取的指标，不会向底层服务发出查询。

## 相关页面 \{#related\}

* [系统表参考](/operations/system-tables/overview) — 所有可用系统表的完整参考文档
* [Cloud 控制台监控](/cloud/monitoring/cloud-console) — 零配置仪表板，不会影响服务性能
* [Prometheus endpoint](/integrations/prometheus) — 将指标导出到外部监控工具
* [高级仪表板](/cloud/manage/monitor/advanced-dashboard) — 仪表板可视化的详细参考文档