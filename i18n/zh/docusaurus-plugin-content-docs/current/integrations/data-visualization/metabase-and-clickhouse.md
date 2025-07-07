---
'sidebar_label': 'Metabase'
'sidebar_position': 131
'slug': '/integrations/metabase'
'keywords':
- 'Metabase'
'description': 'Metabase 是一个易于使用的开源用户界面工具，用于查询您的数据。'
'title': '连接 Metabase 到 ClickHouse'
'show_related_blogs': true
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


# 将 Metabase 连接到 ClickHouse

<CommunityMaintainedBadge/>

Metabase 是一个易于使用的开源 UI 工具，用于查询您的数据。Metabase 是一个 Java 应用程序，可以通过 <a href="https://www.metabase.com/start/oss/jar" target="_blank">下载 JAR 文件</a> 并用命令 `java -jar metabase.jar` 运行它。Metabase 使用您下载的 JDBC 驱动程序连接到 ClickHouse，并将其放置在 `plugins` 文件夹中：

## 目标 {#goal}

在本指南中，您将使用 Metabase 查询 ClickHouse 数据，并可视化答案。 驱动结果之一将如下所示：

  <Image size="md" img={metabase_08} alt="Metabase 饼图可视化显示来自 ClickHouse 的数据" border />
<p/>

:::tip 添加一些数据
如果您没有数据集可以使用，您可以添加一个示例。 本指南使用的是 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集，您可以选择该数据集。 在同一文档类别中还有其他几个供您查看。
:::

## 1. 收集连接详情 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 下载 ClickHouse 的 Metabase 插件 {#2--download-the-clickhouse-plugin-for-metabase}

1. 如果您没有 `plugins` 文件夹，请在 `metabase.jar` 保存目录下创建一个子文件夹。

2. 插件是名为 `clickhouse.metabase-driver.jar` 的 JAR 文件。 您可以在 <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a> 下载最新版的 JAR 文件。

3. 将 `clickhouse.metabase-driver.jar` 保存到您的 `plugins` 文件夹中。

4. 启动（或重启）Metabase，以便驱动程序能够正确加载。

5. 访问 Metabase，地址为 <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>。 在初始启动时，您会看到一个欢迎界面，并需要逐步完成一系列问题的回答。 如果提示选择数据库，请选择 "**I'll add my data later**":

## 3. 将 Metabase 连接到 ClickHouse {#3--connect-metabase-to-clickhouse}

1. 点击右上角的齿轮图标，选择 **Admin Settings** 以访问您的 <a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase 管理页面</a>。

2. 点击 **Add a database**。 或者，您可以点击 **Databases** 标签，选择 **Add database** 按钮。

3. 如果您的驱动程序安装成功，您将在 **Database type** 的下拉菜单中看到 **ClickHouse**：

    <Image size="md" img={metabase_01} alt="Metabase 数据库选择显示 ClickHouse 作为选项" border />

4. 给您的数据库一个 **Display name**，这是 Metabase 的设置 - 您可以使用任何您喜欢的名称。

5. 输入 ClickHouse 数据库的连接详情。如果您的 ClickHouse 服务器配置为使用 SSL，请启用安全连接。例如：

    <Image size="md" img={metabase_02} alt="Metabase 连接详细信息表单用于 ClickHouse 数据库" border />

6. 点击 **Save** 按钮，Metabase 将扫描您的数据库以查找表。

## 4. 运行 SQL 查询 {#4-run-a-sql-query}

1. 点击右上角的 **Exit admin** 按钮以退出 **Admin settings**。

2. 在右上角，点击 **+ New** 菜单，注意您可以询问问题、运行 SQL 查询和构建仪表板：

    <Image size="sm" img={metabase_03} alt="Metabase 新菜单显示创建问题、SQL 查询和仪表板的选项" border />

3. 例如，下面是对一个名为 `uk_price_paid` 的表运行的 SQL 查询，它返回从 1995 年到 2022 年每年的平均价格：

    <Image size="md" img={metabase_04} alt="Metabase SQL 编辑器显示对英国价格数据的查询" border />

## 5. 提出问题 {#5-ask-a-question}

1. 点击 **+ New** 并选择 **Question**。 注意您可以通过从数据库和表开始构建问题。 例如，以下问题是针对 `default` 数据库中的 `uk_price_paid` 表提问的。 这是一个简单的问题，计算大曼彻斯特县内按城镇的平均价格：

    <Image size="md" img={metabase_06} alt="Metabase 问题构建界面显示英国价格数据" border />

2. 点击 **Visualize** 按钮以查看表格视图中的结果。

    <Image size="md" img={metabase_07} alt="Metabase 可视化显示按城镇平均价格的表格结果" border />

3. 在结果下方，点击 **Visualization** 按钮以将可视化更改为条形图（或其他任何可用选项）：

    <Image size="md" img={metabase_08} alt="Metabase 饼图可视化显示大曼彻斯特按城镇的平均价格" border />

## 了解更多 {#learn-more}

通过 <a href="https://www.metabase.com/docs/latest/" target="_blank">访问 Metabase 文档</a>，获取有关 Metabase 和如何构建仪表板的更多信息。
