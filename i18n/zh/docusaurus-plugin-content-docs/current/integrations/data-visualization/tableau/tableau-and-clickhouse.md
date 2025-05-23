---
'sidebar_label': 'Tableau Desktop'
'sidebar_position': 1
'slug': '/integrations/tableau'
'keywords':
- 'clickhouse'
- 'tableau'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Tableau 可以将 ClickHouse 数据库和表作为数据源。'
'title': '将 Tableau 连接到 ClickHouse'
---

import TOCInline from '@theme/TOCInline';
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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


# 连接 Tableau 到 ClickHouse

ClickHouse 提供了一个官方的 Tableau 连接器，附有在
[Tableau Exchange](https://exchange.tableau.com/products/1064) 上的展示。
该连接器基于 ClickHouse 的高级 [JDBC 驱动](/integrations/language-clients/java/jdbc)。

使用此连接器，Tableau 将 ClickHouse 数据库和表作为数据源集成。要启用此功能，
请按照以下设置指南进行操作。

<TOCInline toc={toc}/>

## 使用前所需的设置 {#setup-required-prior-usage}

1. 收集您的连接详情
   <ConnectionDetails />

2. 下载并安装 <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   desktop</a>。
3. 按照 `clickhouse-tableau-connector-jdbc` 的说明下载兼容版本的
   <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBC 驱动</a>。

:::note
确保您下载 **clickhouse-jdbc-x.x.x-shaded-all.jar** JAR 文件。目前，我们建议使用版本 `0.8.X`。
:::

4. 将 JDBC 驱动存储在以下文件夹中（根据您的操作系统，如果文件夹不存在，您可以创建它）：
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. 在 Tableau 中配置 ClickHouse 数据源，并开始构建数据可视化！

## 在 Tableau 中配置 ClickHouse 数据源 {#configure-a-clickhouse-data-source-in-tableau}

现在您已经安装并设置了 `clickhouse-jdbc` 驱动，接下来我们看看如何定义一个
连接 ClickHouse 中 **TPCD** 数据库的数据源。

1. 启动 Tableau。（如果您已经运行它，则重新启动。）

2. 从左侧菜单中，在 **到服务器** 部分下单击 **更多**。在可用连接器列表中搜索 **ClickHouse by ClickHouse**：

<Image size="md" img={tableau_connecttoserver} alt="Tableau connection screen showing the connector selection menu with ClickHouse by ClickHouse option highlighted" border />
<br/>

:::note
在您的连接器列表中看不到 **ClickHouse by ClickHouse** 连接器？这可能与您的 Tableau Desktop 版本过旧有关。
要解决此问题，考虑升级您的 Tableau Desktop 应用程序，或 [手动安装连接器](#install-the-connector-manually)。
:::

3. 单击 **ClickHouse by ClickHouse**，随后将弹出以下对话框：

<Image size="md" img={tableau_connector_details} alt="Tableau connector installation dialog showing ClickHouse JDBC connector details and install button" border />
<br/>

4. 单击 **安装并重新启动 Tableau**。重新启动该应用程序。
5. 重新启动后，连接器将显示其完整名称：`ClickHouse JDBC by ClickHouse, Inc.`。点击它后将弹出以下对话框：

<Image size="md" img={tableau_connector_dialog} alt="ClickHouse connection dialog in Tableau showing fields for server, port, database, username and password" border />
<br/>

6. 输入您的连接详情：

    | 设置  | 值                                                  |
    | ----------- |--------------------------------------------------------|
    | 服务器      | **您的 ClickHouse 主机（无前缀或后缀）**               |
    | 端口   | **8443**                                               |
    | 数据库 | **default**                                            |
    | 用户名 | **default**                                            |
    | 密码 | *\*****                                                |

:::note
在使用 ClickHouse Cloud 时，必须为安全连接启用 SSL 复选框。
:::
<br/>

:::note
我们的 ClickHouse 数据库名为 **TPCD**，但您必须在上述对话框中将 **数据库** 设置为 **default**，然后
在下一步中选择 **TPCD** 作为 **架构**。 （这可能是连接器中的一个错误，因此此行为可能会改变，但目前您必须将数据库设置为 **default**。）
:::

7. 单击 **登录** 按钮，您应该会看到一个新的 Tableau 工作簿：

<Image size="md" img={tableau_newworkbook} alt="New Tableau workbook showing the initial connection screen with database selection options" border />
<br/>

8. 从 **架构** 下拉菜单中选择 **TPCD**，您应该会看到 **TPCD** 中的表列表：

<Image size="md" img={tableau_tpcdschema} alt="Tableau schema selection showing TPCD database tables including CUSTOMER, LINEITEM, NATION, ORDERS, and others" border />
<br/>

您现在可以开始在 Tableau 中构建可视化内容！

## 在 Tableau 中构建可视化 {#building-visualizations-in-tableau}

现在您已在 Tableau 中配置了 ClickHouse 数据源，让我们来可视化这些数据...

1. 将 **CUSTOMER** 表拖到工作簿中。请注意，列出现，但数据表为空：

<Image size="md" img={tableau_workbook1} alt="Tableau workbook with CUSTOMER table dragged to canvas showing column headers but no data" border />
<br/>

2. 单击 **立即更新** 按钮，**CUSTOMER** 中的 100 行将填充到表中。

3. 将 **ORDERS** 表拖入工作簿，然后将 **Custkey** 设置为两个表之间的关系字段：

<Image size="md" img={tableau_workbook2} alt="Tableau relationship editor showing connection between CUSTOMER and ORDERS tables using Custkey field" border />
<br/>

4. 现在您有了相互关联的 **ORDERS** 和 **LINEITEM** 表作为您的数据源，因此您可以利用
   这种关系来回答有关数据的问题。选择工作簿底部的 **Sheet 1** 标签。

<Image size="md" img={tableau_workbook3} alt="Tableau worksheet showing the dimensions and measures from ClickHouse tables available for analysis" border />
<br/>

5. 假设您想知道每年订购了多少特定商品。将 **OrderDate** 从 **ORDERS** 拖到
   **列** 部分（水平字段），然后将 **Quantity** 从 **LINEITEM** 拖到 **行**。Tableau 将生成以下折线图：

<Image size="sm" img={tableau_workbook4} alt="Tableau line chart showing quantity ordered by year from ClickHouse data" border />
<br/>

虽然这不是一个很激动人心的折线图，但数据集是通过脚本生成的，构建用于测试查询性能，因此
您会注意到 TCPD 数据的模拟订单变化不大。

6. 假设您想知道按季度以及按运输方式（航空、邮件、船舶、
   卡车等）的平均订单金额（以美元为单位）：

    - 单击 **新工作表** 标签以创建新工作表
    - 将 **OrderDate** 从 **ORDERS** 拖入 **列**，并将其从 **年** 更改为 **季度**
    - 将 **Shipmode** 从 **LINEITEM** 拖入 **行**

您应该看到以下内容：

<Image size="sm" img={tableau_workbook5} alt="Tableau crosstab view with quarters as columns and shipment modes as rows" border />
<br/>

7. **Abc** 值只是填充空间，直到您将一个度量拖到表中。将 **Totalprice** 从
   **ORDERS** 拖到表中。请注意，默认计算为 **SUM** **Totalprices**：

<Image size="md" img={tableau_workbook6} alt="Tableau crosstab showing sum of total price by quarter and shipment mode" border />
<br/>

8. 单击 **SUM** 并将 **度量** 更改为 **平均值**。从同一下拉菜单中，选择 **格式** 将
   **数字** 更改为 **货币（标准）**：

<Image size="md" img={tableau_workbook7} alt="Tableau crosstab showing average order price by quarter and shipment mode with currency formatting" border />
<br/>

做得好！您已经成功将 Tableau 连接到 ClickHouse，并为分析和可视化您的 ClickHouse 数据打开了一个全新的可能性。

## 手动安装连接器 {#install-the-connector-manually}

如果您使用的 Tableau Desktop 版本已过期，且默认情况下不包括连接器，您可以通过以下步骤手动安装：

1. 从 [Tableau Exchange](https://exchange.tableau.com/products/1064) 下载最新的 taco 文件
2. 将 taco 文件放置在
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows 用户]\Documents\My Tableau Repository\Connectors`
3. 重新启动 Tableau Desktop，如果您的设置顺利完成，您将在 `新数据源` 部分下看到该连接器。

## 连接和分析提示 {#connection-and-analysis-tips}

有关优化您的 Tableau-ClickHouse 集成的更多指导，请访问 [连接提示](/integrations/tableau/connection-tips) 和 [分析提示](/integrations/tableau/analysis-tips)。

## 测试 {#tests}
该连接器正在使用 [TDVT 框架](https://tableau.github.io/connector-plugin-sdk/docs/tdvt) 测试，目前保持 97% 的覆盖率。

## 总结 {#summary}
您可以使用通用的 ODBC/JDBC ClickHouse 驱动连接 Tableau 到 ClickHouse。 However, this
connector streamlines the connection setup process. 如果您在使用连接器时遇到任何问题，请随时在 <a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a> 上联系我们。
