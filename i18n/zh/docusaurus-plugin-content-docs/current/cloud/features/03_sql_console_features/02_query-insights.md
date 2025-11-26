---
sidebar_title: '查询洞察'
slug: /cloud/get-started/query-insights
description: '可视化 system.query_log 数据，以简化查询调试和性能优化'
keywords: ['query insights', 'query log', 'query log ui', 'system.query_log insights']
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

**查询洞察（Query Insights）** 功能通过多种可视化和表格，使 ClickHouse 内置的查询日志更易用。ClickHouse 的 `system.query_log` 表是进行查询优化、调试，以及监控整个集群健康状况和性能的关键信息来源。



## 查询概览 {#query-overview}

选择某个服务后，左侧边栏中的 **Monitoring** 导航项会展开，显示一个新的 **Query insights** 子项。点击该选项会打开新的 Query Insights 页面：

<Image img={insights_overview} size="md" alt="Query Insights UI Overview" border/>



## 顶层指标 {#top-level-metrics}

顶部的统计卡片展示了在所选时间范围内的一些基础顶层查询指标。在其下方，可以看到三个时间序列图表，分别展示在选定时间窗口内按查询类型（select、insert、other）划分的查询量、延迟和错误率。延迟图表还可以进一步调整，以显示 p50、p90 和 p99 分位延迟：

<Image img={insights_latency} size="md" alt="Query Insights UI Latency Chart" border/>



## 最近查询 {#recent-queries}

在顶层指标下方会显示一个表格，其中包含在所选时间窗口内的查询日志记录（按标准化查询哈希和用户分组）：

<Image img={insights_recent} size="md" alt="Query Insights UI Recent Queries Table" border/>

可以按任意可用字段筛选和排序最近查询。还可以配置该表以显示或隐藏其他字段，例如表名、p90 和 p99 延迟。



## 查询下钻 {#query-drill-down}

在“最近查询”表格中选择某个查询时，会打开一个飞出面板，其中包含该查询特有的指标和信息：

<Image img={insights_drilldown} size="md" alt="Query Insights UI Query Drill down" border/>

从飞出面板可以看到，在过去 24 小时内，此查询已运行超过 3000 次。**Query info** 选项卡中的所有指标都是聚合指标，但我们也可以通过选择 **Query history** 选项卡来查看单次运行的指标：

<Image img={insights_query_info} size="sm" alt="Query Insights UI Query Information" border/>

<br />

在该面板中，可以展开每次查询运行的 `Settings` 和 `Profile Events` 项以查看更多信息。
