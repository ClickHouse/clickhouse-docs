---
description: 'ClickHouse ODBC 驱动程序文档'
sidebar_label: 'ODBC 驱动程序'
sidebar_position: 35
slug: /interfaces/odbc
title: 'ODBC 驱动程序'
doc_type: 'reference'
---

# ODBC driver \{#odbc-driver\}

ClickHouse ODBC 驱动程序提供符合标准的接口，用于将兼容 ODBC 的应用程序连接到
ClickHouse。它实现了 ODBC API，使应用程序、BI 工具和脚本环境能够执行 SQL
查询、获取结果，并通过熟悉的机制与 ClickHouse 交互。

该驱动程序使用 [HTTP protocol](/interfaces/http) 与 ClickHouse 服务器通信，这是所有 ClickHouse 部署中主要支持的
协议。这使得驱动程序能够在各种环境中保持一致运行，包括本地安装、Cloud 托管服务，以及仅提供基于 HTTP 访问的环境。

该驱动程序的源代码可在 [ClickHouse-ODBC GitHub Repository](
https://github.com/ClickHouse/clickhouse-odbc) 中获取。

:::tip
为了获得更好的兼容性，我们强烈建议将 ClickHouse 服务器更新到 24.11 或更高版本。
:::

:::note
该驱动程序正在积极开发中。一些 ODBC 功能可能尚未完全实现。当前版本
重点提供基本连接能力和核心 ODBC 功能，更多特性计划在未来版本中提供。

您的反馈非常重要，有助于指导新特性和改进项的优先级。如果您遇到
限制、缺失的功能或意外行为，请通过 issue 跟踪器 https://github.com/ClickHouse/clickhouse-odbc/issues
分享您的观察或功能请求。
:::

## 在 Windows 上安装 \{#installation-on-windows\}

你可以在 https://github.com/ClickHouse/clickhouse-odbc/releases/latest 找到该驱动的最新版本。  
在该页面下载并运行 MSI 安装程序，然后按照安装向导的提示完成安装。

## 测试 \{#testing\}

你可以通过运行这个简单的 PowerShell 脚本来测试驱动程序。复制下面的文本，设置你的 URL、用户和密码，
然后将文本粘贴到 PowerShell 命令提示符中——运行 `$reader.GetValue(0)` 之后，它应显示你的 ClickHouse
服务器版本。

```powershell
$url = "http://127.0.0.1:8123/"
$user = "default"
$password = ""
$conn = New-Object System.Data.Odbc.OdbcConnection("`
    Driver={ClickHouse ODBC Driver (Unicode)};`
    Url=$url;`
    Username=$username;`
    Password=$password")
$conn.Open()
$cmd = $conn.CreateCommand()
$cmd.CommandText = "select version()"
$reader = $cmd.ExecuteReader()
$reader.Read()
$reader.GetValue(0)
$reader.Close()
$conn.Close()
```


## 配置参数 \{#configuration-parameters\}

以下参数是建立与 ClickHouse ODBC 驱动连接时最常用的设置。它们涵盖了基本的身份验证、连接行为以及数据处理选项。完整的受支持参数列表可在该项目的 GitHub 页面中找到：[https://github.com/ClickHouse/clickhouse-odbc](https://github.com/ClickHouse/clickhouse-odbc)。

* `Url`：指定 ClickHouse 服务器的完整 HTTP(S) 端点，包括协议、主机、端口以及可选路径。
* `Username`：用于与 ClickHouse 服务器进行身份验证的用户名。
* `Password`：与指定用户名关联的密码。如果未提供，驱动会在不使用密码验证的情况下建立连接。
* `Database`：该连接要使用的默认数据库。
* `Timeout`：在放弃请求之前，驱动等待服务器响应的最长时间（以秒为单位）。
* `ClientName`：作为客户端元数据的一部分发送到 ClickHouse 服务器的自定义标识符。可用于追踪或区分来自不同应用的流量。该参数将作为 User-Agent 头的一部分出现在驱动发出的 HTTP 请求中。
* `Compression`：启用或禁用请求和响应负载的 HTTP 压缩。启用后，可以减少带宽占用，并在返回大型结果集时提升性能。

下面是一些传递给驱动以建立连接的完整连接字符串示例。

* 安装在本地 WSL 实例上的 ClickHouse 服务器

```plaintext
Driver={ClickHouse ODBC Driver (Unicode)};Url=http://localhost:8123//;Username=default
```

* 一个 ClickHouse Cloud 实例。

```plaintext
Driver={ClickHouse ODBC Driver (Unicode)};Url=https://you-instance-url.gcp.clickhouse.cloud:8443/;Username=default;Password=your-password
```


## Microsoft Power BI 集成 \{#powerbi-Integration\}

您可以使用 ODBC 驱动程序将 Microsoft Power BI 连接到 ClickHouse 服务器。Power BI 提供两种连接选项：通用 ODBC 连接器和 ClickHouse 连接器，这两者都包含在标准版 Power BI 的安装包中。

这两种连接器在内部都基于 ODBC，但它们在功能上有所不同：

- ClickHouse 连接器（推荐）
  在底层使用 ODBC，但支持 DirectQuery 模式。在此模式下，Power BI 会自动生成 SQL 查询，并且仅检索每个可视化或筛选操作所需的数据。

- ODBC 连接器
  仅支持 Import 模式。Power BI 会执行用户提供的查询（或选择整个表），并将完整的结果集导入到 Power BI 中。后续刷新会重新导入整个数据集。

请根据您的使用场景选择连接器：对于包含大型数据集的交互式仪表板，使用 DirectQuery 模式；当您需要数据的完整本地副本时，使用 Import 模式。

有关将 Microsoft Power BI 与 ClickHouse 集成的更多信息，请参阅 [ClickHouse 文档中关于 Power BI 集成的页面](http://localhost:3000/docs/integrations/powerbi)。