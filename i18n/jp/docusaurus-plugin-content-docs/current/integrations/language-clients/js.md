---
sidebar_label: 'JavaScript'
sidebar_position: 4
keywords: ['clickhouse', 'js', 'JavaScript', 'NodeJS', 'web', 'browser', 'Cloudflare', 'workers', 'client', 'connect', 'integrate']
slug: /integrations/javascript
description: 'ClickHouse に接続するための公式 JS クライアント。'
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

ClickHouse に接続するための公式 JS クライアントです。
クライアントは TypeScript で実装されており、クライアントのパブリック API 向けの型定義を提供します。

外部依存はなく、最大限のパフォーマンスに最適化されており、さまざまな ClickHouse のバージョンや構成（オンプレミスの単一ノード、オンプレミスのクラスタ、ClickHouse Cloud）でテストされています。

利用環境に応じて、2 種類のクライアントが利用可能です：
- `@clickhouse/client` - Node.js 専用
- `@clickhouse/client-web` - ブラウザ（Chrome/Firefox）、Cloudflare Workers 向け

TypeScript を使用する場合は、[バージョン 4.5 以上](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)であることを確認してください。このバージョンから、[インラインの import/export 構文](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)が利用可能になります。

クライアントのソースコードは [ClickHouse-JS GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-js)で公開されています。



## 環境要件（Node.js） {#environment-requirements-nodejs}

