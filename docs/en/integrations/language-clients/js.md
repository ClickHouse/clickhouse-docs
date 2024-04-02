---
sidebar_label: JavaScript
sidebar_position: 4
keywords: [clickhouse, js, javascript, nodejs, web, browser, cloudflare, workers, client, connect, integrate]
slug: /en/integrations/language-clients/javascript
description: The official JS client for connecting to ClickHouse.
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

# ClickHouse JS

The official JS client for connecting to ClickHouse.
The client is written in TypeScript and provides typings for the client public API.

It has zero dependencies, optimized for maximum performance, and tested with various ClickHouse versions and configurations (on-premise single node, on-premise cluster, ClickHouse Cloud).

There are two different versions of the client available for different environments:
- `@clickhouse/client` - Node.js only
- `@clickhouse/client-web` - browsers (Chrome/Firefox), CloudFlare workers

When using TypeScript, make sure it is at least [version 4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html), which enables [inline import and export syntax](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names).

## Environment requirements (Node.js)

Node.js must be available in the environment to run the client.
The client is compatible with all the [maintained](https://github.com/nodejs/release#readme) Node.js releases.

As soon as a Node.js version approaches End-Of-Life, the client drops support for it as it is considered outdated and insecure.

Current Node.js versions support:

| Node.js version | Supported?  |
|-----------------|-------------|
| 21.x            | ✔           |
| 20.x            | ✔           |
| 18.x            | ✔           |
| 16.x            | Best effort |

## Environment requirements (Web)

Web version of the client is officially tested with the latest Chrome/Firefox browsers and can be used as a dependency in, for example, React/Vue/Angular applications, or CloudFlare workers.

## Installation

To install the latest stable Node.js client version, run:

```sh
npm i @clickhouse/client
```

Web version installation:

```sh
npm i @clickhouse/client-web
```

## Compatibility with ClickHouse

| Client version | ClickHouse |
|----------------|------------|
| 1.0.0          | 23.3+      |

Likely, the client will work with the older versions, too; however, this is best-effort support and is not guaranteed. If you have ClickHouse version older than 23.3, please refer to [ClickHouse security policy](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) and consider upgrading.

## Examples

We aim to cover various scenarios of client usage with the [examples](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) in the client repository.

The overview is available in the [examples README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview). 

If something is unclear or missing from the examples or from the following documentation, feel free to [contact us](./js.md#contact-us).

# Client API

Most of the examples should be compatible with both Node.js and web versions of the client, unless explicitly stated otherwise.

#### Creating a client instance

You can create as many client instances as necessary with `createClient` factory.

```ts
import { createClient } from '@clickhouse/client' // or '@clickhouse/client-web'

const client = createClient({
  /* configuration */
})
```

If your environment doesn't support ESM modules, you can use CJS syntax instead:

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* configuration */
})
```

A client instance can be [pre-configured](./js.md#configuration) during instantiation.

#### Configuration

When creating a client instance, the following connection settings can be adjusted:

- **url?: string** - a ClickHouse instance URL. Default value: `http://localhost:8123`. See also: [URL configuration docs](./js.md#url-configuration).
- **pathname?: string** - An optional pathname to add to the ClickHouse URL after it is parsed by the client. Default value: `''`. See also: [Proxy with a pathname docs](./js.md#proxy-with-a-pathname).
- **request_timeout?: number** - the request timeout in milliseconds. Default value: `30_000`.
- **compression?: { response?: boolean; request?: boolean }** - enable compression. [Compression docs](./js.md#compression)
- **username?: string** - The name of the user on whose behalf requests are made. Default value: `default`.
- **password?: string** - The user password. Default: `''`.
- **application?: string** - The name of the application using the Node.js client. Default value: `clickhouse-js`.
- **database?: string** - Database name to use. Default value: `default`
- **clickhouse_settings?: ClickHouseSettings** - ClickHouse settings to apply to all requests. Default value: `{}`.
- **log?: { LoggerClass?: Logger, level?: ClickHouseLogLevel }** - internal client logs configuration. [Logging docs](./js.md#logging-nodejs-only)
- **session_id?: string**  - optional ClickHouse Session ID to send with every request.
- **keep_alive?: { enabled?: boolean }** - enabled by default in both Node.js and Web versions.
- **http_headers?: Record<string, string>** - additional HTTP headers for outgoing ClickHouse requests. See also: [Reverse proxy with authentication docs](./js.md#reverse-proxy-with-authentication)

#### Node.js-specific configuration parameters

- **max_open_connections?: number** - maximum number of connected sockets to allow per host. Default value: `10`.
- **tls?: { ca_cert: Buffer, cert?: Buffer, key?: Buffer }** - configure TLS certificates. [TLS docs](./js.md#tls-certificates-nodejs-only)
- **keep_alive?: { enabled?: boolean, idle_socket_ttl?: number }** - See [Keep Alive docs](./js.md#keep-alive-configuration-nodejs-only)

### URL configuration

:::important
URL configuration will _always_ overwrite the hardcoded values and a warning will be logged in this case.
:::

It is possible to configure most of the client instance parameters with a URL. The URL format is `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`. In almost every case, the name of a particular parameter reflects its path in the config options interface, with a few exceptions. The following parameters are supported:

| Parameter                                   | Type                                                              |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `pathname`                                  | an arbitrary string.                                              |
| `application_id`                            | an arbitrary string.                                              |
| `session_id`                                | an arbitrary string.                                              |
| `request_timeout`                           | non-negative number.                                              |
| `max_open_connections`                      | non-negative number, greater than zero.                           |
| `compression_request`                       | boolean. See below [1].                                           |
| `compression_response`                      | boolean.                                                          |
| `log_level`                                 | allowed values: `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`. |
| `keep_alive_enabled`                        | boolean.                                                          |
| `clickhouse_setting_*` or `ch_*`            | see below [2].                                                    |
| `http_header_*`                             | see below [3].                                                    |
| (Node.js only) `keep_alive_idle_socket_ttl` | non-negative number.                                              |

[1] For booleans, valid values will be `true`/`1` and `false`/`0`.

[2] Any parameter prefixed with `clickhouse_setting_` or `ch_` will have this prefix removed and the rest added to client's `clickhouse_settings`. For example, `?ch_async_insert=1&ch_wait_for_async_insert=1` will be the same as:

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

Note: boolean values for `clickhouse_settings` should be passed as `1`/`0` in the URL.

[3] Similar to [2], but for `http_header` configuration. For example, `?http_header_x-clickhouse-auth=foobar` will be an equivalent of:

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```

### Connecting

#### Gather your connection details

<ConnectionDetails />

#### Connection overview

The client implements a connection via HTTP(s) protocol. RowBinary support is on track, see the [related issue](https://github.com/ClickHouse/clickhouse-js/issues/216).

The following example demonstrates how to set up a connection against ClickHouse Cloud. It assumes `host` (including
protocol and port) and `password` values are specified via environment variables, and `default` user is used.

**Example:** Creating a Node.js Client instance using environment variables for configuration.

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  host: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

The client repository contains multiple examples that use environment variables, such as [creating a table in ClickHouse Cloud](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts), [using async inserts](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts), and quite a few others.

#### Connection pool (Node.js only)

To avoid the overhead of establishing a connection on every request, the client creates a pool of connections to ClickHouse to reuse, utilizing Keep-Alive mechanism. By default, Keep-Alive is enabled, and the size of connection pool is set to `10`, but you can change it with `max_open_connections` [configuration option](./js.md#configuration). 

There is no guarantee the same connection in a pool will be used for subsequent queries unless the user sets `max_open_connections: 1`. This is rarely needed but may be required for cases where users are using temporary tables.

See also: [Keep-Alive configuration](./js.md#keep-alive-configuration-nodejs-only).

### Query ID

Every method that sends a query or a statement (`command`, `exec`, `insert`, `select`) will provide `query_id` in the result. This unique identifier is assigned by the client per query, and might be useful to fetch the data from `system.query_log`,
if it is enabled in the [server configuration](https://clickhouse.com/docs/en/operations/server-configuration-parameters/settings#server_configuration_parameters-query-log), or cancel long-running queries (see [the example](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)). If necessary, `query_id` can be overridden by the user in `command`/`query`/`exec`/`insert` methods params.

:::tip
If you are overriding the `query_id` parameter, you need to ensure its uniqueness for every call. A random UUID is a good choice.
:::

### Query method

Used for most statements that can have a response, such as `SELECT`, or for sending DDLs such as `CREATE TABLE`. Should be awaited. The returned result set is expected to be consumed in the application.

:::note
There is a dedicated method [insert](./js.md#insert-method) for data insertion, and [command](./js.md#command-method) for DDLs.
:::

```ts
interface QueryParams {
  // Query to execute that might return some data.
  query: string
  // Format of the resulting dataset.
  format?: DataFormat
  // ClickHouse settings that can be applied on query level.
  clickhouse_settings?: ClickHouseSettings
  // Parameters for query binding.
  query_params?: Record<string, unknown>
  // AbortSignal instance to cancel a query in progress.
  abort_signal?: AbortSignal
  // query_id override; if not specified, a random identifier will be generated automatically.
  query_id?: string
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>
}
```

:::tip
Do not specify the FORMAT clause in `query`, use `format` parameter instead.
:::

#### ResultSet and Row abstractions

ResultSet provides several convenience methods for data processing in your application.

Node.js ResultSet implementation uses `Stream.Readable` under the hood, while the web version uses Web API `ReadableStream`.

You should start consuming the ResultSet as soon as possible, as it holds the response stream open and, consequently, the underlying connection busy; the client does not buffer the incoming data to avoid potential excessive memory usage by the application. 

You can consume the ResultSet by calling either `text` or `json` methods and load the entire set of rows returned by the query into the memory. 

Alternatively, if it's too large to fit into memory at once, you can call the `stream` method, and process the data in the streaming mode; each of the response chunks will be transformed into a relatively small arrays of rows instead (the size of this array depends on the size of a particular chunk the client receives from the server, as it may vary, and the size of an individual row), one chunk at a time. 

Please refer to the list of the [supported data formats](./js.md#supported-data-formats) to determine what is the best format for streaming in your case. For example, if you want to stream JSON objects, you could choose [JSONEachRow](https://clickhouse.com/docs/en/sql-reference/formats#jsoneachrow), and each row will be parsed as a JS object, or, perhaps, a more compact [JSONCompactColumns](https://clickhouse.com/docs/en/sql-reference/formats#jsoncompactcolumns) format that will result in each row being a compact array of values. See also: [streaming files](./js.md#streaming-files-nodejs-only).

:::important
If the ResultSet or its stream is not fully consumed, it will be destroyed after the `request_timeout` period of inactivity.
:::

```ts
interface BaseResultSet<Stream> {
  // See "Query ID" section above
  query_id: string

  // Consume the entire stream and get the contents as a string
  // Can be used with any DataFormat
  // Should be called only once
  text(): Promise<string>

  // Consume the entire stream and parse the contents as a JS object
  // Can be used only with JSON formats
  // Should be called only once
  json<T>(): Promise<T>

  // Returns a readable stream for responses that can be streamed
  // Every iteration over the stream provides an array of Row[] in the selected DataFormat
  // Should be called only once
  stream(): Stream
}

interface Row {
  // Get the content of the row as a plain string
  text: string

  // Parse the content of the row as a JS object
  json<T>(): T
}
```

**Example:** (Node.js/Web) A query with a resulting dataset in `JSONEachRow` format, consuming the entire stream and parsing the contents as JS objects. 
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // or `row.text` to avoid parsing JSON
```

**Example:** (Node.js only) Streaming query result in `JSONEachRow` format using the classic `on('data')` approach. This is interchangeable with the `for await const` syntax. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts).

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // or JSONCompactEachRow, JSONStringsEachRow, etc.
})
const stream = rows.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.json()) // or `row.text` to avoid parsing JSON
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('Completed!')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**Example:** (Node.js only) Streaming query result in `CSV` format using the classic `on('data')` approach. This is interchangeable with the `for await const` syntax.
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'CSV', // or TabSeparated, CustomSeparated, etc.
})
const stream = resultSet.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.text)
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('Completed!')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**Example:** (Node.js only) Streaming query result as JS objects in `JSONEachRow` format consumed using `for await const` syntax. This is interchangeable with the classic `on('data')` approach.
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers LIMIT 10',
  format: 'JSONEachRow', // or JSONCompactEachRow, JSONStringsEachRow, etc.
})
for await (const rows of resultSet.stream()) {
  rows.forEach(row => {
    console.log(row.json())
  })
}
```

:::note
`for await const` syntax has a bit less code than the `on('data')` approach, but it may have negative performance impact.
See [this issue in the Node.js repository](https://github.com/nodejs/node/issues/31979) for more details.
:::

**Example:** (Web only) Iteration over the `ReadableStream` of objects.

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM system.numbers LIMIT 10',
  format: 'JSONEachRow'
})

const reader = resultSet.stream().getReader()
while (true) {
  const { done, value: rows } = await reader.read()
  if (done) { break }
  rows.forEach(row => {
    console.log(row.json())
  })
}
```

