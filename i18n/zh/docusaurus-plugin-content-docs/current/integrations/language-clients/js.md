---
'sidebar_label': 'JavaScript'
'sidebar_position': 4
'keywords':
- 'clickhouse'
- 'js'
- 'JavaScript'
- 'NodeJS'
- 'web'
- 'browser'
- 'Cloudflare'
- 'workers'
- 'client'
- 'connect'
- 'integrate'
'slug': '/integrations/javascript'
'description': '官方 JS 客户端，用于连接到 ClickHouse。'
'title': 'ClickHouse JS'
'doc_type': 'reference'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse JS

官方 JS 客户端用于连接 ClickHouse。
该客户端是用 TypeScript 编写的，并为客户端公共 API 提供了类型定义。

它没有任何依赖，经过优化以获得最佳性能，并与各种 ClickHouse 版本和配置（本地单节点、本地集群和 ClickHouse Cloud）进行了测试。

客户端有两个不同版本可用于不同的环境：
- `@clickhouse/client` - 仅限 Node.js
- `@clickhouse/client-web` - 浏览器（Chrome/Firefox）、Cloudflare 工作器

使用 TypeScript 时，请确保版本至少为 [4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)，这将启用 [内联导入和导出语法](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)。

客户端源代码可在 [ClickHouse-JS GitHub 仓库](https://github.com/ClickHouse/clickhouse-js) 中找到。
## 环境要求 (node.js) {#environment-requirements-nodejs}

在运行客户端的环境中必须有 Node.js。
该客户端与所有 [受支持](https://github.com/nodejs/release#readme) 的 Node.js 版本兼容。

一旦某个 Node.js 版本接近生命周期结束，客户端将停止对此版本的支持，因为它被视为过时和不安全。

当前 Node.js 版本支持：

| Node.js 版本  | 是否支持  |
|-----------------|-------------|
| 22.x            | ✔           |
| 20.x            | ✔           |
| 18.x            | ✔           |
| 16.x            | 最佳努力    |
## 环境要求 (web) {#environment-requirements-web}

客户端的 Web 版本经过官方测试，适用于最新的 Chrome/Firefox 浏览器，可以作为依赖在 React/Vue/Angular 应用程序或 Cloudflare 工作器中使用。
## 安装 {#installation}

要安装最新稳定的 Node.js 客户端版本，请运行：

```sh
npm i @clickhouse/client
```

Web 版本安装：

```sh
npm i @clickhouse/client-web
```
## 与 ClickHouse 的兼容性 {#compatibility-with-clickhouse}

| 客户端版本 | ClickHouse |
|----------------|------------|
| 1.12.0         | 24.8+      |

客户端可能也能与旧版本正常工作；然而，这属于最佳努力支持，不能保证。如果您使用的 ClickHouse 版本低于 23.3，请参阅 [ClickHouse 安全策略](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) 并考虑升级。
## 示例 {#examples}

我们的目标是通过客户端仓库中的 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) 涵盖客户端使用的各种场景。

概述可在 [示例 README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview) 中找到。 

如果示例中有任何不明确或遗漏的内容，或后续文档中有任何不明之处，欢迎您 [与我们联系](./js.md#contact-us)。
### 客户端 API {#client-api}

大多数示例应与客户端的 Node.js 和 Web 版本兼容，除非明确说明相反。
#### 创建客户端实例 {#creating-a-client-instance}

您可以使用 `createClient` 工厂创建必要的多个客户端实例：

```ts
import { createClient } from '@clickhouse/client' // or '@clickhouse/client-web'

const client = createClient({
  /* configuration */
})
```

如果您的环境不支持 ESM 模块，您可以改用 CJS 语法：

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* configuration */
})
```

客户端实例可以在实例化时 [预配置](./js.md#configuration)。
#### 配置 {#configuration}

在创建客户端实例时，可调整以下连接设置：

| 设置                                                                  | 描述                                                                       | 默认值               | 参见                                                                                     |
|--------------------------------------------------------------------------|----------------------------------------------------------------------------|---------------------|------------------------------------------------------------------------------------------|
| **url**?: string                                                         | ClickHouse 实例 URL。                                                     | `http://localhost:8123` | [URL 配置文档](./js.md#url-configuration)                                                 |
| **pathname**?: string                                                    | 可选的路径名，添加到客户端解析 ClickHouse URL 之后的路径。                | `''`                | [带路径名称的代理文档](./js.md#proxy-with-a-pathname)                                    |
| **request_timeout**?: number                                             | 请求超时时间（毫秒）。                                                    | `30_000`            | -                                                                                        |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }`    | 启用压缩。                                                               | -                   | [压缩文档](./js.md#compression)                                                           |
| **username**?: string                                                    | 代表请求发送的用户名称。                                                | `default`           | -                                                                                        |
| **password**?: string                                                    | 用户密码。                                                                | `''`                | -                                                                                        |
| **application**?: string                                                 | 使用 Node.js 客户端的应用程序名称。                                      | `clickhouse-js`     | -                                                                                        |
| **database**?: string                                                    | 要使用的数据库名称。                                                      | `default`           | -                                                                                        |
| **clickhouse_settings**?: ClickHouseSettings                             | 适用于所有请求的 ClickHouse 设置。                                       | `{}`                | -                                                                                        |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 内部客户端日志配置。                                                     | -                   | [日志文档](./js.md#logging-nodejs-only)                                                  |
| **session_id**?: string                                                  | 每个请求发送的可选 ClickHouse 会话 ID。                                  | -                   | -                                                                                        |
| **keep_alive**?: `{ **enabled**?: boolean }`                             | 在 Node.js 和 Web 版本中默认启用。                                         | -                   | -                                                                                        |
| **http_headers**?: `Record<string, string>`                              | 添加到 ClickHouse 请求的额外 HTTP 头。                                   | -                   | [反向代理与身份验证文档](./js.md#reverse-proxy-with-authentication)                      |
| **roles**?: string \|  string[]                                          | 点击 House 角色名称，附加到出站请求。                                  | -                   | [与 HTTP 接口一起使用角色](/interfaces/http#setting-role-with-query-parameters) |
#### Node.js 特定配置参数 {#nodejs-specific-configuration-parameters}

| 设置                                                                    | 描述                                                         | 默认值         | 参见                                                                                              |
|----------------------------------------------------------------------------|------------------------------------------------------------|---------------|-----------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                          | 每个主机允许的最大连接套接字数量。                          | `10`          | -                                                                                                   |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`   | 配置 TLS 证书。                                             | -             | [TLS 文档](./js.md#tls-certificates-nodejs-only)                                                  |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                          | -             | [保持活动配置文档](./js.md#keep-alive-configuration-nodejs-only)                                      |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>       | 客户端的自定义 HTTP 代理。                               | -             | [HTTP 代理文档](./js.md#custom-httphttps-agent-experimental-nodejs-only)                           |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>              | 使用基本身份验证凭据设置 `Authorization` 头。             | `true`        | [在 HTTP 代理文档中该设置使用的说明](./js.md#custom-httphttps-agent-experimental-nodejs-only) |
### URL 配置 {#url-configuration}

:::important
URL 配置将 _始终_ 覆盖硬编码的值，在这种情况下将记录一条警告。
:::

可以通过 URL 配置大多数客户端实例参数。URL 格式为 `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`。在几乎所有情况下，特定参数的名称反映了其在配置选项接口中的路径，但有一些例外。支持以下参数：

| 参数                                   | 类型                                                            |
|---------------------------------------------|-------------------------------------------------------------------|
| `pathname`                                  | 任意字符串。                                                   |
| `application_id`                            | 任意字符串。                                                   |
| `session_id`                                | 任意字符串。                                                   |
| `request_timeout`                           | 非负数。                                                       |
| `max_open_connections`                      | 非负数，大于零。                                             |
| `compression_request`                       | 布尔值。见下文 (1)                                         |
| `compression_response`                      | 布尔值。                                                      |
| `log_level`                                 | 允许的值：`OFF`，`TRACE`，`DEBUG`，`INFO`，`WARN`，`ERROR`。 |
| `keep_alive_enabled`                        | 布尔值。                                                      |
| `clickhouse_setting_*` 或 `ch_*`          | 见下文 (2)                                                    |
| `http_header_*`                             | 见下文 (3)                                                    |
| (仅限 Node.js) `keep_alive_idle_socket_ttl` | 非负数。                                                      |

- (1) 对于布尔值，有效值将是 `true`/`1` 和 `false`/`0`。 
- (2) 任何以 `clickhouse_setting_` 或 `ch_` 开头的参数都将去掉前缀，其余部分会添加到客户端的 `clickhouse_settings` 中。例如，`?ch_async_insert=1&ch_wait_for_async_insert=1` 将与：

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

注意：`clickhouse_settings` 的布尔值应在 URL 中传递为 `1`/`0`。

- (3) 类似于 (2)，但用于 `http_header` 配置。例如，`?http_header_x-clickhouse-auth=foobar` 将等同于：

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```
### 连接 {#connecting}
#### 收集您的连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />
#### 连接概述 {#connection-overview}

客户端通过 HTTP(s) 协议实现连接。RowBinary 支持正在进展中，参见 [相关问题](https://github.com/ClickHouse/clickhouse-js/issues/216)。

以下示例演示如何设置与 ClickHouse Cloud 的连接。假设 `url`（包括协议和端口）和 `password` 通过环境变量指定，并使用 `default` 用户。

**示例：** 使用环境变量为 Node.js 客户端实例创建连接。

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

客户端仓库包含多个使用环境变量的示例，例如 [在 ClickHouse Cloud 中创建表](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)、[使用异步插入](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) 以及其他几个示例。
#### 连接池（仅限 Node.js） {#connection-pool-nodejs-only}

为了避免在每个请求上建立连接的开销，客户端创建一个连接池以重用，利用保持活动机制。默认情况下，保持活动功能是启用的，且连接池的大小设置为 `10`，但您可以通过 `max_open_connections` [配置选项](./js.md#configuration) 更改它。

除非用户将 `max_open_connections` 设置为 `1`，否则没有保证池中的同一连接将用于随后的查询。这种情况很少发生，但在用户使用临时表的情况下可能需要使用。

另见：[保持活动配置](./js.md#keep-alive-configuration-nodejs-only)。
### 查询 ID {#query-id}

每个发送查询或语句的方法（`command`、`exec`、`insert`、`select`）都会在结果中提供 `query_id`。这个唯一标识符由客户端每个查询分配，可能对从 `system.query_log` 中获取数据很有用（如果在 [服务器配置](/operations/server-configuration-parameters/settings) 中启用），或取消长时间运行的查询（参见 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)）。如果必要，用户可以在 `command`/`query`/`exec`/`insert` 方法参数中覆盖 `query_id`。

:::tip
如果您覆盖了 `query_id` 参数，则需要确保每次调用的唯一性。随机 UUID 是一个不错的选择。
:::
### 所有客户端方法的基本参数 {#base-parameters-for-all-client-methods}

有几个参数可适用于所有客户端方法（[query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)）。

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
### 查询方法 {#query-method}

这用于大多数可以响应的语句，例如 `SELECT`，或发送 DDL（如 `CREATE TABLE`）时，并应被等待。返回的结果集预期将在应用程序中使用。

:::note
有一个专门的方法 [insert](./js.md#insert-method) 用于数据插入，以及用于 DDL 的 [command](./js.md#command-method)。
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

另见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

:::tip
不要在 `query` 中指定 FORMAT 子句，请改用 `format` 参数。
:::
#### 结果集和行抽象 {#result-set-and-row-abstractions}

`ResultSet` 提供了多个用于在您的应用程序中处理数据的便捷方法。

Node.js 的 `ResultSet` 实现底层使用 `Stream.Readable`，而 Web 版本则使用 Web API `ReadableStream`。

您可以通过在 `ResultSet` 上调用 `text` 或 `json` 方法来消费 `ResultSet`，并将查询返回的整个行集加载到内存中。

您应尽早开始消费 `ResultSet`，因为它会保持响应流打开，因此会保持底层连接繁忙。为了避免潜在的过度内存使用，客户端不会缓存传入的数据。

另外，如果数据太大而无法一次性放入内存，您可以调用 `stream` 方法，以流模式处理数据。每个响应片段将转换为相对较小的行数组（该数组的大小取决于客户端从服务器接收的特定片段的大小，因为它可能会有所不同，以及每行的大小），一次处理一个片段。

请参阅 [支持的数据格式](./js.md#supported-data-formats) 列表，以确定在您的情况下流式传输的最佳格式。例如，如果您想要流式传输 JSON 对象，您可以选择 [JSONEachRow](/sql-reference/formats#jsoneachrow)，每行将被解析为一个 JS 对象，或者，更紧凑的 [JSONCompactColumns](/sql-reference/formats#jsoncompactcolumns) 格式，将导致每行为值的紧凑数组。另见：[流式文件](./js.md#streaming-files-nodejs-only)。

:::important
如果 `ResultSet` 或其流未被完全消费，它将在 `request_timeout` 不活动期后被销毁。
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

**示例：**（Node.js/Web）以 `JSONEachRow` 格式查询结果数据集，消费整个流并解析内容为 JS 对象。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // or `row.text` to avoid parsing JSON
```

**示例：**（仅限 Node.js）使用经典的 `on('data')` 方法流式查询结果，以 `JSONEachRow` 格式。这可以与 `for await const` 语法互换。 [源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

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

**示例：**（仅限 Node.js）以 `CSV` 格式流式查询结果，使用经典的 `on('data')` 方法。这可以与 `for await const` 语法互换。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)

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

**示例：**（仅限 Node.js）以 `JSONEachRow` 格式作为 JS 对象的流式查询结果，使用 `for await const` 语法消费。这可以与经典的 `on('data')` 方法互换。
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
`for await const` 语法的代码量比 `on('data')` 方法少一些，但它可能会对性能产生负面影响。
有关更多细节，请参阅 [Node.js 仓库中的此问题](https://github.com/nodejs/node/issues/31979)。
:::

**示例：**（仅限 Web）迭代对象的 `ReadableStream`。

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
### 插入方法 {#insert-method}

这是主要的数据插入方法。

```ts
export interface InsertResult {
  query_id: string
  executed: boolean
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

返回类型是最小的，因为我们不期望从服务器返回任何数据，并立即清除响应流。

如果向插入方法提供了空数组，则插入语句不会发送到服务器；相反，方法将立即解析为 `{ query_id: '...', executed: false }`。如果在这种情况下方法参数中没有提供 `query_id`，则结果中的 `query_id` 将是一个空字符串，因为返回客户端生成的随机 UUID 可能会导致混淆，因为该 `query_id` 不会在 `system.query_log` 表中存在。

如果插入语句已发送到服务器，`executed` 标志将为 `true`。
#### 插入方法与 Node.js 中的流式处理 {#insert-method-and-streaming-in-nodejs}

它可以与 `Stream.Readable` 或普通的 `Array<T>` 一起工作，具体取决于指定给插入方法的 [数据格式](./js.md#supported-data-formats)。另见有关 [文件流式处理](./js.md#streaming-files-nodejs-only) 的这一部分。

插入方法应被等待；但是，可以指定一个输入流，并在流完成时等待 `insert` 操作（这也将解析 `insert` 的 Promise）。这可能对事件监听器和类似场景有用，但错误处理可能相对复杂，尤其是在客户端存在很多边缘情况的情况下。相反，考虑使用 [异步插入](/optimize/asynchronous-inserts)，如 [这个示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts) 所示。

:::tip
如果您有一个难以使用此方法建模的自定义 INSERT 语句，可以考虑使用 [command 方法](./js.md#command-method)。 

您可以查看它在 [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) 或 [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) 示例中的用法。
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

另见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

:::important
使用 `abort_signal` 取消的请求无法保证数据未插入，因为服务器可能在取消之前接收了一些流式数据。
:::

**示例：**（Node.js/Web）插入值数组。 
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

**示例：**（仅限 Node.js）从 CSV 文件插入流。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。另见：[文件流式处理](./js.md#streaming-files-nodejs-only)。

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**示例**：从插入语句中排除某些列。

给定某些表的定义如下：

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

有关详细信息，请参阅 [源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts)。

**示例**：插入到一个与提供给客户端实例的数据库不同的数据库中。 [源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: 'mydb.mytable', // Fully qualified name including the database
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```
#### Web 版本限制 {#web-version-limitations}

当前，`@clickhouse/client-web` 的插入仅支持 `Array<T>` 和 `JSON*` 格式。
由于浏览器兼容性差，Web 版本尚不支持插入流。

因此，Web 版本的 `InsertParams` 接口与 Node.js 版本略有不同，因为 `values` 限制为仅 `ReadonlyArray<T>` 类型：

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

未来可能会有所变化。另见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。
### Command 方法 {#command-method}

可以用于没有输出的语句，当格式子句不适用或对响应不感兴趣时。例如语句可以是 `CREATE TABLE` 或 `ALTER TABLE`。

应被等待。

响应流会立即被销毁，这意味着底层套接字会释放。

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

另见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

**示例：**（Node.js/Web）在 ClickHouse Cloud 中创建一个表。 
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

**示例：**（Node.js/Web）在自托管的 ClickHouse 实例中创建一个表。 
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

**示例：**（Node.js/Web）INSERT FROM SELECT

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`,
})
```

:::important
使用 `abort_signal` 取消的请求并不保证服务器没有执行该语句。
:::
### Exec 方法 {#exec-method}

如果您有一个不符合 `query`/`insert` 的自定义查询，并且您对结果感兴趣，可以使用 `exec` 作为 `command` 的替代方法。

`exec` 返回一个可读的流，该流必须在应用程序中被消费或销毁。

```ts
interface ExecParams extends BaseQueryParams {
  // Statement to execute.
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

另见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

流的返回类型在 Node.js 和 Web 版本中不同。

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

提供的 `ping` 方法检查连接状态，如果服务器可以访问，则返回 `true`。

如果服务器无法访问，底层错误也将包含在结果中。

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }

/** Parameters for the health-check request - using the built-in `/ping` endpoint. 
 *  This is the default behavior for the Node.js version. */
export type PingParamsWithEndpoint = {
  select: false
  /** AbortSignal instance to cancel a request in progress. */
  abort_signal?: AbortSignal
  /** Additional HTTP headers to attach to this particular request. */
  http_headers?: Record<string, string>
}
/** Parameters for the health-check request - using a SELECT query.
 *  This is the default behavior for the Web version, as the `/ping` endpoint does not support CORS.
 *  Most of the standard `query` method params, e.g., `query_id`, `abort_signal`, `http_headers`, etc. will work, 
 *  except for `query_params`, which does not make sense to allow in this method. */
export type PingParamsWithSelectQuery = { select: true } & Omit<
  BaseQueryParams,
  'query_params'
>
export type PingParams = PingParamsWithEndpoint | PingParamsWithSelectQuery

interface ClickHouseClient {
  ping(params?: PingParams): Promise<PingResult>
}
```

Ping 可能是一个有用的工具，用于在应用程序启动时检查服务器是否可用，特别是在 ClickHouse Cloud 中，实例可能处于闲置状态并将在 Ping 后唤醒：在这种情况下，您可能希望在之间重试几次，带有延迟。

请注意，默认情况下，Node.js 版本使用 `/ping` 端点，而 Web 版本使用简单的 `SELECT 1` 查询以实现类似的结果，因为 `/ping` 端点不支持 CORS。

**示例：**（Node.js/Web）对 ClickHouse 服务器实例的简单 Ping。注意：对于 Web 版本，捕获的错误将有所不同。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // process result.error
}
```

**示例：**如果您希望在调用 `ping` 方法时检查凭据，或指定额外参数如 `query_id`，则可以如下使用：

```ts
const result = await client.ping({ select: true, /* query_id, abort_signal, http_headers, or any other query params */ });
```

ping 方法将允许大多数标准的 `query` 方法参数 - 参见 `PingParamsWithSelectQuery` 类型定义。
### 关闭 (仅限 Node.js) {#close-nodejs-only}

关闭所有打开的连接并释放资源。在 Web 版本中无操作。

```ts
await client.close()
```
## 流式文件（仅限 Node.js） {#streaming-files-nodejs-only}

客户端仓库中有多个流文件示例，支持流式加载的流行数据格式（NDJSON、CSV、Parquet）。

- [从 NDJSON 文件流式处理](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [从 CSV 文件流式处理](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [从 Parquet 文件流式处理](https://githubHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [流式写入 Parquet 文件](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

流式处理其他格式到文件的过程应该与 Parquet 相似， 唯一的区别将是在 `query` 调用中使用的格式（`JSONEachRow`、`CSV` 等）和输出文件的名称。
## 支持的数据格式 {#supported-data-formats}

客户机处理 JSON 或文本的数据格式。

如果您指定 `format` 为 JSON 家族中的一种格式（`JSONEachRow`、`JSONCompactEachRow` 等），则客户机将在通信期间对数据进行序列化和反序列化。

以“原始”文本格式（`CSV`、`TabSeparated` 和 `CustomSeparated` 家族）提供的数据不会进行额外的转换，而是直接传输。

:::tip
JSON 作为一般格式与 [ClickHouse JSON 格式](/sql-reference/formats#json) 之间可能存在混淆。

客户机支持流式 JSON 对象，例如 [JSONEachRow](/sql-reference/formats#jsoneachrow)（请参见表格概述以了解其他流友好的格式；另请参阅客户端库中的 `select_streaming_` [示例](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)）。

只有像 [ClickHouse JSON](/sql-reference/formats#json) 这样的一些格式以及其他几个格式在响应中表示为单个对象，客户机无法流式传输这些格式。
:::

| 格式                                      | 输入（数组） | 输入（对象） | 输入/输出（流） | 输出（JSON） | 输出（文本）  |
|-------------------------------------------|--------------|---------------|-----------------|---------------|----------------|
| JSON                                      | ❌            | ✔️            | ❌               | ✔️            | ✔️             |
| JSONCompact                               | ❌            | ✔️            | ❌               | ✔️            | ✔️             |
| JSONObjectEachRow                         | ❌            | ✔️            | ❌               | ✔️            | ✔️             |
| JSONColumnsWithMetadata                   | ❌            | ✔️            | ❌               | ✔️            | ✔️             |
| JSONStrings                               | ❌            | ❌             | ❌               | ✔️            | ✔️             |
| JSONCompactStrings                        | ❌            | ❌             | ❌               | ✔️            | ✔️             |
| JSONEachRow                               | ✔️           | ❌             | ✔️               | ✔️            | ✔️             |
| JSONEachRowWithProgress                   | ❌            | ❌             | ✔️ ❗- 见下文    | ✔️            | ✔️             |
| JSONStringsEachRow                        | ✔️           | ❌             | ✔️               | ✔️            | ✔️             |
| JSONCompactEachRow                        | ✔️           | ❌             | ✔️               | ✔️            | ✔️             |
| JSONCompactStringsEachRow                 | ✔️           | ❌             | ✔️               | ✔️            | ✔️             |
| JSONCompactEachRowWithNames               | ✔️           | ❌             | ✔️               | ✔️            | ✔️             |
| JSONCompactEachRowWithNamesAndTypes       | ✔️           | ❌             | ✔️               | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNames        | ✔️           | ❌             | ✔️               | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNamesAndTypes| ✔️           | ❌             | ✔️               | ✔️            | ✔️             |
| CSV                                       | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| CSVWithNames                              | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| CSVWithNamesAndTypes                      | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| TabSeparated                              | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| TabSeparatedRaw                           | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| TabSeparatedWithNames                     | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| TabSeparatedWithNamesAndTypes             | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| CustomSeparated                           | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| CustomSeparatedWithNames                  | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| CustomSeparatedWithNamesAndTypes          | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| Parquet                                   | ❌            | ❌             | ✔️               | ❌            | ✔️❗- 见下文  |

对于 Parquet，选择的主要用例可能是将结果流写入文件。请参见客户端库中的 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)。

`JSONEachRowWithProgress` 是一种仅输出格式，支持流中的进度报告。有关详细信息，请参见 [此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)。

ClickHouse 输入和输出格式的完整列表可在 
[此处](/interfaces/formats) 获得。
## 支持的 ClickHouse 数据类型 {#supported-clickhouse-data-types}

:::note
相关的 JS 类型与任何 `JSON*` 格式相关，除非表示一切为字符串（例如 `JSONStringEachRow`）。
:::

| 类型                     | 状态           | JS 类型                     |
|--------------------------|----------------|-----------------------------|
| UInt8/16/32              | ✔️             | number                      |
| UInt64/128/256           | ✔️ ❗- 见下文    | string                      |
| Int8/16/32               | ✔️             | number                      |
| Int64/128/256            | ✔️ ❗- 见下文    | string                      |
| Float32/64               | ✔️             | number                      |
| Decimal                  | ✔️ ❗- 见下文    | number                      |
| Boolean                  | ✔️             | boolean                     |
| String                   | ✔️             | string                      |
| FixedString              | ✔️             | string                      |
| UUID                     | ✔️             | string                      |
| Date32/64                | ✔️             | string                      |
| DateTime32/64            | ✔️ ❗- 见下文    | string                      |
| Enum                     | ✔️             | string                      |
| LowCardinality           | ✔️             | string                      |
| Array(T)                 | ✔️             | T[]                         |
| (新) JSON                | ✔️             | object                      |
| Variant(T1, T2...)       | ✔️             | T（取决于变体）             |
| Dynamic                  | ✔️             | T（取决于变体）             |
| Nested                   | ✔️             | T[]                         |
| Tuple(T1, T2, ...)       | ✔️             | [T1, T2, ...]               |
| Tuple(n1 T1, n2 T2...)   | ✔️             | \{ n1: T1; n2: T2; ...\}   |
| Nullable(T)              | ✔️             | T 的 JS 类型或 null        |
| IPv4                     | ✔️             | string                      |
| IPv6                     | ✔️             | string                      |
| Point                    | ✔️             | [ number, number ]          |
| Ring                     | ✔️             | Array&lt;Point\>            |
| Polygon                  | ✔️             | Array&lt;Ring\>             |
| MultiPolygon             | ✔️             | Array&lt;Polygon\>          |
| Map(K, V)                | ✔️             | Record&lt;K, V\>            |
| Time/Time64              | ✔️             | string                      |

支持的 ClickHouse 格式的完整列表可在 
[此处](/sql-reference/data-types/) 获得。

另请参阅：

- [处理动态/变体/JSON 示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/dynamic_variant_json.ts)
- [处理 Time/Time64 示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/time_time64.ts)
### Date/Date32 类型注意事项 {#datedate32-types-caveats}

由于客户机在插入值时没有额外的类型转换，`Date`/`Date32` 类型的列只能作为字符串插入。

**示例：** 插入 `Date` 类型值。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

但是，如果您使用 `DateTime` 或 `DateTime64` 列，您可以使用字符串和 JS Date 对象。JS Date 对象可以直接传递给 `insert`，并将 `date_time_input_format` 设置为 `best_effort`。有关更多详细信息，请参见 [这个示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts)。
### Decimal\* 类型注意事项 {#decimal-types-caveats}

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

我们可以使用字符串表示法插入值而不会丢失精度：

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

但是，当查询 `JSON*` 格式中的数据时，ClickHouse 将默认以 _数字_ 的形式返回 Decimals，这可能导致精度丢失。为避免这种情况，您可以在查询中将 Decimals 转换为字符串：

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

请参阅 [这个示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts) 以获取更多详细信息。
### 整数类型：Int64、Int128、Int256、UInt64、UInt128、UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

虽然服务器可以将其作为数字接受，但它在 `JSON*` 家族输出格式中作为字符串返回，以避免整数溢出，因为这些类型的最大值大于 `Number.MAX_SAFE_INTEGER`。

然而，此行为可以通过 [`output_format_json_quote_64bit_integers` 设置](/operations/settings/formats#output_format_json_quote_64bit_integers) 进行修改。

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

客户机可以通过 [设置](/operations/settings/settings/) 机制调整 ClickHouse 行为。
可以在客户端实例级别设置设置，使其适用于发送到 ClickHouse 的每个请求：

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
[此处](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts) 找到。

:::important
确保以用户身份执行查询的用户具有足够的权限来更改设置。
:::
## 高级主题 {#advanced-topics}
### 带参数的查询 {#queries-with-parameters}

您可以创建一个带参数的查询，并从客户端应用程序传递值给它们。这可以避免在客户端侧格式化包含特定动态值的查询。

以与往常一样的格式编写查询，然后将要从应用程序参数传递到查询的值放在大括号中，格式如下：

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

查看 https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax 以获取更多详细信息。
### 压缩 {#compression}

注意：Web 版本目前不支持请求压缩。响应压缩正常工作。Node.js 版本支持两者。

处理大型数据集的数据应用可以通过启用压缩获益。目前，只支持使用 [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html) 的 `GZIP`。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

配置参数为：

- `response: true` 指示 ClickHouse 服务器以压缩响应正文进行响应。默认值：`response: false`
- `request: true` 启用客户端请求正文的压缩。默认值：`request: false`
### 日志记录（仅限 Node.js） {#logging-nodejs-only}

:::important
日志记录是一个实验性功能，未来可能会发生变化。
:::

默认的日志记录实现通过 `console.debug/info/warn/error` 方法将日志记录发出到 `stdout`。
您可以通过提供 `LoggerClass` 自定义日志记录逻辑，并通过 `level` 参数选择所需的日志级别（默认是 `OFF`）：

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

目前，客户机会记录以下事件：

- `TRACE` - 关于 Keep-Alive 套接字生命周期的低级信息
- `DEBUG` - 响应信息（不包括授权头和主机信息）
- `INFO` - 大多未使用，客户端初始化时会打印当前日志级别
- `WARN` - 非致命错误；失败的 `ping` 请求被记录为警告，因为底层错误包含在返回的结果中
- `ERROR` - 来自 `query`/`insert`/`exec`/`command` 方法的致命错误，例如请求失败

您可以在 [这里](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts) 找到默认的日志记录实现。
### TLS 证书（仅限 Node.js） {#tls-certificates-nodejs-only}

Node.js 客户机可选择支持基本（仅证书颁发机构）和互相（证书颁发机构和客户端证书）TLS。

基本 TLS 配置示例，假设您的证书位于 `certs` 文件夹中，CA 文件名为 `CA.pem`：

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

使用客户端证书的互相 TLS 配置示例：

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

有关基本 TLS 和互相 TLS 的完整示例，请参见库中的 [基本](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) 和 [互相](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts)。
### Keep-alive 配置（仅限 Node.js） {#keep-alive-configuration-nodejs-only}

默认情况下，客户机在底层 HTTP 代理中启用 Keep-Alive，这意味着连接的套接字将被重用于后续请求，并且将发送 `Connection: keep-alive` 标头。默认情况下，空闲的套接字将在连接池中保持 2500 毫秒（请参阅 [调整此选项的说明](./js.md#adjusting-idle_socket_ttl)）。

`keep_alive.idle_socket_ttl` 的值应低于服务器/LB 配置的值。主要原因是，由于 HTTP/1.1 允许服务器在不通知客户端的情况下关闭套接字，因此如果服务器或负载均衡器在客户端之前关闭连接，客户端可能会尝试重用已关闭的套接字，导致 `socket hang up` 错误。

如果您正在修改 `keep_alive.idle_socket_ttl`，请记住它应始终与您的服务器/LB Keep-Alive 配置保持同步，并且应始终低于该值，确保服务器不会首先关闭开放连接。
#### 调整 `idle_socket_ttl` {#adjusting-idle_socket_ttl}

客户端将 `keep_alive.idle_socket_ttl` 设置为 2500 毫秒，因为它可以被认为是最安全的默认值；在服务器端，`keep_alive_timeout` 可以在 ClickHouse 版本 23.11 之前设置为 [低至 3 秒](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1)，而无需修改 `config.xml`。

:::warning
如果您对性能感到满意且没有遇到任何问题，建议您**不要**增加 `keep_alive.idle_socket_ttl` 设置的值，因为这可能会导致潜在的“套接字挂起”错误；此外，如果您的应用发送了很多查询并且它们之间的停机时间不长，那么默认值将是充足的，因为套接字不会闲置很长时间，客户端会将它们保留在池中。
:::

您可以通过运行以下命令在服务器响应标头中找到正确的 Keep-Alive 超时值：

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

检查响应中的 `Connection` 和 `Keep-Alive` 标头的值。例如：

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

在这种情况下，`keep_alive_timeout` 为 10 秒，您可以尝试将 `keep_alive.idle_socket_ttl` 增加到 9000 或甚至 9500 毫秒，以使空闲套接字保持打开状态超过默认时间。注意潜在的“套接字挂起”错误，这将表明服务器在客户端之前关闭连接，并降低该值，直到错误消失。
#### 故障排除 {#troubleshooting}

如果您在使用客户端的最新版本时仍然遇到 `socket hang up` 错误，可以采取以下措施解决该问题：

* 启用至少 `WARN` 日志级别的日志。这将允许检查是否存在未被消费或悬空的流在应用代码中：传输层将在 WARN 级别记录，因为这可能会导致服务器关闭套接字。您可以按如下方式在客户端配置中启用日志记录：
  
```ts
const client = createClient({
  log: { level: ClickHouseLogLevel.WARN },
})
```
  
* 检查您的应用代码，确保启用 [no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/) ESLint 规则，这将有助于识别未处理的 Promise，这可能导致悬空流和套接字。

* 在 ClickHouse 服务器配置中稍微降低 `keep_alive.idle_socket_ttl` 设置。在某些情况下，例如，客户端和服务器之间的网络延迟较高，您可以通过再减少 200–500 毫秒的 `keep_alive.idle_socket_ttl` 来消除出站请求可能获得服务器将要关闭的套接字的情况。

* 如果在长期运行的没有进出数据的查询中发生此错误（例如，长期运行的 `INSERT FROM SELECT`），则可能是因为负载均衡器关闭了空闲连接。您可以尝试在长期运行的查询中通过使用以下 ClickHouse 设置的组合强制传入一些数据：

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
  请注意，最近的 Node.js 版本中接收标头的总大小具有 16KB 的限制；在收到一定量的进度标头后，约 70-80 个，在我们的测试中，将生成异常。

  还可以使用完全不同的方法，完全避免在传输中等待时间；这可以通过利用 HTTP 接口的“功能”来实现，即当连接丢失时突变不会取消。有关更多详细信息，请参阅 [这个示例（第 2 部分）](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts)。

* 可以完全禁用 Keep-Alive 功能。在这种情况下，客户端还会向每个请求添加 `Connection: close` 标头，底层 HTTP 代理将不会重用连接。`keep_alive.idle_socket_ttl` 设置将被忽略，因为将没有空闲的套接字。这将导致额外的开销，因为每个请求都将建立新的连接。

```ts
const client = createClient({
  keep_alive: {
    enabled: false,
  },
})
```
### 只读用户 {#read-only-users}

当使用 [readonly=1 用户](/operations/settings/permissions-for-queries#readonly) 的客户端时，无法启用响应压缩，因为它需要 `enable_http_compression` 设置。以下配置将导致错误：

```ts
const client = createClient({
  compression: {
    response: true, // won't work with a readonly=1 user
  },
})
```

请参见 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)，该示例突出显示 readonly=1 用户的限制。
### 带路径名称的代理 {#proxy-with-a-pathname}

如果您的 ClickHouse 实例位于代理后面，并且在 URL 中有路径名称，例如 http://proxy:8123/clickhouse_server，则指定 `clickhouse_server` 作为 `pathname` 配置选项（带或不带前导斜杠）；否则，如果直接在 `url` 中提供，它将被视为 `database` 选项。支持多个段，例如 `/my_proxy/db`。

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```
### 具有身份验证的反向代理 {#reverse-proxy-with-authentication}

如果您在 ClickHouse 部署前面有带身份验证的反向代理，则可以使用 `http_headers` 设置提供必要的头信息：

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```
### 自定义 HTTP/HTTPS 代理（实验性，仅限 Node.js） {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
这是一个实验性功能，未来的版本可能会以向后不兼容的方式进行更改。客户机提供的默认实现和设置应该足以满足大多数用例。仅在您确定需要此功能时使用。
:::

默认情况下，客户机将使用客户端配置中提供的设置（例如 `max_open_connections`、`keep_alive.enabled`、`tls`）配置底层 HTTP(s) 代理，并处理与 ClickHouse 服务器的连接。此外，如果使用了 TLS 证书，底层代理将被配置为使用必要的证书，并强制执行正确的 TLS 认证头。

在 1.2.0 之后，可以向客户端提供自定义 HTTP(s) 代理，替换默认底层代理。这在复杂的网络配置中可能很有用。如果提供自定义代理，则适用以下条件：
- `max_open_connections` 和 `tls` 选项将 _无效_，客户机将忽略这些选项，因为它是底层代理配置的一部分。
- `keep_alive.enabled` 将仅调节 `Connection` 标头的默认值（`true` -> `Connection: keep-alive`，`false` -> `Connection: close`）。
- 虽然空闲 Keep-Alive 套接字管理仍然有效（因为它不与代理相关联，而与特定套接字本身相关联），但现在可以通过将 `keep_alive.idle_socket_ttl` 值设置为 `0` 来完全禁用它。
#### 自定义代理使用示例 {#custom-agent-usage-examples}

使用没有证书的自定义 HTTP(s) 代理：

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

使用带有双向 TLS 的自定义 HTTPS 代理：

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

使用证书 _和_ 自定义 _HTTPS_ 代理时，可能需要通过设置 `set_basic_auth_header` 来禁用默认认证头（在 1.2.0 中引入），因为它与 TLS 头冲突。所有 TLS 头应手动提供。
## 已知限制（Node.js/web） {#known-limitations-nodejsweb}

- 没有结果集的数据映射器，因此仅使用语言原语。计划使用 [RowBinary 格式支持](https://github.com/ClickHouse/clickhouse-js/issues/216) 实现某些数据类型映射器。
- 存在一些 [Decimal* 和 Date\* / DateTime\* 数据类型注意事项](./js.md#datedate32-types-caveats)。
- 使用 JSON* 家族格式时，大于 Int32 的数字表示为字符串，因为 Int64+ 类型的最大值大于 `Number.MAX_SAFE_INTEGER`。有关更多详情，请参见 [整数类型](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) 部分。
## 已知限制（web） {#known-limitations-web}

- 选择查询的流式传输有效，但插入操作（类型级别）禁用流式传输。
- 请求压缩已禁用，配置已被忽略。响应压缩有效。
- 尚无日志记录支持。
## 性能优化提示 {#tips-for-performance-optimizations}

- 为了减少应用的内存消耗，考虑在适用时使用流进行大型插入（例如，从文件）和选择。对于事件监听器和类似用例，[异步插入](/optimize/asynchronous-inserts) 可能是另一个不错的选择，可以最小化，甚至完全避免客户端的批处理。异步插入示例可以在 [客户端库](https://github.com/ClickHouse/clickhouse-js/tree/main/examples)中找到，文件名以 `async_insert_` 作为前缀。
- 客户端默认不启用请求或响应压缩。然而，在选择或插入大型数据集时，您可以考虑通过 `ClickHouseClientConfigOptions.compression` 启用它（无论是仅针对 `request` 还是 `response`，或者两者）。
- 压缩具有显着的性能损失。为 `request` 或 `response` 启用压缩将对选择或插入的速度产生负面影响，但会减少应用程序传输的网络流量。
## 联系我们 {#contact-us}

如果您有任何疑问或需要帮助，请随时通过 [社区 Slack](https://clickhouse.com/slack)（`#clickhouse-js` 频道）或通过 [GitHub 问题](https://github.com/ClickHouse/clickhouse-js/issues) 联系我们。
