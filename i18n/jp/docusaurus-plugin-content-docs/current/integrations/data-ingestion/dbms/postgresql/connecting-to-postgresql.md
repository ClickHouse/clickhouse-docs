---
slug: /integrations/postgresql/connecting-to-postgresql
title: 'PostgreSQLへの接続'
keywords: ['clickhouse', 'postgres', 'postgresql', 'connect', 'integrate', 'table', 'engine']
description: 'PostgreSQLをClickHouseに接続するさまざまな方法を説明するページ'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouseとPostgreSQLの接続

このページでは、PostgreSQLとClickHouseを統合するための以下のオプションについて説明します。

- [ClickPipes](/integrations/clickpipes/postgres)を使用して、PeerDBにより提供されるClickHouse Cloud向けのマネージド統合サービスを利用する - 現在パブリックベータ版中です！
- 自己ホストされたClickHouseおよびClickHouse CloudへのPostgreSQLデータベースのレプリケーション用に特別に設計されたオープンソースのCDCツールである[PeerDB](https://github.com/PeerDB-io/peerdb)を使用する。
- PostgreSQLテーブルから読み取るための`PostgreSQL`テーブルエンジンを使用する。
- PostgreSQLのデータベースとClickHouseのデータベースを同期するための実験的な`MaterializedPostgreSQL`データベースエンジンを使用する。

## PostgreSQLテーブルエンジンの使用 {#using-the-postgresql-table-engine}

`PostgreSQL`テーブルエンジンを使用すると、ClickHouseからリモートのPostgreSQLサーバーに格納されているデータに対して**SELECT**および**INSERT**操作を行うことができます。
この記事では、1つのテーブルを使用した基本的な統合方法を示します。

### 1. PostgreSQLの設定 {#1-setting-up-postgresql}
1. `postgresql.conf`に、PostgreSQLがネットワークインターフェースでリッスンするように次のエントリを追加します:
  ```text
  listen_addresses = '*'
  ```

2. ClickHouseから接続するためのユーザーを作成します。この例では、デモの目的でフルスーパーユーザー権限を与えています。
  ```sql
  CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
  ```

3. PostgreSQLに新しいデータベースを作成します:
  ```sql
  CREATE DATABASE db_in_psg;
  ```

4. 新しいテーブルを作成します:
  ```sql
  CREATE TABLE table1 (
      id         integer 主キー,
      column1    varchar(10)
  );
  ```

5. テスト用にいくつかの行を追加しましょう:
  ```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (1, 'abc'),
    (2, 'def');
  ```

6. 新しいユーザーでレプリケーションのために新しいデータベースへの接続を許可するため、`pg_hba.conf`ファイルに次のエントリを追加します。アドレス行はPostgreSQLサーバーのサブネットまたはIPアドレスに更新してください:
  ```text
  # TYPE  DATABASE        USER            ADDRESS                 METHOD
  host    db_in_psg             clickhouse_user 192.168.1.0/24          password
  ```

7. `pg_hba.conf`構成を再読み込みします（このコマンドは、バージョンに応じて調整してください）:
  ```text
  /usr/pgsql-12/bin/pg_ctl reload
  ```

8. 新しい`clickhouse_user`がログインできるか確認します:
  ```text
  psql -U clickhouse_user -W -d db_in_psg -h <your_postgresql_host>
  ```

:::note
ClickHouse Cloudでこの機能を使用している場合は、ClickHouse CloudのIPアドレスがPostgreSQLインスタンスにアクセスできるようにする必要があります。
ClickHouseの[Cloud Endpoints API](/cloud/get-started/query-endpoints)でエグレストラフィックの詳細を確認してください。
:::

### 2. ClickHouseでのテーブルの定義 {#2-define-a-table-in-clickhouse}
1. `clickhouse-client`にログインします:
  ```bash
  clickhouse-client --user default --password ClickHouse123!
  ```

2. 新しいデータベースを作成します:
  ```sql
  CREATE DATABASE db_in_ch;
  ```

3. `PostgreSQL`を使用するテーブルを作成します:
  ```sql
  CREATE TABLE db_in_ch.table1
  (
      id UInt64,
      column1 String
  )
  ENGINE = PostgreSQL('postgres-host.domain.com:5432', 'db_in_psg', 'table1', 'clickhouse_user', 'ClickHouse_123');
  ```

  必要な最低限のパラメータは次の通りです:

  |parameter|説明                       |例                           |
  |---------|--------------------------|-----------------------------|
  |host:port|ホスト名またはIPとポート      |postgres-host.domain.com:5432|
  |database |PostgreSQLデータベース名      |db_in_psg                    |
  |user     |Postgresへの接続に使用するユーザー名 |clickhouse_user              |
  |password |Postgresへの接続に必要なパスワード |ClickHouse_123               |

  :::note
  パラメータの完全なリストについては、[PostgreSQLテーブルエンジン](/engines/table-engines/integrations/postgresql)のドキュメントを参照してください。
  :::

### 3 統合のテスト {#3-test-the-integration}

1. ClickHouseで初期行を表示します:
  ```sql
  SELECT * FROM db_in_ch.table1
  ```

  ClickHouseテーブルは、PostgreSQLのテーブルにすでに存在する2行で自動的に埋められているはずです:
  ```response
  クエリID: 34193d31-fe21-44ac-a182-36aaefbd78bf

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  └────┴─────────┘
  ```

2. PostgreSQLに戻り、テーブルにいくつかの行を追加します:
  ```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (3, 'ghi'),
    (4, 'jkl');
  ```

4. これら2行がClickHouseのテーブルに表示されるべきです:
  ```sql
  SELECT * FROM db_in_ch.table1
  ```

  レスポンスは次のようになります:
  ```response
  クエリID: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  │  3 │ ghi     │
  │  4 │ jkl     │
  └────┴─────────┘
  ```

5. ClickHouseのテーブルに行を追加した場合の結果を見てみましょう:
  ```sql
  INSERT INTO db_in_ch.table1
    (id, column1)
  VALUES
    (5, 'mno'),
    (6, 'pqr');
  ```

6. ClickHouseで追加した行が、PostgreSQLのテーブルに表示されるべきです:
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
  (6 行)
  ```

この例は、`PostgreSQL`テーブルエンジンを使用したPostgreSQLとClickHouseの基本的な統合を示しています。
スキーマの指定や、カラムの部分集合を返すこと、多数のレプリカへの接続などの機能については、[PostgreSQLテーブルエンジンのドキュメント](/engines/table-engines/integrations/postgresql)を参照してください。また、[ClickHouseとPostgreSQL - データの天国における出会い - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)ブログもチェックしてください。

## MaterializedPostgreSQLデータベースエンジンの使用 {#using-the-materializedpostgresql-database-engine}

<CloudNotSupportedBadge />
<ExperimentalBadge />

PostgreSQLデータベースエンジンは、PostgreSQLのレプリケーション機能を使用して、すべてのスキーマおよびテーブルまたはそのサブセットのデータベースのレプリカを作成します。
この記事では、1つのデータベース、1つのスキーマ、1つのテーブルを使用した基本的な統合方法を示します。

***以下の手順では、PostgreSQL CLI（psql）とClickHouse CLI（clickhouse-client）を使用します。PostgreSQLサーバーはLinuxにインストールされています。新しいテストインストールの最小設定は以下のとおりです***

### 1. PostgreSQLにおいて {#1-in-postgresql}
1. `postgresql.conf`で、最小リッスンレベル、レプリケーションWALレベル、レプリケーションスロットを設定します:

次のエントリを追加します：
```text
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```
_*ClickHouseは、`logical` WALレベルと最小`2`レプリケーションスロットを必要とします_

2. 管理アカウントを使用して、ClickHouseから接続するためのユーザーを作成します:
```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```
_*デモ目的で、フルスーパーユーザー権限が付与されています。_

3. 新しいデータベースを作成します:
```sql
CREATE DATABASE db1;
```

4. `psql`で新しいデータベースに接続します:
```text
\connect db1
```

5. 新しいテーブルを作成します:
```sql
CREATE TABLE table1 (
    id         integer 主キー,
    column1    varchar(10)
);
```

6. 初期行を追加します:
```sql
INSERT INTO table1
(id, column1)
VALUES
(1, 'abc'),
(2, 'def');
```

7. レプリケーションのために新しいユーザーで新しいデータベースへの接続を許可するようPostgreSQLを設定します。以下は`pg_hba.conf`ファイルに追加する最小エントリです:

```text

# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```
_*デモ目的で、平文パスワード認証方式を使用しています。アドレス行は、PostgreSQLのドキュメントに従ってサーバーのサブネットまたはアドレスで更新してください。_

8. 次のようなコマンドで`pg_hba.conf`の設定を再読み込みします（バージョンに応じて調整してください）:
```text
/usr/pgsql-12/bin/pg_ctl reload
```

9. 新しい`clickhouse_user`でログインテストをします:
```text
 psql -U clickhouse_user -W -d db1 -h <your_postgresql_host>
```

### 2. ClickHouseにおいて {#2-in-clickhouse}
1. ClickHouse CLIにログインします
```bash
clickhouse-client --user default --password ClickHouse123!
```

2. PostgreSQLの実験的機能をデータベースエンジンに対して有効にします:
```sql
SET allow_experimental_database_materialized_postgresql=1
```

3. レプリケートする新しいデータベースを作成し、初期テーブルを定義します:
```sql
CREATE DATABASE db1_postgres
ENGINE = MaterializedPostgreSQL('postgres-host.domain.com:5432', 'db1', 'clickhouse_user', 'ClickHouse_123')
SETTINGS materialized_postgresql_tables_list = 'table1';
```
最小オプションは次の通りです:

|parameter|説明                       |例                           |
|---------|--------------------------|-----------------------------|
|host:port|ホスト名またはIPとポート      |postgres-host.domain.com:5432|
|database |PostgreSQLデータベース名      |db1                          |
|user     |Postgresへの接続に使用するユーザー名 |clickhouse_user              |
|password |Postgresへの接続に必要なパスワード |ClickHouse_123               |
|settings |エンジンの追加設定          | materialized_postgresql_tables_list = 'table1'|

:::info
PostgreSQLデータベースエンジンの完全ガイドについては、https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settingsを参照してください。
:::

4. 初期テーブルにデータがあるか確認します:

```sql
ch_env_2 :) select * from db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

クエリID: df2381ac-4e30-4535-b22e-8be3894aaafc

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

### 3. 基本的なレプリケーションのテスト {#3-test-basic-replication}
1. PostgreSQLに新しい行を追加します:
```sql
INSERT INTO table1
(id, column1)
VALUES
(3, 'ghi'),
(4, 'jkl');
```

2. ClickHouseで新しい行が見えるか確認します:
```sql
ch_env_2 :) select * from db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

クエリID: b0729816-3917-44d3-8d1a-fed912fb59ce

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
この統合ガイドは、データベースとテーブルをレプリケートするシンプルな例に焦点を当てていますが、全体のデータベースのレプリケーションや、既存のレプリケーションに新しいテーブルやスキーマを追加するなど、より高度なオプションも存在します。DDLコマンドはこのレプリケーションにはサポートされていませんが、エンジンは変更を検出し、構造的な変更が行われたときにテーブルを再読み込みするように設定できます。

:::info
高度なオプションで利用可能な機能については、[リファレンスドキュメント](/engines/database-engines/materialized-postgresql)を参照してください。
:::


## 関連コンテンツ {#related-content}
- ブログ: [ClickHouseとPostgreSQL - データの天国における出会い - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouseとPostgreSQL - データの天国における出会い - パート2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
