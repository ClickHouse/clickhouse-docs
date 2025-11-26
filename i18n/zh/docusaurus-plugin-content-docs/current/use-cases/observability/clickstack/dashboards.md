---
slug: /use-cases/observability/clickstack/dashboards
title: '使用 ClickStack 的可视化和仪表板'
sidebar_label: '仪表板'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 的可视化和仪表板'
doc_type: 'guide'
keywords: ['clickstack', '仪表板', '可视化', '监控', '可观测性']
---

import Image from '@theme/IdealImage';
import visualization_1 from '@site/static/images/use-cases/observability/hyperdx-visualization-1.png';
import visualization_2 from '@site/static/images/use-cases/observability/hyperdx-visualization-2.png';
import visualization_3 from '@site/static/images/use-cases/observability/hyperdx-visualization-3.png';
import dashboard_1 from '@site/static/images/use-cases/observability/hyperdx-dashboard-1.png';
import dashboard_2 from '@site/static/images/use-cases/observability/hyperdx-dashboard-2.png';
import dashboard_3 from '@site/static/images/use-cases/observability/hyperdx-dashboard-3.png';
import dashboard_4 from '@site/static/images/use-cases/observability/hyperdx-dashboard-4.png';
import dashboard_5 from '@site/static/images/use-cases/observability/hyperdx-dashboard-5.png';
import dashboard_filter from '@site/static/images/use-cases/observability/hyperdx-dashboard-filter.png';
import dashboard_save from '@site/static/images/use-cases/observability/hyperdx-dashboard-save.png';
import dashboard_search from '@site/static/images/use-cases/observability/hyperdx-dashboard-search.png';
import dashboard_edit from '@site/static/images/use-cases/observability/hyperdx-dashboard-edit.png';
import dashboard_clickhouse from '@site/static/images/use-cases/observability/hyperdx-dashboard-clickhouse.png';
import dashboard_services from '@site/static/images/use-cases/observability/hyperdx-dashboard-services.png';
import dashboard_kubernetes from '@site/static/images/use-cases/observability/hyperdx-dashboard-kubernetes.png';
import Tagging from '@site/docs/_snippets/_clickstack_tagging.mdx';

ClickStack 支持事件可视化，并在 HyperDX 中内置了图表功能。这些图表可以添加到仪表盘中，与其他用户共享。

可视化内容可以基于 traces、metrics、logs 或任何用户自定义的宽表事件 schema 创建。


## 创建可视化图表 {#creating-visualizations}

HyperDX 中的 **Chart Explorer** 界面允许用户随时间对指标、追踪和日志进行可视化展示，从而可以轻松创建用于数据分析的快速可视化图表。创建仪表板时也会复用该界面。以下部分将逐步介绍如何使用 Chart Explorer 创建可视化图表。

每个可视化从选择一个 **数据源** 开始，然后选择一个 **metric（指标）**，并可选地添加 **filter expressions（过滤表达式）** 和 **group by** 字段。从概念上讲，HyperDX 中的可视化在底层对应一条带有 `GROUP BY` 的 SQL 查询——用户定义需要在选定维度上进行聚合的指标。

例如，你可以绘制按服务名分组的错误数量（`count()`）图表。

在以下示例中，我们使用托管在 [sql.clickhouse.com](https://sql.clickhouse.com) 的远程数据集，该数据集在指南「[Remote Demo Dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data)」中有详细说明。**用户也可以访问 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 来复现这些示例。**

<VerticalStepper headerLevel="h3">

### 进入 Chart Explorer {#navigate-chart-explorer}

从左侧菜单中选择 `Chart Explorer`。

<Image img={visualization_1} alt="Chart Explorer" size="lg"/>

### 创建可视化图表 {#create-visualization}

在下面的示例中，我们按服务名绘制一段时间内的平均请求耗时。这需要用户指定一个 metric（指标）、一列（可以是 SQL 表达式），以及一个聚合字段。

从顶部菜单中选择 `Line/Bar` 可视化类型，然后选择 `Traces` 数据集（如果使用 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)，则选择 `Demo Traces` 数据集）。将以下值配置为：

- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

<Image img={visualization_2} alt="简单可视化" size="lg"/>

请注意，用户可以使用 SQL `WHERE` 子句或 Lucene 语法来过滤事件，并设置事件应被可视化展示的时间范围。也支持多条数据序列。

例如，可以通过添加过滤条件 `ServiceName:"frontend"` 来按服务 `frontend` 进行过滤。然后点击 `Add Series`，添加第二条用于展示随时间变化的事件数量的数据序列，并将别名设置为 `Count`。

<Image img={visualization_3} alt="简单可视化 2" size="lg"/>

:::note
可视化可以基于任何数据源创建——包括 metrics、traces 或 logs。ClickStack 将所有这些都视为宽事件（wide events）。任何 **numeric（数值）列** 都可以随时间绘制图表，而 **string（字符串）**、**date（日期）** 或 **numeric（数值）** 列都可以用于分组。

这种统一的方法允许用户在不同遥测类型之上，使用一致且灵活的模型来构建仪表板。
:::

</VerticalStepper>



## 创建仪表盘 {#creating-dashboards}

仪表盘提供了一种将相关可视化分组的方式，使用户能够并排比较指标并探索模式，从而识别系统中的潜在根本原因。这些仪表盘既可用于临时排查，也可以保存起来用于持续监控。

