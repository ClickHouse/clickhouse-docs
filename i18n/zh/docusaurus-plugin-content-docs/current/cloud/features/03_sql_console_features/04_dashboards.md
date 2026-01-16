---
sidebar_label: '仪表板'
slug: /cloud/manage/dashboards
title: '仪表板'
description: 'SQL 控制台的仪表板功能允许你收集和共享基于已保存查询生成的可视化内容。'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', '仪表板', '数据可视化', 'SQL 控制台仪表板', '云端分析']
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


# 仪表板 \{#dashboards\}

SQL Console 的仪表板功能允许您收集并共享来自已保存查询的可视化结果。您可以先保存并可视化查询，将查询的可视化结果添加到仪表板中，并使用查询参数让仪表板具备交互功能。

## 核心概念 \{#core-concepts\}

### 查询共享 \{#query-sharing\}

要与同事共享你的仪表板，请务必一并共享其底层的已保存查询。要查看某个可视化，你至少必须对该底层已保存查询具有只读访问权限。

### 交互性 \{#interactivity\}

使用[查询参数](/sql-reference/syntax#defining-and-using-query-parameters)使你的仪表板具备交互性。例如，你可以在 `WHERE` 子句中添加查询参数，将其用作过滤条件。

你可以在可视化设置中选择“filter”类型，通过 **Global** 全局过滤器侧边栏来切换查询参数输入。你也可以通过在仪表板上链接到其他对象（例如表）来切换查询参数输入。请参阅下文快速入门指南中的“[配置过滤器](/cloud/manage/dashboards#configure-a-filter)”部分。 

## 快速开始 \{#quick-start\}

我们来创建一个仪表板，借助 [query_log](/operations/system-tables/query_log) 系统表来监控我们的 ClickHouse 服务。 

## 快速开始 \{#quick-start-1\}

### 创建已保存查询 \{#create-a-saved-query\}

如果已经有用于可视化的已保存查询，可以跳过此步骤。 

打开一个新的查询标签页。我们来编写一个查询，使用 ClickHouse 的 system 表按天统计某个服务的查询量：

<Image img={dashboards_2} size="md" alt="创建已保存查询" border/>

可以以表格形式查看查询结果，或者从图表视图开始构建可视化。接下来，将该查询保存为 `queries over time`：

<Image img={dashboards_3} size="md" alt="保存查询" border/>

关于已保存查询的更多内容，请参见[“保存查询”部分](/cloud/get-started/sql-console#saving-a-query)。

接着可以再创建并保存另一个查询 `query count by query kind`，用于按查询类型统计查询数量。下面是在 SQL 控制台中对该数据进行柱状图可视化的示例。 

<Image img={dashboards_4} size="md" alt="查询结果的柱状图可视化" border/>

现在已经有两个查询了，接下来创建一个仪表板来可视化并汇总这些查询。 

### 创建仪表板 \{#create-a-dashboard\}

进入 Dashboards 面板，然后点击 “New Dashboard” 按钮。在指定名称后，即可成功创建第一个仪表板。

<Image img={dashboards_5} size="md" alt="创建新仪表板" border/>

### 添加可视化 \{#add-a-visualization\}

现在有两个已保存查询：`queries over time` 和 `query count by query kind`。先将第一个查询可视化为折线图。为可视化添加标题和副标题，并选择要可视化的查询。然后选择 “Line” 图表类型，并指定 x 轴和 y 轴。

<Image img={dashboards_6} size="md" alt="添加可视化" border/>

此处还可以进行额外的样式调整，例如数字格式、图例布局和坐标轴标签。 

接下来，将第二个查询可视化为表格，并将其放置在折线图下方。 

<Image img={dashboards_7} size="md" alt="将查询结果可视化为表格" border/>

现在已经通过可视化两个已保存查询创建了第一个仪表板。

### 配置筛选器 \{#configure-a-filter\}

通过在查询类型上添加筛选器，使这个仪表板具备交互性，这样就可以仅展示与 Insert 查询相关的趋势。我们将使用[查询参数](/sql-reference/syntax#defining-and-using-query-parameters)来完成此任务。 

点击折线图旁边的三个点按钮，然后点击查询旁边的铅笔按钮以打开内联查询编辑器。在这里，可以直接从仪表板编辑底层的已保存查询。 

<Image img={dashboards_8} size="md" alt="编辑底层查询" border/>

现在，当点击黄色的“运行查询”按钮时，会看到与之前相同的查询结果，但只包含 insert 查询。点击保存按钮以更新查询。返回图表设置后，就可以对折线图进行筛选。 

接下来，使用顶部功能区中的 Global Filters，可以通过更改输入来切换筛选器。 

<Image img={dashboards_9} size="md" alt="调整全局筛选器" border/>

假设希望将折线图的筛选器与表格关联起来。可以通过返回可视化设置，将 query_kind 查询参数的 value source 更改为 table，并选择 query_kind 列作为要关联的字段来实现这一点。 

<Image img={dashboards_10} size="md" alt="更改查询参数" border/>

现在，就可以直接从“按查询类型统计的查询”表中控制折线图上的筛选器，使仪表板更加交互化。 

<Image img={dashboards_11} size="md" alt="控制折线图上的筛选器" border/>