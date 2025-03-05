---
slug: /engines/database-engines/materialized-postgresql
sidebar_label: MaterializedPostgreSQL
sidebar_position: 60
title: "MaterializedPostgreSQL"
description: "PostgreSQLデータベースからのテーブルを持つClickHouseデータベースを作成します。"
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
ClickHouse Cloudユーザーは、PostgreSQLのレプリケーションに[ClickPipes](/integrations/clickpipes)を使用することを推奨します。これにより、PostgreSQL用の高性能な変更データキャプチャ (CDC) がネイティブにサポートされます。
:::

PostgreSQLデータベースからのテーブルを持つClickHouseデータベースを作成します。まず、エンジン`MaterializedPostgreSQL`を使用してデータベースはPostgreSQLデータベースのスナップショットを作成し、必要なテーブルをロードします。必要なテーブルには、指定されたデータベースの任意のスキーマからの任意のテーブルの部分集合を含めることができます。スナップショットと共に、データベースエンジンはLSNを取得し、一度テーブルの初期ダンプが実行されると、WALからの更新の取り込みを開始します。データベースが作成された後、新たに追加されたPostgreSQLデータベースのテーブルは自動的にはレプリケーションに追加されません。手動で`ATTACH TABLE db.table`クエリを使用して追加する必要があります。

レプリケーションはPostgreSQLの論理レプリケーションプロトコルを使用して実装されており、DDLのレプリケーションは許可されていませんが、レプリケーションを中断させる変更が発生したかどうかを知ることができます（カラムの型変更、カラムの追加/削除）。このような変更は検出され、該当するテーブルは更新を受信しなくなります。この場合、テーブルを完全に再ロードするために`ATTACH`/ `DETACH PERMANENTLY`クエリを使用する必要があります。DDLがレプリケーションを中断させない場合（たとえば、カラムの名前変更）、テーブルは引き続き更新を受信します（挿入は位置によって行われます）。

:::note
このデータベースエンジンは実験的です。使用するには、設定ファイルで`allow_experimental_database_materialized_postgresql`を1に設定するか、`SET`コマンドを使用してください：
```sql
SET allow_experimental_database_materialized_postgresql=1
```
:::

## データベースの作成 {#creating-a-database}

``` sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MaterializedPostgreSQL('host:port', 'database', 'user', 'password') [SETTINGS ...]
```

**エンジンパラメータ**

- `host:port` — PostgreSQLサーバーのエンドポイント。
- `database` — PostgreSQLデータベース名。
- `user` — PostgreSQLユーザー。
- `password` — ユーザーパスワード。

## 使用例 {#example-of-use}

``` sql
CREATE DATABASE postgres_db
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password');

SHOW TABLES FROM postgres_db;

┌─name───┐
│ table1 │
└────────┘

SELECT * FROM postgresql_db.postgres_table;
```

## レプリケーションに新しいテーブルを動的に追加する {#dynamically-adding-table-to-replication}

`MaterializedPostgreSQL`データベースが作成されると、対応するPostgreSQLデータベース内の新しいテーブルを自動的に検出することはありません。そのようなテーブルは手動で追加できます：

``` sql
ATTACH TABLE postgres_database.new_table;
```

:::warning
22.1以前のバージョンでは、テーブルをレプリケーションに追加すると、削除されない一時的なレプリケーションスロット（名前は`{db_name}_ch_replication_slot_tmp`）が残ります。ClickHouseバージョン22.1以前でテーブルをアタッチする場合は、手動で削除することを確認してください（`SELECT pg_drop_replication_slot('{db_name}_ch_replication_slot_tmp')`）。さもなければ、ディスク使用量が増加します。この問題は22.1で修正されました。
:::

## レプリケーションからテーブルを動的に削除する {#dynamically-removing-table-from-replication}

特定のテーブルをレプリケーションから削除することができます：

``` sql
DETACH TABLE postgres_database.table_to_remove PERMANENTLY;
```

## PostgreSQLスキーマ {#schema}