### Insert method

This is the primary method for data insertion.

```ts
export interface InsertResult {
  query_id: string
  executed: boolean
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

The return type is minimal, as we do not expect any data to be returned from the server and drain the response stream immediately.

If an empty array was provided to the insert method, the insert statement will not be sent to the server; instead, the method will immediately resolve with `{ query_id: '...', executed: false }`. If the `query_id` was not provided in the method params in this case, it will be an empty string in the result, as returning a random UUID generated by the client could be confusing, as the query with such `query_id` won't exist in the `system.query_log` table.

If the insert statement was sent to the server, the `executed` flag will be `true`.

#### Insert method and streaming in Node.js

It can work with either a `Stream.Readable` or a plain `Array<T>`, depending on the [data format](./js.md#supported-data-formats) specified to the `insert` method. See also this section about the [file streaming](./js.md#streaming-files-nodejs-only).

Insert method is supposed to be awaited; however, it is possible to specify an input stream and await the `insert` operation later, only when the stream is completed (which will also resolve the `insert` promise). This could potentially be useful for event listeners and similar scenarios, but the error handling might non-trivial with a lot of edge cases on the client side. Instead, consider using [async inserts](https://clickhouse.com/docs/en/optimize/asynchronous-inserts), like it is illustrated in [this example](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts).

:::tip
If you have a custom INSERT statement that is difficult to model with this method, consider using [command](./js.md#command-method); see how it is used in the [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) or [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) examples.
:::

```ts
interface InsertParams<T> {
  // Table name to insert the data into
  table: string
  // A dataset to insert.
  values: ReadonlyArray<T> | Stream.Readable
  // Format of the dataset to insert.
  format?: DataFormat
  // ClickHouse settings that can be applied on statement level.
  clickhouse_settings?: ClickHouseSettings
  // Parameters for query binding.
  query_params?: Record<string, unknown>
  // AbortSignal instance to cancel an insert in progress.
  abort_signal?: AbortSignal
  // query_id override; if not specified, a random identifier will be generated automatically.
  query_id?: string
  // Allows to specify which columns the data will be inserted into.
  // - An array such as `['a', 'b']` will generate: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - An object such as `{ except: ['a', 'b'] }` will generate: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // By default, the data is inserted into all columns of the table,
  // and the generated statement will be: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

:::important
A request canceled with `abort_signal` does not guarantee that data insertion did not take place, as the server could've received some of the streamed data before the cancellation.
:::

**Example:** (Node.js/Web) Insert an array of values. 
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
await client.insert({
  table: 'my_table',
  // structure should match the desired format, JSONEachRow in this example
  values: [
    { id: 42, name: 'foo' },
    { id: 42, name: 'bar' },
  ],
  format: 'JSONEachRow',
})
```

**Example:** (Node.js only) Insert a stream from a CSV file.
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts). See also: [file streaming](./js.md#streaming-files-nodejs-only).

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**Example**: Exclude certain columns from the insert statement.

Assuming the table definition such as:

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

Insert only a specific column:

```ts
// Generated statement: INSERT INTO mytable (message) FORMAT JSONEachRow
await client.insert({
  table: 'mytable',
  values: [{ message: 'foo' }],
  format: 'JSONEachRow',
  // `id` column value for this row will be zero (default for UInt32)
  columns: ['message'],
})
```

Exclude certain columns:

```ts
// Generated statement: INSERT INTO mytable (* EXCEPT (message)) FORMAT JSONEachRow
await client.insert({
  table: tableName,
  values: [{ id: 144 }],
  format: 'JSONEachRow',
  // `message` column value for this row will be an empty string
  columns: {
    except: ['message'],
  },
})
```

See the [source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts) for additional details.

**Example**: Insert into a database different from the one provided to the client instance. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts).

```ts
await client.insert({
  table: 'mydb.mytable', // Fully qualified name including the database
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```

#### Web version limitations

Currently, inserts in `@clickhouse/client-web` only work with `Array<T>` and `JSON*` formats.
Inserting streams is not supported in the web version yet due to poor browser compatibility.

Consequently, the `InsertParams` interface for the web version looks slightly different from the Node.js version, 
as `values` are limited to the `ReadonlyArray<T>` type only:

```ts
interface InsertParams<T> {
  // Table name to insert the data into
  table: string
  // A dataset to insert.
  values: ReadonlyArray<T>
  // Format of the dataset to insert.
  format?: DataFormat
  // ClickHouse settings that can be applied on statement level.
  clickhouse_settings?: ClickHouseSettings
  // Parameters for query binding.
  query_params?: Record<string, unknown>
  // AbortSignal instance to cancel an insert in progress.
  abort_signal?: AbortSignal
  // query_id override; if not specified, a random identifier will be generated automatically.
  query_id?: string
  // Allows to specify which columns the data will be inserted into.
  // - An array such as `['a', 'b']` will generate: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - An object such as `{ except: ['a', 'b'] }` will generate: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // By default, the data is inserted into all columns of the table,
  // and the generated statement will be: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

This is a subject to change in the future.

### Command method

It can be used for statements that do not have any output, when the format clause is not applicable, or when you are not
interested in the response at all. An example of such a statement can be `CREATE TABLE` or `ALTER TABLE`.

Should be awaited.

The response stream is destroyed immediately, which means that the underlying socket is released.

```ts
interface CommandParams {
  // Statement to execute.
  query: string
  // ClickHouse settings that can be applied on query level
  clickhouse_settings?: ClickHouseSettings
  // Parameters for query binding.
  query_params?: Record<string, unknown>
  // AbortSignal instance to cancel a request in progress.
  abort_signal?: AbortSignal
  // query_id override; if not specified, a random identifier will be generated automatically.
  query_id?: string
}

interface CommandResult {
  query_id: string
}

interface ClickHouseClient {
  command(params: CommandParams): Promise<CommandResult>
}
```

**Example:** (Node.js/Web) Create a table in ClickHouse Cloud. 
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts).

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // Recommended for cluster usage to avoid situations where a query processing error occurred after the response code, 
  // and HTTP headers were already sent to the client.
  // See https://clickhouse.com/docs/en/interfaces/http/#response-buffering
  clickhouse_settings: {
    wait_end_of_query: 1,
  },
})
```

**Example:** (Node.js/Web) Create a table in a self-hosted ClickHouse instance. 
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_single_node.ts).

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_table
    (id UInt64, name String)
    ENGINE MergeTree()
    ORDER BY (id)
  `,
})
```

**Example:** (Node.js/Web) INSERT FROM SELECT

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`,
})
```

:::important
A request cancelled with `abort_signal` does not guarantee that the statement wasn't executed by the server.
:::

### Exec method

If you have a custom query that does not fit into `query`/`insert`,
and you are interested in the result, you can use `exec` as an alternative to `command`.

`exec` returns a readable stream that MUST be consumed or destroyed on the application side.

```ts
interface ExecParams {
  // Statement to execute.
  query: string
  // ClickHouse settings that can be applied on query level
  clickhouse_settings?: ClickHouseSettings
  // Parameters for query binding.
  query_params?: Record<string, unknown>
  // AbortSignal instance to cancel a request in progress.
  abort_signal?: AbortSignal
  // query_id override; if not specified, a random identifier will be generated automatically.
  query_id?: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

Stream return type is different in Node.js and Web versions.

Node.js:

```ts
export interface QueryResult {
  stream: Stream.Readable
  query_id: string
}
```

Web:

```ts
export interface QueryResult {
  stream: ReadableStream
  query_id: string
}
```

### Ping

The `ping` method provided to check the connectivity status returns `true` if the server can be reached. 

If the server is unreachable, the underlying error is included in the result as well.

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }

