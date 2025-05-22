---
'sidebar_title': 'Query Insights'
'slug': '/cloud/get-started/query-insights'
'description': '可视化 system.query_log 数据，以简化查询调试和性能优化'
'keywords':
- 'query insights'
- 'query log'
- 'query log ui'
- 'system.query_log insights'
'title': '查询洞察'
---

import Image from '@theme/IdealImage';
import insights_overview from '@site/static/images/cloud/sqlconsole/insights_overview.png';
import insights_latency from '@site/static/images/cloud/sqlconsole/insights_latency.png';
import insights_recent from '@site/static/images/cloud/sqlconsole/insights_recent.png';
import insights_drilldown from '@site/static/images/cloud/sqlconsole/insights_drilldown.png';
import insights_query_info from '@site/static/images/cloud/sqlconsole/insights_query_info.png';


# 查询洞察

**查询洞察**功能通过各种可视化和表格使 ClickHouse 内置的查询日志更易于使用。 ClickHouse 的 `system.query_log` 表是查询优化、调试和监控整体集群健康状况及性能的重要信息来源。

## 查询概览 {#query-overview}

选择服务后，左侧边栏中的 **监控** 导航项应展开以显示新的 **查询洞察** 子项。点击此选项会打开新的查询洞察页面：

<Image img={insights_overview} size="md" alt="查询洞察 UI 概览" border/>

## 顶层指标 {#top-level-metrics}

顶部的统计框代表在所选时间段内的一些基本顶层查询指标。在其下方，我们展示了三种时间序列图表，分别代表查询量、延迟和按查询类型（选择、插入、其他）细分的错误率，展示所选的时间窗口内的数据。延迟图表还可以进一步调整，以显示 p50、p90 和 p99 延迟：

<Image img={insights_latency} size="md" alt="查询洞察 UI 延迟图表" border/>

## 最近查询 {#recent-queries}

在顶层指标下方，表格显示所选时间窗口内的查询日志条目（按标准化查询哈希和用户分组）：

<Image img={insights_recent} size="md" alt="查询洞察 UI 最近查询表格" border/>

最近查询可以按任何可用字段进行过滤和排序。该表也可以配置以显示或隐藏其他字段，如表格、p90 和 p99 延迟。

## 查询深入分析 {#query-drill-down}

从最近查询表中选择一个查询将打开一个飞出窗口，其中包含与所选查询特定的指标和信息：

<Image img={insights_drilldown} size="md" alt="查询洞察 UI 查询深入分析" border/>

从飞出窗口中可以看到，该查询在过去 24 小时内已运行超过 3000 次。**查询信息**标签中的所有指标都是聚合指标，但我们还可以通过选择 **查询历史** 标签来查看单次运行的指标：

<Image img={insights_query_info} size="sm" alt="查询洞察 UI 查询信息" border/>

<br />

在此窗格中，每次查询运行的 `设置` 和 `配置事件` 项目可以展开以显示额外信息。
