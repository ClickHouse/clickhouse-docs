---
sidebar_label: Rocket BI
sidebar_position: 131
slug: /integrations/rocketbi
keywords: [clickhouse, RocketBI, connect, integrate, ui]
description: RocketBI 是一个自服务商业智能平台，帮助您快速分析数据，构建拖放可视化，并直接在您的网络浏览器中与同事协作。
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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


# 目标：构建您的第一个仪表板

在本指南中，您将安装并使用 Rocket.BI 构建一个简单的仪表板。
这是仪表板：

<img width="800" alt="Github RocketBI" src={rocketbi_01}/>
<br/>

您可以通过 [此链接查看仪表板。](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## 安装 {#install}

使用我们预构建的 Docker 镜像启动 RocketBI。

获取 docker-compose.yml 和配置文件：

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```
编辑 .clickhouse.env，添加 ClickHouse 服务器信息。

通过运行命令启动 RocketBI：``` docker-compose up -d . ```

打开浏览器，访问 ```localhost:5050```，使用以下帐户登录：```hello@gmail.com/123456```

要从源代码构建或进行高级配置，您可以在这里查看 [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)

## 让我们构建仪表板 {#lets-build-the-dashboard}

在仪表板中，您将找到您的报告，通过单击 **+新建** 开始可视化。

您可以在一个仪表板中构建 **无限多个仪表板** 和绘制 **无限多个图表**。

<img width="800" alt="RocketBI create chart" src={rocketbi_02}/>
<br/>

在 Youtube 上查看高清教程： [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### 构建图表控件 {#build-the-chart-controls}

#### 创建一个指标控件 {#create-a-metrics-control}
在选项卡过滤器中，选择您想要使用的指标字段。确保查看聚合设置。

<img width="650" alt="RocketBI chart 6" src={rocketbi_03}/>
<br/>

重命名过滤器并保存控件到仪表板

<img width="400" alt="Metrics Control" src={rocketbi_04}/>


#### 创建一个日期类型控件 {#create-a-date-type-control}
选择一个日期字段作为主日期列：

<img width="650" alt="RocketBI chart 4" src={rocketbi_05}/>
<br/>

添加具有不同查找范围的重复变体。例如，年份、按月、按日或周几。

<img width="650" alt="RocketBI chart 5" src={rocketbi_06}/>
<br/>

重命名过滤器并保存控件到仪表板

<img width="200" alt="Date Range Control" src={rocketbi_07}/>

### 现在，让我们构建图表 {#now-let-build-the-charts}

#### 饼图：按地区的销售指标 {#pie-chart-sales-metrics-by-regions}
选择添加新图表，然后选择饼图

<img width="650" alt="Add Pie Chart" src={rocketbi_08}/>
<br/>

首先，将数据集中的 "Region" 列拖放到图例字段

<img width="650" alt="Drag-n-drop Column to Chart" src={rocketbi_09}/>
<br/>

然后，切换到图表控件选项卡

<img width="650" alt="Navigate to Chart Control in Visualization" src={rocketbi_10}/>
<br/>

将指标控件拖放到数值字段

<img width="650" alt="Use Metrics Control in Chart" src={rocketbi_11}/>
<br/>

（您也可以使用指标控件作为排序）

导航到图表设置进行进一步的自定义

<img width="650" alt="Custom the Chart with Setting" src={rocketbi_12}/>
<br/>

例如，将数据标签更改为百分比

<img width="650" alt="Chart Customization Example" src={rocketbi_13}/>
<br/>

保存并将图表添加到仪表板

<img width="650" alt="Overview Dashboard with Pie Chart" src={rocketbi_14}/>

#### 在时间序列图表中使用日期控件 {#use-date-control-in-a-time-series-chart}
让我们使用堆叠柱状图

<img width="650" alt="Create a Time-series chart with Tab Control" src={rocketbi_15}/>
<br/>

在图表控件中，使用指标控件作为 Y 轴，日期范围作为 X 轴

<img width="650" alt="Use Date Range as Controller" src={rocketbi_16}/>
<br/>

将区域列添加到分解中

<img width="650" alt="Add Region into Breakdown" src={rocketbi_17}/>
<br/>

添加数字图表作为 KPI 并提升仪表板

<img width="800" alt="Screenshot 2022-11-17 at 10 43 29" src={rocketbi_18} />
<br/>

现在，您已成功构建了您的第一个仪表板与 rocket.BI