PostgreSQL [スキーマ](https://www.postgresql.org/docs/9.1/ddl-schemas.html)は、3つの方法で構成できます（バージョン21.12以降）。

1. 一つの`MaterializedPostgreSQL`データベースエンジンに対する一つのスキーマ。設定`materialized_postgresql_schema`の使用が必要です。
テーブルにはテーブル名のみでアクセスします：

``` sql
CREATE DATABASE postgres_database
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema = 'postgres_schema';

SELECT * FROM postgres_database.table1;
```

2. 一つの`MaterializedPostgreSQL`データベースエンジンに対して指定されたテーブルのセットを持つ任意の数のスキーマ。設定`materialized_postgresql_tables_list`の使用が必要です。各テーブルは、そのスキーマと共に書かれます。
テーブルにはスキーマ名とテーブル名の両方でアクセスします：

``` sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'schema1.table1,schema2.table2,schema1.table3',
         materialized_postgresql_tables_list_with_schema = 1;

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema2.table2`;
```

ただし、この場合、`materialized_postgresql_tables_list`内のすべてのテーブルはスキーマ名と共に記載する必要があります。
`materialized_postgresql_tables_list_with_schema = 1`が必要です。

警告：この場合テーブル名にドットは許可されません。

3. 一つの`MaterializedPostgreSQL`データベースエンジンに対してフルセットのテーブルを持つ任意の数のスキーマ。設定`materialized_postgresql_schema_list`の使用が必要です。

``` sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema_list = 'schema1,schema2,schema3';

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema1.table2`;
SELECT * FROM database1.`schema2.table2`;
```

警告：この場合テーブル名にドットは許可されません。

## 要件 {#requirements}

1. PostgreSQL設定ファイルで[wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html)設定は`logical`の値を持ち、`max_replication_slots`パラメータは少なくとも`2`の値を持っている必要があります。

2. 各レプリケートされたテーブルは、次のいずれかの[レプリカID](https://www.postgresql.org/docs/10/sql-altertable.html#SQL-CREATETABLE-REPLICA-IDENTITY)を持っていなければなりません：

- 主キー（デフォルト）

- インデックス

``` bash
postgres# CREATE TABLE postgres_table (a Integer NOT NULL, b Integer, c Integer NOT NULL, d Integer, e Integer NOT NULL);
postgres# CREATE unique INDEX postgres_table_index on postgres_table(a, c, e);
postgres# ALTER TABLE postgres_table REPLICA IDENTITY USING INDEX postgres_table_index;
```

主キーは常に最初にチェックされます。存在しない場合は、レプリカアイデンティティインデックスとして定義されたインデックスがチェックされます。
インデックスがレプリカアイデンティティとして使用される場合、テーブルにはそのようなインデックスが1つだけ存在している必要があります。
特定のテーブルで使用されているタイプを確認するには、次のコマンドを使用します：

``` bash
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

    PostgreSQLデータベーステーブルのカンマ区切りリストを設定します。これらのテーブルは[MaterializedPostgreSQL](../../engines/database-engines/materialized-postgresql.md)データベースエンジンを介してレプリケートされます。

    各テーブルは、ブラケット内にレプリケートされるカラムの部分集合を持つことができます。カラムの部分集合が省略された場合、テーブルのすべてのカラムがレプリケートされます。

    ``` sql
    materialized_postgresql_tables_list = 'table1(co1, col2),table2,table3(co3, col5, col7)
    ```

    デフォルト値：空のリスト — PostgreSQLデータベース全体がレプリケートされます。

### `materialized_postgresql_schema` {#materialized-postgresql-schema}

    デフォルト値：空の文字列。（デフォルトスキーマが使用されます）

### `materialized_postgresql_schema_list` {#materialized-postgresql-schema-list}

    デフォルト値：空のリスト。（デフォルトスキーマが使用されます）

### `materialized_postgresql_max_block_size` {#materialized-postgresql-max-block-size}

    PostgreSQLデータベーステーブルにデータをフラッシュする前にメモリに収集される行の数を設定します。

    考えられる値：

    - 正の整数。

    デフォルト値：`65536`。

### `materialized_postgresql_replication_slot` {#materialized-postgresql-replication-slot}

    ユーザーが作成したレプリケーションスロット。`materialized_postgresql_snapshot`と一緒に使用する必要があります。

### `materialized_postgresql_snapshot` {#materialized-postgresql-snapshot}

    PostgreSQLテーブルの[初期ダンプ](../../engines/database-engines/materialized-postgresql.md)を実行するスナップショットを識別するテキスト文字列。`materialized_postgresql_replication_slot`と一緒に使用する必要があります。

    ``` sql
    CREATE DATABASE database1
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS materialized_postgresql_tables_list = 'table1,table2,table3';

    SELECT * FROM database1.table1;
    ```

    設定は、必要に応じてDDLクエリを使用して変更できます。ただし、設定`materialized_postgresql_tables_list`を変更することはできません。この設定のテーブルリストを更新するには、`ATTACH TABLE`クエリを使用します。

    ``` sql
    ALTER DATABASE postgres_database MODIFY SETTING materialized_postgresql_max_block_size = <new_size>;
    ```

### `materialized_postgresql_use_unique_replication_consumer_identifier` {#materialized_postgresql_use_unique_replication_consumer_identifier}

レプリケーションのためにユニークなレプリケーションコンシューマ識別子を使用します。デフォルト：`0`。
`1`に設定すると、同じ`PostgreSQL`テーブルを指す複数の`MaterializedPostgreSQL`テーブルを設定できます。

## ノート {#notes}

### 論理レプリケーションスロットのフェイルオーバー {#logical-replication-slot-failover}

プライマリに存在する論理レプリケーションスロットはスタンバイレプリカでは利用できません。
したがって、フェイルオーバーが発生すると、新しいプライマリ（以前の物理スタンバイ）は、古いプライマリで存在していたスロットを認識しません。これにより、PostgreSQLからのレプリケーションが壊れます。
これを解決するためには、レプリケーションスロットを自分で管理し、永続的なレプリケーションスロットを定義する必要があります（詳細は[こちら](https://patroni.readthedocs.io/en/latest/SETTINGS.html)をご覧ください）。スロット名を`materialized_postgresql_replication_slot`設定で渡す必要があり、`EXPORT SNAPSHOT`オプションでエクスポートする必要があります。スナップショット識別子は`materialized_postgresql_snapshot`設定で渡す必要があります。

これは実際に必要な場合にのみ使用する必要があることに注意してください。本当にその必要性や理由がわからない場合は、テーブルエンジンに独自のレプリケーションスロットを作成して管理させる方が良いです。

**例（[@bchrobot](https://github.com/bchrobot)から）**

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

2. レプリケーションスロットが準備できるのを待ち、その後トランザクションを開始し、トランザクションスナップショット識別子をエクスポートします：

    ```sql
    BEGIN;
    SELECT pg_export_snapshot();
    ```

3. ClickHouseにデータベースを作成します：

    ```sql
    CREATE DATABASE demodb
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS
      materialized_postgresql_replication_slot = 'clickhouse_sync',
      materialized_postgresql_snapshot = '0000000A-0000023F-3',
      materialized_postgresql_tables_list = 'table1,table2,table3';
    ```

4. PostgreSQLトランザクションを終了し、ClickHouse DBへのレプリケーションが確認されたら、フェイルオーバー後もレプリケーションが続くことを確認します：

    ```bash
    kubectl exec acid-demo-cluster-0 -c postgres -- su postgres -c 'patronictl failover --candidate acid-demo-cluster-1 --force'
    ```

### 必要な権限 {#required-permissions}

1. [CREATE PUBLICATION](https://postgrespro.ru/docs/postgresql/14/sql-createpublication) — 作成クエリの特権。

2. [CREATE_REPLICATION_SLOT](https://postgrespro.ru/docs/postgrespro/10/protocol-replication#PROTOCOL-REPLICATION-CREATE-SLOT) — レプリケーション特権。

3. [pg_drop_replication_slot](https://postgrespro.ru/docs/postgrespro/9.5/functions-admin#functions-replication) — レプリケーション特権またはスーパーユーザー。

4. [DROP PUBLICATION](https://postgrespro.ru/docs/postgresql/10/sql-droppublication) — 出版物の所有者（MaterializedPostgreSQLエンジン内での`username`）。

`2`および`3`のコマンドを実行せずに、その権限を持たずに済ませることができます。設定`materialized_postgresql_replication_slot`および`materialized_postgresql_snapshot`を使用してください。ただし、十分注意が必要です。

テーブルへのアクセス：

1. pg_publication

2. pg_replication_slots

3. pg_publication_tables
