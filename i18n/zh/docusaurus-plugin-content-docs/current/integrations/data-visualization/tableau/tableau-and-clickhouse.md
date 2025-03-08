---
sidebar_label: Tableau Desktop
sidebar_position: 1
slug: /integrations/tableau
keywords: [ 'clickhouse', 'tableau', 'connect', 'integrate', 'ui' ]
description: 'Tableau可以使用ClickHouse数据库和表作为数据源。'
---
import TOCInline from '@theme/TOCInline';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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


# 连接Tableau到ClickHouse

ClickHouse提供了一个官方的Tableau连接器，可在
[Tableau Exchange](https://exchange.tableau.com/products/1064)找到。
该连接器基于ClickHouse的先进[ JDBC驱动程序](/integrations/language-clients/java/jdbc)。

通过此连接器，Tableau将ClickHouse数据库和表集成作为数据源。要启用此功能，
请按照下面的设置指南进行操作。

<TOCInline toc={toc}/>

## 使用前所需的设置 {#setup-required-prior-usage}

1. 收集您的连接详细信息
   <ConnectionDetails />

2. 下载并安装 <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   desktop</a>。
3. 按照`clickhouse-tableau-connector-jdbc`的说明下载兼容版本的
   <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBC驱动程序</a>。

:::note
确保您下载**clickhouse-jdbc-x.x.x-shaded-all.jar** JAR文件。目前，我们建议使用版本`0.8.X`。
:::

4. 将JDBC驱动程序存储在以下文件夹中（根据您的操作系统，如果文件夹不存在，您可以创建它）：
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. 在Tableau中配置ClickHouse数据源，并开始构建数据可视化！

## 在Tableau中配置ClickHouse数据源 {#configure-a-clickhouse-data-source-in-tableau}

现在您已经安装并设置好`clickhouse-jdbc`驱动程序，接下来让我们看看如何定义一个连接到ClickHouse中**TPCD**数据库的数据源。

1. 启动Tableau。（如果您已经在运行它，请重新启动。）

2. 在左侧菜单中，单击**To a Server**部分下的**More**。在可用连接器列表中搜索**ClickHouse by ClickHouse**：

<img alt="ClickHouse JDBC" src={tableau_connecttoserver}/>
<br/>

:::note
在连接器列表中看不到**ClickHouse by ClickHouse**连接器？这可能与旧版的Tableau Desktop有关。 
为了解决这个问题，考虑升级您的Tableau Desktop应用程序，或[手动安装连接器](#install-the-connector-manually)。
:::

3. 单击**ClickHouse by ClickHouse**，将弹出以下对话框：

<img alt="ClickHouse JDBC Connector Details" src={tableau_connector_details}/>
<br/>
 
4. 单击**Install and Restart Tableau**。重启应用程序。
5. 重启后，连接器的完整名称将为：`ClickHouse JDBC by ClickHouse, Inc.`。单击它时将弹出以下对话框：

<img alt="ClickHouse JDBC Connector Details Details" src={tableau_connector_dialog}/>
<br/>

6. 输入您的连接详细信息：

    | 设置        | 值                                                  |
    | ----------- |--------------------------------------------------------|
    | 服务器      | **您的ClickHouse主机（无前缀或后缀）**               |
    | 端口        | **8443**                                               |
    | 数据库      | **default**                                            |
    | 用户名      | **default**                                            |
    | 密码        | *\*****                                                |

:::note
在使用ClickHouse云时，需要勾选SSL复选框以进行安全连接。
:::
<br/>

:::note
我们的ClickHouse数据库命名为**TPCD**，但您必须在上面的对话框中将**数据库**设置为**default**，然后在下一步中选择**TPCD**作为**模式**。 （这很可能是由于连接器中的一个bug，因此这个行为可能会改变，但现在您必须将**default**用作为数据库。）
:::

7. 单击**Sign In**按钮，您应该会看到一个新的Tableau工作簿：

<img alt="New Workbook" src={tableau_newworkbook}/>
<br/>

8. 从**Schema**下拉菜单中选择**TPCD**，您应该会看到**TPCD**中的表列表：

<img alt="Select TPCD for the Schema" src={tableau_tpcdschema}/>
<br/>

您现在可以在Tableau中构建一些可视化了！

## 在Tableau中构建可视化 {#building-visualizations-in-tableau}

现在您在Tableau中配置了ClickHouse数据源，让我们可视化这些数据...

1. 将**CUSTOMER**表拖动到工作簿中。注意，列显示，但是数据表为空：

<img alt="Tableau workbook" src={tableau_workbook1}/>
<br/>

2. 单击**Update Now**按钮，**CUSTOMER**中的100行将填充到表中。

3. 将**ORDERS**表拖入工作簿，然后将**Custkey**设置为两个表之间的关系字段：

<img alt="Tableau workbook" src={tableau_workbook2}/>
<br/>

4. 现在您有**ORDERS**和**LINEITEM**表相互关联作为您的数据源，因此您可以利用这个关系回答有关数据的问题。选择工作簿底部的**Sheet 1**选项卡。

<img alt="Tableau workbook" src={tableau_workbook3}/>
<br/>

5. 假设您想知道每年订购了多少特定的物品。将**OrderDate**从**ORDERS**拖入**Columns**部分（水平字段），然后将**Quantity**从**LINEITEM**拖入**Rows**。Tableau将生成以下折线图：

<img alt="Tableau workbook" src={tableau_workbook4}/>
<br/>

这不是一个非常吸引人的折线图，但数据集是由脚本生成并构建用于测试查询性能的，因此您会注意到模拟的TCPD数据的订单变化不多。

6. 假设您想知道每季度及按运输方式（空运、邮件、船运、卡车等）的平均订单金额（以美元计）：

    - 单击**New Worksheet**选项卡以创建新工作表
    - 将**OrderDate**从**ORDERS**拖入**Columns**并将其从**Year**更改为**Quarter**
    - 将**Shipmode**从**LINEITEM**拖入**Rows**

您应该会看到以下内容：

<img alt="Tableau workbook" src={tableau_workbook5}/>
<br/>

7. **Abc**值只是填充空间，直到您将度量拖入表中。将**Totalprice**从**ORDERS**拖到表中。注意默认计算会对**Totalprices**进行**SUM**：

<img alt="Tableau workbook" src={tableau_workbook6}/>
<br/>

8. 单击**SUM**并将**Measure**更改为**Average**。从相同的下拉菜单中，选择**Format**并将**Numbers**更改为**Currency (Standard)**：

<img alt="Tableau workbook" src={tableau_workbook7}/>
<br/>

干得好！您已经成功将Tableau连接到ClickHouse，并为分析和可视化您的ClickHouse数据打开了一个全新的可能性世界。

## 手动安装连接器 {#install-the-connector-manually}

如果您使用的是不包含连接器的过时Tableau Desktop版本，您可以通过以下步骤手动安装它：

1. 从[Tableau Exchange](https://exchange.tableau.com/products/1064)下载最新的taco文件
2. 将taco文件放置在
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. 重启Tableau Desktop，如果您的设置成功，您将在`New Data Source`部分下设置连接器。

## 连接和分析提示 {#connection-and-analysis-tips}

有关优化您的Tableau-ClickHouse集成的更多指导，
请访问[Connection Tips](/integrations/tableau/connection-tips)和[Analysis Tips](/integrations/tableau/analysis-tips)。

## 测试 {#tests}
该连接器正在使用[TDVT框架](https://tableau.github.io/connector-plugin-sdk/docs/tdvt)进行测试，目前保持97%的覆盖率。

## 摘要 {#summary}
您可以使用通用的ODBC/JDBC ClickHouse驱动程序将Tableau连接到ClickHouse。但是，此
连接器简化了连接设置过程。如果您在使用该连接器时遇到任何问题，请随时在<a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a>上联系。
