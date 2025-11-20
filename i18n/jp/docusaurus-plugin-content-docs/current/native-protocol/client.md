---
slug: /native-protocol/client
sidebar_position: 2
title: 'ネイティブクライアントのパケット'
description: 'ネイティブプロトコルクライアント'
doc_type: 'reference'
keywords: ['クライアントパケット', 'ネイティブプロトコルクライアント', 'プロトコルパケット', 'クライアント通信', 'TCPクライアント']
---



# クライアントパケット

| value | name              | description              |
|-------|-------------------|--------------------------|
| 0     | [Hello](#hello)   | クライアントハンドシェイク開始 |
| 1     | [Query](#query)   | クエリリクエスト        |
| 2     | [Data](#data)     | データブロック          |
| 3     | [Cancel](#cancel) | クエリのキャンセル      |
| 4     | [Ping](#ping)     | Ping リクエスト         |
| 5     | TableStatus       | テーブルステータスリクエスト |

`Data` は圧縮できます。



## Hello {#hello}

例えば、プロトコルバージョン `54451` をサポートする `Go Client` v1.10 を使用して、`default` データベースに `default` ユーザーと `secret` パスワードで接続する場合を考えます。

| field            | type    | value         | description                |
| ---------------- | ------- | ------------- | -------------------------- |
| client_name      | String  | `"Go Client"` | クライアント実装名 |
| version_major    | UVarInt | `1`           | クライアントのメジャーバージョン       |
| version_minor    | UVarInt | `10`          | クライアントのマイナーバージョン       |
| protocol_version | UVarInt | `54451`       | TCPプロトコルバージョン       |
| database         | String  | `"default"`   | データベース名              |
| username         | String  | `"default"`   | ユーザー名                   |
| password         | String  | `"secret"`    | パスワード                   |

### プロトコルバージョン {#protocol-version}

プロトコルバージョンは、クライアントのTCPプロトコルバージョンです。

通常、これは互換性のある最新のサーバーリビジョンと同じですが、混同しないように注意してください。

### デフォルト値 {#defaults}

すべての値は**明示的に設定する必要があります**。サーバー側にデフォルト値はありません。
クライアント側では、デフォルトとして `"default"` データベース、`"default"` ユーザー名、および `""`(空文字列)のパスワードを使用します。


## クエリ {#query}

| field           | type                       | value      | description               |
| --------------- | -------------------------- | ---------- | ------------------------- |
| query_id        | String                     | `1ff-a123` | クエリID（UUIDv4を使用可能）   |
| client_info     | [ClientInfo](#client-info) | See type   | クライアントに関するデータ         |
| settings        | [Settings](#settings)      | See type   | 設定のリスト          |
| secret          | String                     | `secret`   | サーバー間シークレット       |
| [stage](#stage) | UVarInt                    | `2`        | クエリステージまで実行 |
| compression     | UVarInt                    | `0`        | 無効=0、有効=1     |
| body            | String                     | `SELECT 1` | クエリテキスト                |

### クライアント情報 {#client-info}

| field             | type            | description                    |
| ----------------- | --------------- | ------------------------------ |
| query_kind        | byte            | None=0、Initial=1、Secondary=2 |
| initial_user      | String          | 初期ユーザー                   |
| initial_query_id  | String          | 初期クエリID               |
| initial_address   | String          | 初期アドレス                |
| initial_time      | Int64           | 初期時刻                   |
| interface         | byte            | TCP=1、HTTP=2                  |
| os_user           | String          | OSユーザー                        |
| client_hostname   | String          | クライアントホスト名                |
| client_name       | String          | クライアント名                    |
| version_major     | UVarInt         | クライアントメジャーバージョン           |
| version_minor     | UVarInt         | クライアントマイナーバージョン           |
| protocol_version  | UVarInt         | クライアントプロトコルバージョン        |
| quota_key         | String          | クォータキー                      |
| distributed_depth | UVarInt         | 分散深度              |
| version_patch     | UVarInt         | クライアントパッチバージョン           |
| otel              | Bool            | トレースフィールドの有無       |
| trace_id          | FixedString(16) | トレースID                       |
| span_id           | FixedString(8)  | スパンID                        |
| trace_state       | String          | トレーシング状態                  |
| trace_flags       | Byte            | トレーシングフラグ                  |

### 設定 {#settings}

| field     | type   | value             | description           |
| --------- | ------ | ----------------- | --------------------- |
| key       | String | `send_logs_level` | 設定のキー        |
| value     | String | `trace`           | 設定の値      |
| important | Bool   | `true`            | 無視可能かどうか |

リストとしてエンコードされ、空のキーと値はリストの終わりを示します。

### ステージ {#stage}

| value | name               | description                                 |
| ----- | ------------------ | ------------------------------------------- |
| 0     | FetchColumns       | カラム型のみを取得                     |
| 1     | WithMergeableState | マージ可能な状態まで                       |
| 2     | Complete           | 完全に完了するまで（デフォルト推奨） |


## データ {#data}

| フィールド   | 型                | 説明        |
| ------- | ------------------- | ------------------ |
| info    | BlockInfo           | エンコードされたブロック情報 |
| columns | UVarInt             | カラム数      |
| rows    | UVarInt             | 行数         |
| columns | [[]Column](#column) | データを含むカラム  |

### カラム {#column}

| フィールド | 型   | 値           | 説明 |
| ----- | ------ | --------------- | ----------- |
| name  | String | `foo`           | カラム名 |
| type  | String | `DateTime64(9)` | カラム型 |
| data  | bytes  | ~               | カラムデータ |


## Cancel {#cancel}

パケットボディなし。サーバーはクエリをキャンセルします。


## Ping {#ping}

パケット本体なし。サーバーは[pongで応答](./server.md#pong)する必要があります。
