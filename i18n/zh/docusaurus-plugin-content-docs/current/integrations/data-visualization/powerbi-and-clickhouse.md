---
sidebar_label: 'Power BI'
slug: /integrations/powerbi
keywords: ['clickhouse', 'Power BI', '连接', '集成', 'ui']
description: 'Microsoft Power BI 是 Microsoft 开发的一款交互式数据可视化软件产品，主要面向商业智能场景。'
title: 'Power BI'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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


# Power BI \{#power-bi\}

<ClickHouseSupportedBadge/>

Microsoft Power BI 可以从 [ClickHouse Cloud](https://clickhouse.com/cloud) 或自托管部署中查询数据，或将数据加载到内存中。

可以使用多种 Power BI 产品形态来可视化数据：

* Power BI Desktop：用于创建仪表板和可视化的 Windows 桌面应用程序
* Power BI Service：在 Azure 中以 SaaS 形式提供，用于托管在 Power BI Desktop 中创建的仪表板

Power BI 要求先在 Desktop 版本中创建仪表板，然后将其发布到 Power BI Service。

本教程将指导完成以下步骤：

* [安装 ClickHouse ODBC 驱动](#install-the-odbc-driver)
* [在 Power BI Desktop 中安装 ClickHouse Power BI Connector](#power-bi-installation)
* [从 ClickHouse 查询数据并在 Power BI Desktop 中进行可视化](#query-and-visualise-data)
* [为 Power BI Service 设置本地数据网关](#power-bi-service)

## 先决条件 \\{#prerequisites\\}

### 安装 Power BI \\{#power-bi-installation\\}

本教程假定您已在 Windows 机器上安装了 Microsoft Power BI Desktop。您可以在[此处](https://www.microsoft.com/en-us/download/details.aspx?id=58494)下载并安装 Power BI Desktop。

我们建议将 Power BI 更新到最新版本。ClickHouse Connector 从版本 `2.137.751.0` 起默认可用。

### 准备 ClickHouse 连接信息 \\{#gather-your-clickhouse-connection-details\\}

连接到 ClickHouse 实例时，您需要以下信息：

* Hostname - ClickHouse 主机名
* Username - 用户名（用户凭证）
* Password - 该用户的密码
* Database - 要连接的实例上的数据库名称

## Power BI 桌面版 \\{#power-bi-desktop\\}

要在 Power BI Desktop 中开始查询数据，你需要完成以下步骤：

1. 安装 ClickHouse ODBC 驱动程序
2. 找到 ClickHouse 连接器
3. 连接到 ClickHouse
4. 查询并可视化数据

### 安装 ODBC 驱动程序 \\{#install-the-odbc-driver\\}

下载最新的 [ClickHouse ODBC 发布版本](https://github.com/ClickHouse/clickhouse-odbc/releases)。

运行提供的 `.msi` 安装程序，并按照向导提示完成安装。

<Image size="md" img={powerbi_odbc_install} alt="ClickHouse ODBC 驱动程序安装向导，显示安装选项" border />
<br/>

:::note
`Debug symbols` 为可选项，并非必需
:::

#### 验证 ODBC 驱动程序 \\{#verify-odbc-driver\\}

驱动程序安装完成后，你可以通过以下方式验证安装是否成功：

在开始菜单中搜索 ODBC，并选择 “ODBC Data Sources **(64-bit)**”。

<Image size="md" img={powerbi_odbc_search} alt="Windows 搜索结果中显示 ODBC Data Sources (64-bit) 选项" border />

<br/>

确认列表中已显示 ClickHouse 驱动程序。

<Image size="md" img={powerbi_odbc_verify} alt="ODBC 数据源管理器在 Drivers 选项卡中显示 ClickHouse 驱动程序" border />

<br/>

### 查找 ClickHouse 连接器 \\{#find-the-clickhouse-connector\\}

:::note
在 Power BI Desktop 版本 `2.137.751.0` 中提供
:::
在 Power BI Desktop 启动界面上，单击 “Get Data”。

<Image size="md" img={powerbi_get_data} alt="Power BI Desktop 主页面中显示 Get Data 按钮" border />

<br/>

搜索 “ClickHouse”。

<Image size="md" img={powerbi_search_clickhouse} alt="Power BI Get Data 对话框中在搜索栏搜索 ClickHouse" border />

<br/>

### 连接到 ClickHouse \\{#connect-to-clickhouse\\}

选择该连接器，并输入 ClickHouse 实例的连接信息：

* Host（必填）- 实例的域名/地址，请确保不要添加任何前缀或后缀。
* Port（必填）- 实例端口。
* Database - 数据库名称。
* Options - 任意 ODBC 选项，如
  [ClickHouse ODBC GitHub 页面](https://github.com/ClickHouse/clickhouse-odbc#configuration) 中所列。
* Data Connectivity mode - DirectQuery

<Image size="md" img={powerbi_connect_db} alt="ClickHouse 连接对话框，显示 host、port、database 和 connectivity mode 字段" border />

<br/>

:::note
我们建议选择 DirectQuery，以便直接在 ClickHouse 上执行查询。

如果你的使用场景数据量较小，可以选择导入模式（import mode），所有数据都会加载到 Power BI 中。
:::

* 指定用户名和密码

<Image size="md" img={powerbi_connect_user} alt="ClickHouse 连接凭据对话框，输入用户名和密码" border />

<br/>

### 查询和可视化数据 \\{#query-and-visualise-data\\}

最后，你应该可以在 Navigator 视图中看到数据库和表。选择所需的表并单击 “Load”，
即可从 ClickHouse 导入数据。

<Image size="md" img={powerbi_table_navigation} alt="Power BI Navigator 视图中显示 ClickHouse 数据库表和示例数据" border />

<br/>

导入完成后，你的 ClickHouse 数据将在 Power BI 中像平常一样可供访问和使用。

<br/>

## Power BI 服务 \\{#power-bi-service\\}

若要使用 Microsoft Power BI 服务，您需要创建一个[本地数据网关](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem)。

关于如何配置自定义连接器的更多信息，请参阅 Microsoft 关于[在本地数据网关中使用自定义数据连接器](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)的文档。

## ODBC 驱动程序（仅导入） \\{#odbc-driver-import-only\\}

我们推荐使用采用 DirectQuery 的 ClickHouse Connector。

在本地数据网关实例上安装[ODBC 驱动程序](#install-the-odbc-driver)，并按照上文所述进行[验证](#verify-odbc-driver)。

### 创建新的用户 DSN \\{#create-a-new-user-dsn\\}

当驱动程序安装完成后，就可以创建一个 ODBC 数据源。在开始菜单中搜索 ODBC，并选择 "ODBC Data Sources (64-bit)"。

<Image size="md" img={powerbi_odbc_search} alt="Windows 搜索结果中显示 ODBC Data Sources (64-bit) 选项" border />
<br/>

我们需要在这里新增一个用户 DSN。点击左侧的 "Add" 按钮。

<Image size="md" img={powerbi_add_dsn} alt="ODBC 数据源管理器中高亮用于创建新 DSN 的 Add 按钮" border />
<br/>

选择 ODBC 驱动程序的 Unicode 版本。

<Image size="md" img={powerbi_select_unicode} alt="创建新数据源对话框中选中 ClickHouse Unicode Driver 的界面" border />
<br/>

填写连接信息。

<Image size="sm" img={powerbi_connection_details} alt="ClickHouse ODBC Driver 配置对话框以及连接参数" border />
<br/>

:::note
如果你使用的是启用 SSL 的部署（例如 ClickHouse Cloud 或自管实例），则需要在 `SSLMode` 字段中填写 `require`。

- `Host` 一项中必须始终省略协议（即不包含 `http://` 或 `https://`）。
- `Timeout` 是一个以秒为单位的整数。默认值：`30 秒`。
:::

### 将数据导入 Power BI \\{#get-data-into-power-bi\\}

如果你尚未安装 Power BI，[下载并安装 Power BI Desktop](https://www.microsoft.com/en-us/download/details.aspx?id=58494)。

在 Power BI Desktop 启动界面，点击 "Get Data"。

<Image size="md" img={powerbi_get_data} alt="Power BI Desktop 主界面中显示 Get Data 按钮" border />

<br/>

选择 "Other" -> "ODBC"。

<Image size="md" img={powerbi_select_odbc} alt="Power BI Get Data 对话框中 Other 分类下选中 ODBC 选项的界面" border />

<br/>

从列表中选择之前创建的数据源。

<Image size="md" img={powerbi_select_dsn} alt="ODBC 驱动程序选择对话框中显示已配置的 ClickHouse DSN" border />

<br/>

:::note
如果你在创建数据源时没有指定凭据，系统会提示你输入用户名和密码。
:::

<Image size="md" img={powerbi_dsn_credentials} alt="ODBC DSN 连接的凭据输入对话框" border />

<br/>

最后，你应该可以在 Navigator 视图中看到数据库和表。选择需要的表并点击 "Load"，即可从 ClickHouse 导入数据。

<Image size="md" img={powerbi_table_navigation} alt="Power BI Navigator 视图中显示 ClickHouse 数据库表及示例数据" border />

<br/>

导入完成后，你的 ClickHouse 数据就可以像往常一样在 Power BI 中进行访问了。

## 优化大规模数据集处理 \\{#optimizing-work-with-large-datasets\\}

Power BI 是为传统的基于行的数据库及中等数据量场景设计的。在大规模（数十亿行）场景下使用 ClickHouse 时，为获得最佳性能，需要采用特定的架构模式。

Power BI 会自动生成带有嵌套子查询、复杂连接以及实时转换的 SQL 查询。这些模式在传统 SQL 数据库中表现良好，但在对像 ClickHouse 这样的大规模列式数据库进行查询时，可能效率不高。

**针对大数据集的推荐做法：** 不要直接查询原始表，而是在 ClickHouse 中为仪表板中的每个可视化创建专用的 `materialized views`。这将带来：

- 在任意数据量下都具有一致且快速的性能
- 降低 ClickHouse 集群负载
- 更可预测的成本

:::warning
如果仪表板响应缓慢，请检查 ClickHouse 的 [`query_log`](/operations/system-tables/query_log)，查看 Power BI 实际运行了哪些 SQL 查询。常见问题包括嵌套子查询、扫描整张表或低效的连接。一旦定位到问题，请创建能够解决这些特定问题的 [materialized views](/materialized-views)。
:::

### 实施最佳实践 \\{#implementation-best-practices\\}

#### 预聚合策略 \\{#pre-aggregation-strategy\\}

在多个聚合层级创建 materialized view：

- 为近期的明细仪表板创建按小时聚合
- 为历史趋势创建按天聚合
- 为长期报表创建按月汇总
- 为临时分析保留设置了适当生存时间 (TTL) 的原始数据

#### 数据建模优化 \\{#data-modelling-optimization\\}

- 定义与查询模式匹配的 `ORDER BY` 排序键
- 对时序数据使用分区
- 将小型维度表转换为字典以实现高效查找
- 利用 PROJECTION 进一步优化查询

## 已知限制 \\{#known-limitations\\}

### UInt64 \\{#uint64\\}

像 UInt64 或更大的无符号整数类型不会自动加载到数据集中，因为 Power BI 支持的最大整数类型为 Int64。

:::note
为确保正确导入数据，在导航器中点击“Load”按钮之前，请先点击“Transform Data”。
:::

在此示例中，`pageviews` 表中有一个 UInt64 列，默认被识别为“Binary”。  
“Transform Data”会打开 Power Query 编辑器，我们可以在其中重新设置该列的类型，例如将其设置为 Text。

<Image size="md" img={powerbi_16} alt="Power Query Editor 显示对 UInt64 列进行数据类型转换" border />

<br/>

完成后，点击左上角的“Close &amp; Apply”，然后继续加载数据。