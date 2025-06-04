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
'description': 'Explo 是一个易于使用的开源 UI 工具，用于查询您的 数据。'
'title': '连接 Explo 和 ClickHouse'
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


# 将Explo连接到ClickHouse

<CommunityMaintainedBadge/>

用于任何平台的客户分析。旨在提供美观的可视化。工程设计简单易用。

## 目标 {#goal}

在本指南中，您将把ClickHouse中的数据连接到Explo并可视化结果。图表将如下所示：
<Image img={explo_15} size="md" alt="Explo Dashboard" />

<p/>

:::tip 添加一些数据
如果您没有数据集可以使用，可以添加一些示例。本指南使用[UK Price Paid](/getting-started/example-datasets/uk-price-paid.md)数据集，因此您可以选择该数据集。在同一文档类别中还有其他几个供您选择。
:::

## 1. 收集连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 将Explo连接到ClickHouse {#2--connect-explo-to-clickhouse}

1. 注册Explo账户。

2. 单击左侧边栏中的Explo **数据**选项卡。

<Image img={explo_01} size="sm" alt="数据选项卡" border />

3. 在右上角单击 **连接数据源**。

<Image img={explo_02} size="sm" alt="连接数据源" border />

4. 填写 **入门** 页面的信息。

<Image img={explo_03} size="md" alt="入门" border />

5. 选择 **Clickhouse**。

<Image img={explo_04} size="md" alt="Clickhouse" border />

6. 输入您的 **Clickhouse凭据**。

<Image img={explo_05} size="md" alt="凭据" border />

7. 配置 **安全性**。

<Image img={explo_06} size="md" alt="安全性" border />

8. 在Clickhouse中，**将Explo IP地址加入白名单**。
`
54.211.43.19, 52.55.98.121, 3.214.169.94, 和 54.156.141.148
`

## 3. 创建仪表板 {#3-create-a-dashboard}

1. 导航到左侧导航栏中的 **仪表板** 选项卡。

<Image img={explo_07} size="sm" alt="仪表板" border />

2. 单击右上角的 **创建仪表板** 并为您的仪表板命名。您现在已创建一个仪表板！

<Image img={explo_08} size="sm" alt="创建仪表板" border />

3. 现在您应该会看到一个类似于以下内容的屏幕：

<Image img={explo_09} size="md" alt="Explo Dashboard" border />

## 4. 运行SQL查询 {#4-run-a-sql-query}

1. 从右侧边栏的您的架构标题下获取表名。然后将以下命令放入您的数据集编辑器中：
`
SELECT * FROM YOUR_TABLE_NAME
LIMIT 100
`

<Image img={explo_10} size="md" alt="Explo Dashboard" border />

2. 现在单击运行，并转到预览选项卡以查看您的数据。

<Image img={explo_11} size="md" alt="Explo Dashboard" border />

## 5. 创建图表 {#5-build-a-chart}

1. 从左侧拖动条形图图标到屏幕上。

<Image img={explo_16} size="sm" alt="Explo Dashboard" border />

2. 选择数据集。您现在应该会看到如下屏幕：

<Image img={explo_12} size="sm" alt="Explo Dashboard" border />

3. 在X轴中填写 **county**，在Y轴部分中填写 **Price**，如下所示：

<Image img={explo_13} size="sm" alt="Explo Dashboard" border />

4. 现在，将聚合更改为 **AVG**。

<Image img={explo_14} size="sm" alt="Explo Dashboard" border />

5. 我们现在得到了按价格划分的房屋平均价格！

<Image img={explo_15} size="md" alt="Explo Dashboard" />

## 了解更多 {#learn-more}

通过 <a href="https://docs.explo.co/" target="_blank">访问Explo文档</a>，找到更多关于Explo和如何构建仪表板的信息。
