---
description: 'PostgreSQL データベース内のテーブルを取り込んだ ClickHouse データベースを作成します。'
sidebar_label: 'MaterializedPostgreSQL'
sidebar_position: 60
slug: /engines/database-engines/materialized-postgresql
title: 'MaterializedPostgreSQL'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::note
ClickHouse Cloud のユーザーには、PostgreSQL から ClickHouse へのレプリケーションには [ClickPipes](/integrations/clickpipes) の利用を推奨します。これは、PostgreSQL 向けの高性能な Change Data Capture (CDC) をネイティブにサポートします。
:::

PostgreSQL データベース内のテーブルを元に、ClickHouse データベースを作成します。まず、エンジン `MaterializedPostgreSQL` を持つデータベースは、PostgreSQL データベースのスナップショットを作成し、必要なテーブルを読み込みます。必要なテーブルとして、指定されたデータベース内の任意のスキーマからの任意のテーブルの部分集合を含めることができます。スナップショットの取得と同時に、データベースエンジンは LSN を取得し、テーブルの初期ダンプが完了すると、WAL から更新の取得を開始します。データベース作成後に PostgreSQL データベースへ新しく追加されたテーブルは、自動的にはレプリケーションに追加されません。これらは `ATTACH TABLE db.table` クエリを用いて手動で追加する必要があります。

レプリケーションは PostgreSQL の論理レプリケーションプロトコルによって実装されており、DDL のレプリケーションは許可されませんが、レプリケーションを破壊する変更（カラム型の変更、カラムの追加・削除）が発生したかどうかは検知できます。このような変更が検出されると、該当するテーブルは更新の受信を停止します。この場合、`ATTACH` / `DETACH PERMANENTLY` クエリを使用してテーブルを完全に再読み込みする必要があります。DDL がレプリケーションを破壊しない場合（例えば、カラム名の変更）には、テーブルは引き続き更新を受け取ります（挿入は位置に基づいて行われます）。

:::note
このデータベースエンジンは実験的機能です。使用するには、設定ファイルで `allow_experimental_database_materialized_postgresql` を 1 に設定するか、`SET` コマンドを使用して設定します:

```sql
SET allow_experimental_database_materialized_postgresql=1
```

:::


## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MaterializedPostgreSQL('host:port', 'database', 'user', 'password') [SETTINGS ...]
```

**エンジンパラメータ**

- `host:port` — PostgreSQLサーバーのエンドポイント。
- `database` — PostgreSQLデータベース名。
- `user` — PostgreSQLユーザー。
- `password` — ユーザーのパスワード。


## 使用例 {#example-of-use}

```sql
CREATE DATABASE postgres_db
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password');

SHOW TABLES FROM postgres_db;

┌─name───┐
│ table1 │
└────────┘

SELECT * FROM postgresql_db.postgres_table;
```


## レプリケーションへの新しいテーブルの動的追加 {#dynamically-adding-table-to-replication}

`MaterializedPostgreSQL`データベースの作成後、対応するPostgreSQLデータベース内の新しいテーブルは自動的には検出されません。このようなテーブルは手動で追加できます:

```sql
ATTACH TABLE postgres_database.new_table;
```

:::warning
バージョン22.1より前では、レプリケーションへのテーブル追加時に削除されない一時的なレプリケーションスロット(`{db_name}_ch_replication_slot_tmp`という名前)が残されていました。バージョン22.1より前のClickHouseでテーブルをアタッチする場合は、手動で削除してください(`SELECT pg_drop_replication_slot('{db_name}_ch_replication_slot_tmp')`)。そうしない場合、ディスク使用量が増加します。この問題はバージョン22.1で修正されています。
:::


## レプリケーションからテーブルを動的に削除する {#dynamically-removing-table-from-replication}

レプリケーションから特定のテーブルを削除できます:

```sql
DETACH TABLE postgres_database.table_to_remove PERMANENTLY;
```


## PostgreSQLスキーマ {#schema}

PostgreSQL [スキーマ](https://www.postgresql.org/docs/9.1/ddl-schemas.html)は3つの方法で設定できます(バージョン21.12以降)。

1. 1つの`MaterializedPostgreSQL`データベースエンジンに対して1つのスキーマを使用します。`materialized_postgresql_schema`設定を使用する必要があります。
   テーブルはテーブル名のみでアクセスします:

```sql
CREATE DATABASE postgres_database
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema = 'postgres_schema';

