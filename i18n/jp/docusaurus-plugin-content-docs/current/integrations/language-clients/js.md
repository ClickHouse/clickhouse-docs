---
sidebar_label: 'JavaScript'
sidebar_position: 4
keywords: ['clickhouse', 'js', 'JavaScript', 'NodeJS', 'web', 'browser', 'Cloudflare', 'workers', 'client', 'connect', 'integrate']
slug: /integrations/javascript
description: 'ClickHouseに接続するための公式JSクライアント。'
title: 'ClickHouse JS'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# ClickHouse JS

ClickHouseに接続するための公式JSクライアントです。
クライアントはTypeScriptで記述されており、クライアントの公開APIに対する型定義を提供しています。

依存関係はゼロで、最大のパフォーマンスを最適化しており、さまざまなClickHouseバージョンと構成（オンプレミスの単一ノード、オンプレミスクラスタ、ClickHouse Cloud）でテストされています。

クライアントには異なる環境のための2つの異なるバージョンがあります：
- `@clickhouse/client` - Node.js専用
- `@clickhouse/client-web` - ブラウザ（Chrome/Firefox）、Cloudflareワーカー

TypeScriptを使用する場合は、少なくとも [バージョン 4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)が必要です。このバージョンは、[インラインインポートおよびエクスポート構文](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)を有効にします。

