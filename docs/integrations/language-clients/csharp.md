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

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_csharp from '@site/static/images/_snippets/connection-details-csharp.png';

# ClickHouse C# client

The official C# client for connecting to ClickHouse.
The client source code is available in the [GitHub repository](https://github.com/ClickHouse/clickhouse-cs).
Originally developed by [Oleg V. Kozlyuk](https://github.com/DarkWanderer).

The library provides two main APIs:

- **`ClickHouseClient`** (recommended): A high-level, thread-safe client designed for singleton use. Provides a simple async API for queries and bulk inserts. Best for most applications.

- **ADO.NET** (`ClickHouseConnection`, `ClickHouseCommand`): Standard .NET database abstractions. Required for ORM integration (Dapper, Linq2db) and when you need ADO.NET compatibility.

Both APIs share the same underlying HTTP connection pool and can be used together in the same application.

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

## Installation {#installation}

Install the package from NuGet:

```bash
dotnet add package ClickHouse.Driver
```

Or using the NuGet Package Manager:

```bash
Install-Package ClickHouse.Driver
```

## Quick start {#quick-start}

```csharp
using ClickHouse.Driver;

// Create a client (typically as a singleton)
using var client = new ClickHouseClient("Host=my.clickhouse;Protocol=https;Port=8443;Username=user");

// Execute a query
var version = await client.ExecuteScalarAsync("SELECT version()");
Console.WriteLine(version);
```

## Configuration {#configuration}

There are two ways of configuring your connection to ClickHouse:

* **Connection string:** Semicolon-separated key/value pairs that specify the host, authentication credentials, and other connection options.
* **`ClickHouseClientSettings` object:** A strongly typed configuration object that can be loaded from configuration files or set in code.

Below is a full list of all the settings, their default values, and their effects.

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

### Data format & serialization {#data-format-serialization}

| Property | Type | Default | Connection String Key | Description |
|----------|------|---------|----------------------|-------------|
| UseCompression | `bool` | `true` | `Compression` | Enable gzip compression for data transfer |
| UseCustomDecimals | `bool` | `true` | `UseCustomDecimals` | Use `ClickHouseDecimal` for arbitrary precision; if false, uses .NET `decimal` (128-bit limit) |
| ReadStringsAsByteArrays | `bool` | `false` | `ReadStringsAsByteArrays` | Read `String` and `FixedString` columns as `byte[]` instead of `string`; useful for binary data |
| UseFormDataParameters | `bool` | `false` | `UseFormDataParameters` | Send parameters as form data instead of URL query string |
| JsonReadMode | `JsonReadMode` | `Binary` | `JsonReadMode` | How JSON data is returned: `Binary` (returns `JsonObject`) or `String` (returns raw JSON string) |
| JsonWriteMode | `JsonWriteMode` | `String` | `JsonWriteMode` | How JSON data is sent: `String` (serializes via `JsonSerializer`, accepts all inputs) or `Binary` (registered POCOs only with type hints) |

### Session management {#session-management}

| Property | Type | Default | Connection String Key | Description |
|----------|------|---------|----------------------|-------------|
| UseSession | `bool` | `false` | `UseSession` | Enable stateful sessions; serializes requests |
| SessionId | `string` | `null` | `SessionId` | Session ID; auto-generates GUID if null and UseSession is true |

:::note
The `UseSession` flag enables persistence of the server session, allowing use of `SET` statements and temporary tables. Sessions will be reset after 60 seconds of inactivity (default timeout). Session lifetime can be extended by setting session settings via ClickHouse statements or the server configuration.

The `ClickHouseConnection` class normally allows for parallel operation (multiple threads can run queries concurrently). However, enabling `UseSession` flag will limit that to one active query per connection at any moment of time (this is a server-side limitation).
:::

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

For a full list of available settings, see [here](https://clickhouse.com/docs/operations/settings/settings).
:::

---

### Connection string examples {#connection-string-examples}

#### Basic connection {#basic-connection}

```text
Host=localhost;Port=8123;Username=default;Password=secret;Database=mydb
```

#### With custom ClickHouse settings {#with-custom-clickhouse-settings}

```text
Host=localhost;set_max_threads=4;set_readonly=1;set_max_memory_usage=10000000000
```

---

### QueryOptions {#query-options}

`QueryOptions` allows you to override client-level settings on a per-query basis. All properties are optional and only override the client defaults when specified.

| Property | Type | Description |
|----------|------|-------------|
| QueryId | `string` | Custom query identifier for tracking in `system.query_log` or cancellation |
| Database | `string` | Override the default database for this query |
| Roles | `IReadOnlyList<string>` | Override client roles for this query |
| CustomSettings | `IDictionary<string, object>` | ClickHouse server settings for this query (e.g., `max_threads`) |
| CustomHeaders | `IDictionary<string, string>` | Additional HTTP headers for this query |
| UseSession | `bool?` | Override session behavior for this query |
| SessionId | `string` | Session ID for this query (requires `UseSession = true`) |
| BearerToken | `string` | Override authentication token for this query |
| Timeout | `TimeSpan?` | Override client timeout for this query |

**Example:**

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
    Timeout = TimeSpan.FromMinutes(5)
};

var reader = await client.ExecuteReaderAsync(
    "SELECT * FROM large_table",
    parameters: null,
    options: options
);
```

---

### InsertOptions {#insert-options}

`InsertOptions` extends `QueryOptions` with settings specific to bulk insert operations via `InsertBinaryAsync`.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| BatchSize | `int` | 100,000 | Number of rows per batch |
| MaxDegreeOfParallelism | `int` | 1 | Number of parallel batch uploads |
| Format | `RowBinaryFormat` | `RowBinary` | Binary format: `RowBinary` or `RowBinaryWithDefaults` |

All `QueryOptions` properties are also available on `InsertOptions`.

**Example:**

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

## ClickHouseClient {#clickhouse-client}

`ClickHouseClient` is the recommended API for interacting with ClickHouse. It is thread-safe, designed for singleton use, and manages HTTP connection pooling internally.

### Creating a client {#creating-a-client}

Create a `ClickHouseClient` with a connection string or a `ClickHouseClientSettings` object. See the [Configuration](#configuration) section for available options.

The details for your ClickHouse Cloud service are available in the ClickHouse Cloud console.

Select a service and click **Connect**:

<Image img={cloud_connect_button} size="md" alt="ClickHouse Cloud service connect button" border />

Choose **C#**. Connection details are displayed below.

<Image img={connection_details_csharp} size="md" alt="ClickHouse Cloud C# connection details" border />

If you are using self-managed ClickHouse, the connection details are set by your ClickHouse administrator.

Using a connection string:

```csharp
using ClickHouse.Driver;

using var client = new ClickHouseClient("Host=localhost;Username=default;Password=secret");
```

Or using `ClickHouseClientSettings`:

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

For dependency injection scenarios, use `IHttpClientFactory`:

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
`ClickHouseClient` is designed to be long-lived and shared across your application. Create it once (typically as a singleton) and reuse it for all database operations. The client manages HTTP connection pooling internally.
:::

---

### Executing queries {#executing-queries}

Use `ExecuteNonQueryAsync` for statements that don't return results:

```csharp
// Create a table
await client.ExecuteNonQueryAsync(
    "CREATE TABLE IF NOT EXISTS default.my_table (id Int64, name String) ENGINE = Memory"
);

// Drop a table
await client.ExecuteNonQueryAsync("DROP TABLE IF EXISTS default.my_table");
```

Use `ExecuteScalarAsync` to retrieve a single value:

```csharp
var count = await client.ExecuteScalarAsync("SELECT count() FROM default.my_table");
Console.WriteLine($"Row count: {count}");

var version = await client.ExecuteScalarAsync("SELECT version()");
Console.WriteLine($"Server version: {version}");
```

---

### Inserting data {#inserting-data}

#### Parameterized inserts {#parameterized-inserts}

Insert data using parameterized queries with `ExecuteNonQueryAsync`. Parameter types must be specified in the SQL using `{name:Type}` syntax:

```csharp
using ClickHouse.Driver;
using ClickHouse.Driver.ADO.Parameters;

var parameters = new ClickHouseParameterCollection();
parameters.Add(new ClickHouseDbParameter("id", 1L));
parameters.Add(new ClickHouseDbParameter("name", "Alice"));

await client.ExecuteNonQueryAsync(
    "INSERT INTO default.my_table (id, name) VALUES ({id:Int64}, {name:String})",
    parameters
);
```

---

#### Bulk inserts {#bulk-insert}

Use `InsertBinaryAsync` for inserting large numbers of rows efficiently. It streams data using ClickHouse's native row binary format, supports parallel batch uploads, and avoids "URL too long" errors that can occur with parameterized queries.

```csharp
// Prepare data as IEnumerable<object[]>
var rows = Enumerable.Range(0, 1_000_000)
    .Select(i => new object[] { (long)i, $"value{i}" });

var columns = new[] { "id", "name" };

// Basic insert
long rowsInserted = await client.InsertBinaryAsync("default.my_table", columns, rows);
Console.WriteLine($"Rows inserted: {rowsInserted}");
```

For large datasets, configure batching and parallelism with `InsertOptions`:

```csharp
var options = new InsertOptions
{
    BatchSize = 100_000,           // Rows per batch (default: 100,000)
    MaxDegreeOfParallelism = 4     // Parallel batch uploads (default: 1)
};
```

:::note
* The client automatically fetches table structure via `SELECT * FROM <table> WHERE 1=0` before inserting. Provided values must match the target column types.
* When `MaxDegreeOfParallelism > 1`, batches are uploaded in parallel. Sessions are not compatible with parallel insertion; either disable sessions or set `MaxDegreeOfParallelism = 1`.
* Use `RowBinaryFormat.RowBinaryWithDefaults` in `InsertOptions.Format` if you want the server to apply DEFAULT values for columns not provided.
:::

---

### Reading data {#reading-data}

Use `ExecuteReaderAsync` to execute SELECT queries. The returned `ClickHouseDataReader` provides typed access to result columns via methods like `GetInt64()`, `GetString()`, and `GetFieldValue<T>()`.

Call `Read()` to advance to the next row. It returns `false` when there are no more rows. Access columns by index (0-based) or by column name.

```csharp
using ClickHouse.Driver.ADO.Parameters;

var parameters = new ClickHouseParameterCollection();
parameters.Add(new ClickHouseDbParameter("max_id", 100L));

var reader = await client.ExecuteReaderAsync(
    "SELECT * FROM default.my_table WHERE id < {max_id:Int64}",
    parameters
);

while (reader.Read())
{
    Console.WriteLine($"Id: {reader.GetInt64(0)}, Name: {reader.GetString(1)}");
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
SQL 'bind' parameters are passed as HTTP URI query parameters, so using too many of them may result in a "URL too long" exception. Use `InsertBinaryAsync` for bulk data insertion to avoid this limitation.
:::

---

### Query ID {#query-id}

Every query is assigned a unique `query_id` that can be used to fetch data from the `system.query_log` table or cancel long-running queries. You can specify a custom query ID via `QueryOptions`:

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
If you are specifying a custom `QueryId`, ensure it is unique for every call. A random GUID is a good choice.
:::

---

### Raw streaming {#raw-streaming}

Use `ExecuteRawResultAsync` to stream query results in a specific format directly, bypassing the data reader. This is useful for exporting data to files or passing through to other systems:

```csharp
using var result = await client.ExecuteRawResultAsync(
    "SELECT * FROM default.my_table LIMIT 100 FORMAT JSONEachRow"
);

await using var stream = await result.ReadAsStreamAsync();
using var reader = new StreamReader(stream);
var json = await reader.ReadToEndAsync();
```

Common formats: `JSONEachRow`, `CSV`, `TSV`, `Parquet`, `Native`. See the [formats documentation](/docs/interfaces/formats) for all options.

---

### Raw stream insert {#raw-stream-insert}

Use `InsertRawStreamAsync` to insert data directly from file or memory streams in formats like CSV, JSON, Parquet, or any [supported ClickHouse format](/docs/interfaces/formats).

**Insert from a CSV file:**

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
See the [format settings documentation](/docs/operations/settings/formats) for options to control data ingestion behavior.
:::

---

### More examples {#more-examples}

For additional practical usage examples, see the [examples directory](https://github.com/ClickHouse/clickhouse-cs/tree/main/examples) in the GitHub repository.

## ADO.NET {#ado-net}

The library provides full ADO.NET support through `ClickHouseConnection`, `ClickHouseCommand`, and `ClickHouseDataReader`. This API is required for ORM integration (Dapper, Linq2db) and when you need standard .NET database abstractions.

### Lifetime management with ClickHouseDataSource {#ado-net-datasource}

**Always create connections from a `ClickHouseDataSource`** to ensure proper lifetime management and connection pooling. The DataSource manages a single `ClickHouseClient` internally, and all connections share its HTTP connection pool.

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

For dependency injection:

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
**Do not create `ClickHouseConnection` directly** in production code. Each direct instantiation creates a new HTTP client and connection pool, which can lead to socket exhaustion under load:

```csharp
// DON'T DO THIS - creates new connection pool each time
using var conn = new ClickHouseConnection("Host=localhost");
await conn.OpenAsync();
```

Instead, always use `ClickHouseDataSource` or share a single `ClickHouseClient` instance.
:::

---

### Using ClickHouseCommand {#ado-net-command}

Create commands from a connection to execute SQL:

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

Command methods:
- `ExecuteNonQueryAsync()` - For INSERT, UPDATE, DELETE, DDL statements
- `ExecuteScalarAsync()` - Returns first column of first row
- `ExecuteReaderAsync()` - Returns a `ClickHouseDataReader` for iterating results

---

### Using ClickHouseDataReader {#ado-net-reader}

The `ClickHouseDataReader` provides typed access to query results:

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

## Best practices {#best-practices}

### Connection lifetime and pooling {#best-practices-connection-lifetime}

`ClickHouse.Driver` uses `System.Net.Http.HttpClient` under the hood. `HttpClient` has a per-endpoint connection pool. As a consequence:

* Database sessions are multiplexed through HTTP connections managed by the connection pool.
* HTTP connections are recycled automatically by the pool.
* Connections can stay alive after `ClickHouseClient` or `ClickHouseConnection` objects are disposed.

**Recommended patterns:**

| Scenario | Recommended Approach |
|----------|---------------------|
| General use | Use a singleton `ClickHouseClient` |
| ADO.NET / ORMs | Use `ClickHouseDataSource` (creates connections that share the same pool) |
| DI environments | Register `ClickHouseClient` or `ClickHouseDataSource` as singleton with `IHttpClientFactory` |

:::important
When using a custom `HttpClient` or `HttpClientFactory`, ensure that the `PooledConnectionIdleTimeout` is set to a value smaller than the server's `keep_alive_timeout`, in order to avoid errors due to half-closed connections. The default `keep_alive_timeout` for Cloud deployments is 10 seconds.
:::

:::warning
Avoid creating multiple `ClickHouseClient` or standalone `ClickHouseConnection` instances without a shared `HttpClient`. Each instance creates its own connection pool.
:::

---

### DateTime handling {#best-practice-datetime}

1. **Use UTC whenever possible.** Store timestamps as `DateTime('UTC')` columns and use `DateTimeKind.Utc` in your code. This eliminates timezone ambiguity.

2. **Use `DateTimeOffset` for explicit timezone handling.** It always represents a specific instant and includes the offset information.

3. **Specify timezone in SQL type hints.** When using parameters with `Unspecified` DateTime values targeting non-UTC columns, include the timezone in the SQL:
   ```csharp
   var parameters = new ClickHouseParameterCollection();
   parameters.Add("dt", myDateTime);

   await client.ExecuteNonQueryAsync(
       "INSERT INTO table (dt) VALUES ({dt:DateTime('Europe/Amsterdam')})",
       parameters
   );
   ```

---

### Async inserts {#async-inserts}

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

### Sessions {#best-practices-sessions}

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

using var client = new ClickHouseClient(settings);

await client.ExecuteNonQueryAsync("CREATE TEMPORARY TABLE temp_ids (id UInt64)");
await client.ExecuteNonQueryAsync("INSERT INTO temp_ids VALUES (1), (2), (3)");

var reader = await client.ExecuteReaderAsync(
    "SELECT * FROM users WHERE id IN (SELECT id FROM temp_ids)"
);
```

**Using ADO.NET (for ORM compatibility):**

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

---

#### Floating point types {#type-map-reading-floating-points}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| Float32 | `float` |
| Float64 | `double` |
| BFloat16 | `float` |

---

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

---

#### Boolean type {#type-map-reading-boolean}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| Bool | `bool` |

---

#### String types {#type-map-reading-strings}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| String | `string` |
| FixedString(N) | `string` |

:::note
By default, both `String` and `FixedString(N)` columns are returned as `string`. Set `ReadStringsAsByteArrays=true` in your connection string to read them as `byte[]` instead. This is useful when storing binary data that may not be valid UTF-8.
:::

---

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

ClickHouse stores `DateTime` and `DateTime64` values internally as Unix timestamps (seconds or sub-second units since epoch). While the storage is always in UTC, columns can have an associated timezone that affects how values are displayed and interpreted.

When reading `DateTime` values, the `DateTime.Kind` property is set based on the column's timezone:

| Column Definition | Returned DateTime.Kind | Notes |
|-------------------|------------------------|-------|
| `DateTime('UTC')` | `Utc` | Explicit UTC timezone |
| `DateTime('Europe/Amsterdam')` | `Unspecified` | Offset applied |
| `DateTime` | `Unspecified` | Wall-clock time preserved as-is |

For non-UTC columns, the returned `DateTime` represents the wall-clock time in that timezone. Use `ClickHouseDataReader.GetDateTimeOffset()` to get a `DateTimeOffset` with the correct offset for that timezone:

```csharp
var reader = (ClickHouseDataReader)await connection.ExecuteReaderAsync(
    "SELECT toDateTime('2024-06-15 14:30:00', 'Europe/Amsterdam')");
reader.Read();

var dt = reader.GetDateTime(0);    // 2024-06-15 14:30:00, Kind=Unspecified
var dto = reader.GetDateTimeOffset(0); // 2024-06-15 14:30:00 +02:00 (CEST)
```

For columns **without** an explicit timezone (i.e., `DateTime` instead of `DateTime('Europe/Amsterdam')`), the driver returns a `DateTime` with `Kind=Unspecified`. This preserves the wall-clock time exactly as stored without making assumptions about timezone.

If you need timezone-aware behavior for columns without explicit timezones, either:
1. Use explicit timezones in your column definitions: `DateTime('UTC')` or `DateTime('Europe/Amsterdam')`
2. Apply the timezone yourself after reading.

---

#### JSON type {#type-map-reading-json}

| ClickHouse Type | .NET Type | Notes |
|-----------------|-----------|-------|
| Json | `JsonObject` | Default (`JsonReadMode=Binary`) |
| Json | `string` | When `JsonReadMode=String` |

The return type for JSON columns is controlled by the `JsonReadMode` setting:

- **`Binary` (default)**: Returns `System.Text.Json.Nodes.JsonObject`. Provides structured access to JSON data, but specialized ClickHouse types (like IP addresses, UUIDs, large decimals) are converted to their string representations within the JSON structure.

- **`String`**: Returns the raw JSON as a `string`. Preserves the exact JSON representation from ClickHouse, which is useful when you need to pass the JSON through without parsing, or when you want to handle deserialization yourself.

```csharp
// Configure string mode via settings
var settings = new ClickHouseClientSettings("Host=localhost")
{
    JsonReadMode = JsonReadMode.String
};

// Or via connection string
// "Host=localhost;JsonReadMode=String"
```

---

#### Other types {#type-map-reading-other}

| ClickHouse Type | .NET Type |
|-----------------|-----------|
| UUID | `Guid` |
| IPv4 | `IPAddress` |
| IPv6 | `IPAddress` |
| Nothing | `DBNull` |
| Dynamic | See note |
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

---

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

---

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

---

#### Floating point types {#type-map-writing-floating-point}

| ClickHouse Type | Accepted .NET Types | Notes |
|-----------------|---------------------|-------|
| Float32 | `float`, any `Convert.ToSingle()` compatible |  |
| Float64 | `double`, any `Convert.ToDouble()` compatible | |
| BFloat16 | `float`, any `Convert.ToSingle()` compatible | Truncates to 16-bit brain float format |

---

#### Boolean type {#type-map-writing-boolean}

| ClickHouse Type | Accepted .NET Types | Notes |
|-----------------|---------------------|-------|
| Bool | `bool` |  |

---

#### String types {#type-map-writing-strings}

| ClickHouse Type | Accepted .NET Types | Notes |
|-----------------|---------------------|-------|
| String | `string`, `byte[]`, `ReadOnlyMemory<byte>`, `Stream` | Binary types written directly; streams can be seekable or non-seekable |
| FixedString(N) | `string`, `byte[]`, `ReadOnlyMemory<byte>`, `Stream` | String is UTF-8 encoded and padded; binary types must be exactly N bytes |

---

#### Date and time types {#type-map-writing-datetime}

| ClickHouse Type | Accepted .NET Types | Notes |
|-----------------|---------------------|-------|
| Date | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types | Converted to Unix days as UInt16 |
| Date32 | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types | Converted to Unix days as Int32 |
| DateTime | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types | See below for details|
| DateTime32 | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types | Same as DateTime |
| DateTime64 | `DateTime`, `DateTimeOffset`, `DateOnly`, NodaTime types | Precision based on Scale parameter |
| Time | `TimeSpan`, `int` | Clamped to ±999:59:59; int treated as seconds |
| Time64 | `TimeSpan`, `decimal`, `double`, `float`, `int`, `long`, `string` | String parsed as `[-]HHH:MM:SS[.fraction]`; clamped to ±999:59:59.999999999 |

The driver respects `DateTime.Kind` when writing values:

 | DateTime.Kind | HTTP Parameters | Bulk |
 | --- | --- | --- |
  | Utc           | Instant preserved | Instant preserved |
  | Local         | Instant preserved | Instant preserved |
  | Unspecified   | Treated as wall-clock in parameter type's timezone (defaults to UTC) | Treated as wall-clock in column's timezone |

`DateTimeOffset` values always preserve the exact instant.

**Example: UTC DateTime (instant preserved)**
```csharp
var utcTime = new DateTime(2024, 1, 15, 12, 0, 0, DateTimeKind.Utc);
// Stored as 12:00 UTC
// Read from DateTime('Europe/Amsterdam') column: 13:00 (UTC+1)
// Read from DateTime('UTC') column: 12:00 UTC
```

**Example: unspecified DateTime (wall-clock time)**
```csharp
var wallClock = new DateTime(2024, 1, 15, 14, 30, 0, DateTimeKind.Unspecified);
// Written to DateTime('Europe/Amsterdam') column: stored as 14:30 Amsterdam time
// Read back from DateTime('Europe/Amsterdam') column: 14:30
```

**Recommendation:** for simplest and most predictable behavior, use `DateTimeKind.Utc` or `DateTimeOffset` for all DateTime operations. This ensures your code works consistently regardless of server timezone, client timezone, or column timezone.

#### HTTP parameters vs bulk copy {#datetime-http-param-vs-bulkcopy}

There is an important difference between HTTP parameter binding and bulk copy when writing `Unspecified` DateTime values:

**Bulk Copy** knows the target column's timezone and correctly interprets `Unspecified` values in that timezone.

**HTTP Parameters** do not automatically know the column timezone. You must specify it in the SQL type hint:

```csharp
// CORRECT: Timezone in SQL type hint - type is extracted automatically
command.CommandText = "INSERT INTO table (dt_amsterdam) VALUES ({dt:DateTime('Europe/Amsterdam')})";
command.AddParameter("dt", myDateTime);

// INCORRECT: Without timezone hint, interpreted as UTC
command.CommandText = "INSERT INTO table (dt_amsterdam) VALUES ({dt:DateTime})";
command.AddParameter("dt", myDateTime);
// String value "2024-01-15 14:30:00" interpreted as UTC, not Amsterdam time!
```

| `DateTime.Kind` | Target Column | HTTP Param (with tz hint) | HTTP Param (no tz hint) | Bulk Copy |
|-----------------|---------------|---------------------------|-------------------------|-----------|
| `Utc` | UTC | Instant preserved | Instant preserved | Instant preserved |
| `Utc` | Europe/Amsterdam | Instant preserved | Instant preserved | Instant preserved |
| `Local` | Any | Instant preserved | Instant preserved | Instant preserved |
| `Unspecified` | UTC | Treated as UTC | Treated as UTC | Treated as UTC |
| `Unspecified` | Europe/Amsterdam | Treated as Amsterdam time | **Treated as UTC** | Treated as Amsterdam time |

---

#### Decimal types {#type-map-writing-decimal}

| ClickHouse Type | Accepted .NET Types | Notes |
|-----------------|---------------------|-------|
| Decimal(P,S) | `decimal`, `ClickHouseDecimal`, any `Convert.ToDecimal()` compatible | Throws `OverflowException` if exceeds precision |
| Decimal32 | `decimal`, `ClickHouseDecimal`, any `Convert.ToDecimal()` compatible | Max precision 9 |
| Decimal64 | `decimal`, `ClickHouseDecimal`, any `Convert.ToDecimal()` compatible | Max precision 18 |
| Decimal128 | `decimal`, `ClickHouseDecimal`, any `Convert.ToDecimal()` compatible | Max precision 38 |
| Decimal256 | `decimal`, `ClickHouseDecimal`, any `Convert.ToDecimal()` compatible | Max precision 76 |

---

#### JSON type {#type-map-writing-json}

| ClickHouse Type | Accepted .NET Types | Notes |
|-----------------|---------------------|-------|
| Json | `string`, `JsonObject`, `JsonNode`, any object | Behavior depends on `JsonWriteMode` setting |

The behavior when writing JSON is controlled by the `JsonWriteMode` setting:

| Input Type | `JsonWriteMode.String` (default) | `JsonWriteMode.Binary` |
|------------|----------------------------------|------------------------|
| `string` | Passed through directly | Throws `ArgumentException` |
| `JsonObject` | Serialized via `ToJsonString()` | Throws `ArgumentException` |
| `JsonNode` | Serialized via `ToJsonString()` | Throws `ArgumentException` |
| Registered POCO | Serialized via `JsonSerializer.Serialize()` | Binary encoding with type hints, custom path attributes supported |
| Unregistered POCO / Anonymous object | Serialized via `JsonSerializer.Serialize()` | Throws `ClickHouseJsonSerializationException` |

- **`String` (default)**: Accepts `string`, `JsonObject`, `JsonNode`, or any object. All inputs are serialized via `System.Text.Json.JsonSerializer` and sent as JSON strings for server-side parsing. This is the most flexible mode and works without type registration.

- **`Binary`**: Only accepts registered POCO types. Data is converted to ClickHouse's binary JSON format client-side with full type hint support. Requires calling `connection.RegisterJsonSerializationType<T>()` before use. Writing `string` or `JsonNode` values in this mode throws `ArgumentException`.

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

##### Typed JSON columns {#json-typed-columns}

When a JSON column has type hints (e.g., `JSON(id UInt64, price Decimal128(2))`), the driver uses these hints to serialize values with full type fidelity. This preserves precision for types like `UInt64`, `Decimal`, `UUID`, and `DateTime64` that would otherwise lose precision when serialized as generic JSON.

##### POCO serialization {#json-poco-serialization}

POCOs can be written to JSON columns in two ways depending on the `JsonWriteMode`:

**String mode (default)**: POCOs are serialized via `System.Text.Json.JsonSerializer`. No type registration is required. This is the simplest approach and works with anonymous objects.

**Binary mode**: POCOs are serialized using the driver's binary JSON format with full type hint support. Types must be registered with `connection.RegisterJsonSerializationType<T>()` before use. This mode supports custom path mappings via attributes:

- **`[ClickHouseJsonPath("path")]`**: Maps a property to a custom JSON path. Useful for nested structures or when the property name differs from the desired JSON key. **Only works in Binary mode.**

- **`[ClickHouseJsonIgnore]`**: Excludes a property from serialization. **Only works in Binary mode.**

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

Property name matching with column type hints is case-sensitive. A property `UserId` will only match a hint defined as `UserId`, not `userid`. This matches ClickHouse behavior which allows paths like `userName` and `UserName` to coexist as separate fields.

**Limitations (Binary mode only):**
- POCO types must be registered on the connection with `connection.RegisterJsonSerializationType<T>()` before serialization. Attempting to serialize an unregistered type throws `ClickHouseJsonSerializationException`.
- Dictionary and array/list properties require type hints in the column definition to be serialized correctly. Without hints, use String mode instead.
- Null values in POCO properties are only written when the path has a `Nullable(T)` type hint in the column definition. ClickHouse doesn't allow `Nullable` types inside dynamic JSON paths, so unhinted null properties are skipped.
- `ClickHouseJsonPath` and `ClickHouseJsonIgnore` attributes are ignored in String mode (they only work in Binary mode).

---

#### Other types {#type-map-writing-other}

| ClickHouse Type | Accepted .NET Types | Notes |
|-----------------|---------------------|-------|
| UUID | `Guid`, `string` | String parsed as Guid |
| IPv4 | `IPAddress`, `string` | Must be IPv4; string parsed via `IPAddress.Parse()` |
| IPv6 | `IPAddress`, `string` | Must be IPv6; string parsed via `IPAddress.Parse()` |
| Nothing | Any | Writes nothing (no-op) |
| Dynamic | — | **Not supported** (throws `NotImplementedException`) |
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

---

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

---

#### Not supported for writing {#type-map-writing-not-supported}

| ClickHouse Type | Notes |
|-----------------|-------|
| Dynamic | Throws `NotImplementedException` |
| AggregateFunction | Throws `AggregateFunctionException` |

---

### Nested type handling {#nested-type-handling}

ClickHouse nested types (`Nested(...)`) can be read and written using array semantics.

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

## Logging and diagnostics {#logging-and-diagnostics}

The ClickHouse .NET client integrates with the `Microsoft.Extensions.Logging` abstractions to offer lightweight, opt-in logging. When enabled, the driver emits structured messages for connection lifecycle events, command execution, transport operations, and bulk insert operations. Logging is entirely optional—applications that do not configure a logger continue to run without additional overhead.

### Quick start {#logging-quick-start}

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

#### Using appsettings.json {#logging-appsettings-config}

You can configure logging levels using standard .NET configuration:

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

#### Using in-memory configuration {#logging-inmemory-config}

You can also configure logging verbosity by category in code:

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

### Categories and emitters {#logging-categories}

The driver uses dedicated categories so that you can fine-tune log levels per component:

| Category | Source | Highlights |
| --- | --- | --- |
| `ClickHouse.Driver.Connection` | `ClickHouseConnection` | Connection lifecycle, HTTP client factory selection, connection opening/closing, session management. |
| `ClickHouse.Driver.Command` | `ClickHouseCommand` | Query execution start/completion, timing, query IDs, server statistics, and error details. |
| `ClickHouse.Driver.Transport` | `ClickHouseConnection` | Low-level HTTP streaming requests, compression flags, response status codes, and transport failures. |
| `ClickHouse.Driver.Client` | `ClickHouseClient` | Binary insert, qqueries, and other operations |
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

## TLS configuration {#tls-configuration}

When connecting to ClickHouse over HTTPS, you can configure TLS/SSL behavior in several ways.

### Custom certificate validation {#custom-certificate-validation}

For production environments requiring custom certificate validation logic, provide your own `HttpClient` with a configured `ServerCertificateCustomValidationCallback` handler:

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
Important considerations when providing a custom HttpClient
- **Automatic decompression**: You must enable `AutomaticDecompression` if compression is not disabled (compression is enabled by default).
- **Idle timeout**: Set `PooledConnectionIdleTimeout` smaller than the server's `keep_alive_timeout` (10 seconds for ClickHouse Cloud) to avoid connection errors from half-open connections.
:::

## ORM support {#orm-support}

ORMs require the ADO.NET API (`ClickHouseConnection`). For proper connection lifetime management, create connections from a `ClickHouseDataSource`:

```csharp
// Register DataSource as singleton
var dataSource = new ClickHouseDataSource("Host=localhost;Username=default");

// Create connections for ORM use
await using var connection = await dataSource.OpenConnectionAsync();
// Pass connection to your ORM...
```

### Dapper {#orm-support-dapper}

`ClickHouse.Driver` can be used with Dapper, but anonymous objects are not supported.

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
