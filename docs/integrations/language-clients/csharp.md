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

import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_csharp from '@site/static/images/_snippets/connection-details-csharp.png';

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

---

## Configuration {#configuration}

### Connection settings {#connection-settings}

| Property | Type | Default | Connection String Key | Description |
|----------|------|---------|----------------------|-------------|
| Host | `string` | `"localhost"` | `Host` | Hostname or IP address of the ClickHouse server |
| Port | `ushort` | 8123 (HTTP) / 8443 (HTTPS) | `Port` | Port number; defaults based on protocol |
| Username | `string` | `"default"` | `Username` | Authentication username |
| Password | `string` | `""` | `Password` | Authentication password |
| Database | `string` | `""` | `Database` | Default database; empty uses server/user default |
| Protocol | `string` | `"http"` | `Protocol` | Connection protocol: `"http"` or `"https"` |
| Path | `string` | `null` | `Path` | URL path for reverse proxy scenarios (e.g., `/clickhouse`) |
| Timeout | `TimeSpan` | 2 minutes | `Timeout` | Operation timeout (stored as seconds in connection string) |

The details for your ClickHouse Cloud service are available in the ClickHouse Cloud console.

Select a service and click **Connect**:

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud service connect button" border />

Choose **HTTPS**. Connection details are displayed below.

<Image img={connection_details_csharp} size="md" alt="ClickHouse Cloud C# connection details" border />

If you are using self-managed ClickHouse, the connection details are set by your ClickHouse administrator.

### Data format & serialization {#data-format-serialization}

| Property | Type | Default | Connection String Key | Description |
|----------|------|---------|----------------------|-------------|
| UseCompression | `bool` | `true` | `Compression` | Enable gzip compression for data transfer |
| UseServerTimezone | `bool` | `true` | `UseServerTimezone` | Use server timezone for DateTime conversion; if false, uses local timezone |
| UseCustomDecimals | `bool` | `true` | `UseCustomDecimals` | Use `ClickHouseDecimal` for arbitrary precision; if false, uses .NET `decimal` (128-bit limit) |
| UseFormDataParameters | `bool` | `false` | `UseFormDataParameters` | Send parameters as form data instead of URL query string |

### Session management {#session-management}

| Property | Type | Default | Connection String Key | Description |
|----------|------|---------|----------------------|-------------|
| UseSession | `bool` | `false` | `UseSession` | Enable stateful sessions; serializes requests |
| SessionId | `string` | `null` | `SessionId` | Session ID; auto-generates GUID if null and UseSession is true |

### Security {#security}

| Property | Type | Default | Connection String Key | Description |
|----------|------|---------|----------------------|-------------|
| SkipServerCertificateValidation | `bool` | `false` | — | Skip HTTPS certificate validation; **not for production use** |

### HTTP client configuration {#http-client-configuration}

| Property | Type | Default | Connection String Key | Description |
|----------|------|---------|----------------------|-------------|
| HttpClient | `HttpClient` | `null` | — | Custom pre-configured HttpClient instance |
| HttpClientFactory | `IHttpClientFactory` | `null` | — | Custom factory for creating HttpClient instances |
| HttpClientName | `string` | `null` | — | Name for HttpClientFactory to create specific client |

### Logging & debugging {#logging-debugging}

| Property | Type | Default | Connection String Key | Description |
|----------|------|---------|----------------------|-------------|
| LoggerFactory | `ILoggerFactory` | `null` | — | Logger factory for diagnostic logging |
| EnableDebugMode | `bool` | `false` | — | Enable .NET network tracing (requires LoggerFactory with level set to Trace); **significant performance impact** |

### Custom settings & roles {#custom-settings-roles}

| Property | Type | Default | Connection String Key | Description |
|----------|------|---------|----------------------|-------------|
| CustomSettings | `IDictionary<string, object>` | Empty | `set_*` prefix | ClickHouse server settings, see note below |
| Roles | `IReadOnlyList<string>` | Empty | `Roles` | Comma-separated ClickHouse roles (e.g., `Roles=admin,reader`) |

