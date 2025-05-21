---
slug: /integrations/dbeaver
sidebar_label: 'DBeaver'
description: 'DBeaverはマルチプラットフォームのデータベースツールです。'
title: 'DBeaverをClickHouseに接続する'
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


# DBeaverをClickHouseに接続する

<ClickHouseSupportedBadge/>

DBeaverは複数のオファリングで利用可能です。このガイドでは [DBeaver Community](https://dbeaver.io/) を使用します。さまざまなオファリングと機能については[こちら](https://dbeaver.com/edition/)を参照してください。 DBeaverはJDBCを使用してClickHouseに接続します。

:::note
ClickHouseにおける`Nullable`カラムのサポート向上のために、DBeaverのバージョン23.1.0以上を使用してください。
:::

## 1. ClickHouseの詳細を収集する {#1-gather-your-clickhouse-details}

DBeaverはHTTP(S)経由でJDBCを使用してClickHouseに接続します。必要な情報は次のとおりです：

- エンドポイント
- ポート番号
- ユーザー名
- パスワード

## 2. DBeaverをダウンロードする {#2-download-dbeaver}

DBeaverは https://dbeaver.io/download/ で入手できます。

## 3. データベースを追加する {#3-add-a-database}

- **Database > New Database Connection** メニューまたは **Database Navigator** の **New Database Connection** アイコンを使用して、 **Connect to a database** ダイアログを表示させます：

<Image img={dbeaver_add_database} size="md" border alt="新しいデータベースを追加" />

- **Analytical** を選択し、次に **ClickHouse** を選択します：

- JDBC URLを構築します。 **Main** タブでホスト、ポート、ユーザー名、パスワード、データベースを設定します：

<Image img={dbeaver_host_port} size="md" border alt="ホスト名、ポート、ユーザー、パスワード、およびデータベース名を設定" />

- デフォルトでは **SSL > Use SSL** プロパティが未設定になっています。ClickHouse CloudやHTTPポートでSSLが必要なサーバーに接続する場合は、 **SSL > Use SSL** をオンにします：

<Image img={dbeaver_use_ssl} size="md" border alt="必要に応じてSSLを有効化" />

- 接続をテストします：

<Image img={dbeaver_test_connection} size="md" border alt="接続をテスト" />

DBeaverがClickHouseドライバーがインストールされていないことを検出すると、自動的にダウンロードするオプションが表示されます：

<Image img={dbeaver_download_driver} size="md" border alt="ClickHouseドライバーをダウンロード" />

- ドライバーをダウンロードした後、再度接続を**テスト**します：

<Image img={dbeaver_test_connection} size="md" border alt="接続をテスト" />

## 4. ClickHouseにクエリを実行する {#4-query-clickhouse}

クエリエディターを開き、クエリを実行します。

- 接続を右クリックし、 **SQL Editor > Open SQL Script** を選択してクエリエディターを開きます：

<Image img={dbeaver_sql_editor} size="md" border alt="SQLエディターを開く" />

- `system.query_log` に対するサンプルクエリ：

<Image img={dbeaver_query_log_select} size="md" border alt="サンプルクエリ" />

## 次のステップ {#next-steps}

DBeaverの機能については [DBeaver wiki](https://github.com/dbeaver/dbeaver/wiki) を参照し、ClickHouseの機能については [ClickHouseドキュメント](https://clickhouse.com/docs) を参照してください。
