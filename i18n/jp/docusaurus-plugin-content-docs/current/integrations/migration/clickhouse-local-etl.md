---
sidebar_label: clickhouse-localの使用
sidebar_position: 20
keywords: [clickhouse, migrate, migration, migrating, data, etl, elt, clickhouse-local, clickhouse-client]
slug: '/cloud/migration/clickhouse-local'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import AddARemoteSystem from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';
import ch_local_01 from '@site/static/images/integrations/migration/ch-local-01.png';
import ch_local_02 from '@site/static/images/integrations/migration/ch-local-02.png';
import ch_local_03 from '@site/static/images/integrations/migration/ch-local-03.png';
import ch_local_04 from '@site/static/images/integrations/migration/ch-local-04.png';


# clickhouse-localを使用したClickHouseへの移行

<img src={ch_local_01} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '40%', padding: '30px'}} />

`clickhouse-local` ([`clickhouse-local`](/operations/utilities/clickhouse-local.md))をETLツールとして使用して、現在のデータベースシステムからClickHouse Cloudにデータを移行できます。これは、現在のデータベースシステムに、ClickHouse提供の[統合エンジン](/engines/table-engines/#integration-engines)または[テーブル関数](/sql-reference/table-functions/)が存在する場合、またはベンダー提供のJDBCドライバーやODBCドライバーが利用可能な場合に限ります。

この移行方法は「ピボット」メソッドと呼ばれることがあります。これは、データをソースデータベースから宛先データベースに移動するための中間のピボットポイントまたはホップを使用するためです。例えば、この方法は、セキュリティ要件により、プライベートまたは内部ネットワーク内からのアウトバウンド接続のみが許可されている場合に必要とされることがあります。したがって、clickhouse-localを使用してソースデータベースからデータを取得し、clickhouse-localがピボットポイントとなって宛先ClickHouseデータベースにデータをプッシュする必要があります。

ClickHouseは、[MySQL](/engines/table-engines/integrations/mysql/)、[PostgreSQL](/engines/table-engines/integrations/postgresql)、[MongoDB](/engines/table-engines/integrations/mongodb)、および[SQLite](/engines/table-engines/integrations/sqlite)のために、統合エンジンおよびテーブル関数（その場で統合エンジンを作成）を提供しています。その他の一般的なデータベースシステムには、ベンダーからのJDBCドライバーまたはODBCドライバーが提供されています。

## clickhouse-localとは？ {#what-is-clickhouse-local}

<img src={ch_local_02} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '100%', padding: '30px'}} />

通常、ClickHouseはクラスターの形で実行され、複数のインスタンスのClickHouseデータベースエンジンが異なるサーバー上で分散的に実行されます。

単一のサーバー上では、ClickHouseデータベースエンジンは`clickhouse-server`プログラムの一部として実行されます。データベースアクセス（パス、ユーザー、セキュリティなど）は、サーバー設定ファイルで構成されます。

`clickhouse-local`ツールは、ClickHouseデータベースエンジンをコマンドラインユーティリティの形で使用し、迅速なSQLデータ処理を多数の入力および出力のために提供します。ClickHouseサーバーを構成して起動する必要はありません。

## clickhouse-localのインストール {#installing-clickhouse-local}

`clickhouse-local`用のホストマシンが必要で、現在のソースデータベースシステムとClickHouse Cloudのターゲットサービスの両方にネットワークアクセスが必要です。

そのホストマシンに、コンピュータのオペレーティングシステムに基づいて適切な`clickhouse-local`のビルドをダウンロードしてください：

<Tabs groupId="os">
<TabItem value="linux" label="Linux">

1. `clickhouse-local`をローカルにダウンロードする最も簡単な方法は、次のコマンドを実行することです：
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. `clickhouse-local`を実行します（バージョンが表示されるだけです）：
  ```bash
  ./clickhouse-local
  ```

</TabItem>
<TabItem value="mac" label="macOS">

1. `clickhouse-local`をローカルにダウンロードする最も簡単な方法は、次のコマンドを実行することです：
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. `clickhouse-local`を実行します（バージョンが表示されるだけです）：
  ```bash
  ./clickhouse local
  ```

</TabItem>
</Tabs>

:::info 注意
このガイドの例は、`clickhouse-local`を実行するためのLinuxコマンド（`./clickhouse-local`）を使用しています。
Macで`clickhouse-local`を実行するには、`./clickhouse local`を使用してください。
:::

