---
'sidebar_label': '仪表板'
'slug': '/cloud/manage/dashboards'
'title': '仪表板'
'description': 'SQL 控制台的仪表板功能允许您从保存的查询中收集和共享可视化。'
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import dashboards_2 from '@site/static/images/cloud/dashboards/2_dashboards.png';
import dashboards_3 from '@site/static/images/cloud/dashboards/3_dashboards.png';
import dashboards_4 from '@site/static/images/cloud/dashboards/4_dashboards.png';
import dashboards_5 from '@site/static/images/cloud/dashboards/5_dashboards.png';
import dashboards_6 from '@site/static/images/cloud/dashboards/6_dashboards.png';
import dashboards_7 from '@site/static/images/cloud/dashboards/7_dashboards.png';
import dashboards_8 from '@site/static/images/cloud/dashboards/8_dashboards.png';
import dashboards_9 from '@site/static/images/cloud/dashboards/9_dashboards.png';
import dashboards_10 from '@site/static/images/cloud/dashboards/10_dashboards.png';
import dashboards_11 from '@site/static/images/cloud/dashboards/11_dashboards.png';


# Dashboards

<BetaBadge />

SQL 控制台的仪表板功能允许您收集和共享来自保存查询的可视化效果。通过保存和可视化查询、将查询可视化添加到仪表板，并使用查询参数使仪表板具有交互性来开始使用。

## Core Concepts {#core-concepts}

### Query Sharing {#query-sharing}

为了与同事共享您的仪表板，请务必共享底层的保存查询。为了查看可视化，用户至少必须具有对底层保存查询的只读访问权限。 

### Interactivity {#interactivity}

使用 [query parameters](/sql-reference/syntax#defining-and-using-query-parameters) 使您的仪表板具有交互性。例如，您可以在 `WHERE` 子句中添加一个查询参数作为过滤器。

您可以通过在可视化设置中选择“过滤器”类型，利用 **Global** 过滤器侧边栏切换查询参数输入。您还可以通过链接到仪表板上的另一个对象（比如一个表）来切换查询参数输入。请参见下面快速入门指南的 “[configure a filter](/cloud/manage/dashboards#configure-a-filter)” 部分。 

## Quick Start {#quick-start}

让我们创建一个仪表板来监控我们的 ClickHouse 服务，使用 [query_log](/operations/system-tables/query_log) 系统表。 

## Quick Start {#quick-start-1}

### Create a saved query {#create-a-saved-query}

如果您已经有保存的查询可视化，可以跳过此步骤。

打开一个新的查询标签页。我们来写一个查询，以计算在服务中按天的查询量，使用 ClickHouse 系统表：

<Image img={dashboards_2} size="md" alt="Create a saved query" border/>

我们可以以表格格式查看查询结果，或开始从图表视图构建可视化。在下一步中，我们将查询保存为 `queries over time`：

<Image img={dashboards_3} size="md" alt="Save query" border/>

有关保存查询的更多文档，请参见 [Saving a Query section](/cloud/get-started/sql-console#saving-a-query)。

我们可以创建并保存另一个查询 `query count by query kind`，以计算按查询类型的查询数量。以下是 SQL 控制台中数据的条形图可视化。

<Image img={dashboards_4} size="md" alt="A bar chart visualization of a query's results" border/>

现在有了两个查询，让我们创建一个仪表板来可视化和收集这些查询。

### Create a dashboard {#create-a-dashboard}

导航到仪表板面板，并点击“新仪表板”。在您分配名称后，您将成功创建您的第一个仪表板！

<Image img={dashboards_5} size="md" alt="Create a new dashboard" border/>

### Add a visualization {#add-a-visualization}

有两个保存的查询，`queries over time` 和 `query count by query kind`。让我们将第一个可视化为折线图。给您的可视化设置一个标题和副标题，并选择要可视化的查询。接下来，选择“折线”图表类型，并指定 x 轴和 y 轴。

<Image img={dashboards_6} size="md" alt="Add a visualization" border/>

在这里，还可以进行其他样式更改，例如数字格式、图例布局和轴标签。

接下来，让我们将第二个查询可视化为表格，并将其放置在折线图下方。

<Image img={dashboards_7} size="md" alt="Visualize query results as a table" border/>

通过可视化两个保存的查询，您已经创建了您的第一个仪表板！

### Configure a filter {#configure-a-filter}

让我们通过在查询类型上添加一个过滤器来使这个仪表板具有交互性，这样您就可以仅显示与插入查询相关的趋势。我们将使用 [query parameters](/sql-reference/syntax#defining-and-using-query-parameters) 来完成此任务。

单击折线图旁边的三个点，然后单击查询旁边的铅笔按钮以打开内联查询编辑器。在这里，我们可以直接从仪表板编辑底层的保存查询。

<Image img={dashboards_8} size="md" alt="Edit the underlying query" border/>

现在，当按下黄色的运行查询按钮时，您将看到之前仅针对插入查询过滤的相同查询。单击保存按钮以更新查询。当您返回到图表设置时，您将能够过滤折线图。

现在，通过顶部功能区上的 Global Filters，您可以通过更改输入来切换该过滤器。

<Image img={dashboards_9} size="md" alt="Adjust global filters" border/>

假设您想将折线图的过滤器链接到表。您可以通过返回可视化设置，将 `query_kind` 查询参数的值源更改为表，并选择 `query_kind` 列作为链接字段来做到这一点。

<Image img={dashboards_10} size="md" alt="Changing query parameter" border/>

现在，您可以直接从按查询类型的表中控制折线图上的过滤器，以使您的仪表板具有交互性。

<Image img={dashboards_11} size="md" alt="Control the filter on the line chart" border/>
