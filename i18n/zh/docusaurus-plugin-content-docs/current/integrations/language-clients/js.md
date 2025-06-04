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
'description': '官方 JS 客户端用于连接到 ClickHouse。'
'title': 'ClickHouse JS'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse JS

连接 ClickHouse 的官方 JS 客户端。
该客户端是用 TypeScript 编写的，并提供了客户端公共 API 的类型定义。

它没有任何依赖，经过优化以实现最佳性能，并在各种 ClickHouse 版本和配置下进行了测试（本地单节点、本地集群和 ClickHouse Cloud）。

提供两种不同版本的客户端，可用于不同的环境：
- `@clickhouse/client` - 仅限 Node.js
- `@clickhouse/client-web` - 浏览器（Chrome/Firefox）、Cloudflare 工作者

使用 TypeScript 时，请确保版本至少为 [4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)，以启用 [内联导入和导出语法](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)。

客户端源代码可以在 [ClickHouse-JS GitHub 仓库](https://github.com/ClickHouse/clickhouse-js) 中找到。
## 环境要求 (Node.js) {#environment-requirements-nodejs}

在运行客户端的环境中必须可用 Node.js。
该客户端与所有 [维护的](https://github.com/nodejs/release#readme) Node.js 版本兼容。

一旦 Node.js 版本接近用户终止支持（End-Of-Life），客户端将停止支持该版本，因为它被视为过时和不安全。

当前支持的 Node.js 版本：

| Node.js 版本 | 是否支持  |
|---------------|-----------|
| 22.x         | ✔         |
| 20.x         | ✔         |
| 18.x         | ✔         |
| 16.x         | 竭尽所能  |
## 环境要求 (Web) {#environment-requirements-web}

客户端的网页版本经过与最新的 Chrome/Firefox 浏览器的官方测试，并可以作为 React/Vue/Angular 应用程序或 Cloudflare 工作者中的依赖项使用。
## 安装 {#installation}

要安装最新的稳定版本的 Node.js 客户端，请运行：

```sh
npm i @clickhouse/client
```

网页版本安装：

```sh
npm i @clickhouse/client-web
```
## 与 ClickHouse 的兼容性 {#compatibility-with-clickhouse}

| 客户端版本 | ClickHouse |
|-------------|------------|
| 1.8.0      | 23.3+      |

客户端可能也能与旧版本兼容；然而，这只是最好的努力支持，并不保证。如果您使用的 ClickHouse 版本低于 23.3，请参阅 [ClickHouse 安全政策](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) 并考虑升级。
## 示例 {#examples}

我们旨在通过客户端仓库中的 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) 涵盖客户端使用的各种场景。

概述可在 [示例 README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview) 中找到。 

如果示例或以下文档中有不清楚或缺失的内容，请随时 [联系我们](./js.md#contact-us)。
### 客户端 API {#client-api}

大多数示例应与客户端的 Node.js 和 Web 版本兼容，除非明确说明。
#### 创建客户端实例 {#creating-a-client-instance}

您可以使用 `createClient` 工厂创建任意数量的客户端实例：

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

创建客户端实例时，可以调整以下连接设置：

| 设置                                                                  | 描述                                                                           | 默认值                  | 另见                                                                                                                 |
|-----------------------------------------------------------------------|--------------------------------------------------------------------------------|------------------------|----------------------------------------------------------------------------------------------------------------------|
| **url**?: string                                                      | ClickHouse 实例的 URL。                                                         | `http://localhost:8123` | [URL 配置文档](./js.md#url-configuration)                                                                            |
| **pathname**?: string                                                 | 要添加到 ClickHouse URL 的可选路径名，在客户端解析后。                          | `''`                   | [带路径名的代理文档](./js.md#proxy-with-a-pathname)   |
| **request_timeout**?: number                                          | 请求超时（毫秒）。                                                               | `30_000`               | -                                                                                                                    |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }` | 启用压缩。                                                                     | -                      | [压缩文档](./js.md#compression)                                                                                                    |
| **username**?: string                                                 | 以该用户名发出的请求。                                                           | `default`              | -                                                                                                                    |
| **password**?: string                                                 | 用户密码。                                                                       | `''`                   | -                                                                                                                    |
| **application**?: string                                              | 使用 Node.js 客户端的应用程序名称。                                             | `clickhouse-js`        | -                                                                                                                    |
| **database**?: string                                                 | 要使用的数据库名称。                                                             | `default`              | -                                                                                                                    |
| **clickhouse_settings**?: ClickHouseSettings                          | 应用于所有请求的 ClickHouse 设置。                                               | `{}`                   | -                                                                                                                    |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 内部客户端日志配置。                                                             | -                      | [日志记录文档](./js.md#logging-nodejs-only)                                                                          |
| **session_id**?: string                                               | 可选的 ClickHouse 会话 ID，发送随每个请求。                                     | -                      | -                                                                                                                    |
| **keep_alive**?: `{ **enabled**?: boolean }`                          | 在 Node.js 和 Web 版本中默认启用。                                               | -                      | -                                                                                                                    |
| **http_headers**?: `Record<string, string>`                           | 发出的 ClickHouse 请求的附加 HTTP 头。                                          | -                      | [带身份验证的反向代理文档](./js.md#reverse-proxy-with-authentication)                                                                               |
| **roles**?: string \| string[]                                        | 附加到发出请求的 ClickHouse 角色名称。                                          | -                      | [使用角色与 HTTP 接口](/interfaces/http#setting-role-with-query-parameters) |
#### Node.js 特定配置参数 {#nodejs-specific-configuration-parameters}

| 设置                                                                  | 描述                                                          | 默认值       | 另见                                                                                           |
|-----------------------------------------------------------------------|---------------------------------------------------------------|---------------|------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                     | 每个主机允许的最大连接套接字数。                                | `10`          | -                                                                                              |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }` | 配置 TLS 证书。                                               | -             | [TLS 文档](./js.md#tls-certificates-nodejs-only)                                         |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                         | -             | [保持连接文档](./js.md#keep-alive-configuration-nodejs-only)                                |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/> | 客户端的自定义 HTTP 代理。                                   | -             | [HTTP 代理文档](./js.md#custom-httphttps-agent-experimental-nodejs-only)                     |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>         | 设置 `Authorization` 头，带有基本身份验证凭据。                   | `true`        | [该设置在 HTTP 代理文档中的使用](./js.md#custom-httphttps-agent-experimental-nodejs-only) |
### URL 配置 {#url-configuration}

:::important
URL 配置 _始终_ 会覆盖硬编码值，在这种情况下会记录警告。
:::

可以通过 URL 配置客户端实例的多数参数。URL 格式为 `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`。在几乎所有情况下，特定参数的名称反映其在配置选项接口中的路径，只有少数例外。支持以下参数：

| 参数                                    | 类型                                                          |
|-----------------------------------------|-------------------------------------------------------------|
| `pathname`                              | 任意字符串。                                                |
| `application_id`                        | 任意字符串。                                                |
| `session_id`                            | 任意字符串。                                                |
| `request_timeout`                       | 非负数。                                                    |
| `max_open_connections`                  | 非负数，大于零。                                           |
| `compression_request`                   | 布尔值。见下文 (1)                                        |
| `compression_response`                  | 布尔值。                                                  |
| `log_level`                             | 允许的值：`OFF`、`TRACE`、`DEBUG`、`INFO`、`WARN`、`ERROR`。 |
| `keep_alive_enabled`                    | 布尔值。                                                  |
| `clickhouse_setting_*` 或 `ch_*`       | 见下文 (2)                                                |
| `http_header_*`                         | 见下文 (3)                                                |
| (仅限 Node.js) `keep_alive_idle_socket_ttl` | 非负数。                                            |

- (1) 对于布尔值，有效值为 `true`/`1` 和 `false`/`0`。 
- (2) 任何以 `clickhouse_setting_` 或 `ch_` 为前缀的参数将删除该前缀，剩余部分添加到客户端的 `clickhouse_settings`。例如，`?ch_async_insert=1&ch_wait_for_async_insert=1` 将等同于：

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

注意：对于 `clickhouse_settings`，布尔值应在 URL 中以 `1`/`0` 的方式传递。

- (3) 与 (2) 类似，但用于 `http_header` 配置。例如，`?http_header_x-clickhouse-auth=foobar` 等同于：

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```
### 连接 {#connecting}
#### 收集连接详情 {#gather-your-connection-details}

<ConnectionDetails />
#### 连接概述 {#connection-overview}

客户端通过 HTTP(s) 协议实现连接。RowBinary 支持正在进行中，请参阅 [相关问题](https://github.com/ClickHouse/clickhouse-js/issues/216)。

以下示例演示了如何设置与 ClickHouse Cloud 的连接。假设 `url`（包括协议和端口）以及 `password` 值通过环境变量指定，并且使用 `default` 用户。

**示例：** 使用环境变量配置创建 Node.js 客户端实例。

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

客户端仓库包含多个使用环境变量的示例，如 [在 ClickHouse Cloud 中创建表](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)、[使用异步插入](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) 以及其他多个示例。
#### 连接池 (仅限 Node.js) {#connection-pool-nodejs-only}

为了避免在每次请求时建立连接的开销，客户端创建了一个连接池以重用，采用了保持活动机制。默认情况下，保持活动功能启用，并且连接池大小设置为 `10`，但可以通过 `max_open_connections` [配置选项](./js.md#configuration) 进行更改。

除非用户将 `max_open_connections` 设置为 `1`，否则不能保证连接池中的同一连接会用于后续查询。这种情况很少需要，但可能在用户使用临时表的情况下需要。

另见：[保持活动配置](./js.md#keep-alive-configuration-nodejs-only)。
### 查询 ID {#query-id}

每个发送查询或语句（`command`、`exec`、`insert`、`select`）的方法都会在结果中提供 `query_id`。此唯一标识符由客户端为每个查询分配，如果在 [server configuration](/operations/server-configuration-parameters/settings) 中启用，可能对从 `system.query_log` 中提取数据有用，或者取消长时间运行的查询（请参阅 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)）。如果需要，用户可以在 `command`/`query`/`exec`/`insert` 方法参数中覆盖 `query_id`。

:::tip
如果您覆盖 `query_id` 参数，您需要确保每个调用的唯一性。一个随机的 UUID 是一个不错的选择。
:::
### 所有客户端方法的基本参数 {#base-parameters-for-all-client-methods}

有几个参数可以应用于所有客户端方法 ([query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method))。

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

这用于大多数可以有响应的语句，例如 `SELECT`，或发送 DDL 语句，例如 `CREATE TABLE`，并应当进行等待。预期返回的结果集将在应用程序中被消费。

:::note
数据插入有专门的方法 [insert](./js.md#insert-method)，DDL 有专门的方法 [command](./js.md#command-method)。
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
在 `query` 中不要指定 FORMAT 子句，使用 `format` 参数代替。
:::
#### 结果集和行抽象 {#result-set-and-row-abstractions}

`ResultSet` 提供几个方便的方法以在您的应用程序中处理数据。

Node.js 的 `ResultSet` 实现使用 `Stream.Readable`，而网页版本使用 Web API `ReadableStream`。

您可以通过在 `ResultSet` 上调用 `text` 或 `json` 方法来消费 `ResultSet`，并将查询返回的整组行加载到内存中。

您应该尽快开始消费 `ResultSet`，因为它保持响应流打开，从而使基础连接保持忙碌。为了避免应用程序可能过度使用内存，客户端不会缓冲传入的数据。

另外，如果响应太大而无法一次性加载到内存中，您可以调用 `stream` 方法，并以流模式处理数据。响应的每个块将转换为相对小的行数组（该数组的大小取决于客户端从服务器接收的特定块的大小，可能有所不同，还有单行的大小），一次一个块处理。

请参阅 [支持的数据格式](./js.md#supported-data-formats) 列表，以确定在您的情况下流式处理的最佳格式。例如，如果您想流式传输 JSON 对象，您可以选择 [JSONEachRow](/sql-reference/formats#jsoneachrow)，每行将解析为一个 JS 对象；或者，也许选择更紧凑的 [JSONCompactColumns](/sql-reference/formats#jsoncompactcolumns) 格式，结果每行将是一个紧凑的值数组。另见：[流式文件](./js.md#streaming-files-nodejs-only)。

:::important
如果 `ResultSet` 或其流没有完全消费，它将在 `request_timeout` 不活动期后被销毁。
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

**示例：**（Node.js/Web）查询结果集为 `JSONEachRow` 格式，消费整个流并将内容解析为 JS 对象。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // or `row.text` to avoid parsing JSON
```

**示例：**（仅限 Node.js）使用经典的 `on('data')` 方法流式处理查询结果为 `JSONEachRow` 格式。此方法可以与 `for await const` 语法互换。 [源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

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

**示例：**（仅限 Node.js）使用经典的 `on('data')` 方法流式处理查询结果为 `CSV` 格式。此方法可以与 `for await const` 语法互换。
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

**示例：**（仅限 Node.js）以 `JSONEachRow` 格式流式处理查询结果作为 JS 对象，采用 `for await const` 语法消费。此方法可以与经典的 `on('data')` 方法互换。
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
`for await const` 语法的代码量略少于 `on('data')` 方法，但可能对性能产生负面影响。
有关更多详细信息，请参见 [Node.js 仓库中的此问题](https://github.com/nodejs/node/issues/31979)。
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

返回类型很小，因为我们不期望服务器返回任何数据，并会立即消耗响应流。

如果给插入方法提供了一个空数组，插入语句将不会发送到服务器；相反，该方法将立即以 `{ query_id: '...', executed: false }` 解析。如果在这种情况下，方法参数中没有提供 `query_id`，那么结果中的值将是空字符串，因为返回一个客户端生成的随机 UUID 可能会导致混淆，因为这样的 `query_id` 的查询不会存在于 `system.query_log` 表中。

如果插入语句已发送到服务器，`executed` 标志将为 `true`。
#### 插入方法和 Node.js 中的流式处理 {#insert-method-and-streaming-in-nodejs}

它可以与 `Stream.Readable` 或普通的 `Array<T>` 一起使用，具体取决于指定给 `insert` 方法的 [数据格式](./js.md#supported-data-formats)。另见此节关于 [文件流](./js.md#streaming-files-nodejs-only) 的内容。

插入方法应被等待；然而，可以指定输入流，并在流完成后等待 `insert` 操作（这也会解析 `insert` 的 Promise）。在事件侦听器和类似场景中，这可能非常有用，但在客户端可能有许多边缘案例的错误处理可能并不简单。相反，请考虑使用 [异步插入](/optimize/asynchronous-inserts)，如 [此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts) 所示。

:::tip
如果您有一个难以通过此方法建模的自定义 INSERT 语句，请考虑使用 [command 方法](./js.md#command-method)。

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

另见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

:::important
通过 `abort_signal` 取消的请求，并不保证数据插入未发生，因为服务器可能在取消之前接收了一些流式数据。
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
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。另见：[文件流](./js.md#streaming-files-nodejs-only)。

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**示例**：从插入语句中排除某些列。

给定某个表定义如下：

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

请参阅 [源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts) 以获取更多详细信息。

**示例**：向与客户端实例提供的数据库不同的数据库中插入。 [源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: 'mydb.mytable', // Fully qualified name including the database
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```
#### Web 版本限制 {#web-version-limitations}

目前，`@clickhouse/client-web` 的插入仅适用于 `Array<T>` 和 `JSON*` 格式。
由于浏览器兼容性差，暂不支持在网页版本中插入流。

因此，网页版本的 `InsertParams` 接口与 Node.js 版本略有不同，因为 `values` 仅限于 `ReadonlyArray<T>` 类型：

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

未来可能会对此进行更改。另见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。
### 命令方法 {#command-method}

可以用于没有任何输出的语句，当格式子句不适用或当您完全不关心响应时。例如这样的语句可以是 `CREATE TABLE` 或 `ALTER TABLE`。

应该进行等待。

响应流将立即被销毁，这意味着基础套接字将被释放。

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

**示例：**（Node.js/Web）INSERT FROM SELECT

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`,
})
```

:::important
通过 `abort_signal` 取消的请求并不保证服务器没有执行该语句。
:::
### Exec 方法 {#exec-method}

如果您有一个不适合 `query`/`insert` 的自定义查询，并且您对结果感兴趣，可以将 `exec` 作为 `command` 的替代。

`exec` 返回一个可读流，必须在应用程序端进行消费或销毁。

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

流的返回类型在 Node.js 和 Web 版本中有所不同。

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

`ping` 方法用于检查连接状态，如果服务器可以访问，则返回 `true`。

如果服务器无法访问，基础错误也会包含在结果中。

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }

interface ClickHouseClient {
  ping(): Promise<PingResult>
}
```

Ping 可能是检查服务器可用性的有用工具，尤其是在应用程序启动时，特别是对于 ClickHouse Cloud，其中一个实例可能在空闲状态，并将在 Ping 后唤醒。

**示例：**（Node.js/Web）Ping ClickHouse 服务器实例。注意：对于 Web 版本，捕获的错误会有所不同。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // process result.error
}
```

注意：由于 `/ping` 端点未实现 CORS，网页版本使用简单的 `SELECT 1` 来实现类似的结果。
### 关闭 (仅限 Node.js) {#close-nodejs-only}

关闭所有打开的连接并释放资源。在网页版本中没有操作。

```ts
await client.close()
```
## 流式文件 (仅限 Node.js) {#streaming-files-nodejs-only}

客户端仓库中有几个流式文件示例，支持流行的数据格式（NDJSON、CSV、Parquet）。

- [从 NDJSON 文件流式传输](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [从 CSV 文件流式传输](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [从 Parquet 文件流式传输](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [流式传输到 Parquet 文件](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

其他格式流式传输到文件的方式应与 Parquet 相似，唯一的区别在于 `query` 调用中使用的格式（`JSONEachRow`、`CSV` 等）以及输出文件名。
## 支持的数据格式 {#supported-data-formats}

客户端处理 JSON 或文本格式的数据。

如果您将 `format` 指定为 JSON 族中的一种（如 `JSONEachRow`、`JSONCompactEachRow` 等），客户端将在通信过程中对数据进行序列化和反序列化。

以 "原始" 文本格式提供的数据（如 `CSV`、`TabSeparated` 和 `CustomSeparated` 族）将被直接发送而不会进行额外转换。

:::tip
在 JSON 作为通用格式与 [ClickHouse JSON 格式](/sql-reference/formats#json) 之间可能会有混淆。

客户端支持以流式 JSON 对象格式传输，如 [JSONEachRow](/sql-reference/formats#jsoneachrow)（请参阅表概述以获取其他适合流式传输的格式；另请参见客户端代码库中的 `select_streaming_` [示例](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)）。

只有像 [ClickHouse JSON](/sql-reference/formats#json) 这样的格式及其他一些格式在响应中表示为单个对象，因此客户端无法将其流式传输。
:::

| 格式                                      | 输入（数组） | 输入（对象） | 输入/输出（流） | 输出（JSON） | 输出（文本）  |
|-------------------------------------------|--------------|---------------|-----------------|--------------|----------------|
| JSON                                      | ❌            | ✔️            | ❌               | ✔️           | ✔️             |
| JSONCompact                               | ❌            | ✔️            | ❌               | ✔️           | ✔️             |
| JSONObjectEachRow                         | ❌            | ✔️            | ❌               | ✔️           | ✔️             |
| JSONColumnsWithMetadata                   | ❌            | ✔️            | ❌               | ✔️           | ✔️             |
| JSONStrings                               | ❌            | ❌            | ❌               | ✔️           | ✔️             |
| JSONCompactStrings                        | ❌            | ❌            | ❌               | ✔️           | ✔️             |
| JSONEachRow                               | ✔️           | ❌            | ✔️               | ✔️           | ✔️             |
| JSONEachRowWithProgress                   | ❌            | ❌            | ✔️ ❗- 见下文        | ✔️           | ✔️             |
| JSONStringsEachRow                        | ✔️           | ❌            | ✔️               | ✔️           | ✔️             |
| JSONCompactEachRow                        | ✔️           | ❌            | ✔️               | ✔️           | ✔️             |
| JSONCompactStringsEachRow                 | ✔️           | ❌            | ✔️               | ✔️           | ✔️             |
| JSONCompactEachRowWithNames               | ✔️           | ❌            | ✔️               | ✔️           | ✔️             |
| JSONCompactEachRowWithNamesAndTypes       | ✔️           | ❌            | ✔️               | ✔️           | ✔️             |
| JSONCompactStringsEachRowWithNames        | ✔️           | ❌            | ✔️               | ✔️           | ✔️             |
| JSONCompactStringsEachRowWithNamesAndTypes| ✔️           | ❌            | ✔️               | ✔️           | ✔️             |
| CSV                                       | ❌            | ❌            | ✔️               | ❌           | ✔️             |
| CSVWithNames                              | ❌            | ❌            | ✔️               | ❌           | ✔️             |
| CSVWithNamesAndTypes                      | ❌            | ❌            | ✔️               | ❌           | ✔️             |
| TabSeparated                              | ❌            | ❌            | ✔️               | ❌           | ✔️             |
| TabSeparatedRaw                           | ❌            | ❌            | ✔️               | ❌           | ✔️             |
| TabSeparatedWithNames                     | ❌            | ❌            | ✔️               | ❌           | ✔️             |
| TabSeparatedWithNamesAndTypes             | ❌            | ❌            | ✔️               | ❌           | ✔️             |
| CustomSeparated                           | ❌            | ❌            | ✔️               | ❌           | ✔️             |
| CustomSeparatedWithNames                  | ❌            | ❌            | ✔️               | ❌           | ✔️             |
| CustomSeparatedWithNamesAndTypes          | ❌            | ❌            | ✔️               | ❌           | ✔️             |
| Parquet                                   | ❌            | ❌            | ✔️               | ❌           | ✔️❗- 见下文 |

对于 Parquet，选择的主要用例可能是将结果流写入文件。请参见客户端代码库中的 [该示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)。

`JSONEachRowWithProgress` 是一种仅输出格式，支持流中的进度报告。有关更多详细信息，请参见 [此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)。

ClickHouse 输入和输出格式的完整列表可在 [此处](/interfaces/formats) 找到。
## 支持的 ClickHouse 数据类型 {#supported-clickhouse-data-types}

:::note
相关的 JS 类型与任何 `JSON*` 格式相关，除了将所有内容表示为字符串的格式（例如 `JSONStringEachRow`）。
:::

| 类型                 | 状态           | JS 类型                      |
|----------------------|----------------|------------------------------|
| UInt8/16/32          | ✔️             | number                       |
| UInt64/128/256       | ✔️ ❗- 见下文    | string                       |
| Int8/16/32           | ✔️             | number                       |
| Int64/128/256        | ✔️ ❗- 见下文    | string                       |
| Float32/64           | ✔️             | number                       |
| Decimal              | ✔️ ❗- 见下文    | number                       |
| Boolean              | ✔️             | boolean                      |
| String               | ✔️             | string                       |
| FixedString          | ✔️             | string                       |
| UUID                 | ✔️             | string                       |
| Date32/64            | ✔️             | string                       |
| DateTime32/64        | ✔️ ❗- 见下文    | string                       |
| Enum                 | ✔️             | string                       |
| LowCardinality       | ✔️             | string                       |
| Array(T)             | ✔️             | T[]                          |
| (new) JSON           | ✔️             | object                       |
| Variant(T1, T2...)   | ✔️             | T（取决于变体）                |
| Dynamic              | ✔️             | T（取决于变体）                |
| Nested               | ✔️             | T[]                          |
| Tuple                | ✔️             | Tuple                        |
| Nullable(T)          | ✔️             | T 的 JS 类型或 null          |
| IPv4                 | ✔️             | string                       |
| IPv6                 | ✔️             | string                       |
| Point                | ✔️             | [ number, number ]           |
| Ring                 | ✔️             | Array&lt;Point\>            |
| Polygon              | ✔️             | Array&lt;Ring\>             |
| MultiPolygon         | ✔️             | Array&lt;Polygon\>          |
| Map(K, V)            | ✔️             | Record&lt;K, V\>            |

支持的 ClickHouse 格式的完整列表可在 [此处](/sql-reference/data-types/) 找到。
### Date/Date32 类型注意事项 {#datedate32-types-caveats}

由于客户端以字符串的形式插入值，因此 `Date`/`Date32` 类型的列只能以字符串插入。

**示例：** 插入 `Date` 类型的值。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)
。

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

然而，如果您使用的是 `DateTime` 或 `DateTime64` 列，您可以同时使用字符串和 JS Date 对象。 JS Date 对象可以原样传递给 `insert`，并将 `date_time_input_format` 设置为 `best_effort`。有关更多详细信息，请参见 [此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts)。
### Decimal\* 类型注意事项 {#decimal-types-caveats}

使用 `JSON*` 族格式插入 Decimals 是可能的。假设我们有一个定义为：

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

我们可以使用字符串表示法插入值而不丢失精度：

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

然而，当以 `JSON*` 格式查询数据时，ClickHouse 默认将 Decimals 作为 _数字_ 返回，这可能导致精度丢失。为了避免这一点，您可以在查询中将 Decimals 转换为字符串：

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
### 整数类型：Int64、Int128、Int256、UInt64、UInt128、UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

尽管服务器可以接受数字，但在 `JSON*` 族输出格式中返回为字符串，以避免整数溢出，因为这些类型的最大值大于 `Number.MAX_SAFE_INTEGER`。

此行为可以通过 [`output_format_json_quote_64bit_integers` 设置](/operations/settings/formats#output_format_json_quote_64bit_integers) 修改。

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

客户端可以通过 [settings](/operations/settings/settings/) 机制调整 ClickHouse 行为。
设置可以在客户端实例级别设置，以便将其应用于发送到 ClickHouse 的每个请求：

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

或者设置可以在请求级别上配置：

```ts
client.query({
  clickhouse_settings: {}
})
```

带有所有支持的 ClickHouse 设置的类型声明文件可以在 
[此处](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts) 找到。

:::important
请确保执行查询的用户有足够的权限更改设置。
:::
## 高级主题 {#advanced-topics}
### 带参数的查询 {#queries-with-parameters}

您可以创建一个带参数的查询，并从客户端应用程序传递值。这可以避免在客户端侧格式化带有特定动态值的查询。

按照惯例格式化查询，然后以以下格式将您希望从应用程序参数传递到查询的值放在大括号中：

```text
{<name>: <data_type>}
```

其中：

- `name` — 占位符标识符。
- `data_type` - [数据类型](/sql-reference/data-types/) 的应用程序参数值。

**示例：** 带参数的查询。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/query_with_parameter_binding.ts)
。

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

请查看 https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax 以获取更多详细信息。
### 压缩 {#compression}

注意：Web 版本当前不支持请求压缩。响应压缩正常工作。 Node.js 版本支持两者。

处理大型数据集的数据应用程序可以通过启用压缩而受益。当前，仅支持 `GZIP`，使用 [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html)。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

配置参数是：

- `response: true` 指示 ClickHouse 服务器以压缩的响应体响应。默认值：`response: false`
- `request: true` 启用客户端请求体的压缩。默认值：`request: false`
### 日志记录（仅限 Node.js） {#logging-nodejs-only}

:::important
日志记录是一个实验性功能，未来可能会发生更改。
:::

默认的日志记录实现通过 `console.debug/info/warn/error` 方法将日志记录发送到 `stdout`。
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

当前，客户端将记录以下事件：

- `TRACE` - 有关 Keep-Alive 套接字生命周期的低级信息
- `DEBUG` - 响应信息（不包括授权标头和主机信息）
- `INFO` - 大多没有使用，在客户端初始化时将打印当前的日志级别
- `WARN` - 非致命错误；失败的 `ping` 请求被记录为警告，因为底层错误包含在返回的结果中
- `ERROR` - 来自 `query`/`insert`/`exec`/`command` 方法的致命错误，例如请求失败

您可以在 [此处](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts) 找到默认 Logger 实现。
### TLS 证书（仅限 Node.js） {#tls-certificates-nodejs-only}

Node.js 客户端可选择支持基本的（仅证书颁发机构）和互相的（证书颁发机构和客户端证书） TLS。

基本的 TLS 配置示例，假设您的证书位于 `certs` 文件夹中且 CA 文件名为 `CA.pem`：

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

有关 [基本](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) 和 [互相](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS 的完整示例，请参见代码库。
### Keep-Alive 配置（仅限 Node.js） {#keep-alive-configuration-nodejs-only}

客户端在底层 HTTP 代理中默认启用 Keep-Alive，这意味着已连接的套接字将被重用以处理后续请求，并将发送 `Connection: keep-alive` 标头。默认情况下，处于闲置状态的套接字将在连接池中保持 2500 毫秒（请参阅 [调整此选项的注释](./js.md#adjusting-idle_socket_ttl)）。

`keep_alive.idle_socket_ttl` 的值应该远低于服务器/LB 配置。其主要原因是，由于 HTTP/1.1 允许服务器在未通知客户端的情况下关闭套接字，如果服务器或负载均衡器在客户端之前关闭连接，则客户端下载的套接字可能会导致 `socket hang up` 错误。

如果要修改 `keep_alive.idle_socket_ttl`，请记住，它应始终与您的服务器/LB Keep-Alive 配置保持同步，并且应该 **始终低于** 该值，以确保服务器不会先关闭打开的连接。
#### 调整 `idle_socket_ttl` {#adjusting-idle_socket_ttl}

客户端将 `keep_alive.idle_socket_ttl` 设置为 2500 毫秒，因为这可以视为最安全的默认值；在服务器端 `keep_alive_timeout` 可能在 ClickHouse 版本 23.11 之前设置为低至 [3 秒](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1)，而无需修改 `config.xml`。

:::warning
如果您对性能满意并且没有遇到任何问题，建议 **不要** 增加 `keep_alive.idle_socket_ttl` 设置的值，因为这可能导致潜在的 "Socket hang-up" 错误；此外，如果您的应用程序发送大量查询并且它们之间没有很多停机时间，默认值应该足够，因为套接字将不会闲置太长时间，客户端将把它们保留在池中。
:::

您可以通过运行以下命令查找服务器响应头中的正确 Keep-Alive 超时值：

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

检查响应中的 `Connection` 和 `Keep-Alive` 标头的值。例如：

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

在这种情况下，`keep_alive_timeout` 为 10 秒，您可以尝试将 `keep_alive.idle_socket_ttl` 增加到 9000 或甚至 9500 毫秒，以使闲置的套接字保持打开状态的时间长于默认值。注意潜在的 "Socket hang-up" 错误，这将表明服务器在客户端之前关闭连接，降低值直到错误消失为止。
#### Keep-Alive 故障排除 {#keep-alive-troubleshooting}

如果您在使用 Keep-Alive 时遇到 `socket hang up` 错误，可以采取以下选项解决此问题：

* 在 ClickHouse 服务器配置中稍微降低 `keep_alive.idle_socket_ttl` 设置。在某些情况下，例如客户端与服务器之间的网络延迟较高，减少 `keep_alive.idle_socket_ttl` 200-500 毫秒可能是有益的，排除出站请求可能获取正在关闭的套接字的情况。

* 如果在没有数据进出（例如长时间运行的 `INSERT FROM SELECT`）的情况下发生该错误，则可能是由于负载均衡器关闭闲置连接。您可以通过使用以下 ClickHouse 设置的组合强制在长时间查询期间获取一些数据：

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
  请注意，最近的 Node.js 版本中接收标头的总大小有 16KB 限制；在我们的测试中，获得的进度标头数量大约在 70-80 个之后，将会生成异常。

  还可以使用完全不同的方法，完全避免连接上的等待时间；可以通过利用 HTTP 接口 "特性" 来做到这一点，即当连接丢失时，变更不会被取消。有关更多详细信息，请参见 [此示例（第 2 部分）](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts)。

* 可以完全禁用 Keep-Alive 功能。在这种情况下，客户端还将在每个请求中添加 `Connection: close` 标头，底层 HTTP 代理将不会重用连接。 `keep_alive.idle_socket_ttl` 设置将被忽略，因为将没有闲置的套接字。这将导致额外开销，因为每个请求都需要建立一个新连接。

```ts
const client = createClient({
  keep_alive: {
    enabled: false,
  },
})
```
### 只读用户 {#read-only-users}

当使用带有 [readonly=1 用户](/operations/settings/permissions-for-queries#readonly) 的客户端时，无法启用响应压缩，因为它需要 `enable_http_compression` 设置。以下配置将导致错误：

```ts
const client = createClient({
  compression: {
    response: true, // won't work with a readonly=1 user
  },
})
```

请参见 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)，该示例强调了 readonly=1 用户的限制。
### 带路径名的代理 {#proxy-with-a-pathname}

如果您的 ClickHouse 实例位于代理后面，并且 URL 中有路径名，例如 http://proxy:8123/clickhouse_server，则将 `clickhouse_server` 指定为 `pathname` 配置选项（可以带或不带前导斜杠）；否则如果直接在 `url` 中提供，则将被视为 `database` 选项。支持多个段，例如 `/my_proxy/db`。

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```
### 带身份验证的反向代理 {#reverse-proxy-with-authentication}

如果您在 ClickHouse 部署前面有带身份验证的反向代理，则可以使用 `http_headers` 设置提供必要的标头：

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```
### 自定义 HTTP/HTTPS 代理（实验性，仅限 Node.js） {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
这是一项实验性功能，未来版本中可能会以向后不兼容的方式更改。客户端提供的默认实现和设置应该足以满足大多数用例。仅在您确定需要此功能时使用它。
:::

默认情况下，客户端将使用在客户端配置中提供的设置（如 `max_open_connections`、`keep_alive.enabled`、`tls`）配置底层 HTTP(s) 代理，这将处理与 ClickHouse 服务器的连接。此外，如果使用了 TLS 证书，则底层代理将使用必要的证书进行配置，并强制执行正确的 TLS 授权头。

在 1.2.0 之后，可以向客户端提供自定义 HTTP(s) 代理，以替换默认的底层代理。这在复杂的网络配置中可能会很有用。如果提供了自定义代理，则适用以下条件：
- `max_open_connections` 和 `tls` 选项将 _无效_，并将被客户端忽略，因为它是底层代理配置的一部分。
- `keep_alive.enabled` 将仅控制 `Connection` 标头的默认值（`true` -> `Connection: keep-alive`，`false` -> `Connection: close`）。
- 由于闲置的 keep-alive 套接字管理仍将正常工作（因为它与代理无关，而是与特定的套接字本身相关），现在可以通过将 `keep_alive.idle_socket_ttl` 值设置为 `0` 来完全禁用它。
#### 自定义代理使用示例 {#custom-agent-usage-examples}

不带证书的自定义 HTTP(s) 代理：

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

带有基本 TLS 和 CA 证书的自定义 HTTPS 代理：

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

使用互相 TLS 的自定义 HTTPS 代理：

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

对于带有证书 _并且_ 自定义 _HTTPS_ 代理的情况，可能需要通过 `set_basic_auth_header` 设置禁用默认授权头（1.2.0 引入此设置），因为它与 TLS 头冲突。所有 TLS 头都应手动提供。
## 已知限制（Node.js/Web） {#known-limitations-nodejsweb}

- 结果集没有数据映射器，因此仅使用语言原语。计划实现某些数据类型映射器，并支持 [RowBinary 格式](https://github.com/ClickHouse/clickhouse-js/issues/216)。
- 有一些 [Decimal* 和 Date* / DateTime* 数据类型注意事项](./js.md#datedate32-types-caveats)。
- 在使用 JSON* 族格式时，Int32 以上的数字以字符串形式表示，因为 Int64+ 类型的最大值大于 `Number.MAX_SAFE_INTEGER`。有关更多详细信息，请参见 [整数类型](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) 部分。
## 已知限制（Web） {#known-limitations-web}

- 选择查询的流式传输有效，但插入的流式传输（在类型层面也是）被禁用。
- 请求压缩被禁用，配置被忽略。响应压缩工作正常。
- 目前还没有日志支持。
## 性能优化提示 {#tips-for-performance-optimizations}

- 为了减少应用程序的内存消耗，考虑在适用时为大量插入（例如来自文件）和选择使用流。如果是事件监听器和类似用例， [异步插入](/optimize/asynchronous-inserts) 可能是另一个不错的选择，允许在客户端侧最小化或者完全避免批处理。异步插入示例可在 [客户端代码库](https://github.com/ClickHouse/clickhouse-js/tree/main/examples) 中找到，文件名前缀为 `async_insert_`。
- 客户端默认不启用请求或响应压缩。但是，在选择或插入大型数据集时，您可以考虑通过 `ClickHouseClientConfigOptions.compression` 启用它（用于 `request`、`response` 或两者）。
- 压缩会产生显着的性能损失。为 `request` 或 `response` 启用它将对选择或插入的速度产生负面影响，但会减少应用程序传输的网络流量。
## 联系我们 {#contact-us}

如果您有任何问题或需要帮助，请随时在 [社区 Slack](https://clickhouse.com/slack) (`#clickhouse-js` 频道) 或通过 [GitHub Issues](https://github.com/ClickHouse/clickhouse-js/issues) 联系我们。
