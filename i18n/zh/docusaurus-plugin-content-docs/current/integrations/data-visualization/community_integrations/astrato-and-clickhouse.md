---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: /integrations/astrato
keywords: ['ClickHouse', 'Power BI', '连接', '集成', 'UI', '数据应用', '数据可视化', '嵌入式分析', 'Astrato']
description: 'Astrato 将真正的自助式商务智能（BI）带入企业和数据驱动型业务，将分析能力交到每一位用户手中，使其能够自行构建仪表盘、报告和数据应用，在无需 IT 帮助的情况下自行解答数据相关问题。Astrato 加速解决方案落地与采用、提升决策效率，并在同一平台上统一分析、嵌入式分析、数据输入和数据应用。Astrato 将行动与分析融为一体，引入实时回写能力，可与 ML 模型交互，并利用 AI 加速分析——得益于 Astrato 对 SQL 下推的支持，帮助你突破传统仪表盘的局限。'
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
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# 将 Astrato 连接到 ClickHouse {#connecting-astrato-to-clickhouse}

<CommunityMaintainedBadge/>

Astrato 使用 Pushdown SQL 直接查询 ClickHouse Cloud 或本地部署的 ClickHouse。这意味着你可以在 ClickHouse 行业领先的性能加持下访问所需的全部数据。

## 所需连接信息 {#connection-data-required}

在设置数据连接时，您需要准备以下信息：

- 数据连接：主机名、端口

- 数据库凭证：用户名、密码

<ConnectionDetails />

## 在 Astrato 中创建到 ClickHouse 的数据连接 {#creating-the-data-connection-to-clickhouse}

- 在侧边栏中选择 **Data**，然后选择 **Data Connection** 选项卡
（或者访问此链接：https://app.astrato.io/data/sources）
​
- 点击屏幕右上角的 **New Data Connection** 按钮。

<Image size="sm" img={astrato_1_dataconnection} alt="Astrato 数据连接" border />

- 选择 **ClickHouse**。

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Astrato ClickHouse 数据连接" border />

- 在连接对话框中填写所有必填字段。

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Astrato 连接到 ClickHouse 所需字段" border />

- 点击 **Test Connection**。如果连接成功，为该数据连接指定一个**名称**，然后点击 **Next**。

- 为该数据连接设置**用户访问权限**，并点击 **Connect**。

<Image size="md" img={astrato_3_user_access} alt="Astrato 连接到 ClickHouse 用户访问设置" border />

-   系统会创建连接，并创建一个数据视图。

:::note
如果创建了重复的数据源，会在数据源名称中添加时间戳。
:::

## 创建语义模型 / 数据视图 {#creating-a-semantic-model--data-view}

在我们的 Data View 编辑器中，您可以看到 ClickHouse 中的所有表（Tables）和模式（Schemas），请选择部分对象开始配置。

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Astrato 连接到 ClickHouse 用户访问" border />

现在您已经选好了数据，接下来定义这个 **data view（数据视图）**。点击网页右上角的 Define 按钮。

在这里，您可以进行数据关联（join），并且 **创建受治理的维度和度量** —— 非常适合在不同团队之间保持业务逻辑的一致性。

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Astrato 连接到 ClickHouse 用户访问" border />

**Astrato 会基于元数据智能推荐关联关系（joins）**，包括利用 ClickHouse 中的键（keys）。我们推荐的关联让您可以轻松上手，直接基于经过良好治理的 ClickHouse 数据开展工作，而无需重新搭建一套体系。我们还会向您展示 **关联质量（join quality）**，这样您就可以在 Astrato 中按需详细审阅所有推荐。

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Astrato 连接到 ClickHouse 用户访问" border />

## 创建仪表板 {#creating-a-dashboard}

只需几个步骤，您就可以在 Astrato 中构建第一个图表。
1. 打开可视化面板
2. 选择一种可视化（先从柱状图开始）
3. 添加维度
4. 添加度量

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Astrato 连接 ClickHouse 用户访问" border />

### 查看支持每个可视化的生成 SQL {#view-generated-sql-supporting-each-visualization}

透明度和准确性是 Astrato 的核心。我们确保每一条自动生成的查询语句都是可见的，让您始终保持完全掌控。所有计算都直接在 ClickHouse 中完成，既充分利用其高速性能，又保持健全的安全性和治理能力。

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Astrato 连接 ClickHouse 用户访问" border />

### 完整仪表板示例 {#example-completed-dashboard}

一个精美完整的仪表板或数据应用已近在咫尺。要查看更多我们构建的内容，请访问我们网站上的演示图库：https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Astrato 连接 ClickHouse 用户访问" border />