:::note
When using a connection string to set custom settings, use the `set_` prefix, e.g. "set_max_threads=4". When using a ClickHouseClientSettings object, do not use the `set_` prefix.
:::

### Connection string examples {#connection-string-examples}

#### Basic connection {#basic-connection}

```text
Host=localhost;Port=8123;Username=default;Password=secret;Database=mydb
```

#### With custom ClickHouse settings {#with-custom-clickhouse-settings}

```text
Host=localhost;set_max_threads=4;set_readonly=1;set_max_memory_usage=10000000000
```

:::note

The `UseSession` flag enables persistence of the server session, allowing use of `SET` statements and temporary tables. Sessions will be reset after 60 seconds of inactivity (default timeout). Session lifetime can be extended by setting session settings via ClickHouse statements or the server configuration.

The `ClickHouseConnection` class normally allows for parallel operation (multiple threads can run queries concurrently). However, enabling `UseSession` flag will limit that to one active query per connection at any moment of time (this is a server-side limitation).

:::

---

## Usage {#usage}

### Connecting {#connecting}

To connect to ClickHouse, create a `ClickHouseConnection` with a connection string or a `ClickHouseClientSettings` object. The connection string consists of semicolon-separated key/value pairs that specify the host, authentication credentials, and other connection options. See the [Configuration](#configuration) section for available options.

Using a connection string:

```csharp
using ClickHouse.Driver.ADO;

using var connection = new ClickHouseConnection("Host=localhost;Username=default;Password=secret");
await connection.OpenAsync();
```

Or using ClickHouseClientSettings:

```csharp
var settings = new ClickHouseClientSettings
{
    Host = "localhost",
    Username = "default",
    Password = "secret"
};
using var connection2 = new ClickHouseConnection(settings);
await connection2.OpenAsync();
```

**Recommendations:**

* A `ClickHouseConnection` represents a "session" with the server. It performs feature discovery by querying server version (so there is a minor overhead on opening), but generally it is safe to create and destroy such objects multiple times.
* Recommended lifetime for a connection is one connection object per large "transaction" spanning multiple queries. The `ClickHouseConnection` object can be long-lived. There is a minor overhead on connection startup, so it's not recommended to create a connection object for each query.
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

Use `ClickHouseBulkCopy` for inserting large numbers of rows. It streams data efficiently using ClickHouse's native row binary format, works in parallel, and can split the data into batches. It also avoids limitations with large parameter sets causing "URL too long" errors.

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

Execute SELECT queries using `ExecuteReader()` or `ExecuteReaderAsync()`. The returned `DbDataReader` provides typed access to result columns via methods like `GetInt64()`, `GetString()`, and `GetFieldValue<T>()`.

Call `Read()` to advance to the next row. It returns `false` when there are no more rows. Access columns by index (0-based) or by column name.

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

### SQL parameters {#sql-parameters}

In ClickHouse, the standard format for query parameters in SQL queries is `{parameter_name:DataType}`.

**Examples:**

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
SQL 'bind' parameters are passed as HTTP URI query parameters, so using too many of them may result in a "URL too long" exception. Using ClickHouseBulkInsert can bypass this limitation.
:::

---

### Query ID {#query-id}

Every method that makes a query will also include a query_id in the result. This unique identifier is assigned by the client per query and can be used to fetch data from the `system.query_log` table (if it is enabled), or cancel long-running queries. If necessary, the query ID can be overridden by the user in the ClickHouseCommand object.

```csharp
var customQueryId = $"qid-{Guid.NewGuid()}";

using var command = connection.CreateCommand();
command.CommandText = "SELECT version()";
command.QueryId = customQueryId;

var version = await command.ExecuteScalarAsync();
Console.WriteLine($"QueryId: {command.QueryId}");
```

:::tip
If you are overriding the `QueryId` parameter, you need to ensure its uniqueness for every call. A random GUID is a good choice.
:::

---

### Raw streaming {#raw-streaming}

It is possible to stream data in a particular format directly, bypassing the data reader. This can be useful in situations where you want to save the data to file in a particular format. For example:

```csharp
using var command = connection.CreateCommand();
command.CommandText = "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow";
using var result = await command.ExecuteRawResultAsync(CancellationToken.None);
using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = reader.ReadToEnd();
```

---

### Raw stream insert {#raw-stream-insert}

Use `InsertRawStreamAsync` to insert data directly from file or memory streams in formats like CSV, JSON, or any [supported ClickHouse format](/docs/interfaces/formats).

**Insert from a CSV file:**

```csharp
await using var fileStream = File.OpenRead("data.csv");

using var response = await connection.InsertRawStreamAsync(
    table: "my_table",
    stream: fileStream,
    format: "CSV",
    columns: ["id", "product", "price"]); // Optional: specify columns
```

:::note
See the [format settings documentation](/docs/operations/settings/formats) for options to control data ingestion behavior.
:::

---

### More examples {#more-examples}

For additional practical usage examples, see the [examples directory](https://github.com/ClickHouse/clickhouse-cs/tree/main/examples) in the GitHub repository.

---

## Best practices {#best-practices}

### Connection lifetime and pooling {#best-practices-connection-lifetime}

`ClickHouse.Driver` uses `System.Net.Http.HttpClient` under the hood. `HttpClient` has a per-endpoint connection pool. As a consequence:

* A `ClickHouseConnection` object does not have 1:1 mapping to TCP connections - multiple database sessions will be multiplexed through several TCP connections per server.
* `ClickHouseConnection` objects can be long-lived; the actual TCP connections underneath will be recycled by the connection pool.
* Let `HttpClient` manage connection pooling internally. Do not pool `ClickHouseConnection` objects yourself. 
* Connections can stay alive after `ClickHouseConnection` object was disposed.
* This behavior can be tweaked by passing a custom `HttpClientFactory` or `HttpClient` with custom `HttpClientHandler`.

For DI environments, there is a bespoke constructor `ClickHouseConnection(string connectionString, IHttpClientFactory httpClientFactory, string httpClientName = "")` which makes the ClickHouseConnection request a named http client.

:::important
When using a custom `HttpClient` or `HttpClientFactory`, ensure that the `PooledConnectionIdleTimeout` is set to a value smaller than the server's `keep_alive_timeout`, in order to avoid errors due to half-closed connections. The default `keep_alive_timeout` for Cloud deployments is 10 seconds. 
:::

---

#### Async inserts {#async-inserts}

[Async inserts](/docs/optimize/asynchronous-inserts) shift batching responsibility from the client to the server. Instead of requiring client-side batching, the server buffers incoming data and flushes it to storage based on configurable thresholds. This is useful for high-concurrency scenarios like observability workloads where many agents send small payloads.

Enable async inserts via `CustomSettings` or the connection string:

```csharp
// Using CustomSettings
var settings = new ClickHouseClientSettings("Host=localhost");
settings.CustomSettings["async_insert"] = 1;
settings.CustomSettings["wait_for_async_insert"] = 1; // Recommended: wait for flush acknowledgment

// Or via connection string
// "Host=localhost;set_async_insert=1;set_wait_for_async_insert=1"
```

**Two modes** (controlled by `wait_for_async_insert`):

| Mode | Behavior | Use case |
|------|----------|----------|
| `wait_for_async_insert=1` | Insert returns after data is flushed to disk. Errors are returned to the client. | **Recommended** for most workloads |
| `wait_for_async_insert=0` | Insert returns immediately when data is buffered. No guarantee data will be persisted. | Only when data loss is acceptable |

:::warning
With `wait_for_async_insert=0`, errors only surface during flush and cannot be traced back to the original insert. The client also provides no backpressure, risking server overload.
:::

**Key settings:**

| Setting | Description |
|---------|-------------|
| `async_insert_max_data_size` | Flush when buffer reaches this size (bytes) |
| `async_insert_busy_timeout_ms` | Flush after this timeout (milliseconds) |
| `async_insert_max_query_number` | Flush after this many queries accumulate |

---

#### Sessions {#best-practices-sessions}

Only enable sessions when you need stateful server-side features, e.g.:

- Temporary tables (`CREATE TEMPORARY TABLE`)
- Maintaining query context across multiple statements
- Session-level settings (`SET max_threads = 4`)

When sessions are enabled, requests are serialized to prevent concurrent use of the same session. This adds overhead for workloads that don't require session state.

```csharp
var settings = new ClickHouseClientSettings
{
    Host = "localhost",
    UseSession = true,
    SessionId = "my-session", // Optional -- will be auto-generated if not provided
};

await using var connection = new ClickHouseConnection(settings);
await connection.OpenAsync();

await using var cmd1 = connection.CreateCommand("CREATE TEMPORARY TABLE temp_ids (id UInt64)");
await cmd1.ExecuteNonQueryAsync();

await using var cmd2 = connection.CreateCommand("INSERT INTO temp_ids VALUES (1), (2), (3)");
await cmd2.ExecuteNonQueryAsync();

await using var cmd3 = connection.CreateCommand("SELECT * FROM users WHERE id IN (SELECT id FROM temp_ids)");
await using var reader = await cmd3.ExecuteReaderAsync();
```

---

## Supported data types {#supported-data-types}

`ClickHouse.Driver` supports all ClickHouse data types. The tables below show the mappings between ClickHouse types and native .NET types when reading data from the database.

### Type mapping: reading from ClickHouse {#clickhouse-native-type-map-reading}

#### Integer types {#type-map-reading-integer}

| ClickHouse Type | .NET Type |
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

#### Floating point types {#type-map-reading-floating-points}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| Float32 | `float` |
| Float64 | `double` |
| BFloat16 | `float` |

#### Decimal types {#type-map-reading-decimal}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| Decimal(P, S) | `decimal` / `ClickHouseDecimal` |
| Decimal32(S) | `decimal` / `ClickHouseDecimal` |
| Decimal64(S) | `decimal` / `ClickHouseDecimal` |
| Decimal128(S) | `decimal` / `ClickHouseDecimal` |
| Decimal256(S) | `decimal` / `ClickHouseDecimal` |

:::note
Decimal type conversion is controlled via the UseCustomDecimals setting.
:::

#### Boolean type {#type-map-reading-boolean}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| Bool | `bool` |

#### String types {#type-map-reading-strings}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| String | `string` |
| FixedString(N) | `byte[]` |

#### Date and time types {#type-map-reading-datetime}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| Date | `DateTime` |
| Date32 | `DateTime` |
| DateTime | `DateTime` |
| DateTime32 | `DateTime` |
| DateTime64 | `DateTime` |
| Time | `TimeSpan` |
| Time64 | `TimeSpan` |

#### Other types {#type-map-reading-other}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| UUID | `Guid` |
| IPv4 | `IPAddress` |
| IPv6 | `IPAddress` |
| Nothing | `DBNull` |
| Dynamic | See note |
| Json | `JsonObject` |
| Array(T) | `T[]` |
| Tuple(T1, T2, ...) | `Tuple<T1, T2, ...>` / `LargeTuple` |
| Map(K, V) | `Dictionary<K, V>` |
| Nullable(T) | `T?` |
| Enum8 | `string` |
| Enum16 | `string` |
| LowCardinality(T) | Same as T |
| SimpleAggregateFunction | Same as underlying type |
| Nested(...) | `Tuple[]` |
| Variant(T1, T2, ...) | See note |
| QBit(T, dimension) | `T[]` |

:::note
The Dynamic and Variant types will be converted to the corresponding type for the actual underlying type in each row.
:::

#### Geometry types {#type-map-reading-geometry}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| Point | `Tuple<double, double>` |
| Ring | `Tuple<double, double>[]` |
| LineString | `Tuple<double, double>[]` |
| Polygon | `Ring[]` |
| MultiLineString | `LineString[]` |
| MultiPolygon | `Polygon[]` |
| Geometry | See note |

:::note
The Geometry type is a Variant type that can hold any of the geometry types. It will be converted to the corresponding type.
:::

### Type mapping: writing to ClickHouse {#clickhouse-native-type-map-writing}

When inserting data, the driver converts .NET types to their corresponding ClickHouse types. The tables below show which .NET types are accepted for each ClickHouse column type.

#### Integer types {#type-map-writing-integer}

| ClickHouse Type | Accepted .NET Types | Notes |
|-----------------|---------------------|-------|
| Int8 | `sbyte`, any `Convert.ToSByte()` compatible |  |
| UInt8 | `byte`, any `Convert.ToByte()` compatible |  |
| Int16 | `short`, any `Convert.ToInt16()` compatible |  |
| UInt16 | `ushort`, any `Convert.ToUInt16()` compatible |  |
| Int32 | `int`, any `Convert.ToInt32()` compatible |  |
| UInt32 | `uint`, any `Convert.ToUInt32()` compatible |  |
| Int64 | `long`, any `Convert.ToInt64()` compatible |  |
| UInt64 | `ulong`, any `Convert.ToUInt64()` compatible |  |
| Int128 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, any `Convert.ToInt64()` compatible | |
| UInt128 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, any `Convert.ToInt64()` compatible | |
| Int256 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, any `Convert.ToInt64()` compatible | |
| UInt256 | `BigInteger`, `decimal`, `double`, `float`, `int`, `uint`, `long`, `ulong`, any `Convert.ToInt64()` compatible | |

#### Floating point types {#type-map-writing-floating-point}

| ClickHouse Type | Accepted .NET Types | Notes |
|-----------------|---------------------|-------|
| Float32 | `float`, any `Convert.ToSingle()` compatible |  |
| Float64 | `double`, any `Convert.ToDouble()` compatible | |
| BFloat16 | `float`, any `Convert.ToSingle()` compatible | Truncates to 16-bit brain float format |

#### Boolean type {#type-map-writing-boolean}

| ClickHouse Type | Accepted .NET Types | Notes |
|-----------------|---------------------|-------|
| Bool | `bool` |  |

#### String types {#type-map-writing-strings}

| ClickHouse Type | Accepted .NET Types | Notes |
|-----------------|---------------------|-------|
| String | `string`, any `Convert.ToString()` compatible |  |
| FixedString(N) | `string`, `byte[]` | String is UTF-8 encoded and padded/truncated; byte[] must be exactly N bytes |

#### Date and time types {#type-map-writing-datetime}

| ClickHouse Type | Accepted .NET Types | Notes |
|-----------------|---------------------|-------|
| Date | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types | Converted to Unix days as UInt16 |
| Date32 | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types | Converted to Unix days as Int32 |
| DateTime | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types | Converted to Unix seconds |
| DateTime32 | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types | Same as DateTime |
| DateTime64 | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types | Precision based on Scale parameter |
| Time | `TimeSpan`, `int` | Clamped to ±999:59:59; int treated as seconds |
| Time64 | `TimeSpan`, `decimal`, `double`, `float`, `int`, `long`, `string` | String parsed as `[-]HHH:MM:SS[.fraction]`; clamped to ±999:59:59.999999999 |

#### Decimal types {#type-map-writing-decimal}

| ClickHouse Type | Accepted .NET Types | Notes |
|-----------------|---------------------|-------|
| Decimal(P,S) | `decimal`, `ClickHouseDecimal`, any `Convert.ToDecimal()` compatible | Throws `OverflowException` if exceeds precision |
| Decimal32 | `decimal`, `ClickHouseDecimal`, any `Convert.ToDecimal()` compatible | Max precision 9 |
| Decimal64 | `decimal`, `ClickHouseDecimal`, any `Convert.ToDecimal()` compatible | Max precision 18 |
| Decimal128 | `decimal`, `ClickHouseDecimal`, any `Convert.ToDecimal()` compatible | Max precision 38 |
| Decimal256 | `decimal`, `ClickHouseDecimal`, any `Convert.ToDecimal()` compatible | Max precision 76 |

#### Other types {#type-map-writing-other}

| ClickHouse Type | Accepted .NET Types | Notes |
|-----------------|---------------------|-------|
| UUID | `Guid`, `string` | String parsed as Guid |
| IPv4 | `IPAddress`, `string` | Must be IPv4; string parsed via `IPAddress.Parse()` |
| IPv6 | `IPAddress`, `string` | Must be IPv6; string parsed via `IPAddress.Parse()` |
| Nothing | Any | Writes nothing (no-op) |
| Dynamic | — | **Not supported** (throws `NotImplementedException`) |
| Json | `string`, `JsonObject`, any object | String parsed as JSON; objects serialized via `JsonSerializer` |
| Array(T) | `IList`, `null` | Null writes empty array |
| Tuple(T1, T2, ...) | `ITuple`, `IList` | Element count must match tuple arity |
| Map(K, V) | `IDictionary` | |
| Nullable(T) | `null`, `DBNull`, or types accepted by T | Writes null flag byte before value |
| Enum8 | `string`, `sbyte`, numeric types | String looked up in enum dictionary |
| Enum16 | `string`, `short`, numeric types | String looked up in enum dictionary |
| LowCardinality(T) | Types accepted by T | Delegates to underlying type |
| SimpleAggregateFunction | Types accepted by underlying type | Delegates to underlying type |
| Nested(...) | `IList` of tuples | Element count must match field count |
| Variant(T1, T2, ...) | Value matching one of T1, T2, ... | Throws `ArgumentException` if no type match |
| QBit(T, dim) | `IList` | Delegates to Array; dimension is metadata only |

#### Geometry types {#type-map-writing-geometry}

| ClickHouse Type | Accepted .NET Types | Notes |
|-----------------|---------------------|-------|
| Point | `System.Drawing.Point`, `ITuple`, `IList` (2 elements) |  |
| Ring | `IList` of Points | |
| LineString | `IList` of Points | |
| Polygon | `IList` of Rings | |
| MultiLineString | `IList` of LineStrings | |
| MultiPolygon | `IList` of Polygons | |
| Geometry | Any geometry type above | Variant of all geometry types |

#### Not supported for writing  {#type-map-writing-not-supported}

| ClickHouse Type | Notes |
|-----------------|-------|
| Dynamic | Throws `NotImplementedException` |
| AggregateFunction | Throws `AggregateFunctionException` |

---

### DateTime handling {#datetime-handling}

`ClickHouse.Driver` handles timezones and the `DateTime.Kind` property in accordance with the column's timezone in ClickHouse. Specifically:

When reading:

- If the column's timezone has zero offset (UTC/GMT), returns DateTimeKind.Utc
- If the column's timezone has non-zero offset, returns `DateTimeKind.Unspecified` (representing the local time in that timezone)

When writing:
  - `UTC` `DateTime`s are inserted 'as is', because ClickHouse stores them in UTC internally.
  - `Local` `DateTime`s are converted to UTC according to user's local timezone settings.
  - `Unspecified` `DateTime`s are considered to be in target column's timezone, and hence are converted to UTC according to that timezone.

- For columns without timezone specified, server timezone is used by default. `UseServerTimezone` flag in connection string can be used to control whether the server or the client system timezone is used.

HTTP PARAM VS BULK COPY! We don't actually know the column timezone in the http param case, do we?! ???????????? TODO


### Nested type handling {#nested-type-handling}

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
| `ClickHouse.Driver.NetTrace` | `TraceHelper` | Network tracing, only when debug mode is enabled |

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

To help with diagnosing networking issues, the driver library includes a helper that enables low-level tracing of .NET networking internals. To enable it you must pass a LoggerFactory with the level set to Trace, and set EnableDebugMode to true (or manually enable it via the `ClickHouse.Driver.Diagnostic.TraceHelper` class). Events will be logged to the `ClickHouse.Driver.NetTrace` category. Warning: this will generate extremely verbose logs, and impact performance. It is not recommended to enable debug mode in production.

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

## OpenTelemetry {#opentelemetry}

The driver provides built-in support for OpenTelemetry distributed tracing via the .NET [`System.Diagnostics.Activity`](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing) API. When enabled, the driver emits spans for database operations that can be exported to observability backends like Jaeger or ClickHouse itself (via the [OpenTelemetry Collector](https://clickhouse.com/docs/observability/integrating-opentelemetry)).

### Enabling tracing {#opentelemetry-enabling}

In ASP.NET Core applications, add the ClickHouse driver's `ActivitySource` to your OpenTelemetry configuration:

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddSource(ClickHouseDiagnosticsOptions.ActivitySourceName)  // Subscribe to ClickHouse driver spans
        .AddAspNetCoreInstrumentation()
        .AddOtlpExporter());             // Or AddJaegerExporter(), etc.
```

For console applications, testing, or manual setup:

```csharp
using OpenTelemetry;
using OpenTelemetry.Trace;

var tracerProvider = Sdk.CreateTracerProviderBuilder()
    .AddSource(ClickHouseDiagnosticsOptions.ActivitySourceName)
    .AddConsoleExporter()
    .Build();
```

### Span attributes {#opentelemetry-attributes}

Each span includes standard OpenTelemetry database attributes plus ClickHouse-specific query statistics that can be used for debugging.

| Attribute | Description |
|-----------|-------------|
| `db.system` | Always `"clickhouse"` |
| `db.name` | Database name |
| `db.user` | Username |
| `db.statement` | SQL query (if enabled) |
| `db.clickhouse.read_rows` | Rows read by the query |
| `db.clickhouse.read_bytes` | Bytes read by the query |
| `db.clickhouse.written_rows` | Rows written by the query |
| `db.clickhouse.written_bytes` | Bytes written by the query |
| `db.clickhouse.elapsed_ns` | Server-side execution time in nanoseconds |

### Configuration options {#opentelemetry-configuration}

Control tracing behavior via `ClickHouseDiagnosticsOptions`:

```csharp
using ClickHouse.Driver.Diagnostic;

// Include SQL statements in spans (default: false for security)
ClickHouseDiagnosticsOptions.IncludeSqlInActivityTags = true;

// Truncate long SQL statements (default: 1000 characters)
ClickHouseDiagnosticsOptions.StatementMaxLength = 500;
```

:::warning
Enabling `IncludeSqlInActivityTags` may expose sensitive data in your traces. Use with caution in production environments.
:::

---

## TLS configuration {#tls-configuration}

When connecting to ClickHouse over HTTPS, you can configure TLS/SSL behavior in several ways.

### Custom certificate validation {#custom-certificate-validation}

For production environments requiring custom certificate validation logic, provide your own `HttpClient` with a configured `ServerCertificateCustomValidationCallback` handler:

```csharp
using System.Net;
using System.Net.Security;
using ClickHouse.Driver.ADO;

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

using var connection = new ClickHouseConnection(settings);
await connection.OpenAsync();
```

:::note 
Important considerations when providing a custom HttpClient
- **Automatic decompression**: You must enable `AutomaticDecompression` if compression is not disabled (compression is enabled by default).
- **Idle timeout**: Set `PooledConnectionIdleTimeout` smaller than the server's `keep_alive_timeout` (10 seconds for ClickHouse Cloud) to avoid connection errors from half-open connections.
:::

---

## ORM support {#orm-support}

### Dapper {#orm-support-dapper}

`ClickHouse.Driver` can be used with Dapper, but anonymous objects are currently not supported.

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

### Linq2db {#orm-support-linq2db}

This driver is compatible with [linq2db](https://github.com/linq2db/linq2db), a lightweight ORM and LINQ provider for .NET. See the project website for detailed documentation.

**Example usage:**

Create a `DataConnection` using the ClickHouse provider:

```csharp
using LinqToDB;
using LinqToDB.Data;
using LinqToDB.DataProvider.ClickHouse;

var connectionString = "Host=localhost;Port=8123;Database=default";
var options = new DataOptions()
    .UseClickHouse(connectionString, ClickHouseProvider.ClickHouseDriver);

await using var db = new DataConnection(options);
```

Table mappings can be defined using attributes or fluent configuration. If your class and property names match the table and column names exactly, no configuration is needed:

```csharp
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
}
```

**Querying:**

```csharp
await using var db = new DataConnection(options);

var products = await db.GetTable<Product>()
    .Where(p => p.Price > 100)
    .OrderByDescending(p => p.Name)
    .ToListAsync();
```

**Bulk Copy:**

Use `BulkCopyAsync` for efficient bulk inserts.

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

### Entity framework core {#orm-support-ef-core}

Entity Framework Core is currently not supported.

---

## Limitations {#limitations}

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