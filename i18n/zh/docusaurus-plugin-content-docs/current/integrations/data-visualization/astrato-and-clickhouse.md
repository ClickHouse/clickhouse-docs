---
'sidebar_label': 'Astrato'
'sidebar_position': 131
'slug': '/integrations/astrato'
'keywords':
- 'clickhouse'
- 'Power BI'
- 'connect'
- 'integrate'
- 'ui'
- 'data apps'
- 'data viz'
- 'embedded analytics'
- 'Astrato'
'description': 'Astrato 为企业和数据业务带来了真正的自服务 BI，将分析放在每个用户的手中，使他们能够构建自己的仪表板、报告和数据应用程序，从而在无需
  IT 帮助的情况下回答数据问题。Astrato 加速了采用，提升了决策速度，并在一个平台上统一了分析、嵌入式分析、数据输入和数据应用。Astrato 将行动与分析结合在一起，引入实时写回，与
  ML 模型互动，利用 AI 加速您的分析——超越仪表板，得益于 Astrato 中的推送 SQL 支持。'
'title': '连接 Astrato 与 ClickHouse'
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
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Astrato 连接到 ClickHouse

<CommunityMaintainedBadge/>

Astrato 使用下推 SQL 直接查询 ClickHouse Cloud 或本地部署。这意味着您可以访问所需的所有数据，利用 ClickHouse 行业领先的性能。

## 连接所需的数据 {#connection-data-required}

在设置数据连接时，您需要知道：

- 数据连接：主机名、端口

- 数据库凭证：用户名、密码

<ConnectionDetails />

## 创建到 ClickHouse 的数据连接 {#creating-the-data-connection-to-clickhouse}

- 在侧边栏中选择 **数据**，然后选择 **数据连接** 选项卡
（或者，导航到此链接： https://app.astrato.io/data/sources）
​
- 点击屏幕右上角的 **新建数据连接** 按钮。

<Image size="sm" img={astrato_1_dataconnection} alt="Astrato 数据连接" border />

- 选择 **ClickHouse**。

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Astrato ClickHouse 数据连接" border />

- 在连接对话框中填写必填字段

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Astrato 连接到 ClickHouse 必填字段" border />

- 点击 **测试连接**。如果连接成功，给数据连接起一个 **名称**，然后点击 **下一步**。

- 设置数据连接的 **用户访问** 权限，然后点击 **连接**。

<Image size="md" img={astrato_3_user_access} alt="Astrato 连接到 ClickHouse 用户访问" border />

- 连接已创建，并生成了数据视图。

:::note
如果创建了重复项，数据源名称将添加时间戳。
:::

## 创建语义模型 / 数据视图 {#creating-a-semantic-model--data-view}

在我们的数据视图编辑器中，您将看到 ClickHouse 中的所有表和模式，选择一些开始。

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Astrato 连接到 ClickHouse 用户访问" border />

现在您已选择数据，前往定义 **数据视图**。点击网页右上角的定义按钮。

在这里，您可以连接数据，同时 **创建受管理的维度和度量** - 有助于不同团队之间业务逻辑的一致性。

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Astrato 连接到 ClickHouse 用户访问" border />

**Astrato 智能地建议连接**，利用您的元数据，包括使用 ClickHouse 中的键。我们建议的连接让您能够轻松入手，从您良好管理的 ClickHouse 数据开始，而无需重新发明轮子。我们还向您展示 **连接质量**，让您可以选择详细审查 Astrato 的所有建议。

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Astrato 连接到 ClickHouse 用户访问" border />

## 创建仪表板 {#creating-a-dashboard}

只需几个步骤，您就可以在 Astrato 中构建第一个图表。
1. 打开可视化面板
2. 选择一种可视化（让我们从柱状图开始）
3. 添加维度
4. 添加度量

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Astrato 连接到 ClickHouse 用户访问" border />


### 查看支持每个可视化的生成 SQL {#view-generated-sql-supporting-each-visualization}

透明性和准确性是 Astrato 的核心。我们确保生成的每个查询都是可见的，让您保持完全控制。所有计算直接发生在 ClickHouse 中，利用其速度，同时保持强大的安全性和治理。

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Astrato 连接到 ClickHouse 用户访问" border />


### 完成仪表板示例 {#example-completed-dashboard}

美丽的完整仪表板或数据应用程序即将实现。要查看我们构建的更多内容，请前往我们网站上的演示画廊。 https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Astrato 连接到 ClickHouse 用户访问" border />
