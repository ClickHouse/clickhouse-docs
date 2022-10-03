---
sidebar_label: Nodejs
sidebar_position: 1
keywords: [clickhouse, nodejs, client, connect, integrate]
slug: /en/integrations/language-clients/nodejs
description: The official Node.js client for connecting to ClickHouse.
---

# ClickHouse JS
The official Node.js client for connecting to ClickHouse.
The client is written in TypeScript and provides typings for the client public API.

## Environment requirements
The nodejs must be available in the environment to run the client.
The client is compatible with all the [maintained](https://github.com/nodejs/release#readme) nodejs LTS versions: `v14.x` and `v16.x`.

As soon as a nodejs version approaches End-Of-Life, the client drops support for the outdated insecure nodejs version.

*Note*: The Browser environment is not officially supported at the moment.

## Installation
To install the latest available client version, run:
```sh
npm i @clickhouse/client
```
## Support policy
Clients provide forward compatibility with all the ClickHouse versions released in the following **2 years** from the client release date.
The clients also provide backward compatibility with all the ClickHouse versions supported when a client was released, which maps to 3 latest `stable` and max 2 `lts` releases.

## Compatibility with ClickHouse
| Client version | ClickHouse     |
| -------------- | -------------- |
| 0.0.1 - 0.0.4  | 22.8, 22.9     |

## ClickHouse Client API
#### Creating a client instance
You can instantiate as many client instances as necessary with `createClient` factory.
```js
import { createClient } from '@clickhouse/client'
const client = createClient(/* configuration */);
```
A client instance can be [pre-configured](#configuration) during instantiation.

#### Configuration
When creating a client instance, the following connection settings can be adjusted:
- **host?: string** - a ClickHouse instance URL. Default value: `http://localhost:8123`
- **connect_timeout?: number** - the timeout to setup a connection in milliseconds. Default value: `10_000`.
- **request_timeout?: number** - the request timeout in milliseconds. Default value: `30_000`.
- **max_open_connections?: number** - maximum number of sockets to allow per host. Default value: `Infinity`.
- **compression?: { response?: boolean; request?: boolean }** - enable compression. [Compression docs](#compression)

- **username?: string** - The name of the user on whose behalf requests are made. Default value: `default`.
- **password?: string** - The user password. Default: `''`.
- **application?: string** - The name of the application using the nodejs client. Default value: `clickhouse-js`.
- **database?: string** - Database name to use. Default value: `default`
- **clickhouse_settings?: ClickHouseSettings** - ClickHouse settings to apply to all requests. Default value: `{}`.
- **log?: Log** - configure logging. [Logging docs](#logging)

### Connecting
The client implements a connection via HTTP(s) protocol.
The ClickHouse binary protocol is not supported yet.

The following example demonstrates how to set up a connection against ClickHouse Cloud. It assumes `host` (including protocol and port) and `password` values are specified via environment variables, and `default` user is used.

**Example** Client instance creation. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping_cloud.ts).
```js
import { createClient } from '@clickhouse/client'
const client = createClient({
  host: process.env.CLICKHOUSE_HOST ?? 'https://localhost:8443',
  user: process.env.CLICKHOUSE_USER ?? 'default'
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

#### Connection pool
To avoid the overhead of establishing a connection on every request, the client creates a pool of connections to ClickHouse to reuse. By default, the size of connection pool is not limited, but you can change it with `max_open_connections` [configuration option](#configuration).
There is no guarantee the same connection in a pool will be used for subsequent queries unless the user sets `max_open_connections: 1`. This is rarely needed but may be required for cases where users are using temporary tables.

### Execution

It can be used for statements that do not have any output, when the format clause is not applicable, or when you are not interested in the response at all. An example of such a statement can be `CREATE TABLE` or `ALTER TABLE`.

Should be awaited.

Optionally, it returns a readable stream that can be consumed on the application side if you need it for some reason. But in that case, you might consider using [query](#query) instead.

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
}

class ClickHouseClient {
  exec(params: ExecParams): Promise<Stream.Readable> {}
}
```
:::caution
A request cancelled with `abort_signal` does not guarantee that DDL wasn't executed by server.
:::

**Example** Create a table in ClickHouse Cloud. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts).
```js
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

**Example** Create a table in a self-hosted ClickHouse instance. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_single_node.ts).
```js
await client.exec({
  query: `
    CREATE TABLE IF NOT EXISTS my_table
    (id UInt64, name String)
    ENGINE MergeTree()
    ORDER BY (id)
  `,
})
```

### Insert

The primary method for data insertion. It can work with both `Stream.Readable` (all formats except `JSON`) and plain `Array<T>` (`JSON*` family formats only). It is recommended to avoid arrays in case of large inserts to reduce application memory consumption and consider streaming for most of the use cases.

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
}

class ClickHouseClient {
  insert(params: InsertParams): Promise<void> {}
}
```
:::caution
A request canceled with `abort_signal` does not guarantee that data insertion did not take place.
:::

**Example** Insert an array of values. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).
```js
await client.insert({
  table: 'my_table,
  // structure should match the desired format, JSONEachRow in this example
  values: [
    { id: 42, name: 'foo' },
    { id: 42, name: 'bar' },
  ],
  format: 'JSONEachRow',
})
```


**Example** Insert a stream of objects. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_json_stream.ts).
```js
const stream = new Stream.Readable({ objectMode: true, ... });
stream.push({ id: '42' })
setTimeout(function closeStream() { stream.push(null) }, 100)
await client.insert({
  table: 'my_table',
  values: stream,
  format: 'JSONCompactEachRow',
})
```

