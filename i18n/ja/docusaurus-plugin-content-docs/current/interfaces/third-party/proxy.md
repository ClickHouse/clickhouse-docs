---
slug: /interfaces/third-party/proxy
sidebar_position: 29
sidebar_label: プロキシ
---

# サードパーティ開発者によるプロキシサーバ

## chproxy {#chproxy}

[chproxy](https://github.com/Vertamedia/chproxy) は、ClickHouseデータベース用のHTTPプロキシおよびロードバランサです。

特徴:

- ユーザーごとのルーティングとレスポンスキャッシング。
- 柔軟な制限。
- 自動SSL証明書の更新。

Goで実装されています。

## KittenHouse {#kittenhouse}

[KittenHouse](https://github.com/VKCOM/kittenhouse) は、INSERTデータをアプリケーション側でバッファリングすることが不可能または不便な場合に、ClickHouseとアプリケーションサーバ間のローカルプロキシとして設計されています。

特徴:

- メモリ内およびディスク上のデータバッファリング。
- テーブルごとのルーティング。
- ロードバランシングとヘルスチェック。

Goで実装されています。

## ClickHouse-Bulk {#clickhouse-bulk}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk) は、シンプルなClickHouseインサートコレクタです。

特徴:

- リクエストをグループ化し、しきい値または間隔で送信。
- 複数のリモートサーバ。
- 基本認証。

Goで実装されています。
