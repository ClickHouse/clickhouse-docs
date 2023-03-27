---
sidebar_label: Node.js
sidebar_position: 4
keywords: [clickhouse, nodejs, client, connect, integrate]
slug: /en/integrations/language-clients/nodejs
description: The official Node.js client for connecting to ClickHouse.
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_http.mdx';

# ClickHouse JS

The official Node.js client for connecting to ClickHouse.
The client is written in TypeScript and provides typings for the client public API.

## Environment requirements

Node.js must be available in the environment to run the client.
The client is compatible with all the [maintained](https://github.com/nodejs/release#readme) Node.js releases.

As soon as a Node.js version approaches End-Of-Life, the client drops support for it as it is considered outdated and
insecure.

*Note*: The Browser environment is not officially supported at the moment.

## Installation

To install the latest available client version, run:

```sh
npm i @clickhouse/client
```

## Compatibility with ClickHouse

| Client version | ClickHouse  |
|----------------|-------------|
| 0.0.14         | 22.8 - 23.2 |

## ClickHouse Client API

#### Creating a client instance

You can instantiate as many client instances as necessary with `createClient` factory.

```ts
import { createClient } from '@clickhouse/client'

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

A client instance can be [pre-configured](#configuration) during instantiation.

#### Configuration

When creating a client instance, the following connection settings can be adjusted:

- **host?: string** - a ClickHouse instance URL. Default value: `http://localhost:8123`
- **connect_timeout?: number** - the timeout to set up a connection in milliseconds. Default value: `10_000`.
- **request_timeout?: number** - the request timeout in milliseconds. Default value: `30_000`.
- **max_open_connections?: number** - maximum number of sockets to allow per host. Default value: `Infinity`.
- **compression?: { response?: boolean; request?: boolean }** - enable compression. [Compression docs](#compression)
- **username?: string** - The name of the user on whose behalf requests are made. Default value: `default`.
- **password?: string** - The user password. Default: `''`.
- **application?: string** - The name of the application using the Node.js client. Default value: `clickhouse-js`.
- **database?: string** - Database name to use. Default value: `default`
- **clickhouse_settings?: ClickHouseSettings** - ClickHouse settings to apply to all requests. Default value: `{}`.
- **log?: { LoggerClass?: Logger }** - configure logging. [Logging docs](#logging)
- **tls?: { ca_cert: Buffer, cert?: Buffer, key?: Buffer }** - configure TLS certificates. [TLS docs](#tls-certificates)
- **session_id?: string**  - optional ClickHouse Session ID to send with every request.

### Connecting

#### Gather your connection details

<ConnectionDetails />

The client implements a connection via HTTP(s) protocol.
The ClickHouse binary protocol is not supported yet.

The following example demonstrates how to set up a connection against ClickHouse Cloud. It assumes `host` (including
protocol and port) and `password` values are specified via environment variables, and `default` user is used.

**Example:** Client instance
creation. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping_cloud.ts).

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  host: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

#### Connection pool

To avoid the overhead of establishing a connection on every request, the client creates a pool of connections to
ClickHouse to reuse. By default, the size of connection pool is not limited, but you can change it
with `max_open_connections` [configuration option](#configuration).
There is no guarantee the same connection in a pool will be used for subsequent queries unless the user
sets `max_open_connections: 1`. This is rarely needed but may be required for cases where users are using temporary
tables.

### Query ID

Every method that sends an actual query (`exec`, `insert`, `select`) will provide `query_id` in the result.

This unique identifier is assigned by the client per query, and might be useful to fetch the data from `system.query_log`,
if it is enabled in the [server configuration](https://clickhouse.com/docs/en/operations/server-configuration-parameters/settings#server_configuration_parameters-query-log).

If necessary, `query_id` can be overridden by the user in `query`/`exec`/`insert` methods params.

NB: if you override `query_id`, ensure its uniqueness for every call.

### Exec method

It can be used for statements that do not have any output, when the format clause is not applicable, or when you are not
interested in the response at all. An example of such a statement can be `CREATE TABLE` or `ALTER TABLE`.

Should be awaited.

Optionally, it returns a readable stream that can be consumed on the application side if you need it for some reason.
But in that case, you might consider using [query](#query-method) instead.

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

export interface QueryResult {
  stream: Stream.Readable
  query_id: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

:::important
A request cancelled with `abort_signal` does not guarantee that DDL wasn't executed by server.
:::

**Example:** Create a table in ClickHouse
Cloud. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts).

```ts
await client.exec({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // Recommended for cluster usage to avoid situations
  // where a query processing error occurred after the response code
  // and HTTP headers were sent to the client.
  // See https://clickhouse.com/docs/en/interfaces/http/#response-buffering
  clickhouse_settings: {
    wait_end_of_query: 1,
  },
})
```

**Example:** Create a table in a self-hosted ClickHouse
instance. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_single_node.ts).

```ts
await client.exec({
  query: `
    CREATE TABLE IF NOT EXISTS my_table
    (id UInt64, name String)
    ENGINE MergeTree()
    ORDER BY (id)
  `,
})
```

### Insert method

The primary method for data insertion. It can work with both `Stream.Readable` (all formats except `JSON`) and
plain `Array<T>` (`JSON*` family formats only). It is recommended to avoid arrays in case of large inserts to reduce
application memory consumption and consider streaming for most of the use cases.

Should be awaited, but it does not return anything.

```ts
interface InsertParams<T> {
  // Table name to insert the data into
  table: string
  // A dataset to insert. Stream will work for all formats except JSON.
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
}

export interface InsertResult {
  query_id: string
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

:::important
A request canceled with `abort_signal` does not guarantee that data insertion did not take place.
:::

**Example:** Insert an array of
values. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

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

**Example:** Insert a stream of
objects. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_json_stream.ts).

```ts
const stream = new Stream.Readable({ objectMode: true, ... });
stream.push({ id: '42' })
setTimeout(function closeStream() {
  stream.push(null)
}, 100)
await client.insert({
  table: 'my_table',
  values: stream,
  format: 'JSONCompactEachRow',
})
```

**Example:** Insert a stream of strings in CSV format from a CSV
file. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_file_stream_csv.ts).

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

### Query method

Used for most statements that can have a response, such as `SELECT`, or for sending DDLs such as `CREATE TABLE`.
Please consider using the dedicated method [insert](#insert-method) for data insertion.

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

Provides several convenience methods for data processing in your application.

```ts
interface ResultSet {
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

  // Returns a readable stream for responses that can be streamed (i.e. all except JSON)
  // Every iteration provides an array of Row[] in the selected DataFormat
  // Should be called only once
  // NB: if called for the second time, the second stream will be just empty
  stream(): Stream.Readable
}

interface Row {
  // Get the content of the row as a plain string
  text: string

  // Parse the content of the row as a JS object
  json<T>(): T
}
```

**Example:** A query with a resulting dataset as `json` in `JSONEachRow`
format. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json()
```

**Example:** A query with a resulting dataset as a stream of objects in `JSONEachRow`
format consumed using classic `on('data')`
approach. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/select_streaming_on_data.ts)

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'CSV',
})
const stream = resultSet.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.text)
  })
})
await new Promise((resolve) => {
  stream.on('end', () => {
    console.log('Completed!')
    resolve(0)
  })
})
```

**Example:** A query with a resulting dataset as a stream of objects in `JSONEachRow`
format consumed using `for await const`
syntax. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/select_streaming_for_await.ts).

A bit less code than `on('data')` approach, but it may have negative performance impact.
See [this issue](https://github.com/nodejs/node/issues/31979) for more details.

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers LIMIT 10',
  format: 'JSONEachRow',
})
for await (const rows of resultSet.stream()) {
  rows.forEach(row => {
    console.log(row.text)
  })
}
```

