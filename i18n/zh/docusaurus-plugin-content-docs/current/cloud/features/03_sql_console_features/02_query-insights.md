---
sidebar_title: '查询洞察'
slug: /cloud/get-started/query-insights
description: '可视化 system.query_log 数据，以简化查询调试和性能优化'
keywords: ['查询洞察', '查询日志', '查询日志 UI', 'system.query_log 洞察']
title: '查询洞察'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import insights_overview from '@site/static/images/cloud/sqlconsole/insights_overview.png';
import insights_latency from '@site/static/images/cloud/sqlconsole/insights_latency.png';
import insights_recent from '@site/static/images/cloud/sqlconsole/insights_recent.png';
import insights_drilldown from '@site/static/images/cloud/sqlconsole/insights_drilldown.png';
import insights_query_info from '@site/static/images/cloud/sqlconsole/insights_query_info.png';


# 查询洞察

**查询洞察（Query Insights）** 功能通过多种可视化视图和表格，使 ClickHouse 的内置查询日志更易于使用。ClickHouse 的 `system.query_log` 表是进行查询优化、调试以及监控整个集群健康状况和性能的关键信息来源。



## 查询概览 {#query-overview}

选择服务后,左侧边栏中的**监控**导航项会展开,显示一个新的 **Query insights** 子项。点击该选项即可打开新的 Query insights 页面:

<Image
  img={insights_overview}
  size='md'
  alt='Query Insights 用户界面概览'
  border
/>


## 顶层指标 {#top-level-metrics}

顶部的统计框显示所选时间段内的基本顶层查询指标。下方展示了三个时间序列图表,分别表示在所选时间窗口内按查询类型(select、insert、其他)细分的查询量、延迟和错误率。延迟图表可进一步调整以显示 p50、p90 和 p99 延迟:

<Image
  img={insights_latency}
  size='md'
  alt='查询洞察 UI 延迟图表'
  border
/>


## 最近查询 {#recent-queries}

在顶层指标下方,表格显示了所选时间窗口内的查询日志条目(按规范化查询哈希值和用户分组):

<Image
  img={insights_recent}
  size='md'
  alt='Query Insights UI 最近查询表格'
  border
/>

最近查询可以按任何可用字段进行筛选和排序。该表格还可以配置为显示或隐藏其他字段,例如表名、p90 和 p99 延迟。


## 查询详细分析 {#query-drill-down}

从最近查询表中选择一个查询后,将打开一个浮出面板,显示该查询的相关指标和详细信息:

<Image
  img={insights_drilldown}
  size='md'
  alt='Query Insights 界面查询详细分析'
  border
/>

从浮出面板可以看到,该查询在过去 24 小时内已执行超过 3000 次。**查询信息**选项卡中的所有指标均为聚合指标,但我们也可以通过选择**查询历史**选项卡来查看单次执行的指标:

<Image
  img={insights_query_info}
  size='sm'
  alt='Query Insights 界面查询信息'
  border
/>

<br />

在此面板中,可以展开每次查询执行的 `Settings` 和 `Profile Events` 项以查看更多详细信息。
