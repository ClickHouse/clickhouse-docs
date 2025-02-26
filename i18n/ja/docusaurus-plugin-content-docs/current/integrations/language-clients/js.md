---
sidebar_label: JavaScript
sidebar_position: 4
keywords: [clickhouse, js, JavaScript, NodeJS, web, browser, Cloudflare, workers, client, connect, integrate]
slug: /integrations/javascript
description: ClickHouse に接続するための公式な JS クライアントです。
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# ClickHouse JS

ClickHouse に接続するための公式な JS クライアントです。
このクライアントは TypeScript で記述されており、クライアントの公開 API の型定義を提供します。

依存関係はゼロで、最大パフォーマンスのために最適化されており、さまざまな ClickHouse バージョンと構成（オンプレミスの単一ノード、オンプレミスのクラスター、ClickHouse Cloud）でテストされています。

異なる環境にために利用可能なクライアントのバージョンは次の2つです：
- `@clickhouse/client` - Node.js 専用
- `@clickhouse/client-web` - ブラウザ（Chrome/Firefox）、Cloudflare Workers

TypeScript を使用する場合は、少なくとも [バージョン 4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html) であることを確認してください。これにより、[インラインのインポートおよびエクスポート構文](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)が有効になります。

クライアントのソースコードは、[ClickHouse-JS GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-js) で入手できます。

## 環境要件 (Node.js) {#environment-requirements-nodejs}

