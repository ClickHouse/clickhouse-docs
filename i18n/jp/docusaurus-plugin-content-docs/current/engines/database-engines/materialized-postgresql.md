---
description: 'PostgreSQL データベースからのテーブルを使用して ClickHouse データベースを作成します。'
sidebar_label: 'MaterializedPostgreSQL'
sidebar_position: 60
slug: /engines/database-engines/materialized-postgresql
title: 'MaterializedPostgreSQL'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
ClickHouse Cloud ユーザーは、PostgreSQL から ClickHouse へのレプリケーションには [ClickPipes](/integrations/clickpipes) の使用を推奨します。これは PostgreSQL に対する高性能の変更データキャプチャ (CDC) をネイティブにサポートします。
:::

PostgreSQL データベースからのテーブルを使用して ClickHouse データベースを作成します。まず、エンジン `MaterializedPostgreSQL` を使用してデータベースが PostgreSQL データベースのスナップショットを作成し、必要なテーブルをロードします。必要なテーブルには、指定されたデータベースの任意のスキーマからの任意のテーブルのサブセットを含めることができます。スナップショットと共に、データベースエンジンは LSN を取得し、テーブルの初期ダンプが実行されると、WAL からの更新を取得し始めます。データベースが作成された後に PostgreSQL データベースに新しく追加されたテーブルは、自動的にレプリケーションに追加されません。これらは手動で `ATTACH TABLE db.table` クエリを使用して追加する必要があります。

レプリケーションは PostgreSQL 論理レプリケーションプロトコルを使用して実装されており、DDL のレプリケーションは許可されていませんが、レプリケーションブレイキング変更（カラムタイプの変更、カラムの追加/削除）が発生したかどうかを知ることができます。このような変更は検出され、対応するテーブルは更新を受け取るのを停止します。この場合、テーブルを完全に再読み込みするために `ATTACH`/ `DETACH PERMANENTLY` クエリを使用する必要があります。DDL がレプリケーションをブレイクしない場合（たとえば、カラムの名前変更）、テーブルは引き続き更新を受け取ります（挿入は位置によって行われます）。

:::note
このデータベースエンジンは実験的です。使用するには、設定ファイルで `allow_experimental_database_materialized_postgresql` を 1 にセットするか、`SET` コマンドを使用します：
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

## レプリケーションに新しいテーブルを動的に追加する {#dynamically-adding-table-to-replication}

`MaterializedPostgreSQL` データベースが作成された後、対応する PostgreSQL データベース内の新しいテーブルを自動的に検出しません。そのようなテーブルは手動で追加できます：

```sql
ATTACH TABLE postgres_database.new_table;
```

:::warning
バージョン 22.1 の前では、レプリケーションにテーブルを追加すると一時的なレプリケーションスロット (`{db_name}_ch_replication_slot_tmp` という名前) が未削除のまま残りました。ClickHouse バージョン 22.1 より前でテーブルを追加する場合は、手動で削除することを確認してください (`SELECT pg_drop_replication_slot('{db_name}_ch_replication_slot_tmp')`)。そうしないと、ディスク使用量が増加します。この問題は 22.1 で修正されました。
:::

## レプリケーションからテーブルを動的に削除する {#dynamically-removing-table-from-replication}

特定のテーブルをレプリケーションから削除することができます：

```sql
DETACH TABLE postgres_database.table_to_remove PERMANENTLY;
```

## PostgreSQL スキーマ {#schema}

