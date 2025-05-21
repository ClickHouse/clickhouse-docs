---
sidebar_label: 'clickhouse-localの使用'
sidebar_position: 20
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/clickhouse-local
title: 'clickhouse-localを使用してClickHouseに移行する'
description: 'clickhouse-localを使用してClickHouseに移行する方法を示すガイド'
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import AddARemoteSystem from '@site/docs/_snippets/_add_remote_ip_access_list_detail.md';
import ch_local_01 from '@site/static/images/integrations/migration/ch-local-01.png';
import ch_local_02 from '@site/static/images/integrations/migration/ch-local-02.png';
import ch_local_03 from '@site/static/images/integrations/migration/ch-local-03.png';
import ch_local_04 from '@site/static/images/integrations/migration/ch-local-04.png';


# clickhouse-localを使用してClickHouseに移行する

<Image img={ch_local_01} size='sm' alt='セルフマネージドClickHouseの移行' background='white' />

ClickHouse、より具体的には[`clickhouse-local`](/operations/utilities/clickhouse-local.md)をETLツールとして使用して、現在のデータベースシステムからClickHouse Cloudにデータを移行することができます。これは、現在のデータベースシステムに対して、ClickHouseが提供する[インテグレーションエンジン](/engines/table-engines/#integration-engines)または[テーブル関数](/sql-reference/table-functions/)が利用可能であるか、ベンダーが提供するJDBCドライバーまたはODBCドライバーが利用可能である必要があります。

この移行方法は「ピボット」方法と呼ばれることがあります。なぜなら、データをソースデータベースから宛先データベースに移動するために、間接的なピボットポイントまたはホップを使用するからです。例えば、セキュリティ要件によりプライベートまたは内部ネットワークからのアウトバウンド接続のみが許可されている場合、この方法が必要になることがあり、そのために`clickhouse-local`を使用してソースデータベースからデータを取得し、`clickhouse-local`がピボットポイントとして機能してデータを宛先のClickHouseデータベースにプッシュする必要があります。

ClickHouseは[MySQL](/engines/table-engines/integrations/mysql/)、[PostgreSQL](/engines/table-engines/integrations/postgresql)、[MongoDB](/engines/table-engines/integrations/mongodb)、および[SQLite](/engines/table-engines/integrations/sqlite)用のインテグレーションエンジンと、インテグレーションエンジンをその場で作成するテーブル関数を提供しています。その他の人気のあるデータベースシステムについては、システムのベンダーからJDBCドライバーまたはODBCドライバーが利用可能です。

## clickhouse-localとは何ですか？ {#what-is-clickhouse-local}

<Image img={ch_local_02} size='lg' alt='セルフマネージドClickHouseの移行' background='white' />

一般に、ClickHouseはクラスターの形で実行され、複数のインスタンスのClickHouseデータベースエンジンが異なるサーバーに分散して実行されています。

単一のサーバー上で、ClickHouseデータベースエンジンは`clickhouse-server`プログラムの一部として実行されます。データベースアクセス（パス、ユーザー、セキュリティなど）はサーバー設定ファイルで構成されます。

`clickhouse-local`ツールは、ClickHouseデータベースエンジンをコマンドラインユーティリティとして隔離して使用でき、膨大な入力および出力に対して驚異的な速さでSQLデータ処理を行うことができます。ClickHouseサーバーを設定して起動する必要はありません。

## clickhouse-localのインストール {#installing-clickhouse-local}

`clickhouse-local`用のホストマシンが必要で、現在のソースデータベースシステムとClickHouse Cloudターゲットサービスの両方にネットワークアクセスが必要です。

そのホストマシン上で、コンピューターのオペレーティングシステムに基づいて適切な`clickhouse-local`のビルドをダウンロードします：

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. `clickhouse-local`をローカルにダウンロードする最も簡単な方法は、次のコマンドを実行することです：
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. `clickhouse-local`を実行します（それは単にバージョンを表示します）：
  ```bash
  ./clickhouse-local
  ```

</TabItem>
<TabItem value="mac" label="macOS">

1. `clickhouse-local`をローカルにダウンロードする最も簡単な方法は、次のコマンドを実行することです：
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. `clickhouse-local`を実行します（それは単にバージョンを表示します）：
  ```bash
  ./clickhouse local
  ```

</TabItem>
</Tabs>

:::info 重要
このガイド全体の例では、`clickhouse-local`を実行するためのLinuxコマンド（`./clickhouse-local`）が使用されています。Macで`clickhouse-local`を実行するには、`./clickhouse local`を使用してください。
:::

:::tip ClickHouse CloudサービスIPアクセスリストにリモートシステムを追加する
`remoteSecure`関数がClickHouse Cloudサービスに接続できるようにするために、リモートシステムのIPアドレスはIPアクセスリストによって許可される必要があります。詳細については、このヒントの下にある**IPアクセスリストの管理**を展開してください。
:::

  <AddARemoteSystem />

## 例1: MySQLからClickHouse Cloudへの移行（インテグレーションエンジンを使用） {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

私たちは[インテグレーションテーブルエンジン](/engines/table-engines/integrations/mysql/)（[mysqlテーブル関数](/sql-reference/table-functions/mysql/)によってその場で作成された）を使用してソースMySQLデータベースからデータを読み取り、[remoteSecureテーブル関数](/sql-reference/table-functions/remote/)を使用してClickHouse Cloudサービス上の宛先テーブルにデータを書き込みます。

<Image img={ch_local_03} size='sm' alt='セルフマネージドClickHouseの移行' background='white' />

### 宛先ClickHouse Cloudサービス上で: {#on-the-destination-clickhouse-cloud-service}

#### 宛先データベースの作成: {#create-the-destination-database}

  ```sql
  CREATE DATABASE db
  ```

#### MySQLテーブルと同等のスキーマを持つ宛先テーブルを作成する: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

  ```sql
  CREATE TABLE db.table ...
  ```

:::note
ClickHouse Cloudの宛先テーブルのスキーマとソースMySQLテーブルのスキーマは整合性を保つ必要があります（カラムの名前と順序が同じで、カラムのデータ型が互換性がある必要があります）。
:::

### clickhouse-localホストマシン上で: {#on-the-clickhouse-local-host-machine}

#### 移行クエリを使用してclickhouse-localを実行する: {#run-clickhouse-local-with-the-migration-query}

  ```sql
  ./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
  ```

:::note
データは`clickhouse-local`ホストマシンにローカルに保存されません。その代わり、データはソースMySQLテーブルから読み込まれ、すぐにClickHouse Cloudサービスの宛先テーブルに書き込まれます。
:::


## 例2: MySQLからClickHouse Cloudへの移行（JDBCブリッジを使用） {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

私たちは[ JDBCインテグレーションテーブルエンジン](/engines/table-engines/integrations/jdbc.md)（[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)によってその場で作成された）と[ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge)を使用し、MySQL JDBCドライバーと共に、ソースMySQLデータベースからデータを読み取り、[remoteSecureテーブル関数](/sql-reference/table-functions/remote.md)を使用してClickHouse Cloudサービス上の宛先テーブルにデータを書き込みます。

<Image img={ch_local_04} size='sm' alt='セルフマネージドClickHouseの移行' background='white' />

### 宛先ClickHouse Cloudサービス上で: {#on-the-destination-clickhouse-cloud-service-1}

#### 宛先データベースの作成: {#create-the-destination-database-1}
  ```sql
  CREATE DATABASE db
  ```
