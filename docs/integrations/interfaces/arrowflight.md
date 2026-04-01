---
description: 'Documentation for the Apache Arrow Flight interface in ClickHouse, allowing Flight SQL clients to connect to ClickHouse'
sidebar_label: 'Arrow Flight Interface'
sidebar_position: 26
slug: /interfaces/arrowflight
title: 'Arrow Flight Interface'
doc_type: 'reference'
---

# Apache Arrow Flight Interface

## Overview {#overview}

ClickHouse supports the [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) protocol — a high-performance RPC framework for efficient columnar data transport using the [Arrow IPC](https://arrow.apache.org/docs/format/Columnar.html#serialization-and-interprocess-communication-ipc) format over [gRPC](https://grpc.io/).

The implementation includes support for [Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html), enabling BI tools and applications that speak the Flight SQL protocol to query ClickHouse directly.

Key capabilities:

- Execute SQL queries and retrieve results in Apache Arrow format.
- Insert data into tables using the Arrow format.
- Query metadata (catalogs, schemas, tables, primary keys) via Flight SQL commands.
- Manage sessions and settings via Flight SQL actions.
- TLS encryption and username/password authentication.
- Incremental result retrieval via `PollFlightInfo`.
- Query cancellation via `CancelFlightInfo`.

## Enabling the Arrow Flight Server {#enabling-server}

To enable the Arrow Flight server, add the `arrowflight_port` setting to the ClickHouse server configuration:

```xml
<clickhouse>
    <arrowflight_port>9090</arrowflight_port>
</clickhouse>
```

Upon startup, a log message confirms the interface is active:

```text
{} <Information> Application: Arrow Flight compatibility protocol: 0.0.0.0:9090
```

## TLS Configuration {#tls-configuration}

To enable TLS for the Arrow Flight interface, configure the following settings:

```xml
<clickhouse>
    <arrowflight_port>9090</arrowflight_port>
    <arrowflight>
        <enable_ssl>true</enable_ssl>
        <ssl_cert_file>/path/to/server-cert.pem</ssl_cert_file>
        <ssl_key_file>/path/to/server-key.pem</ssl_key_file>
    </arrowflight>
</clickhouse>
```

When TLS is enabled, clients must connect using the `grpc+tls://` scheme instead of `grpc://`.

## Authentication {#authentication}

The Arrow Flight interface supports two authentication methods:

### Basic Authentication {#basic-auth}

Clients authenticate with a username and password via the standard HTTP `Authorization: Basic` header. On successful authentication, the server returns a Bearer token in the response header.

### Bearer Token Authentication {#bearer-auth}

Subsequent requests can use the Bearer token returned from Basic authentication via the `Authorization: Bearer <token>` header. The token is automatically refreshed on each use and expires based on the `default_session_timeout` server setting (default: 60 seconds).

### Python Example {#auth-python-example}

```python
import pyarrow.flight as flight

client = flight.FlightClient("grpc://localhost:9090")

# Basic auth returns a bearer token for subsequent calls
token_pair = client.authenticate_basic_token("default", "")
options = flight.FlightCallOptions(headers=[token_pair])
```

With TLS:

```python
import pyarrow.flight as flight

with open("ca-cert.pem", "rb") as f:
    tls_root_certs = f.read()

client = flight.FlightClient(
    "grpc+tls://localhost:9090",
    tls_root_certs=tls_root_certs,
)

token_pair = client.authenticate_basic_token("default", "password")
options = flight.FlightCallOptions(headers=[token_pair])
```

## Session Management {#session-management}

The Arrow Flight interface supports ClickHouse sessions through custom gRPC metadata headers:

| Header | Description |
|---|---|
| `x-clickhouse-session-id` | Session identifier. If provided, multiple requests share the same session state (temporary tables, settings). |
| `x-clickhouse-session-timeout` | Session timeout in seconds. Must not exceed `max_session_timeout`. |
| `x-clickhouse-session-check` | Set to `1` to check if the session exists without creating one. |
| `x-clickhouse-session-close` | Set to `1` to close the session after the request completes. Requires `enable_arrow_close_session` to be `true` in the server config. |

Sessions allow setting persistent ClickHouse settings via the `SetSessionOptions` action (see [DoAction](#doaction)).

## Server Configuration Reference {#configuration-reference}

| Setting | Default | Description |
|---|---|---|
| `arrowflight_port` | — | Port for the Arrow Flight server. The server starts only if this setting is specified. |
| `arrowflight.enable_ssl` | `false` | Enable TLS encryption. |
| `arrowflight.ssl_cert_file` | — | Path to the TLS certificate file. Required when TLS is enabled. |
| `arrowflight.ssl_key_file` | — | Path to the TLS private key file. Required when TLS is enabled. |
| `arrowflight.tickets_lifetime_seconds` | `600` | Time in seconds before flight tickets expire and are cleaned up. Set to `0` to disable automatic ticket expiration. |
| `arrowflight.cancel_ticket_after_do_get` | `false` | If `true`, tickets are cancelled immediately after being consumed by `DoGet`, freeing memory. |
| `arrowflight.poll_descriptors_lifetime_seconds` | `600` | Time in seconds before poll descriptors expire. Set to `0` to disable automatic expiration. |
| `arrowflight.cancel_flight_descriptor_after_poll_flight_info` | `false` | If `true`, poll descriptors are cancelled after being consumed by `PollFlightInfo`. |
| `enable_arrow_close_session` | `true` | Allow clients to close sessions via the `x-clickhouse-session-close` header. |
| `default_session_timeout` | `60` | Default session timeout in seconds. Also controls Bearer token expiration. |
| `max_session_timeout` | `3600` | Maximum allowed session timeout in seconds. |

## Supported RPC Methods {#rpc-methods}

### GetFlightInfo {#getflightinfo}

Executes a query and returns a `FlightInfo` containing the result schema, endpoints with tickets for data retrieval, row count, and byte count.

Accepts a `FlightDescriptor` which can be:

- **PATH descriptor**: A single-component path interpreted as a table name. Generates `SELECT * FROM <table>`.
- **CMD descriptor**: Either a raw SQL query string, or a serialized Flight SQL protobuf command (see [Flight SQL Commands](#flight-sql-commands)).

The query is executed fully, and results are stored in server-side tickets. Each block of data produces a separate endpoint/ticket, allowing clients to retrieve data in parallel.

```python
# Query by table name
descriptor = flight.FlightDescriptor.for_path("my_table")
info = client.get_flight_info(descriptor, options)

# Query by SQL
descriptor = flight.FlightDescriptor.for_command(
    "SELECT * FROM my_table WHERE id > 100"
)
info = client.get_flight_info(descriptor, options)

# Retrieve results
for endpoint in info.endpoints:
    reader = client.do_get(endpoint.ticket, options)
    table = reader.read_all()
    print(table.to_pandas())
```

### PollFlightInfo {#pollflightinfo}

Enables incremental result retrieval for long-running queries. Instead of waiting for the entire query to complete (as `GetFlightInfo` does), `PollFlightInfo` returns results block by block.

On the first call, the query starts executing. The response includes:
- A `FlightInfo` with endpoints for any data blocks available so far.
- A `FlightDescriptor` for the next poll (if more results are expected).

Subsequent calls with the returned descriptor retrieve additional blocks. When no more data is available, the response contains no next descriptor.

:::note
The current implementation blocks until a data block is available rather than returning immediately with no data.
:::

### GetSchema {#getschema}

Returns the Arrow schema for a query result without executing the full query. Accepts the same descriptor types as `GetFlightInfo`.

```python
descriptor = flight.FlightDescriptor.for_command(
    "SELECT 1 AS x, 'hello' AS y"
)
schema_result = client.get_schema(descriptor, options)
schema = schema_result.schema
print(schema)  # x: int32, y: string
```

### DoGet {#doget}

Retrieves data for a given ticket. Accepts either:

- A ticket returned by `GetFlightInfo` or `PollFlightInfo`.
- A raw SQL query string as the ticket value.

```python
# Using a ticket from GetFlightInfo
reader = client.do_get(endpoint.ticket, options)
table = reader.read_all()

# Using a raw SQL query as ticket
ticket = flight.Ticket("SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket, options)
table = reader.read_all()
```

### DoPut {#doput}

Sends data to ClickHouse. Accepts a `FlightDescriptor` and a stream of Arrow record batches.

**Insert by table name** (PATH descriptor):

```python
schema = pa.schema([("id", pa.int64()), ("name", pa.string())])
batch = pa.record_batch(
    [pa.array([1, 2, 3]), pa.array(["Alice", "Bob", "Charlie"])],
    schema=schema,
)

descriptor = flight.FlightDescriptor.for_path("my_table")
writer, _ = client.do_put(descriptor, schema, options)
writer.write_batch(batch)
writer.close()
```

**Insert by SQL** (CMD descriptor):

```python
descriptor = flight.FlightDescriptor.for_command(
    "INSERT INTO my_table FORMAT Arrow"
)
writer, _ = client.do_put(descriptor, schema, options)
writer.write_batch(batch)
writer.close()
```

**Execute DDL/DML via Flight SQL `CommandStatementUpdate`:**

Flight SQL clients use `CommandStatementUpdate` to execute DDL/DML statements (CREATE, INSERT, ALTER, etc.). The response includes the affected row count.

**Bulk ingest via Flight SQL `CommandStatementIngest`:**

Only appending to existing tables is supported (`TABLE_NOT_EXIST_OPTION_FAIL` + `TABLE_EXISTS_OPTION_APPEND`). Catalogs and temporary tables are not supported for this command.

:::note
Only the `Arrow` format is accepted for data transfer. Specifying other formats in SQL (e.g., `FORMAT JSON`) results in an error.
:::

### DoAction {#doaction}

Executes named actions. The following actions are supported:

#### CancelFlightInfo {#cancelflightinfo}

Cancels a running query associated with a `FlightInfo`. The query ID is extracted from the `FlightInfo`'s `app_metadata` field. Also cancels any poll descriptors associated with the query.

```python
# Start a long-running query via PollFlightInfo, then cancel it
cancel_request = flight.CancelFlightInfoRequest(info)
result = client.cancel_flight_info(cancel_request, options)
# result.status is CancelStatus.CANCELLED if successful
```

#### SetSessionOptions {#setsessionoptions}

Sets ClickHouse server settings for the current session. Requires a session ID to be set via the `x-clickhouse-session-id` header.

Supported value types: string, boolean, integer, double, and string lists.

If a setting name is unknown, the error `INVALID_NAME` is returned. If a value cannot be parsed, the error `INVALID_VALUE` is returned.

#### GetSessionOptions {#getsessionoptions}

Returns all current ClickHouse settings and their values for the session. Returns a map of setting names to string values (queries `system.settings` internally).

## Flight SQL Commands {#flight-sql-commands}

When a `CMD` descriptor contains a serialized [Flight SQL protobuf](https://arrow.apache.org/docs/format/FlightSql.html) message, ClickHouse handles the following commands:

### Supported via GetFlightInfo / GetSchema {#flightsql-getflightinfo}

| Command | Description |
|---|---|
| `CommandStatementQuery` | Execute an arbitrary SQL query. |
| `CommandGetSqlInfo` | Retrieve server metadata (name, version, Arrow version, capabilities). |
| `CommandGetCatalogs` | List catalogs. Returns an empty result (ClickHouse does not use catalogs). |
| `CommandGetDbSchemas` | List databases. Supports optional `db_schema_filter_pattern` (SQL `LIKE` pattern). |
| `CommandGetTables` | List tables. Supports filters for schema, table name, table types, and optional schema inclusion. |
| `CommandGetTableTypes` | List table engine types (from `system.table_engines`). |
| `CommandGetPrimaryKeys` | Retrieve primary key columns for a specified table. |

### Supported via DoPut {#flightsql-doput}

| Command | Description |
|---|---|
| `CommandStatementUpdate` | Execute a DDL/DML statement (CREATE, INSERT, ALTER, etc.). Returns affected row count. |
| `CommandStatementIngest` | Bulk insert Arrow data into an existing table. Only append mode is supported. |

### Not Yet Implemented {#flightsql-not-implemented}

| Command | Status |
|---|---|
| `CommandGetCrossReference` | Not implemented |
| `CommandGetExportedKeys` | Not implemented |
| `CommandGetImportedKeys` | Not implemented |
| `CommandStatementSubstraitPlan` | Not supported (Substrait is not supported) |
| `CommandPreparedStatementQuery` | Not implemented |
| `CommandPreparedStatementUpdate` | Not implemented |

## Complete Example {#complete-example}

```python
import pyarrow as pa
import pyarrow.flight as flight

# Connect and authenticate
client = flight.FlightClient("grpc://localhost:9090")
token = client.authenticate_basic_token("default", "")
options = flight.FlightCallOptions(headers=[token])

# Insert data using DoPut with a PATH descriptor
schema = pa.schema([("id", pa.uint32()), ("value", pa.string())])
batch = pa.record_batch(
    [pa.array([1, 2, 3], type=pa.uint32()), pa.array(["a", "b", "c"])],
    schema=schema,
)
descriptor = flight.FlightDescriptor.for_path("test")
writer, _ = client.do_put(descriptor, schema, options)
writer.write_batch(batch)
writer.close()

# Query data using GetFlightInfo + DoGet
descriptor = flight.FlightDescriptor.for_command(
    "SELECT * FROM test ORDER BY id"
)
info = client.get_flight_info(descriptor, options)
for endpoint in info.endpoints:
    reader = client.do_get(endpoint.ticket, options)
    table = reader.read_all()
    print(table.to_pandas())
```

Output:

```text
   id value
0   1     a
1   2     b
2   3     c
```

## Data Format {#data-format}

All data is transferred in Apache Arrow IPC format. Only the `Arrow` format is supported — specifying other ClickHouse formats (e.g., `FORMAT JSON`, `FORMAT CSV`) results in an error.

ClickHouse data types are mapped to Arrow types during serialization. The setting `output_format_arrow_unsupported_types_as_binary` controls whether unsupported ClickHouse types are serialized as binary blobs.

## Compatibility {#compatibility}

The Arrow Flight interface is compatible with any client or tool that supports the Arrow Flight or Arrow Flight SQL protocol, including:

- Python (`pyarrow`)
- Java (`org.apache.arrow.flight`)
- C++ (`arrow::flight`)
- Go (`apache/arrow/go`)
- ADBC (Arrow Database Connectivity) drivers
- DBeaver, and other tools with Flight SQL support

If a native ClickHouse connector is available for your tool (e.g., JDBC, ODBC, native protocol), prefer using it unless Arrow Flight is specifically required for performance or format compatibility.

## Client-Side ArrowFlight Features {#client-side}

ClickHouse can also act as a Flight client to read data from external Arrow Flight servers. See:

- [ArrowFlight table engine](/engines/table-engines/integrations/arrowflight)
- [arrowFlight table function](/sql-reference/table-functions/arrowflight)

## See Also {#see-also}

- [Apache Arrow Flight specification](https://arrow.apache.org/docs/format/Flight.html)
- [Apache Arrow Flight SQL specification](https://arrow.apache.org/docs/format/FlightSql.html)
- [Arrow format in ClickHouse](/interfaces/formats/Arrow)
