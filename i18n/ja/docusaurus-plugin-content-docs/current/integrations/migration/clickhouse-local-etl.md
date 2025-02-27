---
sidebar_label: clickhouse-localの使用
sidebar_position: 20
keywords: [clickhouse, migrate, migration, migrating, data, etl, elt, clickhouse-local, clickhouse-client]
slug: '/cloud/migration/clickhouse-local'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

import AddARemoteSystem from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_add_remote_ip_access_list_detail.md';

# clickhouse-localを使用したClickHouseへの移行

<img src={require('./images/ch-local-01.png').default} class="image" alt="セルフマネージドClickHouseの移行" style={{width: '40%', padding: '30px'}}/>

ClickHouse、またはより具体的に言うと[`clickhouse-local`](/operations/utilities/clickhouse-local.md)をETLツールとして使用して、現在のデータベースシステムからClickHouse Cloudにデータを移行できます。これは、現在のデータベースシステムにClickHouseが提供する[統合エンジン](/engines/table-engines/#integration-engines)または[テーブル関数](/sql-reference/table-functions/)が存在するか、ベンダーが提供するJDBCドライバーまたはODBCドライバーが利用できる限り可能です。

この移行方法を「ピボット」メソッドと呼ぶことがあります。なぜなら、ソースデータベースからデスティネーションデータベースへのデータ移動に中間のピボットポイントを使用するからです。例えば、この方法はセキュリティ要件によりプライベートまたは内部ネットワーク内からアウトバウンド接続のみが許可されている場合に必要となることがあります。そのため、clickhouse-localを使用してソースデータベースからデータを取得し、clickhouse-localがピボットポイントとして機能し、データをデスティネーションClickHouseデータベースにプッシュします。

ClickHouseは、[MySQL](/engines/table-engines/integrations/mysql/)、[PostgreSQL](/engines/table-engines/integrations/postgresql)、[MongoDB](/engines/table-engines/integrations/mongodb) および [SQLite](/engines/table-engines/integrations/sqlite)のために統合エンジンとテーブル関数（その場で統合エンジンを作成する）を提供しています。その他の一般的なデータベースシステムについては、ベンダーからJDBCドライバーまたはODBCドライバーが利用できます。

## clickhouse-localとは？ {#what-is-clickhouse-local}

<img src={require('./images/ch-local-02.png').default} class="image" alt="セルフマネージドClickHouseの移行" style={{width: '100%', padding: '30px'}}/>

通常、ClickHouseはクラスターの形で実行され、複数のClickHouseデータベースエンジンのインスタンスが異なるサーバーで分散方式で実行されています。

単一のサーバー上では、ClickHouseデータベースエンジンは`clickhouse-server`プログラムの一部として実行されます。データベースアクセス（パス、ユーザー、セキュリティなど）は、サーバーの設定ファイルで構成されます。

`clickhouse-local`ツールを使用すると、ClickHouseデータベースエンジンをコマンドラインユーティリティの形式で切り離して使用でき、膨大な入出力に対して超高速のSQLデータ処理を行うことができます。ClickHouseサーバーを設定して起動する必要はありません。

## clickhouse-localのインストール {#installing-clickhouse-local}

`clickhouse-local`には、現在のソースデータベースシステムとClickHouse Cloudターゲットサービスの両方にネットワークアクセスを持つホストマシンが必要です。

そのホストマシンで、コンピュータのオペレーティングシステムに基づいて適切な`clickhouse-local`ビルドをダウンロードします：

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. `clickhouse-local`をローカルにダウンロードする最も簡単な方法は、以下のコマンドを実行することです：
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. `clickhouse-local`を実行します（バージョンが表示されます）：
  ```bash
  ./clickhouse-local
  ```

</TabItem>
<TabItem value="mac" label="macOS">

1. `clickhouse-local`をローカルにダウンロードする最も簡単な方法は、以下のコマンドを実行することです：
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. `clickhouse-local`を実行します（バージョンが表示されます）：
  ```bash
  ./clickhouse local
  ```

</TabItem>
</Tabs>

:::info 重要
このガイドの例は、`clickhouse-local`を実行するためにLinuxコマンド（`./clickhouse-local`）を使用しています。
Macで`clickhouse-local`を実行するには、`./clickhouse local`を使用してください。
:::


:::tip リモートシステムをClickHouse CloudサービスのIPアクセスリストに追加
`remoteSecure`関数があなたのClickHouse Cloudサービスに接続するためには、リモートシステムのIPアドレスがIPアクセスリストで許可されている必要があります。このヒントの下にある**IPアクセスリストの管理**を展開して、詳細情報を確認してください。
:::

<AddARemoteSystem />

## 例1：MySQLからClickHouse Cloudへの移行（統合エンジンを使用） {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

ソースMySQLデータベースからデータを読み取るために、[統合テーブルエンジン](/engines/table-engines/integrations/mysql/)（[mysqlテーブル関数](/sql-reference/table-functions/mysql/)によってその場で作成）を使用し、データをClickHouseクラウドサービスのデスティネーションテーブルに書き込むために、[remoteSecureテーブル関数](/sql-reference/table-functions/remote/)を使用します。

<img src={require('./images/ch-local-03.png').default} class="image" alt="セルフマネージドClickHouseの移行" style={{width: '40%', padding: '30px'}}/>

### デスティネーションClickHouse Cloudサービスで： {#on-the-destination-clickhouse-cloud-service}

#### デスティネーションデータベースの作成： {#create-the-destination-database}

```sql
CREATE DATABASE db
```

#### MySQLテーブルと同等のスキーマを持つデスティネーションテーブルの作成： {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

```sql
CREATE TABLE db.table ...
```

:::note
ClickHouse CloudのデスティネーションテーブルのスキーマとソースMySQLテーブルのスキーマは一致している必要があります（カラム名と順序が同じで、カラムデータ型が互換性がある必要があります）。
:::

### clickhouse-localホストマシンで： {#on-the-clickhouse-local-host-machine}

#### 移行クエリでclickhouse-localを実行： {#run-clickhouse-local-with-the-migration-query}

```sql
./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
```

:::note
`clickhouse-local`ホストマシンにローカルにデータが保存されることはありません。データはソースMySQLテーブルから読み取られ、その後即座にClickHouse Cloudサービスのデスティネーションテーブルに書き込まれます。
:::


## 例2：MySQLからClickHouse Cloudへの移行（JDBCブリッジを使用） {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

ソースMySQLデータベースからデータを読み取るために、[JDBC統合テーブルエンジン](/engines/table-engines/integrations/jdbc.md)（[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)によってその場で作成）を[ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge)およびMySQL JDBCドライバーと共に使用し、データをClickHouse Cloudサービスのデスティネーションテーブルに書き込むために[remoteSecureテーブル関数](/sql-reference/table-functions/remote.md)を使用します。

<img src={require('./images/ch-local-04.png').default} class="image" alt="セルフマネージドClickHouseの移行" style={{width: '40%', padding: '30px'}}/>

### デスティネーションClickHouse Cloudサービスで： {#on-the-destination-clickhouse-cloud-service-1}

#### デスティネーションデータベースの作成： {#create-the-destination-database-1}
```sql
CREATE DATABASE db
```

#### MySQLテーブルと同等のスキーマを持つデスティネーションテーブルの作成： {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table-1}

```sql
CREATE TABLE db.table ...
```

:::note
ClickHouse CloudのデスティネーションテーブルのスキーマとソースMySQLテーブルのスキーマは一致している必要があります。
e.g. カラム名と順序が同じで、カラムデータ型が互換性がある必要があります。
:::

### clickhouse-localホストマシンで： {#on-the-clickhouse-local-host-machine-1}

#### ClickHouse JDBC Bridgeをローカルにインストール、設定、および開始： {#install-configure-and-start-the-clickhouse-jdbc-bridge-locally}

[ガイド](/integrations/data-ingestion/dbms/jdbc-with-clickhouse.md#install-the-clickhouse-jdbc-bridge-locally)の手順に従ってください。このガイドには、MySQLからデータソースを構成する手順も含まれています。

#### 移行クエリでclickhouse-localを実行： {#run-clickhouse-local-with-the-migration-query-1}

```sql
./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM jdbc('datasource', 'database', 'table');"
```

:::note
`clickhouse-local`ホストマシンにローカルにデータが保存されることはありません。データはMySQLソーステーブルから読み取られ、その後即座にClickHouse Cloudサービスのデスティネーションテーブルに書き込まれます。
:::
