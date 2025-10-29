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
'description': 'ClickHouseへの接続のための公式JSクライアント。'
'title': 'ClickHouse JS'
'doc_type': 'reference'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse JS

ClickHouse に接続するための公式 JS クライアントです。
クライアントは TypeScript で書かれており、クライアントのパブリック API の型定義を提供します。

依存関係はゼロで、最大性能のために最適化されており、さまざまな ClickHouse バージョンや構成（オンプレミスのシングルノード、オンプレミス クラスター、および ClickHouse Cloud）でテストされています。

異なる環境向けに 2 つの異なるバージョンのクライアントが利用可能です：
- `@clickhouse/client` - Node.js のみ
- `@clickhouse/client-web` - ブラウザ（Chrome/Firefox）、Cloudflare workers

TypeScript を使用する際は、少なくとも [バージョン 4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html) であることを確認してください。これにより、[インラインの import と export 構文](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names) が有効になります。

クライアントのソースコードは [ClickHouse-JS GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-js) で入手できます。
## 環境要件 (node.js) {#environment-requirements-nodejs}

クライアントを実行するには環境に Node.js が必要です。
クライアントは、すべての [メンテナンスされている](https://github.com/nodejs/release#readme) Node.js リリースと互換性があります。

Node.js のバージョンが EOL に近づくと、クライアントはそれをサポートしなくなります。これは古くて安全ではないと見なされるためです。

現在の Node.js バージョンのサポート:

| Node.js バージョン | サポートされている?  |
|---------------------|---------------------|
| 22.x                | ✔                   |
| 20.x                | ✔                   |
| 18.x                | ✔                   |
| 16.x                | ベストエフォート      |
## 環境要件 (web) {#environment-requirements-web}

クライアントの Web バージョンは、最新の Chrome/Firefox ブラウザで公式にテストされており、たとえば React/Vue/Angular アプリケーションや Cloudflare ワーカーの依存関係として使用できます。
## インストール {#installation}

最新の安定した Node.js クライアントバージョンをインストールするには、次のコマンドを実行します。

```sh
npm i @clickhouse/client
```

Web バージョンのインストール:

```sh
npm i @clickhouse/client-web
```
## ClickHouse との互換性 {#compatibility-with-clickhouse}

| クライアントバージョン | ClickHouse |
|-----------------------|------------|
| 1.12.0                | 24.8+      |

おそらく、クライアントは古いバージョンでも動作しますが、これはベストエフォートのサポートであり、保証されるものではありません。もし ClickHouse のバージョンが 23.3 より古い場合は、[ClickHouse セキュリティポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) を参照し、アップグレードを検討してください。
## 例 {#examples}

クライアントの使用に関するさまざまなシナリオを、[examples](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) でカバーすることを目指しています。

概要は、[examples README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview) で入手できます。

もし、例や次のドキュメントに不明な点や欠落がある場合は、[お問い合わせ](./js.md#contact-us) ください。
### クライアント API {#client-api}

ほとんどの例は、明示的に異なると記載されている場合を除いて、Node.js と Web の両方のバージョンと互換性があります。
#### クライアントインスタンスの作成 {#creating-a-client-instance}

`createClient` ファクトリーを使用して、必要な数だけクライアントインスタンスを作成できます。

```ts
import { createClient } from '@clickhouse/client' // or '@clickhouse/client-web'

const client = createClient({
  /* configuration */
})
```

環境が ESM モジュールをサポートしていない場合は、代わりに CJS 構文を使用できます。

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* configuration */
})
```

クライアントインスタンスは、インスタンス化中に [事前設定](./js.md#configuration) を行うことができます。
#### 設定 {#configuration}

クライアントインスタンスを作成する際に、以下の接続設定を調整できます：

| 設定                                                                    | 説明                                                                              | デフォルト値              | 参照                                                                         |
|-------------------------------------------------------------------------|----------------------------------------------------------------------------------|---------------------------|------------------------------------------------------------------------------|
| **url**?: string                                                         | ClickHouse インスタンスの URL。                                                   | `http://localhost:8123`   | [URL 設定ドキュメント](./js.md#url-configuration)                         |
| **pathname**?: string                                                    | クライアントによってパースされた後に ClickHouse URL に追加するオプションのパス名。 | `''`                      | [パス名付きプロキシのドキュメント](./js.md#proxy-with-a-pathname)        |
| **request_timeout**?: number                                             | リクエストのタイムアウト（ミリ秒）。                                             | `30_000`                  | -                                                                            |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }`  | 圧縮を有効にする。                                                               | -                         | [圧縮のドキュメント](./js.md#compression)                                  |
| **username**?: string                                                    | リクエストを行うユーザーの名前。                                                 | `default`                 | -                                                                            |
| **password**?: string                                                    | ユーザーのパスワード。                                                           | `''`                      | -                                                                            |
| **application**?: string                                                 | Node.js クライアントを使用するアプリケーションの名前。                           | `clickhouse-js`           | -                                                                            |
| **database**?: string                                                    | 使用するデータベースの名前。                                                     | `default`                 | -                                                                            |
| **clickhouse_settings**?: ClickHouseSettings                             | すべてのリクエストに適用する ClickHouse 設定。                                     | `{}`                      | -                                                                            |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 内部クライアントログの設定。                                                     | -                         | [ロギングのドキュメント](./js.md#logging-nodejs-only)                     |
| **session_id**?: string                                                  | 各リクエストに送信するオプションの ClickHouse セッション ID。                    | -                         | -                                                                            |
| **keep_alive**?: `{ **enabled**?: boolean }`                            | Node.js と Web の両方のバージョンでデフォルトで有効。                             | -                         | -                                                                            |
| **http_headers**?: `Record<string, string>`                              | ClickHouse リクエストに対する追加の HTTP ヘッダー。                               | -                         | [認証付きリバースプロキシのドキュメント](./js.md#reverse-proxy-with-authentication) |
| **roles**?: string \|  string[]                                          | アウトゴーイングリクエストに添付する ClickHouse のロール名。                     | -                         | [HTTP インターフェースでのロールの使用](/interfaces/http#setting-role-with-query-parameters) |
#### Node.js 専用設定パラメータ {#nodejs-specific-configuration-parameters}

| 設定                                                                      | 説明                                                    | デフォルト値 | 参照                                                                                               |
|--------------------------------------------------------------------------|-------------------------------------------------------|---------------|----------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                        | ホストごとに許可される最大接続ソケット数。                  | `10`          | -                                                                                                  |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }` | TLS 証明書の設定。                                    | -             | [TLS のドキュメント](./js.md#tls-certificates-nodejs-only)                                        |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                    | -             | [Keep Alive のドキュメント](./js.md#keep-alive-configuration-nodejs-only)                        |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>     | クライアント用のカスタム HTTP エージェント。             | -             | [HTTP エージェントのドキュメント](./js.md#custom-httphttps-agent-experimental-nodejs-only)       |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>            | 基本認証資格情報で `Authorization` ヘッダーを設定します。 | `true`        | [HTTP エージェントのドキュメントにおけるこの設定の使用](./js.md#custom-httphttps-agent-experimental-nodejs-only) |
### URL 設定 {#url-configuration}

:::important
URL 設定は _常に_ ハードコードされた値を上書きし、この場合に警告がログに記録されます。
:::

ほとんどのクライアントインスタンスパラメータは、URL を使用して設定できます。URL の形式は `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]` です。ほとんどの場合、特定のパラメータの名前は、構成オプションインターフェース内でのそのパスを反映していますが、いくつかの例外があります。次のパラメータがサポートされています：

| パラメータ                               | 型                                                |
|-----------------------------------------|-------------------------------------------------|
| `pathname`                              | 任意の文字列。                                   |
| `application_id`                        | 任意の文字列。                                   |
| `session_id`                            | 任意の文字列。                                   |
| `request_timeout`                       | 非負の数。                                       |
| `max_open_connections`                  | 非負の数で、ゼロより大きい。                     |
| `compression_request`                   | ブール値。 参照してください（1）                  |
| `compression_response`                  | ブール値。                                       |
| `log_level`                             | 許可される値：`OFF`、`TRACE`、`DEBUG`、`INFO`、`WARN`、`ERROR`。 |
| `keep_alive_enabled`                    | ブール値。                                       |
| `clickhouse_setting_*` または `ch_*`    | 参照してください（2）                              |
| `http_header_*`                         | 参照してください（3）                              |
| (Node.js のみ) `keep_alive_idle_socket_ttl` | 非負の数。                                       |

- (1) ブール値の場合、有効な値は `true`/`1` および `false`/`0` です。
- (2) `clickhouse_setting_` または `ch_` で接頭辞された任意のパラメータは、その接頭辞が削除され、残りがクライアントの `clickhouse_settings` に追加されます。たとえば、`?ch_async_insert=1&ch_wait_for_async_insert=1` は次のようになります：

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

注：`clickhouse_settings` のブール値は、URL で `1`/`0` として渡す必要があります。

- (3) (2) と似ていますが、`http_header` 設定用です。たとえば、`?http_header_x-clickhouse-auth=foobar` は次のようになります：

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```
### 接続 {#connecting}
#### 接続情報を収集する {#gather-your-connection-details}

<ConnectionDetails />
#### 接続の概要 {#connection-overview}

クライアントは HTTP(s) プロトコルを介して接続を実装します。RowBinary サポートは進行中で、[関連する問題](https://github.com/ClickHouse/clickhouse-js/issues/216) を参照してください。

次の例は、ClickHouse Cloud に対する接続の設定方法を示しています。`url`（プロトコルとポートを含む）および `password` の値は環境変数を介して指定され、`default` ユーザーが使用されると仮定しています。

**例：** 環境変数を使用して Node.js クライアントインスタンスを作成する。

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

クライアントリポジトリには、環境変数を使用する複数の例が含まれており、たとえば [ClickHouse Cloud でテーブルを作成する](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)、[非同期挿入を使用する](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) など、他にもいくつかあります。
#### 接続プール (Node.js のみ) {#connection-pool-nodejs-only}

リクエストごとに接続を確立するオーバーヘッドを回避するために、クライアントは ClickHouse との再利用できる接続プールを作成します。Keep-Alive メカニズムを利用しています。デフォルトでは、Keep-Alive が有効で接続プールのサイズは `10` に設定されていますが、`max_open_connections` [設定オプション](./js.md#configuration) で変更できます。

ユーザーが `max_open_connections: 1` を設定しない限り、プール内の同一接続が次のクエリで使用される保証はありません。これはあまり必要ないことですが、一時テーブルを使用するユーザーには必要な場合があります。

関連情報： [Keep-Alive 設定](./js.md#keep-alive-configuration-nodejs-only)。
### クエリ ID {#query-id}

クエリまたはステートメント（`command`、`exec`、`insert`、`select`）を送信するすべてのメソッドは、結果に `query_id` を提供します。このユニークな識別子は、クライアントによって各クエリごとに割り当てられ、`system.query_log` からデータを取得するのに便利です。これは、[サーバー設定](/operations/server-configuration-parameters/settings) で有効にされている場合、または長時間実行されているクエリをキャンセルするのに役立ちます（[例を参照](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)）。必要に応じて、`command`/`query`/`exec`/`insert` メソッドのパラメータで `query_id` をオーバーライドすることができます。

:::tip
`query_id` パラメータをオーバーライドする場合は、各呼び出しのためにその一意性を確保する必要があります。ランダムな UUID が良い選択です。
:::
### すべてのクライアントメソッドの基本パラメータ {#base-parameters-for-all-client-methods}

すべてのクライアントメソッドに適用できるパラメータがいくつかあります（[query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)）。

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
### クエリメソッド {#query-method}

これは、`SELECT` のようにレスポンスを持つ可能性のあるほとんどのステートメント、または `CREATE TABLE` のような DDL を送信するために使用され、await されるべきです。返される結果セットは、アプリケーション内で消費されることが期待されます。

:::note
データ挿入用の専用メソッド [insert](./js.md#insert-method) と、DDL 用の [command](./js.md#command-method) があります。
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

関連情報： [すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)。

:::tip
`query` で FORMAT 句を指定しないでください。代わりに `format` パラメータを使用してください。
:::
#### 結果セットと行抽象 {#result-set-and-row-abstractions}

`ResultSet` は、アプリケーション内でのデータ処理のための便利なメソッドをいくつか提供します。

Node.js の `ResultSet` 実装は、内部で `Stream.Readable` を使用しますが、Web バージョンは Web API の `ReadableStream` を使用します。

`ResultSet` を消費するには、`ResultSet` 上で `text` または `json` メソッドを呼び出し、クエリによって返されたすべての行セットをメモリにロードします。

`ResultSet` の消費はできるだけ早く開始する必要があります。これはレスポンスストリームをオープンに保持し、基盤となる接続を忙しく保つためです。クライアントは、アプリケーションによる潜在的な過剰なメモリ使用を回避するために、受信データをバッファリングしません。

また、メモリに一度に収まらないほど大きい場合は、`stream` メソッドを呼び出し、ストリーミングモードでデータを処理することができます。レスポンスの各チャンクは、サーバーからクライアントが受信する特定のチャンクのサイズに依存する（変動する可能性のある）比較的小さな行の配列として変換されます。一度に 1 チャンクずつ処理されます。

ストリーミングに最適な形式を特定するには、[サポートされているデータ形式](./js.md#supported-data-formats) のリストを参照してください。たとえば、JSON オブジェクトをストリーミングしたい場合は、[JSONEachRow](/sql-reference/formats#jsoneachrow) を選択でき、各行は JS オブジェクトとして解析されます。または、あるいは、各行がコンパクトな値の配列になる結果をもたらす、よりコンパクトな [JSONCompactColumns](/sql-reference/formats#jsoncompactcolumns) 形式を選択できます。ストリーミングファイルについても参照してください（./js.md#streaming-files-nodejs-only）。

:::important
`ResultSet` またはそのストリームが完全に消費されない場合、非アクティブな `request_timeout` の期間が過ぎると破棄されます。
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

**例：** (Node.js/Web) `JSONEachRow` 形式でのクエリ、全ストリームを消費し、内容を JS オブジェクトとして解析します。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // or `row.text` to avoid parsing JSON
```

**例：** (Node.js のみ) 古典的な `on('data')` アプローチを使用して `JSONEachRow` 形式でのストリーミングクエリ結果。これは `for await const` 構文と互換性があります。 [ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

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

**例：** (Node.js のみ) 古典的な `on('data')` アプローチを使用して `CSV` 形式でのストリーミングクエリ結果。これは `for await const` 構文と互換性があります。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)

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

**例：** (Node.js のみ) `JSONEachRow` 形式でのストリーミングクエリ結果を、`for await const` 構文を使用して JS オブジェクトとして消費します。これは古典的な `on('data')` アプローチと互換性があります。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts)。

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
`for await const` 構文は `on('data')` アプローチよりも少し少ないコードを持っていますが、パフォーマンスに悪影響を及ぼす可能性があります。
詳細は [Node.js リポジトリのこの問題](https://github.com/nodejs/node/issues/31979) を参照してください。
:::

**例：** (Web のみ) オブジェクトの `ReadableStream` に対する反復処理。

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
### 挿入メソッド {#insert-method}

これはデータ挿入のための主要なメソッドです。

```ts
export interface InsertResult {
  query_id: string
  executed: boolean
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

返される型は最小限であり、サーバーからデータが返されることは期待せず、即座にレスポンスストリームを排出します。

挿入メソッドに空の配列が提供された場合、挿入ステートメントはサーバーに送信されず、メソッドは即座に `{ query_id: '...', executed: false }` で解決されます。この場合、メソッドパラメータで `query_id` が提供されなかった場合、結果の中では空の文字列となります。クライアントによって生成されたランダムな UUID を返すのは混乱を招く可能性があるためです。その `query_id` を持つクエリは `system.query_log` テーブル内には存在しません。

挿入ステートメントがサーバーに送信された場合、`executed` フラグは `true` になります。
#### 挿入メソッドと Node.js におけるストリーミング {#insert-method-and-streaming-in-nodejs}

これは `Stream.Readable` または平易な `Array<T>` のいずれかで動作できます。これは `insert` メソッドに指定された [データ形式](./js.md#supported-data-formats) に依存します。さらに、このセクションでは [ファイルストリーミング](./js.md#streaming-files-nodejs-only) についても説明します。

挿入メソッドは await されることを想定していますが、入力ストリームを指定し、ストリームが完了した後に `insert` 操作を await することも可能です（これは `insert` の Promise も解決します）。これはイベントリスナーや類似のシナリオで便利かもしれませんが、エラーハンドリングがクライアント側で多くのエッジケースを伴う場合があるため、注意が必要です。代わりに、[非同期挿入](/optimize/asynchronous-inserts) を使用することを検討してください。この例で示されています [この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts)。

:::tip
このメソッドでモデル化するのが難しいカスタム INSERT ステートメントがある場合は、[command メソッド](./js.md#command-method) を使用することを検討してください。

たとえば、[INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) や [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) の例を参照してください。
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

関連情報： [すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)。

:::important
`abort_signal` でキャンセルされたリクエストは、データの挿入が行われなかったことを保証するものではありません。サーバーがキャンセル前にストリーミングデータの一部を受け取っている可能性があるためです。
:::

**例：** (Node.js/Web) 値の配列を挿入します。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

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

**例：** (Node.js のみ) CSV ファイルからのストリームを挿入します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。 ストリーミングファイルについても参照してください（./js.md#streaming-files-nodejs-only）。

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**例**: 挿入ステートメントから特定のカラムを除外します。

次のようなテーブル定義があるとします。

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

特定のカラムを挿入します：

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

特定のカラムを除外します：

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

詳細については [ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts) を参照してください。

**例**: クライアントインスタンスに提供されたデータベースとは異なるデータベースに挿入します。 [ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: 'mydb.mytable', // Fully qualified name including the database
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```
#### Web バージョンの制限 {#web-version-limitations}

現在、`@clickhouse/client-web` での挿入は `Array<T>` および `JSON*` フォーマットでのみ動作します。
ストリームを挿入することは、ブラウザの互換性が不足しているため、Web バージョンではまだサポートされていません。

そのため、Web バージョンの `InsertParams` インターフェースは、`values` が `ReadonlyArray<T>` 型のみに制限されるため、Node.js バージョンとはやや異なります：

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

これは将来的に変更される可能性があります。関連情報：[すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)。
### コマンドメソッド {#command-method}

これは、出力がないステートメント、FORMAT 句が適用されない場合、またはレスポンスに興味がない場合に使用できます。たとえば、`CREATE TABLE` や `ALTER TABLE` などのステートメントがその例です。

await されるべきです。

レスポンスストリームは即座に破壊され、基盤となるソケットは解放されます。

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

関連情報：[すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)。

**例：** (Node.js/Web) ClickHouse Cloud にテーブルを作成します。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)。

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