interface ClickHouseClient {
  ping(): Promise<PingResult>
}
```

Ping might be a useful tool to check if the server is available when the application starts, especially with ClickHouse Cloud, where an instance might be idling and will wake up after a ping.

**Example:** (Node.js/Web) Ping a ClickHouse server instance. NB: for the Web version, captured errors will be different.
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts).

```ts
const result = await client.ping();
if (!result.success) {
  // process result.error
}
```

NB: due to `/ping` endpoint not implementing CORS, the web version uses a simple `SELECT 1` to achieve a similar result. 

### Close (Node.js only)

Closes all the open connections and releases resources. No-op in the web version.

```ts
await client.close()
```

## Streaming files (Node.js only)

There are several file streaming examples with popular data formats (NDJSON, CSV, Parquet) in the client repository.

- [Streaming from an NDJSON file](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [Streaming from a CSV file](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Streaming from a Parquet file](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Streaming into a Parquet file](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

Streaming other formats into a file should be similar to Parquet, 
the only difference will be in the format used for `query` call (`JSONEachRow`, `CSV`, etc.) and the output file name.

## Supported Data formats

The client handles data formats as JSON or text.

If you specify `format` as one of the JSON-family (`JSONEachRow`, `JSONCompactEachRow`, etc.), the client will serialize and deserialize data during the communication over the wire.

Data provided in the "raw" text formats (`CSV`, `TabSeparated` and `CustomSeparated` families) are sent over the wire without additional transformations.

:::tip
There might be confusion between JSON as a general format and [ClickHouse JSON format](https://clickhouse.com/docs/en/sql-reference/formats#json). 

The client supports streaming JSON objects with formats such as [JSONEachRow](https://clickhouse.com/docs/en/sql-reference/formats#jsoneachrow) (see the table overview for other streaming-friendly formats; see also the `select_streaming_` [examples in the client repository](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)). 

It's only that formats like [ClickHouse JSON](https://clickhouse.com/docs/en/sql-reference/formats#json) and a few others are represented as a single object in the response and cannot be streamed by the client.
:::

| Format                                     | Input (array) | Input (object) | Input/Output (Stream) | Output (JSON) | Output (text)  |
|--------------------------------------------|---------------|----------------|-----------------------|---------------|----------------|
| JSON                                       | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONCompact                                | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONObjectEachRow                          | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONColumnsWithMetadata                    | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONStrings                                | ❌             | ❌️             | ❌                     | ✔️            | ✔️             |
| JSONCompactStrings                         | ❌             | ❌              | ❌                     | ✔️            | ✔️             |
| JSONEachRow                                | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONStringsEachRow                         | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONCompactEachRow                         | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONCompactStringsEachRow                  | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONCompactEachRowWithNames                | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONCompactEachRowWithNamesAndTypes        | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNames         | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| CSV                                        | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| CSVWithNames                               | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| CSVWithNamesAndTypes                       | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| TabSeparated                               | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| TabSeparatedRaw                            | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| TabSeparatedWithNames                      | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| TabSeparatedWithNamesAndTypes              | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| CustomSeparated                            | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| CustomSeparatedWithNames                   | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| CustomSeparatedWithNamesAndTypes           | ❌             | ❌              | ✔️                    | ❌             | ✔️             |
| Parquet                                    | ❌             | ❌              | ✔️                    | ❌             | ✔️❗- see below |

For Parquet, the main use case for selects likely will be writing the resulting stream into a file. See [the example](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts) in the client repository.

The entire list of ClickHouse input and output formats is available 
[here](https://clickhouse.com/docs/en/interfaces/formats).

## Supported ClickHouse data types

| Type           | Status         | JS type               |
|----------------|----------------|-----------------------|
| UInt8/16/32    | ✔️             | number                |
| UInt64/128/256 | ✔️❗- see below | string                |
| Int8/16/32     | ✔️             | number                |
| Int64/128/256  | ✔️❗- see below | string                |
| Float32/64     | ✔️             | number                |
| Decimal        | ✔️❗- see below | number                |
| Boolean        | ✔️             | boolean               |
| String         | ✔️             | string                |
| FixedString    | ✔️             | string                |
| UUID           | ✔️             | string                |
| Date32/64      | ✔️              | string                |
| DateTime32/64  | ✔️❗- see below | string                |
| Enum           | ✔️             | string                |
| LowCardinality | ✔️             | string                |
| Array(T)       | ✔️             | T[]                   |
| JSON           | ✔️             | object                |
| Nested         | ✔️             | T[]                   |
| Tuple          | ✔️             | Tuple                 |
| Nullable(T)    | ✔️             | JS type for T or null |
| IPv4           | ✔️             | string                |
| IPv6           | ✔️             | string                |
| Point          | ✔️             | [ number, number ]    |
| Ring           | ✔️             | Array<Point\>         |
| Polygon        | ✔️             | Array<Ring\>          |
| MultiPolygon   | ✔️             | Array<Polygon\>       |
| Map(K, V)      | ✔️             | Record<K, V\>         |

The entire list of supported ClickHouse formats is available 
[here](https://clickhouse.com/docs/en/sql-reference/data-types/).

### Date/Date32 types caveats

Since the client inserts values without additional type conversion, `Date`/`Date32` type columns can only be inserted as
strings.

**Example:** Insert a `Date` type value. 
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)
.

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

However, if you are using `DateTime` or `DateTime64` columns, you can use both strings and JS Date objects. JS Date objects can be passed to `insert` as-is with `date_time_input_format` set to `best_effort`. See this [example](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts) for more details.

### Decimal\* types caveats

Since the client performs no additional type conversion, it is not possible to insert `Decimal*` type columns as
strings, only as numbers. This is a suboptimal approach as it might end in float precision loss. Thus, it is recommended
to avoid `JSON*` formats when using `Decimals` as of now. Consider `TabSeparated*`, `CSV*` or `CustomSeparated*` formats
families for that kind of workflow.

**Example:** Insert `12.01` and `5000000.405` into the destination table `my_table`, 
assuming that the table has two `Decimal` type fields:

```ts
await client.insert({
  table: 'my_table',
  values: ['12.01\t5000000.405\n'],
  format: 'TabSeparated',
})
```

See the [tests](https://github.com/ClickHouse/clickhouse-js/blob/c1b70c82f525c39edb3ca1ee05cb5e6b43dba5b3/__tests__/integration/data_types.test.ts#L98-L131) for more information.

### Integral types: Int64, Int128, Int256, UInt64, UInt128, UInt256

Though the server can accept it as a number, it is returned as a string in `JSON*` family output formats to avoid
integer overflow as max values for these types are bigger than `Number.MAX_SAFE_INTEGER`.

This behavior, however, can be modified
with [`output_format_json_quote_64bit_integers` setting](https://clickhouse.com/docs/en/operations/settings/formats#output_format_json_quote_64bit_integers)
.

**Example:** Adjust the JSON output format for 64-bit numbers.

```ts
const resultSet = await client.query({
  query: 'SELECT * from system.numbers LIMIT 1',
  format: 'JSONEachRow',
})

