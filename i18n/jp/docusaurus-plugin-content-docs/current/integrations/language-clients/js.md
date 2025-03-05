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
このクライアントはTypeScriptで書かれており、クライアントの公開APIに対する型定義を提供します。

依存関係はなく、最大のパフォーマンスに最適化されており、さまざまなClickHouseのバージョンおよび構成（オンプレミスのシングルノード、オンプレミスのクラスター、ClickHouse Cloud）でテストされています。

さまざまな環境用に2つの異なるバージョンのクライアントがあります：
- `@clickhouse/client` - Node.js専用
- `@clickhouse/client-web` - ブラウザ（Chrome/Firefox）、Cloudflareワーカー

TypeScriptを使用する場合は、少なくとも[バージョン4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)であることを確認してください。このバージョンでは[インラインインポートおよびエクスポート構文](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)が有効になります。

クライアントのソースコードは[ClickHouse-JS GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-js)で入手できます。
## 環境要件 (Node.js) {#environment-requirements-nodejs}

クライアントを実行するためには、環境にNode.jsが必要です。  
クライアントはすべての[メンテナンスされている](https://github.com/nodejs/release#readme)Node.jsリリースと互換性があります。

Node.jsのバージョンがエンドオブライフに近づくと、クライアントはそのサポートを終了します。これは時代遅れであり、安全でないと見なされるためです。

現在のNode.jsバージョンのサポート状況：

| Node.jsバージョン | サポート状況  |
|-------------------|----------------|
| 22.x              | ✔              |
| 20.x              | ✔              |
| 18.x              | ✔              |
| 16.x              | ベストエフォート |
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

| クライアントバージョン | ClickHouse   |
|-----------------------|--------------|
| 1.8.0                | 23.3+        |

おそらくクライアントは古いバージョンでも動作しますが、これはベストエフォートのサポートであり、保証はされません。ClickHouseのバージョンが23.3未満の場合は、[ClickHouseのセキュリティポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)を参照し、アップグレードを検討してください。
## 例 {#examples}

クライアントの使用に関するさまざまなシナリオを、クライアントリポジトリの[例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples)でカバーすることを目指しています。

概要は[例のREADME](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview)で入手可能です。

例や以下のドキュメントに不明瞭な点や欠落がある場合は、[お問い合わせ](./js.md#contact-us)ください。
### クライアントAPI {#client-api}

ほとんどの例は、明示的に異なると記載されていない限り、Node.jsおよびWebバージョンのクライアントの両方と互換性があります。
#### クライアントインスタンスの作成 {#creating-a-client-instance}

`createClient`ファクトリーを使用して、必要なだけのクライアントインスタンスを作成できます：

```ts
import { createClient } from '@clickhouse/client' // または '@clickhouse/client-web'

const client = createClient({
  /* 設定 */
})
```

環境がESMモジュールをサポートしていない場合は、代わりにCJS構文を使用できます：

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* 設定 */
})
```

クライアントインスタンスは、インスタンス化中に[事前設定](./js.md#configuration)できます。
#### 設定 {#configuration}

クライアントインスタンスを作成する際に、以下の接続設定を調整できます：

| 設定                                                                | 説明                                                                           | デフォルト値            | その他                                                                                                                  |
|-------------------------------------------------------------------|--------------------------------------------------------------------------------|-----------------------|----------------------------------------------------------------------------------------------------------------------|
| **url**?: string                                                   | ClickHouseインスタンスのURL。                                                  | `http://localhost:8123` | [URL設定ドキュメント](./js.md#url-configuration)                                                                     |
| **pathname**?: string                                              | クライアントがクリックハウスのURLを解析した後に追加するオプションのパス名。       | `''`                     | [パス名付きプロキシに関するドキュメント](./js.md#proxy-with-a-pathname)                                              |
| **request_timeout**?: number                                       | リクエストのタイムアウト（ミリ秒）。                                           | `30_000`               | -                                                                                                                    |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }` | 圧縮を有効にする。                                                             | -                     | [圧縮に関するドキュメント](./js.md#compression)                                                                     |
| **username**?: string                                              | リクエストを行うユーザーの名前。                                               | `default`              | -                                                                                                                    |
| **password**?: string                                              | ユーザーパスワード。                                                           | `''`                    | -                                                                                                                    |
| **application**?: string                                           | Node.jsクライアントを使用するアプリケーションの名前。                          | `clickhouse-js`        | -                                                                                                                    |
| **database**?: string                                              | 使用するデータベース名。                                                       | `default`              | -                                                                                                                    |
| **clickhouse_settings**?: ClickHouseSettings                       | すべてのリクエストに適用するClickHouseの設定。                                  | `{}`                   | -                                                                                                                    |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 内部クライアントログの設定。                                                    | -                     | [ログに関するドキュメント](./js.md#logging-nodejs-only)                                                               |
| **session_id**?: string                                            | 各リクエストと共に送信するオプションのClickHouseセッションID。                  | -                     | -                                                                                                                    |
| **keep_alive**?: `{ **enabled**?: boolean }`                      | Node.jsおよびWebバージョンの両方でデフォルトで有効。                           | -                     | -                                                                                                                    |
| **http_headers**?: `Record<string, string>`                        | ClickHouseに送信するリクエストに対する追加のHTTPヘッダー。                     | -                     | [認証付きリバースプロキシに関するドキュメント](./js.md#reverse-proxy-with-authentication)                                |
| **roles**?: string \|  string[]                                    | 出力リクエストに添付するClickHouseの役割名。                                    | -                     | [HTTPインターフェースでの役割の使用](/interfaces/http#setting-role-with-query-parameters)                          |
#### Node.js専用の設定パラメータ {#nodejs-specific-configuration-parameters}

| 設定                                                                  | 説明                                                       | デフォルト値 | その他                                                                                             |
|----------------------------------------------------------------------|-----------------------------------------------------------|---------------|------------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                    | ホストごとに許可される接続されたソケットの最大数。         | `10`          | -                                                                                                    |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`   | TLS証明書を構成します。                                | -             | [TLSに関するドキュメント](./js.md#tls-certificates-nodejs-only)                                       |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                         | -             | [Keep Aliveに関するドキュメント](./js.md#keep-alive-configuration-nodejs-only)                       |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>     | クライアント用のカスタムHTTPエージェント。                 | -             | [HTTPエージェントに関するドキュメント](./js.md#custom-httphttps-agent-experimental-nodejs-only)   |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>        | 基本認証情報で`Authorization`ヘッダーを設定します。       | `true`        | [HTTPエージェントドキュメントでのこの設定の使用](./js.md#custom-httphttps-agent-experimental-nodejs-only) |
### URL設定 {#url-configuration}

:::important
URL設定は常にハードコードされた値を上書きし、この場合は警告がログに記録されます。
:::

ほとんどのクライアントインスタンスパラメータはURLで構成可能です。URLの形式は`http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`です。ほとんどの場合、特定のパラメータ名はそのパスが設定オプションインターフェースでの位置を反映しており、いくつかの例外があります。次のパラメータがサポートされています：

| パラメータ                                   | タイプ                                                   |
|--------------------------------------------|--------------------------------------------------------|
| `pathname`                                 | 任意の文字列。                                         |
| `application_id`                           | 任意の文字列。                                         |
| `session_id`                               | 任意の文字列。                                         |
| `request_timeout`                          | 非負の数。                                             |
| `max_open_connections`                     | 非負の数、ゼロより大きい。                            |
| `compression_request`                      | boolean。以下を参照（1）                               |
| `compression_response`                     | boolean。                                             |
| `log_level`                                | 許可されている値：`OFF`、`TRACE`、`DEBUG`、`INFO`、`WARN`、`ERROR`。 |
| `keep_alive_enabled`                       | boolean。                                             |
| `clickhouse_setting_*`または`ch_*`         | 以下を参照（2）                                       |
| (Node.js専用)`keep_alive_idle_socket_ttl` | 非負の数。                                             |

- (1) booleanの場合、有効な値は`true`/`1`および`false`/`0`です。
- (2) `clickhouse_setting_`または`ch_`で始まる任意のパラメータは、このプレフィックスが削除され、残りがクライアントの`clickhouse_settings`に追加されます。たとえば、`?ch_async_insert=1&ch_wait_for_async_insert=1`は次のようになります：

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

注意：`clickhouse_settings`のboolean値は、URLで`1`/`0`として渡す必要があります。

- (3) (2)と似ていますが、`http_header`設定用です。たとえば、`?http_header_x-clickhouse-auth=foobar`は次のようになります：

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```
### 接続 {#connecting}
#### 接続情報の収集 {#gather-your-connection-details}

<ConnectionDetails />
#### 接続概要 {#connection-overview}

クライアントはHTTP(S)プロトコルを介して接続を実装しています。RowBinaryのサポートは進行中で、[関連する問題](https://github.com/ClickHouse/clickhouse-js/issues/216)が参照できます。

以下の例は、ClickHouse Cloudへの接続を設定する方法を示しています。環境変数を介して`url`（プロトコルとポートを含む）および`password`の値が指定され、`default`ユーザーが使用されると仮定しています。

**例:** 環境変数を使用してNode.jsクライアントインスタンスを作成します。

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

クライアントリポジトリには、環境変数を使用した複数の例が含まれており、たとえば[ClickHouse Cloudでのテーブル作成](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)や、[非同期挿入の使用](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts)、そして他にもいくつかあります。
#### 接続プール (Node.js専用) {#connection-pool-nodejs-only}

リクエストごとに接続を確立するオーバーヘッドを避けるために、クライアントはClickHouseへの接続プールを作成して再利用します。Keep-Aliveメカニズムを利用しています。デフォルトではKeep-Aliveが有効で、接続プールのサイズは`10`に設定されていますが、`max_open_connections` [設定オプション](./js.md#configuration)で変更できます。

ユーザーが`max_open_connections: 1`を設定しない限り、プール内の同じ接続がその後のクエリで使用される保証はありません。これは滅多に必要ありませんが、ユーザーが一時テーブルを使用している場合には必要な場合があります。

また、[Keep-Alive設定](./js.md#keep-alive-configuration-nodejs-only)も参照してください。
### クエリID {#query-id}

クエリまたはステートメント（`command`、`exec`、`insert`、`select`）を送信するすべてのメソッドは、結果に`query_id`を提供します。このユニークな識別子は、クライアントがクエリごとに割り当て、[サーバー設定](/operations/server-configuration-parameters/settings)で有効になっている場合は`system.query_log`からデータを取得するのに役立ちます。また、長時間実行されているクエリをキャンセルするためにも使用できます（[例を参照](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)）。必要に応じて、ユーザーは`command`/`query`/`exec`/`insert`メソッドのパラメータで`query_id`を上書きすることができます。

:::tip
`query_id`パラメータを上書きする場合は、各呼び出しに対して一意であることを確認する必要があります。ランダムUUIDが良い選択です。
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
  // query_idの上書き；指定しない場合、ランダムな識別子が自動的に生成されます。
  query_id?: string
  // session_idの上書き；指定しない場合、セッションIDはクライアント設定から取得されます。
  session_id?: string
  // 認証情報の上書き；指定しない場合、クライアントの認証情報が使用されます。
  auth?: { username: string, password: string }
  // このクエリで使用する役割の特定の一覧。クライアント設定で設定した役割を上書きします。
  role?: string | Array<string>
}
```
### クエリメソッド {#query-method}

これは、`SELECT`のように応答を持つ可能性のあるほとんどの文や、`CREATE TABLE`のようなDDLを送信するために使用され、awaitする必要があります。返される結果セットは、アプリケーションで消費することが期待されています。

:::note
データ挿入用の専用メソッド[insert](./js.md#insert-method)およびDDL用の[command](./js.md#command-method)があります。
:::

```ts
interface QueryParams extends BaseQueryParams {
  // データを返す可能性のある実行するクエリ。
  query: string
  // 結果データセットの形式。デフォルト：JSON。
  format?: DataFormat
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>
}
```

他にも、[すべてのクライアントメソッドのベースパラメータ](./js.md#base-parameters-for-all-client-methods)も参照してください。

:::tip
`query`にFORMAT句を指定しないでください。代わりに`format`パラメータを使用してください。
:::
#### 結果セットと行の抽象化 {#result-set-and-row-abstractions}

`ResultSet`は、アプリケーションでのデータ処理のための便利なメソッドをいくつか提供します。

Node.jsの`ResultSet`実装は`Stream.Readable`を使用していますが、Web版はWeb APIの`ReadableStream`を使用しています。

`ResultSet`は、`ResultSet`上で`text`または`json`メソッドを呼び出すことで消費でき、クエリによって返されたすべての行をメモリにロードします。

`ResultSet`は可能な限り早く消費を開始する必要があります。なぜなら、これによって応答ストリームがオープンされたままとなり、したがって基盤となる接続がビジーになります。クライアントは、アプリケーションによる潜在的な過剰なメモリ使用を避けるために、受信データをバッファリングしません。

代わりに、メモリに一度に収まらないほど大きい場合は、`stream`メソッドを呼び出してストリーミングモードでデータを処理できます。応答の各チャンクは、代わりに比較的小さな行の配列に変換されます（この配列のサイズは、サーバーからクライアントが受信する特定のチャンクのサイズによって変わり、個々の行のサイズにも依存します）。 

どのデータ形式があなたのケースにとって最適かを判断するためには、[サポートされているデータ形式のリスト](./js.md#supported-data-formats)を参照してください。たとえば、JSONオブジェクトをストリーミングしたい場合は、[JSONEachRow](/sql-reference/formats#jsoneachrow)を選択できます。この場合、各行はJSオブジェクトとして解析されます。または、よりコンパクトな[JSONCompactColumns](/sql-reference/formats#jsoncompactcolumns)形式を選ぶこともできます。この場合、各行は値のコンパクトな配列になります。ストリーミングファイルについても参照してください。[Node.js専用のストリーミングファイル](./js.md#streaming-files-nodejs-only)。

:::important
`ResultSet`またはそのストリームが完全に消費されない場合、非稼働の`request_timeout`期間が過ぎた後に破棄されます。
:::

```ts
interface BaseResultSet<Stream> {
  // 上記の「クエリID」セクションを参照
  query_id: string

  // ストリーム全体を消費し、内容を文字列として取得します
  // 任意のDataFormatで使用できます
  // 一度だけ呼び出すべきです
  text(): Promise<string>

  // ストリーム全体を消費し、内容をJSオブジェクトとして解析します
  // JSON形式のみに使用できます
  // 一度だけ呼び出すべきです
  json<T>(): Promise<T>

  // ストリーミング可能な応答用の読み取り可能なストリームを返します
  // ストリームの各反復では、選択したDataFormatでのRow[]の配列を提供します
  // 一度だけ呼び出すべきです
  stream(): Stream
}

interface Row {
  // 行の内容をプレーンな文字列として取得します
  text: string

  // 行の内容をJSオブジェクトとして解析します
  json<T>(): T
}
```

**例:** (Node.js/Web) `JSONEachRow`形式でのデータセットを持つクエリ。ストリーム全体を消費し、その内容をJSオブジェクトとして解析します。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // またはパースを避けるために`row.text`を使用する
```

**例:** (Node.js専用) `JSONEachRow`形式でのストリーミングクエリ結果。クラシックな`on('data')`アプローチを使用します。これは`for await const`構文と置き換え可能です。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // またはJSONCompactEachRow、JSONStringsEachRowなど
})
const stream = rows.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.json()) // またはパースを避けるために`row.text`を使用する
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('完了!')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**例:** (Node.js専用) `CSV`形式でのストリーミングクエリ結果。クラシックな`on('data')`アプローチを使用します。これは`for await const`構文と置き換え可能です。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'CSV', // またはTabSeparated、CustomSeparatedなど
})
const stream = resultSet.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.text)
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('完了!')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**例:** (Node.js専用) `JSONEachRow`形式でJSオブジェクトとしてのストリーミングクエリ結果を、`for await const`構文を使用して消費します。これはクラシックな`on('data')`アプローチと置き換え可能です。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers LIMIT 10',
  format: 'JSONEachRow', // またはJSONCompactEachRow、JSONStringsEachRowなど
})
for await (const rows of resultSet.stream()) {
  rows.forEach(row => {
    console.log(row.json())
  })
}
```

:::note
`for await const`構文は、`on('data')`アプローチよりもコード量が少なくなりますが、パフォーマンスに悪影響を及ぼす可能性があります。詳しくは、[Node.jsリポジトリのこの問題](https://github.com/nodejs/node/issues/31979)を参照してください。
:::

**例:** (Web専用) オブジェクトの`ReadableStream`を反復処理します。

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

これはデータ挿入用の主要なメソッドです。

```ts
export interface InsertResult {
  query_id: string
  executed: boolean
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

戻り値の型は最小限で、サーバーからデータが返されることは期待しておらず、応答ストリームを即座に消費します。

挿入メソッドに空の配列が提供された場合、挿入ステートメントはサーバーに送信されず、その代わりにメソッドはすぐに`{ query_id: '...', executed: false }`で解決されます。この場合、もし`query_id`がメソッドパラメータに提供されていなければ、結果の中の値は空の文字列になります。これは、クライアントによって生成されたランダムUUIDを返すことが混乱を招く可能性があるためです。そのため、このような`query_id`を持つクエリは`system.query_log`テーブルに存在しません。

挿入ステートメントがサーバーに送信された場合、`executed`フラグは`true`になります。
#### Insert method and streaming in Node.js {#insert-method-and-streaming-in-nodejs}

`Stream.Readable` または プレイン `Array<T>` と連携可能で、これは `insert` メソッドに指定された [データフォーマット](./js.md#supported-data-formats) に依存します。また、[ファイルストリーミング](./js.md#streaming-files-nodejs-only)に関するこのセクションも参照してください。

Insert メソッドは await されるべきですが、入力ストリームを指定した後、ストリーム完了時に `insert` 操作を await することも可能です（これにより `insert` プロミスも解決します）。これはイベントリスナーや同様のシナリオにおいて便利かもしれませんが、クライアント側で多くのエッジケースを伴うエラーハンドリングは、やや非トリビアルです。代わりに、[非同期挿入](/optimize/asynchronous-inserts) の使用を検討してください。[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts)に示されています。

:::tip
このメソッドでモデル化するのが難しいカスタム INSERT ステートメントがある場合、[コマンドメソッド](./js.md#command-method)の使用を検討してください。

[INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) や [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) の例での使用方法を参照できます。
:::

```ts
interface InsertParams<T> extends BaseQueryParams {
  // データを挿入するテーブル名
  table: string
  // 挿入するデータセット
  values: ReadonlyArray<T> | Stream.Readable
  // 挿入するデータセットのフォーマット
  format?: DataFormat
  // データが挿入されるカラムを指定することを許可します。
  // - `['a', 'b']`のような配列は: `INSERT INTO table (a, b) FORMAT DataFormat` を生成します。
  // - `{ except: ['a', 'b'] }`のようなオブジェクトは: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat` を生成します。
  // デフォルトでは、データはテーブルのすべてのカラムに挿入され、
  // 生成されるステートメントは: `INSERT INTO table FORMAT DataFormat` になります。
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

他のお知らせ: [すべてのクライアントメソッドのための基本パラメータ](./js.md#base-parameters-for-all-client-methods)。

:::important
`abort_signal` でキャンセルされたリクエストは、サーバーがキャンセル前にストリーミングデータの一部を受信している可能性があるため、データの挿入が行われていないことを保証しません。
:::

**例:** (Node.js/Web) 値の配列を挿入します。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
await client.insert({
  table: 'my_table',
  // 構造はこの例の JSONEachRow フォーマットと一致すべきです
  values: [
    { id: 42, name: 'foo' },
    { id: 42, name: 'bar' },
  ],
  format: 'JSONEachRow',
})
```

**例:** (Node.js のみ) CSV ファイルからのストリームを挿入します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。 また、[ファイルストリーミング](./js.md#streaming-files-nodejs-only)も参照してください。

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**例**: 挿入ステートメントから特定のカラムを除外します。

次のようなテーブル定義があるとします:

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

特定のカラムのみを挿入します:

```ts
// 生成されるステートメント: INSERT INTO mytable (message) FORMAT JSONEachRow
await client.insert({
  table: 'mytable',
  values: [{ message: 'foo' }],
  format: 'JSONEachRow',
  // この行の `id` カラム値はゼロ（UInt32 のデフォルト）
  columns: ['message'],
})
```

特定のカラムを除外します:

```ts
// 生成されるステートメント: INSERT INTO mytable (* EXCEPT (message)) FORMAT JSONEachRow
await client.insert({
  table: tableName,
  values: [{ id: 144 }],
  format: 'JSONEachRow',
  // この行の `message` カラム値は空文字列
  columns: {
    except: ['message'],
  },
})
```

詳細については、[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts)を参照してください。

**例**: クライアントインスタンスに提供されたのとは異なるデータベースに挿入します。 [ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: 'mydb.mytable', // データベースを含む完全修飾名
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```
#### Web version limitations {#web-version-limitations}

現在、`@clickhouse/client-web` での挿入は、`Array<T>` と `JSON*` フォーマットのみで機能します。
ストリームの挿入は、ブラウザの互換性が悪いため、ウェブ版ではまだサポートされていません。

そのため、ウェブ版の `InsertParams` インターフェイスは Node.js 版とは少し異なります。 
`values` は `ReadonlyArray<T>` 型のみに制限されます:

```ts
interface InsertParams<T> extends BaseQueryParams {
  // データを挿入するテーブル名
  table: string
  // 挿入するデータセット
  values: ReadonlyArray<T>
  // 挿入するデータセットのフォーマット
  format?: DataFormat
  // データが挿入されるカラムを指定することを許可します。
  // - `['a', 'b']`のような配列は: `INSERT INTO table (a, b) FORMAT DataFormat` を生成します。
  // - `{ except: ['a', 'b'] }`のようなオブジェクトは: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat` を生成します。
  // デフォルトでは、データはテーブルのすべてのカラムに挿入され、
  // 生成されるステートメントは: `INSERT INTO table FORMAT DataFormat` になります。
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

これは将来的に変更される可能性があります。他のお知らせ: [すべてのクライアントメソッドのための基本パラメータ](./js.md#base-parameters-for-all-client-methods)。
### Command method {#command-method}

出力のないステートメント、フォーマット句が適用できない場合、またはレスポンスにまったく興味がない場合に使用できます。そのようなステートメントの例は `CREATE TABLE` または `ALTER TABLE` です。

await されるべきです。

レスポンスストリームは即座に破棄されるため、基盤となるソケットは解放されます。

```ts
interface CommandParams extends BaseQueryParams {
  // 実行するステートメント。
  query: string
}

interface CommandResult {
  query_id: string
}

interface ClickHouseClient {
  command(params: CommandParams): Promise<CommandResult>
}
```

他のお知らせ: [すべてのクライアントメソッドのための基本パラメータ](./js.md#base-parameters-for-all-client-methods)。

**例:** (Node.js/Web) ClickHouse Cloud にテーブルを作成します。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)。

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // クラスタ使用時には、クエリ処理エラーが発生した後の状況を避けるため推奨されます。
  // すでにレスポンスコードがクライアントに送信され、HTTP ヘッダーも送信されました。
  // 詳細については、https://clickhouse.com/docs/interfaces/http/#response-buffering を参照してください。
  clickhouse_settings: {
    wait_end_of_query: 1,
  },
})
```

**例:** (Node.js/Web) セルフホスト ClickHouse インスタンスにテーブルを作成します。 
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

**例:** (Node.js/Web) SELECT から INSERT します。

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`,
})
```

:::important
`abort_signal` でキャンセルされたリクエストは、サーバーでステートメントが実行されなかったことを保証しません。
:::
### Exec method {#exec-method}

`query` / `insert` に収まらないカスタムクエリがあり、結果に関心がある場合は、`command` の代わりに `exec` を使用できます。

`exec` は読み取り可能なストリームを返しますが、これはアプリケーション側で消費または破棄されなければなりません。

```ts
interface ExecParams extends BaseQueryParams {
  // 実行するステートメント。
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

他のお知らせ: [すべてのクライアントメソッドのための基本パラメータ](./js.md#base-parameters-for-all-client-methods)。

ストリームの戻り型は、Node.js とウェブ版で異なります。

Node.js:

```ts
export interface QueryResult {
  stream: Stream.Readable
  query_id: string
}
```

ウェブ:

```ts
export interface QueryResult {
  stream: ReadableStream
  query_id: string
}
```
### Ping {#ping}

接続状況を確認するために提供された `ping` メソッドは、サーバーに到達可能な場合は `true` を返します。

サーバーに到達できない場合、基盤となるエラーが結果に含まれます。

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }

interface ClickHouseClient {
  ping(): Promise<PingResult>
}
```

Ping は、特に ClickHouse Cloud でインスタンスがアイドリングしており、Ping の後に起動するため、アプリケーション開始時にサーバーが利用可能かどうかを確認するための便利なツールです。

**例:** (Node.js/Web) ClickHouse サーバーインスタンスに Ping を送信します。NB: ウェブバージョンでは、キャプチャされたエラーは異なる場合があります。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // process result.error
}
```

NB: `/ping` エンドポイントが CORS を実装していないため、ウェブ版はシンプルな `SELECT 1` を使用して同様の結果を達成します。
### Close (Node.js only) {#close-nodejs-only}

すべてのオープン接続を閉じ、リソースを解放します。ウェブ版では何も実行しません。

```ts
await client.close()
```
## Streaming files (Node.js only) {#streaming-files-nodejs-only}

クライアントリポジトリ内には、一般的なデータフォーマット (NDJSON, CSV, Parquet) を使用したいくつかのファイルストリーミングの例があります。

- [NDJSON ファイルからストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [CSV ファイルからストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Parquet ファイルからストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Parquet ファイルにストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

他のフォーマットをファイルにストリーミングするのも Parquet に似た手法で行うことができ、唯一の違いは `query` コールに使用されるフォーマット（`JSONEachRow`, `CSV`, など）と出力ファイル名になります。
## Supported Data formats {#supported-data-formats}

クライアントは、データフォーマットを JSON またはテキストとして処理します。

もし `format` に JSON ファミリーのいずれかを指定すると (`JSONEachRow`, `JSONCompactEachRow`, など)、クライアントは通信中にデータをシリアライズおよびデシリアライズします。

"生" テキストフォーマット（`CSV`、`TabSeparated` と `CustomSeparated` ファミリー）のデータは、追加の変換なしに通信されます。

:::tip
JSONが一般的なフォーマットとして混同されることがあるため、[ClickHouse JSON フォーマット](/sql-reference/formats#json)を参照してください。

クライアントは、[JSONEachRow](/sql-reference/formats#jsoneachrow)などのフォーマットを使用してJSONオブジェクトをストリーミングすることをサポートしています（他のストリーミングに適したフォーマットについては、テーブルの概要を参照してください。また、クライアントリポジトリの `select_streaming_` [例](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)も参照）。 

ただし、[ClickHouse JSON](/sql-reference/formats#json) やその他のいくつかのフォーマットは、レスポンス内で単一のオブジェクトとして表され、クライアントによってストリーミングされることはありません。
:::

| フォーマット                           | 入力 (配列) | 入力 (オブジェクト) | 入力/出力 (ストリーム) | 出力 (JSON) | 出力 (テキスト)  |
|----------------------------------------|-------------|---------------------|------------------------|-------------|------------------|
| JSON                                   | ❌          | ✔️                  | ❌                    | ✔️          | ✔️               |
| JSONCompact                            | ❌          | ✔️                  | ❌                    | ✔️          | ✔️               |
| JSONObjectEachRow                      | ❌          | ✔️                  | ❌                    | ✔️          | ✔️               |
| JSONColumnsWithMetadata                | ❌          | ✔️                  | ❌                    | ✔️          | ✔️               |
| JSONStrings                            | ❌          | ❌                  | ❌                    | ✔️          | ✔️               |
| JSONCompactStrings                    | ❌          | ❌                  | ❌                    | ✔️          | ✔️               |
| JSONEachRow                            | ✔️          | ❌                  | ✔️                    | ✔️          | ✔️               |
| JSONEachRowWithProgress                | ❌          | ❌                  | ✔️ ❗- 下記を参照      | ✔️          | ✔️               |
| JSONStringsEachRow                     | ✔️          | ❌                  | ✔️                    | ✔️          | ✔️               |
| JSONCompactEachRow                     | ✔️          | ❌                  | ✔️                    | ✔️          | ✔️               |
| JSONCompactStringsEachRow              | ✔️          | ❌                  | ✔️                    | ✔️          | ✔️               |
| JSONCompactEachRowWithNames            | ✔️          | ❌                  | ✔️                    | ✔️          | ✔️               |
| JSONCompactEachRowWithNamesAndTypes    | ✔️          | ❌                  | ✔️                    | ✔️          | ✔️               |
| JSONCompactStringsEachRowWithNames     | ✔️          | ❌                  | ✔️                    | ✔️          | ✔️               |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔️      | ❌                  | ✔️                    | ✔️          | ✔️               |
| CSV                                    | ❌          | ❌                  | ✔️                    | ❌          | ✔️               |
| CSVWithNames                           | ❌          | ❌                  | ✔️                    | ❌          | ✔️               |
| CSVWithNamesAndTypes                   | ❌          | ❌                  | ✔️                    | ❌          | ✔️               |
| TabSeparated                           | ❌          | ❌                  | ✔️                    | ❌          | ✔️               |
| TabSeparatedRaw                        | ❌          | ❌                  | ✔️                    | ❌          | ✔️               |
| TabSeparatedWithNames                  | ❌          | ❌                  | ✔️                    | ❌          | ✔️               |
| TabSeparatedWithNamesAndTypes          | ❌          | ❌                  | ✔️                    | ❌          | ✔️               |
| CustomSeparated                        | ❌          | ❌                  | ✔️                    | ❌          | ✔️               |
| CustomSeparatedWithNames               | ❌          | ❌                  | ✔️                    | ❌          | ✔️               |
| CustomSeparatedWithNamesAndTypes       | ❌          | ❌                  | ✔️                    | ❌          | ✔️               |
| Parquet                                | ❌          | ❌                  | ✔️                    | ❌          | ✔️❗- 下記を参照 |

Parquet の場合、選択の主な用途は、結果のストリームをファイルに書き込むことになるでしょう。クライアントリポジトリ内の[例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)を参照してください。

`JSONEachRowWithProgress` は、ストリーム内での進捗報告をサポートする出力専用フォーマットです。詳細については[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)を参照してください。

ClickHouse の入力および出力フォーマットの全リストは、[こちら](./sql-reference/data-types/)で利用可能です。
## Supported ClickHouse data types {#supported-clickhouse-data-types}

:::note
関連する JS タイプは、すべての `JSON*` フォーマットに関連していますが、文字列としてすべてを表すフォーマット (例: `JSONStringEachRow`) はこの限りではありません。
:::

| タイプ                 | ステータス        | JS タイプ                  |
|------------------------|------------------|----------------------------|
| UInt8/16/32            | ✔️               | number                     |
| UInt64/128/256         | ✔️ ❗- 下記参照  | string                     |
| Int8/16/32             | ✔️               | number                     |
| Int64/128/256          | ✔️ ❗- 下記参照  | string                     |
| Float32/64             | ✔️               | number                     |
| Decimal                | ✔️ ❗- 下記参照  | number                     |
| Boolean                | ✔️               | boolean                    |
| String                 | ✔️               | string                     |
| FixedString            | ✔️               | string                     |
| UUID                   | ✔️               | string                     |
| Date32/64              | ✔️               | string                     |
| DateTime32/64          | ✔️ ❗- 下記参照  | string                     |
| Enum                   | ✔️               | string                     |
| LowCardinality         | ✔️               | string                     |
| Array(T)               | ✔️               | T[]                        |
| (new) JSON             | ✔️               | object                     |
| Variant(T1, T2...)     | ✔️               | T (バリアントに依存)      |
| Dynamic                | ✔️               | T (バリアントに依存)      |
| Nested                 | ✔️               | T[]                        |
| Tuple                  | ✔️               | Tuple                      |
| Nullable(T)            | ✔️               | T 用の JS タイプまたは null |
| IPv4                   | ✔️               | string                     |
| IPv6                   | ✔️               | string                     |
| Point                  | ✔️               | [ number, number ]         |
| Ring                   | ✔️               | Array&lt;Point\>          |
| Polygon                | ✔️               | Array&lt;Ring\>           |
| MultiPolygon           | ✔️               | Array&lt;Polygon\>        |
| Map(K, V)              | ✔️               | Record&lt;K, V\>          |

ClickHouse のサポートされている形式の全リストは、[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts)で利用可能です。
### Date/Date32 types caveats {#datedate32-types-caveats}

クライアントは値を追加の型変換なしで挿入するため、`Date` / `Date32` 型のカラムは文字列としてのみ挿入できます。

**例:** `Date` 型の値を挿入します。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)。

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

ただし、`DateTime` または `DateTime64` カラムを使用している場合は、文字列と JS Date オブジェクトの両方を使用できます。JS Date オブジェクトは、`date_time_input_format` を `best_effort` に設定して、`insert` にそのまま渡すことができます。詳細については、この[例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts)を参照してください。
### Decimal\* types caveats {#decimal-types-caveats}

`JSON*` ファミリーのフォーマットを使用して Decimals を挿入することが可能です。次のようなテーブルが定義されていると仮定します:

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

値を文字列表現を用いて精度損失なしに挿入することができます:

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

ただし、`JSON*` フォーマットでデータを問い合わせると、ClickHouse はデフォルトでは Decimals を _数値_ として返すため、精度が失われる可能性があります。これを避けるために、クエリで Decimals を文字列に変換することができます:

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

詳細については、[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts)を参照してください。
### Integral types: Int64, Int128, Int256, UInt64, UInt128, UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

サーバーが数値として受け入れることができる一方で、これらの型の最大値が `Number.MAX_SAFE_INTEGER` よりも大きいため、`JSON*` ファミリーの出力フォーマットでは文字列として返されます。

ただし、この動作は [`output_format_json_quote_64bit_integers` 設定](/operations/settings/formats#output_format_json_quote_64bit_integers) によって変更できます。

**例:** 64 ビット数値のための JSON 出力フォーマットを調整します。

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

クライアントは[設定](/operations/settings/settings/)メカニズムを介して ClickHouse の動作を調整できます。
設定はクライアントインスタンスレベルで設定でき、すべてのリクエストに適用されます:

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

またはリクエストレベルで設定を構成できます:

```ts
client.query({
  clickhouse_settings: {}
})
```

サポートされているすべての ClickHouse 設定を含む型宣言ファイルは、[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts)で見つけることができます。

:::important
クエリが実行されるユーザーには、設定を変更する十分な権利があることを確認してください。
:::
## Advanced topics {#advanced-topics}
### Queries with parameters {#queries-with-parameters}

パラメータを持つクエリを作成し、クライアントアプリケーションからそれらに値を渡すことができます。これにより、クライアント側で特定の動的値を持つクエリをフォーマットすることが避けられます。

クエリを通常通りフォーマットし、アプリのパラメータからクエリに渡す値を次の書式で中括弧内に配置します:

```text
{<name>: <data_type>}
```

ここで:

- `name` — プレースホルダー識別子。
- `data_type` - アプリパラメータ値の [データ型](/sql-reference/data-types/)。

**例:** パラメータを持つクエリ。 
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

詳細については https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax を参照してください。
### Compression {#compression}

NB: リクエスト圧縮は現在ウェブ版では利用できません。レスポンス圧縮は通常通り機能します。Node.js 版は両方をサポートしています。

大規模データセットを通信を介して処理するデータアプリケーションは、圧縮を有効にすることで恩恵を受けることができます。現在、 `GZIP` のみが、[zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html) を使用してサポートされています。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

設定パラメータは次のとおりです:

- `response: true` は、ClickHouse サーバーに圧縮されたレスポンスボディで応答するように指示します。デフォルト値: `response: false`
- `request: true` は、クライアントリクエストボディの圧縮を有効にします。デフォルト値: `request: false`
### Logging (Node.js only) {#logging-nodejs-only}

:::important
ロギングは実験的な機能であり、将来的に変更される可能性があります。
:::

デフォルトのロガー実装は、`console.debug/info/warn/error` メソッドを介してログレコードを `stdout` に出力します。
`LoggerClass` を提供することでロギングロジックをカスタマイズでき、希望するログレベルを `level` パラメータで選択できます（デフォルトは `OFF`）:

```typescript
import type { Logger } from '@clickhouse/client'

// すべての LogParams タイプはクライアントによってエクスポートされています
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

現在のところ、クライアントは次のイベントをログに記録します：

- `TRACE` - Keep-Alive ソケットのライフサイクルに関する低レベルの情報
- `DEBUG` - レスポンス情報（認証ヘッダーやホスト情報は除外）
- `INFO` - 主に未使用で、クライアントが初期化されると現在のログレベルを印刷します
- `WARN` - 非致命的なエラー; 失敗した `ping` リクエストは警告としてログに記録されます。
- `ERROR` - `query` / `insert` / `exec` / `command` メソッドからの致命的エラー、失敗したリクエストなど。

デフォルトの Logger 実装は [こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts) で確認できます。
### TLS certificates (Node.js only) {#tls-certificates-nodejs-only}

Node.js クライアントは、基本的な (証明書機関のみ) および相互 (証明書機関とクライアント証明書) TLS をオプションでサポートします。

基本的な TLS 構成の例、`certs` フォルダーに証明書があり、CA ファイル名が `CA.pem` の場合:

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

クライアント証明書を使用した相互 TLS 構成の例:

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

基本的な TLSと相互 TLSのフルサンプルは、リポジトリ内でそれぞれ[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts)と[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts)で確認できます。
### Keep-Alive configuration (Node.js only) {#keep-alive-configuration-nodejs-only}

クライアントは、デフォルトで基盤となる HTTP エージェントで Keep-Alive を有効にしているため、接続されたソケットは後続のリクエストに再利用され、`Connection: keep-alive` ヘッダーが送信されます。アイドリングしているソケットは、デフォルトで 2500 ミリ秒まで接続プールに保持されます（このオプションの調整に関する注意事項は、[こちら](./js.md#adjusting-idle_socket_ttl)を参照してください）。

`keep_alive.idle_socket_ttl` の値は、サーバー/LB 構成よりもかなり低く設定されることを前提としています。主な理由は、HTTP/1.1 により、サーバーが接続を通知せずに閉じることができるためです。クライアントが接続を再利用しようとしたときに、サーバーまたは負荷分散装置が接続を閉じていると、`socket hang up` エラーが発生します。

`keep_alive.idle_socket_ttl` を調整する場合は、常にサーバー/LB の Keep-Alive 構成と同期させる必要があります。これは、その値が **常に低く** なるべきであり、サーバーが最初にオープン接続を閉じないことを保証します。
#### Adjusting `idle_socket_ttl` {#adjusting-idle_socket_ttl}

クライアントは `keep_alive.idle_socket_ttl` を 2500 ミリ秒に設定しており、これが最も安全なデフォルト値と見なされます。一方、サーバー側の `keep_alive_timeout` は、ClickHouse のバージョン 23.11 より前に[3 秒まで低く設定されることがあります](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1)が、`config.xml` の変更は行われません。

:::warning
パフォーマンスに問題を感じていない場合は、`keep_alive.idle_socket_ttl` の値を増やさないことが推奨されます。そうしないと、潜在的な "Socket hang-up" エラーが発生する可能性があります。また、アプリケーションが大量のクエリを送信し、クエリ間のダウンタイムが短い場合、デフォルトの値は十分であり、ソケットが長時間アイドリングすることはなく、クライアントはそれらをプール内に保持し続けます。
:::

サーバーの応答ヘッダー内で正しい Keep-Alive タイムアウト値を確認するには、以下のコマンドを実行します:

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

応答内の `Connection` と `Keep-Alive` ヘッダーの値を確認してください。例えば:

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

この場合、`keep_alive_timeout` は 10 秒であり、`keep_alive.idle_socket_ttl` を 9000 または 9500 ミリ秒に増加させて、アイドリングソケットをデフォルトよりも少し長く保持することを試みることができます。サーバーがクライアントが接続を閉じる前に接続を閉じる場合に、潜在的な "Socket hang-up" エラーに注意を払い、そのエラーが消えるまで値を低くします。
#### Keep-Alive トラブルシューティング {#keep-alive-troubleshooting}

Keep-Alive を使用中に `socket hang up` エラーが発生した場合、以下のオプションでこの問題を解決できます。

* ClickHouse サーバの設定で `keep_alive.idle_socket_ttl` の値を少し減らします。クライアントとサーバ間のネットワーク遅延が高い場合など、 `keep_alive.idle_socket_ttl` をさらに 200～500 ミリ秒減らすことが有益なことがあります。これにより、アウトゴーイングリクエストがサーバによって閉じられようとしているソケットを取得する状況を回避できます。

* このエラーが、データの送受信がない長時間実行されるクエリ（たとえば、長時間実行される `INSERT FROM SELECT`）中に発生している場合、ロードバランサがアイドル接続を閉じている可能性があります。長時間実行されるクエリ中にデータを強制的に送信するために、以下の ClickHouse 設定の組み合わせを試してみてください：

  ```ts
  const client = createClient({
    // ここでは、実行時間が 5 分を超えるクエリがあると仮定しています
    request_timeout: 400_000,
    /** これらの設定の組み合わせは、データの送受信がない長時間のクエリ、
     *  例えば、 `INSERT FROM SELECT` のようなクエリの場合に LB タイムアウトの問題を回避します。
     *  この場合、LB はアイドル接続のタイムアウトを 120 秒と仮定し、したがって 110 秒を「安全な」値として設定します。 */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: '110000', // UInt64、文字列として渡す必要があります
    },
  })
  ```
  ただし、最近の Node.js バージョンでは受信したヘッダーの合計サイズには 16KB の制限があります。ヘッダーの進捗が受信された後、私たちのテストでは約 70～80 が受信され、その後例外が生成されます。

  まったく異なるアプローチを使用することも可能で、ワイヤ上での待機時間を完全に回避することができます。接続が失われたときにミューテーションがキャンセルされないという HTTP インターフェースの「機能」を活用することで実現できます。詳細については、[この例（パート 2）](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts)を参照してください。

* Keep-Alive 機能を完全に無効にすることもできます。この場合、クライアントはすべてのリクエストに `Connection: close` ヘッダーを追加し、基盤となる HTTP エージェントは接続を再利用しません。 `keep_alive.idle_socket_ttl` 設定は無視され、アイドルソケットは存在しないためです。これにより、新しい接続がすべてのリクエストに対して確立されるため、追加のオーバーヘッドが発生します。

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```
### 読み取り専用ユーザー {#read-only-users}

[readonly=1 ユーザー](/operations/settings/permissions-for-queries#readonly) でクライアントを使用する場合、レスポンス圧縮は `enable_http_compression` 設定が必要なため、有効にできません。以下の設定はエラーの原因となります：

```ts
const client = createClient({
  compression: {
    response: true, // readonly=1 ユーザーでは動作しません
  },
})
```

readonly=1 ユーザーの制限の詳細については、[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)を参照してください。
### パス名付きプロキシ {#proxy-with-a-pathname}

ClickHouse インスタンスがプロキシの背後にあり、URL にパス名がある場合（たとえば、http://proxy:8123/clickhouse_server のように）、 `clickhouse_server` を `pathname` 設定オプションとして指定してください（スラッシュの有無に関係なく）。そうしないと、`url` で直接提供された場合、それは `database` オプションと見なされます。複数のセグメントがサポートされています。たとえば、 `/my_proxy/db`。

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```
### 認証付きリバースプロキシ {#reverse-proxy-with-authentication}

ClickHouse デプロイメントの前に認証付きリバースプロキシがある場合、`http_headers` 設定を使用して必要なヘッダーを提供できます。

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```
### カスタム HTTP/HTTPS エージェント（実験的、Node.js のみ） {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
これは実験的な機能であり、今後のリリースで後方互換性のない方法で変更される可能性があります。クライアントが提供するデフォルトの実装と設定は、ほとんどのユースケースで十分です。この機能は、本当に必要な場合のみ使用してください。
:::

デフォルトでは、クライアントは、クライアント設定で提供される設定（`max_open_connections`、`keep_alive.enabled`、`tls` など）を使用して基盤となる HTTP(s) エージェントを構成し、ClickHouse サーバへの接続を処理します。さらに、TLS 証明書が使用されている場合、基盤となるエージェントには必要な証明書が設定され、正しい TLS 認証ヘッダーが適用されます。

1.2.0 以降、カスタム HTTP(s) エージェントをクライアントに提供でき、デフォルトの基盤となるものを置き換えることができます。これは、厄介なネットワーク構成の場合に役立つ可能性があります。カスタムエージェントが提供された場合には、以下の条件が適用されます：
- `max_open_connections` および `tls` オプションは _無効_ となり、クライアントによって無視されます。これは基盤となるエージェントの設定の一部です。
- `keep_alive.enabled` は、`Connection` ヘッダーのデフォルト値を規定します（`true` → `Connection: keep-alive`、`false` → `Connection: close`）。
- アイドルな keep-alive ソケット管理は引き続き機能しますが（これはエージェントではなく特定のソケット自体に tied されていますが）、 `keep_alive.idle_socket_ttl` 値を `0` に設定することで完全に無効にすることができます。
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
  // カスタム HTTPS エージェントを使用すると、クライアントはデフォルトの HTTPS 接続実装を使用しません; ヘッダーは手動で提供する必要があります
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
  },
  // 重要: 認証ヘッダーは TLS ヘッダーと競合する; 無効にします。
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
  // カスタム HTTPS エージェントを使用すると、クライアントはデフォルトの HTTPS 接続実装を使用しません; ヘッダーは手動で提供する必要があります
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
    'X-ClickHouse-SSL-Certificate-Auth': 'on',
  },
  // 重要: 認証ヘッダーは TLS ヘッダーと競合する; 無効にします。
  set_basic_auth_header: false,
})
```

証明書とカスタム HTTPS エージェントを使用する場合、デフォルトの認証ヘッダーを `set_basic_auth_header` 設定（1.2.0 で導入されました）を介して無効にする必要がある可能性が高いです。すべての TLS ヘッダーは手動で提供される必要があります。
## 既知の制限 (Node.js/Web) {#known-limitations-nodejsweb}

- 結果セットに対するデータマッパーはないため、言語のプimitivesのみが使用されます。特定のデータ型マッパーは、[RowBinary フォーマットサポート](https://github.com/ClickHouse/clickhouse-js/issues/216)が計画されています。
- 一部の [Decimal* および Date* / DateTime* データ型の注意点](./js.md#datedate32-types-caveats) があります。
- JSON* ファミリ形式を使用する場合、Int32 より大きな数字は文字列として表されます。これは、Int64+ 型の最大値が `Number.MAX_SAFE_INTEGER` より大きいためです。詳細については、[整数型](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) セクションを参照してください。
## 既知の制限 (Web) {#known-limitations-web}

- 選択クエリのストリーミングは機能しますが、挿入時（型レベルでも）は無効です。
- リクエスト圧縮は無効で、設定は無視されます。レスポンス圧縮は機能します。
- 現在のところログ記録サポートはありません。
## パフォーマンス最適化のためのヒント {#tips-for-performance-optimizations}

- アプリケーションのメモリ消費を削減するために、大きな挿入（たとえばファイルから）や必要に応じてセレクト用のストリームを使用することを検討してください。イベントリスナーや同様のユースケースに対しては、[非同期挿入](/optimize/asynchronous-inserts)がもう一つの良い選択肢であり、クライアント側でのバッチ処理を最小限に抑えるか、完全に回避することができます。非同期挿入の例は、[クライアントリポジトリ](https://github.com/ClickHouse/clickhouse-js/tree/main/examples)にあり、`async_insert_`がファイル名のプレフィックスです。
- クライアントはデフォルトでリクエストまたはレスポンス圧縮を有効にしません。しかし、大きなデータセットを選択または挿入する場合は、`ClickHouseClientConfigOptions.compression`を介して有効にすることを検討してください（`request` または `response`、または両方に対して）。
- 圧縮はパフォーマンスに大きな影響を与えます。`request` または `response` に対して有効にすると、それぞれの選択または挿入の速度に悪影響を与えますが、アプリケーションによって転送されるネットワークトラフィックの量は減少します。
## お問い合わせ {#contact-us}

ご質問やサポートが必要な場合は、[コミュニティ Slack](https://clickhouse.com/slack)（`#clickhouse-js` チャンネル）または [GitHub issues](https://github.com/ClickHouse/clickhouse-js/issues) を通じてお気軽にお問い合わせください。
