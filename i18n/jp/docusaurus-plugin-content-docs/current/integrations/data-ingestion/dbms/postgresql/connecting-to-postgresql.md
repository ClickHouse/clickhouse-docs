---
slug: '/integrations/postgresql/connecting-to-postgresql'
title: 'Connecting to PostgreSQL'
keywords:
- 'clickhouse'
- 'postgres'
- 'postgresql'
- 'connect'
- 'integrate'
- 'table'
- 'engine'
description: 'Page describing the various ways to connect PostgreSQL to ClickHouse'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouseとPostgreSQLの接続

このページでは、PostgreSQLをClickHouseと統合するための以下のオプションを説明します。

- [ClickPipes](/integrations/clickpipes/postgres)を使用する。PeerDBによって提供されるClickHouse Cloud用のマネージド統合サービスで、現在はパブリックベータ版です。
- [PeerDB](https://github.com/PeerDB-io/peerdb)を使用する。PostgreSQLデータベースのレプリケーションに特化したオープンソースのCDCツールで、セルフホストされるClickHouseおよびClickHouse Cloudの両方に対応しています。
- `PostgreSQL`テーブルエンジンを使用し、PostgreSQLテーブルからの読み込みを行う。
- 実験的な`MaterializedPostgreSQL`データベースエンジンを使用し、PostgreSQLのデータベースとClickHouseのデータベースを同期する。

## PostgreSQLテーブルエンジンの使用 {#using-the-postgresql-table-engine}

`PostgreSQL`テーブルエンジンは、ClickHouseからリモートのPostgreSQLサーバー上に保存されたデータに対して**SELECT**および**INSERT**操作を許可します。このドキュメントでは、1つのテーブルを使用した基本的な統合方法を説明します。

### 1. PostgreSQLの設定 {#1-setting-up-postgresql}
1. `postgresql.conf`に、PostgreSQLがネットワークインターフェースでリスンするように以下のエントリを追加します。
  ```text
  listen_addresses = '*'
  ```

2. ClickHouseから接続するためのユーザーを作成します。デモンストレーションの目的で、この例では完全なスーパーユーザー権限を付与します。
  ```sql
  CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
  ```

3. PostgreSQLに新しいデータベースを作成します。
  ```sql
  CREATE DATABASE db_in_psg;
  ```

4. 新しいテーブルを作成します。
  ```sql
  CREATE TABLE table1 (
      id         integer primary key,
      column1    varchar(10)
  );
  ```

5. テスト用にいくつかの行を追加します。
  ```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (1, 'abc'),
    (2, 'def');
  ```

6. 新しいユーザーで新しいデータベースへの接続を許可するようにPostgreSQLを構成するには、`pg_hba.conf`ファイルに以下のエントリを追加します。アドレス行は、PostgreSQLサーバーのサブネットまたはIPアドレスで更新してください。
  ```text
  # TYPE  DATABASE        USER            ADDRESS                 METHOD
  host    db_in_psg             clickhouse_user 192.168.1.0/24          password
  ```

7. `pg_hba.conf`設定をリロードします（このコマンドはバージョンによって調整してください）。
  ```text
  /usr/pgsql-12/bin/pg_ctl reload
  ```

8. 新しい`clickhouse_user`がログインできるか確認します。
  ```text
  psql -U clickhouse_user -W -d db_in_psg -h <your_postgresql_host>
  ```

:::note
ClickHouse Cloudでこの機能を使用している場合は、ClickHouse CloudのIPアドレスがPostgreSQLインスタンスにアクセスできるようにする必要があるかもしれません。
ClickHouseの[Cloud Endpoints API](/cloud/get-started/query-endpoints)で、送信トラフィックの詳細を確認してください。
:::

### 2. ClickHouseでテーブルを定義 {#2-define-a-table-in-clickhouse}
1. `clickhouse-client`にログインします。
  ```bash
  clickhouse-client --user default --password ClickHouse123!
  ```

2. 新しいデータベースを作成します。
  ```sql
  CREATE DATABASE db_in_ch;
  ```

3. `PostgreSQL`を使用するテーブルを作成します。
  ```sql
  CREATE TABLE db_in_ch.table1
  (
      id UInt64,
      column1 String
  )
  ENGINE = PostgreSQL('postgres-host.domain.com:5432', 'db_in_psg', 'table1', 'clickhouse_user', 'ClickHouse_123');
  ```

  必要な最小パラメーターは以下の通りです：

  |parameter|Description                 |example              |
  |---------|----------------------------|---------------------|
  |host:port|ホスト名またはIPとポート     |postgres-host.domain.com:5432|
  |database |PostgreSQLデータベース名         |db_in_psg                  |
  |user     |PostgreSQLへの接続ユーザー名|clickhouse_user     |
  |password |PostgreSQLへの接続パスワード|ClickHouse_123       |

  :::note
  完全なパラメーターリストについては、[PostgreSQLテーブルエンジン](/engines/table-engines/integrations/postgresql)のドキュメントページをご覧ください。
  :::

### 3 統合のテスト {#3-test-the-integration}

1. ClickHouseで初期行を表示します：
  ```sql
  SELECT * FROM db_in_ch.table1
  ```

  ClickHouseのテーブルには、PostgreSQLのテーブルに既に存在している2行が自動的に反映されているはずです：
  ```response
  Query id: 34193d31-fe21-44ac-a182-36aaefbd78bf

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  └────┴─────────┘
  ```

2. PostgreSQLに戻り、テーブルに行をいくつか追加します：
  ```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (3, 'ghi'),
    (4, 'jkl');
  ```

4. 新しく追加された2行がClickHouseテーブルに表示されるはずです：
  ```sql
  SELECT * FROM db_in_ch.table1
  ```

  応答は次のようになります：
  ```response
  Query id: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  │  3 │ ghi     │
  │  4 │ jkl     │
  └────┴─────────┘
  ```

5. ClickHouseテーブルに行を追加すると何が起こるか見てみましょう：
  ```sql
  INSERT INTO db_in_ch.table1
    (id, column1)
  VALUES
    (5, 'mno'),
    (6, 'pqr');
  ```

6. ClickHouseで追加された行はPostgreSQLのテーブルに表示されるはずです：
  ```sql
  db_in_psg=# SELECT * FROM table1;
  id | column1
  ----+---------
    1 | abc
    2 | def
    3 | ghi
    4 | jkl
    5 | mno
    6 | pqr
  (6 rows)
  ```

この例では、`PostgreSQL`テーブルエンジンを使用してPostgreSQLとClickHouseの基本的な統合を示しました。
他の機能としてスキーマの指定、カラムのサブセットのみを返すこと、複数のレプリカへの接続については、[PostgreSQLテーブルエンジンのドキュメントページ](/engines/table-engines/integrations/postgresql)をチェックしてください。また、[ClickHouseとPostgreSQL - データの天国における出会い - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)ブログもチェックしてください。

## MaterializedPostgreSQLデータベースエンジンの使用 {#using-the-materializedpostgresql-database-engine}

<CloudNotSupportedBadge />
<ExperimentalBadge />

PostgreSQLデータベースエンジンは、PostgreSQLのレプリケーション機能を利用して、すべてのスキーマとテーブルまたはそのサブセットのデータベースのレプリカを作成します。このドキュメントでは、1つのデータベース、1つのスキーマ、および1つのテーブルを使用した基本的な統合方法を示します。

***以下の手順では、PostgreSQL CLI (psql) と ClickHouse CLI (clickhouse-client) を使用します。PostgreSQLサーバーはLinuxにインストールされています。PostgreSQLデータベースが新しいテストインストールの場合は、以下の最小設定が必要です***

### 1. PostgreSQLでの設定 {#1-in-postgresql}
1. `postgresql.conf`で、最小のリスニングレベル、レプリケーションWALレベル、レプリケーションスロットを設定します。

次のエントリを追加します：
```text
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```
_*ClickHouseは最低`logical` WALレベルおよび2つのレプリケーションスロットが必要です。_

2. 管理者アカウントを使用し、ClickHouseから接続するためのユーザーを作成します：
```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```
_*デモ目的で、完全なスーパーユーザー権限が付与されました。_

3. 新しいデータベースを作成します：
```sql
CREATE DATABASE db1;
```

4. `psql`で新しいデータベースに接続します：
```text
\connect db1
```

5. 新しいテーブルを作成します：
```sql
CREATE TABLE table1 (
    id         integer primary key,
    column1    varchar(10)
);
```

6. 初期行を追加します：
```sql
INSERT INTO table1
(id, column1)
VALUES
(1, 'abc'),
(2, 'def');
```

7. PostgreSQLが新しいユーザーでレプリケーション用の新しいデータベースへの接続を許可するように構成します。以下は`pg_hba.conf`ファイルに追加する最小エントリです：

```text

# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```
_*デモ目的で、クリアテキストパスワード認証メソッドを使用しています。アドレス行はPostgreSQLドキュメントに従って、サーバーのサブネットまたはアドレスで更新してください。_

8. 次のようにして`pg_hba.conf`設定をリロードします（バージョンに応じて調整してください）：
```text
/usr/pgsql-12/bin/pg_ctl reload
```

9. 新しい`clickhouse_user`でログインをテストします：
```text
 psql -U clickhouse_user -W -d db1 -h <your_postgresql_host>
```

### 2. ClickHouseでの設定 {#2-in-clickhouse}
1. ClickHouse CLIにログインします：
```bash
clickhouse-client --user default --password ClickHouse123!
```

2. データベースエンジンのPostgreSQL実験的機能を有効にします：
```sql
SET allow_experimental_database_materialized_postgresql=1
```

3. レプリケーションされる新しいデータベースと初期テーブルを定義します：
```sql
CREATE DATABASE db1_postgres
ENGINE = MaterializedPostgreSQL('postgres-host.domain.com:5432', 'db1', 'clickhouse_user', 'ClickHouse_123')
SETTINGS materialized_postgresql_tables_list = 'table1';
```
最小オプションは以下の通りです：

|parameter|Description                 |example              |
|---------|----------------------------|---------------------|
|host:port|ホスト名またはIPとポート     |postgres-host.domain.com:5432|
|database |PostgreSQLデータベース名         |db1                  |
|user     |PostgreSQLへの接続ユーザー名|clickhouse_user     |
|password |PostgreSQLへの接続パスワード|ClickHouse_123       |
|settings |エンジンに関する追加設定| materialized_postgresql_tables_list = 'table1'|

:::info
PostgreSQLデータベースエンジンの完全なガイドについては、https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settingsを参照してください
:::

4. 初期テーブルにデータがあるか確認します：

```sql
ch_env_2 :) select * from db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

Query id: df2381ac-4e30-4535-b22e-8be3894aaafc

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

### 3. 基本的なレプリケーションのテスト {#3-test-basic-replication}
1. PostgreSQLで新しい行を追加します：
```sql
INSERT INTO table1
(id, column1)
VALUES
(3, 'ghi'),
(4, 'jkl');
```

2. ClickHouseで新しい行が見えることを確認します：
```sql
ch_env_2 :) select * from db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

Query id: b0729816-3917-44d3-8d1a-fed912fb59ce

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  4 │ jkl     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

### 4. まとめ {#4-summary}
この統合ガイドでは、テーブルを持つデータベースのレプリケーション方法に関する単純な例に焦点を当てましたが、データベース全体をレプリケートするか、新しいテーブルやスキーマを既存のレプリケーションに追加するなど、より高度なオプションも存在します。DDLコマンドはこのレプリケーションにはサポートされていませんが、エンジンは変更を検出し、構造変更が行われるとテーブルをリロードするように設定できます。

:::info
高度なオプションに使用可能な機能については、[リファレンスドキュメント](/engines/database-engines/materialized-postgresql)を参照してください。
:::

## 関連コンテンツ {#related-content}
- ブログ: [ClickHouseとPostgreSQL - データの天国における出会い - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouseとPostgreSQL - データの天国における出会い - パート2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
