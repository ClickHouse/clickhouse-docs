---
'sidebar_label': 'Metabase'
'sidebar_position': 131
'slug': '/integrations/metabase'
'keywords':
- 'ClickHouse'
- 'Metabase'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Metabase 是一个易于使用的开源 UI 工具，用于查询关于您的数据的问题。'
'title': '连接 Metabase 到 ClickHouse'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import metabase_01 from '@site/static/images/integrations/data-visualization/metabase_01.png';
import metabase_02 from '@site/static/images/integrations/data-visualization/metabase_02.png';
import metabase_03 from '@site/static/images/integrations/data-visualization/metabase_03.png';
import metabase_04 from '@site/static/images/integrations/data-visualization/metabase_04.png';
import metabase_06 from '@site/static/images/integrations/data-visualization/metabase_06.png';
import metabase_07 from '@site/static/images/integrations/data-visualization/metabase_07.png';
import metabase_08 from '@site/static/images/integrations/data-visualization/metabase_08.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Metabase 连接到 ClickHouse

<CommunityMaintainedBadge/>

Metabase 是一个易于使用的开源 UI 工具，用于询问有关数据的问题。Metabase 是一个 Java 应用程序，可以通过简单地 <a href="https://www.metabase.com/start/oss/jar" target="_blank">下载 JAR 文件</a> 并使用 `java -jar metabase.jar` 运行。Metabase 使用 JDBC 驱动程序连接到 ClickHouse，您需要下载并将其放入 `plugins` 文件夹中：

## 目标 {#goal}

在本指南中，您将使用 Metabase 提出一些关于 ClickHouse 数据的问题并可视化答案。 其中一个答案将如下所示：

  <Image size="md" img={metabase_08} alt="Metabase pie chart visualization showing data from ClickHouse" border />
<p/>

:::tip 添加一些数据
如果您没有可用的数据集，可以添加一些示例。本指南使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集，因此您可以选择该数据集。在同一文档类别中还有其他几个可以查看的示例。
:::

## 1. 收集连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 下载 ClickHouse 插件以用于 Metabase {#2--download-the-clickhouse-plugin-for-metabase}

1. 如果您没有 `plugins` 文件夹，请在保存 `metabase.jar` 的位置创建一个子文件夹。

2. 插件是一个名为 `clickhouse.metabase-driver.jar` 的 JAR 文件。请在 <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a> 下载最新版本的 JAR 文件。

3. 将 `clickhouse.metabase-driver.jar` 保存到您的 `plugins` 文件夹中。

4. 启动（或重启）Metabase，以便驱动程序能够正确加载。

5. 在 <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a> 访问 Metabase。在初次启动时，您将看到欢迎屏幕，并需要完成一系列问题。如果提示选择数据库，请选择 "**我稍后将添加数据**"：


## 3. 将 Metabase 连接到 ClickHouse {#3--connect-metabase-to-clickhouse}

1. 点击右上角的齿轮图标并选择 **管理设置**，以访问您的 <a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase 管理页面</a>。

2. 点击 **添加数据库**。或者，您可以点击 **数据库** 标签并选择 **添加数据库** 按钮。

3. 如果您的驱动程序安装成功，您将在 **数据库类型** 的下拉菜单中看到 **ClickHouse**：

    <Image size="md" img={metabase_01} alt="Metabase database selection showing ClickHouse as an option" border />

4. 给您的数据库一个 **显示名称**，这是一个 Metabase 设置 - 因此可以使用您喜欢的名称。

5. 输入 ClickHouse 数据库的连接详细信息。如果您的 ClickHouse 服务器配置为使用 SSL，请启用安全连接。例如：

    <Image size="md" img={metabase_02} alt="Metabase connection details form for ClickHouse database" border />

6. 点击 **保存** 按钮，Metabase 将扫描您的数据库以查找表。

## 4. 运行 SQL 查询 {#4-run-a-sql-query}

1. 点击右上角的 **退出管理员** 按钮退出 **管理设置**。

2. 在右上角，点击 **+ 新建** 菜单，注意您可以询问问题、运行 SQL 查询和构建仪表板：

    <Image size="sm" img={metabase_03} alt="Metabase New menu showing options to create questions, SQL queries, and dashboards" border />

3. 例如，以下是在名为 `uk_price_paid` 的表上运行的 SQL 查询，返回 1995 年至 2022 年的平均价格：

    <Image size="md" img={metabase_04} alt="Metabase SQL editor showing a query on UK price paid data" border />

## 5. 提出一个问题 {#5-ask-a-question}

1. 点击 **+ 新建** 并选择 **问题**。注意您可以通过从数据库和表开始构建问题。例如，以下问题是向 `default` 数据库中的名为 `uk_price_paid` 的表提出的。这个简单的问题计算了在大曼彻斯特郡内按城镇划分的平均价格：

    <Image size="md" img={metabase_06} alt="Metabase question builder interface with UK price data" border />

2. 点击 **可视化** 按钮查看表格视图中的结果。

    <Image size="md" img={metabase_07} alt="Metabase visualization showing tabular results of average prices by town" border />

3. 在结果下方，点击 **可视化** 按钮将可视化转换为条形图（或其他任何可用选项）：

    <Image size="md" img={metabase_08} alt="Metabase pie chart visualization of average prices by town in Greater Manchester" border />

## 了解更多 {#learn-more}

通过 <a href="https://www.metabase.com/docs/latest/" target="_blank">访问 Metabase 文档</a>，您可以找到更多有关 Metabase 及构建仪表板的信息。

## 相关内容 {#related-content}

- 博客: [使用 ClickHouse 可视化数据 - 第 3 部分 - Metabase](https://clickhouse.com/blog/visualizing-data-with-metabase)