SELECT * FROM postgres_database.table1;
```

2. 1つの`MaterializedPostgreSQL`データベースエンジンに対して、指定されたテーブルセットを持つ任意の数のスキーマを使用します。`materialized_postgresql_tables_list`設定を使用する必要があります。各テーブルはそのスキーマと共に記述します。
   テーブルはスキーマ名とテーブル名の両方を使用してアクセスします:

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'schema1.table1,schema2.table2,schema1.table3',
         materialized_postgresql_tables_list_with_schema = 1;

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema2.table2`;
```

ただし、この場合、`materialized_postgresql_tables_list`内のすべてのテーブルはスキーマ名と共に記述する必要があります。
`materialized_postgresql_tables_list_with_schema = 1`の設定が必要です。

警告: この場合、テーブル名にドットを使用することはできません。

3. 1つの`MaterializedPostgreSQL`データベースエンジンに対して、すべてのテーブルを含む任意の数のスキーマを使用します。`materialized_postgresql_schema_list`設定を使用する必要があります。

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema_list = 'schema1,schema2,schema3';

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema1.table2`;
SELECT * FROM database1.`schema2.table2`;
```

警告: この場合、テーブル名にドットを使用することはできません。


## 要件 {#requirements}

1. PostgreSQL設定ファイルにおいて、[wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html)設定を`logical`に、`max_replication_slots`パラメータを最低`2`に設定する必要があります。

2. レプリケーション対象の各テーブルは、以下のいずれかの[レプリカアイデンティティ](https://www.postgresql.org/docs/10/sql-altertable.html#SQL-CREATETABLE-REPLICA-IDENTITY)を持つ必要があります:

- プライマリキー(デフォルト)

- インデックス

```bash
postgres# CREATE TABLE postgres_table (a Integer NOT NULL, b Integer, c Integer NOT NULL, d Integer, e Integer NOT NULL);
postgres# CREATE unique INDEX postgres_table_index on postgres_table(a, c, e);
postgres# ALTER TABLE postgres_table REPLICA IDENTITY USING INDEX postgres_table_index;
```

プライマリキーが常に最初にチェックされます。プライマリキーが存在しない場合は、レプリカアイデンティティインデックスとして定義されたインデックスがチェックされます。
インデックスをレプリカアイデンティティとして使用する場合、テーブル内にそのようなインデックスは1つのみ存在する必要があります。
特定のテーブルで使用されているタイプは、以下のコマンドで確認できます:

```bash
postgres# SELECT CASE relreplident
          WHEN 'd' THEN 'default'
          WHEN 'n' THEN 'nothing'
          WHEN 'f' THEN 'full'
          WHEN 'i' THEN 'index'
       END AS replica_identity
