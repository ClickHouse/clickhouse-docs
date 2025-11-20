---
description: 'ClickHouse Playground を使うと、サーバーやクラスターを用意しなくても、その場ですぐにクエリを実行して ClickHouse を試せます。'
keywords: ['clickhouse', 'playground', 'getting', 'started', 'docs']
sidebar_label: 'ClickHouse Playground'
slug: /getting-started/playground
title: 'ClickHouse Playground'
doc_type: 'guide'
---



# ClickHouse Playground

[ClickHouse Playground](https://sql.clickhouse.com) を使用すると、自前でサーバーやクラスターをセットアップすることなく、すぐにクエリを実行して ClickHouse を試すことができます。
Playground にはいくつかのサンプルデータセットが用意されています。

任意の HTTP クライアントを使って Playground にクエリを送信できます。たとえば [curl](https://curl.haxx.se) や [wget](https://www.gnu.org/software/wget/) を使用したり、[JDBC](../interfaces/jdbc.md) や [ODBC](../interfaces/odbc.md) ドライバーを使って接続を設定したりできます。ClickHouse をサポートしているソフトウェア製品に関する詳細は [こちら](../integrations/index.mdx) を参照してください。



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

`curl`を使用したHTTPSエンドポイントの例:

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

[CLI](../interfaces/cli.md)を使用したTCPエンドポイントの例:

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```


## Playground の仕様 {#specifications}

ClickHouse Playground は以下の仕様で稼働しています:

- Google Cloud (GCE) の US Central リージョン (US-Central-1) でホスト
- 3 レプリカ構成
- 各ノードにストレージ 256 GiB、仮想 CPU 59 コア
