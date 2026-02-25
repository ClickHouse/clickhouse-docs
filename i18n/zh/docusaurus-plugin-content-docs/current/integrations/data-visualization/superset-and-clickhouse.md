---
sidebar_label: 'Superset'
sidebar_position: 198
slug: /integrations/superset
keywords: ['superset']
description: 'Apache Superset 是一个开源的数据探索和可视化平台。'
title: '将 Superset 连接到 ClickHouse'
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


# 将 Superset 连接到 ClickHouse \{#connect-superset-to-clickhouse\}

<ClickHouseSupportedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> 是一个由 Python 编写的开源数据探索与可视化平台。Superset 使用由 ClickHouse 提供的 Python 驱动连接到 ClickHouse。下面我们来看它是如何工作的……

## 目标 \{#goal\}

在本指南中，你将使用 ClickHouse 数据库中的数据在 Superset 中构建一个仪表板。该仪表板将如下所示：

<Image size="md" img={superset_12} alt="Superset 仪表板展示英国房产价格，包含饼图和数据表等多种可视化" border />

<br/>

:::tip 添加一些数据
如果你当前没有可用的数据集，可以添加一个示例数据集。本指南使用的是 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集，因此你可以选择它。在同一文档类别中还有其他多个数据集可供查看。
:::

## 1. 收集连接信息 \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. 安装驱动程序 \{#2-install-the-driver\}

1. Superset 使用 `clickhouse-connect` 驱动程序连接到 ClickHouse。`clickhouse-connect` 的详细信息参见 <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>，可以使用以下命令进行安装：

    ```console
    pip install clickhouse-connect
    ```

    :::note Docker Compose Setup
    对于基于 Docker 的安装，请参阅 [Superset database configuration guide](https://superset.apache.org/docs/configuration/databases/#clickhouse)，了解如何将 `clickhouse-connect` 添加到容器。
    :::

2. 启动（或重新启动）Superset。

## 3. 将 Superset 连接到 ClickHouse \{#3-connect-superset-to-clickhouse\}

1. 在 Superset 中，从顶部菜单中选择 **Data**，然后在下拉菜单中选择 **Databases**。点击 **+ Database** 按钮添加一个新数据库：

<Image size="lg" img={superset_01} alt="Superset 界面显示 Database 菜单，并高亮显示 + Database 按钮" border />

<br/>

2. 在第一步中，选择 **ClickHouse Connect** 作为数据库类型：

<Image size="sm" img={superset_02} alt="Superset 数据库连接向导中显示已选中的 ClickHouse Connect 选项" border />

<br/>

3. 在第二步中：

- 将 SSL 配置为开启或关闭。
- 输入之前收集的连接信息。
- 指定 **DISPLAY NAME**：可以是任意你喜欢的名称。如果将连接多个 ClickHouse 数据库，建议使用更具描述性的名称。

<Image size="sm" img={superset_03} alt="Superset 连接配置表单，显示 ClickHouse 连接参数" border />

<br/>

4. 点击 **CONNECT**，然后点击 **FINISH** 按钮以完成设置向导。完成后，你应该可以在数据库列表中看到该数据库。

## 4. 添加数据集 (Dataset) \{#4-add-a-dataset\}

1. 要在 Superset 中与 ClickHouse 数据交互，您需要先定义一个 **_dataset_**。在 Superset 顶部菜单中选择 **Data**，然后在下拉菜单中选择 **Datasets**。

2. 点击用于添加 dataset 的按钮。将新建的数据库选作数据源，您应该可以看到该数据库中已有的表：

<Image size="sm" img={superset_04} alt="Superset 数据集创建对话框，显示来自 ClickHouse 数据库的可用表" border />

<br/>

3. 点击对话框底部的 **ADD** 按钮，您的表就会出现在 datasets 列表中。现在您已经可以开始构建仪表板并分析 ClickHouse 数据了！

## 5.  在 Superset 中创建图表和仪表板 \{#5--creating-charts-and-a-dashboard-in-superset\}

如果你已经熟悉 Superset，那么接下来的内容会让你感觉非常顺手。如果你是 Superset 新手，那么……它和很多其他优秀的可视化工具类似——上手很快，但使用过程中会逐步掌握其中的细节和使用技巧。

1. 从创建仪表板开始。在 Superset 顶部菜单中选择 **Dashboards**。点击右上角的按钮以添加一个新的仪表板。下面的仪表板名为 **UK property prices**：

<Image size="md" img={superset_05} alt="名为 UK property prices 的空 Superset 仪表板，已准备好添加图表" border />

<br/>

2. 要创建一个新图表，从顶部菜单选择 **Charts** 并点击按钮以添加新图表。你会看到很多可选项。下面的示例展示了一个 **Pie Chart** 图表，它使用 **CHOOSE A DATASET** 下拉菜单中的 **uk_price_paid** 数据集：

<Image size="md" img={superset_06} alt="Superset 图表创建界面，其中已选择 Pie Chart 可视化类型" border />

<br/>

3. Superset 饼图需要一个 **Dimension** 和一个 **Metric**，其余设置为可选。你可以为维度和指标选择自己的字段，本示例使用 ClickHouse 字段 `district` 作为维度，`AVG(price)` 作为指标。

<Image size="md" img={superset_08} alt="维度配置，显示为饼图选择了 district 字段" border />

<Image size="md" img={superset_09} alt="指标配置，显示为饼图选择了 AVG(price) 聚合函数" border />

<br/>

5. 如果你比起饼图更喜欢环形图，可以在 **CUSTOMIZE** 下进行该项及其他选项的设置：

<Image size="sm" img={superset_10} alt="自定义面板，显示环形图选项和其他饼图配置设置" border />

<br/>

6. 点击 **SAVE** 按钮保存图表，然后在 **ADD TO DASHBOARD** 下拉菜单中选择 **UK property prices**，接着点击 **SAVE & GO TO DASHBOARD** 即可保存图表并将其添加到该仪表板中：

<Image size="md" img={superset_11} alt="保存图表对话框，包含仪表板选择下拉菜单和 Save & Go to Dashboard 按钮" border />

<br/>

7. 就是这样。基于 ClickHouse 数据在 Superset 中构建仪表板，可以开启一个极致高速的数据分析世界！

<Image size="md" img={superset_12} alt="已完成的 Superset 仪表板，其中包含多个基于 ClickHouse 英国房价数据的可视化图表" border />

<br/>