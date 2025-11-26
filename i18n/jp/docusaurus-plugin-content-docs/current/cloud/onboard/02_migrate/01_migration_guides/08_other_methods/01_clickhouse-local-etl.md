---
sidebar_label: 'clickhouse-local を使用する'
keywords: ['clickhouse', 'migrate', 'migration', 'migrating', 'data', 'etl', 'elt', 'clickhouse-local', 'clickhouse-client']
slug: /cloud/migration/clickhouse-local
title: 'clickhouse-local を使用して ClickHouse へ移行する'
description: 'clickhouse-local を使用して ClickHouse へ移行するためのガイド'
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

<Image img={ch_local_01} size='sm' alt='セルフマネージド ClickHouse の移行' background='white' />

ClickHouse、より具体的には [`clickhouse-local`](/operations/utilities/clickhouse-local.md) を、現在利用しているデータベースシステムから ClickHouse Cloud へのデータ移行のための ETL ツールとして利用できます。ただし、現在のデータベースシステムに対して、ClickHouse が提供する [integration engine](/engines/table-engines/#integration-engines) または [table function](/sql-reference/table-functions/) のいずれかが存在するか、あるいはベンダー提供の JDBC ドライバまたは ODBC ドライバが利用可能である必要があります。

この移行方法は、ソースデータベースからデスティネーションデータベースへデータを移動する際に、中間的なピボットポイント（中継点）を利用するため、「ピボット方式」と呼ぶことがあります。例えば、セキュリティ要件により、プライベートまたは内部ネットワーク内からは外向き接続のみが許可されている場合、この方法が必要になることがあります。その場合、`clickhouse-local` でソースデータベースからデータを取得し、その後デスティネーションの ClickHouse データベースにデータを投入します。このとき、`clickhouse-local` がピボットポイントとして機能します。

ClickHouse は、[MySQL](/engines/table-engines/integrations/mysql/)、[PostgreSQL](/engines/table-engines/integrations/postgresql)、[MongoDB](/engines/table-engines/integrations/mongodb)、および [SQLite](/engines/table-engines/integrations/sqlite) 向けの integration engine と（オンザフライで integration engine を作成する）table function を提供しています。
その他の一般的なデータベースシステムについては、そのシステムのベンダーから JDBC ドライバまたは ODBC ドライバが提供されています。



## clickhouse-local とは何ですか？ {#what-is-clickhouse-local}

<Image img={ch_local_02} size='lg' alt='自己管理型 ClickHouse の移行' background='white' />

通常、ClickHouse はクラスター構成で実行されます。複数の ClickHouse データベースエンジンのインスタンスが、異なるサーバー上で分散して実行されます。

単一サーバー上では、ClickHouse データベースエンジンは `clickhouse-server` プログラムの一部として実行されます。データベースアクセス（パス、ユーザー、セキュリティなど）は、サーバー構成ファイルで設定します。

`clickhouse-local` ツールを使用すると、ClickHouse サーバーを構成して起動することなく、コマンドラインユーティリティとして単体で動作する ClickHouse データベースエンジンを利用し、さまざまな入力および出力に対して超高速な SQL データ処理を行うことができます。



## clickhouse-local のインストール {#installing-clickhouse-local}

`clickhouse-local` を実行するホストマシンが必要です。このマシンから、現在のソースデータベースシステムと、移行先である ClickHouse Cloud サービスの両方にネットワーク接続できる必要があります。

そのホストマシン上で、お使いのコンピューターのオペレーティングシステムに応じたビルドの `clickhouse-local` をダウンロードします。

<Tabs groupId="os">
<TabItem value="linux" label="Linux" >

1. `clickhouse-local` をローカルにダウンロードする最も簡単な方法は、次のコマンドを実行することです。
  ```bash
  curl https://clickhouse.com/ | sh
  ```

1. `clickhouse-local` を実行します（バージョンが表示されるだけです）。
  ```bash
  ./clickhouse-local
  ```

</TabItem>
<TabItem value="mac" label="macOS">

1. `clickhouse-local` をローカルにダウンロードする最も簡単な方法は、次のコマンドを実行することです。
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
このガイド全体のサンプルでは、`clickhouse-local` を実行する際に Linux 向けのコマンド（`./clickhouse-local`）を使用しています。
Mac で `clickhouse-local` を実行するには、`./clickhouse local` を使用してください。
:::

:::tip ClickHouse Cloud サービスの IP アクセスリストにリモートシステムを追加する
`remoteSecure` 関数が ClickHouse Cloud サービスに接続できるようにするには、リモートシステムの IP アドレスが IP アクセスリストで許可されている必要があります。詳細については、このヒントの下にある **Manage your IP Access List** を展開してください。
:::

  <AddARemoteSystem />



## 例 1: Integration テーブルエンジンを使用して MySQL から ClickHouse Cloud へ移行する

ソースの MySQL データベースからデータを読み取るために、[mysql テーブル関数](/sql-reference/table-functions/mysql/) によって動的に作成される [integration テーブルエンジン](/engines/table-engines/integrations/mysql/) を使用し、ClickHouse Cloud サービス上の宛先テーブルにデータを書き込むために [remoteSecure テーブル関数](/sql-reference/table-functions/remote/) を使用します。

<Image img={ch_local_03} size="sm" alt="自己管理型 ClickHouse からの移行" background="white" />

### 宛先側の ClickHouse Cloud サービスで:

#### 宛先データベースを作成する:

```sql
CREATE DATABASE db
```

#### MySQL テーブルと同じスキーマを持つ出力先テーブルを作成します:

```sql
CREATE TABLE db.table ...
```

:::note
ClickHouse Cloud の宛先テーブルのスキーマと、元の MySQL テーブルのスキーマは整合している必要があります（カラム名と順序が同一であり、かつカラムのデータ型が互換性を持っている必要があります）。
:::

### clickhouse-local を実行するホストマシン上で:

#### マイグレーション用クエリで clickhouse-local を実行します:

```sql
./clickhouse-local --query "
INSERT INTO FUNCTION
remoteSecure('HOSTNAME.clickhouse.cloud:9440', 'db.table', 'default', 'PASS')
SELECT * FROM mysql('host:port', 'database', 'table', 'user', 'password');"
```

:::note
`clickhouse-local` ホストマシン上にはデータは一切保存されません。データはソース側の MySQL テーブルから読み取られ、そのまま ClickHouse Cloud サービス上の宛先テーブルに書き込まれます。
:::


## 例 2: JDBC ブリッジを使用して MySQL から ClickHouse Cloud へ移行する

[jdbc テーブル関数](/sql-reference/table-functions/jdbc.md) によってオンザフライで作成される [JDBC integration テーブルエンジン](/engines/table-engines/integrations/jdbc.md) を、[ClickHouse JDBC Bridge](https://github.com/ClickHouse/clickhouse-jdbc-bridge) および MySQL JDBC ドライバーと組み合わせて使用してソースの MySQL データベースからデータを読み取り、[remoteSecure テーブル関数](/sql-reference/table-functions/remote.md)
を使用して ClickHouse Cloud サービス上の宛先テーブルにデータを書き込みます。

<Image img={ch_local_04} size="sm" alt="自己管理型 ClickHouse からの移行" background="white" />

### 宛先の ClickHouse Cloud サービス側での作業:

#### 宛先データベースを作成する:

```sql
CREATE DATABASE db
```
