---
sidebar_label: 'C#'
sidebar_position: 6
keywords: ['clickhouse', 'cs', 'c#', '.net', 'dotnet', 'csharp', 'client', 'driver', 'connect', 'integrate']
slug: /integrations/csharp
description: '用于连接 ClickHouse 的官方 C# 客户端。'
title: 'ClickHouse C# 驱动'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-cs'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_csharp from '@site/static/images/_snippets/connection-details-csharp.png';


# ClickHouse C# 客户端 \{#clickhouse-c-client\}

用于连接 ClickHouse 的官方 C# 客户端。
客户端源代码托管在 [GitHub 仓库](https://github.com/ClickHouse/clickhouse-cs) 中。
最初由 [Oleg V. Kozlyuk](https://github.com/DarkWanderer) 开发。

该库提供两个主要 API：

- **`ClickHouseClient`**（推荐）：一个为单例使用设计的高级、线程安全客户端。提供用于查询和批量插入的简单异步 API。适用于大多数应用程序。

- **ADO.NET**（`ClickHouseDataSource`、`ClickHouseConnection`、`ClickHouseCommand`）：标准 .NET 数据库抽象。用于 ORM 集成（Dapper、Linq2db）以及在需要与 ADO.NET 兼容的场景中。`ClickHouseBulkCopy` 是一个辅助类，用于通过 ADO.NET 连接高效插入数据。`ClickHouseBulkCopy` 已被弃用，并将在未来版本中移除；请改用 `ClickHouseClient.InsertBinaryAsync`。

这两种 API 共享相同的底层 HTTP 连接池，并且可以在同一个应用程序中同时使用。

## 迁移指南 \{#migration-guide\}

1. 在 `.csproj` 文件中将包名更新为 `ClickHouse.Driver`，并将版本更新为 [NuGet 上的最新版本](https://www.nuget.org/packages/ClickHouse.Driver)。
2. 将代码库中所有对 `ClickHouse.Client` 的引用更新为 `ClickHouse.Driver`。

---

## 支持的 .NET 版本 \{#supported-net-versions\}

`ClickHouse.Driver` 支持以下 .NET 版本：

* .NET Framework 4.6.2
* .NET Framework 4.8
* .NET Standard 2.1
* .NET 6.0
* .NET 8.0
* .NET 9.0
* .NET 10.0

## 安装 \{#installation\}

从 NuGet 安装该软件包：

```bash
dotnet add package ClickHouse.Driver
```

或者使用 NuGet 包管理器：

```bash
Install-Package ClickHouse.Driver
```


## 快速入门 \{#quick-start\}

```csharp
using ClickHouse.Driver;

// Create a client (typically as a singleton)
using var client = new ClickHouseClient("Host=my.clickhouse;Protocol=https;Port=8443;Username=user");

// Execute a query
var version = await client.ExecuteScalarAsync("SELECT version()");
Console.WriteLine(version);
```


## 配置 \{#configuration\}

配置与 ClickHouse 的连接有两种方式：

* **连接字符串：** 以分号分隔的键值对，用于指定主机、身份验证凭据以及其他连接选项。
* **`ClickHouseClientSettings` 对象：** 强类型的配置对象，可以从配置文件加载或在代码中设置。

下面是所有配置项的完整列表，包括它们的默认值及其作用。

### 连接设置 \{#connection-settings\}

| 属性 | 类型 | 默认值 | 连接字符串键 | 描述 |
|----------|------|---------|----------------------|-------------|
| Host | `string` | `"localhost"` | `Host` | ClickHouse 服务器的主机名或 IP 地址 |
| Port | `ushort` | 8123 (HTTP) / 8443 (HTTPS) | `Port` | 端口号；默认值取决于协议 |
| Username | `string` | `"default"` | `Username` | 身份验证用户名 |
| Password | `string` | `""` | `Password` | 身份验证密码 |
| Database | `string` | `""` | `Database` | 默认数据库；为空时使用服务器/用户的默认值 |
| Protocol | `string` | `"http"` | `Protocol` | 连接协议：`"http"` 或 `"https"` |
| Path | `string` | `null` | `Path` | 用于反向代理场景的 URL 路径（例如 `/clickhouse`） |
| Timeout | `TimeSpan` | 2 分钟 | `Timeout` | 操作超时时间（在连接字符串中以秒为单位存储） |

### 数据格式与序列化 \{#data-format-serialization\}

| 属性 | 类型 | 默认值 | 连接字符串键名 | 描述 |
|----------|------|---------|----------------------|-------------|
| UseCompression | `bool` | `true` | `Compression` | 为数据传输启用 gzip 压缩 |
| UseCustomDecimals | `bool` | `true` | `UseCustomDecimals` | 使用 `ClickHouseDecimal` 处理任意精度小数；如果为 false，则使用 .NET `decimal`（128 位上限） |
| ReadStringsAsByteArrays | `bool` | `false` | `ReadStringsAsByteArrays` | 将 `String` 和 `FixedString` 列读取为 `byte[]` 而不是 `string`；适用于二进制数据 |
| UseFormDataParameters | `bool` | `false` | `UseFormDataParameters` | 将参数以表单数据的形式发送，而不是作为 URL 查询字符串 |
| JsonReadMode | `JsonReadMode` | `Binary` | `JsonReadMode` | JSON 数据的返回方式：`Binary`（返回 `JsonObject`）或 `String`（返回原始 JSON 字符串） |
| JsonWriteMode | `JsonWriteMode` | `String` | `JsonWriteMode` | JSON 数据的发送方式：`String`（通过 `JsonSerializer` 序列化，接受所有输入）或 `Binary`（仅支持带类型提示的已注册 POCO） |

### 会话管理 \{#session-management\}

| 属性       | 类型     | 默认值   | 连接字符串键             | 描述                                             |
|------------|----------|----------|--------------------------|--------------------------------------------------|
| UseSession | `bool`   | `false`  | `UseSession`             | 启用有状态会话；将请求串行执行                   |
| SessionId  | `string` | `null`   | `SessionId`              | 会话 ID；如果为 null 且 UseSession 为 true，则自动生成 GUID |

:::note
`UseSession` 选项启用服务器会话持久化，从而可以使用 `SET` 语句和临时表。会话在 60 秒无活动后将被重置（默认超时时间）。可以通过在 ClickHouse 语句中设置会话相关配置或通过服务器配置来延长会话生命周期。

`ClickHouseConnection` 类通常允许并行操作（多个线程可以并发执行查询）。但是，启用 `UseSession` 选项后，在任意时刻，每个连接只能有一个活动查询（这是服务器端限制）。
:::

### 安全 \{#security\}

| 属性 | 类型 | 默认值 | 连接字符串键 | 说明 |
|----------|------|---------|----------------------|-------------|
| SkipServerCertificateValidation | `bool` | `false` | — | 跳过 HTTPS 证书验证；**不应用于生产环境** |

### HTTP 客户端配置 \{#http-client-configuration\}

| 属性 | 类型 | 默认值 | 连接字符串键 | 说明 |
|----------|------|---------|----------------------|-------------|
| HttpClient | `HttpClient` | `null` | — | 自定义的预配置 HttpClient 实例 |
| HttpClientFactory | `IHttpClientFactory` | `null` | — | 用于创建 HttpClient 实例的自定义工厂 |
| HttpClientName | `string` | `null` | — | 供 HttpClientFactory 在创建特定客户端时使用的名称 |

### 日志与调试 \{#logging-debugging\}

| 属性 | 类型 | 默认值 | 连接字符串键 | 描述 |
|----------|------|---------|----------------------|-------------|
| LoggerFactory | `ILoggerFactory` | `null` | — | 用于诊断日志记录的 LoggerFactory 工厂 |
| EnableDebugMode | `bool` | `false` | — | 启用 .NET 网络跟踪（需要配置 LoggerFactory 且日志级别设置为 Trace）；**对性能有显著影响** |

### 自定义设置与角色 \{#custom-settings-roles\}

| Property | Type | Default | Connection String Key | Description |
|----------|------|---------|----------------------|-------------|
| CustomSettings | `IDictionary<string, object>` | Empty | `set_*` prefix | ClickHouse 服务器设置，参见下方说明 |
| Roles | `IReadOnlyList<string>` | Empty | `Roles` | 用逗号分隔的 ClickHouse 角色（例如：`Roles=admin,reader`） |

:::note
使用 connection string 配置自定义设置时，请使用 `set_` 前缀，例如 `set_max_threads=4`。使用 ClickHouseClientSettings 对象时，不要使用 `set_` 前缀。

有关可用设置的完整列表，请参见[此处](https://clickhouse.com/docs/operations/settings/settings)。
:::

---

### 连接字符串示例 \{#connection-string-examples\}

#### 基本连接 \{#basic-connection\}

```text
Host=localhost;Port=8123;Username=default;Password=secret;Database=mydb
```


#### 使用自定义 ClickHouse 配置 \{#with-custom-clickhouse-settings\}

```text
Host=localhost;set_max_threads=4;set_readonly=1;set_max_memory_usage=10000000000
```

***


### QueryOptions \{#query-options\}

`QueryOptions` 允许你在每个查询的基础上覆盖客户端级别的设置。所有属性都是可选的，只有在显式指定时才会覆盖客户端默认值。

| Property         | Type                          | Description                                           |
| ---------------- | ----------------------------- | ----------------------------------------------------- |
| QueryId          | `string`                      | 用于在 `system.query_log` 中进行跟踪或取消操作的自定义查询标识符            |
| Database         | `string`                      | 覆盖此查询的默认数据库                                           |
| Roles            | `IReadOnlyList<string>`       | 覆盖此查询的客户端角色                                           |
| CustomSettings   | `IDictionary<string, object>` | 此查询的 ClickHouse 服务器设置（例如 `max_threads`）               |
| CustomHeaders    | `IDictionary<string, string>` | 此查询的附加 HTTP 头部                                        |
| UseSession       | `bool?`                       | 覆盖此查询的会话行为                                            |
| SessionId        | `string`                      | 此查询的会话 ID（需要 `UseSession = true`）                     |
| BearerToken      | `string`                      | 覆盖此查询的身份验证令牌                                          |
| MaxExecutionTime | `TimeSpan?`                   | 服务器端查询超时时间（作为 `max_execution_time` 设置传递）；若超时则由服务器取消查询 |

**示例：**

```csharp
var options = new QueryOptions
{
    QueryId = "report-2024-001",
    Database = "analytics",
    CustomSettings = new Dictionary<string, object>
    {
        { "max_threads", 4 },
        { "max_memory_usage", 10_000_000_000 }
    },
    MaxExecutionTime = TimeSpan.FromMinutes(5)
};

var reader = await client.ExecuteReaderAsync(
    "SELECT * FROM large_table",
    parameters: null,
    options: options
);
```

***


### InsertOptions \{#insert-options\}

`InsertOptions` 扩展了 `QueryOptions`，用于配置通过 `InsertBinaryAsync` 执行批量插入操作的特定设置。

| Property               | Type              | Default     | Description                                 |
| ---------------------- | ----------------- | ----------- | ------------------------------------------- |
| BatchSize              | `int`             | 100,000     | 每个批次包含的行数                                   |
| MaxDegreeOfParallelism | `int`             | 1           | 并行上传的批次数量                                   |
| Format                 | `RowBinaryFormat` | `RowBinary` | 二进制格式：`RowBinary` 或 `RowBinaryWithDefaults` |

所有 `QueryOptions` 的属性在 `InsertOptions` 中同样可用。

**示例：**

```csharp
var insertOptions = new InsertOptions
{
    BatchSize = 50_000,
    MaxDegreeOfParallelism = 4,
    QueryId = "bulk-import-001"
};

long rowsInserted = await client.InsertBinaryAsync(
    "my_table",
    columns,
    rows,
    insertOptions
);
```


## ClickHouseClient \{#clickhouse-client\}

`ClickHouseClient` 是与 ClickHouse 交互的推荐 API。它是线程安全的，适合作为单例使用，并在内部管理 HTTP 连接池。

### 创建客户端 \{#creating-a-client\}

通过连接字符串或 `ClickHouseClientSettings` 对象创建一个 `ClickHouseClient` 实例。有关可用选项，请参见 [Configuration](#configuration) 部分。

ClickHouse Cloud 服务的连接信息可以在 ClickHouse Cloud 控制台中获取。

选择某个服务并单击 **Connect**：

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud 服务连接按钮" border />

选择 **C#**，连接信息会显示在下方。

<Image img={connection_details_csharp} size="md" alt="ClickHouse Cloud C# 连接信息" border />

如果您使用的是自管理 ClickHouse，则连接信息由您的 ClickHouse 管理员配置。

使用连接字符串：

```csharp
using ClickHouse.Driver;

using var client = new ClickHouseClient("Host=localhost;Username=default;Password=secret");
```

也可以使用 `ClickHouseClientSettings`：

```csharp
using ClickHouse.Driver;

var settings = new ClickHouseClientSettings
{
    Host = "localhost",
    Username = "default",
    Password = "secret"
};
using var client = new ClickHouseClient(settings);
```

在依赖注入场景中，请使用 `IHttpClientFactory`：

```csharp
// In your DI configuration
services.AddHttpClient("ClickHouse", client =>
{
    client.Timeout = TimeSpan.FromMinutes(5);
}).ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
{
    AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
});

// Create client with factory
var factory = serviceProvider.GetRequiredService<IHttpClientFactory>();
var client = new ClickHouseClient("Host=localhost", factory, "ClickHouse");
```

:::note
`ClickHouseClient` 被设计为拥有较长的生命周期，并在整个应用程序中共享使用。通常只需创建一次（通常作为单例），并在所有数据库操作中复用该实例。客户端在内部管理 HTTP 连接池。
:::

***


### 执行查询 \{#executing-queries\}

使用 `ExecuteNonQueryAsync` 来执行不返回结果的语句：

```csharp
// Create a table
await client.ExecuteNonQueryAsync(
    "CREATE TABLE IF NOT EXISTS default.my_table (id Int64, name String) ENGINE = Memory"
);

// Drop a table
await client.ExecuteNonQueryAsync("DROP TABLE IF EXISTS default.my_table");
```

使用 `ExecuteScalarAsync` 检索单个值：

```csharp
var count = await client.ExecuteScalarAsync("SELECT count() FROM default.my_table");
Console.WriteLine($"Row count: {count}");

var version = await client.ExecuteScalarAsync("SELECT version()");
Console.WriteLine($"Server version: {version}");
```

***


### 插入数据 \{#inserting-data\}

#### 参数化插入 \{#parameterized-inserts\}

通过 `ExecuteNonQueryAsync` 使用参数化查询插入数据。必须在 SQL 中使用 `{name:Type}` 语法指定参数类型：

```csharp
using ClickHouse.Driver;
using ClickHouse.Driver.ADO.Parameters;

var parameters = new ClickHouseParameterCollection();
parameters.AddParameter("id", 1L);
parameters.AddParameter("name", "Alice");

await client.ExecuteNonQueryAsync(
    "INSERT INTO default.my_table (id, name) VALUES ({id:Int64}, {name:String})",
    parameters
);
```

***


#### 批量插入 \{#bulk-insert\}

使用 `InsertBinaryAsync` 可高效插入大量行。它使用 ClickHouse 的原生行二进制格式来流式传输数据，支持并行批量上传，并避免在使用参数化查询时可能出现的“URL too long”错误。

```csharp
// Prepare data as IEnumerable<object[]>
var rows = Enumerable.Range(0, 1_000_000)
    .Select(i => new object[] { (long)i, $"value{i}" });

var columns = new[] { "id", "name" };

// Basic insert
long rowsInserted = await client.InsertBinaryAsync("default.my_table", columns, rows);
Console.WriteLine($"Rows inserted: {rowsInserted}");
```

对于大型数据集，可以通过 `InsertOptions` 配置批处理和并行度：

```csharp
var options = new InsertOptions
{
    BatchSize = 100_000,           // Rows per batch (default: 100,000)
    MaxDegreeOfParallelism = 4     // Parallel batch uploads (default: 1)
};
```

:::note

* 客户端在插入前会通过 `SELECT * FROM <table> WHERE 1=0` 自动获取表结构。提供的值必须与目标列类型匹配。
* 当 `MaxDegreeOfParallelism > 1` 时，批量数据会被并行上传。Session 与并行插入不兼容；要么禁用 Session，要么将 `MaxDegreeOfParallelism = 1`。
* 如果希望服务端为未提供的列应用 DEFAULT 默认值，请在 `InsertOptions.Format` 中使用 `RowBinaryFormat.RowBinaryWithDefaults`。
  :::

***


### 读取数据 \{#reading-data\}

使用 `ExecuteReaderAsync` 执行 SELECT 查询。返回的 `ClickHouseDataReader` 通过 `GetInt64()`、`GetString()` 和 `GetFieldValue<T>()` 等方法，为结果列提供类型化访问。

调用 `Read()` 以移动到下一行。当没有更多行时，它返回 `false`。可以通过索引（从 0 开始）或列名访问列。

```csharp
using ClickHouse.Driver.ADO.Parameters;

var parameters = new ClickHouseParameterCollection();
parameters.AddParameter("max_id", 100L);

var reader = await client.ExecuteReaderAsync(
    "SELECT * FROM default.my_table WHERE id < {max_id:Int64}",
    parameters
);

while (reader.Read())
{
    Console.WriteLine($"Id: {reader.GetInt64(0)}, Name: {reader.GetString(1)}");
}
```

***


### SQL 参数 \{#sql-parameters\}

在 ClickHouse 中，SQL 查询参数的标准格式为 `{parameter_name:DataType}`。

**示例：**

```sql
SELECT {value:Array(UInt16)} as a
```

```sql
SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}
```

```sql
INSERT INTO table VALUES ({val1:Int32}, {val2:Array(UInt8)})
```

:::note
SQL `bind` 参数作为 HTTP URI 查询参数传递，因此如果使用过多，可能会触发 “URL too long” 异常。使用 `InsertBinaryAsync` 进行批量数据插入可以避免此限制。
:::

***


### 查询 ID \{#query-id\}

每个查询都会被分配一个唯一的 `query_id`，可用于从 `system.query_log` 表中获取数据或取消长时间运行的查询。可以通过 `QueryOptions` 指定自定义的查询 ID：

```csharp
var options = new QueryOptions
{
    QueryId = $"report-{Guid.NewGuid()}"
};

var reader = await client.ExecuteReaderAsync(
    "SELECT * FROM large_table",
    parameters: null,
    options: options
);
```

:::tip
如果你要指定自定义的 `QueryId`，请确保它在每次调用中都是唯一的。使用随机 GUID 是一个不错的选择。
:::

***


### 原始数据流 \{#raw-streaming\}

使用 `ExecuteRawResultAsync` 可以以特定格式直接对查询结果进行流式传输，从而绕过数据读取器。这对于将数据导出为文件或透传到其他系统非常有用：

```csharp
using var result = await client.ExecuteRawResultAsync(
    "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow"
);

await using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = await reader.ReadToEndAsync();
```

常见格式：`JSONEachRow`、`CSV`、`TSV`、`Parquet`、`Native`。有关所有可用选项，请参阅[格式文档](/docs/interfaces/formats)。

***


### 原始流插入 \{#raw-stream-insert\}

使用 `InsertRawStreamAsync` 将数据直接从文件或内存流中插入，格式可以是 CSV、JSON、Parquet，或任意[ClickHouse 支持的格式](/docs/interfaces/formats)。

**从 CSV 文件插入：**

```csharp
await using var fileStream = File.OpenRead("data.csv");

using var response = await client.InsertRawStreamAsync(
    table: "my_table",
    stream: fileStream,
    format: "CSV",
    columns: ["id", "product", "price"] // Optional: specify columns
);
```

:::note
有关用于控制数据摄取行为的选项，请参阅[格式设置文档](/docs/operations/settings/formats)。
:::

***


### 更多示例 \{#more-examples\}

有关更多实用示例，请参阅 GitHub 仓库中的 [examples 目录](https://github.com/ClickHouse/clickhouse-cs/tree/main/examples)。

## ADO.NET \{#ado-net\}

该库通过 `ClickHouseConnection`、`ClickHouseCommand` 和 `ClickHouseDataReader` 提供完整的 ADO.NET 支持。此 API 适用于与 ORM（Dapper、Linq2db）集成，以及需要标准 .NET 数据库抽象的场景。

### 使用 ClickHouseDataSource 进行生命周期管理 \{#ado-net-datasource\}

**始终通过 `ClickHouseDataSource` 创建连接**，以确保正确的生命周期管理和连接池使用。该 DataSource 在内部管理单个 `ClickHouseClient`，所有连接共享其 HTTP 连接池。

```csharp
using ClickHouse.Driver.ADO;

// Create DataSource once (register as singleton in DI)
var dataSource = new ClickHouseDataSource("Host=localhost;Username=default;Password=secret");

// Create lightweight connections as needed
await using var connection = await dataSource.OpenConnectionAsync();

// Use the connection
await using var command = connection.CreateCommand("SELECT version()");
var version = await command.ExecuteScalarAsync();
```

用于依赖注入：

```csharp
// In Startup.cs or Program.cs
services.AddSingleton(sp =>
{
    var factory = sp.GetRequiredService<IHttpClientFactory>();
    return new ClickHouseDataSource("Host=localhost", factory, "ClickHouse");
});

// In your service
public class MyService
{
    private readonly ClickHouseDataSource _dataSource;

    public MyService(ClickHouseDataSource dataSource)
    {
        _dataSource = dataSource;
    }

    public async Task DoWorkAsync()
    {
        await using var connection = await _dataSource.OpenConnectionAsync();
        // Use connection...
    }
}
```

:::warning
**在生产代码中不要直接创建 `ClickHouseConnection`**。每次直接实例化都会创建一个新的 HTTP 客户端和连接池，在高负载下可能导致套接字资源耗尽：

```csharp
// DON'T DO THIS - creates new connection pool each time
using var conn = new ClickHouseConnection("Host=localhost");
await conn.OpenAsync();
```

相反，而是应始终使用 `ClickHouseDataSource` 或共享单个 `ClickHouseClient` 实例。
:::

***


### 使用 ClickHouseCommand \{#ado-net-command\}

基于连接创建命令来执行 SQL：

```csharp
await using var connection = await dataSource.OpenConnectionAsync();

// Create command with SQL
await using var command = connection.CreateCommand("SELECT * FROM my_table WHERE id = {id:Int64}");
command.AddParameter("id", 42L);

// Execute and read results
await using var reader = await command.ExecuteReaderAsync();
while (reader.Read())
{
    Console.WriteLine($"Name: {reader.GetString("name")}");
}
```

命令执行方法：

* `ExecuteNonQueryAsync()` - 用于执行 INSERT、UPDATE、DELETE 以及 DDL 语句
* `ExecuteScalarAsync()` - 返回第一行的第一列
* `ExecuteReaderAsync()` - 返回一个用于遍历结果集的 `ClickHouseDataReader`

***


### 使用 ClickHouseDataReader \{#ado-net-reader\}

`ClickHouseDataReader` 提供对查询结果的类型安全访问：

```csharp
await using var reader = await command.ExecuteReaderAsync();

while (reader.Read())
{
    // Access by column index
    var id = reader.GetInt64(0);
    var name = reader.GetString(1);

    // Access by column name
    var email = reader.GetString("email");

    // Generic access
    var timestamp = reader.GetFieldValue<DateTime>("created_at");

    // Check for null
    if (!reader.IsDBNull("optional_field"))
    {
        var value = reader.GetString("optional_field");
    }
}
```


## 最佳实践 \{#best-practices\}

### 连接生命周期与连接池 \{#best-practices-connection-lifetime\}

`ClickHouse.Driver` 在底层使用 `System.Net.Http.HttpClient`。`HttpClient` 会针对每个端点维护一个连接池。因此：

* 数据库会话会通过由连接池管理的 HTTP 连接进行复用。
* HTTP 连接会由连接池自动回收。
* 即使 `ClickHouseClient` 或 `ClickHouseConnection` 对象已被释放，连接依然可能保持存活。

**推荐模式：**

| 场景 | 推荐方式 |
|----------|---------------------|
| 通用场景 | 使用单例 `ClickHouseClient` |
| ADO.NET / ORM | 使用 `ClickHouseDataSource`（创建共享同一连接池的连接） |
| DI 环境 | 将 `ClickHouseClient` 或 `ClickHouseDataSource` 作为单例，并结合 `IHttpClientFactory` 注册 |

:::important
在使用自定义 `HttpClient` 或 `HttpClientFactory` 时，确保将 `PooledConnectionIdleTimeout` 设置为小于服务器 `keep_alive_timeout` 的值，以避免由于半关闭的连接导致的错误。Cloud 部署的默认 `keep_alive_timeout` 是 10 秒。
:::

:::warning
避免在没有共享 `HttpClient` 的情况下创建多个 `ClickHouseClient` 或独立的 `ClickHouseConnection` 实例。每个实例都会创建自己的连接池。
:::

---

### DateTime 处理 \{#best-practice-datetime\}

1. **尽可能使用 UTC。** 将时间戳存储为 `DateTime('UTC')` 列，并在代码中使用 `DateTimeKind.Utc`，以消除时区歧义。

2. **使用 `DateTimeOffset` 进行显式时区处理。** 它始终表示一个确切的时间点，并包含偏移量信息。

3. **在 SQL 类型提示中指定时区。** 当向非 UTC 的列传递带有 `Unspecified` DateTime 值的参数时，在 SQL 中包含时区信息：
   ```csharp
   var parameters = new ClickHouseParameterCollection();
   parameters.AddParameter("dt", myDateTime);

   await client.ExecuteNonQueryAsync(
       "INSERT INTO table (dt) VALUES ({dt:DateTime('Europe/Amsterdam')})",
       parameters
   );
   ```

---

### 异步插入 \{#async-inserts\}

[异步插入](/docs/optimize/asynchronous-inserts) 将批处理的职责从客户端转移到服务器。服务器无需客户端进行批处理，而是自行对传入数据进行缓冲，并根据可配置阈值将其写入存储。这对于高并发场景（例如可观测性负载中有许多代理程序发送小体量数据的情况）非常有用。

可以通过 `CustomSettings` 或连接字符串启用异步插入：

```csharp
// Using CustomSettings
var settings = new ClickHouseClientSettings("Host=localhost");
settings.CustomSettings["async_insert"] = 1;
settings.CustomSettings["wait_for_async_insert"] = 1; // Recommended: wait for flush acknowledgment

// Or via connection string
// "Host=localhost;set_async_insert=1;set_wait_for_async_insert=1"
```

**两种模式**（由 `wait_for_async_insert` 控制）：

| 模式                        | 行为                                 | 使用场景            |
| ------------------------- | ---------------------------------- | --------------- |
| `wait_for_async_insert=1` | 在数据刷写到磁盘后才返回 INSERT。错误会返回给客户端。     | **推荐**用于大多数工作负载 |
| `wait_for_async_insert=0` | 在数据进入缓冲区后立即返回 INSERT。不保证数据一定会被持久化。 | 仅在可以接受数据丢失时使用   |

:::warning
在 `wait_for_async_insert=0` 的情况下，错误只会在刷写阶段暴露，且无法追溯到最初的 INSERT。客户端也不会提供背压机制，存在导致服务器过载的风险。
:::

**关键设置：**

| 设置                              | 描述                 |
| ------------------------------- | ------------------ |
| `async_insert_max_data_size`    | 当缓冲区达到此大小（字节）时触发刷写 |
| `async_insert_busy_timeout_ms`  | 在达到此超时时间（毫秒）后触发刷写  |
| `async_insert_max_query_number` | 当累计达到此数量的查询后触发刷写   |

***


### 会话 \{#best-practices-sessions\}

仅在需要有状态的服务端功能时才启用会话，例如：

* 临时表（`CREATE TEMPORARY TABLE`）
* 在多个语句之间保持查询上下文
* 会话级设置（`SET max_threads = 4`）

启用会话后，请求会被串行化，以防止同一会话被并发使用。对于不需要会话状态的工作负载，这会引入额外的开销。

```csharp
var settings = new ClickHouseClientSettings
{
    Host = "localhost",
    UseSession = true,
    SessionId = "my-session", // Optional -- will be auto-generated if not provided
};

using var client = new ClickHouseClient(settings);

await client.ExecuteNonQueryAsync("CREATE TEMPORARY TABLE temp_ids (id UInt64)");
await client.ExecuteNonQueryAsync("INSERT INTO temp_ids VALUES (1), (2), (3)");

var reader = await client.ExecuteReaderAsync(
    "SELECT * FROM users WHERE id IN (SELECT id FROM temp_ids)"
);
```

**使用 ADO.NET（用于兼容 ORM）：**

```csharp
var settings = new ClickHouseClientSettings
{
    Host = "localhost",
    UseSession = true,
    SessionId = "my-session",
};

var dataSource = new ClickHouseDataSource(settings);
await using var connection = await dataSource.OpenConnectionAsync();

await using var cmd1 = connection.CreateCommand("CREATE TEMPORARY TABLE temp_ids (id UInt64)");
await cmd1.ExecuteNonQueryAsync();

await using var cmd2 = connection.CreateCommand("INSERT INTO temp_ids VALUES (1), (2), (3)");
await cmd2.ExecuteNonQueryAsync();

await using var cmd3 = connection.CreateCommand("SELECT * FROM users WHERE id IN (SELECT id FROM temp_ids)");
await using var reader = await cmd3.ExecuteReaderAsync();
```


## 支持的数据类型 \{#supported-data-types\}

`ClickHouse.Driver` 支持所有 ClickHouse 数据类型。下表展示了从数据库读取数据时，ClickHouse 类型与原生 .NET 类型之间的映射关系。

### 类型映射：从 ClickHouse 读取数据 \{#clickhouse-native-type-map-reading\}

#### 整数类型 \{#type-map-reading-integer\}

| ClickHouse 类型 | .NET 类型 |
|-----------------|-----------|
| Int8 | `sbyte` |
| UInt8 | `byte` |
| Int16 | `short` |
| UInt16 | `ushort` |
| Int32 | `int` |
| UInt32 | `uint` |
| Int64 | `long` |
| UInt64 | `ulong` |
| Int128 | `BigInteger` |
| UInt128 | `BigInteger` |
| Int256 | `BigInteger` |
| UInt256 | `BigInteger` |

---

#### 浮点数类型 \{#type-map-reading-floating-points\}

| ClickHouse 类型 | .NET 类型 |
|-----------------|-----------|
| Float32 | `float` |
| Float64 | `double` |
| BFloat16 | `float` |

---

#### Decimal 类型 \{#type-map-reading-decimal\}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| Decimal(P, S) | `decimal` / `ClickHouseDecimal` |
| Decimal32(S) | `decimal` / `ClickHouseDecimal` |
| Decimal64(S) | `decimal` / `ClickHouseDecimal` |
| Decimal128(S) | `decimal` / `ClickHouseDecimal` |
| Decimal256(S) | `decimal` / `ClickHouseDecimal` |

:::note
Decimal 类型转换由 UseCustomDecimals 设置项控制。
:::

---

#### 布尔类型 \{#type-map-reading-boolean\}

| ClickHouse 类型 | .NET 类型 |
|-----------------|-----------|
| Bool | `bool` |

---

#### 字符串类型 \{#type-map-reading-strings\}

| ClickHouse 类型 | .NET 类型 |
|-----------------|-----------|
| String | `string` |
| FixedString(N) | `string` |

:::note
默认情况下，`String` 和 `FixedString(N)` 列都会以 `string` 形式返回。请在连接字符串中设置 `ReadStringsAsByteArrays=true` 以将它们读取为 `byte[]`。当存储可能不是有效 UTF-8 的二进制数据时，这会非常有用。
:::

---

#### 日期和时间类型 \{#type-map-reading-datetime\}

| ClickHouse Type | .NET Type  |
| --------------- | ---------- |
| Date            | `DateTime` |
| Date32          | `DateTime` |
| DateTime        | `DateTime` |
| DateTime32      | `DateTime` |
| DateTime64      | `DateTime` |
| Time            | `TimeSpan` |
| Time64          | `TimeSpan` |

ClickHouse 在内部将 `DateTime` 和 `DateTime64` 值存储为 Unix 时间戳（自 Unix 纪元起的秒或子秒单位）。虽然存储始终为 UTC，但列可以关联一个时区，这会影响值的显示和解释方式。

读取 `DateTime` 值时，会根据列的时区设置 `DateTime.Kind` 属性：

| Column Definition              | Returned DateTime.Kind | Notes             |
| ------------------------------ | ---------------------- | ----------------- |
| `DateTime('UTC')`              | `Utc`                  | 显式 UTC 时区         |
| `DateTime('Europe/Amsterdam')` | `Unspecified`          | 已应用偏移量            |
| `DateTime`                     | `Unspecified`          | 按原样保留墙上时钟时间（本地时刻） |

对于非 UTC 时区的列，返回的 `DateTime` 表示该时区中的墙上时钟时间。使用 `ClickHouseDataReader.GetDateTimeOffset()` 获取带有该时区正确偏移量的 `DateTimeOffset`：

```csharp
var reader = (ClickHouseDataReader)await connection.ExecuteReaderAsync(
    "SELECT toDateTime('2024-06-15 14:30:00', 'Europe/Amsterdam')");
reader.Read();

var dt = reader.GetDateTime(0);    // 2024-06-15 14:30:00, Kind=Unspecified
var dto = reader.GetDateTimeOffset(0); // 2024-06-15 14:30:00 +02:00 (CEST)
```

对于**没有**显式时区的列（即使用 `DateTime` 而不是 `DateTime('Europe/Amsterdam')`），驱动会返回一个 `Kind=Unspecified` 的 `DateTime`。这样可以在不对时区做任何假设的前提下，精确保留与存储值一致的挂钟时间（wall-clock time）。

如果你需要对没有显式时区的列实现具备时区感知的行为，可以：

1. 在列定义中使用显式时区：`DateTime('UTC')` 或 `DateTime('Europe/Amsterdam')`
2. 在读取之后自行应用时区转换。

***


#### JSON 类型 \{#type-map-reading-json\}

| ClickHouse Type | .NET Type    | Notes                     |
| --------------- | ------------ | ------------------------- |
| Json            | `JsonObject` | 默认（`JsonReadMode=Binary`） |
| Json            | `string`     | 当 `JsonReadMode=String` 时 |

JSON 列的返回类型由 `JsonReadMode` 设置控制：

* **`Binary`（默认）**：返回 `System.Text.Json.Nodes.JsonObject`。提供对 JSON 数据的结构化访问，但 JSON 结构中的 ClickHouse 特殊类型（如 IP 地址、UUID、大十进制数值）会被转换为其字符串表示。

* **`String`**：以 `string` 形式返回原始 JSON。保留来自 ClickHouse 的精确 JSON 表示，当你需要直接透传而不是解析 JSON，或希望自行处理反序列化时非常有用。

```csharp
// Configure string mode via settings
var settings = new ClickHouseClientSettings("Host=localhost")
{
    JsonReadMode = JsonReadMode.String
};

// Or via connection string
// "Host=localhost;JsonReadMode=String"
```

***


#### 其他类型 \{#type-map-reading-other\}

| ClickHouse 类型 | .NET 类型 |
|-----------------|-----------|
| UUID | `Guid` |
| IPv4 | `IPAddress` |
| IPv6 | `IPAddress` |
| Nothing | `DBNull` |
| Dynamic | 参见注释 |
| Array(T) | `T[]` |
| Tuple(T1, T2, ...) | `Tuple<T1, T2, ...>` / `LargeTuple` |
| Map(K, V) | `Dictionary<K, V>` |
| Nullable(T) | `T?` |
| Enum8 | `string` |
| Enum16 | `string` |
| LowCardinality(T) | 与 T 相同 |
| SimpleAggregateFunction | 与底层类型相同 |
| Nested(...) | `Tuple[]` |
| Variant(T1, T2, ...) | 参见注释 |
| QBit(T, dimension) | `T[]` |

:::note
Dynamic 和 Variant 类型会根据每一行中实际的底层类型转换为对应的类型。
:::

---

#### 几何类型 \{#type-map-reading-geometry\}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| Point | `Tuple<double, double>` |
| Ring | `Tuple<double, double>[]` |
| LineString | `Tuple<double, double>[]` |
| Polygon | `Ring[]` |
| MultiLineString | `LineString[]` |
| MultiPolygon | `Polygon[]` |
| Geometry | 参见说明 |

:::note
Geometry 类型是一个 Variant 类型，可以包含任意几何类型。它会被转换为对应的类型。
:::

---

### 类型映射：写入 ClickHouse \{#clickhouse-native-type-map-writing\}

在插入数据时，驱动会将 .NET 类型转换为相应的 ClickHouse 类型。下表展示了每种 ClickHouse 列类型可以接受的 .NET 类型。

#### 整数类型 \{#type-map-writing-integer\}

| ClickHouse 类型 | 可接受的 .NET 类型 | 备注 |
|-----------------|---------------------|-------|
| Int8 | `sbyte` 以及任何与 `Convert.ToSByte()` 兼容的类型 |  |
| UInt8 | `byte` 以及任何与 `Convert.ToByte()` 兼容的类型 |  |
| Int16 | `short` 以及任何与 `Convert.ToInt16()` 兼容的类型 |  |
| UInt16 | `ushort` 以及任何与 `Convert.ToUInt16()` 兼容的类型 |  |
| Int32 | `int` 以及任何与 `Convert.ToInt32()` 兼容的类型 |  |
| UInt32 | `uint` 以及任何与 `Convert.ToUInt32()` 兼容的类型 |  |
| Int64 | `long` 以及任何与 `Convert.ToInt64()` 兼容的类型 |  |
| UInt64 | `ulong` 以及任何与 `Convert.ToUInt64()` 兼容的类型 |  |
| Int128 | `BigInteger`、`decimal`、`double`、`float`、`int`、`uint`、`long`、`ulong`，以及任何与 `Convert.ToInt64()` 兼容的类型 | |
| UInt128 | `BigInteger`、`decimal`、`double`、`float`、`int`、`uint`、`long`、`ulong`，以及任何与 `Convert.ToInt64()` 兼容的类型 | |
| Int256 | `BigInteger`、`decimal`、`double`、`float`、`int`、`uint`、`long`、`ulong`，以及任何与 `Convert.ToInt64()` 兼容的类型 | |
| UInt256 | `BigInteger`、`decimal`、`double`、`float`、`int`、`uint`、`long`、`ulong`，以及任何与 `Convert.ToInt64()` 兼容的类型 | |

---

#### 浮点类型 \{#type-map-writing-floating-point\}

| ClickHouse Type | 可接受的 .NET 类型 | 说明 |
|-----------------|---------------------|-------|
| Float32 | `float`，任何与 `Convert.ToSingle()` 兼容的类型 |  |
| Float64 | `double`，任何与 `Convert.ToDouble()` 兼容的类型 | |
| BFloat16 | `float`，任何与 `Convert.ToSingle()` 兼容的类型 | 截断为 16 位 bfloat16 格式 |

---

#### 布尔类型 \{#type-map-writing-boolean\}

| ClickHouse 类型 | 可接受的 .NET 类型 | 备注 |
|-----------------|---------------------|-------|
| Bool | `bool` |  |

---

#### 字符串类型 \{#type-map-writing-strings\}

| ClickHouse 类型 | 可接受的 .NET 类型 | 说明 |
|-----------------|---------------------|-------|
| String | `string`，`byte[]`，`ReadOnlyMemory<byte>`，`Stream` | 二进制类型将被直接写入；流可以是可查找（seekable）或不可查找（non-seekable） |
| FixedString(N) | `string`，`byte[]`，`ReadOnlyMemory<byte>`，`Stream` | 字符串以 UTF-8 编码并进行填充；二进制类型的长度必须正好为 N 字节 |

---

#### 日期和时间类型 \{#type-map-writing-datetime\}

| ClickHouse Type | 可接受的 .NET 类型                                                      | 说明                                                                   |
| --------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| Date            | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime 类型             | 转换为自 Unix 纪元起的天数，类型为 UInt16                                          |
| Date32          | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime 类型             | 转换为自 Unix 纪元起的天数，类型为 Int32                                           |
| DateTime        | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime 类型             | 详细行为见下文                                                              |
| DateTime32      | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime 类型             | 与 DateTime 相同                                                        |
| DateTime64      | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime 类型             | 精度由 Scale 参数决定                                                       |
| Time            | `TimeSpan`, `int`                                                 | 限制在 ±999:59:59 范围内；`int` 按秒解释                                        |
| Time64          | `TimeSpan`, `decimal`, `double`, `float`, `int`, `long`, `string` | `string` 按 `[-]HHH:MM:SS[.fraction]` 解析；限制在 ±999:59:59.999999999 范围内 |

在写入值时，驱动会遵循 `DateTime.Kind`：

| DateTime.Kind | HTTP 参数                         | 批量写入            |
| ------------- | ------------------------------- | --------------- |
| Utc           | 精确保留同一时间点                       | 精确保留同一时间点       |
| Local         | 精确保留同一时间点                       | 精确保留同一时间点       |
| Unspecified   | 按参数类型所在时区的本地墙上时间处理（默认使用 UTC 时区） | 按列所在时区的本地墙上时间处理 |

`DateTimeOffset` 值始终精确保留时间点。

**示例：UTC DateTime（时间点保持不变）**

```csharp
var utcTime = new DateTime(2024, 1, 15, 12, 0, 0, DateTimeKind.Utc);
// Stored as 12:00 UTC
// Read from DateTime('Europe/Amsterdam') column: 13:00 (UTC+1)
// Read from DateTime('UTC') column: 12:00 UTC
```

**示例：未指定的 DateTime（墙上时钟时间）**

```csharp
var wallClock = new DateTime(2024, 1, 15, 14, 30, 0, DateTimeKind.Unspecified);
// Written to DateTime('Europe/Amsterdam') column: stored as 14:30 Amsterdam time
// Read back from DateTime('Europe/Amsterdam') column: 14:30
```

**建议：** 为获得最简单且最可预测的行为，请在所有与 DateTime 相关的操作中使用 `DateTimeKind.Utc` 或 `DateTimeOffset`。这样可以确保无论服务器时区、客户端时区还是列时区如何，代码都能保持一致的运行方式。


#### HTTP 参数与批量复制 \{#datetime-http-param-vs-bulkcopy\}

在写入 `Unspecified` 的 DateTime 值时，通过 HTTP 参数绑定和通过批量复制之间存在一个重要区别：

**Bulk Copy** 知道目标列的时区，并会在该时区中正确解释 `Unspecified` 值。

**HTTP Parameters** 无法自动获知列的时区。你必须在 SQL 类型提示中显式指定该时区：

```csharp
// CORRECT: Timezone in SQL type hint - type is extracted automatically
command.CommandText = "INSERT INTO table (dt_amsterdam) VALUES ({dt:DateTime('Europe/Amsterdam')})";
command.AddParameter("dt", myDateTime);

// INCORRECT: Without timezone hint, interpreted as UTC
command.CommandText = "INSERT INTO table (dt_amsterdam) VALUES ({dt:DateTime})";
command.AddParameter("dt", myDateTime);
// String value "2024-01-15 14:30:00" interpreted as UTC, not Amsterdam time!
```

| `DateTime.Kind` | 目标列              | HTTP 参数（带时区提示） | HTTP 参数（无时区提示） | 批量复制      |
| --------------- | ---------------- | -------------- | -------------- | --------- |
| `Utc`           | UTC              | 时间点保持不变        | 时间点保持不变        | 时间点保持不变   |
| `Utc`           | Europe/Amsterdam | 时间点保持不变        | 时间点保持不变        | 时间点保持不变   |
| `Local`         | 任意               | 时间点保持不变        | 时间点保持不变        | 时间点保持不变   |
| `Unspecified`   | UTC              | 视为 UTC         | 视为 UTC         | 视为 UTC    |
| `Unspecified`   | Europe/Amsterdam | 视为阿姆斯特丹时间      | **视为 UTC**     | 视为阿姆斯特丹时间 |

***


#### Decimal 类型 \{#type-map-writing-decimal\}

| ClickHouse 类型 | 可接受的 .NET 类型 | 说明 |
|-----------------|--------------------|------|
| Decimal(P,S) | `decimal`, `ClickHouseDecimal`, 任意与 `Convert.ToDecimal()` 兼容的类型 | 当超出精度时抛出 `OverflowException` |
| Decimal32 | `decimal`, `ClickHouseDecimal`, 任意与 `Convert.ToDecimal()` 兼容的类型 | 最大精度为 9 |
| Decimal64 | `decimal`, `ClickHouseDecimal`, 任意与 `Convert.ToDecimal()` 兼容的类型 | 最大精度为 18 |
| Decimal128 | `decimal`, `ClickHouseDecimal`, 任意与 `Convert.ToDecimal()` 兼容的类型 | 最大精度为 38 |
| Decimal256 | `decimal`, `ClickHouseDecimal`, 任意与 `Convert.ToDecimal()` 兼容的类型 | 最大精度为 76 |

---

#### JSON 类型 \{#type-map-writing-json\}

| ClickHouse Type | Accepted .NET Types                            | Notes                         |
| --------------- | ---------------------------------------------- | ----------------------------- |
| Json            | `string`, `JsonObject`, `JsonNode`, any object | 行为取决于 `JsonWriteMode` SETTING |

写入 JSON 时的行为由 `JsonWriteMode` 设置控制：

| Input Type                           | `JsonWriteMode.String` (default)    | `JsonWriteMode.Binary`                    |
| ------------------------------------ | ----------------------------------- | ----------------------------------------- |
| `string`                             | 原样传递                                | 抛出 `ArgumentException`                    |
| `JsonObject`                         | 通过 `ToJsonString()` 序列化             | 抛出 `ArgumentException`                    |
| `JsonNode`                           | 通过 `ToJsonString()` 序列化             | 抛出 `ArgumentException`                    |
| Registered POCO                      | 通过 `JsonSerializer.Serialize()` 序列化 | 使用带类型提示的二进制编码，支持自定义路径特性                   |
| Unregistered POCO / Anonymous object | 通过 `JsonSerializer.Serialize()` 序列化 | 抛出 `ClickHouseJsonSerializationException` |

* **`String`（默认）**：接受 `string`、`JsonObject`、`JsonNode` 或任意对象。所有输入都会通过 `System.Text.Json.JsonSerializer` 序列化，并以 JSON 字符串形式发送到服务端进行解析。该模式最为灵活，无需进行类型注册。

* **`Binary`**：仅接受已注册的 POCO 类型。数据会在客户端转换为 ClickHouse 的二进制 JSON 格式，并具备完整的类型提示支持。使用前需要调用 `connection.RegisterJsonSerializationType<T>()`。在该模式下写入 `string` 或 `JsonNode` 值会抛出 `ArgumentException`。

```csharp
// Default String mode works with any input
await client.InsertBinaryAsync(
    "my_table",
    new[] { "id", "data" },
    new[] { new object[] { 1u, new { name = "test", value = 42 } } }
);

// Binary mode requires explicit opt-in and type registration
var settings = new ClickHouseClientSettings("Host=localhost")
{
    JsonWriteMode = JsonWriteMode.Binary
};
using var client = new ClickHouseClient(settings);
client.RegisterJsonSerializationType<MyPocoType>();
```


##### 带类型的 JSON 列 \{#json-typed-columns\}

当一个 JSON 列带有类型提示时（例如 `JSON(id UInt64, price Decimal128(2))`），驱动程序会利用这些提示，在序列化值时保留完整的类型信息。这样可以保持 `UInt64`、`Decimal`、`UUID` 和 `DateTime64` 等类型的精度，否则在序列化为通用 JSON 时会丢失精度。

##### POCO 序列化 \{#json-poco-serialization\}

根据 `JsonWriteMode` 的不同，POCO 可以通过两种方式写入 JSON 列：

**字符串模式（默认）**：POCO 使用 `System.Text.Json.JsonSerializer` 进行序列化。无需进行类型注册。这是最简单的方式，并且适用于匿名对象。

**二进制模式**：POCO 使用驱动的二进制 JSON 格式进行序列化，并提供完整的类型提示支持。在使用前，必须通过 `connection.RegisterJsonSerializationType<T>()` 注册类型。此模式通过特性（attribute）支持自定义 JSON 路径映射：

* **`[ClickHouseJsonPath("path")]`**：将属性映射到自定义 JSON 路径。对于嵌套结构，或当属性名与期望的 JSON 键不同的情况非常有用。**仅在二进制模式下有效。**

* **`[ClickHouseJsonIgnore]`**：在序列化中排除某个属性。**仅在二进制模式下有效。**

```sql
CREATE TABLE events (
    id UInt32,
    data JSON(`user.id` Int64, `user.name` String, Timestamp DateTime64(3))
) ENGINE = MergeTree() ORDER BY id
```

```csharp
using ClickHouse.Driver.Json;

public class UserEvent
{
    [ClickHouseJsonPath("user.id")]
    public long UserId { get; set; }

    [ClickHouseJsonPath("user.name")]
    public string UserName { get; set; }

    public DateTime Timestamp { get; set; }

    [ClickHouseJsonIgnore]
    public string InternalData { get; set; }  // Not serialized
}

// For Binary mode: Register the type and enable Binary mode
var settings = new ClickHouseClientSettings("Host=localhost") { JsonWriteMode = JsonWriteMode.Binary };
using var client = new ClickHouseClient(settings);
client.RegisterJsonSerializationType<UserEvent>();

// Insert POCO - serialized to JSON with nested structure via custom path attributes
await client.InsertBinaryAsync(
    "events",
    new[] { "id", "data" },
    new[] { new object[] { 1u, new UserEvent { UserId = 123, UserName = "Alice", Timestamp = DateTime.UtcNow } } }
);
// Resulting JSON: {"user": {"id": 123, "name": "Alice"}, "Timestamp": "2024-01-15T..."}
```

属性名称与列类型提示的匹配是区分大小写的。属性 `UserId` 只会匹配定义为 `UserId` 的提示，而不会匹配 `userid`。这与 ClickHouse 的行为一致，它允许诸如 `userName` 和 `UserName` 这样的路径作为不同字段并存。

**限制（仅 Binary 模式）：**

* 在序列化之前，必须在连接上使用 `connection.RegisterJsonSerializationType<T>()` 先注册 POCO 类型。尝试序列化未注册的类型会抛出 `ClickHouseJsonSerializationException`。
* 字典和数组/列表属性在列定义中需要提供类型提示，才能被正确序列化。如果没有类型提示，请改用 String 模式。
* 只有当路径在列定义中具有 `Nullable(T)` 类型提示时，POCO 属性中的空值才会被写入。ClickHouse 不允许在动态 JSON 路径中使用 `Nullable` 类型，因此未提供类型提示的空属性会被跳过。
* 在 String 模式下会忽略 `ClickHouseJsonPath` 和 `ClickHouseJsonIgnore` 特性（它们仅在 Binary 模式下生效）。

***


#### 其他类型 \{#type-map-writing-other\}

| ClickHouse 类型 | 可接受的 .NET 类型 | 说明 |
|-----------------|---------------------|------|
| UUID | `Guid`, `string` | 字符串将被解析为 Guid |
| IPv4 | `IPAddress`, `string` | 必须为 IPv4；字符串通过 `IPAddress.Parse()` 解析 |
| IPv6 | `IPAddress`, `string` | 必须为 IPv6；字符串通过 `IPAddress.Parse()` 解析 |
| Nothing | 任意类型 | 不写入任何内容（no-op） |
| Dynamic | — | **不支持**（抛出 `NotImplementedException`） |
| Array(T) | `IList`, `null` | 将 null 写为空数组 |
| Tuple(T1, T2, ...) | `ITuple`, `IList` | 元素数量必须与元组的元数一致 |
| Map(K, V) | `IDictionary` | |
| Nullable(T) | `null`, `DBNull`，或 T 可接受的类型 | 在值前写入一个 null 标志字节 |
| Enum8 | `string`, `sbyte`, 数值类型 | 字符串将在枚举字典中查找对应值 |
| Enum16 | `string`, `short`, 数值类型 | 字符串将在枚举字典中查找对应值 |
| LowCardinality(T) | T 可接受的类型 | 委托给底层类型 |
| SimpleAggregateFunction | 底层类型可接受的类型 | 委托给底层类型 |
| Nested(...) | 元组组成的 `IList` | 元素数量必须与字段数量一致 |
| Variant(T1, T2, ...) | 匹配 T1、T2 等之一的值 | 如果没有类型匹配则抛出 `ArgumentException` |
| QBit(T, dim) | `IList` | 委托给 Array；维度仅作为元数据存在 |

---

#### 几何类型 \{#type-map-writing-geometry\}

| ClickHouse Type | 接受的 .NET 类型 | 说明 |
|-----------------|------------------|------|
| Point | `System.Drawing.Point`、`ITuple`、`IList`（含 2 个元素） |  |
| Ring | Point 的 `IList` | |
| LineString | Point 的 `IList` | |
| Polygon | Ring 的 `IList` | |
| MultiLineString | LineString 的 `IList` | |
| MultiPolygon | Polygon 的 `IList` | |
| Geometry | 以上任意几何类型 | 包含所有几何类型的变体 |

---

#### 不支持写入 \{#type-map-writing-not-supported\}

| ClickHouse 类型 | 说明 |
|-----------------|-------|
| Dynamic | 会抛出 `NotImplementedException` |
| AggregateFunction | 会抛出 `AggregateFunctionException` |

---

### 嵌套类型处理 \{#nested-type-handling\}

ClickHouse 嵌套类型（`Nested(...)`）可以按照数组语义进行读写。

```sql
CREATE TABLE test.nested (
    id UInt32,
    params Nested (param_id UInt8, param_val String)
) ENGINE = Memory
```

```csharp
var row1 = new object[] { 1, new[] { 1, 2, 3 }, new[] { "v1", "v2", "v3" } };
var row2 = new object[] { 2, new[] { 4, 5, 6 }, new[] { "v4", "v5", "v6" } };

await client.InsertBinaryAsync(
    "test.nested",
    new[] { "id", "params.param_id", "params.param_val" },
    new[] { row1, row2 }
);
```


## 日志和诊断 \{#logging-and-diagnostics\}

ClickHouse .NET 客户端与 `Microsoft.Extensions.Logging` 抽象层集成，提供轻量级、可选启用的日志记录功能。启用后，驱动程序会针对连接生命周期事件、命令执行、传输操作以及批量插入操作输出结构化消息。日志记录完全是可选的——未配置记录器的应用程序将继续正常运行，并且不会引入任何额外开销。

### 快速开始 \{#logging-quick-start\}

```csharp
using ClickHouse.Driver;
using Microsoft.Extensions.Logging;

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConsole()
        .SetMinimumLevel(LogLevel.Information);
});

var settings = new ClickHouseClientSettings("Host=localhost;Port=8123")
{
    LoggerFactory = loggerFactory
};

using var client = new ClickHouseClient(settings);
```


#### 使用 appsettings.json \{#logging-appsettings-config\}

可以使用标准的 .NET 配置来配置日志级别：

```csharp
using ClickHouse.Driver;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

var configuration = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json")
    .Build();

var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConfiguration(configuration.GetSection("Logging"))
        .AddConsole();
});

var settings = new ClickHouseClientSettings("Host=localhost;Port=8123")
{
    LoggerFactory = loggerFactory
};

using var client = new ClickHouseClient(settings);
```


#### 使用内存配置 \{#logging-inmemory-config\}

你也可以在代码中按类别配置日志的详细程度：

```csharp
using ClickHouse.Driver;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

var categoriesConfiguration = new Dictionary<string, string>
{
    { "LogLevel:Default", "Warning" },
    { "LogLevel:ClickHouse.Driver.Connection", "Information" },
    { "LogLevel:ClickHouse.Driver.Command", "Debug" }
};

var config = new ConfigurationBuilder()
    .AddInMemoryCollection(categoriesConfiguration)
    .Build();

using var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConfiguration(config)
        .AddSimpleConsole();
});

var settings = new ClickHouseClientSettings("Host=localhost;Port=8123")
{
    LoggerFactory = loggerFactory
};

using var client = new ClickHouseClient(settings);
```


### 分类与发射源 \{#logging-categories\}

驱动程序使用专用日志分类，便于按组件精细调整日志级别：

| 分类 | 源 | 要点 |
| --- | --- | --- |
| `ClickHouse.Driver.Connection` | `ClickHouseConnection` | 连接生命周期、HTTP 客户端工厂的选择、连接打开/关闭、会话管理。 |
| `ClickHouse.Driver.Command` | `ClickHouseCommand` | 查询执行开始/完成、计时、查询 ID、服务器统计信息和错误详情。 |
| `ClickHouse.Driver.Transport` | `ClickHouseConnection` | 底层 HTTP 流式请求、压缩标志、响应状态码以及传输失败情况。 |
| `ClickHouse.Driver.Client` | `ClickHouseClient` | 二进制插入、查询以及其他操作。 |
| `ClickHouse.Driver.NetTrace` | `TraceHelper` | 网络跟踪，仅在启用调试模式时生效。 |

#### 示例：排查连接问题 \{#logging-config-example\}

```json
{
    "Logging": {
        "LogLevel": {
            "ClickHouse.Driver.Connection": "Trace",
            "ClickHouse.Driver.Transport": "Trace"
        }
    }
}
```

这将记录：

* HTTP 客户端工厂的选择（默认连接池 vs 单连接）
* HTTP 处理程序配置（SocketsHttpHandler 或 HttpClientHandler）
* 连接池设置（MaxConnectionsPerServer、PooledConnectionLifetime 等）
* 超时设置（ConnectTimeout、Expect100ContinueTimeout 等）
* SSL/TLS 配置
* 连接打开/关闭事件
* 会话 ID 跟踪

### 调试模式：网络跟踪与诊断 \{#logging-debugmode\}

为帮助诊断网络问题，驱动程序库提供了一个辅助工具，可启用对 .NET 网络内部机制的底层跟踪。要启用它，必须传入一个 LoggerFactory，并将日志级别设置为 Trace，同时将 EnableDebugMode 设置为 true（或者通过 `ClickHouse.Driver.Diagnostic.TraceHelper` 类手动启用）。日志事件将记录到 `ClickHouse.Driver.NetTrace` 类别中。警告：这会生成极其冗长的日志，并影响性能。不建议在生产环境中启用调试模式。

```csharp
var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConsole()
        .SetMinimumLevel(LogLevel.Trace); // Must be Trace level to see network events
});

var settings = new ClickHouseClientSettings()
{
    LoggerFactory = loggerFactory,
    EnableDebugMode = true,  // Enable low-level network tracing
};
```


## OpenTelemetry \{#opentelemetry\}

该驱动通过 .NET [`System.Diagnostics.Activity`](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing) API 提供对 OpenTelemetry 分布式追踪的内置支持。启用后，驱动会为数据库操作生成 spans，这些 spans 可以导出到 Jaeger 等可观测性后端系统，或者通过 [OpenTelemetry Collector](https://clickhouse.com/docs/observability/integrating-opentelemetry) 导出到 ClickHouse 本身。

### 启用追踪 \{#opentelemetry-enabling\}

在 ASP.NET Core 应用程序中，将 ClickHouse 驱动程序的 `ActivitySource` 添加到 OpenTelemetry 配置中：

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddSource(ClickHouseDiagnosticsOptions.ActivitySourceName)  // Subscribe to ClickHouse driver spans
        .AddAspNetCoreInstrumentation()
        .AddOtlpExporter());             // Or AddJaegerExporter(), etc.
```

用于控制台应用程序、测试或手动设置：

```csharp
using OpenTelemetry;
using OpenTelemetry.Trace;

var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(ClickHouseDiagnosticsOptions.ActivitySourceName)
    .AddConsoleExporter()
    .Build();
```


### Span 属性 \{#opentelemetry-attributes\}

每个 span 都包含标准的 OpenTelemetry 数据库属性，以及可用于调试的 ClickHouse 特有查询统计信息。

| Attribute | Description |
|-----------|-------------|
| `db.system` | 始终为 `"clickhouse"` |
| `db.name` | 数据库名称 |
| `db.user` | 用户名 |
| `db.statement` | SQL 查询（如果已启用） |
| `db.clickhouse.read_rows` | 查询读取的行数 |
| `db.clickhouse.read_bytes` | 查询读取的字节数 |
| `db.clickhouse.written_rows` | 查询写入的行数 |
| `db.clickhouse.written_bytes` | 查询写入的字节数 |
| `db.clickhouse.elapsed_ns` | 服务器端执行时间（纳秒） |

### 配置选项 \{#opentelemetry-configuration\}

通过 `ClickHouseDiagnosticsOptions` 控制跟踪行为：

```csharp
using ClickHouse.Driver.Diagnostic;

// Include SQL statements in spans (default: false for security)
ClickHouseDiagnosticsOptions.IncludeSqlInActivityTags = true;

// Truncate long SQL statements (default: 1000 characters)
ClickHouseDiagnosticsOptions.StatementMaxLength = 500;
```

:::warning
启用 `IncludeSqlInActivityTags` 可能会在跟踪数据中暴露敏感数据。在生产环境中请谨慎使用。
:::


## TLS 配置 \{#tls-configuration\}

通过 HTTPS 连接到 ClickHouse 时，可以使用多种方式配置 TLS/SSL 行为。

### 自定义证书验证 \{#custom-certificate-validation\}

在生产环境中如需自定义证书验证逻辑，请提供一个自定义的 `HttpClient` 实例，并配置 `ServerCertificateCustomValidationCallback` 处理程序：

```csharp
using System.Net;
using System.Net.Security;
using ClickHouse.Driver;

var handler = new HttpClientHandler
{
    // Required when compression is enabled (default)
    AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate,

    ServerCertificateCustomValidationCallback = (message, cert, chain, sslPolicyErrors) =>
    {
        // Example: Accept a specific certificate thumbprint
        if (cert?.Thumbprint == "YOUR_EXPECTED_THUMBPRINT")
            return true;

        // Example: Accept certificates from a specific issuer
        if (cert?.Issuer.Contains("YourOrganization") == true)
            return true;

        // Default: Use standard validation
        return sslPolicyErrors == SslPolicyErrors.None;
    },
};

var httpClient = new HttpClient(handler) { Timeout = TimeSpan.FromMinutes(5) };

var settings = new ClickHouseClientSettings
{
    Host = "my.clickhouse.server",
    Protocol = "https",
    HttpClient = httpClient,
};

using var client = new ClickHouseClient(settings);
```

:::note
在提供自定义 HttpClient 时需要注意的重要事项

* **自动解压缩**：如果未禁用压缩功能（默认启用压缩），必须启用 `AutomaticDecompression`。
* **空闲超时**：将 `PooledConnectionIdleTimeout` 设置为小于服务器的 `keep_alive_timeout`（ClickHouse Cloud 默认为 10 秒），以避免由于半开连接导致的连接错误。
  :::


## ORM 支持 \{#orm-support\}

ORM 依赖 ADO.NET API（`ClickHouseConnection`）。为正确管理连接的生命周期，应从 `ClickHouseDataSource` 创建连接：

```csharp
// Register DataSource as singleton
var dataSource = new ClickHouseDataSource("Host=localhost;Username=default");

// Create connections for ORM use
await using var connection = await dataSource.OpenConnectionAsync();
// Pass connection to your ORM...
```


### Dapper \{#orm-support-dapper\}

`ClickHouse.Driver` 可以与 Dapper 一起使用，但不支持匿名对象。

**可运行示例：**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new Dictionary<string, object> { { "p1", 42 } }
);
```

**不支持：**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new { p1 = 42 }
);
```


### Linq2db \{#orm-support-linq2db\}

此驱动程序兼容 [linq2db](https://github.com/linq2db/linq2db)，这是一个用于 .NET 的轻量级 ORM 和 LINQ 提供程序。有关详细文档，请参阅该项目主页。

**使用示例：**

使用 ClickHouse 提供程序创建一个 `DataConnection` 实例：

```csharp
using LinqToDB;
using LinqToDB.Data;
using LinqToDB.DataProvider.ClickHouse;

var connectionString = "Host=localhost;Port=8123;Database=default";
var options = new DataOptions()
    .UseClickHouse(connectionString, ClickHouseProvider.ClickHouseDriver);

await using var db = new DataConnection(options);
```

可以使用特性或 fluent 配置来定义表映射。如果类名和属性名与表名和列名完全一致，则无需额外配置：

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
}
```

**查询：**

```csharp
await using var db = new DataConnection(options);

var products = await db.GetTable<Product>()
    .Where(p => p.Price > 100)
    .OrderByDescending(p => p.Name)
    .ToListAsync();
```

**批量复制：**

使用 `BulkCopyAsync` 以高效地执行批量插入。

```csharp
await using var db = new DataConnection(options);
var table = db.GetTable<Product>();

var options = new BulkCopyOptions
{
    MaxBatchSize = 100000,
    MaxDegreeOfParallelism = 1,
    WithoutSession = true
};

await table.BulkCopyAsync(options, products);
```


### Entity framework core \{#orm-support-ef-core\}

当前尚不支持 Entity Framework Core。

## 限制 \{#limitations\}

### AggregateFunction 列 \{#aggregatefunction-columns\}

类型为 `AggregateFunction(...)` 的列不能直接进行查询或插入操作。

要进行插入：

```sql
INSERT INTO t VALUES (uniqState(1));
```

选择：

```sql
SELECT uniqMerge(c) FROM t;
```

***
