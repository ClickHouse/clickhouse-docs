---
'description': 'PostgreSQL データベースからのテーブルを持つ ClickHouse データベースを作成します。'
'sidebar_label': 'MaterializedPostgreSQL'
'sidebar_position': 60
'slug': '/engines/database-engines/materialized-postgresql'
'title': 'MaterializedPostgreSQL'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';



# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
ClickHouse Cloudユーザーは、[ClickPipes](/integrations/clickpipes)を使用してPostgreSQLからClickHouseへのレプリケーションを行うことを推奨します。これはPostgreSQLに対して高性能なChange Data Capture (CDC) をネイティブにサポートします。
:::

ClickHouseデータベースをPostgreSQLデータベースからのテーブルとともに作成します。まず、エンジン`MaterializedPostgreSQL`を持つデータベースはPostgreSQLデータベースのスナップショットを作成し、必要なテーブルをロードします。必要なテーブルには、指定されたデータベースの任意のスキーマからの任意のテーブルのサブセットを含めることができます。スナップショットとともに、データベースエンジンはLSNを取得し、初期のテーブルダンプが行われると、WALからの更新の取得を開始します。データベースが作成された後、PostgreSQLデータベースに新たに追加されたテーブルは、自動的にレプリケーションに追加されません。`ATTACH TABLE db.table`クエリで手動で追加する必要があります。

レプリケーションはPostgreSQL Logical Replication Protocolを使用して実装されており、DDLのレプリケーションは許可されていませんが、レプリケーション壊れる可能性がある変化（カラムタイプの変更、カラムの追加/削除）を把握することができます。そのような変更が検出されると、該当するテーブルが更新の受信を停止します。この場合、テーブルを完全に再ロードするために`ATTACH`/ `DETACH PERMANENTLY`クエリを使用する必要があります。DDLがレプリケーションを壊さない場合（例: カラムの名前変更）、テーブルは引き続き更新を受信します（挿入は位置によって行われます）。

:::note
このデータベースエンジンは実験的です。使用するには、設定ファイルで`allow_experimental_database_materialized_postgresql`を1に設定するか、`SET`コマンドを使用してください：
```sql
SET allow_experimental_database_materialized_postgresql=1
```
:::

## データベースの作成 {#creating-a-database}

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MaterializedPostgreSQL('host:port', 'database', 'user', 'password') [SETTINGS ...]
```

**エンジンのパラメータ**

- `host:port` — PostgreSQLサーバーエンドポイント。
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

## 新しいテーブルをレプリケーションに動的に追加する {#dynamically-adding-table-to-replication}

`MaterializedPostgreSQL`データベースが作成された後、関連するPostgreSQLデータベース内の新しいテーブルを自動的に検出することはありません。そのようなテーブルは手動で追加できます：

```sql
ATTACH TABLE postgres_database.new_table;
```

:::warning
バージョン22.1以前では、レプリケーションにテーブルを追加した場合、削除されない一時的なレプリケーションスロット（`{db_name}_ch_replication_slot_tmp`という名前）が残ります。22.1以前のClickHouseバージョンでテーブルをアタッチする際は、それを手動で削除することを確認してください（`SELECT pg_drop_replication_slot('{db_name}_ch_replication_slot_tmp')`）。そうしないとディスク使用量が増加します。この問題は22.1で修正されました。
:::

## レプリケーションからテーブルを動的に削除する {#dynamically-removing-table-from-replication}

特定のテーブルをレプリケーションから削除することが可能です：

```sql
DETACH TABLE postgres_database.table_to_remove PERMANENTLY;
```

## PostgreSQLスキーマ {#schema}

PostgreSQLの[schema](https://www.postgresql.org/docs/9.1/ddl-schemas.html)は3つの方法で構成できます（バージョン21.12以降）。

1. 1つの`MaterializedPostgreSQL`データベースエンジン用の1つのスキーマ。設定`materialized_postgresql_schema`を使用する必要があります。
テーブルはテーブル名のみでアクセスされます：

```sql
CREATE DATABASE postgres_database
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema = 'postgres_schema';

