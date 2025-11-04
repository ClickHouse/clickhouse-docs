---
'slug': '/integrations/postgresql/connecting-to-postgresql'
'title': 'PostgreSQLへの接続'
'keywords':
- 'clickhouse'
- 'postgres'
- 'postgresql'
- 'connect'
- 'integrate'
- 'table'
- 'engine'
'description': 'PostgreSQLをClickHouseに接続するためのさまざまな方法について説明するページ'
'show_related_blogs': true
'doc_type': 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouseとPostgreSQLの接続

このページでは、PostgreSQLとClickHouseを統合するための以下のオプションをカバーしています。

- PostgreSQLテーブルエンジンを使用して、PostgreSQLテーブルから読み取る
- 実験的なMaterializedPostgreSQLデータベースエンジンを使用して、PostgreSQLのデータベースをClickHouseのデータベースと同期する

:::tip
[ClickPipes](/integrations/clickpipes/postgres)を使用することをお勧めします。これは、PeerDBによって支援されたClickHouse Cloud向けの管理統合サービスです。別の選択肢として、PostgreSQLデータベースのレプリケーションに特化したオープンソースのCDCツールである[PeerDB](https://github.com/PeerDB-io/peerdb)も利用可能です。
:::

## PostgreSQLテーブルエンジンを使用する {#using-the-postgresql-table-engine}

`PostgreSQL`テーブルエンジンは、ClickHouseからリモートのPostgreSQLサーバーに保存されたデータに対して**SELECT**および**INSERT**操作を可能にします。この文書では、1つのテーブルを使用して基本的な統合方法を示します。

### 1. PostgreSQLの設定 {#1-setting-up-postgresql}
1.  `postgresql.conf`に、PostgreSQLがネットワークインターフェースをリッスンできるようにするためのエントリを追加します：
```text
listen_addresses = '*'
```

2. ClickHouseから接続するためのユーザーを作成します。デモンストレーションの目的で、この例ではフルスーパーユーザー権限を付与します。
```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```

3. PostgreSQLに新しいデータベースを作成します：
```sql
CREATE DATABASE db_in_psg;
```

4. 新しいテーブルを作成します：
```sql
CREATE TABLE table1 (
    id         integer primary key,
    column1    varchar(10)
);
```

5. テスト用にいくつかの行を追加しましょう：
```sql
INSERT INTO table1
  (id, column1)
VALUES
  (1, 'abc'),
  (2, 'def');
```

6. レプリケーションのために新しいユーザーが新しいデータベースへの接続を許可するようにPostgreSQLを設定するには、`pg_hba.conf`ファイルに以下のエントリを追加します。PostgreSQLサーバーのサブネットまたはIPアドレスでアドレス行を更新してください：
```text

# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db_in_psg             clickhouse_user 192.168.1.0/24          password
```

7. `pg_hba.conf`の設定を再読み込みします（バージョンに応じてこのコマンドを調整してください）：
```text
/usr/pgsql-12/bin/pg_ctl reload
```

8. 新しい `clickhouse_user` がログインできるか確認します：
```text
psql -U clickhouse_user -W -d db_in_psg -h <your_postgresql_host>
```

:::note
ClickHouse Cloudでこの機能を使用している場合、ClickHouse CloudのIPアドレスがPostgreSQLインスタンスにアクセスできるように許可する必要があります。アクセスに関する詳細は、ClickHouseの[Cloud Endpoints API](/cloud/get-started/query-endpoints)を確認してください。
:::

### 2. ClickHouseにテーブルを定義する {#2-define-a-table-in-clickhouse}
1. `clickhouse-client`にログインします：
```bash
clickhouse-client --user default --password ClickHouse123!
```

2. 新しいデータベースを作成します：
```sql
CREATE DATABASE db_in_ch;
```

3. `PostgreSQL`を使用するテーブルを作成します：
```sql
CREATE TABLE db_in_ch.table1
(
    id UInt64,
    column1 String
)
ENGINE = PostgreSQL('postgres-host.domain.com:5432', 'db_in_psg', 'table1', 'clickhouse_user', 'ClickHouse_123');
```

  必要な最小パラメーターは次のとおりです：

  |parameter|Description                 |example              |
  |---------|----------------------------|---------------------|
  |host:port|ホスト名またはIPとポート     |postgres-host.domain.com:5432|
  |database |PostgreSQLデータベース名         |db_in_psg                  |
  |user     |PostgreSQLに接続するためのユーザー名|clickhouse_user     |
  |password |PostgreSQLに接続するためのパスワード|ClickHouse_123       |

  :::note
  パラメーターの完全なリストについては、[PostgreSQLテーブルエンジン](/engines/table-engines/integrations/postgresql)のドキュメントページを参照してください。
  :::

### 3 統合をテストする {#3-test-the-integration}

1. ClickHouseで初期行を表示します：
```sql
SELECT * FROM db_in_ch.table1
```

  ClickHouseテーブルは、PostgreSQLのテーブルに既に存在していた2行で自動的に埋められるはずです：
```response
Query id: 34193d31-fe21-44ac-a182-36aaefbd78bf

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
└────┴─────────┘
```

2. PostgreSQLに戻り、テーブルにいくつかの行を追加します：
```sql
INSERT INTO table1
  (id, column1)
VALUES
  (3, 'ghi'),
  (4, 'jkl');
```

4. その2つの新しい行がClickHouseテーブルに表示されるはずです：
```sql
SELECT * FROM db_in_ch.table1
```

  レスポンスは次のようになります：
```response
Query id: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘
```

5. ClickHouseテーブルに行を追加するとどうなるか見てみましょう：
```sql
INSERT INTO db_in_ch.table1
  (id, column1)
VALUES
  (5, 'mno'),
  (6, 'pqr');
```

6. ClickHouseに追加された行がPostgreSQLのテーブルに表示されるはずです：
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

この例は、`PostgreSQL`テーブルエンジンを使用したPostgreSQLとClickHouse間の基本的な統合を示しました。スキーマの指定、一部のカラムのみを返すこと、複数のレプリカへの接続などの機能については、[PostgreSQLテーブルエンジンのドキュメントページ](/engines/table-engines/integrations/postgresql)を参照してください。また、[ClickHouseとPostgreSQL - データの天国での出会い - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)のブログもご覧ください。

## MaterializedPostgreSQLデータベースエンジンを使用する {#using-the-materializedpostgresql-database-engine}

<CloudNotSupportedBadge />
<ExperimentalBadge />

PostgreSQLデータベースエンジンは、PostgreSQLのレプリケーション機能を使用して、全てまたはサブセットのスキーマとテーブルを持つデータベースのレプリカを作成します。この文書では、1つのデータベース、1つのスキーマ、1つのテーブルを使用して基本的な統合方法を示します。

***以下の操作では、PostgreSQL CLI (psql)とClickHouse CLI (clickhouse-client)を使用します。PostgreSQLサーバーはLinuxにインストールされています。以下は新しいテストインストールの最小設定です***

### 1. PostgreSQLで {#1-in-postgresql}
1.  `postgresql.conf`で、最小リッスンレベル、レプリケーションWALレベル、およびレプリケーションスロットを設定します：

次のエントリを追加します：
```text
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```
_*ClickHouseは`logical` WALレベルと最低`2`のレプリケーションスロットが必要です_

2. 管理アカウントを使用して、ClickHouseから接続するためのユーザーを作成します：
```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```
_*デモンストレーション目的で、フルスーパーユーザー権限が付与されています。_

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

7. 新しいユーザーがレプリケーションのために新しいデータベースへの接続を許可するようにPostgreSQLを構成します。以下は`pg_hba.conf`ファイルに追加する最小エントリです：

```text

# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```
_*デモンストレーション目的で、これは平文パスワード認証方式を使用しています。アドレス行は、PostgreSQLのドキュメントに従ってサーバーのサブネットまたはアドレスで更新してください。_

8. `pg_hba.conf`の設定を再読み込みします（バージョンに応じて調整してください）：
```text
/usr/pgsql-12/bin/pg_ctl reload
```

9. 新しい`clickhouse_user`でログインをテストします：
```text
psql -U clickhouse_user -W -d db1 -h <your_postgresql_host>
```

### 2. ClickHouseで {#2-in-clickhouse}
1. ClickHouse CLIにログインします：
```bash
clickhouse-client --user default --password ClickHouse123!
```

2. データベースエンジンのためにPostgreSQLの実験的機能を有効にします：
```sql
SET allow_experimental_database_materialized_postgresql=1
```

3. レプリケートされる新しいデータベースを作成し、初期テーブルを定義します：
```sql
CREATE DATABASE db1_postgres
ENGINE = MaterializedPostgreSQL('postgres-host.domain.com:5432', 'db1', 'clickhouse_user', 'ClickHouse_123')
SETTINGS materialized_postgresql_tables_list = 'table1';
```
最小オプション：

|parameter|Description                 |example              |
|---------|----------------------------|---------------------|
|host:port|ホスト名またはIPとポート     |postgres-host.domain.com:5432|
|database |PostgreSQLデータベース名         |db1                  |
|user     |PostgreSQLに接続するためのユーザー名|clickhouse_user     |
|password |PostgreSQLに接続するためのパスワード|ClickHouse_123       |
|settings |エンジンの追加設定| materialized_postgresql_tables_list = 'table1'|

:::info
PostgreSQLデータベースエンジンの完全なガイドについては、https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settingsを参照してください。
:::

4. 初期テーブルにデータがあることを確認します：

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

### 3. 基本的なレプリケーションをテストする {#3-test-basic-replication}
1. PostgreSQLに新しい行を追加します：
```sql
INSERT INTO table1
(id, column1)
VALUES
(3, 'ghi'),
(4, 'jkl');
```

2. ClickHouseで新しい行が表示されることを確認します：
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
この統合ガイドでは、テーブルを持つデータベースの複製方法についてのシンプルな例に焦点を当てましたが、実際には全データベースを複製したり、既存のレプリケーションに新しいテーブルやスキーマを追加したりするなどのより高度なオプションも存在します。このレプリケーションではDDLコマンドはサポートされていませんが、エンジンを変更を検出し、構造的な変更が行われた場合にテーブルを再読み込みするように設定できます。

:::info
高度なオプションで利用可能なより多くの機能については、[リファレンスドキュメント](/engines/database-engines/materialized-postgresql)を参照してください。
:::
