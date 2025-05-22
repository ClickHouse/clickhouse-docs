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
'description': 'Metabase 是一款易于使用的开源 UI 工具，用于对您的数据进行提问。'
'title': '将 Metabase 连接到 ClickHouse'
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

# 连接 Metabase 到 ClickHouse

<CommunityMaintainedBadge/>

Metabase 是一个易于使用的开源 UI 工具，用于查询您的数据。Metabase 是一个 Java 应用程序，可以通过简单的 <a href="https://www.metabase.com/start/oss/jar" target="_blank">下载 JAR 文件</a> 并使用 `java -jar metabase.jar` 运行。Metabase 使用 JDBC 驱动程序连接到 ClickHouse，您需要下载该驱动程序并放置在 `plugins` 文件夹中：

## 目标 {#goal}

在本指南中，您将使用 Metabase 查询一些 ClickHouse 数据并可视化答案。一个答案将如下所示：

  <Image size="md" img={metabase_08} alt="Metabase 饼图可视化，显示来自 ClickHouse 的数据" border />
<p/>

:::tip 添加一些数据
如果您没有数据集可供使用，可以添加示例之一。本指南使用 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集，因此您可以选择该数据集。在同一文档类别中还可以查看其他几个数据集。
:::

## 1. 收集您的连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 下载 ClickHouse 的 Metabase 插件 {#2--download-the-clickhouse-plugin-for-metabase}

1. 如果您没有 `plugins` 文件夹，请在保存 `metabase.jar` 的文件夹中创建一个子文件夹。

2. 插件是一个名为 `clickhouse.metabase-driver.jar` 的 JAR 文件。请在 <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a> 下载最新版本的 JAR 文件。

3. 将 `clickhouse.metabase-driver.jar` 保存到您的 `plugins` 文件夹中。

4. 启动（或重启）Metabase，以确保驱动程序正确加载。

5. 通过访问 <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a> 来访问 Metabase。在初始启动时，您将看到欢迎屏幕，并需要按照一系列问题进行操作。如果提示选择数据库，请选择 "**稍后添加我的数据**"：

## 3. 连接 Metabase 到 ClickHouse {#3--connect-metabase-to-clickhouse}

1. 点击右上角的齿轮图标，选择 **管理员设置** 以访问您的 <a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase 管理页面</a>。

2. 点击 **添加数据库**。或者，您可以点击 **数据库** 选项卡并选择 **添加数据库** 按钮。

3. 如果您的驱动程序安装成功，您将在 **数据库类型** 的下拉菜单中看到 **ClickHouse**：

    <Image size="md" img={metabase_01} alt="Metabase 数据库选择，显示 ClickHouse 作为选项" border />

4. 给您的数据库一个 **显示名称**，这是一个 Metabase 设置 - 所以可以使用任何您喜欢的名称。

5. 输入您的 ClickHouse 数据库的连接详细信息。如果您的 ClickHouse 服务器配置为使用 SSL，请启用安全连接。例如：

    <Image size="md" img={metabase_02} alt="Metabase 连接详细信息表单，用于 ClickHouse 数据库" border />

6. 点击 **保存** 按钮，Metabase 将扫描您的数据库以查找表。

## 4. 执行 SQL 查询 {#4-run-a-sql-query}

1. 点击右上角的 **退出管理员** 按钮，退出 **管理员设置**。

2. 在右上角，点击 **+ 新建** 菜单，注意您可以提出问题、运行 SQL 查询，并构建仪表板：

    <Image size="sm" img={metabase_03} alt="Metabase 新建菜单，显示创建问题、SQL 查询和仪表板的选项" border />

3. 例如，以下是针对名为 `uk_price_paid` 的表运行的 SQL 查询，它返回 1995 年到 2022 年按年份计算的平均价格：

    <Image size="md" img={metabase_04} alt="Metabase SQL 编辑器，显示对英国价格支付数据的查询" border />

## 5. 提出问题 {#5-ask-a-question}

1. 点击 **+ 新建** 并选择 **问题**。请注意，您可以通过从数据库和表开始来构建问题。例如，以下问题针对 `default` 数据库中名为 `uk_price_paid` 的表。这里是一个计算大曼彻斯特郡各城镇平均价格的简单问题：

    <Image size="md" img={metabase_06} alt="Metabase 问题构建器界面，显示英国价格数据" border />

2. 点击 **可视化** 按钮查看结果的表格视图。

    <Image size="md" img={metabase_07} alt="Metabase 可视化，显示各城镇平均价格的表格结果" border />

3. 在结果下方，点击 **可视化** 按钮，将可视化更改为条形图（或可用的其他选项）：

    <Image size="md" img={metabase_08} alt="Metabase 饼图可视化，显示大曼彻斯特郡各城镇的平均价格" border />

## 了解更多 {#learn-more}

通过 <a href="https://www.metabase.com/docs/latest/" target="_blank">访问 Metabase 文档</a> 来获取有关 Metabase 和如何构建仪表板的更多信息。

## 相关内容 {#related-content}

- 博客: [使用 ClickHouse 可视化数据 - 第 3 部分 - Metabase](https://clickhouse.com/blog/visualizing-data-with-metabase)
