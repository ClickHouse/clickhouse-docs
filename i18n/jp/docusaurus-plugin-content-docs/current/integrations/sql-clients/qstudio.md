---
slug: /integrations/qstudio
sidebar_label: 'QStudio'
description: 'QStudio は無料の SQL ツールです。'
title: 'QStudio を ClickHouse に接続する'
doc_type: 'guide'
keywords: ['qstudio', 'SQLクライアント', 'データベースツール', 'クエリツール', 'IDE']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# QStudio を ClickHouse に接続する

<CommunityMaintainedBadge/>

QStudio は無料の SQL GUI ツールであり、SQL スクリプトの実行、テーブルの簡単な参照、グラフ表示および結果のエクスポートを行うことができます。あらゆるオペレーティングシステム上で動作し、あらゆるデータベースに対応しています。

QStudio は JDBC を使用して ClickHouse に接続します。



## 1. ClickHouseの接続情報を準備する {#1-gather-your-clickhouse-details}

QStudioはHTTP(S)経由のJDBCを使用してClickHouseに接続します。次の情報が必要です:

- エンドポイント
- ポート番号
- ユーザー名
- パスワード

<ConnectionDetails />


## 2. QStudioのダウンロード {#2-download-qstudio}

QStudioは https://www.timestored.com/qstudio/download/ から入手できます。


## 3. データベースを追加する {#3-add-a-database}

- QStudioを初めて開く際は、メニューオプションの**Server->Add Server**をクリックするか、ツールバーのサーバー追加ボタンをクリックしてください。
- 次に、以下の詳細を設定します:

<Image
  img={qstudio_add_connection}
  size='lg'
  border
  alt='ClickHouse接続設定を表示するQStudioデータベース接続構成画面'
/>

1.  Server Type: Clickhouse.com
2.  注意: Hostにはhttps://を必ず含めてください
    Host: https://abc.def.clickhouse.cloud
    Port: 8443
3.  Username: default
    Password: `XXXXXXXXXXX`
4.  Addをクリック

QStudioがClickHouse JDBCドライバーがインストールされていないことを検出すると、ダウンロードを提案します:


## 4. ClickHouseへのクエリ実行 {#4-query-clickhouse}

- クエリエディタを開き、クエリを実行します。クエリは以下の方法で実行できます
- Ctrl + e - 選択したテキストを実行
- Ctrl + Enter - 現在の行を実行

- クエリの例:

<Image
  img={qstudio_running_query}
  size='lg'
  border
  alt='ClickHouseデータベースに対するサンプルSQLクエリの実行を示すQStudioインターフェース'
/>


## 次のステップ {#next-steps}

QStudioの機能については[QStudio](https://www.timestored.com/qstudio)を、ClickHouseの機能については[ClickHouseドキュメント](https://clickhouse.com/docs)を参照してください。
