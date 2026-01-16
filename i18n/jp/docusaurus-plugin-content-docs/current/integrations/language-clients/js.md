---
sidebar_label: 'JavaScript'
sidebar_position: 4
keywords: ['clickhouse', 'js', 'JavaScript', 'NodeJS', 'web', 'browser', 'Cloudflare', 'workers', 'client', 'connect', 'integrate']
slug: /integrations/javascript
description: 'ClickHouse への接続用公式 JS クライアント。'
title: 'ClickHouse JS'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-js'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# ClickHouse JS \\{#clickhouse-js\\}

ClickHouse へ接続するための公式の JS クライアントです。
このクライアントは TypeScript で実装されており、クライアントの公開 API 向けの型定義を提供します。

外部依存はなく、パフォーマンスを最大化するよう最適化されており、さまざまな ClickHouse のバージョンおよび構成（オンプレミスの単一ノード、オンプレミスのクラスター、ClickHouse Cloud）でテストされています。

利用する環境に応じて、2 種類のクライアントバージョンが利用可能です:

- `@clickhouse/client` - Node.js 専用
- `@clickhouse/client-web` - ブラウザ（Chrome/Firefox）、Cloudflare Workers

TypeScript を使用する場合は、[バージョン 4.5 以上](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)であることを確認してください。これは、[インラインでの import/export 構文](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)を有効にします。

クライアントのソースコードは [ClickHouse-JS GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-js)で公開されています。

## 動作環境要件（Node.js） \\{#environment-requirements-nodejs\\}

