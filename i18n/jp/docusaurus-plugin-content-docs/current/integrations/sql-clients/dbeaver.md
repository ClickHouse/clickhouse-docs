---
slug: /integrations/dbeaver
sidebar_label: 'DBeaver'
description: 'DBeaver はマルチプラットフォームのデータベースツールです。'
title: 'DBeaver を ClickHouse に接続する'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'sql_client'
  - website: 'https://github.com/dbeaver/dbeaver'
keywords: ['DBeaver', 'データベース管理', 'SQL クライアント', 'JDBC 接続', 'マルチプラットフォーム']
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


# DBeaver を ClickHouse に接続する {#connect-dbeaver-to-clickhouse}

<ClickHouseSupportedBadge/>

DBeaver には複数のエディションがあります。このガイドでは [DBeaver Community](https://dbeaver.io/) を使用します。さまざまなエディションと機能については [こちら](https://dbeaver.com/edition/) を参照してください。DBeaver は JDBC を使用して ClickHouse に接続します。

:::note
ClickHouse の `Nullable` 列に対するサポートが改善されているため、DBeaver バージョン 23.1.0 以降を使用してください。
:::



## 1. ClickHouse の情報を確認する {#1-gather-your-clickhouse-details}

DBeaver は JDBC を HTTP(S) 経由で使用して ClickHouse に接続します。接続には次の情報が必要です。

- エンドポイント
- ポート番号
- ユーザー名
- パスワード



## 2. DBeaver をダウンロードする {#2-download-dbeaver}

DBeaver は https://dbeaver.io/download/ からダウンロードできます。



## 3. データベースを追加する {#3-add-a-database}

- **Database > New Database Connection** メニュー、または **Database Navigator** 内の **New Database Connection** アイコンを使用して、**Connect to a database** ダイアログを表示します。

<Image img={dbeaver_add_database} size="md" border alt="新しいデータベースを追加する" />

- **Analytical** を選択し、続いて **ClickHouse** を選択します。

- JDBC URL を構成します。**Main** タブで Host、Port、Username、Password、Database を設定します。

<Image img={dbeaver_host_port} size="md" border alt="ホスト名、ポート、ユーザー、パスワード、およびデータベース名を設定する" />

- 既定では **SSL > Use SSL** プロパティはオフになっています。ClickHouse Cloud や、HTTP ポートで SSL が必須のサーバーに接続する場合は、**SSL > Use SSL** をオンにします。

<Image img={dbeaver_use_ssl} size="md" border alt="必要に応じて SSL を有効にする" />

- 接続をテストします。

<Image img={dbeaver_test_connection} size="md" border alt="接続をテストする" />

DBeaver が ClickHouse ドライバーがインストールされていないことを検出した場合、ドライバーのダウンロードを求められます。

<Image img={dbeaver_download_driver} size="md" border alt="ClickHouse ドライバーをダウンロードする" />

- ドライバーをダウンロードした後、再度 **Test** で接続をテストします。

<Image img={dbeaver_test_connection} size="md" border alt="接続をテストする" />



## 4. ClickHouse をクエリする {#4-query-clickhouse}

クエリ エディタを開いてクエリを実行します。

- 接続を右クリックして **SQL Editor > Open SQL Script** を選択し、クエリ エディタを開きます：

<Image img={dbeaver_sql_editor} size="md" border alt="SQL エディタを開く" />

- `system.query_log` に対するクエリの例：

<Image img={dbeaver_query_log_select} size="md" border alt="サンプルクエリ" />



## 次のステップ {#next-steps}

DBeaver の機能については [DBeaver wiki](https://github.com/dbeaver/dbeaver/wiki) を、ClickHouse の機能については [ClickHouse documentation](https://clickhouse.com/docs) を参照してください。
