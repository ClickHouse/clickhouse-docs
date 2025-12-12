---
description: 'PostgreSQL データベースのテーブルから ClickHouse データベースを作成します。'
sidebar_label: 'MaterializedPostgreSQL'
sidebar_position: 60
slug: /engines/database-engines/materialized-postgresql
title: 'MaterializedPostgreSQL'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MaterializedPostgreSQL {#materializedpostgresql}

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::note
ClickHouse Cloud ユーザーには、PostgreSQL から ClickHouse へのレプリケーションには [ClickPipes](/integrations/clickpipes) の利用を推奨します。ClickPipes は PostgreSQL 向けに高性能な Change Data Capture（CDC）をネイティブにサポートします。
:::

PostgreSQL データベースのテーブルに基づいて ClickHouse データベースを作成します。まず、`MaterializedPostgreSQL` エンジンを持つデータベースが PostgreSQL データベースのスナップショットを作成し、必要なテーブルをロードします。必要なテーブルには、指定したデータベース内の任意のスキーマおよびテーブルの任意のサブセットを含めることができます。スナップショットと同時にデータベースエンジンは LSN を取得し、テーブルの初回ダンプが完了すると、WAL から更新の取得を開始します。データベース作成後に PostgreSQL データベースへ新規に追加されたテーブルは、自動的にはレプリケーションに追加されません。これらは `ATTACH TABLE db.table` クエリを用いて手動で追加する必要があります。

レプリケーションは PostgreSQL Logical Replication Protocol で実装されており、DDL のレプリケーションはできませんが、レプリケーションを破綻させる変更（カラム型の変更、カラムの追加/削除）が発生したかどうかは検出できます。このような変更が検出されると、該当するテーブルは更新の受信を停止します。この場合、`ATTACH` / `DETACH PERMANENTLY` クエリを使用してテーブルを完全に再読み込みする必要があります。DDL がレプリケーションを破綻させない場合（例: カラム名の変更）には、テーブルは引き続き更新を受信します（挿入は位置に基づいて行われます）。

:::note
このデータベースエンジンは実験的なものです。使用するには、設定ファイルで `allow_experimental_database_materialized_postgresql` を 1 に設定するか、`SET` コマンドを使用して設定します:

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

* `host:port` — PostgreSQL サーバーエンドポイント。
* `database` — PostgreSQL データベース名。
* `user` — PostgreSQL ユーザー名。
* `password` — ユーザーのパスワード。

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

`MaterializedPostgreSQL` データベースが作成された後は、対応する PostgreSQL データベース内の新しいテーブルは自動的には検出されません。こうしたテーブルは手動で追加できます。

```sql
ATTACH TABLE postgres_database.new_table;
```

:::warning
バージョン 22.1 より前では、レプリケーションにテーブルを追加すると、削除されない一時レプリケーションスロット（名前は `{db_name}_ch_replication_slot_tmp`）が残っていました。ClickHouse のバージョン 22.1 より前でテーブルをアタッチする場合は、それを手動で削除してください（`SELECT pg_drop_replication_slot('{db_name}_ch_replication_slot_tmp')`）。そうしないとディスク使用量が増加します。この問題は 22.1 で修正されています。
:::

## レプリケーションからテーブルを動的に除外する {#dynamically-removing-table-from-replication}

特定のテーブルをレプリケーション対象から除外することができます。

```sql
DETACH TABLE postgres_database.table_to_remove PERMANENTLY;
```

## PostgreSQL スキーマ {#schema}

PostgreSQL の [スキーマ](https://www.postgresql.org/docs/9.1/ddl-schemas.html) は、3 通りの方法で設定できます（バージョン 21.12 以降）。

1. 1 つの `MaterializedPostgreSQL` データベースエンジンに対して 1 つのスキーマを使用します。この場合は設定 `materialized_postgresql_schema` を使用する必要があります。
   テーブルはテーブル名のみでアクセスされます。

```sql
CREATE DATABASE postgres_database
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema = 'postgres_schema';

SELECT * FROM postgres_database.table1;
```

2. 1つの `MaterializedPostgreSQL` データベースエンジンに対して、任意数のスキーマを定義し、それぞれに対してテーブルの集合を指定する方法。設定 `materialized_postgresql_tables_list` を使用する必要があります。各テーブルは、そのスキーマとともに作成されます。
   テーブルには、スキーマ名とテーブル名を同時に指定してアクセスします：

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'schema1.table1,schema2.table2,schema1.table3',
         materialized_postgresql_tables_list_with_schema = 1;

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema2.table2`;
```

しかしこの場合、`materialized_postgresql_tables_list` 内のすべてのテーブルは、スキーマ名を含めて記述する必要があります。
`materialized_postgresql_tables_list_with_schema = 1` の設定が必要です。

警告：この場合、テーブル名にドットを含めることはできません。

3. 1 つの `MaterializedPostgreSQL` データベースエンジンに対して、任意の数のスキーマと、それぞれに含まれる全テーブルの完全なセットを指定します。設定 `materialized_postgresql_schema_list` を使用する必要があります。

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema_list = 'schema1,schema2,schema3';

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema1.table2`;
SELECT * FROM database1.`schema2.table2`;
```

警告: このケースでは、テーブル名にピリオド（.）を含めることはできません。

## 要件 {#requirements}

1. PostgreSQL の設定ファイルにおいて、[wal&#95;level](https://www.postgresql.org/docs/current/runtime-config-wal.html) 設定は `logical` にし、`max_replication_slots` パラメータは少なくとも `2` に設定する必要があります。

2. 各レプリケーション対象テーブルには、次のいずれかの [replica identity](https://www.postgresql.org/docs/10/sql-altertable.html#SQL-CREATETABLE-REPLICA-IDENTITY) が必要です：

* 主キー（デフォルト）

* インデックス

```bash
postgres# CREATE TABLE postgres_table (a Integer NOT NULL, b Integer, c Integer NOT NULL, d Integer, e Integer NOT NULL);
postgres# CREATE unique INDEX postgres_table_index on postgres_table(a, c, e);
postgres# ALTER TABLE postgres_table REPLICA IDENTITY USING INDEX postgres_table_index;
```

常に最初に確認されるのは主キーです。主キーが存在しない場合は、レプリカ ID として定義されたインデックスが確認されます。
インデックスがレプリカ ID として使用される場合、そのようなインデックスはテーブル内に 1 つだけ存在している必要があります。
特定のテーブルでどのタイプが使用されているかは、次のコマンドで確認できます。

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
[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 値のレプリケーションはサポートされていません。データ型に対して定義されたデフォルト値が使用されます。
:::

## 設定 {#settings}

### `materialized_postgresql_tables_list` {#materialized-postgresql-tables-list}

[MaterializedPostgreSQL](../../engines/database-engines/materialized-postgresql.md) データベースエンジンによって複製される、PostgreSQL データベースのテーブルのコンマ区切りリストを設定します。

各テーブルでは、複製するカラムのサブセットを角括弧で囲んで指定できます。カラムのサブセットを省略した場合、そのテーブルのすべてのカラムが複製されます。

```sql
    materialized_postgresql_tables_list = 'table1(co1, col2),table2,table3(co3, col5, col7)
    ```

デフォルト値: 空リスト。空リストの場合、PostgreSQL データベース全体がレプリケートされます。

### `materialized_postgresql_schema` {#materialized-postgresql-schema}

デフォルト値: 空文字列（デフォルトスキーマが使用されます）。

### `materialized_postgresql_schema_list` {#materialized-postgresql-schema-list}

デフォルト値: 空リスト（デフォルトスキーマが使用されます）。

### `materialized_postgresql_max_block_size` {#materialized-postgresql-max-block-size}

PostgreSQL データベースのテーブルにデータをフラッシュする前に、メモリ内に蓄積する行数を設定します。

取りうる値:

* 正の整数。

デフォルト値: `65536`。

### `materialized_postgresql_replication_slot` {#materialized-postgresql-replication-slot}

ユーザーが作成したレプリケーションスロットです。`materialized_postgresql_snapshot` と一緒に使用する必要があります。

### `materialized_postgresql_snapshot` {#materialized-postgresql-snapshot}

スナップショットを識別する文字列であり、このスナップショットから [PostgreSQL テーブルの初回ダンプ](../../engines/database-engines/materialized-postgresql.md) が実行されます。`materialized_postgresql_replication_slot` と一緒に使用する必要があります。

```sql
    CREATE DATABASE database1
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS materialized_postgresql_tables_list = 'table1,table2,table3';

    SELECT * FROM database1.table1;
    ```

必要に応じて、設定は DDL クエリを使用して変更できます。ただし、`materialized_postgresql_tables_list` 設定そのものを変更することはできません。この設定のテーブルリストを更新するには、`ATTACH TABLE` クエリを使用してください。

```sql
    ALTER DATABASE postgres_database MODIFY SETTING materialized_postgresql_max_block_size = <new_size>;
    ```

### `materialized_postgresql_use_unique_replication_consumer_identifier` {#materialized_postgresql_use_unique_replication_consumer_identifier}

レプリケーション用に一意のレプリケーションコンシューマ識別子を使用します。デフォルト: `0`。
`1` に設定すると、同じ `PostgreSQL` テーブルを参照する複数の `MaterializedPostgreSQL` テーブルを設定できるようになります。

## 注意事項 {#notes}

### 論理レプリケーションスロットのフェイルオーバー {#logical-replication-slot-failover}

プライマリ上に存在する論理レプリケーションスロットは、スタンバイレプリカでは利用できません。
そのためフェイルオーバーが発生すると、新しいプライマリ（元の物理スタンバイ）は、旧プライマリに存在していたスロットを認識できません。この結果、PostgreSQL からのレプリケーションが中断されます。
この問題への解決策としては、自分でレプリケーションスロットを管理し、永続的なレプリケーションスロットを定義する方法があります（詳細は[こちら](https://patroni.readthedocs.io/en/latest/SETTINGS.html)を参照してください）。`materialized_postgresql_replication_slot` 設定でスロット名を指定し、そのスロットは `EXPORT SNAPSHOT` オプションを使ってエクスポートされている必要があります。スナップショット識別子は `materialized_postgresql_snapshot` 設定で指定する必要があります。

これは本当に必要な場合にのみ使用するべきである点に注意してください。その必要性や理由を十分に理解していない場合は、テーブルエンジンにレプリケーションスロットの作成および管理を任せる方が望ましいです。

**例（[@bchrobot](https://github.com/bchrobot) より）**

1. PostgreSQL でレプリケーションスロットを設定します。

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

2. レプリケーションスロットが利用可能になるまで待機し、その後トランザクションを開始してトランザクションスナップショット識別子をエクスポートします:

    ```sql
    BEGIN;
    SELECT pg_export_snapshot();
    ```

3. ClickHouse でデータベースを作成します:

    ```sql
    CREATE DATABASE demodb
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS
      materialized_postgresql_replication_slot = 'clickhouse_sync',
      materialized_postgresql_snapshot = '0000000A-0000023F-3',
      materialized_postgresql_tables_list = 'table1,table2,table3';
    ```

4. ClickHouse DB へのレプリケーションが確認できたら、PostgreSQL のトランザクションを終了します。フェイルオーバー後もレプリケーションが継続していることを検証します:

    ```bash
    kubectl exec acid-demo-cluster-0 -c postgres -- su postgres -c 'patronictl failover --candidate acid-demo-cluster-1 --force'
    ```

### 必要な権限 {#required-permissions}

1. [CREATE PUBLICATION](https://postgrespro.ru/docs/postgresql/14/sql-createpublication) -- CREATE PUBLICATION を実行する権限。

2. [CREATE_REPLICATION_SLOT](https://postgrespro.ru/docs/postgrespro/10/protocol-replication#PROTOCOL-REPLICATION-CREATE-SLOT) -- レプリケーション権限。

3. [pg_drop_replication_slot](https://postgrespro.ru/docs/postgrespro/9.5/functions-admin#functions-replication) -- レプリケーション権限またはスーパーユーザー権限。

4. [DROP PUBLICATION](https://postgrespro.ru/docs/postgresql/10/sql-droppublication) -- publication のオーナー（MaterializedPostgreSQL エンジン内の `username`）。

`2` および `3` のコマンドを実行せず、それらの権限を持たないようにすることも可能です。その場合は `materialized_postgresql_replication_slot` および `materialized_postgresql_snapshot` 設定を使用します。ただし、その際は細心の注意を払ってください。

次のテーブルへのアクセス権が必要です:

1. pg_publication

2. pg_replication_slots

3. pg_publication_tables
