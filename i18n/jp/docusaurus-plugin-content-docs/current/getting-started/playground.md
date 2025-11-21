---
description: 'ClickHouse Playground は、サーバーやクラスターをセットアップすることなく、クエリをすぐに実行して ClickHouse を試せる環境です。'
keywords: ['clickhouse', 'playground', 'getting', 'started', 'docs']
sidebar_label: 'ClickHouse Playground'
slug: /getting-started/playground
title: 'ClickHouse Playground'
doc_type: 'guide'
---



# ClickHouse playground

[ClickHouse Playground](https://sql.clickhouse.com) は、サーバーやクラスターを用意することなく、クエリを即座に実行して ClickHouse を試せる環境です。
Playground にはいくつかのサンプルデータセットが用意されています。

[curl](https://curl.haxx.se) や [wget](https://www.gnu.org/software/wget/) などの任意の HTTP クライアントを使用して Playground に対してクエリを実行したり、[JDBC](../interfaces/jdbc.md) や [ODBC](../interfaces/odbc.md) ドライバーを使って接続を設定したりできます。ClickHouse をサポートするソフトウェア製品の詳細については [こちら](../integrations/index.mdx) を参照してください。



## 認証情報 {#credentials}

| パラメータ           | 値                              |
| :------------------ | :--------------------------------- |
| HTTPSエンドポイント      | `https://play.clickhouse.com:443/` |
| ネイティブTCPエンドポイント | `play.clickhouse.com:9440`         |
| ユーザー                | `explorer` または `play`               |
| パスワード            | (空)                            |


## 制限事項 {#limitations}

クエリは読み取り専用ユーザーとして実行されます。これにより、以下の制限があります：

- DDLクエリは使用できません
- INSERTクエリは使用できません

また、このサービスには使用量に対するクォータが設定されています。


## 例 {#examples}

`curl`を使用したHTTPSエンドポイントの例：

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

[CLI](../interfaces/cli.md)を使用したTCPエンドポイントの例：

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```


## Playgroundの仕様 {#specifications}

ClickHouse Playgroundは以下の仕様で稼働しています:

- Google Cloud (GCE) の US Central リージョン (US-Central-1) でホスト
- 3レプリカ構成
- ストレージ256 GiB、仮想CPU 59個（各ノード）
