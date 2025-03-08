---
sidebar_label: Power BI
slug: /integrations/powerbi
keywords: [ 'clickhouse', 'Power BI', 'connect', 'integrate', 'ui' ]
description: 'Microsoft Power BI 是由微软开发的互动数据可视化软件产品，主要专注于商业智能。'
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import powerbi_odbc_install from '@site/static/images/integrations/data-visualization/powerbi_odbc_install.png';
import powerbi_odbc_search from '@site/static/images/integrations/data-visualization/powerbi_odbc_search.png';
import powerbi_odbc_verify from '@site/static/images/integrations/data-visualization/powerbi_odbc_verify.png';
import powerbi_get_data from '@site/static/images/integrations/data-visualization/powerbi_get_data.png';
import powerbi_search_clickhouse from '@site/static/images/integrations/data-visualization/powerbi_search_clickhouse.png';
import powerbi_connect_db from '@site/static/images/integrations/data-visualization/powerbi_connect_db.png';
import powerbi_connect_user from '@site/static/images/integrations/data-visualization/powerbi_connect_user.png';
import powerbi_table_navigation from '@site/static/images/integrations/data-visualization/powerbi_table_navigation.png';
import powerbi_add_dsn from '@site/static/images/integrations/data-visualization/powerbi_add_dsn.png';
import powerbi_select_unicode from '@site/static/images/integrations/data-visualization/powerbi_select_unicode.png';
import powerbi_connection_details from '@site/static/images/integrations/data-visualization/powerbi_connection_details.png';
import powerbi_select_odbc from '@site/static/images/integrations/data-visualization/powerbi_select_odbc.png';
import powerbi_select_dsn from '@site/static/images/integrations/data-visualization/powerbi_select_dsn.png';
import powerbi_dsn_credentials from '@site/static/images/integrations/data-visualization/powerbi_dsn_credentials.png';
import powerbi_16 from '@site/static/images/integrations/data-visualization/powerbi_16.png';


# Power BI

