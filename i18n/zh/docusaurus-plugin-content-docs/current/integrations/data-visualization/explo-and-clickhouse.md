---
'sidebar_label': 'Explo'
'sidebar_position': 131
'slug': '/integrations/explo'
'keywords':
- 'clickhouse'
- 'Explo'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Explo 是一个易于使用的开源用户界面工具，用于查询您的数据。'
'title': '连接 Explo 与 ClickHouse'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import explo_01 from '@site/static/images/integrations/data-visualization/explo_01.png';
import explo_02 from '@site/static/images/integrations/data-visualization/explo_02.png';
import explo_03 from '@site/static/images/integrations/data-visualization/explo_03.png';
import explo_04 from '@site/static/images/integrations/data-visualization/explo_04.png';
import explo_05 from '@site/static/images/integrations/data-visualization/explo_05.png';
import explo_06 from '@site/static/images/integrations/data-visualization/explo_06.png';
import explo_07 from '@site/static/images/integrations/data-visualization/explo_07.png';
import explo_08 from '@site/static/images/integrations/data-visualization/explo_08.png';
import explo_09 from '@site/static/images/integrations/data-visualization/explo_09.png';
import explo_10 from '@site/static/images/integrations/data-visualization/explo_10.png';
import explo_11 from '@site/static/images/integrations/data-visualization/explo_11.png';
import explo_12 from '@site/static/images/integrations/data-visualization/explo_12.png';
import explo_13 from '@site/static/images/integrations/data-visualization/explo_13.png';
import explo_14 from '@site/static/images/integrations/data-visualization/explo_14.png';
import explo_15 from '@site/static/images/integrations/data-visualization/explo_15.png';
import explo_16 from '@site/static/images/integrations/data-visualization/explo_16.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 Explo 和 ClickHouse

<CommunityMaintainedBadge/>

面向客户的任何平台分析。旨在提供美观的可视化。设计简单易用。

## 目标 {#goal}

在本指南中，您将把 ClickHouse 的数据连接到 Explo，并可视化结果。图表看起来像这样：
<Image img={explo_15} size="md" alt="Explo Dashboard" />

<p/>

:::tip 添加一些数据
如果您没有数据集可以使用，您可以添加一个示例。本指南使用的是 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集，因此您可能选择这个。还有其他几个可以在同一文档类别中查看。
:::

## 1. 收集连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 将 Explo 连接到 ClickHouse {#2--connect-explo-to-clickhouse}

1. 注册一个 Explo 账户。

2. 点击左侧边栏上的 Explo **数据** 选项卡。

<Image img={explo_01} size="sm" alt="Data Tab" border />

3. 在右上角点击 **连接数据源**。

<Image img={explo_02} size="sm" alt="Connect Data Source" border />

4. 在 **入门** 页面填写信息。

<Image img={explo_03} size="md" alt="Getting Started" border />

5. 选择 **Clickhouse**。

<Image img={explo_04} size="md" alt="Clickhouse" border />

6. 输入您的 **Clickhouse 凭据**。

<Image img={explo_05} size="md" alt="Credentials" border />

7. 配置 **安全性**。

<Image img={explo_06} size="md" alt="Security" border />

8. 在 Clickhouse 中，**允许 Explo 的 IP 地址**。
`
54.211.43.19, 52.55.98.121, 3.214.169.94, 和 54.156.141.148
`

## 3. 创建仪表板 {#3-create-a-dashboard}

1. 在左侧导航栏中导航到 **仪表板** 选项卡。

<Image img={explo_07} size="sm" alt="Dashboard" border />

2. 在右上角点击 **创建仪表板** 并命名您的仪表板。您现在已经创建了一个仪表板！

<Image img={explo_08} size="sm" alt="Create Dashboard" border />

3. 现在您应该看到一个类似于以下的屏幕：

<Image img={explo_09} size="md" alt="Explo Dashboard" border />

## 4. 运行 SQL 查询 {#4-run-a-sql-query}

1. 从右侧边栏的架构标题下获取您的表名。然后在您的数据集编辑器中输入以下命令：
`
SELECT * FROM YOUR_TABLE_NAME
LIMIT 100
`

<Image img={explo_10} size="md" alt="Explo Dashboard" border />

2. 现在点击运行并转到预览选项卡以查看您的数据。

<Image img={explo_11} size="md" alt="Explo Dashboard" border />

## 5. 构建图表 {#5-build-a-chart}

1. 从左侧拖动条形图图标到屏幕上。

<Image img={explo_16} size="sm" alt="Explo Dashboard" border />

2. 选择数据集。您现在应该会看到如下屏幕：

<Image img={explo_12} size="sm" alt="Explo Dashboard" border />

3. 在 X 轴中填写 **county**，在 Y 轴部分中填写 **Price** 如下：

<Image img={explo_13} size="sm" alt="Explo Dashboard" border />

4. 现在，将聚合更改为 **AVG**。

<Image img={explo_14} size="sm" alt="Explo Dashboard" border />

5. 我们现在有按价格分解的房屋平均价格！

<Image img={explo_15} size="md" alt="Explo Dashboard" />

## 了解更多 {#learn-more}

通过 <a href="https://docs.explo.co/" target="_blank">访问 Explo 文档</a> 找到关于 Explo 及如何构建仪表板的更多信息。
