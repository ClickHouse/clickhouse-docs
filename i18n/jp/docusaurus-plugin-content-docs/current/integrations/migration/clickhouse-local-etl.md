---
sidebar_label: 'clickhouse-local の使用'
sidebar_position: 20
keywords:
- 'clickhouse'
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'clickhouse-local'
- 'clickhouse-client'
slug: '/cloud/migration/clickhouse-local'
title: 'ClickHouse を使用して clickhouse-local に移行する'
description: 'clickhouse-local を使用して ClickHouse に移行する方法を示すガイド'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import AddARemoteSystem from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import ch_local_01 from '@site/static/images/integrations/migration/ch-local-01.png';
import ch_local_02 from '@site/static/images/integrations/migration/ch-local-02.png';
import ch_local_03 from '@site/static/images/integrations/migration/ch-local-03.png';
import ch_local_04 from '@site/static/images/integrations/migration/ch-local-04.png';


# ClickHouseへの移行方法：clickhouse-localを使用する

<Image img={ch_local_01} size='sm' alt='セルフマネージドClickHouseの移行' background='white' />

ClickHouse、より具体的には[`clickhouse-local`](/operations/utilities/clickhouse-local.md)をETLツールとして利用して、現在のデータベースシステムからClickHouse Cloudへデータを移行できます。ただし、現在のデータベースシステムには、ClickHouseが提供する[インテグレーションエンジン](/engines/table-engines/#integration-engines)または[テーブル関数](/sql-reference/table-functions/)があるか、ベンダーが提供するJDBCドライバまたはODBCドライバが利用可能である必要があります。

この移行方法は「ピボット」方式と呼ばれることがあります。ソースデータベースからデスティネーションデータベースへのデータを移動させるための中間ピボットポイントまたはホップを利用するためです。例えば、セキュリティ要件によりプライベートまたは内部ネットワーク内からのアウトバウンド接続のみが許可されている場合、clickhouse-localを使用してソースデータベースからデータを取得し、その後データをデスティネーションのClickHouseデータベースへプッシュする必要があります。このとき、clickhouse-localがピボットポイントとして機能します。

ClickHouseは、[MySQL](/engines/table-engines/integrations/mysql/)、[PostgreSQL](/engines/table-engines/integrations/postgresql)、[MongoDB](/engines/table-engines/integrations/mongodb)、および[SQLite](/engines/table-engines/integrations/sqlite)用のインテグレーションエンジンと、テーブル関数（即座にインテグレーションエンジンを作成）を提供しています。他の一般的なデータベースシステムについては、システムのベンダーからJDBCドライバまたはODBCドライバが提供されています。

## clickhouse-localとは何ですか？ {#what-is-clickhouse-local}

<Image img={ch_local_02} size='lg' alt='セルフマネージドClickHouseの移行' background='white' />

通常、ClickHouseはクラスターの形式で実行され、複数のインスタンスが異なるサーバーで分散して実行されます。

単一サーバーでは、ClickHouseデータベースエンジンは`clickhouse-server`プログラムの一部として実行されます。データベースへのアクセス（パス、ユーザー、セキュリティなど）は、サーバー設定ファイルで設定されます。

`clickhouse-local`ツールを使用すると、ClickHouseデータベースエンジンをコマンドラインユーティリティとして孤立させ、設定やクリックハウスサーバーを起動せずに迅速なSQLデータ処理を実行できます。

## clickhouse-localのインストール {#installing-clickhouse-local}

`clickhouse-local`を使用するには、現在のソースデータベースシステムおよびClickHouse Cloudターゲットサービスの両方にネットワークアクセス可能なホストマシンが必要です。

そのホストマシンで、コンピュータのオペレーティングシステムに基づいて適切な`clickhouse-local`ビルドをダウンロードします：

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. `clickhouse-local`をローカルにダウンロードする最も簡単な方法は、次のコマンドを実行することです：
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. `clickhouse-local`を実行します（バージョンが表示されます）：
  ```bash
  ./clickhouse-local
  ```

</TabItem>
<TabItem value="mac" label="macOS">

1. `clickhouse-local`をローカルにダウンロードする最も簡単な方法は、次のコマンドを実行することです：
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. `clickhouse-local`を実行します（バージョンが表示されます）：
  ```bash
  ./clickhouse local
  ```

</TabItem>
</Tabs>

:::info 注意
このガイド全体での例は、`clickhouse-local`を実行するためのLinuxコマンド（`./clickhouse-local`）を使用しています。
Macで`clickhouse-local`を実行するには、`./clickhouse local`を使用してください。
:::


:::tip ClickHouse CloudサービスのIPアクセスリストにリモートシステムを追加する
`remoteSecure`関数がClickHouse Cloudサービスに接続できるようにするためには、リモートシステムのIPアドレスをIPアクセスリストで許可する必要があります。詳細については、このヒントの下にある**IPアクセスリストを管理**を展開してください。
:::

<AddARemoteSystem />

## 例1: MySQLからClickHouse Cloudへの移行：インテグレーションエンジンを使用する {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

データをソースのMySQLデータベースから読み取るために[インテグレーションテーブルエンジン](/engines/table-engines/integrations/mysql/)（[mysqlテーブル関数](/sql-reference/table-functions/mysql/)によって即座に作成されます）を使用し、データをClickHouse Cloudサービスのデスティネーションテーブルに書き込むために[remoteSecureテーブル関数](/sql-reference/table-functions/remote/)を使用します。

<Image img={ch_local_03} size='sm' alt='セルフマネージドClickHouseの移行' background='white' />

### ClickHouse Cloudサービスのデスティネーションにて： {#on-the-destination-clickhouse-cloud-service}

#### デスティネーションデータベースを作成： {#create-the-destination-database}

  ```sql
  CREATE DATABASE db
  ```

#### MySQLテーブルと同等のスキーマを持つデスティネーションテーブルを作成： {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

  ```sql
  CREATE TABLE db.table ...
  ```

:::note
ClickHouse CloudのデスティネーションテーブルのスキーマとソースMySQLテーブルのスキーマは整合している必要があります（カラム名と順序は同じで、カラムデータタイプは互換性がある必要があります）。
:::

### clickhouse-localホストマシンにて： {#on-the-clickhouse-local-host-machine}

#### 移行クエリと共にclickhouse-localを実行： {#run-clickhouse-local-with-the-migration-query}

  ```sql
  ./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
  ```

:::note
データは`clickhouse-local`ホストマシンにローカルに保存されません。代わりに、ソースのMySQLテーブルからデータが読み取られ、その後すぐにClickHouse Cloudサービスのデスティネーションテーブルに書き込まれます。
:::


## 例2: MySQLからClickHouse Cloudへの移行：JDBCブリッジを使用する {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

データをソースのMySQLデータベースから読み取るために[JDBCインテグレーションテーブルエンジン](/engines/table-engines/integrations/jdbc.md)（[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)によって即座に作成されます）を使用し、[ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge)およびMySQL JDBCドライバを用いて、データをClickHouse Cloudサービスのデスティネーションテーブルに書き込むために[remoteSecureテーブル関数](/sql-reference/table-functions/remote.md)を使用します。

<Image img={ch_local_04} size='sm' alt='セルフマネージドClickHouseの移行' background='white' />

### ClickHouse Cloudサービスのデスティネーションにて： {#on-the-destination-clickhouse-cloud-service-1}

#### デスティネーションデータベースを作成： {#create-the-destination-database-1}
  ```sql
  CREATE DATABASE db
  ```
