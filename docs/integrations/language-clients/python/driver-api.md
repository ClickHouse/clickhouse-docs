---
sidebar_label: 'Driver API'
sidebar_position: 7
keywords: ['clickhouse', 'python', 'driver', 'api', 'client', 'reference']
description: 'ClickHouse Connect driver API reference'
slug: /integrations/language-clients/python/driver-api
title: 'Driver API reference'
doc_type: 'reference'
---

# Driver API Reference {#driver-api-reference}

This is the reference page for connection arguments, method signatures, and settings. For usage guides, see [Querying](querying.md), [Inserting](inserting.md), and [Async and Concurrency](async-concurrency.md).

:::note
Passing keyword arguments is recommended for most API methods given the number of optional parameters.

Only the methods documented on these pages are part of the public API. Internal methods and classes not covered here may change between releases.
:::

## Client initialization {#client-initialization}

Use `clickhouse_connect.get_client()` to obtain a `Client` instance. For async, use `clickhouse_connect.get_async_client()`.

### Connection arguments {#connection-arguments}

| Parameter                  | Type        | Default       | Description                                                                                                                      |
|----------------------------|-------------|---------------|----------------------------------------------------------------------------------------------------------------------------------|
| `interface`                | str         | `"http"`      | Must be `"http"` or `"https"`.                                                                                                   |
| `host`                     | str         | `"localhost"` | Hostname or IP of the ClickHouse server.                                                                                         |
| `port`                     | int         | 8123 or 8443  | HTTP or HTTPS port. Defaults to 8443 if `secure=True` or `interface="https"`.                                                    |
| `username`                 | str         | `"default"`   | ClickHouse username.                                                                                                             |
| `password`                 | str         | `""`          | Password for the username.                                                                                                       |
| `access_token`             | str         | *None*        | JWT access token for ClickHouse Cloud. Mutually exclusive with username/password.                                                |
| `database`                 | str         | *None*        | Default database. Falls back to the server default for the user.                                                                 |
| `secure`                   | bool        | False         | Use HTTPS/TLS. Overrides inferred values from `interface` or `port`.                                                             |
| `dsn`                      | str         | *None*        | Standard DSN string. Other connection values are extracted from this if not set.                                                 |
| `compress`                 | bool or str | True          | Enable compression. See [Compression](additional-options.md#compression).                                                        |
| `query_limit`              | int         | 0             | Max rows per `query` response. 0 means unlimited.                                                                                |
| `query_retries`            | int         | 2             | Max retries for retryable query failures. Inserts and commands are not retried.                                                  |
| `connect_timeout`          | int         | 10            | HTTP connection timeout in seconds.                                                                                              |
| `send_receive_timeout`     | int         | 300           | Send/receive timeout in seconds.                                                                                                 |
| `client_name`              | str         | *None*        | Prepended to User-Agent. Visible in `system.query_log`.                                                                          |
| `pool_mgr`                 | PoolManager | *default*     | Custom `urllib3` PoolManager. See [Connection Pool](async-concurrency.md#customizing-the-http-connection-pool).                  |
| `http_proxy`               | str         | *None*        | HTTP proxy address.                                                                                                              |
| `https_proxy`              | str         | *None*        | HTTPS proxy address.                                                                                                             |
| `proxy_path`               | str         | `""`          | Path prefix for proxy configurations.                                                                                            |
| `session_id`               | str         | *None*        | Explicit session ID. See [Session IDs](async-concurrency.md#managing-session-ids).                                               |
| `autogenerate_session_id`  | bool        | *None*        | Override the global setting. True generates a UUID4 session per client.                                                          |
| `autogenerate_query_id`    | bool        | *None*        | Auto-generate a UUID4 query ID per query for `system.query_log` tracking.                                                        |
| `tz_source`                | str         | `"auto"`      | Timezone source for DateTime columns. `"auto"`, `"server"`, or `"local"`. See [Timezones](advanced-querying.md#timezone-source). |
| `tz_mode`                  | str         | `"naive_utc"` | How timezone info is represented. `"naive_utc"`, `"aware"`, or `"schema"`. See [Timezones](advanced-querying.md#timezone-mode).  |
| `show_clickhouse_errors`   | bool        | True          | Include ClickHouse error details in exceptions.                                                                                  |
| `form_encode_query_params` | bool        | False         | Send query params in the request body instead of URL (for large param sets).                                                     |
| `rename_response_column`   | str         | *None*        | Column rename strategy: `"remove_prefix"`, `"to_camelcase"`, `"to_underscore"`, etc.                                             |

### HTTPS/TLS arguments {#httpstls-arguments}

| Parameter          | Type | Default | Description                                                                      |
|--------------------|------|---------|----------------------------------------------------------------------------------|
| `verify`           | bool | True    | Validate TLS certificate (hostname, expiration).                                 |
| `ca_cert`          | str  | *None*  | Path to CA root certificate (.pem). Ignored if `verify=False`.                   |
| `client_cert`      | str  | *None*  | Path to TLS client certificate (.pem) for mutual TLS.                            |
| `client_cert_key`  | str  | *None*  | Path to private key for the client certificate.                                  |
| `server_host_name` | str  | *None*  | Override hostname for certificate CN/SNI validation.                             |
| `tls_mode`         | str  | *None*  | `"proxy"`, `"strict"`, or `"mutual"` (default). Controls TLS handshake behavior. |

### Settings argument {#settings-argument}

The `settings` dict passed to `get_client` sends additional ClickHouse settings with every request. Readonly users cannot override settings. The following are HTTP-specific settings:

| Setting             | Description                                                                |
|---------------------|----------------------------------------------------------------------------|
| `buffer_size`       | Server buffer size (bytes) before writing to HTTP channel.                 |
| `session_id`        | Session ID for the request.                                                |
| `compress`          | Server-side response compression (for raw queries only).                   |
| `decompress`        | Server-side decompression of insert data (for raw inserts only).           |
| `quota_key`         | Quota key for the request.                                                 |
| `session_check`     | Check session status.                                                      |
| `session_timeout`   | Session inactivity timeout in seconds (default 60).                        |
| `wait_end_of_query` | Buffer the full response on the server. Auto-set on non-streaming queries. |
| `role`              | ClickHouse role for the session.                                           |

For general ClickHouse settings, see the [ClickHouse documentation](/operations/settings/settings.md).

### Client creation examples {#client-creation-examples}

```python
import clickhouse_connect

# Default localhost connection
client = clickhouse_connect.get_client()

# Secure external server
client = clickhouse_connect.get_client(host="play.clickhouse.com", secure=True, port=443, user="play", password="clickhouse")

# ClickHouse Cloud with JWT
client = clickhouse_connect.get_client(host="HOSTNAME.clickhouse.cloud", port=8443, access_token="your-jwt-token")

# Custom session and settings
client = clickhouse_connect.get_client(
    host="play.clickhouse.com",
    user="play",
    password="clickhouse",
    port=443,
    session_id="example_session_1",
    connect_timeout=15,
    database="github",
    settings={"distributed_ddl_task_timeout": 300},
)
```

## Common method arguments {#common-method-arguments}

### Parameters argument {#parameters-argument}

Query and command methods accept a `parameters` keyword for binding values.

**Server-side binding** uses `{name:Type}` syntax and sends values as HTTP query parameters (secure, performant, SELECT only):

```python
from datetime import datetime

result = client.query(
    "SELECT * FROM {table:Identifier} WHERE date >= {v1:DateTime} AND name = {v2:String}",
    parameters={"table": "my_table", "v1": datetime(2022, 10, 1), "v2": "test"},
)
```

**Client-side binding** uses printf-style formatting (works with any query type):

```python
# Dict
result = client.query("SELECT * FROM t WHERE name = %(n)s", parameters={"n": "test"})

# Tuple
result = client.query("SELECT * FROM t WHERE id > %s", parameters=(100,))
```

:::note
For DateTime64 parameters, wrap the value in `DT64Param`:

```python
from clickhouse_connect.driver.binding import DT64Param
from datetime import datetime

result = client.query(
    "SELECT {p1:DateTime64(3)}",
    parameters={"p1": DT64Param(datetime.now())},
)
```
:::

### Settings argument {#settings-argument-1}

All query/insert methods accept `settings` to pass per-request ClickHouse [user settings](/operations/settings/settings.md). Values are converted to strings when sent.

```python
result = client.query(
    "SELECT sum(number) FROM numbers(1000000)",
    settings={"max_block_size": 100000, "max_execution_time": 30},
)
```

## Client `command` method {#client-command-method}

For DDL and single-value queries.

| Parameter            | Type             | Default    | Description                                              |
|----------------------|------------------|------------|----------------------------------------------------------|
| `cmd`                | str              | *Required* | SQL statement returning a single value or row.           |
| `parameters`         | dict or iterable | *None*     | See [parameters](#parameters-argument).                  |
| `data`               | str or bytes     | *None*     | Optional POST body.                                      |
| `settings`           | dict             | *None*     | See [settings](#settings-argument-1).                    |
| `use_database`       | bool             | True       | Use client database.                                     |
| `external_data`      | ExternalData     | *None*     | See [External Data](advanced-querying.md#external-data). |
| `transport_settings` | dict             | *None*     | HTTP headers for this request.                           |

Returns `str`, `int`, `Sequence[str]`, or `QuerySummary`.

## Client `query` method {#client-query-method}

For SELECT and DESCRIBE queries returning a full result set.

| Parameter            | Type             | Default    | Description                                                                   |
|----------------------|------------------|------------|-------------------------------------------------------------------------------|
| `query`              | str              | *Required* | SQL SELECT or DESCRIBE query.                                                 |
| `parameters`         | dict or iterable | *None*     | See [parameters](#parameters-argument).                                       |
| `settings`           | dict             | *None*     | See [settings](#settings-argument-1).                                         |
| `query_formats`      | dict             | *None*     | Datatype formatting. See [Read Formats](advanced-querying.md#read-formats).   |
| `column_formats`     | dict             | *None*     | Per-column formatting. See [Read Formats](advanced-querying.md#read-formats). |
| `encoding`           | str              | *None*     | String encoding override (default UTF-8).                                     |
| `use_none`           | bool             | True       | Use `None` for NULLs. False uses datatype defaults (e.g., 0).                 |
| `column_oriented`    | bool             | False      | Return columns instead of rows.                                               |
| `use_numpy`          | bool             | *None*     | Return NumPy arrays.                                                          |
| `max_str_len`        | int              | *None*     | Truncate strings to this length.                                              |
| `query_tz`           | str              | *None*     | Timezone to apply to all datetime results.                                    |
| `column_tzs`         | dict             | *None*     | Per-column timezone overrides.                                                |
| `external_data`      | ExternalData     | *None*     | See [External Data](advanced-querying.md#external-data).                      |
| `context`            | QueryContext     | *None*     | Reusable context. See [QueryContexts](advanced-querying.md#querycontexts).    |
| `tz_mode`            | str              | *None*     | Per-query timezone mode override.                                             |
| `transport_settings` | dict             | *None*     | HTTP headers for this request.                                                |

Returns a [`QueryResult`](querying.md#queryresult).

## Client `insert` method {#client-insert-method}

For bulk inserts of rows or columns.

| Parameter            | Type                     | Default    | Description                                                                   |
|----------------------|--------------------------|------------|-------------------------------------------------------------------------------|
| `table`              | str                      | *Required* | Target table (database-qualified allowed).                                    |
| `data`               | Sequence of Sequences    | *Required* | Rows or columns of data.                                                      |
| `column_names`       | Sequence[str] or str     | `"*"`      | Column names. `"*"` auto-fetches from server.                                 |
| `database`           | str                      | `""`       | Target database override.                                                     |
| `column_types`       | Sequence[ClickHouseType] | *None*     | Explicit column types.                                                        |
| `column_type_names`  | Sequence[str]            | *None*     | Column type names as strings.                                                 |
| `column_oriented`    | bool                     | False      | If True, `data` is columns.                                                   |
| `settings`           | dict                     | *None*     | See [settings](#settings-argument-1).                                         |
| `context`            | InsertContext            | *None*     | Reusable context. See [InsertContexts](advanced-inserting.md#insertcontexts). |
| `transport_settings` | dict                     | *None*     | HTTP headers for this request.                                                |

Returns a `QuerySummary`. Access `summary.written_rows` (property), `summary.written_bytes()` (method), and `summary.query_id()` (method).

## Specialized query methods {#specialized-query-methods}

These methods are documented in [Querying (DataFrame and Arrow)](querying.md#dataframe-and-arrow-queries):

- `query_df` - Returns `pandas.DataFrame`
- `query_np` - Returns `numpy.ndarray`
- `query_arrow` - Returns `pyarrow.Table`
- `query_df_arrow` - Returns Arrow-backed DataFrame (Pandas or Polars)

## Specialized insert methods {#specialized-insert-methods}

These methods are documented in [Inserting (DataFrame and Arrow)](inserting.md#dataframe-and-arrow-inserts):

- `insert_df` - Insert `pandas.DataFrame`
- `insert_arrow` - Insert `pyarrow.Table`
- `insert_df_arrow` - Insert Arrow-backed DataFrame (Pandas or Polars)

## Streaming methods {#streaming-methods}

Documented in [Querying (Streaming)](querying.md#streaming).

## Raw methods {#raw-methods}

Documented in [Raw API](raw-api.md).

## Client properties {#client-properties}

| Property           | Type   | Description                          |
|--------------------|--------|--------------------------------------|
| `database`         | str    | Current default database             |
| `server_version`   | str    | ClickHouse server version string     |
| `server_tz`        | tzinfo | Server timezone                      |
| `server_settings`  | dict   | Server settings (SettingDef objects) |
| `protocol_version` | int    | ClickHouse protocol version          |
| `query_limit`      | int    | Default LIMIT for queries            |
| `query_retries`    | int    | Number of retries for failed queries |
| `tz_mode`          | str    | Current timezone mode                |
| `tz_source`        | str    | Current timezone source              |

## Client utility methods {#client-utility-methods}

| Method                           | Description                                                               |
|----------------------------------|---------------------------------------------------------------------------|
| `ping()`                         | Returns `True` if the server is reachable. Does not raise.                |
| `min_version(version_str)`       | Returns `True` if server version >= the given version (e.g., `"23.8.1"`). |
| `set_client_setting(key, value)` | Set a ClickHouse setting after initialization.                            |
| `get_client_setting(key)`        | Get a previously set setting value.                                       |
| `set_access_token(token)`        | Update the JWT access token.                                              |
| `close()`                        | Close client and release resources.                                       |
| `close_connections()`            | Close all pooled HTTP connections.                                        |

The client supports the context manager protocol:

```python
with clickhouse_connect.get_client() as client:
    client.query("SELECT 1")
```

## Exceptions {#exceptions}

All custom exceptions are defined in `clickhouse_connect.driver.exceptions`. The hierarchy follows DB-API 2.0:

```text
ClickHouseError
  Warning
  Error
    InterfaceError
    DatabaseError
      DataError
      OperationalError
      IntegrityError
      InternalError
      ProgrammingError
        StreamClosedError
      NotSupportedError
```

## SQL utilities {#sql-utilities}

- `clickhouse_connect.driver.binding` - Functions for escaping and building ClickHouse SQL, plus the `DT64Param` class.
- `clickhouse_connect.driver.parser` - Functions for parsing ClickHouse datatype names.
