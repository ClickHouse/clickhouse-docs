---
'sidebar_label': 'Metabase'
'sidebar_position': 131
'slug': '/integrations/metabase'
'keywords':
- 'Metabase'
'description': 'Metabase 是一个易于使用的开源 UI 工具，用于查询您的数据。'
'title': '将 Metabase 连接到 ClickHouse'
'show_related_blogs': true
'doc_type': 'guide'
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 连接 Metabase 到 ClickHouse

<CommunityMaintainedBadge/>

Metabase 是一个易于使用的开源 UI 工具，用于询问有关您的数据的问题。Metabase 是一个 Java 应用程序，可以通过简单地 <a href="https://www.metabase.com/start/oss/jar" target="_blank">下载 JAR 文件</a> 并使用 `java -jar metabase.jar` 运行它。Metabase 使用 JDBC 驱动程序连接到 ClickHouse，您需要下载并将其放入 `plugins` 文件夹中：

## 目标 {#goal}

在本指南中，您将使用 Metabase 对您的 ClickHouse 数据进行一些查询并可视化答案。 其中一个答案将类似于以下内容：

  <Image size="md" img={metabase_08} alt="Metabase 饼图可视化显示来自 ClickHouse 的数据" border />
<p/>

:::tip 添加一些数据
如果您没有可以使用的数据集，可以添加一个示例。本指南使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集，因此您可以选择该数据集。 在同一文档类别中还有其他几个数据集可以查看。
:::

## 1. 收集您的连接详情 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 下载 ClickHouse 的 Metabase 插件 {#2--download-the-clickhouse-plugin-for-metabase}

1. 如果您没有 `plugins` 文件夹，请在保存 `metabase.jar` 的文件夹下创建一个子文件夹。

2. 插件是一个名为 `clickhouse.metabase-driver.jar` 的 JAR 文件。请在 <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a> 下载 JAR 文件的最新版本。

3. 将 `clickhouse.metabase-driver.jar` 保存在您的 `plugins` 文件夹中。

4. 启动 (或重启) Metabase，以便驱动程序正确加载。

5. 在 <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a> 访问 Metabase。在初始启动时，您将看到欢迎屏幕，并需要通过一系列问题。如果提示选择数据库，请选择“**我稍后会添加我的数据**”：

## 3. 将 Metabase 连接到 ClickHouse {#3--connect-metabase-to-clickhouse}

1. 单击右上角的齿轮图标，然后选择 **Admin Settings** 以访问您的 <a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase 管理页面</a>。

2. 点击 **Add a database**。或者，您可以点击 **Databases** 标签并选择 **Add database** 按钮。

3. 如果您的驱动程序安装成功，您将会在 **Database type** 的下拉菜单中看到 **ClickHouse**：

    <Image size="md" img={metabase_01} alt="Metabase 数据库选择显示 ClickHouse 作为选项" border />

4. 给您的数据库一个 **Display name**，这是 Metabase 设置 - 所以您可以使用任何您喜欢的名称。

5. 输入您的 ClickHouse 数据库的连接详情。如果您的 ClickHouse 服务器配置为使用 SSL，则启用安全连接。例如：

    <Image size="md" img={metabase_02} alt="Metabase 连接详情表单用于 ClickHouse 数据库" border />

6. 点击 **Save** 按钮，Metabase 将扫描您的数据库以查找表。

## 4. 运行 SQL 查询 {#4-run-a-sql-query}

1. 通过点击右上角的 **Exit admin** 按钮退出 **Admin settings**。

2. 在右上角，点击 **+ New** 菜单，注意您可以询问问题、运行 SQL 查询和构建仪表板：

    <Image size="sm" img={metabase_03} alt="Metabase 新菜单显示创建问题、SQL 查询和仪表板的选项" border />

3. 例如，以下是在名为 `uk_price_paid` 的表上运行的 SQL 查询，该查询返回 1995 年至 2022 年每年的平均价格：

    <Image size="md" img={metabase_04} alt="Metabase SQL 编辑器显示对 UK price paid 数据的查询" border />

## 5. 提问 {#5-ask-a-question}

1. 点击 **+ New** 并选择 **Question**。注意您可以通过选择一个数据库和表来构建问题。例如，以下问题是针对 `default` 数据库中名为 `uk_price_paid` 的表提出的。这里有一个简单的问题，计算大曼彻斯特县每个城镇的平均价格：

    <Image size="md" img={metabase_06} alt="Metabase 问题构建器界面显示 UK 价格数据" border />

2. 点击 **Visualize** 按钮以表格视图查看结果。

    <Image size="md" img={metabase_07} alt="Metabase 可视化显示按城镇的平均价格的表格结果" border />

3. 在结果下方，点击 **Visualization** 按钮将可视化更改为条形图（或可用的其他选项）：

    <Image size="md" img={metabase_08} alt="Metabase 饼图可视化显示大曼彻斯特城镇的平均价格" border />

## 了解更多 {#learn-more}

有关 Metabase 的更多信息以及如何构建仪表板，请通过 <a href="https://www.metabase.com/docs/latest/" target="_blank">访问 Metabase 文档</a>。
