---
slug: /integrations/dbeaver
sidebar_label: 'DBeaver'
description: 'DBeaver はマルチプラットフォーム対応のデータベースツールです。'
title: 'DBeaver と ClickHouse を接続する'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
  - website: 'https://github.com/dbeaver/dbeaver'
keywords: ['DBeaver', 'database management', 'SQL client', 'JDBC connection', 'multi-platform']
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


# DBeaver を ClickHouse に接続する

<ClickHouseSupportedBadge/>

DBeaver には複数のエディションがあります。このガイドでは [DBeaver Community](https://dbeaver.io/) を使用します。各エディションとその機能については[こちら](https://dbeaver.com/edition/)を参照してください。DBeaver は JDBC を使用して ClickHouse に接続します。

:::note
ClickHouse の `Nullable` 列のサポートが改善された DBeaver バージョン 23.1.0 以降を使用してください。
:::



## 1. ClickHouseの接続情報を準備する {#1-gather-your-clickhouse-details}

DBeaverはHTTP(S)経由のJDBCを使用してClickHouseに接続します。次の情報が必要です:

- エンドポイント
- ポート番号
- ユーザー名
- パスワード


## 2. DBeaverのダウンロード {#2-download-dbeaver}

DBeaverは https://dbeaver.io/download/ から入手できます。


## 3. データベースを追加する {#3-add-a-database}

- **Database > New Database Connection**メニュー、または**Database Navigator**の**New Database Connection**アイコンを使用して、**Connect to a database**ダイアログを表示します：

<Image img={dbeaver_add_database} size='md' border alt='新しいデータベースを追加' />

- **Analytical**を選択し、次に**ClickHouse**を選択します：

- JDBC URLを構築します。**Main**タブでHost、Port、Username、Password、Databaseを設定します：

<Image
  img={dbeaver_host_port}
  size='md'
  border
  alt='ホスト名、ポート、ユーザー、パスワード、データベース名を設定'
/>

- デフォルトでは**SSL > Use SSL**プロパティは未設定です。ClickHouse CloudまたはHTTPポートでSSLが必要なサーバーに接続する場合は、**SSL > Use SSL**をオンに設定します：

<Image img={dbeaver_use_ssl} size='md' border alt='必要に応じてSSLを有効化' />

- 接続をテストします：

<Image
  img={dbeaver_test_connection}
  size='md'
  border
  alt='接続をテスト'
/>

DBeaverがClickHouseドライバーがインストールされていないことを検出すると、ダウンロードを提案します：

<Image
  img={dbeaver_download_driver}
  size='md'
  border
  alt='ClickHouseドライバーをダウンロード'
/>

- ドライバーをダウンロードした後、再度接続を**テスト**します：

<Image
  img={dbeaver_test_connection}
  size='md'
  border
  alt='接続をテスト'
/>


## 4. ClickHouseへのクエリ実行 {#4-query-clickhouse}

クエリエディタを開いてクエリを実行します。

- 接続を右クリックし、**SQL Editor > Open SQL Script**を選択してクエリエディタを開きます：

<Image img={dbeaver_sql_editor} size='md' border alt='SQLエディタを開く' />

- `system.query_log`に対するクエリの例：

<Image img={dbeaver_query_log_select} size='md' border alt='サンプルクエリ' />


## 次のステップ {#next-steps}

DBeaverの機能については[DBeaver wiki](https://github.com/dbeaver/dbeaver/wiki)を、ClickHouseの機能については[ClickHouseドキュメント](https://clickhouse.com/docs)を参照してください。
