---
sidebar_label: 'JavaScript'
sidebar_position: 4
keywords: ['clickhouse', 'js', 'JavaScript', 'NodeJS', 'web', 'browser', 'Cloudflare', 'workers', 'client', 'connect', 'integrate']
slug: /integrations/javascript
description: '连接 ClickHouse 的官方 JS 客户端。'
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
该客户端使用 TypeScript 编写，并为客户端公开 API 提供类型定义。

它零依赖，针对性能进行了极致优化，并在多种 ClickHouse 版本和配置下完成了测试（自托管单节点、自托管集群以及 ClickHouse Cloud）。

针对不同的运行环境，有两个不同版本的客户端可用：
- `@clickhouse/client` - 仅适用于 Node.js
- `@clickhouse/client-web` - 浏览器（Chrome/Firefox）、Cloudflare Workers

在使用 TypeScript 时，请确保其版本至少为 [4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)，该版本支持[内联 import 和 export 语法](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)。

客户端源代码可在 [ClickHouse-JS GitHub 仓库](https://github.com/ClickHouse/clickhouse-js) 中获取。



## 环境要求（Node.js） {#environment-requirements-nodejs}

环境中必须安装 Node.js 才能运行客户端。
客户端兼容所有[当前仍在维护的](https://github.com/nodejs/release#readme) Node.js 版本。

一旦某个 Node.js 版本接近生命周期终止（End-of-Life），客户端就会停止对该版本的支持，因为它被视为已过时且不安全。

当前 Node.js 版本支持情况：

| Node.js 版本 | 是否支持 |
|-------------|----------|
| 22.x        | ✔        |
| 20.x        | ✔        |
| 18.x        | ✔        |
| 16.x        | 尽力支持 |



## 环境要求（Web） {#environment-requirements-web}

客户端的 Web 版本已在最新的 Chrome/Firefox 浏览器上通过官方测试，可作为依赖集成到 React/Vue/Angular 等应用或 Cloudflare Workers 中使用。



## 安装

要安装最新稳定版的 Node.js 客户端，请运行：

```sh
npm i @clickhouse/client
```

Web 版本安装：

```sh
npm i @clickhouse/client-web
```


## 与 ClickHouse 的兼容性 {#compatibility-with-clickhouse}

| 客户端版本 | ClickHouse |
|-----------|------------|
| 1.12.0    | 24.8+      |

客户端很可能也能在更早期的版本上运行；但这仅为尽力支持，不作任何保证。如果您使用的 ClickHouse 版本低于 23.3，请参阅 [ClickHouse 安全策略](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) 并考虑升级。



## 示例

我们的目标是在客户端代码仓库中的[示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples)中涵盖各种客户端使用场景。

可以在[示例 README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview)中查看概览。

如果示例或下文的文档中有任何不清楚或缺失之处，请随时[联系我们](./js.md#contact-us)。

### Client API

除非特别说明，大多数示例都应同时兼容 Node.js 版和 Web 版客户端。

#### 创建客户端实例

可以通过 `createClient` 工厂函数创建任意数量的客户端实例：

```ts
import { createClient } from '@clickhouse/client' // 或 '@clickhouse/client-web'

const client = createClient({
  /* 配置 */
})
```

如果你的环境不支持 ESM 模块，则可以使用 CJS 语法：

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* 配置 */
})
```

可以在实例化时对客户端实例进行[预配置](./js.md#configuration)。

#### 配置

在创建客户端实例时，可以调整以下连接设置：

| Setting                                                                  | Description                              | Default Value              | See Also                                                  |                                                                       |
| ------------------------------------------------------------------------ | ---------------------------------------- | -------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| **url**?: string                                                         | ClickHouse 实例的 URL。                      | `http://localhost:8123`    | [URL 配置文档](./js.md#url-configuration)                     |                                                                       |
| **pathname**?: string                                                    | 可选的路径名，在客户端解析 ClickHouse URL 之后附加到该 URL。 | `''`                       | [带路径名的代理文档](./js.md#proxy-with-a-pathname)                |                                                                       |
| **request&#95;timeout**?: number                                         | 请求超时时间（毫秒）。                              | `30_000`                   | -                                                         |                                                                       |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }`    | 启用压缩。                                    | -                          | [压缩文档](./js.md#compression)                               |                                                                       |
| **username**?: string                                                    | 代表其发起请求的用户名。                             | `default`                  | -                                                         |                                                                       |
| **password**?: string                                                    | 用户密码。                                    | `''`                       | -                                                         |                                                                       |
| **application**?: string                                                 | 使用该 Node.js 客户端的应用名称。                    | `clickhouse-js`            | -                                                         |                                                                       |
| **database**?: string                                                    | 要使用的数据库名称。                               | `default`                  | -                                                         |                                                                       |
| **clickhouse&#95;settings**?: ClickHouseSettings                         | 应用于所有请求的 ClickHouse 设置。                  | `{}`                       | -                                                         |                                                                       |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 客户端内部日志配置。                               | -                          | [日志文档](./js.md#logging-nodejs-only)                       |                                                                       |
| **session&#95;id**?: string                                              | 可选的 ClickHouse 会话 ID，将随每个请求发送。           | -                          | -                                                         |                                                                       |
| **keep&#95;alive**?: `{ **enabled**?: boolean }`                         | 在 Node.js 和 Web 版本中默认启用。                 | -                          | -                                                         |                                                                       |
| **http&#95;headers**?: `Record<string, string>`                          | 发往 ClickHouse 的请求所附加的额外 HTTP 请求头。        | -                          | [带身份验证的反向代理文档](./js.md#reverse-proxy-with-authentication) |                                                                       |
| **roles**?: string                                                       | string[]                                 | 要附加到出站请求的 ClickHouse 角色名称。 | -                                                         | [在 HTTP 接口中使用角色](/interfaces/http#setting-role-with-query-parameters) |

#### Node.js 专用配置参数


| Setting                                                                        | Description                             | Default Value       | See Also                                                                                             |                                                                            |
| ------------------------------------------------------------------------------ | --------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **max&#95;open&#95;connections**?: number                                      | 每个主机允许的最大已连接套接字数。                       | `10`                | -                                                                                                    |                                                                            |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`       | 配置 TLS 证书。                              | -                   | [TLS docs](./js.md#tls-certificates-nodejs-only)                                                     |                                                                            |
| **keep&#95;alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                       | -                   | [Keep Alive docs](./js.md#keep-alive-configuration-nodejs-only)                                      |                                                                            |
| **http&#95;agent**?: http.Agent                                                | https.Agent <br /><ExperimentalBadge /> | 为客户端自定义 HTTP agent。 | -                                                                                                    | [HTTP agent docs](./js.md#custom-httphttps-agent-experimental-nodejs-only) |
| **set&#95;basic&#95;auth&#95;header**?: boolean <br /><ExperimentalBadge />    | 使用 basic auth 凭据设置 `Authorization` 头。   | `true`              | [this setting usage in the HTTP agent docs](./js.md#custom-httphttps-agent-experimental-nodejs-only) |                                                                            |

### URL configuration

:::important
URL 配置将*始终*覆盖硬编码的值，此时会记录一条警告日志。
:::

可以使用 URL 配置大多数客户端实例参数。URL 格式为 `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`。在几乎所有情况下，某个参数名称都对应其在配置选项接口中的路径，但也有少量例外。支持以下参数：

| Parameter                                   | Type                                                   |
| ------------------------------------------- | ------------------------------------------------------ |
| `pathname`                                  | 任意字符串。                                                 |
| `application_id`                            | 任意字符串。                                                 |
| `session_id`                                | 任意字符串。                                                 |
| `request_timeout`                           | 非负数。                                                   |
| `max_open_connections`                      | 正数。                                                    |
| `compression_request`                       | 布尔值。参见下文 (1)                                           |
| `compression_response`                      | 布尔值。                                                   |
| `log_level`                                 | 允许的值：`OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`。 |
| `keep_alive_enabled`                        | 布尔值。                                                   |
| `clickhouse_setting_*` or `ch_*`            | 见下文 (2)                                                |
| `http_header_*`                             | 见下文 (3)                                                |
| (Node.js only) `keep_alive_idle_socket_ttl` | 非负数。                                                   |

* (1) 对于布尔值，有效取值为 `true`/`1` 和 `false`/`0`。
* (2) 任何以 `clickhouse_setting_` 或 `ch_` 为前缀的参数，其前缀会被移除，其余部分会添加到客户端的 `clickhouse_settings` 中。例如，`?ch_async_insert=1&ch_wait_for_async_insert=1` 等价于：

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

注意：`clickhouse_settings` 的布尔值在 URL 中应使用 `1`/`0` 传递。

* (3) 与 (2) 类似，但用于 `http_header` 配置。例如，`?http_header_x-clickhouse-auth=foobar` 等价于：

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```

### 连接

#### 收集连接信息

<ConnectionDetails />

#### 连接概览

该客户端通过 HTTP(s) 协议建立连接。RowBinary 支持正在开发中，参见[相关 issue](https://github.com/ClickHouse/clickhouse-js/issues/216)。

下面的示例演示了如何与 ClickHouse Cloud 建立连接。这里假设通过环境变量指定了 `url`（包括协议和端口）和 `password`，并使用 `default` 用户。

**示例：** 使用环境变量进行配置来创建一个 Node.js 客户端实例。

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```


客户端仓库包含多个使用环境变量的示例，例如[在 ClickHouse Cloud 中创建表](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)、[使用异步插入](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts)以及其他许多示例。

#### 连接池（仅限 Node.js）

为避免在每个请求时都重新建立连接的开销，客户端会创建一个到 ClickHouse 的连接池以复用连接，并使用 Keep-Alive 机制。默认启用 Keep-Alive，连接池大小默认为 `10`，但可以通过 `max_open_connections` [配置选项](./js.md#configuration)进行修改。

无法保证池中的同一连接会用于后续查询，除非用户将 `max_open_connections` 设置为 `1`。这种情况很少需要，但在使用临时表的场景中可能是必要的。

另请参阅：[Keep-Alive 配置](./js.md#keep-alive-configuration-nodejs-only)。

### 查询 ID

每一个发送查询或语句的方法（`command`、`exec`、`insert`、`select`）都会在结果中提供 `query_id`。这个唯一标识符由客户端为每个查询分配，可用于从 `system.query_log` 中获取数据（如果在[服务器配置](/operations/server-configuration-parameters/settings)中启用了该日志），或者取消长时间运行的查询（参见[示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)）。如有必要，用户可以在 `command`/`query`/`exec`/`insert` 方法的参数中重写 `query_id`。

:::tip
如果要重写 `query_id` 参数，需要确保其在每次调用时都是唯一的。随机 UUID 是一个不错的选择。
:::

### 所有客户端方法的基础参数

有若干参数可以应用于所有客户端方法（[query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)）。

```ts
interface BaseQueryParams {
  // 可在查询级别应用的 ClickHouse 设置。
  clickhouse_settings?: ClickHouseSettings
  // 查询绑定的参数。
  query_params?: Record<string, unknown>
  // 用于取消正在执行的查询的 AbortSignal 实例。
  abort_signal?: AbortSignal
  // query_id 覆盖;如果未指定,将自动生成随机标识符。
  query_id?: string
  // session_id 覆盖;如果未指定,将从客户端配置中获取会话 ID。
  session_id?: string
  // 凭据覆盖;如果未指定,将使用客户端凭据。
  auth?: { username: string, password: string }
  // 用于此查询的特定角色列表。覆盖客户端配置中设置的角色。
  role?: string | Array<string>
}
```

### 查询方法

此方法适用于大多数会返回响应的语句，例如 `SELECT`，或用于发送 `CREATE TABLE` 等 DDL，并且应使用 `await` 等待其结果。返回的结果集通常会在应用程序中被使用。

:::note
用于数据插入有专门的方法 [insert](./js.md#insert-method)，用于 DDL 则有 [command](./js.md#command-method)。
:::

```ts
interface QueryParams extends BaseQueryParams {
  // 要执行的查询,可能返回数据。
  query: string
  // 结果数据集的格式。默认值:JSON。
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

#### 结果集和行抽象

`ResultSet` 为应用中的数据处理提供了多种便捷方法。

Node.js 的 `ResultSet` 实现在底层使用 `Stream.Readable`，而 Web 版本则使用 Web API 的 `ReadableStream`。

你可以通过在 `ResultSet` 上调用 `text` 或 `json` 方法来消费 `ResultSet`，并将查询返回的全部行数据加载到内存中。


你应尽早开始消费（读取）`ResultSet`，因为它会保持响应流处于打开状态，从而占用底层连接。客户端不会对传入数据进行缓冲，以避免应用程序可能出现的过度内存占用。

或者，如果结果集过大，无法一次全部加载到内存中，你可以调用 `stream` 方法，以流式模式处理数据。响应的每个块（chunk）会被转换成一个相对较小的行数组（该数组的大小取决于客户端从服务器接收的具体块大小——该大小可能变化——以及单行的大小），并逐块处理。

请参阅[支持的数据格式列表](./js.md#supported-data-formats)，以确定在你的场景下适合流式处理的最佳格式。比如，如果你希望以流的方式处理 JSON 对象，可以选择 [JSONEachRow](/interfaces/formats/JSONEachRow)，这样每一行都会被解析为一个 JS 对象；或者选择更紧凑的 [JSONCompactColumns](/interfaces/formats/JSONCompactColumns) 格式，使得每一行被表示为一个紧凑的值数组。另请参阅：[流式处理文件](./js.md#streaming-files-nodejs-only)。

:::important
如果 `ResultSet` 或其流未被完全消费，那么在经历 `request_timeout` 配置的空闲时间后，它将被销毁。
:::

```ts
interface BaseResultSet<Stream> {
  // 参见上文"查询 ID"部分
  query_id: string

  // 读取整个流并以字符串形式获取内容
  // 可用于任何 DataFormat
  // 仅应调用一次
  text(): Promise<string>

  // 读取整个流并将内容解析为 JS 对象
  // 仅可用于 JSON 格式
  // 仅应调用一次
  json<T>(): Promise<T>

  // 返回可流式传输响应的可读流
  // 流的每次迭代提供指定 DataFormat 中的 Row[] 数组
  // 仅应调用一次
  stream(): Stream
}

interface Row {
  // 以纯字符串形式获取行内容
  text: string

  // 将行内容解析为 JS 对象
  json<T>(): T
}
```

**示例：**（Node.js/Web）一个返回 `JSONEachRow` 格式结果数据集的查询，读取整个数据流并将其内容解析为 JS 对象。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // 或使用 `row.text` 避免解析 JSON
```

**示例：**（仅限 Node.js）使用经典的 `on('data')` 方式，以 `JSONEachRow` 格式流式获取查询结果。此方式可以与 `for await const` 语法互相替代。[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

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

**示例：**（仅适用于 Node.js）使用经典的 `on('data')` 方式，以 `CSV` 格式流式获取查询结果。此方式可以与 `for await const` 语法互换使用。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5', // 从 system.numbers_mt 表查询 5 条记录
  format: 'CSV', // 或使用 TabSeparated、CustomSeparated 等格式
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


**示例：**（仅限 Node.js）以 `JSONEachRow` 格式将查询结果作为 JS 对象进行流式处理，并使用 `for await const` 语法进行消费。此方式可以替代经典的 `on('data')` 方法，二者可互换使用。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers LIMIT 10', // 从 system.numbers 表中查询前 10 条记录
  format: 'JSONEachRow', // 或使用 JSONCompactEachRow、JSONStringsEachRow 等格式
})
for await (const rows of resultSet.stream()) {
  rows.forEach(row => {
    console.log(row.json())
  })
}
```

:::note
与 `on('data')` 方式相比，`for await const` 语法代码更精简一些，但可能会对性能产生不利影响。
更多详情请参阅 [Node.js 仓库中的这个问题](https://github.com/nodejs/node/issues/31979)。
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

### 插入方法

这是插入数据的首选方法。

```ts
export interface InsertResult {
  query_id: string
  executed: boolean
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

返回类型被设计得非常精简，因为我们不期望从服务器返回任何数据，并且会立即消费响应流。

如果向 insert 方法传入的是一个空数组，则不会向服务器发送 insert 语句；相反，该方法会立即返回 `{ query_id: '...', executed: false }`。如果在这种情况下没有在方法参数中提供 `query_id`，则结果中的 `query_id` 将是一个空字符串，因为返回由客户端生成的随机 UUID 可能会令人困惑——带有该 `query_id` 的查询并不会出现在 `system.query_log` 表中。

如果 insert 语句已发送到服务器，则 `executed` 标志将为 `true`。

#### Node.js 中的 Insert 方法和流式处理

它可以与 `Stream.Readable` 或普通的 `Array<T>` 一起工作，具体取决于传递给 `insert` 方法的 [data format](./js.md#supported-data-formats)。另请参阅关于 [file streaming](./js.md#streaming-files-nodejs-only) 的章节。

Insert 方法应当被 `await`；不过，也可以先指定一个输入流，并在流完成时再等待 `insert` 操作（这也会使 `insert` 的 promise 被 resolve）。这对于事件监听器和类似场景可能有用，但在客户端进行错误处理时可能会存在许多边缘情况，处理起来并不简单。相反，请考虑使用 [async inserts](/optimize/asynchronous-inserts)，如 [此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts) 所示。

:::tip
如果你有一个使用此方法难以建模的自定义 INSERT 语句，请考虑使用 [command method](./js.md#command-method)。

你可以在 [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) 或 [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) 示例中看到它的用法。
:::


```ts
interface InsertParams<T> extends BaseQueryParams {
  // 要插入数据的目标表名
  table: string
  // 待插入的数据集
  values: ReadonlyArray<T> | Stream.Readable
  // 待插入数据集的格式
  format?: DataFormat
  // 指定数据将插入到哪些列
  // - 数组形式如 `['a', 'b']` 将生成:`INSERT INTO table (a, b) FORMAT DataFormat`
  // - 对象形式如 `{ except: ['a', 'b'] }` 将生成:`INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // 默认情况下,数据将插入到表的所有列,
  // 生成的语句为:`INSERT INTO table FORMAT DataFormat`
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

另请参阅：[所有客户端方法的通用参数](./js.md#base-parameters-for-all-client-methods)。

:::important
使用 `abort_signal` 取消请求并不能保证数据未被插入，因为在取消前服务器可能已经接收到部分流式数据。
:::

**示例：**（Node.js/Web）插入一个值的数组。
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

**示例：**（仅限 Node.js）从 CSV 文件插入数据流。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。另请参阅：[文件流式传输](./js.md#streaming-files-nodejs-only)。

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**示例**：在 INSERT 语句中排除某些列。

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

请参阅[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts)以了解更多细节。

**示例**：向与客户端实例所配置数据库不同的其他数据库中插入数据。[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: 'mydb.mytable', // 包含数据库的完全限定名
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```

#### Web 版本的限制

目前，`@clickhouse/client-web` 中的插入操作仅支持 `Array<T>` 和 `JSON*` 格式。
由于浏览器兼容性较差，Web 版本暂不支持流式插入。

因此，Web 版本的 `InsertParams` 接口与 Node.js 版本略有不同，
其中 `values` 仅支持 `ReadonlyArray<T>` 类型：


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

此处内容未来可能会发生变更。另请参阅：[所有客户端方法的基础参数](./js.md#base-parameters-for-all-client-methods)。

### Command 方法

可用于没有任何输出的语句、`FORMAT` 子句不适用的场景，或你完全不关心响应的情况。此类语句的示例包括 `CREATE TABLE` 或 `ALTER TABLE`。

应使用 `await` 等待其完成。

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

另请参阅：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

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

**示例：**（Node.js/Web）在自托管的 ClickHouse 实例中创建一张表。
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
使用 `abort_signal` 取消请求并不能保证该语句未在服务器上执行。
:::

### Exec 方法

如果你有一个不适用于 `query`/`insert` 的自定义查询，
并且需要获取其结果，可以使用 `exec` 作为 `command` 的替代方案。

`exec` 会返回一个可读流，该流必须在应用程序端被消费或销毁。

```ts
interface ExecParams extends BaseQueryParams {
  // 待执行的语句。
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

另请参阅：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

在 Node.js 版和 Web 版中，流的返回类型不同。

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

### Ping

用于检查连通性状态的 `ping` 方法在服务器可达时返回 `true`。

如果服务器不可达，底层错误信息也会包含在返回结果中。

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }
```


/\*\* 使用内置 `/ping` 端点执行健康检查请求的参数。
- 这是 Node.js 版本的默认行为。 _/
  export type PingParamsWithEndpoint = {
  select: false
  /\*\* 用于取消进行中请求的 AbortSignal 实例。 _/
  abort_signal?: AbortSignal
  /** 要附加到此特定请求的额外 HTTP 头部。 \*/
  http_headers?: Record<string, string>
  }
  /** 使用 SELECT 查询执行健康检查请求的参数。
- 这是 Web 版本的默认行为，因为 `/ping` 端点不支持 CORS。
- 大多数标准的 `query` 方法参数（例如 `query_id`、`abort_signal`、`http_headers` 等）都可以使用，
- 但不包括 `query_params`，在此方法中允许它没有意义。 \*/
  export type PingParamsWithSelectQuery = { select: true } & Omit<
  BaseQueryParams,
  'query_params'
  > export type PingParams = PingParamsWithEndpoint | PingParamsWithSelectQuer
  >
  > y

interface ClickHouseClient {
ping(params?: PingParams): Promise<PingResult>
}

````

在应用程序启动时，ping 可用于检查服务器是否可用，尤其是在使用 ClickHouse Cloud 时，实例可能处于空闲状态，并会在接收到一次 ping 后被唤醒：在这种情况下，可以在两次调用之间增加延迟并重试几次。

请注意，默认情况下，Node.js 版本使用 `/ping` 端点，而 Web 版本使用简单的 `SELECT 1` 查询来实现类似的效果，因为 `/ping` 端点不支持 CORS。

**示例：**（Node.js/Web）向 ClickHouse 服务器实例发送一次简单的 ping。注意：对于 Web 版本，捕获到的错误会有所不同。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // 处理 result.error
}
````

**示例：** 如果希望在调用 `ping` 方法时同时校验凭证，或指定诸如 `query_id` 等其他参数，可以按如下方式使用：

```ts
const result = await client.ping({
  select: true /* query_id, abort_signal, http_headers, or any other query params */
})
```

`ping` 方法允许使用大多数标准的 `query` 方法参数——详见 `PingParamsWithSelectQuery` 的类型定义。

### 关闭（仅限 Node.js） {#close-nodejs-only}

关闭所有已打开的连接并释放资源。在 Web 版本中此方法不执行任何操作。

```ts
await client.close()
```


## 流式处理文件（仅限 Node.js） {#streaming-files-nodejs-only}

在客户端代码仓库中提供了多个文件流式处理示例，涵盖常见数据格式（NDJSON、CSV、Parquet）。

- [从 NDJSON 文件进行流式读取](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [从 CSV 文件进行流式读取](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [从 Parquet 文件进行流式读取](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [以流式方式写入 Parquet 文件](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

以流的方式将其他格式写入文件的过程应与 Parquet 类似，
唯一的区别在于 `query` 调用中使用的格式（如 `JSONEachRow`、`CSV` 等）以及输出文件名。



## 支持的数据格式 {#supported-data-formats}

客户端可以将数据处理为 JSON 或文本格式。

如果你将 `format` 指定为 JSON 系列格式之一（`JSONEachRow`、`JSONCompactEachRow` 等），客户端会在网络传输时对数据进行序列化和反序列化。

以“原始”文本格式（`CSV`、`TabSeparated` 和 `CustomSeparated` 系列）提供的数据会在没有额外转换的情况下通过网络发送。

:::tip
这里可能会混淆通用的 JSON 格式与 [ClickHouse JSON 格式](/interfaces/formats/JSON)。

客户端支持使用诸如 [JSONEachRow](/interfaces/formats/JSONEachRow) 等格式以流式方式传输 JSON 对象（有关其他适合流式传输的格式，请参见下方表格概览；另请参见客户端仓库中的 `select_streaming_` [示例](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)）。

不过，像 [ClickHouse JSON](/interfaces/formats/JSON) 及少数其他格式在响应中会被表示为单个对象，因此客户端无法对其进行流式传输。
:::

| Format                                     | 输入（数组）  | 输入（对象）   | 输入/输出（流）        | 输出（JSON）  | 输出（文本）   |
|--------------------------------------------|---------------|----------------|------------------------|---------------|----------------|
| JSON                                       | ❌             | ✔️             | ❌                      | ✔️            | ✔️             |
| JSONCompact                                | ❌             | ✔️             | ❌                      | ✔️            | ✔️             |
| JSONObjectEachRow                          | ❌             | ✔️             | ❌                      | ✔️            | ✔️             |
| JSONColumnsWithMetadata                    | ❌             | ✔️             | ❌                      | ✔️            | ✔️             |
| JSONStrings                                | ❌             | ❌️             | ❌                      | ✔️            | ✔️             |
| JSONCompactStrings                         | ❌             | ❌              | ❌                      | ✔️            | ✔️             |
| JSONEachRow                                | ✔️            | ❌              | ✔️                     | ✔️            | ✔️             |
| JSONEachRowWithProgress                    | ❌️            | ❌              | ✔️ ❗- 见下文           | ✔️            | ✔️             |
| JSONStringsEachRow                         | ✔️            | ❌              | ✔️                     | ✔️            | ✔️             |
| JSONCompactEachRow                         | ✔️            | ❌              | ✔️                     | ✔️            | ✔️             |
| JSONCompactStringsEachRow                  | ✔️            | ❌              | ✔️                     | ✔️            | ✔️             |
| JSONCompactEachRowWithNames                | ✔️            | ❌              | ✔️                     | ✔️            | ✔️             |
| JSONCompactEachRowWithNamesAndTypes        | ✔️            | ❌              | ✔️                     | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNames         | ✔️            | ❌              | ✔️                     | ✔️            | ✔️             |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔️            | ❌              | ✔️                     | ✔️            | ✔️             |
| CSV                                        | ❌             | ❌              | ✔️                     | ❌             | ✔️             |
| CSVWithNames                               | ❌             | ❌              | ✔️                     | ❌             | ✔️             |
| CSVWithNamesAndTypes                       | ❌             | ❌              | ✔️                     | ❌             | ✔️             |
| TabSeparated                               | ❌             | ❌              | ✔️                     | ❌             | ✔️             |
| TabSeparatedRaw                            | ❌             | ❌              | ✔️                     | ❌             | ✔️             |
| TabSeparatedWithNames                      | ❌             | ❌              | ✔️                     | ❌             | ✔️             |
| TabSeparatedWithNamesAndTypes              | ❌             | ❌              | ✔️                     | ❌             | ✔️             |
| CustomSeparated                            | ❌             | ❌              | ✔️                     | ❌             | ✔️             |
| CustomSeparatedWithNames                   | ❌             | ❌              | ✔️                     | ❌             | ✔️             |
| CustomSeparatedWithNamesAndTypes           | ❌             | ❌              | ✔️                     | ❌             | ✔️             |
| Parquet                                    | ❌             | ❌              | ✔️                     | ❌             | ✔️❗- 见下文    |



对于 Parquet，SELECT 查询的主要用例很可能是将结果流写入文件。请参阅客户端代码仓库中的[示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)。

`JSONEachRowWithProgress` 是一种仅用于输出的格式，支持在流中进行进度报告。有关更多详细信息，请参阅[此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)。

完整的 ClickHouse 输入和输出格式列表可在
[此处](/interfaces/formats)查阅。



## 支持的 ClickHouse 数据类型

:::note
下文所列的 JS 类型适用于所有 `JSON*` 格式，唯独不包括那些将所有内容都表示为字符串的格式（例如 `JSONStringEachRow`）。
:::

| Type                   | Status          | JS type                          |
| ---------------------- | --------------- | -------------------------------- |
| UInt8/16/32            | ✔️              | number                           |
| UInt64/128/256         | ✔️ ❗- see below | string                           |
| Int8/16/32             | ✔️              | number                           |
| Int64/128/256          | ✔️ ❗- see below | string                           |
| Float32/64             | ✔️              | number                           |
| Decimal                | ✔️ ❗- see below | number                           |
| Boolean                | ✔️              | boolean                          |
| String                 | ✔️              | string                           |
| FixedString            | ✔️              | string                           |
| UUID                   | ✔️              | string                           |
| Date32/64              | ✔️              | string                           |
| DateTime32/64          | ✔️ ❗- see below | string                           |
| Enum                   | ✔️              | string                           |
| LowCardinality         | ✔️              | string                           |
| Array(T)               | ✔️              | T[]                              |
| (new) JSON             | ✔️              | object                           |
| Variant(T1, T2...)     | ✔️              | T (depends on the variant)       |
| Dynamic                | ✔️              | T (depends on the variant)       |
| Nested                 | ✔️              | T[]                              |
| Tuple(T1, T2, ...)     | ✔️              | [T1, T2, ...]                    |
| Tuple(n1 T1, n2 T2...) | ✔️              | &#123; n1: T1; n2: T2; ...&#125; |
| Nullable(T)            | ✔️              | JS type for T or null            |
| IPv4                   | ✔️              | string                           |
| IPv6                   | ✔️              | string                           |
| Point                  | ✔️              | [ number, number ]               |
| Ring                   | ✔️              | Array&lt;Point&gt;               |
| Polygon                | ✔️              | Array&lt;Ring&gt;                |
| MultiPolygon           | ✔️              | Array&lt;Polygon&gt;             |
| Map(K, V)              | ✔️              | Record&lt;K, V&gt;               |
| Time/Time64            | ✔️              | string                           |

完整的受支持 ClickHouse 数据格式列表可在
[此处](/sql-reference/data-types/) 查阅。

另请参阅：

* [使用 Dynamic/Variant/JSON 的示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/dynamic_variant_json.ts)
* [使用 Time/Time64 的示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/time_time64.ts)

### Date/Date32 类型注意事项

由于客户端在插入值时不会进行额外的类型转换，`Date`/`Date32` 类型的列只能以字符串形式插入。

**示例：** 插入一个 `Date` 类型的值。\
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

然而，如果你使用的是 `DateTime` 或 `DateTime64` 列，则既可以使用字符串，也可以使用 JS Date 对象。在将 `date_time_input_format` 设置为 `best_effort` 时，JS Date 对象可以原样传递给 `insert`。更多详情参见此[示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts)。

### Decimal* 类型注意事项

可以使用 `JSON*` 系列格式插入 Decimal 类型的值。假设我们有如下定义的表：

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

我们可以使用字符串形式插入数值，从而避免发生精度损失：


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

但是，当以 `JSON*` 格式查询数据时，ClickHouse 默认会以数值形式返回 Decimal 类型的数据，这可能会导致精度丢失。为避免这种情况，可以在查询中将 Decimal 转换为字符串：

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

有关更多详细信息，请参阅[此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts)。

### 整数类型：Int64、Int128、Int256、UInt64、UInt128、UInt256

尽管服务器可以将其作为数值接收，但在 `JSON*` 系列输出格式中会以字符串返回，
以避免整数溢出，因为这些类型的最大值大于 `Number.MAX_SAFE_INTEGER`。

不过，可以通过
[`output_format_json_quote_64bit_integers` 设置](/operations/settings/formats#output_format_json_quote_64bit_integers)
来修改此行为。

**示例：** 调整 64 位数的 JSON 输出格式。

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


## ClickHouse 设置

客户端可以通过 [settings](/operations/settings/settings/) 机制调整 ClickHouse 的行为。
可以在客户端实例级别设置这些 settings，使其应用于发送到 ClickHouse 的每个请求：

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

也可以在请求级别进行配置：

```ts
client.query({
  clickhouse_settings: {}
})
```

包含 ClickHouse 所有受支持设置的类型声明文件可以在
[此处](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts) 找到。

:::important
请确保代表其发出查询的用户拥有足够的权限来更改这些设置。
:::


## 高级主题

### 带参数的查询

你可以创建带参数的查询，并从客户端应用向这些参数传递值。这样可以避免在客户端使用特定的动态值对查询进行格式化。

像平常一样编写查询，然后将你希望通过应用参数传递给查询的值用花括号括起来，格式如下：

```text
{<名称>: <数据类型>}
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

请参阅 [https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax](https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax) 了解更多详细信息。

### 压缩

注意：目前 Web 版本尚不支持请求压缩。响应压缩可正常使用。Node.js 版本同时支持请求和响应压缩。

对于通过网络处理大规模数据集的数据应用，启用压缩可以带来收益。目前，仅支持使用 [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html) 的 `GZIP` 压缩方式。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

配置参数如下：

* `response: true` 让 ClickHouse 服务器返回压缩后的响应体。默认值：`response: false`
* `request: true` 对客户端请求体启用压缩。默认值：`request: false`

### 日志记录（仅限 Node.js）

:::important
日志记录是一个实验性特性，将来可能会发生变化。
:::

默认的记录器实现通过 `console.debug/info/warn/error` 方法将日志记录输出到 `stdout`。
您可以通过提供 `LoggerClass` 来自定义日志记录逻辑，并通过 `level` 参数选择所需的日志级别（默认值为 `OFF`）：

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

当前，客户端会记录以下事件：

* `TRACE` - 关于 Keep-Alive 套接字生命周期的底层信息
* `DEBUG` - 响应信息（不包含 Authorization 头和主机信息）
* `INFO` - 基本上不会使用，在客户端初始化时会打印当前日志级别
* `WARN` - 非致命错误；失败的 `ping` 请求会被记录为警告，因为底层错误已包含在返回结果中
* `ERROR` - 来自 `query`/`insert`/`exec`/`command` 方法的致命错误，例如请求失败

可以在[这里](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts)找到默认的 Logger 实现。

### TLS 证书（仅适用于 Node.js）

Node.js 客户端可选择使用基础（仅证书颁发机构 Certificate Authority）
和双向（证书颁发机构加客户端证书）TLS。

下面是基础 TLS 配置示例，假设您的证书位于 `certs` 文件夹中，
且 CA 文件名为 `CA.pem`：

```ts
const client = createClient({
  url: 'https://<hostname>:<port>',
  username: '<username>',
  password: '<password>', // 如需要
  tls: {
    ca_cert: fs.readFileSync('certs/CA.pem'),
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

在代码仓库中查看 [basic](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) 和 [mutual](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS 的完整示例。

### Keep-Alive 配置（仅限 Node.js）

客户端默认在底层 HTTP agent 中启用 Keep-Alive，这意味着已建立连接的 socket 会被重用于后续请求，并且会发送 `Connection: keep-alive` 头。处于空闲状态的 socket 默认会在连接池中保留 2500 毫秒（参见[关于调整此选项的说明](./js.md#adjusting-idle_socket_ttl)）。

`keep_alive.idle_socket_ttl` 的值应当明显低于服务器/负载均衡（LB）的配置。主要原因是，由于 HTTP/1.1 允许服务器在不通知客户端的情况下关闭 socket，如果服务器或负载均衡器在客户端之前关闭连接，客户端可能会尝试重用已关闭的 socket，从而产生 `socket hang up` 错误。

如果需要修改 `keep_alive.idle_socket_ttl`，请记住它应始终与服务器/LB 的 Keep-Alive 配置保持一致，并且**始终低于**该值，以确保不会由服务器先关闭已打开的连接。

#### 调整 `idle_socket_ttl`

客户端将 `keep_alive.idle_socket_ttl` 设置为 2500 毫秒，因为这可以视为最安全的默认值；在服务器端，如果不修改 `config.xml`，`keep_alive_timeout` 在 [ClickHouse 23.11 之前的版本中可能被设置得最低为 3 秒](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1)。

:::warning
如果对当前性能满意且没有遇到任何问题，建议**不要**提高 `keep_alive.idle_socket_ttl` 的值，因为这可能会导致潜在的 `socket hang up` 错误；此外，如果应用程序发送大量查询，且它们之间的空闲时间并不长，那么默认值通常已经足够，因为 socket 不会空闲很长时间，客户端会将它们保留在连接池中。
:::

你可以通过运行以下命令，在服务器响应头中找到正确的 Keep-Alive 超时时间值：

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

检查响应中 `Connection` 和 `Keep-Alive` 这两个头部的取值。例如：

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

在这种情况下，`keep_alive_timeout` 为 10 秒，你可以尝试将 `keep_alive.idle_socket_ttl` 增加到 9000 甚至 9500 毫秒，以便让空闲的 socket 保持打开状态的时间比默认值稍长一些。请留意可能出现的 “Socket hang-up” 错误，这表明服务器在客户端之前关闭了连接，此时应逐步调低该值，直到错误消失为止。

#### 故障排查

如果即使在使用最新版本客户端时仍然遇到 `socket hang up` 错误，可以通过以下方式来解决该问题：

* 启用至少为 `WARN` 级别的日志。这将便于检查应用代码中是否存在未消费或悬挂的流：传输层会在 WARN 级别记录这些情况，因为它们可能会导致服务器关闭 socket。你可以在客户端配置中按如下方式启用日志：

  ```ts
  const client = createClient({
    log: { level: ClickHouseLogLevel.WARN },
  })
  ```

* 在应用代码中启用 [no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/) ESLint 规则，以帮助识别未处理的 Promise，这些 Promise 可能会导致流和 socket 处于悬挂状态。


* 在 ClickHouse 服务器配置中可以适当降低 `keep_alive.idle_socket_ttl` 设置。在某些情况下，例如客户端与服务器之间网络延迟较高时，可以再将 `keep_alive.idle_socket_ttl` 额外降低 200–500 毫秒，以避免出现这样的情况：某个即将发出的请求获取到的 socket 恰好是服务器马上要关闭的那个。

* 如果此错误发生在长时间运行且无数据进出（例如长时间运行的 `INSERT FROM SELECT`）的查询期间，这可能是由于负载均衡器关闭了空闲连接。你可以尝试通过组合以下 ClickHouse 设置，在长时间运行的查询期间强制产生一些数据流量：

  ```ts
  const client = createClient({
    // 这里我们假定会有执行时间超过 5 分钟的查询
    request_timeout: 400_000,
    /** 这些设置配合使用，可以避免在长时间运行但无数据进出时出现 LB 超时问题，
     *  例如 `INSERT FROM SELECT` 及类似查询，因为连接可能会被 LB 标记为空闲并被突然关闭。
     *  在这个例子中，我们假定 LB 的空闲连接超时时间为 120 秒，因此将 110 秒设置为一个“安全”的值。 */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: '110000', // UInt64，应以字符串形式传入
    },
  })
  ```

  但请注意，在较新的 Node.js 版本中，接收的 HTTP 头部总大小有 16KB 的限制；在接收到一定数量的进度头部之后（在我们的测试中大约是 70–80 个），就会抛出异常。

  还可以采用完全不同的方法，彻底避免在网络上传输时的等待时间；可以利用 HTTP 接口的一个“特性”：当连接丢失时，mutation 不会被取消。有关更多详情，请参阅[此示例（第 2 部分）](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts)。

* 可以完全禁用 Keep-Alive 功能。在这种情况下，客户端还会在每个请求中添加 `Connection: close` 头部，而底层 HTTP agent 将不会重用连接。由于不会产生空闲 socket，`keep_alive.idle_socket_ttl` 设置将被忽略。这会带来额外开销，因为每个请求都会新建一个连接。

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```

### 只读用户

在使用带有 [readonly=1 用户](/operations/settings/permissions-for-queries#readonly) 的客户端时，无法启用响应压缩，因为这需要 `enable_http_compression` 设置。以下配置将导致错误：

```ts
const client = createClient({
  compression: {
    response: true, // 不适用于 readonly=1 用户
  },
})
```

请参考这个[示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)，其中展示了更多 `readonly=1` 用户的限制说明。

### 带有 pathname 的代理

如果你的 ClickHouse 实例位于代理之后，并且在 URL 中包含 pathname，例如 [http://proxy:8123/clickhouse&#95;server](http://proxy:8123/clickhouse_server)，请将 `clickhouse_server` 指定为 `pathname` 配置选项（可以带或不带前导斜杠）；否则，如果直接在 `url` 中提供，它将被视为 `database` 选项。支持多个路径段，例如 `/my_proxy/db`。

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```

### 带身份验证的反向代理

如果在 ClickHouse 部署前面有一个带身份验证的反向代理，你可以使用 `http_headers` 配置来提供所需的请求头：

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```

### 自定义 HTTP/HTTPS Agent（实验性功能，仅限 Node.js）

:::warning
这是一个实验性功能，在未来的版本中可能会发生不向后兼容的变更。客户端提供的默认实现和设置应能满足大多数使用场景。仅在你确信确有此需求时才使用此功能。
:::


默认情况下，客户端会根据客户端配置中提供的设置（例如 `max_open_connections`、`keep_alive.enabled`、`tls`）来配置底层的 HTTP(s) agent，用于处理与 ClickHouse 服务器的连接。此外，如果使用了 TLS 证书，底层 agent 也会被配置上所需的证书，并强制使用正确的 TLS 认证头部。

从 1.2.0 版本开始，可以向客户端提供自定义的 HTTP(s) agent 来替换默认的底层 agent。这在网络配置较为复杂的情况下会很有用。如果提供了自定义 agent，将会有以下约束：

* `max_open_connections` 和 `tls` 选项将*不起任何作用*，并会被客户端忽略，因为这些选项属于底层 agent 的配置。
* `keep_alive.enabled` 只会控制 `Connection` 头的默认值（`true` -&gt; `Connection: keep-alive`，`false` -&gt; `Connection: close`）。
* 虽然空闲 keep-alive 套接字的管理仍然有效（因为它不依赖于 agent，而是与具体的套接字本身绑定），但现在可以通过将 `keep_alive.idle_socket_ttl` 的值设置为 `0` 来完全禁用此功能。

#### 自定义 agent 使用示例

在不使用证书的情况下使用自定义 HTTP(s) Agent：

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

使用自定义 HTTPS Agent，并配置基础 TLS 和 CA 证书：

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
  // 使用自定义 HTTPS 代理时,客户端将不使用默认的 HTTPS 连接实现;请手动提供请求头
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
  },
  // 重要:授权请求头与 TLS 请求头冲突;请禁用该选项。
  set_basic_auth_header: false,
})
```

使用自定义 HTTPS Agent 实现双向 TLS：

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

在使用证书 *并且* 自定义 *HTTPS* Agent 的情况下，很可能需要通过 `set_basic_auth_header` 设置（在 1.2.0 中引入）来禁用默认的 Authorization 请求头，因为它会与 TLS 请求头冲突。所有 TLS 请求头都应当由你手动提供。


## 已知限制（Node.js/web） {#known-limitations-nodejsweb}

- 结果集没有数据映射器，因此只使用语言原生类型。计划为某些数据类型提供支持 [RowBinary 格式](https://github.com/ClickHouse/clickhouse-js/issues/216) 的映射器。
- [Decimal* 和 Date\* / DateTime\* 数据类型存在一些注意事项](./js.md#datedate32-types-caveats)。
- 在使用 JSON* 系列格式时，大于 Int32 的数字会以字符串形式表示，因为 Int64 及以上类型的最大值超过 `Number.MAX_SAFE_INTEGER`。更多详情请参见 [Integral types](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) 一节。



## 已知限制（web） {#known-limitations-web}

- 对 `SELECT` 查询的流式处理可用，但对 `INSERT`（包括在类型层面）则被禁用。
- 请求压缩已被禁用，相关配置会被忽略。响应压缩可用。
- 目前尚不支持日志记录。



## 性能优化提示 {#tips-for-performance-optimizations}

- 为了降低应用程序的内存消耗，在进行大批量插入（例如从文件）以及在适用场景下执行查询时，可以考虑使用流式处理。对于事件监听器及类似用例，[异步插入](/optimize/asynchronous-inserts) 也是一个不错的选择，它可以最大限度地减少、甚至完全避免在客户端侧进行批处理。异步插入示例可在[客户端代码仓库](https://github.com/ClickHouse/clickhouse-js/tree/main/examples)中找到，文件名前缀为 `async_insert_`。
- 客户端默认不会开启请求或响应的压缩。不过，在查询或插入大规模数据集时，可以通过 `ClickHouseClientConfigOptions.compression` 启用压缩（可以仅针对 `request` 或 `response`，也可以同时启用）。
- 压缩会带来显著的性能开销。为 `request` 或 `response` 启用压缩会分别降低查询或插入的速度，但会减少应用程序的网络传输流量。



## 联系我们 {#contact-us}

如果您有任何问题或需要帮助，欢迎通过 [社区 Slack](https://clickhouse.com/slack)（`#clickhouse-js` 频道）或 [GitHub Issues](https://github.com/ClickHouse/clickhouse-js/issues) 与我们联系。
