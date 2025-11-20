---
slug: /native-protocol/server
sidebar_position: 3
title: 'サーバーパケット'
description: 'ネイティブプロトコル（サーバー側）'
doc_type: 'reference'
keywords: ['native protocol', 'tcp protocol', 'client-server', 'protocol specification', 'networking']
---



# サーバーパケット

| value | name                             | description                                                     |
|-------|----------------------------------|-----------------------------------------------------------------|
| 0     | [Hello](#hello)                  | サーバーのハンドシェイク応答                                    |
| 1     | Data                             | [クライアントデータ](./client.md#data) と同じ                    |
| 2     | [Exception](#exception)          | クエリ処理中の例外                                              |
| 3     | [Progress](#progress)            | クエリの進行状況                                                |
| 4     | [Pong](#pong)                    | Ping に対する応答                                               |
| 5     | [EndOfStream](#end-of-stream)    | すべてのパケットの送信完了                                      |
| 6     | [ProfileInfo](#profile-info)     | プロファイリングデータ                                          |
| 7     | Totals                           | 合計値                                                          |
| 8     | Extremes                         | 極値（最小値、最大値）                                          |
| 9     | TablesStatusResponse             | TableStatus リクエストへの応答                                  |
| 10    | [Log](#log)                      | クエリのシステムログ                                            |
| 11    | TableColumns                     | カラムの定義                                                    |
| 12    | UUIDs                            | 一意なパーツ ID の一覧                                          |
| 13    | ReadTaskRequest                  | 次のタスクが必要なリクエストを表す文字列（UUID）                |
| 14    | [ProfileEvents](#profile-events) | サーバーからのプロファイルイベントを含むパケット                |

`Data`、`Totals`、`Extremes` は圧縮可能です。



## Hello {#hello}

[クライアントhello](./client.md#hello)への応答。

| field         | type    | value           | description          |
| ------------- | ------- | --------------- | -------------------- |
| name          | String  | `Clickhouse`    | サーバー名          |
| version_major | UVarInt | `21`            | サーバーのメジャーバージョン |
| version_minor | UVarInt | `12`            | サーバーのマイナーバージョン |
| revision      | UVarInt | `54452`         | サーバーのリビジョン      |
| tz            | String  | `Europe/Moscow` | サーバーのタイムゾーン      |
| display_name  | String  | `Clickhouse`    | UI表示用のサーバー名   |
| version_patch | UVarInt | `3`             | サーバーのパッチバージョン |


## Exception {#exception}

クエリ処理中に発生するサーバー例外。

| field       | type   | value                                  | description                  |
| ----------- | ------ | -------------------------------------- | ---------------------------- |
| code        | Int32  | `60`                                   | [ErrorCodes.cpp][codes]を参照してください。 |
| name        | String | `DB::Exception`                        | 例外名         |
| message     | String | `DB::Exception: Table X doesn't exist` | エラーメッセージ         |
| stack_trace | String | ~                                      | C++スタックトレース              |
| nested      | Bool   | `true`                                 | ネストされたエラーの有無                    |

`nested`が`false`になるまで、例外が連続してリストされることがあります。

[codes]: https://clickhouse.com/codebrowser/ClickHouse/src/Common/ErrorCodes.cpp.html "エラーコード一覧"


## Progress {#progress}

サーバーによって定期的に報告されるクエリ実行の進捗状況。

:::tip
進捗状況は**差分**で報告されます。合計値を得るには、クライアント側で累積してください。
:::

| field       | type    | value    | description       |
| ----------- | ------- | -------- | ----------------- |
| rows        | UVarInt | `65535`  | 行数         |
| bytes       | UVarInt | `871799` | バイト数        |
| total_rows  | UVarInt | `0`      | 総行数        |
| wrote_rows  | UVarInt | `0`      | クライアントからの行数  |
| wrote_bytes | UVarInt | `0`      | クライアントからのバイト数 |


## Pong {#pong}

[クライアントping](./client.md#ping)に対する応答です。パケットボディはありません。


## ストリームの終了 {#end-of-stream}

これ以上**Data**パケットは送信されません。クエリ結果はサーバーからクライアントへ完全にストリーミングされました。

パケット本体なし。


## プロファイル情報 {#profile-info}

| フィールド                    | 型      |
| ---------------------------- | ------- |
| rows                         | UVarInt |
| blocks                       | UVarInt |
| bytes                        | UVarInt |
| applied_limit                | Bool    |
| rows_before_limit            | UVarInt |
| calculated_rows_before_limit | Bool    |


## Log {#log}

サーバーログを含む**データブロック**。

:::tip
カラムの**データブロック**としてエンコードされますが、圧縮は行われません。
:::

| カラム     | 型       |
| ---------- | -------- |
| time       | DateTime |
| time_micro | UInt32   |
| host_name  | String   |
| query_id   | String   |
| thread_id  | UInt64   |
| priority   | Int8     |
| source     | String   |
| text       | String   |


## プロファイルイベント {#profile-events}

プロファイルイベントを含む**データブロック**。

:::tip
カラムの**データブロック**としてエンコードされますが、圧縮されません。

`value`の型は、サーバーのリビジョンに応じて`UInt64`または`Int64`です。
:::

| column       | type            |
| ------------ | --------------- |
| host_name    | String          |
| current_time | DateTime        |
| thread_id    | UInt64          |
| type         | Int8            |
| name         | String          |
| value        | UInt64 or Int64 |
