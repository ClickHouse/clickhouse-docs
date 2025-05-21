---
'sidebar_title': 'Query Insights'
'slug': '/cloud/get-started/query-insights'
'description': '可视化 system.query_log 数据，简化查询调试和性能优化'
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


# 查询洞察 {#query-insights}

**查询洞察**功能通过各种可视化和表格使ClickHouse内置的查询日志更易于使用。ClickHouse的`system.query_log`表是查询优化、调试和监控整体集群健康与性能的重要信息来源。

## 查询概览 {#query-overview}

选择服务后，左侧边栏的**监控**导航项应展开以显示新的**查询洞察**子项。点击此选项将打开新的查询洞察页面：

<Image img={insights_overview} size="md" alt="查询洞察 UI 概览" border/>

## 顶级指标 {#top-level-metrics}

顶部的统计框代表所选时间段内一些基本的顶级查询指标。其下方显示了三个时间序列图，分别表示不同查询种类（select, insert, other）在所选时间窗口内的查询量、延迟和错误率。延迟图还可以进一步调整以显示p50、p90和p99延迟：

<Image img={insights_latency} size="md" alt="查询洞察 UI 延迟图" border/>

## 最近的查询 {#recent-queries}

在顶级指标下方，表格显示了所选时间窗口内的查询日志条目（按标准化查询哈希和用户分组）：

<Image img={insights_recent} size="md" alt="查询洞察 UI 最近查询表" border/>

最近的查询可以根据任何可用字段进行过滤和排序。该表也可以配置以显示或隐藏额外的字段，例如表格、p90和p99延迟。

## 查询深入分析 {#query-drill-down}

从最近的查询表中选择一个查询将打开一个浮动面板，其中包含特定于所选查询的指标和信息：

<Image img={insights_drilldown} size="md" alt="查询洞察 UI 查询深入分析" border/>

从浮动面板中我们可以看到，这个特定查询在过去24小时内运行了超过3000次。**查询信息**选项卡中的所有指标都是汇总指标，但我们也可以通过选择**查询历史**选项卡查看单次运行的指标：

<Image img={insights_query_info} size="sm" alt="查询洞察 UI 查询信息" border/>

<br />

在此面板中，可以展开每次查询运行的`设置`和`配置事件`项，以显示更多信息。