**Example** Insert a stream of strings in CSV format from a CSV file. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_file_stream_csv.ts).
```js
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

### Query
Used for most statements that can have a response, such as `SELECT`, or for sending DDLs such as `CREATE TABLE`.
Please consider using the dedicated method [insert](#insert) for data insertion.

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
}

class ClickHouseClient {
  query(params: QueryParams): Promise<Rows> {}
}
```
:::tip
Do not specify the FORMAT clause in `query`, use `format` parameter instead.
:::

#### Rows response abstraction

Provides several convenience methods for data processing in your application.

```ts
class Rows {
  // Consume the entire stream and get the contents as a string
  // Can be used with any DataFormat
  // Should be called only once
  text(): Promise<string> {}
  // Consume the entire stream and get the contents as a JS object
  // Can be used only with JSON formats
  // Should be called only once
  json<T>(): Promise<T> {}
  // Returns a readable stream of Row instances for responses that can be streamed (i.e. all except JSON)
  // Should be called only once
  // NB: if called for the second time, the second stream will be just empty
  stream(): Stream.Readable {}
}

class Row {
  // Get the content of the row as a plain string
  text(): string {}
  // Get the content of the row as a JS object
  json<T>(): T {}
}
```
**Example** A query with a resulting dataset as `json` in `JSONEachRow` format. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts).
```js
const rows = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await rows.json()
```

**Example** A query with a resulting dataset as a stream of objects in `JSONEachRow` format. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/select_streaming.ts).
```js
const rows = await client.query({
  query: 'SELECT number FROM system.numbers LIMIT 10',
  format: 'JSONEachRow',
})
for await (const row of rows.stream()) {
  console.log(row.json())
}
```

### Ping

The `ping` method provided to check the connectivity stasus returns `true` if the server can be reached. It can throw a standard Node.js Error such as `ECONNREFUSED`.

```ts
class ClickHouseClient {
  ping(): Promise<boolean> {}
}
```
**Example** Ping a ClickHouse server instance. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping_cloud.ts).
```js
const isAlive = await client.ping();
```

### Close
Closes all the open connections and releases resources.
```js
await client.close()
```

## Supported Data formats
The client handles data formats as JSON or text.

If you specify `format` as one of the JSON-family (`JSONEachRow`, `JSONCompactEachRow`, etc.), the client will serialize and deserialize data during the communication over the wire.

Data provided in the text formats (`CSV`, `TabSeparated` and `CustomSeparated` families) are sent over the wire without additional transformations.

