---
slug: /use-cases/observability/clickstack/dashboards
title: '使用 ClickStack 实现可视化和仪表板'
sidebar_label: '仪表板'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 实现可视化和仪表板'
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
import edit_filters from '@site/static/images/clickstack/dashboards/edit-filters.png';
import add_filter from '@site/static/images/clickstack/dashboards/add-filter.png';
import saved_filters from '@site/static/images/clickstack/dashboards/saved-filters.png';
import filtered_dashboard from '@site/static/images/clickstack/dashboards/filtered-dashboard.png';
import filter_dropdown from '@site/static/images/clickstack/dashboards/filter-dropdown.png';
import save_filter_values from '@site/static/images/clickstack/dashboards/save-filter-values.png';
import drilldown from '@site/static/images/clickstack/dashboards/drilldown.png';
import Tagging from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_clickstack_tagging.mdx';

ClickStack 支持对事件进行可视化，并在 ClickStack UI (HyperDX) 中内置了图表功能。您可以将这些图表添加到仪表板，与其他用户共享。

可视化可以基于链路追踪、指标、日志，或任意用户自定义的宽表事件 schema 创建。


## 创建可视化 \{#creating-visualizations\}

HyperDX 中的 **Chart Explorer** 界面允许你在时间维度上可视化指标、追踪和日志，从而轻松创建用于数据分析的快速可视化。该界面在创建仪表板时也会复用。下文将演示如何使用 Chart Explorer 创建一个可视化的完整流程。

每个可视化都从选择一个 **数据源** 开始，然后选择一个 **metric**，再根据需要添加 **filter expressions** 和 **group by** 字段。从概念上看，HyperDX 中的可视化对应于底层的一条 SQL `GROUP BY` 查询——你定义要在所选维度上聚合的指标。

:::tip AI 驱动的图表生成
ClickStack 还支持使用 [text-to-chart](/use-cases/observability/clickstack/text-to-chart) 功能，通过自然语言提示创建图表。描述你想看到的内容，ClickStack 会自动生成可视化。
:::

例如，可以绘制按服务名称分组的错误数量 (`count()`) 图表。

