---
sidebar_title: '查询洞察'
slug: /cloud/get-started/query-insights
description: '可视化 system.query_log 数据，以简化查询调试和性能优化'
keywords: ['查询洞察', '查询日志', '查询日志 UI', 'system.query_log 洞察']
---

import insights_overview from '@site/static/images/cloud/sqlconsole/insights_overview.png';
import insights_latency from '@site/static/images/cloud/sqlconsole/insights_latency.png';
import insights_recent from '@site/static/images/cloud/sqlconsole/insights_recent.png';
import insights_drilldown from '@site/static/images/cloud/sqlconsole/insights_drilldown.png';
import insights_query_info from '@site/static/images/cloud/sqlconsole/insights_query_info.png';


# 查询洞察

**查询洞察**功能通过各种可视化和表格使 ClickHouse 内置的查询日志更易于使用。ClickHouse 的 `system.query_log` 表是查询优化、调试和监控整体集群健康和性能的重要信息源。

## 查询概述 {#query-overview}

选择服务后，左侧边栏中的 **监控** 导航项应展开，显示一个新的 **查询洞察** 子项。点击此选项会打开新的查询洞察页面：

<img src={insights_overview} alt="查询洞察 UI 概览"/>

## 高级指标 {#top-level-metrics}

顶部的状态框代表所选时间段内一些基本的高级查询指标。在其下方，我们展示了三个时间序列图，表示不同查询类型（选择、插入、其他）在所选时间窗口内的查询量、延迟和错误率。延迟图可以进一步调整，以显示 p50、p90 和 p99 延迟：

<img src={insights_latency} alt="查询洞察 UI 延迟图"/>

## 最近查询 {#recent-queries}

在高级指标下方，表格显示了在所选时间窗口内的查询日志条目（按标准化查询哈希和用户分组）：

<img src={insights_recent} alt="查询洞察 UI 最近查询表格"/>

最近的查询可以按任何可用字段进行过滤和排序。表格还可以配置以显示或隐藏其他字段，如表、p90 和 p99 延迟。

## 查询深入 {#query-drill-down}

从最近查询表中选择一个查询将打开一个浮动窗口，包含特定于所选查询的指标和信息：

<img src={insights_drilldown} alt="查询洞察 UI 查询深入"/>

从浮动窗口可以看到，这个特定查询在过去 24 小时内运行了超过 3000 次。**查询信息**选项卡中的所有指标都是聚合指标，但我们也可以通过选择 **查询历史**选项卡查看单个运行的指标：

<img src={insights_query_info}    
  class="image"
  alt="查询洞察 UI 查询信息"
  style={{width: '400px'}} />

<br />

在此面板中，每次查询运行的 `设置` 和 `性能事件` 项目可以展开以显示更多信息。
