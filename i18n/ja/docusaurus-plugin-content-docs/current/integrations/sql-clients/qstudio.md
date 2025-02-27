---
slug: /integrations/qstudio
sidebar_label: QStudio
description: QStudioは無料のSQLツールです。
---
import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';

QStudioは無料のSQL GUIで、SQLスクリプトの実行、テーブルの簡単な閲覧、チャート作成、結果のエクスポートが可能です。すべてのオペレーティングシステムおよびすべてのデータベースで動作します。

# QStudioをClickHouseに接続する

QStudioはJDBCを使用してClickHouseに接続します。

## 1. ClickHouseの詳細を収集する {#1-gather-your-clickhouse-details}

QStudioはHTTP(S)経由のJDBCを使用してClickHouseに接続します。必要な情報は:

- エンドポイント
- ポート番号
- ユーザー名
- パスワード

<ConnectionDetails />

## 2. QStudioをダウンロードする {#2-download-qstudio}

QStudioはhttps://www.timestored.com/qstudio/download/で入手できます。

## 3. データベースを追加する {#3-add-a-database}

- QStudioを初めて開いたときに、メニューオプション **Server->Add Server** をクリックするか、ツールバーのサーバー追加ボタンをクリックします。
- 次に、詳細を設定します:

![新しいデータベースの設定](./images/qstudio-add-connection.png)

1. サーバータイプ: Clickhouse.com
2. ホストには必ずhttps://を含めること
    ホスト: https://abc.def.clickhouse.cloud
    ポート: 8443
3. ユーザー名: default
    パスワード: `XXXXXXXXXXX`
4. 追加をクリック

もしQStudioがClickHouse JDBCドライバーがインストールされていないことを検出した場合、ダウンロードを提案します。

## 4. ClickHouseにクエリを実行する {#4-query-clickhouse}

- クエリエディタを開いてクエリを実行します。クエリを実行するには 
- Ctrl + e - ハイライトされたテキストを実行
- Ctrl + Enter - 現在の行を実行

- 例のクエリ:

  ![サンプルクエリ](./images/qstudio-running-query.png)

## 次のステップ {#next-steps}

QStudioの機能については[QStudio](https://www.timestored.com/qstudio)を参照し、ClickHouseの機能については[ClickHouseドキュメント](https://clickhouse.com/docs)を参照してください。
