---
sidebar_label: 'clickhouse-local の使用'
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/clickhouse-local
title: 'clickhouse-local を使った ClickHouse への移行'
description: 'clickhouse-local を使って ClickHouse へ移行する方法を解説するガイド'
doc_type: 'guide'
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


# clickhouse-local を使用した ClickHouse への移行

<Image img={ch_local_01} size='sm' alt='Migrating Self-managed ClickHouse' background='white' />

ClickHouse、より具体的には [`clickhouse-local`](/operations/utilities/clickhouse-local.md) を、現在利用しているデータベースシステムから ClickHouse Cloud へのデータ移行のための ETL ツールとして使用できます。前提条件として、現在のデータベースシステム向けに ClickHouse が提供する [integration engine](/engines/table-engines/#integration-engines) または [table function](/sql-reference/table-functions/)、あるいはシステムベンダーが提供する JDBC ドライバまたは ODBC ドライバのいずれかが利用可能である必要があります。

この移行方法を「ピボット」方式と呼ぶことがあります。ソースデータベースからデスティネーションデータベースへデータを移動する際に、中間のピボットポイント（経由地点）を利用する方式であるためです。例えば、セキュリティ要件によりプライベートまたは社内ネットワークからは外向き接続のみが許可されている場合、この方式が必要になることがあります。この場合、まず clickhouse-local を使ってソースデータベースからデータを取得し、その後デスティネーション側の ClickHouse データベースにデータを書き込みます。このとき、clickhouse-local はピボットポイントとして動作します。

ClickHouse は、[MySQL](/engines/table-engines/integrations/mysql/)、[PostgreSQL](/engines/table-engines/integrations/postgresql)、[MongoDB](/engines/table-engines/integrations/mongodb)、および [SQLite](/engines/table-engines/integrations/sqlite) 向けの integration engine と（オンザフライで integration engine を作成する）table function を提供しています。
その他の一般的なデータベースシステムについては、システムベンダーから JDBC ドライバまたは ODBC ドライバが提供されています。



## clickhouse-localとは？ {#what-is-clickhouse-local}

<Image
  img={ch_local_02}
  size='lg'
  alt='セルフマネージドClickHouseの移行'
  background='white'
/>

通常、ClickHouseはクラスタ形式で実行され、複数のClickHouseデータベースエンジンのインスタンスが異なるサーバー上で分散して動作します。

単一サーバー上では、ClickHouseデータベースエンジンは`clickhouse-server`プログラムの一部として実行されます。データベースアクセス（パス、ユーザー、セキュリティなど）は、サーバー設定ファイルで構成されます。

`clickhouse-local`ツールを使用すると、ClickHouseサーバーの設定や起動を行うことなく、ClickHouseデータベースエンジンをコマンドラインユーティリティとして独立して使用でき、大量の入出力に対して超高速なSQLデータ処理を実行できます。


## clickhouse-localのインストール {#installing-clickhouse-local}

`clickhouse-local`には、現在のソースデータベースシステムとClickHouse Cloudのターゲットサービスの両方にネットワークアクセスできるホストマシンが必要です。

そのホストマシン上で、コンピュータのオペレーティングシステムに応じた適切な`clickhouse-local`のビルドをダウンロードします:

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. `clickhouse-local`をローカルにダウンロードする最も簡単な方法は、次のコマンドを実行することです:

```bash
curl https://clickhouse.com/ | sh
```

1. `clickhouse-local`を実行します（バージョンが表示されます）:

```bash
./clickhouse-local
```

</TabItem>
<TabItem value="mac" label="macOS">

1. `clickhouse-local`をローカルにダウンロードする最も簡単な方法は、次のコマンドを実行することです:

```bash
curl https://clickhouse.com/ | sh
```

1. `clickhouse-local`を実行します（バージョンが表示されます）:

```bash
./clickhouse local
```

</TabItem>
</Tabs>

:::info 重要
このガイド全体の例では、`clickhouse-local`を実行するためのLinuxコマンド（`./clickhouse-local`）を使用しています。
Macで`clickhouse-local`を実行する場合は、`./clickhouse local`を使用してください。
:::

:::tip リモートシステムをClickHouse CloudサービスのIPアクセスリストに追加する
`remoteSecure`関数がClickHouse Cloudサービスに接続するには、リモートシステムのIPアドレスがIPアクセスリストで許可されている必要があります。詳細については、このヒントの下にある**IPアクセスリストの管理**を展開してください。
:::

<AddARemoteSystem />


## 例1: 統合エンジンを使用したMySQLからClickHouse Cloudへの移行 {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

ソースのMySQLデータベースからデータを読み取るために[統合テーブルエンジン](/engines/table-engines/integrations/mysql/)（[mysqlテーブル関数](/sql-reference/table-functions/mysql/)によって動的に作成される）を使用し、ClickHouse Cloudサービス上の宛先テーブルにデータを書き込むために[remoteSecureテーブル関数](/sql-reference/table-functions/remote/)を使用します。

<Image
  img={ch_local_03}
  size='sm'
  alt='セルフマネージドClickHouseの移行'
  background='white'
/>

### 宛先のClickHouse Cloudサービス上での操作: {#on-the-destination-clickhouse-cloud-service}

#### 宛先データベースの作成: {#create-the-destination-database}

```sql
CREATE DATABASE db
```

#### MySQLテーブルと同等のスキーマを持つ宛先テーブルの作成: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

```sql
CREATE TABLE db.table ...
```

:::note
ClickHouse Cloudの宛先テーブルのスキーマとソースのMySQLテーブルのスキーマは一致している必要があります（カラム名と順序が同じであり、カラムのデータ型に互換性がある必要があります）。
:::

### clickhouse-localホストマシン上での操作: {#on-the-clickhouse-local-host-machine}

#### 移行クエリを使用したclickhouse-localの実行: {#run-clickhouse-local-with-the-migration-query}

```sql
./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
```

:::note
`clickhouse-local`ホストマシン上にデータはローカルに保存されません。代わりに、データはソースのMySQLテーブルから読み取られ、その後すぐにClickHouse Cloudサービス上の宛先テーブルに書き込まれます。
:::


## 例2: JDBCブリッジを使用したMySQLからClickHouse Cloudへの移行 {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

ソースのMySQLデータベースからデータを読み取るために、[JDBCインテグレーションテーブルエンジン](/engines/table-engines/integrations/jdbc.md)([jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)によって動的に作成)を[ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge)およびMySQL JDBCドライバーと組み合わせて使用し、ClickHouse Cloudサービス上の移行先テーブルにデータを書き込むために[remoteSecureテーブル関数](/sql-reference/table-functions/remote.md)を使用します。

<Image
  img={ch_local_04}
  size='sm'
  alt='セルフマネージドClickHouseの移行'
  background='white'
/>

### 移行先のClickHouse Cloudサービス上で: {#on-the-destination-clickhouse-cloud-service-1}

#### 移行先データベースの作成: {#create-the-destination-database-1}

```sql
CREATE DATABASE db
```
