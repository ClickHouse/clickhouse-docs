---
sidebar_label: 'Draxlr'
sidebar_position: 131
slug: /integrations/draxlr
keywords: ['clickhouse', 'Draxlr', 'connect', 'integrate', 'ui']
description: 'Draxlr 是一款提供数据可视化与分析功能的商业智能工具。'
title: '将 Draxlr 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
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

<CommunityMaintainedBadge />

Draxlr 提供直观易用的界面，方便您连接到 ClickHouse 数据库，让团队在几分钟内即可探索数据、创建可视化并发布洞察。本指南将逐步说明如何成功建立连接。

## 1. 获取 ClickHouse 凭据 \{#1-get-your-clickhouse-credentials\}

<ConnectionDetails />

## 2.  将 Draxlr 连接到 ClickHouse \{#2--connect-draxlr-to-clickhouse\}

1. 点击导航栏中的 **Connect a Database** 按钮。

2. 在可用数据库列表中选择 **ClickHouse**，然后点击 **Next**。

3. 选择一种托管服务，然后点击 **Next**。

4. 在 **Connection Name** 字段中输入任意名称。

5. 在表单中填写连接信息。

<Image size="md" img={draxlr_01} alt="显示 ClickHouse 数据库配置选项的 Draxlr 连接表单" border />

6. 点击 **Next** 按钮并等待连接建立。如果连接成功，你将看到表列表页面。

## 4. 探索您的数据 \{#4-explore-your-data\}

1. 点击列表中的任意一个表。

2. 系统会跳转到探索页面，查看该表中的数据。

3. 您可以开始添加过滤器、执行 join，并为数据添加排序。

<Image size="md" img={draxlr_02} alt="显示过滤器和排序选项的 Draxlr 数据探索界面" border />

4. 您还可以点击 **Graph** 按钮，并选择图表类型来可视化数据。

<Image size="md" img={draxlr_05} alt="ClickHouse 数据的 Draxlr 图表可视化选项" border />

## 4. 使用 SQL 查询 \{#4-using-sql-queries\}

1. 点击导航栏中的 Explore 按钮。

2. 点击 **Raw Query** 按钮，然后在文本框中输入 SQL 查询。

<Image size="md" img={draxlr_03} alt="Draxlr 的 ClickHouse SQL 查询界面" border />

3. 点击 **Execute Query** 按钮查看结果。

## 4. 保存查询 \{#4-saving-you-query\}

1. 执行查询后，点击 **Save Query** 按钮。

<Image size="md" img={draxlr_04} alt="带有仪表盘选项的 Draxlr 保存查询对话框" border />

2. 您可以在 **Query Name** 文本框中为查询命名，并选择一个文件夹进行分类。

3. 您还可以使用 **Add to dashboard** 选项将结果添加到仪表盘。

4. 点击 **Save** 按钮保存查询。

## 5. 创建仪表盘 \{#5-building-dashboards\}

1. 点击导航栏中的 **Dashboards** 按钮。

<Image size="md" img={draxlr_06} alt="Draxlr 仪表盘管理界面" border />

2. 点击左侧边栏中的 **Add +** 按钮，添加新的仪表盘。

3. 要添加新组件，请点击右上角的 **Add** 按钮。

4. 从已保存的查询列表中选择一个查询，选择可视化类型，然后点击 **Add Dashboard Item** 按钮。

## 了解更多 \{#learn-more\}

如需进一步了解 Draxlr，请访问 [Draxlr 文档](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928)。