**例：** (Node.js/Web) セルフホストされた ClickHouse インスタンスにテーブルを作成します。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_single_node.ts)。

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

**例：** (Node.js/Web) INSERT FROM SELECT

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`,
})
```

:::important
`abort_signal` でキャンセルされたリクエストは、サーバーがステートメントを実行しなかったことを保証しません。
:::
### Exec メソッド {#exec-method}

`query`/`insert` に収まらないカスタムクエリがあり、その結果に興味がある場合は、`command` の代わりに `exec` を使用できます。

`exec` は読み取り可能なストリームを返し、これはアプリケーション側で必ず消費または破棄される必要があります。

```ts
interface ExecParams extends BaseQueryParams {
  // Statement to execute.
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

関連情報：[すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)。

ストリームの戻り値の型は Node.js と Web バージョンで異なります。

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

接続状態を確認するために提供される `ping` メソッドは、サーバーにアクセス可能な場合は `true` を返します。

サーバーに到達できない場合、基盤となるエラーが結果に含まれます。

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

Ping は、ClickHouse Cloud ではインスタンスがアイドリング状態であり、ping 後に起動する可能性があるため、アプリケーションが起動する際にサーバーが利用可能かどうかをチェックする便利なツールになる場合があります。この場合、間隔をあけて数回リトライすることを検討してください。

デフォルトでは、Node.js バージョンは `/ping` エンドポイントを使用しますが、Web バージョンは同様の結果を得るために単純な `SELECT 1` クエリを使用します。これは `/ping` エンドポイントが CORS をサポートしていないためです。

**例：** (Node.js/Web) ClickHouse サーバーインスタンスへの単純な ping。 Web バージョンの場合、キャプチャされたエラーが異なることに注意してください。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // process result.error
}
```

