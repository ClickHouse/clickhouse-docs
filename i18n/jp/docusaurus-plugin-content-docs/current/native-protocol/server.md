---
slug: /native-protocol/server
sidebar_position: 3
title: 'サーバーパケット'
description: 'ネイティブプロトコルサーバー'
doc_type: 'reference'
keywords: ['ネイティブプロトコル', 'tcp protocol', 'client-server', 'protocol specification', 'networking']
---

| value | name                             | description                       |
| ----- | -------------------------------- | --------------------------------- |
| 0     | [Hello](#hello)                  | サーバーからのハンドシェイク応答                  |
| 1     | Data                             | [クライアントデータ](./client.md#data) と同じ |
| 2     | [Exception](#exception)          | クエリ処理時の例外                         |
| 3     | [Progress](#progress)            | クエリの進行状況                          |
| 4     | [Pong](#pong)                    | Ping に対する応答                       |
| 5     | [EndOfStream](#end-of-stream)    | すべてのパケットが転送済み                     |
| 6     | [ProfileInfo](#profile-info)     | プロファイリングデータ                       |
| 7     | Totals                           | 合計値                               |
| 8     | Extremes                         | 極値 (最小値・最大値)                      |
| 9     | TablesStatusResponse             | TableStatus リクエストへの応答             |
| 10    | [Log](#log)                      | クエリのシステムログ                        |
| 11    | TableColumns                     | カラムの説明                            |
| 12    | UUIDs                            | パーツの一意 ID の一覧                     |
| 13    | ReadTaskRequest                  | 次のタスクが必要なリクエストを表す文字列 (UUID)       |
| 14    | [ProfileEvents](#profile-events) | サーバーからのプロファイルイベントを含むパケット          |

`Data`、`Totals`、`Extremes` は圧縮可能です。

## Hello \{#hello\}

[client hello](./client.md#hello) への応答。

| フィールド             | type    | value           | description    |
| ----------------- | ------- | --------------- | -------------- |
| name              | String  | `Clickhouse`    | サーバー名          |
| version&#95;major | UVarInt | `21`            | サーバーのメジャーバージョン |
| version&#95;minor | UVarInt | `12`            | サーバーのマイナーバージョン |
| revision          | UVarInt | `54452`         | サーバーのリビジョン     |
| tz                | String  | `Europe/Moscow` | サーバーのタイムゾーン    |
| display&#95;name  | String  | `Clickhouse`    | UI 用のサーバー名     |
| version&#95;patch | UVarInt | `3`             | サーバーのパッチバージョン  |

## 例外 \{#exception\}

クエリ処理中にサーバーで発生した例外。

| フィールド           | type   | value                                  | description                 |
| --------------- | ------ | -------------------------------------- | --------------------------- |
| code            | Int32  | `60`                                   | [ErrorCodes.cpp][codes] を参照 |
| name            | String | `DB::Exception`                        | 例外クラス名                      |
| message         | String | `DB::Exception: Table X doesn't exist` | 例外メッセージ                     |
| stack&#95;trace | String | ~                                      | C++ のスタックトレース               |
| nested          | Bool   | `true`                                 | さらにネストされたエラー                |

`nested` が `false` になるまで、例外が連続したリストとして含まれる場合があります。

[codes]: https://clickhouse.com/codebrowser/ClickHouse/src/Common/ErrorCodes.cpp.html "エラーコード一覧"

## 進捗 \{#progress\}

クエリ実行の進捗はサーバーから定期的に報告されます。

:::tip
進捗は**差分**として報告されます。累計値が必要な場合は、クライアント側で集計してください。
:::

| フィールド           | type    | value    | description        |
| --------------- | ------- | -------- | ------------------ |
| rows            | UVarInt | `65535`  | 行数                 |
| bytes           | UVarInt | `871799` | バイト数               |
| total&#95;rows  | UVarInt | `0`      | 総行数                |
| wrote&#95;rows  | UVarInt | `0`      | クライアントから書き込まれた行数   |
| wrote&#95;bytes | UVarInt | `0`      | クライアントから書き込まれたバイト数 |

## Pong \{#pong\}

[クライアント ping](./client.md#ping) に対する応答であり、パケット本文はありません。

## ストリーム終了 \{#end-of-stream\}

以降 **Data** パケットは送信されず、クエリ結果はサーバーからクライアントへすべて送信済みです。

パケット本文はありません。

## プロファイル情報 \{#profile-info\}

| フィールド                                    | 型       |
| ---------------------------------------- | ------- |
| rows                                     | UVarInt |
| blocks                                   | UVarInt |
| bytes                                    | UVarInt |
| applied&#95;limit                        | Bool    |
| rows&#95;before&#95;limit                | UVarInt |
| calculated&#95;rows&#95;before&#95;limit | Bool    |

## Log \{#log\}

サーバーログを表す**データブロック**です。

:::tip
列からなる**データブロック**としてエンコードされますが、圧縮されることはありません。
:::

| column         | type     |
| -------------- | -------- |
| time           | DateTime |
| time&#95;micro | UInt32   |
| host&#95;name  | String   |
| query&#95;id   | String   |
| thread&#95;id  | UInt64   |
| priority       | Int8     |
| source         | String   |
| text           | String   |

## プロファイルイベント \{#profile-events\}

プロファイルイベントの **データブロック**。

:::tip
カラムからなる **データブロック** としてエンコードされますが、圧縮されることはありません。

`value` 型はサーバーのリビジョンに応じて `UInt64` または `Int64` です。
:::

| column           | type            |
| ---------------- | --------------- |
| host&#95;name    | String          |
| current&#95;time | DateTime        |
| thread&#95;id    | UInt64          |
| type             | Int8            |
| name             | String          |
| value            | UInt64 or Int64 |