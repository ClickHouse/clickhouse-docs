---
sidebar_label: 'Tableau Desktop'
sidebar_position: 1
slug: /integrations/tableau
keywords: ['clickhouse', 'tableau', 'connect', 'integrate', 'ui']
description: 'Tableau 可以将 ClickHouse 数据库和数据表作为数据源使用。'
title: '将 Tableau 连接至 ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc'
---

import TOCInline from '@theme/TOCInline';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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


# 将 Tableau 连接到 ClickHouse

<ClickHouseSupportedBadge/>

ClickHouse 提供了官方的 Tableau 连接器，并已发布在
[Tableau Exchange](https://exchange.tableau.com/products/1064) 上。
该连接器基于 ClickHouse 的高级 [JDBC 驱动程序](/integrations/language-clients/java/jdbc)。

通过该连接器，Tableau 可以将 ClickHouse 中的数据库和数据表集成为数据源。要启用此功能，
请按照以下设置指南进行操作。

<TOCInline toc={toc}/>



## 使用前的必要设置 {#setup-required-prior-usage}

1. 收集您的连接详细信息

   <ConnectionDetails />

2. 下载并安装 <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   desktop</a>。
3. 按照 `clickhouse-tableau-connector-jdbc` 说明下载兼容版本的 <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBC 驱动程序</a>。

:::note
请确保下载 [clickhouse-jdbc-X.X.X-all-dependencies.jar](https://github.com/ClickHouse/clickhouse-java/releases) JAR 文件。该构件从版本 `0.9.2` 开始提供。
:::

4. 将 JDBC 驱动程序存储到以下文件夹中(根据您的操作系统,如果文件夹不存在,可以手动创建):
   - macOS: `~/Library/Tableau/Drivers`
   - Windows: `C:\Program Files\Tableau\Drivers`
5. 在 Tableau 中配置 ClickHouse 数据源,即可开始构建数据可视化!


## 在 Tableau 中配置 ClickHouse 数据源 {#configure-a-clickhouse-data-source-in-tableau}

现在您已经安装并配置了 `clickhouse-jdbc` 驱动程序,接下来我们将介绍如何在 Tableau 中定义一个连接到 ClickHouse 中 **TPCD** 数据库的数据源。

1. 启动 Tableau。(如果已经在运行,请重新启动。)

2. 从左侧菜单中,点击 **连接到服务器** 部分下的 **更多**。在可用连接器列表中搜索 **ClickHouse by ClickHouse**:

<Image
  size='md'
  img={tableau_connecttoserver}
  alt='Tableau 连接屏幕显示连接器选择菜单,其中 ClickHouse by ClickHouse 选项已高亮显示'
  border
/>
<br />

:::note
在连接器列表中没有看到 **ClickHouse by ClickHouse** 连接器?这可能与 Tableau Desktop 版本过旧有关。
要解决此问题,请考虑升级您的 Tableau Desktop 应用程序,或[手动安装连接器](#install-the-connector-manually)。
:::

3. 点击 **ClickHouse by ClickHouse**,将弹出以下对话框:

<Image
  size='md'
  img={tableau_connector_details}
  alt='Tableau 连接器安装对话框显示 ClickHouse JDBC 连接器详细信息和安装按钮'
  border
/>
<br />
4. 点击 **安装并重启 Tableau**。重启应用程序。5. 重启后,连接器将显示其完整名称:`ClickHouse JDBC by ClickHouse, Inc.`。点击它时,将弹出以下对话框:

<Image
  size='md'
  img={tableau_connector_dialog}
  alt='Tableau 中的 ClickHouse 连接对话框显示服务器、端口、数据库、用户名和密码字段'
  border
/>
<br />

6. 输入您的连接详细信息:

   | 设置     | 值                                                    |
   | -------- | ----------------------------------------------------- |
   | Server   | **您的 ClickHouse 主机地址(不带前缀或后缀)**          |
   | Port     | **8443**                                              |
   | Database | **default**                                           |
   | Username | **default**                                           |
   | Password | \*\*\*\*\*\*                                          |

:::note
使用 ClickHouse Cloud 时,需要启用 SSL 复选框以建立安全连接。
:::

<br />

:::note
我们的 ClickHouse 数据库名为 **TPCD**,但您必须在上面的对话框中将 **Database** 设置为 **default**,然后在下一步中为 **Schema** 选择 **TPCD**。(这可能是由于连接器中的一个缺陷导致的,因此此行为可能会改变,但目前您必须使用 **default** 作为数据库。)
:::

7. 点击 **登录** 按钮,您应该会看到一个新的 Tableau 工作簿:

<Image
  size='md'
  img={tableau_newworkbook}
  alt='新的 Tableau 工作簿显示初始连接屏幕和数据库选择选项'
  border
/>
<br />

8. 从 **Schema** 下拉菜单中选择 **TPCD**,您应该会看到 **TPCD** 中的表列表:

<Image
  size='md'
  img={tableau_tpcdschema}
  alt='Tableau 模式选择显示 TPCD 数据库表,包括 CUSTOMER、LINEITEM、NATION、ORDERS 等'
  border
/>
<br />

现在您已准备好在 Tableau 中构建可视化图表了!


## 在 Tableau 中构建可视化 {#building-visualizations-in-tableau}

现在我们已经在 Tableau 中配置了 ClickHouse 数据源,接下来让我们对数据进行可视化...

1. 将 **CUSTOMER** 表拖到工作簿中。注意列标题会显示出来,但数据表是空的:

<Image
  size='md'
  img={tableau_workbook1}
  alt='Tableau 工作簿,CUSTOMER 表已拖到画布上,显示列标题但没有数据'
  border
/>
<br />

2. 点击 **Update Now** 按钮,**CUSTOMER** 表中的 100 行数据将填充到表中。

3. 将 **ORDERS** 表拖到工作簿中,然后将 **Custkey** 设置为两个表之间的关联字段:

<Image
  size='md'
  img={tableau_workbook2}
  alt='Tableau 关系编辑器,显示使用 Custkey 字段连接 CUSTOMER 和 ORDERS 表'
  border
/>
<br />

4. 现在您已经将 **ORDERS** 和 **LINEITEM** 表相互关联作为数据源,因此可以使用此关系来分析数据。选择工作簿底部的 **Sheet 1** 选项卡。

<Image
  size='md'
  img={tableau_workbook3}
  alt='Tableau 工作表,显示可用于分析的 ClickHouse 表中的维度和度量'
  border
/>
<br />

5. 假设您想知道每年订购了多少特定商品。将 **ORDERS** 中的 **OrderDate** 拖到 **Columns** 部分(水平字段),然后将 **LINEITEM** 中的 **Quantity** 拖到 **Rows**。Tableau 将生成以下折线图:

<Image
  size='sm'
  img={tableau_workbook4}
  alt='Tableau 折线图,显示从 ClickHouse 数据按年份统计的订购数量'
  border
/>
<br />

这不是一个非常有趣的折线图,但该数据集是由脚本生成的,用于测试查询性能,因此您会注意到 TCPD 数据的模拟订单中没有太多变化。

6. 假设您想知道按季度和运输方式(空运、邮寄、海运、卡车等)统计的平均订单金额(以美元计):
   - 点击 **New Worksheet** 选项卡创建新工作表
   - 将 **ORDERS** 中的 **OrderDate** 拖到 **Columns** 并将其从 **Year** 更改为 **Quarter**
   - 将 **LINEITEM** 中的 **Shipmode** 拖到 **Rows**

您应该看到以下内容:

<Image
  size='sm'
  img={tableau_workbook5}
  alt='Tableau 交叉表视图,季度作为列,运输方式作为行'
  border
/>
<br />

7. **Abc** 值只是占位符,直到您将度量拖到表上。将 **ORDERS** 中的 **Totalprice** 拖到表上。注意默认计算是对 **Totalprices** 求 **SUM**:

<Image
  size='md'
  img={tableau_workbook6}
  alt='Tableau 交叉表,显示按季度和运输方式统计的总价格总和'
  border
/>
<br />

8. 点击 **SUM** 并将 **Measure** 更改为 **Average**。从同一下拉菜单中,选择 **Format** 将 **Numbers** 更改为 **Currency (Standard)**:

<Image
  size='md'
  img={tableau_workbook7}
  alt='Tableau 交叉表,显示按季度和运输方式统计的平均订单价格,带有货币格式'
  border
/>
<br />

做得好!您已成功将 Tableau 连接到 ClickHouse,并为分析和可视化 ClickHouse 数据开启了无限可能。


## 手动安装连接器 {#install-the-connector-manually}

如果您使用的 Tableau Desktop 版本较旧,默认不包含该连接器,您可以按照以下步骤手动安装:

1. 从 [Tableau Exchange](https://exchange.tableau.com/products/1064) 下载最新的 taco 文件
2. 将 taco 文件放置在
   - macOS: `~/Documents/My Tableau Repository/Connectors`
   - Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. 重启 Tableau Desktop,如果设置成功,您将在 `新建数据源` 部分看到该连接器。


## 连接和分析提示 {#connection-and-analysis-tips}

如需获取更多关于优化 Tableau-ClickHouse 集成的指导,
请访问[连接提示](/integrations/tableau/connection-tips)和[分析提示](/integrations/tableau/analysis-tips)。


## 测试 {#tests}

该连接器通过 [TDVT 框架](https://tableau.github.io/connector-plugin-sdk/docs/tdvt)进行测试,目前测试覆盖率达到 97%。


## 概述 {#summary}

您可以使用通用的 ODBC/JDBC ClickHouse 驱动程序将 Tableau 连接到 ClickHouse。不过,本连接器简化了连接设置过程。如果您在使用连接器时遇到任何问题,欢迎在 <a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a> 上反馈。
