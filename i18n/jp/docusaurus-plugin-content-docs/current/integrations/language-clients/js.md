---
sidebar_label: JavaScript
sidebar_position: 4
keywords: [clickhouse, js, JavaScript, NodeJS, web, browser, Cloudflare, workers, client, connect, integrate]
slug: /integrations/javascript
description: ClickHouseに接続するための公式JSクライアント。
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# ClickHouse JS

ClickHouseに接続するための公式JSクライアントです。
クライアントはTypeScriptで記述されており、クライアントの公開APIに対する型定義を提供します。

依存関係はゼロで、最大のパフォーマンスに最適化されており、さまざまなClickHouseのバージョンと構成（オンプレミスのシングルノード、オンプレミスのクラスター、およびClickHouse Cloud）でテストされています。

異なる環境に対応するために、2つの異なるバージョンのクライアントが利用可能です：
- `@clickhouse/client` - Node.js専用
- `@clickhouse/client-web` - ブラウザ（Chrome/Firefox）、Cloudflare workers

TypeScriptを使用する場合は、少なくとも[version 4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)が必要であり、これにより[インラインインポートおよびエクスポートの構文](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)が有効になります。

クライアントのソースコードは、[ClickHouse-JS GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-js)で入手できます。
## 環境要件 (Node.js) {#environment-requirements-nodejs}

