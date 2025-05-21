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
'description': 'Metabase 是一个易于使用的开源 UI 工具，用于对数据提出问题。'
'title': '连接 Metabase 到 ClickHouse'
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 将 Metabase 连接到 ClickHouse

<CommunityMaintainedBadge/>

Metabase 是一个易于使用的开源用户界面工具，用于查询您的数据。Metabase 是一个 Java 应用程序，可以通过简单地 <a href="https://www.metabase.com/start/oss/jar" target="_blank">下载 JAR 文件</a> 并使用 `java -jar metabase.jar` 运行它。 Metabase 使用 JDBC 驱动程序连接到 ClickHouse，您需要下载该驱动并将其放在 `plugins` 文件夹中：

## 目标 {#goal}

在本指南中，您将使用 Metabase 对 ClickHouse 数据提出一些问题并可视化答案。 其中一个答案看起来像这样：

  <Image size="md" img={metabase_08} alt="Metabase 饼图可视化显示 ClickHouse 中的数据" border />
<p/>

:::tip 添加一些数据
如果您没有可用的数据集，可以添加其中一个示例。 本指南使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集，因此您可以选择该数据集。 还有一些其他示例可以在同一文档类别中查看。
:::

## 1. 收集您的连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 下载 ClickHouse 插件用于 Metabase {#2--download-the-clickhouse-plugin-for-metabase}

1. 如果您没有 `plugins` 文件夹，请在保存 `metabase.jar` 的目录下创建一个。

2. 插件是一个名为 `clickhouse.metabase-driver.jar` 的 JAR 文件。 在 <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a> 下载该 JAR 文件的最新版本。

3. 将 `clickhouse.metabase-driver.jar` 保存在您的 `plugins` 文件夹中。

4. 启动（或重新启动）Metabase，以确保驱动程序正确加载。

5. 通过以下链接访问 Metabase： <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>。 在最初的启动过程中，您将看到一个欢迎页面，并且需要按照一系列问题进行操作。如果被提示选择数据库，选择“**稍后添加我的数据**”：

## 3. 将 Metabase 连接到 ClickHouse {#3--connect-metabase-to-clickhouse}

1. 单击右上角的齿轮图标，然后选择 **Admin Settings** 访问您的 <a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase 管理页面</a>。

2. 单击 **Add a database**。 另外，您可以单击 **Databases** 选项卡并选择 **Add database** 按钮。

3. 如果您的驱动程序安装成功，您将在 **Database type** 的下拉菜单中看到 **ClickHouse**：

    <Image size="md" img={metabase_01} alt="Metabase 数据库选择显示 ClickHouse 作为选项" border />

4. 给您的数据库一个 **Display name**，这是 Metabase 的一个设置 - 所以可以使用任何您喜欢的名称。

5. 输入您 ClickHouse 数据库的连接详细信息。如果您的 ClickHouse 服务器配置为使用 SSL，请启用安全连接。 例如：

    <Image size="md" img={metabase_02} alt="Metabase 连接详细信息表单，用于 ClickHouse 数据库" border />

6. 单击 **Save** 按钮，Metabase 将扫描您的数据库以查找表。

## 4. 运行 SQL 查询 {#4-run-a-sql-query}

1. 单击右上角的 **Exit admin** 按钮退出 **Admin settings**。

2. 在右上角，单击 **+ New** 菜单，注意您可以提出问题、运行 SQL 查询和构建仪表板：

    <Image size="sm" img={metabase_03} alt="Metabase 新菜单显示创建问题、SQL 查询和仪表板的选项" border />

3. 例如，这里是对名为 `uk_price_paid` 的表格运行的 SQL 查询，它返回从 1995 年到 2022 年每年的平均价格：

    <Image size="md" img={metabase_04} alt="Metabase SQL 编辑器显示关于 UK price paid 数据的查询" border />

## 5. 提出问题 {#5-ask-a-question}

1. 单击 **+ New** 并选择 **Question**。 注意您可以通过从数据库和表开始构建问题。 例如，以下问题是在 `default` 数据库中名为 `uk_price_paid` 的表上提出的。 这是一个简单的问题，计算曼彻斯特大区内各镇的平均价格：

    <Image size="md" img={metabase_06} alt="Metabase 问题构建器界面与 UK 价格数据" border />

2. 单击 **Visualize** 按钮以查看表格视图中的结果。

    <Image size="md" img={metabase_07} alt="Metabase 可视化显示各镇平均价格的表格结果" border />

3. 在结果下方，单击 **Visualization** 按钮以将可视化更改为柱状图（或其他可用选项）：

    <Image size="md" img={metabase_08} alt="Metabase 饼图可视化显示曼彻斯特各镇的平均价格" border />

## 了解更多 {#learn-more}

通过 <a href="https://www.metabase.com/docs/latest/" target="_blank">访问 Metabase 文档</a> 找到更多关于 Metabase 和如何构建仪表板的信息。

## 相关内容 {#related-content}

- 博客: [使用 ClickHouse 可视化数据 - 第 3 部分 - Metabase](https://clickhouse.com/blog/visualizing-data-with-metabase)
