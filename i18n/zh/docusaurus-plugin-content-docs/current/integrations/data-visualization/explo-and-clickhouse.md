---
sidebar_label: 'Explo'
sidebar_position: 131
slug: /integrations/explo
keywords: ['clickhouse', 'Explo', 'connect', 'integrate', 'ui']
description: 'Explo 是一个易于使用的开源 UI 工具，用于对您的数据进行提问。'
---
```

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


# 连接 Explo 与 ClickHouse

面向客户的分析，适用于任何平台。旨在实现优美可视化。设计简洁。

## 目标 {#goal}

在本指南中，您将连接您的 ClickHouse 数据到 Explo 并可视化结果。图表将如下所示：
<img src={explo_15} class="image" alt="Explo Dashboard" />

<p/>

:::tip 添加一些数据
如果您没有要使用的数据集，可以添加一个示例。本指南使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集，因此您可以选择该数据集。在同一文档类别中，还有其他几个可供查看。
:::

## 1. 收集您的连接详情 {#1-gather-your-connection-details}
<ConnectionDetails />


## 2. 连接 Explo 与 ClickHouse {#2--connect-explo-to-clickhouse}

1. 注册一个 Explo 账户。

2. 点击左侧边栏的 Explo **数据** 选项卡。


<img src={explo_01} class="image" alt="数据选项卡" />

3. 在右上角点击 **连接数据源**。


<img src={explo_02} class="image" alt="连接数据源" />

4. 在 **开始使用** 页面上填写信息。


<img src={explo_03} class="image" alt="开始使用" />

5. 选择 **Clickhouse**。


<img src={explo_04} class="image" alt="Clickhouse" />


6. 输入您的 **Clickhouse 凭证**。


<img src={explo_05} class="image" alt="凭证" />


7. 配置 **安全性**。


<img src={explo_06} class="image" alt="安全" />

8. 在 Clickhouse 中，**白名单 Explo 的 IP**。
`
54.211.43.19, 52.55.98.121, 3.214.169.94, 和 54.156.141.148
`

## 3. 创建仪表板 {#3-create-a-dashboard}

1. 导航至左侧导航栏的 **仪表板** 选项卡。


<img src={explo_07} class="image" alt="仪表板" />


2. 在右上角点击 **创建仪表板** 并为您的仪表板命名。您现在已经创建了一个仪表板！


<img src={explo_08} class="image" alt="创建仪表板" />


3. 现在您应该看到一个类似于以下的屏幕：


<img src={explo_09} class="image" alt="Explo 仪表板" />


## 4. 运行 SQL 查询 {#4-run-a-sql-query}

1. 从右侧边栏获取您的表名，位于您的模式标题下。然后将以下命令放入数据集编辑器中：
`
SELECT * FROM YOUR_TABLE_NAME
LIMIT 100
`


<img src={explo_10} class="image" alt="Explo 仪表板" />


2. 现在点击运行并转到预览选项卡以查看您的数据。


<img src={explo_11} class="image" alt="Explo 仪表板" />


## 5. 创建图表 {#5-build-a-chart}

1. 从左侧，将柱状图图标拖动到屏幕上。


<img src={explo_16} class="image" alt="Explo 仪表板" />


2. 选择数据集。您现在应该看到一个类似于以下的屏幕：


<img src={explo_12} class="image" alt="Explo 仪表板" />


3. 在 X 轴中填写 **县**，在 Y 轴部分填写 **价格**，如下所示：


<img src={explo_13} class="image" alt="Explo 仪表板" />


4. 现在，将聚合更改为 **AVG**。


<img src={explo_14} class="image" alt="Explo 仪表板" />


5. 我们现在得到了按价格划分的房屋平均价格！


<img src={explo_15} class="image" alt="Explo 仪表板" />

## 了解更多 {#learn-more}

通过 <a href="https://docs.explo.co/" target="_blank">访问 Explo 文档</a> 查找有关 Explo 和如何构建仪表板的更多信息。
