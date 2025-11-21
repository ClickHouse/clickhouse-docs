---
sidebar_label: 'C#'
sidebar_position: 6
keywords: ['clickhouse', 'cs', 'c#', '.net', 'dotnet', 'csharp', 'client', 'driver', 'connect', 'integrate']
slug: /integrations/csharp
description: 'The official C# client for connecting to ClickHouse.'
title: 'ClickHouse C# Driver'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-cs'
---

# ClickHouse C# client

The official C# client for connecting to ClickHouse.
The client source code is available in the [GitHub repository](https://github.com/ClickHouse/clickhouse-cs).
Originally developed by [Oleg V. Kozlyuk](https://github.com/DarkWanderer).

## Migration guide {#migration-guide}

1. Update your `.csproj` file with the new package name `ClickHouse.Driver` and [the latest version on NuGet](https://www.nuget.org/packages/ClickHouse.Driver).
2. Update all `ClickHouse.Client` references to `ClickHouse.Driver` in your codebase.

---

## Supported .NET versions {#supported-net-versions}

`ClickHouse.Driver` supports the following .NET versions:

* .NET Framework 4.6.2
* .NET Framework 4.8
* .NET Standard 2.1
* .NET 6.0
* .NET 8.0
* .NET 9.0
* .NET 10.0

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

## Quick start {#quick-start}

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

---

## Usage {#usage}

### Connection string parameters {#connection-string}

| Parameter           | Description                                     | Default             |
| ------------------- | ----------------------------------------------- | ------------------- |
| `Host`              | ClickHouse server address                       | `localhost`         |
| `Port`              | ClickHouse server port                          | `8123` or `8443` (depending on `Protocol`) |
| `Database`          | Initial database                                | `default`           |
| `Username`          | Authentication username                         | `default`           |
| `Password`          | Authentication password                         | *(empty)*           |
| `Protocol`          | Connection protocol (`http` or `https`)         | `http`              |
| `Compression`       | Enables Gzip compression                        | `true`              |
| `UseSession`        | Enables persistent server session               | `false`             |
| `SessionId`         | Custom session ID                               | Random GUID         |
| `Timeout`           | HTTP timeout (seconds)                          | `120`               |
| `UseServerTimezone` | Use server timezone for datetime columns        | `true`              |
| `UseCustomDecimals` | Use `ClickHouseDecimal` for decimals            | `false`             |

**Example:** `Host=clickhouse;Port=8123;Username=default;Password=;Database=default`

:::note Sessions

`UseSession` flag enables persistence of server session, allowing use of `SET` statements and temp tables. Session will be reset after 60 seconds of inactivity (default timeout). Session lifetime can be extended by setting session settings via ClickHouse statements.

`ClickHouseConnection` class normally allows for parallel operation (multiple threads can run queries concurrently). However, enabling `UseSession` flag will limit that to one active query per connection at any moment of time (server-side limitation).

:::

---

### Connection lifetime and pooling {#connection-lifetime}

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

### Creating a table {#creating-a-table}

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

### Inserting data {#inserting-data}

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

### Bulk insert {#bulk-insert}

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

:::note
* For optimal performance, ClickHouseBulkCopy uses the Task Parallel Library (TPL) to process batches of data, with up to 4 parallel insertion tasks (this can be tuned).
* Column names can be optionally provided via `ColumnNames` property if source data has fewer columns than target table.
* Configurable parameters: `Columns`, `BatchSize`, `MaxDegreeOfParallelism`.
* Before copying, a `SELECT * FROM <table> LIMIT 0` query is performed to get information about target table structure. Types of provided objects must reasonably match the target table.
* Sessions are not compatible with parallel insertion. Connection passed to `ClickHouseBulkCopy` must have sessions disabled, or `MaxDegreeOfParallelism` must be set to `1`.
:::

---

### Performing SELECT queries {#performing-select-queries}

Execute SELECT queries and process results:

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

---

### Raw streaming {#raw-streaming}

```csharp
using var command = connection.CreateCommand();
command.Text = "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow";
using var result = await command.ExecuteRawResultAsync(CancellationToken.None);
using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = reader.ReadToEnd();
```

---

### Nested columns support {#nested-columns}

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

### AggregateFunction columns {#aggregatefunction-columns}

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

### SQL parameters {#sql-parameters}

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

:::note
* SQL 'bind' parameters are passed as HTTP URI query parameters, so using too many of them may result in a "URL too long" exception.
* To insert large volume of records, consider using Bulk Insert functionality.
:::

---

## Supported data types {#supported-data-types}

`ClickHouse.Driver` supports the following ClickHouse data types with their corresponding .NET type mappings:

### Boolean types {#boolean-types}

* `Bool` → `bool`

### Numeric types {#numeric-types}

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

### String types {#string-types}

* `String` → `string`
* `FixedString` → `string`

### Date and time types {#date-time-types}

* `Date` → `DateTime`
* `Date32` → `DateTime`
* `DateTime` → `DateTime`
* `DateTime32` → `DateTime`
* `DateTime64` → `DateTime`

### Network types {#network-types}

* `IPv4` → `IPAddress`
* `IPv6` → `IPAddress`

### Geographic types {#geographic-types}

* `Point` → `Tuple`
* `Ring` → `Array of Points`
* `Polygon` → `Array of Rings`

### Complex types {#complex-types}

* `Array(T)` → `Array of any type`
* `Tuple(T1, T2, ...)` → `Tuple of any types`
* `Nullable(T)` → `Nullable version of any type`
* `Map(K, V)` → `Dictionary<K, V>`

---

### DateTime handling {#datetime-handling}

`ClickHouse.Driver` tries to correctly handle timezones and `DateTime.Kind` property. Specifically:

* `DateTime` values are returned as UTC. User can then convert them themselves or use `ToLocalTime()` method on `DateTime` instance.
* When inserting, `DateTime` values are handled in following way:
  * `UTC` `DateTime`s are inserted 'as is', because ClickHouse stores them in UTC internally.
  * `Local` `DateTime`s are converted to UTC according to user's local timezone settings.
  * `Unspecified` `DateTime`s are considered to be in target column's timezone, and hence are converted to UTC according to that timezone.
* For columns without timezone specified, client timezone is used by default (legacy behavior). `UseServerTimezone` flag in connection string can be used to use server timezone instead.

---

## Logging and diagnostics {#logging-and-diagnostics}

The ClickHouse .NET client integrates with the `Microsoft.Extensions.Logging` abstractions to offer lightweight, opt-in logging. When enabled, the driver emits structured messages for connection lifecycle events, command execution, transport operations, and bulk copy uploads. Logging is entirely optional—applications that do not configure a logger continue to run without additional overhead.

### Quick start {#logging-quick-start}

#### Using ClickHouseConnection {#logging-clickhouseconnection}

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

#### Using appsettings.json {#logging-appsettings-config}

You can configure logging levels using standard .NET configuration:

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

#### Using in-memory configuration {#logging-inmemory-config}

You can also configure logging verbosity by category in code:

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

### Categories and emitters {#logging-categories}

The driver uses dedicated categories so that you can fine-tune log levels per component:

| Category | Source | Highlights |
| --- | --- | --- |
| `ClickHouse.Driver.Connection` | `ClickHouseConnection` | Connection lifecycle, HTTP client factory selection, connection opening/closing, session management. |
| `ClickHouse.Driver.Command` | `ClickHouseCommand` | Query execution start/completion, timing, query IDs, server statistics, and error details. |
| `ClickHouse.Driver.Transport` | `ClickHouseConnection` | Low-level HTTP streaming requests, compression flags, response status codes, and transport failures. |
| `ClickHouse.Driver.BulkCopy` | `ClickHouseBulkCopy` | Metadata loading, batch operations, row counts, and upload completions. |

#### Example: Diagnosing connection issues {#logging-config-example}

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

This will log:
- HTTP client factory selection (default pool vs single connection)
- HTTP handler configuration (SocketsHttpHandler or HttpClientHandler)
- Connection pool settings (MaxConnectionsPerServer, PooledConnectionLifetime, etc.)
- Timeout settings (ConnectTimeout, Expect100ContinueTimeout, etc.)
- SSL/TLS configuration
- Connection open/close events
- Session ID tracking

### Debug mode: network tracing and diagnostics {#logging-debugmode}

To help with diagnosing networking issues, the driver library includes a helper that enables low-level tracing of .NET networking internals. To enable it you must pass a LoggerFactory with the level set to Trace, and set EnableDebugMode to true (or manually enable it via the `ClickHouse.Driver.Diagnostic.TraceHelper` class). Warning: this will generate extremely verbose logs, and impact performance. It is not recommended to enable debug mode in production.

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

---

### ORM & Dapper support {#orm-support}

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
