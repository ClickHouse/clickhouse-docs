---
sidebar_label: '仪表板'
slug: /cloud/manage/dashboards
title: '仪表板'
---

import BetaBadge from '@theme/badges/BetaBadge';
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

<BetaBadge />

SQL 控制台的仪表板功能允许您收集和共享来自保存查询的可视化。通过保存和可视化查询、将查询可视化添加到仪表板以及使用查询参数使仪表板互动来开始使用。

## 核心概念 {#core-concepts}

### 查询共享 {#query-sharing}

为了与同事共享您的仪表板，请确保共享底层保存的查询。用户至少需要对底层保存查询具有只读访问权限才能查看可视化。

### 互动性 {#interactivity}

使用 [查询参数](/sql-reference/syntax#defining-and-using-query-parameters) 使您的仪表板具有互动性。例如，您可以在 `WHERE` 子句中添加查询参数作为过滤器。

您可以通过在可视化设置中选择“过滤器”类型，在 **全局** 过滤器侧边栏中切换查询参数输入。您还可以通过链接仪表板上的另一个对象（例如表）来切换查询参数输入。请参阅下面快速入门指南的“[配置过滤器](/cloud/manage/dashboards#configure-a-filter)”部分。

## 快速入门 {#quick-start}

让我们使用 [query_log](/operations/system-tables/query_log) 系统表创建一个仪表板来监控 ClickHouse 服务。

## 快速入门 {#quick-start-1}

### 创建保存查询 {#create-a-saved-query}

如果您已经有要可视化的保存查询，可以跳过此步骤。

打开一个新查询选项卡。让我们编写一个查询以按天统计服务的查询量，使用 ClickHouse 系统表：

<img src={dashboards_2} alt="创建保存查询"/>

我们可以以表格格式查看查询结果，或从图表视图开始构建可视化。下一步，我们将查询保存为 `queries over time`：

<img src={dashboards_3} alt="保存查询"/>

有关保存查询的更多文档，请参见 [保存查询部分](/cloud/get-started/sql-console#saving-a-query)。

我们可以创建并保存另一个查询 `query count by query kind`，以按查询类型统计查询数量。以下是 SQL 控制台中数据的条形图可视化。

<img src={dashboards_4} alt="查询结果的条形图可视化"/>

现在有了两个查询，让我们创建一个仪表板来可视化和收集这些查询。

### 创建仪表板 {#create-a-dashboard}

导航到仪表板面板，点击“新建仪表板”。为其命名后，您将成功创建第一个仪表板！

<img src={dashboards_5} alt="创建新仪表板"/>

### 添加可视化 {#add-a-visualization}

现在有两个保存查询，`queries over time` 和 `query count by query kind`。让我们将第一个可视化为折线图。为您的可视化设置一个标题和副标题，并选择要可视化的查询。接下来，选择“折线”图表类型，并分配 x 和 y 轴。

<img src={dashboards_6} alt="添加可视化"/>

在这里，您还可以进行其他样式更改，例如数字格式、图例布局和轴标签。

接下来，让我们将第二个查询可视化为表格，并将其放置在折线图下方。

<img src={dashboards_7} alt="将查询结果可视化为表格"/>

通过可视化两个保存查询，您已经创建了第一个仪表板！

### 配置过滤器 {#configure-a-filter}

让我们通过添加查询类型的过滤器，使该仪表板具有互动性，以便您只显示与插入查询相关的趋势。我们将通过使用 [查询参数](/sql-reference/syntax#defining-and-using-query-parameters) 来完成此任务。

点击折线图旁边的三个点，然后点击查询旁边的铅笔按钮以打开内联查询编辑器。在这里，我们可以直接从仪表板编辑底层的保存查询。

<img src={dashboards_8} alt="编辑底层查询"/>

现在，当按下黄色的运行查询按钮时，您将看到之前的查询过滤为仅插入查询。点击保存按钮以更新查询。当您返回到图表设置时，您将能够过滤该折线图。

现在，使用顶部工具栏的全局过滤器，您可以通过更改输入来切换过滤器。

<img src={dashboards_9} alt="调整全局过滤器"/>

假设您想将折线图的过滤器链接到表格。您可以通过回到可视化设置，将 `query_kind` 查询参数的值源更改为表，并选择 `query_kind` 列作为要链接的字段来实现。

<img src={dashboards_10} alt="更改查询参数"/>

现在，您可以直接从按查询类型的表中控制折线图的过滤器，以使您的仪表板具有互动性。

<img src={dashboards_11} alt="控制折线图的过滤器"/>
