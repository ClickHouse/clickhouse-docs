---
'sidebar_label': 'Superset'
'sidebar_position': 198
'slug': '/integrations/superset'
'keywords':
- 'superset'
'description': 'Apache Superset 是一个开源的数据探索和可视化平台。'
'title': '连接 Superset 到 ClickHouse'
'show_related_blogs': true
'doc_type': 'guide'
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 Superset 和 ClickHouse

<CommunityMaintainedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> 是一个使用 Python 编写的开源数据探索和可视化平台。Superset 使用 ClickHouse 提供的 Python 驱动程序连接到 ClickHouse。让我们看看它是如何工作的...

## 目标 {#goal}

在本指南中，您将使用来自 ClickHouse 数据库的数据在 Superset 中构建一个仪表板。仪表板将如下所示：

<Image size="md" img={superset_12} alt="Superset dashboard showing UK property prices with multiple visualizations including pie charts and tables" border />
<br/>

:::tip 添加一些数据
如果您没有可以使用的数据集，可以添加一个示例。本指南使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集，因此您可以选择该数据集。在同一文档类别中还有其他几个数据集可以查看。
:::

## 1. 收集您的连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 安装驱动程序 {#2-install-the-driver}

1. Superset 使用 `clickhouse-connect` 驱动程序连接到 ClickHouse。有关 `clickhouse-connect` 的详细信息，请访问 <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>，并可以使用以下命令安装：

```console
pip install clickhouse-connect
```

2. 启动 (或重启) Superset。

## 3. 将 Superset 连接到 ClickHouse {#3-connect-superset-to-clickhouse}

1. 在 Superset 中，从顶部菜单中选择 **Data**，然后从下拉菜单中选择 **Databases**。通过单击 **+ Database** 按钮添加一个新数据库：

<Image size="lg" img={superset_01} alt="Superset interface showing the Database menu with + Database button highlighted" border />
<br/>

2. 在第一步中，选择 **ClickHouse Connect** 作为数据库类型：

<Image size="sm" img={superset_02} alt="Superset database connection wizard showing ClickHouse Connect option selected" border />
<br/>

3. 在第二步中：
- 设置 SSL 开或关。
- 输入您之前收集的连接信息
- 指定 **DISPLAY NAME**：这可以是您喜欢的任何名称。如果您将连接多个 ClickHouse 数据库，那么使名称更加描述性。

<Image size="sm" img={superset_03} alt="Superset connection configuration form showing ClickHouse connection parameters" border />
<br/>

4. 单击 **CONNECT** 然后 **FINISH** 按钮以完成设置向导，您应该会在数据库列表中看到您的数据库。

## 4. 添加数据集 {#4-add-a-dataset}

1. 要在 Superset 中与您的 ClickHouse 数据进行交互，您需要定义一个 **_dataset_**。在 Superset 的顶部菜单中，选择 **Data**，然后从下拉菜单中选择 **Datasets**。

2. 单击添加数据集的按钮。选择您的新数据库作为数据源，您应该会看到数据库中定义的表：

<Image size="sm" img={superset_04} alt="Superset dataset creation dialog showing available tables from ClickHouse database" border />
<br/>

3. 单击对话框窗口底部的 **ADD** 按钮，您的表将出现在数据集列表中。您准备好构建仪表板并分析您的 ClickHouse 数据！

## 5. 在 Superset 中创建图表和仪表板 {#5--creating-charts-and-a-dashboard-in-superset}

如果您熟悉 Superset，那么您会对下一部分感到非常熟悉。如果您是 Superset 新手，那么...这就像世界上许多其他酷炫的可视化工具 - 启动并不需要很长时间，但在使用工具时会随着时间的推移学习到细节和技巧。

1. 您以一个仪表板开始。在 Superset 的顶部菜单中选择 **Dashboards**。单击右上角的按钮以添加新的仪表板。以下仪表板名为 **UK property prices**：

<Image size="md" img={superset_05} alt="Empty Superset dashboard named UK property prices ready for charts to be added" border />
<br/>

2. 要创建新的图表，从顶部菜单中选择 **Charts**，然后单击按钮以添加新图表。您将会看到许多选项。以下示例使用 **CHOOSE A DATASET** 下拉菜单中的 **uk_price_paid** 数据集显示了一个 **Pie Chart** 图表：

<Image size="md" img={superset_06} alt="Superset chart creation interface with Pie Chart visualization type selected" border />
<br/>

3. Superset 饼图需要一个 **Dimension** 和一个 **Metric**，其余设置为可选。您可以选择自己字段作为维度和度量，此示例将 ClickHouse 字段 `district` 用作维度，使用 `AVG(price)` 作为度量。

<Image size="md" img={superset_08} alt="Dimension configuration showing district field selected for pie chart" border />
<Image size="md" img={superset_09} alt="Metric configuration showing AVG(price) aggregate function for pie chart" border />
<br/>

5. 如果您更喜欢甜甜圈图而不是饼图，您可以在 **CUSTOMIZE** 下设置该选项及其他选项：

<Image size="sm" img={superset_10} alt="Customize panel showing doughnut chart option and other pie chart configuration settings" border />
<br/>

6. 单击 **SAVE** 按钮以保存图表，然后在 **ADD TO DASHBOARD** 下拉菜单中选择 **UK property prices**，然后 **SAVE & GO TO DASHBOARD** 保存图表并将其添加到仪表板：

<Image size="md" img={superset_11} alt="Save chart dialog with dashboard selection dropdown and Save & Go to Dashboard button" border />
<br/>

7. 就这样。在 Superset 中基于 ClickHouse 中的数据构建仪表板为快速的数据分析打开了一个全新的世界！

<Image size="md" img={superset_12} alt="Completed Superset dashboard with multiple visualizations of UK property price data from ClickHouse" border />
<br/>