クライアントを実行するには、環境に Node.js がインストールされている必要があります。
クライアントは、[保守対象](https://github.com/nodejs/release#readme) のすべての Node.js リリースに対応しています。

ある Node.js バージョンがサポート終了（End-of-Life, EOL）に近づくと、そのバージョンは古くセキュリティ上安全ではないと見なされるため、クライアントはそのサポートを終了します。

現在サポートされている Node.js バージョン:

| Node.js version | Supported?  |
|-----------------|-------------|
| 22.x            | ✔           |
| 20.x            | ✔           |
| 18.x            | ✔           |
| 16.x            | ベストエフォート |



## 動作環境要件（Web） {#environment-requirements-web}

クライアントの Web 版は、最新の Chrome／Firefox ブラウザで公式にテストされており、たとえば React／Vue／Angular アプリケーションや Cloudflare Workers などで依存関係として組み込んで利用できます。



## インストール

最新の安定版 Node.js クライアントをインストールするには、以下を実行します:

```sh
npm i @clickhouse/client
```

Web 版のインストール：

```sh
npm i @clickhouse/client-web
```


## ClickHouse との互換性 {#compatibility-with-clickhouse}

| クライアントバージョン | ClickHouse |
|------------------------|------------|
| 1.12.0                 | 24.8+      |

クライアントは、より古いバージョンでも動作する可能性がありますが、サポートはベストエフォートとなり、動作は保証されません。ClickHouse のバージョンが 23.3 より古い場合は、[ClickHouse のセキュリティポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) を参照し、アップグレードを検討してください。



## 例

クライアントリポジトリ内の [examples](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) で、クライアントのさまざまな利用シナリオを網羅することを目指しています。

概要は [examples README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview) で確認できます。

examples や以下のドキュメントで不明点や不足している内容があれば、遠慮なく[お問い合わせください](./js.md#contact-us)。

### クライアント API

特に明記されていない限り、ほとんどのサンプルは Node.js 版と Web 版の両方のクライアントで利用できます。

#### クライアントインスタンスの作成

`createClient` ファクトリ関数を使って、必要な数だけクライアントインスタンスを作成できます。

```ts
import { createClient } from '@clickhouse/client' // または '@clickhouse/client-web'

const client = createClient({
  /* 設定 */
})
```

お使いの環境がESMモジュールをサポートしていない場合は、代わりにCJS構文を使用できます。

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* 設定 */
})
```

クライアントインスタンスは、生成時に[事前設定](./js.md#configuration)できます。

#### 設定

クライアントインスタンスを作成する際、次の接続設定を調整できます:

| Setting                                                                  | Description                                       | Default Value                 | See Also                                                                            |                                                                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **url**?: string                                                         | ClickHouse インスタンスの URL。                           | `http://localhost:8123`       | [URL configuration docs](./js.md#url-configuration)                                 |                                                                                            |
| **pathname**?: string                                                    | クライアントによる URL 解析後に ClickHouse の URL に追加される任意のパス名。 | `''`                          | [Proxy with a pathname docs](./js.md#proxy-with-a-pathname)                         |                                                                                            |
| **request&#95;timeout**?: number                                         | リクエストのタイムアウト時間（ミリ秒）。                              | `30_000`                      | -                                                                                   |                                                                                            |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }`    | 圧縮を有効にするかどうか。                                     | -                             | [Compression docs](./js.md#compression)                                             |                                                                                            |
| **username**?: string                                                    | リクエストを実行するユーザー名。                                  | `default`                     | -                                                                                   |                                                                                            |
| **password**?: string                                                    | ユーザーのパスワード。                                       | `''`                          | -                                                                                   |                                                                                            |
| **application**?: string                                                 | Node.js クライアントを使用するアプリケーション名。                     | `clickhouse-js`               | -                                                                                   |                                                                                            |
| **database**?: string                                                    | 使用するデータベース名。                                      | `default`                     | -                                                                                   |                                                                                            |
| **clickhouse&#95;settings**?: ClickHouseSettings                         | すべてのリクエストに適用される ClickHouse の設定。                   | `{}`                          | -                                                                                   |                                                                                            |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | クライアント内部ログの設定。                                    | -                             | [Logging docs](./js.md#logging-nodejs-only)                                         |                                                                                            |
| **session&#95;id**?: string                                              | すべてのリクエストに付与して送信する任意指定の ClickHouse セッション ID。      | -                             | -                                                                                   |                                                                                            |
| **keep&#95;alive**?: `{ **enabled**?: boolean }`                         | Node.js 版と Web 版の両方でデフォルトで有効。                     | -                             | -                                                                                   |                                                                                            |
| **http&#95;headers**?: `Record<string, string>`                          | ClickHouse への送信リクエストに追加する HTTP ヘッダー。              | -                             | [Reverse proxy with authentication docs](./js.md#reverse-proxy-with-authentication) |                                                                                            |
| **roles**?: string                                                       | string[]                                          | 送信リクエストに付与する ClickHouse ロール名。 | -                                                                                   | [Using roles with the HTTP interface](/interfaces/http#setting-role-with-query-parameters) |

#### Node.js 固有の設定パラメータ


| Setting                                                                        | Description                                | Default Value             | See Also                                                                                             |                                                                            |
| ------------------------------------------------------------------------------ | ------------------------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **max&#95;open&#95;connections**?: number                                      | ホストごとに許可される接続ソケットの最大数。                     | `10`                      | -                                                                                                    |                                                                            |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`       | TLS 証明書を構成します。                             | -                         | [TLS docs](./js.md#tls-certificates-nodejs-only)                                                     |                                                                            |
| **keep&#95;alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                          | -                         | [Keep Alive docs](./js.md#keep-alive-configuration-nodejs-only)                                      |                                                                            |
| **http&#95;agent**?: http.Agent                                                | https.Agent <br /><ExperimentalBadge />    | クライアント用のカスタム HTTP エージェント。 | -                                                                                                    | [HTTP agent docs](./js.md#custom-httphttps-agent-experimental-nodejs-only) |
| **set&#95;basic&#95;auth&#95;header**?: boolean <br /><ExperimentalBadge />    | `Authorization` ヘッダーを Basic 認証の資格情報で設定します。 | `true`                    | [this setting usage in the HTTP agent docs](./js.md#custom-httphttps-agent-experimental-nodejs-only) |                                                                            |

### URL configuration

:::important
URL 設定はハードコードされた値を*常に*上書きし、その場合は警告がログに記録されます。
:::

ほとんどのクライアントインスタンスのパラメータは URL で設定できます。URL の形式は `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]` です。ほぼすべての場合において、特定のパラメータ名は設定オプションインターフェイス内でのパスを反映していますが、いくつかの例外があります。サポートされているパラメータは次のとおりです。

| Parameter                                   | Type                                                      |
| ------------------------------------------- | --------------------------------------------------------- |
| `pathname`                                  | 任意の文字列。                                                   |
| `application_id`                            | 任意の文字列。                                                   |
| `session_id`                                | 任意の文字列。                                                   |
| `request_timeout`                           | 非負の数値。                                                    |
| `max_open_connections`                      | 非負かつゼロより大きい数値。                                            |
| `compression_request`                       | boolean。以下 (1) を参照。                                       |
| `compression_response`                      | boolean。                                                  |
| `log_level`                                 | 許可される値: `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`. |
| `keep_alive_enabled`                        | boolean。                                                  |
| `clickhouse_setting_*` or `ch_*`            | 以下 (2) を参照。                                               |
| `http_header_*`                             | 以下 (3) を参照。                                               |
| (Node.js only) `keep_alive_idle_socket_ttl` | 非負の数値。                                                    |

* (1) boolean では、有効な値は `true`/`1` または `false`/`0` です。
* (2) `clickhouse_setting_` または `ch_` で始まる任意のパラメータは、このプレフィックスが削除され、残りの部分がクライアントの `clickhouse_settings` に追加されます。たとえば、`?ch_async_insert=1&ch_wait_for_async_insert=1` は次と同じになります。

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

注意: `clickhouse_settings` のブール値は、URL 上では `1`/`0` として渡す必要があります。

* (3) (2) と同様ですが、`http_header` の設定用です。例えば、`?http_header_x-clickhouse-auth=foobar` は次と同等です:

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```

### 接続

#### 接続情報を収集する

<ConnectionDetails />

#### 接続の概要

クライアントは HTTP(s) プロトコルを通じて接続します。RowBinary サポートは開発中です。詳細は [関連する issue](https://github.com/ClickHouse/clickhouse-js/issues/216) を参照してください。

次の例は、ClickHouse Cloud への接続を構成する方法を示します。`url`（プロトコルおよびポートを含む）と `password` の値は環境変数で指定され、`default` ユーザーが使用されることを想定しています。

**例:** 環境変数による設定を用いて Node.js クライアントインスタンスを作成する。

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```


クライアントリポジトリには、[ClickHouse Cloud にテーブルを作成する](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)、[非同期インサートを使う](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) など、環境変数を利用したサンプルが多数含まれています。

#### コネクションプール（Node.js のみ）

すべてのリクエストごとに接続を確立するオーバーヘッドを避けるために、クライアントは ClickHouse への接続をプールし、Keep-Alive メカニズムを利用して再利用します。デフォルトでは Keep-Alive は有効で、コネクションプールのサイズは `10` に設定されていますが、`max_open_connections` [設定オプション](./js.md#configuration)で変更できます。

ユーザーが `max_open_connections: 1` を設定しない限り、プール内の同じ接続が後続のクエリで使用されることは保証されません。これは必要になることは稀ですが、一時テーブルを使用している場合などに必要となることがあります。

併せて参照: [Keep-Alive の設定](./js.md#keep-alive-configuration-nodejs-only)。

### Query ID

クエリやステートメントを送信するすべてのメソッド（`command`、`exec`、`insert`、`select`）は、結果に `query_id` を含めます。この一意の識別子はクエリごとにクライアントによって割り当てられ、`system.query_log` からデータを取得する際（[サーバー設定](/operations/server-configuration-parameters/settings)で有効化されている場合）や、長時間実行中のクエリをキャンセルする際（[サンプル](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)を参照）に役立つ場合があります。必要に応じて、`query_id` は `command`/`query`/`exec`/`insert` メソッドのパラメータでユーザーが上書きできます。

:::tip
`query_id` パラメータを上書きする場合は、呼び出しごとに一意になるようにする必要があります。ランダムな UUID が良い選択肢です。
:::

### すべてのクライアントメソッドに共通の基本パラメータ

すべてのクライアントメソッド（[query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)）に適用できるパラメータがいくつかあります。

```ts
interface BaseQueryParams {
  // クエリレベルで適用できるClickHouse設定
  clickhouse_settings?: ClickHouseSettings
  // クエリバインディング用パラメータ
  query_params?: Record<string, unknown>
  // 実行中のクエリをキャンセルするためのAbortSignalインスタンス
  abort_signal?: AbortSignal
  // query_idの上書き。指定しない場合、ランダムな識別子が自動生成されます
  query_id?: string
  // session_idの上書き。指定しない場合、クライアント設定からセッションIDが取得されます
  session_id?: string
  // 認証情報の上書き。指定しない場合、クライアントの認証情報が使用されます
  auth?: { username: string, password: string }
  // このクエリで使用するロールのリスト。クライアント設定で指定されたロールを上書きします
  role?: string | Array<string>
}
```

### クエリメソッド

これは、`SELECT` のようにレスポンスを返すほとんどのステートメントや、`CREATE TABLE` などの DDL を送信する際に使用し、`await` する必要があります。返される結果セットは、アプリケーションで利用されることを想定しています。

:::note
データ挿入には専用のメソッド [insert](./js.md#insert-method)、DDL には [command](./js.md#command-method) が用意されています。
:::

```ts
interface QueryParams extends BaseQueryParams {
  // 実行するクエリ（データを返す可能性があります）
  query: string
  // 結果データセットの形式。デフォルト: JSON
  format?: DataFormat
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>
}
```

See also: [すべてのクライアントメソッドに共通の基本パラメータ](./js.md#base-parameters-for-all-client-methods).

:::tip
`query` で FORMAT 句は指定せず、代わりに `format` パラメータを使用してください。
:::

#### 結果セットと行の抽象化

`ResultSet` は、アプリケーション内でデータ処理を行うためのいくつかの便利なメソッドを提供します。

Node.js の `ResultSet` 実装は内部的に `Stream.Readable` を使用し、Web 版は Web API の `ReadableStream` を使用します。

`ResultSet` に対して `text` または `json` メソッドを呼び出すことで、クエリによって返されたすべての行をまとめてメモリに読み込んで処理できます。


`ResultSet` はレスポンスストリームを開いたままにし、その結果として基盤となる接続をビジー状態に保つため、できるだけ早く読み出し（消費）を開始する必要があります。クライアントは、アプリケーションによる過度なメモリ使用を避けるため、受信データをバッファリングしません。

一度にメモリに収まらないほどデータが大きい場合は、代わりに `stream` メソッドを呼び出し、ストリーミングモードでデータを処理できます。レスポンスの各チャンクは、比較的小さな行配列に変換されます（この配列のサイズは、クライアントがサーバーから受信する各チャンクのサイズや、個々の行のサイズに依存し、変動する可能性があります）。チャンクは一度に 1 つずつ処理されます。

どのフォーマットがユースケースでのストリーミングに最適かを判断するには、[サポートされているデータフォーマットの一覧](./js.md#supported-data-formats)を参照してください。たとえば、JSON オブジェクトをストリーミングしたい場合は、[JSONEachRow](/interfaces/formats/JSONEachRow) を選択すると、各行が JS オブジェクトとしてパースされます。あるいは、よりコンパクトな [JSONCompactColumns](/interfaces/formats/JSONCompactColumns) フォーマットを選択すると、各行は値のコンパクトな配列になります。あわせて [ファイルのストリーミング](./js.md#streaming-files-nodejs-only) も参照してください。

:::important
`ResultSet` またはそのストリームが最後まで消費されない場合、非アクティブ状態が `request_timeout` 期間続いた後に破棄されます。
:::

```ts
interface BaseResultSet<Stream> {
  // 上記の「クエリID」セクションを参照してください
  query_id: string

  // ストリーム全体を読み取り、内容を文字列として取得します
  // 任意のDataFormatで使用できます
  // 一度だけ呼び出してください
  text(): Promise<string>

  // ストリーム全体を読み取り、内容をJavaScriptオブジェクトとして解析します
  // JSON形式でのみ使用できます
  // 一度だけ呼び出してください
  json<T>(): Promise<T>

  // ストリーミング可能なレスポンスに対して読み取り可能なストリームを返します
  // ストリームの各イテレーションで、選択されたDataFormat形式のRow[]配列が提供されます
  // 一度だけ呼び出してください
  stream(): Stream
}

interface Row {
  // 行の内容をプレーン文字列として取得します
  text: string

  // 行の内容をJavaScriptオブジェクトとして解析します
  json<T>(): T
}
```

**例:** (Node.js/Web) `JSONEachRow` 形式の結果データセットを返すクエリで、ストリーム全体を読み取り、その内容を JS オブジェクトとしてパースします。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // JSON解析を回避する場合は `row.text` を使用
```

**例:** (Node.js のみ) クラシックな `on('data')` アプローチを使用して、クエリ結果を `JSONEachRow` 形式でストリーミングします。これは `for await const` 構文と置き換えて使用できます。[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // または JSONCompactEachRow、JSONStringsEachRow など
})
const stream = rows.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.json()) // JSON のパースを避けるには `row.text` を使用
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

**例:** (Node.js のみ) クラシックな `on('data')` アプローチを使用して、クエリ結果を `CSV` 形式でストリーミングします。これは `for await const` 構文と置き換えて利用できます。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)

```ts
const resultSet = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'CSV', // TabSeparated、CustomSeparated などを指定可能
})
const stream = resultSet.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.text)
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('完了')
    resolve(0)
  })
  stream.on('error', reject)
})
```


**例:** （Node.js のみ）`JSONEachRow` 形式のクエリ結果を、`for await const` 構文を使って JS オブジェクトとしてストリーミング処理します。これは従来の `on('data')` アプローチと相互に置き換えて利用できます。
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
`for await const` 構文は `on('data')` アプローチよりもコード量は少なくなりますが、パフォーマンスに悪影響を及ぼす可能性があります。
詳しくは [Node.js リポジトリのこの issue](https://github.com/nodejs/node/issues/31979) を参照してください。
:::

**例:** （Web のみ）オブジェクトの `ReadableStream` を反復処理する例。

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

### Insert メソッド

これはデータを挿入するための主なメソッドです。

```ts
export interface InsertResult {
  query_id: string
  executed: boolean
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

サーバーからデータが返されることを想定していないため、レスポンスストリームも即座に読み捨てられ、戻り値の型は最小限になっています。

空の配列が insert メソッドに渡された場合、INSERT ステートメントはサーバーに送信されず、その代わりにメソッドは直ちに `{ query_id: '...', executed: false }` で解決されます。このケースでメソッドのパラメータに `query_id` が指定されていなかった場合、結果では空文字列になります。これは、クライアントが生成したランダムな UUID を返すと、その `query_id` を持つクエリが `system.query_log` テーブルに存在しないため、混乱を招きかねないためです。

INSERT ステートメントがサーバーに送信された場合、`executed` フラグは `true` になります。

#### Node.js における insert メソッドとストリーミング

`insert` メソッドに指定された [data format](./js.md#supported-data-formats) に応じて、`Stream.Readable` か通常の `Array<T>` のどちらでも動作します。[file streaming](./js.md#streaming-files-nodejs-only) に関するこのセクションも参照してください。

insert メソッドは基本的に `await` されることを想定していますが、入力ストリームだけを先に指定し、ストリームの完了時点まで待ってから `insert` 処理を `await` することも可能です（このとき `insert` の Promise も解決されます）。これはイベントリスナーなどのシナリオで有用な場合がありますが、クライアント側では多数のエッジケースが存在しうるため、エラー処理は単純ではありません。その代わりに、[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts) で示されているような [async inserts](/optimize/asynchronous-inserts) の利用を検討してください。

:::tip
このメソッドでは表現しづらいカスタム INSERT ステートメントがある場合は、[command method](./js.md#command-method) の利用を検討してください。

[INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) や [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) の例で、その使い方を確認できます。
:::


```ts
interface InsertParams<T> extends BaseQueryParams {
  // データを挿入するテーブル名
  table: string
  // 挿入するデータセット
  values: ReadonlyArray<T> | Stream.Readable
  // 挿入するデータセットのフォーマット
  format?: DataFormat
  // データを挿入する列を指定します
  // - `['a', 'b']` のような配列の場合: `INSERT INTO table (a, b) FORMAT DataFormat` が生成されます
  // - `{ except: ['a', 'b'] }` のようなオブジェクトの場合: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat` が生成されます
  // デフォルトでは、テーブルのすべての列にデータが挿入され、
  // 生成されるステートメントは `INSERT INTO table FORMAT DataFormat` となります
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

こちらも参照してください: [すべてのクライアントメソッドに共通の基本パラメータ](./js.md#base-parameters-for-all-client-methods)。

:::important
`abort_signal` によってキャンセルされたリクエストであっても、データの挿入が行われなかったことを保証するものではありません。キャンセル前に、サーバーがストリーミングされたデータの一部を受信している可能性があるためです。
:::

**例:** (Node.js/Web) 配列の値を挿入します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
await client.insert({
  table: 'my_table',
  // 構造は目的のフォーマットと一致する必要があります。この例では JSONEachRow です
  values: [
    { id: 42, name: 'foo' },
    { id: 42, name: 'bar' },
  ],
  format: 'JSONEachRow',
})
```

**例:**（Node.js のみ）CSV ファイルからストリームとして挿入します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。関連項目: [ファイルストリーミング](./js.md#streaming-files-nodejs-only)。

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**例**: INSERT 文から特定の列を除外する。

次のようなテーブル定義があるとします。

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

特定の列のみを挿入する：

```ts
// 生成されるステートメント: INSERT INTO mytable (message) FORMAT JSONEachRow
await client.insert({
  table: 'mytable',
  values: [{ message: 'foo' }],
  format: 'JSONEachRow',
  // この行の `id` カラムの値はゼロになります（UInt32 のデフォルト）
  columns: ['message'],
})
```

特定の列を除外する：

```ts
// 生成されるステートメント: INSERT INTO mytable (* EXCEPT (message)) FORMAT JSONEachRow
await client.insert({
  table: tableName,
  values: [{ id: 144 }],
  format: 'JSONEachRow',
  // この行の `message` 列の値は空文字列となります
  columns: {
    except: ['message'],
  },
})
```

詳細については[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts)を参照してください。

**例**: クライアントインスタンスで指定しているデータベースとは異なるデータベースに `INSERT` を実行します。[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: 'mydb.mytable', // データベース名を含む完全修飾名
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```

#### Web 版の制限事項

現在、`@clickhouse/client-web` における insert は `Array<T>` と `JSON*` フォーマットでのみ機能します。
ブラウザの互換性が十分でないため、Web 版ではストリーミングによる insert はまだサポートされていません。

そのため、Web 版における `InsertParams` インターフェースは Node.js 版とは少し異なり、
`values` は `ReadonlyArray<T>` 型にのみ制限されています。


```ts
interface InsertParams<T> extends BaseQueryParams {
  // データを挿入するテーブル名
  table: string
  // 挿入するデータセット
  values: ReadonlyArray<T>
  // 挿入するデータセットのフォーマット
  format?: DataFormat
  // データを挿入する列を指定します。
  // - `['a', 'b']` のような配列の場合: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - `{ except: ['a', 'b'] }` のようなオブジェクトの場合: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // デフォルトでは、テーブルのすべての列にデータが挿入され、
  // 生成されるステートメントは `INSERT INTO table FORMAT DataFormat` となります。
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

これは将来変更される可能性があります。詳しくは、[すべてのクライアントメソッドに共通の基本パラメータ](./js.md#base-parameters-for-all-client-methods)を参照してください。

### Command メソッド

出力のないステートメントや、`FORMAT` 句が適用できない場合、あるいはレスポンスにまったく関心がない場合に使用できます。このようなステートメントの例としては、`CREATE TABLE` や `ALTER TABLE` があります。

`await` して呼び出す必要があります。

レスポンスストリームは即座に破棄され、その結果、基盤となるソケットは解放されます。

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

関連項目：[すべてのクライアントメソッドに共通の基本パラメータ](./js.md#base-parameters-for-all-client-methods)。

**例：** (Node.js/Web) ClickHouse Cloud にテーブルを作成します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)。

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // クラスタ使用時に推奨。レスポンスコード送信後にクエリ処理エラーが発生し、
  // HTTPヘッダーが既にクライアントに送信されている状況を回避します。
  // 詳細: https://clickhouse.com/docs/interfaces/http/#response-buffering
  clickhouse_settings: {
    wait_end_of_query: 1,
  },
})
```

**例:** (Node.js/Web) 自己ホスト環境の ClickHouse インスタンスでテーブルを作成する例です。
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
`abort_signal` によってリクエストがキャンセルされても、そのステートメントがサーバー側で実行されなかったことは保証されません。
:::

### Exec メソッド

`query` や `insert` に当てはまらないカスタムクエリがあり、その結果が必要な場合は、`command` の代わりに `exec` を使用できます。

`exec` は読み出し可能なストリームを返し、これはアプリケーション側で必ず読み取るか破棄する必要があります。

```ts
interface ExecParams extends BaseQueryParams {
  // 実行するステートメント
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

関連項目: [すべてのクライアントメソッドに共通する基本パラメーター](./js.md#base-parameters-for-all-client-methods)。

ストリームの戻り値の型は Node.js 版と Web 版で異なります。

Node.js:

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

接続状態を確認するために用意されている `ping` メソッドは、サーバーに到達できる場合は `true` を返します。

サーバーに到達できない場合は、その原因となっている元のエラーも結果に含まれます。

```ts
type PingResult =
  | { success: true }
  | { success: false; error: Error }
```


/\*\* 組み込みの `/ping` エンドポイントを使用する、ヘルスチェック用リクエストのパラメーター。

- これは Node.js 版でのデフォルト動作です。 _/
  export type PingParamsWithEndpoint = {
  select: false
  /\*\* 実行中のリクエストをキャンセルするための AbortSignal インスタンス。 _/
  abort_signal?: AbortSignal
  /** このリクエストに付与するための追加の HTTP ヘッダー。 \*/
  http_headers?: Record<string, string>
  }
  /** SELECT クエリを使用するヘルスチェック用リクエストのパラメーター。
- `/ping` エンドポイントは CORS をサポートしないため、これは Web 版でのデフォルト動作です。
- `query_id`、`abort_signal`、`http_headers` など、標準的な `query` メソッドのパラメーターのほとんどは利用できます。
- ただし `query_params` は、このメソッドで許可しても意味がないため、例外となります。 \*/
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

Ping は、アプリケーションの起動時にサーバーが利用可能かどうかを確認するための有用な手段になり得ます。特に ClickHouse Cloud では、インスタンスがアイドル状態になっており、ping を受けてから起動する場合があります。そのような場合は、間に遅延を挟みながら数回リトライすることを検討してください。

デフォルトでは、Node.js 版は `/ping` エンドポイントを使用し、一方 Web 版は同等の結果を得るために単純な `SELECT 1` クエリを使用します。これは、`/ping` エンドポイントが CORS をサポートしないためです。

**例:** (Node.js/Web) ClickHouse サーバーインスタンスへのシンプルな ping。注: Web 版では捕捉されるエラーは異なります。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // process result.error
}
````

**例:** `ping` メソッド呼び出し時に認証情報も検証したい場合や、`query_id` などの追加パラメーターを指定したい場合は、次のように利用できます。

```ts
const result = await client.ping({
  select: true /* query_id, abort_signal, http_headers, or any other query params */
})
```

`ping` メソッドでは、標準的な `query` メソッドのパラメーターの大部分が利用可能です。詳細は `PingParamsWithSelectQuery` の型定義を参照してください。

### Close (Node.js のみ) {#close-nodejs-only}

開いているすべての接続をクローズし、リソースを解放します。Web 版では何も行いません (no-op)。

```ts
await client.close()
```


## ファイルのストリーミング (Node.js のみ) {#streaming-files-nodejs-only}

クライアントリポジトリには、一般的なデータ形式 (NDJSON、CSV、Parquet) を使ったファイルストリーミングのサンプルコードがいくつかあります。

- [NDJSON ファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [CSV ファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Parquet ファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Parquet ファイルへのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

他の形式をファイルにストリーミングする場合も、基本的な手順は Parquet の場合と同じで、異なるのは `query` 呼び出しで指定するフォーマット (`JSONEachRow`、`CSV` など) と出力ファイル名だけです。



## サポートされているデータフォーマット {#supported-data-formats}

クライアントは JSON 形式またはテキスト形式のデータを扱えます。

`format` に JSON 系のフォーマット（`JSONEachRow`、`JSONCompactEachRow` など）のいずれかを指定した場合、クライアントは通信時にデータのシリアライズおよびデシリアライズを行います。

「生」のテキストフォーマット（`CSV`、`TabSeparated` および `CustomSeparated` 系）のデータは、追加の変換なしでそのまま送信されます。

:::tip
一般的なフォーマットとしての JSON と [ClickHouse JSON フォーマット](/interfaces/formats/JSON) を混同しがちです。

クライアントは [JSONEachRow](/interfaces/formats/JSONEachRow) などのフォーマットを用いた JSON オブジェクトのストリーミングをサポートしています（他のストリーミング向きフォーマットについては下表の一覧を参照してください。また、`select_streaming_` の[クライアントリポジトリ内の例](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)も参照してください）。

[ClickHouse JSON](/interfaces/formats/JSON) など一部のフォーマットは、レスポンス内で 1 つのオブジェクトとして表現され、クライアントによるストリーミングはできない点に注意してください。
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
| JSONEachRowWithProgress                    | ❌️            | ❌              | ✔️ ❗- 下記参照        | ✔️            | ✔️             |
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
| Parquet                                    | ❌             | ❌              | ✔️                    | ❌             | ✔️❗- 下記参照 |



Parquet の場合、`SELECT` の主なユースケースは、結果ストリームをファイルに書き出すことです。クライアントリポジトリの[このサンプル](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)を参照してください。

`JSONEachRowWithProgress` は、ストリーム内で進捗報告をサポートする出力専用フォーマットです。詳しくは[このサンプル](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)を参照してください。

ClickHouse の入力および出力フォーマットの完全な一覧は[こちら](/interfaces/formats)にあります。



## サポートされている ClickHouse のデータ型

:::note
関連する JS 型は、すべてを文字列として表現する形式（例: `JSONStringEachRow`）を除く、任意の `JSON*` フォーマットで有効です。
:::

| Type                   | Status     | JS type                          |
| ---------------------- | ---------- | -------------------------------- |
| UInt8/16/32            | ✔️         | number                           |
| UInt64/128/256         | ✔️ ❗- 下記参照 | string                           |
| Int8/16/32             | ✔️         | number                           |
| Int64/128/256          | ✔️ ❗- 下記参照 | string                           |
| Float32/64             | ✔️         | number                           |
| Decimal                | ✔️ ❗- 下記参照 | number                           |
| Boolean                | ✔️         | boolean                          |
| String                 | ✔️         | string                           |
| FixedString            | ✔️         | string                           |
| UUID                   | ✔️         | string                           |
| Date32/64              | ✔️         | string                           |
| DateTime32/64          | ✔️ ❗- 下記参照 | string                           |
| Enum                   | ✔️         | string                           |
| LowCardinality         | ✔️         | string                           |
| Array(T)               | ✔️         | T[]                              |
| (new) JSON             | ✔️         | object                           |
| Variant(T1, T2...)     | ✔️         | T（バリアントに依存）                      |
| Dynamic                | ✔️         | T（バリアントに依存）                      |
| Nested                 | ✔️         | T[]                              |
| Tuple(T1, T2, ...)     | ✔️         | [T1, T2, ...]                    |
| Tuple(n1 T1, n2 T2...) | ✔️         | &#123; n1: T1; n2: T2; ...&#125; |
| Nullable(T)            | ✔️         | T の JS 型または null                 |
| IPv4                   | ✔️         | string                           |
| IPv6                   | ✔️         | string                           |
| Point                  | ✔️         | [ number, number ]               |
| Ring                   | ✔️         | Array&lt;Point&gt;               |
| Polygon                | ✔️         | Array&lt;Ring&gt;                |
| MultiPolygon           | ✔️         | Array&lt;Polygon&gt;             |
| Map(K, V)              | ✔️         | Record&lt;K, V&gt;               |
| Time/Time64            | ✔️         | string                           |

サポートされている ClickHouse フォーマットの完全な一覧は
[こちら](/sql-reference/data-types/)に掲載されています。

関連項目:

* [Dynamic/Variant/JSON の使用例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/dynamic_variant_json.ts)
* [Time/Time64 の使用例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/time_time64.ts)

### Date/Date32 型の注意点

クライアントは追加の型変換を行わずに値を挿入するため、`Date`/`Date32` 型のカラムには
文字列のみを挿入できます。

**例:** `Date` 型の値を挿入する例です。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

しかし、`DateTime` や `DateTime64` カラムを使用している場合は、文字列と JS Date オブジェクトの両方を使用できます。JS Date オブジェクトは、`date_time_input_format` を `best_effort` に設定した状態で、そのまま `insert` に渡すことができます。詳細については、この[サンプル](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts)を参照してください。

### Decimal* 型に関する注意事項

`JSON*` 系のフォーマットを使用して Decimal を挿入することが可能です。次のようなテーブルが定義されているとします:

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

文字列表現を使用すれば、精度を失うことなく値を挿入できます。


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

しかし、`JSON*` フォーマットでデータをクエリすると、ClickHouse はデフォルトで Decimal 型を *数値* として返すため、精度が失われる可能性があります。これを避けるには、クエリ内で Decimal 型を文字列型にキャストしてください。

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

詳細については [この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts) を参照してください。

### 整数型: Int64, Int128, Int256, UInt64, UInt128, UInt256

サーバーはこれらを数値として受け取ることができますが、これらの型の最大値が `Number.MAX_SAFE_INTEGER` を超えるため、
整数オーバーフローを避ける目的で `JSON*` ファミリーの出力フォーマットでは文字列として返されます。

ただし、この挙動は
[`output_format_json_quote_64bit_integers` 設定](/operations/settings/formats#output_format_json_quote_64bit_integers)
で変更可能です。

**例:** 64 ビット整数に対する JSON 出力フォーマットを調整する。

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


## ClickHouse の設定

クライアントは [settings](/operations/settings/settings/)
メカニズムを使用して ClickHouse の動作を調整できます。
設定はクライアントインスタンスレベルで行うことができ、その場合はそのクライアントから送信されるすべてのリクエストに適用されます。

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

または、設定をリクエストごとに行うこともできます：

```ts
client.query({
  clickhouse_settings: {}
})
```

サポートされているすべての ClickHouse 設定を含む型定義ファイルは、
[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts)にあります。

:::important
クエリを実行するユーザーが、設定を変更するための十分な権限を持っていることを確認してください。
:::


## 高度なトピック

### パラメータ付きクエリ

パラメータを使用したクエリを作成し、クライアントアプリケーションからそれらに値を渡すことができます。これにより、クライアント側で特定の動的値を埋め込んだクエリ文字列を組み立てる必要がなくなります。

通常どおりクエリを作成し、その後、アプリケーションからパラメータとして渡したい値を、次の形式で中括弧内に記述します。

```text
{<name>: <data_type>}
```

ここで:

* `name` — プレースホルダー識別子。
* `data_type` - アプリケーションパラメータ値の[データ型](/sql-reference/data-types/)。

**例:** パラメータを使用したクエリ。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/query_with_parameter_binding.ts)
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

詳細については [https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax](https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax) を参照してください。

### 圧縮

注意: リクエスト圧縮は現在、Web バージョンでは利用できません。レスポンス圧縮は通常どおり動作します。Node.js バージョンでは両方をサポートしています。

大規模なデータセットをネットワーク経由で扱うデータアプリケーションは、圧縮を有効にすることでメリットがあります。現在は、[zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html) を使用した `GZIP` のみがサポートされています。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

設定パラメータは次のとおりです:

* `response: true` は、ClickHouse サーバーに対して圧縮されたレスポンスボディで応答するよう指示します。デフォルト値: `response: false`
* `request: true` は、クライアントのリクエストボディに対する圧縮を有効にします。デフォルト値: `request: false`

### Logging (Node.js のみ)

:::important
このロギング機能は実験的なものであり、将来変更される可能性があります。
:::

デフォルトのロガー実装は、`console.debug/info/warn/error` メソッドを通じてログレコードを `stdout` に出力します。
`LoggerClass` を指定することでロギングロジックをカスタマイズでき、`level` パラメータで必要なログレベルを選択できます (デフォルトは `OFF` です):

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

現在、クライアントは次のイベントをログ出力します:

* `TRACE` - Keep-Alive ソケットのライフサイクルに関する低レベル情報
* `DEBUG` - レスポンス情報（認証ヘッダーとホスト情報を除く）
* `INFO` - ほとんど使用されませんが、クライアント初期化時に現在のログレベルを出力します
* `WARN` - 非致命的なエラー。`ping` リクエストの失敗は、返される結果に基になるエラーが含まれているため、警告としてログ出力されます
* `ERROR` - リクエスト失敗など、`query` / `insert` / `exec` / `command` メソッドからの致命的なエラー

デフォルトの Logger 実装は[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts)で確認できます。

### TLS 証明書（Node.js のみ）

Node.js クライアントは、オプションで basic（認証局 (Certificate Authority) のみ）と
mutual（認証局とクライアント証明書）の両方の TLS をサポートします。

Basic TLS 設定の例です。証明書が `certs` フォルダ内にあり、
CA ファイル名が `CA.pem` であると仮定します:

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

クライアント証明書を使用した相互 TLS 設定の例:


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

リポジトリ内の [基本](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) および [相互](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS の完全なサンプルを参照してください。

### Keep-Alive の設定（Node.js のみ）

クライアントは、内部で利用している HTTP エージェントに対してデフォルトで Keep-Alive を有効にします。これは、接続済みのソケットが後続のリクエストで再利用され、`Connection: keep-alive` ヘッダーが送信されることを意味します。アイドル状態のソケットは、デフォルトでは 2500 ミリ秒間コネクションプール内に残ります（このオプションの調整に関する[注意事項](./js.md#adjusting-idle_socket_ttl)を参照してください）。

`keep_alive.idle_socket_ttl` の値は、サーバーやロードバランサーの設定値よりも十分に低くする必要があります。主な理由は、HTTP/1.1 ではサーバー側がクライアントに通知せずにソケットを閉じることが許されているため、サーバーまたはロードバランサーがクライアントより*先に*接続を閉じると、クライアントが既に閉じられたソケットを再利用しようとして `socket hang up` エラーが発生し得るからです。

`keep_alive.idle_socket_ttl` を変更する場合は、常にサーバー／ロードバランサー側の Keep-Alive 設定と同期しており、かつ**必ずそれより低く**設定されていることを確認してください。これにより、サーバーが先に開いている接続を閉じることがないようにします。

#### `idle_socket_ttl` の調整

クライアントは `keep_alive.idle_socket_ttl` を 2500 ミリ秒に設定します。これは最も安全なデフォルトと見なせる値であり、サーバー側では `config.xml` を変更しない場合、`keep_alive_timeout` は [ClickHouse 23.11 より前のバージョンでは 3 秒程度まで低く設定されている可能性があります](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1)。

:::warning
パフォーマンスに満足しており、特に問題が発生していない場合は、`keep_alive.idle_socket_ttl` 設定値を増やさ**ない**ことを推奨します。値を増やすと、潜在的な「socket hang up」エラーを引き起こす可能性があるためです。さらに、アプリケーションが多数のクエリを送信しており、その間にそれほど長いアイドル時間がない場合、デフォルト値で十分です。この場合、ソケットは十分な時間アイドル状態にならず、クライアントはそれらをプール内に保持し続けます。
:::

次のコマンドを実行することで、サーバーレスポンスヘッダー内から正しい Keep-Alive タイムアウト値を確認できます。

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

レスポンスの `Connection` ヘッダーと `Keep-Alive` ヘッダーの値を確認します。例えば次のとおりです。

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

この場合、`keep_alive_timeout` は 10 秒なので、`keep_alive.idle_socket_ttl` を 9000 あるいは 9500 ミリ秒まで増やして、アイドル状態のソケットがデフォルトより少し長く開いたままになるようにしてみることができます。「Socket hang-up」エラーが発生しないか注意して監視し、サーバーがクライアントより先に接続を閉じていることを示すそのようなエラーが出る場合は、エラーが出なくなるまで値を下げてください。

#### トラブルシューティング

最新バージョンのクライアントを使用していても `socket hang up` エラーが発生する場合、この問題を解決するためには次のような選択肢があります。

* 少なくとも `WARN` レベル以上のログ出力を有効にします。これにより、アプリケーションコード内に未消費のストリームや、ぶら下がり状態のストリームがないか確認できます。トランスポート層は、それがサーバー側からソケットをクローズさせる原因になり得るため、WARN レベルでログ出力します。クライアント設定でのログ有効化は次のように行えます。

  ```ts
  const client = createClient({
    log: { level: ClickHouseLogLevel.WARN },
  })
  ```

* [no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/) ESLint ルールを有効にしてアプリケーションコードを確認します。これにより、ぶら下がり状態のストリームやソケットの原因となり得る、未処理の Promise を特定するのに役立ちます。


* ClickHouse サーバー設定の `keep_alive.idle_socket_ttl` の値を少し下げてみてください。特定の状況、たとえばクライアントとサーバー間のネットワークレイテンシーが高い場合には、`keep_alive.idle_socket_ttl` をさらに 200〜500 ミリ秒ほど下げることで、送信中のリクエストがサーバー側で直後にクローズされるソケットを取得してしまう状況を避けられる場合があります。

* このエラーが、入出力データのない長時間実行クエリ中（たとえば長時間実行される `INSERT FROM SELECT`）に発生する場合、ロードバランサーがアイドル状態の接続をクローズしている可能性があります。そのような長時間実行クエリ中に、次の ClickHouse 設定を組み合わせて使用し、定期的にデータが流れるようにしてみることができます:

  ```ts
  const client = createClient({
    // ここでは、実行時間が 5 分を超えるクエリが存在することを想定しています
    request_timeout: 400_000,
    /** これらの設定を組み合わせることで、入出力データがない長時間実行クエリ
     *  （`INSERT FROM SELECT` など）の場合でも、接続が LB によってアイドルと見なされて
     *  突然クローズされることによる LB タイムアウトの問題を回避できます。
     *  この例では、LB のアイドル接続タイムアウトが 120 秒であると仮定し、
     *  安全値として 110 秒を設定しています。 */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: '110000', // UInt64 であり、文字列として渡す必要があります
    },
  })
  ```

  ただし、受信ヘッダー全体のサイズには、最近の Node.js バージョンでは 16KB の制限がある点に注意してください。一定数の progress ヘッダーを受信すると（テストでは約 70〜80 個で）、例外がスローされます。

  まったく別のアプローチとして、ネットワーク上で待機時間を発生させない方法もあります。これは、接続が失われても mutation がキャンセルされないという HTTP インターフェイスの「機能」を利用することで実現できます。詳細については、[このサンプル（part 2）](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts) を参照してください。

* Keep-Alive 機能は完全に無効化することもできます。この場合、クライアントはすべてのリクエストに `Connection: close` ヘッダーを追加し、下層の HTTP エージェントは接続を再利用しません。アイドル状態のソケットが存在しないため、`keep_alive.idle_socket_ttl` 設定は無視されます。その結果、リクエストごとに新しい接続を確立する必要があり、追加のオーバーヘッドが発生します。

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```

### 読み取り専用ユーザー

クライアントを [readonly=1 ユーザー](/operations/settings/permissions-for-queries#readonly) と共に使用する場合、レスポンス圧縮は有効化できません。これは `enable_http_compression` 設定が必要なためです。次の設定はエラーになります:

```ts
const client = createClient({
  compression: {
    response: true, // readonly=1 ユーザーでは機能しません
  },
})
```

`readonly=1` ユーザーの制約事項について、より多くの例を示した[サンプル](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)を参照してください。

### パス名付きプロキシ

ClickHouse インスタンスがプロキシの背後にあり、たとえば [http://proxy:8123/clickhouse&#95;server](http://proxy:8123/clickhouse_server) のように URL のパス名として指定されている場合は、`pathname` 設定オプションとして `clickhouse_server` を指定します (先頭のスラッシュの有無は問いません)。これを `pathname` ではなく `url` に直接含めた場合、それは `database` オプションとして解釈されます。複数セグメントのパスもサポートされており、例として `/my_proxy/db` のように指定できます。

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```

### 認証付きリバースプロキシ

ClickHouse のデプロイメントの前段に認証付きのリバースプロキシを配置している場合は、`http_headers` 設定を使用して、そこで必要なヘッダーを付与できます。

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```

### カスタム HTTP/HTTPS エージェント（実験的機能、Node.js のみ）

:::warning
これは実験的な機能であり、将来のリリースで後方互換性を損なう形で変更される可能性があります。クライアントが提供するデフォルトの実装と設定で、ほとんどのユースケースには十分対応できます。この機能が本当に必要であると確信できる場合にのみ使用してください。
:::


デフォルトでは、クライアントはクライアント設定で指定された設定（`max_open_connections`、`keep_alive.enabled`、`tls` など）を使用して下層の HTTP(s) エージェントを構成し、ClickHouse サーバーへの接続を処理します。さらに、TLS 証明書が使用されている場合、下層のエージェントは必要な証明書で構成され、適切な TLS 認証ヘッダーが適用されます。

バージョン 1.2.0 以降、デフォルトの下層エージェントを置き換えるカスタム HTTP(s) エージェントをクライアントに提供できるようになりました。これは、ネットワーク構成が複雑な場合に有用です。カスタムエージェントを提供する場合、次の条件が適用されます：

* `max_open_connections` および `tls` オプションは、下層のエージェント構成の一部であるため効果はなく、クライアントによって無視されます。
* `keep_alive.enabled` は、`Connection` ヘッダーのデフォルト値のみを制御します（`true` -&gt; `Connection: keep-alive`, `false` -&gt; `Connection: close`）。
* アイドル状態の keep-alive ソケットの管理は（エージェントではなく特定のソケット自体に結びついているため）引き続き機能しますが、`keep_alive.idle_socket_ttl` の値を `0` に設定することで完全に無効化できるようになりました。

#### カスタムエージェントの使用例

証明書なしでカスタム HTTP(s) エージェントを使用する場合：

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

基本的な TLS と CA 証明書を使用したカスタム HTTPS エージェントの利用:

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
  // カスタムHTTPSエージェントを使用する場合、クライアントはデフォルトのHTTPS接続実装を使用しません。ヘッダーは手動で指定する必要があります
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
  },
  // 重要: authorizationヘッダーはTLSヘッダーと競合するため、無効化してください。
  set_basic_auth_header: false,
})
```

相互 TLS 対応のカスタム HTTPS エージェントの使用:

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
  // カスタムHTTPSエージェントを使用する場合、クライアントはデフォルトのHTTPS接続実装を使用しません。ヘッダーは手動で指定する必要があります
  http_headers: {
    'X-ClickHouse-User': 'username',
    'X-ClickHouse-Key': 'password',
    'X-ClickHouse-SSL-Certificate-Auth': 'on',
  },
  // 重要: authorizationヘッダーはTLSヘッダーと競合するため、無効化する必要があります。
  set_basic_auth_header: false,
})
```

証明書とカスタムの *HTTPS* エージェントを併用する場合、TLS ヘッダーと競合するため、（1.2.0 で導入された）`set_basic_auth_header` 設定を使ってデフォルトの認証ヘッダーを無効化する必要がある可能性があります。すべての TLS 関連ヘッダーは手動で設定してください。


## 既知の制限事項 (Node.js / web) {#known-limitations-nodejsweb}

- 結果セットに対するデータマッパーは存在しないため、言語のプリミティブ型のみが使用されます。特定のデータ型マッパーは、[RowBinary フォーマットのサポート](https://github.com/ClickHouse/clickhouse-js/issues/216)と併せて追加予定です。
- [Decimal* および Date\* / DateTime\* データ型に関する注意点](./js.md#datedate32-types-caveats)があります。
- JSON* ファミリーのフォーマットを使用する場合、Int32 を超える大きさの数値は文字列として表現されます。これは、Int64 以上の型の最大値が `Number.MAX_SAFE_INTEGER` を超えるためです。詳細については、[Integral types](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) セクションを参照してください。



## 既知の制限事項（Web） {#known-limitations-web}

- SELECT クエリに対するストリーミングは動作しますが、INSERT に対しては無効化されています（型レベルでも同様です）。
- リクエスト圧縮は無効になっており、設定は無視されます。レスポンス圧縮は動作します。
- ログ出力はまだサポートされていません。



## パフォーマンス最適化のためのヒント {#tips-for-performance-optimizations}

- アプリケーションのメモリ消費を削減するには、大規模なデータの挿入処理（例: ファイルから）や、該当する場合の SELECT に対してストリーミングの利用を検討してください。イベントリスナーなどのユースケースでは、[非同期挿入](/optimize/asynchronous-inserts) も有力な選択肢であり、クライアント側でのバッチ処理を最小限に抑えるか、完全に不要にすることができます。非同期挿入の例は、[クライアントリポジトリ](https://github.com/ClickHouse/clickhouse-js/tree/main/examples) に、ファイル名のプレフィックスが `async_insert_` のファイルとして用意されています。
- クライアントはデフォルトではリクエストおよびレスポンスの圧縮を有効化しません。しかし、大規模なデータセットで SELECT または INSERT を行う場合は、`ClickHouseClientConfigOptions.compression` を介して圧縮を有効にすることを検討してください（`request` または `response` のみ、あるいはその両方）。
- 圧縮には無視できないパフォーマンス上のオーバーヘッドがあります。`request` または `response` に対して圧縮を有効にすると、それぞれ SELECT や INSERT の速度に悪影響を与えますが、アプリケーションが転送するネットワークトラフィック量を削減できます。



## お問い合わせ {#contact-us}

ご不明な点やサポートが必要な場合は、[Community Slack](https://clickhouse.com/slack)（`#clickhouse-js` チャンネル）または [GitHub Issues](https://github.com/ClickHouse/clickhouse-js/issues) からお気軽にお問い合わせください。
