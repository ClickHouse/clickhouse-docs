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
'description': 'The official JS client for connecting to ClickHouse.'
'title': 'ClickHouse JS'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse JS

官方的 JS 客户端用于连接 ClickHouse。
该客户端是用 TypeScript 编写的，并为客户端公共 API 提供类型定义。

它没有任何依赖，经过最大性能优化，并与各种 ClickHouse 版本和配置（本地单节点、本地集群和 ClickHouse Cloud）进行了测试。

针对不同环境有两个不同版本的客户端可用：
- `@clickhouse/client` - 仅适用于 Node.js
- `@clickhouse/client-web` - 适用于浏览器（Chrome/Firefox）、Cloudflare workers

使用 TypeScript 时，请确保版本至少为 [4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)，这可以启用 [内联导入和导出语法](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)。

客户端源代码可以在 [ClickHouse-JS GitHub 仓库](https://github.com/ClickHouse/clickhouse-js) 中获取。

## 环境要求 (Node.js) {#environment-requirements-nodejs}

必须在环境中提供 Node.js 才能运行客户端。
该客户端与所有 [受维护的](https://github.com/nodejs/release#readme) Node.js 版本兼容。

一旦 Node.js 版本接近生命周期结束，客户端将不再支持该版本，因为它被视为过时和不安全。

当前支持的 Node.js 版本：

| Node.js 版本 | 支持?        |
|---------------|-------------|
| 22.x          | ✔           |
| 20.x          | ✔           |
| 18.x          | ✔           |
| 16.x          | 竭尽所能     |

## 环境要求 (Web) {#environment-requirements-web}

客户端的网页版本在最新的 Chrome/Firefox 浏览器中经过官方测试，可以作为 React/Vue/Angular 应用程序或 Cloudflare workers 的依赖项使用。

## 安装 {#installation}

要安装最新稳定的 Node.js 客户端版本，请运行：

```sh
npm i @clickhouse/client
```

网页版本安装：

```sh
npm i @clickhouse/client-web
```

## 与 ClickHouse 的兼容性 {#compatibility-with-clickhouse}

| 客户端版本 | ClickHouse  |
|------------|-------------|
| 1.8.0     | 23.3+       |

可能该客户端也能与旧版本兼容；然而，这只是尽力而为的支持，并不能保证。如果您使用的 ClickHouse 版本低于 23.3，请查看 [ClickHouse 安全策略](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) 并考虑升级。

## 示例 {#examples}

我们希望通过 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) 来涵盖客户端使用的各种场景。

概述可在 [示例 README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview) 中找到。

如果在示例或以下文档中有任何不清楚或遗漏的内容，请随时 [联系我们](./js.md#contact-us)。

### 客户端 API {#client-api}

大多数示例应与客户端的 Node.js 和网页版本兼容，除非明确另行说明。

#### 创建客户端实例 {#creating-a-client-instance}

您可以使用 `createClient` 工厂创建任意数量的客户端实例：

```ts
const client = createClient({
  /* 配置 */
})
```

如果您的环境不支持 ESM 模块，您可以改用 CJS 语法：

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* 配置 */
})
```

客户端实例可以在实例化时 [预配置](./js.md#configuration)。

#### 配置 {#configuration}

创建客户端实例时，可以调整以下连接设置：

| 设置                                                                  | 描述                                                                                 | 默认值                   | 参见                                                                                                                    |
|----------------------------------------------------------------------|------------------------------------------------------------------------------------|-------------------------|--------------------------------------------------------------------------------------------------------------------------|
| **url**?: string                                                     | ClickHouse 实例的 URL。                                                             | `http://localhost:8123` | [URL 配置文档](./js.md#url-configuration)                                                                               |
| **pathname**?: string                                                | 可选路径名，添加到 ClickHouse URL 解析后。                                          | `''`                    | [使用带有路径名的代理文档](./js.md#proxy-with-a-pathname)                                                                |
| **request_timeout**?: number                                         | 请求超时时间，以毫秒为单位。                                                       | `30_000`                | -                                                                                                                        |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }` | 启用压缩。                                                                          | -                       | [压缩文档](./js.md#compression)                                                                                       |
| **username**?: string                                                | 请求以该用户身份进行。                                                             | `default`               | -                                                                                                                        |
| **password**?: string                                                | 用户密码。                                                                         | `''`                    | -                                                                                                                        |
| **application**?: string                                             | 使用 Node.js 客户端的应用程序名称。                                                | `clickhouse-js`         | -                                                                                                                        |
| **database**?: string                                                | 要使用的数据库名称。                                                               | `default`               | -                                                                                                                        |
| **clickhouse_settings**?: ClickHouseSettings                         | 应用于所有请求的 ClickHouse 设置。                                                  | `{}`                    | -                                                                                                                        |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 内部客户端日志配置。                                                               | -                       | [日志文档](./js.md#logging-nodejs-only)                                                                                  |
| **session_id**?: string                                              | 可选的 ClickHouse 会话 ID，随每个请求发送。                                         | -                       | -                                                                                                                        |
| **keep_alive**?: `{ **enabled**?: boolean }`                        | Node.js 和网页版本默认启用。                                                      | -                       | -                                                                                                                        |
| **http_headers**?: `Record<string, string>`                          | 对于外发的 ClickHouse 请求的其他 HTTP 头。                                        | -                       | [使用带有身份验证的反向代理文档](./js.md#reverse-proxy-with-authentication)                                               |
| **roles**?: string \|  string[]                                      | 点击 House 角色名称，以附加到外发请求上。                                          | -                       | [使用角色与 HTTP 接口](./interfaces/http#setting-role-with-query-parameters)                                          |

#### Node.js 特定配置参数 {#nodejs-specific-configuration-parameters}

| 设置                                                                    | 描述                                                       | 默认值          | 参见                                                                                                |
|-------------------------------------------------------------------------|----------------------------------------------------------|----------------|-----------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                       | 每个主机允许的最大连接套接字数。                         | `10`           | -                                                                                                   |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }` | 配置 TLS 证书。                                         | -              | [TLS 文档](./js.md#tls-certificates-nodejs-only)                                                  |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                        | -              | [保持连接配置文档](./js.md#keep-alive-configuration-nodejs-only)                                   |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>  | 客户端的自定义 HTTP 代理。                              | -              | [HTTP 代理文档](./js.md#custom-httphttps-agent-experimental-nodejs-only)                             |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>          | 使用基本身份验证凭据设置 `Authorization` 头。           | `true`         | [此设置在 HTTP 代理文档中的用法](./js.md#custom-httphttps-agent-experimental-nodejs-only)         |

### URL 配置 {#url-configuration}

:::important
在这个情况下，URL 配置 _将始终_ 覆盖硬编码的值，并且会记录警告。
:::

可以通过 URL 配置大多数客户端实例参数。URL 格式是 `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`。在几乎所有情况下，特定参数的名称反映了其在配置选项接口中的路径，个别例外。支持以下参数：

| 参数                                     | 类型                                                           |
|------------------------------------------|----------------------------------------------------------------|
| `pathname`                               | 任意字符串。                                                   |
| `application_id`                         | 任意字符串。                                                   |
| `session_id`                             | 任意字符串。                                                   |
| `request_timeout`                        | 非负数。                                                       |
| `max_open_connections`                   | 非负数，大于零。                                              |
| `compression_request`                    | 布尔值。见下文 (1)                                           |
| `compression_response`                   | 布尔值。                                                       |
| `log_level`                              | 允许的值： `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`。 |
| `keep_alive_enabled`                     | 布尔值。                                                       |
| `clickhouse_setting_*` 或 `ch_*`         | 见下文 (2)                                                   |
| (仅适用于 Node.js) `keep_alive_idle_socket_ttl` | 非负数。                                                       |

- (1) 对于布尔值，有效值将是 `true`/`1` 和 `false`/`0`。
- (2) 任何以 `clickhouse_setting_` 或 `ch_` 开头的参数将去掉前缀，剩余部分将添加到客户端的 `clickhouse_settings` 中。例如，`?ch_async_insert=1&ch_wait_for_async_insert=1` 将与以下内容相同：

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

注意：对于 `clickhouse_settings` 的布尔值应作为 `1`/`0` 在 URL 中传递。

- (3) 类似于 (2)，但适用于 `http_header` 配置。例如，`?http_header_x-clickhouse-auth=foobar` 将等同于：

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

客户端通过 HTTP（S）协议实现连接。RowBinary 支持正在推进中，参见 [相关问题](https://github.com/ClickHouse/clickhouse-js/issues/216)。

以下示例演示了如何设置与 ClickHouse Cloud 的连接。假设 `url`（包括协议和端口）和 `password` 值是通过环境变量指定的，并且使用的是 `default` 用户。

**示例：** 使用环境变量为配置创建一个 Node.js 客户端实例。

```ts
const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

客户端库包含多个使用环境变量的示例，例如 [在 ClickHouse Cloud 中创建表](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)、[使用异步插入](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) 和其他一些示例。

#### 连接池（仅适用于 Node.js） {#connection-pool-nodejs-only}

为了避免在每个请求上都建立连接的开销，客户端创建了一个连接池用于重用，利用了 Keep-Alive 机制。默认情况下，保持连接已启用，并且连接池的大小设置为 `10`，但您可以通过 `max_open_connections` [配置选项](./js.md#configuration) 进行更改。

除非用户将 `max_open_connections` 设置为 `1`，否则不会保证在池中的同一连接会用于后续查询。这种情况很少需要，但在用户使用临时表的情况下可能是必要的。

另请参见： [保持连接配置](./js.md#keep-alive-configuration-nodejs-only)。

### 查询 ID {#query-id}

每个发送查询或语句的方法（`command`、`exec`、`insert`、`select`）将在结果中提供 `query_id`。此唯一标识符由客户端为每个查询分配，可能对从 `system.query_log` 中获取数据很有用，如果在 [服务器配置](/operations/server-configuration-parameters/settings) 中启用，或者取消长时间运行的查询（参见 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)）。如有必要，用户可以在 `command`/`query`/`exec`/`insert` 方法参数中覆盖 `query_id`。

:::tip
如果您覆盖 `query_id` 参数，您需要确保每个调用的唯一性。随机 UUID 是一个不错的选择。
:::

### 所有客户端方法的基本参数 {#base-parameters-for-all-client-methods}

有几个参数可以适用于所有客户端方法（[query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)）。

```ts
interface BaseQueryParams {
  // ClickHouse 设置，可以在查询级别应用。
  clickhouse_settings?: ClickHouseSettings;
  // 查询绑定的参数。
  query_params?: Record<string, unknown>;
  // 用于取消进行中的查询的 AbortSignal 实例。
  abort_signal?: AbortSignal;
  // 查询 ID 重写；如果未指定，将自动生成随机标识符。
  query_id?: string;
  // 会话 ID 重写；如果未指定，将使用来自客户端配置的会话 ID。
  session_id?: string;
  // 凭据重写；如果未指定，将使用客户端的凭据。
  auth?: { username: string, password: string };
  // 此查询要使用的特定角色列表。重写在客户端配置中设置的角色。
  role?: string | Array<string>;
}
```

### 查询方法 {#query-method}

此方法适用于可以产生响应的大多数语句，如 `SELECT`，或用于发送 DDL，如 `CREATE TABLE`，并应进行 await。返回的结果集预期会被应用程序使用。

:::note
有一个专用的方法 [insert](./js.md#insert-method) 用于数据插入，以及用于 DDL 的 [command](./js.md#command-method)。
:::

```ts
interface QueryParams extends BaseQueryParams {
  // 要执行的查询，可能返回一些数据。
  query: string;
  // 返回数据集的格式。默认：JSON。
  format?: DataFormat;
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>;
}
```

另请参见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

:::tip
在 `query` 中不要指定 FORMAT 子句，请使用 `format` 参数。
:::

#### 结果集和行抽象 {#result-set-and-row-abstractions}

`ResultSet` 提供了多个便捷方法，用于在您的应用程序中处理数据。

Node.js `ResultSet` 实现使用 `Stream.Readable` 底层实现，而网页版本使用 Web API 的 `ReadableStream`。

您可以通过调用 `ResultSet` 上的 `text` 或 `json` 方法来消费整个结果集，并将查询返回的整个行集加载到内存中。

您应该尽早开始消费 `ResultSet`，因为它保持响应流打开，因此使底层连接保持繁忙。客户端不会缓冲输入数据，以避免潜在的过度内存使用。

另外，如果数据太大而无法一次适应内存，您可以调用 `stream` 方法，并以流模式处理数据。每个响应块将被转换为相对较小的行数组（该数组的大小取决于客户端从服务器接收的特定块的大小，它可能有所不同，以及单个行的大小），一次一个块。

请参考 [支持的数据格式](./js.md#supported-data-formats) 列表，以确定在您的情况下流式传输的最佳格式。例如，如果您想流式传输 JSON 对象，您可以选择 [JSONEachRow](/sql-reference/formats#jsoneachrow)，每一行将被解析为 JS 对象，或者，或许，可以选择更紧凑的 [JSONCompactColumns](/sql-reference/formats#jsoncompactcolumns) 格式，那么每一行将作为一个紧凑的值数组。另请参见：[流式文件](./js.md#streaming-files-nodejs-only)。

:::important
如果 `ResultSet` 或它的流没有被完全消费，则将在 `request_timeout` 不活动期间被销毁。
:::

```ts
interface BaseResultSet<Stream> {
  // 请参阅“查询 ID”部分
  query_id: string;

  // 消费整个流并将内容作为字符串获取
  // 可以与任何 DataFormat 一起使用
  // 应仅调用一次
  text(): Promise<string>;

  // 消费整个流并将内容解析为 JS 对象
  // 只能与 JSON 格式使用
  // 应仅调用一次
  json<T>(): Promise<T>;

  // 返回可被流式传输的响应的可读流
  // 每次遍历流都会以所选 DataFormat 提供 Row[] 的数组
  // 应仅调用一次
  stream(): Stream;
}

interface Row {
  // 以普通字符串获取行的内容
  text: string;

  // 解析行的内容为 JS 对象
  json<T>(): T;
}
```

**示例：**（Node.js/Web）以 `JSONEachRow` 格式的查询，消费整个流并将内容解析为 JS 对象。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // 或者 `row.text` 避免解析 JSON
```

**示例：**（仅限 Node.js）以 `JSONEachRow` 格式流式查询结果，使用经典的 `on('data')` 方法。这可以与 `for await const` 语法互换。[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // 或 JSONCompactEachRow、JSONStringsEachRow 等。
})
const stream = rows.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.json()) // 或者 `row.text` 避免解析 JSON
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('已完成！')
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
  format: 'CSV', // 或 TabSeparated、CustomSeparated 等。
})
const stream = resultSet.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.text)
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('已完成！')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**示例：**（仅限 Node.js）以 `JSONEachRow` 格式将查询结果作为 JS 对象流式传输，使用 `for await const` 语法进行消费。这可以与经典的 `on('data')` 方法互换。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers LIMIT 10',
  format: 'JSONEachRow', // 或 JSONCompactEachRow、JSONStringsEachRow 等。
})
for await (const rows of resultSet.stream()) {
  rows.forEach(row => {
    console.log(row.json())
  })
}
```

:::note
`for await const` 语法相较于 `on('data')` 方法代码少一些，但可能会对性能产生负面影响。
有关更多详细信息，请参见 [Node.js 仓库中的此问题](https://github.com/nodejs/node/issues/31979)。
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

这是数据插入的主要方法。

```ts
export interface InsertResult {
  query_id: string;
  executed: boolean;
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>;
}
```

返回类型是最小的，因为我们不期望服务器返回任何数据，并立即消耗响应流。

如果向插入方法提供了一个空数组，插入语句将不会发送到服务器；相反，此方法将立即解析为 `{ query_id: '...', executed: false }`。如果在这种情况下未在方法参数中提供 `query_id`，则结果中的 `query_id` 将为空字符串，因为返回由客户端生成的随机 UUID 可能会造成混淆，因为带有该 `query_id` 的查询不会存在于 `system.query_log` 表中。

如果插入语句已发送到服务器，则 `executed` 标志将为 `true`。

#### 插入方法与 Node.js 中的流 {#insert-method-and-streaming-in-nodejs}

它可以与 `Stream.Readable` 或普通的 `Array<T>` 配合使用，具体取决于指定给 `insert` 方法的 [数据格式](./js.md#supported-data-formats)。另请参见此部分关于 [文件流式传输](./js.md#streaming-files-nodejs-only)。

插入方法应该进行 await；然而，可以指定输入流，并在流完成时稍后等待 `insert` 操作（这也将解析 `insert` 的 Promise）。这可能对事件监听器和类似场景非常有用，但错误处理可能在客户端上具有许多边缘情况而非简单。相反，请考虑使用 [异步插入](/optimize/asynchronous-inserts)，如 [这个示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts) 所示。

:::tip
如果您有一个难以用此方法建模的自定义 INSERT 语句，请考虑使用 [命令方法](./js.md#command-method)。

您可以在 [INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) 或 [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) 示例中查看它是如何使用的。
:::

```ts
interface InsertParams<T> extends BaseQueryParams {
  // 要插入数据的表名
  table: string;
  // 要插入的数据集。
  values: ReadonlyArray<T> | Stream.Readable;
  // 要插入的数据集格式。
  format?: DataFormat;
  // 允许指定数据将插入的列。
  // - 如 `['a', 'b']` 的数组将生成： `INSERT INTO table (a, b) FORMAT DataFormat`
  // - 如 `{ except: ['a', 'b'] }` 的对象将生成： `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // 默认情况下，数据将插入表的所有列，
  // 生成的语句将是： `INSERT INTO table FORMAT DataFormat`。
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> };
}
```

另请参见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

:::important
通过 `abort_signal` 取消的请求并不保证数据插入未发生，因为服务器可能在取消之前已接收到了一些流式数据。
:::

**示例：**（Node.js/Web）插入值的数组。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
await client.insert({
  table: 'my_table',
  // 结构应与所需格式匹配，本示例中的 JSONEachRow
  values: [
    { id: 42, name: 'foo' },
    { id: 42, name: 'bar' },
  ],
  format: 'JSONEachRow',
})
```