### Ping

The `ping` method provided to check the connectivity status returns `true` if the server can be reached.
It can throw a standard Node.js Error such as `ECONNREFUSED`.

```ts
interface ClickHouseClient {
  ping(): Promise<boolean>
}
```

**Example:** Ping a ClickHouse server
instance. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping_cloud.ts).

```ts
const isAlive = await client.ping();
```

### Close

Closes all the open connections and releases resources.

```ts
await client.close()
```

## Supported Data formats

The client handles data formats as JSON or text.

If you specify `format` as one of the JSON-family (`JSONEachRow`, `JSONCompactEachRow`, etc.), the client will serialize
and deserialize data during the communication over the wire.

Data provided in the text formats (`CSV`, `TabSeparated` and `CustomSeparated` families) are sent over the wire without
additional transformations.

| Format                                     | Input (array) | Input (stream) | Input (object) | Output (JSON) | Output (text) |
|--------------------------------------------|---------------|----------------|----------------|---------------|---------------|
| JSON                                       | ❌             | ❌              | ✔️             | ✔️            | ✔️            |
| JSONObjectEachRow                          | ❌             | ❌              | ✔️             | ✔️            | ✔️            |
| JSONStrings                                | ❌             | ❌              | ✔️             | ✔️            | ✔️            |
| JSONCompact                                | ❌             | ❌              | ✔️             | ✔️            | ✔️            |
| JSONCompactStrings                         | ❌             | ❌              | ❌              | ✔️            | ✔️            |
| JSONColumnsWithMetadata                    | ❌             | ❌              | ✔️             | ✔️            | ✔️            |
| JSONEachRow                                | ✔️            | ✔️             | ❌              | ✔️            | ✔️            |
| JSONStringsEachRow                         | ✔️            | ✔️             | ❌              | ✔️            | ✔️            |
| JSONCompactEachRow                         | ✔️            | ✔️             | ❌              | ✔️            | ✔️            |
| JSONCompactStringsEachRow                  | ✔️            | ✔️             | ❌              | ✔️            | ✔️            |
| JSONCompactEachRowWithNames                | ✔️            | ✔️             | ❌              | ✔️            | ✔️            |
| JSONCompactEachRowWithNamesAndTypes        | ✔️            | ✔️             | ❌              | ✔️            | ✔️            |
| JSONCompactStringsEachRowWithNames         | ✔️            | ✔️             | ❌              | ✔️            | ✔️            |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔️            | ✔️             | ❌              | ✔️            | ✔️            |
| CSV                                        | ❌             | ✔️             | ❌              | ❌             | ✔️            |
| CSVWithNames                               | ❌             | ✔️             | ❌              | ❌             | ✔️            |
| CSVWithNamesAndTypes                       | ❌             | ✔️             | ❌              | ❌             | ✔️            |
| TabSeparated                               | ❌             | ✔️             | ❌              | ❌             | ✔️            |
| TabSeparatedRaw                            | ❌             | ✔️             | ❌              | ❌             | ✔️            |
| TabSeparatedWithNames                      | ❌             | ✔️             | ❌              | ❌             | ✔️            |
| TabSeparatedWithNamesAndTypes              | ❌             | ✔️             | ❌              | ❌             | ✔️            |
| CustomSeparated                            | ❌             | ✔️             | ❌              | ❌             | ✔️            |
| CustomSeparatedWithNames                   | ❌             | ✔️             | ❌              | ❌             | ✔️            |
| CustomSeparatedWithNamesAndTypes           | ❌             | ✔️             | ❌              | ❌             | ✔️            |

