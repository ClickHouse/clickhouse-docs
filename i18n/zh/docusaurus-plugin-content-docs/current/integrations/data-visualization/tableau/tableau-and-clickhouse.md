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
'description': 'Tableau 可以使用 ClickHouse 数据库和表作为数据源。'
'title': '连接 Tableau 到 ClickHouse'
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


# 连接 Tableau 与 ClickHouse

ClickHouse 提供了一个官方的 Tableau 连接器，可以在 
[Tableau Exchange](https://exchange.tableau.com/products/1064) 上找到。 
该连接器基于 ClickHouse 的高级 [JDBC 驱动程序](/integrations/language-clients/java/jdbc)。

通过此连接器，Tableau 将 ClickHouse 数据库和表集成作为数据源。要启用此功能， 
请按照以下设置指南操作。


<TOCInline toc={toc}/>

## 使用前所需设置 {#setup-required-prior-usage}


1. 收集您的连接详细信息
   <ConnectionDetails />

2. 下载并安装  <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   desktop</a>。
3. 按照 `clickhouse-tableau-connector-jdbc` 指示下载兼容版本
   的 <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBC 驱动程序</a>。

:::note
确保您下载 **clickhouse-jdbc-x.x.x-shaded-all.jar** JAR 文件。目前，建议使用版本 `0.8.X`。
:::

4. 将 JDBC 驱动程序存储在以下文件夹中（根据您的操作系统，如果文件夹不存在，您可以创建它）：
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. 在 Tableau 中配置 ClickHouse 数据源，并开始构建数据可视化！

## 在 Tableau 中配置 ClickHouse 数据源 {#configure-a-clickhouse-data-source-in-tableau}

现在您已经安装并设置了 `clickhouse-jdbc` 驱动程序，让我们看看如何定义一个 
连接到 ClickHouse 中 **TPCD** 数据库的数据源。

1. 启动 Tableau。（如果您已经在运行，请重新启动。）

2. 从左侧菜单中，在 **连接到服务器** 部分下点击 **更多**。在可用连接器列表中搜索 **ClickHouse by ClickHouse**：

<Image size="md" img={tableau_connecttoserver} alt="Tableau 连接屏幕显示连接器选择菜单，突出显示 ClickHouse by ClickHouse 选项" border />
<br/>

:::note
在您的连接器列表中没有看到 **ClickHouse by ClickHouse** 连接器？这可能与旧版本的 Tableau Desktop 有关。
为了解决这个问题，请考虑升级您的 Tableau Desktop 应用程序，或者 [手动安装连接器](#install-the-connector-manually)。
:::

3. 点击 **ClickHouse by ClickHouse**，然后以下对话框将弹出：

<Image size="md" img={tableau_connector_details} alt="Tableau 连接器安装对话框，显示 ClickHouse JDBC 连接器详细信息和安装按钮" border />
<br/>
 
4. 点击 **安装并重启 Tableau**。重启应用程序。
5. 重启后，连接器将显示全名：`ClickHouse JDBC by ClickHouse, Inc.`。点击它将弹出以下对话框：

<Image size="md" img={tableau_connector_dialog} alt="Tableau 中的 ClickHouse 连接对话框，显示服务器、端口、数据库、用户名和密码字段" border />
<br/>

6. 输入您的连接详细信息：

    | 设置  | 值                                                  |
    | ----------- |--------------------------------------------------------|
    | 服务器      | **您的 ClickHouse 主机（无前缀或后缀）** |
    | 端口   | **8443**                                               |
    | 数据库 | **default**                                            |
    | 用户名 | **default**                                            |
    | 密码 | *\*****                                                |

:::note
使用 ClickHouse 云时，需要选中 SSL 复选框以启用安全连接。
:::
<br/>


:::note
我们的 ClickHouse 数据库名为 **TPCD**，但您必须在上面的对话框中将 **数据库** 设置为 **default**，然后在下一步中选择 **TPCD** 作为 **模式**。 （这可能是连接器中的一个错误，因此这种行为可能会改变，但目前您必须使用 **default** 作为数据库。）
:::

7. 点击 **登录** 按钮，您应该会看到一个新的 Tableau 工作簿：

<Image size="md" img={tableau_newworkbook} alt="新的 Tableau 工作簿显示初始连接屏幕及数据库选择选项" border />
<br/>

8. 从 **模式** 下拉菜单中选择 **TPCD**，然后您应该会看到 **TPCD** 中的表列表：

<Image size="md" img={tableau_tpcdschema} alt="Tableau 模式选择显示 TPCD 数据库表，包括 CUSTOMER、LINEITEM、NATION、ORDERS 等" border />
<br/>

您现在可以在 Tableau 中开始构建一些可视化！

## 在 Tableau 中构建可视化 {#building-visualizations-in-tableau}

现在您已经在 Tableau 中配置了 ClickHouse 数据源，让我们可视化数据...

1. 将 **CUSTOMER** 表拖到工作簿上。注意列显示了，但数据表是空的：

<Image size="md" img={tableau_workbook1} alt="Tableau 工作簿，CUSTOMER 表拖到画布上，显示列标题但无数据" border />
<br/>

2. 点击 **立即更新** 按钮，**CUSTOMER** 中的 100 行将填充到表中。


3. 将 **ORDERS** 表拖入工作簿，然后将 **Custkey** 设置为两个表之间的关系字段：

<Image size="md" img={tableau_workbook2} alt="Tableau 关系编辑器显示 CUSTOMER 和 ORDERS 表之间使用 Custkey 字段的连接" border />
<br/>

4. 现在您的数据源中有 **ORDERS** 和 **LINEITEM** 表通过关系关联在一起，因此您可以使用
   此关系回答有关数据的问题。选择工作簿底部的 **Sheet 1** 选项卡。

<Image size="md" img={tableau_workbook3} alt="Tableau 工作表显示可用于分析的 ClickHouse 表的维度和度量值" border />
<br/>

5. 假设您想知道每年订购了多少特定物品。将 **OrderDate** 从 **ORDERS** 拖入
   **列** 部分（水平字段），然后将 **Quantity** 从 **LINEITEM** 拖入 **行**。Tableau 将生成如下的折线图：

<Image size="sm" img={tableau_workbook4} alt="Tableau 折线图，显示来自 ClickHouse 数据的按年订购数量" border />
<br/>

这不是一个特别激动人心的折线图，但该数据集是由脚本生成的，旨在测试查询性能，因此
您将注意到在模拟的 TCPD 数据中的订单变化不大。

6. 假设您希望了解按季度和运输方式（空运、邮件、船运、卡车等）计算的平均订单金额（以美元计）：

    - 点击 **新建工作表** 选项卡以创建新的工作表
    - 将 **OrderDate** 从 **ORDERS** 拖入 **列** 中，并将其从 **年** 更改为 **季度**
    - 将 **Shipmode** 从 **LINEITEM** 拖入 **行**

您应该会看到如下结果：

<Image size="sm" img={tableau_workbook5} alt="Tableau 交叉表视图，季度作为列，运输方式作为行" border />
<br/>

7. **Abc** 值只是填补空间，直到您将度量拖入表中。将 **Totalprice** 从 **ORDERS** 拖入表中。注意默认计算是 **总和** **Totalprices**：

<Image size="md" img={tableau_workbook6} alt="Tableau 交叉表，显示按季度和运输方式计算的总价格" border />
<br/>

8. 点击 **SUM** 并将 **度量** 更改为 **平均**。在同一下拉菜单中，选择 **格式** 将 **数字** 更改为 **货币（标准）**：

<Image size="md" img={tableau_workbook7} alt="Tableau 交叉表，显示按季度和运输方式的平均订单价格，并带有货币格式" border />
<br/>

干得好！您已经成功将 Tableau 连接到 ClickHouse，并为分析和可视化您的 ClickHouse 数据打开了一个全新的世界。

## 手动安装连接器 {#install-the-connector-manually}

如果您使用的 Tableau Desktop 版本过旧，默认不包含连接器，您可以按照以下步骤手动安装：

1. 从 [Tableau Exchange](https://exchange.tableau.com/products/1064) 下载最新的 taco 文件
2. 将 taco 文件放置在
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. 重新启动 Tableau Desktop，如果您的设置成功，您将能在 `新数据源` 部分下找到该连接器。

## 连接和分析提示 {#connection-and-analysis-tips}

有关优化 Tableau-ClickHouse 集成的更多指导，请访问 [连接提示](/integrations/tableau/connection-tips) 和 [分析提示](/integrations/tableau/analysis-tips)。

## 测试 {#tests}
连接器正在通过 [TDVT 框架](https://tableau.github.io/connector-plugin-sdk/docs/tdvt) 进行测试，目前维持 97% 的覆盖率。

## 总结 {#summary}
您可以使用通用的 ODBC/JDBC ClickHouse 驱动程序将 Tableau 连接到 ClickHouse。 
但是，这个连接器简化了连接设置过程。如果您在使用连接器时遇到问题，请随时联系 
<a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a>。