クライアントを実行するには、環境に Node.js が必要です。
クライアントは、すべての [メンテナンス中の](https://github.com/nodejs/release#readme) Node.js リリースに互換性があります。

Node.js のバージョンが EOL に近づくと、クライアントはそのサポートを終了します。これは、古くて安全でないと見なされるからです。

現在の Node.js バージョンのサポート：

| Node.js バージョン | サポートされている？ |
|---------------------|----------------------|
| 22.x                | ✔                    |
| 20.x                | ✔                    |
| 18.x                | ✔                    |
| 16.x                | ベストエフォート     |

## 環境要件 (Web) {#environment-requirements-web}

クライアントのウェブバージョンは、最新の Chrome/Firefox ブラウザで正式にテストされており、React/Vue/Angular アプリケーション、または Cloudflare Workers で依存関係として使用できます。

## インストール {#installation}

最新の安定した Node.js クライアントバージョンをインストールするには、次のコマンドを実行します：

```sh
npm i @clickhouse/client
```

ウェブバージョンのインストール：

```sh
npm i @clickhouse/client-web
```

## ClickHouse との互換性 {#compatibility-with-clickhouse}

| クライアントバージョン | ClickHouse  |
|------------------------|-------------|
| 1.8.0                 | 23.3+       |

おそらく、クライアントは古いバージョンでも動作しますが、これはベストエフォートサポートであり、保証されていません。ClickHouse バージョンが 23.3 より古い場合は、[ClickHouse セキュリティポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)を参照し、アップグレードを検討してください。

## 例 {#examples}

クライアントの使用シナリオをカバーすることを目指しており、[クライアントリポジトリの例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples)を提供しています。

概要は、[例の README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview)で利用可能です。

何か不明な点や、例や以下のドキュメントに欠けている内容があれば、お気軽に [お問い合わせ](./js.md#contact-us)ください。

### クライアント API {#client-api}

ほとんどの例は、特に明記されていない限り、Node.js およびウェブバージョンのクライアントの両方と互換性があります。

#### クライアントインスタンスの作成 {#creating-a-client-instance}

`createClient` ファクトリを使用して、必要な数だけクライアントインスタンスを作成できます：

```ts
import { createClient } from '@clickhouse/client' // または '@clickhouse/client-web'

const client = createClient({
  /* 設定 */
})
```

環境が ESM モジュールをサポートしていない場合は、代わりに CJS 構文を使用できます：

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* 設定 */
})
```

クライアントインスタンスは、インスタンス化の際に [事前設定](./js.md#configuration)できます。

#### 設定 {#configuration}

クライアントインスタンスを作成する際に、次の接続設定を調整できます：

| 設定                                                   | 説明                                                                                       | デフォルト値                  | 詳細                                                                                                                     |
|------------------------------------------------------|--------------------------------------------------------------------------------------------|-------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| **url**?: string                                     | ClickHouse インスタンスの URL。                                                            | `http://localhost:8123`      | [URL 設定のドキュメント](./js.md#url-configuration)                                                                     |
| **pathname**?: string                                | クライアントによって解析された ClickHouse URL に追加されるオプションのパス名。           | `''`                          | [パス名付きプロキシのドキュメント](./js.md#proxy-with-a-pathname)                                                     |
| **request_timeout**?: number                         | リクエストのタイムアウト（ミリ秒）。                                                      | `30_000`                      | -                                                                                                                        |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }` | 圧縮を有効にします。                                                                       | -                             | [圧縮のドキュメント](./js.md#compression)                                                                                |
| **username**?: string                                | リクエストが行われるユーザーの名前。                                                      | `default`                     | -                                                                                                                        |
| **password**?: string                                | ユーザーパスワード。                                                                       | `''`                          | -                                                                                                                        |
| **application**?: string                             | Node.js クライアントを使用しているアプリケーションの名前。                                | `clickhouse-js`               | -                                                                                                                        |
| **database**?: string                                | 使用するデータベース名。                                                                   | `default`                     | -                                                                                                                        |
| **clickhouse_settings**?: ClickHouseSettings        | すべてのリクエストに適用される ClickHouse 設定。                                          | `{}`                          | -                                                                                                                        |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 内部クライアントログの設定。                                                                | -                             | [ロギングのドキュメント](./js.md#logging-nodejs-only)                                                                      |
| **session_id**?: string                              | 各リクエストに送信されるオプションの ClickHouse セッション ID。                          | -                             | -                                                                                                                        |
| **keep_alive**?: `{ **enabled**?: boolean }`       | Node.js およびウェブバージョンの両方でデフォルトで有効。                                   | -                             | -                                                                                                                        |
| **http_headers**?: `Record<string, string>`         | ClickHouse への追加の HTTP ヘッダー。                                                      | -                             | [認証付きリバースプロキシのドキュメント](./js.md#reverse-proxy-with-authentication)                                   |
| **roles**?: string \|  string[]                    | 送信するリクエストに付加する ClickHouse ロール名。                                        | -                             | [HTTPインターフェースでのロールの使用](/interfaces/http#setting-role-with-query-parameters)                         |

#### Node.js 特有の設定パラメータ {#nodejs-specific-configuration-parameters}

| 設定                                                  | 説明                                                                                       | デフォルト値 | 詳細                                                                                                               |
|------------------------------------------------------|--------------------------------------------------------------------------------------------|---------------|--------------------------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                    | ホストごとに許可される最大接続ソケット数。                                                | `10`          | -                                                                                                                  |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }` | TLS 証明書を構成します。                                                                     | -             | [TLS のドキュメント](./js.md#tls-certificates-nodejs-only)                                                       |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                                                          | -             | [Keep Alive のドキュメント](./js.md#keep-alive-configuration-nodejs-only)                                       |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>     | クライアント用のカスタム HTTP エージェント。                                                | -             | [HTTP エージェントのドキュメント](./js.md#custom-httphttps-agent-experimental-nodejs-only)                   |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>            | ベーシック認証資格情報で `Authorization` ヘッダーを設定します。                          | `true`        | [この設定の使用方法は HTTP エージェントのドキュメントを参照](./js.md#custom-httphttps-agent-experimental-nodejs-only) |

### URL 設定 {#url-configuration}

:::important
URL 設定は _常に_ ハードコーディングされた値を上書きし、この場合は警告がログに記録されます。
:::

クライアントインスタンスのほとんどのパラメータは、URLで構成できます。URL形式は、`http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`です。ほとんどのケースでは、特定のパラメータの名前はその設定オプションインターフェース内のパスを反映していますが、いくつかの例外があります。サポートされているパラメータは次のとおりです：

| パラメータ                                    | タイプ                                                   |
|---------------------------------------------|--------------------------------------------------------|
| `pathname`                                | 任意の文字列。                                        |
| `application_id`                          | 任意の文字列。                                        |
| `session_id`                              | 任意の文字列。                                        |
| `request_timeout`                         | 非負の数値。                                          |
| `max_open_connections`                    | 非負の数値、ゼロより大きい。                           |
| `compression_request`                     | ブール値。以下を参照（1）                              |
| `compression_response`                    | ブール値。                                            |
| `log_level`                               | 許可される値: `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`。 |
| `keep_alive_enabled`                      | ブール値。                                            |
| `clickhouse_setting_*` または `ch_*`        | 以下を参照（2）                                      |
| `http_header_*`                           | 以下を参照（3）                                      |
| (Node.js のみ) `keep_alive_idle_socket_ttl` | 非負の数値。                                          |

- (1) ブール値の場合、有効な値は `true`/`1` と `false`/`0` です。
- (2) `clickhouse_setting_` または `ch_` プレフィックスを持つ任意のパラメータは、このプレフィックスが削除され、残りがクライアントの `clickhouse_settings` に追加されます。たとえば、`?ch_async_insert=1&ch_wait_for_async_insert=1` は次のようになります：

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

注意：`clickhouse_settings` のブール値は、URLで `1`/`0` として渡す必要があります。

- (3) (2) と類似していますが、`http_header` 設定用です。たとえば、`?http_header_x-clickhouse-auth=foobar` は次のようになります：

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

#### 接続の概要 {#connection-overview}

クライアントは、HTTP(s) プロトコルを介した接続を実装しています。RowBinary のサポートは進行中で、[関連する問題](https://github.com/ClickHouse/clickhouse-js/issues/216)を参照してください。

次の例は、ClickHouse Cloud に接続する方法を示しています。このコードは、`url`（プロトコルとポートを含む）および `password` の値が環境変数として指定され、`default` ユーザーが使用されることを前提としています。

**例：** 環境変数を使用して Node.js クライアントインスタンスを作成します。

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

クライアントリポジトリには、[ClickHouse Cloud にテーブルを作成](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)、[非同期挿入の使用](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts)、その他多くの例が含まれています。

#### コネクションプール (Node.js のみ) {#connection-pool-nodejs-only}

毎回リクエストごとに接続を確立するオーバーヘッドを避けるために、クライアントは ClickHouse への接続プールを作成し、再利用します。デフォルトでは、Keep-Alive が有効で、接続プールのサイズは `10` に設定されていますが、`max_open_connections` [設定オプション](./js.md#configuration)で変更できます。

ユーザーが `max_open_connections: 1` を設定しない限り、プール内の同じ接続が次のクエリで使用される保証はありません。これはめったに必要ありませんが、ユーザーが一時テーブルを使用しているケースでは必要になる場合があります。

詳細については、[Keep-Alive 設定](./js.md#keep-alive-configuration-nodejs-only)を参照してください。

### クエリ ID {#query-id}

クエリやステートメントを送信するすべてのメソッド（`command`、`exec`、`insert`、`select`）は、結果に `query_id` を提供します。このユニークな識別子はクライアントがクエリごとに割り当て、`system.query_log` からデータを取得する際に便利です。これは、[サーバー設定](/operations/server-configuration-parameters/settings#server_configuration_parameters-query-log)で有効にする必要があります。また、長時間実行されるクエリをキャンセルするためにも使用できます（[例を参照](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)）。必要に応じて、`command`/`query`/`exec`/`insert` メソッドのパラメータで `query_id` を上書きできます。

:::tip
`query_id` パラメータを上書きする場合は、各呼び出しの一意性を確保する必要があります。ランダムな UUID は良い選択です。
:::

### すべてのクライアントメソッドの基本パラメータ {#base-parameters-for-all-client-methods}

すべてのクライアントメソッドに適用できるいくつかのパラメータがあります（[query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)）。

```ts
interface BaseQueryParams {
  // クエリレベルで適用できる ClickHouse 設定。
  clickhouse_settings?: ClickHouseSettings
  // クエリバインディング用のパラメータ。
  query_params?: Record<string, unknown>
  // 進行中のクエリをキャンセルするための AbortSignal インスタンス。
  abort_signal?: AbortSignal
  // query_id の上書き；指定しない場合、ランダムな識別子が自動的に生成されます。
  query_id?: string
  // session_id の上書き；指定しない場合、セッション ID はクライアント設定から取得されます。
  session_id?: string
  // 認証情報の上書き；指定しない場合、クライアントの認証情報が使用されます。
  auth?: { username: string, password: string }
  // このクエリに使用する特定のロールのリスト。クライアント設定に設定されたロールを上書きします。
  role?: string | Array<string>
}
```

### クエリメソッド {#query-method}

これは、`SELECT` などの応答がある可能性があるほとんどのステートメント、または `CREATE TABLE` のような DDL を送信するために使用され、`await` を使用する必要があります。返される結果セットは、アプリケーション内で消費されることが期待されます。

:::note
データ挿入専用のメソッド [insert](./js.md#insert-method) と DDL 用の [command](./js.md#command-method) があります。
:::

```ts
interface QueryParams extends BaseQueryParams {
  // 実行するクエリ。データを返す可能性があります。
  query: string
  // 結果データセットの形式。デフォルト: JSON。
  format?: DataFormat
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>
}
```

詳細については、[すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)を参照してください。

:::tip
`query` で FORMAT 句を指定しないでください。代わりに `format` パラメータを使用してください。
:::

#### 結果セットと行の抽象化 {#result-set-and-row-abstractions}

`ResultSet` は、アプリケーション内でのデータ処理のためのいくつかの便利なメソッドを提供します。

Node.js の `ResultSet` 実装は、内部で `Stream.Readable` を使用しますが、ウェブバージョンは Web API `ReadableStream` を使用します。

`ResultSet` は、`ResultSet` の `text` または `json` メソッドを呼び出すことで消費でき、クエリから返されたすべての行をメモリにロードします。

`ResultSet` をできるだけ早く消費し始めるべきです。これは応答ストリームをオープンにしたままにし、それにより基盤となる接続を忙しくさせます。クライアントは受信データをバッファリングせず、アプリケーションによる過剰なメモリ使用を回避します。

別の方法として、メモリに一度に収まるには大きすぎる場合、`stream` メソッドを呼び出して、ストリーミングモードでデータを処理できます。応答チャンクの各部分は、行の比較的小さい配列に変換されます（この配列のサイズは、サーバーからクライアントが受信する特定のチャンクのサイズによって変動する可能性があり、特定の行のサイズによっても異なります）。

どのデータ形式がストリーミングに最適かを判断するには、[サポートされているデータ形式](./js.md#supported-data-formats)のリストを参照してください。たとえば、JSON オブジェクトをストリーミングしたい場合は、[JSONEachRow](/sql-reference/formats#jsoneachrow) を選択できます。この場合、各行は JS オブジェクトとして解析されます。また、各行を値のコンパクトな配列とするcompactな[JSONCompactColumns](/sql-reference/formats#jsoncompactcolumns)形式も選択可能です。詳細については、[ストリーミングファイル](./js.md#streaming-files-nodejs-only)を参照してください。

:::important
`ResultSet` またはそのストリームが完全に消費されなかった場合、非活動の `request_timeout` 期間後に破棄されます。
:::

```ts
interface BaseResultSet<Stream> {
  // 上記の「クエリ ID」セクションを参照
  query_id: string

  // ストリーム全体を消費し、内容を文字列として取得します
  // すべての DataFormat で使用できます
  // 一度だけ呼び出す必要があります
  text(): Promise<string>

  // ストリーム全体を消費し、内容を JS オブジェクトとして解析します
  // JSON 形式でのみ使用できます
  // 一度だけ呼び出す必要があります
  json<T>(): Promise<T>

  // ストリーム可能な応答に対して読み取り可能なストリームを返します
  // ストリームをイテレートすると、選択した DataFormat の Row[] の配列が提供されます
  // 一度だけ呼び出す必要があります
  stream(): Stream
}

interface Row {
  // 行の内容をプレーンな文字列として取得します
  text: string

  // 行の内容を JS オブジェクトとして解析します
  json<T>(): T
}
```

**例：** (Node.js/Web) `JSONEachRow` 形式のデータセットを持つクエリ全体を消費し、内容を JS オブジェクトとして解析します。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // または `row.text` を使用して JSON の解析を避ける
```

**例：** (Node.js のみ) `JSONEachRow` 形式のクエリ結果をストリーミングします。従来の `on('data')` アプローチを使用しています。これは `for await const` 構文と同等です。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // または JSONCompactEachRow、JSONStringsEachRow など。
})
const stream = rows.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.json()) // または `row.text` を使用して JSON の解析を避ける
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

**例：** (Node.js のみ) `CSV` 形式のクエリ結果をストリーミングします。従来の `on('data')` アプローチを使用しています。これは `for await const` 構文と同等です。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'CSV', // または TabSeparated、CustomSeparated など。
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

**例：** (Node.js のみ) `JSONEachRow` 形式で結果を JS オブジェクトとしてストリーミングします。`for await const` 構文を使用して消費します。これは従来の `on('data')` アプローチと同等です。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers LIMIT 10',
  format: 'JSONEachRow', // または JSONCompactEachRow、JSONStringsEachRow など。
})
for await (const rows of resultSet.stream()) {
  rows.forEach(row => {
    console.log(row.json())
  })
}
```

:::note
`for await const` 構文は `on('data')` アプローチよりも若干コードが少なくなりますが、パフォーマンスに悪影響を及ぼす可能性があります。  
詳細については、[Node.js リポジトリのこの問題](https://github.com/nodejs/node/issues/31979)を参照してください。
:::

**例：** (Web のみ) オブジェクトの `ReadableStream` をイテレーションします。

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

戻り値の型は最小限であり、サーバーからデータが返されることを期待しておらず、すぐに応答ストリームを排出します。

挿入メソッドに空の配列が指定された場合、挿入ステートメントはサーバーに送信されず、代わりにメソッドは `{ query_id: '...', executed: false }` ですぐに解決されます。この場合、メソッドパラメータに `query_id` が指定されていなければ、結果の中で空の文字列になります。これは、クライアントによって生成されたランダムな UUID が混乱を招く可能性があるためです。その `query_id` でのクエリは `system.query_log` テーブルには存在しません。

挿入ステートメントがサーバーに送信された場合、`executed` フラグは `true` になります。

#### 挿入メソッドと Node.js におけるストリーミング {#insert-method-and-streaming-in-nodejs}

これは、`Stream.Readable` または単純な `Array<T>` のいずれかで動作できます。これは、`insert` メソッドに指定された [データ形式](./js.md#supported-data-formats)に依存します。詳細については、[ファイルストリーミング](./js.md#streaming-files-nodejs-only)に関するこのセクションを参照してください。

挿入メソッドは `await` されることが期待されますが、入力ストリームを指定し、そのストリームが完了したときに `insert` 操作を待機することもできます（これにより `insert` のプロミスも解決されます）。これは、イベントリスナーや類似のシナリオで役立つ可能性がありますが、多くのエッジケースでクライアント側のエラーハンドリングが簡単ではないかもしれません。代わりに、[非同期挿入](/optimize/asynchronous-inserts)の使用を検討してください。これは、[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts)で示されています。

:::tip
挿入ステートメントが難しい場合は、[command メソッド](./js.md#command-method)の使用を考慮してください。

[INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) や [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) の例でどのように使用されるか確認できます。
:::

```ts
interface InsertParams<T> extends BaseQueryParams {
  // データを挿入するテーブル名
  table: string
  // 挿入するデータセット。
  values: ReadonlyArray<T> | Stream.Readable
  // 挿入するデータセットの形式。
  format?: DataFormat
  // データが挿入されるカラムを指定します。
  // - `['a', 'b']` のような配列は、`INSERT INTO table (a, b) FORMAT DataFormat` を生成します。
  // - `{ except: ['a', 'b'] }` のようなオブジェクトは、`INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat` を生成します。
  // デフォルトでは、データはテーブルのすべてのカラムに挿入され、生成されるステートメントは `INSERT INTO table FORMAT DataFormat` になります。
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

詳細については、[すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)を参照してください。

:::important
`abort_signal` でキャンセルされたリクエストは、データの挿入が行われなかったことを保証しません。サーバーはキャンセル前にストリーミングデータの一部を受信した可能性があります。
:::

**例：** (Node.js/Web) 値の配列を挿入します。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
await client.insert({
  table: 'my_table',
  // 構造は希望する形式に一致している必要があります。この例では JSONEachRow
  values: [
    { id: 42, name: 'foo' },
    { id: 42, name: 'bar' },
  ],
  format: 'JSONEachRow',
})
```

**例：** (Node.js のみ) CSV ファイルからストリームを挿入します。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。詳細については、[ファイルストリーミング](./js.md#streaming-files-nodejs-only)を参照してください。

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**例：** 挿入ステートメントから特定のカラムを除外します。

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
  // この行の id カラムの値はゼロ（UInt32 のデフォルト）になります
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
  // この行の message カラムの値は空の文字列になります
  columns: {
    except: ['message'],
  },
})
```

追加の詳細については、[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts)を参照してください。

**例：** クライアントインスタンスで提供されているデータベースとは異なるデータベースに挿入します。  
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: 일부         // このコードは続きます...
```
```javascript
table: 'mydb.mytable', // データベースを含む完全修飾名
values: [{ id: 42, message: 'foo' }],
format: 'JSONEachRow',
})
```

#### Webバージョンの制限 {#web-version-limitations}

現在、`@clickhouse/client-web` での挿入は `Array<T>` および `JSON*` 形式でのみ機能します。
ブラウザの互換性が低いため、Webバージョンではストリーミングの挿入はサポートされていません。

そのため、Webバージョンの `InsertParams` インターフェースは Node.js バージョンとは少し異なり、`values` は `ReadonlyArray<T>` 型のみに制限されています：

```ts
interface InsertParams<T> extends BaseQueryParams {
  // データを挿入するテーブル名
  table: string
  // 挿入するデータセット
  values: ReadonlyArray<T>
  // 挿入するデータセットの形式
  format?: DataFormat
  // データを挿入するカラムを指定可能
  // - `['a', 'b']` のような配列は、`INSERT INTO table (a, b) FORMAT DataFormat` を生成します
  // - `{ except: ['a', 'b'] }` のようなオブジェクトは、`INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat` を生成します
  // デフォルトでは、データはテーブルのすべてのカラムに挿入され、
  // 生成される文は `INSERT INTO table FORMAT DataFormat` になります。
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

これは将来的に変更される可能性があります。詳細は：[すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)を参照してください。

### コマンドメソッド {#command-method}

出力を必要としないステートメントや、フォーマット句が適用できない場合、またはレスポンスに興味がない場合に使用できます。そのようなステートメントの例には `CREATE TABLE` や `ALTER TABLE` があります。

待機する必要があります。

レスポンスストリームは即座に破棄され、下位のソケットが解放されます。

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

詳細は：[すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)を参照してください。

**例:** (Node.js/Web) ClickHouse Cloud にテーブルを作成します。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)。

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // クエリ処理エラーがレスポンスコードの後に発生した場合の状況を避けるため、クラスタ使用時に推奨されます。
  // すでにHTTPヘッダーがクライアントに送信されている可能性があります。
  // 詳細は https://clickhouse.com/docs/interfaces/http/#response-buffering を参照してください。
  clickhouse_settings: {
    wait_end_of_query: 1,
  },
})
```

**例:** (Node.js/Web) セルフホスト型 ClickHouse インスタンスにテーブルを作成します。 
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

**例:** (Node.js/Web) SELECT から INSERT

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`,
})
```

:::important
`abort_signal` でキャンセルされたリクエストは、サーバーによってステートメントが実行されなかったことを保証するものではありません。
:::

### Exec メソッド {#exec-method}

`query`/`insert` に適合しないカスタムクエリがあり、結果が必要な場合は、`exec` を `command` の代替として使用できます。

`exec` は、アプリケーション側で消費または破棄する必要がある読み取り可能なストリームを返します。

```ts
interface ExecParams extends BaseQueryParams {
  // 実行するステートメント
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

詳細は：[すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)を参照してください。

Node.js と Web バージョンでストリームの戻り値の型が異なります。

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

接続状況を確認するために提供されている `ping` メソッドは、サーバーに到達可能な場合は `true` を返します。

サーバーが到達できない場合は、関連するエラーも結果に含まれます。

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }

interface ClickHouseClient {
  ping(): Promise<PingResult>
}
```

Ping は、特に ClickHouse Cloud の場合、インスタンスがアイドル状態になっており、Ping でウェイクアップする可能性があるため、アプリケーションの起動時にサーバーが使用可能かどうかを確認する便利なツールです。

**例:** (Node.js/Web) ClickHouse サーバーインスタンスに Ping を送信します。注意：Web バージョンでは、キャッチされたエラーが異なる場合があります。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // result.error を処理する
}
```

注意：`/ping` エンドポイントが CORS を実装していないため、Web バージョンでは `SELECT 1` を使用して類似の結果を取得します。

### Close (Node.js のみ) {#close-nodejs-only}

すべてのオープン接続を閉じてリソースを解放します。Web バージョンでは無効操作です。

```ts
await client.close()
```

## ストリーミングファイル (Node.js のみ) {#streaming-files-nodejs-only}

人気のデータ形式 (NDJSON、CSV、Parquet) を使用したファイルストリーミングの例がいくつかクライアントリポジトリにあります。

- [NDJSON ファイルからストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [CSV ファイルからストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Parquet ファイルからストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Parquet ファイルにストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

他の形式をファイルにストリーミングするのも Parquet に似ているはずで、
唯一の違いは `query` 呼び出しに使用される形式 ( `JSONEachRow`、 `CSV` など) と出力ファイル名です。

## サポートされるデータ形式 {#supported-data-formats}

クライアントはデータ形式を JSON またはテキストとして処理します。

`format` を JSONファミリーの一つ (`JSONEachRow`、 `JSONCompactEachRow` など) として指定すると、クライアントは通信中にデータをシリアライズおよびデシリアライズします。

"生" テキスト形式 (`CSV`、 `TabSeparated`、及び `CustomSeparated` ファミリー) で提供されるデータは、追加の変換なしで通信されます。

:::tip
一般的な形式としての JSON と [ClickHouse JSON 形式](/sql-reference/formats#json) との間に混乱が生じる可能性があります。

クライアントは、[JSONEachRow](/sql-reference/formats#jsoneachrow) などの形式でストリーミング JSON オブジェクトをサポートしています (ストリーミングに適した形式の他の表を参照; クライアントリポジトリの `select_streaming_` [例]（https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node）も参照)。

形式の中には、[ClickHouse JSON](/sql-reference/formats#json) や他のいくつかは、レスポンス内で単一のオブジェクトとして表現され、クライアントによってストリーミングされることはできません。
:::

| 形式                                      | 入力 (配列) | 入力 (オブジェクト) | 入力/出力 (ストリーム) | 出力 (JSON) | 出力 (テキスト)  |
|-------------------------------------------|-------------|--------------------|-------------------------|--------------|------------------|
| JSON                                      | ❌           | ✔️                  | ❌                       | ✔️           | ✔️               |
| JSONCompact                               | ❌           | ✔️                  | ❌                       | ✔️           | ✔️               |
| JSONObjectEachRow                         | ❌           | ✔️                  | ❌                       | ✔️           | ✔️               |
| JSONColumnsWithMetadata                   | ❌           | ✔️                  | ❌                       | ✔️           | ✔️               |
| JSONStrings                               | ❌           | ❌                  | ❌                       | ✔️           | ✔️               |
| JSONCompactStrings                        | ❌           | ❌                  | ❌                       | ✔️           | ✔️               |
| JSONEachRow                               | ✔️           | ❌                  | ✔️                       | ✔️           | ✔️               |
| JSONEachRowWithProgress                   | ❌           | ❌                  | ✔️ ❗- 下記参照        | ✔️           | ✔️               |
| JSONStringsEachRow                        | ✔️           | ❌                  | ✔️                       | ✔️           | ✔️               |
| JSONCompactEachRow                        | ✔️           | ❌                  | ✔️                       | ✔️           | ✔️               |
| JSONCompactStringsEachRow                 | ✔️           | ❌                  | ✔️                       | ✔️           | ✔️               |
| JSONCompactEachRowWithNames               | ✔️           | ❌                  | ✔️                       | ✔️           | ✔️               |
| JSONCompactEachRowWithNamesAndTypes       | ✔️           | ❌                  | ✔️                       | ✔️           | ✔️               |
| JSONCompactStringsEachRowWithNames        | ✔️           | ❌                  | ✔️                       | ✔️           | ✔️               |
| JSONCompactStringsEachRowWithNamesAndTypes| ✔️           | ❌                  | ✔️                       | ✔️           | ✔️               |
| CSV                                       | ❌           | ❌                  | ✔️                       | ❌           | ✔️               |
| CSVWithNames                              | ❌           | ❌                  | ✔️                       | ❌           | ✔️               |
| CSVWithNamesAndTypes                      | ❌           | ❌                  | ✔️                       | ❌           | ✔️               |
| TabSeparated                              | ❌           | ❌                  | ✔️                       | ❌           | ✔️               |
| TabSeparatedRaw                           | ❌           | ❌                  | ✔️                       | ❌           | ✔️               |
| TabSeparatedWithNames                     | ❌           | ❌                  | ✔️                       | ❌           | ✔️               |
| TabSeparatedWithNamesAndTypes             | ❌           | ❌                  | ✔️                       | ❌           | ✔️               |
| CustomSeparated                           | ❌           | ❌                  | ✔️                       | ❌           | ✔️               |
| CustomSeparatedWithNames                  | ❌           | ❌                  | ✔️                       | ❌           | ✔️               |
| CustomSeparatedWithNamesAndTypes          | ❌           | ❌                  | ✔️                       | ❌           | ✔️               |
| Parquet                                   | ❌           | ❌                  | ✔️                       | ❌           | ✔️❗- 下記参照  |

Parquet に関しては、選択の主な使用例は結果ストリームをファイルに書き込むことになります。クライアントリポジトリの [例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts) を参照してください。

`JSONEachRowWithProgress` はストリーム内で進捗報告をサポートする出力専用形式です。詳細については、[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)を参照してください。

ClickHouse の入力および出力形式の完全なリストは 
[こちら](/interfaces/formats) で入手できます。

## サポートされる ClickHouse データ型 {#supported-clickhouse-data-types}

:::note
関連する JS 型は、すべての `JSON*` 形式に関連性があり、すべてが文字列として表現される形式 (例: `JSONStringEachRow`) には該当しません。
:::

| 型                   | ステータス       | JS 型                     |
|----------------------|------------------|---------------------------|
| UInt8/16/32          | ✔️               | number                    |
| UInt64/128/256       | ✔️ ❗- 下記参照  | string                    |
| Int8/16/32           | ✔️               | number                    |
| Int64/128/256        | ✔️ ❗- 下記参照  | string                    |
| Float32/64           | ✔️               | number                    |
| Decimal              | ✔️ ❗- 下記参照  | number                    |
| Boolean              | ✔️               | boolean                   |
| String               | ✔️               | string                    |
| FixedString          | ✔️               | string                    |
| UUID                 | ✔️               | string                    |
| Date32/64            | ✔️               | string                    |
| DateTime32/64        | ✔️ ❗- 下記参照  | string                    |
| Enum                 | ✔️               | string                    |
| LowCardinality       | ✔️               | string                    |
| Array(T)             | ✔️               | T[]                       |
| (new) JSON           | ✔️               | object                    |
| Variant(T1, T2...)   | ✔️               | T (depends on the variant)|
| Dynamic              | ✔️               | T (depends on the variant)|
| Nested               | ✔️               | T[]                       |
| Tuple                | ✔️               | Tuple                     |
| Nullable(T)          | ✔️               | JS type for T or null     |
| IPv4                 | ✔️               | string                    |
| IPv6                 | ✔️               | string                    |
| Point                | ✔️               | [ number, number ]        |
| Ring                 | ✔️               | Array&lt;Point\>         |
| Polygon              | ✔️               | Array&lt;Ring\>          |
| MultiPolygon         | ✔️               | Array&lt;Polygon\>       |
| Map(K, V)            | ✔️               | Record&lt;K, V\>         |

サポートされる ClickHouse 形式の完全なリストは 
[こちら](/sql-reference/data-types/) で入手できます。

### Date/Date32 型に関する注意点 {#datedate32-types-caveats}

クライアントは追加の型変換なしで値を挿入するため、 `Date` / `Date32` タイプのカラムには文字列としてのみ挿入できます。

**例:** `Date` 型の値を挿入します。 
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)。

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

ただし、 `DateTime` または `DateTime64` カラムを使用している場合、文字列と JS Date オブジェクトの両方を使用できます。 JS Date オブジェクトはそのまま `insert` に渡すことができ、`date_time_input_format` が `best_effort` に設定されている必要があります。詳細は、この [例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts) を参照してください。

### Decimal* 型に関する注意点 {#decimal-types-caveats}

```
JSON*` ファミリー形式を使用して Decimal を挿入することができます。次のようにテーブルを定義したと仮定します。

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

文字列表現を使用して精度損失なしに値を挿入できます：

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

ただし、 `JSON*`形式でデータをクエリすると、ClickHouse はデフォルトで Decimal を _数字_として返し、精度損失を引き起こす可能性があります。これを回避するためには、クエリ内で Decimal を文字列にキャストできます：

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

詳細は、[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts)を参照してください。

### 整数型：Int64、Int128、Int256、UInt64、UInt128、UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

サーバーはそれを数値として受け入れることができますが、 `JSON*`ファミリーの出力形式では、最大値が `Number.MAX_SAFE_INTEGER` よりも大きいため、整数オーバーフローを避けるために文字列として返されます。

この動作は、[`output_format_json_quote_64bit_integers` 設定](/operations/settings/formats#output_format_json_quote_64bit_integers) によって変更可能です。

**例：** 64 ビット数の JSON 出力形式を調整します。

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

## ClickHouse 設定 {#clickhouse-settings}

クライアントは、[settings](/operations/settings/settings/) メカニズムを介して ClickHouse の動作を調整できます。
設定はクライアントインスタンスレベルで設定できるため、送信されるすべてのリクエストに適用されます：

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

すべてのサポートされている ClickHouse 設定の型宣言ファイルは 
[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts) で見つけられます。

:::important
クエリが行われるユーザーが設定を変更するのに十分な権限を持っていることを確認してください。
:::

## 高度なトピック {#advanced-topics}

### パラメータを持つクエリ {#queries-with-parameters}

パラメータを持つクエリを作成し、クライアントアプリケーションからそれらへの値を渡すことができます。これにより、クライアント側で特定の動的値を含むクエリをフォーマットする必要がなくなります。

クエリを通常通りフォーマットし、アプリからクエリへのパラメータとして渡す値を以下のフォーマットで中かっこに括ります：

```text
{<名前>: <データ型>}
```

ここで：

- `名前` — プレースホルダーの識別子。
- `データ型` - アプリパラメータの値の [データ型](/sql-reference/data-types/)。

**例：**パラメータ付きクエリ。 
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

詳細は、https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax を確認してください。

### 圧縮 {#compression}

注意：リクエスト圧縮は現在 Web バージョンでは利用できません。レスポンス圧縮は通常通り機能します。Node.js バージョンでは両方サポートされています。

大規模データセットを扱うデータアプリケーションは、圧縮を有効にすることから恩恵を受けることができます。現在、`GZIP` のみが [zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html) を使用してサポートされています。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

設定パラメータは次のとおりです：

- `response: true` は ClickHouse サーバーに圧縮されたレスポンスボディを返すよう指示します。デフォルト値： `response: false`
- `request: true` はクライアントリクエストボディの圧縮を有効にします。デフォルト値： `request: false`

### ロギング (Node.js のみ) {#logging-nodejs-only}

:::important
ロギングは実験的な機能であり、今後変更される可能性があります。
:::

デフォルトのロガー実装は、`console.debug/info/warn/error` メソッドを介して `stdout` にログレコードを出力します。
`LoggerClass` を提供することでロギングロジックをカスタマイズでき、希望するログレベルを `level` パラメータ (デフォルトは `OFF`) を介して選択できます：

```typescript
import type { Logger } from '@clickhouse/client'

// 3つの LogParams タイプはすべてクライアントによってエクスポートされています
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

現在、クライアントは以下のイベントをログ記録します：

- `TRACE` - Keep-Alive ソケットのライフサイクルに関する低レベル情報
- `DEBUG` - レスポンス情報 (承認ヘッダーとホスト情報を除く)
- `INFO` - あまり使用されず、クライアントが初期化されたときの現在のログレベルを出力します
- `WARN` - 非致命的エラー; 失敗した `ping` リクエストは警告としてログに記録され、関連エラーは返された結果に含まれます
- `ERROR` - `query` / `insert` / `exec` / `command` メソッドからの致命的エラー、たとえばリクエストの失敗

デフォルトのロガー実装は、[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts) で見つけることができます。

### TLS 証明書 (Node.js のみ) {#tls-certificates-nodejs-only}

Node.js クライアントは、基本的 (証明機関のみ) および相互 (証明機関とクライアント証明書) TLS の両方をオプションでサポートします。

基本的な TLS 設定の例は、証明書が `certs` フォルダーにあり、CA ファイル名が `CA.pem` であると仮定します：

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

クライアント証明書を使用した相互 TLS 設定の例：

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

リポジトリ内の [基本的](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) および [相互](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS の完全な例を参照してください。

### Keep-Alive 設定 (Node.js のみ) {#keep-alive-configuration-nodejs-only}

クライアントは、デフォルトで基盤の HTTP エージェントで Keep-Alive を有効にしており、接続されたソケットはその後のリクエストで再使用され、`Connection: keep-alive` ヘッダーが送信されます。アイドル状態のソケットは、デフォルトでは 2500 ミリ秒の間接続プールに残ります (このオプションを調整することについては [こちら](./js.md#adjusting-idle_socket_ttl) を参照してください)。

`keep_alive.idle_socket_ttl` の値は、サーバー/LB 設定よりもかなり低いものであるべきです。主な理由は、HTTP/1.1 がサーバーにソケットをクライアントに通知せずに閉じることを許可しているためであり、サーバーまたはロードバランサーがクライアントよりも前に接続を閉じると、クライアントは閉じられたソケットを再使用しようとし、`socket hang up` エラーが発生します。

`keep_alive.idle_socket_ttl` を変更する場合は、サーバー/LB の Keep-Alive 設定と常に同期させ、常にそれよりも **低く** する必要があり、サーバーがオープン接続を最初に閉じることがないようにする必要があります。

#### `idle_socket_ttl` の調整 {#adjusting-idle_socket_ttl}

クライアントは `keep_alive.idle_socket_ttl` を 2500 ミリ秒に設定しています。これは最も安全なデフォルトと見なされます。サーバー側の `keep_alive_timeout` は、ClickHouse のバージョン 23.11 より前では [3 秒まで](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1) に設定でき、`config.xml` の修正は必要ありません。

:::warning
パフォーマンスに満足していて問題がない場合、`keep_alive.idle_socket_ttl` 設定の値を **増やさない** ことをお勧めします。そうしないと、潜在的な「ソケットハングアップ」エラーが発生する可能性があります。さらに、アプリケーションが多くのクエリを送信し、間にダウンタイムがあまりない場合、デフォルト値で十分であり、ソケットは長時間アイドル状態にならないため、クライアントはそれらをプールに保持し続けます。
:::

サーバーレスポンスヘッダーで正しい Keep-Alive タイムアウト値を確認するには、以下のコマンドを実行します：

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

レスポンスにおける `Connection` と `Keep-Alive` ヘッダーの値を確認してください。例えば：

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

この場合、`keep_alive_timeout` は 10 秒であり、 `keep_alive.idle_socket_ttl` を 9000 ミリ秒または9500 ミリ秒に増やして、アイドルソケットをデフォルトよりも長く開いたままにできるかもしれません。ただし、サーバーがクライアントよりも先に接続を閉じることになると、「ソケットハングアップ」エラーが発生する可能性がありますので、エラーが消えるまで値を下げていく必要があります。

#### Keep-Alive トラブルシューティング {#keep-alive-troubleshooting}

Keep-Alive を使用している際に `socket hang up` エラーが発生した場合、次のオプションが問題を解決するのに役立ちます：

* ClickHouse サーバー設定で `keep_alive.idle_socket_ttl` をわずかに減らします。クライアントとサーバー間のネットワーク遅延が高い場合など、リクエストがサーバーによって閉じられるソケットを取得できる状況を排除するために、 200〜500 ミリ秒の幅で `keep_alive.idle_socket_ttl` を減らすことが有益な場合があります。 

* 長時間データが出入りしない月レベルのクエリ中にこのエラーが発生している場合 (たとえば、長時間実行される `INSERT FROM SELECT`)、これはロードバランサーがアイドル接続を閉じるために発生している可能性があります。長時間のクエリ中にいくらかのデータを流入させるように、次の ClickHouse 設定の組み合わせを使用することで試すことができます：

```ts
const client = createClient({
  // ここで、実行時間が5分以上のクエリがあることを仮定しています。
  request_timeout: 400_000,
  /** これらの設定を組み合わせることで、データの出入りがない長時間のクエリ中の LB タイムアウトの問題を回避できます。
   *  例えば `INSERT FROM SELECT` と類似のものとして、接続がアイドルと見なされてLBにより突然閉じられる可能性があります
   *  この場合、LBのアイドル接続タイムアウトが120秒と見なし、110秒を「安全な」値として設定します。 */
  clickhouse_settings: {
    send_progress_in_http_headers: 1,
    http_headers_progress_interval_ms: '110000', // UInt64、文字列として渡す必要があります
  },
})
```
ただし、最近の Node.js バージョンでは受信ヘッダーの合計サイズに 16KB の制限があることに注意してください。進捗ヘッダーが受信された後、テストで約 70〜80 回に達する頃に例外が発生します。

また、待機時間を完全に回避するためのまったく異なるアプローチを利用することも可能です。接続が失われた場合でも変更がキャンセルされないという HTTP インターフェースの「機能」を活用することによって実現可能です。詳細は [この例 (第2部)](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts) を参照してください。

* Keep-Alive 機能を完全に無効にすることもできます。この場合、クライアントはすべてのリクエストに `Connection: close` ヘッダーも追加し、基盤の HTTP エージェントは接続を再使用しません。 `keep_alive.idle_socket_ttl` 設定は無視されるため、アイドルソケットはありません。これにより、各リクエストごとに新しい接続が確立されるため、追加のオーバーヘッドが発生します。

```ts
const client = createClient({
  keep_alive: {
    enabled: false,
  },
})
```

### 読み取り専用ユーザー {#read-only-users}

`[readonly=1 ユーザー](/operations/settings/permissions-for-queries#readonly)` でクライアントを使用する場合、レスポンス圧縮を有効化できません。圧縮するには `enable_http_compression` 設定が必要です。次の設定はエラーを引き起こします：

```ts
const client = createClient({
  compression: {
    response: true, // readonly=1 ユーザーでは機能しません
  },
})
```

`readonly=1 ユーザーの制限` の詳細は、[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)を参照してください。

### パス名付きのプロキシ {#proxy-with-a-pathname}

ClickHouse インスタンスがプロキシの後ろにあり、URL にパス名が含まれている場合 (例: http://proxy:8123/clickhouse_server) は、パス名設定オプションに `clickhouse_server` を指定してください (先頭スラッシュの有無にかかわらず)。そうしないと、URL にそのまま提供された場合、`database` オプションとして考慮されます。複数のセグメントもサポートされています。例: `/my_proxy/db`。

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```

### 認証付きのリバースプロキシ {#reverse-proxy-with-authentication}

ClickHouse 展開の前面に認証機能を持つリバースプロキシがある場合、必要なヘッダーを提供するために `http_headers` 設定を使用できます：

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```

### カスタム HTTP/HTTPS エージェント (実験的、Node.js のみ) {#custom-httphttps-agent-experimental-nodejs-only}

:::warning

```html
これは実験的な機能であり、将来のリリースで後方互換性のない方法で変更される可能性があります。クライアントが提供するデフォルトの実装と設定は、ほとんどのユースケースに十分です。この機能は、必要であると確信している場合のみ使用してください。
:::

デフォルトでは、クライアントは要求された設定（`max_open_connections`、`keep_alive.enabled`、`tls`など）を使用して基盤となるHTTP(s)エージェントを構成し、ClickHouseサーバーへの接続を処理します。さらに、TLS証明書が使用される場合、基盤となるエージェントは必要な証明書で構成され、正しいTLS認証ヘッダーが適用されます。

1.2.0以降、カスタムHTTP(s)エージェントをクライアントに提供することが可能になり、デフォルトの基盤エージェントを置き換えることができます。これは、難しいネットワーク構成の場合に便利です。カスタムエージェントを提供する場合は、以下の条件が適用されます：
- `max_open_connections`および`tls`オプションは_効果がなく_、クライアントによって無視されます。これは基盤エージェントの設定の一部です。
- `keep_alive.enabled`は、`Connection`ヘッダーのデフォルト値を規制するだけです（`true` -> `Connection: keep-alive`、`false` -> `Connection: close`）。
- アイドル状態のキープアライブソケット管理は依然として機能しますが（これはエージェントではなく特定のソケット自体に関連しています）、`keep_alive.idle_socket_ttl`の値を`0`に設定することによって完全に無効にすることが可能です。

#### カスタムエージェント使用例 {#custom-agent-usage-examples}

証明書なしでカスタムHTTP(s)エージェントを使用する：

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

基本TLSおよびCA証明書を使用したカスタムHTTPSエージェント：

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
  // カスタムHTTPSエージェントを使用すると、クライアントはデフォルトのHTTPS接続実装を使用しません。ヘッダーは手動で提供する必要があります。
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
  },
  // 重要: 認証ヘッダーはTLSヘッダーと競合します。無効にしてください。
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
  // カスタムHTTPSエージェントを使用すると、クライアントはデフォルトのHTTPS接続実装を使用しません。ヘッダーは手動で提供する必要があります。
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
    'X-ClickHouse-SSL-Certificate-Auth': 'on',
  },
  // 重要: 認証ヘッダーはTLSヘッダーと競合します。無効にしてください。
  set_basic_auth_header: false,
})
```

証明書_と_カスタム_HTTPS_エージェントを使用する場合、デフォルトの認証ヘッダーを`set_basic_auth_header`設定（1.2.0で導入された）を通じて無効にする必要がある可能性が高いです。これは、TLSヘッダーと競合するためです。すべてのTLSヘッダーは手動で提供する必要があります。

## 既知の制限 (Node.js/Web) {#known-limitations-nodejsweb}

- 結果セットに対するデータマッパーは存在せず、言語のプリミティブのみが使用されます。特定のデータ型マッパーは [RowBinary形式のサポート](https://github.com/ClickHouse/clickhouse-js/issues/216) とともに計画されています。
- 一部の [Decimal* および Date* / DateTime* データ型の注意点](./js.md#datedate32-types-caveats) があります。
- JSON*ファミリー形式を使用する場合、Int32より大きい数値は文字列として表示されます。これは、Int64+型の最大値が`Number.MAX_SAFE_INTEGER`より大きいためです。詳細については、[整数型](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256)セクションを参照してください。

## 既知の制限 (Web) {#known-limitations-web}

- SELECTクエリのストリーミングは機能しますが、INSERTに対しては無効です（型レベルでも同様です）。
- リクエストの圧縮は無効で、設定は無視されます。レスポンスの圧縮は機能します。
- まだログ記録サポートはありません。

## パフォーマンス最適化のヒント {#tips-for-performance-optimizations}

- アプリケーションのメモリ消費を削減するために、大きなINSERT（ファイルからのものなど）やSELECTの場合にはストリームを使用することを検討してください。イベントリスナーや同様のユースケースでは、[非同期INSERT](/optimize/asynchronous-inserts)が別の良い選択肢になる可能性があり、クライアント側のバッチ処理を最小限に抑えるか、完全に回避することができます。非同期INSERTの例は[クライアントリポジトリ](https://github.com/ClickHouse/clickhouse-js/tree/main/examples)にあり、ファイル名の接頭辞は`async_insert_`です。
- クライアントはデフォルトでリクエストまたはレスポンスの圧縮を有効にしていません。ただし、大規模なデータセットを選択または挿入する際には、`ClickHouseClientConfigOptions.compression`を通じて圧縮を有効にすることを検討できます（`request`または`response`、またはその両方のために）。
- 圧縮は大きなパフォーマンスペナルティを伴います。`request`または`response`に対して有効にすると、それぞれのSELECTまたはINSERTの速度に悪影響を与えますが、アプリケーションから転送されるネットワークトラフィックの量を減少させます。

## お問い合わせ {#contact-us}

質問や助けが必要な場合は、[コミュニティSlack](https://clickhouse.com/slack)（`#clickhouse-js`チャンネル）または[GitHubのイシュー](https://github.com/ClickHouse/clickhouse-js/issues)を通じてお気軽にお問い合わせください。
```
