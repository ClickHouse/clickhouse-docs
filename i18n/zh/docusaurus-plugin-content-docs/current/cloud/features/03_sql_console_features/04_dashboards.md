---
sidebar_label: '仪表板'
slug: /cloud/manage/dashboards
title: '仪表板'
description: 'SQL Console 的仪表板功能允许你汇总并共享基于已保存查询生成的可视化内容。'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', '仪表板', '数据可视化', 'SQL 控制台仪表板', '云分析']
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


# 仪表盘

`SQL Console` 的仪表盘功能允许你收集并共享来自已保存查询的可视化结果。你可以先保存并可视化查询，然后将这些可视化结果添加到仪表盘中，并通过使用查询参数让仪表盘具备交互能力。



## 核心概念 {#core-concepts}

### 查询共享 {#query-sharing}

要与同事共享仪表板,请务必同时共享底层的已保存查询。用户查看可视化内容时,至少需要对底层已保存查询具有只读访问权限。

### 交互性 {#interactivity}

使用[查询参数](/sql-reference/syntax#defining-and-using-query-parameters)可以让仪表板具有交互性。例如,您可以在 `WHERE` 子句中添加查询参数作为过滤器使用。

您可以在可视化设置中选择"filter"类型,通过 **Global** 过滤器侧边栏切换查询参数输入。您也可以通过链接到仪表板上的其他对象(如表)来切换查询参数输入。请参阅下方快速入门指南中的"[配置过滤器](/cloud/manage/dashboards#configure-a-filter)"部分。


## 快速开始 {#quick-start}

让我们使用 [query_log](/operations/system-tables/query_log) 系统表创建一个仪表板来监控 ClickHouse 服务。


## 快速入门 {#quick-start-1}

### 创建保存的查询 {#create-a-saved-query}

如果您已有需要可视化的保存查询,可以跳过此步骤。

打开一个新的查询标签页。我们来编写一个查询,使用 ClickHouse 系统表按天统计服务的查询量:

<Image img={dashboards_2} size='md' alt='创建保存的查询' border />

我们可以以表格格式查看查询结果,或从图表视图开始构建可视化。接下来,我们将把查询保存为 `queries over time`:

<Image img={dashboards_3} size='md' alt='保存查询' border />

有关保存查询的更多文档,请参阅[保存查询部分](/cloud/get-started/sql-console#saving-a-query)。

我们可以创建并保存另一个查询 `query count by query kind`,按查询类型统计查询数量。以下是 SQL 控制台中该数据的柱状图可视化。

<Image
  img={dashboards_4}
  size='md'
  alt="查询结果的柱状图可视化"
  border
/>

现在有了两个查询,让我们创建一个仪表板来可视化和汇总这些查询。

### 创建仪表板 {#create-a-dashboard}

导航到仪表板面板,点击"New Dashboard"。分配名称后,您就成功创建了第一个仪表板!

<Image img={dashboards_5} size='md' alt='创建新仪表板' border />

### 添加可视化 {#add-a-visualization}

现在有两个保存的查询:`queries over time` 和 `query count by query kind`。我们将第一个可视化为折线图。为可视化设置标题和副标题,并选择要可视化的查询。然后,选择"Line"图表类型,并分配 x 轴和 y 轴。

<Image img={dashboards_6} size='md' alt='添加可视化' border />

在这里,还可以进行其他样式调整,例如数字格式、图例布局和轴标签。

接下来,我们将第二个查询可视化为表格,并将其放置在折线图下方。

<Image
  img={dashboards_7}
  size='md'
  alt='将查询结果可视化为表格'
  border
/>

您已经通过可视化两个保存的查询创建了第一个仪表板!

### 配置过滤器 {#configure-a-filter}

让我们通过添加查询类型过滤器来使此仪表板具有交互性,这样您就可以仅显示与 Insert 查询相关的趋势。我们将使用[查询参数](/sql-reference/syntax#defining-and-using-query-parameters)来完成此任务。

点击折线图旁边的三个点,然后点击查询旁边的铅笔按钮以打开内联查询编辑器。在这里,我们可以直接从仪表板编辑底层保存的查询。

<Image img={dashboards_8} size='md' alt='编辑底层查询' border />

现在,当按下黄色的运行查询按钮时,您将看到之前的查询仅过滤 insert 查询。点击保存按钮以更新查询。返回图表设置后,您将能够过滤折线图。

现在,使用顶部功能区的全局过滤器,您可以通过更改输入来切换过滤器。

<Image img={dashboards_9} size='md' alt='调整全局过滤器' border />

假设您想将折线图的过滤器关联到表格。您可以返回可视化设置,将 query_kind 查询参数的值源更改为表格,并选择 query_kind 列作为要关联的字段。

<Image img={dashboards_10} size='md' alt='更改查询参数' border />

现在,您可以直接从按类型分类的查询表控制折线图上的过滤器,使您的仪表板具有交互性。

<Image
  img={dashboards_11}
  size='md'
  alt='控制折线图上的过滤器'
  border
/>