可以在仪表盘级别应用全局过滤器，并自动应用到该仪表盘中的所有可视化。这便于在图表间进行一致的下钻，并简化跨服务和遥测类型的事件关联。

下面我们使用日志和追踪数据源创建一个包含两个可视化的仪表盘。你可以在 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 上复现这些步骤，或者像指南 ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data) 中所述，通过连接托管在 [sql.clickhouse.com](https://sql.clickhouse.com) 上的数据集在本地进行操作。

<VerticalStepper headerLevel="h3">

### 导航到 Dashboards {#navigate-dashboards}

从左侧菜单中选择 `Dashboards`。

<Image img={dashboard_1} alt="创建仪表盘" size="lg"/>

默认情况下，仪表盘是临时的，以支持临时排查。

如果你使用自己的 HyperDX 实例，可以点击 `Create New Saved Dashboard` 来确保该仪表盘后续可以被保存。如果使用只读环境 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)，该选项将不可用。

### 创建可视化 – 按服务的平均请求时间 {#create-a-tile}

选择 `Add New Tile` 打开可视化创建面板。

在顶部菜单中选择 `Line/Bar` 可视化类型，然后选择 `Traces` 数据集（如果使用 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)，则选择 `Demo Traces`）。按如下内容填写，以创建一个显示每个服务名称随时间变化的平均请求时长的图表：

- Chart Name: `Average duration by service`  
- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

在点击 `Save` 之前先点击 **播放** 按钮。

<Image img={dashboard_2} alt="创建仪表盘可视化" size="lg"/>

调整可视化大小，使其占据仪表盘的完整宽度。

<Image img={dashboard_3} alt="带可视化的仪表盘" size="lg"/>

### 创建可视化 – 按服务的事件随时间变化 {#create-a-tile-2}

选择 `Add New Tile` 打开可视化创建面板。

在顶部菜单中选择 `Line/Bar` 可视化类型，然后选择 `Logs` 数据集（如果使用 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)，则选择 `Demo Logs`）。按如下内容填写，以创建一个显示每个服务名称随时间变化的事件计数的图表：

- Chart Name: `Event count by service`  
- Metric: `Count of Events`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Count of events`

在点击 `Save` 之前先点击 **播放** 按钮。

<Image img={dashboard_4} alt="仪表盘可视化 2" size="lg"/>

调整可视化大小，使其占据仪表盘的完整宽度。

<Image img={dashboard_5} alt="带可视化的仪表盘 2" size="lg"/>

### 筛选仪表盘 {#filter-dashboards}

可以在仪表盘级别应用 Lucene 或 SQL 过滤器以及时间范围，它们会自动应用到所有可视化。

<Image img={dashboard_filter} alt="带筛选的仪表盘" size="lg"/>

作为演示，在仪表盘上应用 Lucene 过滤器 `ServiceName:"frontend"`，并将时间窗口修改为最近 3 小时。此时可视化将仅反映来自 `frontend` 服务的数据。

仪表盘会自动保存。要设置仪表盘名称，选择标题并进行修改，然后点击 `Save Name`。

<Image img={dashboard_save} alt="仪表盘保存" size="lg"/>

</VerticalStepper>



## 仪表板 - 编辑可视化 {#dashboards-editing-visualizations}

要删除、编辑或复制某个可视化组件，将鼠标悬停其上，然后使用相应的操作按钮。

<Image img={dashboard_edit} alt="Dashboard edit" size="lg"/>



## 仪表板 - 列表和搜索 {#dashboard-listing-search}

你可以通过左侧菜单进入仪表板，并使用内置搜索功能快速找到特定的仪表板。
<Image img={dashboard_search} alt="Dashboard search" size="sm"/>



## 仪表板 - 标签 {#tagging}
<Tagging />



## 预设 {#presets}

HyperDX 部署时自带开箱即用的仪表板。

### ClickHouse 仪表板 {#clickhouse-dashboard}

此仪表板提供用于监控 ClickHouse 的可视化视图。要访问此仪表板，请在左侧菜单中选择该仪表板。

<Image img={dashboard_clickhouse} alt="ClickHouse dashboard" size="lg"/>

此仪表板使用多个选项卡分别展示对 **Selects**、**Inserts** 和 **ClickHouse Infrastructure** 的监控。

:::note 所需的 system 表访问权限
此仪表板会查询 ClickHouse 的 [system 表](/operations/system-tables) 以展示关键指标。需要以下授权：

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### Services 仪表板 {#services-dashboard}

Services 仪表板基于 trace 数据显示当前处于活动状态的服务。为此，用户需要已采集跟踪数据并配置有效的 Traces 数据源。

服务名称会从 trace 数据中自动检测，多组预构建可视化视图被组织在三个选项卡中：HTTP Services、Database 和 Errors。

可视化视图可以使用 Lucene 或 SQL 语法进行筛选，并可调整时间窗口以便进行更聚焦的分析。

<Image img={dashboard_services} alt="ClickHouse services" size="lg"/>

### Kubernetes 仪表板 {#kubernetes-dashboard}

此仪表板允许用户探索通过 OpenTelemetry 收集的 Kubernetes 事件。它包含高级筛选选项，用户可以按 Kubernetes Pod（容器组）、部署、节点名称、命名空间和集群进行筛选，并执行自由文本搜索。

Kubernetes 数据被组织在三个选项卡中以便于导航：Pods、Nodes 和 Namespaces。

<Image img={dashboard_kubernetes} alt="ClickHouse kubernetes" size="lg"/>
