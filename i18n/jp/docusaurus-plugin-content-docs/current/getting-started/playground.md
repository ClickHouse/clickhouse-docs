---
'description': 'ClickHouse Playground は、サーバーやクラスターを設定せずに、クエリを即座に実行することで ClickHouse
  を試すことができる環境です。'
'keywords':
- 'clickhouse'
- 'playground'
- 'getting'
- 'started'
- 'docs'
'sidebar_label': 'ClickHouse Playground'
'slug': '/getting-started/playground'
'title': 'ClickHouse Playground'
'doc_type': 'guide'
---


# ClickHouse Playground

[ClickHouse Playground](https://sql.clickhouse.com) は、サーバーやクラスタをセットアップすることなく、クエリを即座に実行して ClickHouse を試すことができるプラットフォームです。Playground には、いくつかのサンプルデータセットが用意されています。

Playground にクエリを送信するには、任意の HTTP クライアントを使用できます。例としては [curl](https://curl.haxx.se) や [wget](https://www.gnu.org/software/wget/) があり、また [JDBC](../interfaces/jdbc.md) や [ODBC](../interfaces/odbc.md) ドライバーを使って接続を設定することもできます。ClickHouse をサポートするソフトウェア製品に関する詳細は [こちら](../integrations/index.mdx) から確認できます。

## Credentials {#credentials}

| パラメータ          | 値                                 |
|:--------------------|:-----------------------------------|
| HTTPS エンドポイント | `https://play.clickhouse.com:443/` |
| ネイティブ TCP エンドポイント | `play.clickhouse.com:9440`         |
| ユーザー            | `explorer` または `play`           |
| パスワード          | (空白)                             |

## Limitations {#limitations}

クエリは読み取り専用ユーザーとして実行されます。これにはいくつかの制限が伴います：

- DDL クエリは許可されていません
- INSERT クエリは許可されていません

このサービスには使用に関するクォータもあります。

## Examples {#examples}

`curl` を使用した HTTPS エンドポイントの例：

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

[CLI](../interfaces/cli.md) を使用した TCP エンドポイントの例：

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```

## Playground specifications {#specifications}

私たちの ClickHouse Playground は、以下の仕様で稼働しています：

- 米国中部地域 (US-Central-1) の Google Cloud (GCE) にホスティング
- 3 レプリカのセットアップ
- 各 256 GiB のストレージと 59 の仮想 CPU
