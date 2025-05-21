---
slug: /integrations/qstudio
sidebar_label: 'QStudio'
description: 'QStudioは無料のSQLツールです。'
title: 'QStudioをClickHouseに接続する'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# QStudioをClickHouseに接続する

<CommunityMaintainedBadge/>

QStudioは無料のSQL GUIで、SQLスクリプトの実行、テーブルの簡単なブラウジング、結果のチャート作成およびエクスポートを可能にします。すべてのオペレーティングシステムとすべてのデータベースで動作します。

QStudioはJDBCを使用してClickHouseに接続します。

## 1. ClickHouseの詳細を収集する {#1-gather-your-clickhouse-details}

QStudioはHTTP(S)経由でJDBCを使用してClickHouseに接続します。必要な情報は以下の通りです：

- エンドポイント
- ポート番号
- ユーザー名
- パスワード

<ConnectionDetails />

## 2. QStudioをダウンロードする {#2-download-qstudio}

QStudioは https://www.timestored.com/qstudio/download/ で入手できます。

## 3. データベースを追加する {#3-add-a-database}

- QStudioを初めて開いたときに、メニューオプション **Server->Add Server** をクリックするか、ツールバーの追加サーバーボタンをクリックします。
- 次に、詳細を設定します：

<Image img={qstudio_add_connection} size="lg" border alt="ClickHouse接続設定を示すQStudioのデータベース接続構成画面" />

1.   サーバータイプ: Clickhouse.com
2.    ホストの注意点：必ず https:// を含めてください
    ホスト: https://abc.def.clickhouse.cloud
    ポート: 8443
3.  ユーザー名: default
    パスワード: `XXXXXXXXXXX`
4.  追加をクリック

QStudioがClickHouseのJDBCドライバーがインストールされていないことを検出した場合、ダウンロードを提案します：

## 4. ClickHouseにクエリを実行する {#4-query-clickhouse}

- クエリエディタを開いてクエリを実行します。クエリを実行する方法は以下の通りです：
- Ctrl + e - ハイライトされたテキストを実行
- Ctrl + Enter - 現在の行を実行

- 例のクエリ：

<Image img={qstudio_running_query} size="lg" border alt="ClickHouseデータベースに対するサンプルSQLクエリの実行を示すQStudioインターフェース" />

## 次のステップ {#next-steps}

[QStudio](https://www.timestored.com/qstudio)を参照してQStudioの機能について学び、[ClickHouseのドキュメント](https://clickhouse.com/docs)を参照してClickHouseの機能について学んでください。
