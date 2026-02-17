---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: /integrations/astrato
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Astrato']
description: 'Astrato 将真正的自助式 BI 带给企业和数据驱动型业务，将分析能力交到每位用户手中，使其能够自行构建仪表板、报告和数据应用，在无需 IT 帮助的情况下便可基于数据作出判断。Astrato 加速解决方案落地与采用、提升决策效率，并在一个平台中统一分析、嵌入式分析、数据输入和数据应用。Astrato 将行动与分析融为一体，引入实时写回、与 ML 模型交互，借助 AI 加速分析——在 Astrato 中凭借对下推 SQL 的支持，将分析能力扩展到传统仪表板之外。'
title: '将 Astrato 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
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
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Astrato 连接到 ClickHouse \{#connecting-astrato-to-clickhouse\}

<CommunityMaintainedBadge/>

Astrato 使用 Pushdown SQL 直接查询 ClickHouse Cloud 或本地部署的 ClickHouse。这样，您就可以借助 ClickHouse 行业领先的性能，访问所需的全部数据。

## 所需连接数据 \{#connection-data-required\}

在设置数据连接时，需要以下信息：

- 数据连接：主机名、端口

- 数据库凭证：用户名、密码

<ConnectionDetails />

## 创建与 ClickHouse 的数据连接 \{#creating-the-data-connection-to-clickhouse\}

- 在侧边栏中选择 **Data**，然后选择 **Data Connection** 选项卡  
（或者访问此链接：https://app.astrato.io/data/sources）
​
- 点击屏幕右上角的 **New Data Connection** 按钮。

<Image size="sm" img={astrato_1_dataconnection} alt="Astrato Data Connection" border />

- 选择 **ClickHouse**。

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Astrato ClickHouse Data Connection" border />

- 在连接对话框中填写必填字段。

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Astrato connect to ClickHouse required fields" border />

- 点击 **Test Connection**。如果连接成功，为该数据连接指定一个名称（填写 **name** 字段），然后点击 **Next.**

- 为该数据连接设置 **user access**（用户访问权限），然后点击 **connect.**

<Image size="md" img={astrato_3_user_access} alt="Astrato connect to ClickHouse User Access" border />

-   连接创建完成，并自动创建一个数据视图（data view）。

:::note
如果创建了重复项，会在数据源名称中追加时间戳。
:::

## 创建语义模型 / 数据视图 \{#creating-a-semantic-model--data-view\}

在我们的 Data View 编辑器中，您可以看到 ClickHouse 中的所有表和 Schema，选择一些作为起点。

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Astrato 连接到 ClickHouse 用户访问" border />

现在您已经选好了数据，接下来定义 **数据视图（data view）**。点击网页右上角的 Define。

在这里，您可以进行数据关联（join），并且 **创建受治理的维度和度量指标**——非常适合在各个团队之间实现业务逻辑的一致性。

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Astrato 连接到 ClickHouse 用户访问" border />

**Astrato 会基于您的元数据智能地推荐关联（join）**，包括利用 ClickHouse 中的键。我们推荐的关联可以帮助您轻松上手，直接使用治理良好的 ClickHouse 数据，而无需从头开始构建。Astrato 还会向您展示 **关联质量（join quality）**，这样您就可以选择在 Astrato 中详细审阅所有推荐。

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Astrato 连接到 ClickHouse 用户访问" border />

## 创建仪表板 \{#creating-a-dashboard\}

通过以下几个步骤，即可在 Astrato 中创建你的第一个图表。

1. 打开可视化面板
2. 选择一种可视化图表（先从柱状图 Column Bar Chart 开始）
3. 添加维度
4. 添加度量值

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Astrato 连接到 ClickHouse 用户访问" border />

### 查看支持每个可视化的已生成 SQL \{#view-generated-sql-supporting-each-visualization\}

透明性和准确性是 Astrato 的核心理念。我们确保每个生成的查询都是可见的，让你对整个过程保持完全掌控。所有计算都直接在 ClickHouse 中完成，既充分利用其高速性能，又保持强大的安全性和治理机制。

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Astrato 连接 ClickHouse 用户访问" border />

### 完成的示例 dashboard \{#example-completed-dashboard\}

你距离拥有一个精美、完整的 dashboard 或数据应用已经不远了。要查看更多我们已经构建的内容，请访问我们网站上的演示图库：https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Astrato 连接 ClickHouse 用户访问界面" border />