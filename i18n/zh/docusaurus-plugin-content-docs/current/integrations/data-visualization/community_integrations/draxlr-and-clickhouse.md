---
sidebar_label: 'Draxlr'
sidebar_position: 131
slug: /integrations/draxlr
keywords: ['clickhouse', 'Draxlr', 'connect', 'integrate', 'ui']
description: 'Draxlr 是一款用于数据可视化和分析的商业智能工具。'
title: '将 Draxlr 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
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

Draxlr 提供直观的界面，便于连接到你的 ClickHouse 数据库，使你的团队能够在几分钟内完成数据探索、可视化和洞察发布。本文将引导你完成建立稳定连接的各个步骤。



## 1. 获取 ClickHouse 凭据 {#1-get-your-clickhouse-credentials}

<ConnectionDetails />


## 2. 将 Draxlr 连接到 ClickHouse {#2--connect-draxlr-to-clickhouse}

1. 点击导航栏上的 **Connect a Database** 按钮。

2. 从可用数据库列表中选择 **ClickHouse**,然后点击"下一步"。

3. 选择一个托管服务,然后点击"下一步"。

4. 在 **Connection Name** 字段中输入任意名称。

5. 在表单中填写连接详细信息。

<Image
  size='md'
  img={draxlr_01}
  alt='显示 ClickHouse 数据库配置选项的 Draxlr 连接表单'
  border
/>

6. 点击 **Next** 按钮并等待连接建立。连接成功后,您将看到表页面。


## 4. 探索数据 {#4-explore-your-data}

1. 点击列表中的任意表。

2. 系统将跳转到探索页面,显示该表中的数据。

3. 您可以添加过滤器、执行表连接并对数据进行排序。

<Image
  size='md'
  img={draxlr_02}
  alt='Draxlr 数据探索界面,显示过滤和排序选项'
  border
/>

4. 您还可以点击 **Graph** 按钮,选择图表类型来可视化数据。

<Image
  size='md'
  img={draxlr_05}
  alt='Draxlr 的 ClickHouse 数据图表可视化选项'
  border
/>


## 4. 使用 SQL 查询 {#4-using-sql-queries}

1. 点击导航栏上的 Explore 按钮。

2. 点击 **Raw Query** 按钮,在文本区域中输入查询语句。

<Image
  size='md'
  img={draxlr_03}
  alt='ClickHouse 的 Draxlr SQL 查询界面'
  border
/>

3. 点击 **Execute Query** 按钮查看结果。


## 4. 保存查询 {#4-saving-you-query}

1. 执行查询后,点击 **Save Query** 按钮。

<Image
  size='md'
  img={draxlr_04}
  alt='Draxlr 保存查询对话框及仪表板选项'
  border
/>

2. 您可以在 **Query Name** 文本框中为查询命名,并选择文件夹进行分类。

3. 您还可以使用 **Add to dashboard** 选项将查询结果添加到仪表板。

4. 点击 **Save** 按钮保存查询。


## 5. 构建仪表板 {#5-building-dashboards}

1. 点击导航栏上的 **Dashboards** 按钮。

<Image
  size='md'
  img={draxlr_06}
  alt='Draxlr 仪表板管理界面'
  border
/>

2. 点击左侧边栏的 **Add +** 按钮即可添加新仪表板。

3. 要添加新组件,请点击右上角的 **Add** 按钮。

4. 从已保存的查询列表中选择一个查询,选择可视化类型,然后点击 **Add Dashboard Item** 按钮。


## 了解更多 {#learn-more}

要了解更多关于 Draxlr 的信息,请访问 [Draxlr 文档](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928)网站。
