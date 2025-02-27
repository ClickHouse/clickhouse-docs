---
slug: /engines/database-engines/materialized-postgresql
sidebar_label: MaterializedPostgreSQL
sidebar_position: 60
title: "MaterializedPostgreSQL"
description: "ClickHouseデータベースをPostgreSQLデータベースのテーブルで作成します。"
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
ClickHouse Cloudユーザーは、[ClickPipes](/integrations/clickpipes)を使用してPostgreSQLをClickHouseにレプリケートすることをお勧めします。これはPostgreSQLの高性能な変更データキャプチャ（CDC）をネイティブにサポートしています。
:::

PostgreSQLデータベースのテーブルを使用してClickHouseデータベースを作成します。まず、`MaterializedPostgreSQL`エンジンを使用してデータベースを作成すると、PostgreSQLデータベースのスナップショットが作成され、必要なテーブルがロードされます。必要なテーブルには、指定されたデータベースからの任意のスキーマの任意のサブセットのテーブルが含まれる場合があります。スナップショットと共に、データベースエンジンはLSNを取得し、テーブルの初期ダンプが実行されると、WALからの更新をプルし始めます。データベースが作成された後、新しく追加されたテーブルはPostgreSQLデータベースに自動的にレプリケートされません。これらは、`ATTACH TABLE db.table`クエリを使用して手動で追加する必要があります。

レプリケーションはPostgreSQLのLogical Replication Protocolを使用して実装されており、DDLをレプリケートすることはできませんが、レプリケーションを妨げる変更（カラムタイプの変更、カラムの追加/削除）が発生したかどうかを知ることができます。そうした変更が検出されると、該当するテーブルは更新を受信しなくなります。この場合、テーブルを完全に再ロードするために`ATTACH`/ `DETACH PERMANENTLY`クエリを使用する必要があります。DDLがレプリケーションを妨げない場合（例えば、カラムの名前を変更する場合）、テーブルは引き続き更新を受信します（挿入は位置によって行われます）。

:::note
このデータベースエンジンは実験的です。使用するには、設定ファイルで`allow_experimental_database_materialized_postgresql`を1に設定するか、`SET`コマンドを使用します：
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
- `password` — ユーザーパスワード。

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

`MaterializedPostgreSQL`データベースが作成された後、そのデータベース内の新しいテーブルは自動的に検出されません。そのようなテーブルを手動で追加できます：

```sql
ATTACH TABLE postgres_database.new_table;
```

:::warning
22.1以前のバージョンでは、テーブルをレプリケーションに追加すると削除されない一時レプリケーションスロット（`{db_name}_ch_replication_slot_tmp`という名前）が残ります。ClickHouseバージョン22.1以前でテーブルを添付する場合は、手動で削除することを確認してください（`SELECT pg_drop_replication_slot('{db_name}_ch_replication_slot_tmp')`）。さもなければ、ディスク使用量が増加します。この問題は22.1で修正されました。
:::

## レプリケーションからのテーブルの動的削除 {#dynamically-removing-table-from-replication}

特定のテーブルをレプリケーションから削除することができます：

```sql
DETACH TABLE postgres_database.table_to_remove PERMANENTLY;
```

## PostgreSQLスキーマ {#schema}

