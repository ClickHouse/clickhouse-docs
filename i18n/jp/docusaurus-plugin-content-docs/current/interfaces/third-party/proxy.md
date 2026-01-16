---
description: 'ClickHouse 向けに利用可能なサードパーティ製プロキシソリューションについて説明します'
sidebar_label: 'プロキシ'
sidebar_position: 29
slug: /interfaces/third-party/proxy
title: 'サードパーティ製プロキシサーバー'
doc_type: 'reference'
---

# サードパーティ開発のプロキシサーバー \{#proxy-servers-from-third-party-developers\}

## chproxy \{#chproxy\}

[chproxy](https://github.com/Vertamedia/chproxy) は、ClickHouse データベース向けの HTTP プロキシ兼ロードバランサーです。

機能:

- ユーザー単位のルーティングおよびレスポンスのキャッシュ。
- 柔軟な制限設定。
- SSL 証明書の自動更新。

Go で実装されています。

## KittenHouse \{#kittenhouse\}

[KittenHouse](https://github.com/VKCOM/kittenhouse) は、アプリケーション側で INSERT データをバッファリングすることができない、あるいは不便な場合に、ClickHouse とアプリケーションサーバーとの間に位置するローカルプロキシとして設計されています。

機能:

- メモリ内およびディスク上でのデータバッファリング
- テーブル単位のルーティング
- 負荷分散およびヘルスチェック

Go で実装されています。

## ClickHouse-Bulk \{#clickhouse-bulk\}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk) は、ClickHouse への INSERT をまとめて処理するシンプルなコレクターです。

機能:

- リクエストをグループ化し、しきい値または一定間隔で送信。
- 複数のリモートサーバーに対応。
- ベーシック認証に対応。

Go 言語で実装されています。
