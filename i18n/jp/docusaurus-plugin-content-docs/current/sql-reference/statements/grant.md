---
description: 'GRANT ステートメントに関するドキュメント'
sidebar_label: 'GRANT'
sidebar_position: 38
slug: /sql-reference/statements/grant
title: 'GRANT ステートメント'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# GRANT ステートメント

- ClickHouse のユーザーアカウントまたはロールに対して[権限](#privileges)を付与します。
- ロールをユーザーアカウントまたは別のロールに割り当てます。

権限を取り消すには、[REVOKE](../../sql-reference/statements/revoke.md) ステートメントを使用します。また、[SHOW GRANTS](../../sql-reference/statements/show.md#show-grants) ステートメントを使用すると、付与済みの権限を一覧表示できます。



## 権限付与の構文 {#granting-privilege-syntax}

```sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — 権限のタイプ。
- `role` — ClickHouseのユーザーロール。
- `user` — ClickHouseのユーザーアカウント。

`WITH GRANT OPTION`句は、`user`または`role`に`GRANT`クエリを実行する権限を付与します。ユーザーは、自身が持つ権限と同じスコープまたはそれより狭いスコープの権限を付与できます。
`WITH REPLACE OPTION`句は、`user`または`role`の既存の権限を新しい権限で置き換えます。指定されていない場合は、権限が追加されます。


## ロール割り当て構文 {#assigning-role-syntax}

```sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

- `role` — ClickHouseのユーザーロール。
- `user` — ClickHouseのユーザーアカウント。

`WITH ADMIN OPTION`句は、`user`または`role`に[ADMIN OPTION](#admin-option)権限を付与します。
`WITH REPLACE OPTION`句は、`user`または`role`の既存のロールを新しいロールで置き換えます。指定されていない場合は、ロールが追加されます。


## Grant Current Grants 構文 {#grant-current-grants-syntax}

```sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — 権限のタイプ。
- `role` — ClickHouseユーザーロール。
- `user` — ClickHouseユーザーアカウント。

`CURRENT GRANTS`ステートメントを使用することで、指定したすべての権限を特定のユーザーまたはロールに付与できます。
権限が指定されていない場合、指定したユーザーまたはロールは`CURRENT_USER`が持つすべての利用可能な権限を受け取ります。


## 使用方法 {#usage}

`GRANT`を使用するには、アカウントに`GRANT OPTION`権限が必要です。権限を付与できるのは、自分のアカウント権限の範囲内のみです。

例えば、管理者が次のクエリで`john`アカウントに権限を付与した場合:

```sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

これは、`john`が以下を実行する権限を持つことを意味します:

- `SELECT x,y FROM db.table`
- `SELECT x FROM db.table`
- `SELECT y FROM db.table`

`john`は`SELECT z FROM db.table`を実行できません。`SELECT * FROM db.table`も使用できません。このクエリを処理する際、ClickHouseは`x`と`y`であってもデータを返しません。唯一の例外は、テーブルが`x`と`y`列のみを含む場合です。この場合、ClickHouseはすべてのデータを返します。

また、`john`は`GRANT OPTION`権限を持っているため、同じまたはより小さい範囲の権限を他のユーザーに付与できます。

`system`データベースへのアクセスは常に許可されています(このデータベースはクエリ処理に使用されるため)。

:::note
新規ユーザーがデフォルトでアクセスできるシステムテーブルは多数ありますが、権限付与なしではすべてのシステムテーブルにデフォルトでアクセスできるわけではありません。
さらに、セキュリティ上の理由から、`system.zookeeper`などの特定のシステムテーブルへのアクセスはCloudユーザーに対して制限されています。
:::

1つのクエリで複数のアカウントに複数の権限を付与できます。クエリ`GRANT SELECT, INSERT ON *.* TO john, robin`は、アカウント`john`と`robin`がサーバー上のすべてのデータベースのすべてのテーブルに対して`INSERT`と`SELECT`クエリを実行することを許可します。


## ワイルドカード権限付与 {#wildcard-grants}

権限を指定する際、テーブル名やデータベース名の代わりにアスタリスク（`*`）を使用できます。例えば、`GRANT SELECT ON db.* TO john`クエリは、`john`が`db`データベース内のすべてのテーブルに対して`SELECT`クエリを実行することを許可します。
また、データベース名を省略することもできます。この場合、権限は現在のデータベースに対して付与されます。
例えば、`GRANT SELECT ON * TO john`は現在のデータベース内のすべてのテーブルに対する権限を付与し、`GRANT SELECT ON mytable TO john`は現在のデータベース内の`mytable`テーブルに対する権限を付与します。

:::note
以下で説明する機能は、ClickHouseバージョン24.10以降で利用可能です。
:::

テーブル名やデータベース名の末尾にアスタリスクを配置することもできます。この機能により、テーブルパスの抽象的なプレフィックスに対して権限を付与できます。
例：`GRANT SELECT ON db.my_tables* TO john`。このクエリは、`john`が`db`データベース内でプレフィックス`my_tables`を持つすべてのテーブルに対して`SELECT`クエリを実行することを許可します。

その他の例：

`GRANT SELECT ON db.my_tables* TO john`

```sql
SELECT * FROM db.my_tables -- 付与される
SELECT * FROM db.my_tables_0 -- 付与される
SELECT * FROM db.my_tables_1 -- 付与される

SELECT * FROM db.other_table -- 付与されない
SELECT * FROM db2.my_tables -- 付与されない
```

`GRANT SELECT ON db*.* TO john`

```sql
SELECT * FROM db.my_tables -- 付与される
SELECT * FROM db.my_tables_0 -- 付与される
SELECT * FROM db.my_tables_1 -- 付与される
SELECT * FROM db.other_table -- 付与される
SELECT * FROM db2.my_tables -- 付与される
```

付与されたパス内に新しく作成されたすべてのテーブルは、親から自動的にすべての権限を継承します。
例えば、`GRANT SELECT ON db.* TO john`クエリを実行した後に新しいテーブル`db.new_table`を作成すると、ユーザー`john`は`SELECT * FROM db.new_table`クエリを実行できるようになります。

アスタリスクはプレフィックスに対して**のみ**指定できます：

```sql
GRANT SELECT ON db.* TO john -- 正しい
GRANT SELECT ON db*.* TO john -- 正しい

GRANT SELECT ON *.my_table TO john -- 誤り
GRANT SELECT ON foo*bar TO john -- 誤り
GRANT SELECT ON *suffix TO john -- 誤り
GRANT SELECT(foo) ON db.table* TO john -- 誤り
```


## 権限 {#privileges}

権限とは、特定の種類のクエリを実行するためにユーザーに付与される許可のことです。

権限は階層構造を持ち、許可されるクエリのセットは権限のスコープによって決まります。

ClickHouseにおける権限の階層を以下に示します:


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
  * [`INTROSPECTION`](#introspection)
    * `addressToLine`
    * `addressToLineWithInlines`
    * `addressToSymbol`
    * `demangle`
  * `KILL QUERY`
  * `KILL TRANSACTION`
  * `MOVE PARTITION BETWEEN SHARDS`
  * [`NAMED COLLECTION ADMIN`](#named-collection-admin)
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
  * [`SOURCES`](#sources)
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

この階層の扱い方の例：

- `ALTER`権限には、他のすべての`ALTER*`権限が含まれます。
- `ALTER CONSTRAINT`には、`ALTER ADD CONSTRAINT`および`ALTER DROP CONSTRAINT`権限が含まれます。

権限は異なるレベルで適用されます。レベルを理解することで、その権限に使用可能な構文がわかります。

レベル（下位から上位へ）：

- `COLUMN` — 権限はカラム、テーブル、データベース、またはグローバルに付与できます。
- `TABLE` — 権限はテーブル、データベース、またはグローバルに付与できます。
- `VIEW` — 権限はビュー、データベース、またはグローバルに付与できます。
- `DICTIONARY` — 権限はディクショナリ、データベース、またはグローバルに付与できます。
- `DATABASE` — 権限はデータベースまたはグローバルに付与できます。
- `GLOBAL` — 権限はグローバルにのみ付与できます。
- `GROUP` — 異なるレベルの権限をグループ化します。`GROUP`レベルの権限が付与された場合、使用された構文に対応するグループ内の権限のみが付与されます。

許可される構文の例：

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

許可されない構文の例：

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

特別な権限[ALL](#all)は、ユーザーアカウントまたはロールにすべての権限を付与します。

デフォルトでは、ユーザーアカウントまたはロールには権限がありません。

ユーザーまたはロールに権限がない場合、[NONE](#none)権限として表示されます。

一部のクエリは、その実装により一連の権限を必要とします。例えば、[RENAME](../../sql-reference/statements/optimize.md)クエリを実行するには、`SELECT`、`CREATE TABLE`、`INSERT`、および`DROP TABLE`の権限が必要です。

### SELECT {#select}

[SELECT](../../sql-reference/statements/select/index.md)クエリの実行を許可します。

権限レベル：`COLUMN`。

**説明**

この権限を付与されたユーザーは、指定されたテーブルおよびデータベース内の指定されたカラムのリストに対して`SELECT`クエリを実行できます。ユーザーが指定されたカラム以外のカラムを含めた場合、クエリはデータを返しません。

次の権限を考えてみましょう：

```sql
GRANT SELECT(x,y) ON db.table TO john
```

この権限により、`john`は`db.table`内の`x`および/または`y`カラムからのデータを含む任意の`SELECT`クエリを実行できます。例えば、`SELECT x FROM db.table`などです。`john`は`SELECT z FROM db.table`を実行できません。`SELECT * FROM db.table`も使用できません。このクエリを処理する際、ClickHouseは`x`と`y`であってもデータを返しません。唯一の例外は、テーブルが`x`と`y`カラムのみを含む場合で、この場合ClickHouseはすべてのデータを返します。

### INSERT {#insert}

[INSERT](../../sql-reference/statements/insert-into.md)クエリの実行を許可します。

権限レベル：`COLUMN`。

**説明**

この権限を付与されたユーザーは、指定されたテーブルおよびデータベース内の指定されたカラムのリストに対して`INSERT`クエリを実行できます。ユーザーが指定されたカラム以外のカラムを含めた場合、クエリはデータを挿入しません。

**例**

```sql
GRANT INSERT(x,y) ON db.table TO john
```

付与された権限により、`john`は`db.table`内の`x`および/または`y`カラムにデータを挿入できます。

### ALTER {#alter}

次の権限階層に従って[ALTER](../../sql-reference/statements/alter/index.md)クエリの実行を許可します：


- `ALTER`。レベル: `COLUMN`。
  - `ALTER TABLE`。レベル: `GROUP`
  - `ALTER UPDATE`。レベル: `COLUMN`。エイリアス: `UPDATE`
  - `ALTER DELETE`。レベル: `COLUMN`。エイリアス: `DELETE`
  - `ALTER COLUMN`。レベル: `GROUP`
  - `ALTER ADD COLUMN`。レベル: `COLUMN`。エイリアス: `ADD COLUMN`
  - `ALTER DROP COLUMN`。レベル: `COLUMN`。エイリアス: `DROP COLUMN`
  - `ALTER MODIFY COLUMN`。レベル: `COLUMN`。エイリアス: `MODIFY COLUMN`
  - `ALTER COMMENT COLUMN`。レベル: `COLUMN`。エイリアス: `COMMENT COLUMN`
  - `ALTER CLEAR COLUMN`。レベル: `COLUMN`。エイリアス: `CLEAR COLUMN`
  - `ALTER RENAME COLUMN`。レベル: `COLUMN`。エイリアス: `RENAME COLUMN`
  - `ALTER INDEX`。レベル: `GROUP`。エイリアス: `INDEX`
  - `ALTER ORDER BY`。レベル: `TABLE`。エイリアス: `ALTER MODIFY ORDER BY`、`MODIFY ORDER BY`
  - `ALTER SAMPLE BY`。レベル: `TABLE`。エイリアス: `ALTER MODIFY SAMPLE BY`、`MODIFY SAMPLE BY`
  - `ALTER ADD INDEX`。レベル: `TABLE`。エイリアス: `ADD INDEX`
  - `ALTER DROP INDEX`。レベル: `TABLE`。エイリアス: `DROP INDEX`
  - `ALTER MATERIALIZE INDEX`。レベル: `TABLE`。エイリアス: `MATERIALIZE INDEX`
  - `ALTER CLEAR INDEX`。レベル: `TABLE`。エイリアス: `CLEAR INDEX`
  - `ALTER CONSTRAINT`。レベル: `GROUP`。エイリアス: `CONSTRAINT`
  - `ALTER ADD CONSTRAINT`。レベル: `TABLE`。エイリアス: `ADD CONSTRAINT`
  - `ALTER DROP CONSTRAINT`。レベル: `TABLE`。エイリアス: `DROP CONSTRAINT`
  - `ALTER TTL`。レベル: `TABLE`。エイリアス: `ALTER MODIFY TTL`、`MODIFY TTL`
  - `ALTER MATERIALIZE TTL`。レベル: `TABLE`。エイリアス: `MATERIALIZE TTL`
  - `ALTER SETTINGS`。レベル: `TABLE`。エイリアス: `ALTER SETTING`、`ALTER MODIFY SETTING`、`MODIFY SETTING`
  - `ALTER MOVE PARTITION`。レベル: `TABLE`。エイリアス: `ALTER MOVE PART`、`MOVE PARTITION`、`MOVE PART`
  - `ALTER FETCH PARTITION`。レベル: `TABLE`。エイリアス: `ALTER FETCH PART`、`FETCH PARTITION`、`FETCH PART`
  - `ALTER FREEZE PARTITION`。レベル: `TABLE`。エイリアス: `FREEZE PARTITION`
  - `ALTER VIEW`。レベル: `GROUP`
  - `ALTER VIEW REFRESH`。レベル: `VIEW`。エイリアス: `REFRESH VIEW`
  - `ALTER VIEW MODIFY QUERY`。レベル: `VIEW`。エイリアス: `ALTER TABLE MODIFY QUERY`
  - `ALTER VIEW MODIFY SQL SECURITY`。レベル: `VIEW`。エイリアス: `ALTER TABLE MODIFY SQL SECURITY`

この階層の扱い方の例:

- `ALTER`権限には、他のすべての`ALTER*`権限が含まれます。
- `ALTER CONSTRAINT`には、`ALTER ADD CONSTRAINT`および`ALTER DROP CONSTRAINT`権限が含まれます。

**注記**

- `MODIFY SETTING`権限は、テーブルエンジン設定の変更を許可します。設定やサーバー構成パラメータには影響しません。
- `ATTACH`操作には[CREATE](#create)権限が必要です。
- `DETACH`操作には[DROP](#drop)権限が必要です。
- [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation)クエリによってミューテーションを停止するには、このミューテーションを開始する権限が必要です。例えば、`ALTER UPDATE`クエリを停止する場合は、`ALTER UPDATE`、`ALTER TABLE`、または`ALTER`権限が必要です。

### BACKUP {#backup}

クエリ内での[`BACKUP`]の実行を許可します。バックアップの詳細については、["バックアップと復元"](../../operations/backup.md)を参照してください。

### CREATE {#create}

以下の権限階層に従って、[CREATE](../../sql-reference/statements/create/index.md)および[ATTACH](../../sql-reference/statements/attach.md) DDLクエリの実行を許可します:

- `CREATE`。レベル: `GROUP`
  - `CREATE DATABASE`。レベル: `DATABASE`
  - `CREATE TABLE`。レベル: `TABLE`
    - `CREATE ARBITRARY TEMPORARY TABLE`。レベル: `GLOBAL`
      - `CREATE TEMPORARY TABLE`。レベル: `GLOBAL`
  - `CREATE VIEW`。レベル: `VIEW`
  - `CREATE DICTIONARY`。レベル: `DICTIONARY`

**注記**

- 作成されたテーブルを削除するには、ユーザーは[DROP](#drop)権限が必要です。

### CLUSTER {#cluster}

`ON CLUSTER`クエリの実行を許可します。


```sql title="構文"
GRANT CLUSTER ON *.* TO <username>
```

デフォルトでは、`ON CLUSTER`を使用するクエリには、ユーザーに`CLUSTER`権限が必要です。
`CLUSTER`権限を付与せずにクエリで`ON CLUSTER`を使用しようとすると、次のエラーが発生します:

```text
Not enough privileges. To execute this query, it's necessary to have the grant CLUSTER ON *.*.
```

デフォルトの動作は、`config.xml`の`access_control_improvements`セクション(以下を参照)にある`on_cluster_queries_require_cluster_grant`設定を`false`に設定することで変更できます。

```yaml title="config.xml"
<access_control_improvements>
<on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```

### DROP {#drop}

次の権限階層に従って、[DROP](../../sql-reference/statements/drop.md)および[DETACH](../../sql-reference/statements/detach.md)クエリの実行を許可します:

- `DROP`。レベル: `GROUP`
  - `DROP DATABASE`。レベル: `DATABASE`
  - `DROP TABLE`。レベル: `TABLE`
  - `DROP VIEW`。レベル: `VIEW`
  - `DROP DICTIONARY`。レベル: `DICTIONARY`

### TRUNCATE {#truncate}

[TRUNCATE](../../sql-reference/statements/truncate.md)クエリの実行を許可します。

権限レベル: `TABLE`。

### OPTIMIZE {#optimize}

[OPTIMIZE TABLE](../../sql-reference/statements/optimize.md)クエリの実行を許可します。

権限レベル: `TABLE`。

### SHOW {#show}

次の権限階層に従って、`SHOW`、`DESCRIBE`、`USE`、および`EXISTS`クエリの実行を許可します:

- `SHOW`。レベル: `GROUP`
  - `SHOW DATABASES`。レベル: `DATABASE`。`SHOW DATABASES`、`SHOW CREATE DATABASE`、`USE <database>`クエリの実行を許可します。
  - `SHOW TABLES`。レベル: `TABLE`。`SHOW TABLES`、`EXISTS <table>`、`CHECK <table>`クエリの実行を許可します。
  - `SHOW COLUMNS`。レベル: `COLUMN`。`SHOW CREATE TABLE`、`DESCRIBE`クエリの実行を許可します。
  - `SHOW DICTIONARIES`。レベル: `DICTIONARY`。`SHOW DICTIONARIES`、`SHOW CREATE DICTIONARY`、`EXISTS <dictionary>`クエリの実行を許可します。

**注意**

ユーザーは、指定されたテーブル、辞書、またはデータベースに関する他の権限を持っている場合、`SHOW`権限を持ちます。

### KILL QUERY {#kill-query}

次の権限階層に従って、[KILL](../../sql-reference/statements/kill.md#kill-query)クエリの実行を許可します:

権限レベル: `GLOBAL`。

**注意**

`KILL QUERY`権限により、あるユーザーが他のユーザーのクエリを強制終了できます。

### ACCESS MANAGEMENT {#access-management}

ユーザー、ロール、および行ポリシーを管理するクエリの実行を許可します。


- `ACCESS MANAGEMENT`。レベル: `GROUP`
  - `CREATE USER`。レベル: `GLOBAL`
  - `ALTER USER`。レベル: `GLOBAL`
  - `DROP USER`。レベル: `GLOBAL`
  - `CREATE ROLE`。レベル: `GLOBAL`
  - `ALTER ROLE`。レベル: `GLOBAL`
  - `DROP ROLE`。レベル: `GLOBAL`
  - `ROLE ADMIN`。レベル: `GLOBAL`
  - `CREATE ROW POLICY`。レベル: `GLOBAL`。別名: `CREATE POLICY`
  - `ALTER ROW POLICY`。レベル: `GLOBAL`。別名: `ALTER POLICY`
  - `DROP ROW POLICY`。レベル: `GLOBAL`。別名: `DROP POLICY`
  - `CREATE QUOTA`。レベル: `GLOBAL`
  - `ALTER QUOTA`。レベル: `GLOBAL`
  - `DROP QUOTA`。レベル: `GLOBAL`
  - `CREATE SETTINGS PROFILE`。レベル: `GLOBAL`。別名: `CREATE PROFILE`
  - `ALTER SETTINGS PROFILE`。レベル: `GLOBAL`。別名: `ALTER PROFILE`
  - `DROP SETTINGS PROFILE`。レベル: `GLOBAL`。別名: `DROP PROFILE`
  - `SHOW ACCESS`。レベル: `GROUP`
    - `SHOW_USERS`。レベル: `GLOBAL`。別名: `SHOW CREATE USER`
    - `SHOW_ROLES`。レベル: `GLOBAL`。別名: `SHOW CREATE ROLE`
    - `SHOW_ROW_POLICIES`。レベル: `GLOBAL`。別名: `SHOW POLICIES`, `SHOW CREATE ROW POLICY`, `SHOW CREATE POLICY`
    - `SHOW_QUOTAS`。レベル: `GLOBAL`。別名: `SHOW CREATE QUOTA`
    - `SHOW_SETTINGS_PROFILES`。レベル: `GLOBAL`。別名: `SHOW PROFILES`, `SHOW CREATE SETTINGS PROFILE`, `SHOW CREATE PROFILE`
  - `ALLOW SQL SECURITY NONE`。レベル: `GLOBAL`。別名: `CREATE SQL SECURITY NONE`, `SQL SECURITY NONE`, `SECURITY NONE`

`ROLE ADMIN`権限により、ユーザーは管理者オプション付きで自身に割り当てられていないロールを含む、すべてのロールの割り当てと取り消しを実行できます。

### SYSTEM {#system}

以下の権限階層に従って、ユーザーが[SYSTEM](../../sql-reference/statements/system.md)クエリを実行できるようにします。


- `SYSTEM`. Level: `GROUP`
  - `SYSTEM SHUTDOWN`. Level: `GLOBAL`. Aliases: `SYSTEM KILL`, `SHUTDOWN`
  - `SYSTEM DROP CACHE`. Aliases: `DROP CACHE`
    - `SYSTEM DROP DNS CACHE`. Level: `GLOBAL`. Aliases: `SYSTEM DROP DNS`, `DROP DNS CACHE`, `DROP DNS`
    - `SYSTEM DROP MARK CACHE`. Level: `GLOBAL`. Aliases: `SYSTEM DROP MARK`, `DROP MARK CACHE`, `DROP MARKS`
    - `SYSTEM DROP UNCOMPRESSED CACHE`. Level: `GLOBAL`. Aliases: `SYSTEM DROP UNCOMPRESSED`, `DROP UNCOMPRESSED CACHE`, `DROP UNCOMPRESSED`
  - `SYSTEM RELOAD`. Level: `GROUP`
    - `SYSTEM RELOAD CONFIG`. Level: `GLOBAL`. Aliases: `RELOAD CONFIG`
    - `SYSTEM RELOAD DICTIONARY`. Level: `GLOBAL`. Aliases: `SYSTEM RELOAD DICTIONARIES`, `RELOAD DICTIONARY`, `RELOAD DICTIONARIES`
      - `SYSTEM RELOAD EMBEDDED DICTIONARIES`. Level: `GLOBAL`. Aliases: `RELOAD EMBEDDED DICTIONARIES`
  - `SYSTEM MERGES`. Level: `TABLE`. Aliases: `SYSTEM STOP MERGES`, `SYSTEM START MERGES`, `STOP MERGES`, `START MERGES`
  - `SYSTEM TTL MERGES`. Level: `TABLE`. Aliases: `SYSTEM STOP TTL MERGES`, `SYSTEM START TTL MERGES`, `STOP TTL MERGES`, `START TTL MERGES`
  - `SYSTEM FETCHES`. Level: `TABLE`. Aliases: `SYSTEM STOP FETCHES`, `SYSTEM START FETCHES`, `STOP FETCHES`, `START FETCHES`
  - `SYSTEM MOVES`. Level: `TABLE`. Aliases: `SYSTEM STOP MOVES`, `SYSTEM START MOVES`, `STOP MOVES`, `START MOVES`
  - `SYSTEM SENDS`. Level: `GROUP`. Aliases: `SYSTEM STOP SENDS`, `SYSTEM START SENDS`, `STOP SENDS`, `START SENDS`
    - `SYSTEM DISTRIBUTED SENDS`. Level: `TABLE`. Aliases: `SYSTEM STOP DISTRIBUTED SENDS`, `SYSTEM START DISTRIBUTED SENDS`, `STOP DISTRIBUTED SENDS`, `START DISTRIBUTED SENDS`
    - `SYSTEM REPLICATED SENDS`. Level: `TABLE`. Aliases: `SYSTEM STOP REPLICATED SENDS`, `SYSTEM START REPLICATED SENDS`, `STOP REPLICATED SENDS`, `START REPLICATED SENDS`
  - `SYSTEM REPLICATION QUEUES`. Level: `TABLE`. Aliases: `SYSTEM STOP REPLICATION QUEUES`, `SYSTEM START REPLICATION QUEUES`, `STOP REPLICATION QUEUES`, `START REPLICATION QUEUES`
  - `SYSTEM SYNC REPLICA`. Level: `TABLE`. Aliases: `SYNC REPLICA`
  - `SYSTEM RESTART REPLICA`. Level: `TABLE`. Aliases: `RESTART REPLICA`
  - `SYSTEM FLUSH`. Level: `GROUP`
    - `SYSTEM FLUSH DISTRIBUTED`. Level: `TABLE`. Aliases: `FLUSH DISTRIBUTED`
    - `SYSTEM FLUSH LOGS`. Level: `GLOBAL`. Aliases: `FLUSH LOGS`

`SYSTEM RELOAD EMBEDDED DICTIONARIES`権限は、`SYSTEM RELOAD DICTIONARY ON *.*`権限によって暗黙的に付与されます。

### INTROSPECTION {#introspection}

[イントロスペクション](../../operations/optimizing-performance/sampling-query-profiler.md)関数の使用を許可します。

- `INTROSPECTION`. Level: `GROUP`. Aliases: `INTROSPECTION FUNCTIONS`
  - `addressToLine`. Level: `GLOBAL`
  - `addressToLineWithInlines`. Level: `GLOBAL`
  - `addressToSymbol`. Level: `GLOBAL`
  - `demangle`. Level: `GLOBAL`

### SOURCES {#sources}

外部データソースの使用を許可します。[テーブルエンジン](../../engines/table-engines/index.md)および[テーブル関数](/sql-reference/table-functions)に適用されます。

- `READ`. Level: `GLOBAL_WITH_PARAMETER`
- `WRITE`. Level: `GLOBAL_WITH_PARAMETER`

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
ソースに対するREAD/WRITE権限の分離は、バージョン25.7以降で利用可能であり、サーバー設定
`access_control_improvements.enable_read_write_grants`が有効な場合のみ使用できます。

それ以外の場合は、`GRANT AZURE ON *.* TO user`という構文を使用してください。これは新しい`GRANT READ, WRITE ON AZURE TO user`と同等です。
:::

例:

- [MySQLテーブルエンジン](../../engines/table-engines/integrations/mysql.md)でテーブルを作成するには、`CREATE TABLE (ON db.table_name)`と`MYSQL`権限が必要です。
- [mysqlテーブル関数](../../sql-reference/table-functions/mysql.md)を使用するには、`CREATE TEMPORARY TABLE`と`MYSQL`権限が必要です。

### ソースフィルター権限 {#source-filter-grants}

:::note
この機能は、バージョン25.8以降で利用可能であり、サーバー設定
`access_control_improvements.enable_read_write_grants`が有効な場合のみ使用できます。
:::

正規表現フィルターを使用して、特定のソースURIへのアクセスを許可できます。これにより、ユーザーがアクセスできる外部データソースをきめ細かく制御できます。

**構文:**

```sql
GRANT READ ON S3('regexp_pattern') TO user
```

この権限により、ユーザーは指定された正規表現パターンに一致するS3 URIからのみ読み取りが可能になります。

**例:**

特定のS3バケットパスへのアクセスを許可:

```sql
-- ユーザーがs3://foo/パスからのみ読み取りできるようにする
GRANT READ ON S3('s3://foo/.*') TO john

-- ユーザーが特定のファイルパターンから読み取りできるようにする
GRANT READ ON S3('s3://mybucket/data/2024/.*\.parquet') TO analyst

-- 同じユーザーに複数のフィルターを許可できる
GRANT READ ON S3('s3://foo/.*') TO john
GRANT READ ON S3('s3://bar/.*') TO john
```

:::warning
ソースフィルターはパラメータとして**正規表現**を受け取るため、
`GRANT READ ON URL('http://www.google.com') TO john;`
という権限は

```sql
SELECT * FROM url('https://www.google.com');
SELECT * FROM url('https://www-google.com');
```

というクエリを許可します。

これは、正規表現において`.`が`任意の1文字`として扱われるためです。
これは潜在的な脆弱性につながる可能性があります。正しい権限は次のようにする必要があります:

```sql
GRANT READ ON URL('https://www\.google\.com') TO john;
```

:::

**GRANT OPTIONによる再付与:**

元の権限に`WITH GRANT OPTION`が含まれている場合、`GRANT CURRENT GRANTS`を使用して再付与できます:

```sql
-- GRANT OPTIONを含む元の権限
GRANT READ ON S3('s3://foo/.*') TO john WITH GRANT OPTION

-- Johnはこのアクセス権を他のユーザーに再付与できる
GRANT CURRENT GRANTS(READ ON S3) TO alice
```

**重要な制限事項:**

- **部分的な取り消しは許可されていません:** 付与されたフィルターパターンの一部を取り消すことはできません。必要に応じて、権限全体を取り消して新しいパターンで再付与する必要があります。
- **ワイルドカード権限は許可されていません:** `GRANT READ ON *('regexp')`や類似のワイルドカードのみのパターンは使用できません。特定のソースを指定する必要があります。

### dictGet {#dictget}

- `dictGet`。エイリアス: `dictHas`、`dictGetHierarchy`、`dictIsIn`

ユーザーが[dictGet](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)、[dictHas](../../sql-reference/functions/ext-dict-functions.md#dicthas)、[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)、[dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictisin)関数を実行できるようにします。

権限レベル: `DICTIONARY`。

**例**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`

### displaySecretsInShowAndSelect {#displaysecretsinshowandselect}

[`display_secrets_in_show_and_select`サーバー設定](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select)
と
[`format_display_secrets_in_show_and_select`フォーマット設定](../../operations/settings/formats#format_display_secrets_in_show_and_select)
の両方が有効になっている場合、ユーザーが`SHOW`および`SELECT`クエリでシークレットを表示できるようにします。

### NAMED COLLECTION ADMIN {#named-collection-admin}

指定された名前付きコレクションに対する特定の操作を許可します。バージョン23.7以前はNAMED COLLECTION CONTROLと呼ばれていましたが、23.7以降はNAMED COLLECTION ADMINが追加され、NAMED COLLECTION CONTROLはエイリアスとして保持されています。


- `NAMED COLLECTION ADMIN`。レベル: `NAMED_COLLECTION`。別名: `NAMED COLLECTION CONTROL`
  - `CREATE NAMED COLLECTION`。レベル: `NAMED_COLLECTION`
  - `DROP NAMED COLLECTION`。レベル: `NAMED_COLLECTION`
  - `ALTER NAMED COLLECTION`。レベル: `NAMED_COLLECTION`
  - `SHOW NAMED COLLECTIONS`。レベル: `NAMED_COLLECTION`。別名: `SHOW NAMED COLLECTIONS`
  - `SHOW NAMED COLLECTIONS SECRETS`。レベル: `NAMED_COLLECTION`。別名: `SHOW NAMED COLLECTIONS SECRETS`
  - `NAMED COLLECTION`。レベル: `NAMED_COLLECTION`。別名: `NAMED COLLECTION USAGE, USE NAMED COLLECTION`

他のすべての権限付与(CREATE、DROP、ALTER、SHOW)とは異なり、NAMED COLLECTIONの権限付与は23.7で追加されましたが、その他はすべて22.12で追加されました。

**例**

名前付きコレクションがabcという名前であると仮定して、ユーザーjohnにCREATE NAMED COLLECTION権限を付与します。

- `GRANT CREATE NAMED COLLECTION ON abc TO john`

### TABLE ENGINE {#table-engine}

テーブル作成時に指定されたテーブルエンジンの使用を許可します。[テーブルエンジン](../../engines/table-engines/index.md)に適用されます。

**例**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`

### ALL {#all}

<CloudNotSupportedBadge />

規制対象エンティティに対するすべての権限をユーザーアカウントまたはロールに付与します。

:::note
ClickHouse Cloudでは`ALL`権限はサポートされておらず、`default`ユーザーには制限された権限があります。ユーザーは`default_role`を付与することで、ユーザーに最大限の権限を付与できます。詳細については[こちら](/cloud/security/manage-cloud-users)を参照してください。
また、`default`ユーザーとして`GRANT CURRENT GRANTS`を使用することで、`ALL`と同様の効果を得ることもできます。
:::

### NONE {#none}

いかなる権限も付与しません。

### ADMIN OPTION {#admin-option}

`ADMIN OPTION`権限により、ユーザーは自分のロールを別のユーザーに付与できます。