expect(await resultSet.json()).toEqual([ { number: '0' } ])
```

```ts
const resultSet = await client.query({
  query: 'SELECT * from system.numbers LIMIT 1',
  format: 'JSONEachRow',
  clickhouse_settings: { output_format_json_quote_64bit_integers: 0 },
})

expect(await resultSet.json()).toEqual([ { number: 0 } ])
```

## ClickHouse settings

The client can adjust ClickHouse behavior via [settings](https://clickhouse.com/docs/en/operations/settings/settings/)
mechanism.
The settings can be set on the client instance level so that they will be applied to every request sent to the
ClickHouse:

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

Or a setting can be configured on a request-level:

```ts
client.query({
  clickhouse_settings: {}
})
```

A type declaration file with all the supported ClickHouse settings can be found 
[here](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts).

:::important
Make sure that the user on whose behalf the queries are made has sufficient rights to change the settings.
:::

## Advanced topics

### Queries with parameters

You can create a query with parameters and pass values to them from client application. This allows to avoid formatting
query with specific dynamic values on client side.

Format a query as usual, then place the values that you want to pass from the app parameters to the query in braces in
the following format:

```
{<name>: <data_type>}
```

where:

- `name` — Placeholder identifier.
- `data_type` - [Data type](https://clickhouse.com/docs/en/sql-reference/data-types/) of the app parameter value.

**Example:**: Query with parameters. 
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/query_with_parameter_binding.ts)
.

```ts
await client.query({
  query: 'SELECT plus({val1: Int32}, {val2: Int32})',
  format: 'CSV',
  query_params: {
    val1: 10,
    val2: 20,
  },
})
```

Check https://clickhouse.com/docs/en/interfaces/cli#cli-queries-with-parameters-syntax for additional details.

### Compression

NB: request compression is currently not available in the Web version. Response compression works as normal. Node.js version supports both.

Data applications operating with large datasets over the wire can benefit from enabling compression. Currently, only `GZIP` is supported using [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html).

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

Configurations parameters are:

- `response: true` instructs ClickHouse server to respond with compressed response body. Default value: `response: false`
- `request: true` enables compression on the client request body. Default value: `request: false`

### Logging (Node.js only)

:::important
The logging is an experimental feature and is subject to change in the future.
:::

The default logger implementation emits log records into `stdout` via `console.debug/info/warn/error` methods.
You can customize the logging logic via providing a `LoggerClass`, and choose the desired log level via `level` parameter (default is `OFF`):

```typescript
import type { Logger } from '@clickhouse/client'

