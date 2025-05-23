---
'slug': '/native-protocol/client'
'sidebar_position': 2
'title': 'ネイティブクライアントパケット'
'description': 'ネイティブプロトコルクライアント'
---




# クライアントパケット

| value | name              | description            |
|-------|-------------------|------------------------|
| 0     | [Hello](#hello)   | クライアントハンドシェイク開始 |
| 1     | [Query](#query)   | クエリリクエスト          |
| 2     | [Data](#data)     | データを含むブロック        |
| 3     | [Cancel](#cancel) | クエリをキャンセル           |
| 4     | [Ping](#ping)     | ピングリクエスト           |
| 5     | TableStatus       | テーブルステータスリクエスト   |

`Data` は圧縮可能です。

## Hello {#hello}

例えば、`Go Client` v1.10が`54451`プロトコルのバージョンをサポートしていて
`default`データベースに`default`ユーザーおよび`secret`パスワードで接続したいとします。

| field            | type    | value         | description                |
|------------------|---------|---------------|----------------------------|
| client_name      | String  | `"Go Client"` | クライアント実装名 |
| version_major    | UVarInt | `1`           | クライアントメジャーバージョン       |
| version_minor    | UVarInt | `10`          | クライアントマイナーバージョン       |
| protocol_version | UVarInt | `54451`       | TCPプロトコルバージョン       |
| database         | String  | `"default"`   | データベース名              |
| username         | String  | `"default"`   | ユーザー名                   |
| password         | String  | `"secret"`    | パスワード                   |

### プロトコルバージョン {#protocol-version}

プロトコルバージョンはクライアントのTCPプロトコルバージョンです。

通常、これは最新の互換性のあるサーバーリビジョンに等しいですが、
それと混同してはいけません。

### デフォルト {#defaults}

すべての値は**明示的に設定する必要があります**。サーバー側にデフォルトはありません。
クライアント側では、`"default"`データベース、`"default"`ユーザー名、`""`（空文字列）
パスワードをデフォルトとして使用します。

## クエリ {#query}

| field           | type                       | value      | description               |
|-----------------|----------------------------|------------|---------------------------|
| query_id        | String                     | `1ff-a123` | クエリID、UUIDv4であることも可能   |
| client_info     | [ClientInfo](#client-info) | 型を参照   | クライアントに関するデータ         |
| settings        | [Settings](#settings)      | 型を参照   | 設定のリスト          |
| secret          | String                     | `secret`   | サーバー間のシークレット       |
| [stage](#stage) | UVarInt                    | `2`        | クエリステージまで実行します |
| compression     | UVarInt                    | `0`        | 無効=0、有効=1     |
| body            | String                     | `SELECT 1` | クエリテキスト                |

### クライアント情報 {#client-info}

| field             | type            | description                    |
|-------------------|-----------------|--------------------------------|
| query_kind        | byte            | None=0, Initial=1, Secondary=2 |
| initial_user      | String          | 初期ユーザー                   |
| initial_query_id  | String          | 初期クエリID               |
| initial_address   | String          | 初期アドレス                |
| initial_time      | Int64           | 初期時間                   |
| interface         | byte            | TCP=1, HTTP=2                  |
| os_user           | String          | OSユーザー                        |
| client_hostname   | String          | クライアントホスト名                |
| client_name       | String          | クライアント名                    |
| version_major     | UVarInt         | クライアントメジャーバージョン           |
| version_minor     | UVarInt         | クライアントマイナーバージョン           |
| protocol_version  | UVarInt         | クライアントプロトコルバージョン        |
| quota_key         | String          | クオータキー                      |
| distributed_depth | UVarInt         | 分散深度              |
| version_patch     | UVarInt         | クライアントパッチバージョン           |
| otel              | Bool            | トレースフィールドが存在するか       |
| trace_id          | FixedString(16) | トレースID                       |
| span_id           | FixedString(8)  | スパンID                        |
| trace_state       | String          | トレース状態                  |
| trace_flags       | Byte            | トレースフラグ                  |


### 設定 {#settings}

| field     | type   | value             | description           |
|-----------|--------|-------------------|-----------------------|
| key       | String | `send_logs_level` | 設定のキー        |
| value     | String | `trace`           | 設定の値      |
| important | Bool   | `true`            | 無視してもよいか |

リストとしてエンコードされており、キーと値が空である場合はリストの終わりを示します。

### ステージ {#stage}

| value | name               | description                                 |
|-------|--------------------|---------------------------------------------|
| 0     | FetchColumns       | カラム型のみを取得                     |
| 1     | WithMergeableState | マージ可能な状態まで                       |
| 2     | Complete           | 完全な完了まで（デフォルトであるべき） |


## データ {#data}

| field   | type                | description        |
|---------|---------------------|--------------------|
| info    | BlockInfo           | エンコードされたブロック情報 |
| columns | UVarInt             | カラム数      |
| rows    | UVarInt             | 行数         |
| columns | [[]Column](#column) | データを含むカラム  |

### カラム {#column}

| field | type   | value           | description |
|-------|--------|-----------------|-------------|
| name  | String | `foo`           | カラム名 |
| type  | String | `DateTime64(9)` | カラム型 |
| data  | bytes  | ~               | カラムデータ |

## キャンセル {#cancel}

パケットボディはありません。サーバーはクエリをキャンセルする必要があります。

## ピング {#ping}

パケットボディはありません。サーバーは[ポンで応答するべきです](./server.md#pong)。
