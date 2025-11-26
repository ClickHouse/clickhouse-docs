---
sidebar_label: 'C#'
sidebar_position: 6
keywords: ['clickhouse', 'cs', 'c#', '.net', 'dotnet', 'csharp', 'client', 'driver', 'connect', 'integrate']
slug: /integrations/csharp
description: '用于连接 ClickHouse 的官方 C# 客户端。'
title: 'ClickHouse C# 驱动程序'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-cs'
---



# ClickHouse C# 客户端

用于连接 ClickHouse 的官方 C# 客户端。
客户端源代码可在 [GitHub 仓库](https://github.com/ClickHouse/clickhouse-cs) 中获取。
最初由 [Oleg V. Kozlyuk](https://github.com/DarkWanderer) 开发。



## 迁移指南 {#migration-guide}

1. 在 `.csproj` 文件中将包名更新为 `ClickHouse.Driver`，并升级到 [NuGet 上的最新版本](https://www.nuget.org/packages/ClickHouse.Driver)。
2. 将代码库中所有对 `ClickHouse.Client` 的引用替换为 `ClickHouse.Driver`。

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



## 安装

从 NuGet 安装该程序包：

```bash
dotnet add package ClickHouse.Driver
```

或者使用 NuGet 包管理器：

```bash
Install-Package ClickHouse.Driver
```

***


## 快速入门

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


## 用法

### 连接字符串参数

| 参数                  | 描述                        | 默认值                             |
| ------------------- | ------------------------- | ------------------------------- |
| `Host`              | ClickHouse 服务器地址          | `localhost`                     |
| `Port`              | ClickHouse 服务器端口          | `8123` 或 `8443`（取决于 `Protocol`） |
| `Database`          | 初始数据库                     | `default`                       |
| `Username`          | 认证用户名                     | `default`                       |
| `Password`          | 认证密码                      | *(空)*                           |
| `Protocol`          | 连接协议（`http` 或 `https`）    | `http`                          |
| `Compression`       | 启用 Gzip 压缩                | `true`                          |
| `UseSession`        | 启用持久化的服务器会话               | `false`                         |
| `SessionId`         | 自定义会话 ID                  | 随机 GUID                         |
| `Timeout`           | HTTP 超时时间（秒）              | `120`                           |
| `UseServerTimezone` | 对日期时间列使用服务器时区             | `true`                          |
| `UseCustomDecimals` | 对小数使用 `ClickHouseDecimal` | `false`                         |

**示例：** `Host=clickhouse;Port=8123;Username=default;Password=;Database=default`

:::note Sessions

`UseSession` 开关会启用服务器会话持久化，从而可以使用 `SET` 语句和临时表。会话在 60 秒无活动后会被重置（默认超时时间）。可以通过在 ClickHouse 语句中设置会话相关参数来延长会话生命周期。

`ClickHouseConnection` 类通常允许并行操作（多个线程可以并发执行查询）。但是，启用 `UseSession` 后，在任意时刻每个连接只允许一个活动查询（服务器端限制）。

:::

***

### 连接生命周期与连接池

`ClickHouse.Driver` 底层使用 `System.Net.Http.HttpClient`。`HttpClient` 为每个端点维护一个连接池。因此：

* `ClickHouseConnection` 对象与 TCP 连接之间不是 1:1 对应关系——每台服务器上的多个数据库会话会通过若干个（默认 2 个）TCP 连接复用。
* 在 `ClickHouseConnection` 对象被释放后，底层连接仍然可能保持存活。
* 可以通过传入自定义的 `HttpClient`（带自定义 `HttpClientHandler`）来调整此行为。

对于依赖注入（DI）环境，提供了一个专用构造函数 `ClickHouseConnection(string connectionString, IHttpClientFactory httpClientFactory, string httpClientName = "")`，用于统一管理 HTTP 客户端设置。

**建议：**

* 一个 `ClickHouseConnection` 表示与服务器的一次“会话”。它会通过查询服务器版本执行特性探测（因此在打开连接时有少量开销），但总体上可以安全地多次创建和销毁此类对象。
* 推荐的连接生命周期是：对一个跨多条查询的大型“事务”使用一个连接对象。由于连接启动存在少量开销，不建议为每条查询都创建新的连接对象。
* 如果应用需要处理大量事务，并且需要频繁创建/销毁 `ClickHouseConnection` 对象，建议使用 `IHttpClientFactory` 或一个静态的 `HttpClient` 实例来管理连接。

***

### 创建表

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

### 插入数据

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

### 批量插入

使用 `ClickHouseBulkCopy` 需要以下内容：

* 目标连接（`ClickHouseConnection` 实例）
* 目标表名（`DestinationTableName` 属性）
* 数据源（`IDataReader` 或 `IEnumerable<object[]>`）

```csharp
using ClickHouse.Driver.ADO;
using ClickHouse.Driver.Copy;

using var connection = new ClickHouseConnection(connectionString);
connection.Open();
```


using var bulkCopy = new ClickHouseBulkCopy(connection)
{
DestinationTableName = "default.my_table",
BatchSize = 100000,
MaxDegreeOfParallelism = 2
};

await bulkCopy.InitAsync(); // 通过加载目标列类型准备 ClickHouseBulkCopy 实例

var values = Enumerable.Range(0, 1000000)
.Select(i => new object[] { (long)i, "value" + i });

await bulkCopy.WriteToServerAsync(values);
Console.WriteLine($"Rows written: {bulkCopy.RowsWritten}");

````

:::note
* 为获得最佳性能,ClickHouseBulkCopy 使用任务并行库 (TPL) 处理数据批次,最多支持 4 个并行插入任务(可调整)。
* 如果源数据列数少于目标表,可通过 `ColumnNames` 属性选择性地提供列名。
* 可配置参数:`Columns`、`BatchSize`、`MaxDegreeOfParallelism`。
* 复制前会执行 `SELECT * FROM <table> LIMIT 0` 查询以获取目标表结构信息。提供的对象类型必须与目标表合理匹配。
* 会话与并行插入不兼容。传递给 `ClickHouseBulkCopy` 的连接必须禁用会话,或将 `MaxDegreeOfParallelism` 设置为 `1`。
:::

---

### 执行 SELECT 查询 {#performing-select-queries}

执行 SELECT 查询并处理结果:

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
````

---

### 原始流式传输 {#raw-streaming}

```csharp
using var command = connection.CreateCommand();
command.Text = "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow";
using var result = await command.ExecuteRawResultAsync(CancellationToken.None);
using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = reader.ReadToEnd();
```

---

### 嵌套列支持 {#nested-columns}

ClickHouse 嵌套类型 (`Nested(...)`) 可使用数组语义进行读写。

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

---

### AggregateFunction 列 {#aggregatefunction-columns}

`AggregateFunction(...)` 类型的列无法直接查询或插入。

插入时:

```sql
INSERT INTO t VALUES (uniqState(1));
```

查询时:

```sql
SELECT uniqMerge(c) FROM t;
```

---

### SQL 参数 {#sql-parameters}

在查询中传递参数时,必须使用 ClickHouse 参数格式,形式如下:

```sql
{<name>:<data type>}
```

**示例:**

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

- SQL '绑定'参数作为 HTTP URI 查询参数传递,因此使用过多参数可能导致"URL 过长"异常。
- 要插入大量记录,请考虑使用批量插入功能。
:::

---


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

**Decimal：**
* `Decimal` → `decimal`
* `Decimal32` → `decimal`
* `Decimal64` → `decimal`
* `Decimal128` → `decimal`
* `Decimal256` → `BigDecimal`

### 字符串类型 {#string-types}

* `String` → `string`
* `FixedString` → `string`

### 日期和时间类型 {#date-time-types}

* `Date` → `DateTime`
* `Date32` → `DateTime`
* `DateTime` → `DateTime`
* `DateTime32` → `DateTime`
* `DateTime64` → `DateTime`

### 网络类型 {#network-types}

* `IPv4` → `IPAddress`
* `IPv6` → `IPAddress`

### 地理类型 {#geographic-types}

* `Point` → `Tuple`
* `Ring` → `Point` 数组
* `Polygon` → `Ring` 数组

### 复杂类型 {#complex-types}

* `Array(T)` → 任意类型的数组
* `Tuple(T1, T2, ...)` → 任意类型的元组
* `Nullable(T)` → 任意类型的可空版本
* `Map(K, V)` → `Dictionary&lt;K, V&gt;`

---

### DateTime 处理方式 {#datetime-handling}

`ClickHouse.Driver` 会尽量正确处理时区和 `DateTime.Kind` 属性。具体而言：

* `DateTime` 值以 UTC 形式返回。用户可以自行转换，或者在 `DateTime` 实例上使用 `ToLocalTime()` 方法。
* 在插入时，`DateTime` 值按如下方式处理：
  * `UTC` `DateTime` 会“原样”插入，因为 ClickHouse 在内部以 UTC 存储它们。
  * `Local` `DateTime` 会根据用户本地时区设置转换为 UTC。
  * `Unspecified` `DateTime` 被视为处于目标列的时区中，因此会依据该时区转换为 UTC。
* 对于未指定时区的列，默认使用客户端时区（历史行为）。可以在连接字符串中使用 `UseServerTimezone` 标志来改为使用服务器时区。

---



## 日志和诊断

ClickHouse .NET 客户端与 `Microsoft.Extensions.Logging` 抽象层集成，以提供轻量级、按需启用的日志功能。启用后，驱动程序会为连接生命周期事件、命令执行、传输操作以及批量复制上传操作输出结构化日志消息。日志功能完全是可选的——未配置日志记录器的应用程序仍可继续运行且不会产生额外开销。

### 快速开始

#### 使用 ClickHouseConnection

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

#### 使用 appsettings.json

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

#### 使用内存配置

你还可以在代码中按类别配置日志的详细程度：

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

### 类别和发射器

驱动程序使用专用类别，因此你可以针对每个组件精细调整日志级别：

| 类别                             | 来源                     | 重点内容                               |
| ------------------------------ | ---------------------- | ---------------------------------- |
| `ClickHouse.Driver.Connection` | `ClickHouseConnection` | 连接生命周期、HTTP 客户端工厂的选择、连接打开/关闭、会话管理。 |
| `ClickHouse.Driver.Command`    | `ClickHouseCommand`    | 查询执行开始/结束、耗时、查询 ID、服务器统计信息和错误详情。   |
| `ClickHouse.Driver.Transport`  | `ClickHouseConnection` | 底层 HTTP 流式请求、压缩标志、响应状态码以及传输故障。     |
| `ClickHouse.Driver.BulkCopy`   | `ClickHouseBulkCopy`   | 元数据加载、批处理操作、行数统计和上传完成情况。           |

#### 示例：诊断连接问题

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

* HTTP 客户端工厂选择（默认连接池 vs 单个连接）
* HTTP 处理程序配置（SocketsHttpHandler 或 HttpClientHandler）
* 连接池设置（MaxConnectionsPerServer、PooledConnectionLifetime 等）
* 超时设置（ConnectTimeout、Expect100ContinueTimeout 等）
* SSL/TLS 配置
* 连接打开/关闭事件
* 会话 ID 跟踪

### 调试模式：网络跟踪与诊断

为帮助诊断网络问题，驱动库提供了一个辅助工具，用于启用对 .NET 网络内部实现的低层级跟踪。要启用此功能，您必须传入一个日志级别设置为 Trace 的 LoggerFactory 实例，并将 EnableDebugMode 设为 true（或通过 `ClickHouse.Driver.Diagnostic.TraceHelper` 类手动启用）。警告：这将生成极其详细的日志，并影响性能。不建议在生产环境中启用调试模式。

```csharp
var loggerFactory = LoggerFactory.Create(builder =>
{
    builder
        .AddConsole()
        .SetMinimumLevel(LogLevel.Trace); // 必须设置为 Trace 级别才能查看网络事件
});
```


var settings = new ClickHouseClientSettings()
{
LoggerFactory = loggerFactory,
EnableDebugMode = true, // 启用底层网络追踪
};

````

---

### ORM 与 Dapper 支持 {#orm-support}

`ClickHouse.Driver` 支持 Dapper(有限制)。

**可用示例:**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new Dictionary<string, object> { { "p1", 42 } }
);
````

**不支持:**

```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new { p1 = 42 }
);
```
