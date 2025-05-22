---
'sidebar_label': 'Power BI'
'slug': '/integrations/powerbi'
'keywords':
- 'clickhouse'
- 'Power BI'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Microsoft Power BI 是一款由 Microsoft 开发的交互式数据可视化软件产品，主要集中于商业智能。'
'title': 'Power BI'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
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
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Power BI

<ClickHouseSupportedBadge/>

Microsoft Power BI 可以从 [ClickHouse Cloud](https://clickhouse.com/cloud) 或自管理的部署中查询或加载数据到内存中。

您可以使用多种 Power BI 版本来可视化您的数据：

* Power BI Desktop：一个用于创建仪表板和可视化的 Windows 桌面应用程序
* Power BI Service：作为 SaaS 在 Azure 中提供，用于托管在 Power BI Desktop 上创建的仪表板

Power BI 要求您在桌面版本中创建仪表板，然后将其发布到 Power BI Service。

本教程将指导您完成以下过程：

* [安装 ClickHouse ODBC 驱动程序](#install-the-odbc-driver)
* [将 ClickHouse Power BI 连接器安装到 Power BI Desktop 中](#power-bi-installation)
* [从 ClickHouse 查询数据以在 Power BI Desktop 中可视化](#query-and-visualise-data)
* [为 Power BI Service 设置本地数据网关](#power-bi-service)

## Prerequisites {#prerequisites}

### Power BI Installation {#power-bi-installation}

本教程假设您已在 Windows 计算机上安装了 Microsoft Power BI Desktop。您可以在 [这里](https://www.microsoft.com/en-us/download/details.aspx?id=58494) 下载并安装 Power BI Desktop。

我们建议您更新到最新版本的 Power BI。ClickHouse 连接器在版本 `2.137.751.0` 中默认可用。

### Gather your ClickHouse connection details {#gather-your-clickhouse-connection-details}

您需要以下详细信息以连接到您的 ClickHouse 实例：

* 主机名 - ClickHouse
* 用户名 - 用户凭据
* 密码 - 用户的密码
* 数据库 - 您要连接的实例中的数据库名称

## Power BI Desktop {#power-bi-desktop}

要在 Power BI Desktop 中开始查询数据，您需要完成以下步骤：

1. 安装 ClickHouse ODBC 驱动程序
2. 查找 ClickHouse 连接器
3. 连接到 ClickHouse
4. 查询并可视化您的数据

### Install the ODBC Driver {#install-the-odbc-driver}

下载最新的 [ClickHouse ODBC 版本](https://github.com/ClickHouse/clickhouse-odbc/releases)。

执行提供的 `.msi` 安装程序并按照向导进行操作。

<Image size="md" img={powerbi_odbc_install} alt="ClickHouse ODBC driver installation wizard showing installation options" border />
<br/>

:::note
`Debug symbols` 是可选的，不是必需的
:::

#### Verify ODBC Driver {#verify-odbc-driver}

安装驱动程序完成后，您可以通过以下方式验证安装是否成功：

在开始菜单中搜索 ODBC，然后选择“ODBC 数据源 **(64-bit)**”。

<Image size="md" img={powerbi_odbc_search} alt="Windows search showing ODBC Data Sources (64-bit) option" border />
<br/>

验证 ClickHouse 驱动程序是否列出。

<Image size="md" img={powerbi_odbc_verify} alt="ODBC Data Source Administrator showing ClickHouse drivers in the Drivers tab" border />
<br/>

### Find the ClickHouse Connector {#find-the-clickhouse-connector}

:::note
在 Power BI Desktop 的版本 `2.137.751.0` 中可用
:::
在 Power BI Desktop 启动屏幕上，单击“获取数据”。

<Image size="md" img={powerbi_get_data} alt="Power BI Desktop home screen showing the Get Data button" border />
<br/>

搜索“ClickHouse”

<Image size="md" img={powerbi_search_clickhouse} alt="Power BI Get Data dialog with ClickHouse searched in the search bar" border />
<br/>

### Connect to ClickHouse {#connect-to-clickhouse}

选择连接器，并输入 ClickHouse 实例凭据：

* 主机 (必填) - 您的实例域名/地址。确保不添加前缀/后缀。
* 端口 (必填) - 您的实例端口。
* 数据库 - 您的数据库名称。
* 选项 - 任意 ODBC 选项，如
  在 [ClickHouse ODBC GitHub 页面](https://github.com/ClickHouse/clickhouse-odbc#configuration) 中列出的
* 数据连接模式 - DirectQuery

<Image size="md" img={powerbi_connect_db} alt="ClickHouse connection dialog showing host, port, database and connectivity mode fields" border />
<br/>

:::note
我们建议选择 DirectQuery 以直接查询 ClickHouse。

如果您有少量数据的用例，可以选择导入模式，整个数据将被加载到 Power BI 中。
:::

* 指定用户名和密码

<Image size="md" img={powerbi_connect_user} alt="ClickHouse connection credentials dialog for username and password" border />
<br/>

### Query and Visualise Data {#query-and-visualise-data}

最后，您应该在导航器视图中看到数据库和表。选择所需的表并单击“加载”以导入来自 ClickHouse 的数据。

<Image size="md" img={powerbi_table_navigation} alt="Power BI Navigator view showing ClickHouse database tables and sample data" border />
<br/>

导入完成后，您的 ClickHouse 数据应该像往常一样可以在 Power BI 中访问。
<br/>

## Power BI Service {#power-bi-service}

为了使用 Microsoft Power BI Service，您需要创建一个 [本地数据网关](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem)。

有关如何设置自定义连接器的更多详细信息，请参考 Microsoft 的文档，了解如何 [使用本地数据网关的自定义数据连接器](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)。

## ODBC Driver (Import Only) {#odbc-driver-import-only}

我们建议使用使用 DirectQuery 的 ClickHouse 连接器。

在本地数据网关实例上安装 [ODBC 驱动程序](#install-the-odbc-driver)，并按照上述步骤 [验证](#verify-odbc-driver)。

### Create a new User DSN {#create-a-new-user-dsn}

当驱动程序安装完成后，可以创建 ODBC 数据源。搜索 ODBC 在开始菜单中，然后选择“ODBC 数据源 (64-bit)”。

<Image size="md" img={powerbi_odbc_search} alt="Windows search showing ODBC Data Sources (64-bit) option" border />
<br/>

我们需要添加一个新的用户 DSN。单击左侧的“添加”按钮。

<Image size="md" img={powerbi_add_dsn} alt="ODBC Data Source Administrator with Add button highlighted for creating new DSN" border />
<br/>

选择 ODBC 驱动程序的 Unicode 版本。

<Image size="md" img={powerbi_select_unicode} alt="Create New Data Source dialog showing ClickHouse Unicode Driver selection" border />
<br/>

填写连接详细信息。

<Image size="sm" img={powerbi_connection_details} alt="ClickHouse ODBC Driver configuration dialog with connection parameters" border />
<br/>

:::note
如果您使用的是启用了 SSL 的部署（例如 ClickHouse Cloud 或自管理的实例），在 `SSLMode` 字段中应提供 `require`。

- `Host` 应始终省略协议（即 `http://` 或 `https://`）。
- `Timeout` 是一个表示秒数的整数。默认值：`30 seconds`。
:::

### Get Data Into Power BI {#get-data-into-power-bi}

如果您尚未安装 Power BI，请 [下载并安装 Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494)。

在 Power BI Desktop 启动屏幕上，单击“获取数据”。

<Image size="md" img={powerbi_get_data} alt="Power BI Desktop home screen showing the Get Data button" border />
<br/>

选择“其他” -> “ODBC”。

<Image size="md" img={powerbi_select_odbc} alt="Power BI Get Data dialog with ODBC option selected under the Other category" border />
<br/>

从列表中选择您之前创建的数据源。

<Image size="md" img={powerbi_select_dsn} alt="ODBC driver selection dialog showing the configured ClickHouse DSN" border />
<br/>

:::note
如果您在数据源创建期间没有指定凭据，系统将提示您指定用户名和密码。
:::

<Image size="md" img={powerbi_dsn_credentials} alt="Credentials dialog for the ODBC DSN connection" border />
<br/>

最后，您应该在导航器视图中看到数据库和表。选择所需的表并单击“加载”以从 ClickHouse 导入数据。

<Image size="md" img={powerbi_table_navigation} alt="Power BI Navigator view showing ClickHouse database tables and sample data" border />
<br/>

导入完成后，您的 ClickHouse 数据应该像往常一样可以在 Power BI 中访问。


## Known Limitations {#known-limitations}

### UInt64 {#uint64}

无符号整数类型，如 UInt64 或更大类型，不会自动加载进数据集中，因为 Int64 是 Power BI 支持的最大整数类型。

:::note
要正确导入数据，在点击“加载”按钮之前，请先点击“转换数据”。
:::

在此示例中，`pageviews` 表具有一个 UInt64 列，默认情况下被识别为“二进制”。
“转换数据”会打开 Power Query 编辑器，我们可以在其中重新分配该列的类型，将其设置为例如，
文本。

<Image size="md" img={powerbi_16} alt="Power Query Editor showing data type transformation for UInt64 column" border />
<br/>

完成后，点击左上角的“关闭并应用”，然后继续加载数据。
