---
sidebar_label: 'Metabase'
sidebar_position: 131
slug: /integrations/metabase
keywords: ['Metabase']
description: 'Metabase 是一款易于使用的开源 UI 工具，用于就数据提出问题。'
title: '将 Metabase 连接到 ClickHouse'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/clickhouse/metabase-clickhouse-driver'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import metabase_01 from '@site/static/images/integrations/data-visualization/metabase_01.png';
import metabase_02 from '@site/static/images/integrations/data-visualization/metabase_02.png';
import metabase_03 from '@site/static/images/integrations/data-visualization/metabase_03.png';
import metabase_04 from '@site/static/images/integrations/data-visualization/metabase_04.png';
import metabase_06 from '@site/static/images/integrations/data-visualization/metabase_06.png';
import metabase_07 from '@site/static/images/integrations/data-visualization/metabase_07.png';
import metabase_08 from '@site/static/images/integrations/data-visualization/metabase_08.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

# 将 Metabase 连接到 ClickHouse {#connecting-metabase-to-clickhouse}

<PartnerBadge/>

Metabase 是一个易于使用的开源 UI 工具，可用于对你的数据进行查询和分析。Metabase 是一个 Java 应用程序，只需<a href="https://www.metabase.com/start/oss/jar" target="_blank">下载 JAR 文件</a>并使用 `java -jar metabase.jar` 运行即可。Metabase 通过 JDBC 驱动程序连接到 ClickHouse，你需要下载该驱动并将其放入 `plugins` 目录中：

## 目标 {#goal}

在本指南中，您将使用 Metabase 针对 ClickHouse 数据提出一些问题，并将答案进行可视化展示。其中一个结果如下所示：

  <Image size="md" img={metabase_08} alt="Metabase 饼图可视化展示来自 ClickHouse 的数据" border />
<p/>

:::tip 添加一些数据
如果您目前没有可用的数据集，可以添加一个示例数据集。本指南使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集，您可以选择使用该数据集。同一文档类别下还有其他几个示例可供参考。
:::

## 1. 收集连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2.  下载用于 Metabase 的 ClickHouse 插件 {#2--download-the-clickhouse-plugin-for-metabase}

1. 如果还没有 `plugins` 文件夹，请在保存 `metabase.jar` 的目录下创建一个名为 `plugins` 的子文件夹。

2. 插件是一个名为 `clickhouse.metabase-driver.jar` 的 JAR 文件。请在 <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a> 下载该 JAR 文件的最新版本。

3. 将 `clickhouse.metabase-driver.jar` 保存到你的 `plugins` 文件夹中。

4. 启动（或重新启动）Metabase，以便正确加载该驱动。

5. 通过 <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a> 访问 Metabase。首次启动时，你会看到一个欢迎界面，并需要依次回答一系列问题。如果在此过程中提示你选择数据库，请选择 "**I'll add my data later**"：

## 3.  将 Metabase 连接到 ClickHouse {#3--connect-metabase-to-clickhouse}

1. 点击右上角的齿轮图标并选择 **Admin Settings**，进入 <a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase 管理页面</a>。

2. 点击 **Add a database**。或者，可以点击 **Databases** 选项卡并选择 **Add database** 按钮。

3. 如果驱动安装成功，你会在 **Database type** 的下拉菜单中看到 **ClickHouse**：

    <Image size="md" img={metabase_01} alt="Metabase 数据库选择界面显示 ClickHouse 作为一个可选项" border />

4. 为你的数据库设置一个 **Display name**。这是 Metabase 中的一个设置项，因此可以使用任意你喜欢的名称。

5. 输入 ClickHouse 数据库的连接信息。如果你的 ClickHouse 服务器配置为使用 SSL，请启用安全连接。例如：

    <Image size="md" img={metabase_02} alt="用于 ClickHouse 数据库的 Metabase 连接信息表单" border />

6. 点击 **Save** 按钮，Metabase 将扫描你的数据库以检测其中的表。

## 4. 运行 SQL 查询 {#4-run-a-sql-query}

1. 点击右上角的 **Exit admin** 按钮退出 **Admin settings**。

2. 在右上角点击 **+ New** 菜单，可以看到你可以创建问题、运行 SQL 查询以及构建仪表盘：

    <Image size="sm" img={metabase_03} alt="Metabase New 菜单显示用于创建问题、SQL 查询和仪表盘的选项" border />

3. 例如，下面是在名为 `uk_price_paid` 的表上运行的 SQL 查询，它返回 1995 到 2022 年间按年份统计的平均支付金额：

    <Image size="md" img={metabase_04} alt="Metabase SQL 编辑器，展示了针对英国支付价格数据的查询" border />

## 5. 创建问题 {#5-ask-a-question}

1. 点击 **+ New** 并选择 **Question**。请注意，您可以从选择数据库和数据表开始构建一个问题。例如，下面的问题是针对 `default` 数据库中名为 `uk_price_paid` 的表提问的。以下是一个简单的问题，用于计算大曼彻斯特郡各城镇的平均价格：

    <Image size="md" img={metabase_06} alt="Metabase 问题构建界面展示英国房价数据" border />

2. 点击 **Visualize** 按钮，在表格视图中查看结果。

    <Image size="md" img={metabase_07} alt="Metabase 可视化界面显示按城镇划分的平均价格表格结果" border />

3. 在结果下方，点击 **Visualization** 按钮，将可视化类型更改为柱状图（或其他任意可用选项）：

    <Image size="md" img={metabase_08} alt="Metabase 饼图可视化展示大曼彻斯特郡各城镇的平均价格" border />

## 了解更多 {#learn-more}

通过查阅<a href="https://www.metabase.com/docs/latest/" target="_blank">Metabase 文档</a>，了解更多关于 Metabase 及如何构建仪表盘的信息。
