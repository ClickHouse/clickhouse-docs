---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: /integrations/rocketbi
keywords: ['clickhouse', 'RocketBI', 'connect', 'integrate', 'ui']
description: 'RocketBI 是一个自助式商业智能平台，可帮助您快速分析数据、通过拖放方式创建可视化，并直接在 Web 浏览器中与同事协作。'
title: '目标：构建您的第一个仪表板'
doc_type: '指南'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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

# 目标：使用 Rocket.BI 构建您的第一个仪表板 \{#goal-build-your-first-dashboard-with-rocketbi\}

<CommunityMaintainedBadge />

在本指南中，您将安装 Rocket.BI 并构建一个简单的仪表板。
这就是该仪表板：

<Image size="md" img={rocketbi_01} alt="Rocket BI 仪表板，显示销售指标、图表和 KPI" border />

<br />

您可以通过[此链接查看该仪表板](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)。

## 安装 \{#install\}

使用我们预构建的 Docker 镜像启动 RocketBI。

获取 docker-compose.yml 和配置文件：

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```

编辑 .clickhouse.env，添加 ClickHouse 服务器信息。

运行以下命令启动 RocketBI：`docker-compose up -d .`

打开浏览器，访问 `localhost:5050`，使用以下账户登录：`hello@gmail.com/123456`

如需从源码构建或进行高级配置，可在此处查看 [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)

## 开始构建仪表板 \{#lets-build-the-dashboard\}

在仪表板中，您可以找到您的报表；点击 **+New** 开始创建可视化。

您可以创建**无限制的仪表板**，并在单个仪表板中绘制**无限制的图表**。

<Image size="md" img={rocketbi_02} alt="展示在 Rocket BI 中创建新 chart 过程的动画" border />

<br />

参阅 Youtube 上的高清教程：[https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### 构建 chart 控件 \{#build-the-chart-controls\}

#### 创建指标控件 \{#create-a-metrics-control\}

在 Tab 过滤器中，选择要使用的指标字段。注意检查聚合设置。

<Image size="md" img={rocketbi_03} alt="Rocket BI 指标控件配置面板，显示所选字段和聚合设置" border />

<br />

重命名筛选器并将控件保存到仪表板

<Image size="md" img={rocketbi_04} alt="已重命名筛选器、可保存到仪表板的指标控件" border />

#### 创建日期类型控件 \{#create-a-date-type-control\}

选择一个日期字段作为主日期列：

<Image size="md" img={rocketbi_05} alt="Rocket BI 中的日期字段选择界面，显示可用的日期列" border />

<br />

添加多个副本，并为其设置不同的查询范围。例如：按年、按月、按日或按星期几。

<Image size="md" img={rocketbi_06} alt="日期范围配置，显示年份、月份和日期等不同时间段选项" border />

<br />

重命名筛选器，并将控件保存到仪表板

<Image size="md" img={rocketbi_07} alt="已重命名筛选器并准备保存到仪表板的日期范围控件" border />

### 现在，开始构建图表 \{#now-let-build-the-charts\}

#### 饼 chart：按区域划分的销售指标 \{#pie-chart-sales-metrics-by-regions\}

选择 Adding new chart，然后选择 Pie chart。

<Image size="md" img={rocketbi_08} alt="chart 类型选择面板，其中饼 chart 选项已高亮显示" border />

<br />

首先，将 Dataset 中的“Region”列拖放到 Legend Field。

<Image size="md" img={rocketbi_09} alt="拖放界面，显示将 Region 列添加到图例字段" border />

<br />

然后，切换到 Chart Control 标签页。

<Image size="md" img={rocketbi_10} alt="chart 控制标签页界面，显示可视化配置选项" border />

<br />

将 Metrics Control 拖放到 Value Field。

<Image size="md" img={rocketbi_11} alt="将 Metrics Control 添加到饼 chart 的值字段" border />

<br />

(也可以将 Metrics Control 用作排序)

前往 Chart Setting 进行进一步自定义。

<Image size="md" img={rocketbi_12} alt="chart 设置面板，显示饼 chart 的自定义选项" border />

<br />

例如，将 Data label 更改为 Percentage。

<Image size="md" img={rocketbi_13} alt="将数据标签设置更改为在饼 chart 上显示百分比" border />

<br />

保存并将 chart 添加到仪表板。

<Image size="md" img={rocketbi_14} alt="仪表板视图，显示新添加的饼 chart 和其他控件" border />

#### 在时间序列 chart 中使用日期控件 \{#use-date-control-in-a-time-series-chart\}

使用堆叠列 chart

<Image size="md" img={rocketbi_15} alt="带有时间序列数据的堆叠列 chart 创建界面" border />

<br />

在 Chart Control 中，使用 Metrics Control 作为 Y 轴，Date Range 作为 X 轴

<Image size="md" img={rocketbi_16} alt="chart 控制配置：Y 轴为指标，X 轴为日期范围" border />

<br />

将 Region 列添加到 Breakdown 中

<Image size="md" img={rocketbi_17} alt="在堆叠列 chart 中将 Region 列添加为 breakdown 维度" border />

<br />

添加数值 chart 作为 KPI，美化仪表板

<Image size="md" img={rocketbi_18} alt="包含 KPI 数值 chart、饼 chart 和时间序列可视化的完整仪表板" border />

<br />

现在，您已成功构建出第一个 rocket.BI 仪表板