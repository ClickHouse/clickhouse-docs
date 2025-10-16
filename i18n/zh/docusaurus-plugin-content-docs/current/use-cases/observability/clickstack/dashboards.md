---
'slug': '/use-cases/observability/clickstack/dashboards'
'title': '使用 ClickStack 的可视化和仪表板'
'sidebar_label': '仪表板'
'pagination_prev': null
'pagination_next': null
'description': '使用 ClickStack 的可视化和仪表板'
'doc_type': 'guide'
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

ClickStack 支持事件的可视化，并内置支持在 HyperDX 中进行图表绘制。这些图表可以添加到仪表板中，与其他用户共享。

可视化可以从跟踪、度量、日志或任何用户定义的宽事件模式中创建。

## 创建可视化 {#creating-visualizations}

HyperDX 中的 **Chart Explorer** 界面允许用户可视化度量、跟踪和日志，方便地创建数据分析的快速可视化。此界面在创建仪表板时也会重用。以下部分介绍了使用 Chart Explorer 创建可视化的过程。

每个可视化都从选择 **数据源** 开始，接着选择 **度量**，可以添加可选的 **过滤表达式** 和 **分组** 字段。从概念上讲，HyperDX 中的可视化底层映射到 SQL `GROUP BY` 查询 — 用户定义跨所选维度的度量以聚合。

例如，您可以根据服务名称绘制错误数量 (`count()`) 的图表。

在以下示例中，我们使用在 [sql.clickhouse.com](https://sql.clickhouse.com) 上提供的远程数据集，如指南 ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data) 中所描述。**用户还可以通过访问 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 重现这些示例。**

<VerticalStepper headerLevel="h3">

### 导航到 Chart Explorer {#navigate-chart-explorer}

从左侧菜单中选择 `Chart Explorer`。

<Image img={visualization_1} alt="Chart Explorer" size="lg"/>

### 创建可视化 {#create-visualization}

在下面的示例中，我们根据服务名称绘制平均请求时长的随时间变化的图表。这需要用户指定一个度量、一列（可以是 SQL 表达式）和一个聚合字段。

从顶部菜单中选择 `Line/Bar` 可视化类型，然后选择 `Traces`（或如果使用 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)，选择 `Demo Traces`）数据集。填写以下值：

- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

<Image img={visualization_2} alt="Simple visualization" size="lg"/>

注意，用户可以使用 SQL `WHERE` 子句或 Lucene 语法过滤事件，并设置要可视化事件的时间范围。也支持多个系列。

例如，通过添加过滤器 `ServiceName:"frontend"` 来按服务 `frontend` 进行过滤。通过点击 `Add Series` 添加第二个系列，以 `Count` 为别名显示随时间变化的事件计数。

<Image img={visualization_3} alt="Simple visualization 2" size="lg"/>

:::note
可视化可以从任何数据源创建 — 无论是度量、跟踪还是日志。ClickStack 将所有这些视为宽事件。任何 **数值列** 都可以随时间绘制，**字符串**、**日期**或 **数值** 列可用于分组。

这种统一的方法使用户能够使用一致且灵活的模型在各种遥测类型之间构建仪表板。
:::

</VerticalStepper>

## 创建仪表板 {#creating-dashboards}

仪表板提供了一种将相关可视化分组的方式，使用户能够并排比较度量并探索模式，以识别其系统中潜在的根本原因。这些仪表板可以用于临时调查，或保存用于持续监控。

全局过滤器可以在仪表板级别应用，自动传播到该仪表板内的所有可视化。这允许在图表之间一致地深入挖掘，并简化跨服务和遥测类型的事件关联。

我们在下面创建一个包含两个可视化的仪表板，使用日志和跟踪数据源。这些步骤可以在 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 或通过连接到托管在 [sql.clickhouse.com](https://sql.clickhouse.com) 上的数据集本地重现，如指南 ["Remote Demo Dataset"](/use-cases/observability/clickstack/getting-started/remote-demo-data) 中所述。

<VerticalStepper headerLevel="h3">

### 导航到仪表板 {#navigate-dashboards}

从左侧菜单中选择 `Dashboards`。

<Image img={dashboard_1} alt="Create Dashboard" size="lg"/>

默认情况下，仪表板是临时的，以支持临时调查。

如果使用您自己的 HyperDX 实例，您可以确保稍后可以保存此仪表板，通过点击 `Create New Saved Dashboard`。如果使用只读环境 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)，则此选项将不可用。

