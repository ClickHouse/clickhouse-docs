---
sidebar_label: 'Tableau Desktop'
sidebar_position: 1
slug: /integrations/tableau
keywords: ['clickhouse', 'tableau', 'connect', 'integrate', 'ui']
description: 'Tableau 可以将 ClickHouse 数据库和数据表用作数据源。'
title: '将 Tableau 连接到 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc'
---

import TOCInline from '@theme/TOCInline';
import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import tableau_connecttoserver from '@site/static/images/integrations/data-visualization/tableau_connecttoserver.png';
import tableau_connector_details from '@site/static/images/integrations/data-visualization/tableau_connector_details.png';
import tableau_connector_dialog from '@site/static/images/integrations/data-visualization/tableau_connector_dialog.png';
import tableau_newworkbook from '@site/static/images/integrations/data-visualization/tableau_newworkbook.png';
import tableau_tpcdschema from '@site/static/images/integrations/data-visualization/tableau_tpcdschema.png';
import tableau_workbook1 from '@site/static/images/integrations/data-visualization/tableau_workbook1.png';
import tableau_workbook2 from '@site/static/images/integrations/data-visualization/tableau_workbook2.png';
import tableau_workbook3 from '@site/static/images/integrations/data-visualization/tableau_workbook3.png';
import tableau_workbook4 from '@site/static/images/integrations/data-visualization/tableau_workbook4.png';
import tableau_workbook5 from '@site/static/images/integrations/data-visualization/tableau_workbook5.png';
import tableau_workbook6 from '@site/static/images/integrations/data-visualization/tableau_workbook6.png';
import tableau_workbook7 from '@site/static/images/integrations/data-visualization/tableau_workbook7.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';

# 将 Tableau 连接到 ClickHouse {#connecting-tableau-to-clickhouse}

<ClickHouseSupportedBadge/>

