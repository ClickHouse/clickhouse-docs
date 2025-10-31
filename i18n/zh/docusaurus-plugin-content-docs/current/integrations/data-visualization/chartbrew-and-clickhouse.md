---
'title': '将 Chartbrew 连接到 ClickHouse'
'sidebar_label': 'Chartbrew'
'sidebar_position': 131
'slug': '/integrations/chartbrew-and-clickhouse'
'keywords':
- 'ClickHouse'
- 'Chartbrew'
- 'connect'
- 'integrate'
- 'visualization'
'description': '将 Chartbrew 连接到 ClickHouse，以创建实时仪表板和客户端报告。'
'doc_type': 'guide'
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
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import Image from '@theme/IdealImage';


# 将 Chartbrew 连接到 ClickHouse

<CommunityMaintainedBadge/>

[Chartbrew](https://chartbrew.com) 是一个数据可视化平台，允许用户创建仪表盘并实时监控数据。它支持多种数据源，包括 ClickHouse，并提供无代码接口用于构建图表和报告。

## 目标 {#goal}

在本指南中，您将把 Chartbrew 连接到 ClickHouse，运行 SQL 查询，并创建可视化。到最后，您的仪表盘可能会看起来像这样：

<Image img={chartbrew_01} size="lg" alt="Chartbrew dashboard" />

:::tip 添加一些数据
如果您没有可用的数据集，可以添加示例之一。本指南使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集。
:::

## 1. 收集连接详情 {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. 将 Chartbrew 连接到 ClickHouse {#2-connect-chartbrew-to-clickhouse}

1. 登录到 [Chartbrew](https://chartbrew.com/login) 并转到 **Connections** 标签。
2. 点击 **Create connection** 并从可用数据库选项中选择 **ClickHouse**。

   <Image img={chartbrew_02} size="lg" alt="Select ClickHouse connection in Chartbrew" />

3. 输入您的 ClickHouse 数据库的连接详情：

   - **Display Name**: 用于在 Chartbrew 中识别连接的名称。
   - **Host**: 您 ClickHouse 服务器的主机名或 IP 地址。
   - **Port**: 对于 HTTPS 连接，通常为 `8443`。
   - **Database Name**: 您要连接的数据库。
   - **Username**: 您的 ClickHouse 用户名。
   - **Password**: 您的 ClickHouse 密码。

   <Image img={chartbrew_03} size="lg" alt="ClickHouse connection settings in Chartbrew" />

4. 点击 **Test connection** 以验证 Chartbrew 是否能够连接到 ClickHouse。
5. 如果测试成功，点击 **Save connection**。Chartbrew 将自动从 ClickHouse 获取模式。

   <Image img={chartbrew_04} size="lg" alt="ClickHouse JSON schema in Chartbrew" />

## 3. 创建数据集并运行 SQL 查询 {#3-create-a-dataset-and-run-a-sql-query}

  1. 点击 **Create dataset** 按钮或转到 **Datasets** 标签以创建一个。
  2. 选择您之前创建的 ClickHouse 连接。

  <Image img={chartbrew_05} size="lg" alt="Select ClickHouse connection for dataset" />

  编写 SQL 查询以检索您想要可视化的数据。例如，这个查询计算了 `uk_price_paid` 数据集中每年的平均支付价格：

```sql
SELECT toYear(date) AS year, avg(price) AS avg_price
FROM uk_price_paid
GROUP BY year
ORDER BY year;
```

  <Image img={chartbrew_07} size="lg" alt="ClickHouse SQL query in Chartbrew" />

  点击 **Run query** 以获取数据。

  如果您不确定如何编写查询，可以使用 **Chartbrew's AI assistant** 来根据您的数据库模式生成 SQL 查询。

<Image img={chartbrew_06} size="lg" alt="ClickHouse AI SQL assistant in Chartbrew" />

一旦数据被提取，点击 **Configure dataset** 来设置可视化参数。

## 4. 创建可视化 {#4-create-a-visualization}

  1. 为您的可视化定义一个度量（数值）和一个维度（类别）。
  2. 预览数据集以确保查询结果结构正确。
  3. 选择一个图表类型（例如线性图、柱状图、饼图），并将其添加到您的仪表盘中。
  4. 点击 **Complete dataset** 以完成设置。

  <Image img={chartbrew_08} size="lg" alt="Chartbrew dashboard with ClickHouse data" />

  您可以创建任意数量的数据集，以可视化数据的不同方面。使用这些数据集，您可以创建多个仪表盘，以跟踪不同的度量。

  <Image img={chartbrew_01} size="lg" alt="Chartbrew dashboard with ClickHouse data" />

## 5. 自动化数据更新 {#5-automate-data-updates}

  为了保持仪表盘的最新状态，您可以安排自动数据更新：

  1. 点击数据集刷新按钮旁的日历图标。
  2. 配置更新间隔（例如每小时、每天）。
  3. 保存设置以启用自动刷新。

  <Image img={chartbrew_09} size="lg" alt="Chartbrew dataset refresh settings" />

## 了解更多 {#learn-more}

欲了解更多详细信息，请查看有关 [Chartbrew 和 ClickHouse](https://chartbrew.com/blog/visualizing-clickhouse-data-with-chartbrew-a-step-by-step-guide/) 的博客文章。
