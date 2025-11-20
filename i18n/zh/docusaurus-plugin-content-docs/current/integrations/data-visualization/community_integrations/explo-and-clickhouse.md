---
sidebar_label: 'Explo'
sidebar_position: 131
slug: /integrations/explo
keywords: ['clickhouse', 'Explo', 'connect', 'integrate', 'ui']
description: 'Explo 是一个易于使用的开源 UI 工具,用于对数据进行查询分析。'
title: '将 Explo 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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


# 将 Explo 连接到 ClickHouse

<CommunityMaintainedBadge/>

面向客户的分析平台，适用于任何应用场景。专为精美可视化而设计，为简单易用而打造。



## 目标 {#goal}

在本指南中,您将把 ClickHouse 中的数据连接到 Explo 并可视化结果。图表效果如下:

<Image img={explo_15} size='md' alt='Explo 仪表板' />

<p />

:::tip 添加数据
如果您没有可用的数据集,可以添加示例数据集。本指南使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集,您可以选择使用该数据集。同一文档类别中还有其他几个数据集可供参考。
:::


## 1. 收集连接详细信息 {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. 将 Explo 连接到 ClickHouse {#2--connect-explo-to-clickhouse}

1. 注册 Explo 账户。

2. 点击左侧边栏中的 Explo **data** 选项卡。

<Image img={explo_01} size='sm' alt='数据选项卡' border />

3. 点击右上角的 **Connect Data Source**。

<Image img={explo_02} size='sm' alt='连接数据源' border />

4. 填写 **Getting Started** 页面上的信息。

<Image img={explo_03} size='md' alt='入门指南' border />

5. 选择 **Clickhouse**。

<Image img={explo_04} size='md' alt='Clickhouse' border />

6. 输入您的 **Clickhouse Credentials**。

<Image img={explo_05} size='md' alt='凭据' border />

7. 配置 **Security**。

<Image img={explo_06} size='md' alt='安全设置' border />

8. 在 ClickHouse 中,**将 Explo IP 地址加入白名单**。
   `54.211.43.19, 52.55.98.121, 3.214.169.94, 和 54.156.141.148`


## 3. 创建仪表板 {#3-create-a-dashboard}

1. 在左侧导航栏中找到 **Dashboard** 选项卡。

<Image img={explo_07} size='sm' alt='仪表板' border />

2. 点击右上角的 **Create Dashboard** 并为仪表板命名。现在您已成功创建了一个仪表板!

<Image img={explo_08} size='sm' alt='创建仪表板' border />

3. 此时您应该会看到类似下图的界面:

<Image img={explo_09} size='md' alt='Explo 仪表板' border />


## 4. 运行 SQL 查询 {#4-run-a-sql-query}

1. 从右侧边栏中您的模式标题下获取表名，然后在数据集编辑器中输入以下命令：
   `SELECT * FROM YOUR_TABLE_NAME
LIMIT 100`

<Image img={explo_10} size='md' alt='Explo 仪表板' border />

2. 点击运行按钮，然后转到预览选项卡查看您的数据。

<Image img={explo_11} size='md' alt='Explo 仪表板' border />


## 5. 构建图表 {#5-build-a-chart}

1. 从左侧将柱状图图标拖到屏幕上。

<Image img={explo_16} size='sm' alt='Explo 仪表板' border />

2. 选择数据集。您应该会看到如下界面:

<Image img={explo_12} size='sm' alt='Explo 仪表板' border />

3. 在 X 轴填入 **county**,在 Y 轴部分填入 **Price**,如下所示:

<Image img={explo_13} size='sm' alt='Explo 仪表板' border />

4. 现在,将聚合方式更改为 **AVG**。

<Image img={explo_14} size='sm' alt='Explo 仪表板' border />

5. 现在我们得到了按县划分的房屋平均价格!

<Image img={explo_15} size='md' alt='Explo 仪表板' />


## 了解更多 {#learn-more}

如需了解更多关于 Explo 以及如何构建仪表板的信息,请<a href="https://docs.explo.co/" target="_blank">访问 Explo 文档</a>。
