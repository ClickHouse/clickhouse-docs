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

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse JS

ClickHouse に接続するための公式 JS クライアントです。
クライアントは TypeScript で実装されており、クライアントの公開 API 向けの型定義を提供します。

依存ライブラリはなく、パフォーマンスを最大限引き出せるよう最適化されており、さまざまな ClickHouse のバージョンおよび構成（オンプレミスの単一ノード、オンプレミスのクラスター、ClickHouse Cloud）でテストされています。

利用環境に応じて、2 つの異なるバージョンのクライアントが提供されています:
- `@clickhouse/client` - Node.js 専用
- `@clickhouse/client-web` - ブラウザ（Chrome/Firefox）、Cloudflare Workers

TypeScript を使用する場合は、[バージョン 4.5 以上](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)であることを確認してください。このバージョンでは、[インラインの import / export 構文](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names)が利用可能になります。

クライアントのソースコードは、[ClickHouse-JS の GitHub リポジトリ](https://github.com/ClickHouse/clickhouse-js)で公開されています。



## 環境要件（Node.js） {#environment-requirements-nodejs}

クライアントを実行するには、環境でNode.jsが利用可能である必要があります。
このクライアントは、すべての[メンテナンス対象](https://github.com/nodejs/release#readme)のNode.jsリリースと互換性があります。

Node.jsのバージョンがサポート終了（End-Of-Life）に近づくと、古く安全でないと見なされるため、クライアントはそのバージョンのサポートを終了します。

現在のNode.jsバージョンのサポート状況：

| Node.jsバージョン | サポート状況  |
| --------------- | ----------- |
| 22.x            | ✔          |
| 20.x            | ✔          |
| 18.x            | ✔          |
| 16.x            | ベストエフォート |


## 環境要件（Web） {#environment-requirements-web}

クライアントのWeb版は、最新のChrome/Firefoxブラウザで正式にテストされており、React/Vue/Angularアプリケーション、またはCloudflare Workersなどの依存関係として使用できます。


## インストール {#installation}

最新の安定版Node.jsクライアントをインストールするには、以下を実行してください:

```sh
npm i @clickhouse/client
```

Web版のインストール:

```sh
npm i @clickhouse/client-web
```


## ClickHouseとの互換性 {#compatibility-with-clickhouse}

| クライアントバージョン | ClickHouse |
| -------------- | ---------- |
| 1.12.0         | 24.8+      |

クライアントは古いバージョンでも動作する可能性がありますが、これはベストエフォートサポートであり、動作を保証するものではありません。ClickHouseのバージョンが23.3より古い場合は、[ClickHouseセキュリティポリシー](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)を参照の上、アップグレードをご検討ください。


## 例 {#examples}

クライアントリポジトリの[examples](https://github.com/ClickHouse/clickhouse-js/blob/main/examples)では、クライアント使用のさまざまなシナリオをカバーしています。

概要は[examples README](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/README.md#overview)で確認できます。

例や以下のドキュメントで不明な点や不足している点がある場合は、お気軽に[お問い合わせください](./js.md#contact-us)。

### クライアントAPI {#client-api}

特に明記されていない限り、ほとんどの例はNode.js版とWeb版の両方のクライアントと互換性があります。

#### クライアントインスタンスの作成 {#creating-a-client-instance}

`createClient`ファクトリを使用して、必要な数のクライアントインスタンスを作成できます:

```ts
import { createClient } from "@clickhouse/client" // or '@clickhouse/client-web'

const client = createClient({
  /* configuration */
})
```

環境がESMモジュールをサポートしていない場合は、代わりにCJS構文を使用できます:

```ts
const { createClient } = require("@clickhouse/client")

const client = createClient({
  /* configuration */
})
```

クライアントインスタンスは、インスタンス化時に[事前設定](./js.md#configuration)できます。

#### 設定 {#configuration}

クライアントインスタンスを作成する際、以下の接続設定を調整できます:

| 設定                                                                  | 説明                                                                         | デフォルト値           | 参照                                                                                   |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| **url**?: string                                                         | ClickHouseインスタンスのURL。                                                          | `http://localhost:8123` | [URL設定ドキュメント](./js.md#url-configuration)                                        |
| **pathname**?: string                                                    | クライアントによって解析された後、ClickHouse URLに追加するオプションのパス名。 | `''`                    | [パス名を使用したプロキシのドキュメント](./js.md#proxy-with-a-pathname)                                |
| **request_timeout**?: number                                             | リクエストタイムアウト(ミリ秒単位)。                                                | `30_000`                | -                                                                                          |
| **compression**?: `{ **response**?: boolean; **request**?: boolean }`    | 圧縮を有効にします。                                                                 | -                       | [圧縮ドキュメント](./js.md#compression)                                                    |
| **username**?: string                                                    | リクエストを実行するユーザーの名前。                             | `default`               | -                                                                                          |
| **password**?: string                                                    | ユーザーパスワード。                                                                  | `''`                    | -                                                                                          |
| **application**?: string                                                 | Node.jsクライアントを使用するアプリケーションの名前。                               | `clickhouse-js`         | -                                                                                          |
| **database**?: string                                                    | 使用するデータベース名。                                                           | `default`               | -                                                                                          |
| **clickhouse_settings**?: ClickHouseSettings                             | すべてのリクエストに適用するClickHouse設定。                                       | `{}`                    | -                                                                                          |
| **log**?: `{ **LoggerClass**?: Logger, **level**?: ClickHouseLogLevel }` | 内部クライアントログの設定。                                                 | -                       | [ログドキュメント](./js.md#logging-nodejs-only)                                                |
| **session_id**?: string                                                  | すべてのリクエストで送信するオプションのClickHouseセッションID。                          | -                       | -                                                                                          |
| **keep_alive**?: `{ **enabled**?: boolean }`                             | Node.js版とWeb版の両方でデフォルトで有効になっています。                                | -                       | -                                                                                          |
| **http_headers**?: `Record<string, string>`                              | 送信するClickHouseリクエストの追加HTTPヘッダー。                           | -                       | [認証付きリバースプロキシのドキュメント](./js.md#reverse-proxy-with-authentication)        |
| **roles**?: string \| string[]                                           | 送信するリクエストに付与するClickHouseロール名。                         | -                       | [HTTPインターフェースでのロールの使用](/interfaces/http#setting-role-with-query-parameters) |

#### Node.js固有の設定パラメータ {#nodejs-specific-configuration-parameters}


| 設定                                                                    | 説明                                                 | デフォルト値 | 関連項目                                                                                             |
| -------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------- |
| **max_open_connections**?: number                                          | ホストごとに許可する接続ソケットの最大数。    | `10`          | -                                                                                                    |
| **tls**?: `{ **ca_cert**: Buffer, **cert**?: Buffer, **key**?: Buffer }`   | TLS証明書を設定します。                                 | -             | [TLSドキュメント](./js.md#tls-certificates-nodejs-only)                                                     |
| **keep_alive**?: `{ **enabled**?: boolean, **idle_socket_ttl**?: number }` | -                                                           | -             | [Keep Aliveドキュメント](./js.md#keep-alive-configuration-nodejs-only)                                      |
| **http_agent**?: http.Agent \| https.Agent <br/><ExperimentalBadge/>       | クライアント用のカスタムHTTPエージェント。                           | -             | [HTTPエージェントドキュメント](./js.md#custom-httphttps-agent-experimental-nodejs-only)                           |
| **set_basic_auth_header**?: boolean <br/><ExperimentalBadge/>              | 基本認証の資格情報を使用して`Authorization`ヘッダーを設定します。 | `true`        | [HTTPエージェントドキュメントにおけるこの設定の使用方法](./js.md#custom-httphttps-agent-experimental-nodejs-only) |

### URL設定 {#url-configuration}

:::important
URL設定は_常に_ハードコードされた値を上書きし、この場合は警告がログに記録されます。
:::

クライアントインスタンスのパラメータのほとんどはURLで設定できます。URLの形式は`http[s]://[username:password@]hostname:port[/database][?param1=value1&param2=value2]`です。ほとんどの場合、特定のパラメータの名前は設定オプションインターフェースにおけるそのパスを反映していますが、いくつかの例外があります。以下のパラメータがサポートされています:

| パラメータ                                   | 型                                                              |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `pathname`                                  | 任意の文字列。                                              |
| `application_id`                            | 任意の文字列。                                              |
| `session_id`                                | 任意の文字列。                                              |
| `request_timeout`                           | 非負の数値。                                              |
| `max_open_connections`                      | ゼロより大きい非負の数値。                           |
| `compression_request`                       | 真偽値。下記(1)を参照                                            |
| `compression_response`                      | 真偽値。                                                          |
| `log_level`                                 | 許可される値: `OFF`、`TRACE`、`DEBUG`、`INFO`、`WARN`、`ERROR`。 |
| `keep_alive_enabled`                        | 真偽値。                                                          |
| `clickhouse_setting_*` または `ch_*`            | 下記(2)を参照                                                     |
| `http_header_*`                             | 下記(3)を参照                                                     |
| (Node.jsのみ) `keep_alive_idle_socket_ttl` | 非負の数値。                                              |

- (1) 真偽値の場合、有効な値は`true`/`1`および`false`/`0`です。
- (2) `clickhouse_setting_`または`ch_`で始まるパラメータは、このプレフィックスが削除され、残りの部分がクライアントの`clickhouse_settings`に追加されます。例えば、`?ch_async_insert=1&ch_wait_for_async_insert=1`は以下と同じです:

```ts
createClient({
  clickhouse_settings: {
    async_insert: 1,
    wait_for_async_insert: 1
  }
})
```

注意: `clickhouse_settings`の真偽値は、URLでは`1`/`0`として渡す必要があります。

- (3) (2)と同様ですが、`http_header`設定用です。例えば、`?http_header_x-clickhouse-auth=foobar`は以下と同等です:

```ts
createClient({
  http_headers: {
    "x-clickhouse-auth": "foobar"
  }
})
```

### 接続 {#connecting}

#### 接続情報の収集 {#gather-your-connection-details}

<ConnectionDetails />

#### 接続の概要 {#connection-overview}

クライアントはHTTP(s)プロトコル経由で接続を実装しています。RowBinaryのサポートは進行中です。[関連issue](https://github.com/ClickHouse/clickhouse-js/issues/216)を参照してください。

以下の例は、ClickHouse Cloudへの接続を設定する方法を示しています。`url`(プロトコルとポートを含む)と`password`の値が環境変数で指定され、`default`ユーザーが使用されることを前提としています。

**例:** 環境変数を使用してNode.jsクライアントインスタンスを作成する。

```ts
import { createClient } from "@clickhouse/client"

const client = createClient({
  url: process.env.CLICKHOUSE_HOST ?? "http://localhost:8123",
  username: process.env.CLICKHOUSE_USER ?? "default",
  password: process.env.CLICKHOUSE_PASSWORD ?? ""
})
```


クライアントリポジトリには、[ClickHouse Cloudでのテーブル作成](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)や[非同期挿入の使用](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert.ts)など、環境変数を使用する複数のサンプルが含まれています。

#### 接続プール(Node.jsのみ) {#connection-pool-nodejs-only}

リクエストごとに接続を確立するオーバーヘッドを回避するため、クライアントはKeep-Aliveメカニズムを利用して、ClickHouseへの接続プールを作成し再利用します。デフォルトでは、Keep-Aliveが有効になっており、接続プールのサイズは`10`に設定されていますが、`max_open_connections`[設定オプション](./js.md#configuration)で変更可能です。

ユーザーが`max_open_connections: 1`を設定しない限り、プール内の同じ接続が後続のクエリで使用される保証はありません。これはほとんど必要ありませんが、一時テーブルを使用する場合には必要になることがあります。

参照: [Keep-Alive設定](./js.md#keep-alive-configuration-nodejs-only)。

### クエリID {#query-id}

クエリまたはステートメントを送信するすべてのメソッド(`command`、`exec`、`insert`、`select`)は、結果に`query_id`を提供します。この一意の識別子はクライアントによってクエリごとに割り当てられ、[サーバー設定](/operations/server-configuration-parameters/settings)で有効になっている場合は`system.query_log`からデータを取得したり、長時間実行されるクエリをキャンセルしたりするのに役立ちます([サンプル](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/cancel_query.ts)を参照)。必要に応じて、`query_id`は`command`/`query`/`exec`/`insert`メソッドのパラメータで上書き可能です。

:::tip
`query_id`パラメータを上書きする場合は、呼び出しごとに一意性を確保する必要があります。ランダムなUUIDの使用を推奨します。
:::

### すべてのクライアントメソッドの基本パラメータ {#base-parameters-for-all-client-methods}

すべてのクライアントメソッド([query](./js.md#query-method)/[command](./js.md#command-method)/[insert](./js.md#insert-method)/[exec](./js.md#exec-method))に適用できるパラメータがいくつかあります。

```ts
interface BaseQueryParams {
  // クエリレベルで適用可能なClickHouse設定。
  clickhouse_settings?: ClickHouseSettings
  // クエリバインディング用のパラメータ。
  query_params?: Record<string, unknown>
  // 実行中のクエリをキャンセルするためのAbortSignalインスタンス。
  abort_signal?: AbortSignal
  // query_idの上書き。指定されていない場合は、ランダムな識別子が自動生成されます。
  query_id?: string
  // session_idの上書き。指定されていない場合は、クライアント設定からセッションIDが取得されます。
  session_id?: string
  // 認証情報の上書き。指定されていない場合は、クライアントの認証情報が使用されます。
  auth?: { username: string; password: string }
  // このクエリで使用する特定のロールのリスト。クライアント設定で設定されたロールを上書きします。
  role?: string | Array<string>
}
```

### queryメソッド {#query-method}

これは、`SELECT`のようなレスポンスを返す可能性のあるほとんどのステートメント、または`CREATE TABLE`のようなDDLの送信に使用され、awaitする必要があります。返される結果セットは、アプリケーション内で処理されることが想定されています。

:::note
データ挿入には専用の[insert](./js.md#insert-method)メソッドが、DDLには[command](./js.md#command-method)メソッドがあります。
:::

```ts
interface QueryParams extends BaseQueryParams {
  // 実行するクエリ。データを返す可能性があります。
  query: string
  // 結果データセットのフォーマット。デフォルト: JSON。
  format?: DataFormat
}

interface ClickHouseClient {
  query(params: QueryParams): Promise<ResultSet>
}
```

参照: [すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)。

:::tip
`query`内でFORMAT句を指定せず、代わりに`format`パラメータを使用してください。
:::

#### 結果セットと行の抽象化 {#result-set-and-row-abstractions}

`ResultSet`は、アプリケーションでのデータ処理のための便利なメソッドをいくつか提供します。

Node.jsの`ResultSet`実装は内部で`Stream.Readable`を使用し、Web版はWeb APIの`ReadableStream`を使用します。

`ResultSet`の`text`または`json`メソッドを呼び出すことで`ResultSet`を処理し、クエリによって返された行の全体セットをメモリにロードできます。


`ResultSet` はレスポンスストリームを開いたままにし、その結果として基盤となるコネクションをビジー状態のままにするため、できるだけ早く消費（読み取り）を開始する必要があります。アプリケーションによる過度なメモリ使用を避けるため、クライアントは受信データをバッファリングしません。

一度にメモリに収まりきらないほど大きい場合には、代わりに `stream` メソッドを呼び出し、ストリーミングモードでデータを処理できます。レスポンスの各チャンクは、比較的小さな行の配列に変換されます（この配列のサイズは、サーバーからクライアントが受信する個々のチャンクのサイズと、各行のサイズに依存し、変動します）。これを 1 チャンクずつ処理します。

ストリーミングに最適な形式を判断するために、[サポートされているデータ形式](./js.md#supported-data-formats) の一覧を参照してください。例えば、JSON オブジェクトをストリーミングしたい場合は [JSONEachRow](/interfaces/formats/JSONEachRow) を選択できます。この場合、各行は JS オブジェクトとしてパースされます。あるいは、よりコンパクトな [JSONCompactColumns](/interfaces/formats/JSONCompactColumns) フォーマットを選択すれば、各行は値のコンパクトな配列になります。併せて [ファイルのストリーミング](./js.md#streaming-files-nodejs-only) も参照してください。

:::important
`ResultSet` またはそのストリームが完全に消費されない場合、非アクティブな状態が `request_timeout` で指定された時間を超えると破棄されます。
:::

```ts
interface BaseResultSet<Stream> {
  // 上記の「クエリID」セクションを参照してください
  query_id: string

  // ストリーム全体を消費し、内容を文字列として取得します
  // 任意のDataFormatで使用できます
  // 一度だけ呼び出してください
  text(): Promise<string>

  // ストリーム全体を消費し、内容をJSオブジェクトとして解析します
  // JSON形式でのみ使用できます
  // 一度だけ呼び出してください
  json<T>(): Promise<T>

  // ストリーミング可能なレスポンスに対して読み取り可能なストリームを返します
  // ストリームの各反復処理で、選択されたDataFormat形式のRow[]配列が提供されます
  // 一度だけ呼び出してください
  stream(): Stream
}

interface Row {
  // 行の内容をプレーン文字列として取得します
  text: string

  // 行の内容をJSオブジェクトとして解析します
  json<T>(): T
}
```

**例:** (Node.js/Web) 結果データセットを `JSONEachRow` 形式で取得するクエリで、ストリーム全体を読み取り、その内容を JS オブジェクトとしてパースします。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)。

```ts
const resultSet = await client.query({
  query: 'SELECT * FROM my_table',
  format: 'JSONEachRow',
})
const dataset = await resultSet.json() // JSON解析を避ける場合は `row.text` を使用
```

**例:** (Node.js のみ) 従来の `on('data')` 手法を使用して、クエリ結果を `JSONEachRow` フォーマットでストリーミングします。これは `for await const` 構文と相互に置き換えて使用できます。[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row.ts)。

```ts
const rows = await client.query({
  query: 'SELECT number FROM system.numbers_mt LIMIT 5',
  format: 'JSONEachRow', // または JSONCompactEachRow、JSONStringsEachRow など
})
const stream = rows.stream()
stream.on('data', (rows: Row[]) => {
  rows.forEach((row: Row) => {
    console.log(row.json()) // JSON パースを回避するには `row.text` を使用
  })
})
await new Promise((resolve, reject) => {
  stream.on('end', () => {
    console.log('完了しました!')
    resolve(0)
  })
  stream.on('error', reject)
})
```

**例:** (`Node.js` のみ) クラシックな `on('data')` アプローチを使用して、`CSV` 形式でクエリ結果をストリーミングします。これは `for await const` 構文と置き換えて使用できます。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_text_line_by_line.ts)

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
    console.log('完了!')
    resolve(0)
  })
  stream.on('error', reject)
})
```


**例:** (Node.jsのみ) `for await const`構文を使用して`JSONEachRow`形式のJSオブジェクトとしてストリーミングクエリ結果を処理します。これは従来の`on('data')`アプローチと互換性があります。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_streaming_json_each_row_for_await.ts)。

```ts
const resultSet = await client.query({
  query: "SELECT number FROM system.numbers LIMIT 10",
  format: "JSONEachRow" // or JSONCompactEachRow, JSONStringsEachRow, etc.
})
for await (const rows of resultSet.stream()) {
  rows.forEach((row) => {
    console.log(row.json())
  })
}
```

:::note
`for await const`構文は`on('data')`アプローチよりもコード量が少なくなりますが、パフォーマンスに悪影響を及ぼす可能性があります。
詳細については、[Node.jsリポジトリのこのissue](https://github.com/nodejs/node/issues/31979)を参照してください。
:::

**例:** (Webのみ) オブジェクトの`ReadableStream`に対する反復処理。

```ts
const resultSet = await client.query({
  query: "SELECT * FROM system.numbers LIMIT 10",
  format: "JSONEachRow"
})

const reader = resultSet.stream().getReader()
while (true) {
  const { done, value: rows } = await reader.read()
  if (done) {
    break
  }
  rows.forEach((row) => {
    console.log(row.json())
  })
}
```

### Insertメソッド {#insert-method}

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

サーバーからデータが返されることを想定しておらず、レスポンスストリームを即座にドレインするため、戻り値の型は最小限です。

insertメソッドに空の配列が渡された場合、insert文はサーバーに送信されず、代わりにメソッドは即座に`{ query_id: '...', executed: false }`で解決されます。この場合、メソッドパラメータで`query_id`が指定されていない場合、結果は空文字列になります。これは、クライアントが生成したランダムなUUIDを返すと混乱を招く可能性があるためです。そのような`query_id`を持つクエリは`system.query_log`テーブルに存在しないからです。

insert文がサーバーに送信された場合、`executed`フラグは`true`になります。

#### Node.jsにおけるInsertメソッドとストリーミング {#insert-method-and-streaming-in-nodejs}

`insert`メソッドに指定された[データ形式](./js.md#supported-data-formats)に応じて、`Stream.Readable`または通常の`Array<T>`のいずれかで動作します。[ファイルストリーミング](./js.md#streaming-files-nodejs-only)に関するこのセクションも参照してください。

Insertメソッドはawaitされることを想定していますが、入力ストリームを指定し、ストリームが完了したときにのみ`insert`操作をawaitすることも可能です(これにより`insert`のpromiseも解決されます)。これはイベントリスナーや類似のシナリオで有用な可能性がありますが、クライアント側で多くのエッジケースがあり、エラー処理が複雑になる可能性があります。代わりに、[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/async_insert_without_waiting.ts)で示されているように、[非同期insert](/optimize/asynchronous-inserts)の使用を検討してください。

:::tip
このメソッドでモデル化することが難しいカスタムINSERT文がある場合は、[commandメソッド](./js.md#command-method)の使用を検討してください。

[INSERT INTO ... VALUES](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_values_and_functions.ts)または[INSERT INTO ... SELECT](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_from_select.ts)の例で使用方法を確認できます。
:::


```ts
interface InsertParams<T> extends BaseQueryParams {
  // データを挿入するテーブル名
  table: string
  // 挿入するデータセット
  values: ReadonlyArray<T> | Stream.Readable
  // 挿入するデータセットの形式
  format?: DataFormat
  // データを挿入する列を指定できます
  // - `['a', 'b']` のような配列は次のように生成されます: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - `{ except: ['a', 'b'] }` のようなオブジェクトは次のように生成されます: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // デフォルトでは、データはテーブルのすべての列に挿入され、
  // 生成されるステートメントは次のようになります: `INSERT INTO table FORMAT DataFormat`
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

参照: [すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)

:::important
`abort_signal` でキャンセルされたリクエストは、データ挿入が行われなかったことを保証しません。キャンセル前にサーバーがストリーミングデータの一部を受信している可能性があるためです。
:::

**例:** (Node.js/Web) 値の配列を挿入します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/array_json_each_row.ts)

```ts
await client.insert({
  table: "my_table",
  // 構造は目的の形式と一致する必要があります。この例ではJSONEachRow
  values: [
    { id: 42, name: "foo" },
    { id: 42, name: "bar" }
  ],
  format: "JSONEachRow"
})
```

**例:** (Node.jsのみ) CSVファイルからストリームを挿入します。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts) 参照: [ファイルストリーミング](./js.md#streaming-files-nodejs-only)

```ts
await client.insert({
  table: "my_table",
  values: fs.createReadStream("./path/to/a/file.csv"),
  format: "CSV"
})
```

**例**: 挿入ステートメントから特定の列を除外します。

次のようなテーブル定義があるとします:

```sql
CREATE OR REPLACE TABLE mytable
(id UInt32, message String)
ENGINE MergeTree()
ORDER BY (id)
```

特定の列のみを挿入します:

```ts
// 生成されるステートメント: INSERT INTO mytable (message) FORMAT JSONEachRow
await client.insert({
  table: "mytable",
  values: [{ message: "foo" }],
  format: "JSONEachRow",
  // この行の `id` 列の値はゼロになります(UInt32のデフォルト値)
  columns: ["message"]
})
```

特定の列を除外します:

```ts
// 生成されるステートメント: INSERT INTO mytable (* EXCEPT (message)) FORMAT JSONEachRow
await client.insert({
  table: tableName,
  values: [{ id: 144 }],
  format: "JSONEachRow",
  // この行の `message` 列の値は空文字列になります
  columns: {
    except: ["message"]
  }
})
```

詳細については[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_exclude_columns.ts)を参照してください。

**例**: クライアントインスタンスに指定されたものとは異なるデータベースに挿入します。[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_into_different_db.ts)

```ts
await client.insert({
  table: "mydb.mytable", // データベースを含む完全修飾名
  values: [{ id: 42, message: "foo" }],
  format: "JSONEachRow"
})
```

#### Web版の制限事項 {#web-version-limitations}

現在、`@clickhouse/client-web` での挿入は `Array<T>` と `JSON*` 形式でのみ動作します。
ブラウザの互換性が不十分なため、Web版ではストリームの挿入はまだサポートされていません。

そのため、Web版の `InsertParams` インターフェースはNode.js版とわずかに異なり、
`values` は `ReadonlyArray<T>` 型のみに制限されています:


```ts
interface InsertParams<T> extends BaseQueryParams {
  // データを挿入するテーブル名
  table: string
  // 挿入するデータセット
  values: ReadonlyArray<T>
  // 挿入するデータセットの形式
  format?: DataFormat
  // データを挿入する列を指定できます
  // - `['a', 'b']` のような配列は次のように生成されます: `INSERT INTO table (a, b) FORMAT DataFormat`
  // - `{ except: ['a', 'b'] }` のようなオブジェクトは次のように生成されます: `INSERT INTO table (* EXCEPT (a, b)) FORMAT DataFormat`
  // デフォルトでは、データはテーブルのすべての列に挿入され、
  // 生成されるステートメントは次のようになります: `INSERT INTO table FORMAT DataFormat`
  columns?: NonEmptyArray<string> | { except: NonEmptyArray<string> }
}
```

これは将来変更される可能性があります。参照: [すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)

### Commandメソッド {#command-method}

出力を持たないステートメント、format句が適用できない場合、またはレスポンスに関心がない場合に使用できます。このようなステートメントの例として、`CREATE TABLE`や`ALTER TABLE`があります。

awaitする必要があります。

レスポンスストリームは即座に破棄されます。これは、基盤となるソケットが解放されることを意味します。

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

参照: [すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)

**例:** (Node.js/Web) ClickHouse Cloudでテーブルを作成する
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_cloud.ts)

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_cloud_table
    (id UInt64, name String)
    ORDER BY (id)
  `,
  // レスポンスコードの後にクエリ処理エラーが発生し、
  // HTTPヘッダーが既にクライアントに送信されている状況を回避するため、クラスタ使用時に推奨されます
  // 参照 https://clickhouse.com/docs/interfaces/http/#response-buffering
  clickhouse_settings: {
    wait_end_of_query: 1
  }
})
```

**例:** (Node.js/Web) セルフホスト型ClickHouseインスタンスでテーブルを作成する
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/create_table_single_node.ts)

```ts
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS my_table
    (id UInt64, name String)
    ENGINE MergeTree()
    ORDER BY (id)
  `
})
```

**Example:** (Node.js/Web) INSERT FROM SELECT

```ts
await client.command({
  query: `INSERT INTO my_table SELECT '42'`
})
```

:::important
`abort_signal`でキャンセルされたリクエストは、ステートメントがサーバーで実行されなかったことを保証しません。
:::

### Execメソッド {#exec-method}

`query`/`insert`に適合しないカスタムクエリがあり、結果に関心がある場合は、`command`の代替として`exec`を使用できます。

`exec`は読み取り可能なストリームを返します。このストリームはアプリケーション側で消費または破棄する必要があります。

```ts
interface ExecParams extends BaseQueryParams {
  // 実行するステートメント
  query: string
}

interface ClickHouseClient {
  exec(params: ExecParams): Promise<QueryResult>
}
```

参照: [すべてのクライアントメソッドの基本パラメータ](./js.md#base-parameters-for-all-client-methods)

ストリームの戻り値の型は、Node.jsとWeb版で異なります。

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

接続状態を確認するために提供される`ping`メソッドは、サーバーに到達できる場合に`true`を返します。

サーバーに到達できない場合、基盤となるエラーも結果に含まれます。

```ts
type PingResult = { success: true } | { success: false; error: Error }
```


/\*\* 組み込みの `/ping` エンドポイントを使用する、ヘルスチェック用リクエストのパラメーター。

- これは Node.js 版におけるデフォルトの動作です。_/
  export type PingParamsWithEndpoint = {
  select: false
  /\*\* 進行中のリクエストをキャンセルするための AbortSignal インスタンス。_/
  abort_signal?: AbortSignal
  /** このリクエストにだけ付与する追加の HTTP ヘッダー。 \*/
  http_headers?: Record<string, string>
  }
  /** SELECT クエリを使用する、ヘルスチェック用リクエストのパラメーター。
- `/ping` エンドポイントは CORS をサポートしていないため、これは Web 版におけるデフォルトの動作です。
- `query_id`、`abort_signal`、`http_headers` など、標準的な `query` メソッドのパラメーターのほとんどが利用できます。
- ただし `query_params` は、このメソッドで許可する意味がないため例外です。 \*/
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

アプリケーション起動時にサーバーが利用可能かどうかを確認するために、ping は有用な手段となり得ます。特に ClickHouse Cloud では、インスタンスがアイドル状態になっており、ping を受けてから起動する場合があります。そのようなケースでは、一定の待ち時間を挟みながら数回リトライすることを検討してください。

デフォルトでは、Node.js 版は `/ping` エンドポイントを使用し、Web 版は同様の結果を得るために単純な `SELECT 1` クエリを使用します。これは、`/ping` エンドポイントが CORS をサポートしていないためです。

**例:** (Node.js/Web) ClickHouse サーバーインスタンスへの単純な ping。補足: Web 版では捕捉されるエラーの内容が異なります。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/ping.ts).

```ts
const result = await client.ping();
if (!result.success) {
  // result.error を処理する
}
````

**例:** `ping` メソッド呼び出し時に認証情報も検証したい場合や、`query_id` などの追加パラメーターを指定したい場合は、次のように利用できます。

```ts
const result = await client.ping({
  select: true /* query_id, abort_signal, http_headers, or any other query params */
})
```

ping メソッドでは、標準的な `query` メソッドのパラメーターのほとんどが利用できます。詳細は `PingParamsWithSelectQuery` の型定義を参照してください。

### クローズ (Node.js のみ) {#close-nodejs-only}

開いているすべての接続をクローズし、リソースを解放します。Web 版では何も行いません (no-op)。

```ts
await client.close()
```


## ファイルのストリーミング（Node.jsのみ） {#streaming-files-nodejs-only}

クライアントリポジトリには、主要なデータ形式（NDJSON、CSV、Parquet）を使用したファイルストリーミングの例がいくつか用意されています。

- [NDJSONファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_ndjson.ts)
- [CSVファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_csv.ts)
- [Parquetファイルからのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/insert_file_stream_parquet.ts)
- [Parquetファイルへのストリーミング](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)

他の形式をファイルにストリーミングする場合も、Parquetと同様の方法で実行できます。
唯一の違いは、`query`呼び出しで使用する形式（`JSONEachRow`、`CSV`など）と出力ファイル名のみです。


## サポートされているデータ形式 {#supported-data-formats}

クライアントはJSONまたはテキストのデータ形式を処理します。

`format`をJSON形式ファミリー(`JSONEachRow`、`JSONCompactEachRow`など)のいずれかに指定すると、クライアントは通信中にデータのシリアライズとデシリアライズを実行します。

「raw」テキスト形式(`CSV`、`TabSeparated`、`CustomSeparated`ファミリー)で提供されるデータは、追加の変換なしで送信されます。

:::tip
一般的な形式としてのJSONと[ClickHouse JSON形式](/interfaces/formats/JSON)との間で混同が生じる可能性があります。

クライアントは[JSONEachRow](/interfaces/formats/JSONEachRow)などの形式でストリーミングJSONオブジェクトをサポートしています(他のストリーミング対応形式については表の概要を参照してください。また、`select_streaming_`の[クライアントリポジトリの例](https://github.com/ClickHouse/clickhouse-js/tree/main/examples/node)も参照してください)。

ただし、[ClickHouse JSON](/interfaces/formats/JSON)などの形式は、レスポンス内で単一のオブジェクトとして表現されるため、クライアントによるストリーミングができません。
:::

| 形式                                     | 入力(配列) | 入力(オブジェクト) | 入力/出力(ストリーム) | 出力(JSON) | 出力(テキスト)   |
| ------------------------------------------ | ------------- | -------------- | --------------------- | ------------- | --------------- |
| JSON                                       | ❌            | ✔️             | ❌                    | ✔️            | ✔️              |
| JSONCompact                                | ❌            | ✔️             | ❌                    | ✔️            | ✔️              |
| JSONObjectEachRow                          | ❌            | ✔️             | ❌                    | ✔️            | ✔️              |
| JSONColumnsWithMetadata                    | ❌            | ✔️             | ❌                    | ✔️            | ✔️              |
| JSONStrings                                | ❌            | ❌️            | ❌                    | ✔️            | ✔️              |
| JSONCompactStrings                         | ❌            | ❌             | ❌                    | ✔️            | ✔️              |
| JSONEachRow                                | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONEachRowWithProgress                    | ❌️           | ❌             | ✔️ ❗- 以下を参照      | ✔️            | ✔️              |
| JSONStringsEachRow                         | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactEachRow                         | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactStringsEachRow                  | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactEachRowWithNames                | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactEachRowWithNamesAndTypes        | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactStringsEachRowWithNames         | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| JSONCompactStringsEachRowWithNamesAndTypes | ✔️            | ❌             | ✔️                    | ✔️            | ✔️              |
| CSV                                        | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| CSVWithNames                               | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| CSVWithNamesAndTypes                       | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| TabSeparated                               | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| TabSeparatedRaw                            | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| TabSeparatedWithNames                      | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| TabSeparatedWithNamesAndTypes              | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| CustomSeparated                            | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| CustomSeparatedWithNames                   | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| CustomSeparatedWithNamesAndTypes           | ❌            | ❌             | ✔️                    | ❌            | ✔️              |
| Parquet                                    | ❌            | ❌             | ✔️                    | ❌            | ✔️❗- 以下を参照 |


Parquet の場合、`SELECT` の主なユースケースは、結果ストリームをファイルに書き出すことです。クライアントリポジトリ内の[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_parquet_as_file.ts)を参照してください。

`JSONEachRowWithProgress` は、ストリーム内で進捗報告をサポートする出力専用フォーマットです。詳細については[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/select_json_each_row_with_progress.ts)を参照してください。

ClickHouse の入力・出力フォーマットの完全な一覧は
[こちら](/interfaces/formats)
で確認できます。



## サポートされているClickHouseデータ型 {#supported-clickhouse-data-types}

:::note
関連するJS型は、すべてを文字列として表現する形式(例: `JSONStringEachRow`)を除く、すべての`JSON*`形式に適用されます
:::

| 型                     | ステータス        | JS型                       |
| ---------------------- | ---------------- | -------------------------- |
| UInt8/16/32            | ✔️               | number                     |
| UInt64/128/256         | ✔️ ❗- 以下参照 | string                     |
| Int8/16/32             | ✔️               | number                     |
| Int64/128/256          | ✔️ ❗- 以下参照 | string                     |
| Float32/64             | ✔️               | number                     |
| Decimal                | ✔️ ❗- 以下参照 | number                     |
| Boolean                | ✔️               | boolean                    |
| String                 | ✔️               | string                     |
| FixedString            | ✔️               | string                     |
| UUID                   | ✔️               | string                     |
| Date32/64              | ✔️               | string                     |
| DateTime32/64          | ✔️ ❗- 以下参照 | string                     |
| Enum                   | ✔️               | string                     |
| LowCardinality         | ✔️               | string                     |
| Array(T)               | ✔️               | T[]                        |
| (new) JSON             | ✔️               | object                     |
| Variant(T1, T2...)     | ✔️               | T (バリアントに依存) |
| Dynamic                | ✔️               | T (バリアントに依存) |
| Nested                 | ✔️               | T[]                        |
| Tuple(T1, T2, ...)     | ✔️               | [T1, T2, ...]              |
| Tuple(n1 T1, n2 T2...) | ✔️               | \{ n1: T1; n2: T2; ...}    |
| Nullable(T)            | ✔️               | Tに対応するJS型またはnull      |
| IPv4                   | ✔️               | string                     |
| IPv6                   | ✔️               | string                     |
| Point                  | ✔️               | [ number, number ]         |
| Ring                   | ✔️               | Array&lt;Point\>           |
| Polygon                | ✔️               | Array&lt;Ring\>            |
| MultiPolygon           | ✔️               | Array&lt;Polygon\>         |
| Map(K, V)              | ✔️               | Record&lt;K, V\>           |
| Time/Time64            | ✔️               | string                     |

サポートされているClickHouse形式の完全なリストは
[こちら](/sql-reference/data-types/)で確認できます。

関連項目:

- [Dynamic/Variant/JSONの使用例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/dynamic_variant_json.ts)
- [Time/Time64の使用例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/time_time64.ts)

### Date/Date32型の注意事項 {#datedate32-types-caveats}

クライアントは追加の型変換を行わずに値を挿入するため、`Date`/`Date32`型のカラムは文字列としてのみ挿入できます。

**例:** `Date`型の値を挿入する。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/ba387d7f4ce375a60982ac2d99cb47391cf76cec/__tests__/integration/date_time.test.ts)

```ts
await client.insert({
  table: "my_table",
  values: [{ date: "2022-09-05" }],
  format: "JSONEachRow"
})
```

ただし、`DateTime`または`DateTime64`カラムを使用している場合は、文字列とJS Dateオブジェクトの両方を使用できます。JS Dateオブジェクトは、`date_time_input_format`を`best_effort`に設定することで、そのまま`insert`に渡すことができます。詳細については、この[例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_js_dates.ts)を参照してください。

### Decimal*型の注意事項 {#decimal-types-caveats}

`JSON*`ファミリー形式を使用してDecimalを挿入することが可能です。次のように定義されたテーブルがあると仮定します:

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

文字列表現を使用することで、精度を失うことなく値を挿入できます:


```ts
await client.insert({
  table: "my_table",
  values: [
    {
      id: 1,
      dec32: "1234567.89",
      dec64: "123456789123456.789",
      dec128: "1234567891234567891234567891.1234567891",
      dec256:
        "12345678912345678912345678911234567891234567891234567891.12345678911234567891"
    }
  ],
  format: "JSONEachRow"
})
```

ただし、`JSON*`形式でデータをクエリする場合、ClickHouseはデフォルトでDecimal型を_数値_として返すため、精度が失われる可能性があります。これを回避するには、クエリ内でDecimal型を文字列にキャストします:

```ts
await client.query({
  query: `
    SELECT toString(dec32)  AS decimal32,
           toString(dec64)  AS decimal64,
           toString(dec128) AS decimal128,
           toString(dec256) AS decimal256
    FROM my_table
  `,
  format: "JSONEachRow"
})
```

詳細については、[この例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/insert_decimals.ts)を参照してください。

### 整数型: Int64、Int128、Int256、UInt64、UInt128、UInt256 {#integral-types-int64-int128-int256-uint64-uint128-uint256}

サーバーは数値として受け入れることができますが、これらの型の最大値が`Number.MAX_SAFE_INTEGER`より大きいため、整数オーバーフローを回避するために`JSON*`系の出力形式では文字列として返されます。

ただし、この動作は[`output_format_json_quote_64bit_integers`設定](/operations/settings/formats#output_format_json_quote_64bit_integers)で変更できます。

**例:** 64ビット数値のJSON出力形式を調整します。

```ts
const resultSet = await client.query({
  query: "SELECT * from system.numbers LIMIT 1",
  format: "JSONEachRow"
})

expect(await resultSet.json()).toEqual([{ number: "0" }])
```

```ts
const resultSet = await client.query({
  query: "SELECT * from system.numbers LIMIT 1",
  format: "JSONEachRow",
  clickhouse_settings: { output_format_json_quote_64bit_integers: 0 }
})

expect(await resultSet.json()).toEqual([{ number: 0 }])
```


## ClickHouse設定 {#clickhouse-settings}

クライアントは[設定](/operations/settings/settings/)メカニズムを通じてClickHouseの動作を調整できます。

設定はクライアントインスタンスレベルで設定でき、ClickHouseに送信されるすべてのリクエストに適用されます:

```ts
const client = createClient({
  clickhouse_settings: {}
})
```

または、リクエストレベルで設定を構成することもできます:

```ts
client.query({
  clickhouse_settings: {}
})
```

サポートされているすべてのClickHouse設定を含む型宣言ファイルは[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/settings.ts)で確認できます。

:::important
クエリを実行するユーザーが設定を変更するための十分な権限を持っていることを確認してください。
:::


## 高度なトピック {#advanced-topics}

### パラメータ付きクエリ {#queries-with-parameters}

パラメータ付きのクエリを作成し、クライアントアプリケーションから値を渡すことができます。これにより、クライアント側で特定の動的な値を使用してクエリをフォーマットする必要がなくなります。

通常通りクエリをフォーマットし、アプリケーションパラメータからクエリに渡したい値を次の形式で中括弧内に配置します:

```text
{<name>: <data_type>}
```

ここで:

- `name` — プレースホルダー識別子。
- `data_type` - アプリケーションパラメータ値の[データ型](/sql-reference/data-types/)。

**例:** パラメータ付きクエリ。
[ソースコード](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/query_with_parameter_binding.ts)。

```ts
await client.query({
  query: "SELECT plus({val1: Int32}, {val2: Int32})",
  format: "CSV",
  query_params: {
    val1: 10,
    val2: 20
  }
})
```

詳細については https://clickhouse.com/docs/interfaces/cli#cli-queries-with-parameters-syntax を参照してください。

### 圧縮 {#compression}

注意: リクエスト圧縮は現在Web版では利用できません。レスポンス圧縮は通常通り動作します。Node.js版は両方をサポートしています。

ネットワーク経由で大規模なデータセットを扱うデータアプリケーションは、圧縮を有効にすることで恩恵を受けることができます。現在、[zlib](https://nodejs.org/docs/latest-v14.x/api/zlib.html)を使用した`GZIP`のみがサポートされています。

```typescript
createClient({
  compression: {
    response: true,
    request: true
  }
})
```

設定パラメータは以下の通りです:

- `response: true` はClickHouseサーバーに圧縮されたレスポンスボディで応答するよう指示します。デフォルト値: `response: false`
- `request: true` はクライアントリクエストボディの圧縮を有効にします。デフォルト値: `request: false`

### ロギング (Node.jsのみ) {#logging-nodejs-only}

:::important
ロギングは実験的な機能であり、将来変更される可能性があります。
:::

デフォルトのロガー実装は、`console.debug/info/warn/error`メソッドを介してログレコードを`stdout`に出力します。
`LoggerClass`を提供することでロギングロジックをカスタマイズでき、`level`パラメータで希望するログレベルを選択できます(デフォルトは`OFF`):

```typescript
import type { Logger } from "@clickhouse/client"

// 3つのLogParams型はすべてクライアントからエクスポートされます
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

現在、クライアントは以下のイベントをログに記録します:

- `TRACE` - Keep-Aliveソケットのライフサイクルに関する低レベル情報
- `DEBUG` - レスポンス情報(認証ヘッダーとホスト情報を除く)
- `INFO` - ほとんど使用されず、クライアント初期化時に現在のログレベルを出力します
- `WARN` - 致命的でないエラー。失敗した`ping`リクエストは警告としてログに記録されます。基礎となるエラーは返される結果に含まれます
- `ERROR` - `query`/`insert`/`exec`/`command`メソッドからの致命的なエラー(リクエストの失敗など)

デフォルトのLogger実装は[こちら](https://github.com/ClickHouse/clickhouse-js/blob/main/packages/client-common/src/logger.ts)で確認できます。

### TLS証明書 (Node.jsのみ) {#tls-certificates-nodejs-only}

Node.jsクライアントは、基本的なTLS(認証局のみ)と相互TLS(認証局とクライアント証明書)の両方をオプションでサポートしています。

基本的なTLS設定の例です。証明書が`certs`フォルダにあり、CAファイル名が`CA.pem`であると仮定します:

```ts
const client = createClient({
  url: "https://<hostname>:<port>",
  username: "<username>",
  password: "<password>", // 必要な場合
  tls: {
    ca_cert: fs.readFileSync("certs/CA.pem")
  }
})
```

クライアント証明書を使用した相互TLS設定の例:


```ts
const client = createClient({
  url: "https://<hostname>:<port>",
  username: "<username>",
  tls: {
    ca_cert: fs.readFileSync("certs/CA.pem"),
    cert: fs.readFileSync(`certs/client.crt`),
    key: fs.readFileSync(`certs/client.key`)
  }
})
```

リポジトリ内の[基本的な](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/basic_tls.ts)TLSと[相互](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/node/mutual_tls.ts)TLSの完全な例を参照してください。

### Keep-alive設定(Node.jsのみ) {#keep-alive-configuration-nodejs-only}

クライアントはデフォルトで基盤となるHTTPエージェントでKeep-Aliveを有効にします。これにより、接続されたソケットが後続のリクエストで再利用され、`Connection: keep-alive`ヘッダーが送信されます。アイドル状態のソケットは、デフォルトで2500ミリ秒間接続プールに保持されます([このオプションの調整に関する注意事項](./js.md#adjusting-idle_socket_ttl)を参照してください)。

`keep_alive.idle_socket_ttl`の値は、サーバー/ロードバランサーの設定よりも十分に低く設定する必要があります。主な理由は、HTTP/1.1ではサーバーがクライアントに通知せずにソケットを閉じることが許可されているため、サーバーまたはロードバランサーがクライアントよりも_先に_接続を閉じた場合、クライアントが閉じられたソケットを再利用しようとして`socket hang up`エラーが発生する可能性があるためです。

`keep_alive.idle_socket_ttl`を変更する場合は、常にサーバー/ロードバランサーのKeep-Alive設定と同期させ、**常にそれより低く**設定して、サーバーが開いている接続を先に閉じないようにする必要があることに留意してください。

#### `idle_socket_ttl`の調整 {#adjusting-idle_socket_ttl}

クライアントは`keep_alive.idle_socket_ttl`を2500ミリ秒に設定しています。これは最も安全なデフォルト値と考えられるためです。サーバー側では、`config.xml`を変更しない場合、[ClickHouseバージョン23.11以前では`keep_alive_timeout`が最短で3秒に設定されている](https://github.com/ClickHouse/ClickHouse/commit/1685cdcb89fe110b45497c7ff27ce73cc03e82d1)可能性があります。

:::warning
パフォーマンスに満足しており、問題が発生していない場合は、`keep_alive.idle_socket_ttl`設定の値を増やさ**ない**ことを推奨します。増やすと「Socket hang-up」エラーが発生する可能性があります。また、アプリケーションが多数のクエリを送信し、クエリ間のダウンタイムがあまりない場合は、ソケットが長時間アイドル状態にならず、クライアントがそれらをプールに保持するため、デフォルト値で十分です。
:::

次のコマンドを実行することで、サーバーレスポンスヘッダーから正しいKeep-Aliveタイムアウト値を確認できます:

```sh
curl -v --data-binary "SELECT 1" <clickhouse_url>
```

レスポンス内の`Connection`および`Keep-Alive`ヘッダーの値を確認してください。例:

```text
< Connection: Keep-Alive
< Keep-Alive: timeout=10
```

この場合、`keep_alive_timeout`は10秒であり、`keep_alive.idle_socket_ttl`を9000ミリ秒または9500ミリ秒に増やして、アイドル状態のソケットをデフォルトよりも少し長く開いたままにすることができます。「Socket hang-up」エラーが発生しないか注意してください。このエラーは、サーバーがクライアントよりも先に接続を閉じていることを示しており、エラーが消えるまで値を下げる必要があります。

#### トラブルシューティング {#troubleshooting}

最新バージョンのクライアントを使用していても`socket hang up`エラーが発生する場合は、次の方法でこの問題を解決できます:

- 少なくとも`WARN`ログレベルでログを有効にします。これにより、アプリケーションコードに未消費または未処理のストリームがあるかどうかを確認できます。トランスポート層はWARNレベルでこれをログに記録します。これはサーバーによってソケットが閉じられる可能性があるためです。クライアント設定でログを有効にするには、次のようにします:

  ```ts
  const client = createClient({
    log: { level: ClickHouseLogLevel.WARN }
  })
  ```

- [no-floating-promises](https://typescript-eslint.io/rules/no-floating-promises/) ESLintルールを有効にしてアプリケーションコードを確認します。これにより、未処理のストリームやソケットにつながる可能性のある未処理のプロミスを特定できます。


- ClickHouseサーバー設定の`keep_alive.idle_socket_ttl`設定を若干減らします。クライアントとサーバー間のネットワーク遅延が大きい場合など、特定の状況では、`keep_alive.idle_socket_ttl`をさらに200～500ミリ秒減らすことで、送信リクエストがサーバーが閉じようとしているソケットを取得してしまう状況を回避できる可能性があります。

- データの入出力がない長時間実行クエリ中にこのエラーが発生する場合（例：長時間実行される`INSERT FROM SELECT`）、ロードバランサーがアイドル接続を閉じることが原因である可能性があります。以下のClickHouse設定の組み合わせを使用して、長時間実行クエリ中に何らかのデータを強制的に送信することで対処できます：

  ```ts
  const client = createClient({
    // ここでは、5分以上の実行時間を持つクエリがあることを想定しています
    request_timeout: 400_000,
    /** これらの設定を組み合わせることで、`INSERT FROM SELECT`などのデータの入出力がない長時間実行クエリの場合に、
     *  LBタイムアウトの問題を回避できます。接続がLBによってアイドル状態とマークされ、突然閉じられる可能性があるためです。
     *  この場合、LBのアイドル接続タイムアウトが120秒であると想定し、110秒を「安全な」値として設定します。 */
    clickhouse_settings: {
      send_progress_in_http_headers: 1,
      http_headers_progress_interval_ms: "110000" // UInt64、文字列として渡す必要があります
    }
  })
  ```

  ただし、最近のNode.jsバージョンでは、受信ヘッダーの合計サイズに16KBの制限があることに注意してください。一定量のプログレスヘッダーを受信した後（テストでは約70～80個）、例外が生成されます。

  また、まったく異なるアプローチを使用して、ネットワーク上の待機時間を完全に回避することも可能です。これは、接続が失われてもミューテーションがキャンセルされないというHTTPインターフェースの「機能」を活用することで実現できます。詳細については、[この例（パート2）](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/long_running_queries_timeouts.ts)を参照してください。

- Keep-Alive機能を完全に無効にすることができます。この場合、クライアントはすべてのリクエストに`Connection: close`ヘッダーも追加し、基盤となるHTTPエージェントは接続を再利用しません。アイドル状態のソケットが存在しないため、`keep_alive.idle_socket_ttl`設定は無視されます。これにより、リクエストごとに新しい接続が確立されるため、追加のオーバーヘッドが発生します。

  ```ts
  const client = createClient({
    keep_alive: {
      enabled: false
    }
  })
  ```

### 読み取り専用ユーザー {#read-only-users}

[readonly=1ユーザー](/operations/settings/permissions-for-queries#readonly)でクライアントを使用する場合、レスポンス圧縮は有効にできません。これは`enable_http_compression`設定が必要なためです。以下の設定はエラーになります：

```ts
const client = createClient({
  compression: {
    response: true // readonly=1ユーザーでは動作しません
  }
})
```

readonly=1ユーザーの制限についてより詳しく説明している[例](https://github.com/ClickHouse/clickhouse-js/blob/main/examples/read_only_user.ts)を参照してください。

### パス名を持つプロキシ {#proxy-with-a-pathname}

ClickHouseインスタンスがプロキシの背後にあり、URLにパス名が含まれている場合（例：http://proxy:8123/clickhouse_server）、`clickhouse_server`を`pathname`設定オプションとして指定します（先頭のスラッシュの有無は問いません）。そうしないと、`url`に直接指定した場合、`database`オプションとして扱われます。複数のセグメントがサポートされています（例：`/my_proxy/db`）。

```ts
const client = createClient({
  url: "http://proxy:8123",
  pathname: "/clickhouse_server"
})
```

### 認証付きリバースプロキシ {#reverse-proxy-with-authentication}

ClickHouseデプロイメントの前に認証付きリバースプロキシがある場合、`http_headers`設定を使用して必要なヘッダーを提供できます：

```ts
const client = createClient({
  http_headers: {
    "My-Auth-Header": "..."
  }
})
```

### カスタムHTTP/HTTPSエージェント（実験的機能、Node.jsのみ） {#custom-httphttps-agent-experimental-nodejs-only}

:::warning
これは実験的機能であり、将来のリリースで後方互換性のない方法で変更される可能性があります。クライアントが提供するデフォルトの実装と設定は、ほとんどのユースケースで十分なはずです。この機能は、本当に必要であると確信している場合にのみ使用してください。
:::


デフォルトでは、クライアントはクライアント設定で指定された設定（`max_open_connections`、`keep_alive.enabled`、`tls`など）を使用して基盤となるHTTP(s)エージェントを構成し、ClickHouseサーバーへの接続を処理します。また、TLS証明書が使用される場合、基盤となるエージェントは必要な証明書で構成され、適切なTLS認証ヘッダーが適用されます。

1.2.0以降、クライアントにカスタムHTTP(s)エージェントを指定し、デフォルトの基盤エージェントを置き換えることが可能になりました。これは複雑なネットワーク構成の場合に有用です。カスタムエージェントを指定する場合、以下の条件が適用されます：

- `max_open_connections`および`tls`オプションは_効果がなく_、基盤となるエージェント設定の一部であるため、クライアントによって無視されます。
- `keep_alive.enabled`は`Connection`ヘッダーのデフォルト値のみを制御します（`true` -> `Connection: keep-alive`、`false` -> `Connection: close`）。
- アイドル状態のキープアライブソケット管理は引き続き機能しますが（エージェントではなく特定のソケット自体に紐付いているため）、`keep_alive.idle_socket_ttl`の値を`0`に設定することで完全に無効化することが可能になりました。

#### カスタムエージェントの使用例 {#custom-agent-usage-examples}

証明書なしでカスタムHTTP(s)エージェントを使用する：

```ts
const agent = new http.Agent({
  // またはhttps.Agent
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10
})
const client = createClient({
  http_agent: agent
})
```

基本的なTLSとCA証明書を使用してカスタムHTTPSエージェントを使用する：

```ts
const agent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10,
  ca: fs.readFileSync("./ca.crt")
})
const client = createClient({
  url: "https://myserver:8443",
  http_agent: agent,
  // カスタムHTTPSエージェントを使用する場合、クライアントはデフォルトのHTTPS接続実装を使用しないため、ヘッダーは手動で指定する必要があります
  http_headers: {
    "X-ClickHouse-User": "username",
    "X-ClickHouse-Key": "password"
  },
  // 重要：authorizationヘッダーはTLSヘッダーと競合するため、無効化してください。
  set_basic_auth_header: false
})
```

相互TLSを使用してカスタムHTTPSエージェントを使用する：

```ts
const agent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 2500,
  maxSockets: 10,
  maxFreeSockets: 10,
  ca: fs.readFileSync("./ca.crt"),
  cert: fs.readFileSync("./client.crt"),
  key: fs.readFileSync("./client.key")
})
const client = createClient({
  url: "https://myserver:8443",
  http_agent: agent,
  // カスタムHTTPSエージェントを使用する場合、クライアントはデフォルトのHTTPS接続実装を使用しないため、ヘッダーは手動で指定する必要があります
  http_headers: {
    "X-ClickHouse-User": "username",
    "X-ClickHouse-Key": "password",
    "X-ClickHouse-SSL-Certificate-Auth": "on"
  },
  // 重要：authorizationヘッダーはTLSヘッダーと競合するため、無効化してください。
  set_basic_auth_header: false
})
```

証明書_および_カスタム_HTTPS_エージェントを使用する場合、TLSヘッダーと競合するため、`set_basic_auth_header`設定（1.2.0で導入）を使用してデフォルトのauthorizationヘッダーを無効化する必要がある可能性が高いです。すべてのTLSヘッダーは手動で指定する必要があります。


## 既知の制限事項（Node.js/web） {#known-limitations-nodejsweb}

- 結果セットに対するデータマッパーが存在しないため、言語プリミティブのみが使用されます。特定のデータ型マッパーは[RowBinaryフォーマットのサポート](https://github.com/ClickHouse/clickhouse-js/issues/216)で計画されています。
- [Decimal\*およびDate\* / DateTime\*データ型に関する注意事項](./js.md#datedate32-types-caveats)が存在します。
- JSON\*ファミリーのフォーマットを使用する場合、Int32より大きい数値は文字列として表現されます。これは、Int64以上の型の最大値が`Number.MAX_SAFE_INTEGER`より大きいためです。詳細については、[整数型](./js.md#integral-types-int64-int128-int256-uint64-uint128-uint256)のセクションを参照してください。


## 既知の制限事項（Web） {#known-limitations-web}

- SELECT クエリのストリーミングは機能しますが、INSERT では無効化されています（型レベルでも同様）。
- リクエスト圧縮は無効化されており、設定は無視されます。レスポンス圧縮は機能します。
- ログ記録は未対応です。


## パフォーマンス最適化のヒント {#tips-for-performance-optimizations}

- アプリケーションのメモリ消費量を削減するには、大規模な挿入(ファイルからの挿入など)や該当する場合のSELECT操作にストリームの使用を検討してください。イベントリスナーや類似のユースケースでは、[非同期挿入](/optimize/asynchronous-inserts)も良い選択肢となり、クライアント側でのバッチ処理を最小化、または完全に回避することができます。非同期挿入の例は[クライアントリポジトリ](https://github.com/ClickHouse/clickhouse-js/tree/main/examples)で、ファイル名のプレフィックスが`async_insert_`のものとして利用可能です。
- クライアントはデフォルトでリクエストまたはレスポンスの圧縮を有効にしません。ただし、大規模なデータセットをSELECTまたはINSERTする場合は、`ClickHouseClientConfigOptions.compression`を介して有効にすることを検討できます(`request`のみ、`response`のみ、または両方)。
- 圧縮には大きなパフォーマンスペナルティがあります。`request`または`response`に対して圧縮を有効にすると、それぞれSELECT操作またはINSERT操作の速度に悪影響を及ぼしますが、アプリケーションが転送するネットワークトラフィック量を削減します。


## お問い合わせ {#contact-us}

ご質問やサポートが必要な場合は、[Community Slack](https://clickhouse.com/slack)（`#clickhouse-js`チャンネル）または[GitHub issues](https://github.com/ClickHouse/clickhouse-js/issues)よりお気軽にお問い合わせください。