**例：** `ping` メソッドを呼び出すときに資格情報を確認したり、`query_id` などの追加パラメータを指定したい場合は、次のように使用できます：

```ts
const result = await client.ping({ select: true, /* query_id, abort_signal, http_headers, or any other query params */ });
```

ping メソッドは、ほとんどの標準 `query` メソッドパラメータを許可します - `PingParamsWithSelectQuery` 型定義を参照してください。
### クローズ (Node.js のみ) {#close-nodejs-only}

すべてのオープン接続を閉じ、リソースを解放します。Web バージョンでは無操作です。

```ts
await client.close()
```
## ストリーミングファイル (Node.js のみ) {#streaming-files-nodejs-only}

クライアントリポジトリには、人気のあるデータ形式（NDJSON、CSV、Parquet）でのファイルストリーミングの例がいくつかあります。

- [NDJSON ファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [CSV ファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Parquet ファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Parquet ファイルへのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

他の形式をファイルにストリーミングするのは Parquet と似たようなものになるはずです。
唯一の違いは、`query` 呼び出しで使用される形式（`JSONEachRow`、`CSV` など）と出力ファイル名です。
## サポートされているデータ形式 {#supported-data-formats}

クライアントはデータ形式をJSONまたはテキストとして処理します。

もし`format`をJSONファミリーの形式（`JSONEachRow`、`JSONCompactEachRow`など）のいずれかとして指定すると、クライアントはワイヤー越しの通信中にデータをシリアライズおよびデシリアライズします。

「生」テキスト形式（`CSV`、`TabSeparated`、および`CustomSeparated`ファミリー）で提供されたデータは、追加の変換なしにワイヤーを通じて送信されます。

:::tip
JSONが一般的な形式であることと、[ClickHouse JSON形式](/sql-reference/formats#json)との間で混乱が生じる可能性があります。 

クライアントは、[JSONEachRow](/sql-reference/formats#jsoneachrow)のようなストリーミングJSONオブジェクトをサポートしています（他のストリーミングに優しい形式についてはテーブルの概要を参照してください；クライアントリポジトリの`select_streaming_` [例も参照してください](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)）。 

[ClickHouse JSON](/sql-reference/formats#json)やいくつかの他の形式は、応答内で単一のオブジェクトとして表され、クライアントによってストリーミングされることはできません。
:::

| フォーマット                                   | 入力（配列） | 入力（オブジェクト） | 入力/出力（ストリーム） | 出力（JSON） | 出力（テキスト） |
|--------------------------------------------|---------------|----------------|-----------------------|---------------|----------------|
| JSON                                       | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONCompact                                | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONObjectEachRow                          | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONColumnsWithMetadata                    | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONStrings                                | ❌             | ❌️             | ❌                     | ✔️            | ✔️             |
| JSONCompactStrings                         | ❌             | ❌              | ❌                     | ✔️            | ✔️             |
| JSONEachRow                                | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONEachRowWithProgress                    | ❌️            | ❌              | ✔️ ❗- 下記を参照       | ✔️            | ✔️             |
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
| Parquet                                    | ❌             | ❌              | ✔️                    | ❌             | ✔️❗- 下記を参照 |

Parquetの場合、選択の主なユースケースは、結果のストリームをファイルに書き込むことになります。クライアントリポジトリの[例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)を参照してください。

`JSONEachRowWithProgress`は、ストリーム内で進捗報告をサポートする出力専用形式です。詳細については[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)を参照してください。

ClickHouseの入力および出力形式の完全なリストは、[こちら](/interfaces/formats)で利用できます。
## サポートされているClickHouseのデータ型 {#supported-clickhouse-data-types}

:::note
関連するJS型は、すべての`JSON*`形式に関係がありますが、すべてを文字列として表すもの（例：`JSONStringEachRow`）を除きます。
:::

| 型                     | ステータス       | JS型                       |
|------------------------|-----------------|----------------------------|
| UInt8/16/32            | ✔️              | number                     |
| UInt64/128/256         | ✔️ ❗- 下記を参照 | string                     |
| Int8/16/32             | ✔️              | number                     |
| Int64/128/256          | ✔️ ❗- 下記を参照 | string                     |
| Float32/64             | ✔️              | number                     |
| Decimal                | ✔️ ❗- 下記を参照 | number                     |
| Boolean                | ✔️              | boolean                    |
| String                 | ✔️              | string                     |
| FixedString            | ✔️              | string                     |
| UUID                   | ✔️              | string                     |
| Date32/64              | ✔️              | string                     |
| DateTime32/64          | ✔️ ❗- 下記を参照 | string                     |
| Enum                   | ✔️              | string                     |
| LowCardinality         | ✔️              | string                     |
| Array(T)               | ✔️              | T[]                        |
| (new) JSON             | ✔️              | object                     |
| Variant(T1, T2...)     | ✔️              | T（バリアントに依存）     |
| Dynamic                | ✔️              | T（バリアントに依存）     |
| Nested                 | ✔️              | T[]                        |
| Tuple(T1, T2, ...)     | ✔️              | [T1, T2, ...]              |
| Tuple(n1 T1, n2 T2...) | ✔️              | \{ n1: T1; n2: T2; ...}    |
| Nullable(T)            | ✔️              | TのJS型またはnull          |
| IPv4                   | ✔️              | string                     |
| IPv6                   | ✔️              | string                     |
| Point                  | ✔️              | [ number, number ]         |
| Ring                   | ✔️              | Array&lt;Point\>           |
| Polygon                | ✔️              | Array&lt;Ring\>            |
| MultiPolygon           | ✔️              | Array&lt;Polygon\>         |
| Map(K, V)              | ✔️              | Record&lt;K, V\>           |
| Time/Time64            | ✔️              | string                     |

サポートされているClickHouseの形式の完全なリストは、[こちら](/sql-reference/data-types/)で利用できます。

見てください：

- [Dynamic/Variant/JSONの操作の例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/dynamic_variant_json.ts)
- [Time/Time64の操作の例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/time_time64.ts)
### Date/Date32型の注意点 {#datedate32-types-caveats}

クライアントは追加の型変換なしに値を挿入するため、`Date`/`Date32`型のカラムには文字列としてのみ挿入できます。

**例：** `Date`型の値を挿入します。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

しかし、`DateTime`または`DateTime64`カラムを使用している場合、文字列とJS Dateオブジェクトの両方を使用できます。JS Dateオブジェクトは、`date_time_input_format`が`best_effort`に設定されているときに、そのまま`insert`に渡すことができます。詳細については[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts)を参照してください。
### Decimal\*型の注意点 {#decimal-types-caveats}

`JSON*`ファミリー形式を使用してDecimalを挿入することが可能です。次のようにテーブルが定義されていると仮定します：

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

文字列表現を使用して、精度の損失なしに値を挿入できます：

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

しかし、`JSON*`形式でデータをクエリする場合、ClickHouseはデフォルトでDecimalsを_数値_として返します。これにより精度の損失が起こる可能性があります。これを避けるために、クエリ内でDecimalsを文字列にキャストすることができます：

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

詳細については[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts)を参照してください。
### 整数型：Int64、Int128、Int256、UInt64、UInt128、UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

サーバーは数値として受け付けることができますが、これらのタイプの最大値が`Number.MAX_SAFE_INTEGER`よりも大きいため、`JSON*`ファミリーの出力形式では文字列として返されます。

ただし、この動作は、
[`output_format_json_quote_64bit_integers`設定](/operations/settings/formats#output_format_json_quote_64bit_integers)
によって変更可能です。

**例：** 64ビット数のJSON出力形式を調整します。

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
## ClickHouse設定 {#clickhouse-settings}

クライアントは[設定](/operations/settings/settings/)機構を通じてClickHouseの動作を調整できます。
設定はクライアントインスタンスレベルで設定され、送信される各リクエストに適用されます：

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

または、リクエストレベルで設定を構成できます：

```ts
client.query({
  clickhouse_settings: {}
})
```

すべてのサポートされているClickHouse設定が含まれた型宣言ファイルは、[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts)で見つけることができます。

:::important
クエリが実行されるユーザーが設定を変更する十分な権限を持っていることを確認してください。
:::
## 高度なトピック {#advanced-topics}
### パラメータ付きのクエリ {#queries-with-parameters}

パラメータ付きのクエリを作成し、それに値をクライアントアプリケーションから渡すことができます。これにより、特定の動的値でクエリをフォーマットする必要がなくなります。

通常どおりクエリをフォーマットし、次の形式でアプリケーションのパラメータからクエリに渡したい値を中括弧内に配置します：

```text
{<name>: <data_type>}
```

ここで：

- `name` — プレースホルダー識別子。
- `data_type` - アプリケーションパラメータ値の[データ型](/sql-reference/data-types/)。

**例：** パラメータ付きのクエリ。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/query_with_parameter_binding.ts)。

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

詳細についてはhttps://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntaxを確認してください。
### 圧縮 {#compression}

なお：リクエストの圧縮は現在Webバージョンでは利用できません。レスポンスの圧縮は通常通り機能します。Node.jsバージョンは両方をサポートします。

大量のデータセットをワイヤー上で扱うデータアプリケーションは、圧縮を有効にすることで利益を得ることができます。現状では、[zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html)を使用した`GZIP`のみがサポートされています。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

設定パラメータは次のとおりです：

- `response: true`はClickHouseサーバーに圧縮されたレスポンスボディで応答するよう指示します。デフォルト値：`response: false`
- `request: true`は、クライアントリクエストボディの圧縮を有効にします。デフォルト値：`request: false`
### ロギング（Node.jsのみ） {#logging-nodejs-only}

:::important
ロギングは実験的な機能であり、将来的に変更される可能性があります。
:::

デフォルトのロガー実装は、`stdout`に`console.debug/info/warn/error`メソッドを通じてログレコードを出力します。
`LoggerClass`を提供することでロギングロジックをカスタマイズでき、必要なログレベルを`level`パラメータで選択できます（デフォルトは`OFF`です）：

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

現在、クライアントは次のイベントをログに記録します：

- `TRACE` - Keep-Aliveソケットのライフサイクルに関する低レベルの情報
- `DEBUG` - 応答情報（認証ヘッダーとホスト情報を除く）
- `INFO` - 主に未使用、クライアントが初期化されるとき現在のログレベルを表示します
- `WARN` - 非致命的なエラー；失敗した`ping`リクエストは警告としてログに記録され、基となるエラーは返された結果に含まれます
- `ERROR` - `query`/`insert`/`exec`/`command`メソッドからの致命的なエラー。たとえば、失敗したリクエストなど

デフォルトのLogger実装は[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts)で見つけることができます。
### TLS証明書（Node.jsのみ） {#tls-certificates-nodejs-only}

Node.jsクライアントは、基本的な（証明書機関のみ）TLSと相互（証明書機関とクライアント証明書）TLSの両方をオプションでサポートします。

基本的なTLS構成の例として、証明書が`certs`フォルダー内にあり、CAファイル名が`CA.pem`であると仮定します：

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

クライアント証明書を使用した相互TLS構成の例：

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

完全な例については、リポジトリ内の[基本的な](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts)および[相互](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts)TLSを参照してください。
### Keep-Alive構成（Node.jsのみ） {#keep-alive-configuration-nodejs-only}

クライアントはデフォルトで、基盤となるHTTPエージェントでKeep-Aliveを有効にします。つまり、接続されたソケットは次のリクエストに再利用され、`Connection: keep-alive`ヘッダーが送信されます。アイドル状態のソケットはデフォルトで2500ミリ秒接続プールに残ります（このオプションの調整に関する[注意点](./js.md#adjusting-idle_socket_ttl)を参照）。

`keep_alive.idle_socket_ttl`は、サーバー/LBの設定よりかなり低い値に設定する必要があります。主な理由は、HTTP/1.1がサーバーにクライアントに通知せずにソケットを閉じることを許可しているためです。サーバーまたはロードバランサーがクライアントが接続する前に接続を閉じると、クライアントが閉じたソケットを再利用しようとし、`socket hang up`エラーが発生する可能性があります。

`keep_alive.idle_socket_ttl`を変更する場合、常にサーバー/LBのKeep-Alive設定と同期させておく必要があり、**常にその値より低く**設定することで、サーバーが最初にオープン接続を閉じることがないようにする必要があります。
#### `idle_socket_ttl`を調整する {#adjusting-idle_socket_ttl}

クライアントは`keep_alive.idle_socket_ttl`を2500ミリ秒に設定します。これは最も安全なデフォルトと見なされるためです。サーバー側の`keep_alive_timeout`は、[ClickHouseの23.11以前のバージョンで3秒まで低く設定することができます](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1)が、`config.xml`の変更は必要ありません。

:::warning
パフォーマンスが満足しており、問題が発生していない場合、`keep_alive.idle_socket_ttl`の設定値を**増やさないこと**をお勧めします。そうしないと、「Socket hang-up」エラーが発生する可能性があります。また、アプリケーションが多くのクエリを送信し、それらの間にあまりダウンタイムがない場合、デフォルト値で十分であるはずです。ソケットが長時間アイドルしていることはないため、クライアントはソケットをプールに保ちます。
:::

サーバーレスポンスヘッダーで正しいKeep-Aliveタイムアウト値を見つけるには、次のコマンドを実行します：

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

レスポンスの`Connection`と`Keep-Alive`ヘッダーの値を確認してください。例えば：

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

この場合、`keep_alive_timeout`は10秒であり、`keep_alive.idle_socket_ttl`を9000ミリ秒または9500ミリ秒に増加させて、アイドルソケットをデフォルトよりも少し長く開いたままにすることができます。サーバーがクライアントが接続する前に接続を閉じることを示す「Socket hang-up」エラーに注意し、エラーが消えるまで値を下げてください。
#### トラブルシューティング {#troubleshooting}

最新のクライアントを使用しているにもかかわらず`socket hang up`エラーが発生する場合、次のオプションで問題を解決できます：

* 最低でも`WARN`ログレベルでログを有効にします。これにより、アプリケーションコードに未消費のストリームやダングリングストリームがあるかどうかを確認できるようになります。輸送層は、それがサーバーによってソケットが閉じられる原因となる可能性があるため、WARNレベルでログに記録します。クライアント設定でログを有効にする方法は次のとおりです：

```ts
const client = createClient({
  log: { level: ClickHouseLogLevel.WARN },
})
```

* [no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/) ESLintルールを有効にして、未処理のプロミスを特定できるように、アプリケーションコードを確認します。ダングリングストリームやソケットに繋がる可能性があります。

* ClickHouseサーバー設定で`keep_alive.idle_socket_ttl`設定をわずかに減少させます。特定の状況（例えば、クライアントとサーバーの間に高いネットワーク遅延がある場合）では、`keep_alive.idle_socket_ttl`をさらに200〜500ミリ秒減らして、出力リクエストがサーバーが閉じるつもりのソケットを取得する可能性を排除できます。

* このエラーがデータが入出力されない長時間クエリ中（例：長時間の`INSERT FROM SELECT`）に発生する場合、アイドル状態の接続を閉じるロードバランサーによるものかもしれません。以下のClickHouse設定の組み合わせを使用して、長時間のクエリ中に何らかのデータが入ってくるように強制できます：

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
 最新のNode.jsバージョンでは、受信ヘッダーの合計サイズに16KBの制限があることに注意してください。ヘッダーの進行に応じて、これを超えると約70〜80件の進行がテストで確認された時点で例外が発生します。

  また、ワイヤー上の待機時間を完全に回避する全く異なるアプローチを利用することも可能です。接続が失われた場合にミューテーションがキャンセルされないというHTTPインターフェースの「特徴」を利用することで実現できます。詳細については[この例（パート2）](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts)を参照してください。

* Keep-Alive機能を完全に無効にすることもできます。この場合、クライアントはすべてのリクエストに`Connection: close`ヘッダーを追加し、基盤となるHTTPエージェントは接続を再利用しません。`keep_alive.idle_socket_ttl`設定は無視されます。アイドルソケットは存在しないため、これにより追加のオーバーヘッドが発生し、すべてのリクエストに対して新しい接続が確立されます。

```ts
const client = createClient({
  keep_alive: {
    enabled: false,
  },
})
```
### 読取り専用ユーザー {#read-only-users}

`[readonly=1 user](/operations/settings/permissions-for-queries#readonly)`を使用してクライアントを使用する場合、レスポンスの圧縮は`enable_http_compression`設定が必要なため、有効にできません。次の構成はエラーになります：

```ts
const client = createClient({
  compression: {
    response: true, // won't work with a readonly=1 user
  },
})
```

`readonly=1`ユーザーの制限に関する詳細な例は[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)をご覧ください。
### パス名付きのプロキシ {#proxy-with-a-pathname}

ClickHouseインスタンスがプロキシの背後にあり、URLにパス名が含まれている場合（例えば、http://proxy:8123/clickhouse_server）、`clickhouse_server`を`pathname`構成オプションとして指定してください（先頭スラッシュの有無にかかわらず）。そうしないと、`url`で直接提供された場合、それは`database`オプションと見なされます。複数のセグメントがサポートされており、例えば`/my_proxy/db`のように指定できます。

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```
### 認証付きリバースプロキシ {#reverse-proxy-with-authentication}

ClickHouseのデプロイメントの前に認証のあるリバースプロキシがある場合、必要なヘッダーを提供するために`http_headers`設定を使用できます：

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```
### カスタムHTTP/HTTPSエージェント（実験的、Node.jsのみ） {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
これは実験的な機能であり、将来的に後方互換性のない方法で変更される可能性があります。クライアントが提供するデフォルト実装および設定は、ほとんどのユースケースに対して十分であるはずです。この機能は、必要だと確信している場合のみ使用してください。
:::

デフォルトでは、クライアントはクライアント設定で提供された設定（`max_open_connections`、`keep_alive.enabled`、`tls`など）を使用して基盤となるHTTP(s)エージェントを構成し、ClickHouseサーバーへの接続を処理します。さらに、TLS証明書が使用されている場合、基盤となるエージェントは必要な証明書で設定され、正しいTLS認証ヘッダーが強制されます。

1.2.0以降、カスタムHTTP(s)エージェントをクライアントに提供し、デフォルトの基盤となるエージェントを置き換えることが可能です。これは、複雑なネットワーク構成の場合に役立ちます。カスタムエージェントが提供された場合に適用される条件は次のとおりです：
- `max_open_connections`および`tls`オプションは_影響を及ぼさず_、クライアントによって無視されます。これは、基盤となるエージェント設定の一部だからです。
- `keep_alive.enabled`は、`Connection`ヘッダーのデフォルト値を調整します（`true` -> `Connection: keep-alive`、`false` -> `Connection: close`）。
- アイドルKeep-Aliveソケット管理は引き続き機能しますが（エージェントに結びついているのではなく、特定のソケット自体に関連付けられています）、`keep_alive.idle_socket_ttl`値を`0`に設定して完全に無効にすることも可能です。
#### カスタムエージェント使用例 {#custom-agent-usage-examples}

証明書なしでカスタムHTTP(s)エージェントを使用する：

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

基本的なTLSとCA証明書を使用したカスタムHTTPSエージェントを使用する：

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

相互TLSを使用したカスタムHTTPSエージェントを使用する：

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

証明書とカスタムHTTPSエージェントを使用する場合、TLSヘッダーと競合するため、デフォルトの認証ヘッダーを`set_basic_auth_header`設定（1.2.0で導入）で無効にする必要があることが多いです。すべてのTLSヘッダーは手動で提供する必要があります。
## 知られている制限（Node.js/Web） {#known-limitations-nodejsweb}

- 結果セットのデータマッパーがないため、言語のプリミティブのみが使用されます。特定のデータ型マッパーは、[RowBinary形式サポート](https://github.com/ClickHouse/clickhouse-js/issues/216)を計画しています。
- Decimal*およびDate*/DateTime*データ型の注意点があります。[ここ](./js.md#datedate32-types-caveats)を参照してください。
- JSON*ファミリー形式を使用する場合、Int32を超える数値は文字列として表されます。Int64以上の型の最大値は`Number.MAX_SAFE_INTEGER`よりも大きいためです。詳細については[整数型](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256)セクションを参照してください。
## 知られている制限（Web） {#known-limitations-web}

- 選択クエリのストリーミングは機能しますが、挿入には無効です（型レベルでも）。
- リクエスト圧縮は無効で、構成は無視されます。レスポンス圧縮は動作します。
- ロギングサポートはまだありません。
## パフォーマンス最適化のヒント {#tips-for-performance-optimizations}

- アプリケーションのメモリ消費を減らすために、大きな挿入（例：ファイルから）や選択にストリームを使用することを検討してください。イベントリスナーや類似のユースケースでは、[非同期挿入](/optimize/asynchronous-inserts)が別の良いオプションであり、クライアント側でのバッチ処理を最小限に抑えたり、完全に回避したりすることができます。非同期挿入の例は、[クライアントリポジトリ](https://github.com/ClickHouse/clickhouse-js/tree/main/examples)にあります。ファイル名のプレフィックスは`async_insert_`です。
- クライアントはデフォルトでリクエストやレスポンスの圧縮を有効にしません。ただし、大きなデータセットを選択または挿入する際には、`ClickHouseClientConfigOptions.compression`を使用して有効にすることを検討できます（`request`または`response`またはその両方）。
- 圧縮はパフォーマンスに大きなペナルティをもたらします。`request`または`response`の圧縮を有効にすると、選択または挿入の速度に悪影響を与えますが、アプリケーションによって転送されるネットワークトラフィックの量を減らします。
## お問い合わせ {#contact-us}

ご質問やお手伝いが必要な場合は、[Community Slack](https://clickhouse.com/slack)（`#clickhouse-js`チャンネル）または[GitHubの問題](https://github.com/ClickHouse/clickhouse-js/issues)を通じてお気軽にお問い合わせください。
