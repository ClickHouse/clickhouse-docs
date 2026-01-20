---
description: 'ClickHouse Playground では、自分のサーバーやクラスターをセットアップすることなく、すぐにクエリを実行して ClickHouse を試せます。'
keywords: ['clickhouse', 'playground', 'getting', 'started', 'docs']
sidebar_label: 'ClickHouse Playground'
slug: /getting-started/playground
title: 'ClickHouse Playground'
doc_type: 'guide'
---

# ClickHouse playground \{#clickhouse-playground\}

[ClickHouse Playground](https://sql.clickhouse.com) は、ユーザーが独自のサーバーやクラスターをセットアップすることなく、すぐにクエリを実行して ClickHouse を試せる環境です。
Playground には、いくつかのサンプルデータセットが用意されています。

Playground には、任意の HTTP クライアントからクエリを送信できます。たとえば [curl](https://curl.haxx.se) や [wget](https://www.gnu.org/software/wget/) を使用するか、[JDBC](/interfaces/jdbc) や [ODBC](/interfaces/odbc) ドライバーを使って接続を設定できます。ClickHouse をサポートするソフトウェア製品の詳細については [こちら](../integrations/index.mdx) を参照してください。

## 認証情報 \{#credentials\}

| パラメータ              | 値                                  |
|:------------------------|:-----------------------------------|
| HTTPS エンドポイント    | `https://play.clickhouse.com:443/` |
| ネイティブ TCP エンドポイント | `play.clickhouse.com:9440`         |
| ユーザー                | `explorer` または `play`            |
| パスワード              | (空)                                |

## 制限事項 \{#limitations\}

クエリは読み取り専用ユーザーの権限で実行されます。これは、いくつかの制限を伴います。

- DDL クエリは許可されていません
- INSERT クエリは許可されていません

このサービスの利用にはクォータも設けられています。

## 例 \{#examples\}

`curl` を使って HTTPS エンドポイントにアクセスする例：

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

[CLI](../interfaces/cli.md) を使った TCP エンドポイントの例：

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```


## Playground specifications \{#specifications\}

ClickHouse Playground は、次の仕様で稼働しています。

- 米国中部リージョン (US-Central-1) の Google Cloud (GCE) 上でホストされています
- 3 レプリカ構成
- 各ノードあたり 256 GiB のストレージおよび 59 仮想 CPU を搭載