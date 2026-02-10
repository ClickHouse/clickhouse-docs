---
slug: /integrations/qstudio
sidebar_label: 'QStudio'
description: 'QStudio は無料の SQL ツールです。'
title: 'QStudio を ClickHouse に接続する'
doc_type: 'guide'
keywords: ['qstudio', 'SQL クライアント', 'データベースツール', 'クエリツール', 'IDE']
integration:
  - support_level: 'コミュニティ'
  - category: 'sql_client'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# QStudio を ClickHouse に接続する \{#connect-qstudio-to-clickhouse\}

<CommunityMaintainedBadge/>

QStudio は無料で利用できる SQL 向け GUI ツールで、SQL スクリプトの実行、テーブルの簡単な閲覧、チャート表示、結果のエクスポートが可能です。あらゆるオペレーティングシステム上で動作し、あらゆるデータベースに対応します。

QStudio は JDBC を使用して ClickHouse に接続します。

## 1. ClickHouse の詳細情報を収集する \{#1-gather-your-clickhouse-details\}

QStudio は HTTP(S) 経由の JDBC を使用して ClickHouse に接続します。次の情報が必要です。

- エンドポイント
- ポート番号
- ユーザー名
- パスワード

<ConnectionDetails />

## 2. QStudio をダウンロードする \{#2-download-qstudio\}

QStudio は https://www.timestored.com/qstudio/download/ からダウンロードできます。

## 3. データベースを追加する \{#3-add-a-database\}

- 初めて QStudio を開いたら、メニューの **Server -> Add Server** をクリックするか、ツールバーの Add Server ボタンをクリックします。
- 次に、以下の内容を設定します:

<Image img={qstudio_add_connection} size="lg" border alt="ClickHouse 接続設定を示す QStudio データベース接続設定画面" />

1.   Server Type: Clickhouse.com
2.    Host には必ず `https://` を含めてください
    Host: https://abc.def.clickhouse.cloud
    Port: 8443
3.  Username: default  
    Password: `XXXXXXXXXXX`
 4. Add をクリックします

QStudio が ClickHouse JDBC ドライバー未インストールであることを検出した場合、ドライバーのダウンロードを提案します。

## 4. ClickHouse をクエリする \{#4-query-clickhouse\}

- クエリエディタを開き、以下のショートカットキーでクエリを実行します。
- Ctrl + e - 選択中のテキストを実行
- Ctrl + Enter - 現在の行を実行

- クエリの例:

<Image img={qstudio_running_query} size="lg" border alt="QStudio インターフェイスで ClickHouse データベースに対してサンプルの SQL クエリを実行している様子" />

## 次のステップ \{#next-steps\}

QStudio の機能については [QStudio](https://www.timestored.com/qstudio) を、ClickHouse の機能については [ClickHouse ドキュメント](https://clickhouse.com/docs) を参照してください。