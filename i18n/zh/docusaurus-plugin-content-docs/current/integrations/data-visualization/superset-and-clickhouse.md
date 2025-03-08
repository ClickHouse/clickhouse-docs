---
sidebar_label: 'Superset'
sidebar_position: 198
slug: '/integrations/superset'
keywords: ['clickhouse', 'superset', 'connect', 'integrate', 'ui']
description: 'Apache Superset 是一个开源数据探索和可视化平台。'
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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


# 连接 Superset 和 ClickHouse

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> 是一个用 Python 编写的开源数据探索和可视化平台。Superset 通过 ClickHouse 提供的 Python 驱动程序连接到 ClickHouse。让我们看看它是如何工作的...

## 目标 {#goal}

在本指南中，您将使用来自 ClickHouse 数据库的数据在 Superset 中构建一个仪表板。仪表板将看起来像这样：

<img alt="New Dashboard" src={superset_12}/>
<br/>

:::tip 添加一些数据
如果您没有可使用的数据集，可以添加其中一个示例。本指南使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集，因此您可以选择该数据集。在同一文档类别中还有其他几个可供查看的数据集。
:::

## 1. 收集您的连接信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 安装驱动程序 {#2-install-the-driver}

1. Superset 使用 `clickhouse-connect` 驱动程序连接到 ClickHouse。有关 `clickhouse-connect` 的详细信息，请访问 <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>，可以使用以下命令安装：

    ```console
    pip install clickhouse-connect
    ```

2. 启动（或重新启动）Superset。

## 3. 将 Superset 连接到 ClickHouse {#3-connect-superset-to-clickhouse}

1. 在 Superset 中，从顶部菜单选择 **Data**，然后从下拉菜单中选择 **Databases**。通过单击 **+ Database** 按钮添加一个新数据库：

<img alt="Add a new database" src={superset_01}/>
<br/>

2. 在第一步中，选择 **ClickHouse Connect** 作为数据库类型：

<img alt="Select Clickhouse" src={superset_02}/>
<br/>

3. 在第二步中：
  - 设置 SSL 开启或关闭。
  - 输入您之前收集的连接信息。
  - 指定 **DISPLAY NAME**：可以是您喜欢的任何名称。如果您将连接到多个 ClickHouse 数据库，请使名称更具描述性。

<img alt="Test the connection" src={superset_03}/>
<br/>

4. 点击 **CONNECT** 然后 **FINISH** 按钮以完成设置向导，您应该会在数据库列表中看到您的数据库。

## 4. 添加数据集 {#4-add-a-dataset}

1. 要通过 Superset 与您的 ClickHouse 数据交互，您需要定义一个 **_dataset_**。在 Superset 的顶部菜单中，选择 **Data**，然后从下拉菜单中选择 **Datasets**。

2. 点击添加数据集的按钮。选择您的新数据库作为数据源，您应该会看到在您的数据库中定义的表：

<img alt="New dataset" src={superset_04}/>
<br/>

3. 在对话框窗口底部单击 **ADD** 按钮，您的表将出现在数据集列表中。您已经准备好构建仪表板并分析您的 ClickHouse 数据！

## 5. 在 Superset 中创建图表和仪表板 {#5--creating-charts-and-a-dashboard-in-superset}

如果您熟悉 Superset，那么您将在下一个部分中感到如鱼得水。如果您是 Superset 的新手，嗯...这就像世界上许多其他酷炫的可视化工具 - 开始使用并不需要很长时间，但细节和细微差别会随着您使用该工具而逐渐了解。

1. 您从一个仪表板开始。在 Superset 的顶部菜单中，选择 **Dashboards**。单击右上角的按钮以添加一个新仪表板。以下仪表板名为 **UK property prices**：

<img alt="New dashboard" src={superset_05}/>
<br/>

2. 要创建一个新图表，从顶部菜单中选择 **Charts**，然后单击按钮以添加一个新图表。您将看到许多选项。以下示例展示了一个 **Pie Chart** 图表，使用的是 **uk_price_paid** 数据集从 **CHOOSE A DATASET** 下拉菜单中选择：

<img alt="New chart" src={superset_06}/>
<br/>

3. Superset 的饼图需要一个 **Dimension** 和一个 **Metric**，其余设置为可选。您可以为维度和度量选择自己的字段，此示例使用 ClickHouse 字段 `district` 作为维度，`AVG(price)` 作为度量。

<img alt="The SUM metric" src={superset_08}/>
<img alt="The SUM metric" src={superset_09}/>
<br/>

5. 如果您更喜欢甜甜圈图而不是饼图，您可以在 **CUSTOMIZE** 下进行设置和其他选项：

<img alt="Add Chart to Dashboard" src={superset_10}/>
<br/>

6. 单击 **SAVE** 按钮保存图表，然后在 **ADD TO DASHBOARD** 下拉菜单中选择 **UK property prices**，然后 **SAVE & GO TO DASHBOARD** 将图表保存并添加到仪表板中：

<img alt="Add Chart to Dashboard" src={superset_11}/>
<br/>

7. 就这样。基于 ClickHouse 数据在 Superset 中构建仪表板打开了一个快速数据分析的新世界！

<img alt="New Dashboard" src={superset_12}/>
<br/>

## 相关内容 {#related-content}

- 博客: [使用 ClickHouse 可视化数据 - 第 2 部分 - Superset](https://clickhouse.com/blog/visualizing-data-with-superset)
