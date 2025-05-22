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

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> 是一个用 Python 编写的开源数据探索和可视化平台。Superset 通过 ClickHouse 提供的 Python 驱动程序连接到 ClickHouse。让我们看看它是如何工作的...

## 目标 {#goal}

在本指南中，您将使用来自 ClickHouse 数据库的数据在 Superset 中构建一个仪表板。仪表板看起来像这样：

<Image size="md" img={superset_12} alt="Superset dashboard showing UK property prices with multiple visualizations including pie charts and tables" border />
<br/>

:::tip 添加一些数据
如果您没有数据集可以使用，可以添加一个示例。本指南使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集，因此您可以选择这个。有几个其他的可以在同一文档类别中查看。
:::

## 1. 收集连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 安装驱动程序 {#2-install-the-driver}

1. Superset 使用 `clickhouse-connect` 驱动程序连接到 ClickHouse。`clickhouse-connect` 的详细信息在 <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>，可以使用以下命令安装：

```console
pip install clickhouse-connect
```

2. 启动 (或重启) Superset。

## 3. 将 Superset 连接到 ClickHouse {#3-connect-superset-to-clickhouse}

1. 在 Superset 中，从顶部菜单选择 **数据**，然后从下拉菜单中选择 **数据库**。通过点击 **+ 数据库** 按钮添加一个新数据库：

<Image size="lg" img={superset_01} alt="Superset interface showing the Database menu with + Database button highlighted" border />
<br/>

2. 在第一步中，选择 **ClickHouse Connect** 作为数据库类型：

<Image size="sm" img={superset_02} alt="Superset database connection wizard showing ClickHouse Connect option selected" border />
<br/>

3. 在第二步中：
  - 设置 SSL 完成或关闭。
  - 输入您之前收集的连接信息
  - 指定 **显示名称**：这可以是您喜欢的任何名称。如果您将连接到多个 ClickHouse 数据库，请使名称更具描述性。

<Image size="sm" img={superset_03} alt="Superset connection configuration form showing ClickHouse connection parameters" border />
<br/>

4. 点击 **连接** 然后 **完成** 按钮以完成设置向导，您应该会在数据库列表中看到您的数据库。

## 4. 添加数据集 {#4-add-a-dataset}

1. 要通过 Superset 与您的 ClickHouse 数据交互，您需要定义一个 **数据集**。在 Superset 的顶部菜单中，选择 **数据**，然后从下拉菜单中选择 **数据集**。

2. 点击添加数据集的按钮。选择您的新数据库作为数据源，您应该会看到在您的数据库中定义的表：

<Image size="sm" img={superset_04} alt="Superset dataset creation dialog showing available tables from ClickHouse database" border />
<br/>

3. 点击对话窗口底部的 **添加** 按钮，您的表会出现在数据集列表中。您已经准备好构建仪表板并分析您的 ClickHouse 数据！

## 5. 在 Superset 中创建图表和仪表板 {#5--creating-charts-and-a-dashboard-in-superset}

如果您熟悉 Superset，那么在这个下一部分您会感觉如鱼得水。如果您是 Superset 新手，那么...它就像其他许多很酷的可视化工具 - 开始不需要太长时间，但细节和细微差别会随着您使用该工具而学习。

1. 您首先从仪表板开始。在 Superset 的顶部菜单中，选择 **仪表板**。点击右上角的按钮添加一个新仪表板。下面的仪表板命名为 **UK property prices**：

<Image size="md" img={superset_05} alt="Empty Superset dashboard named UK property prices ready for charts to be added" border />
<br/>

2. 要创建新的图表，选择 **图表** 从顶部菜单，并点击添加新图表的按钮。您将看到许多选项。以下示例展示了使用 **uk_price_paid** 数据集的 **饼图** 图表：

<Image size="md" img={superset_06} alt="Superset chart creation interface with Pie Chart visualization type selected" border />
<br/>

3. Superset 饼图需要一个 **维度** 和一个 **指标**，其余设置是可选的。您可以为维度和指标选择自己的字段，这个示例使用 ClickHouse 字段 `district` 作为维度和 `AVG(price)` 作为指标。

<Image size="md" img={superset_08} alt="Dimension configuration showing district field selected for pie chart" border />
<Image size="md" img={superset_09} alt="Metric configuration showing AVG(price) aggregate function for pie chart" border />
<br/>

5. 如果您更喜欢甜甜圈图而不是饼图，可以在 **自定义** 下设置该选项和其他选项：

<Image size="sm" img={superset_10} alt="Customize panel showing doughnut chart option and other pie chart configuration settings" border />
<br/>

6. 点击 **保存** 按钮以保存图表，然后在 **添加到仪表板** 下拉菜单中选择 **UK property prices**，然后 **保存并转到仪表板** 保存图表并将其添加到仪表板：

<Image size="md" img={superset_11} alt="Save chart dialog with dashboard selection dropdown and Save & Go to Dashboard button" border />
<br/>

7. 就这样。在 Superset 中基于 ClickHouse 中的数据构建仪表板为闪电般快速的数据分析打开了一个全新的世界！

<Image size="md" img={superset_12} alt="Completed Superset dashboard with multiple visualizations of UK property price data from ClickHouse" border />
<br/>

## 相关内容 {#related-content}

- 博客：[使用 ClickHouse 可视化数据 - 第 2 部分 - Superset](https://clickhouse.com/blog/visualizing-data-with-superset)
