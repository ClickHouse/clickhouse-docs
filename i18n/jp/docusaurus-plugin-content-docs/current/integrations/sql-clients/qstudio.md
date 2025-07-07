---
'slug': '/integrations/qstudio'
'sidebar_label': 'QStudio'
'description': 'QStudio is a free SQL tool.'
'title': 'Connect QStudio to ClickHouse'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Connect QStudio to ClickHouse

<CommunityMaintainedBadge/>

QStudioは無料のSQL GUIで、SQLスクリプトの実行、テーブルの簡単なブラウジング、チャートの作成、結果のエクスポートを可能にします。すべてのオペレーティングシステムおよびすべてのデータベースで動作します。

QStudioはJDBCを使用してClickHouseに接続します。

## 1. Gather your ClickHouse details {#1-gather-your-clickhouse-details}

QStudioはHTTP(S)経由でJDBCを使用してClickHouseに接続します。必要な情報は次のとおりです：

- エンドポイント
- ポート番号
- ユーザー名
- パスワード

<ConnectionDetails />

## 2. Download QStudio {#2-download-qstudio}

QStudioは https://www.timestored.com/qstudio/download/ から入手できます。

## 3. Add a database {#3-add-a-database}

- QStudioを初めて開いたとき、メニューオプションの**サーバー->サーバーの追加**をクリックするか、ツールバーのサーバーの追加ボタンをクリックします。
- 次に、詳細を設定します：

<Image img={qstudio_add_connection} size="lg" border alt="QStudioデータベース接続設定画面でClickHouse接続設定を表示" />

1.   サーバータイプ: Clickhouse.com
2.    ホストには必ずhttps://を含めてください
    ホスト: https://abc.def.clickhouse.cloud
    ポート: 8443
3.  ユーザー名: default
    パスワード: `XXXXXXXXXXX`
 4. 追加をクリック

QStudioがClickHouseのJDBCドライバーがインストールされていないことを検出した場合、ダウンロードを提案します：

## 4. Query ClickHouse {#4-query-clickhouse}

- クエリエディタを開いてクエリを実行します。クエリを実行する方法は次のとおりです：
- Ctrl + e - ハイライトされたテキストを実行
- Ctrl + Enter - 現在の行を実行

- 例のクエリ：

<Image img={qstudio_running_query} size="lg" border alt="QStudioインターフェースがClickHouseデータベースに対するサンプルSQLクエリの実行を表示" />

## Next Steps {#next-steps}

[QStudio](https://www.timestored.com/qstudio)を参照してQStudioの機能について学び、[ClickHouse documentation](https://clickhouse.com/docs)を参照してClickHouseの機能について学びましょう。
