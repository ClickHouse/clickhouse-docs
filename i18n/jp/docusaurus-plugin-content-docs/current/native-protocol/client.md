---
'slug': '/native-protocol/client'
'sidebar_position': 2
'title': 'ネイティブクライアントパケット'
'description': 'ネイティブプロトコルクライアント'
'doc_type': 'reference'
---



# クライアントパケット

| 値   | 名前               | 説明                     |
|------|-------------------|-------------------------|
| 0    | [Hello](#hello)   | クライアントハンドシェイク開始 |
| 1    | [Query](#query)   | クエリリクエスト         |
| 2    | [Data](#data)     | データを含むブロック      |
| 3    | [Cancel](#cancel) | クエリキャンセル          |
| 4    | [Ping](#ping)     | ピングリクエスト          |
| 5    | TableStatus       | テーブルステータスリクエスト |

`Data`は圧縮可能です。

## Hello {#hello}

例えば、私たちは`Go Client` v1.10で、`54451`プロトコルバージョンをサポートしていて、
`default`データベースに`default`ユーザーと`secret`パスワードで接続したいとします。

| フィールド         | 型      | 値              | 説明                            |
|-------------------|---------|----------------|---------------------------------|
| client_name       | 文字列  | `"Go Client"`  | クライアント実装名               |
| version_major     | UVarInt | `1`            | クライアントメジャーバージョン   |
| version_minor     | UVarInt | `10`           | クライアントマイナーバージョン   |
| protocol_version   | UVarInt | `54451`        | TCPプロトコルバージョン         |
| database          | 文字列  | `"default"`    | データベース名                   |
| username          | 文字列  | `"default"`    | ユーザー名                       |
| password          | 文字列  | `"secret"`     | パスワード                       |

### プロトコルバージョン {#protocol-version}

プロトコルバージョンはクライアントのTCPプロトコルバージョンです。

通常、これは最新の互換性のあるサーバーリビジョンと等しいですが、
それと混同してはいけません。

### デフォルト {#defaults}

すべての値は**明示的に設定**される必要があり、サーバー側にデフォルトはありません。
クライアント側では、デフォルトとして`"default"`データベース、`"default"`ユーザー名、`""`（空の文字列）を使用してください。

## クエリ {#query}

| フィールド        | 型                         | 値           | 説明                    |
|------------------|----------------------------|---------------|-------------------------|
| query_id         | 文字列                     | `1ff-a123`    | クエリID、UUIDv4である可能性   |
| client_info      | [ClientInfo](#client-info) | 種類参照      | クライアントに関するデータ  |
| settings         | [Settings](#settings)      | 種類参照      | 設定のリスト             |
| secret           | 文字列                     | `secret`      | サーバー間のシークレット   |
| [stage](#stage)  | UVarInt                    | `2`           | クエリステージまで実行     |
| compression      | UVarInt                    | `0`           | 無効=0、有効=1         |
| body             | 文字列                     | `SELECT 1`    | クエリテキスト            |

### クライアント情報 {#client-info}

| フィールド            | 型              | 説明                           |
|----------------------|-----------------|-------------------------------|
| query_kind           | バイト          | None=0, 初期=1, 二次=2        |
| initial_user         | 文字列          | 初期ユーザー                   |
| initial_query_id     | 文字列          | 初期クエリID                  |
| initial_address      | 文字列          | 初期アドレス                   |
| initial_time         | Int64           | 初期時間                      |
| interface            | バイト          | TCP=1, HTTP=2                 |
| os_user              | 文字列          | OSユーザー                     |
| client_hostname      | 文字列          | クライアントホスト名           |
| client_name          | 文字列          | クライアント名                 |
| version_major        | UVarInt         | クライアントメジャーバージョン |
| version_minor        | UVarInt         | クライアントマイナーバージョン |
| protocol_version     | UVarInt         | クライアントプロトコルバージョン |
| quota_key            | 文字列          | クォータキー                   |
| distributed_depth    | UVarInt         | 分散深度                       |
| version_patch        | UVarInt         | クライアントパッチバージョン   |
| otel                 | Bool            | トレースフィールドが存在する     |
| trace_id             | FixedString(16) | トレースID                     |
| span_id              | FixedString(8)  | スパンID                       |
| trace_state          | 文字列          | トレース状態                   |
| trace_flags          | バイト          | トレースフラグ                 |

### 設定 {#settings}

| フィールド  | 型      | 値                   | 説明                        |
|-------------|---------|----------------------|-----------------------------|
| key         | 文字列  | `send_logs_level`    | 設定のキー                  |
| value       | 文字列  | `trace`              | 設定の値                    |
| important   | Bool    | `true`               | 無視できるかどうか           |

リストとしてエンコードされ、空のキーと値はリストの終わりを示します。

### ステージ {#stage}

| 値   | 名前                 | 説明                                       |
|------|---------------------|--------------------------------------------|
| 0    | FetchColumns        | カラムタイプのみ取得                      |
| 1    | WithMergeableState  | マージ可能な状態まで                       |
| 2    | Complete            | 完全な完了まで（デフォルトであるべき）     |

## データ {#data}

| フィールド   | 型                  | 説明                        |
|--------------|---------------------|-----------------------------|
| info         | BlockInfo           | エンコーディングされたブロック情報 |
| columns      | UVarInt             | カラム数                    |
| rows         | UVarInt             | 行数                        |
| columns      | [[]Column](#column) | データを含むカラム          |

### カラム {#column}

| フィールド | 型      | 値               | 説明             |
|------------|---------|-----------------|------------------|
| name       | 文字列  | `foo`           | カラム名        |
| type       | 文字列  | `DateTime64(9)` | カラムタイプ      |
| data       | バイト   | ~               | カラムデータ      |

## キャンセル {#cancel}

パケットボディはありません。サーバーはクエリをキャンセルする必要があります。

## ピング {#ping}

パケットボディはありません。サーバーは[ポンと返答するべきです](./server.md#pong)。
