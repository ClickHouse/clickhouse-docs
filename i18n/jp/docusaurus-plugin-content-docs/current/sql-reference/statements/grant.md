---
description: 'GRANT 文に関するドキュメント'
sidebar_label: 'GRANT'
sidebar_position: 38
slug: /sql-reference/statements/grant
title: 'GRANT 文'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# GRANT 文 \\{#grant-statement\\}

- ClickHouse のユーザーアカウントまたはロールに[権限](#privileges)を付与します。
- ロールをユーザーアカウントまたは他のロールに割り当てます。

権限を取り消すには、[REVOKE](../../sql-reference/statements/revoke.md) 文を使用します。また、付与済みの権限は [SHOW GRANTS](../../sql-reference/statements/show.md#show-grants) 文で一覧表示できます。

## 権限付与の構文 \\{#granting-privilege-syntax\\}

```sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

* `privilege` — 権限の種類。
* `role` — ClickHouse ユーザーロール。
* `user` — ClickHouse ユーザーアカウント。

`WITH GRANT OPTION` 句は、`user` または `role` に `GRANT` クエリを実行する権限を付与します。ユーザーは、自分が持つスコープと同じ、またはそれよりも狭いスコープの権限を付与できます。
`WITH REPLACE OPTION` 句は、`user` または `role` に対する既存の権限を新しい権限に置き換えます。指定しない場合は、権限が追加されます。

## ロール割り当ての構文 \\{#assigning-role-syntax\\}

```sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

* `role` — ClickHouse のユーザーロール。
* `user` — ClickHouse のユーザーアカウント。

`WITH ADMIN OPTION` 句は、`user` または `role` に [ADMIN OPTION](#admin-option) 権限を付与します。
`WITH REPLACE OPTION` 句は、`user` または `role` に対して既存のロールを新しいロールに置き換えます。指定されていない場合は、既存のロールにロールを追加します。

## GRANT CURRENT GRANTS 構文 \\{#grant-current-grants-syntax\\}

```sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

* `privilege` — 権限の種類。
* `role` — ClickHouse のユーザーロール。
* `user` — ClickHouse のユーザーアカウント。

`CURRENT GRANTS` ステートメントを使用すると、指定したユーザーまたはロールに、指定したすべての権限を付与できます。
権限が 1 つも指定されていない場合、そのユーザーまたはロールには、`CURRENT_USER` に対して利用可能なすべての権限が付与されます。

## 使用方法 \\{#usage\\}

`GRANT` を使用するには、アカウントに `GRANT OPTION` 権限が付与されている必要があります。アカウントに付与されている権限の範囲内でのみ権限を付与できます。

たとえば、管理者が次のクエリを使って `john` アカウントに権限を付与したとします。

```sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

これは `john` が次の操作を実行する権限を持つことを意味します。

* `SELECT x,y FROM db.table`
* `SELECT x FROM db.table`
* `SELECT y FROM db.table`

`john` は `SELECT z FROM db.table` を実行できません。また、`SELECT * FROM db.table` も利用できません。このクエリを処理する際、ClickHouse は `x` と `y` であっても一切データを返しません。唯一の例外は、テーブルに `x` と `y` カラムだけが含まれている場合です。この場合、ClickHouse はすべてのデータを返します。

また、`john` は `GRANT OPTION` 権限を持っているため、同じ範囲またはそれ以下の範囲の権限を他のユーザーに付与できます。

`system` データベースへのアクセスは常に許可されます（このデータベースはクエリの処理に使用されるため）。

:::note
多くの system テーブルには新しいユーザーでもデフォルトでアクセスできますが、GRANT がないとデフォルトですべての system テーブルにアクセスできるとは限りません。
さらに、`system.zookeeper` など特定の system テーブルへのアクセスは、セキュリティ上の理由から Cloud ユーザーには制限されています。
:::

1 つのクエリで複数のアカウントに複数の権限を付与できます。`GRANT SELECT, INSERT ON *.* TO john, robin` クエリは、アカウント `john` と `robin` に、サーバー上のすべてのデータベース内のすべてのテーブルに対して `INSERT` および `SELECT` クエリを実行することを許可します。

## ワイルドカードによる権限付与 \\{#wildcard-grants\\}

権限を指定する際、テーブル名やデータベース名の代わりにアスタリスク（`*`）を使用できます。たとえば、`GRANT SELECT ON db.* TO john` クエリは、データベース `db` 内のすべてのテーブルに対して、`john` が `SELECT` クエリを実行できるようにします。
また、データベース名を省略することもできます。この場合、権限は現在のデータベースに対して付与されます。
たとえば、`GRANT SELECT ON * TO john` は現在のデータベース内のすべてのテーブルに対する権限を付与し、`GRANT SELECT ON mytable TO john` は現在のデータベース内の `mytable` テーブルに対する権限を付与します。

:::note
以下で説明する機能は ClickHouse バージョン 24.10 以降で利用可能です。
:::

テーブル名やデータベース名の末尾にアスタリスクを付けることもできます。この機能により、テーブルパスの抽象的な接頭辞に対して権限を付与できます。
例: `GRANT SELECT ON db.my_tables* TO john`。このクエリにより、`john` は `db` データベース内の、`my_tables` という接頭辞を持つすべてのテーブルに対して `SELECT` クエリを実行できるようになります。

その他の例:

`GRANT SELECT ON db.my_tables* TO john`

```sql
SELECT * FROM db.my_tables -- granted
SELECT * FROM db.my_tables_0 -- granted
SELECT * FROM db.my_tables_1 -- granted

SELECT * FROM db.other_table -- not_granted
SELECT * FROM db2.my_tables -- not_granted
```

`GRANT SELECT ON db*.* TO john`

```sql
SELECT * FROM db.my_tables -- granted
SELECT * FROM db.my_tables_0 -- granted
SELECT * FROM db.my_tables_1 -- granted
SELECT * FROM db.other_table -- granted
SELECT * FROM db2.my_tables -- granted
```

権限が付与されたパス内で新しく作成されたすべてのテーブルは、自動的に親に設定されたすべての権限を継承します。
たとえば、`GRANT SELECT ON db.* TO john` クエリを実行してから新しいテーブル `db.new_table` を作成すると、ユーザー `john` は `SELECT * FROM db.new_table` クエリを実行できるようになります。

アスタリスク（*）はプレフィックスに対して**のみ**指定できます:

```sql
GRANT SELECT ON db.* TO john -- correct
GRANT SELECT ON db*.* TO john -- correct

GRANT SELECT ON *.my_table TO john -- wrong
GRANT SELECT ON foo*bar TO john -- wrong
GRANT SELECT ON *suffix TO john -- wrong
GRANT SELECT(foo) ON db.table* TO john -- wrong
```

## 権限 \\{#privileges\\}

権限とは、ユーザーに対して特定の種類のクエリを実行することを許可するものです。

権限には階層構造があり、許可されるクエリの集合は権限のスコープによって決まります。

ClickHouse における権限の階層は次のとおりです。

* [`ALL`](#all)
  * [`アクセス管理`](#access-management)
    * `ALLOW SQL SECURITY NONE`
    * `ALTER QUOTA`
    * `ALTER ROLE`
    * `ALTER ROW POLICY`
    * `ALTER SETTINGS PROFILE`
    * `ALTER USER`
    * `CREATE QUOTA`
    * `CREATE ROLE`
    * `CREATE ROW POLICY`
    * `CREATE SETTINGS PROFILE`
    * `CREATE USER`
    * `DROP QUOTA`
    * `DROP ROLE`
    * `DROP ROW POLICY`
    * `DROP SETTINGS PROFILE`
    * `DROP USER`
    * `ROLE ADMIN`
    * `SHOW ACCESS`
      * `SHOW QUOTAS`
      * `SHOW ROLES`
      * `SHOW ROW POLICIES`
      * `SHOW SETTINGS PROFILES`
      * `SHOW USERS`
  * [`ALTER`](#alter)
    * `ALTER DATABASE`
      * `ALTER DATABASE SETTINGS`
    * `ALTER TABLE`
      * `ALTER COLUMN`
        * `ALTER ADD COLUMN`
        * `ALTER CLEAR COLUMN`
        * `ALTER COMMENT COLUMN`
        * `ALTER DROP COLUMN`
        * `ALTER MATERIALIZE COLUMN`
        * `ALTER MODIFY COLUMN`
        * `ALTER RENAME COLUMN`
      * `ALTER CONSTRAINT`
        * `ALTER ADD CONSTRAINT`
        * `ALTER DROP CONSTRAINT`
      * `ALTER DELETE`
      * `ALTER FETCH PARTITION`
      * `ALTER FREEZE PARTITION`
      * `ALTER INDEX`
        * `ALTER ADD INDEX`
        * `ALTER CLEAR INDEX`
        * `ALTER DROP INDEX`
        * `ALTER MATERIALIZE INDEX`
        * `ALTER ORDER BY`
        * `ALTER SAMPLE BY`
      * `ALTER MATERIALIZE TTL`
      * `ALTER MODIFY COMMENT`
      * `ALTER MOVE PARTITION`
      * `ALTER PROJECTION`
      * `ALTER SETTINGS`
      * `ALTER STATISTICS`
        * `ALTER ADD STATISTICS`
        * `ALTER DROP STATISTICS`
        * `ALTER MATERIALIZE STATISTICS`
        * `ALTER MODIFY STATISTICS`
      * `ALTER TTL`
      * `ALTER UPDATE`
    * `ALTER VIEW`
      * `ALTER VIEW MODIFY QUERY`
      * `ALTER VIEW REFRESH`
      * `ALTER VIEW MODIFY SQL SECURITY`
  * [`BACKUP`](#backup)
  * [`CLUSTER`](#cluster)
  * [`CREATE`](#create)
    * `CREATE ARBITRARY TEMPORARY TABLE`
      * `CREATE TEMPORARY TABLE`
    * `CREATE DATABASE`
    * `CREATE DICTIONARY`
    * `CREATE FUNCTION`
    * `CREATE RESOURCE`
    * `CREATE TABLE`
    * `CREATE VIEW`
    * `CREATE WORKLOAD`
  * [`dictGet`](#dictget)
  * [`displaySecretsInShowAndSelect`](#displaysecretsinshowandselect)
  * [`DROP`](#drop)
    * `DROP DATABASE`
    * `DROP DICTIONARY`
    * `DROP FUNCTION`
    * `DROP RESOURCE`
    * `DROP TABLE`
    * `DROP VIEW`
    * `DROP WORKLOAD`
  * [`INSERT`](#insert)
  * [`イントロスペクション`](#introspection)
    * `addressToLine`
    * `addressToLineWithInlines`
    * `addressToSymbol`
    * `demangle`
  * `KILL QUERY`
  * `KILL TRANSACTION`
  * `MOVE PARTITION BETWEEN SHARDS`
  * [`NAMED COLLECTION 管理`](#named-collection-admin)
    * `ALTER NAMED COLLECTION`
    * `CREATE NAMED COLLECTION`
    * `DROP NAMED COLLECTION`
    * `NAMED COLLECTION`
    * `SHOW NAMED COLLECTIONS`
    * `SHOW NAMED COLLECTIONS SECRETS`
  * [`OPTIMIZE`](#optimize)
  * [`SELECT`](#select)
  * [`SET DEFINER`](/sql-reference/statements/create/view#sql_security)
  * [`SHOW`](#show)
    * `SHOW COLUMNS`
    * `SHOW DATABASES`
    * `SHOW DICTIONARIES`
    * `SHOW TABLES`
  * `SHOW FILESYSTEM CACHES`
  * [`ソース`](#sources)
    * `AZURE`
    * `FILE`
    * `HDFS`
    * `HIVE`
    * `JDBC`
    * `KAFKA`
    * `MONGO`
    * `MYSQL`
    * `NATS`
    * `ODBC`
    * `POSTGRES`
    * `RABBITMQ`
    * `REDIS`
    * `REMOTE`
    * `S3`
    * `SQLITE`
    * `URL`
  * [`SYSTEM`](#system)
    * `SYSTEM CLEANUP`
    * `SYSTEM DROP CACHE`
      * `SYSTEM DROP COMPILED EXPRESSION CACHE`
      * `SYSTEM DROP CONNECTIONS CACHE`
      * `SYSTEM DROP DISTRIBUTED CACHE`
      * `SYSTEM DROP DNS CACHE`
      * `SYSTEM DROP FILESYSTEM CACHE`
      * `SYSTEM DROP FORMAT SCHEMA CACHE`
      * `SYSTEM DROP MARK CACHE`
      * `SYSTEM DROP MMAP CACHE`
      * `SYSTEM DROP PAGE CACHE`
      * `SYSTEM DROP PRIMARY INDEX CACHE`
      * `SYSTEM DROP QUERY CACHE`
      * `SYSTEM DROP S3 CLIENT CACHE`
      * `SYSTEM DROP SCHEMA CACHE`
      * `SYSTEM DROP UNCOMPRESSED CACHE`
    * `SYSTEM DROP PRIMARY INDEX CACHE`
    * `SYSTEM DROP REPLICA`
    * `SYSTEM FAILPOINT`
    * `SYSTEM FETCHES`
    * `SYSTEM FLUSH`
      * `SYSTEM FLUSH ASYNC INSERT QUEUE`
      * `SYSTEM FLUSH LOGS`
    * `SYSTEM JEMALLOC`
    * `SYSTEM KILL QUERY`
    * `SYSTEM KILL TRANSACTION`
    * `SYSTEM LISTEN`
    * `SYSTEM LOAD PRIMARY KEY`
    * `SYSTEM MERGES`
    * `SYSTEM MOVES`
    * `SYSTEM PULLING REPLICATION LOG`
    * `SYSTEM REDUCE BLOCKING PARTS`
    * `SYSTEM REPLICATION QUEUES`
    * `SYSTEM REPLICA READINESS`
    * `SYSTEM RESTART DISK`
    * `SYSTEM RESTART REPLICA`
    * `SYSTEM RESTORE REPLICA`
    * `SYSTEM RELOAD`
      * `SYSTEM RELOAD ASYNCHRONOUS METRICS`
      * `SYSTEM RELOAD CONFIG`
        * `SYSTEM RELOAD DICTIONARY`
        * `SYSTEM RELOAD EMBEDDED DICTIONARIES`
        * `SYSTEM RELOAD FUNCTION`
        * `SYSTEM RELOAD MODEL`
        * `SYSTEM RELOAD USERS`
    * `SYSTEM SENDS`
      * `SYSTEM DISTRIBUTED SENDS`
      * `SYSTEM REPLICATED SENDS`
    * `SYSTEM SHUTDOWN`
    * `SYSTEM SYNC DATABASE REPLICA`
    * `SYSTEM SYNC FILE CACHE`
    * `SYSTEM SYNC FILESYSTEM CACHE`
    * `SYSTEM SYNC REPLICA`
    * `SYSTEM SYNC TRANSACTION LOG`
    * `SYSTEM THREAD FUZZER`
    * `SYSTEM TTL MERGES`
    * `SYSTEM UNFREEZE`
    * `SYSTEM UNLOAD PRIMARY KEY`
    * `SYSTEM VIEWS`
    * `SYSTEM VIRTUAL PARTS UPDATE`
    * `SYSTEM WAIT LOADING PARTS`
  * [`TABLE ENGINE`](#table-engine)
  * [`TRUNCATE`](#truncate)
  * `UNDROP TABLE`
* [`NONE`](#none)

この階層がどのように扱われるかの例:

- `ALTER` 権限には、他のすべての `ALTER*` 権限が含まれます。
- `ALTER CONSTRAINT` には、`ALTER ADD CONSTRAINT` および `ALTER DROP CONSTRAINT` 権限が含まれます。

権限はさまざまなレベルで適用されます。レベルを把握していると、その権限に対して利用可能な構文が分かります。

レベル（低いものから高いものへ）:

- `COLUMN` — 権限はカラム、テーブル、データベース、またはグローバルに付与できます。
- `TABLE` — 権限はテーブル、データベース、またはグローバルに付与できます。
- `VIEW` — 権限はビュー、データベース、またはグローバルに付与できます。
- `DICTIONARY` — 権限は Dictionary、データベース、またはグローバルに付与できます。
- `DATABASE` — 権限はデータベース、またはグローバルに付与できます。
- `GLOBAL` — 権限はグローバルにのみ付与できます。
- `GROUP` — 異なるレベルの権限をまとめます。`GROUP` レベルの権限が付与されると、使用した構文に対応するグループ内の権限のみが付与されます。

許可される構文の例:

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

許可されない構文の例:

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

特別な権限 [ALL](#all) は、すべての権限をユーザーアカウントまたはロールに付与します。

デフォルトでは、ユーザーアカウントまたはロールには権限がありません。

ユーザーまたはロールに権限がない場合、それは [NONE](#none) 権限として表示されます。

一部のクエリは、その実装上、一連の権限を必要とします。たとえば、[RENAME](../../sql-reference/statements/optimize.md) クエリを実行するには、`SELECT`、`CREATE TABLE`、`INSERT`、`DROP TABLE` の各権限が必要です。

### SELECT \\{#select\\}

[SELECT](../../sql-reference/statements/select/index.md) クエリの実行を許可します。

権限レベル: `COLUMN`。

**説明**

この権限が付与されたユーザーは、指定されたデータベースおよびテーブル内の、指定されたカラム一覧に対して `SELECT` クエリを実行できます。ユーザーが指定されていないカラムを含めた場合、そのクエリはデータを返しません。

次の権限を考えてみましょう:

```sql
GRANT SELECT(x,y) ON db.table TO john
```

この権限により、`john` は `db.table` の `x` カラムおよび/または `y` カラムのデータを含む任意の `SELECT` クエリを実行できます。たとえば、`SELECT x FROM db.table` です。`john` は `SELECT z FROM db.table` を実行することはできません。`SELECT * FROM db.table` も実行できません。このクエリを処理する際、ClickHouse は `x` や `y` であっても一切データを返しません。唯一の例外は、テーブルが `x` と `y` カラムのみを含む場合であり、この場合は ClickHouse はすべてのデータを返します。

### INSERT \\{#insert\\}

[INSERT](../../sql-reference/statements/insert-into.md) クエリの実行を許可します。

権限レベル: `COLUMN`。

**説明**

ユーザーにこの権限が付与されている場合、指定されたデータベースおよびテーブル内の指定されたカラムの一覧に対して `INSERT` クエリを実行できます。ユーザーが指定されたもの以外のカラムを含めた場合、そのクエリではデータは一切挿入されません。

**例**

```sql
GRANT INSERT(x,y) ON db.table TO john
```

付与された権限により、`john` は `db.table` の `x` カラムおよび `y` カラムの一方または両方にデータを挿入できます。

### ALTER \\{#alter\\}

以下の権限階層に基づいて [ALTER](../../sql-reference/statements/alter/index.md) クエリを実行できます。

- `ALTER`。レベル：`COLUMN`。
  - `ALTER TABLE`。レベル：`GROUP`
  - `ALTER UPDATE`。レベル：`COLUMN`。エイリアス：`UPDATE`
  - `ALTER DELETE`。レベル：`COLUMN`。エイリアス：`DELETE`
  - `ALTER COLUMN`。レベル：`GROUP`
  - `ALTER ADD COLUMN`。レベル：`COLUMN`。エイリアス：`ADD COLUMN`
  - `ALTER DROP COLUMN`。レベル：`COLUMN`。エイリアス：`DROP COLUMN`
  - `ALTER MODIFY COLUMN`。レベル：`COLUMN`。エイリアス：`MODIFY COLUMN`
  - `ALTER COMMENT COLUMN`。レベル：`COLUMN`。エイリアス：`COMMENT COLUMN`
  - `ALTER CLEAR COLUMN`。レベル：`COLUMN`。エイリアス：`CLEAR COLUMN`
  - `ALTER RENAME COLUMN`。レベル：`COLUMN`。エイリアス：`RENAME COLUMN`
  - `ALTER INDEX`。レベル：`GROUP`。エイリアス：`INDEX`
  - `ALTER ORDER BY`。レベル：`TABLE`。エイリアス：`ALTER MODIFY ORDER BY`、`MODIFY ORDER BY`
  - `ALTER SAMPLE BY`。レベル：`TABLE`。エイリアス：`ALTER MODIFY SAMPLE BY`、`MODIFY SAMPLE BY`
  - `ALTER ADD INDEX`。レベル：`TABLE`。エイリアス：`ADD INDEX`
  - `ALTER DROP INDEX`。レベル：`TABLE`。エイリアス：`DROP INDEX`
  - `ALTER MATERIALIZE INDEX`。レベル：`TABLE`。エイリアス：`MATERIALIZE INDEX`
  - `ALTER CLEAR INDEX`。レベル：`TABLE`。エイリアス：`CLEAR INDEX`
  - `ALTER CONSTRAINT`。レベル：`GROUP`。エイリアス：`CONSTRAINT`
  - `ALTER ADD CONSTRAINT`。レベル：`TABLE`。エイリアス：`ADD CONSTRAINT`
  - `ALTER DROP CONSTRAINT`。レベル：`TABLE`。エイリアス：`DROP CONSTRAINT`
  - `ALTER TTL`。レベル：`TABLE`。エイリアス：`ALTER MODIFY TTL`、`MODIFY TTL`
  - `ALTER MATERIALIZE TTL`。レベル：`TABLE`。エイリアス：`MATERIALIZE TTL`
  - `ALTER SETTINGS`。レベル：`TABLE`。エイリアス：`ALTER SETTING`、`ALTER MODIFY SETTING`、`MODIFY SETTING`
  - `ALTER MOVE PARTITION`。レベル：`TABLE`。エイリアス：`ALTER MOVE PART`、`MOVE PARTITION`、`MOVE PART`
  - `ALTER FETCH PARTITION`。レベル：`TABLE`。エイリアス：`ALTER FETCH PART`、`FETCH PARTITION`、`FETCH PART`
  - `ALTER FREEZE PARTITION`。レベル：`TABLE`。エイリアス：`FREEZE PARTITION`
  - `ALTER VIEW`。レベル：`GROUP`
  - `ALTER VIEW REFRESH`。レベル：`VIEW`。エイリアス：`REFRESH VIEW`
  - `ALTER VIEW MODIFY QUERY`。レベル：`VIEW`。エイリアス：`ALTER TABLE MODIFY QUERY`
  - `ALTER VIEW MODIFY SQL SECURITY`。レベル：`VIEW`。エイリアス：`ALTER TABLE MODIFY SQL SECURITY`

この階層の扱い方の例：

- `ALTER` 権限には、他のすべての `ALTER*` 権限が含まれます。
- `ALTER CONSTRAINT` には `ALTER ADD CONSTRAINT` および `ALTER DROP CONSTRAINT` 権限が含まれます。

**補足**

- `MODIFY SETTING` 権限によって、テーブルエンジンの設定を変更できます。その他の設定やサーバー構成パラメーターには影響しません。
- `ATTACH` 操作には [CREATE](#create) 権限が必要です。
- `DETACH` 操作には [DROP](#drop) 権限が必要です。
- [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation) クエリでミューテーションを停止するには、そのミューテーションを開始する権限が必要です。たとえば、`ALTER UPDATE` クエリを停止したい場合は、`ALTER UPDATE`、`ALTER TABLE`、または `ALTER` 権限が必要です。

### BACKUP \\{#backup\\}

クエリ内で [`BACKUP`] を実行できるようにします。バックアップの詳細については「[Backup and Restore](/operations/backup/overview)」を参照してください。

### CREATE \\{#create\\}

次の権限階層に従って、[CREATE](../../sql-reference/statements/create/index.md) および [ATTACH](../../sql-reference/statements/attach.md) の DDL クエリを実行できます：

- `CREATE`。レベル: `GROUP`
  - `CREATE DATABASE`。レベル: `DATABASE`
  - `CREATE TABLE`。レベル: `TABLE`
    - `CREATE ARBITRARY TEMPORARY TABLE`。レベル: `GLOBAL`
      - `CREATE TEMPORARY TABLE`。レベル: `GLOBAL`
  - `CREATE VIEW`。レベル: `VIEW`
  - `CREATE DICTIONARY`。レベル: `DICTIONARY`

**注意**

- 作成したテーブルを削除するには、ユーザーは [DROP](#drop) 権限が必要です。

### CLUSTER \\{#cluster\\}

`ON CLUSTER` 付きクエリを実行できるようにします。

```sql title="Syntax"
GRANT CLUSTER ON *.* TO <username>
```

既定では、`ON CLUSTER` を含むクエリを実行するには、ユーザーに `CLUSTER` 権限が付与されている必要があります。
`CLUSTER` 権限を付与せずにクエリ内で `ON CLUSTER` を使用しようとすると、次のエラーが発生します：

```text
Not enough privileges. To execute this query, it's necessary to have the grant CLUSTER ON *.*. 
```

デフォルトの動作は、`config.xml` の `access_control_improvements` セクション内にある `on_cluster_queries_require_cluster_grant` を `false` にすることで変更できます（下記参照）。

```yaml title="config.xml"
<access_control_improvements>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```

### DROP \\{#drop\\}

次の権限階層に従って、[DROP](../../sql-reference/statements/drop.md) および [DETACH](../../sql-reference/statements/detach.md) クエリの実行を許可します。

- `DROP`。レベル: `GROUP`
  - `DROP DATABASE`。レベル: `DATABASE`
  - `DROP TABLE`。レベル: `TABLE`
  - `DROP VIEW`。レベル: `VIEW`
  - `DROP DICTIONARY`。レベル: `DICTIONARY`

### TRUNCATE \\{#truncate\\}

[TRUNCATE](../../sql-reference/statements/truncate.md) クエリを実行できます。

権限レベル: `TABLE`。

### OPTIMIZE \\{#optimize\\}

[OPTIMIZE TABLE](../../sql-reference/statements/optimize.md) クエリの実行を許可します。

権限レベル: `TABLE`。

### SHOW \\{#show\\}

`SHOW`、`DESCRIBE`、`USE`、`EXISTS` クエリを、次の権限階層に従って実行できるようにします。

- `SHOW`。レベル: `GROUP`
  - `SHOW DATABASES`。レベル: `DATABASE`。`SHOW DATABASES`、`SHOW CREATE DATABASE`、`USE <database>` クエリの実行を許可します。
  - `SHOW TABLES`。レベル: `TABLE`。`SHOW TABLES`、`EXISTS <table>`、`CHECK <table>` クエリの実行を許可します。
  - `SHOW COLUMNS`。レベル: `COLUMN`。`SHOW CREATE TABLE`、`DESCRIBE` クエリの実行を許可します。
  - `SHOW DICTIONARIES`。レベル: `DICTIONARY`。`SHOW DICTIONARIES`、`SHOW CREATE DICTIONARY`、`EXISTS <dictionary>` クエリの実行を許可します。

**Notes**

ユーザーは、指定されたテーブル、dictionary、またはデータベースに関するいずれかの権限を持っている場合、`SHOW` 権限を持っているとみなされます。

### KILL QUERY \\{#kill-query\\}

[KILL](../../sql-reference/statements/kill.md#kill-query) クエリを、次の権限レベルの階層に従って実行できます：

権限レベル：`GLOBAL`

**注記**

`KILL QUERY` 権限により、あるユーザーが他のユーザーのクエリを強制終了できます。

### ACCESS MANAGEMENT \\{#access-management\\}

ユーザーが、ユーザー、ロール、および行ポリシーを管理するためのクエリを実行できるようにします。

- `ACCESS MANAGEMENT`. Level: `GROUP`
  - `CREATE USER`. Level: `GLOBAL`
  - `ALTER USER`. Level: `GLOBAL`
  - `DROP USER`. Level: `GLOBAL`
  - `CREATE ROLE`. Level: `GLOBAL`
  - `ALTER ROLE`. Level: `GLOBAL`
  - `DROP ROLE`. Level: `GLOBAL`
  - `ROLE ADMIN`. Level: `GLOBAL`
  - `CREATE ROW POLICY`. Level: `GLOBAL`. Aliases: `CREATE POLICY`
  - `ALTER ROW POLICY`. Level: `GLOBAL`. Aliases: `ALTER POLICY`
  - `DROP ROW POLICY`. Level: `GLOBAL`. Aliases: `DROP POLICY`
  - `CREATE QUOTA`. Level: `GLOBAL`
  - `ALTER QUOTA`. Level: `GLOBAL`
  - `DROP QUOTA`. Level: `GLOBAL`
  - `CREATE SETTINGS PROFILE`. Level: `GLOBAL`. Aliases: `CREATE PROFILE`
  - `ALTER SETTINGS PROFILE`. Level: `GLOBAL`. Aliases: `ALTER PROFILE`
  - `DROP SETTINGS PROFILE`. Level: `GLOBAL`. Aliases: `DROP PROFILE`
  - `SHOW ACCESS`. Level: `GROUP`
    - `SHOW_USERS`. Level: `GLOBAL`. Aliases: `SHOW CREATE USER`
    - `SHOW_ROLES`. Level: `GLOBAL`. Aliases: `SHOW CREATE ROLE`
    - `SHOW_ROW_POLICIES`. Level: `GLOBAL`. Aliases: `SHOW POLICIES`, `SHOW CREATE ROW POLICY`, `SHOW CREATE POLICY`
    - `SHOW_QUOTAS`. Level: `GLOBAL`. Aliases: `SHOW CREATE QUOTA`
    - `SHOW_SETTINGS_PROFILES`. Level: `GLOBAL`. Aliases: `SHOW PROFILES`, `SHOW CREATE SETTINGS PROFILE`, `SHOW CREATE PROFILE`
  - `ALLOW SQL SECURITY NONE`. Level: `GLOBAL`. Aliases: `CREATE SQL SECURITY NONE`, `SQL SECURITY NONE`, `SECURITY NONE`

`ROLE ADMIN` 権限により、ユーザーは、自身に admin オプション付きで付与されていないロールも含め、任意のロールを付与および取り消すことができます。

### SYSTEM \\{#system\\}

ユーザーが次の権限の階層構造に従って [SYSTEM](../../sql-reference/statements/system.md) クエリを実行できるようにします。

- `SYSTEM`。レベル: `GROUP`
  - `SYSTEM SHUTDOWN`。レベル: `GLOBAL`。別名: `SYSTEM KILL`, `SHUTDOWN`
  - `SYSTEM DROP CACHE`。別名: `DROP CACHE`
    - `SYSTEM DROP DNS CACHE`。レベル: `GLOBAL`。別名: `SYSTEM DROP DNS`, `DROP DNS CACHE`, `DROP DNS`
    - `SYSTEM DROP MARK CACHE`。レベル: `GLOBAL`。別名: `SYSTEM DROP MARK`, `DROP MARK CACHE`, `DROP MARKS`
    - `SYSTEM DROP UNCOMPRESSED CACHE`。レベル: `GLOBAL`。別名: `SYSTEM DROP UNCOMPRESSED`, `DROP UNCOMPRESSED CACHE`, `DROP UNCOMPRESSED`
  - `SYSTEM RELOAD`。レベル: `GROUP`
    - `SYSTEM RELOAD CONFIG`。レベル: `GLOBAL`。別名: `RELOAD CONFIG`
    - `SYSTEM RELOAD DICTIONARY`。レベル: `GLOBAL`。別名: `SYSTEM RELOAD DICTIONARIES`, `RELOAD DICTIONARY`, `RELOAD DICTIONARIES`
      - `SYSTEM RELOAD EMBEDDED DICTIONARIES`。レベル: `GLOBAL`。別名: `RELOAD EMBEDDED DICTIONARIES`
  - `SYSTEM MERGES`。レベル: `TABLE`。別名: `SYSTEM STOP MERGES`, `SYSTEM START MERGES`, `STOP MERGES`, `START MERGES`
  - `SYSTEM TTL MERGES`。レベル: `TABLE`。別名: `SYSTEM STOP TTL MERGES`, `SYSTEM START TTL MERGES`, `STOP TTL MERGES`, `START TTL MERGES`
  - `SYSTEM FETCHES`。レベル: `TABLE`。別名: `SYSTEM STOP FETCHES`, `SYSTEM START FETCHES`, `STOP FETCHES`, `START FETCHES`
  - `SYSTEM MOVES`。レベル: `TABLE`。別名: `SYSTEM STOP MOVES`, `SYSTEM START MOVES`, `STOP MOVES`, `START MOVES`
  - `SYSTEM SENDS`。レベル: `GROUP`。別名: `SYSTEM STOP SENDS`, `SYSTEM START SENDS`, `STOP SENDS`, `START SENDS`
    - `SYSTEM DISTRIBUTED SENDS`。レベル: `TABLE`。別名: `SYSTEM STOP DISTRIBUTED SENDS`, `SYSTEM START DISTRIBUTED SENDS`, `STOP DISTRIBUTED SENDS`, `START DISTRIBUTED SENDS`
    - `SYSTEM REPLICATED SENDS`。レベル: `TABLE`。別名: `SYSTEM STOP REPLICATED SENDS`, `SYSTEM START REPLICATED SENDS`, `STOP REPLICATED SENDS`, `START REPLICATED SENDS`
  - `SYSTEM REPLICATION QUEUES`。レベル: `TABLE`。別名: `SYSTEM STOP REPLICATION QUEUES`, `SYSTEM START REPLICATION QUEUES`, `STOP REPLICATION QUEUES`, `START REPLICATION QUEUES`
  - `SYSTEM SYNC REPLICA`。レベル: `TABLE`。別名: `SYNC REPLICA`
  - `SYSTEM RESTART REPLICA`。レベル: `TABLE`。別名: `RESTART REPLICA`
  - `SYSTEM FLUSH`。レベル: `GROUP`
    - `SYSTEM FLUSH DISTRIBUTED`。レベル: `TABLE`。別名: `FLUSH DISTRIBUTED`
    - `SYSTEM FLUSH LOGS`。レベル: `GLOBAL`。別名: `FLUSH LOGS`

`SYSTEM RELOAD EMBEDDED DICTIONARIES` 権限は、`SYSTEM RELOAD DICTIONARY ON *.*` 権限によって暗黙的に付与されます。

### INTROSPECTION \\{#introspection\\}

[イントロスペクション](../../operations/optimizing-performance/sampling-query-profiler.md) 関数の使用を許可します。

- `INTROSPECTION`. Level: `GROUP`. Aliases: `INTROSPECTION FUNCTIONS`
  - `addressToLine`. Level: `GLOBAL`
  - `addressToLineWithInlines`. Level: `GLOBAL`
  - `addressToSymbol`. Level: `GLOBAL`
  - `demangle`. Level: `GLOBAL`

### SOURCES \\{#sources\\}

外部データソースを使用できるようにします。[テーブルエンジン](../../engines/table-engines/index.md) および [テーブル関数](/sql-reference/table-functions) に適用されます。

- `READ`。レベル: `GLOBAL_WITH_PARAMETER`  
- `WRITE`。レベル: `GLOBAL_WITH_PARAMETER`

指定可能なパラメータ:

- `AZURE`
- `FILE`
- `HDFS`
- `HIVE`
- `JDBC`
- `KAFKA`
- `MONGO`
- `MYSQL`
- `NATS`
- `ODBC`
- `POSTGRES`
- `RABBITMQ`
- `REDIS`
- `REMOTE`
- `S3`
- `SQLITE`
- `URL`

:::note
ソースに対する READ/WRITE 権限を分離して付与できるようになったのは、バージョン 25.7 以降であり、かつサーバー設定
`access_control_improvements.enable_read_write_grants`
が有効な場合のみです。

それ以外の場合は、新しい構文 `GRANT READ, WRITE ON AZURE TO user` と同等である `GRANT AZURE ON *.* TO user` を使用する必要があります。
:::

使用例:

- [MySQL テーブルエンジン](../../engines/table-engines/integrations/mysql.md) を使用してテーブルを作成するには、`CREATE TABLE (ON db.table_name)` と `MYSQL` 権限が必要です。
- [mysql テーブル関数](../../sql-reference/table-functions/mysql.md) を使用するには、`CREATE TEMPORARY TABLE` と `MYSQL` 権限が必要です。

### ソースフィルター権限 \\{#source-filter-grants\\}

:::note
この機能はバージョン 25.8 以降で利用可能であり、サーバー設定
`access_control_improvements.enable_read_write_grants`
が有効になっている場合にのみ使用できます。
:::

正規表現フィルターを使用して、特定のソース URI へのアクセス権を付与できます。これにより、ユーザーがアクセス可能な外部データソースをきめ細かく制御できます。

**構文:**

```sql
GRANT READ ON S3('regexp_pattern') TO user
```

この権限により、ユーザーは指定した正規表現パターンに一致する S3 URI からのみ読み取りできます。

**例:**

特定の S3 バケットパスへのアクセス権を付与:

```sql
-- Allow user to read only from s3://foo/ paths
GRANT READ ON S3('s3://foo/.*') TO john

-- Allow user to read from specific file patterns
GRANT READ ON S3('s3://mybucket/data/2024/.*\.parquet') TO analyst

-- Multiple filters can be granted to the same user
GRANT READ ON S3('s3://foo/.*') TO john
GRANT READ ON S3('s3://bar/.*') TO john
```

:::warning
Source filter はパラメータとして **regexp** を受け取るため、次のような権限付与により

`GRANT READ ON URL('http://www.google.com') TO john;`

以下のようなクエリが許可されます。

```sql
SELECT * FROM url('https://www.google.com');
SELECT * FROM url('https://www-google.com');
```

`.` は正規表現内で `Any Single Character` として扱われるためです。
これにより脆弱性が生じる可能性があります。正しい GRANT は次のとおりです。

```sql
GRANT READ ON URL('https://www\.google\.com') TO john;
```

:::

**GRANT OPTION を伴う再付与:**

元の権限付与に `WITH GRANT OPTION` が含まれている場合、`GRANT CURRENT GRANTS` を使用して再度付与できます:

```sql
-- Original grant with GRANT OPTION
GRANT READ ON S3('s3://foo/.*') TO john WITH GRANT OPTION

-- John can now regrant this access to others
GRANT CURRENT GRANTS(READ ON S3) TO alice
```

**重要な制限事項:**

* **部分的な取り消しはできません:** 付与したフィルターパターンの一部だけを取り消すことはできません。必要な場合は、付与全体をいったん取り消し、新しいパターンで改めて付与する必要があります。
* **ワイルドカードを使用した GRANT はできません:** `GRANT READ ON *('regexp')` のような、ワイルドカードのみを用いたパターンは使用できません。必ず特定のソースを指定する必要があります。

### dictGet \\{#dictget\\}

- `dictGet` エイリアス: `dictHas`, `dictGetHierarchy`, `dictIsIn`

ユーザーが [dictGet](/sql-reference/functions/ext-dict-functions#dictGet)、[dictHas](../../sql-reference/functions/ext-dict-functions.md#dictHas)、[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictGetHierarchy)、[dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictIsIn) 関数を実行することを許可します。

権限レベル: `DICTIONARY`。

**例**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`

### displaySecretsInShowAndSelect \\{#displaysecretsinshowandselect\\}

`SHOW` および `SELECT` クエリでシークレットを表示できるようにします。ただし、
[`display_secrets_in_show_and_select` サーバー設定](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select)
と
[`format_display_secrets_in_show_and_select` フォーマット設定](../../operations/settings/formats#format_display_secrets_in_show_and_select)
の両方が有効になっている必要があります。

### NAMED COLLECTION ADMIN \\{#named-collection-admin\\}

指定した named collection に対する特定の操作を許可します。バージョン 23.7 より前は NAMED COLLECTION CONTROL と呼ばれており、23.7 以降では NAMED COLLECTION ADMIN が追加され、NAMED COLLECTION CONTROL はエイリアスとして保持されています。

- `NAMED COLLECTION ADMIN`。レベル: `NAMED_COLLECTION`。エイリアス: `NAMED COLLECTION CONTROL`
  - `CREATE NAMED COLLECTION`。レベル: `NAMED_COLLECTION`
  - `DROP NAMED COLLECTION`。レベル: `NAMED_COLLECTION`
  - `ALTER NAMED COLLECTION`。レベル: `NAMED_COLLECTION`
  - `SHOW NAMED COLLECTIONS`。レベル: `NAMED_COLLECTION`。エイリアス: `SHOW NAMED COLLECTIONS`
  - `SHOW NAMED COLLECTIONS SECRETS`。レベル: `NAMED_COLLECTION`。エイリアス: `SHOW NAMED COLLECTIONS SECRETS`
  - `NAMED COLLECTION`。レベル: `NAMED_COLLECTION`。エイリアス: `NAMED COLLECTION USAGE, USE NAMED COLLECTION`

他のすべての権限（CREATE, DROP, ALTER, SHOW）とは異なり、NAMED COLLECTION 権限は 23.7 で追加されたもので、他の権限はそれ以前の 22.12 で追加されています。

**例**

named collection の名前が abc であると仮定し、ユーザー john に権限 CREATE NAMED COLLECTION を付与します。

- `GRANT CREATE NAMED COLLECTION ON abc TO john`

### TABLE ENGINE \\{#table-engine\\}

テーブルを作成する際に、指定したテーブルエンジンを使用してテーブルを作成できます。[テーブルエンジン](../../engines/table-engines/index.md)に対して適用されます。

**例**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`

:::note
デフォルトでは下位互換性のため、特定のテーブルエンジンを指定してテーブルを作成しても、GRANT は無視されます。
ただし、config.xml で [`table_engines_require_grant` を true に設定](https://github.com/ClickHouse/ClickHouse/blob/df970ed64eaf472de1e7af44c21ec95956607ebb/programs/server/config.xml#L853-L855)することで、この動作を変更できます。
:::

### ALL \\{#all\\}

<CloudNotSupportedBadge/>

対象エンティティ上のすべての権限をユーザーアカウントまたはロールに付与します。

:::note
権限 `ALL` は、`default` ユーザーに制限された権限しかない ClickHouse Cloud ではサポートされていません。`default_role` を付与することで、ユーザーに最大限の権限を付与できます。詳細は[こちら](/cloud/security/manage-cloud-users)を参照してください。
また、`default` ユーザーとして `GRANT CURRENT GRANTS` を使用することで、`ALL` と同様の効果を得ることもできます。
:::

### NONE \\{#none\\}

権限は一切付与されません。

### ADMIN OPTION \\{#admin-option\\}

`ADMIN OPTION` 権限を持つユーザーは、自身のロールを他のユーザーに付与できます。