PostgreSQLの[スキーマ](https://www.postgresql.org/docs/9.1/ddl-schemas.html)は、バージョン21.12以降、3つの方法で構成できます。

1. 1つの`MaterializedPostgreSQL`データベースエンジン用のスキーマ。設定`materialized_postgresql_schema`を使用する必要があります。
テーブルはテーブル名のみでアクセスされます：

```sql
CREATE DATABASE postgres_database
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema = 'postgres_schema';

SELECT * FROM postgres_database.table1;
```

2. 1つの`MaterializedPostgreSQL`データベースエンジン用の指定されたテーブルのセットを持つ任意の数のスキーマ。設定`materialized_postgresql_tables_list`を使用する必要があります。各テーブルは、そのスキーマと共に書かれます。
テーブルはスキーマ名とテーブル名の両方で同時にアクセスされます：

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'schema1.table1,schema2.table2,schema1.table3',
         materialized_postgresql_tables_list_with_schema = 1;

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema2.table2`;
```

ただし、この場合、`materialized_postgresql_tables_list`内のすべてのテーブルはそのスキーマ名と共に書かれている必要があります。
`materialized_postgresql_tables_list_with_schema = 1`が必要です。

警告：この場合、テーブル名にピリオドは許可されていません。

3. 1つの`MaterializedPostgreSQL`データベースエンジン用の完全なテーブルセットを持つ任意の数のスキーマ。設定`materialized_postgresql_schema_list`を使用する必要があります。

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema_list = 'schema1,schema2,schema3';

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema1.table2`;
SELECT * FROM database1.`schema2.table2`;
```

警告：この場合、テーブル名にピリオドは許可されていません。

## 要件 {#requirements}

1. PostgreSQLの設定ファイルで、[wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html)設定は`logical`でなければならず、`max_replication_slots`パラメータは少なくとも`2`の値を持たなければなりません。

2. 各レプリケートテーブルは、以下のいずれかの[レプリカID](https://www.postgresql.org/docs/10/sql-altertable.html#SQL-CREATETABLE-REPLICA-IDENTITY)を持たなければなりません：

- 主キー（デフォルト）

- インデックス

```bash
postgres# CREATE TABLE postgres_table (a Integer NOT NULL, b Integer, c Integer NOT NULL, d Integer, e Integer NOT NULL);
postgres# CREATE unique INDEX postgres_table_index on postgres_table(a, c, e);
postgres# ALTER TABLE postgres_table REPLICA IDENTITY USING INDEX postgres_table_index;
```

主キーが最初に常にチェックされます。主キーが存在しない場合、レプリカIDインデックスとして定義されたインデックスがチェックされます。
もしインデックスがレプリカIDとして使用される場合、テーブルにはそのようなインデックスが1つだけ存在しなければなりません。
特定のテーブルで使用されているタイプを確認するには、以下のコマンドを使用します：

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

    レプリケートされるPostgreSQLデータベーステーブルのカンマ区切りリストを設定します。[MaterializedPostgreSQL](../../engines/database-engines/materialized-postgresql.md)データベースエンジンを介して。

    各テーブルには、カッコ内にレプリケートされる列のサブセットを持つことができます。列のサブセットが省略された場合、そのテーブルのすべての列がレプリケートされます。

    ```sql
    materialized_postgresql_tables_list = 'table1(co1, col2),table2,table3(co3, col5, col7)
    ```

    デフォルト値：空のリスト — つまり、全PostgreSQLデータベースがレプリケートされます。

### `materialized_postgresql_schema` {#materialized-postgresql-schema}

    デフォルト値：空の文字列。（デフォルトスキーマが使用されます）

### `materialized_postgresql_schema_list` {#materialized-postgresql-schema-list}

    デフォルト値：空のリスト。（デフォルトスキーマが使用されます）

### `materialized_postgresql_max_block_size` {#materialized-postgresql-max-block-size}

    PostgreSQLデータベーステーブルにデータをフラッシュする前にメモリ内に収集される行の数を設定します。

    設定可能な値：

    - 正の整数。

    デフォルト値：`65536`。

### `materialized_postgresql_replication_slot` {#materialized-postgresql-replication-slot}

    ユーザーが作成したレプリケーションスロット。`materialized_postgresql_snapshot`と一緒に使用する必要があります。

### `materialized_postgresql_snapshot` {#materialized-postgresql-snapshot}

    [PostgreSQLテーブルの初期ダンプ](../../engines/database-engines/materialized-postgresql.md)が行われるスナップショットを識別するテキスト文字列。`materialized_postgresql_replication_slot`と一緒に使用する必要があります。

    ```sql
    CREATE DATABASE database1
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS materialized_postgresql_tables_list = 'table1,table2,table3';

    SELECT * FROM database1.table1;
    ```

    必要に応じてDDLクエリを使用して設定を変更できますが、設定`materialized_postgresql_tables_list`を変更することはできません。この設定のテーブルリストを更新するには、`ATTACH TABLE`クエリを使用します。

    ```sql
    ALTER DATABASE postgres_database MODIFY SETTING materialized_postgresql_max_block_size = <new_size>;
    ```

### `materialized_postgresql_use_unique_replication_consumer_identifier` {#materialized_postgresql_use_unique_replication_consumer_identifier}

レプリケーションのためにユニークなレプリケーションコンシューマ識別子を使用します。デフォルト：`0`。
`1`に設定すると、同じ`PostgreSQL`テーブルを指す複数の`MaterializedPostgreSQL`テーブルを設定できます。

## 注意事項 {#notes}

### 論理レプリケーションスロットのフェイルオーバー {#logical-replication-slot-failover}

プライマリに存在する論理レプリケーションスロットはスタンバイレプリカでは利用できません。
したがって、フェイルオーバーがあると、新しいプライマリ（古い物理スタンバイ）は古いプライマリで存在していたスロットを認識しません。これにより、PostgreSQLからのレプリケーションが壊れます。
これに対処するには、レプリケーションスロットを自分で管理し、永続的なレプリケーションスロットを定義する必要があります（詳細は[こちら](https://patroni.readthedocs.io/en/latest/SETTINGS.html)を参照）。スロット名を`materialized_postgresql_replication_slot`設定を介して渡し、`EXPORT SNAPSHOT`オプションでエクスポートする必要があります。スナップショット識別子は`materialized_postgresql_snapshot`設定を介して渡す必要があります。

これは実際に必要な場合のみ使用することに注意してください。その必要がない場合や完全に理解していない場合は、テーブルエンジンに自分でレプリケーションスロットを作成して管理させる方が良いです。

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

2. レプリケーションスロットが準備できるのを待ち、トランザクションを開始してスナップショット識別子をエクスポートします：

    ```sql
    BEGIN;
    SELECT pg_export_snapshot();
    ```

3. ClickHouseでデータベースを作成します：

    ```sql
    CREATE DATABASE demodb
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS
      materialized_postgresql_replication_slot = 'clickhouse_sync',
      materialized_postgresql_snapshot = '0000000A-0000023F-3',
      materialized_postgresql_tables_list = 'table1,table2,table3';
    ```

4. ClickHouse DBへのレプリケーションが確認されたらPostgreSQLトランザクションを終了します。その後、フェイルオーバー後にレプリケーションが続いていることを確認します：

    ```bash
    kubectl exec acid-demo-cluster-0 -c postgres -- su postgres -c 'patronictl failover --candidate acid-demo-cluster-1 --force'
    ```

### 必要な権限 {#required-permissions}

1. [CREATE PUBLICATION](https://postgrespro.ru/docs/postgresql/14/sql-createpublication) — 作成クエリの特権。

2. [CREATE_REPLICATION_SLOT](https://postgrespro.ru/docs/postgrespro/10/protocol-replication#PROTOCOL-REPLICATION-CREATE-SLOT) — レプリケーションの特権。

3. [pg_drop_replication_slot](https://postgrespro.ru/docs/postgrespro/9.5/functions-admin#functions-replication) — レプリケーションの特権またはスーパーユーザー。

4. [DROP PUBLICATION](https://postgrespro.ru/docs/postgresql/10/sql-droppublication) — 公開の所有者（MaterializedPostgreSQLエンジン自体の`username`）。

コマンド`2`と`3`の実行とそれらの権限を回避することが可能です。設定`materialized_postgresql_replication_slot`と`materialized_postgresql_snapshot`を使用してください。ただし慎重に行ってください。

テーブルへのアクセス：

1. pg_publication

2. pg_replication_slots

3. pg_publication_tables