FROM pg_class
WHERE oid = 'postgres_table'::regclass;
```

:::note
[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html)値のレプリケーションはサポートされていません。データ型のデフォルト値が使用されます。
:::


## 設定 {#settings}

### `materialized_postgresql_tables_list` {#materialized-postgresql-tables-list}

    [MaterializedPostgreSQL](../../engines/database-engines/materialized-postgresql.md)データベースエンジンを介してレプリケートされるPostgreSQLデータベーステーブルのカンマ区切りリストを設定します。

    各テーブルは、括弧内にレプリケートする列のサブセットを指定できます。列のサブセットが省略された場合、テーブルのすべての列がレプリケートされます。

    ```sql
    materialized_postgresql_tables_list = 'table1(co1, col2),table2,table3(co3, col5, col7)
    ```

    デフォルト値: 空のリスト — PostgreSQLデータベース全体がレプリケートされることを意味します。

### `materialized_postgresql_schema` {#materialized-postgresql-schema}

    デフォルト値: 空文字列(デフォルトスキーマが使用されます)

### `materialized_postgresql_schema_list` {#materialized-postgresql-schema-list}

    デフォルト値: 空のリスト(デフォルトスキーマが使用されます)

### `materialized_postgresql_max_block_size` {#materialized-postgresql-max-block-size}

    PostgreSQLデータベーステーブルにデータをフラッシュする前にメモリに収集される行数を設定します。

    使用可能な値:

    - 正の整数

    デフォルト値: `65536`

### `materialized_postgresql_replication_slot` {#materialized-postgresql-replication-slot}

    ユーザーが作成したレプリケーションスロット。`materialized_postgresql_snapshot`と併せて使用する必要があります。

### `materialized_postgresql_snapshot` {#materialized-postgresql-snapshot}

    [PostgreSQLテーブルの初期ダンプ](../../engines/database-engines/materialized-postgresql.md)が実行されるスナップショットを識別するテキスト文字列。`materialized_postgresql_replication_slot`と併せて使用する必要があります。

    ```sql
    CREATE DATABASE database1
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS materialized_postgresql_tables_list = 'table1,table2,table3';

    SELECT * FROM database1.table1;
    ```

    必要に応じて、DDLクエリを使用して設定を変更できます。ただし、`materialized_postgresql_tables_list`設定を変更することはできません。この設定のテーブルリストを更新するには、`ATTACH TABLE`クエリを使用してください。

    ```sql
    ALTER DATABASE postgres_database MODIFY SETTING materialized_postgresql_max_block_size = <new_size>;
    ```

### `materialized_postgresql_use_unique_replication_consumer_identifier` {#materialized_postgresql_use_unique_replication_consumer_identifier}

レプリケーションに一意のレプリケーションコンシューマ識別子を使用します。デフォルト: `0`。
`1`に設定すると、同じ`PostgreSQL`テーブルを指す複数の`MaterializedPostgreSQL`テーブルを設定できます。


## 注意事項 {#notes}

### 論理レプリケーションスロットのフェイルオーバー {#logical-replication-slot-failover}

プライマリに存在する論理レプリケーションスロットは、スタンバイレプリカでは利用できません。
そのため、フェイルオーバーが発生すると、新しいプライマリ(旧物理スタンバイ)は旧プライマリに存在していたスロットを認識できません。これによりPostgreSQLからのレプリケーションが破損します。
この問題の解決策は、レプリケーションスロットを手動で管理し、永続的なレプリケーションスロットを定義することです(詳細情報は[こちら](https://patroni.readthedocs.io/en/latest/SETTINGS.html)を参照してください)。`materialized_postgresql_replication_slot`設定でスロット名を指定する必要があり、`EXPORT SNAPSHOT`オプションでエクスポートする必要があります。スナップショット識別子は`materialized_postgresql_snapshot`設定で指定する必要があります。

これは実際に必要な場合にのみ使用してください。本当に必要でない場合や、なぜ必要なのか完全に理解していない場合は、テーブルエンジンに独自のレプリケーションスロットを作成・管理させる方が適切です。

**例([@bchrobot](https://github.com/bchrobot)より)**

1. PostgreSQLでレプリケーションスロットを設定します。

   ```yaml
   apiVersion: "acid.zalan.do/v1"
   kind: postgresql
   metadata:
     name: acid-demo-cluster
   spec:
     numberOfInstances: 2
     postgresql:
       parameters:
         wal_level: logical
     patroni:
       slots:
         clickhouse_sync:
           type: logical
           database: demodb
           plugin: pgoutput
   ```

2. レプリケーションスロットの準備が整うまで待機し、トランザクションを開始してトランザクションスナップショット識別子をエクスポートします:

   ```sql
   BEGIN;
   SELECT pg_export_snapshot();
   ```

3. ClickHouseでデータベースを作成します:

   ```sql
   CREATE DATABASE demodb
   ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
   SETTINGS
     materialized_postgresql_replication_slot = 'clickhouse_sync',
     materialized_postgresql_snapshot = '0000000A-0000023F-3',
     materialized_postgresql_tables_list = 'table1,table2,table3';
   ```

4. ClickHouseデータベースへのレプリケーションが確認されたら、PostgreSQLトランザクションを終了します。フェイルオーバー後もレプリケーションが継続することを確認します:

   ```bash
   kubectl exec acid-demo-cluster-0 -c postgres -- su postgres -c 'patronictl failover --candidate acid-demo-cluster-1 --force'
   ```

### 必要な権限 {#required-permissions}

1. [CREATE PUBLICATION](https://postgrespro.ru/docs/postgresql/14/sql-createpublication) -- 作成クエリ権限。

2. [CREATE_REPLICATION_SLOT](https://postgrespro.ru/docs/postgrespro/10/protocol-replication#PROTOCOL-REPLICATION-CREATE-SLOT) -- レプリケーション権限。

3. [pg_drop_replication_slot](https://postgrespro.ru/docs/postgrespro/9.5/functions-admin#functions-replication) -- レプリケーション権限またはスーパーユーザー。

4. [DROP PUBLICATION](https://postgrespro.ru/docs/postgresql/10/sql-droppublication) -- パブリケーションの所有者(MaterializedPostgreSQLエンジン自体の`username`)。

`2`と`3`のコマンドの実行とそれらの権限を回避することは可能です。`materialized_postgresql_replication_slot`と`materialized_postgresql_snapshot`の設定を使用してください。ただし、十分に注意して使用してください。

テーブルへのアクセス:

1. pg_publication

2. pg_replication_slots

3. pg_publication_tables
