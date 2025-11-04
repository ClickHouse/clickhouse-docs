---
'sidebar_label': '仪表板'
'slug': '/cloud/manage/dashboards'
'title': '仪表板'
'description': 'SQL 控制台的仪表板功能允许您收集和分享来自保存的 查询 的可视化数据。'
'doc_type': 'guide'
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


# 仪表板

SQL 控制台的仪表板功能允许您收集和共享来自已保存查询的可视化。首先，通过保存和可视化查询，向仪表板添加查询可视化，并使用查询参数使仪表板具有互动性来开始。

## 核心概念 {#core-concepts}

### 查询共享 {#query-sharing}

为了与同事共享您的仪表板，请确保共享基础的已保存查询。为了查看可视化，用户至少必须具有对基础已保存查询的只读访问权限。

### 互动性 {#interactivity}

使用 [查询参数](/sql-reference/syntax#defining-and-using-query-parameters) 使您的仪表板具有互动性。例如，您可以在 `WHERE` 子句中添加查询参数以作为过滤器。

您可以通过选择可视化设置中的“过滤器”类型，在 **Global** 过滤器侧边栏中切换查询参数输入。您还可以通过将其链接到仪表板上的另一个对象（如表）来切换查询参数输入。请参阅以下快速入门指南的“[配置过滤器](/cloud/manage/dashboards#configure-a-filter)”部分。

## 快速入门 {#quick-start}

让我们创建一个仪表板，以使用 [query\_log](/operations/system-tables/query_log) 系统表监控我们的 ClickHouse 服务。

## 快速入门 {#quick-start-1}

### 创建已保存查询 {#create-a-saved-query}

如果您已经有要可视化的已保存查询，可以跳过此步骤。

打开一个新的查询选项卡。让我们编写一个查询，以统计 ClickHouse 系统表中按天的查询量：

<Image img={dashboards_2} size="md" alt="创建已保存查询" border/>

我们可以以表格格式查看查询结果，或开始从图表视图构建可视化。在下一步中，我们将查询保存为 `queries over time`：

<Image img={dashboards_3} size="md" alt="保存查询" border/>

有关已保存查询的更多文档，请参阅 [Saving a Query section](/cloud/get-started/sql-console#saving-a-query)。

我们可以创建并保存另一个查询 `query count by query kind`，以统计按查询种类分类的查询数量。以下是 SQL 控制台中数据的条形图可视化。

<Image img={dashboards_4} size="md" alt="查询结果的条形图可视化" border/>

现在有了两个查询，让我们创建一个仪表板来可视化并收集这些查询。

### 创建仪表板 {#create-a-dashboard}

导航到仪表板面板，点击“新仪表板”。在给定名称后，您将成功创建第一个仪表板！

<Image img={dashboards_5} size="md" alt="创建新仪表板" border/>

### 添加可视化 {#add-a-visualization}

有两个已保存的查询，`queries over time` 和 `query count by query kind`。让我们将第一个可视化为折线图。为您的可视化提供标题和副标题，并选择要可视化的查询。接下来，选择“折线”图表类型，并分配一个 x 轴和一个 y 轴。

<Image img={dashboards_6} size="md" alt="添加可视化" border/>

在这里，还可以进行其他样式更改——例如数字格式、图例布局和坐标轴标签。

接下来，让我们将第二个查询可视化为表格，并将其放置在折线图下方。

<Image img={dashboards_7} size="md" alt="将查询结果可视化为表格" border/>

您通过可视化两个已保存的查询创建了第一个仪表板！

### 配置过滤器 {#configure-a-filter}

让我们通过在查询种类上添加过滤器使仪表板具有互动性，这样您可以仅显示与插入查询相关的趋势。我们将利用 [查询参数](/sql-reference/syntax#defining-and-using-query-parameters) 来完成这项工作。

点击折线图旁边的三个点，点击查询旁的铅笔按钮以打开行内查询编辑器。在这里，我们可以直接从仪表板编辑基础的已保存查询。

<Image img={dashboards_8} size="md" alt="编辑基础查询" border/>

现在，当按下黄色的运行查询按钮时，您将看到之前过滤仅针对插入查询的相同查询。点击保存按钮以更新查询。当您返回到图表设置时，您将能够过滤折线图。

现在，使用顶部功能区中的 Global Filters，您可以通过更改输入来切换过滤器。

<Image img={dashboards_9} size="md" alt="调整全局过滤器" border/>

假设您想将折线图的过滤器链接到表格。您可以通过返回可视化设置，将 query_kind 查询参数的值源更改为表格，并选择 query_kind 列作为要链接的字段来实现。

<Image img={dashboards_10} size="md" alt="更改查询参数" border/>

现在，您可以直接从按种类查询的表中控制折线图的过滤器，以使您的仪表板具有互动性。

<Image img={dashboards_11} size="md" alt="控制折线图上的过滤器" border/>
