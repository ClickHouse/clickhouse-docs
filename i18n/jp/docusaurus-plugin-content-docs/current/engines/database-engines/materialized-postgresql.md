---
'description': 'Creates a ClickHouse database with tables from PostgreSQL database.'
'sidebar_label': 'MaterializedPostgreSQL'
'sidebar_position': 60
'slug': '/engines/database-engines/materialized-postgresql'
'title': 'MaterializedPostgreSQL'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
ClickHouse Cloud ユーザーは、PostgreSQL から ClickHouse へのレプリケーションに [ClickPipes](/integrations/clickpipes) を使用することを推奨されます。これにより、PostgreSQL 用の高性能な変更データキャプチャ (CDC) がネイティブにサポートされます。
:::

PostgreSQL データベースからテーブルを持つ ClickHouse データベースを作成します。まず、エンジン `MaterializedPostgreSQL` を使用してデータベースが PostgreSQL データベースのスナップショットを作成し、必要なテーブルをロードします。必要なテーブルには、指定されたデータベースの任意のスキーマからの任意のテーブルのサブセットを含めることができます。スナップショットとともに、データベースエンジンは LSN を取得し、テーブルの初期ダンプが実行されると、WAL からの更新をプルし始めます。データベースが作成された後、PostgreSQL データベースに新しく追加されたテーブルは、自動的にレプリケーションに追加されません。これらは `ATTACH TABLE db.table` クエリを使用して手動で追加する必要があります。

レプリケーションは PostgreSQL 論理レプリケーションプロトコルで実装されており、DDL をレプリケートすることはできませんが、レプリケーションの破壊的変更が発生したかどうかを知ることができます（カラムの型変更、カラムの追加/削除）。そのような変更が検出されると、該当するテーブルは更新を受信しなくなります。この場合、テーブルを完全に再ロードするために `ATTACH` / `DETACH PERMANENTLY` クエリを使用する必要があります。DDL がレプリケーションを破損しない場合（例えば、カラムの名前を変更する場合）テーブルは引き続き更新を受け取ります（挿入は位置によって行われます）。

:::note
このデータベースエンジンは実験的です。使用するには、設定ファイルで `allow_experimental_database_materialized_postgresql` を 1 に設定するか、`SET` コマンドを使用します：
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

- `host:port` — PostgreSQL サーバーエンドポイント。
- `database` — PostgreSQL データベース名。
- `user` — PostgreSQL ユーザー。
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

## レプリケーションに新しいテーブルを動的に追加 {#dynamically-adding-table-to-replication}

`MaterializedPostgreSQL` データベースが作成された後、自動的に対応する PostgreSQL データベース内の新しいテーブルを検出することはありません。このようなテーブルは手動で追加できます：

```sql
ATTACH TABLE postgres_database.new_table;
```

:::warning
バージョン 22.1 より前では、テーブルをレプリケーションに追加すると、一時的なレプリケーションスロット（`{db_name}_ch_replication_slot_tmp`という名前）が削除されませんでした。ClickHouse バージョン 22.1 より前でテーブルをアタッチする場合は、手動で削除する必要があります（`SELECT pg_drop_replication_slot('{db_name}_ch_replication_slot_tmp')`）。さもなければディスク使用量が増加します。この問題は 22.1 で修正されています。
:::

## レプリケーションからテーブルを動的に削除 {#dynamically-removing-table-from-replication}

特定のテーブルをレプリケーションから削除することが可能です：

```sql
DETACH TABLE postgres_database.table_to_remove PERMANENTLY;
```

## PostgreSQL スキーマ {#schema}

