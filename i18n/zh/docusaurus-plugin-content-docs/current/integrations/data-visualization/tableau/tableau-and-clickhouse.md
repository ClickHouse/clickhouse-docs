---
'sidebar_label': 'Tableau 桌面版'
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

ClickHouse 提供了一个官方的 Tableau 连接器，该连接器在 [Tableau Exchange](https://exchange.tableau.com/products/1064) 上有售。此连接器基于 ClickHouse 的高级 [JDBC driver](/integrations/language-clients/java/jdbc)。

通过此连接器，Tableau 将 ClickHouse 数据库和表集成作为数据源。要启用此功能，请遵循以下设置指南。

<TOCInline toc={toc}/>

## 使用前所需配置 {#setup-required-prior-usage}

1. 收集连接详细信息
   <ConnectionDetails />

2. 下载并安装  <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau desktop</a>。
3. 按照 `clickhouse-tableau-connector-jdbc` 的说明下载兼容版本的<a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBC driver</a>。

:::note
确保下载 **clickhouse-jdbc-x.x.x-shaded-all.jar** JAR 文件。目前建议使用版本 `0.8.X`。
:::

4. 将 JDBC 驱动程序存储在以下文件夹中（根据您的操作系统，如果文件夹不存在，您可以创建它）：
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. 在 Tableau 中配置 ClickHouse 数据源，并开始构建数据可视化！

## 在 Tableau 中配置 ClickHouse 数据源 {#configure-a-clickhouse-data-source-in-tableau}

现在您已经安装并设置了 `clickhouse-jdbc` 驱动程序，让我们看看如何在 Tableau 中定义连接到 ClickHouse 的 **TPCD** 数据库的数据源。

1. 启动 Tableau。（如果您之前已经运行，请重新启动。）

2. 从左侧菜单中，在 **连接到服务器** 部分下单击 **更多**。在可用连接器列表中搜索 **ClickHouse by ClickHouse**：

<Image size="md" img={tableau_connecttoserver} alt="Tableau 连接屏幕显示连接器选择菜单，ClickHouse by ClickHouse 选项已突出显示" border />
<br/>

:::note
在您的连接器列表中看不到 **ClickHouse by ClickHouse** 连接器？这可能与旧的 Tableau Desktop 版本有关。为解决此问题，请考虑升级您的 Tableau Desktop 应用程序，或 [手动安装连接器](#install-the-connector-manually)。
:::

3. 单击 **ClickHouse by ClickHouse**，将弹出以下对话框：

<Image size="md" img={tableau_connector_details} alt="Tableau 连接器安装对话框显示 ClickHouse JDBC 连接器详细信息和安装按钮" border />
<br/>
 
4. 单击 **安装并重新启动 Tableau**。重新启动应用程序。
5. 重新启动后，连接器的全名将显示为：`ClickHouse JDBC by ClickHouse, Inc.`。单击它将弹出以下对话框：

<Image size="md" img={tableau_connector_dialog} alt="Tableau 中的 ClickHouse 连接对话框显示服务器、端口、数据库、用户名和密码字段" border />
<br/>

6. 输入您的连接详细信息：

    | 设置       | 值                                                   |
    |------------|-----------------------------------------------------|
    | 服务器     | **您的 ClickHouse 主机（不带前缀或后缀）**         |
    | 端口       | **8443**                                            |
    | 数据库     | **default**                                        |
    | 用户名     | **default**                                        |
    | 密码       | *\*****                                            |

:::note
在使用 ClickHouse cloud 时，必须启用 SSL 选框以进行安全连接。
:::
<br/>

:::note
我们的 ClickHouse 数据库名为 **TPCD**，但您必须在上面的对话框中将 **数据库** 设置为 **default**，然后在下一步中选择 **TPCD** 作为 **模式**。 （这可能是与连接器中的一个错误有关，因此该行为可能会改变，但目前您必须将 **default** 用作数据库。）
:::

7. 单击 **登录** 按钮，您应该会看到一个新的 Tableau 工作簿：

<Image size="md" img={tableau_newworkbook} alt="新的 Tableau 工作簿显示初始连接屏幕和数据库选择选项" border />
<br/>

8. 从 **模式** 下拉菜单中选择 **TPCD**，您应该会看到 **TPCD** 中的表列表：

<Image size="md" img={tableau_tpcdschema} alt="Tableau 模式选择显示 TPCD 数据库表，包括 CUSTOMER、LINEITEM、NATION、ORDERS 和其他" border />
<br/>

现在您准备好在 Tableau 中构建一些可视化了！

## 在 Tableau 中构建可视化 {#building-visualizations-in-tableau}

现在您在 Tableau 中配置了 ClickHouse 数据源，让我们来可视化数据...

1. 将 **CUSTOMER** 表拖到工作簿上。注意列出现，但数据表为空：

<Image size="md" img={tableau_workbook1} alt="Tableau 工作簿将 CUSTOMER 表拖到画布上，显示列头但无数据" border />
<br/>

2. 单击 **立即更新** 按钮，100 行来自 **CUSTOMER** 的数据将填充表格。

3. 将 **ORDERS** 表拖到工作簿中，然后将 **Custkey** 设置为两个表之间的关系字段：

<Image size="md" img={tableau_workbook2} alt="Tableau 关系编辑器显示使用 Custkey 字段连接 CUSTOMER 和 ORDERS 表" border />
<br/>

4. 现在您有 **ORDERS** 和 **LINEITEM** 表相互关联作为您的数据源，因此您可以利用此关系回答有关数据的问题。在工作簿底部选择 **Sheet 1** 选项卡。

<Image size="md" img={tableau_workbook3} alt="Tableau 工作表显示可用于分析的 ClickHouse 表中的维度和度量" border />
<br/>

5. 假设您想知道每年订购了多少特定项。将 **OrderDate** 从 **ORDERS** 拖到 **列** 部分（横向字段），然后将 **Quantity** 从 **LINEITEM** 拖到 **行**。Tableau 将生成以下折线图：

<Image size="sm" img={tableau_workbook4} alt="Tableau 折线图显示来自 ClickHouse 数据按年份订购的数量" border />
<br/>

这不是一个令人兴奋的折线图，但该数据集是通过脚本生成的，旨在测试查询性能，因此您会注意到 TCPD 数据的模拟订单变化不多。

6. 假设您想知道按季度和运输模式（空运、邮件、船运、卡车等）计算的平均订单金额（以美元为单位）：

    - 单击 **新工作表** 选项卡创建新工作表
    - 将 **OrderDate** 从 **ORDERS** 拖到 **列** 并将其从 **年** 更改为 **季度**
    - 将 **Shipmode** 从 **LINEITEM** 拖到 **行**

您应该会看到以下内容：

<Image size="sm" img={tableau_workbook5} alt="Tableau 交叉表视图，季度作为列，运输模式作为行" border />
<br/>

7. **Abc** 值只是填充空间，直到您将度量拖到表中。将 **Totalprice** 从 **ORDERS** 拖到表中。请注意，默认计算是 **总和** **Totalprices**：

<Image size="md" img={tableau_workbook6} alt="Tableau 交叉表显示按季度和运输模式计算的总价格" border />
<br/>

8. 单击 **SUM** 将 **测量** 改为 **平均值**。从同一下拉菜单中选择 **格式** 更改 **数字** 为 **货币（标准）**：

<Image size="md" img={tableau_workbook7} alt="Tableau 交叉表显示按季度和运输模式计算的平均订单价格和货币格式" border />
<br/>

干得好！您已成功将 Tableau 连接到 ClickHouse，并为分析和可视化 ClickHouse 数据打开了一个全新的世界。

## 手动安装连接器 {#install-the-connector-manually}

如果您使用的是未包含连接器的过时 Tableau Desktop 版本，可以按照以下步骤手动安装它：

1. 从 [Tableau Exchange](https://exchange.tableau.com/products/1064) 下载最新的 taco 文件
2. 将 taco 文件放置在
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. 重新启动 Tableau Desktop，如果您的设置成功，您将在 `新数据源` 部分中设置连接器。

## 连接和分析提示 {#connection-and-analysis-tips}

有关优化您的 Tableau-ClickHouse 集成的更多指导，请访问 [连接提示](/integrations/tableau/connection-tips) 和 [分析提示](/integrations/tableau/analysis-tips)。

## 测试 {#tests}
该连接器正在与 [TDVT framework](https://tableau.github.io/connector-plugin-sdk/docs/tdvt) 测试，并且目前保持 97% 的覆盖率。

## 总结 {#summary}
您可以使用通用的 ODBC/JDBC ClickHouse 驱动程序将 Tableau 连接到 ClickHouse。然而，此连接器简化了连接设置过程。如果您在使用连接器时遇到任何问题，请随时在 <a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a> 上联系我们。
