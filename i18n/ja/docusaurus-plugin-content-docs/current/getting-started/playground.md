---
sidebar_label: ClickHouse Playground
sidebar_position: 2
keywords: [clickhouse, playground, getting, started, docs]
description: ClickHouse Playgroundでは、サーバーやクラスターを設定せずに、クエリを即座に実行してClickHouseを試すことができます。
slug: /getting-started/playground
---

# ClickHouse Playground

[ClickHouse Playground](https://sql.clickhouse.com)では、サーバーやクラスターを設定せずに、クエリを即座に実行してClickHouseを試すことができます。
Playgroundには、いくつかのサンプルデータセットが用意されています。

Playgroundへのクエリは、任意のHTTPクライアントを使用して行うことができ、例えば [curl](https://curl.haxx.se) や [wget](https://www.gnu.org/software/wget/) のようなものがあります。または、[JDBC](../interfaces/jdbc.md) や [ODBC](../interfaces/odbc.md) ドライバーを使用して接続を設定することもできます。ClickHouseをサポートするソフトウェア製品に関するより詳しい情報は[こちら](../integrations/index.mdx)で入手できます。

## 認証情報 {#credentials}

| パラメータ           | 値                                  |
|:---------------------|:------------------------------------|
| HTTPSエンドポイント  | `https://play.clickhouse.com:443/`  |
| ネイティブTCPエンドポイント | `play.clickhouse.com:9440`           |
| ユーザー             | `explorer` または `play`            |
| パスワード           | (空)                                |

## 制限事項 {#limitations}

クエリは読み取り専用ユーザーとして実行されます。これにはいくつかの制限があります：

- DDLクエリは許可されていません
- INSERTクエリは許可されていません

このサービスは使用量に対してもクォータがあります。

## 例 {#examples}

HTTPSエンドポイントの例（`curl`を使用）：

``` bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

TCPエンドポイントの例（[CLI](../interfaces/cli.md)を使用）：

``` bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```
