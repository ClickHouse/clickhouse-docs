---
slug: /integrations/postgresql/connecting-to-postgresql
title: PostgreSQLへの接続
keywords: [clickhouse, postgres, postgresql, connect, integrate, table, engine]
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# ClickHouseをPostgreSQLに接続する

このページでは、PostgreSQLをClickHouseと統合するための以下のオプションについて説明します：

- [ClickPipes](/integrations/clickpipes/postgres)を使用する、ClickHouse Cloudのための管理された統合サービス - 現在、プライベートプレビュー中です。こちらから[サインアップしてください](https://clickpipes.peerdb.io/)
- `PeerDB by ClickHouse`を使用する、ClickHouse及びClickHouse CloudへのPostgreSQLデータベースレプリケーションのために特別に設計されたCDCツール
  - PeerDBは現在、ClickHouse Cloudにネイティブに対応しています - 私たちの[新しいClickPipeコネクタ](/integrations/clickpipes/postgres)を使用した、超高速PostgresからClickHouseへのCDC - 現在プライベートプレビュー中です。こちらから[サインアップしてください](https://clickpipes.peerdb.io/)
- PostgreSQLテーブルエンジンを使用する、PostgreSQLテーブルからデータを読み取るため
- 実験的な`MaterializedPostgreSQL`データベースエンジンを使用する、PostgreSQL内のデータベースをClickHouse内のデータベースと同期するため

## ClickPipesを使用する（PeerDBによる）{#using-clickpipes-powered-by-peerdb}

PeerDBは現在、ClickHouse Cloudにネイティブに対応しています - 私たちの[新しいClickPipeコネクタ](/integrations/clickpipes/postgres)を使用した、超高速PostgresからClickHouseへのCDC - 現在プライベートプレビュー中です。こちらから[サインアップしてください](https://clickpipes.peerdb.io/)

## PostgreSQLテーブルエンジンを使用する {#using-the-postgresql-table-engine}

`PostgreSQL`テーブルエンジンは、ClickHouseからリモートPostgreSQLサーバーに保存されているデータに対して**SELECT**および**INSERT**操作を許可します。この資料では、1つのテーブルを使用した基本的な統合方法を説明します。

### 1. PostgreSQLのセットアップ {#1-setting-up-postgresql}
1. `postgresql.conf`に以下のエントリーを追加して、PostgreSQLがネットワークインターフェースでリッスンするようにします:
  ```text
  listen_addresses = '*'
  ```

2. ClickHouseから接続するためのユーザーを作成します。デモンストレーション目的で、今回の例ではフルスーパーユーザー権限を付与します。
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
      id         integer primary key,
      column1    varchar(10)
  );
  ```

5. テスト用にいくつかの行を追加します:
  ```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (1, 'abc'),
    (2, 'def');
  ```

6. レプリケーション用に新しいユーザーで新しいデータベースへの接続を許可するようPostgreSQLを設定するために、`pg_hba.conf`ファイルに以下のエントリーを追加します。住所行をPostgreSQLサーバーのサブネットまたはIPアドレスに更新します:
  ```text
  # TYPE  DATABASE        USER            ADDRESS                 METHOD
  host    db_in_psg             clickhouse_user 192.168.1.0/24          password
  ```

7. `pg_hba.conf`の設定をリロードします（バージョンに応じてコマンドを調整してください）:
  ```text
  /usr/pgsql-12/bin/pg_ctl reload
  ```

8. 新しい`clickhouse_user`がログインできることを確認します:
  ```text
  psql -U clickhouse_user -W -d db_in_psg -h <your_postgresql_host>
  ```

:::note
ClickHouse Cloudでこの機能を使用する場合、ClickHouse CloudのIPアドレスにあなたのPostgreSQLインスタンスへのアクセスを許可する必要があります。
エグレストラフィックの詳細については、ClickHouseの[Cloud Endpoints API](/cloud/security/cloud-endpoints-api)を確認してください。
:::

### 2. ClickHouseでテーブルを定義する {#2-define-a-table-in-clickhouse}
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

  必要な最小限のパラメータは次のとおりです：

  |parameter|説明                     |例                           |
  |---------|-----------------------|---------------------------|
  |host:port|ホスト名またはIPおよびポート|postgres-host.domain.com:5432|
  |database |PostgreSQLのデータベース名     |db_in_psg                    |
  |user     |PostgreSQLに接続するためのユーザー名|clickhouse_user            |
  |password |PostgreSQLに接続するためのパスワード|ClickHouse_123             |

  :::note
  完全なパラメータリストについては、[PostgreSQLテーブルエンジン](/engines/table-engines/integrations/postgresql)のドキュメントページを参照してください。
  :::

### 3 統合のテスト {#3-test-the-integration}

1. ClickHouseで初期の行を表示します:
  ```sql
  SELECT * FROM db_in_ch.table1
  ```

  ClickHouseテーブルは、PostgreSQLのテーブルにすでに存在していた2行に自動的にポピュレートされるはずです:
  ```response
  Query id: 34193d31-fe21-44ac-a182-36aaefbd78bf

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  └────┴─────────┘
  ```

2. PostgreSQLに戻って、新しい行をテーブルに追加します:
  ```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (3, 'ghi'),
    (4, 'jkl');
  ```

4. これらの2つの新しい行は、ClickHouseテーブルに表示されるはずです:
  ```sql
  SELECT * FROM db_in_ch.table1
  ```

  応答は次のとおりです:
  ```response
  Query id: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  │  3 │ ghi     │
  │  4 │ jkl     │
  └────┴─────────┘
  ```

5. ClickHouseテーブルに行を追加するとどうなるかを見てみましょう:
  ```sql
  INSERT INTO db_in_ch.table1
    (id, column1)
  VALUES
    (5, 'mno'),
    (6, 'pqr');
  ```

6. ClickHouseで追加した行がPostgreSQLのテーブルに表示されるはずです:
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

この例では、PostgreSQLとClickHouse間の基本的な統合を`PostgreSQL`テーブルエンジンを使用して示しました。
スキーマの指定、特定のカラムのサブセットの返却、複数のレプリカへの接続など、さらなる機能については[PostgreSQLテーブルエンジンのドキュメントページ](/engines/table-engines/integrations/postgresql)を確認してください。また、[ClickHouseとPostgreSQL - データの天国でのマッチ - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)ブログもチェックしてください。

## MaterializedPostgreSQLデータベースエンジンを使用する {#using-the-materializedpostgresql-database-engine}

<CloudNotSupportedBadge />
<ExperimentalBadge />

PostgreSQLデータベースエンジンは、PostgreSQLのレプリケーション機能を使用して、データベースのレプリカを作成し、すべてまたは一部のスキーマやテーブルを複製します。
この記事では、1つのデータベース、1つのスキーマ、1つのテーブルを使用した基本的な統合方法を説明します。

***以下の手順では、PostgreSQL CLI（psql）とClickHouse CLI（clickhouse-client）が使用されます。PostgreSQLサーバーはLinuxにインストールされています。PostgreSQLデータベースが新しいテストインストールである場合、以下は最小設定を有しています***

### 1. PostgreSQLで {#1-in-postgresql}
1. `postgresql.conf`で最小のリッスンレベル、レプリケーションWALレベル、およびレプリケーションスロットを設定します:

以下のエントリーを追加します:
```text
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```
_*ClickHouseは`logical`ウォールレベルの最小値と少なくとも`2`のレプリケーションスロットが必要です_

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
    id         integer primary key,
    column1    varchar(10)
);
```

6. 初期の行を追加します:
```sql
INSERT INTO table1
(id, column1)
VALUES
(1, 'abc'),
(2, 'def');
```

7. レプリケーション用に新しいユーザーで新しいデータベースへの接続を許可するようPostgreSQLを設定します。以下は`pg_hba.conf`ファイルに追加するための最小限のエントリーです:

```text
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```
_*デモ目的で、クリアテキストパスワード認証メソッドが使用されています。PostgreSQLのドキュメントに従って、住所行をサーバーのサブネットまたは住所に更新してください。_

8. `pg_hba.conf`の設定をリロードします（バージョンに応じて調整してください）:
```text
/usr/pgsql-12/bin/pg_ctl reload
```

9. 新しい`clickhouse_user`でのログインをテストします:
```text
 psql -U clickhouse_user -W -d db1 -h <your_postgresql_host>
```

### 2. ClickHouseで {#2-in-clickhouse}
1. ClickHouse CLIにログインします
```bash
clickhouse-client --user default --password ClickHouse123!
```

2. データベースエンジンのPostgreSQL実験的機能を有効にします:
```sql
SET allow_experimental_database_materialized_postgresql=1
```

3. 複製される新しいデータベースを作成し、初期テーブルを定義します:
```sql
CREATE DATABASE db1_postgres
ENGINE = MaterializedPostgreSQL('postgres-host.domain.com:5432', 'db1', 'clickhouse_user', 'ClickHouse_123')
SETTINGS materialized_postgresql_tables_list = 'table1';
```
最小オプション:

|parameter|説明                     |例                              |
|---------|-----------------------|--------------------------------|
|host:port|ホスト名またはIPおよびポート|postgres-host.domain.com:5432   |
|database |PostgreSQLのデータベース名     |db1                             |
|user     |PostgreSQLに接続するためのユーザー名|clickhouse_user               |
|password |PostgreSQLに接続するためのパスワード|ClickHouse_123                |
|settings |エンジンの追加設定                  |materialized_postgresql_tables_list = 'table1'|

:::info
PostgreSQLデータベースエンジンの完全なガイドについては、https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settingsを参照してください。
:::

4. 初期テーブルにデータが存在することを確認します:

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
1. PostgreSQLで新しい行を追加します:
```sql
INSERT INTO table1
(id, column1)
VALUES
(3, 'ghi'),
(4, 'jkl');
```

2. ClickHouseで新しい行が表示されることを確認します:
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
この統合ガイドは、テーブルを持つデータベースを複製する方法に焦点を当てたシンプルな例ですが、データベース全体を複製したり、既存の複製に新しいテーブルやスキーマを追加したりするなどの高度なオプションも存在します。このレプリケーションにはDDLコマンドはサポートされていませんが、エンジンは変更を検出して表の構造に変更が加えられたときにリロードすることができます。

:::info
高度なオプションで利用可能なその他の機能については、[リファレンスドキュメント](/engines/database-engines/materialized-postgresql)を参照してください。
:::


## 関連コンテンツ {#related-content}
- ブログ: [ClickHouseとPostgreSQL - データの天国でのマッチ - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouseとPostgreSQL - データの天国でのマッチ - パート2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