クライアントを実行するには、環境に Node.js がインストールされている必要があります。
クライアントは、[サポート対象](https://github.com/nodejs/release#readme)となっているすべての Node.js リリースと互換性があります。

ある Node.js バージョンが End-of-Life に近づくと、そのバージョンは古く安全でないと見なされるため、クライアントはそのバージョンのサポートを終了します。

現在サポートされている Node.js バージョン:

| Node.js version | Supported?      |
|-----------------|-----------------|
| 24.x            | ✔               |
| 22.x            | ✔               |
| 20.x            | ✔               |
| 18.x            | ベストエフォート |

## 環境要件（Web） \\{#environment-requirements-web\\}

クライアントの Web 版は、最新の Chrome および Firefox ブラウザで公式にテストされており、React/Vue/Angular アプリケーションや Cloudflare Workers などで依存ライブラリとして利用できます。

## インストール \\{#installation\\}

最新の安定版 Node.js クライアントをインストールするには、次のコマンドを実行します。

```sh
npm i @clickhouse/client
```

Web 版のインストール：

```sh
npm i @clickhouse/client-web
```

## ClickHouse との互換性 \\{#compatibility-with-clickhouse\\}

| クライアントのバージョン | ClickHouse |
|---------------------------|------------|
| 1.12.0                    | 24.8+      |

クライアントはおそらくそれ以前の古いバージョンでも動作しますが、ベストエフォートベースのサポートであり、動作は保証されません。23.3 より古い ClickHouse バージョンをお使いの場合は、[ClickHouse セキュリティポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) を参照し、アップグレードを検討してください。

## 例 \\{#examples\\}

クライアントリポジトリ内の [examples](https://github.com/ClickHouse/clickhouse-js/blob/main/examples) では、クライアントのさまざまな利用シナリオを網羅することを目指しています。

概要は [examples の README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview) で確認できます。

例や以下のドキュメントに不明点や不足している点があれば、遠慮なく[お問い合わせください](./js.md#contact-us)。

### クライアント API \\{#client-api\\}

特に明記がない限り、ほとんどのサンプルは Node.js 版およびブラウザ版のクライアントの両方で利用できます。

#### クライアントインスタンスの作成 \\{#creating-a-client-instance\\}

`createClient` ファクトリー関数を使用して、必要に応じてクライアントインスタンスをいくつでも作成できます。

```ts
import { createClient } from '@clickhouse/client' // or '@clickhouse/client-web'

const client = createClient({
  /* configuration */
})
```

お使いの環境が ESM モジュールをサポートしていない場合は、代わりに CJS 構文を使用できます。

```ts
const { createClient } = require('@clickhouse/client');

const client = createClient({
  /* configuration */
})
```

クライアントインスタンスは、生成時に[あらかじめ構成](./js.md#configuration)できます。

#### 設定 \\{#configuration\\}

クライアントインスタンスを作成する際、次の接続設定を調整できます:

| 設定                                                                      | 説明                                                                                                  | デフォルト値            | 関連項目                                                                                                   |
|--------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|-------------------------|------------------------------------------------------------------------------------------------------------|
| **url**?: string                                                         | ClickHouse インスタンスの URL。                                                                      | `http://localhost:8123` | [URL 設定のドキュメント](./js.md#url-configuration)                                                        |
| **pathname**?: string                                                    | クライアントによる解析後に ClickHouse の URL に追加されるオプションのパス名。                        | `''`                    | [pathname 付きプロキシのドキュメント](./js.md#proxy-with-a-pathname)                                       |
| **request_timeout**?: number                                             | リクエストタイムアウト（ミリ秒単位）。                                                               | `30_000`                | -                                                                                                          |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }`    | 圧縮の有効／無効を指定します。                                                                       | -                       | [圧縮のドキュメント](./js.md#compression)                                                                  |
| **username**?: string                                                    | リクエストを実行するユーザー名。                                                                     | `default`               | -                                                                                                          |
| **password**?: string                                                    | ユーザーのパスワード。                                                                               | `''`                    | -                                                                                                          |
| **application**?: string                                                 | Node.js クライアントを使用するアプリケーション名。                                                   | `clickhouse-js`         | -                                                                                                          |
| **database**?: string                                                    | 使用するデータベース名。                                                                             | `default`               | -                                                                                                          |
| **clickhouse_settings**?: ClickHouseSettings                             | すべてのリクエストに適用する ClickHouse の設定。                                                     | `{}`                    | -                                                                                                          |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | クライアント内部ログの設定。                                                                         | -                       | [ログ記録のドキュメント](./js.md#logging-nodejs-only)                                                      |
| **session_id**?: string                                                  | すべてのリクエストに対して送信するオプションの ClickHouse セッション ID。                            | -                       | -                                                                                                          |
| **keep_alive**?: `{ **enabled**?: boolean }`                             | Node.js 版および Web 版の両方で、デフォルトで有効になっています。                                    | -                       | -                                                                                                          |
| **http_headers**?: `Record<string, string>`                              | ClickHouse への送信リクエストに付与する追加の HTTP ヘッダー。                                        | -                       | [認証付きリバースプロキシのドキュメント](./js.md#reverse-proxy-with-authentication)                        |
| **roles**?: string \|  string[]                                          | 送信リクエストに関連付ける ClickHouse のロール名。                                                   | -                       | [HTTP インターフェイスでのロールの使用](/interfaces/http#setting-role-with-query-parameters)              |

#### Node.js 固有の設定パラメータ \\{#nodejs-specific-configuration-parameters\\}

| Setting                                                                    | Description                                                     | Default Value | See Also                                                                                             |
|----------------------------------------------------------------------------|-----------------------------------------------------------------|---------------|------------------------------------------------------------------------------------------------------|
| **max_open_connections**?: number                                          | ホストごとに許可される接続中ソケットの最大数。                 | `10`          | -                                                                                                    |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`   | TLS 証明書を設定します。                                        | -             | [TLS docs](./js.md#tls-certificates-nodejs-only)                                                     |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                               | -             | [Keep Alive docs](./js.md#keep-alive-configuration-nodejs-only)                                      |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>       | クライアント用のカスタム HTTP エージェント。                  | -             | [HTTP agent docs](./js.md#custom-httphttps-agent-experimental-nodejs-only)                           |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>              | Basic 認証の資格情報を使用して `Authorization` ヘッダーを設定します。 | `true`        | [HTTP agent docs におけるこの設定の利用方法](./js.md#custom-httphttps-agent-experimental-nodejs-only) |

### URL 設定 \\{#url-configuration\\}

:::important
URL 設定は*常に*ハードコードされた値を上書きし、この場合は警告がログに記録されます。
:::

ほとんどのクライアントインスタンスのパラメーターは URL で設定できます。URL の形式は `http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]` です。ほとんどの場合、各パラメーター名は設定オプションインターフェイス上でのパスを反映していますが、いくつかの例外があります。サポートされているパラメーターは次のとおりです。

| Parameter                                   | Type                                                      |
| ------------------------------------------- | --------------------------------------------------------- |
| `pathname`                                  | 任意の文字列。                                                   |
| `application_id`                            | 任意の文字列。                                                   |
| `session_id`                                | 任意の文字列。                                                   |
| `request_timeout`                           | 0 以上の数値。                                                  |
| `max_open_connections`                      | 0 より大きい数値。                                                |
| `compression_request`                       | boolean。下記 (1) を参照                                        |
| `compression_response`                      | boolean。                                                  |
| `log_level`                                 | 使用可能な値: `OFF`, `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`. |
| `keep_alive_enabled`                        | boolean。                                                  |
| `clickhouse_setting_*` or `ch_*`            | 下記 (2) を参照                                                |
| `http_header_*`                             | 下記 (3) を参照                                                |
| (Node.js only) `keep_alive_idle_socket_ttl` | 0 以上の数値。                                                  |

* (1) boolean の場合、有効な値は `true`/`1` および `false`/`0` です。
* (2) `clickhouse_setting_` または `ch_` というプレフィックスを持つ任意のパラメーターは、このプレフィックスが削除され、残りの部分がクライアントの `clickhouse_settings` に追加されます。たとえば、`?ch_async_insert=1&ch_wait_for_async_insert=1` は次と同じになります:

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1,
  },
})
```

Note: `clickhouse_settings` のブール値は、URL では `1`/`0` として指定する必要があります。

* (3) (2) と同様ですが、`http_header` の設定用です。例えば、`?http_header_x-clickhouse-auth=foobar` は次の設定と同等になります：

```ts
createClient({
  http_headers: {
    'x-clickhouse-auth': 'foobar',
  },
})
```

### 接続 \\{#connecting\\}

#### 接続情報を確認する \\{#gather-your-connection-details\\}

<ConnectionDetails />

#### 接続の概要 \\{#connection-overview\\}

クライアントは HTTP(s) プロトコル経由で接続を行います。RowBinary のサポートは開発中です。[関連する issue](https://github.com/ClickHouse/clickhouse-js/issues/216) を参照してください。

次の例は、ClickHouse Cloud への接続をどのように設定するかを示しています。`url`（プロトコルおよびポートを含む）と `password` の値は環境変数で指定され、`default` ユーザーを使用することを前提としています。

**例:** 環境変数による設定を用いて Node.js クライアントインスタンスを作成する。

```ts
import { createClient } from '@clickhouse/client'

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? 'http://localhost:8123',
  username: process.env.CLICKHOUSE_USER ?? 'default',
  password: process.env.CLICKHOUSE_PASSWORD ?? '',
})
```

クライアントリポジトリには、[ClickHouse Cloud にテーブルを作成する](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)、[非同期インサートを使用する](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts) など、環境変数を使用するサンプルが複数含まれており、そのほかにも多数の例があります。

#### 接続プール（Node.js のみ） \\{#connection-pool-nodejs-only\\}

各リクエストごとに接続を確立するオーバーヘッドを回避するため、クライアントは ClickHouse への接続を再利用するための接続プールを作成し、Keep-Alive メカニズムを利用します。デフォルトでは Keep-Alive は有効になっており、接続プールのサイズは `10` に設定されていますが、`max_open_connections` [設定オプション](./js.md#configuration)で変更できます。

ユーザーが `max_open_connections: 1` を設定しない限り、プール内の同じ接続が後続のクエリに使用されることは保証されません。これは必要となることはまれですが、一時テーブルを使用するケースでは必要になる場合があります。

あわせて参照: [Keep-Alive 設定](./js.md#keep-alive-configuration-nodejs-only)。

### クエリ ID \\{#query-id\\}

クエリまたはステートメント（`command`、`exec`、`insert`、`select`）を送信するすべてのメソッドは、結果内に `query_id` を含みます。この一意の識別子はクエリごとにクライアントによって割り当てられ、[サーバー設定](/operations/server-configuration-parameters/settings) で有効化されている場合には `system.query_log` からデータを取得する際や、長時間実行中のクエリをキャンセルする際などに役立ちます（[例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts) を参照してください）。必要に応じて、`query_id` は `command` / `query` / `exec` / `insert` メソッドのパラメータでユーザーが上書きできます。

:::tip
`query_id` パラメータを上書きする場合は、呼び出しごとに一意になるようにする必要があります。ランダムな UUID を使用するのが推奨されます。
:::

### すべてのクライアントメソッドに共通の基本パラメータ \\{#base-parameters-for-all-client-methods\\}

すべてのクライアントメソッド（[query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method)）で共通して使用できるパラメータがいくつかあります。

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

### クエリメソッド \\{#query-method\\}

これは、`SELECT` のようなレスポンスを返すほとんどのステートメントや、`CREATE TABLE` のような DDL を送信する際に使用し、`await` して結果を受け取る必要があります。返された結果セットは、アプリケーション側で利用されることを前提としています。

:::note
データ挿入専用のメソッドとして [insert](./js.md#insert-method)、DDL 用として [command](./js.md#command-method) が用意されています。
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

こちらも参照してください: [すべてのクライアントメソッドに共通の基本パラメータ](./js.md#base-parameters-for-all-client-methods)。

:::tip
`query` 内で FORMAT 句は指定せず、代わりに `format` パラメータを使用してください。
:::

#### 結果セットおよび行の抽象化 \\{#result-set-and-row-abstractions\\}

`ResultSet` は、アプリケーション内でのデータ処理を容易にするための、いくつかの便利なメソッドを提供します。

Node.js の `ResultSet` 実装は内部的に `Stream.Readable` を使用し、Web 版は Web API の `ReadableStream` を使用します。

`ResultSet` に対して `text` または `json` メソッドを呼び出すことで、クエリによって返されたすべての行をメモリ上に読み込んで処理できます。

`ResultSet` はレスポンスストリームを開いたままにし、その結果として基盤となる接続をビジー状態に保つため、可能な限り早く `ResultSet` の消費を開始する必要があります。アプリケーションによる過剰なメモリ使用を避けるため、クライアントは受信データをバッファリングしません。

あるいは、結果セットが大きすぎて一度にメモリに載せられない場合は、`stream` メソッドを呼び出し、ストリーミングモードでデータを処理できます。レスポンスの各チャンクは、代わりに比較的小さな行配列へと変換されます（この配列のサイズは、サーバーからクライアントが受信する各チャンクのサイズ（可変）や、個々の行のサイズによって決まります）。処理はチャンクごとに順次行われます。

どのフォーマットが利用ケースにおけるストリーミングに最適かを判断するには、[サポートされているデータフォーマット](./js.md#supported-data-formats) の一覧を参照してください。たとえば、JSON オブジェクトをストリームしたい場合は [JSONEachRow](/interfaces/formats/JSONEachRow) を選択でき、この場合、各行は JS オブジェクトとしてパースされます。あるいは、よりコンパクトな [JSONCompactColumns](/interfaces/formats/JSONCompactColumns) フォーマットを選択すると、各行は値のコンパクトな配列として表現されます。あわせて [streaming files](./js.md#streaming-files-nodejs-only) も参照してください。

:::important
`ResultSet` またはそのストリームが最後まで消費されなかった場合、非アクティブ状態が `request_timeout` 期間続くと破棄されます。
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

**例:** (Node.js/Web) `JSONEachRow` 形式の結果データセットを返すクエリで、ストリーム全体を読み取り、その内容を JS オブジェクトとしてパースします。\
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // or `row.text` to avoid parsing JSON
```

**例:** (Node.js のみ) 従来の `on('data')` アプローチを使って、`JSONEachRow` フォーマットのクエリ結果をストリーミングします。これは `for await const` 構文と置き換えて使用できます。[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

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

**例:** (`Node.js` のみ) 従来の `on('data')` アプローチを使用して、クエリ結果を `CSV` 形式でストリーミングします。これは `for await const` 構文と置き換えて使用できます。
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

**例:** （Node.js のみ）クエリ結果を `JSONEachRow` 形式の JS オブジェクトとしてストリーミングし、`for await const` 構文で処理します。これは従来の `on('data')` アプローチと置き換えて使用できます。
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
`for await const` 構文は `on('data')` アプローチに比べてコード量をいくらか削減できますが、パフォーマンスに悪影響を及ぼす可能性があります。
詳細は [Node.js リポジトリのこの issue](https://github.com/nodejs/node/issues/31979) を参照してください。
:::

**例:** （Web のみ）オブジェクトを要素とする `ReadableStream` の反復処理。

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

### Insert メソッド \\{#insert-method\\}

これはデータを挿入するための基本的なメソッドです。

```ts
export interface InsertResult {
  query_id: string
  executed: boolean
}

interface ClickHouseClient {
  insert(params: InsertParams): Promise<InsertResult>
}
```

戻り値の型は最小限のものです。これは、サーバーからデータが返されることを想定しておらず、レスポンスストリームを即座に破棄するためです。

空の配列が insert メソッドに渡された場合、insert 文はサーバーに送信されません。その代わり、メソッドは直ちに `{ query_id: '...', executed: false }` で resolve されます。このとき、メソッドのパラメータで `query_id` が指定されていなければ、結果では空文字列となります。クライアント側で生成されたランダムな UUID を返してしまうと、そのような `query_id` を持つクエリは `system.query_log` テーブルに存在しないため、かえって混乱を招く可能性があるためです。

insert 文がサーバーに送信された場合、`executed` フラグは `true` になります。

#### Node.js における insert メソッドとストリーミング \\{#insert-method-and-streaming-in-nodejs\\}

`insert` メソッドに指定された [データ形式](./js.md#supported-data-formats) に応じて、`Stream.Readable` と通常の `Array<T>` のいずれにも対応します。あわせて、[ファイルストリーミング](./js.md#streaming-files-nodejs-only) に関するセクションも参照してください。

insert メソッドは `await` されることを想定していますが、入力ストリームを先に指定しておき、ストリームの完了時点になって初めて `insert` 処理を待機することも可能です（そのタイミングで `insert` の Promise も resolve されます）。これはイベントリスナーなどのシナリオで有用な場合がありますが、クライアント側で多数のエッジケースを考慮したエラー処理が必要となり、単純ではない可能性があります。代わりに、[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts) に示すように [非同期 insert](/optimize/asynchronous-inserts) の利用を検討してください。

:::tip
このメソッドでは表現しづらいカスタム INSERT ステートメントがある場合は、[command メソッド](./js.md#command-method) の利用を検討してください。

[INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts) や [INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts) の例で、その使用方法を確認できます。
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

関連項目: [すべてのクライアントメソッドに共通の基本パラメーター](./js.md#base-parameters-for-all-client-methods)。

:::important
`abort_signal` によってキャンセルされたリクエストであっても、データの挿入が行われなかったことは保証されません。キャンセル前に、サーバーがストリーミングされたデータの一部をすでに受信している可能性があるためです。
:::

**例:** (Node.js/Web) 配列の値を挿入します。
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

**例：**（Node.js のみ）CSV ファイルからストリームとして挿入します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)。関連項目：[ファイルストリーミング](./js.md#streaming-files-nodejs-only)。

```ts
await client.insert({
  table: 'my_table',
  values: fs.createReadStream('./path/to/a/file.csv'),
  format: 'CSV',
})
```

**例**: `INSERT` 文から特定のカラムを除外する。

次のようなテーブル定義があるとします。

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

特定の列のみを挿入する:

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

特定の列を除外する：

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

詳細については[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts)を参照してください。

**例**: クライアントインスタンスで指定されたものとは異なるデータベースに `INSERT` する。[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)。

```ts
await client.insert({
  table: 'mydb.mytable', // Fully qualified name including the database
  values: [{ id: 42, message: 'foo' }],
  format: 'JSONEachRow',
})
```

#### Web バージョンの制限事項 \\{#web-version-limitations\\}

現在、`@clickhouse/client-web` での insert 処理は `Array<T>` と `JSON*` フォーマットでのみ動作します。
ブラウザの互換性が十分でないため、Web バージョンではまだストリームの挿入はサポートされていません。

そのため、Web バージョンの `InsertParams` インターフェースは Node.js バージョンとはやや異なり、
`values` は `ReadonlyArray<T>` 型のみに制限されています。

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

これは今後変更される可能性があります。あわせてこちらも参照してください: [すべてのクライアントメソッドに共通の基本パラメーター](./js.md#base-parameters-for-all-client-methods)。

### Command メソッド \\{#command-method\\}

出力を伴わないステートメント、`FORMAT` 句が適用できないステートメント、あるいはレスポンスにまったく関心がない場合に使用できます。このようなステートメントの例としては、`CREATE TABLE` や `ALTER TABLE` があります。

`await` する必要があります。

レスポンスストリームは即座に破棄されるため、下位のソケットは解放されます。

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

参照: [すべてのクライアントメソッドに共通の基本パラメータ](./js.md#base-parameters-for-all-client-methods)。

**例:** (Node.js/Web) ClickHouse Cloud にテーブルを作成する例。
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

**例:** (Node.js/Web) セルフホストの ClickHouse インスタンスでテーブルを作成します。
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
`abort_signal` によってリクエストがキャンセルされても、そのステートメントがサーバー側で実行されなかったことが保証されるわけではありません。
:::

### Exec メソッド \\{#exec-method\\}

`query`/`insert` に収まらないカスタムクエリがあり、
その結果を取得したい場合は、`command` の代わりに `exec` を使用できます。

`exec` は読み取り可能なストリームを返し、これはアプリケーション側で必ず消費するか破棄する必要があります。

```ts
interface ExecParams extends BaseQueryParams {
  // Statement to execute.
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

こちらも参照: [すべてのクライアントメソッドに共通の基本パラメータ](./js.md#base-parameters-for-all-client-methods)。

ストリームの戻り値の型は、Node.js版とWeb版で異なります。

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

### Ping \\{#ping\\}

接続状態を確認するために用意されている `ping` メソッドは、サーバーに到達可能な場合は `true` を返します。

サーバーに到達できない場合は、その原因となったエラーも結果に含まれます。

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

Ping は、特に ClickHouse Cloud でインスタンスがアイドル状態になっており、ping によって起動する場合などに、アプリケーション起動時にサーバーが利用可能かどうかを確認するための有用なツールです。その場合は、間に遅延を挟みながら、数回再試行することを検討してください。

デフォルトでは、Node.js 版は `/ping` エンドポイントを使用しますが、Web 版は同様の結果を得るために単純な `SELECT 1` クエリを使用します。これは、`/ping` エンドポイントが CORS をサポートしていないためです。

**例:** (Node.js/Web) ClickHouse サーバーインスタンスへの単純な ping。注: Web 版ではキャッチされるエラーは異なります。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts)。

```ts
const result = await client.ping();
if (!result.success) {
  // process result.error
}
```

**例：** `ping` メソッドを呼び出すときに認証情報も検証したい場合や、`query_id` などの追加パラメータを指定したい場合は、次のように利用できます。

```ts
const result = await client.ping({ select: true, /* query_id, abort_signal, http_headers, or any other query params */ });
```

`ping` メソッドでは、標準的な `query` メソッドのパラメータのほとんどを指定できます。詳細は `PingParamsWithSelectQuery` の型定義を参照してください。

### Close（Node.js のみ） \\{#close-nodejs-only\\}

開いているすべての接続を閉じ、リソースを解放します。Web 版では何も行われません。

```ts
await client.close()
```

## ファイルのストリーミング（Node.js のみ） \\{#streaming-files-nodejs-only\\}

クライアントのリポジトリには、一般的なデータ形式（NDJSON、CSV、Parquet）を用いたファイルストリーミングのサンプルコードがいくつか用意されています。

- [NDJSON ファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [CSV ファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Parquet ファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Parquet ファイルへのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

その他の形式をファイルにストリーミングする場合も、Parquet の場合とほぼ同様です。
`query` 呼び出しで使用するフォーマット（`JSONEachRow`、`CSV` など）と出力ファイル名だけが異なります。

## サポートされているデータ形式 \\{#supported-data-formats\\}

クライアントは、データ形式を JSON またはテキストとして扱います。

`format` に JSON ファミリー（`JSONEachRow`、`JSONCompactEachRow` など）のいずれかを指定した場合、クライアントはネットワーク経由の通信時にデータをシリアライズおよびデシリアライズします。

生のテキスト形式（`CSV`、`TabSeparated` および `CustomSeparated` ファミリー）で提供されるデータは、追加の変換なしでネットワーク経由で送信されます。

:::tip
一般的なフォーマットとしての JSON と、[ClickHouse JSON フォーマット](/interfaces/formats/JSON) を混同してしまう場合があります。

クライアントは、[JSONEachRow](/interfaces/formats/JSONEachRow) などのフォーマットを用いた JSON オブジェクトのストリーミングをサポートします（他のストリーミング向きのフォーマットについては以下の表を参照してください。また、`select_streaming_` の[クライアントリポジトリ内のサンプル](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)も参照してください）。

[ClickHouse JSON](/interfaces/formats/JSON) など一部のフォーマットは、レスポンス内で単一のオブジェクトとして表現されるため、クライアントによるストリーミングはできません。
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

Parquet の場合、`SELECT` の主なユースケースは、結果ストリームを書き出してファイルに保存することです。クライアントリポジトリ内の[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)を参照してください。

`JSONEachRowWithProgress` は、ストリーム内での進捗報告をサポートする出力専用フォーマットです。詳細については[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)を参照してください。

ClickHouse の入力および出力フォーマットの完全な一覧は
[こちら](/interfaces/formats)で確認できます。

## サポートされている ClickHouse データ型 \\{#supported-clickhouse-data-types\\}

:::note
関連する JS 型は、すべてを文字列として表現するフォーマット（例: `JSONStringEachRow`）を除く、任意の `JSON*` フォーマットに対して適用されます。
:::

| Type                   | Status                | JS type                    |
|------------------------|-----------------------|----------------------------|
| UInt8/16/32            | ✔️                    | number                     |
| UInt64/128/256         | ✔️ ❗- 下記を参照      | string                     |
| Int8/16/32             | ✔️                    | number                     |
| Int64/128/256          | ✔️ ❗- 下記を参照      | string                     |
| Float32/64             | ✔️                    | number                     |
| Decimal                | ✔️ ❗- 下記を参照      | number                     |
| Boolean                | ✔️                    | boolean                    |
| String                 | ✔️                    | string                     |
| FixedString            | ✔️                    | string                     |
| UUID                   | ✔️                    | string                     |
| Date32/64              | ✔️                    | string                     |
| DateTime32/64          | ✔️ ❗- 下記を参照      | string                     |
| Enum                   | ✔️                    | string                     |
| LowCardinality         | ✔️                    | string                     |
| Array(T)               | ✔️                    | T[]                        |
| (new) JSON             | ✔️                    | object                     |
| Variant(T1, T2...)     | ✔️                    | T (バリアントに依存)      |
| Dynamic                | ✔️                    | T (バリアントに依存)      |
| Nested                 | ✔️                    | T[]                        |
| Tuple(T1, T2, ...)     | ✔️                    | [T1, T2, ...]              |
| Tuple(n1 T1, n2 T2...) | ✔️                    | \{ n1: T1; n2: T2; ...}    |
| Nullable(T)            | ✔️                    | T の JS 型または null      |
| IPv4                   | ✔️                    | string                     |
| IPv6                   | ✔️                    | string                     |
| Point                  | ✔️                    | [ number, number ]         |
| Ring                   | ✔️                    | Array&lt;Point\>           |
| Polygon                | ✔️                    | Array&lt;Ring\>            |
| MultiPolygon           | ✔️                    | Array&lt;Polygon\>         |
| Map(K, V)              | ✔️                    | Record&lt;K, V\>           |
| Time/Time64            | ✔️                    | string                     |

サポートされている ClickHouse データ型の全リストは
[こちら](/sql-reference/data-types/)にあります。

あわせて参照:

- [Dynamic/Variant/JSON を扱う例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/dynamic_variant_json.ts)
- [Time/Time64 を扱う例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/time_time64.ts)

### Date/Date32 型の注意事項 \\{#datedate32-types-caveats\\}

クライアントは値を挿入する際に追加の型変換を行わないため、`Date`/`Date32` 型のカラムには値を文字列としてのみ挿入できます。

**例:** `Date` 型の値を挿入します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)

```ts
await client.insert({
  table: 'my_table',
  values: [ { date: '2022-09-05' } ],
  format: 'JSONEachRow',
})
```

ただし、`DateTime` や `DateTime64` の列を使用している場合は、文字列と JS Date オブジェクトの両方を利用できます。JS Date オブジェクトは、`date_time_input_format` を `best_effort` に設定した状態で、そのまま `insert` に渡すことができます。詳細については、この[サンプル](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts)を参照してください。

### Decimal* 型の注意事項 \\{#decimal-types-caveats\\}

`JSON*` 系のフォーマットを使用して Decimal 型の値を挿入できます。次のようにテーブルが定義されているとします：

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

文字列表現を使えば、精度を失うことなく値を挿入できます。

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

しかし、`JSON*` フォーマットでデータをクエリする場合、ClickHouse はデフォルトで Decimal 型を *数値* として返すため、精度が損なわれる可能性があります。これを避けるには、クエリ内で Decimal 型を文字列にキャストします:

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

詳しくは[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts)を参照してください。

### 整数型: Int64, Int128, Int256, UInt64, UInt128, UInt256 \\{#integral-types-int64-int128-int256-uint64-uint128-uint256\\}

サーバーはこれらの値を数値として受け取ることができますが、これらの型の最大値は `Number.MAX_SAFE_INTEGER` よりも大きいため、整数オーバーフローを避ける目的で、`JSON*` ファミリーの出力フォーマットでは文字列として返されます。

ただし、この挙動は
[`output_format_json_quote_64bit_integers` 設定](/operations/settings/formats#output_format_json_quote_64bit_integers)
で変更できます。

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

## ClickHouse 設定 \\{#clickhouse-settings\\}

クライアントは [settings](/operations/settings/settings/) メカニズムを通じて ClickHouse の動作を調整できます。
設定はクライアントインスタンスのレベルで指定でき、その場合は ClickHouse に送信されるすべてのリクエストに適用されます。

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

または、設定をリクエスト単位で指定することもできます:

```ts
client.query({
  clickhouse_settings: {}
})
```

すべてのサポート対象 ClickHouse 設定が定義されている型定義ファイルは
[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts)にあります。

:::important
クエリを実行するユーザーが、設定を変更するのに十分な権限を持っていることを確認してください。
:::

## 高度なトピック \\{#advanced-topics\\}

### パラメータ付きクエリ \\{#queries-with-parameters\\}

パラメータ付きのクエリを作成し、クライアントアプリケーションからそれらに値を渡すことができます。これにより、クライアント側で特定の動的な値を埋め込んだクエリ文字列を組み立てる必要がなくなります。

通常どおりクエリを記述し、その後、アプリケーション側のパラメータからクエリに渡したい値を、次の形式で中括弧 `{}` で囲んで指定します。

```text
{<name>: <data_type>}
```

ここで:

* `name` — プレースホルダーの識別子。
* `data_type` - アプリケーションパラメータの値の [データ型](/sql-reference/data-types/)。

**例:** パラメータ付きクエリ。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/query_with_parameter_binding.ts)
.

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

詳細については、[https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax](https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax) を参照してください。

### 圧縮 \\{#compression\\}

注意: リクエスト圧縮は現在 Web 版では利用できません。レスポンス圧縮は通常どおり動作します。Node.js 版は両方をサポートしています。

ネットワーク越しに大規模なデータセットを扱うデータアプリケーションは、圧縮を有効にすることでパフォーマンス向上が見込めます。現在は、[`zlib`](https://nodejs.org/docs/latest-v14.x/api/zlib.html) を使用した `GZIP` のみがサポートされています。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

設定パラメータは次のとおりです:

* `response: true` は、ClickHouse サーバーに圧縮されたレスポンスボディで応答するよう指示します。デフォルト値: `response: false`
* `request: true` は、クライアントから送信されるリクエストボディの圧縮を有効にします。デフォルト値: `request: false`

### ロギング（Node.js のみ） \\{#logging-nodejs-only\\}

:::important
ロギングは実験的な機能であり、将来変更される可能性があります。
:::

デフォルトのロガー実装では、`console.debug/info/warn/error` メソッドを介してログレコードを `stdout` に出力します。
`LoggerClass` を指定することでロギング処理をカスタマイズでき、`level` パラメータ（デフォルトは `OFF`）で目的のログレベルを選択できます。

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

* `TRACE` - Keep-Alive ソケットのライフサイクルに関する低レベルな情報
* `DEBUG` - レスポンス情報 (`Authorization` ヘッダーとホスト情報を除く)
* `INFO` - ほとんど使用されませんが、クライアントの初期化時に現在のログレベルを出力します
* `WARN` - 非致命的なエラー。失敗した `ping` リクエストは警告としてログに記録されます。これは、基盤となるエラーが返却される結果に含まれているためです
* `ERROR` - `query`/`insert`/`exec`/`command` メソッドからの致命的なエラー (失敗したリクエストなど)

デフォルトの Logger 実装は[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts)で確認できます。

### TLS 証明書（Node.js のみ） \\{#tls-certificates-nodejs-only\\}

Node.js クライアントは、オプションで基本（認証局のみ）および相互（認証局とクライアント証明書の両方）の TLS をサポートします。

`certs` フォルダに証明書があり、CA ファイル名が `CA.pem` であると仮定した場合の基本的な TLS 設定例は次のとおりです。

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

クライアント証明書を使用した相互 TLS の設定例：

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

リポジトリ内の [basic](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts) および [mutual](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts) TLS の完全なサンプルコードを参照してください。

### Keep-alive configuration (Node.js only) \\{#keep-alive-configuration-nodejs-only\\}

このクライアントは、基盤となる HTTP エージェントで Keep-Alive をデフォルトで有効化しており、これにより確立済みのソケットが後続のリクエストで再利用され、`Connection: keep-alive` ヘッダーが送信されます。アイドル状態のソケットは、デフォルトでは 2500 ミリ秒間接続プール内に保持されます（このオプションの調整に関する[注意事項](./js.md#adjusting-idle_socket_ttl)を参照してください）。

`keep_alive.idle_socket_ttl` の値は、サーバー／ロードバランサー側の設定よりも十分に低く設定する必要があります。主な理由は、HTTP/1.1 ではサーバーがクライアントに通知せずにソケットをクローズできるため、サーバーまたはロードバランサーがクライアントより「先に」接続をクローズすると、クライアントがすでにクローズされたソケットを再利用しようとし、その結果 `socket hang up` エラーが発生し得るためです。

`keep_alive.idle_socket_ttl` を変更する場合は、サーバー／ロードバランサー側の Keep-Alive 設定と常に同期させたうえで、その値は**必ずそれより低く**設定し、サーバー側が先にオープンな接続をクローズしてしまうことが決してないようにしてください。

#### `idle_socket_ttl` の調整 \\{#adjusting-idle_socket_ttl\\}

クライアントは `keep_alive.idle_socket_ttl` を 2500 ミリ秒に設定します。これは最も安全なデフォルトと考えられるためです。一方、サーバー側では、`config.xml` を変更しない場合、`keep_alive_timeout` が [ClickHouse 23.11 より前のバージョンでは最短 3 秒に設定されている場合があります](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1)。

:::warning
パフォーマンスに満足しており、問題が発生していない場合は、`keep_alive.idle_socket_ttl` の値を増やさ**ない**ことが推奨されます。値を増やすと、「Socket hang-up」エラーが発生する可能性があります。さらに、アプリケーションが多数のクエリを送信しており、その間のダウンタイムがあまりない場合は、ソケットが長時間アイドル状態にならず、クライアントがプール内でソケットを維持するため、デフォルト値で十分です。
:::

次のコマンドを実行すると、サーバーのレスポンスヘッダーから正しい Keep-Alive タイムアウト値を確認できます。

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

レスポンスの `Connection` および `Keep-Alive` ヘッダーの値を確認します。例：

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

この場合、`keep_alive_timeout` は 10 秒なので、アイドル中のソケットをデフォルトより少し長く開いたままにしておくために、`keep_alive.idle_socket_ttl` を 9000 や 9500 ミリ秒まで増やしてみることができます。「Socket hang-up」エラーが発生しないか注意して監視し、このエラーが、クライアントより先にサーバー側が接続を切断していることを示すので、エラーが出なくなるまで値を下げて調整してください。

#### トラブルシューティング \\{#troubleshooting\\}

最新バージョンのクライアントを使用していても `socket hang up` エラーが発生する場合、この問題を解決するためには次のような選択肢があります。

* 少なくとも `WARN` ログレベルでログを有効にします。これにより、アプリケーションコード内に未消費のストリームやぶら下がったストリームが存在しないか確認できます。トランスポート層は、そのようなストリームを WARN レベルでログ出力します。これは、サーバー側によるソケットのクローズにつながる可能性があるためです。クライアントの設定でログを有効にするには、次のようにします。
  
  ```ts
  const client = createClient({
    log: { level: ClickHouseLogLevel.WARN },
  })
  ```
  
* [no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/) ESLint ルールを有効にした状態でアプリケーションコードを確認します。これにより、ぶら下がったストリームやソケットにつながり得る、未処理の Promise を特定するのに役立ちます。

* ClickHouse サーバー設定の `keep_alive.idle_socket_ttl` を少し減らします。特定の状況、たとえばクライアントとサーバー間のネットワーク遅延が大きい場合には、`keep_alive.idle_socket_ttl` をさらに 200〜500 ミリ秒ほど短くすることで、送信中のリクエストがサーバー側でクローズされる予定のソケットを取得してしまう状況を回避できる場合があります。

* このエラーが、入出力データのない長時間実行クエリ中（例: 長時間実行される `INSERT FROM SELECT`）に発生している場合は、ロードバランサーがアイドル状態のコネクションをクローズしている可能性があります。次の ClickHouse 設定を組み合わせることで、長時間実行クエリの間も何らかのデータが送受信されるようにすることを試せます。

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
  ただし、最近の Node.js バージョンでは、受信する HTTP ヘッダーの総サイズには 16KB の制限がある点に注意してください。進捗ヘッダーを一定回数（テストでは約 70〜80 回）受信すると、例外が発生します。

  まったく異なるアプローチをとり、ネットワーク上の待ち時間を完全に避けることも可能です。接続が失われても mutation はキャンセルされない、という HTTP インターフェイスの「特徴」を利用します。詳細については、[この例（パート 2）](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts) を参照してください。

* Keep-Alive 機能を完全に無効にすることもできます。この場合、クライアントはすべてのリクエストに `Connection: close` ヘッダーを追加し、下層の HTTP エージェントはコネクションを再利用しません。アイドル状態のソケットが存在しないため、`keep_alive.idle_socket_ttl` 設定は無視されます。その代わり、各リクエストごとに新しい接続を確立する必要があるため、オーバーヘッドが増加します。

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false,
    },
  })
  ```

### 読み取り専用ユーザー \\{#read-only-users\\}

[readonly=1 ユーザー](/operations/settings/permissions-for-queries#readonly) でクライアントを使用する場合、レスポンス圧縮は有効化できません。`enable_http_compression` 設定が必要となるためです。次の構成はエラーが発生します。

```ts
const client = createClient({
  compression: {
    response: true, // won't work with a readonly=1 user
  },
})
```

`readonly=1` ユーザーの制限事項についてさらに詳しく説明している [例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts) を参照してください。

### パス名付きプロキシ \\{#proxy-with-a-pathname\\}

ClickHouse インスタンスがプロキシの背後にあり、たとえば [http://proxy:8123/clickhouse&#95;server](http://proxy:8123/clickhouse_server) のように URL にパス名が含まれている場合は、`pathname` 設定オプションとして `clickhouse_server` を指定してください（先頭のスラッシュの有無は問いません）。そうせずに `url` に直接含めた場合は、それが `database` オプションとして解釈されます。`/my_proxy/db` のように複数セグメントを含めることもできます。

```ts
const client = createClient({
  url: 'http://proxy:8123',
  pathname: '/clickhouse_server',
})
```

### 認証付きリバースプロキシ \\{#reverse-proxy-with-authentication\\}

ClickHouse デプロイメントの前段に認証付きのリバースプロキシがある場合は、`http_headers` 設定を使用して、そのプロキシ側で必要なヘッダーを付与できます。

```ts
const client = createClient({
  http_headers: {
    'My-Auth-Header': '...',
  },
})
```

### カスタム HTTP/HTTPS エージェント（実験的、Node.js のみ） \\{#custom-httphttps-agent-experimental-nodejs-only\\}

:::warning
これは将来のリリースで後方互換性のない形で変更される可能性がある実験的機能です。クライアントが提供するデフォルトの実装および設定で、ほとんどのユースケースには十分対応できます。この機能は、本当に必要だと確信できる場合にのみ使用してください。
:::

デフォルトでは、クライアントはクライアント設定で指定された設定（`max_open_connections`、`keep_alive.enabled`、`tls` など）を使用して、内部の HTTP(s) エージェントを構成し、ClickHouse サーバーへの接続を処理します。さらに、TLS 証明書が使用されている場合、内部エージェントは必要な証明書で構成され、適切な TLS 認証ヘッダーが適用されます。

1.2.0 以降では、クライアントにカスタム HTTP(s) エージェントを指定して、デフォルトの内部エージェントを置き換えることが可能です。これは、ネットワーク構成が複雑な場合に有用なことがあります。カスタムエージェントが提供される場合、次の条件が適用されます。

- `max_open_connections` および `tls` オプションは、内部エージェントの設定の一部であるため、_効果はなく_ クライアントによって無視されます。
- `keep_alive.enabled` は、`Connection` ヘッダーのデフォルト値のみを制御します（`true` -> `Connection: keep-alive`、`false` -> `Connection: close`）。
- アイドル状態の keep-alive ソケット管理は（エージェントではなく個々のソケット自体に結び付いているため）引き続き機能しますが、`keep_alive.idle_socket_ttl` の値を `0` に設定することで、これを完全に無効にできるようになりました。

#### カスタムエージェントの使用例 \\{#custom-agent-usage-examples\\}

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

基本的な TLS と CA 証明書を用いたカスタム HTTPS エージェントの使用:

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

相互TLS対応カスタムHTTPSエージェントの使用:

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

証明書とカスタムの *HTTPS* Agent を併用する場合、TLS ヘッダーと競合するため、`set_basic_auth_header` 設定（1.2.0 で導入）でデフォルトの Authorization ヘッダーを無効化する必要がある可能性があります。TLS 関連のヘッダーはすべて手動で指定する必要があります。

## 既知の制限事項 (Node.js/web) \\{#known-limitations-nodejsweb\\}

- 結果セット用のデータマッパーは用意されておらず、言語のプリミティブ型のみが使用されます。特定のデータ型マッパーについては、[RowBinary フォーマットのサポート](https://github.com/ClickHouse/clickhouse-js/issues/216)を伴って追加が予定されています。
- [Decimal\* および Date\* / DateTime\* データ型に関する注意点](./js.md#datedate32-types-caveats)がいくつかあります。
- JSON\* 系フォーマットを使用する場合、Int32 より大きい数値は文字列として表現されます。これは、Int64 以上の型の最大値が `Number.MAX_SAFE_INTEGER` を上回るためです。詳細は [Integral types](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256) のセクションを参照してください。

## 既知の制限事項（web） \\{#known-limitations-web\\}

- 一部の `SELECT` クエリに対するストリーミングは動作しますが、`INSERT` に対しては（型レベルでも）無効になっています。
- リクエスト圧縮は無効化されており、設定は無視されます。レスポンス圧縮は機能します。
- 現時点ではログ機能はサポートされていません。

## パフォーマンス最適化のためのヒント \\{#tips-for-performance-optimizations\\}

- アプリケーションのメモリ消費を削減するには、大きな insert（たとえばファイルから）や、可能な場合の select に対してストリームを使用することを検討してください。イベントリスナーなどのユースケースでは、[非同期 insert](/optimize/asynchronous-inserts) も有力な選択肢であり、クライアント側でのバッチ処理を最小限に抑えるか、完全に不要にすることも可能です。非同期 insert の例は、[client リポジトリ](https://github.com/ClickHouse/clickhouse-js/tree/main/examples) に、ファイル名のプレフィックスが `async_insert_` となっているファイルとして用意されています。
- クライアントは、デフォルトではリクエストやレスポンスの圧縮を有効にしていません。ただし、大きなデータセットを select または insert する場合は、`ClickHouseClientConfigOptions.compression` を通じて（`request` のみ、`response` のみ、またはその両方に対して）圧縮を有効にすることを検討できます。
- 圧縮には無視できないパフォーマンス上のオーバーヘッドがあります。`request` または `response` に対して圧縮を有効にすると、それぞれ select や insert の速度には悪影響がありますが、アプリケーションが送受信するネットワークトラフィック量を削減できます。

## お問い合わせ \\{#contact-us\\}

ご質問やサポートが必要な場合は、[Community Slack](https://clickhouse.com/slack)（`#clickhouse-js` チャンネル）または [GitHub の issue](https://github.com/ClickHouse/clickhouse-js/issues) からお気軽にご連絡ください。