The entire list of ClickHouse input and output formats is
available [here](https://clickhouse.com/docs/en/interfaces/formats).

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
| Date32/64      | ✔️❗- see below | string                |
| DateTime32/64  | ✔️❗- see below | string                |
| Enum           | ✔️             | string                |
| LowCardinality | ✔️             | string                |
| Array(T)       | ✔️             | T[]                   |
| JSON           | ✔️             | object                |
| Nested         | ❌              | -                     |
| Tuple          | ✔️             | Tuple                 |
| Nullable(T)    | ✔️             | JS type for T or null |
| IPv4           | ✔️             | string                |
| IPv6           | ✔️             | string                |
| Point          | ✔️             | [ number, number ]    |
| Ring           | ✔️             | Array<Point\>         |
| Polygon        | ✔️             | Array<Ring\>          |
| MultiPolygon   | ✔️             | Array<Polygon\>       |
| Map(K, V)      | ✔️             | Record<K, V\>         |

The entire list of supported ClickHouse formats is
available [here](https://clickhouse.com/docs/en/sql-reference/data-types/).

### Date* / DateTime\* types caveats

Since the client inserts values without additional type conversion, `Date*` type columns can only be inserted as
strings and not as Unix time epochs. It might be changed with the future ClickHouse database releases.

**Example:** Insert a `Date` type
value. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)
.

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

### Decimal\* types caveats

Since the client performs no additional type conversion, it is not possible to insert `Decimal*` type columns as
strings, only as numbers. This is a suboptimal approach as it might end in float precision loss. Thus, it is recommended
to avoid `JSON*` formats when using `Decimals` as of now. Consider `TabSeparated*`, `CSV*` or `CustomSeparated*` formats
families for that kind of workflows.

**Example:** Insert a `Decimal` type
value. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/c1b70c82f525c39edb3ca1ee05cb5e6b43dba5b3/__tests__/integration/data_types.test.ts#L98-L131)
.

```ts
await client.insert({
  table: 'my_table',
  values: [ { decimal: '1234567891234567891234567891.1234567891' } ],
  format: 'JSONEachRow',
})
```

### Integral types: Int64, Int128, Int256, UInt64, UInt128, UInt256

Though the server can accept it as a number, it is returned as a string in `JSON*` family output formats to avoid
integer overflow as max values for these types are bigger than `Number.MAX_SAFE_INTEGER`.

This behavior, however, can be modified
with [`output_format_json_quote_64bit_integers` setting](https://clickhouse.com/docs/en/operations/settings/settings/#output_format_json_quote_64bit_integers)
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

A type declaration file with all the supported ClickHouse settings can be
found [here](https://github.com/ClickHouse/clickhouse-js/blob/730b1b2516e2d47dc9a32b1d8d0b8ba8ceb95ead/src/settings.ts).

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
{<name>: <data type>}
```

where:

- `name` — Placeholder identifier.
- `data type` -  [Data type](https://clickhouse.com/docs/en/sql-reference/data-types/) of the app parameter value.

**Example:**: Query with
parameters. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/query_with_parameter_binding.ts)
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

Data applications operating with large datasets over the wire can benefit from enabling compression. Currently,
only `GZIP` is supported using [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html).

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

Configurations parameters are:

- `response: true` instructs ClickHouse server to respond with compressed response body. Default value: `response: true`
- `request: true` enables compression on the client request body. Default value: `request: false`

### Logging

:::important
The logging is an experimental feature and is subject to change in the future.
:::

You can enable logging for debugging purposes by setting `CLICKHOUSE_LOG_LEVEL` environment variable.
Possible values are `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`.

Currently, there are only debug messages, but we will log more in the future.

The default logger implementation emits log records into `stdout` via `console.debug/info/warn/error` methods.
You can customize the logging logic via providing a `LoggerClass`:

```typescript
import type { Logger } from '@clickhouse/client'

class MyLogger implements Logger {
  debug({ module, message, args }: LogParams) {
    // ...
  }
  info({ module, message, args }: LogParams) {
    // ...
  }
  warn({ module, message, args }: LogParams) {
    // ...
  }
  error({ module, message, args, err }: ErrorLogParams) {
    // ...
  }
}

createClient({
  log: {
    LoggerClass: MyLogger,
  }
})
```

Check an example implementation
[here](https://github.com/ClickHouse/clickhouse-js/blob/3aad886231e93c982b0c6e552c87ce7fa72c2caf/__tests__/utils/test_logger.ts#L4-L17).

## TLS certificates

Node.js client optionally supports both basic (Certificate Authority only)
and mutual (Certificate Authority and client certificates) TLS.

Basic TLS configuration example, assuming that you have your certificates in `certs` folder
and CA file name is `CA.pem`:

```typescript
createClient({
  host: 'https://<hostname>:<port>',
  username: '<username>',
  password: '<password>', // if required
  tls: {
    ca_cert: fs.readFileSync('certs/CA.pem'),
  },
})
```

Mutual TLS configuration example using client certificates:

```typescript
createClient({
  host: 'https://<hostname>:<port>',
  username: '<username>',
  tls: {
    ca_cert: fs.readFileSync('certs/CA.pem'),
    cert: fs.readFileSync(`certs/client.crt`),
    key: fs.readFileSync(`certs/client.key`),
  },
})
```

See full examples
for [basic](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/basic_tls.ts)
and [mutual](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/mutual_tls.ts)
TLS in the repository.

## Known limitations

- Browser environment is not supported.
- There are no data mappers for the result sets, so only language primitives are used.
- There are some [Decimal* and Date\* / DateTime\* data types caveats](#date--datetime-types-caveats).
- [Nested](/docs/en/sql-reference/data-types/nested-data-structures/index.md) data type is currently not officially
  supported.

## Tips for performance optimizations

- To reduce application memory consumption, consider using streams for large inserts and selects when applicable.
- Node.js HTTP(s) Agent has [infinite max open sockets](https://nodejs.org/api/http.html#agentmaxsockets) by default. In
  some cases, you might want to limit that by using `ClickHouseClientConfigOptions.max_open_connections` setting.
- The client enable compression for `query` responses by default, but `insert` compression is disabled. When using large
  inserts, you might want to enable request compression as well. You can
  use `ClickHouseClientConfigOptions.compression.request` for that.
- Compression has some performance penalty. As it is enabled by default for responses, you might consider disabling it
  if you need to speed the selects up, but, on the other hand, it comes with a cost of network traffic increase.
