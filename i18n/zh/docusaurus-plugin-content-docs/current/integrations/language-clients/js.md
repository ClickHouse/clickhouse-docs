import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# ClickHouse JS

ClickHouse 官方 JS 客户端，用于连接到 ClickHouse。  
客户端是用 TypeScript 编写的，并为客户端公共 API 提供了类型定义。

它没有依赖，经过优化以实现最大性能，并经过各种 ClickHouse 版本和配置的测试（本地单节点、本地集群和 ClickHouse Cloud）。

客户端有两个不同版本可用于不同环境：
- `@clickhouse/client` - 仅限 Node.js
- `@clickhouse/client-web` - 浏览器（Chrome/Firefox）、Cloudflare 工作者

在使用 TypeScript 时，请确保版本至少为 [4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)，这将启用 [内联导入和导出语法](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)。

客户端源代码可以在 [ClickHouse-JS GitHub 仓库](https://github.com/ClickHouse/clickhouse-js) 中找到。

## Environment requirements (Node.js) {#environment-requirements-nodejs}

必须在环境中安装 Node.js 以运行客户端。  
客户端兼容所有 [维护的](https://github.com/nodejs/release#readme) Node.js 版本。

一旦 Node.js 版本接近生命周期结束，客户端将停止对该版本的支持，因为被视为过时和不安全。

当前支持的 Node.js 版本：

| Node.js 版本 | 支持?  |
|---------------|--------|
| 22.x          | ✔      |
| 20.x          | ✔      |
| 18.x          | ✔      |
| 16.x          | 最好努力 |

## Environment requirements (Web) {#environment-requirements-web}

客户端的 Web 版本已通过最新的 Chrome/Firefox 浏览器进行了正式测试，并且可以作为依赖项在 React/Vue/Angular 应用程序或 Cloudflare 工作者中使用。

## Installation {#installation}

要安装最新的 Node.js 客户端稳定版本，请运行：

```sh
npm i @clickhouse/client
```

Web 版本安装：

```sh
npm i @clickhouse/client-web
```

## Compatibility with ClickHouse {#compatibility-with-clickhouse}

| 客户端版本 | ClickHouse |
|------------|------------|
| 1.8.0     | 23.3+      |

客户端可能也能与旧版本兼容；然而，这种支持仅为最佳努力，不保证。如果您使用的是低于 23.3 版本的 ClickHouse，请参阅 [ClickHouse 安全政策](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) 并考虑升级。

## Examples {#examples}

我们希望通过客户端存储库中的 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) 涵盖客户端使用的各种场景。

概述可以在 [示例 README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview) 中找到。

如果在示例或以下文档中有不清楚或缺失的内容，请随时 [联系我们](./js.md#contact-us)。

### Client API {#client-api}

除非另有明确说明，大多数示例应适用于 Node.js 和 Web 版本的客户端。

#### Creating a client instance {#creating-a-client-instance}

您可以使用 `createClient` 工厂创建尽可能多的客户端实例：

```ts
import { createClient } from '@clickhouse/client' // or '@clickhouse/client-web'

const client = createClient({
  /* configuration */
})
```

如果您的环境不支持 ESM 模块，您可以使用 CJS 语法：

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* configuration */
})
```

客户端实例可在实例化期间进行 [预配置](./js.md#configuration)。

#### Configuration {#configuration}

创建客户端实例时，可以调整以下连接设置：

| 设置                                                              | 描述                                                       | 默认值                | 参见                                                                                                 |
|------------------------------------------------------------------|------------------------------------------------------------|----------------------|------------------------------------------------------------------------------------------------------|
| **url**?: string                                                 | ClickHouse 实例 URL。                                     | `http://localhost:8123` | [URL 配置文档](./js.md#url-configuration)                                                             |
| **pathname**?: string                                            | 可选的路径名，在客户端解析 ClickHouse URL 后添加。    | `''`                 | [带路径名的代理文档](./js.md#proxy-with-a-pathname)                                                  |
| **request_timeout**?: number                                     | 请求超时（以毫秒为单位）。                               | `30_000`             | -                                                                                                    |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }` | 启用压缩。                                               | -                    | [压缩文档](./js.md#compression)                                                                        |
| **username**?: string                                            | 发起请求用户的名称。                                      | `default`            | -                                                                                                    |
| **password**?: string                                            | 用户密码。                                               | `''`                 | -                                                                                                    |
| **application**?: string                                         | 使用 Node.js 客户端的应用程序名称。                      | `clickhouse-js`      | -                                                                                                    |
| **database**?: string                                            | 要使用的数据库名称。                                      | `default`            | -                                                                                                    |
| **clickhouse_settings**?: ClickHouseSettings                    | 要应用于所有请求的 ClickHouse 设置。                       | `{}`                 | -                                                                                                    |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 内部客户端日志配置。                                      | -                    | [日志记录文档](./js.md#logging-nodejs-only)                                                          |
| **session_id**?: string                                          | 每个请求可选的 ClickHouse 会话 ID。                        | -                    | -                                                                                                    |
| **keep_alive**?: `{ **enabled**?: boolean }`                   | 在 Node.js 和 Web 版本中默认启用。                       | -                    | -                                                                                                    |
| **http_headers**?: `Record<string, string>`                     | 额外的 HTTP 头用于发出的 ClickHouse 请求。               | -                    | [带身份验证的反向代理文档](./js.md#reverse-proxy-with-authentication)                                |
| **roles**?: string \|  string[]                                  | 附加到发出请求的 ClickHouse 角色名称。                   | -                    | [在 HTTP 接口中使用角色](/interfaces/http#setting-role-with-query-parameters)                         |

#### Node.js-specific configuration parameters {#nodejs-specific-configuration-parameters}

| 设置                                                                  | 描述                             | 默认值      | 参见                                                                                             |
|--------------------------------------------------------------------------|-----------------------------------|-------------|---------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                        | 每个主机允许的最大连接套接字数。   | `10`        | -                                                                                                 |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }` | 配置 TLS 证书。                    | -           | [TLS 文档](./js.md#tls-certificates-nodejs-only)                                                  |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                   | -           | [保持连接配置文档](./js.md#keep-alive-configuration-nodejs-only)                                 |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>     | 客户端的自定义 HTTP 代理。        | -           | [HTTP 代理文档](./js.md#custom-httphttps-agent-experimental-nodejs-only)                          |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>            | 使用基本身份验证凭据设置 `Authorization` 头。 | `true`      | [此设置用法在 HTTP 代理文档中](./js.md#custom-httphttps-agent-experimental-nodejs-only)             |

### URL configuration {#url-configuration}

:::important  
URL 配置 _总是_ 会覆盖硬编码值，并且在这种情况下会记录警告。  
:::

可以通过 URL 配置大多数客户端实例参数。URL 格式为 `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`。在几乎所有情况下，特定参数的名称反映其在配置选项接口中的路径，只有少数例外。支持以下参数：

| 参数                                      | 类型                        |
|--------------------------------------------|-----------------------------|
| `pathname`                                 | 任意字符串                    |
| `application_id`                           | 任意字符串                    |
| `session_id`                               | 任意字符串                    |
| `request_timeout`                          | 非负数                       |
| `max_open_connections`                     | 非负数，大于零               |
| `compression_request`                      | 布尔值。见下文 (1)           |
| `compression_response`                     | 布尔值。                     |
| `log_level`                                | 允许的值：`OFF`、`TRACE`、`DEBUG`、`INFO`、`WARN`、`ERROR`。 |
| `keep_alive_enabled`                       | 布尔值。                     |
| `clickhouse_setting_*` 或 `ch_*`          | 见下文 (2)                   |
| `http_header_*`                            | 见下文 (3)                   |
| (仅限 Node.js) `keep_alive_idle_socket_ttl` | 非负数                       |

- (1) 对于布尔值，有效值为 `true`/`1` 和 `false`/`0`。
- (2) 任何以 `clickhouse_setting_` 或 `ch_` 开头的参数都会去掉该前缀，剩下的部分将添加到客户端的 `clickhouse_settings` 中。例如，`?ch_async_insert=1&ch_wait_for_async_insert=1` 将与以下內容相同：

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

注意：`clickhouse_settings` 的布尔值应在 URL 中传递为 `1`/`0`。

- (3) 与 (2) 类似，但用于 `http_header` 配置。例如，`?http_header_x-clickhouse-auth=foobar` 将等同于：

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```

### Connecting {#connecting}

#### Gather your connection details {#gather-your-connection-details}

<ConnectionDetails />

#### Connection overview {#connection-overview}

客户端通过 HTTP(s) 协议实现连接。RowBinary 支持正在进行中，请参阅 [相关问题](https://github.com/ClickHouse/clickhouse-js/issues/216)。

以下示例演示如何建立与 ClickHouse Cloud 的连接。假设 `url`（包括协议和端口）和 `password` 值是通过环境变量指定的，并使用 `default` 用户。

**示例：** 使用环境变量配置创建 Node.js 客户端实例。

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

客户端仓库包含多个使用环境变量的示例，例如 [在 ClickHouse Cloud 中创建表](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)、[使用异步插入](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) 等。

#### Connection pool (Node.js only) {#connection-pool-nodejs-only}

为了避免在每个请求时建立连接的开销，客户端创建一个连接池以重用，利用 Keep-Alive 机制。默认情况下，Keep-Alive 启用，连接池的大小设置为 `10`，但您可以通过 `max_open_connections` [配置选项](./js.md#configuration) 进行更改。

除非用户将 `max_open_connections` 设置为 `1`，否则不能保证池中的同一连接将用于后续查询。这很少需要，但可能需要在使用临时表的情况下。

另请参见：[保持连接配置](./js.md#keep-alive-configuration-nodejs-only)。

### Query ID {#query-id}

每个发送查询或语句的方式（`command`、`exec`、`insert`、`select`）都会在结果中提供 `query_id`。此唯一标识符由客户端按查询分配，可能对于从 `system.query_log` 获取数据很有用，如果在 [服务器配置](/operations/server-configuration-parameters/settings) 中启用，或者取消长时间运行的查询（见 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)）。如有必要，用户可以在 `command`/`query`/`exec`/`insert` 方法参数中覆盖 `query_id`。

:::tip  
如果您覆盖 `query_id` 参数，则需确保其在每次调用中是唯一的。随机 UUID 是一个不错的选择。  
:::

### Base parameters for all client methods {#base-parameters-for-all-client-methods}

有几个参数可以应用于所有客户端方法（[query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)）。

```ts
interface BaseQueryParams {
  // ClickHouse settings that can be applied on query level.
  clickhouse_settings?: ClickHouseSettings
  // Parameters for query binding.
  query_params?: Record<string, unknown>
  // AbortSignal instance to cancel a query in progress.
  abort_signal?: AbortSignal
  // query_id override; if not specified, a random identifier will be generated automatically.
  query_id?: string
  // session_id override; if not specified, the session id will be taken from the client configuration.
  session_id?: string
  // credentials override; if not specified, the client's credentials will be used.
  auth?: { username: string, password: string }
  // A specific list of roles to use for this query. Overrides the roles set in the client configuration.
  role?: string | Array<string>
}
```

### Query method {#query-method}

这是用于大多数可以有响应的语句，例如 `SELECT`，或用于发送 DDL 语句，例如 `CREATE TABLE`，并应该使用 `await`。预期返回的结果集将在应用程序中被消费。

:::note  
有一个专门的 [insert](./js.md#insert-method) 方法用于数据插入，以及 [command](./js.md#command-method) 方法用于 DDL 语句。  
:::

```ts
interface QueryParams extends BaseQueryParams {
  // Query to execute that might return some data.
  query: string
  // Format of the resulting dataset. Default: JSON.
  format?: DataFormat
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>
}
```

另请参见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

:::tip  
在 `query` 中不要指定 FORMAT 子句，请使用 `format` 参数。  
:::

#### Result set and row abstractions {#result-set-and-row-abstractions}

`ResultSet` 为您的应用程序数据处理提供了几个方便的方法。

Node.js 上的 `ResultSet` 实现底层使用 `Stream.Readable`，而 Web 版本使用 Web API `ReadableStream`。

您可以通过在 `ResultSet` 上调用 `text` 或 `json` 方法来消费 `ResultSet`，并将查询返回的整组行加载到内存中。

您应该尽快开始消费 `ResultSet`，因为它会保持响应流打开，从而使基础连接始终繁忙。客户端不会缓存传入的数据，以避免应用程序潜在的过度内存使用。

或者，如果数据太大以至于无法一次性放入内存，您可以调用 `stream` 方法，以流式模式处理数据。每个响应块将转变为相对较小的行数组，而不是（该数组的大小取决于客户端从服务器接收到的特定块的大小，可能会有所不同，以及单个行的大小），每次一个块。

请参阅 [支持的数据格式](./js.md#supported-data-formats) 列表，以确定在您的情况下流式传输的最佳格式。例如，如果您想流式传输 JSON 对象，您可以选择 [JSONEachRow](/sql-reference/formats#jsoneachrow)，每一行将被解析为 JS 对象，或者，可能是更紧凑的 [JSONCompactColumns](/sql-reference/formats#jsoncompactcolumns) 格式，每一行将是一个紧凑的值数组。另请参见：[流式文件](./js.md#streaming-files-nodejs-only)。

:::important  
如果 `ResultSet` 或其流未被完全消费，则将在 `request_timeout` 期间的非活动后销毁。  
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

**示例：**（Node.js/Web）以 `JSONEachRow` 格式进行查询，消费整个流并将内容解析为 JS 对象。  
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // or `row.text` to avoid parsing JSON
```

**示例：**（仅限 Node.js）以 `JSONEachRow` 格式流式查询结果，使用经典的 `on('data')` 方法。这与 `for await const` 语法是等效的。  
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

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

**示例：**（仅限 Node.js）以 `CSV` 格式流式查询结果，使用经典的 `on('data')` 方法。这与 `for await const` 语法是等效的。  
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)。

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

