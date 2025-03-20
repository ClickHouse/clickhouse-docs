---
slug: /interfaces/third-party/proxy
sidebar_position: 29
sidebar_label: プロキシ
---


# サードパーティ開発者のプロキシサーバー

## chproxy {#chproxy}

[chproxy](https://github.com/Vertamedia/chproxy) は、ClickHouseデータベース用のHTTPプロキシおよびロードバランサーです。

特徴:

- ユーザー毎のルーティングとレスポンスキャッシュ。
- 柔軟な制限。
- 自動SSL証明書更新。

Goで実装されています。

## KittenHouse {#kittenhouse}

[KittenHouse](https://github.com/VKCOM/kittenhouse) は、アプリケーション側でINSERTデータをバッファリングすることが不可能または不便な場合に、ClickHouseとアプリケーションサーバーの間のローカルプロキシとして設計されています。

特徴:

- メモリ内およびディスク上のデータバッファリング。
- テーブル毎のルーティング。
- ロードバランシングとヘルスチェック。

Goで実装されています。

## ClickHouse-Bulk {#clickhouse-bulk}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk) は、シンプルなClickHouse挿入コレクターです。

特徴:

- リクエストをグループ化し、閾値またはインターバルで送信。
- 複数のリモートサーバー。
- 基本認証。

Goで実装されています。
