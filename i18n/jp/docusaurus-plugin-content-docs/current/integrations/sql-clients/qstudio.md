---
'slug': '/integrations/qstudio'
'sidebar_label': 'QStudio'
'description': 'QStudioは無料のSQLツールです。'
'title': 'QStudioをClickHouseに接続する'
'doc_type': 'guide'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Connect QStudio to ClickHouse

<CommunityMaintainedBadge/>

QStudioは無料のSQL GUIで、SQLスクリプトの実行、テーブルのブラウジング、グラフ作成、結果のエクスポートを簡単に行うことができます。すべてのオペレーティングシステムおよびすべてのデータベースで動作します。

QStudioはJDBCを使用してClickHouseに接続します。

## 1. Gather your ClickHouse details {#1-gather-your-clickhouse-details}

QStudioはHTTP(S)経由のJDBCを使用してClickHouseに接続します。必要な情報は以下の通りです：

- エンドポイント
- ポート番号
- ユーザー名
- パスワード

<ConnectionDetails />

## 2. Download QStudio {#2-download-qstudio}

QStudioは https://www.timestored.com/qstudio/download/ から入手できます。

## 3. Add a database {#3-add-a-database}

- QStudioを初めて開いたとき、メニューオプションで **Server->Add Server** をクリックするか、ツールバーのサーバー追加ボタンをクリックします。
- 次に、詳細を設定します：

<Image img={qstudio_add_connection} size="lg" border alt="QStudioデータベース接続設定画面でClickHouseの接続設定が表示されています" />

1.   サーバータイプ: Clickhouse.com
2.    ホストには必ず https:// を含める必要があります
    ホスト: https://abc.def.clickhouse.cloud
    ポート: 8443
3.  ユーザー名: default
    パスワード: `XXXXXXXXXXX`
 4. [追加]をクリックします。

QStudioがClickHouse JDBCドライバーがインストールされていないことを検出した場合、自動的にダウンロードするオプションが表示されます：

## 4. Query ClickHouse {#4-query-clickhouse}

- クエリエディタを開いてクエリを実行します。クエリは以下のように実行できます：
- Ctrl + e - ハイライトされたテキストを実行
- Ctrl + Enter - 現在の行を実行

- 例のクエリ：

<Image img={qstudio_running_query} size="lg" border alt="QStudioインターフェースにClickHouseデータベースに対するサンプルSQLクエリの実行が表示されています" />

## Next steps {#next-steps}

QStudioについての詳細は [QStudio](https://www.timestored.com/qstudio) を確認し、ClickHouseの機能については [ClickHouse documentation](https://clickhouse.com/docs) を参照してください。
