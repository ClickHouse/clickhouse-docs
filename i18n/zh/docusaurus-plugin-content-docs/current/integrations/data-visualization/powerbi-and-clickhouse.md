---
sidebar_label: 'Power BI'
slug: /integrations/powerbi
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui']
description: 'Microsoft Power BI 是 Microsoft 推出的一款交互式数据可视化软件产品，主要用于商业智能。'
title: 'Power BI'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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

Microsoft Power BI 可以从 [ClickHouse Cloud](https://clickhouse.com/cloud) 或自托管部署中查询数据，或将数据加载到内存中。

可用于数据可视化的 Power BI 产品形态包括：

* Power BI Desktop：用于创建仪表板和可视化的 Windows 桌面应用程序
* Power BI Service：在 Azure 中以 SaaS 形式提供，用于托管在 Power BI Desktop 中创建的仪表板

Power BI 要求你在 Desktop 版本中创建仪表板，并将其发布到 Power BI Service。

本教程将引导你完成以下步骤：

* [安装 ClickHouse ODBC Driver](#install-the-odbc-driver)
* [在 Power BI Desktop 中安装 ClickHouse Power BI Connector](#power-bi-installation)
* [从 ClickHouse 查询数据并在 Power BI Desktop 中进行可视化](#query-and-visualise-data)
* [为 Power BI Service 设置本地数据网关](#power-bi-service)



## 前置条件 {#prerequisites}

### Power BI 安装 {#power-bi-installation}

本教程假设您已在 Windows 计算机上安装了 Microsoft Power BI Desktop。您可以在[此处](https://www.microsoft.com/en-us/download/details.aspx?id=58494)下载并安装 Power BI Desktop。

我们建议更新到最新版本的 Power BI。从 `2.137.751.0` 版本开始,ClickHouse 连接器默认可用。

### 收集 ClickHouse 连接信息 {#gather-your-clickhouse-connection-details}

连接到 ClickHouse 实例需要以下信息：

- 主机名 - ClickHouse 服务器地址
- 用户名 - 用户凭据
- 密码 - 用户密码
- 数据库 - 要连接的实例上的数据库名称


## Power BI 桌面版 {#power-bi-desktop}

要在 Power BI Desktop 中开始查询数据,您需要完成以下步骤:

1. 安装 ClickHouse ODBC 驱动程序
2. 查找 ClickHouse 连接器
3. 连接到 ClickHouse
4. 查询和可视化数据

### 安装 ODBC 驱动程序 {#install-the-odbc-driver}

下载最新的 [ClickHouse ODBC 发行版](https://github.com/ClickHouse/clickhouse-odbc/releases)。

运行提供的 `.msi` 安装程序并按照向导提示操作。

<Image
  size='md'
  img={powerbi_odbc_install}
  alt='ClickHouse ODBC 驱动程序安装向导显示安装选项'
  border
/>
<br />

:::note
`Debug symbols` 为可选项,非必需
:::

#### 验证 ODBC 驱动程序 {#verify-odbc-driver}

驱动程序安装完成后,您可以通过以下方式验证安装是否成功:

在开始菜单中搜索 ODBC 并选择"ODBC 数据源 **(64 位)**"。

<Image
  size='md'
  img={powerbi_odbc_search}
  alt='Windows 搜索显示 ODBC 数据源(64 位)选项'
  border
/>
<br />

验证 ClickHouse 驱动程序已列出。

<Image
  size='md'
  img={powerbi_odbc_verify}
  alt='ODBC 数据源管理器在驱动程序选项卡中显示 ClickHouse 驱动程序'
  border
/>
<br />

### 查找 ClickHouse 连接器 {#find-the-clickhouse-connector}

:::note
在 Power BI Desktop 版本 `2.137.751.0` 及以上可用
:::
在 Power BI Desktop 启动屏幕上,点击"获取数据"。

<Image
  size='md'
  img={powerbi_get_data}
  alt='Power BI Desktop 主屏幕显示获取数据按钮'
  border
/>
<br />

搜索"ClickHouse"

<Image
  size='md'
  img={powerbi_search_clickhouse}
  alt='Power BI 获取数据对话框在搜索栏中搜索 ClickHouse'
  border
/>
<br />

### 连接到 ClickHouse {#connect-to-clickhouse}

选择连接器,并输入 ClickHouse 实例凭据:

- Host(必需)- 您的实例域名/地址。请确保添加时不带前缀/后缀。
- Port(必需)- 您的实例端口。
- Database - 您的数据库名称。
- Options - [ClickHouse ODBC GitHub 页面](https://github.com/ClickHouse/clickhouse-odbc#configuration)中列出的任何 ODBC 选项
- Data Connectivity mode - DirectQuery

<Image
  size='md'
  img={powerbi_connect_db}
  alt='ClickHouse 连接对话框显示主机、端口、数据库和连接模式字段'
  border
/>
<br />

:::note
我们建议选择 DirectQuery 以直接查询 ClickHouse。

如果您的使用场景数据量较小,可以选择导入模式,此时全部数据将被加载到 Power BI 中。
:::

- 指定用户名和密码

<Image
  size='md'
  img={powerbi_connect_user}
  alt='ClickHouse 连接凭据对话框用于输入用户名和密码'
  border
/>
<br />

### 查询和可视化数据 {#query-and-visualise-data}

最后,您应该能在导航器视图中看到数据库和表。选择所需的表并点击"加载"以从 ClickHouse 导入数据。

<Image
  size='md'
  img={powerbi_table_navigation}
  alt='Power BI 导航器视图显示 ClickHouse 数据库表和示例数据'
  border
/>
<br />

导入完成后,您的 ClickHouse 数据即可像往常一样在 Power BI 中访问。

<br />


## Power BI 服务 {#power-bi-service}

要使用 Microsoft Power BI 服务,需要创建一个[本地数据网关](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem)。

有关如何设置自定义连接器的更多详细信息,请参阅 Microsoft 的文档:[在本地数据网关中使用自定义数据连接器](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)。


## ODBC 驱动程序(仅导入) {#odbc-driver-import-only}

我们推荐使用支持 DirectQuery 的 ClickHouse 连接器。

在本地数据网关实例上安装 [ODBC 驱动程序](#install-the-odbc-driver),并按照上述说明进行[验证](#verify-odbc-driver)。

### 创建新的用户 DSN {#create-a-new-user-dsn}

驱动程序安装完成后,即可创建 ODBC 数据源。在开始菜单中搜索 ODBC 并选择"ODBC 数据源(64 位)"。

<Image
  size='md'
  img={powerbi_odbc_search}
  alt='Windows 搜索显示 ODBC 数据源(64 位)选项'
  border
/>
<br />

我们需要在此处添加新的用户 DSN。点击左侧的"添加"按钮。

<Image
  size='md'
  img={powerbi_add_dsn}
  alt='ODBC 数据源管理器,突出显示用于创建新 DSN 的添加按钮'
  border
/>
<br />

选择 ODBC 驱动程序的 Unicode 版本。

<Image
  size='md'
  img={powerbi_select_unicode}
  alt='创建新数据源对话框,显示 ClickHouse Unicode 驱动程序选择'
  border
/>
<br />

填写连接详细信息。

<Image
  size='sm'
  img={powerbi_connection_details}
  alt='ClickHouse ODBC 驱动程序配置对话框及连接参数'
  border
/>
<br />

:::note
如果您使用的部署启用了 SSL(例如 ClickHouse Cloud 或自管理实例),则应在 `SSLMode` 字段中填写 `require`。

- `Host` 应始终省略协议(即 `http://` 或 `https://`)。
- `Timeout` 是表示秒数的整数。默认值:`30 秒`。
  :::

### 将数据导入 Power BI {#get-data-into-power-bi}

如果您尚未安装 Power BI,[请下载并安装 Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494)。

在 Power BI Desktop 启动屏幕上,点击"获取数据"。

<Image
  size='md'
  img={powerbi_get_data}
  alt='Power BI Desktop 主屏幕显示获取数据按钮'
  border
/>
<br />

选择"其他"->"ODBC"。

<Image
  size='md'
  img={powerbi_select_odbc}
  alt='Power BI 获取数据对话框,在其他类别下选择了 ODBC 选项'
  border
/>
<br />

从列表中选择您之前创建的数据源。

<Image
  size='md'
  img={powerbi_select_dsn}
  alt='ODBC 驱动程序选择对话框,显示已配置的 ClickHouse DSN'
  border
/>
<br />

:::note
如果您在创建数据源时未指定凭据,系统将提示您输入用户名和密码。
:::

<Image
  size='md'
  img={powerbi_dsn_credentials}
  alt='ODBC DSN 连接的凭据对话框'
  border
/>
<br />

最后,您应该能在导航器视图中看到数据库和表。选择所需的表并点击"加载"以从 ClickHouse 导入数据。

<Image
  size='md'
  img={powerbi_table_navigation}
  alt='Power BI 导航器视图,显示 ClickHouse 数据库表和示例数据'
  border
/>
<br />

导入完成后,您的 ClickHouse 数据即可在 Power BI 中正常访问。


## 已知限制 {#known-limitations}

### UInt64 {#uint64}

UInt64 或更大的无符号整数类型不会自动加载到数据集中,因为 Int64 是 Power BI 支持的最大整数类型。

:::note
要正确导入数据,在导航器中点击"加载"按钮之前,请先点击"转换数据"。
:::

在此示例中,`pageviews` 表包含一个 UInt64 列,默认情况下被识别为"二进制"类型。
点击"转换数据"会打开 Power Query 编辑器,我们可以在其中重新指定列的类型,例如将其设置为文本类型。

<Image
  size='md'
  img={powerbi_16}
  alt='Power Query 编辑器显示 UInt64 列的数据类型转换'
  border
/>
<br />

完成后,点击左上角的"关闭并应用",然后继续加载数据。