Microsoft Power BI 可以查询或加载来自 [ClickHouse Cloud](https://clickhouse.com/cloud) 或自管理部署的数据。

您可以使用几种 Power BI 版本来可视化数据：

* Power BI Desktop：用于创建仪表板和可视化的 Windows 桌面应用程序
* Power BI Service：作为 SaaS 在 Azure 中提供，托管在 Power BI Desktop 上创建的仪表板

Power BI 要求您在桌面版本中创建仪表板并将其发布到 Power BI Service。

本教程将指导您完成以下过程：

* [安装 ClickHouse ODBC 驱动程序](#install-the-odbc-driver)
* [将 ClickHouse Power BI 连接器安装到 Power BI Desktop 中](#power-bi-installation)
* [从 ClickHouse 查询数据以在 Power BI Desktop 中可视化](#query-and-visualise-data)
* [为 Power BI Service 设置本地数据网关](#power-bi-service)

## 前置条件 {#prerequisites}

### Power BI 安装 {#power-bi-installation}

本教程假设您在 Windows 计算机上安装了 Microsoft Power BI Desktop。您可以在 [这里](https://www.microsoft.com/en-us/download/details.aspx?id=58494) 下载并安装 Power BI Desktop。

我们建议您更新到最新版本的 Power BI。ClickHouse 连接器在版本 `2.137.751.0` 中默认可用。

### 收集您的 ClickHouse 连接详情 {#gather-your-clickhouse-connection-details}

您需要以下信息来连接到您的 ClickHouse 实例：

* 主机名 - ClickHouse
* 用户名 - 用户凭据
* 密码 - 用户的密码
* 数据库 - 您要连接的实例上的数据库名称

## Power BI Desktop {#power-bi-desktop}

要在 Power BI Desktop 中开始查询数据，您需要完成以下步骤：

1. 安装 ClickHouse ODBC 驱动程序
2. 找到 ClickHouse 连接器
3. 连接到 ClickHouse
4. 查询并可视化您的数据

### 安装 ODBC 驱动程序 {#install-the-odbc-driver}

下载最新的 [ClickHouse ODBC 版本](https://github.com/ClickHouse/clickhouse-odbc/releases)。

执行提供的 `.msi` 安装程序并按照向导进行操作。

<img src={powerbi_odbc_install} class="image" alt="Installing the ODBC driver" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

:::note
`调试符号` 是可选的，不是必需的
:::

#### 验证 ODBC 驱动程序 {#verify-odbc-driver}

驱动程序安装完成后，您可以通过以下方式验证安装是否成功：

在开始菜单中搜索 ODBC，并选择“ODBC 数据源 **(64 位)**”。

<img src={powerbi_odbc_search} class="image" alt="Creating a new ODBC Data Source" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

验证 ClickHouse 驱动程序是否列出。

<img src={powerbi_odbc_verify} class="image" alt="Verify ODBC existence" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

### 找到 ClickHouse 连接器 {#find-the-clickhouse-connector}

:::note
Power BI Desktop 的版本 `2.137.751.0` 中可用
:::
在 Power BI Desktop 启动屏幕上，点击“获取数据”。

<img src={powerbi_get_data} class="image" alt="Getting started with Power BI Desktop" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

搜索“ClickHouse”。

<img src={powerbi_search_clickhouse} class="image" alt="Choosing the data source" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

### 连接到 ClickHouse {#connect-to-clickhouse}

选择连接器，并输入 ClickHouse 实例凭据：

* 主机（必填）- 您的实例域/地址。确保仅添加它，没有前缀/后缀。
* 端口（必填）- 您的实例端口。
* 数据库 - 您的数据库名称。
* 选项 - 任何如 [ClickHouse ODBC GitHub 页](https://github.com/ClickHouse/clickhouse-odbc#configuration) 列出的 ODBC 选项
* 数据连接模式 - DirectQuery

<img src={powerbi_connect_db} class="image" alt="Filling ClickHouse instance information" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

:::note
我们建议选择 DirectQuery 以直接查询 ClickHouse。

如果您有小量数据的用例，您可以选择导入模式，整个数据将被加载到 Power BI 中。
:::

* 指定用户名和密码

<img src={powerbi_connect_user} class="image" alt="Username and password prompt" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

### 查询并可视化数据 {#query-and-visualise-data}

最后，您应该在导航器视图中看到数据库和表。选择所需的表并点击“加载”以导入来自 ClickHouse 的数据。

<img src={powerbi_table_navigation} class="image" alt="Navigator view" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

一旦导入完成，您的 ClickHouse 数据将在 Power BI 中按常规方式访问。
<br/>

## Power BI Service {#power-bi-service}

要使用 Microsoft Power BI Service，您需要创建一个 [本地数据网关](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem)。

有关如何设置自定义连接器的更多详细信息，请参考微软文档，了解如何 [使用自定义数据连接器与本地数据网关](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)。

## ODBC 驱动程序（仅限导入） {#odbc-driver-import-only}

我们建议使用使用 DirectQuery 的 ClickHouse 连接器。

在本地数据网关实例上安装 [ODBC 驱动程序](#install-the-odbc-driver) 并如上所述 [验证](#verify-odbc-driver)。

### 创建新的用户 DSN {#create-a-new-user-dsn}

驱动程序安装完成后，可以创建 ODBC 数据源。在开始菜单中搜索 ODBC，并选择“ODBC 数据源 (64 位)”。

<img src={powerbi_odbc_search} class="image" alt="Creating a new ODBC Data Source" style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

我们需要在这里添加一个新的用户 DSN。单击左侧的“添加”按钮。

<img src={powerbi_add_dsn} class="image" alt="Adding a new User DSN" style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

选择 ODBC 驱动程序的 Unicode 版本。

<img src={powerbi_select_unicode} class="image" alt="Choosing Unicode Version" style={{width: '40%', 'background-color': 'transparent'}}/>
<br/>

填写连接详细信息。

<img src={powerbi_connection_details} class="image" alt="Connection Details" style={{width: '30%', 'background-color': 'transparent'}}/>
<br/>

:::note
如果您使用的是启用 SSL 的部署（例如 ClickHouse Cloud 或自管理实例），则在 `SSLMode` 字段中应提供 `require`。

- `Host` 应始终省略协议（即 `http://` 或 `https://`）。
- `Timeout` 是表示秒数的整数。默认值： `30 seconds`。
:::

### 将数据导入 Power BI {#get-data-into-power-bi}

如果您还没有安装 Power BI，[下载并安装 Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494)。

在 Power BI Desktop 启动屏幕上，点击“获取数据”。

<img src={powerbi_get_data} class="image" alt="Getting started with Power BI Desktop" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

选择“其他”->“ODBC”。

<img src={powerbi_select_odbc} class="image" alt="Data Sources menu" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

从列表中选择您之前创建的数据源。

<img src={powerbi_select_dsn} class="image" alt="Select ODBC Data Source" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

:::note
如果您在创建数据源时未指定凭据，则系统将提示您指定用户名和密码。
:::

<img src={powerbi_dsn_credentials} class="image" alt="Navigator view" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

最后，您应该在导航器视图中看到数据库和表。选择所需的表并点击“加载”以导入来自 ClickHouse 的数据。

<img src={powerbi_table_navigation} class="image" alt="Navigator view" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

一旦导入完成，您的 ClickHouse 数据将在 Power BI 中按常规方式访问。

## 已知限制 {#known-limitations}

### UInt64 {#uint64}

无符号整数类型如 UInt64 或更大的类型不会自动加载到数据集中，因为 Power BI 支持的最大整数类型为 Int64。

:::note
要正确导入数据，请在导航器中点击“加载”按钮之前，先点击“转换数据”。
:::

在这个例子中，`pageviews` 表有一列 UInt64，默认情况下被识别为“二进制”。
“转换数据”打开 Power Query 编辑器，在这里我们可以重新分配列的类型，例如设置为文本。

<img src={powerbi_16} class="image" alt="Navigator view" style={{width: '50%', 'background-color': 'transparent'}}/>
<br/>

完成后，点击左上角的“关闭并应用”，并继续加载数据。
