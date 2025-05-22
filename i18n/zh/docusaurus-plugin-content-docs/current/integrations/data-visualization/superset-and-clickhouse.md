---
'sidebar_label': 'Superset'
'sidebar_position': 198
'slug': '/integrations/superset'
'keywords':
- 'clickhouse'
- 'superset'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Apache Superset 是一个开源的数据探索与可视化平台。'
'title': '连接 Superset 到 ClickHouse'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import superset_01 from '@site/static/images/integrations/data-visualization/superset_01.png';
import superset_02 from '@site/static/images/integrations/data-visualization/superset_02.png';
import superset_03 from '@site/static/images/integrations/data-visualization/superset_03.png';
import superset_04 from '@site/static/images/integrations/data-visualization/superset_04.png';
import superset_05 from '@site/static/images/integrations/data-visualization/superset_05.png';
import superset_06 from '@site/static/images/integrations/data-visualization/superset_06.png';
import superset_08 from '@site/static/images/integrations/data-visualization/superset_08.png';
import superset_09 from '@site/static/images/integrations/data-visualization/superset_09.png';
import superset_10 from '@site/static/images/integrations/data-visualization/superset_10.png';
import superset_11 from '@site/static/images/integrations/data-visualization/superset_11.png';
import superset_12 from '@site/static/images/integrations/data-visualization/superset_12.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 Superset 到 ClickHouse

<CommunityMaintainedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> 是一个用 Python 编写的开源数据探索和可视化平台。Superset 使用 ClickHouse 提供的 Python 驱动程序连接至 ClickHouse。让我们看看它是如何工作的...

## 目标 {#goal}

在本指南中，您将使用来自 ClickHouse 数据库的数据在 Superset 中构建一个仪表板。仪表板将如下所示：

<Image size="md" img={superset_12} alt="Superset 仪表板显示英国房产价格，包含多个可视化，包括饼图和表格" border />
<br/>

:::tip 添加一些数据
如果您没有可用的数据集，可以添加一些示例。本指南使用的是 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集，您可以选择该数据集。在同一文档类别中还有其他几个可供查看的数据集。
:::

## 1. 收集您的连接信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 安装驱动程序 {#2-install-the-driver}

1. Superset 使用 `clickhouse-connect` 驱动程序连接到 ClickHouse。有关 `clickhouse-connect` 的详细信息，请访问 <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a> ，可以使用以下命令安装：

```console
pip install clickhouse-connect
```

2. 启动（或重启）Superset。

## 3. 连接 Superset 到 ClickHouse {#3-connect-superset-to-clickhouse}

1. 在 Superset 中，从顶部菜单选择 **Data**，然后从下拉菜单中选择 **Databases**。点击 **+ Database** 按钮添加一个新数据库：

<Image size="lg" img={superset_01} alt="Superset 界面显示数据库菜单，突出显示 + Database 按钮" border />
<br/>

2. 在第一步中，选择 **ClickHouse Connect** 作为数据库类型：

<Image size="sm" img={superset_02} alt="Superset 数据库连接向导显示选择 ClickHouse Connect 选项" border />
<br/>

3. 在第二步中：
  - 设置 SSL 开启或关闭。
  - 输入您之前收集的连接信息。
  - 指定 **DISPLAY NAME**：这可以是您喜欢的任何名称。如果您将连接多个 ClickHouse 数据库，请使该名称更具描述性。

<Image size="sm" img={superset_03} alt="Superset 连接配置表单显示 ClickHouse 连接参数" border />
<br/>

4. 点击 **CONNECT** 然后点击 **FINISH** 按钮完成设置向导，您应该会在数据库列表中看到您的数据库。

## 4. 添加数据集 {#4-add-a-dataset}

1. 要通过 Superset 与您的 ClickHouse 数据交互，需要定义一个 **_dataset_**。在 Superset 的顶部菜单中选择 **Data**，然后从下拉菜单中选择 **Datasets**。

2. 点击添加数据集的按钮。选择您的新数据库作为数据源，您应该会看到您数据库中定义的表格：

<Image size="sm" img={superset_04} alt="Superset 数据集创建对话框显示 ClickHouse 数据库中可用的表" border />
<br/>

3. 点击对话框底部的 **ADD** 按钮，您的表将出现在数据集列表中。您可以开始构建仪表板并分析您的 ClickHouse 数据了！

## 5. 在 Superset 中创建图表和仪表板 {#5--creating-charts-and-a-dashboard-in-superset}

如果您熟悉 Superset，那么您在接下来的章节会感到如鱼得水。如果您是 Superset 新手，没关系......这就像世界上许多其他酷炫的可视化工具一样 - 开始不需要太久，但是随着您使用该工具，会逐渐习惯其细节和微妙之处。

1. 您先从一个仪表板开始。在 Superset 的顶部菜单中选择 **Dashboards**。点击右上角的按钮以添加一个新仪表板。以下仪表板命名为 **UK property prices**：

<Image size="md" img={superset_05} alt="空的 Superset 仪表板，名为 UK property prices，准备添加图表" border />
<br/>

2. 要创建一个新图表，从顶部菜单中选择 **Charts**，然后点击添加新图表的按钮。您将看到很多选项。以下示例显示了使用 **CHOOSE A DATASET** 下拉菜单中的 **uk_price_paid** 数据集的 **饼图** 图表：

<Image size="md" img={superset_06} alt="Superset 图表创建界面，选择了饼图可视化类型" border />
<br/>

3. Superset 的饼图需要一个 **Dimension** 和一个 **Metric**，其余设置为可选。您可以为维度和度量选择自己的字段，此示例使用 ClickHouse 字段 `district` 作为维度，`AVG(price)` 作为度量。

<Image size="md" img={superset_08} alt="维度配置，显示选定的 district 字段用于饼图" border />
<Image size="md" img={superset_09} alt="度量配置，显示饼图的 AVG(price) 聚合函数" border />
<br/>

5. 如果您更喜欢甜甜圈图而不是饼图，可以在 **CUSTOMIZE** 下设置该选项及其他选项：

<Image size="sm" img={superset_10} alt="自定义面板，显示甜甜圈图选项和其他饼图配置设置" border />
<br/>

6. 点击 **SAVE** 按钮以保存图表，然后在 **ADD TO DASHBOARD** 下拉菜单中选择 **UK property prices**，然后 **SAVE & GO TO DASHBOARD** 将图表保存并添加到仪表板中：

<Image size="md" img={superset_11} alt="保存图表对话框，显示仪表板选择下拉菜单和保存并转到仪表板按钮" border />
<br/>

7. 就这样。在基于 ClickHouse 数据构建的 Superset 仪表板开启了超快数据分析的全新世界！

<Image size="md" img={superset_12} alt="完成的 Superset 仪表板，包含来自 ClickHouse 的英国房价数据的多个可视化" border />
<br/>

## 相关内容 {#related-content}

- 博客: [用 ClickHouse 可视化数据 - 第 2 部分 - Superset](https://clickhouse.com/blog/visualizing-data-with-superset)
