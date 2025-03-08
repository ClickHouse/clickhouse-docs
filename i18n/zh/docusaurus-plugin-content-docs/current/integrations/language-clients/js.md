---
sidebar_label: 'JavaScript'
sidebar_position: 4
keywords: ['clickhouse', 'js', 'JavaScript', 'NodeJS', 'web', 'browser', 'Cloudflare', 'workers', 'client', 'connect', 'integrate']
slug: '/integrations/javascript'
description: '官方 JS 客户端用于连接 ClickHouse。'
---
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# ClickHouse JS

官方 JS 客户端用于连接 ClickHouse。该客户端使用 TypeScript 编写，并提供客户端公共 API 的类型定义。

该客户端没有依赖，经过优化以实现最大性能，并与多种 ClickHouse 版本和配置进行了测试（本地单节点、本地集群和 ClickHouse Cloud）。

客户端有两个不同版本，适用于不同环境：
- `@clickhouse/client` - 仅适用于 Node.js
- `@clickhouse/client-web` - 浏览器（Chrome/Firefox）、Cloudflare workers

使用 TypeScript 时，请确保其版本至少为 [4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)，以启用 [内联导入和导出语法](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)。

客户端源代码可在 [ClickHouse-JS GitHub 仓库](https://github.com/ClickHouse/clickhouse-js) 中找到。
## 环境要求（Node.js） {#environment-requirements-nodejs}

在运行客户端的环境中必须安装 Node.js。
客户端与所有 [被维护的](https://github.com/nodejs/release#readme) Node.js 版本兼容。

一旦 Node.js 版本接近生命周期结束，客户端将停止支持该版本，因为它被视为过时和不安全。

当前 Node.js 版本支持：

| Node.js 版本 | 支持?  |
|---------------|--------|
| 22.x         | ✔      |
| 20.x         | ✔      |
| 18.x         | ✔      |
| 16.x         | 努力支持 |

## 环境要求（Web） {#environment-requirements-web}

客户端的网页版本是通过最新的 Chrome/Firefox 浏览器进行官方测试的，并可用作例如 React/Vue/Angular 应用程序或 Cloudflare workers 的依赖。
## 安装 {#installation}

要安装最新稳定的 Node.js 客户端版本，请运行：

```sh
npm i @clickhouse/client
```

网页版本的安装：

```sh
npm i @clickhouse/client-web
```

## 与 ClickHouse 的兼容性 {#compatibility-with-clickhouse}

| 客户端版本 | ClickHouse |
|------------|------------|
| 1.8.0     | 23.3+      |

可能客户端也能与较旧的版本工作；然而，这只是最佳努力支持，不提供保证。如果您的 ClickHouse 版本低于 23.3，请参考 [ClickHouse 安全政策](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) 并考虑升级。
## 示例 {#examples}

我们旨在通过客户端仓库中的 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) 覆盖客户端使用的各种场景。

概述可在 [示例 README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview) 中找到。

如果在示例或以下文档中有任何不清楚或缺失的内容，请随时 [联系我们](./js.md#contact-us)。
### 客户端 API {#client-api}

除非另有明确说明，绝大多数示例应与 Node.js 和 Web 版本的客户端兼容。
#### 创建客户端实例 {#creating-a-client-instance}

您可以使用 `createClient` 工厂创建任意数量的客户端实例：

```ts
import { createClient } from '@clickhouse/client' // 或 '@clickhouse/client-web'

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

在创建客户端实例时，可以调整以下连接设置：

| 设置                                                              | 描述                                                                             | 默认值                 | 参见                                                                                                            |
|-------------------------------------------------------------------|----------------------------------------------------------------------------------|-----------------------|----------------------------------------------------------------------------------------------------------------|
| **url**?: string                                                   | ClickHouse 实例的 URL。                                                           | `http://localhost:8123` | [URL 配置文档](./js.md#url-configuration)                                                                        |
| **pathname**?: string                                              | 要添加到解析后的 ClickHouse URL 的可选路径。                                      | `''`                  | [带路径的代理文档](./js.md#proxy-with-a-pathname)                                                                          |
| **request_timeout**?: number                                       | 以毫秒为单位的请求超时时间。                                                      | `30_000`              | -                                                                                                              |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }` | 启用压缩。                                                                         | -                     | [压缩文档](./js.md#compression)                                                                                          |
| **username**?: string                                              | 以该用户身份发起请求的名称。                                                       | `default`             | -                                                                                                              |
| **password**?: string                                              | 用户密码。                                                                        | `''`                  | -                                                                                                              |
| **application**?: string                                           | 使用 Node.js 客户端的应用程序名称。                                               | `clickhouse-js`       | -                                                                                                              |
| **database**?: string                                              | 要使用的数据库名称。                                                               | `default`             | -                                                                                                              |
| **clickhouse_settings**?: ClickHouseSettings                       | 应用于所有请求的 ClickHouse 设置。                                                 | `{}`                  | -                                                                                                              |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 内部客户端日志配置。                                                               | -                     | [日志文档](./js.md#logging-nodejs-only)                                                                          |
| **session_id**?: string                                            | 可选的 ClickHouse 会话 ID，随每个请求发送。                                         | -                     | -                                                                                                              |
| **keep_alive**?: `{ **enabled**?: boolean }`                     | 在 Node.js 和 Web 版本中默认启用。                                                | -                     | -                                                                                                              |
| **http_headers**?: `Record<string, string>`                        | 额外的 HTTP 头用于发送 ClickHouse 请求。                                           | -                     | [带身份验证的反向代理文档](./js.md#reverse-proxy-with-authentication)                                                                  |
| **roles**?: string \|  string[]                                    | 要附加到发出的请求的 ClickHouse 角色名称。                                         | -                     | [通过 HTTP 接口使用角色](/interfaces/http#setting-role-with-query-parameters)                                 |
#### Node.js 特定配置参数 {#nodejs-specific-configuration-parameters}

| 设置                                                                | 描述                                                              | 默认值       | 参见                                                                                             |
|--------------------------------------------------------------------|-------------------------------------------------------------------|---------------|------------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                   | 允许每个主机的最大连接套接字数。                                      | `10`          | -                                                                                                    |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }` | 配置 TLS 证书。                                                    | -             | [TLS 文档](./js.md#tls-certificates-nodejs-only)                                                     |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                                 | -             | [保持活动配置](./js.md#keep-alive-configuration-nodejs-only)                                      |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/> | 自定义 HTTP 代理。                                                | -             | [HTTP 代理文档](./js.md#custom-httphttps-agent-experimental-nodejs-only)                           |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>      | 使用基本身份验证凭据设置 `Authorization` 头。                     | `true`        | [HTTP 代理文档中的该设置用法](./js.md#custom-httphttps-agent-experimental-nodejs-only)              |
### URL 配置 {#url-configuration}

:::important
URL 配置 _总是_ 会覆盖硬编码的值，并且在这种情况下将记录警告。
:::

大多数客户端实例参数可以使用 URL 配置。URL 格式为 `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`。在几乎所有情况下，特定参数的名称反映其在配置选项接口中的路径，但有少数例外。支持以下参数：

| 参数                                         | 类型                                                             |
|---------------------------------------------|------------------------------------------------------------------|
| `pathname`                                  | 任意字符串。                                                     |
| `application_id`                            | 任意字符串。                                                     |
| `session_id`                                | 任意字符串。                                                     |
| `request_timeout`                           | 非负数。                                                         |
| `max_open_connections`                      | 非负数，大于零。                                                 |
| `compression_request`                       | 布尔值。见下文 (1)                                            |
| `compression_response`                      | 布尔值。                                                        |
| `log_level`                                 | 允许的值：`OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`。   |
| `keep_alive_enabled`                        | 布尔值。                                                        |
| `clickhouse_setting_*` 或 `ch_*`             | 见下文 (2)                                                     |
| (仅限 Node.js) `keep_alive_idle_socket_ttl` | 非负数。                                                         |

- (1) 对于布尔值，有效值为 `true`/`1` 和 `false`/`0`。
- (2) 任何以 `clickhouse_setting_` 或 `ch_` 开头的参数将删除此前缀，并将其余部分添加到客户端的 `clickhouse_settings`。例如，`?ch_async_insert=1&ch_wait_for_async_insert=1` 将相当于：

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

注意：对于 `clickhouse_settings` 的布尔值应在 URL 中以 `1`/`0` 传递。

- (3) 与 (2) 类似，但用于 `http_header` 配置。例如，`?http_header_x-clickhouse-auth=foobar` 将等同于：

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```
### 连接 {#connecting}
#### 收集您的连接详情 {#gather-your-connection-details}

<ConnectionDetails />
#### 连接概述 {#connection-overview}

客户端通过 HTTP(s) 协议实现连接。RowBinary 支持正在开发中，请参阅 [相关问题](https://github.com/ClickHouse/clickhouse-js/issues/216)。

以下示例演示如何针对 ClickHouse Cloud 设置连接。它假定 `url`（包括协议和端口）和 `password` 值通过环境变量指定，并使用 `default` 用户。

**示例：** 使用环境变量为配置创建 Node.js 客户端实例。

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

客户端仓库包含多个使用环境变量的示例，例如 [在 ClickHouse Cloud 中创建表](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)、[使用异步插入](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) 等等。
#### 连接池（仅限 Node.js） {#connection-pool-nodejs-only}

为了避免每次请求时建立连接的开销，客户端创建了一个 ClickHouse 的连接池以供重用，采用 Keep-Alive 机制。默认情况下，Keep-Alive 是启用的，连接池的大小设置为 `10`，但您可以通过 `max_open_connections` [配置选项](./js.md#configuration) 更改它。

除非用户设置 `max_open_connections: 1`，否则没有保证池中的相同连接将被用于后续查询。这很少需要，但在用户使用临时表的情况下可能需要。

另请参见：[保持活动配置](./js.md#keep-alive-configuration-nodejs-only)。
### 查询 ID {#query-id}

每个发送查询或语句（`command`、`exec`、`insert`、`select`）的方法将在结果中提供 `query_id`。此唯一标识符由客户端为每个查询分配，若启用了 [server configuration](/operations/server-configuration-parameters/settings)，则可能有助于从 `system.query_log` 中获取数据，或取消长时间运行的查询（请参见 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)）。如果需要，用户可以在 `command`/`query`/`exec`/`insert` 方法参数中覆盖 `query_id`。

:::tip
如果您覆盖 `query_id` 参数，请确保每次调用其唯一性。随机 UUID 是一个不错的选择。
:::
### 所有客户端方法的基础参数 {#base-parameters-for-all-client-methods}

有几个参数可以应用于所有客户端方法（[query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)）。

```ts
interface BaseQueryParams {
  // 可在查询级别应用的 ClickHouse 设置。
  clickhouse_settings?: ClickHouseSettings
  // 查询绑定的参数。
  query_params?: Record<string, unknown>
  // 用于取消正在进行的查询的 AbortSignal 实例。
  abort_signal?: AbortSignal
  // 查询 ID 覆盖；如果未指定，将自动生成随机标识符。
  query_id?: string
  // 会话 ID 覆盖；如果未指定，将从客户端配置中获取会话 ID。
  session_id?: string
  // 凭据覆盖；如果未指定，将使用客户端的凭据。
  auth?: { username: string, password: string }
  // 此查询要使用的特定角色列表。覆盖在客户端配置中设置的角色。
  role?: string | Array<string>
}
```
### 查询方法 {#query-method}

此方法用于大多数可以返回响应的语句，例如 `SELECT`，或用于发送 DDL（例如 `CREATE TABLE`），并且应等待对应结果。期望返回的结果集将在应用程序中消费。

:::note
存在专门的 [insert](./js.md#insert-method) 方法用于数据插入，以及 [command](./js.md#command-method) 用于 DDL。
:::

```ts
interface QueryParams extends BaseQueryParams {
  // 要执行的查询，可能返回一些数据。
  query: string
  // 结果数据集的格式。默认：JSON。
  format?: DataFormat
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>
}
```

另请参见：[所有客户端方法的基础参数](./js.md#base-parameters-for-all-client-methods)。

:::tip
请勿在 `query` 中指定 FORMAT 子句，请使用 `format` 参数代替。
:::
#### 结果集和行抽象 {#result-set-and-row-abstractions}

`ResultSet` 提供了一些方便的方法以处理您应用程序中的数据。

Node.js 的 `ResultSet` 实现使用 `Stream.Readable`，而网页版本使用 Web API 的 `ReadableStream`。

您可以通过调用 `text` 或 `json` 方法来消费 `ResultSet`，并将查询返回的所有行加载到内存中。

您应该尽快开始消费 `ResultSet`，因为它会保持响应流打开，从而使底层连接一直处于忙碌状态。客户端不会对传入的数据进行缓冲，以避免在应用程序中可能引起过多的内存使用。

或者，如果数据太大而无法一次性放入内存，您可以调用 `stream` 方法，并以流模式处理数据。每个响应块将被转换成相对较小的行数组（此数组的大小依赖于客户端从服务器接收的特定块的大小，可能会有所不同，以及单个行的大小），一次一个块。

请参考 [支持的数据格式](./js.md#supported-data-formats) 列表以确定在您的情况下流式传输的最佳格式。例如，如果您想流式传输 JSON 对象，可以选择 [JSONEachRow](/sql-reference/formats#jsoneachrow)，每行将被解析为 JS 对象，或者，或许选择更紧凑的 [JSONCompactColumns](/sql-reference/formats#jsoncompactcolumns)，结果将是每行一个紧凑的值数组。另请参阅：[流式文件](./js.md#streaming-files-nodejs-only)。

:::important
如果 `ResultSet` 或其流未被完全消费，它将在 `request_timeout` 非活动期后被销毁。
:::

```ts
interface BaseResultSet<Stream> {
  // 参见上面的“查询 ID”部分
  query_id: string

  // 消费整个流并获取内容作为字符串
  // 可以与任何数据格式一起使用
  // 应只调用一次
  text(): Promise<string>

  // 消费整个流并将内容解析为 JS 对象
  // 只能用于 JSON 格式
  // 应只调用一次
  json<T>(): Promise<T>

  // 返回可读流，用于可以流式传输的响应
  // 每次迭代都提供一个以所选数据格式的 Row[] 数组
  // 应只调用一次
  stream(): Stream
}

interface Row {
  // 以普通字符串获取行的内容
  text: string

  // 将行的内容解析为 JS 对象
  json<T>(): T
}
```

**示例：** (Node.js/Web) 数据集结果为 `JSONEachRow` 格式的查询，消费整个流并将内容解析为 JS 对象。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // 或 `row.text` 以避免解析 JSON
```

**示例：** (仅限 Node.js) 以 `JSONEachRow` 格式流式查询结果，使用经典的 `on('data')` 方法。此方法可与 `for await const` 语法互换。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // 或 JSONCompactEachRow、JSONStringsEachRow 等
})
const stream = rows.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.json()) // 或 `row.text` 以避免解析 JSON
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('完成！')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**示例：** (仅限 Node.js) 以 `CSV` 格式流式查询结果，使用经典的 `on('data')` 方法。此方法可与 `for await const` 语法互换。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'CSV', // 或 TabSeparated、CustomSeparated 等
})
const stream = resultSet.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.text)
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('完成！')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**示例：** (仅限 Node.js) 以 `JSONEachRow` 格式流式查询结果，使用 `for await const` 语法消费为 JS 对象。此方法可与经典的 `on('data')` 方法互换。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers LIMIT 10',
  format: 'JSONEachRow', // 或 JSONCompactEachRow、JSONStringsEachRow 等
})
for await (const rows of resultSet.stream()) {
  rows.forEach(row => {
    console.log(row.json())
  })
}
```

:::note
`for await const` 语法的代码量比 `on('data')` 方法少，但可能会对性能产生负面影响。
有关更多细节，请参见 [Node.js 仓库中的此问题](https://github.com/nodejs/node/issues/31979)。
:::

**示例：** (仅限 Web) 对对象的 `ReadableStream` 进行迭代。

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

返回类型很小，因为我们不期望从服务器返回任何数据并立即耗尽响应流。

如果向插入方法提供了空数组，则不会向服务器发送插入语句；而是该方法将立即解析为 `{ query_id: '...', executed: false }`。如果在这种情况下未在方法参数中提供 `query_id`，则结果将是一个空字符串，因为返回客户端生成的随机 UUID 可能会造成混淆，因为带有该 `query_id` 的查询在 `system.query_log` 表中不存在。

如果插入语句已发送到服务器，则 `executed` 标志将为 `true`。
#### 插入方法和 Node.js 中的流 {#insert-method-and-streaming-in-nodejs}

它可以与 `Stream.Readable` 或普通的 `Array<T>` 一起使用，具体取决于指定给 `insert` 方法的 [数据格式](./js.md#supported-data-formats)。另请参阅这一部分关于 [文件流](./js.md#streaming-files-nodejs-only)。

插入方法应该被等待；然而，可以指定一个输入流，并在流结束后再等待 `insert` 操作（这也会解析 `insert` promise）。这可能对事件监听器和类似的场景很有用，但错误处理可能会比较复杂，有许多边缘情况出现在客户端。相反，考虑使用 [异步插入](/optimize/asynchronous-inserts)，如 [这个示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts) 所示。

:::tip
如果您有一个难以通过此方法建模的自定义 INSERT 语句，考虑使用 [命令方法](./js.md#command-method)。 

您可以在 [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) 或 [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) 示例中看到它是如何使用的。
:::

```ts
interface InsertParams<T> extends BaseQueryParams {
  // 插入数据的表名称
  table: string
  // 要插入的数据集。
  values: ReadonlyArray<T> | Stream.Readable
  // 要插入的数据集的格式。
  format?: DataFormat
  // 允许指定数据将插入到哪些列中。
  // - 像 `['a', 'b']` 这样的数组将生成：`INSERT INTO table (a, b) FORMAT DataFormat`
  // - 像 `{ except: ['a', 'b'] }` 这样的对象将生成：`INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // 默认情况下，数据插入到表的所有列中，
  // 生成的语句将是：`INSERT INTO table FORMAT DataFormat`。
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

另请参阅：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

:::important
用 `abort_signal` 取消的请求并不能保证数据未被插入，因为服务器在取消之前可能已经接收到了一些流数据。
:::

**示例：** (Node.js/Web) 插入一个值数组。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
await client.insert({
  table: 'my_table',
  // 结构应该与所需格式匹配，此示例中的 JSONEachRow
  values: [
    { id: 42, name: 'foo' },
    { id: 42, name: 'bar' },
  ],
  format: 'JSONEachRow',
})
```

**示例：** (仅限 Node.js) 从 CSV 文件插入一个流。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。另请参阅：[文件流](./js.md#streaming-files-nodejs-only)。

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**示例**: 从插入语句中排除某些列。

假设有以下表定义：

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

仅插入特定列：

```ts
// 生成的语句：INSERT INTO mytable (message) FORMAT JSONEachRow
await client.insert({
  table: 'mytable',
  values: [{ message: 'foo' }],
  format: 'JSONEachRow',
  // 该行的 `id` 列值将为零（UInt32 的默认值）
  columns: ['message'],
})
```

排除某些列：

```ts
// 生成的语句：INSERT INTO mytable (* EXCEPT (message)) FORMAT JSONEachRow
await client.insert({
  table: tableName,
  values: [{ id: 144 }],
  format: 'JSONEachRow',
  // 该行的 `message` 列值将为空字符串
  columns: {
    except: ['message'],
  },
})
```

有关更多细节，请查看 [源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts)。

**示例**: 插入到与提供给客户端实例不同的数据库中。 [源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: 'mydb.mytable', // 完全限定名称，包括数据库
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```
#### Web 版本的限制 {#web-version-limitations}

目前，`@clickhouse/client-web` 中的插入仅适用于 `Array<T>` 和 `JSON*` 格式。
由于浏览器兼容性较差，Web 版本尚不支持插入流。

因此，Web 版本的 `InsertParams` 接口与 Node.js 版本略有不同， 
因为 `values` 限制为 `ReadonlyArray<T>` 类型：

```ts
interface InsertParams<T> extends BaseQueryParams {
  // 插入数据的表名称
  table: string
  // 要插入的数据集。
  values: ReadonlyArray<T>
  // 要插入的数据集的格式。
  format?: DataFormat
  // 允许指定数据将插入到哪些列中。
  // - 像 `['a', 'b']` 这样的数组将生成：`INSERT INTO table (a, b) FORMAT DataFormat`
  // - 像 `{ except: ['a', 'b'] }` 这样的对象将生成：`INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // 默认情况下，数据插入到表的所有列中，
  // 生成的语句将是：`INSERT INTO table FORMAT DataFormat`。
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

未来可能会有所改动。另请参阅：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。
### 命令方法 {#command-method}

它可用于没有任何输出的语句，当格式子句不适用，或者当您根本不关注响应时。这样的语句的例子可以是 `CREATE TABLE` 或 `ALTER TABLE`。

应被等待。

响应流会立即被销毁，这意味着底层的套接字被释放。

```ts
interface CommandParams extends BaseQueryParams {
  // 要执行的语句。
  query: string
}

interface CommandResult {
  query_id: string
}

interface ClickHouseClient {
  command(params: CommandParams): Promise<CommandResult>
}
```

另请参阅：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

**示例：** (Node.js/Web) 在 ClickHouse Cloud 中创建一个表。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)。

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // 建议在集群使用时使用，以避免在响应代码之后发生查询处理错误的情况， 
  // 并且 HTTP 头已经发送到客户端。
  // 请参见 https://clickhouse.com/docs/interfaces/http/#response-buffering
  clickhouse_settings: {
    wait_end_of_query: 1,
  },
})
```

**示例：** (Node.js/Web) 在自托管的 ClickHouse 实例中创建一个表。 
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

**示例：** (Node.js/Web) 从选择插入。

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`,
})
```

:::important
用 `abort_signal` 取消的请求并不能保证服务器没有执行该语句。
:::
### 执行方法 {#exec-method}

如果您有一个不适合 `query`/`insert` 的自定义查询，并且您对此结果感兴趣，则可以使用 `exec` 作为 `command` 的替代。

`exec` 返回一个可读流，必须在应用程序一侧消费或销毁。

```ts
interface ExecParams extends BaseQueryParams {
  // 要执行的语句。
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

另请参阅：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

流返回类型在 Node.js 和 Web 版本中不同。

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
### Ping {#ping}

提供的 `ping` 方法用于检查连接状态，如果服务器可以访问，则返回 `true`。 

如果服务器无法访问，则底层错误也包含在结果中。

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }

interface ClickHouseClient {
  ping(): Promise<PingResult>
}
```

Ping 可能是检查服务器在应用程序启动时是否可用的有用工具，特别是在 ClickHouse Cloud 中，实例可能处于空闲状态，会在 ping 后唤醒。

**示例：** (Node.js/Web) Ping 一个 ClickHouse 服务器实例。注意：对于 Web 版本，捕获的错误将不同。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // 处理 result.error
}
```

注意：由于 `/ping` 端点没有实现 CORS，Web 版本使用简单的 `SELECT 1` 来实现类似的结果。
### 关闭（仅限 Node.js） {#close-nodejs-only}

关闭所有打开的连接并释放资源。在 Web 版本中无操作。

```ts
await client.close()
```
## 流文件（仅限 Node.js） {#streaming-files-nodejs-only}

在客户端库中有几个文件流示例，使用流行的数据格式（NDJSON、CSV、Parquet）。

- [从 NDJSON 文件流](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [从 CSV 文件流](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [从 Parquet 文件流](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [流入 Parquet 文件](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

将其他格式流入文件应与 Parquet 类似， 
唯一的区别将在于用于 `query` 调用的格式（`JSONEachRow`、`CSV` 等）以及输出文件名。
## 支持的数据格式 {#supported-data-formats}

客户端将数据格式处理为 JSON 或文本。

如果将 `format` 指定为 JSON 系列之一（`JSONEachRow`、`JSONCompactEachRow` 等），则客户端将在通信过程中对数据进行序列化和反序列化。

以“原始”文本格式（`CSV`、`TabSeparated` 和 `CustomSeparated` 系列）提供的数据将以原样发送，而不会进行额外的转换。

:::tip
在 JSON 作为通用格式和 [ClickHouse JSON 格式](/sql-reference/formats#json) 之间可能会产生混淆。 

客户端支持使用像 [JSONEachRow](/sql-reference/formats#jsoneachrow) 这样的格式流式处理 JSON 对象（请参阅表概述以获取其他流友好的格式；另请参阅客户端库中的 `select_streaming_` [示例](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)）。 

只不过像 [ClickHouse JSON](/sql-reference/formats#json) 和其他一些格式在响应中表示为一个单一对象，客户端无法流式处理。
:::

| 格式                                     | 输入（数组） | 输入（对象） | 输入/输出（流） | 输出（JSON） | 输出（文本）  |
|--------------------------------------------|---------------|----------------|-----------------------|---------------|----------------|
| JSON                                       | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONCompact                                | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONObjectEachRow                          | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONColumnsWithMetadata                    | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONStrings                                | ❌             | ❌️             | ❌                     | ✔️            | ✔️             |
| JSONCompactStrings                         | ❌             | ❌              | ❌                     | ✔️            | ✔️             |
| JSONEachRow                                | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONEachRowWithProgress                    | ❌️            | ❌              | ✔️ ❗- 见下文       | ✔️            | ✔️             |
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

对于 Parquet，选择的主要用例可能是将结果流写入文件。请参见 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts) 中的示例。

`JSONEachRowWithProgress` 是一种仅输出格式，支持流中的进度报告。有关更多细节，请参见 [此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)。

ClickHouse 输入和输出格式的完整列表可在 
[这里](/interfaces/formats) 找到。
## 支持的 ClickHouse 数据类型 {#supported-clickhouse-data-types}

:::note
相关的 JS 类型适用于任何 `JSON*` 格式，除了那些将所有内容表示为字符串的格式（例如 `JSONStringEachRow`）
:::

| 类型               | 状态          | JS 类型                    |
|--------------------|-----------------|----------------------------|
| UInt8/16/32        | ✔️              | number                     |
| UInt64/128/256     | ✔️ ❗- 见下文 | string                     |
| Int8/16/32         | ✔️              | number                     |
| Int64/128/256      | ✔️ ❗- 见下文 | string                     |
| Float32/64         | ✔️              | number                     |
| Decimal            | ✔️ ❗- 见下文 | number                     |
| Boolean            | ✔️              | boolean                    |
| String             | ✔️              | string                     |
| FixedString        | ✔️              | string                     |
| UUID               | ✔️              | string                     |
| Date32/64          | ✔️              | string                     |
| DateTime32/64      | ✔️ ❗- 见下文 | string                     |
| Enum               | ✔️              | string                     |
| LowCardinality     | ✔️              | string                     |
| Array(T)           | ✔️              | T[]                        |
| (new) JSON         | ✔️              | object                     |
| Variant(T1, T2...) | ✔️              | T (取决于变体)           |
| Dynamic            | ✔️              | T (取决于变体)           |
| Nested             | ✔️              | T[]                        |
| Tuple              | ✔️              | Tuple                      |
| Nullable(T)        | ✔️              | T或null 的 JS 类型        |
| IPv4               | ✔️              | string                     |
| IPv6               | ✔️              | string                     |
| Point              | ✔️              | [ number, number ]         |
| Ring               | ✔️              | Array&lt;Point\>              |
| Polygon            | ✔️              | Array&lt;Ring\>               |
| MultiPolygon       | ✔️              | Array&lt;Polygon\>            |
| Map(K, V)          | ✔️              | Record&lt;K, V\>              |

ClickHouse 支持的格式的完整列表可在 
[这里](/sql-reference/data-types/) 找到。
### 日期/Date32 类型的注意事项 {#datedate32-types-caveats}

由于客户端在插入值时没有额外的类型转换，`Date`/`Date32` 类型的列只能作为字符串插入。

**示例：** 插入 `Date` 类型值。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts) 。

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

然而，如果您使用的是 `DateTime` 或 `DateTime64` 列，您可以使用字符串和 JS Date 对象。可以直接将 JS Date 对象传递给 `insert`，并将 `date_time_input_format` 设置为 `best_effort`。有关更多细节，请参见 [这个示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts)。
### Decimal* 类型的注意事项 {#decimal-types-caveats}

可以使用 `JSON*` 系列格式插入 Decimals。假设我们有一个表定义如下：

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

我们可以使用字符串表示法插入值而没有精度损失：

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

然而，在以 `JSON*` 格式查询数据时，ClickHouse 会默认将 Decimals 返回为 _数字_，这可能会导致精度损失。为避免此情况，您可以在查询中将 Decimals 转换为字符串：

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

有关更多细节，请参见 [这个示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts)。
### 整数类型：Int64、Int128、Int256、UInt64、UInt128、UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

尽管服务器可以将其作为数字接受，但在 `JSON*` 系列输出格式中返回时，它会作为字符串返回，以避免整数溢出，因为这些类型的最大值大于 `Number.MAX_SAFE_INTEGER`。

然而，这种行为可以通过 [`output_format_json_quote_64bit_integers` 设置](/operations/settings/formats#output_format_json_quote_64bit_integers) 进行修改。

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

客户端可以通过 [设置](/operations/settings/settings/) 机制调整 ClickHouse 的行为。
可在客户端实例级别设置设置，以便在发送到 ClickHouse 的每个请求中应用：

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

有关所有受支持的 ClickHouse 设置的类型声明文件可以在 
[这里](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts) 找到。

:::important
确保以该用户身份执行查询的用户拥有更改设置的足够权限。
:::
## 高级主题 {#advanced-topics}
### 带参数的查询 {#queries-with-parameters}

您可以创建一个带参数的查询，并从客户端应用程序传递值给它。这可以避免在客户端格式化查询时包含具体的动态值。

像往常一样格式化查询，然后将要从应用程序参数传递给查询的值放在大括号中，格式如下：

```text
{<name>: <data_type>}
```

其中：

- `name` — 占位符标识符。
- `data_type` - [数据类型](/sql-reference/data-types/) 的应用参数值。

**示例：** 使用参数的查询。 
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

有关更多详细信息，请访问 https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax。
### 压缩 {#compression}

注意：请求压缩目前在 Web 版本中不可用。响应压缩正常工作。Node.js 版本支持两者。

处理大量数据集的数据应用程序可以通过启用压缩受益。当前，仅支持 `GZIP`，使用 [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html)。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

配置参数为：

- `response: true` 指示 ClickHouse 服务器以压缩的响应主体响应。默认值：`response: false`
- `request: true` 在客户端请求主体上启用压缩。默认值：`request: false`
### 日志记录（仅限 Node.js） {#logging-nodejs-only}

:::important
日志记录是实验性功能，未来可能会更改。
:::

默认的日志记录实现通过 `console.debug/info/warn/error` 方法将日志记录到 `stdout`。
您可以通过提供 `LoggerClass` 来自定义日志记录逻辑，并通过 `level` 参数选择所需的日志级别（默认值为 `OFF`）：

```typescript
import type { Logger } from '@clickhouse/client'

// 所有三种 LogParams 类型均由客户端导出
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

- `TRACE` - 有关保持活动套接字生命周期的低级信息
- `DEBUG` - 响应信息（不包括授权头和主机信息）
- `INFO` - 大多未使用，初始化客户端时将打印当前日志级别
- `WARN` - 非致命错误；失败的 `ping` 请求记录为警告，底层错误包括在返回的结果中
- `ERROR` - 来自 `query`/`insert`/`exec`/`command` 方法的致命错误，例如请求失败

您可以在 [这里](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts) 找到默认的 Logger 实现。
### TLS 证书（仅限 Node.js） {#tls-certificates-nodejs-only}

Node.js 客户端可以选择支持基础（仅证书颁发机构）和互相（证书颁发机构和客户端证书）TLS。

基础 TLS 配置示例，假设您的证书在 `certs` 文件夹中，并且 CA 文件名为 `CA.pem`：

```ts
const client = createClient({
  url: 'https://<hostname>:<port>',
  username: '<username>',
  password: '<password>', // 如果需要
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

有关完整的 [基础](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) 和 [互相](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS 示例，请参阅该库。
### Keep-Alive 配置（仅限 Node.js） {#keep-alive-configuration-nodejs-only}

客户端默认在底层 HTTP 代理中启用 Keep-Alive，这意味着连接的套接字将在后续请求中重用，并且将发送 `Connection: keep-alive` 头。闲置的套接字将在默认情况下保持在连接池中 2500 毫秒（请参阅 [调整此选项的说明](./js.md#adjusting-idle_socket_ttl)）。

`keep_alive.idle_socket_ttl` 应该设置为比服务器/LB 配置低很多的值。主要原因是由于 HTTP/1.1 允许服务器在不通知客户端的情况下关闭套接字，如果服务器或负载均衡器在客户端之前关闭连接，客户端可能会尝试重用关闭的套接字，从而导致 `socket hang up` 错误。

如果您要调整 `keep_alive.idle_socket_ttl`，请记住，它应始终与服务器/LB 的 Keep-Alive 配置保持同步，并且应该始终低于该值，以确保服务器不会先关闭打开的连接。
#### 调整 `idle_socket_ttl` {#adjusting-idle_socket_ttl}

客户端将 `keep_alive.idle_socket_ttl` 设置为 2500 毫秒，因为可以视为最安全的默认设置；在服务器端，`keep_alive_timeout` 在 ClickHouse 版本 23.11 之前可能被设置为 [低至 3 秒](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1)，而无需 `config.xml` 修改。

:::warning
如果您对性能很满意且没有遇到任何问题，建议 **不** 增加 `keep_alive.idle_socket_ttl` 设置的值，因为这可能会导致潜在的“套接字挂起”错误；另外，如果您的应用程序发送大量查询而两者之间没有太多停机时间，则默认值应该足够，因为套接字在长时间闲置之前不会闲置，客户端将保持它们在池中。
:::

您可以通过运行以下命令查找正确的 Keep-Alive 超时值：

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

检查响应中的 `Connection` 和 `Keep-Alive` 头的值。例如：

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

在此情况下，`keep_alive_timeout` 为 10 秒，您可以尝试将 `keep_alive.idle_socket_ttl` 增加到 9000 或甚至 9500 毫秒，以保持闲置套接字开放的时间比默认值长一些。密切关注潜在的“套接字挂起”错误，这将表示服务器在客户端之前关闭连接，并降低值，直到错误消失。
#### Keep-Alive 故障排除 {#keep-alive-troubleshooting}

如果您在使用 Keep-Alive 时遇到 `socket hang up` 错误，可以考虑以下选项来解决此问题：

* 在 ClickHouse 服务器配置中稍微减少 `keep_alive.idle_socket_ttl` 设置。在某些情况下，例如客户端与服务器之间的网络延迟较高，减少 `keep_alive.idle_socket_ttl` 200-500 毫秒可能是有益的，以排除一个即将由服务器关闭的 socket 被外出的请求获取的情况。

* 如果这个错误发生在没有数据进出的长时间运行的查询中（例如，一次长时间运行的 `INSERT FROM SELECT`），这可能是因为负载均衡器关闭了空闲连接。您可以尝试通过使用以下 ClickHouse 设置的组合，强制在长时间运行的查询中有一些数据进来：

  ```ts
  const client = createClient({
    // 在这里我们假设会有一些执行时间超过 5 分钟的查询
    request_timeout: 400_000,
    /** 这些设置的组合可以避免在没有数据进出时，长时间运行的查询中出现 LB 超时问题，
     *  例如 `INSERT FROM SELECT` 和类似的查询，因为连接可能被 LB 标记为空闲并被突然关闭。
     *  在这种情况下，我们假设 LB 的空闲连接超时时间是 120 秒，所以我们设置 110 秒作为“安全”值。 */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: '110000', // UInt64, 应作为字符串传入
    },
  })
  ```
  然而请记住，最近的 Node.js 版本中接收的头的总大小有 16KB 限制；在接收到的进度头达到一定数量后（在我们的测试中约为 70-80），将生成异常。

  也可以采用一种完全不同的方法，完全避免在网络上等待时间；这可以通过利用 HTTP 接口的“功能”来实现，即在连接丢失时不会取消变更。有关更多详细信息，请参见 [这个示例（第2部分）](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts)。

* 可以完全禁用 Keep-Alive 功能。在这种情况下，客户端也会在每个请求中添加 `Connection: close` 头，底层 HTTP 代理将不会重用连接。`keep_alive.idle_socket_ttl` 设置将被忽略，因为将没有空闲的 sockets。这将导致额外的开销，因为每个请求将建立新的连接。

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```
### 只读用户 {#read-only-users}

当使用带有 [readonly=1 用户](/operations/settings/permissions-for-queries#readonly) 的客户端时，无法启用响应压缩，因为这需要 `enable_http_compression` 设置。以下配置将导致错误：

```ts
const client = createClient({
  compression: {
    response: true, // 在 readonly=1 用户下无效
  },
})
```

有关 readonly=1 用户限制的更多说明，请参见 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)。
### 带有路径名的代理 {#proxy-with-a-pathname}

如果您的 ClickHouse 实例位于代理后面，并且 URL 中有路径名，比如 http://proxy:8123/clickhouse_server，请将 `clickhouse_server` 指定为 `pathname` 配置选项（可有可无的前导斜杠）；否则，如果直接在 `url` 中提供，它将被视为 `database` 选项。支持多个段，例如 `/my_proxy/db`。

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```
### 带身份验证的反向代理 {#reverse-proxy-with-authentication}

如果您的 ClickHouse 部署前有一个带身份验证的反向代理，可以使用 `http_headers` 设置提供必要的头：

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```
### 自定义 HTTP/HTTPS 代理（实验性，仅限 Node.js） {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
这是一个实验性特性，未来的版本中可能会以不兼容的方式更改。客户端提供的默认实现和设置对于大多数用例来说应该是足够的。仅在您确定需要时使用此功能。
:::

默认情况下，客户端将使用在客户端配置中提供的设置（例如 `max_open_connections`、 `keep_alive.enabled`、 `tls`）配置底层 HTTP(s) 代理，该代理将处理与 ClickHouse 服务器的连接。此外，如果使用 TLS 证书，则底层代理将配置必要的证书，并强制执行正确的 TLS 身份验证头。

在 1.2.0 版本之后，可以为客户端提供自定义 HTTP(s) 代理，以替换默认的底层代理。在复杂的网络配置情况下，这可能很有用。如果提供了自定义代理，将会应用以下条件：
- `max_open_connections` 和 `tls` 选项将 _不生效_ 并将被客户端忽略，因为它是底层代理配置的一部分。
- `keep_alive.enabled` 将只调节 `Connection` 头的默认值（`true` -> `Connection: keep-alive`，`false` -> `Connection: close`）。
- 虽然空闲 keep-alive socket 管理仍然有效（因为它不与代理相关，而是与特定 socket 本身相关），现在可以通过将 `keep_alive.idle_socket_ttl` 值设置为 `0` 来完全禁用它。
#### 自定义代理用例示例 {#custom-agent-usage-examples}

使用不带证书的自定义 HTTP(s) 代理：

```ts
const agent = new http.Agent({ // 或 https.Agent
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10,
})
const client = createClient({
  http_agent: agent,
})
```

使用带基本 TLS 和 CA 证书的自定义 HTTPS 代理：

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
  // 对于自定义 HTTPS 代理，客户端不会使用默认的 HTTPS 连接实现；头应手动提供
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
  },
  // 注意：授权头与 TLS 头冲突；请禁用它。
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
  // 对于自定义 HTTPS 代理，客户端不会使用默认的 HTTPS 连接实现；头应手动提供
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
    'X-ClickHouse-SSL-Certificate-Auth': 'on',
  },
  // 注意：授权头与 TLS 头冲突；请禁用它。
  set_basic_auth_header: false,
})
```

使用证书 _和_ 自定义 _HTTPS_ 代理，可能需要通过 `set_basic_auth_header` 设置（在 1.2.0 中引入）禁用默认的授权头，因为它与 TLS 头冲突。所有的 TLS 头应手动提供。
## 已知限制 (Node.js/Web) {#known-limitations-nodejsweb}

- 结果集没有数据映射器，因此仅使用语言原始类型。计划添加某些数据类型映射器和 [RowBinary 格式支持](https://github.com/ClickHouse/clickhouse-js/issues/216)。
- 有一些 [Decimal* 和 Date* / DateTime* 数据类型的注意事项](./js.md#datedate32-types-caveats)。
- 使用 JSON* 家族格式时，超出 Int32 的数字以字符串形式呈现，因为 Int64+ 类型的最大值大于 `Number.MAX_SAFE_INTEGER`。有关更多详细信息，请参见 [Integral types](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) 部分。
## 已知限制 (Web) {#known-limitations-web}

- 选择查询的流式传输有效，但在插入（在类型级别也禁用）时无效。
- 请求压缩已禁用，配置被忽略。响应压缩有效。
- 尚无日志支持。
## 性能优化建议 {#tips-for-performance-optimizations}

- 为了减少应用程序的内存消耗，考虑在适用时使用流进行大规模插入（例如，从文件）和选择。对于事件监听器和类似用例，[异步插入](/optimize/asynchronous-inserts) 可能是另一个不错的选择，这样可以最小化，甚至完全避免客户端的批处理。异步插入示例可在 [客户端库](https://github.com/ClickHouse/clickhouse-js/tree/main/examples) 中找到，文件名以 `async_insert_` 为前缀。
- 客户端默认不启用请求或响应压缩。但是，在选择或插入大型数据集时，您可以考虑通过 `ClickHouseClientConfigOptions.compression` 启用它（针对 `request` 或 `response`，或两者）。
- 压缩会带来显著的性能损失。启用 `request` 或 `response` 将对选择或插入的速度产生负面影响，但会减少应用程序传输的网络流量。
## 联系我们 {#contact-us}

如果您有任何问题或需要帮助，请随时在 [社区 Slack](https://clickhouse.com/slack) (`#clickhouse-js` 频道) 或通过 [GitHub 问题](https://github.com/ClickHouse/clickhouse-js/issues) 联系我们。