クライアントのソースコードは、[ClickHouse-JS GitHubリポジトリ](https://github.com/ClickHouse/clickhouse-js)で入手可能です。
## 環境要件 (Node.js) {#environment-requirements-nodejs}

Node.jsは、クライアントを実行するための環境で利用可能でなければなりません。
クライアントはすべての[サポートされている](https://github.com/nodejs/release#readme)Node.jsリリースと互換性があります。

Node.jsのバージョンがEnd-Of-Lifeに近づくと、クライアントはそれに対するサポートを終了します。このバージョンは時代遅れであり、安全ではないと見なされます。

現在のNode.jsバージョンのサポート：

| Node.js バージョン | サポートされている? |
|---------------------|---------------------|
| 22.x                | ✔                   |
| 20.x                | ✔                   |
| 18.x                | ✔                   |
| 16.x                | 最善を尽くす        |
## 環境要件 (Web) {#environment-requirements-web}

クライアントのWebバージョンは、最新のChrome/Firefoxブラウザで正式にテストされており、React/Vue/AngularアプリケーションやCloudflareワーカーの依存関係として使用できます。
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
|------------------------|------------|
| 1.8.0                  | 23.3+      |

おそらく、クライアントは古いバージョンでも動作しますが、これは最善を尽くすサポートであり、保証されていません。23.3よりも古いClickHouseバージョンを使用している場合は、[ClickHouseセキュリティポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)を参照し、アップグレードを検討してください。
## 例 {#examples}

クライアント使用のさまざまなシナリオを、クライアントリポジトリの[例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples)で網羅することを目指しています。

概要は、[例のREADME](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview)で入手可能です。 

何か不明な点や例または以下のドキュメントに欠落がある場合は、[お問い合わせ](./js.md#contact-us)ください。
### クライアントAPI {#client-api}

ほとんどの例は、明示的に他の環境に記載されていない限り、Node.jsおよびWebバージョンの双方に互換性があります。
#### クライアントインスタンスの作成 {#creating-a-client-instance}

必要に応じて任意の数のクライアントインスタンスを`createClient`ファクトリを使って作成できます：

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

クライアントインスタンスは、インスタンス時に[事前設定](./js.md#configuration)できます。
#### 設定 {#configuration}

クライアントインスタンスを作成する際に、次の接続設定を調整できます：

| 設定                                                                | 説明                                                                               | デフォルト値            | 参照                                                                                                                |
|---------------------------------------------------------------------|------------------------------------------------------------------------------------|-------------------------|---------------------------------------------------------------------------------------------------------------------|
| **url**?: string                                                    | ClickHouseインスタンスのURL。                                                      | `http://localhost:8123` | [URL設定ドキュメント](./js.md#url-configuration)                                                                     |
| **pathname**?: string                                               | クライアントによって解析されたClickHouse URLに追加するオプションのパス名。          | `''`                    | [パス名付きプロキシのドキュメント](./js.md#proxy-with-a-pathname)                                                 |
| **request_timeout**?: number                                        | リクエストのタイムアウト（ミリ秒単位）。                                          | `30_000`                | -                                                                                                                   |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }` | 圧縮を有効にします。                                                               | -                       | [圧縮ドキュメント](./js.md#compression)                                                                             |
| **username**?: string                                               | リクエストが行われるユーザーの名前。                                              | `default`               | -                                                                                                                   |
| **password**?: string                                               | ユーザーパスワード。                                                                 | `''`                    | -                                                                                                                   |
| **application**?: string                                            | Node.jsクライアントを使用するアプリケーションの名前。                               | `clickhouse-js`         | -                                                                                                                   |
| **database**?: string                                               | 使用するデータベース名。                                                             | `default`               | -                                                                                                                   |
| **clickhouse_settings**?: ClickHouseSettings                        | すべてのリクエストに適用するClickHouse設定。                                        | `{}`                    | -                                                                                                                   |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 内部クライアントログの設定。                                                       | -                       | [ロギングドキュメント](./js.md#logging-nodejs-only)                                                                 |
| **session_id**?: string                                             | 各リクエストと共に送信するオプションのClickHouseセッションID。                      | -                       | -                                                                                                                   |
| **keep_alive**?: `{ **enabled**?: boolean }`                        | Node.jsとWebバージョン双方でデフォルトで有効。                                      | -                       | -                                                                                                                   |
| **http_headers**?: `Record<string, string>`                         | ClickHouseリクエスト用の追加HTTPヘッダー。                                         | -                       | [認証付き逆プロキシのドキュメント](./js.md#reverse-proxy-with-authentication)                                       |
| **roles**?: string \| string[]                                     | パケットのリクエストに添付されるClickHouseロール名。                               | -                       | [HTTPインターフェースでのロールの使用](/interfaces/http#setting-role-with-query-parameters) |
#### Node.js特有の設定パラメータ {#nodejs-specific-configuration-parameters}

| 設定                                                                 | 説明                                                      | デフォルト値 | 参照                                                                                                   |
|-----------------------------------------------------------------------|----------------------------------------------------------|---------------|--------------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                     | ホストごとに許可される最大接続ソケット数。               | `10`          | -                                                                                                      |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`    | TLS証明書を設定します。                                   | -             | [TLSドキュメント](./js.md#tls-certificates-nodejs-only)                                               |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                        | -             | [Keep Aliveドキュメント](./js.md#keep-alive-configuration-nodejs-only)                                 |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>       | クライアント用のカスタムHTTPエージェント。               | -             | [HTTPエージェントドキュメント](./js.md#custom-httphttps-agent-experimental-nodejs-only)             |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>          | ベーシック認証資格情報を使用して`Authorization`ヘッダーを設定します。 | `true`        | [HTTPエージェントドキュメントでのこの設定の使用](./js.md#custom-httphttps-agent-experimental-nodejs-only) |
### URLの設定 {#url-configuration}

:::important
URL設定は _常に_ ハードコーディングされた値を上書きし、この場合警告がログに記録されます。
:::

ほとんどのクライアントインスタンスのパラメータは、URLで設定可能です。URL形式は `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]` です。ほとんどのケースで、特定のパラメータの名前はそれが設定オプションインターフェース内でのパスを反映していますが、いくつかの例外があります。サポートされているパラメータは次の通りです：

| パラメータ                                  | 型                                                         |
|----------------------------------------------|------------------------------------------------------------|
| `pathname`                                   | 任意の文字列。                                           |
| `application_id`                             | 任意の文字列。                                           |
| `session_id`                                 | 任意の文字列。                                           |
| `request_timeout`                            | 非負の数値。                                           |
| `max_open_connections`                       | 非負の数値、ゼロより大きい。                         |
| `compression_request`                        | ブール値。以下参照 (1)                                    |
| `compression_response`                       | ブール値。                                               |
| `log_level`                                  | 許可される値: `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`. |
| `keep_alive_enabled`                         | ブール値。                                               |
| `clickhouse_setting_*` または `ch_*`           | 以下参照(2)                                               |
| (Node.js専用) `keep_alive_idle_socket_ttl`  | 非負の数値。                                           |

- (1) ブール値の場合、妥当な値は `true`/`1` および `false`/`0` です。
- (2) `clickhouse_setting_` または `ch_` で始まる任意のパラメータはこのプレフィックスが削除され、残りはクライアントの `clickhouse_settings` に追加されます。例えば、`?ch_async_insert=1&ch_wait_for_async_insert=1` は次のように等しいです：

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

注意: `clickhouse_settings` のブール値は、URLで `1`/`0` として渡す必要があります。

- (3) (2) と似ていますが、`http_header` 設定用です。例えば、`?http_header_x-clickhouse-auth=foobar` は次のように等しいです：

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
#### 接続の概要 {#connection-overview}

クライアントはHTTP(s)プロトコルを介して接続を実装しています。RowBinaryのサポートは進行中で、[関連する問題](https://github.com/ClickHouse/clickhouse-js/issues/216)を参照してください。

以下の例は、ClickHouse Cloudに対する接続の設定方法を示しています。`url`（プロトコルとポートを含む）および`password`の値は環境変数で指定されると仮定し、`default`ユーザーが使用されます。

**例:** 環境変数を使用してNode.jsクライアントインスタンスを作成する。

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

クライアントリポジトリには、環境変数を使用したさまざまな例が含まれており、たとえば[ClickHouse Cloudでのテーブル作成](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)、[非同期挿入の使用](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts)などがあります。
#### 接続プール (Node.js専用) {#connection-pool-nodejs-only}

各リクエストで接続を確立するオーバーヘッドを回避するために、クライアントはClickHouseへの接続を再利用するための接続プールを作成し、Keep-Aliveメカニズムを利用します。デフォルトでは、Keep-Aliveは有効で、接続プールのサイズは`10`に設定されていますが、`max_open_connections` [設定オプション](./js.md#configuration)で変更できます。

ユーザーが `max_open_connections: 1` を設定しない限り、プール内の同じ接続がその後のクエリに使用される保証はありません。この設定は通常必要ありませんが、一時テーブルを使用している場合には必要になることがあります。

また、[Keep-Alive設定](./js.md#keep-alive-configuration-nodejs-only)も参照してください。
### クエリID {#query-id}

クエリまたはステートメントを送信するすべてのメソッド（`command`、`exec`、`insert`、`select`）は、結果に`query_id`を提供します。この一意の識別子はクライアントによってクエリごとに割り当てられ、`system.query_log`からデータを取得するのに便利です。これが[サーバー設定](/operations/server-configuration-parameters/settings)で有効になっている場合、または長時間実行中のクエリをキャンセルするのに役立ちます（[例を参照](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)）。必要に応じて、`command`/`query`/`exec`/`insert`メソッドのパラメータでユーザーが`query_id`をオーバーライドできます。

:::tip
`query_id`パラメータをオーバーライドする場合は、各呼び出しの一意性を確保する必要があります。ランダムなUUIDが良い選択です。
:::
### すべてのクライアントメソッドの基本パラメータ {#base-parameters-for-all-client-methods}

すべてのクライアントメソッドに適用できるいくつかのパラメータがあります（[query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)）。

```ts
interface BaseQueryParams {
  // クエリレベルで適用可能なClickHouse設定。
  clickhouse_settings?: ClickHouseSettings
  // クエリバインディング用のパラメータ。
  query_params?: Record<string, unknown>
  // 進行中のクエリをキャンセルするためのAbortSignalインスタンス。
  abort_signal?: AbortSignal
  // query_idオーバーライド; 指定されていない場合は、ランダムな識別子が自動的に生成されます。
  query_id?: string
  // session_idオーバーライド; 指定されていない場合は、クライアント設定からセッションIDが取得されます。
  session_id?: string
  // 認証資格情報オーバーライド; 指定されていない場合は、クライアントの資格情報が使用されます。
  auth?: { username: string, password: string }
  // このクエリに使用する特定のロールのリスト。クライアント設定で設定されたロールを上書きします。
  role?: string | Array<string>
}
```
### クエリメソッド {#query-method}

これは、`SELECT`などの応答がある可能性のあるほとんどのステートメントや、`CREATE TABLE`などのDDLを送信するために使用され、awaitする必要があります。返される結果セットは、アプリケーションで消費されることが期待されます。

:::note
データ挿入用の専用メソッド[insert](./js.md#insert-method)とDDL用の[command](./js.md#command-method)があります。
:::

```ts
interface QueryParams extends BaseQueryParams {
  // データを返す可能性のあるクエリを実行します。
  query: string
  // 結果データセットのフォーマット。デフォルト: JSON。
  format?: DataFormat
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>
}
```

また、[すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)も参照してください。

:::tip
`query`にFORMAT句を指定しないでください、代わりに`format`パラメータを使用してください。
:::
#### 結果セットと行抽象 {#result-set-and-row-abstractions}

`ResultSet`は、アプリケーション内でのデータ処理のための便利なメソッドをいくつか提供します。

Node.jsの`ResultSet`実装は、内部で`Stream.Readable`を使用していますが、WebバージョンはWeb APIの`ReadableStream`を使用しています。

`ResultSet`を消費するには、`text`または`json`メソッドを呼び出して、クエリによって返されたすべての行をメモリにロードします。

`ResultSet`の消費はできるだけ早く開始するべきです。これはレスポンスストリームをオープンに保持し、したがって基盤となる接続を忙しくし続けます。クライアントは、アプリケーションによる潜在的な過剰なメモリ使用を避けるために、受信データをバッファリングしません。

代わりに、一度にメモリに収まらないほど大きい場合は、`stream`メソッドを呼び出し、ストリーミングモードでデータを処理できます。レスポンスチャンクの各部分は、行の比較的小さな配列に変換されます（この配列のサイズは、クライアントがサーバーから受信する特定のチャンクのサイズによって異なる場合があり、個々の行のサイズによっても異なります）。

どのデータ形式があなたのケースでのストリーミングに最適かを判断するために、[サポートされているデータフォーマット](./js.md#supported-data-formats)のリストを参照してください。例えば、JSONオブジェクトをストリーミングしたい場合、[JSONEachRow](/sql-reference/formats#jsoneachrow)を選択すれば、各行はJSオブジェクトとして解析されますし、よりコンパクトな[JSONCompactColumns](/sql-reference/formats#jsoncompactcolumns)フォーマットを選べば、各行は値のコンパクトな配列になります。また、[ファイルのストリーミング](./js.md#streaming-files-nodejs-only)も参照してください。

:::important
`ResultSet`またはそのストリームが完全に消費されない場合、それは`request_timeout`の非アクティブ期間後に破棄されます。
:::

```ts
interface BaseResultSet<Stream> {
  // 上記の「クエリID」セクションを参照
  query_id: string

  // ストリーム全体を消費し、内容を文字列として取得します
  // すべてのDataFormatで使用可能
  // 一度だけ呼び出すべきです
  text(): Promise<string>

  // ストリーム全体を消費し、内容をJSオブジェクトとして解析します
  // JSON形式でのみ使用できます
  // 一度だけ呼び出すべきです
  json<T>(): Promise<T>

  // ストリーミング可能なレスポンス用の読み取りストリームを返します
  // ストリームを反復するたびに選択したDataFormatでRow[]の配列を提供します
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

**例:** (Node.js/Web) `JSONEachRow`フォーマットの結果データセットを含むクエリ。ストリーム全体を消費し、内容をJSオブジェクトとして解析します。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // または `row.text`でJSON解析を避ける
```

**例:** (Node.jsのみ) `JSONEachRow`フォーマットでのクエリ結果のストリーミング。古典的な`on('data')`アプローチを使用します。これは`for await const`構文と相互に交換可能です。 [ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // または JSONCompactEachRow、JSONStringsEachRow など
})
const stream = rows.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.json()) // または `row.text`でJSON解析を避ける
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('完了！')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**例:** (Node.jsのみ) `CSV`フォーマットでのクエリ結果のストリーミング。古典的な`on('data')`アプローチを使用します。これは`for await const`構文と互換性があります。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'CSV', // または TabSeparated、CustomSeparated など
})
const stream = resultSet.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.text)
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('完了！')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**例:** (Node.jsのみ) `JSONEachRow`フォーマットでのクエリ結果をJSオブジェクトとしてストリーミングし、`for await const`構文を使用して消費します。この構文は古典的な`on('data')`アプローチと互換性があります。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers LIMIT 10',
  format: 'JSONEachRow', // または JSONCompactEachRow、JSONStringsEachRow など
})
for await (const rows of resultSet.stream()) {
  rows.forEach(row => {
    console.log(row.json())
  })
}
```

:::note
`for await const`構文は、`on('data')`アプローチよりもコードが少なくなりますが、パフォーマンスに悪影響を及ぼす可能性があります。
詳細については、[Node.jsリポジトリのこのイシュー](https://github.com/nodejs/node/issues/31979)を参照してください。
:::

**例:** (Webのみ) オブジェクトの`ReadableStream`を反復処理します。

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

返される型は最小限であり、サーバーからデータが返されることは期待しておらず、レスポンスストリームを即座に排出します。

もし空の配列が挿入メソッドに提供された場合、挿入文はサーバーに送信されず、代わりに `{ query_id: '...', executed: false }` で即座に解決されます。この場合にパラメータで`query_id`が提供されなかった場合、結果は空の文字列になります。クライアントによって生成されたランダムなUUIDを返すことは混乱を招く可能性があるためです。

もし挿入文がサーバーに送信された場合、`executed`フラグは`true`になります。
```
```yaml
title: 'Node.jsにおける挿入メソッドとストリーミング'
sidebar_label: '挿入メソッドとストリーミング'
keywords: ['Node.js', '挿入メソッド', 'ストリーミング']
description: 'Node.jsでのClickHouseの挿入メソッドとストリーミングの使用方法について説明します。'
```

#### Insert method and streaming in Node.js {#insert-method-and-streaming-in-nodejs}

`insert` メソッドに指定された [データフォーマット](./js.md#supported-data-formats) に応じて、`Stream.Readable` またはプレーン `Array<T>` で動作します。また、このセクションでは [ファイルストリーミング](./js.md#streaming-files-nodejs-only) についても説明します。

挿入メソッドは await されることを想定していますが、入力ストリームを指定し、ストリームが完了したときにのみ `insert` 操作を await することも可能です（これにより、`insert` プロミスも解決されます）。これはイベントリスナーや類似のシナリオで便利ですが、エラーハンドリングはクライアントサイドで多くのエッジケースがあるため複雑になる可能性があります。代わりに、[非同期挿入](/optimize/asynchronous-inserts) の使用を検討してください。これについては [この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts)を参考にしてください。

:::tip
このメソッドでモデル化が難しいカスタムINSERT文がある場合は、[コマンドメソッド](./js.md#command-method) の使用を検討してください。

使用例として、[INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) や [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) の例を参照できます。
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
  // - `['a', 'b']` のような配列は: `INSERT INTO table (a, b) FORMAT DataFormat` を生成します。
  // - `{ except: ['a', 'b'] }` のようなオブジェクトは: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat` を生成します。
  // デフォルトでは、データはテーブルのすべてのカラムに挿入され、
  // 生成される文は: `INSERT INTO table FORMAT DataFormat` になります。
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

他にも、[すべてのクライアントメソッドの基本パラメーター](./js.md#base-parameters-for-all-client-methods) を参照してください。

:::important
`abort_signal` でキャンセルされたリクエストは、サーバーがキャンセル前にストリーミングされたデータの一部を受信している可能性があるため、データの挿入が行われなかったことを保証するものではありません。
:::

**例:** (Node.js/Web) 値の配列を挿入します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
await client.insert({
  table: 'my_table',
  // 構造はこの例のJSONEachRowフォーマットに一致する必要があります
  values: [
    { id: 42, name: 'foo' },
    { id: 42, name: 'bar' },
  ],
  format: 'JSONEachRow',
})
```

**例:** (Node.jsのみ) CSVファイルからのストリームを挿入します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。参照: [ファイルストリーミング](./js.md#streaming-files-nodejs-only)。

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**例**: 挿入文から特定のカラムを除外します。

次のようなテーブル定義があるとします。

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

特定のカラムのみを挿入します。

```ts
// 生成される文: INSERT INTO mytable (message) FORMAT JSONEachRow
await client.insert({
  table: 'mytable',
  values: [{ message: 'foo' }],
  format: 'JSONEachRow',
  // この行の `id` カラムの値はゼロになります（UInt32のデフォルト）
  columns: ['message'],
})
```

特定のカラムを除外します。

```ts
// 生成される文: INSERT INTO mytable (* EXCEPT (message)) FORMAT JSONEachRow
await client.insert({
  table: tableName,
  values: [{ id: 144 }],
  format: 'JSONEachRow',
  // この行の `message` カラムの値は空文字列になります
  columns: {
    except: ['message'],
  },
})
```

追加の詳細については [ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts) を参照してください。

**例**: クライアントインスタンスに提供されたものとは異なるデータベースに挿入します。[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: 'mydb.mytable', // データベースを含む完全修飾名
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```
#### Web version limitations {#web-version-limitations}

現在、`@clickhouse/client-web` での挿入は `Array<T>` および `JSON*` フォーマットのみ動作します。
ストリームの挿入は、ブラウザの互換性が不十分なため、Webバージョンではまだサポートされていません。

そのため、Webバージョンの `InsertParams` インターフェースは、`values` が `ReadonlyArray<T>` 型のみに制限されているため Node.js バージョンとはわずかに異なります。

```ts
interface InsertParams<T> extends BaseQueryParams {
  // データを挿入するテーブル名
  table: string
  // 挿入するデータセット
  values: ReadonlyArray<T>
  // 挿入するデータセットのフォーマット
  format?: DataFormat
  // データが挿入されるカラムを指定することを許可します。
  // - `['a', 'b']` のような配列は: `INSERT INTO table (a, b) FORMAT DataFormat` を生成します。
  // - `{ except: ['a', 'b'] }` のようなオブジェクトは: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat` を生成します。
  // デフォルトでは、データはテーブルのすべてのカラムに挿入され、
  // 生成される文は: `INSERT INTO table FORMAT DataFormat` になります。
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

これは将来的に変更される可能性があります。他にも、[すべてのクライアントメソッドの基本パラメーター](./js.md#base-parameters-for-all-client-methods) を参照してください。
### Command method {#command-method}

出力がない文、フォーマット句が適用されない場合、または応答に関心がない場合に使用できます。例としては `CREATE TABLE` や `ALTER TABLE` が挙げられます。

await される必要があります。

レスポンスストリームは即座に破棄され、基盤のソケットが解放されます。

```ts
interface CommandParams extends BaseQueryParams {
  // 実行する文
  query: string
}

interface CommandResult {
  query_id: string
}

interface ClickHouseClient {
  command(params: CommandParams): Promise<CommandResult>
}
```

他にも、[すべてのクライアントメソッドの基本パラメーター](./js.md#base-parameters-for-all-client-methods) を参照してください。

**例:** (Node.js/Web) ClickHouse Cloudにテーブルを作成します。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)。

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // クエリ処理エラーが発生した後、クライアントにHTTPヘッダーが送信される状況を避けるため、クラスタ使用時に推奨されます。
  // https://clickhouse.com/docs/interfaces/http/#response-buffering を参照してください。
  clickhouse_settings: {
    wait_end_of_query: 1,
  },
})
```

**例:** (Node.js/Web) セルフホストされたClickHouseインスタンスにテーブルを作成します。 
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
`abort_signal` でキャンセルされたリクエストは、サーバーが文を実行しなかったことを保証するものではありません。
:::
### Exec method {#exec-method}

`query`/`insert` に収まらないカスタムクエリがあり、結果に興味がある場合は、`command` の代わりに `exec` を使用できます。

`exec` は、必ず消費または破棄されるべき読取可能ストリームを返します。

```ts
interface ExecParams extends BaseQueryParams {
  // 実行する文
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

他にも、[すべてのクライアントメソッドの基本パラメーター](./js.md#base-parameters-for-all-client-methods) を参照してください。

ストリーム戻り値の型は Node.js と Web バージョンで異なります。

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

接続状態をチェックするために提供される `ping` メソッドは、サーバーに到達できる場合は `true` を返します。

サーバーに到達できない場合、基盤のエラーも結果に含まれます。

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }

interface ClickHouseClient {
  ping(): Promise<PingResult>
}
```

Pingは、特にClickHouse Cloudのインスタンスがアイドル状態になる場合、アプリケーションの起動時にサーバーが利用可能かどうかを確認するための便利なツールです。

**例:** (Node.js/Web) ClickHouseサーバーインスタンスにpingを送ります。 注意: Webバージョンでは、キャッチされたエラーは異なる場合があります。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // 結果のエラーを処理します
}
```

注意: `/ping` エンドポイントが CORS を実装していないため、Web バージョンは `SELECT 1` を使用して類似の結果を得ます。
### Close (Node.js only) {#close-nodejs-only}

すべてのオープン接続を閉じ、リソースを解放します。 Webバージョンでは何もしません。

```ts
await client.close()
```
## Streaming files (Node.js only) {#streaming-files-nodejs-only}

クライアントリポジトリ内には、人気のあるデータフォーマット (NDJSON, CSV, Parquet) に関するファイルストリーミングのいくつかの例があります。

- [NDJSONファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [CSVファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Parquetファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Parquetファイルへのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

他のフォーマットをファイルにストリーミングする場合、Parquetと同じように行う必要があります。
違いは、 `query` コールのフォーマットに使用されるフォーマット (`JSONEachRow`, `CSV`, など) と出力ファイル名だけです。
## Supported Data formats {#supported-data-formats}

クライアントはデータフォーマットをJSONまたはテキストとして処理します。

`format` を JSON ファミリー (`JSONEachRow`, `JSONCompactEachRow`, など) の一つとして指定すると、クライアントは通信中にデータをシリアライズまたはデシリアライズします。

「生」テキストフォーマット (`CSV`, `TabSeparated`, `CustomSeparated` ファミリー) で提供されたデータは、追加の変換なしに通信されます。

:::tip
JSONが一般的なフォーマットであることと、[ClickHouse JSONフォーマット](/sql-reference/formats#json) との間に混乱が生じる可能性があります。

クライアントは、[JSONEachRow](/sql-reference/formats#jsoneachrow)などのフォーマットでストリーミングJSONオブジェクトをサポートしています（他のストリーミングに適したフォーマットについてはテーブルの概要を参照してください。また、`select_streaming_`の [クライアントリポジトリの例](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node) も参照してください）。

ただし、[ClickHouse JSON](/sql-reference/formats#json) およびいくつかの他のフォーマットは、レスポンス内で単一のオブジェクトとして表現され、クライアントによってストリーミングすることはできません。
:::

| Format                                     | Input (array) | Input (object) | Input/Output (Stream) | Output (JSON) | Output (text)  |
|--------------------------------------------|---------------|----------------|-----------------------|---------------|----------------|
| JSON                                       | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONCompact                                | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONObjectEachRow                          | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONColumnsWithMetadata                    | ❌             | ✔️             | ❌                     | ✔️            | ✔️             |
| JSONStrings                                | ❌             | ❌️             | ❌                     | ✔️            | ✔️             |
| JSONCompactStrings                         | ❌             | ❌              | ❌                     | ✔️            | ✔️             |
| JSONEachRow                                | ✔️            | ❌              | ✔️                    | ✔️            | ✔️             |
| JSONEachRowWithProgress                    | ❌️            | ❌              | ✔️ ❗- see below       | ✔️            | ✔️             |
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
| Parquet                                    | ❌             | ❌              | ✔️                    | ❌             | ✔️❗- see below |

Parquet の主な使用ケースは、選択時に結果のストリームをファイルに書き込むことです。リポジトリ内の [例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts) を参照してください。

`JSONEachRowWithProgress` はストリーム内で進捗報告をサポートする出力専用フォーマットです。 詳細については、[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)を参照してください。

ClickHouseの入力および出力フォーマットの完全な一覧は [こちら](https://sql-reference/data-types/) で入手できます。
## Supported ClickHouse data types {#supported-clickhouse-data-types}

:::note
関連するJS型は、すべての `JSON*` フォーマットに関連しており、すべてが文字列で表現される（例: `JSONStringEachRow`）場合を除きます。
:::

| Type               | Status          | JS type                    |
|--------------------|-----------------|----------------------------|
| UInt8/16/32        | ✔️              | number                     |
| UInt64/128/256     | ✔️ ❗- see below | string                     |
| Int8/16/32         | ✔️              | number                     |
| Int64/128/256      | ✔️ ❗- see below | string                     |
| Float32/64         | ✔️              | number                     |
| Decimal            | ✔️ ❗- see below | number                     |
| Boolean            | ✔️              | boolean                    |
| String             | ✔️              | string                     |
| FixedString        | ✔️              | string                     |
| UUID               | ✔️              | string                     |
| Date32/64          | ✔️              | string                     |
| DateTime32/64      | ✔️ ❗- see below | string                     |
| Enum               | ✔️              | string                     |
| LowCardinality     | ✔️              | string                     |
| Array(T)           | ✔️              | T[]                        |
| (new) JSON         | ✔️              | object                     |
| Variant(T1, T2...) | ✔️              | T (depends on the variant) |
| Dynamic            | ✔️              | T (depends on the variant) |
| Nested             | ✔️              | T[]                        |
| Tuple              | ✔️              | Tuple                      |
| Nullable(T)        | ✔️              | JS type for T or null      |
| IPv4               | ✔️              | string                     |
| IPv6               | ✔️              | string                     |
| Point              | ✔️              | [ number, number ]         |
| Ring               | ✔️              | Array&lt;Point\>              |
| Polygon            | ✔️              | Array&lt;Ring\>               |
| MultiPolygon       | ✔️              | Array&lt;Polygon\>            |
| Map(K, V)          | ✔️              | Record&lt;K, V\>              |

ClickHouseフォーマットの完全なリストは、[こちら](https://sql-reference/data-types/) で入手できます。
### Date/Date32 types caveats {#datedate32-types-caveats}

クライアントは追加の型変換なしに値を挿入するため、`Date`/`Date32` 型の列は文字列としてのみ挿入可能です。

**例:** `Date` 型の値を挿入します。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)。

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

ただし、`DateTime` または `DateTime64` 列を使用している場合、文字列およびJS Dateオブジェクトの両方を使用できます。 JS Dateオブジェクトは、`date_time_input_format` を `best_effort` に設定して `insert` にそのまま渡すことができます。 詳細については [この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts) を参照してください。
### Decimal\* types caveats {#decimal-types-caveats}

`JSON*`ファミリーフォーマットを使用して小数を挿入することが可能です。次のようにテーブルが定義されているとします。

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

文字列表現を使用して、精度の損失なしに値を挿入できます。

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

ただし、`JSON*` フォーマットでデータをクエリすると、ClickHouse は小数をデフォルトで _数値_ として返すため、精度が損なわれる可能性があります。これを避けるためには、クエリ内で小数を文字列にキャストすることができます。

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

サーバーは数値として受け取ることができますが、これらのタイプの最大値が `Number.MAX_SAFE_INTEGER` より大きいため、`JSON*`ファミリーの出力フォーマットでは文字列として返されます。

ただし、この動作は [`output_format_json_quote_64bit_integers` 設定](/operations/settings/formats#output_format_json_quote_64bit_integers) によって変更できます。

**例:** 64ビット数のJSON出力フォーマットを調整します。

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

クライアントは、[settings](/operations/settings/settings/) メカニズムを介してClickHouseの挙動を調整できます。
設定はクライアントインスタンスレベルで設定され、すべてのリクエストに適用できます。

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

サポートされているClickHouse設定のすべての型宣言ファイルは [こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts) で見つけることができます。

:::important
クエリが実行されるユーザーが設定を変更するのに十分な権限を持っていることを確認してください。
:::
## Advanced topics {#advanced-topics}
### Queries with parameters {#queries-with-parameters}

パラメータを持つクエリを作成し、クライアントアプリケーションから値を渡すことができます。これにより、クライアント側で特定の動的値でクエリをフォーマットする必要がなくなります。

クエリを通常通りフォーマットし、その後、アプリのパラメータからクエリに渡したい値を次のフォーマットで波括弧内に配置します。

```text
{<name>: <data_type>}
```

ここで:

- `name` — プレースホルダー識別子。
- `data_type` - アプリパラメータ値の[データタイプ](/sql-reference/data-types/)。

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

注意: リクエストの圧縮は現在Webバージョンでは利用できません。レスポンスの圧縮は通常通り機能します。Node.jsバージョンは両方をサポートしています。

大規模データセットを扱うデータアプリケーションは、圧縮を有効にすることで利益を得ることができます。現在サポートされているのは `GZIP` のみで、[zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html)を使用します。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

設定パラメータは次の通りです。

- `response: true` は、ClickHouseサーバーに圧縮されたレスポンスボディで応答するよう指示します。デフォルト値: `response: false`
- `request: true` は、クライアントリクエストボディで圧縮を有効にします。デフォルト値: `request: false`
### Logging (Node.js only) {#logging-nodejs-only}

:::important
ロギングは実験的な機能であり、将来的に変更される可能性があります。
:::

デフォルトのロガー実装は、`stdout` に `console.debug/info/warn/error` メソッドを介してログレコードを出力します。
`LoggerClass` を提供することでロギングロジックをカスタマイズでき、`level` パラメータで希望するログレベルを選択できます（デフォルトは `OFF` です）。

```typescript
import type { Logger } from '@clickhouse/client'

// 3つのLogParamsタイプはすべてクライアントによってエクスポートされています
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

現在、クライアントは次のイベントをログ記録します。

- `TRACE` - Keep-Aliveソケットのライフサイクルに関する低レベルの情報
- `DEBUG` - 応答情報（認証ヘッダーおよびホスト情報なし）
- `INFO` - 主に使用されず、クライアントが初期化されたときに現在のログレベルを印刷します
- `WARN` - 非致命的なエラー; pingリクエストの失敗は警告として記録され、基盤のエラーが返された結果に含まれます
- `ERROR` - `query`/`insert`/`exec`/`command`メソッドからの致命的なエラー、リクエストの失敗など

デフォルトのロガー実装は [こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts) で見つけることができます。
### TLS certificates (Node.js only) {#tls-certificates-nodejs-only}

Node.js クライアントは、基本的（証明書機関のみ）および相互（証明書機関とクライアント証明書）TLSの両方をオプションでサポートしています。

基本的なTLS設定の例は、`certs` フォルダに証明書があり、CAファイル名が `CA.pem` であると仮定します。

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

クライアント証明書を使用した相互TLS設定の例:

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

[基本](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) と [相互](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS の完全な例をリポジトリで参照してください。
### Keep-Alive configuration (Node.js only) {#keep-alive-configuration-nodejs-only}

クライアントは、基盤のHTTPエージェントでデフォルトでKeep-Aliveを有効にしており、接続されたソケットはその後のリクエストのために再利用され、`Connection: keep-alive` ヘッダーが送信されます。アイドル状態のソケットはデフォルトで2500ミリ秒接続プールに残ります（このオプション調整については[ノート](./js.md#adjusting-idle_socket_ttl)を参照）。

`keep_alive.idle_socket_ttl`の値は、サーバー/LBの設定より少し低く設定する必要があります。主な理由は、HTTP/1.1 がサーバーに接続をクライアントに通知せずに閉じることを許可するため、サーバーまたはロードバランサーがクライアントが接続をクローズする前に接続を閉じた場合、クライアントは閉じられたソケットを再利用しようとし、`socket hang up` エラーが発生する可能性があるためです。

`keep_alive.idle_socket_ttl` を変更する場合は、サーバー/LBの Keep-Alive 設定と常に同期されている必要があり、常に **低く** するべきです。これにより、サーバーが最初にオープン接続を閉じないようにします。
#### Adjusting `idle_socket_ttl` {#adjusting-idle_socket_ttl}

クライアントは `keep_alive.idle_socket_ttl` を 2500 ミリ秒に設定しています。これは最も安全なデフォルトと考えられます。サーバ側では、`keep_alive_timeout` が [ClickHouseの23.11以前のバージョンでは3秒まで設定できる](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1) が、`config.xml` に変更がない場合。

:::warning
パフォーマンスが良好であり、問題が発生した場合は、`keep_alive.idle_socket_ttl` 設定の値を **増やさないことをお勧めします**。そうすると、潜在的な「Socket hang-up」エラーが発生する可能性があります。さらに、アプリケーションが多数のクエリを送信し、クエリ間のアイドル状態があまりない場合、デフォルトの値で十分です。アイドルソケットは長時間アイドル状態にならず、クライアントはそれらをプール内に保持します。
:::

サーバー応答ヘッダーで正しいKeep-Aliveタイムアウト値を見つけるには、次のコマンドを実行します。

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

レスポンス内の `Connection` および `Keep-Alive` ヘッダーの値を確認してください。例えば：

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

この場合、`keep_alive_timeout` は10秒であり、`keep_alive.idle_socket_ttl` を9000または9500ミリ秒に増やしてアイドルソケットをデフォルトより少し長く保持することを試みることができます。サーバーがクライアントよりも先に接続を閉じると、潜在的な「Socket hang-up」エラーが発生するので、それを監視し、エラーが消えるまで値を下げていきます。

```yaml
title: 'Keep-Alive トラブルシューティング'
sidebar_label: 'Keep-Alive トラブルシューティング'
keywords: ['Keep-Alive', 'トラブルシューティング', 'ClickHouse']
description: 'Keep-Aliveに関するトラブルシューティングのオプションや設定について説明します。'
```

#### Keep-Alive トラブルシューティング {#keep-alive-troubleshooting}

もし `socket hang up` エラーが Keep-Aliveを使用中に発生する場合、次のオプションでこの問題を解決できます：

* ClickHouseサーバーの設定で `keep_alive.idle_socket_ttl` の値を少し下げてみてください。たとえば、クライアントとサーバーの間のネットワーク遅延が高い場合には、`keep_alive.idle_socket_ttl` を200〜500ミリ秒下げることが有益な場合があります。これにより、サーバーが閉じる予定のソケットを受け取る出て行くリクエストの状況を排除できます。

* このエラーが、データが出入りしない長時間実行されるクエリ中に発生する場合（例：長時間実行される `INSERT FROM SELECT`）、これはロードバランサーがアイドル接続を閉じることが原因かもしれません。長時間実行されるクエリ中にいくつかのデータが流入するように、次の ClickHouse 設定の組み合わせを使用して試みることができます：

  ```ts
  const client = createClient({
    // ここでは、5分以上の実行時間を持つクエリがいくつかあると仮定しています
    request_timeout: 400_000,
    /** これらの設定を組み合わせることで、データが出入りせずに長時間実行されるクエリのLBタイムアウト問題を回避できます、
     *  `INSERT FROM SELECT`など、接続がLBによってアイドルとマークされて abruptly に閉じられるリスクがあります。
     *  この場合、LBのアイドル接続タイムアウトが120秒であると仮定し、110秒を「安全」な値として設定します。 */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: '110000', // UInt64、文字列として渡す必要があります
    },
  })
  ```
  ただし、最近のNode.jsバージョンでは受信ヘッダーの合計サイズに16KBの制限があることに注意してください。進捗ヘッダーを受信した後、私たちのテストでは約70〜80の量を受信した時点で例外が生成されます。

  接続が失われたときにミューテーションがキャンセルされないHTTPインターフェースの「機能」を活用して、待機時間を完全に回避する別のアプローチを使用することも可能です。詳細については、[この例（パート2）](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts)を参照してください。

* Keep-Alive機能を完全に無効にすることもできます。この場合、クライアントはすべてのリクエストに `Connection: close` ヘッダーを追加し、基盤となるHTTPエージェントは接続を再利用しません。`keep_alive.idle_socket_ttl` 設定は無視されるため、アイドルソケットは存在しません。結果として、各リクエストごとに新しい接続が確立されるため、追加のオーバーヘッドが発生します。

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```

### 読み取り専用ユーザー {#read-only-users}

[readonly=1ユーザー](/operations/settings/permissions-for-queries#readonly)でクライアントを使用する場合、レスポンス圧縮を有効にすることはできません。これは `enable_http_compression` 設定を必要とするからです。以下の設定ではエラーが発生します：

```ts
const client = createClient({
  compression: {
    response: true, // readonly=1ユーザーでは機能しません
  },
})
```

さらに、[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)でも readonly=1ユーザーの制限についての詳細が確認できます。

### パス名付きプロキシ {#proxy-with-a-pathname}

ClickHouseインスタンスがプロキシの背後にあり、URLに http://proxy:8123/clickhouse_server のようにパス名が含まれている場合、`clickhouse_server` を `pathname` 設定オプションとして指定してください（先頭のスラッシュの有無にかかわらず）。そうしないと、`url` に直接指定された場合、`database` オプションとして扱われます。複数のセグメントがサポートされており、例：`/my_proxy/db` です。

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```

### 認証付きリバースプロキシ {#reverse-proxy-with-authentication}

ClickHouseのデプロイメントの前に認証付きのリバースプロキシがある場合、必要なヘッダーを提供するために `http_headers` 設定を使用できます：

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```

### カスタムHTTP/HTTPSエージェント（実験的、Node.js専用） {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
これは実験的な機能であり、将来のリリースで後方互換性のない方法で変更される可能性があります。クライアントが提供するデフォルトの実装と設定は、ほとんどのユースケースで十分です。この機能は、本当に必要な場合のみ使用してください。
:::

デフォルトでは、クライアントはクライアント設定で提供された設定（`max_open_connections`、`keep_alive.enabled`、`tls`など）を使用して基盤となるHTTP(s)エージェントを構成し、ClickHouseサーバーへの接続を処理します。さらに、TLS証明書が使用されている場合、基盤となるエージェントは必要な証明書で構成され、正しいTLS認証ヘッダーが強制されます。

1.2.0以降、クライアントにカスタムHTTP(s)エージェントを提供し、デフォルトのものを置き換えることが可能になりました。これは、複雑なネットワーク設定の場合に役立ちます。カスタムエージェントが提供される場合、次の条件が適用されます：
- `max_open_connections`および`tls`オプションは _効果を持たず_ 、クライアントによって無視されます。これは基盤となるエージェントの設定の一部だからです。
- `keep_alive.enabled`は `Connection` ヘッダーのデフォルト値を規制します（`true` -> `Connection: keep-alive`、`false` -> `Connection: close`）。
- アイドルのKeep-Aliveソケット管理は引き続き機能します（これはエージェントに結びついているのではなく、特定のソケット自体に結びついているため）が、`keep_alive.idle_socket_ttl` の値を `0` に設定することで、完全に無効にすることも可能です。

#### カスタムエージェント使用例 {#custom-agent-usage-examples}

証明書なしでカスタムHTTP(s)エージェントを使用：

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

基本的なTLSとCA証明書を使用したカスタムHTTPSエージェント：

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
  // カスタムHTTPSエージェントを使用する場合、クライアントはデフォルトのHTTPS接続実装を使用しません。ヘッダーは手動で提供する必要があります。
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
  },
  // 重要：認証ヘッダーはTLSヘッダーと競合します。無効にしてください。
  set_basic_auth_header: false,
})
```

相互TLSを使用したカスタムHTTPSエージェント：

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
  // カスタムHTTPSエージェントを使用する場合、クライアントはデフォルトのHTTPS接続実装を使用しません。ヘッダーは手動で提供する必要があります。
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
    'X-ClickHouse-SSL-Certificate-Auth': 'on',
  },
  // 重要：認証ヘッダーはTLSヘッダーと競合します。無効にしてください。
  set_basic_auth_header: false,
})
```

証明書 _と_ カスタム _HTTPS_ エージェントを使用する場合、デフォルトの認証ヘッダーを `set_basic_auth_header` 設定（1.2.0で導入）で無効にする必要がある可能性が高いです。これはTLSヘッダーと競合するためです。すべてのTLSヘッダーは手動で提供する必要があります。

## 既知の制限 (Node.js/Web) {#known-limitations-nodejsweb}

- 結果セットにデータマッパーは存在しないため、言語のプリミティブのみが使用されます。特定のデータ型マッパーは、[RowBinary形式サポート](https://github.com/ClickHouse/clickhouse-js/issues/216)の計画に含まれています。
- 一部の[Decimal*およびDate*/DateTime*データ型に関する注意事項](./js.md#datedate32-types-caveats)があります。
- JSON*ファミリー形式を使用する場合、Int32より大きな数字は文字列として表現されます。これはInt64+型の最大値が `Number.MAX_SAFE_INTEGER` より大きいためです。詳細については[整数型](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256)セクションを参照してください。

## 既知の制限 (Web) {#known-limitations-web}

- Selectクエリのストリーミングは機能しますが、挿入に関しては無効になっています（型レベルでも）。
- リクエスト圧縮は無効であり、設定が無視されます。レスポンス圧縮は機能します。
- ロギングサポートはまだありません。

## パフォーマンス最適化のためのヒント {#tips-for-performance-optimizations}

- アプリケーションのメモリ消費を抑えるために、大きな挿入（例：ファイルから）や適用可能な場合は選択にストリームを使用することを検討してください。イベントリスナーや同様のユースケースの場合、[非同期挿入](/optimize/asynchronous-inserts)が別の良いオプションとなり、クライアントサイドでのバッチ処理の最小化または完全回避を実現できます。非同期挿入の例は、[クライアントリポジトリ](https://github.com/ClickHouse/clickhouse-js/tree/main/examples)に `async_insert_` のファイル名接頭辞で利用可能です。
- クライアントはデフォルトでリクエストまたはレスポンス圧縮を有効にしません。ただし、大規模なデータセットの選択または挿入時には、`ClickHouseClientConfigOptions.compression`（リクエストまたはレスポンス、または両方のいずれか）を通じて圧縮を有効にすることを検討できます。
- 圧縮を有効にするとパフォーマンスに大きなペナルティが発生します。リクエストやレスポンスの圧縮を有効にすると、選択や挿入の速度に悪影響を及ぼしますが、アプリケーションによって転送されるネットワークトラフィックの量を減少させることができます。

## お問い合わせ {#contact-us}

ご質問やお手伝いが必要な場合は、[コミュニティSlack](https://clickhouse.com/slack)（`#clickhouse-js`チャンネル）または[GitHubの問題](https://github.com/ClickHouse/clickhouse-js/issues)を通じてお気軽にお問い合わせください。
