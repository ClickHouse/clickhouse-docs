---
'sidebar_label': 'Rocket BI'
'sidebar_position': 131
'slug': '/integrations/rocketbi'
'keywords':
- 'clickhouse'
- 'RocketBI'
- 'connect'
- 'integrate'
- 'ui'
'description': 'RocketBI 是一个自服务商业智能平台，可以帮助您快速分析数据，构建拖放可视化，并与同事在您的网页浏览器上进行协作。'
'title': '目标：构建您的第一个仪表板'
'doc_type': 'guide'
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


# 目标：构建您的第一个仪表板

<CommunityMaintainedBadge/>

在本指南中，您将使用 Rocket.BI 安装并构建一个简单的仪表板。
这是仪表板：

<Image size="md" img={rocketbi_01} alt="Rocket BI 仪表板显示销售指标，包含图表和 KPI" border />
<br/>

您可以通过 [此链接查看仪表板。](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## 安装 {#install}

使用我们预构建的 docker 镜像启动 RocketBI。

获取 docker-compose.yml 和配置文件：

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```
编辑 .clickhouse.env，添加 ClickHouse 服务器信息。

通过运行命令启动 RocketBI：``` docker-compose up -d . ```

打开浏览器，访问 ```localhost:5050```，使用以下帐户登录：```hello@gmail.com/123456```

要从源代码构建或进行高级配置，您可以在此处查看 [Rocket.BI README](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)

## 让我们构建仪表板 {#lets-build-the-dashboard}

在仪表板中，您将找到报告，点击 **+新建** 开始可视化。

您可以构建 **无限仪表板** 并在仪表板中绘制 **无限图表**。

<Image size="md" img={rocketbi_02} alt="动画展示在 Rocket BI 中创建新图表的过程" border />
<br/>

在 YouTube 上查看高分辨率教程： [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### 构建图表控件 {#build-the-chart-controls}

#### 创建指标控件 {#create-a-metrics-control}
在选项卡过滤器中，选择您想要使用的指标字段。确保检查聚合设置。

<Image size="md" img={rocketbi_03} alt="Rocket BI 指标控件配置面板，显示选定的字段和聚合设置" border />
<br/>

重命名过滤器并保存控件到仪表板

<Image size="md" img={rocketbi_04} alt="已重命名过滤器的指标控件，准备保存到仪表板" border />

#### 创建日期类型控件 {#create-a-date-type-control}
选择一个日期字段作为主日期列：

<Image size="md" img={rocketbi_05} alt="Rocket BI 中日期字段选择界面，显示可用的日期列" border />
<br/>

添加不同查找范围的重复变体。例如，年份、按月、按日或星期几。

<Image size="md" img={rocketbi_06} alt="日期范围配置，显示不同时间段选项，如年、月和日" border />
<br/>

重命名过滤器并保存控件到仪表板

<Image size="md" img={rocketbi_07} alt="日期范围控件，已重命名过滤器，准备保存到仪表板" border />

### 现在，让我们构建图表 {#now-let-build-the-charts}

#### 饼图：按地区的销售指标 {#pie-chart-sales-metrics-by-regions}
选择添加新图表，然后选择饼图

<Image size="md" img={rocketbi_08} alt="图表类型选择面板，饼图选项高亮显示" border />
<br/>

首先将列 "Region" 从数据集中拖放到图例字段

<Image size="md" img={rocketbi_09} alt="拖放界面，显示区域列添加到图例字段" border />
<br/>

然后，切换到图表控件选项卡

<Image size="md" img={rocketbi_10} alt="图表控件选项卡界面，显示可视化配置选项" border />
<br/>

将指标控件拖放到数值字段

<Image size="md" img={rocketbi_11} alt="指标控件被添加到饼图的数值字段" border />
<br/>

（您也可以将指标控件用作排序）

导航到图表设置进行进一步自定义

<Image size="md" img={rocketbi_12} alt="图表设置面板，显示饼图的自定义选项" border />
<br/>

例如，将数据标签更改为百分比

<Image size="md" img={rocketbi_13} alt="数据标签设置被更改为在饼图上显示百分比" border />
<br/>

保存并将图表添加到仪表板

<Image size="md" img={rocketbi_14} alt="仪表板视图，显示新添加的饼图和其他控件" border />

#### 在时间序列图中使用日期控件 {#use-date-control-in-a-time-series-chart}
让我们使用堆叠柱状图

<Image size="md" img={rocketbi_15} alt="堆叠柱状图创建界面，显示时间序列数据" border />
<br/>

在图表控件中，将指标控件用作 Y 轴，日期范围用作 X 轴

<Image size="md" img={rocketbi_16} alt="图表控件配置，显示 Y 轴上的指标和 X 轴上的日期范围" border />
<br/>

在拆分中添加区域列

<Image size="md" img={rocketbi_17} alt="区域列作为分解维度添加到堆叠柱状图中" border />
<br/>

添加数字图表作为 KPI 并美化仪表板

<Image size="md" img={rocketbi_18} alt="完整仪表板，包含 KPI 数字图表、饼图和时间序列可视化" border />
<br/>

现在，您已成功使用 rocket.BI 构建了您的第一个仪表板。