**示例：**（仅限 Node.js）以 `JSONEachRow` 格式流式查询结果，使用 `for await const` 语法消费。这与经典的 `on('data')` 方法是等效的。  
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts)。

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
`for await const` 语法的代码量比 `on('data')` 方法少一些，但可能对性能产生负面影响。  
请参阅 [Node.js 仓库中的此问题](https://github.com/nodejs/node/issues/31979) 以获得更多细节。  
:::

**示例：**（仅限 Web）对对象的 `ReadableStream` 进行迭代。

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

### Insert method {#insert-method}

这是数据插入的主要方法。

```ts
export interface InsertResult {
  query_id: string
  executed: boolean
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

返回类型最小，因为我们不期望从服务器返回任何数据，并立即消耗响应流。

如果插入方法提供了一个空数组，插入语句将不发送到服务器；相反，方法将立即解析为 `{ query_id: '...', executed: false }`。如果此时在方法参数中没有提供 `query_id`，结果中将为空字符串，因为返回由客户端生成的随机 UUID 可能会造成混淆，因为具有此 `query_id` 的查询将不存在于 `system.query_log` 表中。

如果插入语句已发送到服务器，`executed` 标志将为 `true`。

#### Insert method and streaming in Node.js {#insert-method-and-streaming-in-nodejs}

它可以与 `Stream.Readable` 或纯粹的 `Array<T>` 一起工作，具体取决于指定给 `insert` 方法的 [数据格式](./js.md#supported-data-formats)。另请参阅有关 [文件流式传输](./js.md#streaming-files-nodejs-only) 的这一节。

插入方法应使用 `await`；但可以指定输入流，并在流完成后再 `await` 插入操作（这也将解析插入 Promise）。这对于事件侦听器和类似场景可能很有用，但错误处理可能会很复杂，存在很多边缘情况。相反，考虑使用 [异步插入](/optimize/asynchronous-inserts)，如 [此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts) 所示。

:::tip  
如果您有一个难以用该方法建模的自定义 INSERT 语句，请考虑使用 [command method](./js.md#command-method)。 

您可以在 [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) 或 [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) 示例中查看其用法。  
:::

```ts
interface InsertParams<T> extends BaseQueryParams {
  // Table name to insert the data into
  table: string
  // A dataset to insert.
  values: ReadonlyArray<T> | Stream.Readable
  // Format of the dataset to insert.
  format?: DataFormat
  // Allows to specify which columns the data will be inserted into.
  // - An array such as `['a', 'b']` will generate: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - An object such as `{ except: ['a', 'b'] }` will generate: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // By default, the data is inserted into all columns of the table,
  // and the generated statement will be: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

另请参见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

:::important  
使用 `abort_signal` 取消的请求不保证数据插入未发生，因为服务器可能已接收了一些在取消之前流式传输的数据。  
:::

**示例：**（Node.js/Web）插入一个值数组。  
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

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

**示例：**（仅限 Node.js）插入来自 CSV 文件的流。  
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。另请参见：[文件流式传输](./js.md#streaming-files-nodejs-only)。

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**示例**：排除插入语句中的某些列。

给定某些表定义，例如：

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

仅插入特定列：

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

排除某些列：

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

有关更多详细信息，请查看 [源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts)。

**示例**：插入到与提供给客户端实例不同的数据库中。  
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: 'mydb.mytable', // Fully qualified name including the database
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```

#### Web version limitations {#web-version-limitations}

目前，`@clickhouse/client-web` 仅支持使用 `Array<T>` 和 `JSON*` 格式的插入。由于浏览器兼容性差，Web 版本尚不支持插入流。

因此，Web 版本的 `InsertParams` 接口与 Node.js 版本略有不同，因为 `values` 限制为 `ReadonlyArray<T>` 类型：

```ts
interface InsertParams<T> extends BaseQueryParams {
  // Table name to insert the data into
  table: string
  // A dataset to insert.
  values: ReadonlyArray<T>
  // Format of the dataset to insert.
  format?: DataFormat
  // Allows to specify which columns the data will be inserted into.
  // - An array such as `['a', 'b']` will generate: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - An object such as `{ except: ['a', 'b'] }` will generate: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // By default, the data is inserted into all columns of the table,
  // and the generated statement will be: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

这在将来可能会有所变化。另请参见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

### Command method {#command-method}

可用于没有输出的语句，当格式子句不适用，或当您根本不关心响应时。此类语句的示例可以是 `CREATE TABLE` 或 `ALTER TABLE`。

应使用 `await`。

响应流会立即被释放，这意味着底层套接字被释放。

```ts
interface CommandParams extends BaseQueryParams {
  // Statement to execute.
  query: string
}

interface CommandResult {
  query_id: string
}

interface ClickHouseClient {
  command(params: CommandParams): Promise<CommandResult>
}
```

另请参见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

**示例：**（Node.js/Web）在 ClickHouse Cloud 中创建表。  
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)。

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // Recommended for cluster usage to avoid situations where a query processing error occurred after the response code, 
  // and HTTP headers were already sent to the client.
  // See https://clickhouse.com/docs/interfaces/http/#response-buffering
  clickhouse_settings: {
    wait_end_of_query: 1,
  },
})
```

**示例：**（Node.js/Web）在自托管的 ClickHouse 实例中创建表。  
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_single_node.ts)。

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

**示例：**（Node.js/Web）从选择插入数据。

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`,
})
```

:::important  
使用 `abort_signal` 取消的请求不保证服务器没有执行该语句。  
:::

### Exec method {#exec-method}

如果您有一个不适合 `query`/`insert` 的自定义查询，并且您对结果感兴趣，可以使用 `exec` 作为 `command` 的替代方案。

`exec` 返回一个可读流，必须在应用程序端消费或销毁。

```ts
interface ExecParams extends BaseQueryParams {
  // Statement to execute.
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

另请参见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

Node.js 和 Web 版本的流返回类型不同。

Node.js：

```ts
export interface QueryResult {
  stream: Stream.Readable
  query_id: string
}
```

Web：

```ts
export interface QueryResult {
  stream: ReadableStream
  query_id: string
}
```

### Ping {#ping}

`ping` 方法用于检查连通性状态，如果服务器可达，则返回 `true`。

如果服务器不可达，底层错误也会包含在结果中。

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }

