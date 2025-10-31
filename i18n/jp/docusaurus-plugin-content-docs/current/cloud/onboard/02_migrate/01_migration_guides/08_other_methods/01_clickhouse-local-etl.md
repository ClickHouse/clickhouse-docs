---
'sidebar_label': 'clickhouse-localの使用'
'keywords':
- 'clickhouse'
- 'migrate'
- 'migration'
- 'migrating'
- 'data'
- 'etl'
- 'elt'
- 'clickhouse-local'
- 'clickhouse-client'
'slug': '/cloud/migration/clickhouse-local'
'title': 'ClickHouseへの移行方法：clickhouse-localを使用して'
'description': 'clickhouse-localを使用してClickHouseに移行する方法を示すガイド'
'doc_type': 'guide'
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


# ClickHouseへの移行 - clickhouse-localを使用する

<Image img={ch_local_01} size='sm' alt='Self-managed ClickHouseの移行' background='white' />

ClickHouse、またはより具体的には、 [`clickhouse-local`](/operations/utilities/clickhouse-local.md) をETLツールとして使用し、現在のデータベースシステムからClickHouse Cloudへのデータ移行を行うことができます。現在のデータベースシステムに対しては、ClickHouseが提供する[統合エンジン](/engines/table-engines/#integration-engines)または[テーブル関数](/sql-reference/table-functions/)が必要です。または、ベンダーが提供するJDBCドライバーまたはODBCドライバーが利用可能である必要があります。

この移行方法は、データをソースデータベースから宛先データベースに移動させるための中間ピボットポイントやホップを使用しているため、「ピボット」メソッドと呼ばれることがあります。例えば、セキュリティ要件によりプライベートまたは内部ネットワーク内からの外向き接続のみが許可されている場合、この方法が必要です。そのため、clickhouse-localを使用してソースデータベースからデータを引き出し、clickhouse-localをピボットポイントとして、データを宛先のClickHouseデータベースにプッシュする必要があります。

ClickHouseは、[MySQL](/engines/table-engines/integrations/mysql/)、[PostgreSQL](/engines/table-engines/integrations/postgresql)、[MongoDB](/engines/table-engines/integrations/mongodb)、および[SQLite](/engines/table-engines/integrations/sqlite)のための統合エンジンとテーブル関数（その場で統合エンジンを作成します）を提供しています。他の一般的なデータベースシステムについては、システムのベンダーからJDBCドライバーまたはODBCドライバーが提供されています。

## clickhouse-localとは何か？ {#what-is-clickhouse-local}

<Image img={ch_local_02} size='lg' alt='Self-managed ClickHouseの移行' background='white' />

通常、ClickHouseはクラスタ形式で実行され、複数のClickHouseデータベースエンジンのインスタンスが異なるサーバー上で分散して実行されます。

単一のサーバーでは、ClickHouseデータベースエンジンは`clickhouse-server`プログラムの一部として実行されます。データベースへのアクセス（パス、ユーザー、セキュリティなど）は、サーバーの設定ファイルで構成されます。

`clickhouse-local`ツールを使用すると、ClickHouseデータベースエンジンをコマンドラインユーティリティの形式で孤立して使用し、膨大な入出力量のSQLデータ処理を迅速に実行できます。ClickHouseサーバーを構成して起動する必要はありません。

## clickhouse-localのインストール {#installing-clickhouse-local}

`clickhouse-local`には、現在のソースデータベースシステムとClickHouse Cloudのターゲットサービスの両方にネットワークアクセスがあるホストマシンが必要です。

そのホストマシンで、コンピュータのオペレーティングシステムに基づいて適切なビルドの`clickhouse-local`をダウンロードします。

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

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

:::info 重要
このガイド全体の例では、`clickhouse-local`を実行するためにLinuxコマンド（`./clickhouse-local`）が使用されています。
Macで`clickhouse-local`を実行する場合は、`./clickhouse local`を使用してください。
:::

:::tip ClickHouse CloudサービスのIPアクセスリストにリモートシステムを追加する
`remoteSecure`関数があなたのClickHouse Cloudサービスに接続するためには、リモートシステムのIPアドレスがIPアクセスリストで許可されている必要があります。 このヒントの下の**あなたのIPアクセスリストを管理する**を展開して、詳細を確認してください。
:::

<AddARemoteSystem />

## 例1: MySQLからClickHouse Cloudへの移行 - 統合エンジンを使用 {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

ソースのMySQLデータベースからデータを読み取るために、[統合テーブルエンジン](/engines/table-engines/integrations/mysql/)（[mysqlテーブル関数](/sql-reference/table-functions/mysql/)によってその場で作成されます）を使用し、ClickHouse Cloudサービス上の宛先テーブルへのデータ書き込みには[remoteSecureテーブル関数](/sql-reference/table-functions/remote/)を使用します。

<Image img={ch_local_03} size='sm' alt='Self-managed ClickHouseの移行' background='white' />

### ClickHouse Cloudサービス上の宛先: {#on-the-destination-clickhouse-cloud-service}

#### 宛先データベースを作成する: {#create-the-destination-database}

```sql
CREATE DATABASE db
```

#### MySQLテーブルに相当するスキーマを持つ宛先テーブルを作成する: {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

```sql
CREATE TABLE db.table ...
```

:::note
ClickHouse Cloudの宛先テーブルのスキーマとソースMySQLテーブルのスキーマは一致している必要があります（カラム名や順序は同じで、カラムデータ型は互換性がある必要があります）。
:::

### clickhouse-localホストマシン上で: {#on-the-clickhouse-local-host-machine}

#### 移行クエリでclickhouse-localを実行する: {#run-clickhouse-local-with-the-migration-query}

```sql
  ./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
```

:::note
`clickhouse-local`ホストマシンでデータはローカルに保存されません。代わりに、データはソースMySQLテーブルから読み取られ、その後すぐにClickHouse Cloudサービスの宛先テーブルに書き込まれます。
:::

## 例2: MySQLからClickHouse Cloudへの移行 - JDBCブリッジを使用 {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

[JDBC統合テーブルエンジン](/engines/table-engines/integrations/jdbc.md)（[jdbcテーブル関数](/sql-reference/table-functions/jdbc.md)によってその場で作成されます）と[ClickHouse JDBCブリッジ](https://github.com/ClickHouse/clickhouse-jdbc-bridge)、およびMySQL JDBCドライバーを使用して、ソースのMySQLデータベースからデータを読み取り、ClickHouse Cloudサービスの宛先テーブルへのデータ書き込みには[remoteSecureテーブル関数](/sql-reference/table-functions/remote.md)を使用します。

<Image img={ch_local_04} size='sm' alt='Self-managed ClickHouseの移行' background='white' />

### ClickHouse Cloudサービス上の宛先: {#on-the-destination-clickhouse-cloud-service-1}

#### 宛先データベースを作成する: {#create-the-destination-database-1}
```sql
CREATE DATABASE db
```
