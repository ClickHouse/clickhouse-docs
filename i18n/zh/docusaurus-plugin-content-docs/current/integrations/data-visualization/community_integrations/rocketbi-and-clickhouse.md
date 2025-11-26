---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: /integrations/rocketbi
keywords: ['clickhouse', 'RocketBI', '连接', '集成', 'UI']
description: 'RocketBI 是一款自助式商业智能平台，可帮助你在 Web 浏览器中快速分析数据、构建拖拽式可视化图表，并与同事协作。'
title: '目标：创建你的第一个仪表板'
doc_type: 'guide'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import rocketbi_01 from '@site/static/images/integrations/data-visualization/rocketbi_01.gif';
import rocketbi_02 from '@site/static/images/integrations/data-visualization/rocketbi_02.gif';
import rocketbi_03 from '@site/static/images/integrations/data-visualization/rocketbi_03.png';
import rocketbi_04 from '@site/static/images/integrations/data-visualization/rocketbi_04.png';
import rocketbi_05 from '@site/static/images/integrations/data-visualization/rocketbi_05.png';
import rocketbi_06 from '@site/static/images/integrations/data-visualization/rocketbi_06.png';
import rocketbi_07 from '@site/static/images/integrations/data-visualization/rocketbi_07.png';
import rocketbi_08 from '@site/static/images/integrations/data-visualization/rocketbi_08.png';
import rocketbi_09 from '@site/static/images/integrations/data-visualization/rocketbi_09.png';
import rocketbi_10 from '@site/static/images/integrations/data-visualization/rocketbi_10.png';
import rocketbi_11 from '@site/static/images/integrations/data-visualization/rocketbi_11.png';
import rocketbi_12 from '@site/static/images/integrations/data-visualization/rocketbi_12.png';
import rocketbi_13 from '@site/static/images/integrations/data-visualization/rocketbi_13.png';
import rocketbi_14 from '@site/static/images/integrations/data-visualization/rocketbi_14.png';
import rocketbi_15 from '@site/static/images/integrations/data-visualization/rocketbi_15.png';
import rocketbi_16 from '@site/static/images/integrations/data-visualization/rocketbi_16.png';
import rocketbi_17 from '@site/static/images/integrations/data-visualization/rocketbi_17.png';
import rocketbi_18 from '@site/static/images/integrations/data-visualization/rocketbi_18.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 目标：使用 Rocket.BI 构建你的第一个仪表盘

<CommunityMaintainedBadge/>

在本指南中，你将安装 Rocket.BI，并构建一个简单的仪表盘。
该仪表盘如下所示：

<Image size="md" img={rocketbi_01} alt="Rocket BI 仪表盘，通过图表和关键指标展示销售数据" border />
<br/>

你可以通过[此链接访问该仪表盘。](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)



## 安装

使用我们预先构建的 Docker 镜像启动 RocketBI。

获取 docker-compose.yml 和配置文件：

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```

编辑 `.clickhouse.env`，添加 ClickHouse 服务器信息。

运行命令 `docker-compose up -d .` 启动 RocketBI。

打开浏览器，访问 `localhost:5050`，使用以下账号登录：`hello@gmail.com/123456`

如果你想从源码构建或进行高级配置，可以在这里查看 [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)。


## 让我们来构建仪表板 {#lets-build-the-dashboard}

在 Dashboard 中，你可以找到你的报表，点击 **+New** 开始可视化。

你可以创建**不限数量的仪表板**，并在一个仪表板中绘制**不限数量的图表**。

<Image size="md" img={rocketbi_02} alt="动画展示在 Rocket BI 中创建新图表的过程" border />
<br/>

在 YouTube 上查看高清教程：[https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### 构建图表控制组件 {#build-the-chart-controls}

#### 创建一个指标控制组件 {#create-a-metrics-control}
在 Tab filter 中，选择你想使用的 metric 字段。请务必检查聚合设置。

<Image size="md" img={rocketbi_03} alt="Rocket BI 指标控制配置面板，显示已选择字段和聚合设置" border />
<br/>

重命名过滤器，并将 Control 保存到 Dashboard

<Image size="md" img={rocketbi_04} alt="已重命名过滤器、准备保存到仪表板的指标控制组件" border />

#### 创建一个日期类型控制组件 {#create-a-date-type-control}
选择一个 Date 字段作为主日期列（Main Date column）：

<Image size="md" img={rocketbi_05} alt="Rocket BI 中的日期字段选择界面，显示可用的日期列" border />
<br/>

添加多个副本，并设置不同的筛选范围。例如按年（Year）、按月（Monthly）、按日（Daily date）或按星期几（Day of Week）。

<Image size="md" img={rocketbi_06} alt="日期范围配置，显示按年、月、日等不同时间周期选项" border />
<br/>

重命名过滤器，并将 Control 保存到 Dashboard

<Image size="md" img={rocketbi_07} alt="已重命名过滤器、准备保存到仪表板的日期范围控制组件" border />

### 现在，让我们来构建图表 {#now-let-build-the-charts}

#### 饼图：按区域展示销售指标 {#pie-chart-sales-metrics-by-regions}
选择添加新图表，然后选择 Pie Chart

<Image size="md" img={rocketbi_08} alt="图表类型选择面板，高亮显示饼图选项" border />
<br/>

首先，将数据集中名为 "Region" 的列拖放到 Legend 字段

<Image size="md" img={rocketbi_09} alt="拖拽界面，展示 Region 列被添加到图例字段" border />
<br/>

然后，切换到 Chart Control 选项卡

<Image size="md" img={rocketbi_10} alt="图表控制选项卡界面，展示可视化配置选项" border />
<br/>

将 Metrics Control 拖放到 Value 字段中

<Image size="md" img={rocketbi_11} alt="将指标控制组件添加到饼图的值字段" border />
<br/>

（你也可以将 Metrics Control 用作排序字段）

进入 Chart Setting 进行进一步自定义

<Image size="md" img={rocketbi_12} alt="图表设置面板，展示饼图的自定义选项" border />
<br/>

例如，将 Data label 改为 Percentage

<Image size="md" img={rocketbi_13} alt="将数据标签设置更改为在饼图上显示百分比" border />
<br/>

保存并将图表添加到 Dashboard

<Image size="md" img={rocketbi_14} alt="仪表板视图，展示新添加的饼图和其他控制组件" border />

#### 在时间序列图表中使用日期控制组件 {#use-date-control-in-a-time-series-chart}
我们来使用一个堆叠柱状图（Stacked Column Chart）

<Image size="md" img={rocketbi_15} alt="堆叠柱状图创建界面，展示时间序列数据" border />
<br/>

在 Chart Control 中，将 Metrics Control 用作 Y 轴，将 Date Range 用作 X 轴

<Image size="md" img={rocketbi_16} alt="图表控制配置，展示 Y 轴为指标、X 轴为日期范围" border />
<br/>

将 Region 列添加到 Breakdown 中

<Image size="md" img={rocketbi_17} alt="在堆叠柱状图中将 Region 列添加为细分维度" border />
<br/>

添加 Number Chart 作为 KPI，让整个 Dashboard 更加醒目

<Image size="md" img={rocketbi_18} alt="完整仪表板，包含 KPI 数值图表、饼图和时间序列可视化" border />
<br/>

现在，你已经成功使用 rocket.BI 构建了你的第一个仪表板。