:::tip ClickHouse CloudサービスのIPアクセスリストにリモートシステムを追加
`remoteSecure`関数がClickHouse Cloudサービスに接続するためには、リモートシステムのIPアドレスがIPアクセスリストによって許可される必要があります。詳細についてはこのヒントの下にある**IPアクセスリストの管理**を展開してください。
:::

<AddARemoteSystem />

## 例1: MySQLからClickHouse Cloudへの統合エンジンを使用した移行 {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

ソースのMySQLデータベースからデータを読み取るために、[統合テーブルエンジン](/engines/table-engines/integrations/mysql/)（[mysqlテーブル関数](/sql-reference/table-functions/mysql/)によってその場で作成される）を使用し、データをClickHouse Cloudサービスの宛先テーブルに書き込むために[remoteSecureテーブル関数](/sql-reference/table-functions/remote/)を使用します。

<img src={ch_local_03} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '40%', padding: '30px'}} />

### ClickHouse Cloudサービスの宛先で: {#on-the-destination-clickhouse-cloud-service}

#### 宛先データベースを作成: {#create-the-destination-database}

  ```sql
  CREATE DATABASE db
  ```

#### MySQLテーブルに相当するスキーマを持つ宛先テーブルを作成: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

  ```sql
  CREATE TABLE db.table ...
  ```

:::note
ClickHouse Cloudの宛先テーブルのスキーマとソースMySQLテーブルのスキーマは一致している必要があります（カラム名と順序が同じで、カラムデータ型が互換性がある必要があります）。
:::

### clickhouse-localホストマシンで: {#on-the-clickhouse-local-host-machine}

#### 移行クエリでclickhouse-localを実行: {#run-clickhouse-local-with-the-migration-query}

  ```sql
  ./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
  ```

:::note
データは`clickhouse-local`ホストマシンにローカルに保存されません。代わりに、データはソースMySQLテーブルから読み取られ、直接ClickHouse Cloudサービスの宛先テーブルに書き込まれます。
:::

## 例2: MySQLからClickHouse CloudへのJDBCブリッジを使用した移行 {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

ソースMySQLデータベースからデータを読み取るために、[JDBC統合テーブルエンジン](/engines/table-engines/integrations/jdbc.md)（[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)によってその場で作成される）と[ClickHouse JDBCブリッジ](https://github.com/ClickHouse/clickhouse-jdbc-bridge)、およびMySQL JDBCドライバーを使用し、データをClickHouse Cloudサービスの宛先テーブルに書き込むために[remoteSecureテーブル関数](/sql-reference/table-functions/remote.md)を使用します。

<img src={ch_local_04} class="image" alt="セルフマネージド ClickHouse の移行" style={{width: '40%', padding: '30px'}} />

### ClickHouse Cloudサービスの宛先で: {#on-the-destination-clickhouse-cloud-service-1}

#### 宛先データベースを作成: {#create-the-destination-database-1}
  ```sql
  CREATE DATABASE db
  ```

#### MySQLテーブルに相当するスキーマを持つ宛先テーブルを作成: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table-1}

  ```sql
  CREATE TABLE db.table ...
  ```

:::note
ClickHouse Cloudの宛先テーブルのスキーマとソースMySQLテーブルのスキーマは一致している必要があります。例えば、カラム名と順序が同じで、カラムデータ型が互換性がある必要があります。
:::

### clickhouse-localホストマシンで: {#on-the-clickhouse-local-host-machine-1}

#### ローカルでClickHouse JDBCブリッジをインストール、構成、および起動: {#install-configure-and-start-the-clickhouse-jdbc-bridge-locally}

[ガイド](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md#install-the-clickhouse-jdbc-bridge-locally)の手順に従ってください。このガイドにはMySQLからのデータソースの構成手順も含まれています。

#### 移行クエリでclickhouse-localを実行: {#run-clickhouse-local-with-the-migration-query-1}

  ```sql
  ./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM jdbc('datasource', 'database', 'table');"
  ```

:::note
データは`clickhouse-local`ホストマシンにローカルに保存されません。代わりに、データはMySQLソーステーブルから読み取られ、直接ClickHouse Cloudサービスの宛先テーブルに書き込まれます。
:::