PostgreSQL [スキーマ](https://www.postgresql.org/docs/9.1/ddl-schemas.html) は、（バージョン 21.12 以降）3 つの方法で構成できます。

1. 1 つの `MaterializedPostgreSQL` データベースエンジン用の 1 つのスキーマ。設定 `materialized_postgresql_schema` を使用する必要があります。
テーブルはテーブル名のみでアクセスされます：

```sql
CREATE DATABASE postgres_database
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema = 'postgres_schema';

SELECT * FROM postgres_database.table1;
```

2. 1 つの `MaterializedPostgreSQL` データベースエンジン用に指定されたテーブルセットを持つ任意の数のスキーマ。設定 `materialized_postgresql_tables_list` を使用する必要があります。各テーブルは、そのスキーマとともに記述されます。
テーブルはスキーマ名とテーブル名の両方でアクセスされます：

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'schema1.table1,schema2.table2,schema1.table3',
         materialized_postgresql_tables_list_with_schema = 1;

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema2.table2`;
```

この場合、`materialized_postgresql_tables_list` のすべてのテーブルは、スキーマ名とともに記述する必要があります。
`materialized_postgresql_tables_list_with_schema = 1` が必要です。

警告：この場合、テーブル名にドットは許可されません。

3. 1 つの `MaterializedPostgreSQL` データベースエンジン用にフルのテーブルセットを持つ任意の数のスキーマ。設定 `materialized_postgresql_schema_list` を使用する必要があります。

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema_list = 'schema1,schema2,schema3';

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema1.table2`;
SELECT * FROM database1.`schema2.table2`;
```

警告：この場合、テーブル名にドットは許可されません。

## 要件 {#requirements}

1. PostgreSQL 設定ファイルの [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) 設定は `logical` の値を持ち、`max_replication_slots` パラメータは少なくとも `2` の値を持つ必要があります。

2. 各レプリケートされたテーブルは、以下のいずれかの [レプリカアイデンティティ](https://www.postgresql.org/docs/10/sql-altertable.html#SQL-CREATETABLE-REPLICA-IDENTITY) を持っている必要があります：

- 主キー（デフォルト）

- インデックス

```bash
postgres# CREATE TABLE postgres_table (a Integer NOT NULL, b Integer, c Integer NOT NULL, d Integer, e Integer NOT NULL);
postgres# CREATE unique INDEX postgres_table_index on postgres_table(a, c, e);
postgres# ALTER TABLE postgres_table REPLICA IDENTITY USING INDEX postgres_table_index;
```

主キーが常に最初にチェックされます。主キーが存在しない場合、レプリカアイデンティティインデックスとして定義されたインデックスがチェックされます。
インデックスがレプリカアイデンティティとして使用される場合、そのテーブルにはそのインデックスが 1 つだけ存在しなければなりません。
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
[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 値のレプリケーションはサポートされていません。データ型のデフォルト値が使用されます。
:::

## 設定 {#settings}

### `materialized_postgresql_tables_list` {#materialized-postgresql-tables-list}

    PostgreSQL データベーステーブルのカンマ区切りリストを設定します。これらは [MaterializedPostgreSQL](../../engines/database-engines/materialized-postgresql.md) データベースエンジンを介してレプリケートされます。

    各テーブルは、カッコ内にレプリケートされるカラムのサブセットを持つことができます。カラムのサブセットが省略された場合、テーブルのすべてのカラムがレプリケートされます。

    ```sql
    materialized_postgresql_tables_list = 'table1(co1, col2),table2,table3(co3, col5, col7)
    ```

    デフォルト値：空のリスト — つまり、すべての PostgreSQL データベースがレプリケートされることを意味します。

### `materialized_postgresql_schema` {#materialized-postgresql-schema}

    デフォルト値：空の文字列。（デフォルトスキーマが使用されます）

### `materialized_postgresql_schema_list` {#materialized-postgresql-schema-list}

    デフォルト値：空のリスト。（デフォルトスキーマが使用されます）

### `materialized_postgresql_max_block_size` {#materialized-postgresql-max-block-size}

    PostgreSQL データベーステーブルにデータをフラッシュする前にメモリに収集される行の数を設定します。

    許可される値：

    - 正の整数。

    デフォルト値： `65536`。

### `materialized_postgresql_replication_slot` {#materialized-postgresql-replication-slot}

    ユーザーが作成したレプリケーションスロット。`materialized_postgresql_snapshot` と一緒に使用する必要があります。

### `materialized_postgresql_snapshot` {#materialized-postgresql-snapshot}

    [PostgreSQL テーブルの初期ダンプ](../../engines/database-engines/materialized-postgresql.md) が実行されるスナップショットを識別するテキスト文字列。`materialized_postgresql_replication_slot` と一緒に使用する必要があります。

    ```sql
    CREATE DATABASE database1
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS materialized_postgresql_tables_list = 'table1,table2,table3';

    SELECT * FROM database1.table1;
    ```

    必要に応じて DDL クエリを使用して設定を変更できます。ただし、`materialized_postgresql_tables_list` 設定を変更することはできません。この設定のテーブルリストを更新するには、`ATTACH TABLE` クエリを使用してください。

    ```sql
    ALTER DATABASE postgres_database MODIFY SETTING materialized_postgresql_max_block_size = <new_size>;
    ```

### `materialized_postgresql_use_unique_replication_consumer_identifier` {#materialized_postgresql_use_unique_replication_consumer_identifier}

レプリケーションのために一意のレプリケーションコンシューマ識別子を使用します。デフォルト：`0`。
`1` に設定すると、同じ `PostgreSQL` テーブルを指す複数の `MaterializedPostgreSQL` テーブルをセットアップすることができます。

## 注意事項 {#notes}

### 論理レプリケーションスロットのフェイルオーバー {#logical-replication-slot-failover}

プライマリに存在する論理レプリケーションスロットは、スタンバイレプリカでは利用できません。
したがって、フェイルオーバーが発生した場合、新しいプライマリ（古い物理スタンバイ）は、古いプライマリで存在していたスロットについて知ることができません。これにより、PostgreSQL からのレプリケーションが壊れます。
これに対処するためには、レプリケーションスロットを自分で管理し、永続的なレプリケーションスロットを定義する必要があります（詳細情報は [こちら](https://patroni.readthedocs.io/en/latest/SETTINGS.html)にあります）。スロット名を `materialized_postgresql_replication_slot` 設定を介して渡す必要があり、`EXPORT SNAPSHOT` オプションでエクスポートされている必要があります。スナップショット識別子は `materialized_postgresql_snapshot` 設定を介して渡す必要があります。

これは必要な場合のみ使用することに注意してください。実際に必要ない場合や、その理由を完全に理解していない場合、テーブルエンジンが自分でスロットを作成および管理できるようにする方が良いです。

**例（[@bchrobot](https://github.com/bchrobot) から）**

1. PostgreSQL にレプリケーションスロットを設定します。

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

2. レプリケーションスロットが準備できるのを待ち、その後トランザクションを開始してトランザクションスナップショット識別子をエクスポートします：

    ```sql
    BEGIN;
    SELECT pg_export_snapshot();
    ```

3. ClickHouse にデータベースを作成します：

    ```sql
    CREATE DATABASE demodb
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS
      materialized_postgresql_replication_slot = 'clickhouse_sync',
      materialized_postgresql_snapshot = '0000000A-0000023F-3',
      materialized_postgresql_tables_list = 'table1,table2,table3';
    ```

4. ClickHouse DB へのレプリケーションが確認できたら、PostgreSQL トランザクションを終了します。フェイルオーバー後もレプリケーションが続くことを確認します：

    ```bash
    kubectl exec acid-demo-cluster-0 -c postgres -- su postgres -c 'patronictl failover --candidate acid-demo-cluster-1 --force'
    ```

### 必要な権限 {#required-permissions}

1. [CREATE PUBLICATION](https://postgrespro.ru/docs/postgresql/14/sql-createpublication) — 作成クエリの特権。

2. [CREATE_REPLICATION_SLOT](https://postgrespro.ru/docs/postgrespro/10/protocol-replication#PROTOCOL-REPLICATION-CREATE-SLOT) — レプリケーションの特権。

3. [pg_drop_replication_slot](https://postgrespro.ru/docs/postgrespro/9.5/functions-admin#functions-replication) — レプリケーションの特権またはスーパーユーザー。

4. [DROP PUBLICATION](https://postgrespro.ru/docs/postgresql/10/sql-droppublication) — 出版物の所有者（MaterializedPostgreSQL エンジン内の `username`）。

`2` および `3` コマンドを実行し、その権限を持たないようにすることは可能です。設定 `materialized_postgresql_replication_slot` と `materialized_postgresql_snapshot` を使用します。ただし、十分な注意が必要です。

テーブルへのアクセス：

1. pg_publication

2. pg_replication_slots

3. pg_publication_tables