// All three LogParams types are exported by the client
interface LogParams {
  module: string
  message: string
  args?: Record<string, unknown>
}
type ErrorLogParams = LogParams & { err: Error }
type WarnLogParams = LogParams & { err?: Error }

class MyLogger implements Logger {
  trace({ module, message, args }: LogParams) {
    // ...
  }
  debug({ module, message, args }: LogParams) {
    // ...
  }
  info({ module, message, args }: LogParams) {
    // ...
  }
  warn({ module, message, args }: WarnLogParams) {
    // ...
  }
  error({ module, message, args, err }: ErrorLogParams) {
    // ...
  }
}

const client = createClient({
  log: {
    LoggerClass: MyLogger,
    level: ClickHouseLogLevel
  }
})
```

Currently, the client will log the following events:

- `TRACE` - low-level information about the Keep-Alive sockets lifecycle
- `DEBUG` - response information (without authorization headers and host info)
- `INFO` - mostly unused, will print the current log level when the client is initialized
- `WARN` - non-fatal errors; failed `ping` request is logged as a warning, as the underlying error is included in the returned result
- `ERROR` - fatal errors from `query`/`insert`/`exec`/`command` methods, such as a failed request

You can find the default Logger implementation [here](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts).

## TLS certificates (Node.js only)

Node.js client optionally supports both basic (Certificate Authority only)
and mutual (Certificate Authority and client certificates) TLS.

Basic TLS configuration example, assuming that you have your certificates in `certs` folder
and CA file name is `CA.pem`:

```ts
const client = createClient({
  host: 'https://<hostname>:<port>',
  username: '<username>',
  password: '<password>', // if required
  tls: {
    ca_cert: fs.readFileSync('certs/CA.pem'),
  },
})
```

Mutual TLS configuration example using client certificates:

```ts
const client = createClient({
  host: 'https://<hostname>:<port>',
  username: '<username>',
  tls: {
    ca_cert: fs.readFileSync('certs/CA.pem'),
    cert: fs.readFileSync(`certs/client.crt`),
    key: fs.readFileSync(`certs/client.key`),
  },
})
```

See full examples for [basic](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) and [mutual](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS in the repository.

## Keep-Alive configuration (Node.js only)

The client enables Keep-Alive in the underlying HTTP agent by default, meaning that the connected sockets will be reused for subsequent requests, and `Connection: keep-alive` header will be sent. Sockets that are idling will remain in the connection pool for 2500 milliseconds by default (see the [notes about adjusting this option](./js.md#adjusting-idle_socket_ttl)).

`keep_alive.idle_socket_ttl` is supposed to have its value a fair bit lower than the server/LB configuration. The main reason is that due to HTTP/1.1 allowing the server to close the sockets without notifying the client, if the server or the load balancer closes the connection _before_ the client does, the client could try to reuse the closed socket, resulting in a `socket hang up` error.

If you are modifying `keep_alive.idle_socket_ttl`, keep in mind that it should be always in sync with your server/LB Keep-Alive configuration, and it should be **always lower** than that, ensuring that the server never closes the open connection first.

### Adjusting `idle_socket_ttl`

The client sets `keep_alive.idle_socket_ttl` to 2500 milliseconds, as it can be considered the safest default; on the server side `keep_alive_timeout` might be set to [as low as 3 seconds in ClickHouse versions prior to 23.11](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1) without `config.xml` modifications.

:::warning
If you are happy with the performance and do not experience any issues, it is recommended to **not** increase the value of `keep_alive.idle_socket_ttl` setting, as it might lead to potential "Socket hang-up" errors; additionally, if your application sends a lot of queries and there is not a lot of downtime between them, the default value should be sufficient, as the sockets will not be idling for a long enough time, and the client will keep them in the pool.
:::

You can find the correct Keep-Alive timeout value in the server response headers by running the following command:

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

Check the values of `Connection` and `Keep-Alive` headers in the response. For example:

```
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

