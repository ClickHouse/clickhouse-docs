---
sidebar_label: ClickHouse Playground
sidebar_position: 2
keywords: [clickhouse, playground, getting, started, docs]
description: ClickHouse Playgroundを使用すると、サーバーやクラスターをセットアップせずに、クエリを即座に実行することでClickHouseを試すことができます。
slug: /getting-started/playground
---


# ClickHouse Playground

[ClickHouse Playground](https://sql.clickhouse.com)を使用すると、サーバーやクラスターをセットアップせずに、即座にクエリを実行してClickHouseを試すことができます。
Playgroundにはいくつかのサンプルデータセットが用意されています。

Playgroundにクエリを送信するには、任意のHTTPクライアントを使用できます。たとえば、[curl](https://curl.haxx.se)や[Wget](https://www.gnu.org/software/wget/)を使用するか、[JDBC](../interfaces/jdbc.md)または[ODBC](../interfaces/odbc.md)ドライバーを使って接続を設定できます。ClickHouseをサポートするソフトウェア製品に関する詳細情報は、[こちら](../integrations/index.mdx)で入手できます。

## Credentials {#credentials}

| パラメータ           | 値                                   |
|:---------------------|:--------------------------------------|
| HTTPSエンドポイント  | `https://play.clickhouse.com:443/`   |
| ネイティブTCPエンドポイント | `play.clickhouse.com:9440`            |
| ユーザー             | `explorer` または `play`              |
| パスワード           | (空)                                  |

## Limitations {#limitations}

クエリは読み取り専用ユーザーとして実行されます。これにはいくつかの制限があります：

- DDLクエリは許可されていません
- INSERTクエリは許可されていません

このサービスには使用に関するクォータもあります。

## Examples {#examples}

`curl`を使用したHTTPSエンドポイントの例：

``` bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

[CLI](../interfaces/cli.md)を使用したTCPエンドポイントの例：

``` bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```