クライアントを実行するには、環境にNode.jsが必要です。
クライアントは、すべての[メンテナンスされている](https://github.com/nodejs/release#readme)Node.jsリリースと互換性があります。

Node.jsのバージョンがEnd-Of-Lifeに近づくと、クライアントはそれに対するサポートを停止します。これは古くて安全ではないと見なされるためです。

現在のNode.jsバージョンのサポート：

| Node.jsバージョン | サポートされているか  |
|-----------------|-------------|
| 22.x            | ✔           |
| 20.x            | ✔           |
| 18.x            | ✔           |
| 16.x            | ベストエフォート |
## 環境要件 (Web) {#environment-requirements-web}

クライアントのWebバージョンは、最新のChrome/Firefoxブラウザで公式にテストされており、例えばReact/Vue/AngularアプリケーションやCloudflare workersで依存関係として使用できます。
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
|----------------|------------|
| 1.8.0          | 23.3+      |

おそらく、クライアントは古いバージョンでも動作しますが、これはベストエフォートのサポートであり、保証されていません。ClickHouseのバージョンが23.3より古い場合は、[ClickHouseセキュリティポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)を参照し、アップグレードを検討してください。
## 例 {#examples}

クライアントの使用シナリオをさまざまな[例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples)でカバーすることを目指しています。

概要は、[例のREADME](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview)でご確認いただけます。

不明な点や例または以下の文書に欠けている部分があれば、[お問い合わせ](./js.md#contact-us)ください。
### クライアントAPI {#client-api}

ほとんどの例は、明示的に異なると記載されていない限り、Node.jsとWebバージョンの両方に対応しています。
#### クライアントインスタンスの作成 {#creating-a-client-instance}

`createClient`ファクトリを使用して、必要なだけクライアントインスタンスを作成できます：

```ts
import { createClient } from '@clickhouse/client' // または '@clickhouse/client-web'

const client = createClient({
  /* 設定 */
})
```

環境がESMモジュールをサポートしていない場合は、CJS構文を代わりに使用できます：

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* 設定 */
})
```

クライアントインスタンスは、インスタンス化時に[プリコンフィグレーション](./js.md#configuration)が可能です。
#### 設定 {#configuration}

クライアントインスタンスを作成する際に、以下の接続設定を調整できます：

| 設定                                                                   | 説明                                                                              | デフォルト値           | その他                                                                                                                |
|------------------------------------------------------------------------|-----------------------------------------------------------------------------------|-------------------------|-------------------------------------------------------------------------------------------------------------------------|
| **url**?: string                                                       | ClickHouseインスタンスのURL。                                                     | `http://localhost:8123` | [URL設定ドキュメント](./js.md#url-configuration)                                                                     |
| **pathname**?: string                                                  | クライアントが解析した後にClickHouse URLに追加するオプションのパス名。             | `''`                    | [パス名付きプロキシのドキュメント](./js.md#proxy-with-a-pathname)                                                               |
| **request_timeout**?: number                                           | リクエストタイムアウト（ミリ秒単位）。                                           | `30_000`                | -                                                                                                                       |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }` | 圧縮を有効にする。                                                              | -                       | [圧縮のドキュメント](./js.md#compression)                                                                                                   |
| **username**?: string                                                  | リクエストが行われるユーザー名。                                                 | `default`               | -                                                                                                                       |
| **password**?: string                                                  | ユーザーパスワード。                                                              | `''`                    | -                                                                                                                       |
| **application**?: string                                               | Node.jsクライアントを使用しているアプリケーションの名前。                         | `clickhouse-js`         | -                                                                                                                       |
| **database**?: string                                                  | 使用するデータベース名。                                                          | `default`               | -                                                                                                                       |
| **clickhouse_settings**?: ClickHouseSettings                           | すべてのリクエストに適用するClickHouse設定。                                       | `{}`                    | -                                                                                                                       |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 内部クライアントログの設定。                                                    | -                       | [ロギングのドキュメント](./js.md#logging-nodejs-only)                                                                                      |
| **session_id**?: string                                                | すべてのリクエストに送信するオプションのClickHouseセッションID。                   | -                       | -                                                                                                                       |
| **keep_alive**?: `{ **enabled**?: boolean }`                           | Node.jsおよびWebの両方でデフォルトで有効。                                         | -                       | -                                                                                                                       |
| **http_headers**?: `Record<string, string>`                              | 送信されるClickHouseリクエスト用の追加HTTPヘッダー。                              | -                       | [認証付きのリバースプロキシのドキュメント](./js.md#reverse-proxy-with-authentication)                                                                             |
| **roles**?: string \| string[]                                         | 送信リクエストに添付するClickHouseロール名。                                    | -                       | [HTTPインターフェースでのロール使用](/interfaces/http#setting-role-with-query-parameters)|
#### Node.js特有の設定パラメータ {#nodejs-specific-configuration-parameters}

| 設定                                                                   | 説明                                                               | デフォルト値 | その他                                                                                              |
|------------------------------------------------------------------------|---------------------------------------------------------------------|---------------|------------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                        | ホストごとに許可される最大接続ソケット数。                           | `10`          | -                                                                                                    |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }` | TLS証明書を設定します。                                              | -             | [TLSのドキュメント](./js.md#tls-certificates-nodejs-only)                                            |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                                   | -             | [Keep Aliveのドキュメント](./js.md#keep-alive-configuration-nodejs-only)                            |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>     | クライアント用のカスタムHTTPエージェント。                         | -             | [HTTPエージェントのドキュメント](./js.md#custom-httphttps-agent-experimental-nodejs-only)            |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>            | ベーシック認証情報で`Authorization`ヘッダーを設定します。             | `true`        | [HTTPエージェントドキュメントでのこの設定の使用法](./js.md#custom-httphttps-agent-experimental-nodejs-only) |
### URL設定 {#url-configuration}

:::important
URL設定は_常に_ハードコーディングされた値を上書きし、この場合には警告がログに記録されます。
:::

クライアントインスタンスパラメータのほとんどをURLで設定できます。URL形式は`http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`です。ほとんどの場合、特定のパラメータの名前は構成オプションインターフェース内のパスを反映していますが、いくつかの例外があります。以下のパラメータがサポートされています：

| パラメータ                                   | タイプ                                                           |
|---------------------------------------------|----------------------------------------------------------------|
| `pathname`                                  | 任意の文字列。                                                 |
| `application_id`                            | 任意の文字列。                                                 |
| `session_id`                                | 任意の文字列。                                                 |
| `request_timeout`                           | 非負の数。                                                     |
| `max_open_connections`                      | 非負の数、ゼロより大きい。                                   |
| `compression_request`                       | ブーリアン。以下を参照（1）                                    |
| `compression_response`                      | ブーリアン。                                                 |
| `log_level`                                 | 許可される値: `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`。 |
| `keep_alive_enabled`                        | ブーリアン。                                                 |
| `clickhouse_setting_*` または `ch_*`        | 以下を参照（2）                                               |
| `http_header_*`                             | 以下を参照（3）                                               |
| (Node.js専用) `keep_alive_idle_socket_ttl` | 非負の数。                                                     |

- (1) ブーリアンの場合、有効な値は`true`/`1`および`false`/`0`です。
- (2) `clickhouse_setting_`または`ch_`で始まるパラメータは、この接頭辞が削除され、残りがクライアントの`clickhouse_settings`に追加されます。例えば、`?ch_async_insert=1&ch_wait_for_async_insert=1`は以下と同じです：

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

注意: `clickhouse_settings`のブーリアン値は、URLにおいて`1`/`0`として渡されるべきです。

- (3) (2)と類似していますが、`http_header`設定用です。例えば、`?http_header_x-clickhouse-auth=foobar`は以下に相当します：

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```
### 接続 {#connecting}
#### 接続詳細の収集 {#gather-your-connection-details}

<ConnectionDetails />
#### 接続概要 {#connection-overview}

クライアントはHTTP(S)プロトコルを介して接続を実装します。RowBinaryのサポートは進行中で、[関連する問題](https://github.com/ClickHouse/clickhouse-js/issues/216)を参照してください。

次の例は、ClickHouse Cloudに対して接続を設定する方法を示します。これは、`url`（プロトコルおよびポートを含む）と`password`の値が環境変数を介して指定されており、`default`ユーザーが使用されることを前提としています。

**例:** 環境変数を使用して設定するNode.jsクライアントインスタンスの作成。

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

クライアントリポジトリには、環境変数を使用した多くの例が含まれており、例えば[ClickHouse Cloudでのテーブル作成](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)、[非同期挿入の使用](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts)、その他がいくつかあります。
#### 接続プール (Node.js専用) {#connection-pool-nodejs-only}

リクエストごとに接続を確立するオーバーヘッドを避けるために、クライアントはClickHouseへの接続プールを作成し、再利用しています。Keep-Aliveメカニズムを利用しています。デフォルトではKeep-Aliveが有効で、接続プールのサイズは`10`に設定されていますが、`max_open_connections`[設定オプション](./js.md#configuration)で変更できます。

ユーザーが`max_open_connections: 1`を設定しない限り、プール内の同じ接続が次のクエリに使用される保証はありません。これはあまり必要ではありませんが、一時テーブルを使用する場合に必要になることがあります。

関連する情報も参照してください: [Keep-Alive設定](./js.md#keep-alive-configuration-nodejs-only)。
### クエリID {#query-id}

クエリやステートメント（`command`、`exec`、`insert`、`select`）を送信するすべてのメソッドは、結果に`query_id`を提供します。このユニークな識別子は、クライアントがクエリごとに割り当てたものであり、[server configuration](/operations/server-configuration-parameters/settings#server_configuration_parameters-query-log)で有効時に`system.query_log`からデータを取得するのに役立ちます。また、長時間実行されるクエリをキャンセルするためにも役立ちます（[こちらの例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)を参照）。必要に応じて、`command`/`query`/`exec`/`insert`メソッドのパラメータで`query_id`をユーザーが上書きすることもできます。

:::tip
`query_id`パラメータを上書きする場合、各呼び出しごとに一意であることを確認する必要があります。ランダムUUIDは良い選択です。
:::
### すべてのクライアントメソッドのベースパラメータ {#base-parameters-for-all-client-methods}

すべてのクライアントメソッドに適用できるいくつかのパラメータがあります（[query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)）。

```ts
interface BaseQueryParams {
  // クエリレベルで適用できるClickHouse設定。
  clickhouse_settings?: ClickHouseSettings
  // クエリバインディングのためのパラメータ。
  query_params?: Record<string, unknown>
  // 進行中のクエリをキャンセルするためのAbortSignalインスタンス。
  abort_signal?: AbortSignal
  // query_idの上書き; 指定されていない場合、ランダムな識別子が自動的に生成されます。
  query_id?: string
  // session_idの上書き; 指定されていない場合、セッションIDはクライアントの設定から取得されます。
  session_id?: string
  // 資格情報の上書き; 指定されていない場合、クライアントの資格情報が使用されます。
  auth?: { username: string, password: string }
  // このクエリに使用する特定のロールのリスト。クライアントの設定で設定されたロールを上書きします。
  role?: string | Array<string>
}
```
### クエリメソッド {#query-method}

これは、`SELECT`のようにレスポンスを持つ可能性のあるほとんどのステートメントや、`CREATE TABLE`のようなDDLを送信するために使用され、待機する必要があります。返される結果セットは、アプリケーション内で消費されることが期待されます。

:::note
データ挿入用の専用メソッド[insert](./js.md#insert-method)やDDL用の[command](./js.md#command-method)があります。
:::

```ts
interface QueryParams extends BaseQueryParams {
  // データを返す可能性のある実行するクエリ。
  query: string
  // 結果データセットのフォーマット。デフォルト: JSON。
  format?: DataFormat
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>
}
```

関連情報: [すべてのクライアントメソッドのベースパラメータ](./js.md#base-parameters-for-all-client-methods)。

:::tip
`query`にFORMAT句を指定しないでください。代わりに`format`パラメータを使用してください。
:::
#### 結果セットと行の抽象化 {#result-set-and-row-abstractions}

`ResultSet`は、アプリケーション内でのデータ処理のためにいくつかの便利なメソッドを提供します。

Node.jsの`ResultSet`実装は内部で`Stream.Readable`を使用しており、一方WebバージョンはWeb APIの`ReadableStream`を使用しています。

`ResultSet`を消費するには、`ResultSet`の`text`または`json`メソッドのいずれかを呼び出し、クエリによって返されるすべての行セットをメモリにロードできます。

`ResultSet`は可能な限り早く消費を開始すべきです。なぜなら、レスポンスストリームを保持し、基礎となる接続を忙しく保つからです。クライアントは、アプリケーションによる潜在的な過剰なメモリ使用を避けるために、受信データをバッファリングしません。

あるいは、一度にメモリに収まりきらないほど大きい場合、`stream`メソッドを呼び出して、ストリーミングモードでデータを処理することもできます。レスポンスの各チャンクは、代わりに比較的小さな行の配列に変換されます（この配列のサイズは、サーバーからクライアントが受け取る特定のチャンクのサイズによって異なり、個々の行のサイズにも依存します）。

どのデータフォーマットがあなたの場合に最適かを判断するために、[サポートされているデータフォーマット](./js.md#supported-data-formats)のリストを参照してください。たとえば、JSONオブジェクトをストリーミングしたい場合、[JSONEachRow](/sql-reference/formats#jsoneachrow)を選択すれば、各行がJSオブジェクトとして解析されます。または、各行が値のコンパクトな配列となる、よりコンパクトな[JSONCompactColumns](/sql-reference/formats#jsoncompactcolumns)フォーマットを選択することもできるかもしれません。詳細については、[ファイルのストリーミング](./js.md#streaming-files-nodejs-only)も参照してください。

:::important
`ResultSet`またはそのストリームが完全に消費されない場合、非稼働の`request_timeout`期間の後に破棄されます。
:::

```ts
interface BaseResultSet<Stream> {
  // 上記の「クエリID」セクションを参照
  query_id: string

  // ストリーム全体を消費し、内容を文字列として取得します。
  // すべてのDataFormatで使用できます。
  // 一度だけ呼び出す必要があります。
  text(): Promise<string>

  // ストリーム全体を消費し、内容をJSオブジェクトとして解析します。
  // JSONフォーマットでのみ使用できます。
  // 一度だけ呼び出す必要があります。
  json<T>(): Promise<T>

  // ストリーム可能なレスポンス用の読み取り可能なストリームを返します。
  // ストリームの毎回の反復は、選択したDataFormatにおけるRow[]の配列を提供します。
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

**例:** (Node.js/Web) `JSONEachRow`フォーマットの結果データセットを持つクエリ。ストリーム全体を消費し、内容をJSオブジェクトとして解析します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // または `row.text`でJSONを解析しない
```

**例:** (Node.js専用) `JSONEachRow`フォーマットのクエリ結果をストリーミング。従来の`on('data')`アプローチを使用しています。これは`for await const`構文と同じです。[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // または JSONCompactEachRow, JSONStringsEachRowなど
})
const stream = rows.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.json()) // または `row.text`でJSONを解析しない
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

**例:** (Node.js専用) `CSV`フォーマットのクエリ結果をストリーミング。従来の`on('data')`アプローチを使用しています。これは`for await const`構文と同じです。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'CSV', // または TabSeparated, CustomSeparatedなど
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

**例:** (Node.js専用) `JSONEachRow`フォーマットのJSオブジェクトとしてのクエリ結果をストリーミング。`for await const`構文を使用しています。これは従来の`on('data')`アプローチと同じです。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers LIMIT 10',
  format: 'JSONEachRow', // または JSONCompactEachRow, JSONStringsEachRowなど
})
for await (const rows of resultSet.stream()) {
  rows.forEach(row => {
    console.log(row.json())
  })
}
```

:::note
`for await const`構文は、`on('data')`アプローチよりも少し少ないコードになりますが、パフォーマンスに悪影響を与える可能性があります。
詳細は[Node.jsリポジトリのこの問題](https://github.com/nodejs/node/issues/31979)を参照してください。
:::

**例:** (Web専用) オブジェクトの`ReadableStream`の反復。

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

データ挿入のための主要なメソッドです。

```ts
export interface InsertResult {
  query_id: string
  executed: boolean
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

戻り値のタイプは最小限であり、サーバーからデータが返されることは期待されておらず、レスポンスストリームはすぐに排出されます。

挿入メソッドに空の配列が提供された場合、挿入ステートメントはサーバーに送信されません。その代わり、メソッドは即座に`{ query_id: '...', executed: false }`を返します。この場合、メソッドパラメータに`query_id`が指定されていなければ、結果は空の文字列になります。なぜなら、クライアントによって生成されたランダムUUIDを返すことは混乱を招く可能性があるためです。この`query_id`は`system.query_log`テーブルには存在しません。

挿入ステートメントがサーバーに送信された場合、`executed`フラグは`true`になります。
#### Insert method and streaming in Node.js {#insert-method-and-streaming-in-nodejs}

`Stream.Readable` またはプレーンな `Array<T>` のいずれかで動作できます。これは、`insert` メソッドに指定された [データフォーマット](./js.md#supported-data-formats) によります。また、[ファイルストリーミング](./js.md#streaming-files-nodejs-only) に関するこのセクションも参照してください。

`insert` メソッドは待機することを想定していますが、入力ストリームを指定して、ストリームが完了したときにのみ `insert` 操作を待機することも可能です（これによって、`insert` のプロミスも解決されます）。これは、イベントリスナーや同様のシナリオにとって便利になる可能性がありますが、エラーハンドリングはクライアント側で多くのエッジケースがあるため、簡単ではないかもしれません。その代わりに、[非同期挿入](https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax) を使用することを検討してください。[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts)で示されています。

:::tip
このメソッドでモデル化するのが難しいカスタム INSERT 文がある場合は、[コマンドメソッド](./js.md#command-method) の使用を検討してください。

[INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) や [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) の例でどのように使用されているかを確認できます。
:::

```ts
interface InsertParams<T> extends BaseQueryParams {
  // データを挿入するテーブル名
  table: string
  // 挿入するデータセット
  values: ReadonlyArray<T> | Stream.Readable
  // 挿入するデータセットのフォーマット
  format?: DataFormat
  // データを挿入するカラムを指定するための許可
  // - `['a', 'b']` のような配列は次のように生成します: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - `{ except: ['a', 'b'] }` のようなオブジェクトは次のように生成します: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // デフォルトでは、データはテーブルのすべてのカラムに挿入され、
  // 生成されるステートメントは次のようになります: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

他にも、[すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods) を参照してください。

:::important
`abort_signal` でキャンセルされたリクエストは、データの挿入が行われなかったことを保証しません。キャンセル前にサーバーがストリームされたデータの一部を受け取っている可能性があります。
:::

**例:** (Node.js/Web) 値の配列を挿入します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
await client.insert({
  table: 'my_table',
  // 構造はこの例のように、JSONEachRow に一致する必要があります。
  values: [
    { id: 42, name: 'foo' },
    { id: 42, name: 'bar' },
  ],
  format: 'JSONEachRow',
})
```

**例:** (Node.js のみ) CSV ファイルからストリームを挿入します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。 [ファイルストリーミング](./js.md#streaming-files-nodejs-only) も参照してください。

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**例:** 挿入文から特定のカラムを除外します。

以下のようなテーブル定義があるとします。

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

特定のカラムのみを挿入します。

```ts
// 生成されるステートメント: INSERT INTO mytable (message) FORMAT JSONEachRow
await client.insert({
  table: 'mytable',
  values: [{ message: 'foo' }],
  format: 'JSONEachRow',
  // この行の `id` カラムの値はゼロ (UInt32 のデフォルト)
  columns: ['message'],
})
```

特定のカラムを除外します。

```ts
// 生成されるステートメント: INSERT INTO mytable (* EXCEPT (message)) FORMAT JSONEachRow
await client.insert({
  table: tableName,
  values: [{ id: 144 }],
  format: 'JSONEachRow',
  // この行の `message` カラムの値は空の文字列
  columns: {
    except: ['message'],
  },
})
```

詳細については [ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts) を参照してください。

**例:** クライアントインスタンスに提供されたものとは異なるデータベースに挿入します。 [ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: 'mydb.mytable', // データベースを含む完全修飾名
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```
#### Web version limitations {#web-version-limitations}

現在、`@clickhouse/client-web` での挿入は `Array<T>` と `JSON*` フォーマットでのみ動作します。
ストリームの挿入は、ブラウザの互換性が悪いため、まだウェブバージョンではサポートされていません。

そのため、ウェブバージョンの `InsertParams` インターフェースは、`values` が `ReadonlyArray<T>` 型のみに制限されているため、Node.js バージョンとは少し異なります。

```ts
interface InsertParams<T> extends BaseQueryParams {
  // データを挿入するテーブル名
  table: string
  // 挿入するデータセット
  values: ReadonlyArray<T>
  // 挿入するデータセットのフォーマット
  format?: DataFormat
  // データを挿入するカラムを指定するための許可
  // - `['a', 'b']` のような配列は次のように生成します: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - `{ except: ['a', 'b'] }` のようなオブジェクトは次のように生成します: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // デフォルトでは、データはテーブルのすべてのカラムに挿入され、
  // 生成されるステートメントは次のようになります: `INSERT INTO table FORMAT DataFormat`.
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

これは将来的に変更される可能性があります。 [すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods) も参照してください。
### Command method {#command-method}

出力がないステートメントの場合、フォーマット句が適用できない場合、またはレスポンスに関心がない場合に使用できます。`CREATE TABLE` や `ALTER TABLE` のようなステートメントがその例です。

待機する必要があります。

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

他にも、[すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods) を参照してください。

**例:** (Node.js/Web) ClickHouse Cloud でテーブルを作成します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)。

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // クラスター使用時には推奨されます。リクエストコードの後にクエリ処理エラーが発生した場合に、HTTP ヘッダーがクライアントに送信される前にエラーを回避します。
  // https://clickhouse.com/docs/interfaces/http/#response-buffering を参照してください。
  clickhouse_settings: {
    wait_end_of_query: 1,
  },
})
```

**例:** (Node.js/Web) セルフホストの ClickHouse インスタンスにテーブルを作成します。
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
`abort_signal` でキャンセルしたリクエストは、サーバーによってステートメントが実行されなかったことを保証しません。
:::
### Exec method {#exec-method}

`query`/`insert` に収まらないカスタムクエリがあり、結果に関心がある場合は、`command` に代わって `exec` を使用できます。

`exec` は、アプリケーション側で消費または破棄する必要があるリーダブルストリームを返します。

```ts
interface ExecParams extends BaseQueryParams {
  // 実行するステートメント
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

他にも、[すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods) を参照してください。

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

接続ステータスを確認するために提供される `ping` メソッドは、サーバーに到達可能であれば `true` を返します。

サーバーに到達できない場合、基盤となるエラーも結果に含まれます。

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }

interface ClickHouseClient {
  ping(): Promise<PingResult>
}
```

アプリケーションが開始するときにサーバーが利用可能かどうかを確認するための便利なツールとなる可能性があります。特に ClickHouse Cloud では、インスタンスがアイドル状態になる可能性があり、ping に応じてウェイクアップします。

**例:** (Node.js/Web) ClickHouse サーバーインスタンスに ping を送信します。注意: ウェブバージョンでは、キャッチされたエラーが異なる場合があります。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // 結果のエラーを処理
}
```

注意: `/ping` エンドポイントが CORS を実装していないため、ウェブバージョンでは単純な `SELECT 1` を使用して同様の結果を得ます。
### Close (Node.js only) {#close-nodejs-only}

すべての接続を閉じ、リソースを解放します。ウェブバージョンには効果がありません。

```ts
await client.close()
```
## Streaming files (Node.js only) {#streaming-files-nodejs-only}

クライアントリポジトリ内には、一般的なデータフォーマット (NDJSON、CSV、Parquet) に関する複数のファイルストリーミングの例があります。

- [NDJSON ファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [CSV ファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Parquet ファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Parquet ファイルへのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

他のフォーマットをファイルにストリーミングすることは、Parquet に似ているはずです。ただし、`query` 呼び出しのフォーマット ( `JSONEachRow`、 `CSV` など) と出力ファイル名に違いがあります。
## Supported Data formats {#supported-data-formats}

クライアントはデータフォーマットを JSON またはテキストとして扱います。

`format` を JSON ファミリーのいずれか (`JSONEachRow`、 `JSONCompactEachRow` など) に指定すると、クライアントは通信の際にデータをシリアライズおよびデシリアライズします。

「生」テキストフォーマット (`CSV`、`TabSeparated`、`CustomSeparated` ファミリー) で提供されたデータは、追加の変換なしに通信されます。

:::tip
JSON が一般的なフォーマットとして混乱を招く可能性がありますが、[ClickHouse JSON フォーマット](https://sql-reference/formats#json) もあります。

クライアントは [JSONEachRow](https://sql-reference/formats#jsoneachrow) などのフォーマットを使用して JSON オブジェクトをストリーミングすることをサポートしています（他のストリーミングフレンドリーなフォーマットについてはテーブル概要を参照してください。また、クライアントリポジトリの `select_streaming_` [例](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)も参照してください）。

ただし、[ClickHouse JSON](https://sql-reference/formats#json) やその他のいくつかのフォーマットは、レスポンス内の単一のオブジェクトとして表現されており、クライアントによってストリーミングすることはできません。
:::

| フォーマット | 入力 (配列) | 入力 (オブジェクト) | 入力/出力 (ストリーム) | 出力 (JSON) | 出力 (テキスト) |
|--------------|---------------|--------------------|-----------------------|----------------|----------------|
| JSON         | ❌             | ✔️                 | ❌                     | ✔️             | ✔️             |
| JSONCompact  | ❌             | ✔️                 | ❌                     | ✔️             | ✔️             |
| JSONObjectEachRow | ❌        | ✔️                 | ❌                     | ✔️             | ✔️             |
| JSONColumnsWithMetadata | ❌   | ✔️                 | ❌                     | ✔️             | ✔️             |
| JSONStrings  | ❌             | ❌                 | ❌                     | ✔️             | ✔️             |
| JSONCompactStrings | ❌      | ❌                 | ❌                     | ✔️             | ✔️             |
| JSONEachRow  | ✔️             | ❌                 | ✔️                     | ✔️             | ✔️             |
| JSONEachRowWithProgress | ❌️  | ❌                 | ✔️ ❗- 以下を参照      | ✔️             | ✔️             |
| JSONStringsEachRow | ✔️      | ❌                 | ✔️                     | ✔️             | ✔️             |
| JSONCompactEachRow | ✔️      | ❌                 | ✔️                     | ✔️             | ✔️             |
| JSONCompactStringsEachRow | ✔️ | ❌                 | ✔️                     | ✔️             | ✔️             |
| JSONCompactEachRowWithNames | ✔️ | ❌               | ✔️                     | ✔️             | ✔️             |
| JSONCompactEachRowWithNamesAndTypes | ✔️ | ❌       | ✔️                     | ✔️             | ✔️             |
| JSONCompactStringsEachRowWithNames | ✔️ | ❌         | ✔️                     | ✔️             | ✔️             |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔️ | ❌ | ✔️                     | ✔️             | ✔️             |
| CSV          | ❌             | ❌                 | ✔️                     | ❌             | ✔️             |
| CSVWithNames | ❌             | ❌                 | ✔️                     | ❌             | ✔️             |
| CSVWithNamesAndTypes | ❌     | ❌                 | ✔️                     | ❌             | ✔️             |
| TabSeparated  | ❌            | ❌                 | ✔️                     | ❌             | ✔️             |
| TabSeparatedRaw | ❌          | ❌                 | ✔️                     | ❌             | ✔️             |
| TabSeparatedWithNames | ❌    | ❌                 | ✔️                     | ❌             | ✔️             |
| TabSeparatedWithNamesAndTypes | ❌ | ❌             | ✔️                     | ❌             | ✔️             |
| CustomSeparated | ❌          | ❌                 | ✔️                     | ❌             | ✔️             |
| CustomSeparatedWithNames | ❌  | ❌                 | ✔️                     | ❌             | ✔️             |
| CustomSeparatedWithNamesAndTypes | ❌ | ❌          | ✔️                     | ❌             | ✔️             |
| Parquet      | ❌             | ❌                 | ✔️                     | ❌             | ✔️❗- 以下を参照 |

Parquet の主な使用ケースは、選択した結果のストリームをファイルに書き込むことです。クライアントリポジトリ内の [この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts) を参照してください。

`JSONEachRowWithProgress` は、ストリーム内での進行状況の報告をサポートする出力専用フォーマットです。詳細については [この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts) を参照してください。

ClickHouse の入力および出力フォーマットの全リストは、[こちら](https://sql-reference/data-types/) で入手できます。
## Supported ClickHouse data types {#supported-clickhouse-data-types}

:::note
関連する JS 型は、すべての `JSON*` フォーマットに関連しており、すべての値を文字列として表すフォーマット (例: `JSONStringEachRow`) を除きます。
:::

| 型               | ステータス     | JS 型                     |
|------------------|----------------|---------------------------|
| UInt8/16/32      | ✔️             | number                    |
| UInt64/128/256   | ✔️ ❗- 下記参照 | string                    |
| Int8/16/32       | ✔️             | number                    |
| Int64/128/256    | ✔️ ❗- 下記参照 | string                    |
| Float32/64       | ✔️             | number                    |
| Decimal          | ✔️ ❗- 下記参照 | number                    |
| Boolean          | ✔️             | boolean                   |
| String           | ✔️             | string                    |
| FixedString      | ✔️             | string                    |
| UUID             | ✔️             | string                    |
| Date32/64        | ✔️             | string                    |
| DateTime32/64    | ✔️ ❗- 下記参照 | string                    |
| Enum             | ✔️             | string                    |
| LowCardinality   | ✔️             | string                    |
| Array(T)         | ✔️             | T[]                       |
| (new) JSON       | ✔️             | object                    |
| Variant(T1, T2...) | ✔️          | T (バリアントによります) |
| Dynamic          | ✔️             | T (バリアントによります) |
| Nested           | ✔️             | T[]                       |
| Tuple            | ✔️             | Tuple                     |
| Nullable(T)      | ✔️             | T の JS 型または null     |
| IPv4             | ✔️             | string                    |
| IPv6             | ✔️             | string                    |
| Point            | ✔️             | [ number, number ]        |
| Ring             | ✔️             | Array&lt;Point\>          |
| Polygon          | ✔️             | Array&lt;Ring\>          |
| MultiPolygon     | ✔️             | Array&lt;Polygon\>       |
| Map(K, V)        | ✔️             | Record&lt;K, V\>         |

ClickHouse フォーマットのサポートされる完全なリストは [こちら](https://sql-reference/data-types/) で入手できます。
### Date/Date32 types caveats {#datedate32-types-caveats}

クライアントは追加の型変換なしで値を挿入するため、`Date`/`Date32` 型の列には文字列としてのみ挿入できます。

**例:** `Date` 型の値を挿入します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

ただし、`DateTime` または `DateTime64` 列を使用する場合、文字列および JS Date オブジェクトの両方が使用できます。JS Date オブジェクトは、`date_time_input_format` を `best_effort` に設定すれば、そのまま `insert` に渡すことができます。詳細は [この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts) を参照してください。
### Decimal* types caveats {#decimal-types-caveats}

`JSON*` ファミリーのフォーマットを使用して Decimals を挿入することができます。次のようなテーブルが定義されていると仮定します。

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

値を精度損失なしに文字列表現を使用して挿入できます。

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

ただし、`JSON*` フォーマットでデータをクエリすると、ClickHouse は Decimals をデフォルトで _数字_ として返すため、精度が損失する可能性があります。これを回避するためには、クエリ内で Decimals を文字列にキャストすると良いでしょう。

```ts
await client.query({
  query: `
    SELECT toString(dec32) AS decimal32,
           toString(dec64) AS decimal64,
           toString(dec128) AS decimal128,
           toString(dec256) AS decimal256
    FROM my_table
  `,
  format: 'JSONEachRow',
})
```

詳細は [この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts) を参照してください。
### Integral types: Int64, Int128, Int256, UInt64, UInt128, UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

サーバーは数値として受け取ることができますが、最大値が `Number.MAX_SAFE_INTEGER` より大きいため、`JSON*` ファミリーの出力フォーマットでは文字列として返されます。

ただし、この動作は [`output_format_json_quote_64bit_integers` 設定](https://operations/settings/formats#output_format_json_quote_64bit_integers) で変更できます。

**例:** 64 ビット数値の JSON 出力フォーマットを調整します。

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
## ClickHouse settings {#clickhouse-settings}

クライアントは [settings](https://operations/settings/settings/) 機能を介して ClickHouse の動作を調整できます。
設定は、クライアントインスタンスレベルで設定され、ClickHouse に送信されるすべてのリクエストに適用されます。

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

または、リクエストレベルで設定を構成できます。

```ts
client.query({
  clickhouse_settings: {}
})
```

サポートされている ClickHouse 設定のすべてを含む型宣言ファイルは [こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts) で入手できます。

:::important
クエリを実行しているユーザーに、設定を変更するための十分な権限があることを確認してください。
:::
## Advanced topics {#advanced-topics}
### Queries with parameters {#queries-with-parameters}

パラメータを持つクエリを作成し、クライアントアプリケーションからその値を渡すことができます。これにより、クライアント側で特定の動的値をクエリにフォーマットすることを避けることができます。

クエリを通常どおりフォーマットし、アプリケーションパラメータからクエリに渡したい値を次のフォーマットで波括弧で置きます。

```text
{<name>: <data_type>}
```

ここで：

- `name` — プレースホルダー識別子
- `data_type` - [データ型](https://sql-reference/data-types/) (アプリケーションパラメータ値の型)

**例:** パラメータを持つクエリです。
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

詳細は https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax を参照してください。
### Compression {#compression}

注意: Web バージョンではリクエスト圧縮は現在利用できません。レスポンス圧縮は通常通り動作します。Node.js バージョンは両方をサポートしています。

大規模データセットを扱うデータアプリケーションは、圧縮を有効にすることで利益を得ることができます。現時点では、`GZIP` のみがサポートされており、[zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html) を使用しています。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

設定パラメータは次のとおりです。

- `response: true` は、ClickHouse サーバーに圧縮されたレスポンスボディで応答するように指示します。デフォルト値: `response: false`
- `request: true` は、クライアントリクエストボディの圧縮を有効にします。デフォルト値: `request: false`
### Logging (Node.js only) {#logging-nodejs-only}

:::important
ログ機能は実験的な機能であり、将来的に変更される可能性があります。
:::

デフォルトのロガー実装は、`stdout` に `console.debug/info/warn/error` メソッドを介してログ記録を出力します。
`LoggerClass` を提供することでロギングロジックをカスタマイズし、`level` パラメータ（デフォルトは `OFF`）を介して希望するログレベルを選択できます。

```typescript
import type { Logger } from '@clickhouse/client'

// すべての LogParams タイプはクライアントによってエクスポートされています。
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

現在、クライアントは以下のイベントをログに記録します。

- `TRACE` - Keep-Alive ソケットのライフサイクルに関する低レベルの情報
- `DEBUG` - レスポンス情報（認証ヘッダーやホスト情報を含まず）
- `INFO` - あまり使用されません。クライアントが初期化されると現在のログレベルを出力します。
- `WARN` - 非致命的エラー。失敗した `ping` リクエストは警告としてログに記録され、基盤となるエラーが戻される結果に含まれています。
- `ERROR` - `query`/`insert`/`exec`/`command` メソッドからの致命的エラー（失敗したリクエストなど）

デフォルトのロガー実装は、[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts) で確認できます。
### TLS certificates (Node.js only) {#tls-certificates-nodejs-only}

Node.js クライアントは、基本的な (証明書機関のみ) および相互 (証明書機関とクライアント証明書) TLS をオプションでサポートしています。

基本的な TLS 構成の例で、証明書が `certs` フォルダにあり、CA ファイル名が `CA.pem` の場合：

```ts
const client = createClient({
  url: 'https://<hostname>:<port>',
  username: '<username>',
  password: '<password>', // 必要な場合
  tls: {
    ca_cert: fs.readFileSync('certs/CA.pem'),
  },
})
```

クライアント証明書を使用した相互 TLS 構成の例：

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

[基本](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) および [相互](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS のフルサンプルは、リポジトリで確認できます。
### Keep-Alive configuration (Node.js only) {#keep-alive-configuration-nodejs-only}

クライアントは、基盤となる HTTP エージェントの Keep-Alive をデフォルトで有効にしており、接続されたソケットは後続のリクエストのために再利用され、`Connection: keep-alive` ヘッダーが送信されます。アイドル状態のソケットはデフォルトで 2500 ミリ秒間接続プールに残ります（このオプションの調整に関するノートを参照してください: ./js.md#adjusting-idle_socket_ttl）。

`keep_alive.idle_socket_ttl` の値は、サーバーおよび LB の構成よりもかなり低い必要があります。主な理由は、HTTP/1.1 がサーバーに通知せずにソケットを閉じることを許可しているためです。サーバーまたは負荷分散装置が、クライアントが実行する前に接続を閉じた場合、クライアントは閉じられたソケットを再利用しようとすることがあり、`socket hang up` エラーが発生する可能性があります。

`keep_alive.idle_socket_ttl` を変更する場合は、サーバーおよび LB Keep-Alive 構成と常に同期させ、その値を **常に低く** 保つ必要があります。これにより、サーバーがオープン接続を最初に閉じないことが保証されます。
#### Adjusting `idle_socket_ttl` {#adjusting-idle_socket_ttl}

クライアントは `keep_alive.idle_socket_ttl` を 2500 ミリ秒に設定しており、これは最も安全なデフォルトと見なされます。サーバー側で `keep_alive_timeout` が、ClickHouse バージョン 23.11 より前のバージョンでは [最小 3 秒](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1) に設定される場合があります。

:::warning
パフォーマンスに満足しており、問題が発生していない場合は、`keep_alive.idle_socket_ttl` 設定の値を **増やすことは推奨されません**。これにより、潜在的な「ソケットのハングアップ」エラーが発生する可能性があります。さらに、アプリケーションが多くのクエリを送信し、それらの間にダウンタイムがあまりなければ、デフォルト値で十分なはずです。ソケットは長時間アイドル状態にはならず、クライアントはそれらをプール内に留めるでしょう。
:::

HTTP サーバーの応答ヘッダーで適切な Keep-Alive タイムアウト値を確認するには、次のコマンドを実行します。

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

応答の `Connection` と `Keep-Alive` ヘッダーの値を確認します。たとえば：

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

この場合、`keep_alive_timeout` は 10 秒であり、アイドルソケットをデフォルトよりも長く開いておくために、`keep_alive.idle_socket_ttl` を 9000 または 9500 ミリ秒に増やすことを試みることができます。サーバーがクライアントよりも先に接続を閉じる際に発生する可能性のある「ソケットのハングアップ」エラーに注意し、エラーが消えるまで値を下げてください。
#### Keep-Alive トラブルシューティング {#keep-alive-troubleshooting}

`socket hang up` エラーが発生している場合、次のオプションでこの問題を解決できます:

* ClickHouse サーバーの設定で `keep_alive.idle_socket_ttl` の値を少し減らします。たとえば、クライアントとサーバー間のネットワーク遅延が高い場合など、`keep_alive.idle_socket_ttl` をさらに 200-500 ミリ秒減らすと、サーバーがクローズする予定のソケットを取得することを排除できます。

* このエラーが、データの入出力がない長時間実行されるクエリ（例えば、長時間実行される `INSERT FROM SELECT`）において発生する場合は、ロードバランサーがアイドル接続を閉じている可能性があります。長時間実行されるクエリ中にデータを強制的に入れるために、以下の ClickHouse 設定の組み合わせを試すことができます:

  ```ts
  const client = createClient({
    // ここでは、実行時間が 5 分を超えるクエリがあることを想定しています
    request_timeout: 400_000,
    /** これらの設定の組み合わせにより、データの入出力がない長時間実行クエリの LB タイムアウト問題を回避できます、
     *  例えば、`INSERT FROM SELECT` やその類似のもので、接続が LB によってアイドルとしてマークされて急に閉じられる場合があります。
     *  この場合、LB のアイドル接続タイムアウトが 120 秒であると仮定し、110 秒を「安全な」値として設定します。 */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: '110000', // UInt64, 文字列として渡す必要があります
    },
  })
  ```
  ただし、最近の Node.js バージョンでは受信ヘッダーの合計サイズに 16KB の制限があるため、受信する進捗ヘッダーの量が約 70-80 である場合、例外が生成されます。

  また、完全に異なるアプローチを使用し、ワイヤー上の待機時間を完全に回避することも可能です。これは、接続が失われた場合でも変異がキャンセルされないという HTTP インターフェースの「機能」を利用することで実現できます。詳細は [この例 (part 2)](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts) を参照してください。

* Keep-Alive 機能を完全に無効にすることもできます。この場合、クライアントはすべてのリクエストに `Connection: close` ヘッダーを追加し、基盤となる HTTP エージェントは接続を再利用しません。`keep_alive.idle_socket_ttl` 設定は無視され、アイドルソケットが存在しないため、追加のオーバーヘッドが発生し、リクエストごとに新しい接続が確立されます。

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```

### 読取専用ユーザー {#read-only-users}

[readonly=1 ユーザー](/operations/settings/permissions-for-queries#readonly) を使用してクライアントを利用する場合、`enable_http_compression` 設定が必要なため、レスポンス圧縮は有効化できません。以下の構成はエラーを引き起こします:

```ts
const client = createClient({
  compression: {
    response: true, // readonly=1 ユーザーでは動作しません
  },
})
```

readonly=1 ユーザーの制限の詳細は [この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts) を参照してください。

### パス名付きプロキシ {#proxy-with-a-pathname}

ClickHouse インスタンスがプロキシの背後にあり、たとえば http://proxy:8123/clickhouse_server のように URL にパス名が含まれている場合、`clickhouse_server` を `pathname` 設定オプションとして指定します（スラッシュあり、なしのいずれでも）。そうでない場合、`url` で直接指定された場合は `database` オプションとして扱われます。複数セグメントもサポートされています。例: `/my_proxy/db`。

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```

### 認証付きリバースプロキシ {#reverse-proxy-with-authentication}

ClickHouse デプロイメントの前に認証付きリバースプロキシがある場合、必要なヘッダーを提供するために `http_headers` 設定を使用できます:

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```

### カスタム HTTP/HTTPS エージェント (実験的、Node.js のみ) {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
これは実験的な機能であり、将来のリリースでは後方互換性のない方法で変更される可能性があります。クライアントが提供するデフォルトの実装と設定は、ほとんどのユースケースに対して十分であるはずです。この機能は、必要が確実な場合にのみ使用してください。
:::

デフォルトでは、クライアントはクライアント設定で提供された設定（例えば、`max_open_connections`、`keep_alive.enabled`、`tls`）を使用して基盤となる HTTP(S) エージェントを構成し、ClickHouse サーバーへの接続を扱います。さらに TLS 証明書が使用される場合、基盤のエージェントは必要な証明書で構成され、正しい TLS 認証ヘッダーが適用されます。

1.2.0 以降、カスタム HTTP(S) エージェントをクライアントに提供し、デフォルトの基盤エージェントを置き換えることが可能です。これは、複雑なネットワーク構成の場合に役立つかもしれません。カスタムエージェントが提供される場合、以下の条件が適用されます:
- `max_open_connections` および `tls` オプションは _無視され_、クライアントによって無視されます。これは基盤エージェント設定の一部です。
- `keep_alive.enabled` は `Connection` ヘッダーのデフォルト値を規制するだけです（`true` -> `Connection: keep-alive`、`false` -> `Connection: close`）。
- アイドル Keep-Alive ソケット管理は引き続き機能します（これはエージェントに結びついておらず、特定のソケット自体に結びついています）が、`keep_alive.idle_socket_ttl` の値を `0` に設定することで完全に無効にすることが可能です。

#### カスタムエージェントの使用例 {#custom-agent-usage-examples}

証明書なしでカスタム HTTP(S) エージェントを使用する:

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

基本的な TLS および CA 証明書を使用したカスタム HTTPS エージェント:

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
  // カスタム HTTPS エージェントを使用すると、クライアントはデフォルトの HTTPS 接続実装を使用しません。ヘッダーは手動で提供する必要があります
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
  },
  // 重要: 認証ヘッダーは TLS ヘッダーと競合します。無効にしてください。
  set_basic_auth_header: false,
})
```

相互 TLS を使用したカスタム HTTPS エージェント:

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
  // カスタム HTTPS エージェントを使用すると、クライアントはデフォルトの HTTPS 接続実装を使用しません。ヘッダーは手動で提供する必要があります
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
    'X-ClickHouse-SSL-Certificate-Auth': 'on',
  },
  // 重要: 認証ヘッダーは TLS ヘッダーと競合します。無効にしてください。
  set_basic_auth_header: false,
})
```

証明書 _と_ カスタム _HTTPS_ エージェントを使用する場合、デフォルトの認証ヘッダーを `set_basic_auth_header` 設定（1.2.0 で導入）で無効にする必要がある可能性があります。これは、TLS ヘッダーと競合するためです。すべての TLS ヘッダーは手動で提供する必要があります。

## 既知の制限 (Node.js/Web) {#known-limitations-nodejsweb}

- 結果セットに対するデータマッパーは存在しないため、言語のプリミティブのみが使用されます。特定のデータ型マッパーは [RowBinary 形式サポート](https://github.com/ClickHouse/clickhouse-js/issues/216) を計画しています。
- 一部の [Decimal* および Date* / DateTime* データ型の注意点](./js.md#datedate32-types-caveats) があります。
- JSON* ファミリ形式を使用する際、Int32 より大きい数値は文字列として表現され、Int64+ 型の最大値は `Number.MAX_SAFE_INTEGER` より大きいためです。詳細については [整数型](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) セクションを参照してください。

## 既知の制限 (Web) {#known-limitations-web}

- Select クエリのストリーミングは機能しますが、挿入には無効です（タイプレベルでも同様）。
- リクエスト圧縮は無効で構成は無視されます。レスポンス圧縮は機能します。
- まだログサポートはありません。

## パフォーマンス最適化のためのヒント {#tips-for-performance-optimizations}

- アプリケーションのメモリ消費を減らすには、大規模な挿入（ファイルからの挿入など）および選択時にストリームを使用することを検討してください。イベントリスナーや同様のユースケースには、[非同期挿入](/optimize/asynchronous-inserts) がもう一つの良いオプションとなり、クライアント側でのバッチ処理を最小限に抑えるか、完全に回避することができます。非同期挿入の例は [クライアントリポジトリ](https://github.com/ClickHouse/clickhouse-js/tree/main/examples) にあり、ファイル名のプレフィックスは `async_insert_` です。
- クライアントはデフォルトでリクエストまたはレスポンスの圧縮を有効にしません。ただし、大規模なデータセットを選択または挿入する際に、`ClickHouseClientConfigOptions.compression` を介して圧縮を有効にすることを検討できます（`request` または `response`、またはその両方のために）。
- 圧縮には重大なパフォーマンスペナルティがあります。`request` または `response` の圧縮を有効にすると、それぞれ選択または挿入の速度に悪影響を及ぼしますが、アプリケーションによって転送されるネットワークトラフィックの量が削減されます。

## お問い合わせ {#contact-us}

質問がある場合やサポートが必要な場合は、[Community Slack](https://clickhouse.com/slack) (`#clickhouse-js` チャンネル) または [GitHub issues](https://github.com/ClickHouse/clickhouse-js/issues) を通じてお気軽にお問い合わせください。