In this case, `keep_alive_timeout` is 10 seconds, and you could try increasing `keep_alive.idle_socket_ttl` to 9000 or even 9500 milliseconds to keep the idling sockets open for a bit longer than by default. Keep an eye on potential "Socket hang-up" errors, which will indicate that the server closes the connections before the client does so, and lower the value until the errors disappear.

### Keep-Alive troubleshooting

If you are experiencing `socket hang up` errors while using Keep-Alive, there are the following options to resolve this issue:

* Slightly reduce `keep_alive.idle_socket_ttl` setting in the ClickHouse server configuration. In certain situations, for example, high network latency between client and server, it could be beneficial to reduce `keep_alive.idle_socket_ttl` by another 200-500 milliseconds, ruling out the situation where an outgoing request could obtain a socket that the server is going to close. 

* If this error is happening during long-running queries with no data coming in or out (for example, a long-running `INSERT FROM SELECT`), this might be due to the load balancer closing idling connections. You could try forcing some data coming in during long-running queries by using a combination of these ClickHouse settings:

  ```ts
  const client = createClient({
    // Here we assume that we will have some queries with more than 5 minutes of execution time
    request_timeout: 400_000,
    /** These settings in combination allow to avoid LB timeout issues in case of long-running queries without data coming in or out,
     *  such as `INSERT FROM SELECT` and similar ones, as the connection could be marked as idle by the LB and closed abruptly.
     *  In this case, we assume that the LB has idle connection timeout of 120s, so we set 110s as a "safe" value. */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: '110000', // UInt64, should be passed as a string
    },
  })
  ```
  Keep in mind, however, that the total size of the received headers has 16KB limit in recent Node.js versions; after certain amount of progress headers received, which was around 70-80 in our tests, an exception will be generated.

  It is also possible to use an entirely different approach, avoiding wait time on the wire completely; it could be done by leveraging HTTP interface "feature" that mutations are not cancelled when the connection is lost. See [this example (part 2)](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts) for more details.

