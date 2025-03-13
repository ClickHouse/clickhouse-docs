---
slug: /integrations/postgresql/connecting-to-postgresql
title: PostgreSQLへの接続
keywords: [clickhouse, postgres, postgresql, connect, integrate, table, engine]
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouseとPostgreSQLの接続

このページでは、PostgreSQLとClickHouseを統合するための以下のオプションについて説明します。

- [ClickPipes](/integrations/clickpipes/postgres)を使用する、ClickHouse Cloudのための管理された統合サービス - 現在プライベートプレビュー中です。こちらから[サインアップ](https://clickpipes.peerdb.io/)してください。
- `PeerDB by ClickHouse`を使用する、セルフホストのClickHouseおよびClickHouse CloudへのPostgreSQLデータベースレプリケーションのために特別に設計されたCDCツール
  - PeerDBは現在ClickHouse Cloudにネイティブに利用可能です - 私たちの[新しいClickPipeコネクタ](/integrations/clickpipes/postgres)を使用した、Blazing-fast PostgresからClickHouseへのCDC - 現在プライベートプレビュー中です。こちらから[サインアップ](https://clickpipes.peerdb.io/)してください。
- `PostgreSQL`テーブルエンジンを使用して、PostgreSQLテーブルから読み取る
- 実験的な`MaterializedPostgreSQL`データベースエンジンを使用して、PostgreSQLのデータベースとClickHouseのデータベースを同期する

## ClickPipesの使用（PeerDBによって提供） {#using-clickpipes-powered-by-peerdb}

PeerDBは現在ClickHouse Cloudにネイティブに利用可能です - 私たちの[新しいClickPipeコネクタ](/integrations/clickpipes/postgres)を使用した、Blazing-fast PostgresからClickHouseへのCDC - 現在プライベートプレビュー中です。こちらから[サインアップ](https://clickpipes.peerdb.io/)してください。

## PostgreSQLテーブルエンジンの使用 {#using-the-postgresql-table-engine}

`PostgreSQL`テーブルエンジンは、ClickHouseからリモートPostgreSQLサーバーに保存されているデータに対して**SELECT**および**INSERT**操作を許可します。
この記事は、1つのテーブルを使用した統合の基本的な方法を示すことを目的としています。

### 1. PostgreSQLのセットアップ {#1-setting-up-postgresql}
1.  `postgresql.conf`に以下のエントリを追加して、PostgreSQLがネットワークインターフェースでリッスンできるようにします。
  ```text
  listen_addresses = '*'
  ```

2. ClickHouseから接続するためのユーザーを作成します。デモ目的で、この例ではフルスーパーユーザー権限を付与しています。
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

6. レプリケーションのために新しいユーザーで新しいデータベースへの接続を許可するようにPostgreSQLを構成するために、`pg_hba.conf`ファイルに以下のエントリを追加します。アドレス行は、PostgreSQLサーバーのサブネットまたはIPアドレスで更新してください：
  ```text
  # TYPE  DATABASE        USER            ADDRESS                 METHOD
  host    db_in_psg             clickhouse_user 192.168.1.0/24          password
  ```

7. `pg_hba.conf`の設定を再読み込みします（バージョンに応じてこのコマンドを調整してください）：
  ```text
  /usr/pgsql-12/bin/pg_ctl reload
  ```

8. 新しい`clickhouse_user`がログインできることを確認します：
  ```text
  psql -U clickhouse_user -W -d db_in_psg -h <your_postgresql_host>
  ```

:::note
ClickHouse Cloudでこの機能を使用している場合、ClickHouse CloudのIPアドレスがPostgreSQLインスタンスにアクセスできるように許可する必要があるかもしれません。
ClickHouseの[Cloud Endpoints API](/cloud/get-started/query-endpoints)でエグレストラフィックの詳細を確認してください。
:::

### 2. ClickHouseでのテーブルの定義 {#2-define-a-table-in-clickhouse}
1. `clickhouse-client`にログインします：
  ```bash
  clickhouse-client --user default --password ClickHouse123!
  ```

2. 新しいデータベースを作成しましょう：
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

  必要な最小パラメータは以下です：

  |parameter|Description                 |example                           |
  |---------|----------------------------|----------------------------------|
  |host:port|ホスト名またはIPとポート     |postgres-host.domain.com:5432    |
  |database |PostgreSQLデータベース名         |db_in_psg                         |
  |user     |PostgreSQLに接続するユーザー名|clickhouse_user                   |
  |password |PostgreSQLに接続するパスワード|ClickHouse_123                    |

  :::note
  完全なパラメータリストについては、[PostgreSQLテーブルエンジン](/engines/table-engines/integrations/postgresql)のドキュメントページを参照してください。
  :::


### 3 統合のテスト {#3-test-the-integration}

1. ClickHouseで初期行を確認します：
  ```sql
  SELECT * FROM db_in_ch.table1
  ```

  ClickHouseのテーブルは、PostgreSQLのテーブルに既に存在していた2行で自動的にポピュレートされているはずです：
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

4. これらの2つの新しい行がClickHouseのテーブルに表示されるはずです：
  ```sql
  SELECT * FROM db_in_ch.table1
  ```

  レスポンスは以下のようになります：
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

6. ClickHouseで追加した行がPostgreSQLのテーブルに表示されるはずです：
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

この例は、PostgreSQLとClickHouseの間の基本的な統合を示すもので、`PostgreSQL`テーブルエンジンを使用しています。
スキーマの指定、カラムのサブセットを返す、複数のレプリカへの接続などの機能については、[PostgreSQLテーブルエンジンのドキュメントページ](/engines/table-engines/integrations/postgresql)をご覧ください。また、[ClickHouseとPostgreSQL - データの天国での出会い - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)ブログもチェックしてください。

## MaterializedPostgreSQLデータベースエンジンの使用 {#using-the-materializedpostgresql-database-engine}

<CloudNotSupportedBadge />
<ExperimentalBadge />

PostgreSQLデータベースエンジンは、PostgreSQLのレプリケーション機能を使用して、データベースのレプリカを作成します。すべてまたは一部のスキーマとテーブルを伴います。
この記事は、データベース、スキーマ、テーブルを1つ使用した統合の基本的な方法を示すことを目的としています。

***以下の手順では、PostgreSQL CLI（psql）とClickHouse CLI（clickhouse-client）が使用されています。PostgreSQLサーバーはlinuxにインストールされています。以下の設定は、PostgreSQLデータベースが新規テストインストールの場合の最小設定です***

### 1. PostgreSQLで {#1-in-postgresql}
1.  `postgresql.conf`で、最小のリッスンレベル、レプリケーションのwalレベル、レプリケーションスロットを設定します：

次のエントリを追加します：
```text
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```
_*ClickHouseは、最小の`logical` walレベルと最小の`2`レプリケーションスロットが必要です_

2. 管理者アカウントを使用して、ClickHouseから接続するユーザーを作成します：
```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```
_*デモ目的で、フルスーパーユーザー権限が付与されています。_

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

7. レプリケーションのために新しいユーザーで新しいデータベースへの接続を許可するようにPostgreSQLを構成します。以下は`pg_hba.conf`ファイルに追加する最小限のエントリです：

```text

# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```
_*デモ目的で、平文パスワード認証メソッドを使用しています。アドレス行は、PostgreSQLのドキュメントに従ってサーバーのサブネットまたはアドレスで更新してください_

8.  `pg_hba.conf`設定を次のように再読み込みします（バージョンに応じて調整してください）：
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

3. レプリケートする新しいデータベースを作成し、初期テーブルを定義します：
```sql
CREATE DATABASE db1_postgres
ENGINE = MaterializedPostgreSQL('postgres-host.domain.com:5432', 'db1', 'clickhouse_user', 'ClickHouse_123')
SETTINGS materialized_postgresql_tables_list = 'table1';
```
最小オプション：

|parameter|Description                 |example                           |
|---------|----------------------------|----------------------------------|
|host:port|ホスト名またはIPとポート     |postgres-host.domain.com:5432    |
|database |PostgreSQLデータベース名         |db1                               |
|user     |PostgreSQLに接続するユーザー名|clickhouse_user                   |
|password |PostgreSQLに接続するパスワード|ClickHouse_123                    |
|settings |エンジンの追加設定           | materialized_postgresql_tables_list = 'table1' |

:::info
PostgreSQLデータベースエンジンの完全なガイドについては、https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settingsを参照してください
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

### 3. 基本的なレプリケーションのテスト {#3-test-basic-replication}
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
この統合ガイドは、テーブルを持つデータベースをレプリケートする方法についてのシンプルな例に焦点を当てていますが、全データベースのレプリケーションや既存のレプリケーションに新しいテーブルやスキーマを追加するなど、さらに高度なオプションも存在します。DDLコマンドはこのレプリケーションではサポートされていませんが、エンジンは変更を検出し、構造が変更されたときにテーブルを再読み込みするように設定できます。

:::info
高度なオプションで利用できるさらに多くの機能については、[リファレンスドキュメント](/engines/database-engines/materialized-postgresql)をご覧ください。
:::


## 関連コンテンツ {#related-content}
- ブログ: [ClickHouseとPostgreSQL - データの天国での出会い - パート1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- ブログ: [ClickHouseとPostgreSQL - データの天国での出会い - パート2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
