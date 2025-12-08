---
sidebar_label: 'Superset'
sidebar_position: 198
slug: /integrations/superset
keywords: ['superset']
description: 'Apache Superset 是一个开源的数据探索和可视化平台。'
title: '连接 Superset 与 ClickHouse'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/ClickHouse/clickhouse-connect'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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

# 将 Superset 连接到 ClickHouse {#connect-superset-to-clickhouse}

<ClickHouseSupportedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> 是一个用 Python 编写的开源数据探索和可视化平台。Superset 使用由 ClickHouse 提供的 Python 驱动程序连接到 ClickHouse。让我们看看它是如何工作的……

## 目标 {#goal}

在本指南中，你将使用 ClickHouse 数据库中的数据，在 Superset 中构建一个仪表板。仪表板将如下所示：

<Image size="md" img={superset_12} alt="Superset 仪表板展示英国房产价格，其中包含饼图和表格等多种可视化" border />
<br/>

:::tip 添加一些数据
如果你还没有可用的数据集，可以添加一个示例数据集。本指南使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集，你可以选用它。在同一文档分类下还有多个其他示例数据集可供查看。
:::

## 1. 收集连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 安装驱动程序 {#2-install-the-driver}

1. Superset 使用 `clickhouse-connect` 驱动程序连接到 ClickHouse。有关 `clickhouse-connect` 的详细信息，请参阅 <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>，可以通过以下命令进行安装：

    ```console
    pip install clickhouse-connect
    ```

2. 启动（或重新启动）Superset。

## 3. 将 Superset 连接到 ClickHouse {#3-connect-superset-to-clickhouse}

1. 在 Superset 中，从顶部菜单中选择 **Data**，然后在下拉菜单中选择 **Databases**。点击 **+ Database** 按钮添加一个新数据库：

<Image size="lg" img={superset_01} alt="Superset 界面显示 Database 菜单，并高亮了 + Database 按钮" border />
<br/>

2. 在第一步中，选择 **ClickHouse Connect** 作为数据库类型：

<Image size="sm" img={superset_02} alt="Superset 数据库连接向导，显示已选中的 ClickHouse Connect 选项" border />
<br/>

3. 在第二步中：
- 根据需要开启或关闭 SSL。
- 输入之前收集的连接信息。
- 指定 **DISPLAY NAME**：可以是任意你喜欢的名称。如果你将连接到多个 ClickHouse 数据库，请使用更具描述性的名称。

<Image size="sm" img={superset_03} alt="Superset 连接配置表单，显示 ClickHouse 连接参数" border />
<br/>

4. 依次点击 **CONNECT** 和 **FINISH** 按钮完成向导设置，此时你应该可以在数据库列表中看到你的数据库。

## 4. 添加数据集 {#4-add-a-dataset}

1. 要在 Superset 中与 ClickHouse 数据交互，您需要先定义一个**数据集（_dataset_）**。在 Superset 顶部菜单中选择 **Data**，然后在下拉菜单中选择 **Datasets**。

2. 点击添加数据集的按钮。将您的新数据库选择为数据源（datasource），随后您应能看到该数据库中定义的表：

<Image size="sm" img={superset_04} alt="Superset 数据集创建对话框，显示来自 ClickHouse 数据库的可用表" border />
<br/>

3. 点击对话窗口底部的 **ADD** 按钮，您的表就会出现在数据集列表中。现在您已经可以构建仪表板（dashboard）并分析 ClickHouse 数据了！

## 5.  在 Superset 中创建图表和仪表板 {#5--creating-charts-and-a-dashboard-in-superset}

如果您已经熟悉 Superset，那么接下来的内容会让您觉得非常熟悉。如果您是第一次使用 Superset，那么……它和很多其他优秀的可视化工具类似——上手很快，但各种细节和使用技巧需要在您持续使用工具的过程中逐步掌握。

1. 从仪表板开始。在 Superset 顶部菜单中选择 **Dashboards**。点击右上角的按钮添加一个新的仪表板。下面的仪表板名为 **UK property prices**：

<Image size="md" img={superset_05} alt="空的 Superset 仪表板，名为 UK property prices，已准备好添加图表" border />
<br/>

2. 要创建新图表，从顶部菜单选择 **Charts**，然后点击按钮添加新图表。您会看到很多选项。下面的示例展示了在 **CHOOSE A DATASET** 下拉菜单中选择 **uk_price_paid** 数据集并使用 **Pie Chart** 图表类型的配置界面：

<Image size="md" img={superset_06} alt="Superset 图表创建界面，选择了 Pie Chart 可视化类型" border />
<br/>

3. Superset 的饼图需要一个 **Dimension** 和一个 **Metric**，其余设置都是可选的。您可以为 Dimension 和 Metric 选择自己的字段，本示例使用 ClickHouse 字段 `district` 作为 Dimension，`AVG(price)` 作为 Metric。

<Image size="md" img={superset_08} alt="Dimension 配置界面，展示为饼图选择的 district 字段" border />
<Image size="md" img={superset_09} alt="Metric 配置界面，展示为饼图选择的 AVG(price) 聚合函数" border />
<br/>

5. 如果您比起饼图更喜欢环形图，可以在 **CUSTOMIZE** 中设置该项及其他选项：

<Image size="sm" img={superset_10} alt="Customize 面板，展示环形图选项和其他饼图配置设置" border />
<br/>

6. 点击 **SAVE** 按钮保存图表，然后在 **ADD TO DASHBOARD** 下拉菜单中选择 **UK property prices**，接着点击 **SAVE & GO TO DASHBOARD** 即可保存图表并将其添加到该仪表板中：

<Image size="md" img={superset_11} alt="保存图表对话框，包含仪表板选择下拉菜单和 Save & Go to Dashboard 按钮" border />
<br/>

7. 就这样。基于 ClickHouse 数据在 Superset 中构建仪表板，将为您打开一个极速数据分析的全新世界！

<Image size="md" img={superset_12} alt="已完成的 Superset 仪表板，其中包含多个基于 ClickHouse 英国房价数据的可视化图表" border />
<br/>
