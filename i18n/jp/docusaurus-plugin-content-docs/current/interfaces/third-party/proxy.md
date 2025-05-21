---
description: 'ClickHouseのための利用可能なサードパーティプロキシソリューションについて説明します'
sidebar_label: 'プロキシ'
sidebar_position: 29
slug: /interfaces/third-party/proxy
title: 'サードパーティ開発者によるプロキシサーバー'
---


# サードパーティ開発者によるプロキシサーバー

## chproxy {#chproxy}

[chproxy](https://github.com/Vertamedia/chproxy) は、ClickHouseデータベースのためのHTTPプロキシおよびロードバランサーです。

特徴:

- ユーザーごとのルーティングとレスポンスキャッシュ。
- 柔軟な制限。
- 自動SSL証明書更新。

Goで実装されています。

## KittenHouse {#kittenhouse}

[KittenHouse](https://github.com/VKCOM/kittenhouse) は、INSERTデータをアプリケーション側でバッファリングすることが不可能または不便な場合に、ClickHouseとアプリケーションサーバーの間のローカルプロキシとして設計されています。

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
