---
slug: /integrations/qstudio
sidebar_label: 'QStudio'
description: 'QStudio は無料の SQL ツールです。'
title: 'QStudio を ClickHouse に接続する'
doc_type: 'guide'
keywords: ['qstudio', 'SQL クライアント', 'データベース ツール', 'クエリ ツール', 'IDE']
integration:
  - support_level: 'community'
  - category: 'sql_client'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# QStudio を ClickHouse に接続する \{#connect-qstudio-to-clickhouse\}

<CommunityMaintainedBadge/>

QStudio は無償の SQL 向け GUI ツールであり、SQL スクリプトの実行、テーブルの簡単な参照、チャートの作成、結果のエクスポートが可能です。すべてのオペレーティングシステム上で動作し、あらゆるデータベースと連携できます。

QStudio は JDBC を使用して ClickHouse に接続します。

## 1. ClickHouse の情報を収集する \{#1-gather-your-clickhouse-details\}

QStudio は JDBC over HTTP(S) を使用して ClickHouse に接続します。そのため、次の情報が必要です。

- エンドポイント
- ポート番号
- ユーザー名
- パスワード

<ConnectionDetails />

## 2. QStudio をダウンロードする \{#2-download-qstudio\}

QStudio は https://www.timestored.com/qstudio/download/ からダウンロードできます。

## 3. データベースを追加する \{#3-add-a-database\}

- QStudio を初めて開いたら、メニューオプション **Server->Add Server** をクリックするか、ツールバーの **Add Server** ボタンをクリックします。
- 次に、以下の詳細を設定します:

<Image img={qstudio_add_connection} size="lg" border alt="ClickHouse 接続設定を表示している QStudio のデータベース接続設定画面" />

1.   Server Type: ClickHouse.com
2.    Host には必ず https:// を含める必要があります
    Host: https://abc.def.clickhouse.cloud
    Port: 8443
3.  Username: default
    Password: `XXXXXXXXXXX`
 4. Add をクリックします

QStudio が ClickHouse JDBC ドライバーがインストールされていないことを検出した場合、ドライバーのダウンロードを提案します。

## 4. ClickHouse にクエリを実行する \{#4-query-clickhouse\}

- クエリエディタを開き、以下のいずれかの方法でクエリを実行します。
- Ctrl + e - 選択中のテキストを実行
- Ctrl + Enter - 現在の行を実行

- クエリの例:

<Image img={qstudio_running_query} size="lg" border alt="ClickHouse データベースに対してサンプル SQL クエリを実行している QStudio インターフェース" />

## 次のステップ \{#next-steps\}

QStudio の機能については [QStudio](https://www.timestored.com/qstudio) を、ClickHouse の機能については [ClickHouse ドキュメント](https://clickhouse.com/docs) をそれぞれ参照してください。