**示例：**（仅限 Node.js）从 CSV 文件插入流。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。另请参见：[文件流式传输](./js.md#streaming-files-nodejs-only)。

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**示例**：仅插入特定列。

给定某些表定义，例如：

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
  // 此行的 `id` 列值将为零（UInt32 的默认值）
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
  // 此行的 `message` 列值将为一个空字符串
  columns: {
    except: ['message'],
  },
})
```

有关详细信息，请参见 [源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts)。

**示例**：插入到与提供给客户端实例的不同数据库中。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: 'mydb.mytable', // 包含数据库的完整名称
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```
#### Web 版本限制 {#web-version-limitations}

目前，在 `@clickhouse/client-web` 中，仅支持 `Array<T>` 和 `JSON*` 格式的插入。由于浏览器兼容性差，Web 版本尚不支持插入流。

因此，Web 版本的 `InsertParams` 接口与 Node.js 版本略有不同，因为 `values` 限制为 `ReadonlyArray<T>` 类型：

```ts
interface InsertParams<T> extends BaseQueryParams {
  // 要插入数据的表名
  table: string
  // 要插入的数据集。
  values: ReadonlyArray<T>
  // 要插入的数据集格式。
  format?: DataFormat
  // 允许指定要插入数据的列。
  // - 数组，例如 `['a', 'b']` 将生成: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - 对象，例如 `{ except: ['a', 'b'] }` 将生成: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // 默认情况下，数据插入到表的所有列中，
  // 生成的语句将是: `INSERT INTO table FORMAT DataFormat`。
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

此内容未来可能会更改。另请参见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

### 命令方法 {#command-method}

可用于没有任何输出的语句，当格式子句不适用，或您根本不关心响应时。例如这样的语句可以是 `CREATE TABLE` 或 `ALTER TABLE`。

应等待执行。

响应流立即被销毁，这意味着底层的套接字被释放。

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

另请参见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

**示例：** (Node.js/Web) 在 ClickHouse Cloud 中创建一个表。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)。

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // 建议在集群中使用，以避免在响应代码后发生查询处理错误的情况，
  // 并且 HTTP 头已经发送到客户端。
  // 请参阅 https://clickhouse.com/docs/interfaces/http/#response-buffering
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

**示例：** (Node.js/Web) FROM SELECT 插入

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`,
})
```

:::important
使用 `abort_signal` 取消的请求并不能保证语句未被服务器执行。
:::
### Exec 方法 {#exec-method}

如果您有一个自定义查询不适合 `query`/`insert`，并且您对结果感兴趣，可以使用 `exec` 作为 `command` 的替代。

`exec` 返回一个可读的流，必须在应用程序方面进行消费或销毁。

```ts
interface ExecParams extends BaseQueryParams {
  // 要执行的语句。
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

另请参见：[所有客户端方法的基本参数](./js.md#base-parameters-for-all-client-methods)。

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

提供的 `ping` 方法用于检查连接状态，如果服务器可达则返回 `true`。

如果服务器不可达，则底层错误也包含在结果中。

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }

interface ClickHouseClient {
  ping(): Promise<PingResult>
}
```

Ping 可能是在应用程序启动时检查服务器是否可用的有用工具，特别是在 ClickHouse Cloud 中，实例可能处于空闲状态，并且在 ping 后会唤醒。

**示例：** (Node.js/Web) Ping ClickHouse 服务器实例。注意：对于 Web 版本，捕获的错误将不同。
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // 处理 result.error
}
```

注意：由于 `/ping` 端点未实现 CORS，Web 版本使用简单的 `SELECT 1` 来实现类似的结果。
### 关闭 (仅限 Node.js) {#close-nodejs-only}

关闭所有打开的连接并释放资源。在 Web 版本中无操作。

```ts
await client.close()
```
## 流文件 (仅限 Node.js) {#streaming-files-nodejs-only}

在客户端库中有几个流文件的示例，使用流行的数据格式 (NDJSON, CSV, Parquet)。

- [从 NDJSON 文件中流式传输](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [从 CSV 文件中流式传输](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [从 Parquet 文件中流式传输](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [流式传输到 Parquet 文件](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

将其他格式流式传输到文件应类似于 Parquet，唯一的区别在于用于 `query` 调用的格式 (`JSONEachRow`, `CSV` 等) 和输出文件名称。
## 支持的数据格式 {#supported-data-formats}

客户端将数据格式处理为 JSON 或文本。

如果您指定 `format` 为 JSON 系列中的一种 (`JSONEachRow`, `JSONCompactEachRow` 等)，客户端将在通信过程中对数据进行序列化和反序列化。

以“原始”文本格式 (`CSV`, `TabSeparated` 和 `CustomSeparated` 系列）提供的数据通过网络发送时不会进行额外转换。

:::tip
可能会对 JSON 作为一般格式和 [ClickHouse JSON 格式](/sql-reference/formats#json) 之间产生混淆。

客户端支持以 [JSONEachRow](/sql-reference/formats#jsoneachrow) 等格式流式传输 JSON 对象（有关其他流式友好格式的表概述；还请参阅客户端库中的 `select_streaming_` [示例](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)）。

仅格式如 [ClickHouse JSON](/sql-reference/formats#json) 和其他几种格式作为响应中的单个对象表示，无法通过客户端流式传输。
:::

| 格式                                     | 输入（数组） | 输入（对象） | 输入/输出（流） | 输出（JSON） | 输出（文本）  |
|------------------------------------------|--------------|---------------|------------------|--------------|----------------|
| JSON                                     | ❌            | ✔️            | ❌                | ✔️           | ✔️             |
| JSONCompact                              | ❌            | ✔️            | ❌                | ✔️           | ✔️             |
| JSONObjectEachRow                        | ❌            | ✔️            | ❌                | ✔️           | ✔️             |
| JSONColumnsWithMetadata                  | ❌            | ✔️            | ❌                | ✔️           | ✔️             |
| JSONStrings                              | ❌            | ❌             | ❌                | ✔️           | ✔️             |
| JSONCompactStrings                       | ❌            | ❌             | ❌                | ✔️           | ✔️             |
| JSONEachRow                              | ✔️            | ❌             | ✔️               | ✔️           | ✔️             |
| JSONEachRowWithProgress                  | ❌            | ❌             | ✔️ ❗- 请参阅下文 | ✔️           | ✔️             |
| JSONStringsEachRow                       | ✔️            | ❌             | ✔️               | ✔️           | ✔️             |
| JSONCompactEachRow                       | ✔️            | ❌             | ✔️               | ✔️           | ✔️             |
| JSONCompactStringsEachRow                | ✔️            | ❌             | ✔️               | ✔️           | ✔️             |
| JSONCompactEachRowWithNames              | ✔️            | ❌             | ✔️               | ✔️           | ✔️             |
| JSONCompactEachRowWithNamesAndTypes      | ✔️            | ❌             | ✔️               | ✔️           | ✔️             |
| JSONCompactStringsEachRowWithNames       | ✔️            | ❌             | ✔️               | ✔️           | ✔️             |
| JSONCompactStringsEachRowWithNamesAndTypes| ✔️          | ❌             | ✔️               | ✔️           | ✔️             |
| CSV                                      | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| CSVWithNames                             | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| CSVWithNamesAndTypes                     | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| TabSeparated                             | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| TabSeparatedRaw                          | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| TabSeparatedWithNames                    | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| TabSeparatedWithNamesAndTypes            | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| CustomSeparated                          | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| CustomSeparatedWithNames                 | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| CustomSeparatedWithNamesAndTypes         | ❌            | ❌             | ✔️               | ❌            | ✔️             |
| Parquet                                  | ❌            | ❌             | ✔️               | ❌            | ✔️❗- 请参阅下文 |

对于 Parquet，选择的主要用例可能是将结果流写入文件。请查看客户端库中的 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)。

`JSONEachRowWithProgress` 是一种仅输出格式，支持流中的进度报告。有关更多细节，请参阅 [此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)。

ClickHouse 输入和输出格式的完整列表可以在 
[这里](/interfaces/formats) 找到。
## 支持的 ClickHouse 数据类型 {#supported-clickhouse-data-types}

:::note
相关的 JS 类型适用于任何 `JSON*` 格式，除了将所有内容表示为字符串的格式（例如 `JSONStringEachRow`）。
:::

| 类型                | 状态             | JS 类型                     |
|---------------------|------------------|-----------------------------|
| UInt8/16/32         | ✔️               | number                      |
| UInt64/128/256      | ✔️ ❗- 请参阅下文 | string                      |
| Int8/16/32          | ✔️               | number                      |
| Int64/128/256       | ✔️ ❗- 请参阅下文 | string                      |
| Float32/64          | ✔️               | number                      |
| Decimal             | ✔️ ❗- 请参阅下文 | number                      |
| Boolean             | ✔️               | boolean                     |
| String              | ✔️               | string                      |
| FixedString         | ✔️               | string                      |
| UUID                | ✔️               | string                      |
| Date32/64           | ✔️               | string                      |
| DateTime32/64       | ✔️ ❗- 请参阅下文 | string                      |
| Enum                | ✔️               | string                      |
| LowCardinality      | ✔️               | string                      |
| Array(T)            | ✔️               | T[]                         |
| (新) JSON           | ✔️               | object                      |
| Variant(T1, T2...)  | ✔️               | T (取决于变体)              |
| Dynamic             | ✔️               | T (取决于变体)              |
| Nested              | ✔️               | T[]                         |
| Tuple               | ✔️               | Tuple                       |
| Nullable(T)         | ✔️               | T 的 JS 类型或 null          |
| IPv4                | ✔️               | string                      |
| IPv6                | ✔️               | string                      |
| Point               | ✔️               | [ number, number ]          |
| Ring                | ✔️               | Array&lt;Point\>           |
| Polygon             | ✔️               | Array&lt;Ring\>            |
| MultiPolygon        | ✔️               | Array&lt;Polygon\>         |
| Map(K, V)           | ✔️               | Record&lt;K, V\>           |

支持的 ClickHouse 格式的完整列表可以在 
[这里](/sql-reference/data-types/) 找到。
### Date/Date32 类型注意事项 {#datedate32-types-caveats}

由于客户端在插入值时不会进行额外的类型转换，`Date`/`Date32` 类型列仅能插入为字符串。

**示例：** 插入一个 `Date` 类型的值。 
[源代码](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)。

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

但是，如果您使用的是 `DateTime` 或 `DateTime64` 列，则可以使用字符串和 JS Date 对象。可以直接将 JS Date 对象传递给 `insert`，并设置 `date_time_input_format` 为 `best_effort`。请参阅 [此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts) 以获取更多详情。
### Decimal* 类型注意事项 {#decimal-types-caveats}

可以使用 `JSON*` 系列格式插入小数。假设我们有一个定义如下的表：

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

我们可以使用字符串表示法插入值而不会损失精度：

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

然而，当以 `JSON*` 格式查询数据时，ClickHouse 默认将小数返回为 _数字_，这可能导致精度损失。为了避免这种情况，您可以在查询中将小数类型强制转换为字符串：

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

有关更多详情，请参阅 [此示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts)。
### 整数类型：Int64, Int128, Int256, UInt64, UInt128, UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

尽管服务器可以将其视为数字，但在 `JSON*` 系列输出格式中，它作为字符串返回，以避免整数溢出，因为这些类型的最大值大于 `Number.MAX_SAFE_INTEGER`。

但是，可以通过 [`output_format_json_quote_64bit_integers` 设置](/operations/settings/formats#output_format_json_quote_64bit_integers) 修改此行为。

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
这些设置可以在客户端实例级别设置，以便应用于发送到 ClickHouse 的每个请求：

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

可以在 
[这里](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts) 找到包含所有支持的 ClickHouse 设置的类型声明文件。

:::important
确保在发出查询时的用户具有足够的权限更改设置。
:::
## 高级主题 {#advanced-topics}
### 带参数的查询 {#queries-with-parameters}

您可以创建带参数的查询，并从客户端应用程序传递值给它们。这使您可以避免在客户端侧格式化带有特定动态值的查询。

按照通常格式化查询，然后将您希望从应用程序参数传递到查询的值放在大括号中，格式如下：

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

有关更多细节，请查看 https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax。
### 压缩 {#compression}

注意：请求压缩当前在 Web 版本中不可用。响应压缩正常工作。Node.js 版本支持两者。

处理面向大数据集的应用程序可以通过启用压缩获益。目前，仅支持使用 [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html) 的 `GZIP`。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

配置参数如下：

- `response: true` 指示 ClickHouse 服务器以压缩的响应体进行响应。默认值：`response: false`
- `request: true` 在客户端请求体上启用压缩。默认值：`request: false`
### 日志记录 (仅限 Node.js) {#logging-nodejs-only}

:::important
日志记录是一个实验性功能，将来可能会更改。
:::

默认的日志记录实现通过 `console.debug/info/warn/error` 方法将日志记录到 `stdout`。
您可以通过提供 `LoggerClass` 自定义日志记录逻辑，并通过 `level` 参数（默认值为 `OFF`）选择所需的日志级别：

```typescript
// 所有三个 LogParams 类型都由客户端导出
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
- `DEBUG` - 响应信息（没有授权头和主机信息）
- `INFO` - 大多未使用，在客户端初始化时将打印当前日志级别
- `WARN` - 非致命性错误；失败的 `ping` 请求将作为警告记录，因为底层错误包含在返回结果中
- `ERROR` - 来自 `query`/`insert`/`exec`/`command` 方法的致命错误，例如请求失败

您可以在 [这里](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts) 找到默认的 Logger 实现。
### TLS 证书 (仅限 Node.js) {#tls-certificates-nodejs-only}

Node.js 客户端可选择支持基本（仅 CA）和互相认证（CA 和客户端证书）TLS。

基本 TLS 配置示例，假设您在 `certs` 文件夹中拥有证书，并且 CA 文件名为 `CA.pem`：

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

有关 [基本](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) 和 [互相](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS 的完整示例，请查看存储库。
### Keep-Alive 配置 (仅限 Node.js) {#keep-alive-configuration-nodejs-only}

客户端默认启用底层 HTTP 代理中的 Keep-Alive，这意味着用于后续请求的连接套接字将被重用，并且 `Connection: keep-alive` 头将被发送。空闲的套接字默认会在连接池中保留 2500 毫秒（请参阅 [调整此选项的说明](./js.md#adjusting-idle_socket_ttl)）。

`keep_alive.idle_socket_ttl` 的值应远低于服务器/LB 配置。主要原因是由于 HTTP/1.1 允许服务器在未通知客户端的情况下关闭套接字，如果服务器或负载均衡器在客户端之前关闭连接，客户端可能会尝试重用已关闭的套接字，从而导致 `socket hang up` 错误。

如果您正在修改 `keep_alive.idle_socket_ttl`，请记住它应该始终与您的服务器/LB Keep-Alive 配置保持同步，并且它应该 **始终低于**，确保服务器从未首先关闭打开的连接。
#### 调整 `idle_socket_ttl` {#adjusting-idle_socket_ttl}

客户端将 `keep_alive.idle_socket_ttl` 设置为 2500 毫秒，因为这可以视为最安全的默认值；在服务器端，`keep_alive_timeout` 可能会设置为 [在 23.11 之前的 ClickHouse 版本中低至 3 秒](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1)，而无需修改 `config.xml`。

:::warning
如果您对性能满意且未遇到任何问题，建议您 **不要** 增加 `keep_alive.idle_socket_ttl` 设置的值，因为这可能会导致潜在的 "Socket hang-up" 错误；此外，如果您的应用程序发送大量查询，并且查询之间的停机时间不长，则默认值应该足够，因为套接字不会闲置过长时间，客户端将保持它们在池中。
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

在这种情况下，`keep_alive_timeout` 为 10 秒，您可以尝试将 `keep_alive.idle_socket_ttl` 增加到 9000 或甚至 9500 毫秒，以便比默认值稍长地保持空闲的套接字开放。保持对潜在 "Socket hang-up" 错误的关注，这将表明服务器在客户端之前关闭连接，并降低该值直到错误消失。
#### Keep-Alive 故障排除 {#keep-alive-troubleshooting}

如果您在使用 Keep-Alive 时遇到 `socket hang up` 错误，可以使用以下选项来解决此问题：

* 在 ClickHouse 服务器配置中稍微减少 `keep_alive.idle_socket_ttl` 设置。在某些情况下，例如客户端与服务器之间的网络延迟较高，减少 `keep_alive.idle_socket_ttl` 200-500 毫秒可能会是有益的，从而排除发送请求时可能获得将要被服务器关闭的套接字的情况。

* 如果此错误发生在没有数据进出（例如，长时间运行的 `INSERT FROM SELECT`）的长查询期间，可能是由于负载均衡器关闭了空闲连接。您可以尝试在长时间运行的查询期间强制获取一些数据，这可以通过结合使用这些 ClickHouse 设置来实现：

  ```ts
  const client = createClient({
    // 这里假设我们将会有一些查询执行超过 5 分钟
    request_timeout: 400_000,
    /** 这些设置的组合可避免在长时间运行的查询中由于没有数据进出而导致 LB 超时问题，
     *  例如 `INSERT FROM SELECT` 及类似查询，因为连接可能会被 LB 标记为空闲而被突然关闭。
     *  在这种情况下，我们假设 LB 的空闲连接超时为 120 秒，因此我们设置 110 秒作为 "安全" 值。 */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: '110000', // UInt64，应该以字符串形式传递
    },
  })
  ```
  但是，请注意，最近的 Node.js 版本中接收的标题的总大小限制为 16KB；在接收的进度头达到一定数量后（在我们的测试中大约为 70-80），将会生成一个异常。

  也可以采用完全不同的方法，完全避免在网络上的等待时间；这可以通过利用 HTTP 接口的 "特性" 实现，即当连接丢失时突变不会被取消。有关更多细节，请参阅 [此示例（第 2 部分）](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts)。

* 可以完全禁用 Keep-Alive 功能。在这种情况下，客户端还会在每个请求中添加 `Connection: close` 头，底层 HTTP 代理也不会重用连接。`keep_alive.idle_socket_ttl` 设置将被忽略，因为不会有空闲套接字。这将导致额外的开销，因为每个请求都将建立一个新连接。

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```
### 只读用户 {#read-only-users}

当使用 [readonly=1 用户](/operations/settings/permissions-for-queries#readonly) 的客户端时，无法启用响应压缩，因为这需要 `enable_http_compression` 设置。以下配置将导致错误：

```ts
const client = createClient({
  compression: {
    response: true, // 不会与 readonly=1 用户一起工作
  },
})
```

有关只读=1 用户限制的更多亮点，请参阅 [示例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)。
### 带路径名的代理 {#proxy-with-a-pathname}

如果您的 ClickHouse 实例在代理后面，并且在 URL 中有路径名，例如 http://proxy:8123/clickhouse_server，请将 `clickhouse_server` 指定为 `pathname` 配置选项（可加或不加斜杠）；否则，如果直接在 `url` 中提供，将被视为 `database` 选项。多个段是支持的，例如 `/my_proxy/db`。

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```
### 带身份验证的反向代理 {#reverse-proxy-with-authentication}

如果您在 ClickHouse 部署前面有带身份验证的反向代理，您可以使用 `http_headers` 设置提供所需的头：

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```
### 自定义 HTTP/HTTPS 代理（实验性，仅限 Node.js） {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
这是一个实验性功能，未来版本中可能会有向后不兼容的变化。客户端提供的默认实现和设置对于大多数用例应该是足够的。仅在您确定需要此功能时使用它。
:::

默认情况下，客户端将使用客户端配置中提供的设置（例如 `max_open_connections`、`keep_alive.enabled`、`tls`）配置底层的 HTTP(s) 代理，该代理将处理与 ClickHouse 服务器的连接。此外，如果使用了 TLS 证书，底层代理将配置必要的证书，并将强制执行正确的 TLS 身份验证头。

在 1.2.0 之后，可以为客户端提供自定义 HTTP(s) 代理，以替换默认的底层代理。这在处理复杂的网络配置时可能会很有用。如果提供了自定义代理，则适用以下条件：
- `max_open_connections` 和 `tls` 选项将 _无效_，并将被客户端忽略，因为它是底层代理配置的一部分。
- `keep_alive.enabled` 仅会规范 `Connection` 头的默认值（`true` -> `Connection: keep-alive`，`false` -> `Connection: close`）。
- 尽管空闲的 keep-alive 套接字管理仍将正常工作（因为它与代理无关，而是与特定的套接字本身有关），但现在可以通过将 `keep_alive.idle_socket_ttl` 的值设置为 `0` 来完全禁用它。
#### 自定义代理使用示例 {#custom-agent-usage-examples}

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
  // 使用自定义 HTTPS 代理时，客户端将不会使用默认的 HTTPS 连接实现；应手动提供头部
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
  },
  // 重要：授权头与 TLS 头冲突；禁用它。
  set_basic_auth_header: false,
})
```

使用带有互相 TLS 的自定义 HTTPS 代理：

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
  // 使用自定义 HTTPS 代理时，客户端将不会使用默认的 HTTPS 连接实现；应手动提供头部
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
    'X-ClickHouse-SSL-Certificate-Auth': 'on',
  },
  // 重要：授权头与 TLS 头冲突；禁用它。
  set_basic_auth_header: false,
})
```

在带有证书 _和_ 自定义 _HTTPS_ 代理的情况下，可能需要通过 `set_basic_auth_header` 设置（在 1.2.0 中引入）禁用默认的授权头，因为它与 TLS 头冲突。所有的 TLS 头应手动提供。
## 已知限制 (Node.js/Web) {#known-limitations-nodejsweb}

- 结果集没有数据映射器，因此仅使用语言原始类型。计划中有某些数据类型映射器 [支持 RowBinary 格式](https://github.com/ClickHouse/clickhouse-js/issues/216)。
- 某些 [Decimal* 和 Date\* / DateTime\* 数据类型的注意事项](./js.md#datedate32-types-caveats)。
- 使用 JSON* 家族格式时，超过 Int32 的数字表示为字符串，因为 Int64+ 类型的最大值大于 `Number.MAX_SAFE_INTEGER`。有关更多细节，请参见 [整体类型](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) 部分。
## 已知限制 (Web) {#known-limitations-web}

- 选择查询的流媒体功能正常工作，但插入时禁用（在类型级别也禁用）。
- 请求压缩被禁用，配置被忽略。响应压缩是有效的。
- 目前没有日志支持。
## 性能优化建议 {#tips-for-performance-optimizations}

- 为减少应用程序内存消耗，考虑在适用情况使用流处理大量插入（例如，从文件）和选择。对于事件监听器和类似用例，[异步插入](/optimize/asynchronous-inserts) 可能是另一个不错的选择，允许最小化或完全避免客户端的批处理。异步插入示例在 [客户端仓库](https://github.com/ClickHouse/clickhouse-js/tree/main/examples) 中可用，文件名以 `async_insert_` 作为前缀。
- 客户端默认情况下不启用请求或响应压缩。但是，在选择或插入大型数据集时，您可以考虑通过 `ClickHouseClientConfigOptions.compression` 启用它（可以仅针对 `request` 或 `response`，或两者）。
- 压缩的性能损失显著。针对 `request` 或 `response` 启用压缩会对选择或插入的速度产生负面影响，但会减少应用程序传输的网络流量。
## 联系我们 {#contact-us}

如果您有任何问题或需要帮助，请随时通过 [社区 Slack](https://clickhouse.com/slack)（`#clickhouse-js` 频道）或通过 [GitHub 问题](https://github.com/ClickHouse/clickhouse-js/issues) 联系我们。