SELECT * FROM postgres_database.table1;
```

2. 1つの`MaterializedPostgreSQL`データベースエンジン用の指定されたテーブル集合を持つ任意の数のスキーマ。設定`materialized_postgresql_tables_list`を使用する必要があります。各テーブルはそのスキーマと共に記載されます。
テーブルはスキーマ名とテーブル名の両方を使用してアクセスされます：

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'schema1.table1,schema2.table2,schema1.table3',
         materialized_postgresql_tables_list_with_schema = 1;

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema2.table2`;
```

ただし、この場合、`materialized_postgresql_tables_list`内のすべてのテーブルはそれぞれのスキーマ名とともに記載されなければなりません。
`materialized_postgresql_tables_list_with_schema = 1`が必要です。

警告: この場合、テーブル名にドットは許可されていません。

3. 1つの`MaterializedPostgreSQL`データベースエンジン用のフルセットのテーブルを持つ任意の数のスキーマ。設定`materialized_postgresql_schema_list`を使用する必要があります。

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema_list = 'schema1,schema2,schema3';

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema1.table2`;
SELECT * FROM database1.`schema2.table2`;
```

警告: この場合、テーブル名にドットは許可されていません。

## 要件 {#requirements}

1. [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html)の設定は`logical`でなければならず、`max_replication_slots`のパラメータはPostgreSQLの設定ファイルで少なくとも`2`以上の値を持っていなければなりません。

2. 各レプリケーションされたテーブルには、以下のいずれかの[レプリカアイデンティティ](https://www.postgresql.org/docs/10/sql-altertable.html#SQL-CREATETABLE-REPLICA-IDENTITY)が必要です：

- 主キー（デフォルト）

- インデックス

```bash
postgres# CREATE TABLE postgres_table (a Integer NOT NULL, b Integer, c Integer NOT NULL, d Integer, e Integer NOT NULL);
postgres# CREATE unique INDEX postgres_table_index on postgres_table(a, c, e);
postgres# ALTER TABLE postgres_table REPLICA IDENTITY USING INDEX postgres_table_index;
```

主キーが常に最初にチェックされます。主キーが存在しない場合、レプリカアイデンティティインデックスとして定義されたインデックスがチェックされます。
インデックスがレプリカアイデンティティとして使用される場合、テーブル内にそのようなインデックスが一つだけ存在する必要があります。
特定のテーブルに対してどのタイプが使用されているかは、以下のコマンドで確認できます：

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
[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html)値のレプリケーションはサポートされていません。デフォルト値がデータ型に使用されます。
:::

## 設定 {#settings}

### `materialized_postgresql_tables_list` {#materialized-postgresql-tables-list}

    PostgreSQLデータベースのテーブルのカンマ区切りリストを設定します。このテーブルは[MaterializedPostgreSQL](../../engines/database-engines/materialized-postgresql.md)データベースエンジンを介してレプリケーションされます。

    各テーブルは、角括弧内に含まれるリプリケートされたカラムのサブセットを持つことができます。カラムのサブセットが省略された場合、そのテーブルのすべてのカラムがレプリケートされます。

```sql
materialized_postgresql_tables_list = 'table1(co1, col2),table2,table3(co3, col5, col7)
```

    デフォルト値: 空のリスト - これは、全PostgreSQLデータベースがレプリケートされることを意味します。

### `materialized_postgresql_schema` {#materialized-postgresql-schema}

    デフォルト値: 空の文字列。（デフォルトスキーマが使用されます）

### `materialized_postgresql_schema_list` {#materialized-postgresql-schema-list}

    デフォルト値: 空のリスト。（デフォルトスキーマが使用されます）

### `materialized_postgresql_max_block_size` {#materialized-postgresql-max-block-size}

    PostgreSQLデータベーステーブルにデータをフラッシュする前にメモリ内に収集される行の数を設定します。

    可能な値：

    - 正の整数。

    デフォルト値: `65536`。

### `materialized_postgresql_replication_slot` {#materialized-postgresql-replication-slot}

    ユーザーが作成したレプリケーションスロット。`materialized_postgresql_snapshot`と一緒に使用する必要があります。

### `materialized_postgresql_snapshot` {#materialized-postgresql-snapshot}

    PostgreSQLテーブルの[初期ダンプ](../../engines/database-engines/materialized-postgresql.md)が行われるスナップショットを特定する文字列。`materialized_postgresql_replication_slot`と一緒に使用する必要があります。

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'table1,table2,table3';

SELECT * FROM database1.table1;
```

    設定は必要に応じてDDLクエリを使用して変更できます。ただし、設定`materialized_postgresql_tables_list`を変更することは不可能です。この設定内のテーブルリストを更新するには、`ATTACH TABLE`クエリを使用してください。

