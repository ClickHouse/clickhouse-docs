---
slug: /integrations/qstudio
sidebar_label: QStudio
description: QStudioは無料のSQLツールです。
---
import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';

QStudioは無料のSQL GUIで、SQLスクリプトの実行、テーブルの簡単なブラウジング、グラフ作成、結果のエクスポートが可能です。すべてのオペレーティングシステムおよびすべてのデータベースで動作します。


# QStudioをClickHouseに接続する

QStudioはJDBCを使用してClickHouseに接続します。

## 1. ClickHouseの詳細を集める {#1-gather-your-clickhouse-details}

QStudioはHTTP(S)経由でJDBCを使用してClickHouseに接続します。必要な情報は次のとおりです：

- エンドポイント
- ポート番号
- ユーザー名
- パスワード

<ConnectionDetails />

## 2. QStudioをダウンロードする {#2-download-qstudio}

QStudioは https://www.timestored.com/qstudio/download/ で入手できます。

## 3. データベースを追加する {#3-add-a-database}

- QStudioを最初に開いたときに、メニューオプションの **Server->Add Server** をクリックするか、ツールバーの「サーバー追加」ボタンをクリックします。
- 次に、詳細を設定します：

<img src={qstudio_add_connection} alt="新しいデータベースを構成する" />

1.   サーバータイプ: Clickhouse.com
2.   ホストには必ず https:// を含める必要があります。
    ホスト: https://abc.def.clickhouse.cloud
    ポート: 8443
3.   ユーザー名: default
    パスワード: `XXXXXXXXXXX`
4. 「追加」をクリック

QStudioがClickHouse JDBCドライバがインストールされていないことを検出すると、自動的にダウンロードする提案をします：

## 4. ClickHouseにクエリを実行する {#4-query-clickhouse}

- クエリエディタを開いてクエリを実行します。クエリは以下の方法で実行できます：
- Ctrl + e - ハイライトされたテキストを実行
- Ctrl + Enter - 現在の行を実行

- サンプルクエリ：

<img src={qstudio_running_query} alt="サンプルクエリ" />

## 次のステップ {#next-steps}

QStudioの機能については [QStudio](https://www.timestored.com/qstudio) を、ClickHouseの機能については [ClickHouseのドキュメント](https://clickhouse.com/docs) を参照してください。
