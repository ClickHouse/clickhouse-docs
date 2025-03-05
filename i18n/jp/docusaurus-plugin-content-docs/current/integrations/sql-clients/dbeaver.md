---
slug: /integrations/dbeaver
sidebar_label: DBeaver
description: DBeaverはマルチプラットフォームのデータベースツールです。
---

import dbeaver_add_database from '@site/static/images/integrations/sql-clients/dbeaver-add-database.png';
import dbeaver_host_port from '@site/static/images/integrations/sql-clients/dbeaver-host-port.png';
import dbeaver_use_ssl from '@site/static/images/integrations/sql-clients/dbeaver-use-ssl.png';
import dbeaver_test_connection from '@site/static/images/integrations/sql-clients/dbeaver-test-connection.png';
import dbeaver_download_driver from '@site/static/images/integrations/sql-clients/dbeaver-download-driver.png';
import dbeaver_sql_editor from '@site/static/images/integrations/sql-clients/dbeaver-sql-editor.png';
import dbeaver_query_log_select from '@site/static/images/integrations/sql-clients/dbeaver-query-log-select.png';


# DBeaverをClickHouseに接続する

DBeaverは複数の提供形態があります。このガイドでは、[DBeaver Community](https://dbeaver.io/)を使用します。さまざまな提供形態と機能については[こちら](https://dbeaver.com/edition/)をご覧ください。DBeaverはJDBCを使用してClickHouseに接続します。

:::note
ClickHouseでの`Nullable`カラムのサポートを改善するために、DBeaverバージョン23.1.0以上を使用してください。
:::

## 1. ClickHouseの詳細を収集する {#1-gather-your-clickhouse-details}

DBeaverはHTTP(S)経由でJDBCを使用してClickHouseに接続します。必要な情報は以下です：

- エンドポイント
- ポート番号
- ユーザー名
- パスワード

## 2. DBeaverをダウンロードする {#2-download-dbeaver}

DBeaverは https://dbeaver.io/download/ からダウンロードできます。

## 3. データベースを追加する {#3-add-a-database}

- **Database > New Database Connection** メニューまたは **Database Navigator** の **New Database Connection** アイコンを使用して、**Connect to a database** ダイアログを表示します：

<img src={dbeaver_add_database} class="image" alt="新しいデータベースを追加" />

- **Analytical** を選択し、次に **ClickHouse** を選択します：

- JDBC URLを構築します。**Main** タブでHost、Port、Username、Password、およびDatabaseを設定します：

<img src={dbeaver_host_port} class="image" alt="ホスト名、ポート、ユーザー、パスワード、データベース名を設定" />

- デフォルトでは **SSL > Use SSL** プロパティは未設定になります。ClickHouse CloudまたはHTTPポートでSSLが必要なサーバーに接続する場合は、**SSL > Use SSL** をオンにします：

<img src={dbeaver_use_ssl} class="image" alt="必要に応じてSSLを有効にする" />

- 接続をテストします：

<img src={dbeaver_test_connection} class="image" alt="接続をテスト" />

DBeaverがClickHouseドライバーがインストールされていないことを検出した場合、自動的にダウンロードを提案します：

<img src={dbeaver_download_driver} class="image" alt="ClickHouseドライバーをダウンロード" />

- ドライバーをダウンロードした後、再度 **Test** を押して接続をテストします：

<img src={dbeaver_test_connection} class="image" alt="接続をテスト" />

## 4. ClickHouseへクエリを実行する {#4-query-clickhouse}

クエリエディタを開いてクエリを実行します。

- 接続を右クリックし、**SQL Editor > Open SQL Script** を選択してクエリエディタを開きます：

<img src={dbeaver_sql_editor} class="image" alt="SQLエディタを開く" />

- `system.query_log` に対する例のクエリ：

<img src={dbeaver_query_log_select} class="image" alt="サンプルクエリ" />

## 次のステップ {#next-steps}

DBeaverの機能については[ DBeaver wiki](https://github.com/dbeaver/dbeaver/wiki)を、ClickHouseの機能については[ClickHouseのドキュメンテーション](https://clickhouse.com/docs)をご覧ください。