interface ClickHouseClient {
  ping(): Promise<PingResult>
}
```

Ping 可能是检查应用程序启动时服务器是否可用的有用工具，特别是对 ClickHouse Cloud，实例可能处于空闲状态，并且在 ping 时会唤醒。

**示例：**（Node.js/Web）Ping 一个 ClickHouse 服务器实例。注意：对于 Web 版本，捕获的错误将有所不同。  
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // process result.error
}
```

注意：由于 `/ping` 端点未实现 CORS，Web 版本使用简单的 `SELECT 1` 来实现类似的结果。

### Close (Node.js only) {#close-nodejs-only}

关闭所有打开的连接并释放资源。Web 版本无操作。

```ts
await client.close()
```

## Streaming files (Node.js only) {#streaming-files-nodejs-only}

客户端仓库中有几个流式文件的示例，数据格式包括 (NDJSON、CSV、Parquet)。

- [从 NDJSON 文件流式传输](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [从 CSV 文件流式传输](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [从 Parquet 文件流式传输](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [流式传输到 Parquet 文件](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

将其他格式流式传输到文件应类似于 Parquet，唯一的区别在于用于 `query` 调用的格式（`JSONEachRow`、`CSV` 等）和输出文件名称。
## 支持的数据格式 {#supported-data-formats}

客户端处理 JSON 或文本格式的数据。

如果您将 `format` 指定为 JSON 家族之一（如 `JSONEachRow`，`JSONCompactEachRow` 等），则客户端将在通信过程中对数据进行序列化和反序列化。

以“原始”文本格式提供的数据（如 `CSV`，`TabSeparated` 和 `CustomSeparated` 家族）会在传输过程中不进行额外的转换。

:::tip
JSON 作为通用格式和 [ClickHouse JSON 格式](/sql-reference/formats#json) 之间可能会产生混淆。

客户端支持使用诸如 [JSONEachRow](/sql-reference/formats#jsoneachrow) 这样的格式传输 JSON 对象（有关其他实时友好格式，请参阅表格概述；另外请参见客户端库中的 `select_streaming_` [示例](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)）。

仅像 [ClickHouse JSON](/sql-reference/formats#json) 这样的格式及少数其他格式以单个对象的形式表示在响应中，因此无法被客户端流式传输。
:::

| 格式                                       | 输入（数组） | 输入（对象） | 输入/输出（流） | 输出（JSON） | 输出（文本）  |
|--------------------------------------------|---------------|----------------|-----------------------|---------------|----------------|
| JSON                                       | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONCompact                                | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONObjectEachRow                          | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONColumnsWithMetadata                    | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONStrings                                | ❌             | ❌️             | ❌                     | ✔️            | ✔️             |
| JSONCompactStrings                         | ❌             | ❌              | ❌                     | ✔️            | ✔️             |
| JSONEachRow                                | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONEachRowWithProgress                    | ❌️            | ❌              | ✔️ ❗- 见下文        | ✔️            | ✔️             |
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
| Parquet                                    | ❌             | ❌              | ✔️                    | ❌             | ✔️❗- 见下文 |

对于 Parquet，选择的主要用例很可能是将结果流写入文件。请查看客户端库中的 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)。

`JSONEachRowWithProgress` 是一种仅输出格式，支持流中的进度报告。有关更多详细信息，请参见 [此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)。

ClickHouse 输入和输出格式的完整列表可以在 
[这里](/interfaces/formats) 找到。
## 支持的 ClickHouse 数据类型 {#supported-clickhouse-data-types}

:::note
相关的 JS 类型对于任何 `JSON*` 格式都是相关的，除了那些将一切表示为字符串的格式（例如 `JSONStringEachRow`）
:::

| 类型               | 状态           | JS 类型                    |
|--------------------|-----------------|----------------------------|
| UInt8/16/32        | ✔️              | number                     |
| UInt64/128/256     | ✔️ ❗- 见下文    | string                     |
| Int8/16/32         | ✔️              | number                     |
| Int64/128/256      | ✔️ ❗- 见下文    | string                     |
| Float32/64         | ✔️              | number                     |
| Decimal            | ✔️ ❗- 见下文    | number                     |
| Boolean            | ✔️              | boolean                    |
| String             | ✔️              | string                     |
| FixedString        | ✔️              | string                     |
| UUID               | ✔️              | string                     |
| Date32/64          | ✔️              | string                     |
| DateTime32/64      | ✔️ ❗- 见下文    | string                     |
| Enum               | ✔️              | string                     |
| LowCardinality     | ✔️              | string                     |
| Array(T)           | ✔️              | T[]                        |
| (新) JSON          | ✔️              | object                     |
| Variant(T1, T2...) | ✔️              | T (取决于变体)           |
| Dynamic            | ✔️              | T (取决于变体)           |
| Nested             | ✔️              | T[]                        |
| Tuple              | ✔️              | Tuple                      |
| Nullable(T)        | ✔️              | JS 类型 T 或 null         |
| IPv4               | ✔️              | string                     |
| IPv6               | ✔️              | string                     |
| Point              | ✔️              | [ number, number ]         |
| Ring               | ✔️              | Array&lt;Point\>              |
| Polygon            | ✔️              | Array&lt;Ring\>               |
| MultiPolygon       | ✔️              | Array&lt;Polygon\>            |
| Map(K, V)          | ✔️              | Record&lt;K, V\>              |

支持的 ClickHouse 格式的完整列表可以在 
[这里](/sql-reference/data-types/) 找到。
### Date/Date32 类型的注意事项 {#datedate32-types-caveats}

由于客户端在插入值时不进行额外的类型转换，`Date`/`Date32` 类型的列只能作为字符串插入。

**示例：** 插入一个 `Date` 类型值。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)。

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

然而，如果您使用的是 `DateTime` 或 `DateTime64` 列，则可以同时使用字符串和 JS Date 对象。可以将 JS Date 对象直接传递给 `insert`，并将 `date_time_input_format` 设置为 `best_effort`。有关更多详细信息，请查看 [此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts)。
### Decimal* 类型的注意事项 {#decimal-types-caveats}

可以使用 `JSON*` 家族格式插入 Decimals。假设我们定义了一个表：

```sql
CREATE TABLE my_table
(
  id     UInt32,
  dec32  Decimal(9, 2),
  dec64  Decimal(18, 3),
  dec128 Decimal(38, 10),
  dec256 Decimal(76, 20)
)
ENGINE MergeTree()
ORDER BY (id)
```

我们可以使用字符串表示法插入值而不损失精度：

```ts
await client.insert({
  table: 'my_table',
  values: [{
    id: 1,
    dec32:  '1234567.89',
    dec64:  '123456789123456.789',
    dec128: '1234567891234567891234567891.1234567891',
    dec256: '12345678912345678912345678911234567891234567891234567891.12345678911234567891',
  }],
  format: 'JSONEachRow',
})
```

但是，在以 `JSON*` 格式查询数据时，ClickHouse 默认将 Decimals 返回为 _数字_，这可能导致精度丢失。为了避免这种情况，您可以在查询中将 Decimals 转换为字符串：

```ts
await client.query({
  query: `
    SELECT toString(dec32)  AS decimal32,
           toString(dec64)  AS decimal64,
           toString(dec128) AS decimal128,
           toString(dec256) AS decimal256
    FROM my_table
  `,
  format: 'JSONEachRow',
})
```

有关更多详细信息，请参见 [此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts)。
### 整数类型：Int64，Int128，Int256，UInt64，UInt128，UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

虽然服务器可以将其接受为数字，但为了避免整数溢出，它以字符串形式返回在 `JSON*` 家族输出格式中，因为这些类型的最大值大于 `Number.MAX_SAFE_INTEGER`。

然而，可以通过 [`output_format_json_quote_64bit_integers` 设置](/operations/settings/formats#output_format_json_quote_64bit_integers) 修改此行为。

**示例：** 调整 64 位数字的 JSON 输出格式。

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
## ClickHouse 设置 {#clickhouse-settings}

客户端可以通过 [settings](/operations/settings/settings/) 机制调整 ClickHouse 的行为。
可以在客户端实例级别设置设置，以便它们将应用于发送到 ClickHouse 的每个请求：

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

或者可以在请求级别配置设置：

```ts
client.query({
  clickhouse_settings: {}
})
```

包含所有支持的 ClickHouse 设置的类型声明文件可以在 
[这里](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts) 找到。

:::important
确保代表用户发出的查询有足够的权限来更改设置。
:::
## 高级主题 {#advanced-topics}
### 带参数的查询 {#queries-with-parameters}

您可以创建带参数的查询，并从客户端应用程序将值传递给它们。这可以避免在客户端侧格式化带特定动态值的查询。

以通常的格式格式化查询，然后将您希望从应用程序参数传递给查询的值放在大括号内，格式如下：

```text
{<name>: <data_type>}
```

其中：

- `name` — 占位符标识符。
- `data_type` - [数据类型](/sql-reference/data-types/) 的应用程序参数值。

**示例：** 带参数的查询。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/query_with_parameter_binding.ts)。

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

请查阅 https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax 获取更多细节。
### 压缩 {#compression}

注意：当前 Web 版本不支持请求压缩。响应压缩正常工作。 Node.js 版本支持两者。

处理大型数据集的应用程序可以通过启用压缩受益。目前仅支持使用 [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html) 的 `GZIP`。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

配置参数为：

- `response: true` 指示 ClickHouse 服务器以压缩响应体返回。默认值：`response: false`
- `request: true` 在客户端请求体上启用压缩。默认值：`request: false`
### 日志记录（仅限 Node.js） {#logging-nodejs-only}

:::important
日志记录是一个实验性功能，并可能在未来发生变化。
:::

默认的日志记录实现通过 `console.debug/info/warn/error` 方法将日志记录输出到 `stdout`。
您可以通过提供一个 `LoggerClass` 自定义日志记录逻辑，并通过 `level` 参数选择所需的日志级别（默认为 `OFF`）：

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

目前，客户端将记录以下事件：

- `TRACE` - 有关 Keep-Alive 套接字生命周期的低级信息
- `DEBUG` - 响应信息（不包含授权头和主机信息）
- `INFO` - 多数情况下不使用，将在客户端初始化时打印当前日志级别
- `WARN` - 非致命错误；失败的 `ping` 请求将作为警告记录，因为返回结果中包含底层错误
- `ERROR` - 来自 `query`/`insert`/`exec`/`command` 方法的致命错误，如失败的请求

您可以在 [这里](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts) 找到默认的 Logger 实现。
### TLS 证书（仅限 Node.js） {#tls-certificates-nodejs-only}

Node.js 客户端可选支持基础（仅证书颁发机构）和互信（证书颁发机构和客户端证书）TLS。

基础 TLS 配置示例，假设您的证书位于 `certs` 文件夹中，并且 CA 文件名为 `CA.pem`：

```ts
const client = createClient({
  url: 'https://<hostname>:<port>',
  username: '<username>',
  password: '<password>', // if required
  tls: {
    ca_cert: fs.readFileSync('certs/CA.pem'),
  },
})
```

使用客户端证书的互信 TLS 配置示例：

```ts
const client = createClient({
  url: 'https://<hostname>:<port>',
  username: '<username>',
  tls: {
    ca_cert: fs.readFileSync('certs/CA.pem'),
    cert: fs.readFileSync(`certs/client.crt`),
    key: fs.readFileSync(`certs/client.key`),
  },
})
```

在库中查看完整的 [基础](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) 和 [互信](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS 示例。
### Keep-Alive 配置（仅限 Node.js） {#keep-alive-configuration-nodejs-only}

客户端默认情况下在底层 HTTP 代理中启用 Keep-Alive，这意味着连接的套接字将在后续请求中重用，并发送 `Connection: keep-alive` 头。空闲的套接字默认将在连接池中保持 2500 毫秒（请参阅 [有关调整此选项的说明](./js.md#adjusting-idle_socket_ttl)）。

`keep_alive.idle_socket_ttl` 的值应远低于服务器/LB 配置。主要原因是由于 HTTP/1.1 允许服务器在未通知客户端的情况下关闭套接字，如果服务器或负载均衡器在客户端之前关闭连接，则客户端可能会尝试重用关闭的套接字，从而导致 `socket hang up` 错误。

如果您要修改 `keep_alive.idle_socket_ttl`，请记住，它应始终与服务器/LB Keep-Alive 配置保持同步，并且应始终低于此，以确保服务器不会首先关闭已打开的连接。
#### 调整 `idle_socket_ttl` {#adjusting-idle_socket_ttl}

客户端将 `keep_alive.idle_socket_ttl` 设置为 2500 毫秒，因为它可以被视为最安全的默认值；在服务器端，`keep_alive_timeout` 可能在 ClickHouse 23.11 之前的版本中设置为 [低至 3 秒](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1)，无需修改 `config.xml`。

:::warning
如果您对性能满意并且没有遇到任何问题，建议**不要**增加 `keep_alive.idle_socket_ttl` 设置的值，因为这可能导致潜在的“套接字挂起”错误；另外，如果您的应用程序发送很多查询并且它们之间没有很长的停顿，默认值应该是足够的，因为套接字不会空闲太长时间，客户端会将其保持在池中。
:::

您可以通过运行以下命令找到正确的 Keep-Alive 超时值：

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

检查响应中的 `Connection` 和 `Keep-Alive` 头的值。例如：

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

在这种情况下，`keep_alive_timeout` 为 10 秒，您可以尝试将 `keep_alive.idle_socket_ttl` 增加到 9000 或甚至 9500 毫秒，以使空闲套接字保持打开状态比默认值更长。请注意潜在的“套接字挂起”错误，这将表明服务器在客户端之前关闭连接，并降低此值直到错误消失。
#### Keep-Alive 故障排除 {#keep-alive-troubleshooting}

如果在使用 Keep-Alive 时遇到 `socket hang up` 错误，可以采取以下选项来解决此问题：

* 在 ClickHouse 服务器配置中略微减少 `keep_alive.idle_socket_ttl` 设置。在某些情况下，例如，客户端和服务器之间的网络延迟很高，减少 `keep_alive.idle_socket_ttl` 200-500 毫秒可能会有益，以排除出站请求可能获取到服务器即将关闭的套接字的情况。

* 如果该错误在没有进出的长时间运行的查询期间发生（例如，长时间运行的 `INSERT FROM SELECT`），这可能是由于负载均衡器关闭空闲连接。您可以通过使用这些 ClickHouse 设置的组合强制在长时间运行的查询期间引入一些数据：

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
     然而，请记住，最近的 Node.js 版本中接收的头总大小限制为 16KB；在我们测试中，接收的进展头的数量超过 70-80 时，会生成异常。

     也可以使用完全不同的方法，完全避免在网络上的等待时间；可以利用 HTTP 接口的“特性”，当连接丢失时，变更不会被取消。有关更多详细信息，请参见 [此示例（第 2 部分）](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts)。

* 可以完全禁用 Keep-Alive 功能。在这种情况下，客户端还会在每个请求中添加 `Connection: close` 头，底层 HTTP 代理将不会重用连接。`keep_alive.idle_socket_ttl` 设置将被忽略，因为将没有空闲套接字。这将导致额外的开销，因为每个请求都会建立新连接。

```ts
const client = createClient({
  keep_alive: {
    enabled: false,
  },
})
```
### 只读用户 {#read-only-users}

在使用具有 [readonly=1 用户](/operations/settings/permissions-for-queries#readonly) 的客户端时，无法启用响应压缩，因为这需要 `enable_http_compression` 设置。以下配置将导致错误：

```ts
const client = createClient({
  compression: {
    response: true, // won't work with a readonly=1 user
  },
})
```

请查看 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)，该示例强调了 readonly=1 用户的限制。
### 带路径名的代理 {#proxy-with-a-pathname}

如果您的 ClickHouse 实例位于代理后面，并且 URL 中有路径名，例如 http://proxy:8123/clickhouse_server，请将 `clickhouse_server` 指定为 `pathname` 配置选项（可以带或不带前导斜杠）；否则，如果直接在 `url` 中提供，它将被视为 `database` 选项。支持多个段，例如 `/my_proxy/db`。

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```
### 带身份验证的反向代理 {#reverse-proxy-with-authentication}

如果您在 ClickHouse 部署前面有一个带有身份验证的反向代理，您可以使用 `http_headers` 设置提供必要的头：

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```
### 自定义 HTTP/HTTPS 代理（实验性，仅限 Node.js） {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
这是一个实验性功能，可能会在未来版本中以向后不兼容的方式发生变化。客户端提供的默认实现和设置应足以满足大多数用例。仅在您确认需要时使用此功能。
:::

默认情况下，客户端将使用客户端配置中提供的设置（例如 `max_open_connections`，`keep_alive.enabled`，`tls`）配置底层 HTTP(s) 代理，这将处理与 ClickHouse 服务器的连接。此外，如果使用了 TLS 证书，将为底层代理配置必要的证书，并强制执行正确的 TLS 授权头。

在 1.2.0 之后，可以向客户端提供自定义 HTTP(s) 代理，以替换默认底层代理。在复杂的网络配置情况下，这可能很有用。如果提供自定义代理，则适用以下条件：
- `max_open_connections` 和 `tls` 选项将 _无效_ 被客户端忽略，因为它们是底层代理配置的一部分。
- `keep_alive.enabled` 将仅调节 `Connection` 头的默认值（`true` -> `Connection: keep-alive`，`false` -> `Connection: close`）。
- 尽管空闲的 Keep-Alive 套接字管理仍将正常工作（因为它不与代理关联，而是与特定套接字相关），但现在可以通过将 `keep_alive.idle_socket_ttl` 值设置为 `0` 来完全禁用它。
#### 自定义代理使用示例 {#custom-agent-usage-examples}

使用不带证书的自定义 HTTP(s) 代理：

```ts
const agent = new http.Agent({ // or https.Agent
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10,
})
const client = createClient({
  http_agent: agent,
})
```

使用基本 TLS 和 CA 证书的自定义 HTTPS 代理：

```ts
const agent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10,
  ca: fs.readFileSync('./ca.crt'),
})
const client = createClient({
  url: 'https://myserver:8443',
  http_agent: agent,
  // With a custom HTTPS agent, the client won't use the default HTTPS connection implementation; the headers should be provided manually
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
  },
  // Important: authorization header conflicts with the TLS headers; disable it.
  set_basic_auth_header: false,
})
```

使用互信 TLS 的自定义 HTTPS 代理：

```ts
const agent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10,
  ca: fs.readFileSync('./ca.crt'),
  cert: fs.readFileSync('./client.crt'),
  key: fs.readFileSync('./client.key'),
})
const client = createClient({
  url: 'https://myserver:8443',
  http_agent: agent,
  // With a custom HTTPS agent, the client won't use the default HTTPS connection implementation; the headers should be provided manually
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
    'X-ClickHouse-SSL-Certificate-Auth': 'on',
  },
  // Important: authorization header conflicts with the TLS headers; disable it.
  set_basic_auth_header: false,
})
```

如果同时使用证书和自定义 HTTPS 代理，可能需要通过设置 `set_basic_auth_header`（在 1.2.0 中引入）禁用默认授权头，因为这与 TLS 头冲突。所有 TLS 头应手动提供。
## 已知限制（Node.js/Web） {#known-limitations-nodejsweb}

- 缺少结果集的数据映射器，因此使用了语言原始类型。计划提供某些数据类型映射器，支持 [RowBinary 格式](https://github.com/ClickHouse/clickhouse-js/issues/216)。
- 有一些 [Decimal* 和 Date* / DateTime* 数据类型的注意事项](./js.md#datedate32-types-caveats)。
- 当使用 `JSON*` 家族格式时，大于 Int32 的数字被表示为字符串，因为 Int64+ 类型的最大值大于 `Number.MAX_SAFE_INTEGER`。有关更多详细信息，请参阅 [整数类型](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) 部分。
## 已知限制（Web） {#known-limitations-web}

- 选择查询的流式处理有效，但插入时禁用（在类型级别也一样）。
- 请求压缩已禁用，配置被忽略。响应压缩有效。
- 暂无日志记录支持。
## 性能优化提示 {#tips-for-performance-optimizations}

- 为减少应用程序内存消耗，考虑在适用时使用流进行大型插入（例如从文件）和选择。对于事件监听器和类似用例，[异步插入](/optimize/asynchronous-inserts) 可能是另一个好的选择，这可以减少，甚至完全避免客户端侧的批量处理。异步插入示例可在 [客户端库](https://github.com/ClickHouse/clickhouse-js/tree/main/examples) 中找到，文件名前缀为 `async_insert_`。
- 客户端默认不启用请求或响应压缩。但是，在选择或插入大型数据集时，您可以考虑通过 `ClickHouseClientConfigOptions.compression` 启用它（仅针对 `request` 或 `response`，或两者）。
- 压缩有显著的性能惩罚。为 `request` 或 `response` 启用压缩会对选择或插入的速度产生负面影响，但会减少应用程序传输的网络流量。
## 联系我们 {#contact-us}

如果您有任何问题或需要帮助，请随时在 [社区 Slack](https://clickhouse.com/slack) (`#clickhouse-js` 频道) 或通过 [GitHub 问题](https://github.com/ClickHouse/clickhouse-js/issues) 联系我们。
