---
'sidebar_label': 'C#'
'sidebar_position': 6
'keywords':
- 'clickhouse'
- 'cs'
- 'c#'
- '.net'
- 'dotnet'
- 'csharp'
- 'client'
- 'driver'
- 'connect'
- 'integrate'
'slug': '/integrations/csharp'
'description': '官方 C# 客户端，用于连接到 ClickHouse。'
'title': 'ClickHouse C# 驱动'
'doc_type': 'guide'
---


# ClickHouse C# Client

官方 C# 客户端用于连接 ClickHouse。  
客户端源代码可在 [GitHub 仓库](https://github.com/ClickHouse/clickhouse-cs) 中找到。  
最初由 [Oleg V. Kozlyuk](https://github.com/DarkWanderer) 开发。

## Migration guide {#migration-guide}
1. 使用 `ClickHouse.Driver` 名称更新 `.csproj` 和 [最新版本的包](https://www.nuget.org/packages/ClickHouse.Driver)。
2. 更新您的代码，以使用新的 `ClickHouse.Driver` 命名空间和类。

## Supported .NET Versions {#supported-net-versions}

`ClickHouse.Driver` 支持以下 .NET 版本：
* .NET Framework 4.6.2
* .NET Framework 4.8
* .NET Standard 2.1
* .NET 6.0
* .NET 8.0
* .NET 9.0

## Installation {#installation}

从 NuGet 安装包：

```bash
dotnet add package ClickHouse.Driver
```

或使用 NuGet 包管理器：

```bash
Install-Package ClickHouse.Driver
```

## Usage {#usage}

### Creating a Connection {#creating-a-connection}

使用连接字符串创建连接：

```csharp
using ClickHouse.Driver.ADO;

var connectionString = "Host=localhost;Protocol=http;Database=default;Username=default;Password=";

using (var connection = new ClickHouseConnection(connectionString))
{
    connection.Open();
}
```

### Creating a Table {#creating-a-table}

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

### Inserting Data {#inserting-data}

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

### Bulk Insert {#bulk-insert}

```csharp
using ClickHouse.Driver.ADO;
using ClickHouse.Driver.Copy;

using (var connection = new ClickHouseConnection(connectionString))
{
    connection.Open();

    using var bulkInsert = new ClickHouseBulkCopy(connection)
    {
        DestinationTableName = "default.my_table",
        MaxDegreeOfParallelism = 2,
        BatchSize = 100
    };

    var values = Enumerable.Range(0, 100).Select(i => new object[] { (long)i, "value" + i.ToString() });
    await bulkInsert.WriteToServerAsync(values);
    Console.WriteLine($"Rows written: {bulkInsert.RowsWritten}");
}
```

### Performing SELECT Queries {#performing-select-queries}

执行 SELECT 查询并处理结果：

```csharp
using ClickHouse.Client.ADO;
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
### Raw streaming {#raw-streaming}
```csharp
using var command = connection.CreateCommand();
command.Text = "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow";
using var result = await command.ExecuteRawResultAsync(CancellationToken.None);
using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = reader.ReadToEnd();
```

## Supported Data Types {#supported-data-types}

`ClickHouse.Driver` 支持以下 ClickHouse 数据类型：
**布尔类型**
* `Bool` (bool)

**数字类型**：
* `Int8` (sbyte)
* `Int16` (short)
* `Int32` (int)
* `Int64` (long)
* `Int128` (BigInteger)
* `Int256` (BigInteger)
* `UInt8` (byte)
* `UInt16` (ushort)
* `UInt32` (uint)
* `UInt64` (ulong)
* `UInt128` (BigInteger)
* `UInt256` (BigInteger)
* `Float32` (float)
* `Float64` (double)
* `Decimal` (decimal)
* `Decimal32` (decimal)
* `Decimal64` (decimal)
* `Decimal256` (BigDecimal)

**字符串类型**
* `String` (string)
* `FixedString` (string)

**日期和时间类型**
* `Date` (DateTime)
* `Date32` (DateTime)
* `DateTime` (DateTime)
* `DateTime32` (DateTime)
* `DateTime64` (DateTime)

**网络类型**
* `IPv4` (IPAddress)
* `IPv6` (IPAddress)

**地理类型**
* `Point` (Tuple)
* `Ring` (Array of Points)
* `Polygon` (Array of Rings)

**复杂类型**
* `Array` (Array of any type)
* `Tuple` (Tuple of any types)
* `Nullable` (Nullable version of any type)

### DateTime handling {#datetime-handling}
`ClickHouse.Driver` 尝试正确处理时区和 `DateTime.Kind` 属性。具体来说：

`DateTime` 值作为 UTC 返回。用户可以自行转换，或在 `DateTime` 实例上使用 `ToLocalTime()` 方法。  
插入时，`DateTime` 值的处理方式如下：
- UTC `DateTime` 直接插入，因为 ClickHouse 内部以 UTC 存储。
- 本地 `DateTime` 根据用户的本地时区设置转换为 UTC。
- 未指定的 `DateTime` 被视为目标列的时区，因此根据该时区转换为 UTC。