```sql
ALTER DATABASE postgres_database MODIFY SETTING materialized_postgresql_max_block_size = <new_size>;
```

### `materialized_postgresql_use_unique_replication_consumer_identifier` {#materialized_postgresql_use_unique_replication_consumer_identifier}

レプリケーション用に一意のレプリケーションコンシューマアイデンティファイアを使用します。デフォルト: `0`。
`1`に設定すると、同じ`PostgreSQL`テーブルを指す複数の`MaterializedPostgreSQL`テーブルを設定できます。

## 注 {#notes}

### 論理レプリケーションスロットのフェイルオーバー {#logical-replication-slot-failover}

プライマリに存在するロジカルレプリケーションスロットはスタンバイレプリカでは利用できません。
したがって、フェイルオーバーが発生すると、新しいプライマリ（古い物理スタンバイ）は、古いプライマリとともに存在していたスロットを認識しなくなります。これにより、PostgreSQLからのレプリケーションが壊れます。
これへの解決策は、自身でレプリケーションスロットを管理し、永続的なレプリケーションスロットを定義することです（いくつかの情報は[こちら](https://patroni.readthedocs.io/en/latest/SETTINGS.html)で見つけることができます）。スロット名を`materialized_postgresql_replication_slot`設定経由で渡し、`EXPORT SNAPSHOT`オプションでエクスポートする必要があります。スナップショット識別子は`materialized_postgresql_snapshot`設定経由で渡される必要があります。

これは実際に必要な場合にのみ使用するべきことに注意してください。実際の必要がない場合やその理由を完全に理解していない場合は、テーブルエンジンが自らのレプリケーションスロットを作成および管理できるようにする方が良いです。

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

2. レプリケーションスロットが準備ができるのを待ちます。その後、トランザクションを開始し、トランザクションスナップショット識別子をエクスポートします：

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

4. PostgreSQLトランザクションを終了し、ClickHouse DBへのレプリケーションが確認された後、フェイルオーバー後のレプリケーションが続いていることを確認します：

```bash
kubectl exec acid-demo-cluster-0 -c postgres -- su postgres -c 'patronictl failover --candidate acid-demo-cluster-1 --force'
```

### 必要な権限 {#required-permissions}

1. [CREATE PUBLICATION](https://postgrespro.ru/docs/postgresql/14/sql-createpublication) — 作成クエリの特権。

2. [CREATE_REPLICATION_SLOT](https://postgrespro.ru/docs/postgrespro/10/protocol-replication#PROTOCOL-REPLICATION-CREATE-SLOT) — レプリケーション特権。

3. [pg_drop_replication_slot](https://postgrespro.ru/docs/postgrespro/9.5/functions-admin#functions-replication) — レプリケーション特権またはスーパーユーザー。

4. [DROP PUBLICATION](https://postgrespro.ru/docs/postgresql/10/sql-droppublication) — 出版物の所有者（MaterializedPostgreSQLエンジン内の`username`）。

`2`および`3`コマンドを実行し、そのような権限を持つ必要を回避することが可能です。設定`materialized_postgresql_replication_slot`および`materialized_postgresql_snapshot`を使用してください。ただし、極めて注意が必要です。

テーブルへのアクセス：

1. pg_publication

2. pg_replication_slots

3. pg_publication_tables
