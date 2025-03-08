---
sidebar_label: 'Draxlr'
sidebar_position: 131
slug: /integrations/draxlr
keywords: ['clickhouse', 'Draxlr', 'connect', 'integrate', 'ui']
description: 'Draxlr 是一个具有数据可视化和分析功能的商业智能工具。'
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import draxlr_01 from '@site/static/images/integrations/data-visualization/draxlr_01.png';
import draxlr_02 from '@site/static/images/integrations/data-visualization/draxlr_02.png';
import draxlr_03 from '@site/static/images/integrations/data-visualization/draxlr_03.png';
import draxlr_04 from '@site/static/images/integrations/data-visualization/draxlr_04.png';
import draxlr_05 from '@site/static/images/integrations/data-visualization/draxlr_05.png';
import draxlr_06 from '@site/static/images/integrations/data-visualization/draxlr_06.png';



# 将Draxlr连接到ClickHouse

Draxlr提供了一个直观的界面，可以连接到您的ClickHouse数据库，让您的团队能够在几分钟内探索、可视化和发布洞察。 本指南将引导您完成建立成功连接的步骤。


## 1. 获取您的ClickHouse凭据 {#1-get-your-clickhouse-credentials}
<ConnectionDetails />

## 2. 将Draxlr连接到ClickHouse {#2--connect-draxlr-to-clickhouse}

1. 点击导航栏上的 **连接数据库** 按钮。

2. 从可用数据库列表中选择 **ClickHouse**，然后点击下一步。

3. 选择其中一个托管服务后点击下一步。

4. 在 **连接名称** 字段中使用任何名称。

5. 在表单中添加连接详细信息。

  <img src={draxlr_01} class="image" style={{width: '80%'}}  alt="连接表单" />

6. 点击 **下一步** 按钮，等待连接建立。如果连接成功，您将看到表页面。

## 4. 探索您的数据 {#4-explore-your-data}

1. 点击列表中的一个表。

2. 这将带您到探索页面以查看表中的数据。

3. 您可以开始添加过滤器、进行联接并对数据进行排序。

  <img src={draxlr_02} class="image" style={{width: '80%'}}  alt="连接表单" />

4. 您还可以使用 **图表** 按钮，选择图表类型以可视化数据。

  <img src={draxlr_05} class="image" style={{width: '80%'}}  alt="连接表单" />


## 4. 使用SQL查询 {#4-using-sql-queries}

1. 点击导航栏上的探索按钮。

2. 点击 **原始查询** 按钮，然后在文本区域中输入您的查询。

  <img src={draxlr_03} class="image" style={{width: '80%'}}  alt="连接表单" />

3. 点击 **执行查询** 按钮查看结果。


## 4. 保存您的查询 {#4-saving-you-query}

1. 执行查询后，点击 **保存查询** 按钮。

  <img src={draxlr_04} class="image" style={{width: '80%'}}  alt="连接表单" />

2. 您可以在 **查询名称** 文本框中命名查询，并选择一个文件夹进行分类。

3. 您还可以使用 **添加到仪表板** 选项将结果添加到仪表板。

4. 点击 **保存** 按钮以保存查询。


## 5. 构建仪表板 {#5-building-dashboards}

1. 点击导航栏上的 **仪表板** 按钮。

  <img src={draxlr_06} class="image" style={{width: '80%'}}  alt="连接表单" />

2. 通过点击左侧边栏上的 **添加 +** 按钮来添加新的仪表板。

3. 要添加新的部件，请点击右上角的 **添加** 按钮。

4. 您可以从保存的查询列表中选择查询，选择可视化类型，然后点击 **添加仪表板项目** 按钮。

## 了解更多 {#learn-more}
要了解有关Draxlr的更多信息，您可以访问 [Draxlr文档](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928) 网站。
