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

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse JS

用于连接 ClickHouse 的官方 JS 客户端。
该客户端使用 TypeScript 编写，并为客户端的公共 API 提供类型定义。

它零依赖，针对性能进行了极致优化，并在多种 ClickHouse 版本和配置（本地单节点、本地集群以及 ClickHouse Cloud）下完成了测试。

针对不同运行环境提供了两个不同版本的客户端：
- `@clickhouse/client` - 仅适用于 Node.js
- `@clickhouse/client-web` - 浏览器（Chrome/Firefox）、Cloudflare Workers

在使用 TypeScript 时，请确保其版本至少为 [4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)，该版本支持 [内联导入和导出语法](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)。

客户端源代码可在 [ClickHouse-JS GitHub 仓库](https://github.com/ClickHouse/clickhouse-js) 中获取。



## 环境要求（Node.js） {#environment-requirements-nodejs}

运行客户端需要环境中安装 Node.js。
该客户端与所有[维护中](https://github.com/nodejs/release#readme)的 Node.js 版本兼容。

当某个 Node.js 版本接近生命周期终止（End-Of-Life）时,客户端将停止对其提供支持,因为该版本被视为过时且不安全。

当前 Node.js 版本支持情况:

| Node.js 版本 | 是否支持?  |
| --------------- | ----------- |
| 22.x            | ✔          |
| 20.x            | ✔          |
| 18.x            | ✔          |
| 16.x            | 尽力而为 |


## 环境要求（Web）{#environment-requirements-web}

该客户端的 Web 版本已在最新版本的 Chrome/Firefox 浏览器上通过官方测试，可作为依赖项集成到 React/Vue/Angular 应用程序或 Cloudflare Workers 等环境中使用。


## 安装 {#installation}

要安装最新稳定版的 Node.js 客户端,请运行:

```sh
npm i @clickhouse/client
```

Web 版本安装:

```sh
npm i @clickhouse/client-web
```


## 与 ClickHouse 的兼容性 {#compatibility-with-clickhouse}

| 客户端版本 | ClickHouse |
| -------------- | ---------- |
| 1.12.0         | 24.8+      |

客户端可能也可以与更早的版本配合使用,但这仅是尽力支持,不保证完全兼容。如果您使用的 ClickHouse 版本早于 23.3,请参阅 [ClickHouse 安全策略](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) 并考虑升级。


## 示例 {#examples}

我们旨在通过客户端代码库中的[示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples)涵盖客户端使用的各种场景。

概述可在[示例 README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview)中查看。

如果示例或以下文档中有不清楚或缺失的内容,请随时[联系我们](./js.md#contact-us)。

### 客户端 API {#client-api}

除非另有明确说明,否则大多数示例应与客户端的 Node.js 和 Web 版本兼容。

#### 创建客户端实例 {#creating-a-client-instance}

您可以使用 `createClient` 工厂函数根据需要创建任意数量的客户端实例:

```ts
import { createClient } from "@clickhouse/client" // or '@clickhouse/client-web'

const client = createClient({
  /* 配置 */
})
```

如果您的环境不支持 ESM 模块,可以使用 CJS 语法:

```ts
const { createClient } = require("@clickhouse/client")

const client = createClient({
  /* 配置 */
})
```

客户端实例可以在实例化期间进行[预配置](./js.md#configuration)。

#### 配置 {#configuration}

创建客户端实例时,可以调整以下连接设置:

| 设置                                                                  | 描述                                                                         | 默认值           | 另请参阅                                                                                   |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| **url**?: string                                                         | ClickHouse 实例 URL。                                                          | `http://localhost:8123` | [URL 配置文档](./js.md#url-configuration)                                        |
| **pathname**?: string                                                    | 可选的路径名,在客户端解析 ClickHouse URL 后添加到其后。 | `''`                    | [带路径名的代理文档](./js.md#proxy-with-a-pathname)                                |
| **request_timeout**?: number                                             | 请求超时时间(毫秒)。                                                | `30_000`                | -                                                                                          |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }`    | 启用压缩。                                                                 | -                       | [压缩文档](./js.md#compression)                                                    |
| **username**?: string                                                    | 代表其发出请求的用户名。                             | `default`               | -                                                                                          |
| **password**?: string                                                    | 用户密码。                                                                  | `''`                    | -                                                                                          |
| **application**?: string                                                 | 使用 Node.js 客户端的应用程序名称。                               | `clickhouse-js`         | -                                                                                          |
| **database**?: string                                                    | 要使用的数据库名称。                                                           | `default`               | -                                                                                          |
| **clickhouse_settings**?: ClickHouseSettings                             | 应用于所有请求的 ClickHouse 设置。                                       | `{}`                    | -                                                                                          |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 内部客户端日志配置。                                                 | -                       | [日志文档](./js.md#logging-nodejs-only)                                                |
| **session_id**?: string                                                  | 可选的 ClickHouse 会话 ID,随每个请求发送。                          | -                       | -                                                                                          |
| **keep_alive**?: `{ **enabled**?: boolean }`                             | 在 Node.js 和 Web 版本中默认启用。                                | -                       | -                                                                                          |
| **http_headers**?: `Record<string, string>`                              | 用于传出 ClickHouse 请求的附加 HTTP 头。                           | -                       | [带身份验证的反向代理文档](./js.md#reverse-proxy-with-authentication)        |
| **roles**?: string \| string[]                                           | 附加到传出请求的 ClickHouse 角色名称。                         | -                       | [在 HTTP 接口中使用角色](/interfaces/http#setting-role-with-query-parameters) |

#### Node.js 特定配置参数 {#nodejs-specific-configuration-parameters}


| 设置                                                                    | 说明                                                 | 默认值 | 另请参阅                                                                                             |
| -------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| **max_open_connections**?: number                                          | 每个主机允许的最大连接套接字数。    | `10`          | -                                                                                                    |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`   | 配置 TLS 证书。                                 | -             | [TLS 文档](./js.md#tls-certificates-nodejs-only)                                                     |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                           | -             | [Keep Alive 文档](./js.md#keep-alive-configuration-nodejs-only)                                      |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>       | 客户端的自定义 HTTP 代理。                           | -             | [HTTP 代理文档](./js.md#custom-httphttps-agent-experimental-nodejs-only)                           |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>              | 使用基本身份验证凭据设置 `Authorization` 头。 | `true`        | [HTTP 代理文档中此设置的用法](./js.md#custom-httphttps-agent-experimental-nodejs-only) |

### URL 配置 {#url-configuration}

:::important
URL 配置将_始终_覆盖硬编码的值,并在此情况下记录警告。
:::

可以使用 URL 配置大多数客户端实例参数。URL 格式为 `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`。在几乎所有情况下,特定参数的名称都反映了其在配置选项接口中的路径,但有少数例外。支持以下参数:

| 参数                                   | 类型                                                              |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `pathname`                                  | 任意字符串。                                              |
| `application_id`                            | 任意字符串。                                              |
| `session_id`                                | 任意字符串。                                              |
| `request_timeout`                           | 非负数。                                              |
| `max_open_connections`                      | 非负数,大于零。                           |
| `compression_request`                       | 布尔值。见下文 (1)                                            |
| `compression_response`                      | 布尔值。                                                          |
| `log_level`                                 | 允许的值:`OFF`、`TRACE`、`DEBUG`、`INFO`、`WARN`、`ERROR`。 |
| `keep_alive_enabled`                        | 布尔值。                                                          |
| `clickhouse_setting_*` 或 `ch_*`            | 见下文 (2)                                                     |
| `http_header_*`                             | 见下文 (3)                                                     |
| (仅限 Node.js) `keep_alive_idle_socket_ttl` | 非负数。                                              |

- (1) 对于布尔值,有效值为 `true`/`1` 和 `false`/`0`。
- (2) 任何以 `clickhouse_setting_` 或 `ch_` 为前缀的参数都会删除此前缀,其余部分添加到客户端的 `clickhouse_settings` 中。例如,`?ch_async_insert=1&ch_wait_for_async_insert=1` 等同于:

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1
  }
})
```

注意:`clickhouse_settings` 的布尔值应在 URL 中以 `1`/`0` 传递。

- (3) 与 (2) 类似,但用于 `http_header` 配置。例如,`?http_header_x-clickhouse-auth=foobar` 等同于:

```ts
createClient({
  http_headers: {
    "x-clickhouse-auth": "foobar"
  }
})
```

### 连接 {#connecting}

#### 收集连接详细信息 {#gather-your-connection-details}

<ConnectionDetails />

#### 连接概述 {#connection-overview}

客户端通过 HTTP(s) 协议实现连接。RowBinary 支持正在开发中,请参阅[相关问题](https://github.com/ClickHouse/clickhouse-js/issues/216)。

以下示例演示如何设置与 ClickHouse Cloud 的连接。假设 `url`(包括协议和端口)和 `password` 值通过环境变量指定,并使用 `default` 用户。

**示例:** 使用环境变量配置创建 Node.js 客户端实例。

```ts
import { createClient } from "@clickhouse/client"

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? "http://localhost:8123",
  username: process.env.CLICKHOUSE_USER ?? "default",
  password: process.env.CLICKHOUSE_PASSWORD ?? ""
})
```


客户端代码仓库包含多个使用环境变量的示例,例如[在 ClickHouse Cloud 中创建表](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)、[使用异步插入](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts)等。

#### 连接池(仅限 Node.js){#connection-pool-nodejs-only}

为避免每次请求都建立连接的开销,客户端会创建一个到 ClickHouse 的连接池以供重用,利用 Keep-Alive 机制。默认情况下,Keep-Alive 已启用,连接池大小设置为 `10`,但您可以通过 `max_open_connections` [配置选项](./js.md#configuration)进行更改。

除非用户设置 `max_open_connections: 1`,否则无法保证后续查询会使用池中的同一连接。这种情况很少需要,但在使用临时表时可能需要。

另请参阅:[Keep-Alive 配置](./js.md#keep-alive-configuration-nodejs-only)。

### 查询 ID {#query-id}

每个发送查询或语句的方法(`command`、`exec`、`insert`、`select`)都会在结果中提供 `query_id`。这个唯一标识符由客户端为每个查询分配,可用于从 `system.query_log` 获取数据(如果在[服务器配置](/operations/server-configuration-parameters/settings)中启用),或取消长时间运行的查询(参见[示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts))。如有必要,用户可以在 `command`/`query`/`exec`/`insert` 方法参数中覆盖 `query_id`。

:::tip
如果您要覆盖 `query_id` 参数,需要确保每次调用的唯一性。随机 UUID 是一个不错的选择。
:::

### 所有客户端方法的基础参数 {#base-parameters-for-all-client-methods}

以下参数可应用于所有客户端方法([query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method))。

```ts
interface BaseQueryParams {
  // 可在查询级别应用的 ClickHouse 设置。
  clickhouse_settings?: ClickHouseSettings
  // 查询绑定参数。
  query_params?: Record<string, unknown>
  // 用于取消正在进行的查询的 AbortSignal 实例。
  abort_signal?: AbortSignal
  // query_id 覆盖;如果未指定,将自动生成随机标识符。
  query_id?: string
  // session_id 覆盖;如果未指定,将从客户端配置中获取会话 ID。
  session_id?: string
  // 凭据覆盖;如果未指定,将使用客户端的凭据。
  auth?: { username: string; password: string }
  // 用于此查询的特定角色列表。覆盖客户端配置中设置的角色。
  role?: string | Array<string>
}
```

### Query 方法 {#query-method}

此方法用于大多数可以返回响应的语句,例如 `SELECT`,或用于发送 DDL 语句(如 `CREATE TABLE`),应使用 await。返回的结果集预期在应用程序中使用。

:::note
有专门的 [insert](./js.md#insert-method) 方法用于数据插入,以及 [command](./js.md#command-method) 方法用于 DDL。
:::

```ts
interface QueryParams extends BaseQueryParams {
  // 要执行的查询,可能返回一些数据。
  query: string
  // 结果数据集的格式。默认值:JSON。
  format?: DataFormat
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>
}
```

另请参阅:[所有客户端方法的基础参数](./js.md#base-parameters-for-all-client-methods)。

:::tip
不要在 `query` 中指定 FORMAT 子句,请使用 `format` 参数。
:::

#### 结果集和行抽象 {#result-set-and-row-abstractions}

`ResultSet` 提供了几个便捷方法用于在应用程序中处理数据。

Node.js 的 `ResultSet` 实现底层使用 `Stream.Readable`,而 Web 版本使用 Web API 的 `ReadableStream`。

您可以通过在 `ResultSet` 上调用 `text` 或 `json` 方法来使用 `ResultSet`,并将查询返回的整个行集加载到内存中。


你应尽早开始消费 `ResultSet`，因为它会保持响应流处于打开状态，从而让底层连接一直处于忙碌状态。客户端不会对传入数据进行缓冲，以避免应用程序可能出现的过高内存占用。

另外，如果结果集太大，无法一次性装入内存，你可以调用 `stream` 方法，以流式模式处理数据。响应中的每个数据块都会被转换为一个相对较小的行数组（该数组的大小取决于客户端从服务器接收到的具体数据块的大小（可能变化）以及单行数据的大小），并按块依次处理。

请参阅[支持的数据格式列表](./js.md#supported-data-formats)，以确定在你的场景下最适合用于流式处理的格式。例如，如果你想以流式方式处理 JSON 对象，可以选择 [JSONEachRow](/interfaces/formats/JSONEachRow)，每一行都会被解析为一个 JS 对象；或者选择更紧凑的 [JSONCompactColumns](/interfaces/formats/JSONCompactColumns) 格式，使每一行成为一个紧凑的值数组。另请参阅：[流式处理文件](./js.md#streaming-files-nodejs-only)。

:::important
如果 `ResultSet` 或其流未被完全消费，在 `request_timeout` 指定的空闲时间之后会被销毁。
:::

```ts
interface BaseResultSet<Stream> {
  // 参见上文"查询 ID"部分
  query_id: string

  // 读取整个流并以字符串形式返回内容
  // 可用于任何 DataFormat
  // 只能调用一次
  text(): Promise<string>

  // 读取整个流并将内容解析为 JS 对象
  // 仅可用于 JSON 格式
  // 只能调用一次
  json<T>(): Promise<T>

  // 返回可流式传输响应的可读流
  // 流的每次迭代提供一个 Row[] 数组,格式为所选的 DataFormat
  // 只能调用一次
  stream(): Stream
}

interface Row {
  // 以纯字符串形式获取行内容
  text: string

  // 将行内容解析为 JS 对象
  json<T>(): T
}
```

**示例：**（Node.js/Web）一个返回 `JSONEachRow` 格式结果数据集的查询，消费整个流并将内容解析为 JS 对象。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // 或使用 `row.text` 避免解析 JSON
```

**示例：**（仅限 Node.js）使用经典的 `on('data')` 方式以 `JSONEachRow` 格式流式读取查询结果。此方式可与 `for await const` 语法互换使用。[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

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

**示例：**（仅 Node.js）使用经典的 `on('data')` 方式以 `CSV` 格式流式读取查询结果。此方式可与 `for await const` 语法互换使用。
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


**示例：**（仅限 Node.js）使用 `for await const` 语法以 `JSONEachRow` 格式流式处理查询结果为 JS 对象。这与传统的 `on('data')` 方法可以互换使用。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts)。

```ts
const resultSet = await client.query({
  query: "SELECT number FROM system.numbers LIMIT 10",
  format: "JSONEachRow" // 或 JSONCompactEachRow、JSONStringsEachRow 等
})
for await (const rows of resultSet.stream()) {
  rows.forEach((row) => {
    console.log(row.json())
  })
}
```

:::note
`for await const` 语法比 `on('data')` 方法的代码更简洁,但可能会对性能产生负面影响。
详情请参阅 [Node.js 仓库中的此问题](https://github.com/nodejs/node/issues/31979)。
:::

**示例：**（仅限 Web）对对象的 `ReadableStream` 进行迭代。

```ts
const resultSet = await client.query({
  query: "SELECT * FROM system.numbers LIMIT 10",
  format: "JSONEachRow"
})

const reader = resultSet.stream().getReader()
while (true) {
  const { done, value: rows } = await reader.read()
  if (done) {
    break
  }
  rows.forEach((row) => {
    console.log(row.json())
  })
}
```

### Insert 方法 {#insert-method}

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

返回类型是最小化的,因为我们不期望从服务器返回任何数据,并且会立即消费完响应流。

如果向 insert 方法提供了空数组,则不会向服务器发送插入语句;相反,该方法将立即返回 `{ query_id: '...', executed: false }`。在这种情况下,如果方法参数中未提供 `query_id`,结果中将是空字符串,因为返回客户端生成的随机 UUID 可能会造成混淆,因为具有此类 `query_id` 的查询不会存在于 `system.query_log` 表中。

如果插入语句已发送到服务器,则 `executed` 标志将为 `true`。

#### Node.js 中的 Insert 方法和流式处理 {#insert-method-and-streaming-in-nodejs}

它可以使用 `Stream.Readable` 或普通的 `Array<T>`,具体取决于为 `insert` 方法指定的[数据格式](./js.md#supported-data-formats)。另请参阅有关[文件流式处理](./js.md#streaming-files-nodejs-only)的部分。

Insert 方法应该被 await;但是,可以指定输入流并稍后 await `insert` 操作,仅在流完成时(这也将解析 `insert` promise)。这对于事件监听器和类似场景可能很有用,但错误处理可能并不简单,客户端会有很多边缘情况。相反,请考虑使用[异步插入](/optimize/asynchronous-inserts),如[此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts)所示。

:::tip
如果您有难以使用此方法建模的自定义 INSERT 语句,请考虑使用 [command 方法](./js.md#command-method)。

您可以在 [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) 或 [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) 示例中查看其使用方法。
:::


```ts
interface InsertParams<T> extends BaseQueryParams {
  // 要插入数据的表名
  table: string
  // 要插入的数据集
  values: ReadonlyArray<T> | Stream.Readable
  // 要插入的数据集格式
  format?: DataFormat
  // 允许指定数据将插入到哪些列
  // - 数组形式如 `['a', 'b']` 将生成:`INSERT INTO table (a, b) FORMAT DataFormat`
  // - 对象形式如 `{ except: ['a', 'b'] }` 将生成:`INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // 默认情况下,数据将插入到表的所有列,
  // 生成的语句为:`INSERT INTO table FORMAT DataFormat`
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

另请参阅:[所有客户端方法的基础参数](./js.md#base-parameters-for-all-client-methods)。

:::important
使用 `abort_signal` 取消请求并不能保证数据未被插入,因为服务器可能在取消之前已经接收了部分流式数据。
:::

**示例:**(Node.js/Web)插入值数组。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
await client.insert({
  table: "my_table",
  // 结构应与所需格式匹配,本例中为 JSONEachRow
  values: [
    { id: 42, name: "foo" },
    { id: 42, name: "bar" }
  ],
  format: "JSONEachRow"
})
```

**示例:**(仅限 Node.js)从 CSV 文件插入流。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。另请参阅:[文件流式传输](./js.md#streaming-files-nodejs-only)。

```ts
await client.insert({
  table: "my_table",
  values: fs.createReadStream("./path/to/a/file.csv"),
  format: "CSV"
})
```

**示例**:从插入语句中排除特定列。

给定如下表定义:

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

仅插入特定列:

```ts
// 生成的语句:INSERT INTO mytable (message) FORMAT JSONEachRow
await client.insert({
  table: "mytable",
  values: [{ message: "foo" }],
  format: "JSONEachRow",
  // 此行的 `id` 列值将为零(UInt32 的默认值)
  columns: ["message"]
})
```

排除特定列:

```ts
// 生成的语句:INSERT INTO mytable (* EXCEPT (message)) FORMAT JSONEachRow
await client.insert({
  table: tableName,
  values: [{ id: 144 }],
  format: "JSONEachRow",
  // 此行的 `message` 列值将为空字符串
  columns: {
    except: ["message"]
  }
})
```

有关更多详细信息,请参阅[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts)。

**示例**:插入到与客户端实例指定的数据库不同的数据库。[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: "mydb.mytable", // 包含数据库的完全限定名称
  values: [{ id: 42, message: "foo" }],
  format: "JSONEachRow"
})
```

#### Web 版本限制 {#web-version-limitations}

目前,`@clickhouse/client-web` 中的插入操作仅支持 `Array<T>` 和 `JSON*` 格式。
由于浏览器兼容性问题,Web 版本暂不支持插入流。

因此,Web 版本的 `InsertParams` 接口与 Node.js 版本略有不同,
`values` 仅限于 `ReadonlyArray<T>` 类型:


```ts
interface InsertParams<T> extends BaseQueryParams {
  // 要插入数据的表名
  table: string
  // 要插入的数据集
  values: ReadonlyArray<T>
  // 要插入的数据集格式
  format?: DataFormat
  // 允许指定数据将插入到哪些列
  // - 数组形式如 `['a', 'b']` 将生成:`INSERT INTO table (a, b) FORMAT DataFormat`
  // - 对象形式如 `{ except: ['a', 'b'] }` 将生成:`INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // 默认情况下,数据将插入到表的所有列,
  // 生成的语句为:`INSERT INTO table FORMAT DataFormat`
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

此接口未来可能会发生变化。另请参阅:[所有客户端方法的基础参数](./js.md#base-parameters-for-all-client-methods)。

### Command 方法 {#command-method}

该方法可用于没有任何输出的语句、不适用格式子句的场景,或者完全不关心响应的情况。此类语句的示例包括 `CREATE TABLE` 或 `ALTER TABLE`。

需要使用 await。

响应流会立即销毁,这意味着底层套接字将被释放。

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

另请参阅:[所有客户端方法的基础参数](./js.md#base-parameters-for-all-client-methods)。

**示例:**(Node.js/Web)在 ClickHouse Cloud 中创建表。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)。

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // 建议在集群环境中使用,以避免在响应代码之后发生查询处理错误,
  // 而 HTTP 头已经发送到客户端的情况
  // 参见 https://clickhouse.com/docs/interfaces/http/#response-buffering
  clickhouse_settings: {
    wait_end_of_query: 1
  }
})
```

**示例:**(Node.js/Web)在自托管 ClickHouse 实例中创建表。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_single_node.ts)。

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_table
    (id UInt64, name String)
    ENGINE MergeTree()
    ORDER BY (id)
  `
})
```

**Example:** (Node.js/Web) INSERT FROM SELECT

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`
})
```

:::important
使用 `abort_signal` 取消的请求不能保证该语句未被服务器执行。
:::

### Exec 方法 {#exec-method}

如果您有不适合 `query`/`insert` 的自定义查询,
并且需要获取结果,可以使用 `exec` 作为 `command` 的替代方案。

`exec` 返回一个可读流,必须在应用程序端消费或销毁。

```ts
interface ExecParams extends BaseQueryParams {
  // 要执行的语句
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

另请参阅:[所有客户端方法的基础参数](./js.md#base-parameters-for-all-client-methods)。

流返回类型在 Node.js 和 Web 版本中有所不同。

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

`ping` 方法用于检查连接状态,如果可以访问服务器则返回 `true`。

如果服务器无法访问,结果中也会包含底层错误。

```ts
type PingResult = { success: true } | { success: false; error: Error }
```


/**
 * 健康检查请求的参数 - 使用内置的 `/ping` 端点。
 *
 * - 这是 Node.js 版本的默认行为。
 */
export type PingParamsWithEndpoint = {
  select: false
  /**
   * 用于取消进行中请求的 AbortSignal 实例。
   */
  abort_signal?: AbortSignal
  /**
   * 要附加到此特定请求的额外 HTTP 头部。
   */
  http_headers?: Record<string, string>
}
  /**
 * 健康检查请求的参数 - 使用 SELECT 查询。
 *
 * - 这是 Web 版本的默认行为，因为 `/ping` 端点不支持 CORS。
 * - 大多数标准的 `query` 方法参数，例如 `query_id`、`abort_signal`、`http_headers` 等，都可以使用，
 * - 除了 `query_params`，因为在该方法中允许它没有意义。
 */
export type PingParamsWithSelectQuery = { select: true } & Omit<
  BaseQueryParams,
  'query_params'
>

export type PingParams = PingParamsWithEndpoint | PingParamsWithSelectQuery

interface ClickHouseClient {
ping(params?: PingParams): Promise<PingResult>
}

````

`ping` 方法可能是一个有用的工具，用于在应用程序启动时检查服务器是否可用，尤其是在 ClickHouse Cloud 中，实例可能处于空闲状态，并在收到 ping 后唤醒：在这种情况下，您可能希望重试几次，并在每次重试之间添加延迟。

请注意，默认情况下，Node.js 版本使用 `/ping` 端点，而 Web 版本使用简单的 `SELECT 1` 查询来实现类似效果，因为 `/ping` 端点不支持 CORS。

**示例：** (Node.js/Web) 向 ClickHouse 服务器实例发送简单的 ping。注意：对于 Web 版本，捕获的错误将有所不同。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // 处理 result.error
}
```

**示例：** 如果您想在调用 `ping` 方法时同时验证凭据，或指定诸如 `query_id` 等额外参数，可以按以下方式使用：

```ts
const result = await client.ping({
  select: true /* query_id、abort_signal、http_headers 或其他任何查询参数 */
})
```

`ping` 方法支持大多数标准的 `query` 方法参数 - 请参阅 `PingParamsWithSelectQuery` 的类型定义。

### 关闭 (仅限 Node.js) {#close-nodejs-only}

关闭所有打开的连接并释放资源。在 Web 版本中无操作。

```ts
await client.close()
```


## 流式传输文件(仅限 Node.js) {#streaming-files-nodejs-only}

客户端代码库中提供了多个使用常见数据格式(NDJSON、CSV、Parquet)进行文件流式传输的示例。

- [从 NDJSON 文件流式读取](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [从 CSV 文件流式读取](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [从 Parquet 文件流式读取](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [流式写入 Parquet 文件](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

将其他格式流式写入文件的方式与 Parquet 类似,
唯一的区别在于 `query` 调用中使用的格式(`JSONEachRow`、`CSV` 等)以及输出文件名。


## 支持的数据格式 {#supported-data-formats}

客户端可以处理 JSON 或文本格式的数据。

如果您将 `format` 指定为 JSON 系列格式之一(`JSONEachRow`、`JSONCompactEachRow` 等),客户端将在网络传输过程中对数据进行序列化和反序列化。

以"原始"文本格式(`CSV`、`TabSeparated` 和 `CustomSeparated` 系列)提供的数据在网络传输时不会进行额外转换。

:::tip
请注意区分通用的 JSON 格式与 [ClickHouse JSON 格式](/interfaces/formats/JSON)。

客户端支持使用 [JSONEachRow](/interfaces/formats/JSONEachRow) 等格式流式传输 JSON 对象(其他支持流式传输的格式请参阅下表概览;另请参阅客户端代码库中的 `select_streaming_` [示例](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node))。

但是,[ClickHouse JSON](/interfaces/formats/JSON) 等少数格式在响应中表示为单个对象,客户端无法对其进行流式传输。
:::

| 格式                                     | 输入(数组) | 输入(对象) | 输入/输出(流) | 输出(JSON) | 输出(文本)   |
| ------------------------------------------ | ------------- | -------------- | --------------------- | ------------- | --------------- |
| JSON                                       | ❌            | ✔️             | ❌                    | ✔️            | ✔️              |
| JSONCompact                                | ❌            | ✔️             | ❌                    | ✔️            | ✔️              |
| JSONObjectEachRow                          | ❌            | ✔️             | ❌                    | ✔️            | ✔️              |
| JSONColumnsWithMetadata                    | ❌            | ✔️             | ❌                    | ✔️            | ✔️              |
| JSONStrings                                | ❌            | ❌️            | ❌                    | ✔️            | ✔️              |
| JSONCompactStrings                         | ❌            | ❌             | ❌                    | ✔️            | ✔️              |
| JSONEachRow                                | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONEachRowWithProgress                    | ❌️           | ❌             | ✔️ ❗- 见下文      | ✔️            | ✔️              |
| JSONStringsEachRow                         | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactEachRow                         | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactStringsEachRow                  | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactEachRowWithNames                | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactEachRowWithNamesAndTypes        | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactStringsEachRowWithNames         | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| CSV                                        | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| CSVWithNames                               | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| CSVWithNamesAndTypes                       | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| TabSeparated                               | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| TabSeparatedRaw                            | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| TabSeparatedWithNames                      | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| TabSeparatedWithNamesAndTypes              | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| CustomSeparated                            | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| CustomSeparatedWithNames                   | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| CustomSeparatedWithNamesAndTypes           | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| Parquet                                    | ❌            | ❌             | ✔️                    | ❌            | ✔️❗- 见下文 |


对于 Parquet，`SELECT` 的主要用例很可能是将结果流写入文件。请参阅客户端代码仓库中的[示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)。

`JSONEachRowWithProgress` 是一种仅用于输出的格式，它支持在流中上报进度。有关更多详细信息，请参阅[此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)。

ClickHouse 支持的全部输入与输出格式列表可在
[此处](/interfaces/formats)查看。



## 支持的 ClickHouse 数据类型 {#supported-clickhouse-data-types}

:::note
相关的 JS 类型适用于所有 `JSON*` 格式,但将所有内容表示为字符串的格式除外(例如 `JSONStringEachRow`)
:::

| 类型                   | 状态             | JS 类型                    |
| ---------------------- | ---------------- | -------------------------- |
| UInt8/16/32            | ✔️               | number                     |
| UInt64/128/256         | ✔️ ❗- 见下文 | string                     |
| Int8/16/32             | ✔️               | number                     |
| Int64/128/256          | ✔️ ❗- 见下文 | string                     |
| Float32/64             | ✔️               | number                     |
| Decimal                | ✔️ ❗- 见下文 | number                     |
| Boolean                | ✔️               | boolean                    |
| String                 | ✔️               | string                     |
| FixedString            | ✔️               | string                     |
| UUID                   | ✔️               | string                     |
| Date32/64              | ✔️               | string                     |
| DateTime32/64          | ✔️ ❗- 见下文 | string                     |
| Enum                   | ✔️               | string                     |
| LowCardinality         | ✔️               | string                     |
| Array(T)               | ✔️               | T[]                        |
| (new) JSON             | ✔️               | object                     |
| Variant(T1, T2...)     | ✔️               | T (取决于变体) |
| Dynamic                | ✔️               | T (取决于变体) |
| Nested                 | ✔️               | T[]                        |
| Tuple(T1, T2, ...)     | ✔️               | [T1, T2, ...]              |
| Tuple(n1 T1, n2 T2...) | ✔️               | \{ n1: T1; n2: T2; ...}    |
| Nullable(T)            | ✔️               | T 的 JS 类型或 null      |
| IPv4                   | ✔️               | string                     |
| IPv6                   | ✔️               | string                     |
| Point                  | ✔️               | [ number, number ]         |
| Ring                   | ✔️               | Array&lt;Point\>           |
| Polygon                | ✔️               | Array&lt;Ring\>            |
| MultiPolygon           | ✔️               | Array&lt;Polygon\>         |
| Map(K, V)              | ✔️               | Record&lt;K, V\>           |
| Time/Time64            | ✔️               | string                     |

支持的 ClickHouse 格式完整列表请参见[此处](/sql-reference/data-types/)。

另请参阅:

- [使用 Dynamic/Variant/JSON 的示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/dynamic_variant_json.ts)
- [使用 Time/Time64 的示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/time_time64.ts)

### Date/Date32 类型注意事项 {#datedate32-types-caveats}

由于客户端在插入值时不进行额外的类型转换,因此 `Date`/`Date32` 类型的列只能以字符串形式插入。

**示例:** 插入 `Date` 类型的值。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)

```ts
await client.insert({
  table: "my_table",
  values: [{ date: "2022-09-05" }],
  format: "JSONEachRow"
})
```

但是,如果使用 `DateTime` 或 `DateTime64` 列,则可以同时使用字符串和 JS Date 对象。在将 `date_time_input_format` 设置为 `best_effort` 的情况下,可以直接将 JS Date 对象传递给 `insert`。更多详细信息请参阅此[示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts)。

### Decimal\* 类型注意事项 {#decimal-types-caveats}

可以使用 `JSON*` 系列格式插入 Decimal 值。假设我们有如下定义的表:

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

我们可以使用字符串表示形式插入值而不会损失精度:


```ts
await client.insert({
  table: "my_table",
  values: [
    {
      id: 1,
      dec32: "1234567.89",
      dec64: "123456789123456.789",
      dec128: "1234567891234567891234567891.1234567891",
      dec256:
        "12345678912345678912345678911234567891234567891234567891.12345678911234567891"
    }
  ],
  format: "JSONEachRow"
})
```

但是,在使用 `JSON*` 格式查询数据时,ClickHouse 默认会将 Decimal 类型作为 _数字_ 返回,这可能导致精度损失。为避免这种情况,可以在查询中将 Decimal 类型转换为字符串:

```ts
await client.query({
  query: `
    SELECT toString(dec32)  AS decimal32,
           toString(dec64)  AS decimal64,
           toString(dec128) AS decimal128,
           toString(dec256) AS decimal256
    FROM my_table
  `,
  format: "JSONEachRow"
})
```

更多详情请参阅[此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts)。

### 整数类型:Int64、Int128、Int256、UInt64、UInt128、UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

虽然服务器可以接受数字形式的输入,但在 `JSON*` 系列输出格式中会以字符串形式返回,以避免整数溢出,因为这些类型的最大值大于 `Number.MAX_SAFE_INTEGER`。

不过,可以通过 [`output_format_json_quote_64bit_integers` 设置](/operations/settings/formats#output_format_json_quote_64bit_integers)来修改此行为。

**示例:** 调整 64 位数字的 JSON 输出格式。

```ts
const resultSet = await client.query({
  query: "SELECT * from system.numbers LIMIT 1",
  format: "JSONEachRow"
})

expect(await resultSet.json()).toEqual([{ number: "0" }])
```

```ts
const resultSet = await client.query({
  query: "SELECT * from system.numbers LIMIT 1",
  format: "JSONEachRow",
  clickhouse_settings: { output_format_json_quote_64bit_integers: 0 }
})

expect(await resultSet.json()).toEqual([{ number: 0 }])
```


## ClickHouse 设置 {#clickhouse-settings}

客户端可以通过[设置](/operations/settings/settings/)机制来调整 ClickHouse 的行为。

可以在客户端实例级别设置配置项,这样它们将应用于发送到 ClickHouse 的每个请求:

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

也可以在请求级别配置设置项:

```ts
client.query({
  clickhouse_settings: {}
})
```

包含所有支持的 ClickHouse 设置项的类型声明文件可以在[此处](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts)找到。

:::important
请确保执行查询的用户具有修改设置的相应权限。
:::


## 高级主题 {#advanced-topics}

### 参数化查询 {#queries-with-parameters}

您可以创建参数化查询,并从客户端应用程序传递参数值。这样可以避免在客户端对查询中的动态值进行格式化。

按常规方式格式化查询,然后将要从应用程序传递到查询的参数值放在大括号中,格式如下:

```text
{<name>: <data_type>}
```

其中:

- `name` — 占位符标识符。
- `data_type` - 应用程序参数值的[数据类型](/sql-reference/data-types/)。

**示例:**:参数化查询。
[Source code](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/query_with_parameter_binding.ts)
.

```ts
await client.query({
  query: "SELECT plus({val1: Int32}, {val2: Int32})",
  format: "CSV",
  query_params: {
    val1: 10,
    val2: 20
  }
})
```

更多详情请参阅 https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax。

### 压缩 {#compression}

注意:Web 版本目前不支持请求压缩。响应压缩正常工作。Node.js 版本同时支持两者。

通过网络处理大型数据集的数据应用程序可以从启用压缩中受益。目前仅支持使用 [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html) 的 `GZIP` 压缩。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

配置参数如下:

- `response: true` 指示 ClickHouse 服务器返回压缩的响应体。默认值:`response: false`
- `request: true` 对客户端请求体启用压缩。默认值:`request: false`

### 日志记录(仅限 Node.js) {#logging-nodejs-only}

:::important
日志记录是一个实验性功能,未来可能会发生变化。
:::

默认的日志记录器实现通过 `console.debug/info/warn/error` 方法将日志记录输出到 `stdout`。
您可以通过提供 `LoggerClass` 来自定义日志记录逻辑,并通过 `level` 参数选择所需的日志级别(默认为 `OFF`):

```typescript
import type { Logger } from "@clickhouse/client"

// 客户端导出所有三种 LogParams 类型
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

目前,客户端将记录以下事件:

- `TRACE` - 关于 Keep-Alive 套接字生命周期的底层信息
- `DEBUG` - 响应信息(不包含授权头和主机信息)
- `INFO` - 大多数情况下未使用,将在客户端初始化时打印当前日志级别
- `WARN` - 非致命错误;失败的 `ping` 请求会记录为警告,因为底层错误包含在返回结果中
- `ERROR` - 来自 `query`/`insert`/`exec`/`command` 方法的致命错误,例如请求失败

您可以在[此处](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts)找到默认的 Logger 实现。

### TLS 证书(仅限 Node.js) {#tls-certificates-nodejs-only}

Node.js 客户端可选支持基本 TLS(仅证书颁发机构)和双向 TLS(证书颁发机构和客户端证书)。

基本 TLS 配置示例,假设您的证书位于 `certs` 文件夹中,CA 文件名为 `CA.pem`:

```ts
const client = createClient({
  url: "https://<hostname>:<port>",
  username: "<username>",
  password: "<password>", // 如果需要
  tls: {
    ca_cert: fs.readFileSync("certs/CA.pem")
  }
})
```

使用客户端证书的双向 TLS 配置示例:


```ts
const client = createClient({
  url: "https://<hostname>:<port>",
  username: "<username>",
  tls: {
    ca_cert: fs.readFileSync("certs/CA.pem"),
    cert: fs.readFileSync(`certs/client.crt`),
    key: fs.readFileSync(`certs/client.key`)
  }
})
```

在代码仓库中查看 [基础](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) 和 [双向](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS 的完整示例。

### Keep-alive 配置(仅限 Node.js){#keep-alive-configuration-nodejs-only}

客户端默认在底层 HTTP 代理中启用 Keep-Alive,这意味着已连接的套接字将被重用于后续请求,并且会发送 `Connection: keep-alive` 头。空闲的套接字默认会在连接池中保留 2500 毫秒(参见[关于调整此选项的说明](./js.md#adjusting-idle_socket_ttl))。

`keep_alive.idle_socket_ttl` 的值应该明显低于服务器/负载均衡器的配置。主要原因是 HTTP/1.1 允许服务器在不通知客户端的情况下关闭套接字,如果服务器或负载均衡器在客户端_之前_关闭连接,客户端可能会尝试重用已关闭的套接字,从而导致 `socket hang up` 错误。

如果您要修改 `keep_alive.idle_socket_ttl`,请记住它应该始终与您的服务器/负载均衡器 Keep-Alive 配置保持同步,并且应该**始终低于**该配置,以确保服务器永远不会先关闭打开的连接。

#### 调整 `idle_socket_ttl` {#adjusting-idle_socket_ttl}

客户端将 `keep_alive.idle_socket_ttl` 设置为 2500 毫秒,这可以被认为是最安全的默认值;在服务器端,如果不修改 `config.xml`,`keep_alive_timeout` 在 [23.11 之前的 ClickHouse 版本中可能设置为低至 3 秒](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1)。

:::warning
如果您对性能满意且没有遇到任何问题,建议**不要**增加 `keep_alive.idle_socket_ttl` 设置的值,因为这可能会导致潜在的"Socket hang-up"错误;此外,如果您的应用程序发送大量查询且它们之间的间隔时间不长,默认值应该足够,因为套接字不会空闲足够长的时间,客户端会将它们保留在连接池中。
:::

您可以通过运行以下命令在服务器响应头中找到正确的 Keep-Alive 超时值:

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

检查响应中 `Connection` 和 `Keep-Alive` 头的值。例如:

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

在这种情况下,`keep_alive_timeout` 为 10 秒,您可以尝试将 `keep_alive.idle_socket_ttl` 增加到 9000 甚至 9500 毫秒,以使空闲套接字保持打开的时间比默认值稍长。注意潜在的"Socket hang-up"错误,这将表明服务器在客户端之前关闭了连接,请降低该值直到错误消失。

#### 故障排除 {#troubleshooting}

如果即使使用最新版本的客户端仍然遇到 `socket hang up` 错误,可以通过以下选项解决此问题:

- 启用至少 `WARN` 日志级别的日志。这将允许检查应用程序代码中是否存在未消费或悬空的流:传输层会在 WARN 级别记录它,因为这可能会导致套接字被服务器关闭。您可以在客户端配置中启用日志记录,如下所示:

  ```ts
  const client = createClient({
    log: { level: ClickHouseLogLevel.WARN }
  })
  ```

- 启用 [no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/) ESLint 规则检查您的应用程序代码,这将有助于识别可能导致悬空流和套接字的未处理 Promise。


- 适当降低 ClickHouse 服务器配置中的 `keep_alive.idle_socket_ttl` 设置。在某些情况下,例如客户端与服务器之间存在较高的网络延迟时,将 `keep_alive.idle_socket_ttl` 再降低 200-500 毫秒可能会有所帮助,从而避免出站请求获取到服务器即将关闭的套接字。

- 如果此错误发生在没有数据进出的长时间运行查询期间(例如长时间运行的 `INSERT FROM SELECT`),这可能是由于负载均衡器关闭了空闲连接。您可以尝试通过组合使用以下 ClickHouse 设置,在长时间运行的查询期间强制传入一些数据:

  ```ts
  const client = createClient({
    // 这里我们假设会有一些执行时间超过 5 分钟的查询
    request_timeout: 400_000,
    /** 这些设置组合使用可以避免在没有数据进出的长时间运行查询(如 `INSERT FROM SELECT` 及类似查询)中出现负载均衡器超时问题,
     *  因为连接可能会被负载均衡器标记为空闲并突然关闭。
     *  在这种情况下,我们假设负载均衡器的空闲连接超时为 120 秒,因此将 110 秒设置为"安全"值。 */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: "110000" // UInt64,应作为字符串传递
    }
  })
  ```

  但请注意,在最近的 Node.js 版本中,接收的标头总大小限制为 16KB;在接收到一定数量的进度标头后(在我们的测试中约为 70-80 个),将会抛出异常。

  也可以使用完全不同的方法,完全避免线路上的等待时间;这可以通过利用 HTTP 接口的"特性"来实现,即当连接丢失时变更操作不会被取消。有关更多详细信息,请参阅[此示例(第 2 部分)](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts)。

- Keep-Alive 功能可以完全禁用。在这种情况下,客户端还会在每个请求中添加 `Connection: close` 标头,底层 HTTP 代理将不会重用连接。`keep_alive.idle_socket_ttl` 设置将被忽略,因为不会有空闲套接字。这将导致额外的开销,因为每个请求都会建立新连接。

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false
    }
  })
  ```

### 只读用户 {#read-only-users}

当使用 [readonly=1 用户](/operations/settings/permissions-for-queries#readonly)时,无法启用响应压缩,因为它需要 `enable_http_compression` 设置。以下配置将导致错误:

```ts
const client = createClient({
  compression: {
    response: true // 对 readonly=1 用户不起作用
  }
})
```

请参阅[示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts),其中更详细地说明了 readonly=1 用户的限制。

### 带路径名的代理 {#proxy-with-a-pathname}

如果您的 ClickHouse 实例位于代理之后,并且 URL 中包含路径名,例如 http://proxy:8123/clickhouse_server,请将 `clickhouse_server` 指定为 `pathname` 配置选项(带或不带前导斜杠);否则,如果直接在 `url` 中提供,它将被视为 `database` 选项。支持多个路径段,例如 `/my_proxy/db`。

```ts
const client = createClient({
  url: "http://proxy:8123",
  pathname: "/clickhouse_server"
})
```

### 带身份验证的反向代理 {#reverse-proxy-with-authentication}

如果您的 ClickHouse 部署前面有带身份验证的反向代理,可以使用 `http_headers` 设置在其中提供必要的标头:

```ts
const client = createClient({
  http_headers: {
    "My-Auth-Header": "..."
  }
})
```

### 自定义 HTTP/HTTPS 代理(实验性功能,仅限 Node.js){#custom-httphttps-agent-experimental-nodejs-only}

:::warning
这是一个实验性功能,在未来的版本中可能会以不向后兼容的方式进行更改。客户端提供的默认实现和设置应该足以满足大多数使用场景。仅在确定需要时才使用此功能。
:::


默认情况下,客户端会使用客户端配置中提供的设置(如 `max_open_connections`、`keep_alive.enabled`、`tls`)来配置底层 HTTP(s) 代理,该代理负责处理与 ClickHouse 服务器的连接。此外,如果使用了 TLS 证书,底层代理将配置必要的证书,并强制使用正确的 TLS 认证头。

从 1.2.0 版本开始,可以为客户端提供自定义 HTTP(s) 代理,以替换默认的底层代理。这在复杂的网络配置场景中可能很有用。如果提供了自定义代理,则适用以下条件:

- `max_open_connections` 和 `tls` 选项将_不起作用_,并会被客户端忽略,因为它们是底层代理配置的一部分。
- `keep_alive.enabled` 仅用于设置 `Connection` 头的默认值(`true` -> `Connection: keep-alive`,`false` -> `Connection: close`)。
- 虽然空闲 keep-alive 套接字管理仍然有效(因为它不依赖于代理,而是依赖于特定的套接字本身),但现在可以通过将 `keep_alive.idle_socket_ttl` 值设置为 `0` 来完全禁用它。

#### 自定义代理使用示例 {#custom-agent-usage-examples}

使用不带证书的自定义 HTTP(s) 代理:

```ts
const agent = new http.Agent({
  // 或 https.Agent
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10
})
const client = createClient({
  http_agent: agent
})
```

使用带有基本 TLS 和 CA 证书的自定义 HTTPS 代理:

```ts
const agent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10,
  ca: fs.readFileSync("./ca.crt")
})
const client = createClient({
  url: "https://myserver:8443",
  http_agent: agent,
  // 使用自定义 HTTPS 代理时,客户端不会使用默认的 HTTPS 连接实现;需要手动提供请求头
  http_headers: {
    "X-ClickHouse-User": "username",
    "X-ClickHouse-Key": "password"
  },
  // 重要:authorization 头与 TLS 头冲突;需要禁用它。
  set_basic_auth_header: false
})
```

使用带有双向 TLS 的自定义 HTTPS 代理:

```ts
const agent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10,
  ca: fs.readFileSync("./ca.crt"),
  cert: fs.readFileSync("./client.crt"),
  key: fs.readFileSync("./client.key")
})
const client = createClient({
  url: "https://myserver:8443",
  http_agent: agent,
  // 使用自定义 HTTPS 代理时,客户端不会使用默认的 HTTPS 连接实现;需要手动提供请求头
  http_headers: {
    "X-ClickHouse-User": "username",
    "X-ClickHouse-Key": "password",
    "X-ClickHouse-SSL-Certificate-Auth": "on"
  },
  // 重要:authorization 头与 TLS 头冲突;需要禁用它。
  set_basic_auth_header: false
})
```

当同时使用证书_和_自定义 _HTTPS_ 代理时,可能需要通过 `set_basic_auth_header` 设置(在 1.2.0 版本中引入)禁用默认的 authorization 头,因为它与 TLS 头冲突。所有 TLS 头都应手动提供。


## 已知限制 (Node.js/web) {#known-limitations-nodejsweb}

- 结果集不提供数据映射器,因此仅使用语言原生类型。计划在 [RowBinary 格式支持](https://github.com/ClickHouse/clickhouse-js/issues/216)中添加特定数据类型映射器。
- [Decimal\* 和 Date\* / DateTime\* 数据类型有一些注意事项](./js.md#datedate32-types-caveats)。
- 使用 JSON\* 系列格式时,大于 Int32 的数字将表示为字符串,因为 Int64+ 类型的最大值超过了 `Number.MAX_SAFE_INTEGER`。详情请参阅[整数类型](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256)章节。


## 已知限制（Web）{#known-limitations-web}

- SELECT 查询支持流式传输，但 INSERT 操作不支持流式传输（类型级别也不支持）。
- 请求压缩已禁用，相关配置将被忽略。响应压缩正常工作。
- 暂不支持日志记录。


## 性能优化建议 {#tips-for-performance-optimizations}

- 为降低应用程序内存消耗,建议在处理大批量插入(例如从文件读取)和查询时使用流式处理。对于事件监听器等类似场景,[异步插入](/optimize/asynchronous-inserts)是另一个不错的选择,可以最小化甚至完全避免客户端批处理。异步插入示例可在[客户端代码库](https://github.com/ClickHouse/clickhouse-js/tree/main/examples)中找到,文件名以 `async_insert_` 为前缀。
- 客户端默认不启用请求或响应压缩。但在处理大型数据集的查询或插入时,可以考虑通过 `ClickHouseClientConfigOptions.compression` 启用压缩(可以仅针对 `request` 或 `response`,也可以同时针对两者)。
- 压缩会带来明显的性能开销。为 `request` 或 `response` 启用压缩会分别降低查询或插入的速度,但可以减少应用程序的网络流量传输。


## 联系我们 {#contact-us}

如果您有任何问题或需要帮助,请随时通过 [Community Slack](https://clickhouse.com/slack)(`#clickhouse-js` 频道)或 [GitHub issues](https://github.com/ClickHouse/clickhouse-js/issues) 与我们联系。
