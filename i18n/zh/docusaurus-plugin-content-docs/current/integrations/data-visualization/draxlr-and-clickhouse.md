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
'description': 'Draxlr 是一个商业智能工具，提供数据可视化和分析功能。'
'title': '连接 Draxlr 到 ClickHouse'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import draxlr_01 from '@site/static/images/integrations/data-visualization/draxlr_01.png';
import draxlr_02 from '@site/static/images/integrations/data-visualization/draxlr_02.png';
import draxlr_03 from '@site/static/images/integrations/data-visualization/draxlr_03.png';
import draxlr_04 from '@site/static/images/integrations/data-visualization/draxlr_04.png';
import draxlr_05 from '@site/static/images/integrations/data-visualization/draxlr_05.png';
import draxlr_06 from '@site/static/images/integrations/data-visualization/draxlr_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 Draxlr 到 ClickHouse

<CommunityMaintainedBadge/>

Draxlr 提供了一个直观的界面，用于连接到您的 ClickHouse 数据库，使您的团队能够在几分钟内探索、可视化和发布洞察。本文将指导您完成建立成功连接的步骤。

## 1. 获取您的 ClickHouse 凭证 {#1-get-your-clickhouse-credentials}
<ConnectionDetails />

## 2. 将 Draxlr 连接到 ClickHouse {#2--connect-draxlr-to-clickhouse}

1. 点击导航栏上的 **Connect a Database** 按钮。

2. 从可用数据库列表中选择 **ClickHouse** 并点击下一步。

3. 选择其中一个托管服务并点击下一步。

4. 在 **Connection Name** 字段中使用任何名称。

5. 在表单中添加连接详细信息。

  <Image size="md" img={draxlr_01} alt="Draxlr connection form showing ClickHouse database configuration options" border />

6. 点击 **Next** 按钮，等待连接建立。如果连接成功，您将看到表格页面。

## 4. 探索您的数据 {#4-explore-your-data}

1. 点击列表中的一个表。

2. 这将带您到探索页面，以查看表中的数据。

3. 您可以开始添加过滤器、进行连接并对数据进行排序。

  <Image size="md" img={draxlr_02} alt="Draxlr data exploration interface showing filters and sorting options" border />

4. 您还可以使用 **Graph** 按钮并选择图表类型来可视化数据。

  <Image size="md" img={draxlr_05} alt="Draxlr graph visualization options for ClickHouse data" border />

## 4. 使用 SQL 查询 {#4-using-sql-queries}

1. 点击导航栏上的 Explore 按钮。

2. 点击 **Raw Query** 按钮并在文本区域中输入您的查询。

  <Image size="md" img={draxlr_03} alt="Draxlr SQL query interface for ClickHouse" border />

3. 点击 **Execute Query** 按钮以查看结果。

## 4. 保存您的查询 {#4-saving-you-query}

1. 执行查询后，点击 **Save Query** 按钮。

  <Image size="md" img={draxlr_04} alt="Draxlr save query dialog with dashboard options" border />

2. 您可以在 **Query Name** 文本框中为查询命名，并选择一个文件夹进行分类。

3. 还可以使用 **Add to dashboard** 选项将结果添加到仪表板。

4. 点击 **Save** 按钮以保存查询。

## 5. 创建仪表板 {#5-building-dashboards}

1. 点击导航栏上的 **Dashboards** 按钮。

  <Image size="md" img={draxlr_06} alt="Draxlr dashboard management interface" border />

2. 您可以通过点击左侧边栏上的 **Add +** 按钮添加新的仪表板。

3. 要添加新小部件，请点击右上角的 **Add** 按钮。

4. 您可以从已保存查询列表中选择一个查询，选择可视化类型，然后点击 **Add Dashboard Item** 按钮。

## 了解更多 {#learn-more}
要了解更多关于 Draxlr 的信息，您可以访问 [Draxlr documentation](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928) 网站。
