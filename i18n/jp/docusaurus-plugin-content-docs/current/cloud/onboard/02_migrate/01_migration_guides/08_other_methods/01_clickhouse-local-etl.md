---
sidebar_label: 'clickhouse-local の使用'
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/clickhouse-local
title: 'clickhouse-local を使用して ClickHouse に移行する'
description: 'clickhouse-local を使用して ClickHouse に移行する方法を解説するガイド'
doc_type: 'guide'
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

# clickhouse-local を使用した ClickHouse への移行 {#migrating-to-clickhouse-using-clickhouse-local}

<Image img={ch_local_01} size='lg' alt='セルフマネージド ClickHouse の移行'/>

ClickHouse、より具体的には [`clickhouse-local`](/operations/utilities/clickhouse-local.md) を ETL ツールとして使用して、現在のデータベースシステムから ClickHouse Cloud へデータを移行できます。ただし、現在のデータベースシステムに対して、ClickHouse が提供する [integration engine](/engines/table-engines/#integration-engines) または [table function](/sql-reference/table-functions/) が存在するか、あるいはベンダー提供の JDBC ドライバーまたは ODBC ドライバーが利用可能である必要があります。

この移行方法を「ピボット」方式と呼ぶことがあります。これは、データをソースデータベースから宛先データベースへ移動する際に、中間のピボットポイント（中継点）を利用するためです。たとえば、セキュリティ要件により、プライベートまたは内部ネットワーク内からはアウトバウンド接続のみが許可されている場合、この方法が必要になることがあります。その場合、clickhouse-local を使ってソースデータベースからデータをプルし、続いて clickhouse-local をピボットポイントとして利用しながら、データを宛先の ClickHouse データベースへプッシュします。

ClickHouse は、[MySQL](/engines/table-engines/integrations/mysql/)、[PostgreSQL](/engines/table-engines/integrations/postgresql)、[MongoDB](/engines/table-engines/integrations/mongodb)、[SQLite](/engines/table-engines/integrations/sqlite) 向けの integration engine と（オンザフライで integration engine を作成する）table function を提供しています。
その他の主要なデータベースシステムについては、システムのベンダーから JDBC ドライバーまたは ODBC ドライバーが提供されています。

## clickhouse-local とは何ですか？ {#what-is-clickhouse-local}

<Image img={ch_local_02} size='lg' alt="セルフマネージド ClickHouse の移行"  />

通常、ClickHouse はクラスタとして実行され、複数の ClickHouse データベースエンジンのインスタンスが、異なるサーバー上で分散して動作します。

単一サーバー上では、ClickHouse データベースエンジンは `clickhouse-server` プログラムの一部として実行されます。データベースへのアクセス (パス、ユーザー、セキュリティなど) は、サーバーの設定ファイルで定義します。

`clickhouse-local` ツールを使用すると、ClickHouse サーバーを構成して起動することなく、多様な入力および出力に対してきわめて高速な SQL データ処理を行うために、ClickHouse データベースエンジンを独立したコマンドラインユーティリティとして利用できます。

## clickhouse-local のインストール {#installing-clickhouse-local}

`clickhouse-local` 用に、現在のソースデータベースシステムと ClickHouse Cloud のターゲットサービスの両方にネットワーク経由でアクセス可能なホストマシンが必要です。

そのホストマシン上で、使用しているオペレーティングシステムに応じて、適切なビルドの `clickhouse-local` をダウンロードします。

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. `clickhouse-local` をローカル環境にダウンロードする最も簡単な方法は、次のコマンドを実行することです。
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. `clickhouse-local` を実行します（バージョンが表示されるだけです）。
  ```bash
  ./clickhouse-local
  ```

</TabItem>
<TabItem value="mac" label="macOS">

1. `clickhouse-local` をローカル環境にダウンロードする最も簡単な方法は、次のコマンドを実行することです。
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. `clickhouse-local` を実行します（バージョンが表示されるだけです）。
  ```bash
  ./clickhouse local
  ```

</TabItem>
</Tabs>

:::info 重要
このガイド全体の例では、`clickhouse-local` を実行するために Linux のコマンド（`./clickhouse-local`）を使用しています。
Mac で `clickhouse-local` を実行するには、`./clickhouse local` を使用します。
:::

:::tip リモートシステムを ClickHouse Cloud サービスの IP アクセスリストに追加する
`remoteSecure` 関数が ClickHouse Cloud サービスに接続できるようにするには、リモートシステムの IP アドレスが IP アクセスリストで許可されている必要があります。詳細については、このヒントの下にある **Manage your IP Access List** を展開してください。
:::

<AddARemoteSystem />

## 例 1: Integration エンジンを使用して MySQL から ClickHouse Cloud へ移行する {#example-1-migrating-from-mysql-to-clickhouse-cloud-with-an-integration-engine}

ソースの MySQL データベースからデータを読み取るために、[integration table engine](/engines/table-engines/integrations/mysql/)（[mysql table function](/sql-reference/table-functions/mysql/) によってその場で作成されます）を使用し、[remoteSecure table function](/sql-reference/table-functions/remote/) を使用して、宛先である ClickHouse Cloud 上のテーブルにデータを書き込みます。

<Image img={ch_local_03} size='lg' alt='セルフマネージド ClickHouse の移行'  />

### 移行先の ClickHouse Cloud サービスにおいて: {#on-the-destination-clickhouse-cloud-service}

#### 宛先データベースを作成する： {#create-the-destination-database}

```sql
  CREATE DATABASE db
```

#### MySQL テーブルと同じスキーマを持つ宛先テーブルを作成します： {#create-a-destination-table-that-has-a-schema-equivalent-to-the-mysql-table}

```sql
  CREATE TABLE db.table ...
```

:::note
ClickHouse Cloud の宛先テーブルのスキーマと、元の MySQL テーブルのスキーマは揃っている必要があります（カラム名と順序が同じであり、かつカラムのデータ型が互換性を持っている必要があります）。
:::

### clickhouse-local を実行しているホストマシン上で: {#on-the-clickhouse-local-host-machine}

#### マイグレーション用のクエリを指定して clickhouse-local を実行する: {#run-clickhouse-local-with-the-migration-query}

```sql
  ./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
  ```

:::note
`clickhouse-local` ホストマシン上にデータがローカル保存されることはありません。代わりに、データはソースの MySQL テーブルから読み込まれ、そのまま ClickHouse Cloud サービス上の宛先テーブルに書き込まれます。
:::

## 例 2: JDBC ブリッジを使用して MySQL から ClickHouse Cloud へ移行する {#example-2-migrating-from-mysql-to-clickhouse-cloud-with-the-jdbc-bridge}

ソースの MySQL データベースからデータを読み取るために、[jdbc table function](/sql-reference/table-functions/jdbc.md) によってオンデマンドで作成される [JDBC integration table engine](/engines/table-engines/integrations/jdbc.md) を、[ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) と MySQL JDBC ドライバーと組み合わせて使用します。データを書き込む際には、[remoteSecure table function](/sql-reference/table-functions/remote.md) を使用して、宛先となる ClickHouse Cloud サービス上のテーブルにデータを書き込みます。

<Image img={ch_local_04} size='lg' alt="セルフマネージドな ClickHouse の移行"  />

### 宛先の ClickHouse Cloud サービスで: {#on-the-destination-clickhouse-cloud-service-1}

#### ターゲットデータベースを作成します： {#create-the-destination-database-1}

```sql
  CREATE DATABASE db
```
