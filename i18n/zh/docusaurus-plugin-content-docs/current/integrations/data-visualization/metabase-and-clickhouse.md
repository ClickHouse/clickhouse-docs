---
sidebar_label: 'Metabase'
sidebar_position: 131
slug: '/integrations/metabase'
keywords: ['ClickHouse', 'Metabase', 'connect', 'integrate', 'ui']
description: 'Metabase 是一个易于使用的开源 UI 工具，用于询问您的数据。'
---
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import metabase_01 from '@site/static/images/integrations/data-visualization/metabase_01.png';
import metabase_02 from '@site/static/images/integrations/data-visualization/metabase_02.png';
import metabase_03 from '@site/static/images/integrations/data-visualization/metabase_03.png';
import metabase_04 from '@site/static/images/integrations/data-visualization/metabase_04.png';
import metabase_06 from '@site/static/images/integrations/data-visualization/metabase_06.png';
import metabase_07 from '@site/static/images/integrations/data-visualization/metabase_07.png';
import metabase_08 from '@site/static/images/integrations/data-visualization/metabase_08.png';


# 连接 Metabase 到 ClickHouse

Metabase 是一个易于使用的开源 UI 工具，用于询问您的数据。Metabase 是一个 Java 应用程序，您只需 <a href="https://www.metabase.com/start/oss/jar" target="_blank">下载 JAR 文件</a> 并使用 `java -jar metabase.jar` 运行即可。Metabase 使用 JDBC 驱动程序连接到 ClickHouse，您需要下载并将其放入 `plugins` 文件夹中：

## 目标 {#goal}

在本指南中，您将使用 Metabase 对 ClickHouse 数据进行提问并可视化答案。一个答案看起来像这样：

  <img src={metabase_08} class="image" alt="饼图" />
<p/>

:::tip 添加一些数据
如果您没有数据集可以使用，您可以添加一些示例。在本指南中使用的是 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 数据集，因此您可以选择该数据集。在同一文档类别中还有几个其他示例可供查看。
:::

## 1. 收集您的连接详细信息 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 下载 ClickHouse 插件到 Metabase {#2--download-the-clickhouse-plugin-for-metabase}

1. 如果您没有 `plugins` 文件夹，请创建一个作为 `metabase.jar` 保存位置的子文件夹。

2. 插件是一个名为 `clickhouse.metabase-driver.jar` 的 JAR 文件。请访问 <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a> 下载最新版本的 JAR 文件。

3. 将 `clickhouse.metabase-driver.jar` 保存到 `plugins` 文件夹中。

4. 启动（或重启）Metabase，以便驱动程序正确加载。

5. 访问 Metabase，网址为 <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>。在首次启动时，您将看到欢迎屏幕，并需要通过一系列问题。如果提示您选择数据库，请选择“**我稍后添加我的数据**”：

## 3. 将 Metabase 连接到 ClickHouse {#3--connect-metabase-to-clickhouse}

1. 点击右上角的齿轮图标，选择 **Admin Settings** 以访问您的 <a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase 管理页面</a>。

2. 点击 **Add a database**。或者，您可以点击**Databases** 标签并选择 **Add database** 按钮。

3. 如果您的驱动程序安装成功，您将在 **Database type** 的下拉菜单中看到 **ClickHouse**：

    <img src={metabase_01} class="image" alt="添加 ClickHouse 数据库" />

4. 为您的数据库提供一个 **Display name**，这是 Metabase 设置 - 所以可以使用您喜欢的名称。

5. 输入 ClickHouse 数据库的连接详细信息。如果您的 ClickHouse 服务器配置为使用 SSL，则启用安全连接。例如：

    <img src={metabase_02} class="image" style={{width: '80%'}}  alt="连接详细信息" />

6. 点击 **Save** 按钮，Metabase 将扫描您的数据库以查找表。

## 4. 执行 SQL 查询 {#4-run-a-sql-query}

1. 点击右上角的 **Exit admin** 按钮以退出 **Admin settings**。

2. 在右上角，点击 **+ New** 菜单，注意您可以提问、运行 SQL 查询并构建仪表板：

    <img src={metabase_03} class="image" style={{width: 283}} alt="新菜单" />

3. 例如，以下是对名为 `uk_price_paid` 的表运行的 SQL 查询，返回 1995 到 2022 年的平均支付价格：

    <img src={metabase_04} class="image" alt="运行 SQL 查询" />

## 5. 提问 {#5-ask-a-question}

1. 点击 **+ New** 并选择 **Question**。注意，您可以通过从数据库和表开始构建问题。例如，以下问题是针对 `default` 数据库中名为 `uk_price_paid` 的表提问的。这里有一个简单的问题，计算大曼彻斯特县内按城镇的平均价格：

    <img src={metabase_06} class="image" alt="新问题" />

2. 点击 **Visualize** 按钮以在表格视图中查看结果。

    <img src={metabase_07} class="image" alt="新问题" />

3. 在结果下方，点击 **Visualization** 按钮更改可视化为条形图（或其他可用选项）：

    <img src={metabase_08} class="image" alt="饼图可视化" />

## 了解更多 {#learn-more}

通过 <a href="https://www.metabase.com/docs/latest/" target="_blank">访问 Metabase 文档</a>，找到有关 Metabase 及如何构建仪表板的更多信息。

## 相关内容 {#related-content}

- 博客: [使用 ClickHouse 可视化数据 - 第 3 部分 - Metabase](https://clickhouse.com/blog/visualizing-data-with-metabase)
