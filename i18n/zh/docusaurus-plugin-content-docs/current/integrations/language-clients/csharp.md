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

# ClickHouse C# 客户端 {#clickhouse-c-client}

用于连接 ClickHouse 的官方 C# 客户端。
客户端源代码托管在 [GitHub 仓库](https://github.com/ClickHouse/clickhouse-cs) 中。
最初由 [Oleg V. Kozlyuk](https://github.com/DarkWanderer) 开发。

## 迁移指南 {#migration-guide}

1. 在 `.csproj` 文件中将包名更新为 `ClickHouse.Driver`，并将版本更新为 [NuGet 上的最新版本](https://www.nuget.org/packages/ClickHouse.Driver)。
2. 将代码库中所有对 `ClickHouse.Client` 的引用更新为 `ClickHouse.Driver`。

---

## 支持的 .NET 版本 {#supported-net-versions}

`ClickHouse.Driver` 支持以下 .NET 版本：

* .NET Framework 4.6.2
* .NET Framework 4.8
* .NET Standard 2.1
* .NET 6.0
* .NET 8.0
* .NET 9.0
* .NET 10.0

---

## 安装 {#installation}

从 NuGet 安装该软件包：

```bash
dotnet add package ClickHouse.Driver
```

或者使用 NuGet 包管理器：

```bash
Install-Package ClickHouse.Driver
```

***

## 快速入门 {#quick-start}

```csharp
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection("Host=my.clickhouse;Protocol=https;Port=8443;Username=user"))
{
    var version = await connection.ExecuteScalarAsync("SELECT version()");
    Console.WriteLine(version);
}
```

使用 **Dapper**：

```csharp
using Dapper;
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection("Host=my.clickhouse"))
{
    var result = await connection.QueryAsync<string>("SELECT name FROM system.databases");
    Console.WriteLine(string.Join('\n', result));
}
```

***

## 使用方法 {#usage}

### 连接字符串参数 {#connection-string}

| 参数                | 描述                                            | 默认值              |
| ------------------- | ----------------------------------------------- | ------------------- |
| `Host`              | ClickHouse 服务器地址                           | `localhost`         |
| `Port`              | ClickHouse 服务器端口                           | `8123` 或 `8443`（取决于 `Protocol`） |
| `Database`          | 初始数据库                                     | `default`           |
| `Username`          | 身份验证用户名                                 | `default`           |
| `Password`          | 身份验证密码                                   | *(空)*              |
| `Protocol`          | 连接协议（`http` 或 `https`）                  | `http`              |
| `Compression`       | 启用 Gzip 压缩                                 | `true`              |
| `UseSession`        | 启用服务器会话持久化                           | `false`             |
| `SessionId`         | 自定义会话 ID                                  | 随机 GUID           |
| `Timeout`           | HTTP 超时时间（秒）                            | `120`               |
| `UseServerTimezone` | 对 datetime 列使用服务器的时区                 | `true`              |
| `UseCustomDecimals` | 对小数使用 `ClickHouseDecimal`                 | `false`             |

**示例：** `Host=clickhouse;Port=8123;Username=default;Password=;Database=default`

:::note Sessions

`UseSession` 选项启用服务器会话持久化，从而可以使用 `SET` 语句和临时表。会话在 60 秒无活动后将被重置（默认超时时间）。可以通过在 ClickHouse 语句中设置会话相关配置来延长会话生命周期。

`ClickHouseConnection` 类通常允许并行操作（多个线程可以并发执行查询）。但是，启用 `UseSession` 选项后，在任意时刻每个连接只能有一个活动查询（服务器端限制）。

:::

---

### 连接生命周期与连接池 {#connection-lifetime}

`ClickHouse.Driver` 在底层使用 `System.Net.Http.HttpClient`。`HttpClient` 会针对每个端点维护一个连接池。因此：

* 一个 `ClickHouseConnection` 对象并不是与 TCP 连接一一对应——多个数据库会话会通过每台服务器上的多个（默认 2 个）TCP 连接复用。
* 即使 `ClickHouseConnection` 对象已被释放，连接依然可能保持存活。
* 可以通过传入一个带有自定义 `HttpClientHandler` 的定制 `HttpClient` 来调整此行为。

对于依赖注入（DI）环境，提供了一个专用构造函数 `ClickHouseConnection(string connectionString, IHttpClientFactory httpClientFactory, string httpClientName = "")`，用于统一配置 HTTP 客户端设置。

**建议：**

* 一个 `ClickHouseConnection` 表示与服务器的一个“会话”。它会通过查询服务器版本进行特性探测（因此在打开连接时会有少量开销），但总体而言，多次创建和销毁此类对象是安全的。
* 建议的连接生命周期是：对一个跨多个查询的大型“事务”使用一个连接对象。由于连接建立存在少量开销，不建议为每个查询单独创建一个连接对象。
* 如果应用程序处理大量事务，并且需要频繁创建/销毁 `ClickHouseConnection` 对象，建议使用 `IHttpClientFactory` 或一个静态的 `HttpClient` 实例来管理连接。

---

### 创建表 {#creating-a-table}

使用标准 SQL 语法创建表：

```csharp
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection(connectionString))
{
    connection.Open();

    using (var command = connection.CreateCommand())
    {
        command.CommandText = "CREATE TABLE IF NOT EXISTS default.my_table (id Int64, name String) ENGINE = Memory";
        command.ExecuteNonQuery();
    }
}
```

***

### 插入数据 {#inserting-data}

使用参数化查询插入数据：

```csharp
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection(connectionString))
{
    connection.Open();

    using (var command = connection.CreateCommand())
    {
        command.AddParameter("id", "Int64", 1);
        command.AddParameter("name", "String", "test");
        command.CommandText = "INSERT INTO default.my_table (id, name) VALUES ({id:Int64}, {name:String})";
        command.ExecuteNonQuery();
    }
}
```

***

### 批量插入 {#bulk-insert}

使用 `ClickHouseBulkCopy` 时需要：

* 目标连接（`ClickHouseConnection` 实例）
* 目标表名（`DestinationTableName` 属性）
* 数据源（`IDataReader` 或 `IEnumerable<object[]>`）

```csharp
using ClickHouse.Driver.ADO;
using ClickHouse.Driver.Copy;

using var connection = new ClickHouseConnection(connectionString);
connection.Open();

using var bulkCopy = new ClickHouseBulkCopy(connection)
{
    DestinationTableName = "default.my_table",
    BatchSize = 100000,
    MaxDegreeOfParallelism = 2
};

await bulkCopy.InitAsync(); // Prepares ClickHouseBulkCopy instance by loading target column types

var values = Enumerable.Range(0, 1000000)
    .Select(i => new object[] { (long)i, "value" + i });

await bulkCopy.WriteToServerAsync(values);
Console.WriteLine($"Rows written: {bulkCopy.RowsWritten}");
```

:::note

* 为获得最佳性能，`ClickHouseBulkCopy` 使用 Task Parallel Library (TPL) 处理批量数据，最多可并行执行 4 个插入任务（此值可调）。
* 如果源数据的列数少于目标表的列数，可以通过 `ColumnNames` 属性可选地指定列名。
* 可配置参数：`Columns`、`BatchSize`、`MaxDegreeOfParallelism`。
* 在复制之前，会执行 `SELECT * FROM <table> LIMIT 0` 查询以获取目标表结构信息。要写入的对象类型必须与目标表结构合理匹配。
* 会话与并行插入不兼容。传递给 `ClickHouseBulkCopy` 的连接必须禁用会话，或者将 `MaxDegreeOfParallelism` 设置为 `1`。
  :::

***

### 执行 SELECT 查询 {#performing-select-queries}

执行 SELECT 查询并处理其结果：

```csharp
using ClickHouse.Driver.ADO;
using System.Data;

using (var connection = new ClickHouseConnection(connectionString))
{
    connection.Open();
    
    using (var command = connection.CreateCommand())
    {
        command.AddParameter("id", "Int64", 10);
        command.CommandText = "SELECT * FROM default.my_table WHERE id < {id:Int64}";
        using var reader = command.ExecuteReader();
        while (reader.Read())
        {
            Console.WriteLine($"select: Id: {reader.GetInt64(0)}, Name: {reader.GetString(1)}");
        }
    }
}
```

***

### 原始数据流 {#raw-streaming}

```csharp
using var command = connection.CreateCommand();
command.Text = "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow";
using var result = await command.ExecuteRawResultAsync(CancellationToken.None);
using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = reader.ReadToEnd();
```

***

### 嵌套列支持 {#nested-columns}

ClickHouse 嵌套类型（`Nested(...)`）可以按照数组语义进行读写。

```sql
CREATE TABLE test.nested (
    id UInt32,
    params Nested (param_id UInt8, param_val String)
) ENGINE = Memory
```

```csharp
using var bulkCopy = new ClickHouseBulkCopy(connection)
{
    DestinationTableName = "test.nested"
};

var row1 = new object[] { 1, new[] { 1, 2, 3 }, new[] { "v1", "v2", "v3" } };
var row2 = new object[] { 2, new[] { 4, 5, 6 }, new[] { "v4", "v5", "v6" } };

await bulkCopy.WriteToServerAsync(new[] { row1, row2 });
```

***

### AggregateFunction 列 {#aggregatefunction-columns}

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

### SQL 参数 {#sql-parameters}

要在查询中传递参数，必须使用 ClickHouse 的参数格式，形式如下：

```sql
{<name>:<data type>}
```

**示例：**

```sql
SELECT {value:Array(UInt16)} as value
```

```sql
SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}
```

```sql
INSERT INTO table VALUES ({val1:Int32}, {val2:Array(UInt8)})
```

:::note

* SQL `bind` 参数作为 HTTP URI 查询参数传递，因此如果使用过多，可能会触发 “URL too long” 异常。
* 若要插入大量记录，请考虑使用批量插入功能。
  :::

***

## 支持的数据类型 {#supported-data-types}

`ClickHouse.Driver` 支持以下 ClickHouse 数据类型及其对应的 .NET 类型映射：

### 布尔类型 {#boolean-types}

* `Bool` → `bool`

### 数值类型 {#numeric-types}

**有符号整数：**

* `Int8` → `sbyte`
* `Int16` → `short`
* `Int32` → `int`
* `Int64` → `long`
* `Int128` → `BigInteger`
* `Int256` → `BigInteger`

**无符号整数：**

* `UInt8` → `byte`
* `UInt16` → `ushort`
* `UInt32` → `uint`
* `UInt64` → `ulong`
* `UInt128` → `BigInteger`
* `UInt256` → `BigInteger`

**浮点数：**

* `Float32` → `float`
* `Float64` → `double`

**Decimal 类型：**

* `Decimal` → `decimal`
* `Decimal32` → `decimal`
* `Decimal64` → `decimal`
* `Decimal128` → `decimal`
* `Decimal256` → `BigDecimal`

### 字符串类型 {#string-types}

* `String` → `string`
* `FixedString` → `string`

### 日期时间类型 {#date-time-types}

* `Date` → `DateTime`
* `Date32` → `DateTime`
* `DateTime` → `DateTime`
* `DateTime32` → `DateTime`
* `DateTime64` → `DateTime`

### 网络类型 {#network-types}

* `IPv4` → `IPAddress`
* `IPv6` → `IPAddress`

### 地理数据类型 {#geographic-types}

* `Point` → `Tuple`
* `Ring` → `Array of Points`
* `Polygon` → `Array of Rings`

### 复杂类型 {#complex-types}

* `Array(T)` → `任意类型的数组`
* `Tuple(T1, T2, ...)` → `任意类型的元组`
* `Nullable(T)` → `任意类型的可空版本`
* `Map(K, V)` → `Dictionary<K, V>`

---

### DateTime 处理 {#datetime-handling}

`ClickHouse.Driver` 会正确处理时区和 `DateTime.Kind` 属性。具体来说：

* `DateTime` 值以 UTC 返回。用户可以自行进行转换，或者在 `DateTime` 实例上使用 `ToLocalTime()` 方法。
* 插入时，`DateTime` 值按如下方式处理：
  * `UTC` 的 `DateTime` 会按原样插入，因为 ClickHouse 在内部以 UTC 存储它们。
  * `Local` 的 `DateTime` 会根据用户本地时区设置转换为 UTC。
  * `Unspecified` 的 `DateTime` 会被视为处于目标列对应的时区，因此会根据该时区转换为 UTC。
* 对于未指定时区的列，默认使用客户端时区（兼容旧行为）。可以在连接字符串中使用 `UseServerTimezone` 标志来改用服务器时区。

---

## 日志和诊断 {#logging-and-diagnostics}

ClickHouse .NET 客户端与 `Microsoft.Extensions.Logging` 抽象层集成，提供轻量级、可选启用的日志记录功能。启用后，驱动程序会针对连接生命周期事件、命令执行、传输操作以及批量复制上传输出结构化消息。日志记录完全是可选的——未配置记录器的应用程序将继续正常运行，并且不会引入任何额外开销。

### 快速开始 {#logging-quick-start}

#### 使用 ClickHouseConnection {#logging-clickhouseconnection}

```csharp
using ClickHouse.Driver.ADO;
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

await using var connection = new ClickHouseConnection(settings);
await connection.OpenAsync();
```

#### 使用 appsettings.json {#logging-appsettings-config}

可以使用标准的 .NET 配置来配置日志级别：

```csharp
using ClickHouse.Driver.ADO;
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

await using var connection = new ClickHouseConnection(settings);
await connection.OpenAsync();
```

#### 使用内存配置 {#logging-inmemory-config}

你也可以在代码中按类别配置日志的详细程度：

```csharp
using ClickHouse.Driver.ADO;
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

await using var connection = new ClickHouseConnection(settings);
await connection.OpenAsync();
```

### 分类与发射源 {#logging-categories}

驱动程序使用专用日志分类，便于按组件精细调整日志级别：

| 分类 | 源 | 要点 |
| --- | --- | --- |
| `ClickHouse.Driver.Connection` | `ClickHouseConnection` | 连接生命周期、HTTP 客户端工厂的选择、连接打开/关闭、会话管理。 |
| `ClickHouse.Driver.Command` | `ClickHouseCommand` | 查询执行开始/完成、计时、查询 ID、服务器统计信息和错误详情。 |
| `ClickHouse.Driver.Transport` | `ClickHouseConnection` | 底层 HTTP 流式请求、压缩标志、响应状态码以及传输失败情况。 |
| `ClickHouse.Driver.BulkCopy` | `ClickHouseBulkCopy` | 元数据加载、批量操作、行计数以及上传完成情况。 |

#### 示例：排查连接问题 {#logging-config-example}

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

### 调试模式：网络跟踪与诊断 {#logging-debugmode}

为帮助诊断网络问题，驱动程序库提供了一个辅助工具，可启用对 .NET 网络内部机制的底层跟踪。要启用它，必须传入一个 LoggerFactory，并将日志级别设置为 Trace，同时将 EnableDebugMode 设置为 true（或者通过 `ClickHouse.Driver.Diagnostic.TraceHelper` 类手动启用）。警告：这会生成极其冗长的日志，并影响性能。不建议在生产环境中启用调试模式。

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

***

### ORM &amp; Dapper 支持 {#orm-support}

`ClickHouse.Driver` 支持 Dapper（有一定限制）。

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
