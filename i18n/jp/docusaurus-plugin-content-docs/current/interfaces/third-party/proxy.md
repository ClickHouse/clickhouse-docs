---
'description': 'ClickHouseのための利用可能なサードパーティプロキシソリューションについて説明します'
'sidebar_label': 'Proxies'
'sidebar_position': 29
'slug': '/interfaces/third-party/proxy'
'title': 'サードパーティ開発者からのプロキシサーバー'
'doc_type': 'reference'
---


# サードパーティ開発者によるプロキシサーバー

## chproxy {#chproxy}

[chproxy](https://github.com/Vertamedia/chproxy) は、ClickHouseデータベース用のHTTPプロキシおよびロードバランサーです。

特徴:

- ユーザーごとのルーティングとレスポンスキャッシュ。
- 柔軟な制限。
- 自動SSL証明書の更新。

Goで実装されています。

## KittenHouse {#kittenhouse}

[KittenHouse](https://github.com/VKCOM/kittenhouse) は、ClickHouseとアプリケーションサーバーの間のローカルプロキシとして設計されており、アプリケーション側でINSERTデータをバッファリングすることが不可能または不便な場合に使用されます。

特徴:

- メモリ内およびディスク上のデータバッファリング。
- テーブルごとのルーティング。
- ロードバランシングとヘルスチェック。

Goで実装されています。

## ClickHouse-Bulk {#clickhouse-bulk}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk) は、シンプルなClickHouse挿入コレクターです。

特徴:

- リクエストをグループ化し、しきい値または間隔で送信。
- 複数のリモートサーバー。
- 基本的な認証。

Goで実装されています。
