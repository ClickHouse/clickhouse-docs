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

**查询洞察** 功能通过各种可视化和表格使 ClickHouse 内置查询日志更易于使用。ClickHouse 的 `system.query_log` 表是查询优化、调试以及监控整体集群健康和性能的重要信息来源。

## 查询概览 {#query-overview}

选择服务后，左侧边栏中的 **监控** 导航项应展开以显示新的 **查询洞察** 子项。单击此选项会打开新的查询洞察页面：

<Image img={insights_overview} size="md" alt="查询洞察 UI 概览" border/>

## 顶级指标 {#top-level-metrics}

顶部的统计框代表所选时间段内的一些基本顶级查询指标。在其下方，我们展示了三个时间序列图表，分别表示按查询类型（选择、插入、其他）细分的查询量、延迟和错误率。在延迟图表上，您可以进一步调整以显示 p50、p90 和 p99 延迟：

<Image img={insights_latency} size="md" alt="查询洞察 UI 延迟图表" border/>

## 最近的查询 {#recent-queries}

在顶级指标下方，表格显示所选时间段内的查询日志条目（按规范化查询哈希和用户分组）：

<Image img={insights_recent} size="md" alt="查询洞察 UI 最近查询表" border/>

最近的查询可以按任何可用字段进行筛选和排序。表格还可以配置以显示或隐藏其他字段，例如表、p90 和 p99 延迟。

## 查询详细信息 {#query-drill-down}

从最近的查询表中选择一个查询将打开一个侧边栏，其中包含特定于所选查询的指标和信息：

<Image img={insights_drilldown} size="md" alt="查询洞察 UI 查询详细信息" border/>

从侧边栏可以看到，此特定查询在过去 24 小时内运行了超过 3000 次。**查询信息** 标签中的所有指标都是聚合指标，但我们还可以通过选择 **查询历史** 标签查看单次运行的指标：

<Image img={insights_query_info} size="sm" alt="查询洞察 UI 查询信息" border/>

<br />

在此窗格中，可以展开每次查询运行的 `设置` 和 `性能事件` 项，以显示其他信息。
