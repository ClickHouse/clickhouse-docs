---
description: 'ClickHouse Playgroundは、サーバーやクラスターを設定せずに、クエリを即座に実行することでClickHouseを試すことができる環境です。'
keywords: ['clickhouse', 'playground', 'getting', 'started', 'docs']
sidebar_label: 'ClickHouse Playground'
slug: /getting-started/playground
title: 'ClickHouse Playground'
---


# ClickHouse Playground

[ClickHouse Playground](https://sql.clickhouse.com)は、サーバーやクラスターを設定せずにクエリを即座に実行することでClickHouseを試すことができる環境です。Playgroundには複数のサンプルデータセットが用意されています。

Playgroundに対しては、任意のHTTPクライアント、例えば[ curl](https://curl.haxx.se)や[ wget](https://www.gnu.org/software/wget/)を使用するか、[ JDBC](../interfaces/jdbc.md)または[ ODBC](../interfaces/odbc.md)ドライバーを使用して接続を設定できます。ClickHouseをサポートするソフトウェア製品に関するより詳しい情報は[こちら](../integrations/index.mdx)でご覧いただけます。

## Credentials {#credentials}

| パラメータ           | 値                                |
|:--------------------|:----------------------------------|
| HTTPSエンドポイント  | `https://play.clickhouse.com:443/` |
| ネイティブTCPエンドポイント | `play.clickhouse.com:9440`         |
| ユーザー            | `explorer`または`play`             |
| パスワード          | (空)                               |

## Limitations {#limitations}

クエリは読み取り専用ユーザーとして実行されます。これにはいくつかの制限があります：

- DDLクエリは許可されていません
- INSERTクエリは許可されていません

サービスには使用量に関する制限もあります。

## Examples {#examples}

`curl`を使用したHTTPSエンドポイントの例：

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

[CLI](../interfaces/cli.md)を使用したTCPエンドポイントの例：

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```

## Playground specifications {#specifications}

私たちのClickHouse Playgroundは、次の仕様で運用されています：

- 米国中部地域（US-Central-1）のGoogle Cloud (GCE)上にホスト
- 3レプリカのセットアップ
- 各256 GiBのストレージと59の仮想CPU