在下面的示例中，我们使用托管在 [sql.clickhouse.com](https://sql.clickhouse.com) 上的远程数据集，该数据集在指南「[Remote Demo Dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data)」中有详细说明。**你也可以访问 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 来复现这些示例。**

<VerticalStepper headerLevel="h3">
  ### 进入 Chart Explorer

  从左侧菜单中选择 `Chart Explorer`。

  <Image img={visualization_1} alt="Chart Explorer" size="lg" />

  ### 创建可视化

  在下面的示例中，我们按服务名称绘制一段时间内的平均请求耗时。这需要你指定一个 metric、一列 (可以是 SQL 表达式) 以及一个聚合字段。

  从顶部菜单中选择 `Line/Bar` 可视化类型，然后选择 `Traces` (或在使用 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 时选择 `Demo Traces`) 数据集。填写以下值：

  * Metric: `Average`
  * Column: `Duration/1000`
  * Where: `<empty>`
  * Group By: `ServiceName`
  * Alias: `Average Time`

  <Image img={visualization_2} alt="简单可视化" size="lg" />

  请注意，你可以使用 SQL `WHERE` 子句或 Lucene 语法来过滤事件，并设置事件可视化的时间范围。也支持多个序列。

  例如，通过添加过滤条件 `ServiceName:\"frontend\"` 来只保留服务 `frontend` 的事件。通过点击 `Add Series`，添加第二条时间序列，用别名 `Count` 展示一段时间内事件的数量。

  <Image img={visualization_3} alt="简单可视化 2" size="lg" />

  :::note
  可视化可以基于任意数据源创建——无论是 metrics、链路追踪 还是 logs。ClickStack 将这些全部视为宽事件 (wide events) 。任何 **numeric column** 都可以随时间绘制图表，而 **string**、**date** 或 **numeric** 列都可以用于分组。

  这种统一的方法允许你在不同遥测类型之间，基于一致且灵活的模型构建仪表板。
  :::
</VerticalStepper>

## 创建仪表板

仪表板提供了一种将相关可视化进行分组的方式，使用户能够将指标并排对比、挖掘模式，从而识别系统中的潜在根本原因。这些仪表板既可用于临时排查，也可以保存下来用于持续监控。

可以在仪表板级别应用全局筛选器，并自动作用于该仪表板中的所有可视化。这使得在各个图表之间进行一致的下钻分析成为可能，并简化了跨服务和遥测类型的事件关联。

下面我们使用日志和链路追踪数据源创建一个包含两个可视化的仪表板。你可以在 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 上复现这些步骤，或者在本地通过连接托管在 [sql.clickhouse.com](https://sql.clickhouse.com) 上的数据集进行操作，具体请参见指南 [&quot;Remote Demo Dataset&quot;](/use-cases/observability/clickstack/getting-started/remote-demo-data)。

<VerticalStepper headerLevel="h3">
  ### 导航到 仪表板

  从左侧菜单中选择 `Dashboards`。然后点击 `New Dashboard` 以创建临时仪表板或已保存的仪表板。

  <Image img={dashboard_1} alt="创建仪表板" size="lg" />

  ### 创建可视化 – 按服务的平均请求时间

  选择 `Add New Tile` 打开可视化创建面板。

  在顶部菜单中选择 `Line/Bar` 可视化类型，然后选择 `Traces` (如果使用 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)，则选择 `Demo Traces`) 数据集。完成以下配置，以创建一个展示按服务名称划分、随时间变化的平均请求时长的图表：

  * Chart Name: `Average duration by service`
  * Metric: `Average`
  * Column: `Duration/1000`
  * Where: `<empty>`
  * Group By: `ServiceName`
  * Alias: `Average Time`

  在点击 `Save` 之前先点击 **play** 按钮。

  <Image img={dashboard_2} alt="创建仪表板可视化" size="lg" />

  调整可视化大小，使其占据仪表板的全部宽度。

  <Image img={dashboard_3} alt="包含可视化的仪表板" size="lg" />

  ### 创建可视化 – 按服务的事件随时间分布

  选择 `Add New Tile` 打开可视化创建面板。

  在顶部菜单中选择 `Line/Bar` 可视化类型，然后选择 `Logs` (如果使用 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)，则选择 `Demo Logs`) 数据集。完成以下配置，以创建一个展示按服务名称划分、随时间变化的事件数量的图表：

  * Chart Name: `Event count by service`
  * Metric: `Count of Events`
  * Where: `<empty>`
  * Group By: `ServiceName`
  * Alias: `Count of events`

  在点击 `Save` 之前先点击 **play** 按钮。

  <Image img={dashboard_4} alt="仪表板可视化 2" size="lg" />

  调整可视化大小，使其占据仪表板的全部宽度。

  <Image img={dashboard_5} alt="包含可视化的仪表板 2" size="lg" />

  ### 筛选仪表板

  可以在仪表板级别应用 Lucene 或 SQL 筛选器，以及时间范围设置，这些会自动作用于所有可视化。

  <Image img={dashboard_filter} alt="带筛选的仪表板" size="lg" />

  作为示例，在仪表板上应用 Lucene 筛选器 `ServiceName:\"frontend\"`，并将时间窗口修改为最近 3 小时。此时可视化将仅反映来自 `frontend` 服务的数据。

  仪表板会自动保存。要设置仪表板名称，选择标题并修改，然后点击 `Save Name`。

  <Image img={dashboard_save} alt="保存仪表板" size="lg" />
</VerticalStepper>

## 仪表板 - 编辑可视化

要删除、编辑或复制可视化，将鼠标悬停其上，然后使用相应的操作按钮。

<Image img={dashboard_edit} alt="编辑仪表板" size="lg" />

## 仪表板 - 列表与搜索 \{#creating-dashboards\}

可以在仪表板页面查看仪表板。它们按标签组织，并提供内置搜索和筛选功能，以便快速查找特定仪表板。

可以将仪表板添加到收藏夹，以便在侧边栏和列表页面顶部快速访问。收藏夹对每个用户都是独立的。

<Image img={dashboard_search} alt="Dashboard search" size="lg" />

## 仪表板 - 标签

<Tagging />

## 自定义筛选器

