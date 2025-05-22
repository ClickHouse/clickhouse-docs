---
'sidebar_label': 'Power BI'
'slug': '/integrations/powerbi'
'keywords':
- 'clickhouse'
- 'Power BI'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Microsoft Power BI 是一款由 Microsoft 开发的交互式数据可视化软件，主要专注于商业智能。'
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

Microsoft Power BI 可以从 [ClickHouse Cloud](https://clickhouse.com/cloud) 或自管理部署中查询或加载数据到内存中。

您可以使用多种 Power BI 版本来可视化数据：

* Power BI Desktop：用于创建仪表板和可视化的 Windows 桌面应用程序
* Power BI Service：作为一种 SaaS 平台在 Azure 中可用，以托管在 Power BI Desktop 上创建的仪表板

Power BI 要求您在桌面版中创建仪表板，并将其发布到 Power BI Service。

本教程将指导您完成以下过程：

* [安装 ClickHouse ODBC 驱动程序](#install-the-odbc-driver)
* [将 ClickHouse Power BI 连接器安装到 Power BI Desktop](#power-bi-installation)
* [从 ClickHouse 查询数据以在 Power BI Desktop 中可视化](#query-and-visualise-data)
* [为 Power BI Service 设置本地数据网关](#power-bi-service)

## 前提条件 {#prerequisites}

### Power BI 安装 {#power-bi-installation}

本教程假设您已经在 Windows 机器上安装了 Microsoft Power BI Desktop。您可以在 [这里](https://www.microsoft.com/en-us/download/details.aspx?id=58494) 下载并安装 Power BI Desktop。

我们建议更新到最新版本的 Power BI。ClickHouse 连接器默认从版本 `2.137.751.0` 提供。

### 收集 ClickHouse 连接详细信息 {#gather-your-clickhouse-connection-details}

连接到您的 ClickHouse 实例时，您需要以下详细信息：

* 主机名 - ClickHouse
* 用户名 - 用户凭证
* 密码 - 用户的密码
* 数据库 - 您要连接的实例上数据库的名称

## Power BI Desktop {#power-bi-desktop}

要开始在 Power BI Desktop 中查询数据，您需要完成以下步骤：

1. 安装 ClickHouse ODBC 驱动程序
2. 查找 ClickHouse 连接器
3. 连接到 ClickHouse
4. 查询和可视化您的数据

### 安装 ODBC 驱动程序 {#install-the-odbc-driver}

下载最新的 [ClickHouse ODBC 版本](https://github.com/ClickHouse/clickhouse-odbc/releases)。

执行提供的 `.msi` 安装程序并按照向导进行操作。

<Image size="md" img={powerbi_odbc_install} alt="ClickHouse ODBC 驱动程序安装向导显示安装选项" border />
<br/>

:::note
`调试符号` 是可选的，不是必需的
:::

#### 验证 ODBC 驱动程序 {#verify-odbc-driver}

安装驱动程序完成后，您可以通过以下方式验证安装是否成功：

在开始菜单中搜索 ODBC，并选择“ODBC 数据源 **(64位)**”。

<Image size="md" img={powerbi_odbc_search} alt="Windows 搜索显示 ODBC 数据源 (64位) 选项" border />
<br/>

确认 ClickHouse 驱动程序已列出。

<Image size="md" img={powerbi_odbc_verify} alt="ODBC 数据源管理员显示驱动程序选项卡中的 ClickHouse 驱动程序" border />
<br/>

### 查找 ClickHouse 连接器 {#find-the-clickhouse-connector}

:::note
在 Power BI Desktop 版本 `2.137.751.0` 中可用
:::
在 Power BI Desktop 启动屏幕上，单击“获取数据”。

<Image size="md" img={powerbi_get_data} alt="Power BI Desktop 主屏幕显示获取数据按钮" border />
<br/>

搜索“ClickHouse”

<Image size="md" img={powerbi_search_clickhouse} alt="Power BI 获取数据对话框在搜索栏中搜索 ClickHouse" border />
<br/>

### 连接到 ClickHouse {#connect-to-clickhouse}

选择连接器，并输入 ClickHouse 实例凭证：

* 主机（必需） - 您实例的域/地址。确保直接输入，没有前缀/后缀。
* 端口（必需） - 您实例的端口。
* 数据库 - 您的数据库名称。
* 选项 - 按照列表中提供的任何 ODBC 选项
  在 [ClickHouse ODBC GitHub 页面](https://github.com/ClickHouse/clickhouse-odbc#configuration)
* 数据连接模式 - DirectQuery

<Image size="md" img={powerbi_connect_db} alt="ClickHouse 连接对话框显示主机、端口、数据库和连接模式字段" border />
<br/>

:::note
我们建议选择 DirectQuery 以直接查询 ClickHouse。

如果您有一个数据量很小的用例，可以选择导入模式，所有数据将加载到 Power BI 中。
:::

* 指定用户名和密码

<Image size="md" img={powerbi_connect_user} alt="ClickHouse 连接凭据对话框，输入用户名和密码" border />
<br/>

### 查询和可视化数据 {#query-and-visualise-data}

最后，您应该在导航视图中看到数据库和表。选择所需的表，然后单击“加载”以
从 ClickHouse 导入数据。

<Image size="md" img={powerbi_table_navigation} alt="Power BI 导航视图显示 ClickHouse 数据库表和样本数据" border />
<br/>

导入完成后，您的 ClickHouse 数据应在 Power BI 中正常访问。
<br/>

## Power BI Service {#power-bi-service}

为了使用 Microsoft Power BI Service，您需要创建一个 [本地数据网关](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem)。

有关如何设置自定义连接器的更多详细信息，请参考 Microsoft 的文档，了解如何 [使用自定义数据连接器与本地数据网关](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)。

## ODBC 驱动程序（仅限导入） {#odbc-driver-import-only}

我们建议使用采用 DirectQuery 的 ClickHouse 连接器。

在本地数据网关实例上安装 [ODBC 驱动程序](#install-the-odbc-driver)，并按照上面概述的步骤 [验证](#verify-odbc-driver)。

### 创建新的用户 DSN {#create-a-new-user-dsn}

驱动程序安装完成后，可以创建 ODBC 数据源。在开始菜单中搜索 ODBC，并选择“ODBC 数据源 (64位)”。

<Image size="md" img={powerbi_odbc_search} alt="Windows 搜索显示 ODBC 数据源 (64位) 选项" border />
<br/>

我们需要在这里添加一个新的用户 DSN。单击左侧的“添加”按钮。

<Image size="md" img={powerbi_add_dsn} alt="ODBC 数据源管理员中突出显示添加按钮以创建新的 DSN" border />
<br/>

选择 ODBC 驱动程序的 Unicode 版本。

<Image size="md" img={powerbi_select_unicode} alt="创建新数据源对话框显示选择 ClickHouse Unicode 驱动程序" border />
<br/>

填写连接详细信息。

<Image size="sm" img={powerbi_connection_details} alt="ClickHouse ODBC 驱动程序配置对话框及连接参数" border />
<br/>

:::note
如果您使用的部署启用了 SSL（例如 ClickHouse Cloud 或自管理实例），则在 `SSLMode` 字段中应提供 `require`。

- `主机` 应始终省略协议（即 `http://` 或 `https://`）。
- `超时` 是一个表示秒数的整数。默认值：`30 秒`。
:::

### 将数据导入 Power BI {#get-data-into-power-bi}

如果您尚未安装 Power BI，
请 [下载并安装 Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494)。

在 Power BI Desktop 启动屏幕上，单击“获取数据”。

<Image size="md" img={powerbi_get_data} alt="Power BI Desktop 主屏幕显示获取数据按钮" border />
<br/>

选择“其他” -> “ODBC”。

<Image size="md" img={powerbi_select_odbc} alt="Power BI 获取数据对话框在其他类别下选择 ODBC 选项" border />
<br/>

从列表中选择您之前创建的数据源。

<Image size="md" img={powerbi_select_dsn} alt="ODBC 驱动程序选择对话框显示已配置的 ClickHouse DSN" border />
<br/>

:::note
如果您在创建数据源时没有指定凭证，系统将提示您指定用户名和密码。
:::

<Image size="md" img={powerbi_dsn_credentials} alt="ODBC DSN 连接的凭据对话框" border />
<br/>

最后，您应该在导航视图中看到数据库和表。选择所需的表，并单击“加载”以从 ClickHouse 导入数据。

<Image size="md" img={powerbi_table_navigation} alt="Power BI 导航视图显示 ClickHouse 数据库表和样本数据" border />
<br/>

导入完成后，您的 ClickHouse 数据应在 Power BI 中正常访问。

## 已知限制 {#known-limitations}

### UInt64 {#uint64}

诸如 UInt64 或更大类型的无符号整数不会自动加载到数据集中，因为 Int64 是 Power BI 支持的最大整数类型。

:::note
为了正确导入数据，在导航中点击“加载”按钮之前，请先单击“转换数据”。
:::

在此示例中，`pageviews` 表有一个 UInt64 列，默认识别为“二进制”。
“转换数据”会打开 Power Query 编辑器，我们可以在其中重新分配列的类型，将其设置为例如，
文本类型。

<Image size="md" img={powerbi_16} alt="Power Query 编辑器显示 UInt64 列的数据类型转换" border />
<br/>

完成后，单击左上角的“关闭并应用”，并继续加载数据。