ClickHouse 提供了官方 Tableau 连接器，该连接器已发布在
[Tableau Exchange](https://exchange.tableau.com/products/1064) 上。
该连接器基于 ClickHouse 的高级 [JDBC 驱动程序](/integrations/language-clients/java/jdbc)。

使用该连接器后，Tableau 可以将 ClickHouse 的数据库和表集成为数据源。要启用此功能，
请按照下面的设置指南进行操作。

<TOCInline toc={toc}/>

## 使用前的准备工作 {#setup-required-prior-usage}

1. 收集连接详情
   <ConnectionDetails />

2. 下载并安装  <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   Desktop</a>。
3. 按照 `clickhouse-tableau-connector-jdbc` 中的说明，下载兼容版本的
   <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBC 驱动</a>。

:::note
请确保下载 [clickhouse-jdbc-X.X.X-all-dependencies.jar](https://github.com/ClickHouse/clickhouse-java/releases) JAR 文件。该 JAR 包从 `0.9.2` 版本开始提供。
:::

4. 将 JDBC 驱动存放在以下文件夹中（根据你的操作系统选择；如果文件夹不存在，可以自行创建）：
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. 在 Tableau 中配置 ClickHouse 数据源，并开始构建数据可视化报表！

## 在 Tableau 中配置 ClickHouse 数据源 {#configure-a-clickhouse-data-source-in-tableau}

现在你已经安装并设置好了 `clickhouse-jdbc` 驱动，接下来将介绍如何在 Tableau 中定义一个数据源，用于连接 ClickHouse 中的 **TPCD** 数据库。

1. 启动 Tableau。（如果已经在运行，请先重启。）

2. 在左侧菜单的 **To a Server** 部分下点击 **More**。在可用连接器列表中搜索 **ClickHouse by ClickHouse**：

<Image size="md" img={tableau_connecttoserver} alt="Tableau 连接界面，展示带有高亮 ClickHouse by ClickHouse 选项的连接器选择菜单" border />
<br/>

:::note
在连接器列表中没有看到 **ClickHouse by ClickHouse** 吗？这可能与使用了较旧版本的 Tableau Desktop 有关。
要解决该问题，请考虑升级你的 Tableau Desktop 应用，或者[手动安装连接器](#install-the-connector-manually)。
:::

3. 点击 **ClickHouse by ClickHouse**，随后会弹出如下对话框：

<Image size="md" img={tableau_connector_details} alt="Tableau 连接器安装对话框，展示 ClickHouse JDBC 连接器详情和安装按钮" border />
<br/>
 
4. 点击 **Install and Restart Tableau**。重启应用程序。
5. 重启后，连接器会显示其完整名称：`ClickHouse JDBC by ClickHouse, Inc.`。点击它后，会弹出如下对话框：

<Image size="md" img={tableau_connector_dialog} alt="Tableau 中的 ClickHouse 连接对话框，展示 server、port、database、username 和 password 等字段" border />
<br/>

6. 输入你的连接设置：

    | 设置  | 值                                                         |
    | ----------- |--------------------------------------------------------|
    | Server      | **你的 ClickHouse 主机地址（不带任何前缀或后缀）**     |
    | Port   | **8443**                                               |
    | Database | **default**                                            |
    | Username | **default**                                            |
    | Password | *\*****                                                |

:::note
在使用 ClickHouse Cloud 时，必须勾选 SSL 复选框以启用安全连接。
:::
<br/>

:::note
我们的 ClickHouse 数据库名为 **TPCD**，但你必须在上面的对话框中将 **Database** 设置为 **default**，然后在下一步中为 **Schema** 选择 **TPCD**。（这很可能是连接器中的一个 bug，未来行为可能会改变，但目前你必须将 **default** 用作数据库。）
:::

7. 点击 **Sign In** 按钮，你应当会看到一个新的 Tableau 工作簿：

<Image size="md" img={tableau_newworkbook} alt="新的 Tableau 工作簿，展示包含数据库选择选项的初始连接界面" border />
<br/>

8. 从 **Schema** 下拉列表中选择 **TPCD**，你应当会看到 **TPCD** 中的表列表：

<Image size="md" img={tableau_tpcdschema} alt="Tableau 中的 schema 选择界面，展示 TPCD 数据库表，包括 CUSTOMER、LINEITEM、NATION、ORDERS 等" border />
<br/>

现在你已经可以在 Tableau 中开始构建可视化报表了！

## 在 Tableau 中构建可视化 {#building-visualizations-in-tableau}

现在我们已经在 Tableau 中配置好了 ClickHouse 数据源，接下来就可以对这些数据进行可视化……

1. 将 **CUSTOMER** 表拖到工作簿中。注意列已经显示出来，但数据表仍然是空的：

<Image size="md" img={tableau_workbook1} alt="Tableau 工作簿中将 CUSTOMER 表拖到画布后，只显示列标题但没有数据" border />
<br/>

2. 点击 **Update Now** 按钮，来自 **CUSTOMER** 的 100 行数据就会填充到表中。

3. 将 **ORDERS** 表拖入工作簿，然后将 **Custkey** 设置为两个表之间的关联字段：

<Image size="md" img={tableau_workbook2} alt="Tableau 关系编辑器，显示 CUSTOMER 和 ORDERS 两个表通过 Custkey 字段建立连接" border />
<br/>

4. 现在您已经将 **ORDERS** 和 **LINEITEM** 表彼此关联作为您的数据源，因此可以利用
   这一关系来回答关于数据的问题。选择工作簿底部的 **Sheet 1** 选项卡。

<Image size="md" img={tableau_workbook3} alt="Tableau 工作表，显示可用于分析的来自 ClickHouse 表的维度和度量" border />
<br/>

5. 假设您想知道每年订购了多少某个具体商品。将 **ORDERS** 中的 **OrderDate** 拖到
   **Columns** 区域（水平字段），然后将 **LINEITEM** 中的 **Quantity** 拖到 **Rows**。Tableau 会
   生成如下折线图：

<Image size="sm" img={tableau_workbook4} alt="Tableau 折线图，展示按年份统计的订购数量（来源于 ClickHouse 数据）" border />
<br/>

这个折线图并不算精彩，因为数据集是通过脚本生成的，主要用于测试查询性能，所以
您会注意到在模拟的 TCPD 订单数据中，变化并不多。

6. 假设您想知道按季度以及按运输方式（航空、邮件、轮船、
   卡车等）划分的平均订单金额（美元）：

    - 点击 **New Worksheet** 选项卡创建一个新工作表
    - 将 **ORDERS** 中的 **OrderDate** 拖到 **Columns**，并将其从 **Year** 修改为 **Quarter**
    - 将 **LINEITEM** 中的 **Shipmode** 拖到 **Rows**

您应该会看到如下内容：

<Image size="sm" img={tableau_workbook5} alt="Tableau 交叉表视图，列为季度，行为运输方式" border />
<br/>

7. **Abc** 值只是占位符，用来填充空间，直到您将某个度量拖到表中。将 **Totalprice** 从 *
   *ORDERS** 拖到表格上。注意默认计算方式是对 **Totalprices** 求 **SUM**：

<Image size="md" img={tableau_workbook6} alt="Tableau 交叉表，展示按季度和运输方式汇总的总价之和" border />
<br/>

8. 点击 **SUM**，将 **Measure** 修改为 **Average**。在同一个下拉菜单中选择 **Format**，将
   **Numbers** 设置为 **Currency (Standard)**：

<Image size="md" img={tableau_workbook7} alt="Tableau 交叉表，展示按季度和运输方式统计的平均订单价格，并采用货币格式显示" border />
<br/>

恭喜！您已经成功将 Tableau 连接到了 ClickHouse，并为分析和可视化您的 ClickHouse 数据
打开了无限可能。

## 手动安装连接器 {#install-the-connector-manually}

如果你使用的是未默认包含该连接器的旧版本 Tableau Desktop，可以按照以下步骤手动安装：

1. 从 [Tableau Exchange](https://exchange.tableau.com/products/1064) 下载最新的 taco 文件
2. 将 taco 文件放置到以下路径：
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. 重启 Tableau Desktop，如果安装成功，你会在 `New Data Source` 部分看到该连接器。

## 连接和分析技巧 {#connection-and-analysis-tips}

如需获取有关优化 Tableau-ClickHouse 集成的更多指导，
请访问[连接技巧](/integrations/tableau/connection-tips)和[分析技巧](/integrations/tableau/analysis-tips)。

## 测试 {#tests}
该连接器正在使用 [TDVT 框架](https://tableau.github.io/connector-plugin-sdk/docs/tdvt) 进行测试，目前测试覆盖率为 97%。

## 摘要 {#summary}
可以使用通用的 ClickHouse ODBC/JDBC 驱动将 Tableau 连接到 ClickHouse。不过，本连接器可以简化连接配置过程。如果在使用该连接器时遇到任何问题，欢迎前往 <a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a> 反馈。
