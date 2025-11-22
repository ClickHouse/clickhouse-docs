---
description: 'ClickHouse 向けに利用可能なサードパーティ製プロキシソリューションについて説明します'
sidebar_label: 'プロキシ'
sidebar_position: 29
slug: /interfaces/third-party/proxy
title: 'サードパーティ開発者によるプロキシサーバー'
doc_type: 'reference'
---



# サードパーティ製のプロキシサーバー



## chproxy {#chproxy}

[chproxy](https://github.com/Vertamedia/chproxy)は、ClickHouseデータベース用のHTTPプロキシおよびロードバランサーです。

機能:

- ユーザーごとのルーティングとレスポンスキャッシング。
- 柔軟な制限設定。
- SSL証明書の自動更新。

Go言語で実装されています。


## KittenHouse {#kittenhouse}

[KittenHouse](https://github.com/VKCOM/kittenhouse)は、アプリケーション側でINSERTデータのバッファリングが困難または不便な場合に、ClickHouseとアプリケーションサーバー間のローカルプロキシとして動作するように設計されています。

機能:

- メモリ内およびディスク上でのデータバッファリング
- テーブル単位のルーティング
- 負荷分散とヘルスチェック

Go言語で実装されています。


## ClickHouse-Bulk {#clickhouse-bulk}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk)は、シンプルなClickHouse挿入データ収集ツールです。

機能:

- リクエストをグループ化し、閾値または時間間隔に基づいて送信
- 複数のリモートサーバーに対応
- 基本認証に対応

Go言語で実装されています。
