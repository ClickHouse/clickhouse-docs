---
title: '将 Chartbrew 连接到 ClickHouse'
sidebar_label: 'Chartbrew'
sidebar_position: 131
slug: /integrations/chartbrew-and-clickhouse
keywords: ['ClickHouse', 'Chartbrew', '连接', '集成', '可视化']
description: '将 Chartbrew 连接到 ClickHouse，以创建实时看板和客户报告。'
doc_type: 'guide'
---

import chartbrew_01 from '@site/static/images/integrations/data-visualization/chartbrew_01.png';
import chartbrew_02 from '@site/static/images/integrations/data-visualization/chartbrew_02.png';
import chartbrew_03 from '@site/static/images/integrations/data-visualization/chartbrew_03.png';
import chartbrew_04 from '@site/static/images/integrations/data-visualization/chartbrew_04.png';
import chartbrew_05 from '@site/static/images/integrations/data-visualization/chartbrew_05.png';
import chartbrew_06 from '@site/static/images/integrations/data-visualization/chartbrew_06.png';
import chartbrew_07 from '@site/static/images/integrations/data-visualization/chartbrew_07.png';
import chartbrew_08 from '@site/static/images/integrations/data-visualization/chartbrew_08.png';
import chartbrew_09 from '@site/static/images/integrations/data-visualization/chartbrew_09.png';

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import Image from '@theme/IdealImage';


# 将 Chartbrew 连接到 ClickHouse

<CommunityMaintainedBadge/>

[Chartbrew](https://chartbrew.com) 是一个数据可视化平台，允许用户创建仪表盘并实时监控数据。它支持包括 ClickHouse 在内的多种数据源，并提供无代码界面用于构建图表和报表。



## 目标 {#goal}

在本指南中，您将把 Chartbrew 连接到 ClickHouse，运行一条 SQL 查询，并创建一个可视化图表。完成后，您的仪表盘可能看起来类似于这样：

<Image img={chartbrew_01} size="lg" alt="Chartbrew 仪表盘" />

:::tip 添加一些数据
如果您还没有可用的数据集，可以添加一个示例数据集。本指南使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集。
:::



## 1. 收集连接信息 {#1-gather-your-connection-details}

<ConnectionDetails />



## 2. 将 Chartbrew 连接到 ClickHouse {#2-connect-chartbrew-to-clickhouse}

1. 登录 [Chartbrew](https://chartbrew.com/login)，然后转到 **Connections** 选项卡。
2. 点击 **Create connection**，并从可用的数据库选项中选择 **ClickHouse**。

   <Image img={chartbrew_02} size="lg" alt="在 Chartbrew 中选择 ClickHouse 连接" />

3. 输入 ClickHouse 数据库的连接信息：

   - **Display Name**: 用于在 Chartbrew 中标识该连接的名称。
   - **Host**: ClickHouse 服务器的主机名或 IP 地址。
   - **Port**: 通常为 `8443`（HTTPS 连接）。
   - **Database Name**: 要连接的数据库名称。
   - **Username**: ClickHouse 用户名。
   - **Password**: ClickHouse 密码。

   <Image img={chartbrew_03} size="lg" alt="Chartbrew 中的 ClickHouse 连接设置" />

4. 点击 **Test connection** 以验证 Chartbrew 是否可以连接到 ClickHouse。
5. 如果测试成功，点击 **Save connection**。Chartbrew 将自动从 ClickHouse 中检索 schema 信息。

   <Image img={chartbrew_04} size="lg" alt="Chartbrew 中的 ClickHouse JSON schema" />



## 3. 创建数据集并运行 SQL 查询

1. 点击 **Create dataset** 按钮，或导航到 **Datasets** 选项卡来创建一个数据集。
2. 选择你之前创建的 ClickHouse 连接。

<Image img={chartbrew_05} size="lg" alt="为数据集选择 ClickHouse 连接" />

编写一条 SQL 查询语句来检索你想要可视化的数据。例如，下面的查询会基于 `uk_price_paid` 数据集计算每年支付的平均价格：

```sql
SELECT toYear(date) AS year, avg(price) AS avg_price
FROM uk_price_paid
GROUP BY year
ORDER BY year;
```

<Image img={chartbrew_07} size="lg" alt="在 Chartbrew 中执行 ClickHouse SQL 查询" />

点击 **Run query** 以获取数据。

如果您不确定如何编写查询，可以使用 **Chartbrew 的 AI 助手**，根据您的数据库架构自动生成 SQL 查询。

<Image img={chartbrew_06} size="lg" alt="Chartbrew 中的 ClickHouse AI SQL 助手" />

成功获取数据后，点击 **Configure dataset** 来设置可视化参数。


## 4. 创建可视化 {#4-create-a-visualization}
   
  1. 为可视化定义一个度量（数值）和一个维度（类别值）。
  2. 预览数据集，确保查询结果的结构正确。
  3. 选择图表类型（例如折线图、柱状图、饼图），并将其添加到仪表盘中。
  4. 点击 **Complete dataset** 完成配置。

  <Image img={chartbrew_08} size="lg" alt="包含 ClickHouse 数据的 Chartbrew 仪表盘" />

  你可以创建任意多的数据集，用于从不同角度可视化你的数据。基于这些数据集，你可以创建多个仪表盘，以跟踪不同的指标。

  <Image img={chartbrew_01} size="lg" alt="包含 ClickHouse 数据的 Chartbrew 仪表盘" />



## 5. 自动化数据更新 {#5-automate-data-updates}
   
  为了让仪表板始终保持最新状态，你可以设置自动数据更新：

  1. 点击数据集刷新按钮旁边的日历图标。
  2. 配置更新间隔（例如，每小时、每天）。
  3. 保存设置以启用自动刷新。

  <Image img={chartbrew_09} size="lg" alt="Chartbrew 数据集刷新设置" />



## 了解更多 {#learn-more}

如需了解更多详细信息，请参阅这篇关于 [Chartbrew 和 ClickHouse](https://chartbrew.com/blog/visualizing-clickhouse-data-with-chartbrew-a-step-by-step-guide/) 的博客文章。
