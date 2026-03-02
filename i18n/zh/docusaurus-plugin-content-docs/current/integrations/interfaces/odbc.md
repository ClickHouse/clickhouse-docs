---
description: 'ClickHouse ODBC 驱动程序文档'
sidebar_label: 'ODBC 驱动程序'
sidebar_position: 35
slug: /interfaces/odbc
title: 'ODBC 驱动程序'
doc_type: 'reference'
---

# ODBC Driver \{#odbc-driver\}

ClickHouse ODBC 驱动程序提供符合标准的接口，用于将兼容 ODBC 的应用程序连接到
ClickHouse。它实现了 ODBC API，使应用程序、BI 工具和脚本环境能够执行 SQL
查询、获取结果，并通过熟悉的机制与 ClickHouse 交互。

该驱动程序使用 [HTTP protocol](/interfaces/http) 与 ClickHouse 服务器通信，这是所有 ClickHouse 部署中主要支持的
协议。这使得驱动程序能够在各种环境中保持一致运行，包括本地安装、Cloud 托管服务，以及仅提供基于 HTTP 访问的环境。

该驱动程序的源代码可在
[ClickHouse-ODBC GitHub Repository](https://github.com/ClickHouse/clickhouse-odbc) 中获取。

:::tip
为了获得更好的兼容性，我们强烈建议将 ClickHouse 服务器更新到 24.11 或更高版本。
:::

:::note
该驱动程序正在积极开发中。一些 ODBC 功能可能尚未完全实现。当前版本
重点提供基本连接能力和核心 ODBC 功能，更多特性计划在未来版本中提供。

您的反馈非常重要，有助于指导新特性和改进项的优先级。如果您遇到
限制、缺失的功能或意外行为，请通过 issue 跟踪器
[https://github.com/ClickHouse/clickhouse-odbc/issues](https://github.com/ClickHouse/clickhouse-odbc/issues)
分享您的观察或功能请求。
:::

## 在 Windows 上安装 \{#installation-on-windows\}

你可以在
[https://github.com/ClickHouse/clickhouse-odbc/releases/latest](https://github.com/ClickHouse/clickhouse-odbc/releases/latest)
找到该驱动的最新版本。
在该页面下载并运行 MSI 安装程序，然后按照安装向导的提示完成安装。

## 测试 \{#testing\}

你可以通过运行这个简单的 PowerShell 脚本来测试驱动程序。复制下面的文本，设置你的 URL、用户和密码，
然后将文本粘贴到 PowerShell 命令提示符中——运行 `$reader.GetValue(0)` 之后，它应显示你的 ClickHouse
服务器版本。

```powershell
$url = "http://127.0.0.1:8123/"
$username = "default"
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
* `SqlCompatibilitySettings`：启用使 ClickHouse 行为更接近传统关系型数据库的查询设置。当查询由第三方工具（例如 Power BI）自动生成时，这非常有用。这些工具通常不了解某些 ClickHouse 特有的行为，可能会生成导致错误或产生意外结果的查询。有关更多详情，请参阅[SqlCompatibilitySettings 配置参数使用的 ClickHouse settings
  ](#sql-compatibility-settings)。

下面是一些传递给驱动以建立连接的完整连接字符串示例。

* 安装在本地 WSL 实例上的 ClickHouse 服务器

```plaintext
Driver={ClickHouse ODBC Driver (Unicode)};Url=http://localhost:8123/;Username=default
```

* 一个 ClickHouse Cloud 实例。

```plaintext
Driver={ClickHouse ODBC Driver (Unicode)};Url=https://you-instance-url.gcp.clickhouse.cloud:8443/;Username=default;Password=your-password
```


## Microsoft Power BI 集成 \{#powerbi-integration\}

您可以使用 ODBC 驱动程序将 Microsoft Power BI 连接到 ClickHouse 服务器。Power BI 提供两种连接选项：通用 ODBC 连接器和 ClickHouse 连接器，这两者都包含在标准版 Power BI 的安装包中。

这两种连接器在内部都基于 ODBC，但它们在功能上有所不同：

- ClickHouse 连接器（推荐）
  在底层使用 ODBC，但支持 DirectQuery 模式。在此模式下，Power BI 会自动生成 SQL 查询，并且仅检索每个可视化或筛选操作所需的数据。

- ODBC 连接器
  仅支持 Import 模式。Power BI 会执行用户提供的查询（或选择整个表），并将完整的结果集导入到 Power BI 中。后续刷新会重新导入整个数据集。

请根据您的使用场景选择连接器。对于包含大型数据集的交互式仪表板，DirectQuery 模式效果最佳。当您需要数据的完整本地副本时，请选择 Import 模式。

有关将 Microsoft Power BI 与 ClickHouse 集成的更多信息，请参阅 [ClickHouse 文档中关于 Power BI 集成的页面](/integrations/powerbi)。

## SQL 兼容性设置 \{#sql-compatibility-settings\}

ClickHouse 有其独特的 SQL 方言，在某些情况下，它的行为与其他数据库（例如 MS SQL Server、MySQL 或 PostgreSQL）不同。通常，这些差异是一种优势，因为它们引入了改进的语法，使使用 ClickHouse 功能更加方便。

然而，ODBC 驱动程序通常运行在由第三方工具（例如 Power BI）生成查询而不是由用户手写查询的环境中。这些查询通常只依赖于 SQL 标准的一个最小子集。在这种情况下，ClickHouse 对 SQL 标准的偏离可能不会按预期工作，并可能产生意外结果或错误。ODBC 驱动程序提供了一个额外的配置参数 `SqlCompatibilitySettings`，通过启用特定的查询设置，使 ClickHouse 的行为更接近标准 SQL。

### 由 SqlCompatibilitySettings 配置参数启用的 ClickHouse 设置 \{#sql-compatibility-settings-list\}

本节介绍 ODBC 驱动会修改哪些设置以及原因。

**[cast&#95;keep&#95;nullable](https://clickhouse.com/docs/operations/settings/settings#cast_keep_nullable)**

默认情况下，ClickHouse 不允许将 Nullable 类型转换为非 Nullable 类型。然而，许多 BI 工具在执行类型转换时并不区分 Nullable 和非 Nullable 类型。因此，在由 BI 工具生成的查询中，经常会看到类似如下的语句：

```sql
SELECT sum(CAST(value, 'Int32'))
FROM values
```

默认情况下，当 `value` 列为 Nullable 时，此查询会失败，并出现如下错误信息：

```plaintext
DB::Exception: Cannot convert NULL value to non-Nullable type: while executing 'FUNCTION CAST(__table1.value :: 2,
'Int32'_String :: 1) -> CAST(__table1.value, 'Int32'_String) Int32 : 0'. (CANNOT_INSERT_NULL_IN_ORDINARY_COLUMN)
```

启用 `cast_keep_nullable` 会改变 `CAST` 的行为，使其保留参数的可空性。这样可以使 ClickHouse 在此类转换上的行为更接近其他数据库和 SQL 标准。

**[prefer&#95;column&#95;name&#95;to&#95;alias](https://clickhouse.com/docs/operations/settings/settings#prefer_column_name_to_alias)**

ClickHouse 允许在同一个 `SELECT` 列表中通过其别名引用表达式。例如，下面这个查询避免了重复，并且更易于编写：

```sql
SELECT
    sum(value) AS S,
    count() AS C,
    S / C
FROM test
```

该特性被广泛使用，但其他数据库通常不会在同一个 `SELECT` 列表中以这种方式解析别名，
因此这类查询会报错。问题在别名与列同名时最为明显。例如：

```sql
SELECT
    sum(value) AS value,
    avg(value)
FROM test
```

`avg(value)` 应该聚合哪个 `value`？默认情况下，ClickHouse 会优先使用别名，这实际上等同于
把它变成一个嵌套聚合，这并不是大多数工具所期望的行为。

单独来看这很少会成为问题，但有些 BI 工具会生成带有子查询的查询语句，且这些子查询会重复使用列别名。举例来说，Power BI 经常会生成类似如下的查询：

```sql
SELECT
    sum(C1) AS C1,
    count(C1) AS C2
FROM
(
    SELECT sum(value) AS C1
    FROM test
    GROUP BY group_index
) AS TBL
```

对 `C1` 的引用可能会导致如下错误：

```plaintext
Code: 184. DB::Exception: Received from localhost:9000. DB::Exception: Aggregate function sum(C1) AS C1 is found
inside another aggregate function in query. (ILLEGAL_AGGREGATION)
```

其他数据库通常不会以这种方式在同一级别解析别名，而是将 `C1` 视为子查询中的一列。为了在 ClickHouse 中保持类似行为，并允许此类查询在不报错的情况下运行，ODBC 驱动会启用 `prefer_column_name_to_alias`。

在大多数情况下，启用这些设置不应该造成问题。不过，将 `readonly` 设置为 `1` 的用户无法修改任何设置，即使是针对 `SELECT` 查询也是如此。对于这类用户，启用 `SqlCompatibilitySettings` 会导致报错。以下部分将说明如何让此配置参数对只读用户也能生效。


## 让 SQL 兼容性设置对只读用户生效 \{#readonly-users\}

当通过 ODBC 驱动连接到 ClickHouse 并启用 `SqlCompatibilitySettings` 参数时，如果某个用户的 `readonly` 被设置为 `1`，就会遇到错误，因为驱动程序会尝试修改查询设置：

```plaintext
Code: 164. DB::Exception: Cannot modify 'cast_keep_nullable' setting in readonly mode. (READONLY)
Code: 164. DB::Exception: Cannot modify 'prefer_column_name_to_alias' setting in readonly mode. (READONLY)
```

这是因为处于只读模式的用户不允许更改设置，即使是针对单独的 `SELECT` 查询也是如此。
有几种方法可以解决这个问题。

**选项 1：将 `readonly` 设置为 `2`**

这是最简单的选项。将 `readonly` 设置为 `2` 后，用户在保持只读模式的同时仍然可以修改设置。

```sql
ALTER USER your_odbc_user MODIFY SETTING
    readonly = 2
```

在大多数情况下，将 `readonly` 设置为 2 是解决此问题最简单且推荐的方式。如果
这样仍无法解决，请使用第二种方案。

**方案 2：更改用户设置以匹配由 ODBC 驱动设置的参数。**

这也很简单：更新用户设置，使其事先与 ODBC 驱动尝试设置的参数相匹配。

```sql
ALTER USER your_odbc_user MODIFY SETTING
    cast_keep_nullable = 1,
    prefer_column_name_to_alias = 1
```

通过此更改，ODBC 驱动程序仍然可以尝试应用这些设置，但由于各项值已经一致，因此不会产生任何实际变更，从而避免了错误。

该选项同样简单，但需要持续维护：较新的驱动程序版本可能会更改设置列表，或为兼容性添加新的设置。如果你在 ODBC 用户上将这些设置写死（硬编码），那么在 ODBC 驱动程序开始应用更多设置时，就可能需要同步更新这些配置。