除了所有仪表板都支持的[自由文本筛选器](#filter-dashboards)外，已保存的仪表板还支持自定义下拉筛选器，其选项由从 ClickHouse 查询得到的数据填充。这类筛选器提供可复用的点选式筛选控件，使仪表板查看者无需手动编写表达式即可进行筛选。

<Image img={filter_dropdown} alt="显示可用服务名称的服务下拉筛选器" size="lg" />

以下步骤演示如何为[“创建仪表板”](#creating-dashboards)部分中创建的仪表板添加自定义筛选器。

<VerticalStepper headerLevel="h3">
  ### 打开“编辑筛选器”对话框

  打开一个已保存的仪表板，然后在工具栏中选择**编辑筛选器**。

  <Image img={edit_filters} alt="仪表板工具栏中的“编辑筛选器”按钮" size="lg" />

  ### 添加新筛选器

  点击**添加新筛选器**。通过填写**名称**、选择**数据源**并输入**筛选表达式**来配置筛选器——即一个 SQL 列或表达式，其去重后的值将填充到下拉列表中。点击**保存筛选器**。

  例如，要为链路追踪数据添加服务筛选器，可使用 `ServiceName` 作为筛选表达式，并选择 `Traces` 数据源。**下拉值筛选器**为可选项，可用于限制下拉列表中显示的值。

  <Image img={add_filter} alt="包含“名称”、“数据源”和“筛选表达式”字段的“添加筛选器”对话框" size="md" />

  “筛选器”弹窗会显示为该仪表板配置的所有筛选器。你可以在此编辑或删除现有筛选器，也可以添加其他筛选器。

  <Image img={saved_filters} alt="显示已配置 Services 筛选器的“筛选器”弹窗" size="md" />

  ### 使用筛选器

  关闭“筛选器”弹窗。新的下拉筛选器会显示在搜索栏下方。点击它可查看可用值，然后选择一个值，以筛选该仪表板上的所有可视化内容。

  <Image img={filtered_dashboard} alt="已筛选到 frontend 服务的仪表板" size="lg" />

  ### &#x20;(可选) 将筛选值保存为默认值

  若要将某个筛选选择保存为仪表板的默认值，请在仪表板菜单中选择**将查询和筛选器保存为默认值**。之后，该仪表板打开时将始终应用所选筛选器。若要重置，请从同一菜单中选择**移除默认查询和筛选器**。

  <Image img={save_filter_values} alt="显示“将查询和筛选器保存为默认值”选项的仪表板菜单" size="lg" />
</VerticalStepper>

:::note
自定义下拉筛选器可用于已保存的仪表板。有关此模式实际应用的示例，请参见 [Kubernetes 仪表板](#kubernetes-dashboard)，其中为 pod (容器组) 、部署、节点名称、命名空间和集群提供了内置下拉筛选器。
:::

## 下钻至搜索

仪表板图块支持下钻到“搜索”页面。在可视化中单击某个数据点，会打开一个包含以下选项的上下文菜单：

* **查看所有事件** — 跳转到“搜索”页面，显示所选时间窗口内的所有事件。
* **按组筛选** — 跳转到“搜索”页面，并按特定序列进行筛选。

<Image img={drilldown} alt="显示“查看所有事件”和“按组筛选”选项的下钻上下文菜单" size="lg" />

这对于调查在仪表板中发现的特定峰值或异常非常有用——您可以快速从聚合视图切换到其底层的单个事件。

## 预设 {#presets}

HyperDX 部署时即提供开箱即用的仪表板。

### ClickHouse 仪表盘 {#clickhouse-dashboard}

此仪表盘提供用于监控 ClickHouse 的可视化界面。要打开该仪表盘，请在左侧菜单中选择它。

<Image img={dashboard_clickhouse} alt="ClickHouse 仪表盘" size="lg"/>

此仪表盘通过选项卡分别监控 **Selects**、**Inserts** 和 **ClickHouse Infrastructure**。

:::note 所需 system 表访问权限
此仪表盘会查询 ClickHouse 的 [system 表](/operations/system-tables) 以展示关键指标。需要以下授权：

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### Services 仪表板

Services 仪表板会基于链路追踪数据展示当前处于活动状态的服务。使用该功能前，您需要先采集链路追踪 并配置一个有效的 链路追踪 数据源。

服务名称会从 trace 数据中自动识别，并通过一系列预构建的可视化展示，这些视图分布在三个选项卡中：HTTP Services、Database 和 Errors。

可视化可以使用 Lucene 或 SQL 语法进行筛选，并且可以调整时间窗口以便进行更聚焦的分析。

<Image img={dashboard_services} alt="ClickHouse services" size="lg" />

### Kubernetes 仪表盘 {#kubernetes-dashboard}

此仪表盘允许你探索通过 OpenTelemetry 收集的 Kubernetes 事件。它提供高级筛选选项，使你能够按 Kubernetes pod（容器组）、Deployment（部署）、节点名称、命名空间和集群进行筛选，并执行自由文本搜索。

为便于导航，Kubernetes 数据被划分到三个选项卡中：Pods（容器组）、Nodes（节点）和 Namespaces（命名空间）。

<Image img={dashboard_kubernetes} alt="ClickHouse kubernetes" size="lg"/>