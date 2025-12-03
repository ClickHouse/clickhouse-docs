---
slug: /integrations/postgresql/connecting-to-postgresql
title: 'PostgreSQL への接続'
keywords: ['clickhouse', 'postgres', 'postgresql', 'connect', 'integrate', 'table', 'engine']
description: 'PostgreSQL を ClickHouse に接続するさまざまな方法を説明するページです'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';

# ClickHouse と PostgreSQL の接続 {#connecting-clickhouse-to-postgresql}

このページでは、PostgreSQL と ClickHouse を統合するための次のオプションについて説明します。

* PostgreSQL のテーブルから読み取るための `PostgreSQL` テーブルエンジンの利用
* PostgreSQL 内のデータベースと ClickHouse 内のデータベースを同期するための、実験的な `MaterializedPostgreSQL` データベースエンジンの利用

:::tip
[ClickPipes](/integrations/clickpipes/postgres) は、PeerDB を基盤とした ClickHouse Cloud 向けのマネージド連携サービスであり、こちらの利用を推奨します。
また、代替手段として [PeerDB](https://github.com/PeerDB-io/peerdb) は、セルフホスト型の ClickHouse および ClickHouse Cloud 双方への PostgreSQL データベースレプリケーション向けに特化して設計された、オープンソースの CDC（変更データキャプチャ）ツールとして利用できます。
:::

## PostgreSQL テーブルエンジンの使用 {#using-the-postgresql-table-engine}

`PostgreSQL` テーブルエンジンを使用すると、リモートの PostgreSQL サーバー上に保存されているデータに対して、ClickHouse から **SELECT** および **INSERT** 操作を行うことができます。
この記事では、1 つのテーブルを使った基本的な連携方法を説明します。

### 1. PostgreSQL のセットアップ {#1-setting-up-postgresql}

1. `postgresql.conf` で、PostgreSQL がネットワークインターフェイスで待ち受けできるようにするため、次の設定を追加します。

```text
listen_addresses = '*'
```

2. ClickHouse から接続するためのユーザーを作成します。デモンストレーション目的のため、この例ではスーパーユーザー権限をすべて付与します。

```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```

3. PostgreSQL で新しいデータベースを作成する:

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

5. テスト用にいくつか行を追加しましょう。

```sql
INSERT INTO table1
  (id, column1)
VALUES
  (1, 'abc'),
  (2, 'def');
```

6. レプリケーション用の新しいユーザーが新しいデータベースに接続できるように PostgreSQL を構成するには、`pg_hba.conf` ファイルに次のエントリを追加します。`address` 行のアドレスを、PostgreSQL サーバーのサブネットまたは IP アドレスに更新してください。

```text
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db_in_psg             clickhouse_user 192.168.1.0/24          password
```

7. `pg_hba.conf` 設定ファイルを再読み込みします（利用しているバージョンに応じてこのコマンドを調整してください）:

```text
/usr/pgsql-12/bin/pg_ctl reload
```

8. 新しい `clickhouse_user` がログインできることを確認します。

```text
psql -U clickhouse_user -W -d db_in_psg -h <PostgreSQLホスト>
```

:::note
ClickHouse Cloud 上でこの機能を利用している場合、ClickHouse Cloud の IP アドレスから PostgreSQL インスタンスへのアクセスを許可する必要がある場合があります。
外向きトラフィックの詳細については、ClickHouse の [Cloud Endpoints API](/cloud/get-started/query-endpoints) を確認してください。
:::

### 2. ClickHouse にテーブルを定義する {#2-define-a-table-in-clickhouse}

1. `clickhouse-client` にログインします:

```bash
clickhouse-client --user default --password ClickHouse123!
```

2. 新しいデータベースを作成します。

```sql
CREATE DATABASE db_in_ch;
```

3. `PostgreSQL` を使用するテーブルを作成します：

```sql
CREATE TABLE db_in_ch.table1
(
    id UInt64,
    column1 String
)
ENGINE = PostgreSQL('postgres-host.domain.com:5432', 'db_in_psg', 'table1', 'clickhouse_user', 'ClickHouse_123');
```

必要となる最小限のパラメータは次のとおりです:

| parameter | Description                     | example                       |
| --------- | ------------------------------- | ----------------------------- |
| host:port | hostname or IP and port         | postgres-host.domain.com:5432 |
| database  | PostgreSQL database name        | db&#95;in&#95;psg             |
| user      | username to connect to postgres | clickhouse&#95;user           |
| password  | password to connect to postgres | ClickHouse&#95;123            |

:::note
利用可能なパラメータの完全な一覧については、[PostgreSQL table engine](/engines/table-engines/integrations/postgresql) のドキュメントページを参照してください。
:::

### 3 統合をテストする {#3-test-the-integration}

1. ClickHouse で初期の行を表示します:

```sql
SELECT * FROM db_in_ch.table1
```

ClickHouse のテーブルには、PostgreSQL のテーブル内に既に存在していた 2 行が自動的に格納されているはずです。

```response
クエリID: 34193d31-fe21-44ac-a182-36aaefbd78bf

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
└────┴─────────┘
```

2. PostgreSQL に戻り、テーブルにいくつか行を追加します：

```sql
INSERT INTO table1
  (id, column1)
VALUES
  (3, 'ghi'),
  (4, 'jkl');
```

4. その 2 つの新しい行が ClickHouse のテーブルに表示されているはずです。

```sql
SELECT * FROM db_in_ch.table1
```

レスポンスは次のとおりです。

```response
Query id: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘
```

5. ClickHouse テーブルに行を追加したときにどうなるか確認してみましょう。

```sql
INSERT INTO db_in_ch.table1
  (id, column1)
VALUES
  (5, 'mno'),
  (6, 'pqr');
```

6. ClickHouse に追加された行が PostgreSQL のテーブルに表示されているはずです。

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

この例では、`PostrgeSQL` テーブルエンジンを使用して、PostgreSQL と ClickHouse の間の基本的な連携方法を示しました。
スキーマの指定、特定のカラムのみを返す設定、複数レプリカへの接続など、さらに多くの機能については、[PostgreSQL テーブルエンジンのドキュメントページ](/engines/table-engines/integrations/postgresql) を参照してください。また、ブログ記事 [ClickHouse and PostgreSQL - a match made in data heaven - part 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres) もあわせてご覧ください。

## MaterializedPostgreSQL データベースエンジンの使用 {#using-the-materializedpostgresql-database-engine}

<CloudNotSupportedBadge />

<ExperimentalBadge />

PostgreSQL データベースエンジンは、PostgreSQL のレプリケーション機能を使用して、すべてまたは一部のスキーマやテーブルを含むデータベースのレプリカを作成します。
この記事では、1 つのデータベース、1 つのスキーマ、1 つのテーブルを用いた基本的な統合方法を説明します。

***以下の手順では、PostgreSQL CLI (`psql`) と ClickHouse CLI (`clickhouse-client`) を使用します。PostgreSQL サーバーは Linux 上にインストールされています。以下の内容は、PostgreSQL データベースを新規にテストインストールした場合の最小設定です。***

### 1. PostgreSQL 側の設定 {#1-in-postgresql}

1. `postgresql.conf` で、最低限の listen 設定、レプリケーション用の `wal_level`、レプリケーションスロットを設定します:

次の設定項目を追加します:

```text
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```

**ClickHouse には、WAL レベルとして `logical` 以上と、少なくとも `2` 個のレプリケーションスロットが必要です*

2. 管理者アカウントで、ClickHouse から接続するためのユーザーを作成します。

```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```

**デモ目的のために、完全なスーパーユーザー権限が付与されています。*

3. 新しいデータベースを作成します:

```sql
CREATE DATABASE db1;
```

4. `psql` で新しいデータベースに接続します：

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

6. 初期データ行を追加します:

```sql
INSERT INTO table1
(id, column1)
VALUES
(1, 'abc'),
(2, 'def');
```

7. レプリケーション用に、新しいユーザーが新しいデータベースへ接続できるよう PostgreSQL を設定します。以下は `pg_hba.conf` ファイルに追加する最小限のエントリです。

```text
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```

**デモ用として、ここではプレーンテキストのパスワード認証方式を使用しています。PostgreSQL のドキュメントに従い、アドレス行をサブネットまたはサーバーのアドレスに更新してください*

8. `pg_hba.conf` 設定を次のようなコマンドで再読み込みします（お使いのバージョンに合わせて調整してください）:

```text
/usr/pgsql-12/bin/pg_ctl reload
```

9. 新しい `clickhouse_user` でログインできるかテストします。

```text
 psql -U clickhouse_user -W -d db1 -h <PostgreSQLホスト>
```

### 2. ClickHouse で {#3-test-basic-replication}

1. ClickHouse CLI にログインする

```bash
clickhouse-client --user default --password ClickHouse123!
```

2. データベースエンジン用の PostgreSQL 実験的機能を有効にします：

```sql
SET allow_experimental_database_materialized_postgresql=1
```

3. レプリケーション用の新しいデータベースを作成し、初期テーブルを定義します：

```sql
CREATE DATABASE db1_postgres
ENGINE = MaterializedPostgreSQL('postgres-host.domain.com:5432', 'db1', 'clickhouse_user', 'ClickHouse_123')
SETTINGS materialized_postgresql_tables_list = 'table1';
```

最小限のオプション:

| parameter | Description              | example                                                            |
| --------- | ------------------------ | ------------------------------------------------------------------ |
| host:port | ホスト名または IP アドレスとポート      | postgres-host.domain.com:5432                                      |
| database  | PostgreSQL のデータベース名      | db1                                                                |
| user      | PostgreSQL に接続するためのユーザー名 | clickhouse&#95;user                                                |
| password  | PostgreSQL に接続するためのパスワード | ClickHouse&#95;123                                                 |
| settings  | エンジン向けの追加設定              | materialized&#95;postgresql&#95;tables&#95;list = &#39;table1&#39; |

:::info
PostgreSQL データベースエンジンの詳細なガイドについては、[https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settings](https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settings) を参照してください。
:::

4. 初期テーブルにデータが入っていることを確認します:

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

### 3. 基本的なレプリケーションをテストする {#2-in-clickhouse}

1. PostgreSQL に新しい行を追加します：

```sql
INSERT INTO table1
(id, column1)
VALUES
(3, 'ghi'),
(4, 'jkl');
```

2. ClickHouse で新しい行が表示されていることを確認します。

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

### 4. まとめ {#3-test-basic-replication}

このインテグレーションガイドでは、テーブルを含むデータベースをレプリケートするためのシンプルな例を扱いましたが、データベース全体をレプリケートしたり、既存のレプリケーションに新しいテーブルやスキーマを追加したりするなど、より高度なオプションも存在します。このレプリケーションでは DDL コマンドはサポートされませんが、エンジンを設定することで変更を検出し、スキーマ変更などの構造的な変更が行われた際にテーブルを再読み込みさせることができます。

:::info
高度なオプションで利用可能な機能の詳細については、[リファレンスドキュメント](/engines/database-engines/materialized-postgresql)を参照してください。
:::
