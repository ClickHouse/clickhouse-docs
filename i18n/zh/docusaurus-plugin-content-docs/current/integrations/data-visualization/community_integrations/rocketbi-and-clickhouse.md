---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: /integrations/rocketbi
keywords: ['clickhouse', 'RocketBI', 'connect', 'integrate', 'ui']
description: 'RocketBI 是一款自助式商业智能平台，可帮助你快速分析数据、构建拖放式可视化，并直接在浏览器中与同事协作。'
title: '目标：构建你的首个仪表板'
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


# 目标：使用 Rocket.BI 构建你的第一个仪表板

<CommunityMaintainedBadge/>

在本指南中，你将安装 Rocket.BI 并构建一个简单的仪表板。
仪表板如下所示：

<Image size="md" img={rocketbi_01} alt="Rocket BI 仪表板展示包含图表和 KPI 的销售指标" border />
<br/>

你可以通过[此链接访问该仪表板。](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)



## 安装 {#install}

使用预构建的 Docker 镜像启动 RocketBI。

获取 docker-compose.yml 和配置文件:

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```

编辑 .clickhouse.env,添加 ClickHouse 服务器信息。

运行以下命令启动 RocketBI:`docker-compose up -d .`

打开浏览器,访问 `localhost:5050`,使用以下账户登录:`hello@gmail.com/123456`

如需从源代码构建或进行高级配置,请参阅 [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)


## 让我们构建仪表板 {#lets-build-the-dashboard}

在仪表板中,您可以查看报告,点击 **+New** 开始创建可视化图表

您可以构建**无限数量的仪表板**并在一个仪表板中绘制**无限数量的图表**。

<Image
  size='md'
  img={rocketbi_02}
  alt='展示在 Rocket BI 中创建新图表过程的动画'
  border
/>
<br />

在 YouTube 上观看高清教程:[https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### 构建图表控件 {#build-the-chart-controls}

#### 创建指标控件 {#create-a-metrics-control}

在筛选器选项卡中,选择您要使用的指标字段。请确保检查聚合设置。

<Image
  size='md'
  img={rocketbi_03}
  alt='Rocket BI 指标控件配置面板,显示已选择的字段和聚合设置'
  border
/>
<br />

重命名筛选器并将控件保存到仪表板

<Image
  size='md'
  img={rocketbi_04}
  alt='已重命名筛选器的指标控件,准备保存到仪表板'
  border
/>

#### 创建日期类型控件 {#create-a-date-type-control}

选择一个日期字段作为主日期列:

<Image
  size='md'
  img={rocketbi_05}
  alt='Rocket BI 中的日期字段选择界面,显示可用的日期列'
  border
/>
<br />

添加具有不同查询范围的重复变体。例如,年、月、日或星期几。

<Image
  size='md'
  img={rocketbi_06}
  alt='日期范围配置,显示不同的时间段选项,如年、月和日'
  border
/>
<br />

重命名筛选器并将控件保存到仪表板

<Image
  size='md'
  img={rocketbi_07}
  alt='已重命名筛选器的日期范围控件,准备保存到仪表板'
  border
/>

### 现在,让我们构建图表 {#now-let-build-the-charts}

#### 饼图:按地区划分的销售指标 {#pie-chart-sales-metrics-by-regions}

选择添加新图表,然后选择饼图

<Image
  size='md'
  img={rocketbi_08}
  alt='图表类型选择面板,饼图选项已高亮显示'
  border
/>
<br />

首先将数据集中的"Region"列拖放到图例字段

<Image
  size='md'
  img={rocketbi_09}
  alt='拖放界面,显示 Region 列正在添加到图例字段'
  border
/>
<br />

然后,切换到图表控件选项卡

<Image
  size='md'
  img={rocketbi_10}
  alt='图表控件选项卡界面,显示可视化配置选项'
  border
/>
<br />

将指标控件拖放到值字段

<Image
  size='md'
  img={rocketbi_11}
  alt='指标控件正在添加到饼图的值字段'
  border
/>
<br />

(您也可以将指标控件用于排序)

导航到图表设置以进行进一步自定义

<Image
  size='md'
  img={rocketbi_12}
  alt='图表设置面板,显示饼图的自定义选项'
  border
/>
<br />

例如,将数据标签更改为百分比

<Image
  size='md'
  img={rocketbi_13}
  alt='数据标签设置正在更改为在饼图上显示百分比'
  border
/>
<br />

保存并将图表添加到仪表板

<Image
  size='md'
  img={rocketbi_14}
  alt='仪表板视图,显示新添加的饼图和其他控件'
  border
/>

#### 在时间序列图表中使用日期控件 {#use-date-control-in-a-time-series-chart}

让我们使用堆叠柱状图

<Image
  size='md'
  img={rocketbi_15}
  alt='带有时间序列数据的堆叠柱状图创建界面'
  border
/>
<br />

在图表控件中,使用指标控件作为 Y 轴,日期范围作为 X 轴

<Image
  size='md'
  img={rocketbi_16}
  alt='图表控件配置,显示 Y 轴上的指标和 X 轴上的日期范围'
  border
/>
<br />

将 Region 列添加到细分维度

<Image
  size='md'
  img={rocketbi_17}
  alt='Region 列正在作为细分维度添加到堆叠柱状图中'
  border
/>
<br />

添加数字图表作为 KPI 并美化仪表板

<Image
  size='md'
  img={rocketbi_18}
  alt='完整的仪表板,包含 KPI 数字图表、饼图和时间序列可视化'
  border
/>
<br />

现在,您已成功使用 rocket.BI 构建了您的第一个仪表板
