---
sidebar_label: 'JavaScript'
sidebar_position: 4
keywords: ['clickhouse', 'js', 'JavaScript', 'NodeJS', 'web', 'browser', 'Cloudflare', 'workers', 'client', 'connect', 'integrate']
slug: /integrations/javascript
description: '用于连接 ClickHouse 的官方 JavaScript 客户端。'
title: 'ClickHouse JS'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-js'
---

import ConnectionDetails from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# ClickHouse JS {#clickhouse-js}

用于连接 ClickHouse 的官方 JS 客户端。
该客户端使用 TypeScript 编写，并为客户端公开 API 提供类型定义。

它没有任何依赖项，针对性能进行了优化，并已在多种 ClickHouse 版本和配置（本地单节点、本地集群以及 ClickHouse Cloud）下完成测试。

针对不同的运行环境，有两个不同版本的客户端可用：

- `@clickhouse/client` - 仅适用于 Node.js
- `@clickhouse/client-web` - 浏览器（Chrome/Firefox）、Cloudflare Workers

在使用 TypeScript 时，请确保版本至少为 [4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)，该版本启用了[内联导入与导出语法](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)。

客户端的源代码可在 [ClickHouse-JS GitHub 仓库](https://github.com/ClickHouse/clickhouse-js)中获取。

## 环境要求（Node.js） {#environment-requirements-nodejs}

环境中必须安装 Node.js 才能运行客户端。
该客户端兼容所有[仍在维护的](https://github.com/nodejs/release#readme) Node.js 版本。

一旦某个 Node.js 版本接近生命周期结束（EOL，End-of-Life），客户端将停止对其提供支持，因为它被视为已过时且不安全。

当前对以下 Node.js 版本提供支持：

| Node.js version | Supported?  |
|-----------------|-------------|
| 24.x            | ✔           |
| 22.x            | ✔           |
| 20.x            | ✔           |
| 18.x            | 尽力支持    |

## 环境要求（Web） {#environment-requirements-web}

客户端的 Web 版本已在最新版本的 Chrome 和 Firefox 浏览器上通过官方测试，可以作为依赖集成到 React、Vue、Angular 等应用程序或 Cloudflare Workers 中使用。

## 安装 {#installation}

要安装最新稳定版的 Node.js 客户端，请运行：

```sh
npm i @clickhouse/client
```

Web 版安装：

```sh
npm i @clickhouse/client-web
```

## 与 ClickHouse 的兼容性 {#compatibility-with-clickhouse}

| Client version | ClickHouse |
|----------------|------------|
| 1.12.0         | 24.8+      |

客户端很可能也能与更旧的版本配合使用；但这类兼容性仅按尽力而为原则提供支持，不作任何保证。如果您的 ClickHouse 版本早于 23.3，请参阅 [ClickHouse 安全策略](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) 并考虑升级。

## 示例 {#examples}

我们希望通过客户端仓库中的[示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples)覆盖各种客户端使用场景。

示例概览请参见[示例 README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview)。 

如果示例或下文文档中有任何不清楚或缺失的内容，欢迎[联系我们](./js.md#contact-us)。

### 客户端 API {#client-api}

除非另有说明，否则大多数示例应同时适用于 Node.js 和 Web 版客户端。

#### 创建客户端实例 {#creating-a-client-instance}

你可以根据需要使用 `createClient` 工厂创建任意数量的客户端实例：

```ts
import { createClient } from '@clickhouse/client' // or '@clickhouse/client-web'

const client = createClient({
  /* 配置 */
})
```

如果当前环境不支持 ESM 模块，则可以改用 CJS 语法：

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* 配置 */
})
```

客户端实例可以在创建时进行[预配置](./js.md#configuration)。

#### 配置 {#configuration}

在创建客户端实例时，可以调整以下连接设置：

| 设置项                                                                   | 说明                                                                                   | 默认值                  | 相关内容                                                                                   |
|--------------------------------------------------------------------------|----------------------------------------------------------------------------------------|-------------------------|--------------------------------------------------------------------------------------------|
| **url**?: string                                                         | ClickHouse 实例的 URL。                                                                | `http://localhost:8123` | [URL 配置文档](./js.md#url-configuration)                                                 |
| **pathname**?: string                                                    | 可选的路径名，在客户端解析 ClickHouse URL 之后追加。                                  | `''`                    | [带 pathname 的代理文档](./js.md#proxy-with-a-pathname)                                   |
| **request_timeout**?: number                                             | 请求超时时间（毫秒）。                                                                 | `30_000`                | -                                                                                          |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }`    | 启用压缩。                                                                             | -                       | [压缩文档](./js.md#compression)                                                           |
| **username**?: string                                                    | 代表其发起请求的用户名。                                                               | `default`               | -                                                                                          |
| **password**?: string                                                    | 用户密码。                                                                             | `''`                    | -                                                                                          |
| **application**?: string                                                 | 使用该 Node.js 客户端的应用名称。                                                      | `clickhouse-js`         | -                                                                                          |
| **database**?: string                                                    | 要使用的数据库名称。                                                                   | `default`               | -                                                                                          |
| **clickhouse_settings**?: ClickHouseSettings                             | 应用于所有请求的 ClickHouse 设置。                                                     | `{}`                    | -                                                                                          |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 客户端内部日志配置。                                                                   | -                       | [日志记录文档](./js.md#logging-nodejs-only)                                               |
| **session_id**?: string                                                  | 可选的 ClickHouse 会话 ID，会随每个请求一起发送。                                     | -                       | -                                                                                          |
| **keep_alive**?: `{ **enabled**?: boolean }`                             | 在 Node.js 和 Web 版本中默认启用。                                                     | -                       | -                                                                                          |
| **http_headers**?: `Record<string, string>`                              | 发往 ClickHouse 的请求所附加的额外 HTTP 头部。                                         | -                       | [带认证的反向代理文档](./js.md#reverse-proxy-with-authentication)                         |
| **roles**?: string \|  string[]                                          | 要附加到出站请求的 ClickHouse 角色名称。                                               | -                       | [在 HTTP 接口中使用角色](/interfaces/http#setting-role-with-query-parameters)             |

#### Node.js 专用配置参数 {#nodejs-specific-configuration-parameters}

| Setting                                                                    | Description                                            | Default Value | See Also                                                                                             |
|----------------------------------------------------------------------------|--------------------------------------------------------|---------------|------------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                          | 每个主机允许的最大连接套接字数。                      | `10`          | -                                                                                                    |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`   | 配置 TLS 证书。                                        | -             | [TLS 文档](./js.md#tls-certificates-nodejs-only)                                                     |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                      | -             | [Keep Alive 文档](./js.md#keep-alive-configuration-nodejs-only)                                      |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>       | 为客户端自定义 HTTP agent。                            | -             | [HTTP agent 文档](./js.md#custom-httphttps-agent-experimental-nodejs-only)                           |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>              | 使用 Basic Auth 凭证设置 `Authorization` 头。          | `true`        | [在 HTTP agent 文档中查看此设置的用法](./js.md#custom-httphttps-agent-experimental-nodejs-only)      |

### URL 配置 {#url-configuration}

:::important
在这种情况下，URL 配置将*始终*覆盖硬编码的值，并记录一条警告日志。
:::

可以通过 URL 配置大多数客户端实例参数。URL 格式为 `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`。在几乎所有情况下，特定参数的名称都对应其在配置选项接口中的路径，只有少数例外。支持以下参数：

| Parameter                                 | Type                                              |
| ----------------------------------------- | ------------------------------------------------- |
| `pathname`                                | 任意字符串。                                            |
| `application_id`                          | 任意字符串。                                            |
| `session_id`                              | 任意字符串。                                            |
| `request_timeout`                         | 非负数。                                              |
| `max_open_connections`                    | 非负数且大于零。                                          |
| `compression_request`                     | 布尔值。见下文 (1)                                       |
| `compression_response`                    | 布尔值。                                              |
| `log_level`                               | 可选值为：`OFF`、`TRACE`、`DEBUG`、`INFO`、`WARN`、`ERROR`。 |
| `keep_alive_enabled`                      | 布尔值。                                              |
| `clickhouse_setting_*` or `ch_*`          | 见下文 (2)                                           |
| `http_header_*`                           | 见下文 (3)                                           |
| (仅限 Node.js) `keep_alive_idle_socket_ttl` | 非负数。                                              |

* (1) 对于布尔值，合法取值为 `true`/`1` 和 `false`/`0`。
* (2) 任何以 `clickhouse_setting_` 或 `ch_` 为前缀的参数，其前缀会被移除，剩余部分会被添加到客户端的 `clickhouse_settings` 中。例如，`?ch_async_insert=1&ch_wait_for_async_insert=1` 将等同于：

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

注意：`clickhouse_settings` 的布尔值在 URL 中应以 `1`/`0` 传递。

* (3) 与 (2) 类似，但用于 `http_header` 配置。例如，`?http_header_x-clickhouse-auth=foobar` 等价于：

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```

### 连接 {#connecting}

#### 收集连接信息 {#gather-your-connection-details}

<ConnectionDetails />

#### 连接概述 {#connection-overview}

客户端通过 HTTP(s) 协议建立连接。对 RowBinary 的支持正在推进中，参见[相关 issue](https://github.com/ClickHouse/clickhouse-js/issues/216)。

下面的示例演示如何配置与 ClickHouse Cloud 的连接。假定通过环境变量提供 `url`（包含协议和端口）和 `password` 的值，并使用 `default` 用户。

**示例：** 使用环境变量进行配置来创建一个 Node.js 客户端实例。

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

客户端代码仓库包含多个使用环境变量的示例，例如[在 ClickHouse Cloud 中创建表](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)、[使用异步插入](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts)等。

#### 连接池（仅限 Node.js） {#connection-pool-nodejs-only}

为避免为每个请求重新建立连接所带来的开销，客户端会创建一个到 ClickHouse 的连接池以复用连接，并利用 Keep-Alive 机制。默认情况下 Keep-Alive 是启用的，连接池大小为 `10`，但你可以通过 `max_open_connections` [配置项](./js.md#configuration) 来修改它。 

无法保证池中的同一个连接会被后续查询重复使用，除非用户将 `max_open_connections` 设置为 `1`。这种情况较为少见，但在使用临时表的场景中可能是必需的。

另请参阅：[Keep-Alive 配置](./js.md#keep-alive-configuration-nodejs-only)。

### 查询 ID {#query-id}

每个发送查询或语句（`command`、`exec`、`insert`、`select`）的方法都会在结果中返回 `query_id`。该唯一标识符由客户端为每个查询分配，如果在[服务器配置](/operations/server-configuration-parameters/settings)中启用了 `system.query_log`，则可以用于根据该 ID 从日志中获取数据，或者用于取消长时间运行的查询（参见[示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)）。如有需要，用户可以在 `command`/`query`/`exec`/`insert` 方法的参数中自定义 `query_id`。

:::tip
如果要自定义 `query_id` 参数，需要确保它在每次调用时都是唯一的。随机 UUID 是一个不错的选择。
:::

### 所有客户端方法的基本参数 {#base-parameters-for-all-client-methods}

有一些参数可适用于所有客户端方法（[query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)）。

```ts
interface BaseQueryParams {
  // 可在查询级别应用的 ClickHouse 设置。
  clickhouse_settings?: ClickHouseSettings
  // 查询绑定参数。
  query_params?: Record<string, unknown>
  // 用于取消正在执行的查询的 AbortSignal 实例。
  abort_signal?: AbortSignal
  // query_id 覆盖;如果未指定,将自动生成随机标识符。
  query_id?: string
  // session_id 覆盖;如果未指定,将从客户端配置中获取会话 ID。
  session_id?: string
  // 凭据覆盖;如果未指定,将使用客户端的凭据。
  auth?: { username: string, password: string }
  // 用于此查询的特定角色列表。覆盖客户端配置中设置的角色。
  role?: string | Array<string>
}
```

### 查询方法 {#query-method}

此方法用于大多数会返回响应的语句，例如 `SELECT`，或用于发送诸如 `CREATE TABLE` 的 DDL 语句，并且应当使用 `await` 等待其完成。返回的结果集通常由应用程序进行消费和处理。

:::note
用于数据插入有专门的方法 [insert](./js.md#insert-method)，用于 DDL 则有 [command](./js.md#command-method)。
:::

```ts
interface QueryParams extends BaseQueryParams {
  // 要执行的查询，可能会返回数据。
  query: string
  // 结果数据集的格式。默认值：JSON。
  format?: DataFormat
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>
}
```

另请参阅：[所有客户端方法的基础参数](./js.md#base-parameters-for-all-client-methods)。

:::tip
不要在 `query` 中指定 FORMAT 子句，请改用 `format` 参数。
:::

#### 结果集与行抽象 {#result-set-and-row-abstractions}

`ResultSet` 为你的应用程序提供了若干便于进行数据处理的辅助方法。

Node.js 中的 `ResultSet` 实现在底层使用 `Stream.Readable`，而 Web 版本则使用 Web API 的 `ReadableStream`。

你可以通过在 `ResultSet` 上调用 `text` 或 `json` 方法来消费它，并将查询返回的全部行一次性加载到内存中。

你应尽早开始消费 `ResultSet`，因为它会保持响应流处于打开状态，从而使底层连接始终处于忙碌状态。客户端不会缓冲传入数据，以避免应用程序出现潜在的过度内存占用。

或者，如果结果集过大，无法一次性装入内存，你可以调用 `stream` 方法，以流式模式处理数据。每个响应块都会被转换为一个相对较小的行数组（该数组的大小取决于客户端从服务器接收到的具体块大小（可能会变化）以及单行的大小），按块逐个处理。

请参考[支持的数据格式](./js.md#supported-data-formats)列表，以确定在你的场景中用于流式传输的最佳格式。例如，如果你想以流式方式传输 JSON 对象，可以选择 [JSONEachRow](/interfaces/formats/JSONEachRow)，这样每一行都会被解析为一个 JS 对象；或者选择更紧凑的 [JSONCompactColumns](/interfaces/formats/JSONCompactColumns) 格式，使每一行成为一个紧凑的值数组。另请参阅：[流式传输文件](./js.md#streaming-files-nodejs-only)。

:::important
如果 `ResultSet` 或其流未被完全消费，在经过 `request_timeout` 指定的一段空闲时间后将会被销毁。
:::

```ts
interface BaseResultSet<Stream> {
  // 参见上文"查询 ID"部分
  query_id: string

  // 读取整个流并以字符串形式获取内容
  // 可用于任何 DataFormat
  // 应仅调用一次
  text(): Promise<string>

  // 读取整个流并将内容解析为 JS 对象
  // 仅可用于 JSON 格式
  // 应仅调用一次
  json<T>(): Promise<T>

  // 返回可流式传输的响应的可读流
  // 流的每次迭代提供所选 DataFormat 中的 Row[] 数组
  // 应仅调用一次
  stream(): Stream
}

interface Row {
  // 以纯字符串形式获取行内容
  text: string

  // 将行内容解析为 JS 对象
  json<T>(): T
}
```

**示例：**（Node.js/Web）一个查询，其结果数据集为 `JSONEachRow` 格式，读取整个流并将内容解析为 JS 对象。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // 或使用 `row.text` 避免解析 JSON
```

**示例：**（仅限 Node.js）使用经典的 `on('data')` 方式，以 `JSONEachRow` 格式流式读取查询结果。此方式可以与 `for await const` 语法互换使用。[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // 或 JSONCompactEachRow、JSONStringsEachRow 等
})
const stream = rows.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.json()) // 或使用 `row.text` 避免解析 JSON
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('完成!')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**示例：**（仅限 Node.js）通过经典的 `on('data')` 方式，以 `CSV` 格式流式读取查询结果。此方式可与 `for await const` 语法互换使用。
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
    console.log('完成!')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**示例：**（仅限 Node.js）以 `JSONEachRow` 格式将查询结果作为 JS 对象进行流式处理，并使用 `for await const` 语法进行消费。此方式可替代经典的 `on('data')` 方法。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers LIMIT 10', // 从 system.numbers 表查询 10 条记录
  format: 'JSONEachRow', // 或使用 JSONCompactEachRow、JSONStringsEachRow 等格式
})
for await (const rows of resultSet.stream()) {
  rows.forEach(row => {
    console.log(row.json())
  })
}
```

:::note
`for await const` 语法相比使用 `on('data')` 的方式，代码会稍微少一些，但可能会对性能产生负面影响。
更多详情请参见 [Node.js 仓库中的这个 issue](https://github.com/nodejs/node/issues/31979)。
:::

**示例：**（仅限 Web）对对象的 `ReadableStream` 进行迭代。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM system.numbers LIMIT 10', // 从 system.numbers 表查询前 10 行
  format: 'JSONEachRow' // 指定返回格式为 JSONEachRow
})

const reader = resultSet.stream().getReader()
while (true) {
  const { done, value: rows } = await reader.read()
  if (done) { break } // 读取完成后退出循环
  rows.forEach(row => {
    console.log(row.json())
  })
}
```

