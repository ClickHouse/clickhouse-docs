---
'slug': '/integrations/dbeaver'
'sidebar_label': 'DBeaver'
'description': 'DBeaverはマルチプラットフォームのDATABASEツールです。'
'title': 'DBeaverをClickHouseに接続する'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import dbeaver_add_database from '@site/static/images/integrations/sql-clients/dbeaver-add-database.png';
import dbeaver_host_port from '@site/static/images/integrations/sql-clients/dbeaver-host-port.png';
import dbeaver_use_ssl from '@site/static/images/integrations/sql-clients/dbeaver-use-ssl.png';
import dbeaver_test_connection from '@site/static/images/integrations/sql-clients/dbeaver-test-connection.png';
import dbeaver_download_driver from '@site/static/images/integrations/sql-clients/dbeaver-download-driver.png';
import dbeaver_sql_editor from '@site/static/images/integrations/sql-clients/dbeaver-sql-editor.png';
import dbeaver_query_log_select from '@site/static/images/integrations/sql-clients/dbeaver-query-log-select.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Connect DBeaver to ClickHouse

<ClickHouseSupportedBadge/>

DBeaverは複数のバージョンで利用可能です。このガイドでは [DBeaver Community](https://dbeaver.io/) を使用します。さまざまなバージョンと機能については [こちら](https://dbeaver.com/edition/) をご覧ください。 DBeaverはJDBCを使用してClickHouseに接続します。

:::note
ClickHouseの`Nullable`カラムのサポートを改善するために、DBeaverのバージョン23.1.0以上を使用してください。
:::

## 1. Gather your ClickHouse details {#1-gather-your-clickhouse-details}

DBeaverはHTTP(S)経由でJDBCを使用してClickHouseに接続します。必要な情報は以下の通りです：

- エンドポイント
- ポート番号
- ユーザー名
- パスワード

## 2. Download DBeaver {#2-download-dbeaver}

DBeaverは https://dbeaver.io/download/ からダウンロードできます。

## 3. Add a database {#3-add-a-database}

- **Database > New Database Connection** メニューまたは **Database Navigator** の **New Database Connection** アイコンを使用して **Connect to a database** ダイアログを表示します：

<Image img={dbeaver_add_database} size="md" border alt="Add a new database" />

- **Analytical** を選択し、次に **ClickHouse** を選択します：

- JDBC URLを構築します。**Main** タブでホスト、ポート、ユーザー名、パスワード、データベースを設定します：

<Image img={dbeaver_host_port} size="md" border alt="Set the hostname, port, user, password, and database name" />

- デフォルトでは **SSL > Use SSL** プロパティは未設定ですが、ClickHouse CloudまたはHTTPポートでSSLが必要なサーバーに接続する場合は、**SSL > Use SSL** をオンにします：

<Image img={dbeaver_use_ssl} size="md" border alt="Enable SSL if required" />

- 接続をテストします：

<Image img={dbeaver_test_connection} size="md" border alt="Test the connection" />

DBeaverがClickHouseドライバーがインストールされていないことを検出した場合は、ダウンロードを提案します：

<Image img={dbeaver_download_driver} size="md" border alt="Download the ClickHouse driver" />

- ドライバーをダウンロードした後、再度接続を **Test** します：

<Image img={dbeaver_test_connection} size="md" border alt="Test the connection" />

## 4. Query ClickHouse {#4-query-clickhouse}

クエリエディタを開いてクエリを実行します。

- 接続を右クリックし、**SQL Editor > Open SQL Script** を選択してクエリエディタを開きます：

<Image img={dbeaver_sql_editor} size="md" border alt="Open the SQL editor" />

- `system.query_log` に対する例のクエリ：

<Image img={dbeaver_query_log_select} size="md" border alt="A sample query" />

## Next steps {#next-steps}

DBeaverの機能については [DBeaver wiki](https://github.com/dbeaver/dbeaver/wiki) を、ClickHouseの機能については [ClickHouse documentation](https://clickhouse.com/docs) をご覧ください。
