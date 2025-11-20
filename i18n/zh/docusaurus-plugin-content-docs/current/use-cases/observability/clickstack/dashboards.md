---
slug: /use-cases/observability/clickstack/dashboards
title: "使用 ClickStack 构建可视化与仪表板"
sidebar_label: "仪表板"
pagination_prev: null
pagination_next: null
description: "使用 ClickStack 构建可视化与仪表板"
doc_type: 'guide'
keywords: ['clickstack', 'dashboards', 'visualization', 'monitoring', 'observability']
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

ClickStack 支持对事件进行可视化，并内置了在 HyperDX 中绘制图表的功能。这些图表可以添加到仪表板中，与其他用户共享。

可视化可以基于 traces、metrics、logs，或任意用户自定义的宽事件模式创建。


## 创建可视化 {#creating-visualizations}

HyperDX 中的 **Chart Explorer** 界面允许用户对指标、追踪和日志进行时序可视化,便于快速创建可视化图表进行数据分析。该界面在创建仪表板时也会被复用。以下部分将介绍使用 Chart Explorer 创建可视化的过程。

每个可视化都从选择**数据源**开始,然后选择**指标**,并可选择**过滤表达式**和 **group by** 字段。从概念上讲,HyperDX 中的可视化在底层映射到 SQL `GROUP BY` 查询——用户定义要在所选维度上进行聚合的指标。

例如,您可以绘制按服务名称分组的错误数量(`count()`)图表。

