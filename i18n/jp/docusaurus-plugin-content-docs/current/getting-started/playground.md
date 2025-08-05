---
description: 'The ClickHouse Playground allows people to experiment with ClickHouse
  by running queries instantly, without setting up their server or cluster.'
keywords:
- 'clickhouse'
- 'playground'
- 'getting'
- 'started'
- 'docs'
sidebar_label: 'ClickHouse Playground'
slug: '/getting-started/playground'
title: 'ClickHouse Playground'
---




# ClickHouse Playground

[ClickHouse Playground](https://sql.clickhouse.com) は、サーバーやクラスタをセットアップすることなく、クエリを即座に実行することで ClickHouse を試すことができる環境です。Playground にはいくつかのサンプルデータセットが用意されています。

任意の HTTP クライアントを使用して Playground にクエリを送信できます。例えば、[curl](https://curl.haxx.se) や [wget](https://www.gnu.org/software/wget/) を使用するか、[JDBC](../interfaces/jdbc.md) または [ODBC](../interfaces/odbc.md) ドライバーを使用して接続を設定できます。ClickHouse をサポートするソフトウェア製品に関する詳細情報は、[こちら](../integrations/index.mdx)で入手できます。

## Credentials {#credentials}

| パラメータ          | 値                                  |
|:--------------------|:-----------------------------------|
| HTTPS エンドポイント | `https://play.clickhouse.com:443/` |
| Native TCP エンドポイント | `play.clickhouse.com:9440`         |
| ユーザー             | `explorer` または `play`            |
| パスワード           | (空)                               |

## Limitations {#limitations}

クエリは読み取り専用ユーザーとして実行されます。これにはいくつかの制限が含まれます：

- DDL クエリは許可されていません
- INSERT クエリは許可されていません

このサービスには使用量に制限もあります。

## Examples {#examples}

HTTPS エンドポイントの例（`curl` 使用）：

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

TCP エンドポイントの例（[CLI](../interfaces/cli.md) 使用）：

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```

## Playground specifications {#specifications}

ClickHouse Playground は以下の仕様で運営されています：

- 米国中央地域（US-Central-1）の Google Cloud (GCE) 上でホストされています
- 3 レプリカのセットアップ
- 各 256 GiB のストレージと 59 の仮想 CPU あり。
