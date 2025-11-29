---
sidebar_label: 'Draxlr'
sidebar_position: 131
slug: /integrations/draxlr
keywords: ['clickhouse', 'Draxlr', 'connect', 'integrate', 'ui']
description: 'Draxlr 是一款具备数据可视化和分析功能的商业智能（BI）工具。'
title: '将 Draxlr 连接至 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
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


# 将 Draxlr 连接到 ClickHouse {#connecting-draxlr-to-clickhouse}

<CommunityMaintainedBadge/>

Draxlr 提供直观的界面用于连接到您的 ClickHouse 数据库，使您的团队能够在几分钟内探索、可视化并发布洞见。本文将引导您完成建立连接的各个步骤。



## 1. 获取您的 ClickHouse 凭证 {#1-get-your-clickhouse-credentials}
<ConnectionDetails />



## 2.  将 Draxlr 连接到 ClickHouse {#2--connect-draxlr-to-clickhouse}

1. 点击导航栏中的 **Connect a Database** 按钮。

2. 在可用数据库列表中选择 **ClickHouse**，然后点击 **Next**。

3. 选择一种托管服务，然后点击 **Next**。

4. 在 **Connection Name** 字段中使用任意名称。

5. 在表单中填写连接详细信息。

  <Image size="md" img={draxlr_01} alt="Draxlr 连接表单，展示 ClickHouse 数据库配置选项" border />

6. 点击 **Next** 按钮，并等待连接建立。连接成功后你会看到数据表页面。



## 4. 探索你的数据 {#4-explore-your-data}

1. 点击列表中的任意一个表。

2. 页面会跳转到探索页面，以查看该表中的数据。

3. 你可以开始添加筛选条件、进行表关联（join），并对数据进行排序。

  <Image size="md" img={draxlr_02} alt="Draxlr 数据探索界面，展示筛选和排序选项" border />

4. 你也可以使用 **Graph** 按钮，并选择图表类型来可视化数据。

  <Image size="md" img={draxlr_05} alt="用于 ClickHouse 数据的 Draxlr 图表可视化选项" border />



## 4. 使用 SQL 查询 {#4-using-sql-queries}

1. 点击导航栏中的 Explore 按钮。

2. 点击 **Raw Query** 按钮，并在文本框中输入你的查询语句。

  <Image size="md" img={draxlr_03} alt="用于 ClickHouse 的 Draxlr SQL 查询界面" border />

3. 点击 **Execute Query** 按钮即可查看结果。



## 4. 保存查询 {#4-saving-you-query}

1. 执行查询后，单击 **Save Query** 按钮。

  <Image size="md" img={draxlr_04} alt="Draxlr save query dialog with dashboard options" border />

2. 你可以在 **Query Name** 文本框中为查询命名，并选择一个文件夹对其进行归类。

3. 你也可以使用 **Add to dashboard** 选项将结果添加到仪表盘中。

4. 单击 **Save** 按钮以保存该查询。



## 5. 构建仪表板 {#5-building-dashboards}

1. 点击导航栏上的 **Dashboards** 按钮。

  <Image size="md" img={draxlr_06} alt="Draxlr dashboard management interface" border />

2. 在左侧边栏点击 **Add +** 按钮以添加新的仪表板。

3. 要添加新的组件，点击右上角的 **Add** 按钮。

4. 从已保存查询列表中选择一个查询并选择可视化类型，然后点击 **Add Dashboard Item** 按钮。



## 了解更多 {#learn-more}
若要进一步了解 Draxlr，您可以访问 [Draxlr 文档](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928) 网站。
