---
sidebar_label: 'Metabase'
sidebar_position: 131
slug: /integrations/metabase
keywords: ['Metabase']
description: 'Metabase 是一个易用的开源 UI 工具，用于对你的数据提出问题。'
title: '将 Metabase 连接到 ClickHouse'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/clickhouse/metabase-clickhouse-driver'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import metabase_01 from '@site/static/images/integrations/data-visualization/metabase_01.png';
import metabase_02 from '@site/static/images/integrations/data-visualization/metabase_02.png';
import metabase_03 from '@site/static/images/integrations/data-visualization/metabase_03.png';
import metabase_04 from '@site/static/images/integrations/data-visualization/metabase_04.png';
import metabase_06 from '@site/static/images/integrations/data-visualization/metabase_06.png';
import metabase_07 from '@site/static/images/integrations/data-visualization/metabase_07.png';
import metabase_08 from '@site/static/images/integrations/data-visualization/metabase_08.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# 将 Metabase 连接到 ClickHouse

<PartnerBadge/>

Metabase 是一个易于使用的开源 UI 工具，用于对你的数据进行查询与分析。Metabase 是一个 Java 应用程序，只需<a href="https://www.metabase.com/start/oss/jar" target="_blank">下载 JAR 文件</a>并使用 `java -jar metabase.jar` 运行即可。Metabase 通过 JDBC 驱动程序连接到 ClickHouse，你需要下载该驱动并将其放入 `plugins` 文件夹中：



## 目标 {#goal}

在本指南中,您将使用 Metabase 查询 ClickHouse 数据并将结果可视化。其中一个可视化结果如下所示:

<Image
  size='md'
  img={metabase_08}
  alt='Metabase 饼图可视化展示 ClickHouse 数据'
  border
/>
<p />

:::tip 添加数据
如果您没有可用的数据集,可以添加示例数据集。本指南使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集,您可以选择使用该数据集。同一文档类别中还有其他几个数据集可供选择。
:::


## 1. 收集连接信息 {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. 下载 Metabase 的 ClickHouse 插件 {#2--download-the-clickhouse-plugin-for-metabase}

1. 如果您还没有 `plugins` 文件夹,请在 `metabase.jar` 所在目录下创建一个 `plugins` 子文件夹。

2. 该插件是一个名为 `clickhouse.metabase-driver.jar` 的 JAR 文件。请从 <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a> 下载最新版本的 JAR 文件。

3. 将 `clickhouse.metabase-driver.jar` 保存到 `plugins` 文件夹中。

4. 启动(或重启)Metabase 以正确加载驱动程序。

5. 通过 <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a> 访问 Metabase。首次启动时,您将看到欢迎界面并需要完成一系列配置问题。如果提示选择数据库,请选择"**I'll add my data later**":


## 3. 将 Metabase 连接到 ClickHouse {#3--connect-metabase-to-clickhouse}

1. 点击右上角的齿轮图标并选择 **Admin Settings**,访问您的 <a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase 管理页面</a>。

2. 点击 **Add a database**。或者,您也可以点击 **Databases** 选项卡,然后选择 **Add database** 按钮。

3. 如果驱动程序安装成功,您将在 **Database type** 下拉菜单中看到 **ClickHouse** 选项:

   <Image
     size='md'
     img={metabase_01}
     alt='Metabase 数据库选择界面显示 ClickHouse 选项'
     border
   />

4. 为您的数据库设置一个 **Display name**,这是 Metabase 中的一个设置项,您可以使用任何喜欢的名称。

5. 输入您的 ClickHouse 数据库连接详细信息。如果您的 ClickHouse 服务器配置了 SSL,请启用安全连接。例如:

   <Image
     size='md'
     img={metabase_02}
     alt='Metabase 的 ClickHouse 数据库连接详细信息表单'
     border
   />

6. 点击 **Save** 按钮,Metabase 将扫描您的数据库中的表。


## 4. 运行 SQL 查询 {#4-run-a-sql-query}

1. 点击右上角的 **Exit admin** 按钮退出 **Admin settings**。

2. 在右上角点击 **+ New** 菜单,您可以看到提问、运行 SQL 查询和构建仪表板等选项:

   <Image
     size='sm'
     img={metabase_03}
     alt='Metabase New 菜单显示创建问题、SQL 查询和仪表板的选项'
     border
   />

3. 例如,以下是在名为 `uk_price_paid` 的表上运行的 SQL 查询,该查询返回 1995 年至 2022 年各年度的平均支付价格:

   <Image
     size='md'
     img={metabase_04}
     alt='Metabase SQL 编辑器显示对英国房价支付数据的查询'
     border
   />


## 5. 提出查询问题 {#5-ask-a-question}

1. 点击 **+ New** 并选择 **Question**。您可以通过选择数据库和表来构建查询问题。例如,以下查询针对 `default` 数据库中名为 `uk_price_paid` 的表。这是一个简单的查询示例,用于计算大曼彻斯特郡内各城镇的平均价格:

   <Image
     size='md'
     img={metabase_06}
     alt='Metabase 查询构建器界面,显示英国房价数据'
     border
   />

2. 点击 **Visualize** 按钮以表格形式查看结果。

   <Image
     size='md'
     img={metabase_07}
     alt='Metabase 可视化界面,以表格形式显示各城镇的平均价格'
     border
   />

3. 在结果下方,点击 **Visualization** 按钮可将可视化方式更改为条形图(或其他任何可用的图表类型):

   <Image
     size='md'
     img={metabase_08}
     alt='Metabase 饼图可视化,显示大曼彻斯特郡各城镇的平均价格'
     border
   />


## 了解更多 {#learn-more}

通过<a href="https://www.metabase.com/docs/latest/" target="_blank">访问 Metabase 文档</a>，了解更多关于 Metabase 以及如何构建仪表板的信息。