* Keep-Alive feature can be disabled entirely. In this case, client will also add `Connection: close` header to every request, and the underlying HTTP agent will not reuse the connections. `keep_alive.idle_socket_ttl` setting will be ignored, as there will be no idling sockets. This will result in additional overhead, as a new connection will be established for every request.

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```

## Read-only users

When using the client with a [readonly=1 user](https://clickhouse.com/docs/en/operations/settings/permissions-for-queries#readonly), the response compression cannot be enabled, as it requires `enable_http_compression` setting. The following configuration will result in an error:

```ts
const client = createClient({
  compression: {
    response: true, // won't work with a readonly=1 user
  },
})
```

See the [example](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts) that has more highlights of readonly=1 user limitations.

## Proxy with a pathname

If your ClickHouse instance is behind a proxy, and it has pathname in the URL as in, for example, http://proxy:8123/clickhouse_server, specify `clickhouse_server` as `pathname` configuration option (with or without a leading slash); otherwise, if provided directly in the `url`, it will be considered as the `database` option. Multiple segments are supported, e.g. `/my_proxy/db`.

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```

## Reverse proxy with authentication

If you have a reverse proxy with authentication in front of your ClickHouse deployment, you could use the `http_headers` setting to provide the necessary headers there:

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```

## Known limitations (Node.js/Web)

- There are no data mappers for the result sets, so only language primitives are used. Certain data type mappers are planned with [RowBinary format support](https://github.com/ClickHouse/clickhouse-js/issues/216).
- There are some [Decimal* and Date\* / DateTime\* data types caveats](./js.md#datedate32-types-caveats).
- When using JSON* family formats, numbers larger than Int32 are represented as strings, as Int64+ types maximum values are larger than `Number.MAX_SAFE_INTEGER`. See the [Integral types](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) section for more details.

## Known limitations (Web)

- Streaming for select queries works, but it is disabled for inserts (on the type level as well).
- Request compression is disabled and configuration is ignored. Response compression works.
- No logging support yet.

## Tips for performance optimizations

- To reduce application memory consumption, consider using streams for large inserts (e.g. from files) and selects when applicable. For event listeners and similar use cases, [async inserts](https://clickhouse.com/docs/en/optimize/asynchronous-inserts) could be another good option, allowing to minimize, or even completely avoid batching on the client side. Async insert examples are available in the [client repository](https://github.com/ClickHouse/clickhouse-js/tree/main/examples), with `async_insert_` as the file name prefix.
- The client does not enable request or response compression by default. However, when selecting or inserting large datasets, you could consider enabling it via `ClickHouseClientConfigOptions.compression` (either for just `request` or `response`, or both).
- Compression has significant performance penalty. Enabling it for `request` or `response` will negatively impact the speed of selects or inserts, respectively, but will reduce the amount of network traffic transferred by the application.

## Contact us

If you have any questions or need help, feel free to reach out to us in the [Community Slack](https://clickhouse.com/slack) (`#clickhouse-js` channel) or via [GitHub issues](https://github.com/ClickHouse/clickhouse-js/issues).
