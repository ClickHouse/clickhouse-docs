---
slug: /integrations/postgresql/connecting-to-postgresql
title: 'PostgreSQL への接続'
keywords: ['clickhouse', 'postgres', 'postgresql', 'connect', 'integrate', 'table', 'engine']
description: 'PostgreSQL を ClickHouse に接続するためのさまざまな方法を説明するページ'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse と PostgreSQL の接続

このページでは、PostgreSQL を ClickHouse と統合するための次の方法について説明します。

- PostgreSQL テーブルから読み取るための `PostgreSQL` テーブルエンジンの使用
- PostgreSQL のデータベースと ClickHouse のデータベースを同期するための、実験的な `MaterializedPostgreSQL` データベースエンジンの使用

:::tip
ClickHouse Cloud 向けのマネージド連携サービスであり、PeerDB によって提供される [ClickPipes](/integrations/clickpipes/postgres) の利用を推奨します。
また、[PeerDB](https://github.com/PeerDB-io/peerdb) は、セルフホスト型 ClickHouse および ClickHouse Cloud の両方に対する PostgreSQL データベースレプリケーション専用に設計されたオープンソースの CDC ツールとしても利用できます。
:::



## PostgreSQLテーブルエンジンの使用 {#using-the-postgresql-table-engine}

`PostgreSQL`テーブルエンジンを使用すると、ClickHouseからリモートのPostgreSQLサーバーに保存されているデータに対して**SELECT**および**INSERT**操作を実行できます。
この記事では、1つのテーブルを使用した基本的な統合方法を説明します。

### 1. PostgreSQLのセットアップ {#1-setting-up-postgresql}

1.  `postgresql.conf`に以下のエントリを追加して、PostgreSQLがネットワークインターフェースでリッスンできるようにします:

```text
listen_addresses = '*'
```

2. ClickHouseから接続するためのユーザーを作成します。デモンストレーション目的で、この例では完全なスーパーユーザー権限を付与します。

```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```

3. PostgreSQLで新しいデータベースを作成します:

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

5. テスト用にいくつかの行を追加しましょう:

```sql
INSERT INTO table1
  (id, column1)
VALUES
  (1, 'abc'),
  (2, 'def');
```

6. 新しいユーザーで新しいデータベースへの接続を許可するようにPostgreSQLを設定するには、`pg_hba.conf`ファイルに以下のエントリを追加します。アドレス行をPostgreSQLサーバーのサブネットまたはIPアドレスで更新してください:

```text
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db_in_psg             clickhouse_user 192.168.1.0/24          password
```

7. `pg_hba.conf`設定を再読み込みします(バージョンに応じてこのコマンドを調整してください):

```text
/usr/pgsql-12/bin/pg_ctl reload
```

8. 新しい`clickhouse_user`がログインできることを確認します:

```text
psql -U clickhouse_user -W -d db_in_psg -h <your_postgresql_host>
```

:::note
ClickHouse Cloudでこの機能を使用している場合、ClickHouse CloudのIPアドレスがPostgreSQLインスタンスにアクセスできるように許可する必要がある場合があります。
エグレストラフィックの詳細については、ClickHouseの[Cloud Endpoints API](/cloud/get-started/query-endpoints)を確認してください。
:::

### 2. ClickHouseでテーブルを定義する {#2-define-a-table-in-clickhouse}

1. `clickhouse-client`にログインします:

```bash
clickhouse-client --user default --password ClickHouse123!
```

2. 新しいデータベースを作成しましょう:

```sql
CREATE DATABASE db_in_ch;
```

3. `PostgreSQL`エンジンを使用するテーブルを作成します:

```sql
CREATE TABLE db_in_ch.table1
(
    id UInt64,
    column1 String
)
ENGINE = PostgreSQL('postgres-host.domain.com:5432', 'db_in_psg', 'table1', 'clickhouse_user', 'ClickHouse_123');
```

必要な最小限のパラメータは以下の通りです:

| パラメータ | 説明                     | 例                       |
| --------- | ------------------------------- | ----------------------------- |
| host:port | ホスト名またはIPとポート         | postgres-host.domain.com:5432 |
| database  | PostgreSQLデータベース名        | db_in_psg                     |
| user      | PostgreSQLに接続するためのユーザー名 | clickhouse_user               |
| password  | PostgreSQLに接続するためのパスワード | ClickHouse_123                |

:::note
パラメータの完全なリストについては、[PostgreSQLテーブルエンジン](/engines/table-engines/integrations/postgresql)のドキュメントページを参照してください。
:::

### 3. 統合のテスト {#3-test-the-integration}

1. ClickHouseで初期行を表示します:

```sql
SELECT * FROM db_in_ch.table1
```

ClickHouseテーブルには、PostgreSQLのテーブルに既に存在していた2行が自動的に入力されるはずです:

```response
Query id: 34193d31-fe21-44ac-a182-36aaefbd78bf

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

4. これらの2つの新しい行がClickHouseテーブルに表示されるはずです:

```sql
SELECT * FROM db_in_ch.table1
```


レスポンスは次のとおりです：

```response
Query id: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘
```

5. ClickHouse テーブルに行を追加したときに何が起きるか見てみましょう：

```sql
INSERT INTO db_in_ch.table1
  (id, column1)
VALUES
  (5, 'mno'),
  (6, 'pqr');
```

6. ClickHouse に追加した行が PostgreSQL のテーブルに表示されているはずです:

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

この例では、`PostrgeSQL` テーブルエンジンを使って、PostgreSQL と ClickHouse の基本的な連携方法を紹介しました。
スキーマの指定、特定のカラムのみを返す、複数レプリカへの接続など、さらに多くの機能については [PostgreSQL テーブルエンジンのドキュメントページ](/engines/table-engines/integrations/postgresql) を参照してください。また、ブログ記事 [ClickHouse and PostgreSQL - a match made in data heaven - part 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres) もあわせてご覧ください。


## MaterializedPostgreSQLデータベースエンジンの使用 {#using-the-materializedpostgresql-database-engine}

<CloudNotSupportedBadge />
<ExperimentalBadge />

PostgreSQLデータベースエンジンは、PostgreSQLのレプリケーション機能を使用して、すべてまたは一部のスキーマとテーブルを含むデータベースのレプリカを作成します。
この記事では、1つのデータベース、1つのスキーマ、1つのテーブルを使用した基本的な統合方法を説明します。

**_以下の手順では、PostgreSQL CLI(psql)とClickHouse CLI(clickhouse-client)を使用します。PostgreSQLサーバーはLinux上にインストールされています。以下は、PostgreSQLデータベースが新規テストインストールの場合の最小限の設定です_**

### 1. PostgreSQLでの設定 {#1-in-postgresql}

1.  `postgresql.conf`で、最小リッスンレベル、レプリケーションWALレベル、レプリケーションスロットを設定します:

以下のエントリを追加します:

```text
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```

_\*ClickHouseには最低でも`logical` WALレベルと最低`2`個のレプリケーションスロットが必要です_

2. 管理者アカウントを使用して、ClickHouseから接続するユーザーを作成します:

```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```

_\*デモンストレーション目的のため、完全なスーパーユーザー権限が付与されています。_

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

6. 初期行を追加します:

```sql
INSERT INTO table1
(id, column1)
VALUES
(1, 'abc'),
(2, 'def');
```

7. レプリケーション用の新しいユーザーで新しいデータベースへの接続を許可するようにPostgreSQLを設定します。以下は`pg_hba.conf`ファイルに追加する最小限のエントリです:


```text
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```

_\*デモンストレーション目的のため、平文パスワード認証方式を使用しています。PostgreSQLのドキュメントに従って、アドレス行をサブネットまたはサーバーのアドレスで更新してください_

8. 次のようなコマンドで`pg_hba.conf`設定を再読み込みします(バージョンに合わせて調整してください):

```text
/usr/pgsql-12/bin/pg_ctl reload
```

9. 新しい`clickhouse_user`でログインをテストします:

```text
 psql -U clickhouse_user -W -d db1 -h <your_postgresql_host>
```

### 2. ClickHouseでの設定 {#2-in-clickhouse}

1. ClickHouse CLIにログインします

```bash
clickhouse-client --user default --password ClickHouse123!
```

2. データベースエンジンのPostgreSQL実験的機能を有効にします:

```sql
SET allow_experimental_database_materialized_postgresql=1
```

3. レプリケーション対象の新しいデータベースを作成し、初期テーブルを定義します:

```sql
CREATE DATABASE db1_postgres
ENGINE = MaterializedPostgreSQL('postgres-host.domain.com:5432', 'db1', 'clickhouse_user', 'ClickHouse_123')
SETTINGS materialized_postgresql_tables_list = 'table1';
```

最小限のオプション:

| パラメータ | 説明                        | 例                                             |
| --------- | -------------------------- | ---------------------------------------------- |
| host:port | ホスト名またはIPとポート      | postgres-host.domain.com:5432                  |
| database  | PostgreSQLデータベース名     | db1                                            |
| user      | postgresに接続するユーザー名  | clickhouse_user                                |
| password  | postgresに接続するパスワード  | ClickHouse_123                                 |
| settings  | エンジンの追加設定           | materialized_postgresql_tables_list = 'table1' |

:::info
PostgreSQLデータベースエンジンの完全なガイドについては、https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settings を参照してください
:::

4. 初期テーブルにデータがあることを確認します:

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

この統合ガイドでは、テーブルを含むデータベースをレプリケートする方法の簡単な例に焦点を当てましたが、データベース全体をレプリケートしたり、既存のレプリケーションに新しいテーブルやスキーマを追加したりするなど、より高度なオプションも存在します。このレプリケーションではDDLコマンドはサポートされていませんが、構造的な変更が行われた際に変更を検出してテーブルを再読み込みするようにエンジンを設定することができます。

:::info
高度なオプションで利用可能な機能の詳細については、[リファレンスドキュメント](/engines/database-engines/materialized-postgresql)を参照してください。
:::
