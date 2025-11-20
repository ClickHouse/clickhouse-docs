---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: /integrations/astrato
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Astrato']
description: 'Astrato 通过将分析能力交到每位用户手中，为企业和数据驱动型业务带来真正的自助式商业智能（Self-Service BI），使用户能够构建自己的仪表板、报表和数据应用，在无需 IT 帮助的情况下自行解答数据问题。Astrato 加速产品采用、提升决策效率，并在一个平台上统一分析、嵌入式分析、数据录入和数据应用。Astrato 将行动与分析融为一体，引入实时回写功能、支持与 ML 模型交互，并利用 AI 加速分析——借助 Astrato 对 SQL 下推的支持，让你的能力突破传统仪表板。'
title: '将 Astrato 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import astrato_1_dataconnection from '@site/static/images/integrations/data-visualization/astrato_1_dataconnection.png';
import astrato_2a_clickhouse_connection from '@site/static/images/integrations/data-visualization/astrato_2a_clickhouse_connection.png';
import astrato_2b_clickhouse_connection from '@site/static/images/integrations/data-visualization/astrato_2b_clickhouse_connection.png';
import astrato_3_user_access from '@site/static/images/integrations/data-visualization/astrato_3_user_access.png';
import astrato_4a_clickhouse_data_view from '@site/static/images/integrations/data-visualization/astrato_4a_clickhouse_data_view.png';
import astrato_4b_clickhouse_data_view_joins from '@site/static/images/integrations/data-visualization/astrato_4b_clickhouse_data_view_joins.png';
import astrato_4c_clickhouse_completed_data_view from '@site/static/images/integrations/data-visualization/astrato_4c_clickhouse_completed_data_view.png';
import astrato_5a_clickhouse_build_chart from '@site/static/images/integrations/data-visualization/astrato_5a_clickhouse_build_chart.png';
import astrato_5b_clickhouse_view_sql from '@site/static/images/integrations/data-visualization/astrato_5b_clickhouse_view_sql.png';
import astrato_5c_clickhouse_complete_dashboard from '@site/static/images/integrations/data-visualization/astrato_5c_clickhouse_complete_dashboard.png';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Astrato 连接到 ClickHouse

<CommunityMaintainedBadge/>

Astrato 使用下推 SQL（Pushdown SQL）直接查询 ClickHouse Cloud 或本地部署的 ClickHouse 实例。这意味着你可以在 ClickHouse 行业领先的性能支持下，访问所需的全部数据。



## 所需的连接数据 {#connection-data-required}

设置数据连接时,您需要准备以下信息:

- 数据连接:主机名、端口

- 数据库凭据:用户名、密码

<ConnectionDetails />


## 创建到 ClickHouse 的数据连接 {#creating-the-data-connection-to-clickhouse}

- 在侧边栏中选择 **Data**,然后选择 **Data Connection** 选项卡
  (或直接访问此链接:https://app.astrato.io/data/sources)
  ​
- 点击屏幕右上角的 **New Data Connection** 按钮。

<Image
  size='sm'
  img={astrato_1_dataconnection}
  alt='Astrato 数据连接'
  border
/>

- 选择 **ClickHouse**。

<Image
  size='sm'
  img={astrato_2a_clickhouse_connection}
  alt='Astrato ClickHouse 数据连接'
  border
/>

- 在连接对话框中填写必填字段

<Image
  size='sm'
  img={astrato_2b_clickhouse_connection}
  alt='Astrato 连接到 ClickHouse 的必填字段'
  border
/>

- 点击 **Test Connection**。如果连接成功,为数据连接指定一个**名称**,然后点击 **Next**。

- 设置数据连接的**用户访问权限**,然后点击 **connect**。

<Image
  size='md'
  img={astrato_3_user_access}
  alt='Astrato 连接到 ClickHouse 的用户访问权限'
  border
/>

- 连接创建完成,同时会创建一个数据视图。

:::note
如果创建了重复项,系统会在数据源名称后添加时间戳。
:::


## 创建语义模型/数据视图 {#creating-a-semantic-model--data-view}

在数据视图编辑器中,您可以看到 ClickHouse 中的所有表和架构,选择其中一些即可开始使用。

<Image
  size='lg'
  img={astrato_4a_clickhouse_data_view}
  alt='Astrato 连接到 ClickHouse 用户访问'
  border
/>

选择数据后,接下来定义**数据视图**。点击网页右上角的"定义"按钮。

在这里,您可以关联数据,并**创建受治理的维度和度量** —— 这对于在不同团队之间保持业务逻辑的一致性非常理想。

<Image
  size='lg'
  img={astrato_4b_clickhouse_data_view_joins}
  alt='Astrato 连接到 ClickHouse 用户访问'
  border
/>

**Astrato 会智能推荐关联方式**,利用您的元数据,包括 ClickHouse 中的键。我们推荐的关联方式让您可以轻松上手,基于治理良好的 ClickHouse 数据开展工作,无需重复造轮子。我们还会显示**关联质量**,以便您可以详细查看 Astrato 提供的所有建议。

<Image
  size='lg'
  img={astrato_4c_clickhouse_completed_data_view}
  alt='Astrato 连接到 ClickHouse 用户访问'
  border
/>


## 创建仪表板 {#creating-a-dashboard}

只需几个步骤,您就可以在 Astrato 中构建第一个图表。

1. 打开可视化面板
2. 选择一个可视化类型(我们从柱状图开始)
3. 添加维度
4. 添加度量

<Image
  size='lg'
  img={astrato_5a_clickhouse_build_chart}
  alt='Astrato 连接到 ClickHouse 用户访问'
  border
/>

### 查看支持每个可视化的生成 SQL {#view-generated-sql-supporting-each-visualization}

透明性和准确性是 Astrato 的核心。我们确保每个生成的查询都是可见的,让您保持完全控制。所有计算都直接在 ClickHouse 中进行,充分利用其速度优势,同时保持强大的安全性和治理能力。

<Image
  size='lg'
  img={astrato_5b_clickhouse_view_sql}
  alt='Astrato 连接到 ClickHouse 用户访问'
  border
/>

### 完整仪表板示例 {#example-completed-dashboard}

一个精美完整的仪表板或数据应用程序即将完成。要查看我们构建的更多内容,请访问我们网站上的演示库。https://astrato.io/gallery

<Image
  size='lg'
  img={astrato_5c_clickhouse_complete_dashboard}
  alt='Astrato 连接到 ClickHouse 用户访问'
  border
/>