### 创建可视化 – 按服务的平均请求时间 {#create-a-tile}

选择 `Add New Tile` 打开可视化创建面板。

从顶部菜单中选择 `Line/Bar` 可视化类型，然后选择 `Traces`（或如果使用 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)，选择 `Demo Traces`）数据集。填写以下值以创建图表，显示按服务名称平均请求时长随时间的变化：

- Chart Name: `Average duration by service`  
- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

点击 **play** 按钮后，再点击 `Save`。

<Image img={dashboard_2} alt="Create Dashboard Visualization" size="lg"/>

调整可视化大小，使其占据仪表板的整个宽度。

<Image img={dashboard_3} alt="Dashboard with visuals" size="lg"/>

### 创建可视化 – 按服务的事件随时间变化 {#create-a-tile-2}

选择 `Add New Tile` 打开可视化创建面板。

从顶部菜单中选择 `Line/Bar` 可视化类型，然后选择 `Logs`（或如果使用 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)，选择 `Demo Logs`）数据集。填写以下值以创建图表，显示按服务名称的事件随时间变化的计数：

- Chart Name: `Event count by service`  
- Metric: `Count of Events`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Count of events`

点击 **play** 按钮后，再点击 `Save`。

<Image img={dashboard_4} alt="Dashboard Visualization 2" size="lg"/>

调整可视化大小，使其占据仪表板的整个宽度。

<Image img={dashboard_5} alt="Dashboard with visuals 2" size="lg"/>

### 过滤仪表板 {#filter-dashboards}

Lucene 或 SQL 过滤器，以及时间范围，可以在仪表板级别应用，并将自动传播到所有可视化。

<Image img={dashboard_filter} alt="Dashboard with filtering" size="lg"/>

为演示，应用 Lucene 过滤器 `ServiceName:"frontend"` 到仪表板，并修改时间窗口以覆盖过去 3 小时。请注意，图表现在仅反映来自 `frontend` 服务的数据。

仪表板将自动保存。要设置仪表板名称，请选择标题并在点击 `Save Name` 之前进行修改。

<Image img={dashboard_save} alt="Dashboard save" size="lg"/>

</VerticalStepper>

## 仪表板 - 编辑可视化 {#dashboards-editing-visualizations}

要删除、编辑或复制可视化，请将鼠标悬停在其上并使用相应的操作按钮。

<Image img={dashboard_edit} alt="Dashboard edit" size="lg"/>

## 仪表板列表和搜索 {#dashboard-listing-search}

仪表板可从左侧菜单访问，并内置搜索以快速定位特定仪表板。

<Image img={dashboard_search} alt="Dashboard search" size="sm"/>

## 预设 {#presets}

HyperDX 部署时带有开箱即用的仪表板。

### ClickHouse 仪表板 {#clickhouse-dashboard}

此仪表板提供监控 ClickHouse 的可视化。要导航到此仪表板，请从左侧菜单中选择它。

<Image img={dashboard_clickhouse} alt="ClickHouse dashboard" size="lg"/>

此仪表板使用标签将 **选择**、**插入** 和 **ClickHouse 基础设施** 的监控分开。

:::note 需要系统表访问权限
此仪表板查询 ClickHouse [系统表](/operations/system-tables) 以暴露关键度量。以下权限是必需的：

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### 服务仪表板 {#services-dashboard}

服务仪表板根据跟踪数据展示当前活动的服务。这要求用户收集了跟踪数据并配置了有效的 Traces 数据源。

服务名称会从跟踪数据中自动检测，并将一系列预构建的可视化组织在三个标签中：HTTP 服务、数据库和错误。

可视化可以使用 Lucene 或 SQL 语法过滤，时间窗口也可以调整以进行针对性分析。

<Image img={dashboard_services} alt="ClickHouse services" size="lg"/>

### Kubernetes 仪表板 {#kubernetes-dashboard}

此仪表板允许用户查看通过 OpenTelemetry 收集的 Kubernetes 事件。它包含高级过滤选项，用户可以按 Kubernetes Pod、Deployment、Node 名称、Namespace 和 Cluster 进行过滤，以及执行自由文本搜索。

Kubernetes 数据分为三个标签，便于导航：Pods、Nodes 和 Namespaces。

<Image img={dashboard_kubernetes} alt="ClickHouse kubernetes" size="lg"/>
