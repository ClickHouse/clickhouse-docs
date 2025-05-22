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

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse JS

ClickHouseに接続するための公式JSクライアントです。  
クライアントはTypeScriptで書かれており、クライアントの公開APIの型定義を提供します。

依存関係はゼロで、最大のパフォーマンスを最適化しており、さまざまなClickHouseのバージョンや構成（オンプレミスの単一ノード、オンプレミスクラスター、ClickHouse Cloud）でテストされています。

異なる環境用に2つの異なるバージョンのクライアントが利用可能です：
- `@clickhouse/client` - Node.jsのみ
- `@clickhouse/client-web` - ブラウザ（Chrome/Firefox）、Cloudflareワーカー

TypeScriptを使用する場合は、少なくとも [version 4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html) が必要で、これにより [インラインインポートおよびエクスポート構文](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names) が有効になります。

クライアントのソースコードは [ClickHouse-JS GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-js) で入手できます。

## 環境要件 (Node.js) {#environment-requirements-nodejs}

Node.jsは、クライアントを実行するために環境に利用可能である必要があります。  
クライアントは、すべての [メンテナンスされている](https://github.com/nodejs/release#readme) Node.jsリリースと互換性があります。

Node.jsのバージョンがEnd-Of-Lifeに近づくと、クライアントはそれへのサポートを終了します。これは過去のものと見なされ、安全ではないためです。

現在のNode.jsバージョンのサポート：

| Node.jsバージョン | サポートされている? |
|------------------|------------------|
| 22.x             | ✔                |
| 20.x             | ✔                |
| 18.x             | ✔                |
| 16.x             | ベストエフォート      |

## 環境要件 (Web) {#environment-requirements-web}

クライアントのWebバージョンは、最新のChrome/Firefoxブラウザで公式にテストされており、React/Vue/AngularアプリケーションやCloudflareワーカーの依存関係として使用できます。

## インストール {#installation}

最新の安定したNode.jsクライアントバージョンをインストールするには、次のコマンドを実行します：

```sh
npm i @clickhouse/client
```

Webバージョンのインストール：

```sh
npm i @clickhouse/client-web
```

## ClickHouseとの互換性 {#compatibility-with-clickhouse}

| クライアントバージョン | ClickHouse |
|------------------|------------|
| 1.8.0            | 23.3+      |

クライアントは古いバージョンでも機能する可能性がありますが、これはベストエフォートのサポートであり、保証はされていません。もしClickHouseのバージョンが23.3よりも古い場合は、[ClickHouseのセキュリティポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)を参照し、アップグレードを検討してください。

## 例 {#examples}

当社は、クライアントの使用シナリオのさまざまなケースを [examples](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) の中で取り上げることを目指しています。

概要は [examples README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview) で入手できます。

もし例や以下の文書に不明点や不足があれば、自由に [ご連絡ください](./js.md#contact-us)。

### クライアントAPI {#client-api}

明示的に異なると記載されていない限り、ほとんどの例はNode.jsおよびWebバージョンのクライアントの両方で互換性があります。

#### クライアントインスタンスの作成 {#creating-a-client-instance}

必要に応じて、`createClient`ファクトリーを使ってクライアントインスタンスを作成できます：

```ts
const client = createClient({
  /* configuration */
})
```

環境がESMモジュールをサポートしていない場合は、CJS構文を代わりに使用できます：

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* configuration */
})
```

クライアントインスタンスは、インスタンス化時に [事前設定](./js.md#configuration) できます。

#### 設定 {#configuration}

クライアントインスタンスを作成する際に、次の接続設定を調整できます：

| 設定                                                                 | 説明                                                                                | デフォルト値            | 詳細情報                                                                                                                    |
|----------------------------------------------------------------------|--------------------------------------------------------------------------------------|-------------------------|----------------------------------------------------------------------------------------------------------------------------|
| **url**?: string                                                     | ClickHouseインスタンスのURL。                                                        | `http://localhost:8123` | [URL構成に関するドキュメント](./js.md#url-configuration)                                                                         |
| **pathname**?: string                                                | クライアントによって解析されたClickHouse URLに追加する任意のパス名。                  | `''`                    | [パス名付きプロキシに関するドキュメント](./js.md#proxy-with-a-pathname)                                                        |
| **request_timeout**?: number                                         | リクエストタイムアウト（ミリ秒単位）。                                              | `30_000`                | -                                                                                                                          |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }` | 圧縮を有効にします。                                                                 | -                       | [圧縮に関するドキュメント](./js.md#compression)                                                                                   |
| **username**?: string                                                | リクエストを行うユーザーの名前。                                                      | `default`               | -                                                                                                                          |
| **password**?: string                                                | ユーザーパスワード。                                                                  | `''`                    | -                                                                                                                          |
| **application**?: string                                             | Node.jsクライアントを使用しているアプリケーションの名前。                             | `clickhouse-js`         | -                                                                                                                          |
| **database**?: string                                                | 使用するデータベース名。                                                              | `default`               | -                                                                                                                          |
| **clickhouse_settings**?: ClickHouseSettings                         | すべてのリクエストに適用するClickHouseの設定。                                        | `{}`                    | -                                                                                                                          |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 内部クライアントログの設定。                                                          | -                       | [ログに関するドキュメント](./js.md#logging-nodejs-only)                                                                        |
| **session_id**?: string                                              | 各リクエストに送信するオプションのClickHouseセッションID。                           | -                       | -                                                                                                                          |
| **keep_alive**?: `{ **enabled**?: boolean }`                        | Node.jsとWebバージョンの両方でデフォルトで有効です。                                   | -                       | -                                                                                                                          |
| **http_headers**?: `Record<string, string>`                         | ClickHouseリクエストのための追加のHTTPヘッダー。                                      | -                       | [認証付きリバースプロキシに関するドキュメント](./js.md#reverse-proxy-with-authentication)                                             |
| **roles**?: string \| string[]                                       | アウトゴーイングリクエストにアタッチするClickHouseのロール名。                       | -                       | [HTTPインターフェースでのロールの使用](/interfaces/http#setting-role-with-query-parameters)                                    |

#### Node.js特有の設定パラメータ {#nodejs-specific-configuration-parameters}

| 設定                                                                   | 説明                                                 | デフォルト値      | 詳細情報                                                                                            |
|------------------------------------------------------------------------|-----------------------------------------------------|-----------------|---------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                       | ホストごとに許可する接続ソケットの最大数。         | `10`            | -                                                                                                 |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`  | TLS証明書の構成。                                   | -               | [TLSに関するドキュメント](./js.md#tls-certificates-nodejs-only)                               |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                 | -               | [Keep Aliveに関するドキュメント](./js.md#keep-alive-configuration-nodejs-only)                     |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>   | クライアント用のカスタムHTTPエージェント。       | -               | [HTTPエージェントに関するドキュメント](./js.md#custom-httphttps-agent-experimental-nodejs-only) |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>          | ベーシック認証資格情報で`Authorization`ヘッダーを設定します。 | `true`          | [HTTPエージェントドキュメントでのこの設定の使用](./js.md#custom-httphttps-agent-experimental-nodejs-only)    |

### URL構成 {#url-configuration}

:::important
URL構成は、常にハードコーディングされた値をオーバーライドし、この場合には警告がログに記録されます。
:::

クライアントインスタンスのほとんどのパラメータをURLで構成することができます。URL形式は `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]` です。ほとんどのケースで、特定のパラメータの名前は、設定オプションインターフェース内のそのパスを反映していますが、いくつかの例外があります。サポートされるパラメータは以下の通りです：

| パラメータ                                   | 型                                              |
|--------------------------------------------|-----------------------------------------------|
| `pathname`                                 | 任意の文字列。                                |
| `application_id`                           | 任意の文字列。                                |
| `session_id`                               | 任意の文字列。                                |
| `request_timeout`                          | 非負の数。                                    |
| `max_open_connections`                     | 非負の数、ゼロより大きい。                           |
| `compression_request`                      | ブール値。下記参照 (1)                           |
| `compression_response`                     | ブール値。                                      |
| `log_level`                                | 許可される値: `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`。 |
| `keep_alive_enabled`                       | ブール値。                                      |
| `clickhouse_setting_*` または `ch_*`            | 下記参照 (2)                                   |
| `http_header_*`                            | 下記参照 (3)                                   |
| (Node.jsのみ) `keep_alive_idle_socket_ttl` | 非負の数。                                    |

- (1) ブール値の場合、有効な値は `true`/`1` と `false`/`0` です。
- (2) `clickhouse_setting_` または `ch_` で始まる任意のパラメータは、このプレフィックスが削除され、残りがクライアントの `clickhouse_settings` に追加されます。たとえば、 `?ch_async_insert=1&ch_wait_for_async_insert=1` は次のように同じになります：

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

注意：`clickhouse_settings` のブール値は、URL内で `1`/`0` として渡す必要があります。

- (3) (2) と同様ですが、 `http_header` 構成用です。たとえば、 `?http_header_x-clickhouse-auth=foobar` は次のように相当します：

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```

### 接続 {#connecting}
#### 接続詳細を収集する {#gather-your-connection-details}

<ConnectionDetails />
#### 接続の概要 {#connection-overview}

クライアントは、HTTP(S)プロトコルを介して接続を実装しています。RowBinaryのサポートは進行中であり、[関連の問題](https://github.com/ClickHouse/clickhouse-js/issues/216)を参照してください。

次の例は、ClickHouse Cloudに対する接続の設定方法を示しています。`url`（プロトコルとポートを含む）および `password` の値が環境変数を介して指定されていると仮定し、`default` ユーザーが使用されます。

**例：** 環境変数を使用してNode.jsクライアントインスタンスを作成します。

```ts
const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

クライアントリポジトリには、環境変数を使用した複数の例が含まれています。たとえば、[ClickHouse Cloudでのテーブルの作成](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)、[非同期挿入の使用](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts)、その他多数があります。

#### 接続プール (Node.jsのみ) {#connection-pool-nodejs-only}

毎回リクエストごとに接続を確立するオーバーヘッドを避けるために、クライアントはClickHouseへの接続のプールを作成し、再利用します。Keep-Aliveメカニズムを利用しています。デフォルトでは、Keep-Aliveは有効で、接続プールのサイズは `10` に設定されていますが、`max_open_connections` [設定オプション](./js.md#configuration) を使って変更できます。

プール内の同じ接続が後続のクエリに使用される保証はありませんが、ユーザーが `max_open_connections: 1` を設定した場合は、必要に応じて使用されることがあります。これは稀に必要ですが、ユーザーが一時テーブルを使用している場合には必要になることがあります。

さらに、[Keep-Aliveの構成](./js.md#keep-alive-configuration-nodejs-only)も参照してください。

### クエリID {#query-id}

クエリやステートメントを送信するすべてのメソッド（`command`、`exec`、`insert`、`select`）は、結果に `query_id` を提供します。このユニーク識別子は、クエリごとにクライアントによって割り当てられ、`system.query_log` からデータを取得する際に役立つ可能性があります。これは、[サーバー設定](/operations/server-configuration-parameters/settings)で有効になっている場合、または長時間実行されているクエリをキャンセルする際に役立ちます（[例を参照](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)）。必要に応じて、`query_id` は `command`、`query`、`exec`、`insert` メソッドのパラメータでユーザーによって上書きすることができます。

:::tip
`query_id` パラメータを上書きしている場合は、各呼び出しに対してその一意性を確保する必要があります。ランダムUUIDは良い選択です。
:::

### すべてのクライアントメソッドの基本パラメータ {#base-parameters-for-all-client-methods}

すべてのクライアントメソッドに適用できるいくつかのパラメータがあります（[query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)）。

```ts
interface BaseQueryParams {
  // クエリレベルで適用できるClickHouse設定。
  clickhouse_settings?: ClickHouseSettings
  // クエリバインディングのためのパラメータ。
  query_params?: Record<string, unknown>
  // 実行中のクエリをキャンセルするためのAbortSignalインスタンス。
  abort_signal?: AbortSignal
  // query_idの上書き; 指定されていない場合、ランダム識別子が自動的に生成されます。
  query_id?: string
  // session_idの上書き; 指定されていない場合、セッションIDはクライアント設定から取得します。
  session_id?: string
  // credentialsの上書き; 指定されていない場合、クライアントの資格情報が使用されます。
  auth?: { username: string, password: string }
  // このクエリに使用する特定のロールのリスト。クライアント設定で設定されたロールを上書きします。
  role?: string | Array<string>
}
```

### クエリメソッド {#query-method}

これは、`SELECT`などの応答を持つ可能性のあるほとんどのステートメントや、`CREATE TABLE`のようなDDLを送信するために使用され、待機する必要があります。戻り値の結果セットはアプリケーションで消費されることが期待されます。

:::note
データ挿入用には専用のメソッド [insert](./js.md#insert-method) があり、DDL用には [command](./js.md#command-method) があります。
:::

```ts
interface QueryParams extends BaseQueryParams {
  // 実行するクエリ（データを返す可能性があります）。
  query: string
  // 結果データセットのフォーマット。デフォルト: JSON。
  format?: DataFormat
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>
}
```

さらに情報： [すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)。

:::tip
`query` にはFORMAT句を指定しないでください。 `format` パラメータを使用してください。
:::

#### 結果セットと行の抽象化 {#result-set-and-row-abstractions}

`ResultSet` は、アプリケーション内のデータ処理のためにいくつかの便利なメソッドを提供します。

Node.jsの `ResultSet` 実装は内部で `Stream.Readable` を使っていますが、WebバージョンはWeb APIの `ReadableStream` を使用しています。

`ResultSet` を消費するには、 `text` または `json` メソッドを呼び出して、クエリによって返されたすべての行のセットをメモリにロードできます。

`ResultSet` はできるだけ早く消費し始めるべきです。これはレスポンスストリームをオープンに保ち、結果として基礎となる接続をビジー状態にします。クライアントはアプリケーションが潜在的に過剰なメモリ使用量を避けるために、受信データをバッファリングしません。

一方、大きすぎて一度にメモリに収まらない場合は、 `stream` メソッドを呼び出し、ストリーミングモードでデータを処理できます。レスポンスチャンクのそれぞれは、各チャンクのサイズによって異なるおおよそ小さな行の配列に変換され、サーバーから受け取ります（一度に一つのチャンク）。チャンクサイズは特定のチャンク、個別の行のサイズに依存します。

ストリーミングに適したデータフォーマットのリストについては、[サポートされるデータフォーマット](./js.md#supported-data-formats)を参照して、あなたのケースに最適なフォーマットを決定してください。たとえば、JSONオブジェクトをストリーミングしたい場合は、[JSONEachRow](/sql-reference/formats#jsoneachrow)を選択すると、各行がJSオブジェクトとして解析されます。また、各行が値のコンパクトな配列になるよりコンパクトな[JSONCompactColumns](/sql-reference/formats#jsoncompactcolumns)フォーマットも選択できます。ストリーミングファイルも参照してください。[streaming files](./js.md#streaming-files-nodejs-only)。

:::important
`ResultSet` またはそのストリームが完全に消費されない場合、非活動期間の `request_timeout` の後に破棄されます。
:::

```ts
interface BaseResultSet<Stream> {
  // 上記の「クエリID」セクションを参照してください。
  query_id: string

  // ストリーム全体を消費し、内容を文字列として取得します。
  // これは任意のDataFormatで使用できます。
  // 一度だけ呼び出す必要があります。
  text(): Promise<string>

  // ストリーム全体を消費し、内容をJSオブジェクトとして解析します。
  // JSONフォーマットでのみ使用できます。
  // 一度だけ呼び出す必要があります。
  json<T>(): Promise<T>

  // ストリーム可能なレスポンスのための読み取りストリームを返します。
  // ストリームの各反復は、選択したDataFormatの行の配列を提供します。
  // 一度だけ呼び出す必要があります。
  stream(): Stream
}

interface Row {
  // 行の内容をプレーンな文字列として取得します。
  text: string

  // 行の内容をJSオブジェクトとして解析します。
  json<T>(): T
}
```

**例:** (Node.js/Web) `JSONEachRow`フォーマットでの結果データセットを持つクエリで、ストリーム全体を消費し、内容をJSオブジェクトとして解析する。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // または `row.text` でJSONの解析を避ける
```

**例:** (Node.jsのみ) `JSONEachRow`フォーマットでのクエリ結果をストリーミングする、古典的な `on('data')` アプローチを使用。これは `for await const` 構文と交換可能です。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // または JSONCompactEachRow, JSONStringsEachRow など。
})
const stream = rows.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.json()) // または `row.text` でJSONの解析を避ける
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('完了しました！')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**例:** (Node.jsのみ) `CSV`フォーマットでのクエリ結果をストリーミングする、古典的な `on('data')` アプローチを使用。これは `for await const` 構文と交換可能です。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'CSV', // または TabSeparated, CustomSeparated など。
})
const stream = resultSet.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.text)
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('完了しました！')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**例:** (Node.jsのみ) `JSONEachRow`フォーマットでJSオブジェクトとしてストリーミングクエリ結果を消費する、 `for await const` 構文を使用。これは古典的な `on('data')` アプローチと交換可能です。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers LIMIT 10',
  format: 'JSONEachRow', // または JSONCompactEachRow, JSONStringsEachRow など。
})
for await (const rows of resultSet.stream()) {
  rows.forEach(row => {
    console.log(row.json())
  })
}
```

:::note
`for await const` 構文は、 `on('data')` アプローチよりもコードが少なくなりますが、パフォーマンスに悪影響を与える可能性があります。  
詳細は [Node.jsリポジトリのこの問題](https://github.com/nodejs/node/issues/31979) を参照してください。
:::

**例:** (Webのみ) オブジェクトの `ReadableStream` を反復処理します。

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

戻り値の型は最小限です。サーバーからデータが返されないことを期待しており、レスポンスストリームは即座に排出されます。

挿入メソッドに空の配列が提供された場合、INSERT文はサーバーに送信されません。その代わり、メソッドは即座に `{ query_id: '...', executed: false }` で解決されます。この場合、メソッドのパラメータに `query_id` が指定されていなければ、結果の中で空の文字列になります。クライアントによって生成されたランダムUUIDを返すと、そんな `query_id` のクエリは `system.query_log` テーブルに存在しないため、混乱を避けるためです。

もし挿入文がサーバーに送信された場合、 `executed` フラグは `true` になります。

#### 挿入メソッドとNode.jsでのストリーミング {#insert-method-and-streaming-in-nodejs}

これは、指定された [データフォーマット](./js.md#supported-data-formats) に応じて `Stream.Readable` またはプレーンな `Array<T>` のいずれかとして動作することができます。ファイルストリーミングに関するこのセクションも参照してください。[file streaming](./js.md#streaming-files-nodejs-only)。

挿入メソッドは待機されるべきですが、入力ストリームを指定し、ストリームが完成したときに `insert` 操作を待機することも可能です（これにより、`insert` プロミスが解決されます）。これは、イベントリスナーや類似のシナリオで有用である可能性がありますが、エラー処理はクライアント側で多くのエッジケースがあるため、重要でない場合があります。その代わりに、[非同期挿入](/optimize/asynchronous-inserts)の使用を検討してください。これについては [この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts)が示されています。

:::tip
挿入文がこのメソッドでモデル化するのが難しい場合は、[commandメソッド](./js.md#command-method)の使用を検討してください。

[INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) や [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) の例での使用方法も面白いと思います。
:::

```ts
interface InsertParams<T> extends BaseQueryParams {
  // データを挿入するテーブル名
  table: string
  // 挿入するデータセット。
  values: ReadonlyArray<T> | Stream.Readable
  // 挿入するデータセットのフォーマット。
  format?: DataFormat
  // データが挿入されるカラムを指定できます。
  // - `['a', 'b']`のような配列は、`INSERT INTO table (a, b) FORMAT DataFormat`を生成します。
  // - `{ except: ['a', 'b'] }`のようなオブジェクトは、`INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`を生成します。
  // デフォルトでは、すべてのカラムにデータが挿入され、生成されるステートメントは `INSERT INTO table FORMAT DataFormat` になります。
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

さらに情報： [すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)。

:::important
`abort_signal` でキャンセルされたリクエストは、挿入が行われなかったことを保証するものではありません。サーバーはキャンセルの前にストリーミングされたデータの一部を受け取っている可能性があるためです。
:::

**例:** (Node.js/Web) 値の配列を挿入します。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
await client.insert({
  table: 'my_table',
  // 構造は、今回の例において希望するフォーマットに一致する必要があります、JSONEachRow
  values: [
    { id: 42, name: 'foo' },
    { id: 42, name: 'bar' },
  ],
  format: 'JSONEachRow',
})
```

**例:** (Node.jsのみ) CSVファイルからのストリームを挿入します。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。また、[ファイルストリーミング](./js.md#streaming-files-nodejs-only)も参照してください。

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**例:** 挿入文から特定のカラムを除外します。

次のようなテーブル定義があるとします：

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

特定のカラムのみを挿入します：

```ts
// 生成されるステートメント: INSERT INTO mytable (message) FORMAT JSONEachRow
await client.insert({
  table: 'mytable',
  values: [{ message: 'foo' }],
  format: 'JSONEachRow',
  // この行の `id` カラムの値は0になります（UInt32のデフォルト）
  columns: ['message'],
})
```

特定のカラムを除外します：

```ts
// 生成されるステートメント: INSERT INTO mytable (* EXCEPT (message)) FORMAT JSONEachRow
await client.insert({
  table: tableName,
  values: [{ id: 144 }],
  format: 'JSONEachRow',
  // この行の `message` カラムの値は空の文字列になります
  columns: {
    except: ['message'],
  },
})
```

詳細については [ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts) を参照してください。

**例:** クライアントインスタンスに提供されたデータベースとは異なるデータベースに挿入します。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: 'mydb.mytable', // データベースを含む完全修飾名
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```
#### Webバージョンの制限 {#web-version-limitations}

現在、`@clickhouse/client-web`での挿入は`Array<T>`および`JSON*`形式のみがサポートされています。
ストリームの挿入は、ブラウザの互換性が低いため、まだウェブバージョンではサポートされていません。

その結果、ウェブバージョンの`InsertParams`インターフェースはNode.jsバージョンとは少し異なり、`values`は`ReadonlyArray<T>`型のみに制限されています：

```ts
interface InsertParams<T> extends BaseQueryParams {
  // データを挿入するテーブル名
  table: string
  // 挿入するデータセット
  values: ReadonlyArray<T>
  // 挿入するデータセットの形式
  format?: DataFormat
  // データを挿入するカラムを指定できます。
  // - `['a', 'b']`のような配列は次のように生成します: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - `{ except: ['a', 'b'] }`のようなオブジェクトは次のように生成します: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // デフォルトでは、データはテーブルのすべてのカラムに挿入され、
  // 生成されるステートメントは次のようになります: `INSERT INTO table FORMAT DataFormat`。
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

これは将来的に変更される可能性があります。詳細については、[すべてのクライアントメソッドの基本パラメーター](./js.md#base-parameters-for-all-client-methods)を参照してください。
### コマンドメソッド {#command-method}

出力がないステートメントや、形式句が適用できない場合、またはレスポンスにまったく興味がない場合に使用できます。このようなステートメントの例として、`CREATE TABLE`や`ALTER TABLE`があります。

awaitが必要です。

レスポンスストリームは即座に破棄され、基盤となるソケットは解放されます。

```ts
interface CommandParams extends BaseQueryParams {
  // 実行するステートメント
  query: string
}

interface CommandResult {
  query_id: string
}

interface ClickHouseClient {
  command(params: CommandParams): Promise<CommandResult>
}
```

詳細については、[すべてのクライアントメソッドの基本パラメーター](./js.md#base-parameters-for-all-client-methods)を参照してください。

**例:** (Node.js/Web) ClickHouse Cloudでテーブルを作成します。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)。

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // レスポンスコードの後にクエリ処理エラーが発生した場合、クライアントにHTTPヘッダーがすでに送信されている事態を避けるために、クラスターの使用には推奨されます。
  // https://clickhouse.com/docs/interfaces/http/#response-buffering参照
  clickhouse_settings: {
    wait_end_of_query: 1,
  },
})
```

**例:** (Node.js/Web) セルフホストのClickHouseインスタンスでテーブルを作成します。 
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

**例:** (Node.js/Web) INSERT FROM SELECT

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`,
})
```

:::important
`abort_signal`でキャンセルされたリクエストは、ステートメントがサーバーによって実行されなかったことを保証しません。
:::
### Execメソッド {#exec-method}

`query`/`insert`に適合しないカスタムクエリがあり、その結果に興味がある場合、`command`の代わりに`exec`を使用できます。

`exec`は、アプリケーション側で消費するか、破棄する必要があるリーダブルストリームを返します。

```ts
interface ExecParams extends BaseQueryParams {
  // 実行するステートメント
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

詳細については、[すべてのクライアントメソッドの基本パラメーター](./js.md#base-parameters-for-all-client-methods)を参照してください。

ストリームの戻り値の型はNode.jsとWebバージョンで異なります。

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

接続状態を確認するために提供される`ping`メソッドは、サーバーに到達可能であれば`true`を返します。 

サーバーに到達できない場合、基盤となるエラーも結果に含まれます。

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }

interface ClickHouseClient {
  ping(): Promise<PingResult>
}
```

Pingは、アプリケーションのスタート時にサーバーが利用可能かどうかを確認するのに役立つツールです。特にClickHouse Cloudでは、インスタンスがアイドル状態でping後に起動する可能性があります。

**例:** (Node.js/Web) ClickHouseサーバーインスタンスにpingを送信します。注意: Webバージョンでは、キャプチャされたエラーは異なります。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // 結果エラーを処理する
}
```

注意: `/ping`エンドポイントはCORSを実装していないため、Webバージョンでは同様の結果を得るために`SELECT 1`を使用します。
### Close (Node.jsのみ) {#close-nodejs-only}

すべてのオープン接続を閉じ、リソースを解放します。Webバージョンでは効果がありません。

```ts
await client.close()
```
## ストリーミングファイル (Node.jsのみ) {#streaming-files-nodejs-only}

クライアントリポジトリには、一般的なデータ形式（NDJSON、CSV、Parquet）のいくつかのファイルストリーミングの例があります。

- [NDJSONファイルからストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [CSVファイルからストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Parquetファイルからストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Parquetファイルにストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

他の形式をファイルにストリーミングするのはParquetと似たようなもので、唯一の違いは`query`呼び出しで使用される形式（`JSONEachRow`、`CSV`など）と出力ファイル名のみです。
## サポートされているデータ形式 {#supported-data-formats}

クライアントはデータ形式をJSONまたはテキストとして扱います。

`format`をJSONファミリーのいずれか（`JSONEachRow`、`JSONCompactEachRow`など）として指定すると、クライアントはワイヤー経由の通信中にデータをシリアライズおよびデシリアライズします。

「生」のテキスト形式（`CSV`、`TabSeparated`および`CustomSeparated`ファミリー）で提供されるデータは、追加の変換なしでワイヤーを介して送信されます。

:::tip
JSONを一般的な形式として扱うことと、[ClickHouse JSON形式](/sql-reference/formats#json)との間で混乱が生じる可能性があります。 

クライアントは、[JSONEachRow](/sql-reference/formats#jsoneachrow)などの形式でストリーミングJSONオブジェクトをサポートしています（他のストリーミングフレンドリーな形式のテーブル概要も参照；クライアントリポジトリの`select_streaming_` [例も参照](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)）。 

[ClickHouse JSON](/sql-reference/formats#json)やその他のいくつかの形式は、レスポンス内で単一オブジェクトとして表され、クライアントによってストリーミングできないことに注意してください。
:::

| フォーマット                                     | 入力 (配列) | 入力 (オブジェクト) | 入力/出力 (ストリーム) | 出力 (JSON) | 出力 (テキスト)  |
|--------------------------------------------|---------------|----------------|-----------------------|---------------|----------------|
| JSON                                       | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONCompact                                | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONObjectEachRow                          | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONColumnsWithMetadata                    | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONStrings                                | ❌             | ❌️             | ❌                     | ✔️            | ✔️             |
| JSONCompactStrings                         | ❌             | ❌              | ❌                     | ✔️            | ✔️             |
| JSONEachRow                                | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONEachRowWithProgress                    | ❌️            | ❌              | ✔️ ❗- 詳細は以下を参照       | ✔️            | ✔️             |
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
| Parquet                                    | ❌             | ❌              | ✔️                    | ❌             | ✔️❗- 詳細は以下を参照 |

Parquetでは、SELECTの主な使用ケースは、結果のストリームをファイルに書き込むことになるでしょう。クライアントリポジトリの[例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)を参照してください。

`JSONEachRowWithProgress`は、ストリーム内で進行状況を報告することをサポートする出力専用形式です。詳細については[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)を参照してください。

ClickHouseの入力および出力形式の完全なリストは [ここ](https://interfaces/formats)で入手できます。
## サポートされているClickHouseデータ型 {#supported-clickhouse-data-types}

:::note
関連するJS型は、すべての`JSON*`形式に関連していますが、すべてを文字列として表す形式（例:`JSONStringEachRow`）を除きます。
:::

| 型               | ステータス          | JS型                    |
|--------------------|-----------------|----------------------------|
| UInt8/16/32        | ✔️              | number                     |
| UInt64/128/256     | ✔️ ❗- 以下を参照 | string                     |
| Int8/16/32         | ✔️              | number                     |
| Int64/128/256      | ✔️ ❗- 以下を参照 | string                     |
| Float32/64         | ✔️              | number                     |
| Decimal            | ✔️ ❗- 以下を参照 | number                     |
| Boolean            | ✔️              | boolean                    |
| String             | ✔️              | string                     |
| FixedString        | ✔️              | string                     |
| UUID               | ✔️              | string                     |
| Date32/64          | ✔️              | string                     |
| DateTime32/64      | ✔️ ❗- 以下を参照 | string                     |
| Enum               | ✔️              | string                     |
| LowCardinality     | ✔️              | string                     |
| Array(T)           | ✔️              | T[]                        |
| (新) JSON         | ✔️              | object                     |
| Variant(T1, T2...) | ✔️              | T (バリアントによって異なる) |
| Dynamic            | ✔️              | T (バリアントによって異なる) |
| Nested             | ✔️              | T[]                        |
| Tuple              | ✔️              | Tuple                      |
| Nullable(T)        | ✔️              | TまたはnullのJS型          |
| IPv4               | ✔️              | string                     |
| IPv6               | ✔️              | string                     |
| Point              | ✔️              | [ number, number ]             |
| Ring               | ✔️              | Array&lt;Point\>              |
| Polygon            | ✔️              | Array&lt;Ring\>               |
| MultiPolygon       | ✔️              | Array&lt;Polygon\>            |
| Map(K, V)          | ✔️              | Record&lt;K, V\>              |

ClickHouseのサポートされている形式の完全なリストは [ここ](https://sql-reference/data-types/)で入手できます。
### Date/Date32型の注意点 {#datedate32-types-caveats}

クライアントは追加の型変換なしで値を挿入するため、`Date`/`Date32`型のカラムには文字列としてのみ挿入できます。

**例:** `Date`型の値を挿入します。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)。

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

ただし、`DateTime`または`DateTime64`型のカラムを使用している場合、文字列とJS日付オブジェクトの両方を使用できます。JS日付オブジェクトは、そのまま`insert`に渡すことができ、`date_time_input_format`が`best_effort`に設定されています。詳細については[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts)を参照してください。
### Decimal*型の注意点 {#decimal-types-caveats}

`JSON*`ファミリー形式を使用してDecimalを挿入することが可能です。次のように定義されたテーブルがあるとします：

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

値を文字列表現を使用して精度損失なく挿入できます：

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

ただし、`JSON*`形式でデータをクエリすると、ClickHouseはデフォルトでDecimalsを_数字_として返すため、精度が損なわれる可能性があります。これを避けるために、クエリでDecimalsを文字列にキャストできます：

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
### 整数型: Int64, Int128, Int256, UInt64, UInt128, UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

サーバーは数値として受け入れることができますが、`JSON*`ファミリー出力形式ではオーバーフローを避けるために文字列として返されます。これらの型の最大値は`Number.MAX_SAFE_INTEGER`よりも大きいためです。

ただし、この動作は[`output_format_json_quote_64bit_integers`設定](/operations/settings/formats#output_format_json_quote_64bit_integers)で変更できます。

**例:** 64ビット数のJSON出力形式を調整します。

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
## ClickHouseの設定 {#clickhouse-settings}

クライアントは[設定](/operations/settings/settings/)メカニズムを介してClickHouseの動作を調整できます。
設定はクライアントインスタンスレベルで設定でき、すべてのリクエストに対して適用されます。

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

または、リクエストレベルで設定できます：

```ts
client.query({
  clickhouse_settings: {}
})
```

サポートされているClickHouse設定のすべての型宣言ファイルは [こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts)で見つけることができます。

:::important
クエリが行われるユーザーが設定を変更するための十分な権限を持っていることを確認してください。
:::
## 高度なトピック {#advanced-topics}
### パラメーター付きクエリ {#queries-with-parameters}

パラメーター付きのクエリを作成し、クライアントアプリケーションからその値を渡すことができます。これにより、クライアント側で特定の動的値でクエリをフォーマットすることを避けることができます。

クエリを通常通りフォーマットし、アプリパラメーターからクエリに渡す値を波括弧内に以下の形式で置きます：

```text
{<name>: <data_type>}
```

ここで：

- `name` — プレースホルダー識別子。
- `data_type` - アプリパラメーター値の[データ型](/sql-reference/data-types/)。

**例:** パラメーター付きクエリ。 
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

詳細については https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax を確認してください。
### 圧縮 {#compression}

注意: リクエストの圧縮は現在Webバージョンで利用できません。レスポンスの圧縮は通常通り機能します。Node.jsバージョンは両方をサポートしています。

大規模データセットをワイヤー経由で処理するアプリケーションは、圧縮を有効にすることで利点を得ることができます。現在、サポートされているのは`GZIP`のみで、[zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html)を使用します。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

構成パラメーターは次の通りです：

- `response: true`は、ClickHouseサーバーに圧縮されたレスポンスボディで応答するように指示します。デフォルト値: `response: false`
- `request: true`は、クライアントリクエストボディの圧縮を有効にします。デフォルト値: `request: false`
### ロギング (Node.jsのみ) {#logging-nodejs-only}

:::important
ロギングは実験的機能であり、将来的に変更される可能性があります。
:::

デフォルトのロガー実装は、`stdout`に`console.debug/info/warn/error`メソッドを介してログレコードを出力します。
`LoggerClass`を提供することでロギングロジックをカスタマイズでき、`level`パラメーター（デフォルトは`OFF`）を介して希望のログレベルを選択できます。

```typescript
// 3つのLogParams型がすべてクライアントによってエクスポートされています
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

現在、クライアントは以下のイベントをログに記録します：

- `TRACE` - Keep-Aliveソケットのライフサイクルに関する低レベルの情報
- `DEBUG` - レスポンス情報（認証ヘッダーとホスト情報は除く）
- `INFO` - 主に未使用で、クライアントが初期化されると現在のログレベルが表示されます
- `WARN` - 非致命的なエラー；pingリクエストの失敗が警告としてログに記録され、基盤となるエラーが返された結果に含まれます
- `ERROR` - `query`/`insert`/`exec`/`command`メソッドからの致命的なエラー、例えばリクエストの失敗など

デフォルトのロガー実装は[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts)で見つけることができます。
### TLS証明書 (Node.jsのみ) {#tls-certificates-nodejs-only}

Node.jsクライアントは、オプションで基本（証明書機関のみ）および相互（証明書機関およびクライアント証明書）TLSをサポートします。

基本TLSの構成例。証明書が`certs`フォルダーにあり、CAファイル名が`CA.pem`であると仮定します：

```ts
const client = createClient({
  url: 'https://<hostname>:<port>',
  username: '<username>',
  password: '<password>', // 必要に応じて
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

基本的なTLSと相互TLSの完全な例については[基本](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts)と[相互](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts)をリポジトリで参照してください。
### Keep-Aliveの構成 (Node.jsのみ) {#keep-alive-configuration-nodejs-only}

クライアントはデフォルトで基盤となるHTTPエージェントのKeep-Aliveを有効にしているため、接続されたソケットはその後のリクエストに再利用され、`Connection: keep-alive`ヘッダーが送信されます。アイドル状態のソケットはデフォルトで2500ミリ秒接続プールに保持されます（このオプションの調整に関する[ノート](./js.md#adjusting-idle_socket_ttl)を参照）。

`keep_alive.idle_socket_ttl`はサーバー/LBの設定よりもかなり低い値にする必要があります。主な理由は、HTTP/1.1がサーバーにソケットをクライアントに通知せずに閉じることを許可するためです。サーバーまたはロードバランサーがクライアントの前に接続を閉じる場合、クライアントが閉じたソケットを再利用しようとして`socket hang up`エラーが発生する可能性があります。

`keep_alive.idle_socket_ttl`を変更する場合、サーバー/LBのKeep-Alive設定と常に同期させ、常にそれよりも**低く**設定して、サーバーがオープン接続を先に閉じないようにする必要があります。
#### `idle_socket_ttl`の調整 {#adjusting-idle_socket_ttl}

クライアントは`keep_alive.idle_socket_ttl`を2500ミリ秒に設定しています。これは安全なデフォルトとみなされます; サーバー側では、`keep_alive_timeout`がClickHouseのバージョン23.11以前で[3秒以下に設定されている場合があります](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1)が、`config.xml`の変更なしで行われます。

:::warning
パフォーマンスに満足していて、問題が発生しない場合は、`keep_alive.idle_socket_ttl`設定の値を**増やさないこと**をお勧めします。この設定を増やすと、潜在的な「Socket hang-up」エラーが発生する可能性があります。さらに、アプリケーションが多くのクエリを送信し、クエリ間のダウンタイムがあまりない場合、デフォルト値は十分です。ソケットが長時間アイドル状態になることはなく、クライアントはそれらをプール内に保持します。
:::

サーバーレスポンスヘッダーで正しいKeep-Aliveタイムアウト値を確認するには、以下のコマンドを実行します。

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

レスポンスで`Connection`と`Keep-Alive`ヘッダーの値を確認してください。例えば：

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

この場合、`keep_alive_timeout`は10秒であり、`keep_alive.idle_socket_ttl`を9000ミリ秒または9500ミリ秒に増加させて、アイドル状態のソケットをデフォルトよりも少し長く開いたままにすることができます。サーバーがクライアントよりも先に接続を閉じる場合に発生する可能性のある「Socket hang-up」エラーに注意し、エラーが消えるまで値を下げてください。
#### Keep-Aliveのトラブルシューティング {#keep-alive-troubleshooting}

Keep-Aliveを使用しているときに`socket hang up`エラーが発生する場合は、次のオプションでこの問題を解決できます：

* ClickHouseサーバー設定で`keep_alive.idle_socket_ttl`設定をわずかに減らします。クライアントとサーバーの間に高いネットワーク遅延がある場合、サーバーが閉じようとしているソケットを取得した場合に発生する可能性があります。この場合、`keep_alive.idle_socket_ttl`を200〜500ミリ秒減らすことが有効な場合があります。

* このエラーが、データが出入りしないまま長時間実行されているクエリ（例えば、長時間の`INSERT FROM SELECT`）中に発生する場合、ロードバランサーがアイドル接続を閉じている可能性があります。この場合、長時間実行されるクエリの間にデータを強制的に送信することをお勧めします。これを次のClickHouse設定の組み合わせを使用して行うことができます：

  ```ts
  const client = createClient({
    // ここでは、5分以上実行時間のあるクエリがあることを前提としています
    request_timeout: 400_000,
    /** これは、データが出入りしない長時間実行されるクエリ（たとえば、`INSERT FROM SELECT`など）の場合に
     *  LBタイムアウトの問題を回避するための設定です。LBがアイドル接続タイムアウトを120秒持っていると仮定し、
     *  110秒を「安全な」値として設定します。 */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: '110000', // UInt64、文字列として渡す必要があります
    },
  })
  ```
  ただし、最近のNode.jsバージョンで受信するヘッダーの合計サイズには制限があり、特定の進捗ヘッダーを受信後、約70〜80回のテストまで例外が発生します。

  また、ワイヤ上の待機時間を完全に回避するまったく異なるアプローチを利用することも可能です。この機能により、接続が失われた場合に変異がキャンセルされることはありません。詳細については[この例（パート2）](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts)を参照してください。

* Keep-Alive機能を完全に無効にすることも可能です。この場合、クライアントはすべてのリクエストに`Connection: close`ヘッダーを追加し、基盤となるHTTPエージェントは接続を再利用しません。`keep_alive.idle_socket_ttl`設定は無視され、アイドル状態のソケットは存在しなくなります。これにより、すべてのリクエストに新しい接続を確立する追加のオーバーヘッドが発生します。

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```
### 読み取り専用ユーザー {#read-only-users}

[readonly=1 ユーザー](/operations/settings/permissions-for-queries#readonly)を使用してクライアントを使用すると、レスポンス圧縮は有効にできません。これは、`enable_http_compression`設定が必要です。この構成はエラーになります：

```ts
const client = createClient({
  compression: {
    response: true, // readonly=1 ユーザーでは機能しません
  },
})
```

詳細なreadonly=1ユーザーの制限事項については[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)を参照してください。
### パス名を持つプロキシ {#proxy-with-a-pathname}

ClickHouseインスタンスがプロキシの背後にあり、URLにパス名がある場合（例えば、http://proxy:8123/clickhouse_serverのように）、`clickhouse_server`を`pathname`構成オプションとして指定します（先頭スラッシュがあってもなくても可）。そうでなければ、`url`に直接指定すると、`database`オプションとみなされます。複数のセグメントがサポートされています。例：`/my_proxy/db`。

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```
### 認証のあるリバースプロキシ {#reverse-proxy-with-authentication}

ClickHouseデプロイの前に認証を持つリバースプロキシがある場合、`http_headers`設定を使用して、そこに必要なヘッダーを提供できます。

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```
### カスタム HTTP/HTTPS エージェント (実験的, Node.js のみ) {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
これは実験的な機能であり、将来のリリースで後方互換性のない方法で変更される可能性があります。クライアントが提供するデフォルトの実装と設定は、ほとんどのユースケースに対して十分であるはずです。この機能は、本当に必要な場合にのみ使用してください。
:::

デフォルトでは、クライアントはクライアント設定（`max_open_connections`, `keep_alive.enabled`, `tls` など）で提供された設定を使用して、基礎となる HTTP(s) エージェントを構成し、ClickHouse サーバーへの接続を処理します。さらに、TLS 証明書が使用される場合、基礎となるエージェントは必要な証明書で構成され、正しい TLS 認証ヘッダーが適用されます。

1.2.0以降、カスタム HTTP(s) エージェントをクライアントに提供して、デフォルトの基礎エージェントを置き換えることが可能です。これは、複雑なネットワーク構成の場合に便利です。カスタムエージェントが提供された場合、次の条件が適用されます：
- `max_open_connections` および `tls` オプションは _無効_ となり、クライアントによって無視されます。これは基礎エージェントの構成の一部だからです。
- `keep_alive.enabled` は `Connection` ヘッダーのデフォルト値だけを調整します（`true` -> `Connection: keep-alive`, `false` -> `Connection: close`）。
- アイドルキープアライブソケット管理はまだ機能します（これはエージェントに結びついているのではなく、特定のソケットに結びついているため）が、`keep_alive.idle_socket_ttl` の値を `0` に設定することで、完全に無効にすることが可能になりました。
#### カスタムエージェント使用例 {#custom-agent-usage-examples}

証明書なしでカスタム HTTP(s) エージェントを使用する：

```ts
const agent = new http.Agent({ // または https.Agent
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10,
})
const client = createClient({
  http_agent: agent,
})
```

基本的な TLS と CA 証明書を使用したカスタム HTTPS エージェント：

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
  // カスタム HTTPS エージェントを使用すると、クライアントはデフォルトの HTTPS 接続実装を使用せず; ヘッダーは手動で提供する必要があります
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
  },
  // 重要: 認証ヘッダーは TLS ヘッダーと競合するため、無効にします。
  set_basic_auth_header: false,
})
```

相互 TLS を使用したカスタム HTTPS エージェント：

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
  // カスタム HTTPS エージェントを使用すると、クライアントはデフォルトの HTTPS 接続実装を使用せず; ヘッダーは手動で提供する必要があります
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
    'X-ClickHouse-SSL-Certificate-Auth': 'on',
  },
  // 重要: 認証ヘッダーは TLS ヘッダーと競合するため、無効にします。
  set_basic_auth_header: false,
})
```

証明書 _および_ カスタム _HTTPS_ エージェントを使用する場合、TLS ヘッダーと競合するため、デフォルトの認証ヘッダーを `set_basic_auth_header` 設定（1.2.0で導入）で無効にする必要があるでしょう。すべての TLS ヘッダーは手動で提供する必要があります。
## 既知の制限 (Node.js/Web) {#known-limitations-nodejsweb}

- 結果セットのデータマッパーはないため、言語のプリミティブのみが使用されます。特定のデータ型マッパーは、[RowBinary 形式のサポート](https://github.com/ClickHouse/clickhouse-js/issues/216)で計画されています。
- 一部の [Decimal* と Date* / DateTime* データ型に関する注意事項](./js.md#datedate32-types-caveats) があります。
- JSON* 系フォーマットを使用している場合、Int32 よりも大きい数は文字列として表現されます。これは、Int64+ 型の最大値が `Number.MAX_SAFE_INTEGER` より大きいためです。詳細は [整数型](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) セクションをご覧ください。
## 既知の制限 (Web) {#known-limitations-web}

- SELECT クエリのストリーミングは機能しますが、INSERT では無効になっています（タイプレベルでも）。
- リクエスト圧縮は無効で、構成は無視されます。レスポンス圧縮は機能します。
- ロギングサポートはまだありません。
## パフォーマンス最適化のためのヒント {#tips-for-performance-optimizations}

- アプリケーションのメモリ消費を減らすためには、大きな INSERT (例えばファイルから) や SELECT の際にストリームを使用することを検討してください。イベントリスナーやそれに類するユースケースでは、[非同期 INSERT](/optimize/asynchronous-inserts) がもう一つの良い選択肢となり、クライアント側のバッチ処理を最小限に抑えるか、完全に回避することができます。非同期 INSERT の例は、[クライアントリポジトリ](https://github.com/ClickHouse/clickhouse-js/tree/main/examples) に、ファイル名のプレフィックスが `async_insert_` として提供されています。
- クライアントはデフォルトでリクエストまたはレスポンス圧縮を有効にしません。ただし、大規模なデータセットを選択または挿入する際に、`ClickHouseClientConfigOptions.compression` を介して有効にすることを検討できます（リクエストまたはレスポンスのいずれか、または両方のために）。
- 圧縮は重大なパフォーマンスペナルティを伴います。リクエストまたはレスポンスで圧縮を有効にすると、それぞれの SELECT または INSERT の速度に悪影響を与えるが、アプリケーションによって転送されるネットワークトラフィックの量を減少させます。
## お問い合わせ {#contact-us}

ご質問がある場合や支援が必要な場合は、[コミュニティ Slack](https://clickhouse.com/slack) （`#clickhouse-js` チャンネル）や [GitHub Issues](https://github.com/ClickHouse/clickhouse-js/issues) を通じてお気軽にお問い合わせください。