对于以下示例,我们使用 [sql.clickhouse.com](https://sql.clickhouse.com) 上提供的远程数据集,该数据集在["远程演示数据集"](/use-cases/observability/clickstack/getting-started/remote-demo-data)指南中有详细说明。**用户也可以通过访问 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 来重现这些示例。**

<VerticalStepper headerLevel="h3">

### 导航到 Chart Explorer {#navigate-chart-explorer}

从左侧菜单中选择 `Chart Explorer`。

<Image img={visualization_1} alt='Chart Explorer' size='lg' />

### 创建可视化 {#create-visualization}

在下面的示例中,我们绘制每个服务名称随时间变化的平均请求持续时间图表。这需要用户指定一个指标、一个列(可以是 SQL 表达式)和一个聚合字段。

从顶部菜单中选择 `Line/Bar` 可视化类型,然后选择 `Traces`(如果使用 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 则选择 `Demo Traces`)数据集。填写以下值:

- 指标:`Average`
- 列:`Duration/1000`
- 条件:`<empty>`
- 分组依据:`ServiceName`
- 别名:`Average Time`

<Image img={visualization_2} alt='Simple visualization' size='lg' />

请注意,用户可以使用 SQL `WHERE` 子句或 Lucene 语法过滤事件,并设置事件可视化的时间范围。还支持多个系列。

例如,通过添加过滤器 `ServiceName:"frontend"` 来按服务 `frontend` 进行过滤。点击 `Add Series` 添加第二个系列,用于统计随时间变化的事件数量,别名为 `Count`。

<Image img={visualization_3} alt='Simple visualization 2' size='lg' />

:::note
可视化可以从任何数据源创建——指标、追踪或日志。ClickStack 将所有这些都视为宽事件。任何**数值列**都可以随时间绘制图表,**字符串**、**日期**或**数值**列都可以用于分组。

这种统一的方法允许用户使用一致、灵活的模型跨遥测类型构建仪表板。
:::

</VerticalStepper>


## 创建仪表板 {#creating-dashboards}

仪表板提供了一种将相关可视化图表分组的方式,使用户能够并排比较指标和探索模式,从而识别系统中的潜在根本原因。这些仪表板既可用于临时调查,也可保存用于持续监控。

全局过滤器可以在仪表板级别应用,并自动传播到该仪表板内的所有可视化图表。这样可以在图表之间进行一致的下钻操作,并简化跨服务和遥测类型的事件关联分析。

下面我们使用日志和追踪数据源创建一个包含两个可视化图表的仪表板。这些步骤可以在 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 上重现,或者通过连接到托管在 [sql.clickhouse.com](https://sql.clickhouse.com) 上的数据集在本地重现,具体说明请参见["远程演示数据集"](/use-cases/observability/clickstack/getting-started/remote-demo-data)指南。

<VerticalStepper headerLevel="h3">

### 导航到仪表板 {#navigate-dashboards}

从左侧菜单中选择 `Dashboards`。

<Image img={dashboard_1} alt='Create Dashboard' size='lg' />

默认情况下,仪表板是临时的,以支持临时调查。

如果使用您自己的 HyperDX 实例,可以通过点击 `Create New Saved Dashboard` 来确保此仪表板稍后可以保存。如果使用只读环境 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com),此选项将不可用。

### 创建可视化图表 – 按服务统计的平均请求时间 {#create-a-tile}

选择 `Add New Tile` 以打开可视化图表创建面板。

从顶部菜单中选择 `Line/Bar` 可视化类型,然后选择 `Traces`(如果使用 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 则选择 `Demo Traces`)数据集。填写以下值以创建一个显示每个服务名称随时间变化的平均请求持续时间的图表:

- Chart Name: `Average duration by service`
- Metric: `Average`
- Column: `Duration/1000`
- Where: `<empty>`
- Group By: `ServiceName`
- Alias: `Average Time`

在点击 `Save` 之前点击 **play** 按钮。

<Image img={dashboard_2} alt='Create Dashboard Visualization' size='lg' />

调整可视化图表的大小以占据仪表板的全部宽度。

<Image img={dashboard_3} alt='Dashboard with visuals' size='lg' />

### 创建可视化图表 – 按服务统计的事件随时间变化 {#create-a-tile-2}

选择 `Add New Tile` 以打开可视化图表创建面板。

从顶部菜单中选择 `Line/Bar` 可视化类型,然后选择 `Logs`(如果使用 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 则选择 `Demo Logs`)数据集。填写以下值以创建一个显示每个服务名称随时间变化的事件计数的图表:

- Chart Name: `Event count by service`
- Metric: `Count of Events`
- Where: `<empty>`
- Group By: `ServiceName`
- Alias: `Count of events`

在点击 `Save` 之前点击 **play** 按钮。

<Image img={dashboard_4} alt='Dashboard Visualization 2' size='lg' />

调整可视化图表的大小以占据仪表板的全部宽度。

<Image img={dashboard_5} alt='Dashboard with visuals 2' size='lg' />

### 过滤仪表板 {#filter-dashboards}

Lucene 或 SQL 过滤器以及时间范围可以在仪表板级别应用,并将自动传播到所有可视化图表。

<Image img={dashboard_filter} alt='Dashboard with filtering' size='lg' />

为了演示,将 Lucene 过滤器 `ServiceName:"frontend"` 应用到仪表板,并将时间窗口修改为覆盖最近 3 小时。注意可视化图表现在仅反映来自 `frontend` 服务的数据。

仪表板将自动保存。要设置仪表板名称,请选择标题并在点击 `Save Name` 之前修改它。

<Image img={dashboard_save} alt='Dashboard save' size='lg' />

</VerticalStepper>


## 仪表板 - 编辑可视化图表 {#dashboards-editing-visualizations}

要删除、编辑或复制可视化图表,将鼠标悬停在图表上并使用相应的操作按钮。

<Image img={dashboard_edit} alt='仪表板编辑' size='lg' />


## Dashboard - 列表和搜索 {#dashboard-listing-search}

可以从左侧菜单访问 Dashboard,内置搜索功能可快速定位特定的 Dashboard。

<Image img={dashboard_search} alt='Dashboard 搜索' size='sm' />


## 仪表板 - 标记 {#tagging}

<Tagging />


## 预设 {#presets}

HyperDX 部署时提供开箱即用的仪表板。

### ClickHouse 仪表板 {#clickhouse-dashboard}

此仪表板提供用于监控 ClickHouse 的可视化功能。要访问此仪表板,请从左侧菜单中选择。

<Image img={dashboard_clickhouse} alt='ClickHouse 仪表板' size='lg' />

此仪表板使用选项卡分别监控 **查询(Selects)**、**插入(Inserts)** 和 **ClickHouse 基础设施**。

:::note 所需的系统表访问权限
此仪表板查询 ClickHouse [系统表](/operations/system-tables)以展示关键指标。需要以下授权:

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### 服务仪表板 {#services-dashboard}

服务仪表板基于追踪数据显示当前活跃的服务。这要求用户已收集追踪数据并配置了有效的追踪数据源。

服务名称从追踪数据中自动检测,并提供一系列预构建的可视化视图,分布在三个选项卡中:HTTP 服务、数据库和错误。

可视化视图可以使用 Lucene 或 SQL 语法进行过滤,并且可以调整时间窗口以进行针对性分析。

<Image img={dashboard_services} alt='ClickHouse 服务' size='lg' />

### Kubernetes 仪表板 {#kubernetes-dashboard}

此仪表板允许用户探索通过 OpenTelemetry 收集的 Kubernetes 事件。它包含高级过滤选项,使用户能够按 Kubernetes Pod、Deployment、节点名称、命名空间和集群进行过滤,以及执行自由文本搜索。

Kubernetes 数据分布在三个选项卡中以便于导航:Pods、节点和命名空间。

<Image img={dashboard_kubernetes} alt='ClickHouse kubernetes' size='lg' />
