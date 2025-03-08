---
sidebar_label: Astrato
sidebar_position: 131
slug: /integrations/astrato
keywords: [ 'clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Astrato']
description: 'Astrato 为企业和数据业务带来真正的自服务 BI，让每个用户都能掌握分析能力，能够构建自己的仪表盘、报告和数据应用，能够在没有 IT 帮助的情况下回答数据问题。Astrato 加速了采纳速度，提升了决策效率，并将分析、嵌入式分析、数据输入和数据应用统一在一个平台上。Astrato 将行动和分析融合在一起，引入实时写回，与机器学习模型互动，通过 AI 加速分析，超越仪表盘，得益于 Astrato 中的推送 SQL 支持。'
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


# 连接 Astrato 到 ClickHouse

Astrato 使用推送 SQL 直接查询 ClickHouse 云或本地部署。这意味着您可以访问所需的所有数据，由 ClickHouse 领先业绩提供支持。

## 连接数据要求 {#connection-data-required}

在设置数据连接时，您需要知道：

- 数据连接：主机名，端口

- 数据库凭证：用户名，密码

<ConnectionDetails />

## 创建 ClickHouse 的数据连接 {#creating-the-data-connection-to-clickhouse}

- 在侧边栏中选择 **数据**，然后选择 **数据连接** 标签（或导航到此链接: https://app.astrato.io/data/sources）

- 单击屏幕右上角的 **新建数据连接** 按钮。

<img  src={astrato_1_dataconnection}  class="image"  alt="Astrato 数据连接"  style={{width:'50%',  'background-color':  'transparent'}}/>

<br/>

- 选择 **ClickHouse**。
<img  src={astrato_2a_clickhouse_connection}  class="image"  alt="Astrato ClickHouse 数据连接"  style={{width:'50%',  'background-color':  'transparent'}}/>

- 在连接对话框中填写所需字段

<img  src={astrato_2b_clickhouse_connection}  class="image"  alt="Astrato 连接到 ClickHouse 所需字段"  style={{width:'50%',  'background-color':  'transparent'}}/>

- 单击 **测试连接**。如果连接成功，为数据连接命名然后单击 **下一步**。

- 设置数据连接的 **用户访问** 并单击 **连接**。
  
<img  src={astrato_3_user_access}  class="image"  alt="Astrato 连接到 ClickHouse 用户访问"  style={{width:'50%',  'background-color':  'transparent'}}/>

- 连接被创建，同时也创建了数据视图。

:::note
如果创建了重复项，则在数据源名称中会添加时间戳。
:::

## 创建语义模型 / 数据视图 {#creating-a-semantic-model--data-view}

在我们的数据视图编辑器中，您将看到 ClickHouse 中的所有表和模式，选择一些开始。

<img  src={astrato_4a_clickhouse_data_view}  class="image"  alt="Astrato 连接到 ClickHouse 用户访问"  style={{width:'75%',  'background-color':  'transparent'}}/>
<br/>

现在您已经选择了数据，前往定义 **数据视图**。点击网页右上角的定义。

在这里，您可以连接数据，并 **创建受管维度和度量** - 非常适合推动不同团队间的业务逻辑一致性。

<img  src={astrato_4b_clickhouse_data_view_joins}  class="image"  alt="Astrato 连接到 ClickHouse 用户访问"  style={{width:'75%',  'background-color':  'transparent'}}/>
<br/>

**Astrato 智能建议连接**，使用您的元数据，包括利用 ClickHouse 中的键。我们的建议连接使您能够从受管的 ClickHouse 数据入手，轻松上手，而不必重新发明轮子。我们还会向您展示 **连接质量**，以便您可以详细审查 Astrato 的所有建议。
<br/>
<img  src={astrato_4c_clickhouse_completed_data_view}  class="image"  alt="Astrato 连接到 ClickHouse 用户访问"  style={{width:'75%',  'background-color':  'transparent'}}/><br/>

## 创建仪表盘 {#creating-a-dashboard}

只需几步，您即可在 Astrato 中构建您的第一个图表。
1. 打开可视化面板
2. 选择一种可视化（让我们从柱状图开始）
3. 添加维度
4. 添加度量

<img  src={astrato_5a_clickhouse_build_chart}  class="image"  alt="Astrato 连接到 ClickHouse 用户访问"  style={{width:'75%',  'background-color':  'transparent'}}/><br/>


### 查看支持每种可视化的生成 SQL {#view-generated-sql-supporting-each-visualization}

透明性和准确性是 Astrato 的核心。我们确保每个生成的查询都是可见的，让您保持完全控制。所有计算直接在 ClickHouse 中进行，利用其速度，同时保持强大的安全性和治理。

<img  src={astrato_5b_clickhouse_view_sql}  class="image"  alt="Astrato 连接到 ClickHouse 用户访问"  style={{width:'75%',  'background-color':  'transparent'}}/><br/>


### 完成仪表盘示例 {#example-completed-dashboard}

美丽的完整仪表盘或数据应用已经不远了。要查看更多我们构建的内容，请前往我们网站的演示画廊。 https://astrato.io/gallery

<img  src={astrato_5c_clickhouse_complete_dashboard}  class="image"  alt="Astrato 连接到 ClickHouse 用户访问"  style={{width:'75%',  'background-color':  'transparent'}}/>
