---
sidebar_label: 'C#'
sidebar_position: 6
keywords: ['clickhouse', 'cs', 'c#', '.net', 'dotnet', 'csharp', 'client', 'driver', 'connect', 'integrate']
slug: /integrations/csharp
description: 'The official C# client for connecting to ClickHouse.'
title: 'ClickHouse C# Driver'
doc_type: 'guide'
integration:
  support_level: 'core'
  category: 'language_client'
  website: 'https://github.com/ClickHouse/clickhouse-cs'
---

# ClickHouse C# Client

The official C# client for connecting to ClickHouse.
The client source code is available in the [GitHub repository](https://github.com/ClickHouse/clickhouse-cs).
Originally developed by [Oleg V. Kozlyuk](https://github.com/DarkWanderer).

## Migration Guide {#migration-guide}

1. Update your `.csproj` file with the new package name `ClickHouse.Driver` and [the latest version on NuGet](https://www.nuget.org/packages/ClickHouse.Driver).
2. Update all `ClickHouse.Client` references to `ClickHouse.Driver` in your codebase.

---

## Supported .NET Versions {#supported-net-versions}

`ClickHouse.Driver` supports the following .NET versions:

* .NET Framework 4.6.2
* .NET Framework 4.8
* .NET Standard 2.1
* .NET 6.0
* .NET 8.0
* .NET 9.0

---

## Installation {#installation}

Install the package from NuGet:
```bash
dotnet add package ClickHouse.Driver
```

Or using the NuGet Package Manager:
```bash
Install-Package ClickHouse.Driver
```

---

## Usage {#usage}

### Creating a Connection {#creating-a-connection}
```csharp
using ClickHouse.Driver.ADO;

var connectionString = "Host=localhost;Protocol=http;Database=default;Username=default;Password=";

using (var connection = new ClickHouseConnection(connectionString))
{
    connection.Open();
}
```

---

### Connection String Parameters {#connection-string}

| Parameter           | Description                                     | Default             |
| ------------------- | ----------------------------------------------- | ------------------- |
| `Host`              | ClickHouse server address                       | `localhost`         |
| `Port`              | Server port (`8123` for HTTP, `8443` for HTTPS) | Depends on protocol |
| `Database`          | Initial database                                | `default`           |
| `Username`          | Authentication username                         | `default`           |
| `Password`          | Authentication password                         | *(empty)*           |
| `Protocol`          | Connection protocol (`http` or `https`)         | `http`              |
| `Compression`       | Enables GZip compression                        | `true` (v2.0+)      |
| `UseSession`        | Enables persistent server session               | `false`             |
| `SessionId`         | Custom session ID                               | Random GUID         |
| `Timeout`           | HTTP timeout (seconds)                          | `120`               |
| `UseServerTimezone` | Use server timezone for datetime columns        | `true` (≥6.0.0)     |
| `UseCustomDecimals` | Use `ClickHouseDecimal` for decimals            | `false`             |

> **Note:** When `UseSession` is enabled, only one active query per connection is allowed (server limitation).
> Session expires after 60s of inactivity by default.

---

### Connection Lifetime & Pooling {#connection-lifetime}

`ClickHouse.Driver` uses `System.Net.Http.HttpClient` internally.
Each endpoint maintains a small connection pool (2 TCP connections by default).
Disposing a `ClickHouseConnection` doesn't immediately close underlying sockets.

**Recommendations:**

* Create one `ClickHouseConnection` per large transaction.
* Reuse connections for multiple queries.
* Use `IHttpClientFactory` for DI scenarios:
```csharp
  new ClickHouseConnection(connectionString, httpClientFactory, "clickhouse");
```

---

### Creating a Table {#creating-a-table}
```csharp
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection(connectionString))
{
    connection.Open();
    using var command = connection.CreateCommand();
    command.CommandText = "CREATE TABLE IF NOT EXISTS default.my_table (id Int64, name String) ENGINE = Memory";
    command.ExecuteNonQuery();
}
```

---

### Inserting Data {#inserting-data}
```csharp
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection(connectionString))
{
    connection.Open();
    using var command = connection.CreateCommand();
    command.AddParameter("id", "Int64", 1);
    command.AddParameter("name", "String", "test");
    command.CommandText = "INSERT INTO default.my_table (id, name) VALUES ({id:Int64}, {name:String})";
    command.ExecuteNonQuery();
}
```

---

### Bulk Insert {#bulk-insert}
```csharp
using ClickHouse.Driver.ADO;
using ClickHouse.Driver.Copy;

using var connection = new ClickHouseConnection(connectionString);
connection.Open();

using var bulkInsert = new ClickHouseBulkCopy(connection)
{
    DestinationTableName = "default.my_table",
    MaxDegreeOfParallelism = 2,
    BatchSize = 100
};

var values = Enumerable.Range(0, 100)
    .Select(i => new object[] { (long)i, "value" + i });

await bulkInsert.WriteToServerAsync(values);
Console.WriteLine($"Rows written: {bulkInsert.RowsWritten}");
```

**Notes:**

* Uses TPL with up to 4 parallel insertion tasks.
* `Columns`, `BatchSize`, and `MaxDegreeOfParallelism` are configurable.
* Automatically queries target table schema (`SELECT * FROM <table> LIMIT 0`) to verify types.
* When using sessions, set `MaxDegreeOfParallelism = 1`.

---

### Performing SELECT Queries {#performing-select-queries}
```csharp
using ClickHouse.Driver.ADO;

using var connection = new ClickHouseConnection(connectionString);
connection.Open();

using var command = connection.CreateCommand();
command.AddParameter("id", "Int64", 10);
command.CommandText = "SELECT * FROM default.my_table WHERE id < {id:Int64}";
using var reader = command.ExecuteReader();
while (reader.Read())
{
    Console.WriteLine($"Id: {reader.GetInt64(0)}, Name: {reader.GetString(1)}");
}
```

---

### Raw Streaming {#raw-streaming}
```csharp
using var command = connection.CreateCommand();
command.Text = "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow";
using var result = await command.ExecuteRawResultAsync(CancellationToken.None);
using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = reader.ReadToEnd();
```

---

### Nested Columns Support {#nested-columns}

ClickHouse nested types (`Nested(...)`) can be read and written using array semantics.
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

### AggregateFunction Columns {#aggregatefunction-columns}

Columns of type `AggregateFunction(...)` cannot be queried or inserted directly.

To insert:
```sql
INSERT INTO t VALUES (uniqState(1));
```

To select:
```sql
SELECT uniqMerge(c) FROM t;
```

---

### SQL Parameters {#sql-parameters}

ClickHouse uses a custom syntax for parameters:
```sql
SELECT * FROM table WHERE id = {id:Int32}
```

Notes:

* Parameters are passed as HTTP query args.
* Avoid excessive parameters (can cause "URL too long").
* Use Bulk Insert for large datasets.

---

## Supported Data Types {#supported-data-types}

`ClickHouse.Driver` supports the following ClickHouse data types with their corresponding .NET type mappings:

### Boolean Types

* `Bool` → `bool`

### Numeric Types

**Signed Integers:**
* `Int8` → `sbyte`
* `Int16` → `short`
* `Int32` → `int`
* `Int64` → `long`
* `Int128` → `BigInteger`
* `Int256` → `BigInteger`

**Unsigned Integers:**
* `UInt8` → `byte`
* `UInt16` → `ushort`
* `UInt32` → `uint`
* `UInt64` → `ulong`
* `UInt128` → `BigInteger`
* `UInt256` → `BigInteger`

**Floating Point:**
* `Float32` → `float`
* `Float64` → `double`

**Decimal:**
* `Decimal` → `decimal`
* `Decimal32` → `decimal`
* `Decimal64` → `decimal`
* `Decimal128` → `decimal`
* `Decimal256` → `BigDecimal`

### String Types

* `String` → `string`
* `FixedString` → `string`

### Date and Time Types

* `Date` → `DateTime`
* `Date32` → `DateTime`
* `DateTime` → `DateTime`
* `DateTime32` → `DateTime`
* `DateTime64` → `DateTime`

### Network Types

* `IPv4` → `IPAddress`
* `IPv6` → `IPAddress`

### Geographic Types

* `Point` → `Tuple`
* `Ring` → `Array of Points`
* `Polygon` → `Array of Rings`

### Complex Types

* `Array(T)` → `Array of any type`
* `Tuple(T1, T2, ...)` → `Tuple of any types`
* `Nullable(T)` → `Nullable version of any type`
* `Map(K, V)` → `Dictionary<K, V>`

---

### DateTime Handling {#datetime-handling}

* Returned values are **UTC**.
* Inserting:

  * UTC → stored as-is.
  * Local → converted to UTC.
  * Unspecified → assumed to match column timezone.
* `UseServerTimezone=true` allows using server TZ for ambiguous columns.

---

### Environment Variables {#environment-variables}

You can set defaults using environment variables:

| Variable              | Purpose          |
| --------------------- | ---------------- |
| `CLICKHOUSE_DB`       | Default database |
| `CLICKHOUSE_USER`     | Default username |
| `CLICKHOUSE_PASSWORD` | Default password |

---

### ORM & Dapper Support {#orm-support}

`ClickHouse.Driver` supports Dapper (with limitations).

**Working example:**
```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new Dictionary<string, object> { { "p1", 42 } }
);
```

**Not supported:**
```csharp
connection.QueryAsync<string>(
    "SELECT {p1:Int32}",
    new { p1 = 42 }
);
```

---

### Quick Start {#quick-start}
```csharp
using ClickHouse.Driver.ADO;

var connection = new ClickHouseConnection("Host=my.clickhouse;Protocol=https;Port=8443;Username=user");
var version = await connection.ExecuteScalarAsync("SELECT version()");
Console.WriteLine(version);
```

Using **Dapper**:
```csharp
using Dapper;

using var connection = new ClickHouseConnection("Host=my.clickhouse");
var result = await connection.QueryAsync<string>("SELECT name FROM system.databases");
Console.WriteLine(string.Join('\n', result));
```
