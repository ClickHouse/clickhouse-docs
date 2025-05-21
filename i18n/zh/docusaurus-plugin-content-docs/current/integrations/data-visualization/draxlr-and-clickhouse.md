---
'sidebar_label': 'Draxlr'
'sidebar_position': 131
'slug': '/integrations/draxlr'
'keywords':
- 'clickhouse'
- 'Draxlr'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Draxlr is a Business intelligence tool with data visualization and
  analytics.'
'title': 'Connecting Draxlr to ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import draxlr_01 from '@site/static/images/integrations/data-visualization/draxlr_01.png';
import draxlr_02 from '@site/static/images/integrations/data-visualization/draxlr_02.png';
import draxlr_03 from '@site/static/images/integrations/data-visualization/draxlr_03.png';
import draxlr_04 from '@site/static/images/integrations/data-visualization/draxlr_04.png';
import draxlr_05 from '@site/static/images/integrations/data-visualization/draxlr_05.png';
import draxlr_06 from '@site/static/images/integrations/data-visualization/draxlr_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Draxlr 连接到 ClickHouse

<CommunityMaintainedBadge/>

Draxlr 提供了一个直观的界面，用于连接您的 ClickHouse 数据库，使您的团队能够在几分钟内探索、可视化和发布见解。本指南将指导您完成建立成功连接的步骤。


## 1. 获取您的 ClickHouse 凭证 {#1-get-your-clickhouse-credentials}
<ConnectionDetails />

## 2. 将 Draxlr 连接到 ClickHouse {#2--connect-draxlr-to-clickhouse}

1. 点击导航栏上的 **连接数据库** 按钮。

2. 从可用数据库列表中选择 **ClickHouse**，然后点击下一步。

3. 选择其中一个托管服务并点击下一步。

4. 在 **连接名称** 字段中使用任意名称。

5. 在表单中添加连接详情。

  <Image size="md" img={draxlr_01} alt="Draxlr 连接表单，显示 ClickHouse 数据库配置选项" border />

6. 点击 **下一步** 按钮，等待连接建立。如果连接成功，您将看到表页面。

## 4. 探索您的数据 {#4-explore-your-data}

1. 点击列表中的一个表。

2. 这将带您进入探索页面，以查看该表中的数据。

3. 您可以开始添加过滤器、进行连接并为数据添加排序。

  <Image size="md" img={draxlr_02} alt="Draxlr 数据探索界面，显示过滤器和排序选项" border />

4. 您还可以使用 **图表** 按钮并选择图表类型来可视化数据。

  <Image size="md" img={draxlr_05} alt="Draxlr 对 ClickHouse 数据的图表可视化选项" border />


## 4. 使用 SQL 查询 {#4-using-sql-queries}

1. 点击导航栏上的探索按钮。

2. 点击 **原始查询** 按钮，并在文本区域中输入您的查询。

  <Image size="md" img={draxlr_03} alt="Draxlr SQL 查询界面，适用于 ClickHouse" border />

3. 点击 **执行查询** 按钮以查看结果。


## 4. 保存您的查询 {#4-saving-you-query}

1. 执行查询后，点击 **保存查询** 按钮。

  <Image size="md" img={draxlr_04} alt="Draxlr 保存查询对话框，带有仪表板选项" border />

2. 您可以在 **查询名称** 文本框中为查询命名，并选择一个文件夹进行分类。

3. 您还可以使用 **添加到仪表板** 选项将结果添加到仪表板。

4. 点击 **保存** 按钮以保存查询。


## 5. 构建仪表板 {#5-building-dashboards}

1. 点击导航栏上的 **仪表板** 按钮。

  <Image size="md" img={draxlr_06} alt="Draxlr 仪表板管理界面" border />

2. 您可以通过点击左侧边栏上的 **添加 +** 按钮来添加新的仪表板。

3. 要添加一个新小部件，请点击右上角的 **添加** 按钮。

4. 您可以从已保存查询列表中选择一个查询，选择可视化类型，然后点击 **添加仪表板项目** 按钮。

## 了解更多 {#learn-more}
要了解更多关于 Draxlr 的信息，您可以访问 [Draxlr 文档](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928) 网站。