| Format                                     | Input (array) | Input (stream) | Output (JSON) | Output (text) |
| ------------------------------------------ | ------------- | -------------- | ------------- | ------------- |
| [JSON](https://clickhouse.com/docs/en/interfaces/formats/#json)| ❌| ❌| ✔️| ✔️|
| [JSONEachRow](https://clickhouse.com/docs/en/interfaces/formats/#jsoneachrow)| ✔️  ✔️ | ✔️| ✔️|
| [JSONStringsEachRow](https://clickhouse.com/docs/en/interfaces/formats/#jsonstringseachrow)| ✔️| ✔️ | ✔️| ✔️|
| [JSONCompactEachRow](https://clickhouse.com/docs/en/interfaces/formats/#jsoncompacteachrow)| ✔️| ✔️ | ✔️| ✔️|
| [JSONCompactStringsEachRow](https://clickhouse.com/docs/en/interfaces/formats/#jsoncompactstringseachrow)| ✔️| ✔️ | ✔️| ✔️|
| [JSONCompactEachRowWithNames](https://clickhouse.com/docs/en/interfaces/formats/#jsoncompacteachrowwithnames)| ✔️| ✔️ | ✔️| ✔️|
| [JSONCompactEachRowWithNamesAndTypes](https://clickhouse.com/docs/en/interfaces/formats/#jsoncompacteachrowwithnamesandtypes)| ✔️| ✔️ | ✔️| ✔️|
| [JSONCompactStringsEachRowWithNames](https://clickhouse.com/docs/en/interfaces/formats/#jsoncompactstringseachrowwithnames)| ✔️| ✔️ | ✔️| ✔️|
| [JSONCompactStringsEachRowWithNamesAndTypes](https://clickhouse.com/docs/en/interfaces/formats/#jsoncompactstringseachrowwithnamesandtypes)| ✔️| ✔️ | ✔️| ✔️|
| [CSV](https://clickhouse.com/docs/en/interfaces/formats/#csv)| ❌| ✔️ | ❌| ✔️|
| [CSVWithNames](https://clickhouse.com/docs/en/interfaces/formats/#csvwithnames)| ❌| ✔️ | ❌| ✔️|
| [CSVWithNamesAndTypes](https://clickhouse.com/docs/en/interfaces/formats/#csvwithnamesandtypes)| ❌| ✔️ | ❌| ✔️|
| [TabSeparated](https://clickhouse.com/docs/en/interfaces/formats/#tabseparated)| ❌| ✔️ | ❌| ✔️|
| [TabSeparatedRaw](https://clickhouse.com/docs/en/interfaces/formats/#tabseparatedraw)| ❌| ✔️ | ❌| ✔️|
| [TabSeparatedWithNames](https://clickhouse.com/docs/en/interfaces/formats/#tabseparatedwithnames)| ❌| ✔️ | ❌| ✔️|
| [TabSeparatedWithNamesAndTypes](https://clickhouse.com/docs/en/interfaces/formats/#tabseparatedwithnamesandtypes)| ❌| ✔️ | ❌| ✔️|
| [CustomSeparated](https://clickhouse.com/docs/en/interfaces/formats/#format-customseparated)| ❌| ✔️ | ❌| ✔️|
| [CustomSeparatedWithNames](https://clickhouse.com/docs/en/interfaces/formats/#customseparatedwithnames)| ❌| ✔️ | ❌| ✔️|
| [CustomSeparatedWithNamesAndTypes](https://clickhouse.com/docs/en/interfaces/formats/#customseparatedwithnamesandtypes)| ❌| ✔️ | ❌| ✔️|

The entire list of ClickHouse input and output formats is available [here](https://clickhouse.com/docs/en/interfaces/formats).

## Supported ClickHouse data types
| Type           | Status         | JS type                               |
| -------------- | -------------- | ------------------------------------- |
| UInt8/16/32    | ✔️              | number                                |
| UInt64/128/256 | ✔️❗- see below | string                                |
| Int8/16/32     | ✔️              | number                                |
| Int64/128/256  | ✔️❗- see below | string                                |
| Float32/64     | ✔️              | number                                |
| Decimal        | ✔️❗- see below | number                                |
| Boolean        | ✔️              | boolean                               |
| String         | ✔️              | string                                |
| FixedString    | ✔️              | string                                |
| UUID           | ✔️              | string                                |
| Date32/64      | ✔️❗- see below | string                                |
| DateTime32/64  | ✔️❗- see below | string                                |
| Enum           | ✔️              | string                                |
| LowCardinality | ✔️              | string                                |
| Array(T)       | ✔️              | T[]                                   |
| JSON           | ✔️              | object                                |
| Nested         | ❌              | -                                     |
| Tuple          | ✔️              | Tuple                                 |
| Nullable(T)    | ✔️              | JS type for T or null                 |
| IPv4           | ✔️              | string                                |
| IPv6           | ✔️              | string                                |
| Point          | ✔️              | [ number, number ]                    |
| Ring           | ✔️              | Array\<Point\>                        |
| Polygon        | ✔️              | Array\<Ring\>                         |
| MultiPolygon   | ✔️              | Array\<Polygon\>                      |
| Map(K, V)      | ✔️              | Record\<K, V\>                        |

The entire list of supported ClickHouse formats is available [here](https://clickhouse.com/docs/en/sql-reference/data-types/).

### Date* / DateTime* types caveats
Since the client inserts values without additional type conversion, `Date\*` type columns can only be inserted as strings and not as Unix time epochs. It might be changed with the future ClickHouse database releases.

**Example** Insert a `Date` type value. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts).
```js
await client.insert({
  'my_table',
  values: [{ date: '2022-09-05' }],
  format: 'JSONEachRow',
})
```

### Decimal\* types caveats
Since the client performs no additional type conversion, it is not possible to insert `Decimal*` type columns as strings, only as numbers. This is a suboptimal approach as it might end in float precision loss. Thus, it is recommended to avoid `JSON*` formats when using `Decimals` as of now. Consider `TabSeparated*`, `CSV*` or `CustomSeparated*` formats families for that kind of workflows.

**Example** Insert a `Decimal` type value. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/c1b70c82f525c39edb3ca1ee05cb5e6b43dba5b3/__tests__/integration/data_types.test.ts#L98-L131).
```js
await client.insert({
  'my_table',
  values: [{ decimal: '1234567891234567891234567891.1234567891' }],
  format: 'JSONEachRow',
})
```

### Integral types: Int64, Int128, Int256, UInt64, UInt128, UInt256
Though the server can accept it as a number, it is returned as a string in `JSON*` family output formats to avoid integer overflow as max values for these types are bigger than `Number.MAX_SAFE_INTEGER`.

This behavior, however, can be modified with [`output_format_json_quote_64bit_integers` setting](https://clickhouse.com/docs/en/operations/settings/settings/#output_format_json_quote_64bit_integers).

**Example** Adjust the JSON output format for 64bit numbers.
```js
const rows = await client.query({
  query: 'SELECT * from system.numbers LIMIT 1',
  format: 'JSONEachRow',
})

await rows.json() === [{ number: '0' }]

const rows = await client.query({
  query: 'SELECT * from system.numbers LIMIT 1',
  format: 'JSONEachRow',
  clickhouse_settings: { output_format_json_quote_64bit_integers: 0 },
})

await rows.json() === [{ number: 0 }]
```

## ClickHouse settings
The client can adjust ClickHouse behavior via [settings](https://clickhouse.com/docs/en/operations/settings/settings/) mechanism.
The settings can be set on the client instance level so that they will be applied to every request sent to the ClickHouse:
```js
const client = createClient({...
  clickhouse_settings: { ... }
})
```
Or a setting can be configured on a request-level:
```js
client.query({ ...
  clickhouse_settings: { ... }
})
```
A type declaration file with all the supported ClickHouse settings can be found [here](https://github.com/ClickHouse/clickhouse-js/blob/730b1b2516e2d47dc9a32b1d8d0b8ba8ceb95ead/src/settings.ts).

:::caution
Make sure that the user on whose behalf the queries are made has sufficient rights to change the settings.
:::

## Advanced topics
### Queries with parameters
You can create a query with parameters and pass values to them from client application. This allows to avoid formatting query with specific dynamic values on client side.

Format a query as usual, then place the values that you want to pass from the app parameters to the query in braces in the following format:
```
{<name>:<data type>}
```
where:
- `name` — Placeholder identifier.
- `data type` -  [Data type](https://clickhouse.com/docs/en/sql-reference/data-types/) of the app parameter value.

**Example**: Query with parameters. [Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/query_with_parameter_binding.ts).
```js
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
Data applications operating with large datasets over the wire can benefit from enabling compression.

```js
createClient({
  compression: {
    response: true,
    request: true
  }
})
```
Configurations parameters are:
- `response: true` instructs ClickHouse server to respond with compressed response body. Default value: `response: true`. 
- `request: true` enables compression on the client request body. Default value: `request: false`

### Logging

:::caution
The logging is an experimental feature and is subject to change in the future.
:::

You can enable logging for debugging purposes by setting in the client configuration:
```js
createClient({...
  log: { enable: true }
```
The default logger implementation emits log records into `stdout`.
You can customize the logging logic via providing a `LoggerClass`:
```typescript
import type { Logger } from '@clickhouse/client'
class FileLogger implements Logger {...}
createClient({...
  LoggerClass: FileLogger
```
Check an example implementation [here](https://github.com/ClickHouse/clickhouse-js/blob/1977fa466201929a2736bd8ebc442731e0f00d12/__tests__/integration/config.test.ts#L121).

## Known limitations
- Browser environment is not supported.
- There are no data mappers for the result sets, so only language primitives are used.
- There are some [Decimal* and Date* / DateTime\* data types caveats](#date--datetime-types-caveats).
- [Nested](/docs/en/sql-reference/data-types/nested-data-structures/nested.md) data type is currently not officially supported.

## Tips for performance optimizations
- To reduce application memory consumption, consider using streams for large inserts when applicable.
- Node.js HTTP(s) Agent has [infinite max open sockets](https://nodejs.org/api/http.html#agentmaxsockets) by default. In some cases, you might want to limit that by using `ClickHouseClientConfigOptions.max_open_connections` setting.
- The client enable compression for `query` responses by default, but `insert` compression is disabled. When using large inserts, you might want to enable request compression as well. You can use `ClickHouseClientConfigOptions.compression.request` for that.
