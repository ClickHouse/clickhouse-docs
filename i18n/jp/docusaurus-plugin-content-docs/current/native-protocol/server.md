---
slug: /native-protocol/server
sidebar_position: 3
title: 'サーバーパケット'
description: 'ネイティブプロトコルサーバー'
---


# サーバーパケット

| value | name                             | description                                                     |
|-------|----------------------------------|-----------------------------------------------------------------|
| 0     | [Hello](#hello)                  | サーバーハンドシェイク応答                                       |
| 1     | Data                             | [クライアントデータ](./client.md#data) と同じ                        |
| 2     | [Exception](#exception)          | クエリ処理の例外                                              |
| 3     | [Progress](#progress)            | クエリの進捗                                                  |
| 4     | [Pong](#pong)                    | Ping応答                                                    |
| 5     | [EndOfStream](#end-of-stream)    | すべてのパケットが転送された                                    |
| 6     | [ProfileInfo](#profile-info)     | プロファイリングデータ                                         |
| 7     | Totals                           | 合計値                                                      |
| 8     | Extremes                         | 極端な値（最小、最大）                                        |
| 9     | TablesStatusResponse             | TableStatusリクエストへの応答                                  |
| 10    | [Log](#log)                      | クエリシステムログ                                            |
| 11    | TableColumns                     | カラムの説明                                                |
| 12    | UUIDs                            | 一意のパーツIDのリスト                                       |
| 13    | ReadTaskRequest                  | 次のタスクが必要なリクエストを説明する文字列（UUID）       |
| 14    | [ProfileEvents](#profile-events) | サーバーからのプロファイルイベントを含むパケット               |

`Data`、`Totals`、および `Extremes` は圧縮可能です。

## Hello {#hello}

[クライアントハロー](./client.md#hello) への応答。

| field         | type    | value           | description          |
|---------------|---------|-----------------|----------------------|
| name          | String  | `Clickhouse`    | サーバー名          |
| version_major | UVarInt | `21`            | サーバーのメジャーバージョン |
| version_minor | UVarInt | `12`            | サーバーのマイナーバージョン |
| revision      | UVarInt | `54452`         | サーバーのリビジョン      |
| tz            | String  | `Europe/Moscow` | サーバーのタイムゾーン      |
| display_name  | String  | `Clickhouse`    | UI用のサーバー名          |
| version_patch | UVarInt | `3`             | サーバーのパッチバージョン  |

## Exception {#exception}

クエリ処理中のサーバー例外。

| field       | type   | value                                  | description                  |
|-------------|--------|----------------------------------------|------------------------------|
| code        | Int32  | `60`                                   | [エラーコード](https://clickhouse.com/codebrowser/ClickHouse/src/Common/ErrorCodes.cpp.html) を参照。 |
| name        | String | `DB::Exception`                        | サーバーのメジャーバージョン         |
| message     | String | `DB::Exception: Table X doesn't exist` | サーバーのマイナーバージョン         |
| stack_trace | String | ~                                      | C++ スタックトレース              |
| nested      | Bool   | `true`                                 | さらなるエラー                  |

`nested` が `false` になるまで例外のリストを続けることができます。

## Progress {#progress}

サーバーによって定期的に報告されるクエリ実行の進捗。

:::tip
進捗は **デルタ** で報告されます。合計はクライアントで蓄積します。
:::

| field       | type    | value    | description       |
|-------------|---------|----------|-------------------|
| rows        | UVarInt | `65535`  | 行数               |
| bytes       | UVarInt | `871799` | バイト数             |
| total_rows  | UVarInt | `0`      | 合計行数           |
| wrote_rows  | UVarInt | `0`      | クライアントからの行数 |
| wrote_bytes | UVarInt | `0`      | クライアントからのバイト数 |

## Pong {#pong}

[クライアントPing](./client.md#ping) への応答、パケットボディはなし。

## End of stream {#end-of-stream}

これ以上の **Data** パケットは送信されません。クエリ結果はサーバーからクライアントに完全にストリーミングされます。

パケットボディはありません。

## Profile info {#profile-info}

| field                        | type    |
|------------------------------|---------|
| rows                         | UVarInt |
| blocks                       | UVarInt |
| bytes                        | UVarInt |
| applied_limit                | Bool    |
| rows_before_limit            | UVarInt |
| calculated_rows_before_limit | Bool    |

## Log {#log}

**データブロック** に含まれるサーバーログ。

:::tip
**データブロック** としてエンコードされますが、決して圧縮はされません。
:::

| column     | type     |
|------------|----------|
| time       | DateTime |
| time_micro | UInt32   |
| host_name  | String   |
| query_id   | String   |
| thread_id  | UInt64   |
| priority   | Int8     |
| source     | String   |
| text       | String   |

## Profile events {#profile-events}

**データブロック** に含まれるプロファイルイベント。

:::tip
**データブロック** としてエンコードされますが、決して圧縮されません。

`value` のタイプは、サーバーのリビジョンに応じて `UInt64` または `Int64` です。
:::

| column       | type            |
|--------------|-----------------|
| host_name    | String          |
| current_time | DateTime        |
| thread_id    | UInt64          |
| type         | Int8            |
| name         | String          |
| value        | UInt64 or Int64 |
