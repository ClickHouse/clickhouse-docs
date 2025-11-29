---
slug: /native-protocol/client
sidebar_position: 2
title: 'ネイティブクライアントのパケット'
description: 'ネイティブプロトコルのクライアント'
doc_type: 'reference'
keywords: ['クライアントパケット', 'ネイティブプロトコルクライアント', 'プロトコルパケット', 'クライアント通信', 'TCP クライアント']
---



# クライアントパケット {#client-packets}

| value | name              | description              |
|-------|-------------------|--------------------------|
| 0     | [Hello](#hello)   | クライアントのハンドシェイク開始 |
| 1     | [Query](#query)   | クエリ要求               |
| 2     | [Data](#data)     | データブロック           |
| 3     | [Cancel](#cancel) | クエリのキャンセル       |
| 4     | [Ping](#ping)     | Ping リクエスト          |
| 5     | TableStatus       | テーブルステータスの要求 |

`Data` は圧縮可能です。



## Hello {#hello}

例えば、`54451` のプロトコルバージョンをサポートする `Go Client` v1.10 を使用して、
`default` データベースに `default` ユーザー、`secret` パスワードで接続したいとします。

| field            | type    | value         | description                     |
|------------------|---------|---------------|---------------------------------|
| client_name      | String  | `"Go Client"` | クライアント実装名             |
| version_major    | UVarInt | `1`           | クライアントのメジャーバージョン |
| version_minor    | UVarInt | `10`          | クライアントのマイナーバージョン |
| protocol_version | UVarInt | `54451`       | TCP プロトコルバージョン       |
| database         | String  | `"default"`   | データベース名                 |
| username         | String  | `"default"`   | ユーザー名                     |
| password         | String  | `"secret"`    | パスワード                     |

### Protocol version {#protocol-version}

プロトコルバージョンは、クライアントの TCP プロトコルのバージョンです。

通常、互換性のある最新のサーバーリビジョンと同じですが、
サーバーリビジョンそのものと混同してはいけません。

### Defaults {#defaults}

すべての値は**明示的に設定**する必要があり、サーバー側にはデフォルト値はありません。
クライアント側では、デフォルトとして `"default"` データベース、`"default"` ユーザー名、
およびパスワードには `""`（空文字列）を使用してください。



## クエリ {#query}

| field           | type                       | value      | description                         |
|-----------------|----------------------------|------------|-------------------------------------|
| query_id        | String                     | `1ff-a123` | クエリ ID。UUIDv4 を利用可能        |
| client_info     | [ClientInfo](#client-info) | 型を参照   | クライアントに関するデータ          |
| settings        | [Settings](#settings)      | 型を参照   | 設定の一覧                           |
| secret          | String                     | `secret`   | サーバー間シークレット              |
| [stage](#stage) | UVarInt                    | `2`        | 指定したクエリステージまで実行      |
| compression     | UVarInt                    | `0`        | 無効=0、有効=1                      |
| body            | String                     | `SELECT 1` | クエリテキスト                      |

### Client info {#client-info}

| field             | type            | description                                   |
|-------------------|-----------------|-----------------------------------------------|
| query_kind        | byte            | None=0、Initial=1、Secondary=2                |
| initial_user      | String          | 初期ユーザー                                  |
| initial_query_id  | String          | 初期クエリ ID                                 |
| initial_address   | String          | 初期アドレス                                  |
| initial_time      | Int64           | 初期時刻                                      |
| interface         | byte            | TCP=1、HTTP=2                                 |
| os_user           | String          | OS ユーザー                                   |
| client_hostname   | String          | クライアントホスト名                          |
| client_name       | String          | クライアント名                                |
| version_major     | UVarInt         | クライアントのメジャーバージョン              |
| version_minor     | UVarInt         | クライアントのマイナーバージョン              |
| protocol_version  | UVarInt         | クライアントのプロトコルバージョン            |
| quota_key         | String          | クォータキー                                  |
| distributed_depth | UVarInt         | 分散クエリの深さ                              |
| version_patch     | UVarInt         | クライアントのパッチバージョン                |
| otel              | Bool            | トレース用フィールドが存在するかどうか        |
| trace_id          | FixedString(16) | トレース ID                                   |
| span_id           | FixedString(8)  | スパン ID                                     |
| trace_state       | String          | トレースの状態                                |
| trace_flags       | Byte            | トレースのフラグ                              |

### Settings {#settings}

| field     | type   | value             | description                 |
|-----------|--------|-------------------|-----------------------------|
| key       | String | `send_logs_level` | 設定のキー                  |
| value     | String | `trace`           | 設定の値                    |
| important | Bool   | `true`            | 無視可能かどうかを示す      |

リストとしてエンコードされており、key と value が空の要素が現れるとリストの終端を示します。

### Stage {#stage}

| value | name               | description                                       |
|-------|--------------------|---------------------------------------------------|
| 0     | FetchColumns       | 列の型のみを取得する                              |
| 1     | WithMergeableState | マージ可能な状態になるまで                        |
| 2     | Complete           | 完全に完了するまで（デフォルトであるべき値）      |



## データ {#data}

| field   | type                | description              |
|---------|---------------------|--------------------------|
| info    | BlockInfo           | エンコードされたブロック情報 |
| columns | UVarInt             | 列数                     |
| rows    | UVarInt             | 行数                     |
| columns | [[]列](#column)     | データを含む列           |

### 列 {#column}

| field | type   | value           | description |
|-------|--------|-----------------|-------------|
| name  | String | `foo`           | 列名        |
| type  | String | `DateTime64(9)` | 列の型      |
| data  | bytes  | ~               | 列データ    |



## キャンセル {#cancel}

パケット本体はありません。サーバーはクエリをキャンセルする必要があります。



## Ping {#ping}

パケットの本体はありません。サーバーは[pong](./server.md#pong)で応答する必要があります。