### Insert 方法 {#insert-method}

这是插入数据的主要方法。

```ts
export interface InsertResult {
  query_id: string
  executed: boolean
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

返回类型是精简的，因为我们不期望从服务器返回任何数据，并会立即读取并清空响应流。

如果向 insert 方法传入的是空数组，insert 语句将不会被发送到服务器；相反，该方法会立即返回（resolve）`{ query_id: '...', executed: false }`。如果在这种情况下没有在方法参数中提供 `query_id`，则结果中的该字段将是空字符串，因为返回由客户端生成的随机 UUID 可能会造成困惑——带有该 `query_id` 的查询并不存在于 `system.query_log` 表中。

如果 insert 语句已发送到服务器，则 `executed` 标志将为 `true`。

#### Node.js 中的 insert 方法与流式处理 {#insert-method-and-streaming-in-nodejs}

它既可以与 `Stream.Readable` 一起使用，也可以与普通的 `Array<T>` 一起使用，具体取决于传递给 `insert` 方法的[数据格式](./js.md#supported-data-formats)。另请参阅本节中关于[文件流式处理](./js.md#streaming-files-nodejs-only)的内容。

`insert` 方法应当配合 `await` 使用；不过，也可以先传入一个输入流，而在稍后、仅在该流完成时再等待 `insert` 操作的完成（此时 `insert` 返回的 Promise 也会被 resolve）。这在事件监听器或类似场景中可能会很有用，但在客户端进行错误处理时会有大量边界情况，处理起来较为复杂。作为替代方案，可以考虑使用[异步插入](/optimize/asynchronous-inserts)，如[此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts)所示。

:::tip
如果你有一个难以通过该方法建模的自定义 INSERT 语句，可以考虑使用 [command 方法](./js.md#command-method)。

你可以在 [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) 或 [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) 示例中看到它的用法。
:::

```ts
interface InsertParams<T> extends BaseQueryParams {
  // 插入数据的目标表名
  table: string
  // 待插入的数据集
  values: ReadonlyArray<T> | Stream.Readable
  // 数据集的格式
  format?: DataFormat
  // 指定数据插入的目标列
  // - 数组形式如 `['a', 'b']` 将生成:`INSERT INTO table (a, b) FORMAT DataFormat`
  // - 对象形式如 `{ except: ['a', 'b'] }` 将生成:`INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // 默认情况下,数据将插入表的所有列,
  // 生成的语句为:`INSERT INTO table FORMAT DataFormat`
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

另请参阅：[所有客户端方法的通用参数](./js.md#base-parameters-for-all-client-methods)。

:::important
通过 `abort_signal` 取消的请求并不能保证数据未被插入，因为在取消之前，服务器可能已经接收到部分流式数据。
:::

**示例：**（Node.js/Web）插入一个值数组。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
await client.insert({
  table: 'my_table',
  // 结构应与所需格式匹配,此示例中为 JSONEachRow
  values: [
    { id: 42, name: 'foo' },
    { id: 42, name: 'bar' },
  ],
  format: 'JSONEachRow',
})
```

**示例：**（仅限 Node.js）从 CSV 文件中插入数据流。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。另请参阅：[文件流式传输](./js.md#streaming-files-nodejs-only)。

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**示例**：在 `INSERT` 语句中排除某些列。

假设有如下表定义：

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

仅插入指定列：

```ts
// 生成的语句：INSERT INTO mytable (message) FORMAT JSONEachRow
await client.insert({
  table: 'mytable',
  values: [{ message: 'foo' }],
  format: 'JSONEachRow',
  // 此行的 `id` 列值将为零（UInt32 的默认值）
  columns: ['message'],
})
```

排除特定列：

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

有关更多详细信息，请参阅[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts)。

**示例**：向一个不同于客户端实例所配置数据库的其他数据库中插入数据。[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: 'mydb.mytable', // 包含数据库的完全限定名
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```

#### Web 版本的限制 {#web-version-limitations}

目前，`@clickhouse/client-web` 中的插入操作仅支持 `Array<T>` 和 `JSON*` 格式。
由于浏览器兼容性较差，Web 版本暂不支持插入流式数据（streams）。

因此，Web 版本中的 `InsertParams` 接口与 Node.js 版本略有不同，
因为 `values` 仅限于 `ReadonlyArray<T>` 类型：

```ts
interface InsertParams<T> extends BaseQueryParams {
  // 插入数据的目标表名
  table: string
  // 待插入的数据集。
  values: ReadonlyArray<T>
  // 待插入数据集的格式。
  format?: DataFormat
  // 指定数据将插入到哪些列。
  // - 数组形式如 `['a', 'b']` 将生成:`INSERT INTO table (a, b) FORMAT DataFormat`
  // - 对象形式如 `{ except: ['a', 'b'] }` 将生成:`INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // 默认情况下,数据插入到表的所有列,
  // 生成的语句为:`INSERT INTO table FORMAT DataFormat`。
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

此内容将来可能会有所变动。另请参阅：[所有客户端方法的基础参数](./js.md#base-parameters-for-all-client-methods)。

### 命令方法 {#command-method}

可用于没有任何输出的语句、`FORMAT` 子句不适用的情况，或当你对响应结果完全不感兴趣时。此类语句的示例包括 `CREATE TABLE` 或 `ALTER TABLE`。

调用时应使用 `await` 等待其完成。

响应流会被立即销毁，这意味着底层套接字会被释放。

```ts
interface CommandParams extends BaseQueryParams {
  // 要执行的语句
  query: string
}

interface CommandResult {
  query_id: string
}

interface ClickHouseClient {
  command(params: CommandParams): Promise<CommandResult>
}
```

参见：[所有客户端方法的基础参数](./js.md#base-parameters-for-all-client-methods)。

**示例：**（Node.js/Web）在 ClickHouse Cloud 中创建一张表。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)。

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // 建议在集群使用场景中启用此设置,以避免在响应代码发送后才发生查询处理错误、
  // 而此时 HTTP 头已经发送给客户端的情况。
  // 参见 https://clickhouse.com/docs/interfaces/http/#response-buffering
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
使用 `abort_signal` 取消请求并不能保证服务器未执行该语句。
:::

### Exec 方法 {#exec-method}

如果有某个自定义查询不适用于 `query`/`insert`，并且你关心其返回结果，可以使用 `exec` 作为 `command` 的替代方案。

`exec` 返回一个可读流，该流在应用端必须被消费或销毁。

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

在 Node.js 和 Web 版本中，流的返回类型不同。

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

用于检查连接状态的 `ping` 方法会在服务器可达时返回 `true`。

如果服务器不可达，返回结果中还会包含底层错误信息。

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }

/** 健康检查请求的参数 - 使用内置的 `/ping` 端点。
 *  这是 Node.js 版本的默认行为。 */
export type PingParamsWithEndpoint = {
  select: false
  /** 用于取消进行中请求的 AbortSignal 实例。 */
  abort_signal?: AbortSignal
  /** 附加到此特定请求的额外 HTTP 头。 */
  http_headers?: Record<string, string>
}
/** 健康检查请求的参数 - 使用 SELECT 查询。
 *  这是 Web 版本的默认行为,因为 `/ping` 端点不支持 CORS。
 *  大多数标准 `query` 方法参数(例如 `query_id`、`abort_signal`、`http_headers` 等)都可以使用,
 *  但 `query_params` 除外,在此方法中允许该参数没有意义。 */
export type PingParamsWithSelectQuery = { select: true } & Omit<
  BaseQueryParams,
  'query_params'
>
export type PingParams = PingParamsWithEndpoint | PingParamsWithSelectQuery

interface ClickHouseClient {
  ping(params?: PingParams): Promise<PingResult>
}
```

当应用程序启动时，ping 可能是一个用于检查服务器是否可用的有用工具，尤其是在使用 ClickHouse Cloud 时，实例可能处于空闲状态，并会在收到一次 ping 后唤醒：在这种情况下，可以考虑在重试之间加入延迟并重试几次。

请注意，默认情况下，Node.js 版本使用 `/ping` 端点，而 Web 版本则通过执行一个简单的 `SELECT 1` 查询来实现类似的效果，这是因为 `/ping` 端点不支持 CORS。

**示例：**（Node.js/Web）对 ClickHouse 服务器实例进行一次简单的 ping。注意：对于 Web 版本，捕获到的错误会有所不同。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // 处理 result.error
}
```

**示例：** 如果你希望在调用 `ping` 方法时同时校验凭证，或者指定诸如 `query_id` 之类的额外参数，可以按如下方式使用：

```ts
const result = await client.ping({ select: true, /* query_id、abort_signal、http_headers 或其他任意查询参数 */ });
```

`ping` 方法可以使用大多数标准的 `query` 方法参数——参见 `PingParamsWithSelectQuery` 类型定义。

### 关闭（仅限 Node.js） {#close-nodejs-only}

关闭所有已打开的连接并释放资源。在 Web 版本中不执行任何操作。

```ts
await client.close()
```

## 流式处理文件（仅限 Node.js） {#streaming-files-nodejs-only}

在客户端仓库中，提供了多种使用常见数据格式（NDJSON、CSV、Parquet）的文件流式处理示例。

- [从 NDJSON 文件进行流式处理](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [从 CSV 文件进行流式处理](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [从 Parquet 文件进行流式处理](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [将数据流式写入 Parquet 文件](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

将其他格式流式写入文件的方式应与 Parquet 类似，
唯一的差异在于 `query` 调用所使用的格式（`JSONEachRow`、`CSV` 等）以及输出文件名。

## 支持的数据格式 {#supported-data-formats}

客户端支持 JSON 和文本两类数据格式。

如果将 `format` 指定为 JSON 家族格式之一（`JSONEachRow`、`JSONCompactEachRow` 等），客户端会在网络通信过程中对数据进行序列化和反序列化。

以“原始”文本格式（`CSV`、`TabSeparated` 和 `CustomSeparated` 家族）提供的数据会按原样通过网络发送，不做额外转换。

:::tip
JSON 作为通用格式和 [ClickHouse JSON 格式](/interfaces/formats/JSON) 之间可能会产生混淆。 

客户端支持使用诸如 [JSONEachRow](/interfaces/formats/JSONEachRow) 这样的格式来流式处理 JSON 对象（有关其他适合流式处理的格式，请参见下表概览；另见客户端代码仓库中的 `select_streaming_` [示例](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)）。 

只是像 [ClickHouse JSON](/interfaces/formats/JSON) 以及少数其他格式在响应中会被表示为单个对象，客户端无法对其进行流式处理。
:::

| 格式                                       | 输入（数组） | 输入（对象） | 输入/输出（流）         | 输出（JSON） | 输出（文本）   |
|--------------------------------------------|--------------|--------------|-------------------------|--------------|----------------|
| JSON                                       | ❌            | ✔️            | ❌                       | ✔️            | ✔️             |
| JSONCompact                                | ❌            | ✔️            | ❌                       | ✔️            | ✔️             |
| JSONObjectEachRow                          | ❌            | ✔️            | ❌                       | ✔️            | ✔️             |
| JSONColumnsWithMetadata                    | ❌            | ✔️            | ❌                       | ✔️            | ✔️             |
| JSONStrings                                | ❌            | ❌️           | ❌                       | ✔️            | ✔️             |
| JSONCompactStrings                         | ❌            | ❌            | ❌                       | ✔️            | ✔️             |
| JSONEachRow                                | ✔️            | ❌            | ✔️                      | ✔️            | ✔️             |
| JSONEachRowWithProgress                    | ❌️           | ❌            | ✔️ ❗- 见下文            | ✔️            | ✔️             |
| JSONStringsEachRow                         | ✔️            | ❌            | ✔️                      | ✔️            | ✔️             |
| JSONCompactEachRow                         | ✔️            | ❌            | ✔️                      | ✔️            | ✔️             |
| JSONCompactStringsEachRow                  | ✔️            | ❌            | ✔️                      | ✔️            | ✔️             |
| JSONCompactEachRowWithNames                | ✔️            | ❌            | ✔️                      | ✔️            | ✔️             |
| JSONCompactEachRowWithNamesAndTypes        | ✔️            | ❌            | ✔️                      | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNames         | ✔️            | ❌            | ✔️                      | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔️            | ❌            | ✔️                      | ✔️            | ✔️             |
| CSV                                        | ❌            | ❌            | ✔️                      | ❌            | ✔️             |
| CSVWithNames                               | ❌            | ❌            | ✔️                      | ❌            | ✔️             |
| CSVWithNamesAndTypes                       | ❌            | ❌            | ✔️                      | ❌            | ✔️             |
| TabSeparated                               | ❌            | ❌            | ✔️                      | ❌            | ✔️             |
| TabSeparatedRaw                            | ❌            | ❌            | ✔️                      | ❌            | ✔️             |
| TabSeparatedWithNames                      | ❌            | ❌            | ✔️                      | ❌            | ✔️             |
| TabSeparatedWithNamesAndTypes              | ❌            | ❌            | ✔️                      | ❌            | ✔️             |
| CustomSeparated                            | ❌            | ❌            | ✔️                      | ❌            | ✔️             |
| CustomSeparatedWithNames                   | ❌            | ❌            | ✔️                      | ❌            | ✔️             |
| CustomSeparatedWithNamesAndTypes           | ❌            | ❌            | ✔️                      | ❌            | ✔️             |
| Parquet                                    | ❌            | ❌            | ✔️                      | ❌            | ✔️❗- 见下文    |

对于 Parquet 格式，`SELECT` 的主要用例通常是将结果流写入文件。参见客户端代码仓库中的[示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)。

`JSONEachRowWithProgress` 是一种仅输出格式，支持在流中报告进度。更多细节参见[此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)。

完整的 ClickHouse 输入和输出格式列表见
[此处](/interfaces/formats)。

## 支持的 ClickHouse 数据类型 {#supported-clickhouse-data-types}

:::note
所列 JS 类型适用于所有 `JSON*` 格式，但将所有内容都表示为字符串的格式除外（例如 `JSONStringEachRow`）
:::

| Type                   | Status          | JS type                    |
|------------------------|-----------------|----------------------------|
| UInt8/16/32            | ✔️              | number                     |
| UInt64/128/256         | ✔️ ❗- 见下文    | string                     |
| Int8/16/32             | ✔️              | number                     |
| Int64/128/256          | ✔️ ❗- 见下文    | string                     |
| Float32/64             | ✔️              | number                     |
| Decimal                | ✔️ ❗- 见下文    | number                     |
| Boolean                | ✔️              | boolean                    |
| String                 | ✔️              | string                     |
| FixedString            | ✔️              | string                     |
| UUID                   | ✔️              | string                     |
| Date32/64              | ✔️              | string                     |
| DateTime32/64          | ✔️ ❗- 见下文    | string                     |
| Enum                   | ✔️              | string                     |
| LowCardinality         | ✔️              | string                     |
| Array(T)               | ✔️              | T[]                        |
| (new) JSON             | ✔️              | object                     |
| Variant(T1, T2...)     | ✔️              | T（取决于具体变体）        |
| Dynamic                | ✔️              | T（取决于具体变体）        |
| Nested                 | ✔️              | T[]                        |
| Tuple(T1, T2, ...)     | ✔️              | [T1, T2, ...]              |
| Tuple(n1 T1, n2 T2...) | ✔️              | \{ n1: T1; n2: T2; ...}    |
| Nullable(T)            | ✔️              | T 对应的 JS 类型或 null    |
| IPv4                   | ✔️              | string                     |
| IPv6                   | ✔️              | string                     |
| Point                  | ✔️              | [ number, number ]         |
| Ring                   | ✔️              | Array&lt;Point\>           |
| Polygon                | ✔️              | Array&lt;Ring\>            |
| MultiPolygon           | ✔️              | Array&lt;Polygon\>         |
| Map(K, V)              | ✔️              | Record&lt;K, V\>           |
| Time/Time64            | ✔️              | string                     |

ClickHouse 支持的数据类型完整列表可在
[此处](/sql-reference/data-types/)查看。

另请参阅：

- [使用 Dynamic/Variant/JSON 的示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/dynamic_variant_json.ts)
- [使用 Time/Time64 的示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/time_time64.ts)

### Date/Date32 类型注意事项 {#datedate32-types-caveats}

由于客户端在插入时不会执行额外的类型转换，`Date`/`Date32` 类型的列只能以字符串形式插入。

**示例：** 插入一个 `Date` 类型的值。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

但是，如果你使用的是 `DateTime` 或 `DateTime64` 列，则可以同时使用字符串和 JS Date 对象。在将 `date_time_input_format` 设置为 `best_effort` 时，可以将 JS Date 对象原样传递给 `insert`。有关更多详情，请参阅此[示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts)。

### Decimal* 类型注意事项 {#decimal-types-caveats}

可以使用 `JSON*` 系列格式插入 Decimal 类型的数据。假设我们有如下定义的表：

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

我们可以通过使用字符串表示来插入值，从而避免精度损失：

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

然而，在以 `JSON*` 格式查询数据时，ClickHouse 默认会以*数字*形式返回 Decimal 值，这可能导致精度损失。为避免这种情况，可以在查询中将 Decimal 转换为字符串：

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

更多详细信息请参见[此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts)。

### 整数类型：Int64、Int128、Int256、UInt64、UInt128、UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

虽然服务器可以将其作为数字接收，但在 `JSON*` 系列输出格式中会以字符串形式返回，以避免整数溢出，因为这些类型的最大值大于 `Number.MAX_SAFE_INTEGER`。

不过，可以通过 [`output_format_json_quote_64bit_integers` 设置](/operations/settings/formats#output_format_json_quote_64bit_integers) 来修改此行为。

**示例：** 调整 64 位整数的 JSON 输出格式。

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
可以在客户端实例级别配置这些 settings，这样从该实例发出的每个请求都会应用这些设置：

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

或者，也可以在单个请求级别配置该设置：

```ts
client.query({
  clickhouse_settings: {}
})
```

包含所有受支持的 ClickHouse 设置的类型声明文件可以在
[这里](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts)找到。

:::important
请确保代表其发起查询的用户具备足够的权限来修改这些设置。
:::

## 高级主题 {#advanced-topics}

### 带参数的查询 {#queries-with-parameters}

你可以创建带参数的查询，并从客户端应用向这些参数传递值。这样就可以避免在客户端对包含特定动态值的查询进行格式化。

像平常一样编写查询，然后将你希望通过应用传入查询的值用花括号括起来，格式如下：

```text
{<name>: <data_type>}
```

其中：

* `name` — 占位符标识符。
* `data_type` - 应用参数值的[数据类型](/sql-reference/data-types/)。

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

有关更多详情，请参阅 [https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax](https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax)。

### 压缩 {#compression}

注意：目前 Web 版本尚不支持请求压缩。响应压缩可正常使用。Node.js 版本同时支持请求和响应压缩。

在网络上传输大型数据集的数据应用，可以通过启用压缩获益。目前仅支持使用 [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html) 的 `GZIP` 压缩。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

配置参数如下：

* `response: true` 表示 ClickHouse 服务器将返回压缩后的响应体。默认值：`response: false`
* `request: true` 表示对客户端请求体启用压缩。默认值：`request: false`

### 日志（仅限 Node.js） {#logging-nodejs-only}

:::important
日志功能目前处于试验阶段，未来可能会有所调整。
:::

默认的日志记录器实现会通过 `console.debug/info/warn/error` 方法将日志记录输出到 `stdout`。
你可以通过提供一个 `LoggerClass` 来自定义日志记录逻辑，并通过 `level` 参数选择所需的日志级别（默认值为 `OFF`）：

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

目前，客户端会记录以下事件：

* `TRACE` - 有关 Keep-Alive 套接字生命周期的底层信息
* `DEBUG` - 响应信息（不包含 Authorization 头部和主机信息）
* `INFO` - 几乎未使用，在客户端初始化时会打印当前日志级别
* `WARN` - 非致命错误；`ping` 请求失败会作为警告记录，因为底层错误已包含在返回结果中
* `ERROR` - 来自 `query`/`insert`/`exec`/`command` 方法的致命错误，例如请求失败

可以在[此处](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts)找到默认的 Logger 实现。

### TLS 证书（仅限 Node.js） {#tls-certificates-nodejs-only}

Node.js 客户端可选支持基本（仅证书颁发机构）
和双向（证书颁发机构与客户端证书）TLS。

以下是基本 TLS 配置示例，假设你的证书位于 `certs` 目录中，
且 CA 文件名为 `CA.pem`：

```ts
const client = createClient({
  url: 'https://<主机名>:<端口>',
  username: '<用户名>',
  password: '<密码>', // 如有需要
  tls: {
    ca_cert: fs.readFileSync('certs/CA.pem'), // 读取 CA 证书
  },
})
```

使用客户端证书的双向 TLS 配置示例：

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

请在代码仓库中查看 [基本](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) 和 [双向](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS 的完整示例。

### Keep-alive 配置（仅适用于 Node.js） {#keep-alive-configuration-nodejs-only}

客户端默认在底层 HTTP 代理中启用了 Keep-Alive，这意味着已建立的套接字会被复用于后续请求，并且会发送 `Connection: keep-alive` 头。空闲套接字默认会在连接池中保留 2500 毫秒（参见[有关调整此选项的说明](./js.md#adjusting-idle_socket_ttl)）。

`keep_alive.idle_socket_ttl` 的取值应当明显低于服务端或负载均衡器（LB）的配置。主要原因是，由于 HTTP/1.1 允许服务器在不通知客户端的情况下关闭套接字，如果服务器或负载均衡器先于客户端关闭连接，客户端可能会尝试复用这个已关闭的套接字，从而导致 `socket hang up` 错误。

如果需要修改 `keep_alive.idle_socket_ttl`，请注意其值应始终与服务器/LB 的 Keep-Alive 配置保持一致，并且**始终低于**该值，以确保服务器不会先行关闭仍处于打开状态的连接。

#### 调整 `idle_socket_ttl` {#adjusting-idle_socket_ttl}

客户端将 `keep_alive.idle_socket_ttl` 设置为 2500 毫秒，因为这通常被认为是最安全的默认值；在服务端，如果不修改 `config.xml`，`keep_alive_timeout` 在 [23.11 之前的 ClickHouse 版本中可能被设置得低至 3 秒](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1)。

:::warning
如果你对当前性能满意且没有遇到任何问题，建议**不要**提高 `keep_alive.idle_socket_ttl` 配置的值，因为这可能会导致潜在的 “Socket hang-up” 错误；另外，如果你的应用程序发送大量查询，并且查询之间的空闲时间不长，那么默认值通常就足够了，因为套接字不会空闲太久，客户端会将它们保留在连接池中。
:::

你可以通过运行以下命令，在服务器响应头中找到正确的 Keep-Alive 超时值：

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

检查响应中 `Connection` 和 `Keep-Alive` 头部的值。例如：

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

在这种情况下，`keep_alive_timeout` 为 10 秒，你可以尝试将 `keep_alive.idle_socket_ttl` 增加到 9000 甚至 9500 毫秒，以便让空闲 socket 比默认情况下多保持打开一会儿。密切关注可能出现的 &quot;Socket hang-up&quot; 错误，这将表明服务器在客户端之前关闭了连接；如有必要，逐步降低该值，直到错误不再出现为止。

#### 故障排查 {#troubleshooting}

如果即使使用了最新版本的客户端仍然遇到 `socket hang up` 错误，可以通过以下方式来解决这个问题：

* 启用至少 `WARN` 日志级别的日志。这将有助于检查应用代码中是否存在未消费或悬空的流：传输层会在 WARN 级别记录这些情况，因为这可能会导致服务端关闭 socket。你可以在客户端配置中按如下方式启用日志：
  
  ```ts
  const client = createClient({
    log: { level: ClickHouseLogLevel.WARN },
  })
  ```
  
* 在启用 [no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/) ESLint 规则的情况下检查你的应用代码，这将有助于识别未处理的 Promise，它们可能会导致悬空的流和 socket。

* 稍微调低 ClickHouse 服务器配置中的 `keep_alive.idle_socket_ttl` 设置。在某些场景下（例如客户端与服务端之间网络延迟较高），将 `keep_alive.idle_socket_ttl` 再降低 200–500 毫秒可能会更有利，从而排除一种情况：即某个即将被服务端关闭的 socket 被用于发起新的出站请求。

* 如果该错误发生在没有数据进出（例如长时间运行的 `INSERT FROM SELECT`）的长时间运行查询期间，则可能是由于负载均衡器关闭空闲连接导致。你可以尝试通过组合使用以下这些 ClickHouse 设置，在长时间运行的查询期间强制产生一些传入数据：

  ```ts
  const client = createClient({
    // 这里我们假设会有一些执行时间超过 5 分钟的查询
    request_timeout: 400_000,
    /** 这些设置组合在一起，可以在长时间运行且没有数据进出
     *  的查询（例如 `INSERT FROM SELECT` 及类似查询）场景下避免 LB 超时问题，
     *  因为连接可能会被 LB 标记为空闲并被突然关闭。
     *  在本例中，我们假设 LB 的空闲连接超时时间为 120s，因此将 110s 作为“安全”值。 */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: '110000', // UInt64，应以字符串形式传递
    },
  })
  ```
  但请注意，在较新的 Node.js 版本中，接收的 header 总大小有 16KB 的限制；在接收到一定数量的 progress header 之后（在我们的测试中约为 70–80 个），将会抛出异常。

  也可以采用完全不同的方式，完全避免网络传输过程中的等待时间；可以利用 HTTP 接口的一个“特性”：当连接丢失时，mutation 不会被取消。更多细节请参见[这个示例（第 2 部分）](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts)。

* 可以完全禁用 Keep-Alive 功能。在这种情况下，客户端还会在每个请求中添加 `Connection: close` 头部，并且底层 HTTP agent 不会复用连接。`keep_alive.idle_socket_ttl` 设置将被忽略，因为不会有空闲 socket。这样会带来额外开销，因为每个请求都会建立一个新连接。

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```

### 只读用户 {#read-only-users}

当使用 [readonly=1 用户](/operations/settings/permissions-for-queries#readonly)通过客户端访问时，无法启用响应压缩，因为这需要启用 `enable_http_compression` 设置。以下配置将导致错误：

```ts
const client = createClient({
  compression: {
    response: true, // 不适用于 readonly=1 用户
  },
})
```

请参阅此[示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)，其中更详细地展示了 `readonly=1` 用户的各项限制。

### 带路径名的代理 {#proxy-with-a-pathname}

如果你的 ClickHouse 实例部署在代理之后，并且其 URL 中包含路径名，例如 [http://proxy:8123/clickhouse&#95;server](http://proxy:8123/clickhouse_server)，请将 `clickhouse_server` 设置为 `pathname` 配置选项（可以带或不带前导斜杠）；否则，如果在 `url` 中直接包含该路径，它将被视为 `database` 选项。支持多级路径，例如 `/my_proxy/db`。

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```

### 带身份验证的反向代理 {#reverse-proxy-with-authentication}

如果在 ClickHouse 部署前面有一个带身份验证的反向代理，可以使用 `http_headers` 设置来提供所需的请求头：

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```

### 自定义 HTTP/HTTPS agent（实验性功能，仅适用于 Node.js） {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
这是一个实验性功能，在未来的发布中可能会以向后不兼容的方式发生变更。客户端提供的默认实现和设置对于大多数使用场景应该已经足够。仅当您确定确实需要时，才使用此功能。
:::

默认情况下，客户端会使用客户端配置中提供的设置（例如 `max_open_connections`、`keep_alive.enabled`、`tls`）来配置底层 HTTP(s) agent，用于处理与 ClickHouse 服务器的连接。此外，如果使用了 TLS 证书，底层 agent 会配置所需的证书，并强制使用正确的 TLS 认证头部。

从 1.2.0 起，可以为客户端提供自定义的 HTTP(s) agent，以替换默认的底层 agent。在网络配置较为复杂的情况下，这可能会比较有用。如果提供了自定义 agent，将会有以下注意事项：

- `max_open_connections` 和 `tls` 选项将 _不再生效_，并会被客户端忽略，因为它们属于底层 agent 的配置部分。
- `keep_alive.enabled` 只会控制 `Connection` 头的默认值（`true` -> `Connection: keep-alive`，`false` -> `Connection: close`）。
- 虽然空闲 keep-alive socket 的管理仍然有效（因为这并不依赖于 agent，而是依赖于具体的 socket 本身），但现在可以通过将 `keep_alive.idle_socket_ttl` 的值设置为 `0` 来将其完全禁用。

#### 自定义 Agent 使用示例 {#custom-agent-usage-examples}

在不使用证书的情况下使用自定义 HTTP(S) Agent：

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

使用配合基础 TLS 和 CA 证书的自定义 HTTPS Agent：

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
  // 使用自定义 HTTPS 代理时,客户端将不使用默认的 HTTPS 连接实现;必须手动提供请求头
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
  },
  // 重要:authorization 请求头与 TLS 请求头冲突;必须禁用。
  set_basic_auth_header: false,
})
```

使用支持双向 TLS 的自定义 HTTPS Agent：

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
  // 使用自定义 HTTPS 代理时,客户端将不使用默认的 HTTPS 连接实现;请求头需要手动提供
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
    'X-ClickHouse-SSL-Certificate-Auth': 'on',
  },
  // 重要:授权请求头与 TLS 请求头冲突;必须禁用。
  set_basic_auth_header: false,
})
```

在同时使用证书 *和* 自定义 *HTTPS* Agent 时，很可能需要通过 `set_basic_auth_header` 设置（在 1.2.0 中引入）来禁用默认的授权头，因为它会与 TLS 头产生冲突。所有 TLS 头都应由用户手动提供。

## 已知限制（Node.js/web） {#known-limitations-nodejsweb}

- 结果集没有数据映射器，因此只使用语言的基础类型。计划在未来提供某些数据类型的映射器，并支持 [RowBinary 格式](https://github.com/ClickHouse/clickhouse-js/issues/216)。
- 存在一些与 [Decimal\* 和 Date\* / DateTime\* 数据类型相关的注意事项](./js.md#datedate32-types-caveats)。
- 使用 JSON\* 系列格式时，大于 Int32 的数字会以字符串形式表示，因为 Int64+ 类型的最大值大于 `Number.MAX_SAFE_INTEGER`。更多详情请参阅 [整数类型](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) 部分。

## 已知限制（web） {#known-limitations-web}

- 针对 select 查询的流式处理可用，但对插入操作（在类型级别同样如此）已被禁用。
- 请求压缩已禁用，相关配置会被忽略；响应压缩仍然可用。
- 暂不支持日志功能。

## 性能优化提示 {#tips-for-performance-optimizations}

- 为了减少应用程序的内存占用，可以在适用的情况下，对大批量插入（例如从文件）和查询操作使用流式处理。对于事件监听器等类似场景，[异步插入](/optimize/asynchronous-inserts) 也是一个不错的选择，它可以最大限度减少，甚至完全避免在客户端进行批处理。异步插入示例可在 [client 仓库](https://github.com/ClickHouse/clickhouse-js/tree/main/examples) 中找到，文件名前缀为 `async_insert_`。
- 客户端默认不会启用请求或响应压缩。不过，在对大数据集执行查询或插入时，可以考虑通过 `ClickHouseClientConfigOptions.compression` 启用压缩（可以只对 `request` 或 `response` 启用，也可以两者都启用）。
- 压缩会带来较大的性能开销。为 `request` 或 `response` 启用压缩会分别对查询或插入的速度产生负面影响，但会减少应用程序传输的网络流量。

## 联系我们 {#contact-us}

如果您有任何疑问或需要帮助，欢迎在 [Community Slack](https://clickhouse.com/slack)（`#clickhouse-js` 频道）或通过 [GitHub issues](https://github.com/ClickHouse/clickhouse-js/issues) 与我们联系。