PostgreSQL [スキーマ](https://www.postgresql.org/docs/9.1/ddl-schemas.html) は、3 つの方法で構成できます (バージョン 21.12 以降)。

1. 1 つの `MaterializedPostgreSQL` データベースエンジンあたり 1 つのスキーマ。設定 `materialized_postgresql_schema` を使用する必要があります。
テーブルはテーブル名のみでアクセスされます：

```sql
CREATE DATABASE postgres_database
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema = 'postgres_schema';

SELECT * FROM postgres_database.table1;
```

2. 1 つの `MaterializedPostgreSQL` データベースエンジンに対して指定されたテーブルのセットを持つ任意の数のスキーマ。設定 `materialized_postgresql_tables_list` を使用する必要があります。各テーブルは、そのスキーマと共に記述されます。
テーブルはスキーマ名とテーブル名の両方でアクセスされます：

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'schema1.table1,schema2.table2,schema1.table3',
         materialized_postgresql_tables_list_with_schema = 1;

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema2.table2`;
```

ただし、この場合、`materialized_postgresql_tables_list` のすべてのテーブルはスキーマ名と共に記述される必要があります。
`materialized_postgresql_tables_list_with_schema = 1` が必要です。

警告: この場合、テーブル名内のドットは許可されていません。

3. 1 つの `MaterializedPostgreSQL` データベースエンジンに対して、任意の数のスキーマを持つ完全なテーブルセット。設定 `materialized_postgresql_schema_list` を使用する必要があります。

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema_list = 'schema1,schema2,schema3';

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema1.table2`;
SELECT * FROM database1.`schema2.table2`;
```

警告: この場合、テーブル名内のドットは許可されていません。

## 要件 {#requirements}

1. PostgreSQL 設定ファイル内で `wal_level` 設定が `logical` の値を持ち、`max_replication_slots` パラメータが少なくとも `2` である必要があります。

2. 各レプリケートテーブルは、以下のいずれかの [レプリカアイデンティティ](https://www.postgresql.org/docs/10/sql-altertable.html#SQL-CREATETABLE-REPLICA-IDENTITY) を持っている必要があります：

- 主キー（デフォルト）

- インデックス

```bash
postgres# CREATE TABLE postgres_table (a Integer NOT NULL, b Integer, c Integer NOT NULL, d Integer, e Integer NOT NULL);
postgres# CREATE unique INDEX postgres_table_index on postgres_table(a, c, e);
postgres# ALTER TABLE postgres_table REPLICA IDENTITY USING INDEX postgres_table_index;
```

主キーは常に最初にチェックされます。もしそれが存在しない場合は、レプリカアイデンティティインデックスとして定義されたインデックスがチェックされます。
インデックスがレプリカアイデンティティとして使用される場合は、テーブル内にそのようなインデックスが 1 つだけ必要です。
特定のテーブルでどのタイプが使用されているかを確認するには、以下のコマンドを使用します：

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

    各テーブルには、カッコ内にレプリケートするカラムのサブセットを持たせることができます。カラムのサブセットが省略されると、テーブルのすべてのカラムがレプリケートされます。

    ```sql
    materialized_postgresql_tables_list = 'table1(co1, col2),table2,table3(co3, col5, col7)
    ```

    デフォルト値: 空のリスト — PostgreSQL データベース全体がレプリケートされます。

### `materialized_postgresql_schema` {#materialized-postgresql-schema}

    デフォルト値: 空の文字列。（デフォルトスキーマが使用されます）

### `materialized_postgresql_schema_list` {#materialized-postgresql-schema-list}

    デフォルト値: 空のリスト。（デフォルトスキーマが使用されます）

### `materialized_postgresql_max_block_size` {#materialized-postgresql-max-block-size}

    PostgreSQL データベーステーブルにデータをフラッシュする前に、メモリ内に収集される行の数を設定します。

    可能な値：

    - 正の整数。

    デフォルト値: `65536`。

### `materialized_postgresql_replication_slot` {#materialized-postgresql-replication-slot}

    ユーザーが作成したレプリケーションスロット。 `materialized_postgresql_snapshot` とともに使用する必要があります。

### `materialized_postgresql_snapshot` {#materialized-postgresql-snapshot}

    PostgreSQL テーブルの [初期ダンプ](../../engines/database-engines/materialized-postgresql.md) を実行するためのスナップショットを識別するテキスト文字列。 `materialized_postgresql_replication_slot` とともに使用する必要があります。

    ```sql
    CREATE DATABASE database1
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS materialized_postgresql_tables_list = 'table1,table2,table3';

    SELECT * FROM database1.table1;
    ```

    設定は必要に応じて、DDL クエリを使用して変更できます。しかし、設定 `materialized_postgresql_tables_list` を変更することはできません。この設定内のテーブルリストを更新するには、`ATTACH TABLE` クエリを使用します。

    ```sql
    ALTER DATABASE postgres_database MODIFY SETTING materialized_postgresql_max_block_size = <new_size>;
    ```

### `materialized_postgresql_use_unique_replication_consumer_identifier` {#materialized_postgresql_use_unique_replication_consumer_identifier}

レプリケーションに一意のレプリケーションコンシューマ識別子を使用します。デフォルト: `0`。
`1` に設定すると、同じ `PostgreSQL` テーブルを指す複数の `MaterializedPostgreSQL` テーブルを設定できます。

## 注記 {#notes}

### 論理レプリケーションスロットのフェイルオーバー {#logical-replication-slot-failover}

プライマリに存在する論理レプリケーションスロットはスタンバイレプリカでは利用できません。
そのため、フェイルオーバーが発生した場合、新しいプライマリ（古い物理スタンバイ）は、古いプライマリで存在していたスロットを認識しません。これにより、PostgreSQL からのレプリケーションが壊れることになります。この問題への解決策は、レプリケーションスロットを自分で管理し、永続的なレプリケーションスロットを定義することです（いくつかの情報は [こちら](https://patroni.readthedocs.io/en/latest/SETTINGS.html) にあります）。スロット名を `materialized_postgresql_replication_slot` 設定を介して渡し、`EXPORT SNAPSHOT` オプションでエクスポートする必要があります。スナップショット識別子は `materialized_postgresql_snapshot` 設定を介して渡す必要があります。

これは実際に必要な場合にのみ使用されるべきです。実際の必要性がない場合や、その理由を完全に理解していない場合は、テーブルエンジンが独自のレプリケーションスロットを作成し管理することを許可した方が良いです。

**例（[@bchrobot](https://github.com/bchrobot) から）**

1. PostgreSQL でレプリケーションスロットを構成します。

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

2. レプリケーションスロットが準備できるのを待ち、トランザクションを開始してトランザクションスナップショット識別子をエクスポートします：

    ```sql
    BEGIN;
    SELECT pg_export_snapshot();
    ```

3. ClickHouse でデータベースを作成します：

    ```sql
    CREATE DATABASE demodb
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS
      materialized_postgresql_replication_slot = 'clickhouse_sync',
      materialized_postgresql_snapshot = '0000000A-0000023F-3',
      materialized_postgresql_tables_list = 'table1,table2,table3';
    ```

4. PostgreSQL トランザクションを終了し、ClickHouse DB へのレプリケーションが確認されたら、フェイルオーバー後にレプリケーションが継続されることを検証します：

    ```bash
    kubectl exec acid-demo-cluster-0 -c postgres -- su postgres -c 'patronictl failover --candidate acid-demo-cluster-1 --force'
    ```

### 必要な権限 {#required-permissions}

1. [CREATE PUBLICATION](https://postgrespro.ru/docs/postgresql/14/sql-createpublication) — 作成クエリ権限。

2. [CREATE_REPLICATION_SLOT](https://postgrespro.ru/docs/postgrespro/10/protocol-replication#PROTOCOL-REPLICATION-CREATE-SLOT) — レプリケーション権限。

3. [pg_drop_replication_slot](https://postgrespro.ru/docs/postgrespro/9.5/functions-admin#functions-replication) — レプリケーション権限またはスーパーユーザー。

4. [DROP PUBLICATION](https://postgrespro.ru/docs/postgresql/10/sql-droppublication) — 出版物の所有者（MaterializedPostgreSQL エンジン自体の `username`）。

`2` および `3` のコマンドを実行し、これらの権限を持たずに済ませることができます。設定 `materialized_postgresql_replication_slot` と `materialized_postgresql_snapshot` を使用してください。しかし、注意が必要です。

テーブルへのアクセス：

1. pg_publication

2. pg_replication_slots

3. pg_publication_tables
