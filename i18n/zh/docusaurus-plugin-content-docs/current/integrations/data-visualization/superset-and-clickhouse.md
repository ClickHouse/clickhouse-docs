---
sidebar_label: 'Superset'
sidebar_position: 198
slug: /integrations/superset
keywords: ['superset']
description: 'Apache Superset 是一款开源的数据探索与可视化平台。'
title: '将 Superset 连接到 ClickHouse'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/ClickHouse/clickhouse-connect'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# 将 Superset 连接到 ClickHouse

<ClickHouseSupportedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> 是一个由 Python 编写的开源数据探索与可视化平台。Superset 使用 ClickHouse 提供的 Python 驱动连接到 ClickHouse。下面来看它是如何工作的……



## Goal {#goal}

在本指南中,您将使用 ClickHouse 数据库中的数据在 Superset 中构建仪表板。仪表板效果如下:

<Image
  size='md'
  img={superset_12}
  alt='Superset 仪表板展示英国房产价格,包含饼图和表格等多种可视化图表'
  border
/>
<br />

:::tip 添加数据
如果您没有可用的数据集,可以添加示例数据集。本指南使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集,建议您选择该数据集。同一文档类别中还有其他数据集可供参考。
:::


## 1. 收集连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. 安装驱动程序 {#2-install-the-driver}

1. Superset 使用 `clickhouse-connect` 驱动程序连接到 ClickHouse。有关 `clickhouse-connect` 的详细信息,请访问 <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>,可以使用以下命令进行安装:

   ```console
   pip install clickhouse-connect
   ```

2. 启动(或重启)Superset。


## 3. 将 Superset 连接到 ClickHouse {#3-connect-superset-to-clickhouse}

1. 在 Superset 中,从顶部菜单选择 **Data**,然后从下拉菜单中选择 **Databases**。点击 **+ Database** 按钮添加新数据库:

<Image
  size='lg'
  img={superset_01}
  alt='Superset 界面显示数据库菜单,+ Database 按钮已高亮'
  border
/>
<br />

2. 在第一步中,选择 **ClickHouse Connect** 作为数据库类型:

<Image
  size='sm'
  img={superset_02}
  alt='Superset 数据库连接向导显示已选择 ClickHouse Connect 选项'
  border
/>
<br />

3. 在第二步中:

- 设置是否启用 SSL。
- 输入您之前收集的连接信息
- 指定 **DISPLAY NAME**:可以是您偏好的任何名称。如果您需要连接到多个 ClickHouse 数据库,建议使用更具描述性的名称。

<Image
  size='sm'
  img={superset_03}
  alt='Superset 连接配置表单显示 ClickHouse 连接参数'
  border
/>
<br />

4. 点击 **CONNECT** 按钮,然后点击 **FINISH** 按钮完成设置向导,您应该能在数据库列表中看到您的数据库。


## 4. 添加数据集 {#4-add-a-dataset}

1. 要在 Superset 中与 ClickHouse 数据交互,您需要定义一个**_数据集_**。在 Superset 顶部菜单中,选择 **Data**,然后从下拉菜单中选择 **Datasets**。

2. 点击添加数据集按钮。选择您新创建的数据库作为数据源,您应该能看到数据库中定义的表:

<Image
  size='sm'
  img={superset_04}
  alt='Superset 数据集创建对话框,显示 ClickHouse 数据库中的可用表'
  border
/>
<br />

3. 点击对话框底部的 **ADD** 按钮,您的表将出现在数据集列表中。现在您可以开始构建仪表板并分析 ClickHouse 数据了!


## 5. 在 Superset 中创建图表和仪表板 {#5--creating-charts-and-a-dashboard-in-superset}

如果您熟悉 Superset,那么接下来的内容对您来说会很轻松。如果您是 Superset 新手,它就像世界上许多其他优秀的可视化工具一样——入门很快,但细节和技巧需要在使用过程中逐步掌握。

1. 首先创建一个仪表板。在 Superset 的顶部菜单中选择 **Dashboards**。点击右上角的按钮添加新仪表板。以下仪表板命名为 **UK property prices**:

<Image
  size='md'
  img={superset_05}
  alt='名为 UK property prices 的空 Superset 仪表板,准备添加图表'
  border
/>
<br />

2. 要创建新图表,从顶部菜单选择 **Charts** 并点击按钮添加新图表。您会看到许多选项。以下示例展示了使用 **CHOOSE A DATASET** 下拉菜单中的 **uk_price_paid** 数据集创建 **Pie Chart** 图表:

<Image
  size='md'
  img={superset_06}
  alt='Superset 图表创建界面,已选择饼图可视化类型'
  border
/>
<br />

3. Superset 饼图需要一个 **Dimension**(维度)和一个 **Metric**(指标),其余设置是可选的。您可以为维度和指标选择自己的字段,本示例使用 ClickHouse 字段 `district` 作为维度,`AVG(price)` 作为指标。

<Image
  size='md'
  img={superset_08}
  alt='维度配置显示为饼图选择了 district 字段'
  border
/>
<Image
  size='md'
  img={superset_09}
  alt='指标配置显示饼图使用 AVG(price) 聚合函数'
  border
/>
<br />

5. 如果您更喜欢环形图而不是饼图,可以在 **CUSTOMIZE** 下设置该选项及其他选项:

<Image
  size='sm'
  img={superset_10}
  alt='自定义面板显示环形图选项和其他饼图配置设置'
  border
/>
<br />

6. 点击 **SAVE** 按钮保存图表,然后在 **ADD TO DASHBOARD** 下拉菜单中选择 **UK property prices**,接着点击 **SAVE & GO TO DASHBOARD** 保存图表并将其添加到仪表板:

<Image
  size='md'
  img={superset_11}
  alt='保存图表对话框,包含仪表板选择下拉菜单和 Save & Go to Dashboard 按钮'
  border
/>
<br />

7. 就是这样。基于 ClickHouse 中的数据在 Superset 中构建仪表板,为您开启了极速数据分析的全新世界!

<Image
  size='md'
  img={superset_12}
  alt='完成的 Superset 仪表板,包含来自 ClickHouse 的英国房产价格数据的多个可视化图表'
  border
/>
<br />
