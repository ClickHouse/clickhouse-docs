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

Create a connection using a connection string:
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
| `Port`              | ClickHouse server port                          | `8123` or `8443` (depending on `Protocol`) |
| `Database`          | Initial database                                | `default`           |
| `Username`          | Authentication username                         | `default`           |
| `Password`          | Authentication password                         | *(empty)*           |
| `Protocol`          | Connection protocol (`http` or `https`)         | `http`              |
| `Compression`       | Enables GZip compression                        | `true`              |
| `UseSession`        | Enables persistent server session               | `false`             |
| `SessionId`         | Custom session ID                               | Random GUID         |
| `Timeout`           | HTTP timeout (seconds)                          | `120`               |
| `UseServerTimezone` | Use server timezone for datetime columns        | `true`              |
| `UseCustomDecimals` | Use `ClickHouseDecimal` for decimals            | `false`             |

**Example:** `Host=clickhouse;Port=8123;Username=default;Password=;Database=default`

**Note about sessions:**

`UseSession` flag enables persistence of server session, allowing use of `SET` statements and temp tables. Session will be reset after 60 seconds of inactivity (default timeout). Session lifetime can be extended by setting session settings via ClickHouse statements.

`ClickHouseConnection` class normally allows for parallel operation (multiple threads can run queries concurrently). However, enabling `UseSession` flag will limit that to one active query per connection at any moment of time (serverside limitation).

---

### Connection Lifetime & Pooling {#connection-lifetime}

`ClickHouse.Driver` uses `System.Net.Http.HttpClient` under the hood. `HttpClient` has a per-endpoint connection pool. As a consequence:

* A `ClickHouseConnection` object does not have 1:1 mapping to TCP connections - multiple database sessions will be multiplexed through several (2 by default) TCP connections per server.
* Connections can stay alive after `ClickHouseConnection` object was disposed.
* This behavior can be tweaked by passing a bespoke `HttpClient` with custom `HttpClientHandler`.

For DI environments, there is a bespoke constructor `ClickHouseConnection(string connectionString, IHttpClientFactory httpClientFactory, string httpClientName = "")` which allows to generalize HTTP client settings.

**Recommendations:**

* A `ClickHouseConnection` represents a "session" with the server. It performs feature discovery by querying server version (so there is a minor overhead on opening), but generally it is safe to create and destroy such objects multiple times.
* Recommended lifetime for a connection is one connection object per large "transaction" spanning multiple queries. There is a minor overhead on connection startup, so it's not recommended to create a connection object for each query.
* If an application operates on large volumes of transactions and requires to create/destroy `ClickHouseConnection` objects often, it is recommended to use `IHttpClientFactory` or a static instance of `HttpClient` to manage connections.

---

### Creating a Table {#creating-a-table}

Create a table using standard SQL syntax:
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

---

### Inserting Data {#inserting-data}

Insert data using parameterized queries:
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

---

### Bulk Insert {#bulk-insert}

Using `ClickHouseBulkCopy` requires:

* Target connection (`ClickHouseConnection` instance)
* Target table name (`DestinationTableName` property)
* Data source (`IDataReader` or `IEnumerable<object[]>`)
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

**Notes:**

* To make best use of ClickHouse properties, `ClickHouseBulkCopy` utilizes TPL to process batches of data, with up to 4 parallel insertion tasks (tweakable).
* Column names can be optionally provided via `ColumnNames` property if source data has fewer columns than target table.
* Configurable parameters: `Columns`, `BatchSize`, `MaxDegreeOfParallelism`.
* Before copying, a `SELECT * FROM <table> LIMIT 0` query is performed to get information about target table structure. Types of provided objects must reasonably match the target table.
* Sessions are not compatible with parallel insertion. Connection passed to `ClickHouseBulkCopy` must have sessions disabled, or `MaxDegreeOfParallelism` must be set to `1`.

---

### Performing SELECT Queries {#performing-select-queries}

Execute SELECT queries and process results:

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

To pass parameters in query, ClickHouse parameter formatting must be used, in following form:
```sql
{<name>:<data type>}
```

**Examples:**
```sql
SELECT {value:Array(UInt16)} as value
```
```sql
SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}
```
```sql
INSERT INTO table VALUES ({val1:Int32}, {val2:Array(UInt8)})
```

**Notes:**

* SQL 'bind' parameters are passed as HTTP URI query parameters, so using too many of them may result in a "URL too long" exception.
* To insert large volume of records, consider using Bulk Insert functionality.

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

`ClickHouse.Driver` tries to correctly handle timezones and `DateTime.Kind` property. Specifically:

* `DateTime` values are returned as UTC. User can then convert them themselves or use `ToLocalTime()` method on `DateTime` instance.
* When inserting, `DateTime` values are handled in following way:
  * `UTC` `DateTime`s are inserted 'as is', because ClickHouse stores them in UTC internally.
  * `Local` `DateTime`s are converted to UTC according to user's local timezone settings.
  * `Unspecified` `DateTime`s are considered to be in target column's timezone, and hence are converted to UTC according to that timezone.
* For columns without timezone specified, client timezone is used by default (legacy behavior). `UseServerTimezone` flag in connection string can be used to use server timezone instead.

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

using (var connection = new ClickHouseConnection("Host=my.clickhouse;Protocol=https;Port=8443;Username=user"))
{
    var version = await connection.ExecuteScalarAsync("SELECT version()");
    Console.WriteLine(version);
}
```

Using **Dapper**:
```csharp
using Dapper;
using ClickHouse.Driver.ADO;

using (var connection = new ClickHouseConnection("Host=my.clickhouse"))
{
    var result = await connection.QueryAsync<string>("SELECT name FROM system.databases");
    Console.WriteLine(string.Join('\n', result));
}
```
