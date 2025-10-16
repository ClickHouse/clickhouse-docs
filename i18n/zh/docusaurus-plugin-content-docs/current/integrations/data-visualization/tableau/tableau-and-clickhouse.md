---
'sidebar_label': 'Tableau 桌面'
'sidebar_position': 1
'slug': '/integrations/tableau'
'keywords':
- 'clickhouse'
- 'tableau'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Tableau 可以将 ClickHouse 数据库和表作为数据源。'
'title': '连接 Tableau 到 ClickHouse'
'doc_type': 'guide'
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


# 连接 Tableau 到 ClickHouse

ClickHouse 提供了一个官方的 Tableau 连接器， featured on
the [Tableau Exchange](https://exchange.tableau.com/products/1064)。
该连接器基于 ClickHouse 的高级 [JDBC driver](/integrations/language-clients/java/jdbc)。

通过这个连接器，Tableau 可以将 ClickHouse 数据库和表作为数据源进行集成。要启用此功能，请遵循下面的设置指南。

<TOCInline toc={toc}/>

## 使用前所需的设置 {#setup-required-prior-usage}

1. 收集您的连接详细信息
   <ConnectionDetails />

2. 下载并安装 <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   desktop</a>。
3. 按照 `clickhouse-tableau-connector-jdbc` 的说明下载兼容版本的
   <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBC driver</a>。

:::note
确保您下载 [clickhouse-jdbc-X.X.X-all-dependencies.jar](https://github.com/ClickHouse/clickhouse-java/releases) JAR 文件。此工件从版本 `0.9.2` 开始可用。
:::

4. 将 JDBC 驱动程序存储在以下文件夹中（根据您的操作系统，如果文件夹不存在，您可以创建它）：
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. 在 Tableau 中配置一个 ClickHouse 数据源并开始构建数据可视化！

## 在 Tableau 中配置 ClickHouse 数据源 {#configure-a-clickhouse-data-source-in-tableau}

现在您已安装并设置了 `clickhouse-jdbc` 驱动程序，让我们来看一下如何在 Tableau 中定义一个连接到 ClickHouse 中 **TPCD** 数据库的数据源。

1. 启动 Tableau。（如果您已经在运行它，请重新启动。）

2. 从左侧菜单中，点击 **To a Server** 部分下的 **More**。在可用连接器列表中搜索 **ClickHouse by ClickHouse**：

<Image size="md" img={tableau_connecttoserver} alt="Tableau 连接屏幕显示连接器选择菜单，并突出显示 ClickHouse by ClickHouse 选项" border />
<br/>

:::note
在您的连接器列表中没有看到 **ClickHouse by ClickHouse** 连接器？这可能与旧版本的 Tableau Desktop 有关。
为了解决此问题，请考虑升级您的 Tableau Desktop 应用程序，或者 [手动安装连接器](#install-the-connector-manually)。
:::

3. 点击 **ClickHouse by ClickHouse**，将会弹出以下对话框：

<Image size="md" img={tableau_connector_details} alt="Tableau 连接器安装对话框显示 ClickHouse JDBC 连接器详细信息和安装按钮" border />
<br/>
 
4. 点击 **Install and Restart Tableau**。重启应用程序。
5. 重新启动后，连接器将以其全名出现：`ClickHouse JDBC by ClickHouse, Inc.`。点击它，弹出以下对话框：

<Image size="md" img={tableau_connector_dialog} alt="Tableau 中的 ClickHouse 连接对话框显示服务器、端口、数据库、用户名和密码字段" border />
<br/>

6. 输入您的连接详细信息：

    | 设置  | 值                                                  |
    | ------- |--------------------------------------------------------|
    | 服务器      | **您的 ClickHouse 主机（无前缀或后缀）**           |
    | 端口   | **8443**                                               |
    | 数据库 | **default**                                            |
    | 用户名 | **default**                                            |
    | 密码 | *\*****                                                |

:::note
在使用 ClickHouse 云时，必须勾选 SSL 复选框以启用安全连接。
:::
<br/>

:::note
我们的 ClickHouse 数据库名为 **TPCD**，但您必须在上面的对话框中将 **Database** 设置为 **default**，然后在下一步中选择 **TPCD** 作为 **Schema**。 （这可能是连接器中的一个错误，因此这种行为可能会有所改变，但当前您必须将 **default** 用作数据库。）
:::

7. 点击 **Sign In** 按钮，您应该会看到一个新的 Tableau 工作簿：

<Image size="md" img={tableau_newworkbook} alt="新的 Tableau 工作簿显示初始连接屏幕及数据库选择选项" border />
<br/>

8. 从 **Schema** 下拉菜单中选择 **TPCD**，您应该会看到 **TPCD** 中的表列表：

<Image size="md" img={tableau_tpcdschema} alt="Tableau 模式选择显示 TPCD 数据库中的表，包括 CUSTOMER、LINEITEM、NATION、ORDERS 等" border />
<br/>

您现在可以在 Tableau 中构建一些可视化了！

## 在 Tableau 中构建可视化 {#building-visualizations-in-tableau}

现在我们在 Tableau 中配置了 ClickHouse 数据源，让我们可视化数据...

1. 将 **CUSTOMER** 表拖到工作簿中。注意列出现，但数据表是空的：

<Image size="md" img={tableau_workbook1} alt="Tableau 工作簿中拖动 CUSTOMER 表到画布上显示列标题但没有数据" border />
<br/>

2. 点击 **Update Now** 按钮，**CUSTOMER** 中的 100 行将填充到表格中。

3. 将 **ORDERS** 表拖入工作簿，然后设置 **Custkey** 作为两个表之间的关系字段：

<Image size="md" img={tableau_workbook2} alt="Tableau 关系编辑器显示 CUSTOMER 和 ORDERS 表之间使用 Custkey 字段的连接" border />
<br/>

4. 现在您已经将 **ORDERS** 和 **LINEITEM** 表关联为数据源，因此您可以利用此关系回答有关数据的问题。选择工作簿底部的 **Sheet 1** 选项卡。

<Image size="md" img={tableau_workbook3} alt="Tableau 工作表显示来自 ClickHouse 表的可用于分析的维度和度量" border />
<br/>

5. 假设您想知道每年订购了多少特定商品。将 **OrderDate** 从 **ORDERS** 拖动到 **Columns** 区域（水平字段），然后将 **Quantity** 从 **LINEITEM** 拖到 **Rows**。Tableau 将生成以下折线图：

<Image size="sm" img={tableau_workbook4} alt="Tableau 折线图显示来自 ClickHouse 数据按年订购的数量" border />
<br/>

这不是一张很精彩的折线图，但该数据集是通过脚本生成的，旨在测试查询性能，因此您会注意到 TCPD 数据的模拟订单变化不大。

6. 假设您想知道按季度及运输方式（空运、邮件、船运、卡车等）计算的平均订单金额（美元）：

    - 点击 **New Worksheet** 选项卡创建新表
    - 将 **OrderDate** 从 **ORDERS** 拖入 **Columns**，并将其从 **Year** 更改为 **Quarter**
    - 将 **Shipmode** 从 **LINEITEM** 拖入 **Rows**

您应该会看到以下内容：

<Image size="sm" img={tableau_workbook5} alt="Tableau 交叉表视图，季度作为列，运输模式作为行" border />
<br/>

7. **Abc** 值只是填充空间，直到您拖动度量到表格上。将 **Totalprice** 从 **ORDERS** 拖到表中。请注意默认的计算是对 **Totalprices** 进行 **SUM**：

<Image size="md" img={tableau_workbook6} alt="Tableau 交叉表显示按季度和运输模式的总价格总和" border />
<br/>

8. 点击 **SUM** 并将 **Measure** 更改为 **Average**。从同一下拉菜单中选择 **Format** 将 **Numbers** 更改为 **Currency (Standard)**：

<Image size="md" img={tableau_workbook7} alt="Tableau 交叉表显示按季度和运输模式的平均订单价格，带有货币格式" border />
<br/>

干得好！您已经成功将 Tableau 连接到 ClickHouse，并为分析和可视化 ClickHouse 数据打开了一整片可能性。

## 手动安装连接器 {#install-the-connector-manually}

如果您使用的是未包含连接器的过时 Tableau Desktop 版本，可以按照以下步骤手动安装它：

1. 从 [Tableau Exchange](https://exchange.tableau.com/products/1064) 下载最新的 taco 文件
2. 将 taco 文件放在
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. 重新启动 Tableau Desktop，如果您的设置成功，您将在 `New Data Source` 部分找到连接器。

## 连接和分析技巧 {#connection-and-analysis-tips}

有关优化您 Tableau-ClickHouse 集成的更多指南，
请访问 [Connection Tips](/integrations/tableau/connection-tips) 和 [Analysis Tips](/integrations/tableau/analysis-tips)。

## 测试 {#tests}
该连接器正在通过 [TDVT framework](https://tableau.github.io/connector-plugin-sdk/docs/tdvt) 进行测试，目前保持 97% 的覆盖率。

## 总结 {#summary}
您可以使用通用 ODBC/JDBC ClickHouse 驱动程序将 Tableau 连接到 ClickHouse。然而，这个连接器简化了连接设置流程。如果您在使用连接器时遇到任何问题，请随时在 <a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a>  联系我们。
