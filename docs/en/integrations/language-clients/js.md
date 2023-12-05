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

There are two different versions of the client available for different environments:
- `@clickhouse/client` - Node.js only
- `@clickhouse/client-web` - browsers (Chrome/Firefox), CloudFlare workers

When using TypeScript, make sure it is at least [version 4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html), which enables [inline import and export syntax](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names).

## Environment requirements (Node.js)

Node.js must be available in the environment to run the client.
The client is compatible with all the [maintained](https://github.com/nodejs/release#readme) Node.js releases.

As soon as a Node.js version approaches End-Of-Life, the client drops support for it as it is considered outdated and
insecure.

## Environment requirements (Web)

Web version of the client is officially tested with the latest Chrome/Firefox browsers and can be used as a dependency in, 
for example, React/Vue/Angular applications, or CloudFlare workers.

## Installation

To install the latest available Node.js client version, run:

```sh
npm i @clickhouse/client
```

Web version installation:

```sh
npm i @clickhouse/client-web
```

## Compatibility with ClickHouse

| Client version | ClickHouse   |
|----------------|--------------|
| 0.2.6          | 22.8 - 23.10 |

## ClickHouse Client API

Most of the examples should be compatible with both Node.js and web versions of the client, unless explicitly stated otherwise.

#### Creating a client instance

You can instantiate as many client instances as necessary with `createClient` factory.

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

A client instance can be [pre-configured](#configuration) during instantiation.

#### Configuration

When creating a client instance, the following connection settings can be adjusted:

- **host?: string** - a ClickHouse instance URL. Default value: `http://localhost:8123`
- **request_timeout?: number** - the request timeout in milliseconds. Default value: `30_000`.
- **compression?: { response?: boolean; request?: boolean }** - enable compression. [Compression docs](#compression)
- **username?: string** - The name of the user on whose behalf requests are made. Default value: `default`.
- **password?: string** - The user password. Default: `''`.
- **application?: string** - The name of the application using the Node.js client. Default value: `clickhouse-js`.
- **database?: string** - Database name to use. Default value: `default`
- **clickhouse_settings?: ClickHouseSettings** - ClickHouse settings to apply to all requests. Default value: `{}`.
- **log?: { LoggerClass?: Logger, level?: ClickHouseLogLevel }** - configure logging. [Logging docs](#logging)
- **session_id?: string**  - optional ClickHouse Session ID to send with every request.

#### Node.js-specific configuration parameters

- **max_open_connections?: number** - maximum number of sockets to allow per host. Default value: `Infinity`.
- **tls?: { ca_cert: Buffer, cert?: Buffer, key?: Buffer }** - configure TLS certificates. [TLS docs](#tls-certificates)
- **keep_alive?: { enabled?: boolean, socket_ttl?: number, retry_on_expired_socket?: boolean }** - See [Keep Alive docs](#keep-alive)

### Connecting

#### Gather your connection details

<ConnectionDetails />

The client implements a connection via HTTP(s) protocol.
The ClickHouse binary protocol is not supported yet.

The following example demonstrates how to set up a connection against ClickHouse Cloud. It assumes `host` (including
protocol and port) and `password` values are specified via environment variables, and `default` user is used.

**Example:** Node.js Client instance
creation using environment variables. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping_cloud.ts).

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  host: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

#### Connection pool (Node.js only)

To avoid the overhead of establishing a connection on every request, the client creates a pool of connections to
ClickHouse to reuse. By default, the size of connection pool is not limited, but you can change it
with `max_open_connections` [configuration option](#configuration).
There is no guarantee the same connection in a pool will be used for subsequent queries unless the user
sets `max_open_connections: 1`. This is rarely needed but may be required for cases where users are using temporary
tables.

### Query ID

Every method that sends an actual query (`command`, `exec`, `insert`, `select`) will provide `query_id` in the result.

This unique identifier is assigned by the client per query, and might be useful to fetch the data from `system.query_log`,
if it is enabled in the [server configuration](https://clickhouse.com/docs/en/operations/server-configuration-parameters/settings#server_configuration_parameters-query-log).

If necessary, `query_id` can be overridden by the user in `command`/`query`/`exec`/`insert` methods params.

NB: if you override `query_id`, ensure its uniqueness for every call.

### Query method

Used for most statements that can have a response, such as `SELECT`, or for sending DDLs such as `CREATE TABLE`.
Please consider using the dedicated method [insert](#insert-method) for data insertion 
or [command](#command-method) for DDLs.

Should be awaited. The returned result set is expected to be consumed in the application.

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

Node.js ResultSet implementation uses `Stream.Readable` under the hood, while the web version uses Web API `ReadableStream`.

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

  // Returns a readable stream for responses that can be streamed (i.e. all except JSON)
  // Every iteration over the stream provides an array of Row[] in the selected DataFormat
  // Should be called only once
  // NB: if called for the second time, the second stream will be just empty
  stream(): Stream
}

interface Row {
  // Get the content of the row as a plain string
  text: string

  // Parse the content of the row as a JS object
  json<T>(): T
}
```

**Example:** (Node.js/Web) A query with a resulting dataset as `json` in `JSONEachRow` format. 
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json()
```

**Example:** (Node.js only) A query with a resulting dataset as a stream of objects in `JSONEachRow`
format consumed using classic `on('data')` approach. 
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_on_data.ts)

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

**Example:** (Node.js only) A query with a resulting dataset as a stream of objects in `JSONEachRow`
format consumed using `for await const` syntax. 
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/select_streaming_for_await.ts).

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

**Example:** (Web only) Iteration over the `ReadableStream` of objects

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

The primary method for data insertion.
Does not return anything aside from `query_id` - the response stream is immediately destroyed.

```ts
export interface InsertResult {
  query_id: string
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

#### Insert streaming in Node.js

It can work with both `Stream.Readable` (all formats except `JSON`) and
plain `Array<T>` (`JSON*` family formats only). It is recommended to avoid arrays in case of large inserts to reduce
application memory consumption and consider streaming for most of the use cases.

When inserting arrays or finite streams (for examples, files) - should be awaited when called.
When working with endless streams (could be the case when it's used with a message broker),
the other approach is possible - see one of the examples below.

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
```

:::important
A request canceled with `abort_signal` does not guarantee that data insertion did not take place.
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

**Example:** (Node.js only) Endless stream - periodically insert objects into the stream. 
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/endless_flowing_stream_json.ts).

```ts
const stream = new Stream.Readable({ objectMode: true, read() {} });

// note that we do not await the promise yet
const insertPromise = client
  .insert({
    table: tableName,
    values: stream,
    format: 'CSV',
  })
  .then(() => console.info('\nData ingestion is finished'))

// Periodically generate some random data and push it into the stream...
const timer = setInterval(pushData(stream), 100)

// When Ctrl+C is pressed...
async function cleanup() {
  clearInterval(timer)
  // finally, close the stream
  stream.push(null)
  // when the stream is closed, the insert promise should be awaited
  await insertPromise
  await client.close()
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

function pushData(stream: Stream.Readable) {
  return () => {
    console.info('Pushing several records into the stream...')
    stream.push({ id: `${randomInt(1, 100_000_000)}`})
  }
}
```

**Example:** (Node.js only) Insert a stream of strings in CSV format from a CSV file. 
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_file_stream_csv.ts).

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

If you have a custom INSERT statement that is difficult to model with this method, consider using [command](#command-method)

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
  // Recommended for cluster usage to avoid situations
  // where a query processing error occurred after the response code
  // and HTTP headers were sent to the client.
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
A request cancelled with `abort_signal` does not guarantee that statements wasn't executed by server.
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

**Example:** (Node.js/Web) Ping a ClickHouse server instance. 
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping_cloud.ts).

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

If you specify `format` as one of the JSON-family (`JSONEachRow`, `JSONCompactEachRow`, etc.), the client will serialize
and deserialize data during the communication over the wire.

Data provided in the text formats (`CSV`, `TabSeparated` and `CustomSeparated` families) are sent over the wire without
additional transformations.

| Format                                     | Input (array) | Input (stream) | Input (object) | Output (JSON) | Output (text)  |
|--------------------------------------------|---------------|----------------|----------------|---------------|----------------|
| JSON                                       | ❌             | ❌              | ✔️             | ✔️            | ✔️             |
| JSONObjectEachRow                          | ❌             | ❌              | ✔️             | ✔️            | ✔️             |
| JSONStrings                                | ❌             | ❌              | ✔️             | ✔️            | ✔️             |
| JSONCompact                                | ❌             | ❌              | ✔️             | ✔️            | ✔️             |
| JSONCompactStrings                         | ❌             | ❌              | ❌              | ✔️            | ✔️             |
| JSONColumnsWithMetadata                    | ❌             | ❌              | ✔️             | ✔️            | ✔️             |
| JSONEachRow                                | ✔️            | ✔️             | ❌              | ✔️            | ✔️             |
| JSONStringsEachRow                         | ✔️            | ✔️             | ❌              | ✔️            | ✔️             |
| JSONCompactEachRow                         | ✔️            | ✔️             | ❌              | ✔️            | ✔️             |
| JSONCompactStringsEachRow                  | ✔️            | ✔️             | ❌              | ✔️            | ✔️             |
| JSONCompactEachRowWithNames                | ✔️            | ✔️             | ❌              | ✔️            | ✔️             |
| JSONCompactEachRowWithNamesAndTypes        | ✔️            | ✔️             | ❌              | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNames         | ✔️            | ✔️             | ❌              | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔️            | ✔️             | ❌              | ✔️            | ✔️             |
| CSV                                        | ❌             | ✔️             | ❌              | ❌             | ✔️             |
| CSVWithNames                               | ❌             | ✔️             | ❌              | ❌             | ✔️             |
| CSVWithNamesAndTypes                       | ❌             | ✔️             | ❌              | ❌             | ✔️             |
| TabSeparated                               | ❌             | ✔️             | ❌              | ❌             | ✔️             |
| TabSeparatedRaw                            | ❌             | ✔️             | ❌              | ❌             | ✔️             |
| TabSeparatedWithNames                      | ❌             | ✔️             | ❌              | ❌             | ✔️             |
| TabSeparatedWithNamesAndTypes              | ❌             | ✔️             | ❌              | ❌             | ✔️             |
| CustomSeparated                            | ❌             | ✔️             | ❌              | ❌             | ✔️             |
| CustomSeparatedWithNames                   | ❌             | ✔️             | ❌              | ❌             | ✔️             |
| CustomSeparatedWithNamesAndTypes           | ❌             | ✔️             | ❌              | ❌             | ✔️             |
| Parquet                                    | ❌             | ✔️             | ❌              | ❌             | ✔️❗- see below |

For Parquet, the main use case for selects likely will be writing the resulting stream into a file.
See [the example](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts) 
in the client repository.

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

The entire list of supported ClickHouse formats is available 
[here](https://clickhouse.com/docs/en/sql-reference/data-types/).

### Date* / DateTime\* types caveats

Since the client inserts values without additional type conversion, `Date*` type columns can only be inserted as
strings and not as Unix time epochs. It might be changed with the future ClickHouse database releases.

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

### Decimal\* types caveats

Since the client performs no additional type conversion, it is not possible to insert `Decimal*` type columns as
strings, only as numbers. This is a suboptimal approach as it might end in float precision loss. Thus, it is recommended
to avoid `JSON*` formats when using `Decimals` as of now. Consider `TabSeparated*`, `CSV*` or `CustomSeparated*` formats
families for that kind of workflows.

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
with [`output_format_json_quote_64bit_integers` setting](/docs/en/operations/settings/settings-formats.md/#output_format_json_quote_64bit_integers)
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
[here](https://github.com/ClickHouse/clickhouse-js/blob/730b1b2516e2d47dc9a32b1d8d0b8ba8ceb95ead/src/settings.ts).

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
- `data type` - [Data type](https://clickhouse.com/docs/en/sql-reference/data-types/) of the app parameter value.

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

NB: request compression is currently not available in the web version. Response compression works as normal.

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

### Logging (Node.js only)

:::important
The logging is an experimental feature and is subject to change in the future.
:::

The default logger implementation emits log records into `stdout` via `console.debug/info/warn/error` methods.
You can customize the logging logic via providing a `LoggerClass`, and choose the desired log level via `level` parameter (default is `OFF`):

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
    level: ClickHouseLogLevel
  }
})
```

Check an example implementation
[here](https://github.com/ClickHouse/clickhouse-js/blob/3aad886231e93c982b0c6e552c87ce7fa72c2caf/__tests__/utils/test_logger.ts#L4-L17).

## TLS certificates (Node.js only)

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

## Keep Alive (Node.js only)

By default, client enables Keep-Alive in the underlying HTTP agent. 
If you are experiencing `socket hang up` errors, there are several options to resolve this issue:

* Increase the value of the [keep_alive_timeout](/docs/en/operations/server-configuration-parameters/settings.md/#keep-alive-timeout) ClickHouse server setting in `config.xml`, as by default it could be as little as 3s.
This could help if your application idles for slightly more than the default server setting. 
However, it is not always possible to increase it (for example, no access to server's `config.xml`), 
and this setting shouldn't be increased to unreasonable values, 
and even then a particular request can happen at an unfortunate timing.
Expired socket detection feature can help in such situations.

* Enable expired socket detection and retry mechanism in the client:
```ts
const client = createClient({
  keep_alive: {
    enabled: true,
    // should be slightly less than the `keep_alive_timeout` setting in server's `config.xml`
    // default is 3s there, so 2500 milliseconds seems to be a safe client value in this scenario
    // another example: if your configuration has `keep_alive_timeout` set to 60s, you could put 59_000 here
    socket_ttl: 2500,
    // default: false
    retry_on_expired_socket: true,
  },
})
```
If a potentially expired socket is detected (more than `socket_ttl` since that idle socket was used), 
and retry is enabled in the configuration, both socket and request will be immediately destroyed 
(before sending the data), and the client will recreate the request. 
Note that `socket_ttl` should be slightly less than the server `keep_alive_timeout` setting to make it work.
If `socket_ttl` is configured appropriately, it should resolve `socket hang up` issues in a reliable way.

* As a last resort, it is possible to disable Keep-Alive feature entirely:
```ts
const client = createClient({
  keep_alive: {
    enabled: false,
  },
})
```

## Known limitations (Node.js/Web)

- There are no data mappers for the result sets, so only language primitives are used.
- There are some [Decimal* and Date\* / DateTime\* data types caveats](#date--datetime-types-caveats).
- [Nested](/docs/en/sql-reference/data-types/nested-data-structures/index.md) data type is currently not officially
  supported.
- [Response compression](#compression) must be [disabled](https://github.com/ClickHouse/clickhouse-js/issues/157#issuecomment-1546005694) when using [Live Views](/docs/en/sql-reference/statements/create/view.md/#live-view-experimental)

## Known limitations (Web)

- Streaming for select queries works, but it is disabled for inserts (on the type level as well).
- KeepAlive is disabled and not configurable yet.
- Request compression is disabled and configuration is ignored. Response compression works.
- No logging support yet.

## Tips for performance optimizations

- To reduce application memory consumption, consider using streams for large inserts and selects when applicable.
- Node.js HTTP(s) Agent has [infinite max open sockets](https://nodejs.org/api/http.html#agentmaxsockets) by default. In
  some cases, you might want to limit that by using `ClickHouseClientConfigOptions.max_open_connections` setting.
- The client enable compression for `query` responses by default, but `insert` compression is disabled. When using large
  inserts, you might want to enable request compression as well. You can
  use `ClickHouseClientConfigOptions.compression.request` for that.
- Compression has some performance penalty. As it is enabled by default for responses, you might consider disabling it
  if you need to speed the selects up, but, on the other hand, it comes with a cost of network traffic increase.
