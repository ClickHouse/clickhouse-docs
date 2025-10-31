---
sidebar_label: 'Driver API'
sidebar_position: 2
keywords: ['clickhouse', 'python', 'driver', 'api', 'client']
description: 'ClickHouse Connect Driver API'
slug: /integrations/language-clients/python/driver-api
title: 'ClickHouse Connect Driver API'
doc_type: 'reference'
---

# ClickHouse Connect driver API {#clickhouse-connect-driver-api}

:::note
Passing keyword arguments is recommended for most api methods given the number of possible arguments, most of which are optional.

*Methods not documented here are not considered part of the API, and may be removed or changed.*
:::

## Client Initialization {#client-initialization}

The `clickhouse_connect.driver.client` class provides the primary interface between a Python application and the ClickHouse database server. Use the `clickhouse_connect.get_client` function to obtain a Client instance, which accepts the following arguments:

### Connection arguments {#connection-arguments}

| Parameter                | Type        | Default                       | Description                                                                                                                                                                                                                                           |
|--------------------------|-------------|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interface                | str         | http                          | Must be http or https.                                                                                                                                                                                                                                |
| host                     | str         | localhost                     | The hostname or IP address of the ClickHouse server. If not set, `localhost` will be used.                                                                                                                                                            |
| port                     | int         | 8123 or 8443                  | The ClickHouse HTTP or HTTPS port. If not set will default to 8123, or to 8443 if *secure*=*True* or *interface*=*https*.                                                                                                                             |
| username                 | str         | default                       | The ClickHouse user name. If not set, the `default` ClickHouse user will be used.                                                                                                                                                                     |
| password                 | str         | *&lt;empty string&gt;*        | The password for *username*.                                                                                                                                                                                                                          |
| database                 | str         | *None*                        | The default database for the connection. If not set, ClickHouse Connect will use the default database for *username*.                                                                                                                                 |
| secure                   | bool        | False                         | Use HTTPS/TLS. This overrides inferred values from the interface or port arguments.                                                                                                                                                                   |
| dsn                      | str         | *None*                        | A string in standard DSN (Data Source Name) format. Other connection values (such as host or user) will be extracted from this string if not set otherwise.                                                                                           |
| compress                 | bool or str | True                          | Enable compression for ClickHouse HTTP inserts and query results. See [Additional Options (Compression)](additional-options.md#compression)                                                                                                           |
| query_limit              | int         | 0 (unlimited)                 | Maximum number of rows to return for any `query` response. Set this to zero to return unlimited rows. Note that large query limits may result in out of memory exceptions if results are not streamed, as all results are loaded into memory at once. |
| query_retries            | int         | 2                             | Maximum number of retries for a `query` request. Only "retryable" HTTP responses will be retried. `command` or `insert` requests are not automatically retried by the driver to prevent unintended duplicate requests.                                |
| connect_timeout          | int         | 10                            | HTTP connection timeout in seconds.                                                                                                                                                                                                                   |
| send_receive_timeout     | int         | 300                           | Send/receive timeout for the HTTP connection in seconds.                                                                                                                                                                                              |
| client_name              | str         | *None*                        | client_name prepended to the HTTP User Agent header. Set this to track client queries in the ClickHouse system.query_log.                                                                                                                             |
| pool_mgr                 | obj         | *&lt;default PoolManager&gt;* | The `urllib3` library PoolManager to use. For advanced use cases requiring multiple connection pools to different hosts.                                                                                                                              |
| http_proxy               | str         | *None*                        | HTTP proxy address (equivalent to setting the HTTP_PROXY environment variable).                                                                                                                                                                       |
| https_proxy              | str         | *None*                        | HTTPS proxy address (equivalent to setting the HTTPS_PROXY environment variable).                                                                                                                                                                     |
| apply_server_timezone    | bool        | True                          | Use server timezone for timezone aware query results. See [Timezone Precedence](advanced-querying.md#time-zones)                                                                                                                                      |
| show_clickhouse_errors   | bool        | True                          | Include detailed ClickHouse server error messages and exception codes in client exceptions.                                                                                                                                                           |
| autogenerate_session_id  | bool        | *None*                        | Override the global `autogenerate_session_id` setting. If True, automatically generate a UUID4 session ID when none is provided.                                                                                                                      |
| proxy_path               | str         | &lt;empty string&gt;          | Optional path prefix to add to the ClickHouse server URL for proxy configurations.                                                                                                                                                                    |
| form_encode_query_params | bool        | False                         | Send query parameters as form-encoded data in the request body instead of URL parameters. Useful for queries with large parameter sets that might exceed URL length limits.                                                                           |
| rename_response_column   | str         | *None*                        | Optional callback function or column name mapping to rename response columns in query results.                                                                                                                                                        |

### HTTPS/TLS arguments {#httpstls-arguments}

| Parameter        | Type | Default | Description                                                                                                                                                                                                                                                                       |
|------------------|------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| verify           | bool | True    | Validate the ClickHouse server TLS/SSL certificate (hostname, expiration, etc.) if using HTTPS/TLS.                                                                                                                                                                               |
| ca_cert          | str  | *None*  | If *verify*=*True*, the file path to Certificate Authority root to validate ClickHouse server certificate, in .pem format. Ignored if verify is False. This is not necessary if the ClickHouse server certificate is a globally trusted root as verified by the operating system. |
| client_cert      | str  | *None*  | File path to a TLS Client certificate in .pem format (for mutual TLS authentication). The file should contain a full certificate chain, including any intermediate certificates.                                                                                                  |
| client_cert_key  | str  | *None*  | File path to the private key for the Client Certificate. Required if the private key is not included the Client Certificate key file.                                                                                                                                             |
| server_host_name | str  | *None*  | The ClickHouse server hostname as identified by the CN or SNI of its TLS certificate. Set this to avoid SSL errors when connecting through a proxy or tunnel with a different hostname                                                                                            |
| tls_mode         | str  | *None*  | Controls advanced TLS behavior. `proxy` and `strict` do not invoke ClickHouse mutual TLS connection, but do send client cert and key.  `mutual` assumes ClickHouse mutual TLS auth with a client certificate.  *None*/default behavior is `mutual`                                |

### Settings argument {#settings-argument}

Finally, the `settings` argument to `get_client` is used to pass additional ClickHouse settings to the server for each client request. Note that in most cases, users with *readonly*=*1* access cannot alter settings sent with a query, so ClickHouse Connect will drop such settings in the final request and log a warning. The following settings apply only to HTTP queries/sessions used by ClickHouse Connect, and are not documented as general ClickHouse settings.

| Setting           | Description                                                                                                                                                      |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| buffer_size       | Buffer size (in bytes) used by the ClickHouse server before writing to the HTTP channel.                                                                         |
| session_id        | A unique session ID to associate related queries on the server. Required for temporary tables.                                                                   |
| compress          | Whether the ClickHouse server should compress the POST response data. This setting should only be used for "raw" queries.                                        |
| decompress        | Whether the data sent to the ClickHouse server must be decompressed. This setting should only be used for "raw" inserts.                                         |
| quota_key         | The quota key associated with this request. See the ClickHouse server documentation on quotas.                                                                   |
| session_check     | Used to check the session status.                                                                                                                                |
| session_timeout   | Number of seconds of inactivity before the session identified by the session ID will time out and no longer be considered valid. Defaults to 60 seconds.         |
| wait_end_of_query | Buffers the entire response on the ClickHouse server. This setting is required to return summary information, and is set automatically on non-streaming queries. |
| role              | ClickHouse role to be used for the session. Valid transport setting that can be included in query context.                                                       |

For other ClickHouse settings that can be sent with each query, see [the ClickHouse documentation](/operations/settings/settings.md).

### Client creation examples {#client-creation-examples}

- Without any parameters, a ClickHouse Connect client will connect to the default HTTP port on `localhost` with the default user and no password:

```python
import clickhouse_connect

client = clickhouse_connect.get_client()
print(client.server_version)
# Output: '22.10.1.98'
```

- Connecting to a secure (HTTPS) external ClickHouse server

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='play.clickhouse.com', secure=True, port=443, user='play', password='clickhouse')
print(client.command('SELECT timezone()'))
# Output: 'Etc/UTC'
```

- Connecting with a session ID and other custom connection parameters and ClickHouse settings.

```python
import clickhouse_connect

client = clickhouse_connect.get_client(
    host='play.clickhouse.com',
    user='play',
    password='clickhouse',
    port=443,
    session_id='example_session_1',
    connect_timeout=15,
    database='github',
    settings={'distributed_ddl_task_timeout':300},
)
print(client.database)
# Output: 'github'
```

## Client Lifecycle and Best Practices {#client-lifecycle-and-best-practices}

Creating a ClickHouse Connect client is an expensive operation that involves establishing a connection, retrieving server metadata, and initializing settings. Follow these best practices for optimal performance:

### Core principles {#core-principles}

- **Reuse clients**: Create clients once at application startup and reuse them throughout the application lifetime
- **Avoid frequent creation**: Don't create a new client for each query or request (this wastes hundreds of milliseconds per operation)
- **Clean up properly**: Always close clients when shutting down to release connection pool resources
- **Share when possible**: A single client can handle many concurrent queries through its connection pool (see threading notes below)

### Basic patterns {#basic-patterns}

**✅ Good: Reuse a single client**

```python
import clickhouse_connect

# Create once at startup
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')

# Reuse for all queries
for i in range(1000):
    result = client.query('SELECT count() FROM users')

# Close on shutdown
client.close()
```

**❌ Bad: Creating clients repeatedly**

```python
# BAD: Creates 1000 clients with expensive initialization overhead
for i in range(1000):
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    result = client.query('SELECT count() FROM users')
    client.close()
```

### Multi-threaded applications {#multi-threaded-applications}

:::warning
Client instances are **NOT thread-safe** when using session IDs. By default, clients have an auto-generated session ID, and concurrent queries within the same session will raise a `ProgrammingError`.
:::

To share a client across threads safely:

```python
import clickhouse_connect
import threading

# Option 1: Disable sessions (recommended for shared clients)
client = clickhouse_connect.get_client(
    host='my-host',
    username='default',
    password='password',
    autogenerate_session_id=False  # Required for thread safety
)

def worker(thread_id):
    # All threads can now safely use the same client
    result = client.query(f"SELECT {thread_id}")
    print(f"Thread {thread_id}: {result.result_rows[0][0]}")


threads = [threading.Thread(target=worker, args=(i,)) for i in range(10)]
for t in threads:
    t.start()
for t in threads:
    t.join()

client.close()
# Output:
# Thread 0: 0
# Thread 7: 7
# Thread 1: 1
# Thread 9: 9
# Thread 4: 4
# Thread 2: 2
# Thread 8: 8
# Thread 5: 5
# Thread 6: 6
# Thread 3: 3
```

**Alternative for sessions:** If you need sessions (e.g., for temporary tables), create a separate client per thread:

```python
def worker(thread_id):
    # Each thread gets its own client with isolated session
    client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
    client.command('CREATE TEMPORARY TABLE temp (id UInt32) ENGINE = Memory')
    # ... use temp table ...
    client.close()
```

### Proper cleanup {#proper-cleanup}

Always close clients at shutdown. Note that `client.close()` disposes the client and closes pooled HTTP connections only when the client owns its pool manager (for example, when created with custom TLS/proxy options). For the default shared pool, use `client.close_connections()` to proactively clear sockets; otherwise, connections are reclaimed automatically via idle expiration and at process exit.

```python
client = clickhouse_connect.get_client(host='my-host', username='default', password='password')
try:
    result = client.query('SELECT 1')
finally:
    client.close()
```

Or use a context manager:

```python
with clickhouse_connect.get_client(host='my-host', username='default', password='password') as client:
    result = client.query('SELECT 1')
```

### When to use multiple clients {#when-to-use-multiple-clients}

Multiple clients are appropriate for:

- **Different servers**: One client per ClickHouse server or cluster
- **Different credentials**: Separate clients for different users or access levels
- **Different databases**: When you need to work with multiple databases
- **Isolated sessions**: When you need separate sessions for temporary tables or session-specific settings
- **Per-thread isolation**: When threads need independent sessions (as shown above)

## Common method arguments {#common-method-arguments}

Several client methods use one or both of the common `parameters` and `settings` arguments. These keyword arguments are described below.

### Parameters argument {#parameters-argument}

ClickHouse Connect Client `query*` and `command` methods accept an optional `parameters` keyword argument used for binding Python expressions to a ClickHouse value expression. Two sorts of binding are available.

#### Server-side binding {#server-side-binding}

ClickHouse supports [server side binding](/interfaces/cli.md#cli-queries-with-parameters) for most query values, where the bound value is sent separate from the query as an HTTP query parameter. ClickHouse Connect will add the appropriate query parameters if it detects a binding expression of the form `{<name>:<datatype>}`. For server side binding, the `parameters` argument should be a Python dictionary.

- Server-side binding with Python dictionary, DateTime value, and string value

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'table': 'my_table', 'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND string ILIKE {v2:String}', parameters=parameters)
```

This generates the following query on the server:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

:::warning
Server-side binding is only supported (by the ClickHouse server) for `SELECT` queries. It does not work for `ALTER`, `DELETE`, `INSERT`, or other types of queries. This may change in the future; see https://github.com/ClickHouse/ClickHouse/issues/42092.
:::

#### Client-side binding {#client-side-binding}

ClickHouse Connect also supports client-side parameter binding, which can allow more flexibility in generating templated SQL queries. For client-side binding, the `parameters` argument should be a dictionary or a sequence. Client-side binding uses the Python ["printf" style](https://docs.python.org/3/library/stdtypes.html#old-string-formatting) string formatting for parameter substitution.

Note that unlike server-side binding, client-side binding does not work for database identifiers such as database, table, or column names, since Python-style formatting cannot distinguish between the different types of strings, and they need to be formatted differently (backticks or double quotes for database identifiers, single quotes for data values).

- Example with Python Dictionary, DateTime value and string escaping

```python
import datetime

my_date = datetime.datetime(2022, 10, 1, 15, 20, 5)

parameters = {'v1': my_date, 'v2': "a string with a single quote'"}
client.query('SELECT * FROM my_table WHERE date >= %(v1)s AND string ILIKE %(v2)s', parameters=parameters)
```

This generates the following query on the server:

```sql
SELECT *
FROM my_table
WHERE date >= '2022-10-01 15:20:05'
  AND string ILIKE 'a string with a single quote\''
```

- Example with Python Sequence (Tuple), Float64, and IPv4Address

```python
import ipaddress

parameters = (35200.44, ipaddress.IPv4Address(0x443d04fe))
client.query('SELECT * FROM some_table WHERE metric >= %s AND ip_address = %s', parameters=parameters)
```

This generates the following query on the server:

```sql
SELECT *
FROM some_table
WHERE metric >= 35200.44
  AND ip_address = '68.61.4.254''
```

:::note
To bind DateTime64 arguments (ClickHouse types with sub-second precision) requires one of two custom approaches:
- Wrap the Python `datetime.datetime` value in the new DT64Param class, e.g.
  ```python
    query = 'SELECT {p1:DateTime64(3)}'  # Server-side binding with dictionary
    parameters={'p1': DT64Param(dt_value)}
  
    query = 'SELECT %s as string, toDateTime64(%s,6) as dateTime' # Client-side binding with list 
    parameters=['a string', DT64Param(datetime.now())]
  ```
  - If using a dictionary of parameter values, append the string `_64` to the parameter name
  ```python
    query = 'SELECT {p1:DateTime64(3)}, {a1:Array(DateTime(3))}'  # Server-side binding with dictionary
  
    parameters={'p1_64': dt_value, 'a1_64': [dt_value1, dt_value2]}
  ```
:::

### Settings argument {#settings-argument-1}

All the key ClickHouse Connect Client "insert" and "select" methods accept an optional `settings` keyword argument to pass ClickHouse server [user settings](/operations/settings/settings.md) for the included SQL statement. The `settings` argument should be a dictionary. Each item should be a ClickHouse setting name and its associated value. Note that values will be converted to strings when sent to the server as query parameters.

As with client level settings, ClickHouse Connect will drop any settings that the server marks as *readonly*=*1*, with an associated log message. Settings that apply only to queries via the ClickHouse HTTP interface are always valid. Those settings are described under the `get_client` [API](#settings-argument).

Example of using ClickHouse settings:

```python
settings = {'merge_tree_min_rows_for_concurrent_read': 65535,
            'session_id': 'session_1234',
            'use_skip_indexes': False}
client.query("SELECT event_type, sum(timeout) FROM event_errors WHERE event_time > '2022-08-01'", settings=settings)
```

## Client `command` Method {#client-command-method}

Use the `Client.command` method to send SQL queries to the ClickHouse server that do not normally return data or that return a single primitive or array value rather than a full dataset. This method takes the following parameters:

| Parameter     | Type             | Default    | Description                                                                                                                                                   |
|---------------|------------------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| cmd           | str              | *Required* | A ClickHouse SQL statement that returns a single value or a single row of values.                                                                             |
| parameters    | dict or iterable | *None*     | See [parameters description](#parameters-argument).                                                                                                           |
| data          | str or bytes     | *None*     | Optional data to include with the command as the POST body.                                                                                                   |
| settings      | dict             | *None*     | See [settings description](#settings-argument).                                                                                                               |
| use_database  | bool             | True       | Use the client database (specified when creating the client). False means the command will use the default ClickHouse server database for the connected user. |
| external_data | ExternalData     | *None*     | An `ExternalData` object containing file or binary data to use with the query. See [Advanced Queries (External Data)](advanced-querying.md#external-data)     |

### Command examples {#command-examples}

#### DDL statements {#ddl-statements}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Create a table
result = client.command("CREATE TABLE test_command (col_1 String, col_2 DateTime) ENGINE MergeTree ORDER BY tuple()")
print(result)  # Returns QuerySummary with query_id

# Show table definition
result = client.command("SHOW CREATE TABLE test_command")
print(result)
# Output:
# CREATE TABLE default.test_command
# (
#     `col_1` String,
#     `col_2` DateTime
# )
# ENGINE = MergeTree
# ORDER BY tuple()
# SETTINGS index_granularity = 8192

# Drop table
client.command("DROP TABLE test_command")
```

#### Simple queries returning single values {#simple-queries-returning-single-values}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Single value result
count = client.command("SELECT count() FROM system.tables")
print(count)
# Output: 151

# Server version
version = client.command("SELECT version()")
print(version)
# Output: "25.8.2.29"
```

#### Commands with parameters {#commands-with-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Using client-side parameters
table_name = "system"
result = client.command(
    "SELECT count() FROM system.tables WHERE database = %(db)s",
    parameters={"db": table_name}
)

# Using server-side parameters
result = client.command(
    "SELECT count() FROM system.tables WHERE database = {db:String}",
    parameters={"db": "system"}
)
```

#### Commands with settings {#commands-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Execute command with specific settings
result = client.command(
    "OPTIMIZE TABLE large_table FINAL",
    settings={"optimize_throw_if_noop": 1}
)
```

## Client `query` Method {#client-query-method}

The `Client.query` method is the primary way to retrieve a single "batch" dataset from the ClickHouse server. It utilizes the Native ClickHouse format over HTTP to transmit large datasets (up to approximately one million rows) efficiently. This method takes the following parameters:

| Parameter           | Type             | Default    | Description                                                                                                                                                                        |
|---------------------|------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| query               | str              | *Required* | The ClickHouse SQL SELECT or DESCRIBE query.                                                                                                                                       |
| parameters          | dict or iterable | *None*     | See [parameters description](#parameters-argument).                                                                                                                                |
| settings            | dict             | *None*     | See [settings description](#settings-argument).                                                                                                                                    |
| query_formats       | dict             | *None*     | Datatype formatting specification for result values. See Advanced Usage (Read Formats)                                                                                             |
| column_formats      | dict             | *None*     | Datatype formatting per column. See Advanced Usage (Read Formats)                                                                                                                  |
| encoding            | str              | *None*     | Encoding used to encode ClickHouse String columns into Python strings. Python defaults to `UTF-8` if not set.                                                                      |
| use_none            | bool             | True       | Use Python *None* type for ClickHouse nulls. If False, use a datatype default (such as 0) for ClickHouse nulls. Note - defaults to False for NumPy/Pandas for performance reasons. |
| column_oriented     | bool             | False      | Return the results as a sequence of columns rather than a sequence of rows. Helpful for transforming Python data to other column oriented data formats.                            |
| query_tz            | str              | *None*     | A timezone name from the `zoneinfo` database. This timezone will be applied to all datetime or Pandas Timestamp objects returned by the query.                                     |
| column_tzs          | dict             | *None*     | A dictionary of column name to timezone name. Like `query_tz`, but allows specifying different timezones for different columns.                                                    |
| use_extended_dtypes | bool             | True       | Use Pandas extended dtypes (like StringArray), and pandas.NA and pandas.NaT for ClickHouse NULL values. Applies only to `query_df` and `query_df_stream` methods.                  |
| external_data       | ExternalData     | *None*     | An ExternalData object containing file or binary data to use with the query. See [Advanced Queries (External Data)](advanced-querying.md#external-data)                            |
| context             | QueryContext     | *None*     | A reusable QueryContext object can be used to encapsulate the above method arguments. See [Advanced Queries (QueryContexts)](advanced-querying.md#querycontexts)                   |

### Query examples {#query-examples}

#### Basic query {#basic-query}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Simple SELECT query
result = client.query("SELECT name, database FROM system.tables LIMIT 3")

# Access results as rows
for row in result.result_rows:
    print(row)
# Output:
# ('CHARACTER_SETS', 'INFORMATION_SCHEMA')
# ('COLLATIONS', 'INFORMATION_SCHEMA')
# ('COLUMNS', 'INFORMATION_SCHEMA')

# Access column names and types
print(result.column_names)
# Output: ("name", "database")
print([col_type.name for col_type in result.column_types])
# Output: ['String', 'String']
```

#### Accessing query results {#accessing-query-results}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

result = client.query("SELECT number, toString(number) AS str FROM system.numbers LIMIT 3")

# Row-oriented access (default)
print(result.result_rows)
# Output: [[0, "0"], [1, "1"], [2, "2"]]

# Column-oriented access
print(result.result_columns)
# Output: [[0, 1, 2], ["0", "1", "2"]]

# Named results (list of dictionaries)
for row_dict in result.named_results():
    print(row_dict)
# Output: 
# {"number": 0, "str": "0"}
# {"number": 1, "str": "1"}
# {"number": 2, "str": "2"}

# First row as dictionary
print(result.first_item)
# Output: {"number": 0, "str": "0"}

# First row as tuple
print(result.first_row)
# Output: (0, "0")
```

#### Query with client-side parameters {#query-with-client-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Using dictionary parameters (printf-style)
query = "SELECT * FROM system.tables WHERE database = %(db)s AND name LIKE %(pattern)s"
parameters = {"db": "system", "pattern": "%query%"}
result = client.query(query, parameters=parameters)

# Using tuple parameters
query = "SELECT * FROM system.tables WHERE database = %s LIMIT %s"
parameters = ("system", 5)
result = client.query(query, parameters=parameters)
```

#### Query with server-side parameters {#query-with-server-side-parameters}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Server-side binding (more secure, better performance for SELECT queries)
query = "SELECT * FROM system.tables WHERE database = {db:String} AND name = {tbl:String}"
parameters = {"db": "system", "tbl": "query_log"}

result = client.query(query, parameters=parameters)
```

#### Query with settings {#query-with-settings}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Pass ClickHouse settings with the query
result = client.query(
    "SELECT sum(number) FROM numbers(1000000)",
    settings={
        "max_block_size": 100000,
        "max_execution_time": 30
    }
)
```

### The `QueryResult` object {#the-queryresult-object}

The base `query` method returns a `QueryResult` object with the following public properties:

- `result_rows` -- A matrix of the data returned in the form of a Sequence of rows, with each row element being a sequence of column values.
- `result_columns` -- A matrix of the data returned in the form of a Sequence of columns, with each column element being a sequence of the row values for that column
- `column_names` -- A tuple of strings representing the column names in the `result_set`
- `column_types` -- A tuple of ClickHouseType instances representing the ClickHouse data type for each column in the `result_columns`
- `query_id` -- The ClickHouse query_id (useful for examining the query in the `system.query_log` table)
- `summary` -- Any data returned by the `X-ClickHouse-Summary` HTTP response header
- `first_item` -- A convenience property for retrieving the first row of the response as a dictionary (keys are column names)
- `first_row` -- A convenience property to return the first row of the result
- `column_block_stream` -- A generator of query results in column oriented format. This property should not be referenced directly (see below).
- `row_block_stream` -- A generator of query results in row oriented format. This property should not be referenced directly (see below).
- `rows_stream` -- A generator of query results that yields a single row per invocation. This property should not be referenced directly (see below).
- `summary` -- As described under the `command` method, a dictionary of summary information returned by ClickHouse

The `*_stream` properties return a Python Context that can be used as an iterator for the returned data. They should only be accessed indirectly using the Client `*_stream` methods. 

The complete details of streaming query results (using StreamContext objects) are outlined in [Advanced Queries (Streaming Queries)](advanced-querying.md#streaming-queries).

## Consuming query results with NumPy, Pandas or Arrow {#consuming-query-results-with-numpy-pandas-or-arrow}

ClickHouse Connect provides specialized query methods for NumPy, Pandas, and Arrow data formats. For detailed information on using these methods, including examples, streaming capabilities, and advanced type handling, see [Advanced Querying (NumPy, Pandas and Arrow Queries)](advanced-querying.md#numpy-pandas-and-arrow-queries).

## Client streaming query methods {#client-streaming-query-methods}

For streaming large result sets, ClickHouse Connect provides multiple streaming methods. See [Advanced Queries (Streaming Queries)](advanced-querying.md#streaming-queries) for details and examples.

## Client `insert` Method {#client-insert-method}

For the common use case of inserting multiple records into ClickHouse, there is the `Client.insert` method. It takes the following parameters:

| Parameter          | Type                              | Default    | Description                                                                                                                                                                                   |
|--------------------|-----------------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| table              | str                               | *Required* | The ClickHouse table to insert into. The full table name (including database) is permitted.                                                                                                   |
| data               | Sequence of Sequences             | *Required* | The matrix of data to insert, either a Sequence of rows, each of which is a sequence of column values, or a Sequence of columns, each of which is a sequence of row values.                   |
| column_names       | Sequence of str, or str           | '*'        | A list of column_names for the data matrix. If '*' is used instead, ClickHouse Connect will execute a "pre-query" to retrieve all of the column names for the table.                          |
| database           | str                               | ''         | The target database of the insert. If not specified, the database for the client will be assumed.                                                                                             |
| column_types       | Sequence of ClickHouseType        | *None*     | A list of ClickHouseType instances. If neither column_types or column_type_names is specified, ClickHouse Connect will execute a "pre-query" to retrieve all the column types for the table.  |
| column_type_names  | Sequence of ClickHouse type names | *None*     | A list of ClickHouse datatype names. If neither column_types or column_type_names is specified, ClickHouse Connect will execute a "pre-query" to retrieve all the column types for the table. |
| column_oriented    | bool                              | False      | If True, the `data` argument is assumed to be a Sequence of columns (and no "pivot" will be necessary to insert the data). Otherwise `data` is interpreted as a Sequence of rows.             |
| settings           | dict                              | *None*     | See [settings description](#settings-argument).                                                                                                                                               |
| context            | InsertContext                     | *None*     | A reusable InsertContext object can be used to encapsulate the above method arguments. See [Advanced Inserts (InsertContexts)](advanced-inserting.md#insertcontexts)                          |
| transport_settings | dict                              | *None*     | Optional dictionary of transport-level settings (HTTP headers, etc.)                                                                                                                          |

This method returns a "query summary" dictionary as described under the "command" method. An exception will be raised if the insert fails for any reason.

For specialized insert methods that work with Pandas DataFrames, PyArrow Tables, and Arrow-backed DataFrames, see [Advanced Inserting (Specialized Insert Methods)](advanced-inserting.md#specialized-insert-methods).

:::note
A NumPy array is a valid Sequence of Sequences and can be used as the `data` argument to the main `insert` method, so a specialized method is not required.
:::

### Examples {#examples}

The examples below assume an existing table `users` with schema `(id UInt32, name String, age UInt8)`.

#### Basic row-oriented insert {#basic-row-oriented-insert}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Row-oriented data: each inner list is a row
data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
    [3, "Joe", 28],
]

client.insert("users", data, column_names=["id", "name", "age"])
```

#### Column-oriented insert {#column-oriented-insert}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Column-oriented data: each inner list is a column
data = [
    [1, 2, 3],  # id column
    ["Alice", "Bob", "Joe"],  # name column
    [25, 30, 28],  # age column
]

client.insert("users", data, column_names=["id", "name", "age"], column_oriented=True)
```

#### Insert with explicit column types {#insert-with-explicit-column-types}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

# Useful when you want to avoid a DESCRIBE query to the server
data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
    [3, "Joe", 28],
]

client.insert(
    "users",
    data,
    column_names=["id", "name", "age"],
    column_type_names=["UInt32", "String", "UInt8"],
)
```

#### Insert into specific database {#insert-into-specific-database}

```python
import clickhouse_connect

client = clickhouse_connect.get_client()

data = [
    [1, "Alice", 25],
    [2, "Bob", 30],
]

# Insert into a table in a specific database
client.insert(
    "users",
    data,
    column_names=["id", "name", "age"],
    database="production",
)
```

## File Inserts {#file-inserts}

For inserting data directly from files into ClickHouse tables, see [Advanced Inserting (File Inserts)](advanced-inserting.md#file-inserts).

## Raw API {#raw-api}

For advanced use cases requiring direct access to ClickHouse HTTP interfaces without type transformations, see [Advanced Usage (Raw API)](advanced-usage.md#raw-api).

## Utility classes and functions {#utility-classes-and-functions}

The following classes and functions are also considered part of the "public" `clickhouse-connect` API and are, like the classes and methods documented above, stable across minor releases. Breaking changes to these classes and functions will only occur with a minor (not patch) release and will be available with a deprecated status for at least one minor release.

### Exceptions {#exceptions}

All custom exceptions (including those defined in the DB API 2.0 specification) are defined in the `clickhouse_connect.driver.exceptions` module. Exceptions actually detected by the driver will use one of these types.

### ClickHouse SQL utilities {#clickhouse-sql-utilities}

The functions and the DT64Param class in the `clickhouse_connect.driver.binding` module can be used to properly build and escape ClickHouse SQL queries. Similarly, the functions in the `clickhouse_connect.driver.parser` module can be used to parse ClickHouse datatype names.

## Multithreaded, multiprocess, and async/event driven use cases {#multithreaded-multiprocess-and-asyncevent-driven-use-cases}

For information on using ClickHouse Connect in multithreaded, multiprocess, and async/event-driven applications, see [Advanced Usage (Multithreaded, multiprocess, and async/event driven use cases)](advanced-usage.md#multithreaded-multiprocess-and-asyncevent-driven-use-cases).

## AsyncClient wrapper {#asyncclient-wrapper}

For information on using the AsyncClient wrapper for asyncio environments, see [Advanced Usage (AsyncClient wrapper)](advanced-usage.md#asyncclient-wrapper).

## Managing ClickHouse Session IDs {#managing-clickhouse-session-ids}

For information on managing ClickHouse session IDs in multi-threaded or concurrent applications, see [Advanced Usage (Managing ClickHouse Session IDs)](advanced-usage.md#managing-clickhouse-session-ids).

## Customizing the HTTP connection pool {#customizing-the-http-connection-pool}

For information on customizing the HTTP connection pool for large multi-threaded applications, see [Advanced Usage (Customizing the HTTP connection pool)](advanced-usage.md#customizing-the-http-connection-pool).
