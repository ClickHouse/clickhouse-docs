---
slug: '/sql-reference/statements/grant'
sidebar_position: 38
sidebar_label: 'GRANT'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# GRANT ステートメント

- [特権](#privileges)を ClickHouse ユーザーアカウントまたはロールに付与します。
- ユーザーアカウントや他のロールにロールを割り当てます。

特権を取り消すには、[REVOKE](../../sql-reference/statements/revoke.md) ステートメントを使用します。また、付与された特権をリストするには、[SHOW GRANTS](../../sql-reference/statements/show.md#show-grants) ステートメントを使用できます。
## 特権付与構文 {#granting-privilege-syntax}

``` sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — 特権の種類。
- `role` — ClickHouse ユーザーのロール。
- `user` — ClickHouse ユーザーアカウント。

`WITH GRANT OPTION` 句は、`user` または `role` に `GRANT` クエリを実行する権限を付与します。ユーザーは自分が持つのと同じ範囲か、それより少ない特権を他のユーザーに付与できます。
`WITH REPLACE OPTION` 句は、指定しなければ、`user` または `role` の古い特権を新しい特権で置き換えます。
## ロール割り当て構文 {#assigning-role-syntax}

``` sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

- `role` — ClickHouse ユーザーのロール。
- `user` — ClickHouse ユーザーアカウント。

`WITH ADMIN OPTION` 句は、`user` または `role` に [ADMIN OPTION](#admin-option) 特権を付与します。
`WITH REPLACE OPTION` 句は、指定しなければ、`user` または `role` の古いロールを新しいロールで置き換えます。
## 現在の特権付与構文 {#grant-current-grants-syntax}

``` sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — 特権の種類。
- `role` — ClickHouse ユーザーのロール。
- `user` — ClickHouse ユーザーアカウント。

`CURRENT GRANTS` ステートメントを使用すると、指定された特権を指定されたユーザーまたはロールに付与できます。
特権が指定されていない場合、そのユーザーまたはロールは `CURRENT_USER` に対して利用可能なすべての特権を受け取ります。
## 使用法 {#usage}

`GRANT` を使用するには、アカウントが `GRANT OPTION` 特権を持っている必要があります。ユーザーは、自分のアカウントの特権の範囲内でのみ特権を付与できます。

たとえば、管理者が次のクエリを使用して `john` アカウントに特権を付与しました：

``` sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

これは、`john` に以下のクエリを実行する権限が付与されたことを意味します：

- `SELECT x,y FROM db.table`。
- `SELECT x FROM db.table`。
- `SELECT y FROM db.table`。

`john` は `SELECT z FROM db.table` を実行できません。`SELECT * FROM db.table` も利用できません。このクエリを処理する際、ClickHouse は `x` と `y` でさえもデータを返しません。テーブルに `x` と `y` カラムしか含まれていない場合に限り、ClickHouse はすべてのデータを返します。

また、`john` は `GRANT OPTION` 特権を持っているので、同じまたは小さい範囲の特権を他のユーザーに付与できます。

`system` データベースへのアクセスは常に許可されています（このデータベースはクエリを処理するために使用されるため）。

1 回のクエリで複数のアカウントに複数の特権を付与できます。クエリ `GRANT SELECT, INSERT ON *.* TO john, robin` は、アカウント `john` と `robin` がサーバー上のすべてのデータベース内のすべてのテーブルに対して `INSERT` および `SELECT` クエリを実行できるようにします。
## ワイルドカードによる特権付与 {#wildcard-grants}

特権を指定する際、アスタリスク (`*`) をテーブル名やデータベース名の代わりに使用できます。たとえば、クエリ `GRANT SELECT ON db.* TO john` は、`john` に `db` データベース内のすべてのテーブルに対して `SELECT` クエリを実行する権限を与えます。
また、データベース名を省略することもできます。この場合、特権は現在のデータベースに付与されます。
たとえば、`GRANT SELECT ON * TO john` は、現在のデータベース内のすべてのテーブルに対して特権を付与し、`GRANT SELECT ON mytable TO john` は、現在のデータベース内の `mytable` テーブルに対して特権を付与します。

:::note
以下に説明する機能は、24.10 ClickHouse バージョンから利用可能です。
:::

テーブル名またはデータベース名の末尾にもアスタリスクを付けることができます。この機能により、テーブルのパスの抽象的なプレフィックスに対して特権を付与できます。
例： `GRANT SELECT ON db.my_tables* TO john`。このクエリにより、`john` が `my_tables*` というプレフィックスを持つすべての `db` データベースのテーブルに対して `SELECT` クエリを実行できるようになります。

さらに例：

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

付与されたパス内で新しく作成されたすべてのテーブルは、自動的に親からすべての特権を継承します。
たとえば、`GRANT SELECT ON db.* TO john` クエリを実行した後、新しいテーブル `db.new_table` を作成すると、ユーザー `john` は `SELECT * FROM db.new_table` クエリを実行できます。

アスタリスクは **プレフィックス** のみで指定できます：
```sql
GRANT SELECT ON db.* TO john -- 正しい
GRANT SELECT ON db*.* TO john -- 正しい

GRANT SELECT ON *.my_table TO john -- 誤り
GRANT SELECT ON foo*bar TO john -- 誤り
GRANT SELECT ON *suffix TO john -- 誤り
GRANT SELECT(foo) ON db.table* TO john -- 誤り
```
## 特権 {#privileges}

特権とは、ユーザーに特定の種類のクエリを実行する権限を与えるものです。

特権は階層構造を持ち、許可されるクエリのセットは特権の範囲によって異なります。

ClickHouse における特権の階層は以下の通りです：

- [`ALL`](#all)
    - [`ACCESS MANAGEMENT`](#access-management)
          - `ALLOW SQL SECURITY NONE`
          - `ALTER QUOTA`
          - `ALTER ROLE`
          - `ALTER ROW POLICY` 
          - `ALTER SETTINGS PROFILE`
          - `ALTER USER`
          - `CREATE QUOTA`
          - `CREATE ROLE`
          - `CREATE ROW POLICY`
          - `CREATE SETTINGS PROFILE`
          - `CREATE USER`
          - `DROP QUOTA`
          - `DROP ROLE`
          - `DROP ROW POLICY`
          - `DROP SETTINGS PROFILE`
          - `DROP USER`
          - `ROLE ADMIN`
          - `SHOW ACCESS`
              - `SHOW QUOTAS`
              - `SHOW ROLES`
              - `SHOW ROW POLICIES`
              - `SHOW SETTINGS PROFILES`
              - `SHOW USERS`
    - [`ALTER`](#alter)
          - `ALTER DATABASE`
              - `ALTER DATABASE SETTINGS`
          - `ALTER TABLE`
                - `ALTER COLUMN`
                    - `ALTER ADD COLUMN`
                    - `ALTER CLEAR COLUMN`
                    - `ALTER COMMENT COLUMN`
                    - `ALTER DROP COLUMN`
                    - `ALTER MATERIALIZE COLUMN`
                    - `ALTER MODIFY COLUMN`
                    - `ALTER RENAME COLUMN` 
                - `ALTER CONSTRAINT`
                    - `ALTER ADD CONSTRAINT`
                    - `ALTER DROP CONSTRAINT` 
                - `ALTER DELETE`
                - `ALTER FETCH PARTITION`
                - `ALTER FREEZE PARTITION`
                - `ALTER INDEX`
                    - `ALTER ADD INDEX`
                    - `ALTER CLEAR INDEX`
                    - `ALTER DROP INDEX`
                    - `ALTER MATERIALIZE INDEX`
                    - `ALTER ORDER BY`
                    - `ALTER SAMPLE BY` 
                - `ALTER MATERIALIZE TTL`
                - `ALTER MODIFY COMMENT`
                - `ALTER MOVE PARTITION`
                - `ALTER PROJECTION`
                - `ALTER SETTINGS`
                - `ALTER STATISTICS`
                    - `ALTER ADD STATISTICS`
                    - `ALTER DROP STATISTICS`
                    - `ALTER MATERIALIZE STATISTICS`
                    - `ALTER MODIFY STATISTICS` 
                - `ALTER TTL`
                - `ALTER UPDATE` 
          - `ALTER VIEW`
              - `ALTER VIEW MODIFY QUERY`
              - `ALTER VIEW REFRESH`
              - `ALTER VIEW MODIFY SQL SECURITY`
    - [`BACKUP`](#backup)
    - [`CLUSTER`](#cluster)
    - [`CREATE`](#create)
        - `CREATE ARBITRARY TEMPORARY TABLE`
            - `CREATE TEMPORARY TABLE`
        - `CREATE DATABASE`
        - `CREATE DICTIONARY`
        - `CREATE FUNCTION`
        - `CREATE RESOURCE`
        - `CREATE TABLE`
        - `CREATE VIEW`
        - `CREATE WORKLOAD`
    - [`dictGet`](#dictget)
    - [`displaySecretsInShowAndSelect`](#displaysecretsinshowandselect)
    - [`DROP`](#drop)
        - `DROP DATABASE`
        - `DROP DICTIONARY`
        - `DROP FUNCTION`
        - `DROP RESOURCE`
        - `DROP TABLE`
        - `DROP VIEW` 
        - `DROP WORKLOAD`
    - [`INSERT`](#insert)
    - [`INTROSPECTION`](#introspection)
        - `addressToLine`
        - `addressToLineWithInlines`
        - `addressToSymbol`
        - `demangle`
    - `KILL QUERY`
    - `KILL TRANSACTION`
    - `MOVE PARTITION BETWEEN SHARDS`
    - [`NAMED COLLECTION ADMIN`](#named-collection-admin)
        - `ALTER NAMED COLLECTION`
        - `CREATE NAMED COLLECTION`
        - `DROP NAMED COLLECTION`
        - `NAMED COLLECTION`
        - `SHOW NAMED COLLECTIONS`
        - `SHOW NAMED COLLECTIONS SECRETS`
    - [`OPTIMIZE`](#optimize)
    - [`SELECT`](#select)
    - [`SET DEFINER`](/sql-reference/statements/create/view#sql_security)
    - [`SHOW`](#show)
        - `SHOW COLUMNS` 
        - `SHOW DATABASES`
        - `SHOW DICTIONARIES`
        - `SHOW TABLES`
    - `SHOW FILESYSTEM CACHES`
    - [`SOURCES`](#sources)
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
    - [`SYSTEM`](#system)
        - `SYSTEM CLEANUP`
        - `SYSTEM DROP CACHE`
            - `SYSTEM DROP COMPILED EXPRESSION CACHE`
            - `SYSTEM DROP CONNECTIONS CACHE`
            - `SYSTEM DROP DISTRIBUTED CACHE`
            - `SYSTEM DROP DNS CACHE`
            - `SYSTEM DROP FILESYSTEM CACHE`
            - `SYSTEM DROP FORMAT SCHEMA CACHE`
            - `SYSTEM DROP MARK CACHE`
            - `SYSTEM DROP MMAP CACHE`
            - `SYSTEM DROP PAGE CACHE`
            - `SYSTEM DROP PRIMARY INDEX CACHE`
            - `SYSTEM DROP QUERY CACHE`
            - `SYSTEM DROP S3 CLIENT CACHE`
            - `SYSTEM DROP SCHEMA CACHE`
            - `SYSTEM DROP UNCOMPRESSED CACHE`
        - `SYSTEM DROP PRIMARY INDEX CACHE`
        - `SYSTEM DROP REPLICA`
        - `SYSTEM FAILPOINT`
        - `SYSTEM FETCHES`
        - `SYSTEM FLUSH`
            - `SYSTEM FLUSH ASYNC INSERT QUEUE`
            - `SYSTEM FLUSH LOGS`
        - `SYSTEM JEMALLOC`
        - `SYSTEM KILL QUERY`
        - `SYSTEM KILL TRANSACTION`
        - `SYSTEM LISTEN`
        - `SYSTEM LOAD PRIMARY KEY`
        - `SYSTEM MERGES`
        - `SYSTEM MOVES`
        - `SYSTEM PULLING REPLICATION LOG`
        - `SYSTEM REDUCE BLOCKING PARTS`
        - `SYSTEM REPLICATION QUEUES`
        - `SYSTEM REPLICA READINESS`
        - `SYSTEM RESTART DISK`
        - `SYSTEM RESTART REPLICA`
        - `SYSTEM RESTORE REPLICA`
        - `SYSTEM RELOAD`
            - `SYSTEM RELOAD ASYNCHRONOUS METRICS`
            - `SYSTEM RELOAD CONFIG`
                - `SYSTEM RELOAD DICTIONARY`
                - `SYSTEM RELOAD EMBEDDED DICTIONARIES`
                - `SYSTEM RELOAD FUNCTION`
                - `SYSTEM RELOAD MODEL`
                - `SYSTEM RELOAD USERS`
        - `SYSTEM SENDS`
            - `SYSTEM DISTRIBUTED SENDS`
            - `SYSTEM REPLICATED SENDS`
        - `SYSTEM SHUTDOWN`
        - `SYSTEM SYNC DATABASE REPLICA`
        - `SYSTEM SYNC FILE CACHE`
        - `SYSTEM SYNC FILESYSTEM CACHE`
        - `SYSTEM SYNC REPLICA`
        - `SYSTEM SYNC TRANSACTION LOG`
        - `SYSTEM THREAD FUZZER`
        - `SYSTEM TTL MERGES`
        - `SYSTEM UNFREEZE`
        - `SYSTEM UNLOAD PRIMARY KEY`
        - `SYSTEM VIEWS`
        - `SYSTEM VIRTUAL PARTS UPDATE`
        - `SYSTEM WAIT LOADING PARTS`
    - [`TABLE ENGINE`](#table-engine)
    - [`TRUNCATE`](#truncate)
    - `UNDROP TABLE` 
- [`NONE`](#none)

この階層の扱い例：

- `ALTER` 特権は他のすべての `ALTER*` 特権を含みます。
- `ALTER CONSTRAINT` は `ALTER ADD CONSTRAINT` および `ALTER DROP CONSTRAINT` 特権を含みます。

特権は異なるレベルで適用されます。レベルを知ることで、その特権に対して利用可能な構文が示唆されます。

レベル（低いものから高いものへ）：

- `COLUMN` — 特権は列、テーブル、データベース、またはグローバルに付与できます。
- `TABLE` — 特権はテーブル、データベース、またはグローバルに付与できます。
- `VIEW` — 特権はビュー、データベース、またはグローバルに付与できます。
- `DICTIONARY` — 特権は辞書、データベース、またはグローバルに付与できます。
- `DATABASE` — 特権はデータベースまたはグローバルに付与できます。
- `GLOBAL` — 特権はグローバルにのみ付与できます。
- `GROUP` — 異なるレベルの特権をグループ化します。`GROUP` レベルの特権が付与されると、使用された構文に対応するグループの特権のみが付与されます。

許可されている構文の例：

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

許可されていない構文の例：

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

特別な特権 [ALL](#all) は、ユーザーアカウントまたはロールにすべての特権を付与します。

デフォルトでは、ユーザーアカウントまたはロールには特権がありません。

ユーザーやロールに特権がない場合は、[NONE](#none) 特権として表示されます。

特定の実装により、特定の特権セットが要求されるクエリがあります。たとえば、[RENAME](../../sql-reference/statements/optimize.md) クエリを実行するには、次の特権が必要です： `SELECT`, `CREATE TABLE`, `INSERT`, `DROP TABLE`。
### SELECT {#select}

[SELECT](../../sql-reference/statements/select/index.md) クエリを実行することを許可します。

特権レベル: `COLUMN`.

**説明**

この特権を与えられたユーザーは、指定されたテーブルおよびデータベース内の指定された列のリストに対して `SELECT` クエリを実行できます。他の列を含めた場合、指定されたクエリはデータを返しません。

次の特権を考慮してください：

``` sql
GRANT SELECT(x,y) ON db.table TO john
```

この特権により、`john` は `db.table` 内の `x` および/または `y` 列からのデータを含む任意の `SELECT` クエリを実行できます。例えば、`SELECT x FROM db.table`。`john` は `SELECT z FROM db.table` を実行できません。`SELECT * FROM db.table` も利用できません。このクエリを処理する際、ClickHouse は `x` と `y` でさえもデータを返しません。テーブルに `x` と `y` カラムしか含まれていない場合に限り、ClickHouse はすべてのデータを返します。
### INSERT {#insert}

[INSERT](../../sql-reference/statements/insert-into.md) クエリを実行することを許可します。

特権レベル: `COLUMN`.

**説明**

この特権を与えられたユーザーは、指定されたテーブルおよびデータベース内の指定された列のリストに対して `INSERT` クエリを実行できます。他の列を含めた場合、指定されたクエリはデータを挿入しません。

**例**

``` sql
GRANT INSERT(x,y) ON db.table TO john
```

付与された特権により、`john` は `db.table` の `x` および/または `y` 列にデータを挿入できます。
### ALTER {#alter}

[ALTER](../../sql-reference/statements/alter/index.md) クエリを実行することを許可します。以下の特権の階層に基づきます：

- `ALTER`. レベル: `COLUMN`.
    - `ALTER TABLE`. レベル: `GROUP`
        - `ALTER UPDATE`. レベル: `COLUMN`. エイリアス: `UPDATE`
        - `ALTER DELETE`. レベル: `COLUMN`. エイリアス: `DELETE`
        - `ALTER COLUMN`. レベル: `GROUP`
            - `ALTER ADD COLUMN`. レベル: `COLUMN`. エイリアス: `ADD COLUMN`
            - `ALTER DROP COLUMN`. レベル: `COLUMN`. エイリアス: `DROP COLUMN`
            - `ALTER MODIFY COLUMN`. レベル: `COLUMN`. エイリアス: `MODIFY COLUMN`
            - `ALTER COMMENT COLUMN`. レベル: `COLUMN`. エイリアス: `COMMENT COLUMN`
            - `ALTER CLEAR COLUMN`. レベル: `COLUMN`. エイリアス: `CLEAR COLUMN`
            - `ALTER RENAME COLUMN`. レベル: `COLUMN`. エイリアス: `RENAME COLUMN`
        - `ALTER INDEX`. レベル: `GROUP`. エイリアス: `INDEX`
            - `ALTER ORDER BY`. レベル: `TABLE`. エイリアス: `ALTER MODIFY ORDER BY`, `MODIFY ORDER BY`
            - `ALTER SAMPLE BY`. レベル: `TABLE`. エイリアス: `ALTER MODIFY SAMPLE BY`, `MODIFY SAMPLE BY`
            - `ALTER ADD INDEX`. レベル: `TABLE`. エイリアス: `ADD INDEX`
            - `ALTER DROP INDEX`. レベル: `TABLE`. エイリアス: `DROP INDEX`
            - `ALTER MATERIALIZE INDEX`. レベル: `TABLE`. エイリアス: `MATERIALIZE INDEX`
            - `ALTER CLEAR INDEX`. レベル: `TABLE`. エイリアス: `CLEAR INDEX`
        - `ALTER CONSTRAINT`. レベル: `GROUP`. エイリアス: `CONSTRAINT`
            - `ALTER ADD CONSTRAINT`. レベル: `TABLE`. エイリアス: `ADD CONSTRAINT`
            - `ALTER DROP CONSTRAINT`. レベル: `TABLE`. エイリアス: `DROP CONSTRAINT`
        - `ALTER TTL`. レベル: `TABLE`. エイリアス: `ALTER MODIFY TTL`, `MODIFY TTL`
            - `ALTER MATERIALIZE TTL`. レベル: `TABLE`. エイリアス: `MATERIALIZE TTL`
        - `ALTER SETTINGS`. レベル: `TABLE`. エイリアス: `ALTER SETTING`, `ALTER MODIFY SETTING`, `MODIFY SETTING`
        - `ALTER MOVE PARTITION`. レベル: `TABLE`. エイリアス: `ALTER MOVE PART`, `MOVE PARTITION`, `MOVE PART`
        - `ALTER FETCH PARTITION`. レベル: `TABLE`. エイリアス: `ALTER FETCH PART`, `FETCH PARTITION`, `FETCH PART`
        - `ALTER FREEZE PARTITION`. レベル: `TABLE`. エイリアス: `FREEZE PARTITION`
    - `ALTER VIEW` レベル: `GROUP`
        - `ALTER VIEW REFRESH`. レベル: `VIEW`. エイリアス: `ALTER LIVE VIEW REFRESH`, `REFRESH VIEW`
        - `ALTER VIEW MODIFY QUERY`. レベル: `VIEW`. エイリアス: `ALTER TABLE MODIFY QUERY`
        - `ALTER VIEW MODIFY SQL SECURITY`. レベル: `VIEW`. エイリアス: `ALTER TABLE MODIFY SQL SECURITY`

この階層の扱い例：

- `ALTER` 特権は他のすべての `ALTER*` 特権を含みます。
- `ALTER CONSTRAINT` は `ALTER ADD CONSTRAINT` および `ALTER DROP CONSTRAINT` 特権を含みます。

**注意**

- `MODIFY SETTING` 特権はテーブルエンジンの設定を変更できます。設定やサーバーの構成パラメータには影響しません。
- `ATTACH` 操作には [CREATE](#create) 特権が必要です。
- `DETACH` 操作には [DROP](#drop) 特権が必要です。
- [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation) クエリによる変異の停止には、この変異を開始するための特権が必要です。たとえば、`ALTER UPDATE` クエリを停止したい場合は、`ALTER UPDATE`、`ALTER TABLE`、または `ALTER` 特権が必要です。
### BACKUP {#backup}

[`BACKUP`] におけるクエリの実行を許可します。バックアップの詳細については、「[バックアップと復元](../../operations/backup.md)」を参照してください。
### CREATE {#create}

[CREATE](../../sql-reference/statements/create/index.md) および [ATTACH](../../sql-reference/statements/attach.md) DDL クエリを実行することを許可します。以下の特権の階層に基づきます：

- `CREATE`. レベル: `GROUP`
    - `CREATE DATABASE`. レベル: `DATABASE`
    - `CREATE TABLE`. レベル: `TABLE`
        - `CREATE ARBITRARY TEMPORARY TABLE`. レベル: `GLOBAL`
            - `CREATE TEMPORARY TABLE`. レベル: `GLOBAL`
    - `CREATE VIEW`. レベル: `VIEW`
    - `CREATE DICTIONARY`. レベル: `DICTIONARY`

**注意**

- 作成したテーブルを削除するには、ユーザーは [DROP](#drop) 特権が必要です。
### CLUSTER {#cluster}

`ON CLUSTER` クエリを実行することを許可します。

```sql title="構文"
GRANT CLUSTER ON *.* TO <username>
```

デフォルトでは、`ON CLUSTER` を使用するクエリはユーザーが `CLUSTER` 特権を持つ必要があります。
`CLUSTER` 特権を最初に付与せずに `ON CLUSTER` をクエリで使用しようとすると、次のエラーが発生します：

```text
特権が不足しています。このクエリを実行するには、CLUSTER ON *.* の付与が必要です。
```

デフォルトの動作は、`config.xml` の `access_control_improvements` セクションにある `on_cluster_queries_require_cluster_grant` 設定を `false` に設定することで変更できます。

```yaml title="config.xml"
<access_control_improvements>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```
### DROP {#drop}

[DROP](../../sql-reference/statements/drop.md) および [DETACH](../../sql-reference/statements/detach.md) クエリを実行することを許可します。以下の特権の階層に基づきます：

- `DROP`. レベル: `GROUP`
    - `DROP DATABASE`. レベル: `DATABASE`
    - `DROP TABLE`. レベル: `TABLE`
    - `DROP VIEW`. レベル: `VIEW`
    - `DROP DICTIONARY`. レベル: `DICTIONARY`
### TRUNCATE {#truncate}

[TRUNCATE](../../sql-reference/statements/truncate.md) クエリを実行することを許可します。

特権レベル: `TABLE`。
### OPTIMIZE {#optimize}

[OPTIMIZE TABLE](../../sql-reference/statements/optimize.md) クエリを実行することを許可します。

特権レベル: `TABLE`。
### SHOW {#show}

`SHOW`、`DESCRIBE`、`USE`、および `EXISTS` クエリを実行することを許可します。以下の特権の階層に基づきます：

- `SHOW`. レベル: `GROUP`
    - `SHOW DATABASES`. レベル: `DATABASE`。`SHOW DATABASES`、`SHOW CREATE DATABASE`、`USE <database>` クエリを実行できます。
    - `SHOW TABLES`. レベル: `TABLE`。`SHOW TABLES`、`EXISTS <table>`、`CHECK <table>` クエリを実行できます。
    - `SHOW COLUMNS`. レベル: `COLUMN`。`SHOW CREATE TABLE`、`DESCRIBE` クエリを実行できます。
    - `SHOW DICTIONARIES`. レベル: `DICTIONARY`。`SHOW DICTIONARIES`、`SHOW CREATE DICTIONARY`、`EXISTS <dictionary>` クエリを実行できます。

**注意**

ユーザーは、指定されたテーブル、辞書、またはデータベースに関する他の特権を持っている場合、`SHOW` 特権を持っています。
### KILL QUERY {#kill-query}

[KILL](../../sql-reference/statements/kill.md#kill-query) クエリを実行することを許可します。以下の特権の階層に基づきます：

特権レベル: `GLOBAL`.

**注意**

`KILL QUERY` 特権は、1 人のユーザーが他のユーザーのクエリを殺すことを許可します。
### アクセス管理 {#access-management}

ユーザーがユーザー、ロール、および行ポリシーを管理するクエリを実行できるようにします。

- `ACCESS MANAGEMENT`. レベル: `GROUP`
    - `CREATE USER`. レベル: `GLOBAL`
    - `ALTER USER`. レベル: `GLOBAL`
    - `DROP USER`. レベル: `GLOBAL`
    - `CREATE ROLE`. レベル: `GLOBAL`
    - `ALTER ROLE`. レベル: `GLOBAL`
    - `DROP ROLE`. レベル: `GLOBAL`
    - `ROLE ADMIN`. レベル: `GLOBAL`
    - `CREATE ROW POLICY`. レベル: `GLOBAL`. エイリアス: `CREATE POLICY`
    - `ALTER ROW POLICY`. レベル: `GLOBAL`. エイリアス: `ALTER POLICY`
    - `DROP ROW POLICY`. レベル: `GLOBAL`. エイリアス: `DROP POLICY`
    - `CREATE QUOTA`. レベル: `GLOBAL`
    - `ALTER QUOTA`. レベル: `GLOBAL`
    - `DROP QUOTA`. レベル: `GLOBAL`
    - `CREATE SETTINGS PROFILE`. レベル: `GLOBAL`. エイリアス: `CREATE PROFILE`
    - `ALTER SETTINGS PROFILE`. レベル: `GLOBAL`. エイリアス: `ALTER PROFILE`
    - `DROP SETTINGS PROFILE`. レベル: `GLOBAL`. エイリアス: `DROP PROFILE`
    - `SHOW ACCESS`. レベル: `GROUP`
        - `SHOW_USERS`. レベル: `GLOBAL`. エイリアス: `SHOW CREATE USER`
        - `SHOW_ROLES`. レベル: `GLOBAL`. エイリアス: `SHOW CREATE ROLE`
        - `SHOW_ROW_POLICIES`. レベル: `GLOBAL`. エイリアス: `SHOW POLICIES`, `SHOW CREATE ROW POLICY`, `SHOW CREATE POLICY`
        - `SHOW_QUOTAS`. レベル: `GLOBAL`. エイリアス: `SHOW CREATE QUOTA`
        - `SHOW_SETTINGS_PROFILES`. レベル: `GLOBAL`. エイリアス: `SHOW PROFILES`, `SHOW CREATE SETTINGS PROFILE`, `SHOW CREATE PROFILE`
    - `ALLOW SQL SECURITY NONE`. レベル: `GLOBAL`. エイリアス: `CREATE SQL SECURITY NONE`, `SQL SECURITY NONE`, `SECURITY NONE`

`ROLE ADMIN` 特権は、ユーザーが管理オプションで自分に割り当てられていないロールを含むすべてのロールを割り当てたり、取り消したりできるようにします。
### SYSTEM {#system}

ユーザーが [SYSTEM](../../sql-reference/statements/system.md) クエリを実行できるようにします。以下の特権の階層に基づきます。

- `SYSTEM`. レベル: `GROUP`
    - `SYSTEM SHUTDOWN`. レベル: `GLOBAL`. エイリアス: `SYSTEM KILL`, `SHUTDOWN`
    - `SYSTEM DROP CACHE`. エイリアス: `DROP CACHE`
        - `SYSTEM DROP DNS CACHE`. レベル: `GLOBAL`. エイリアス: `SYSTEM DROP DNS`, `DROP DNS CACHE`, `DROP DNS`
        - `SYSTEM DROP MARK CACHE`. レベル: `GLOBAL`. エイリアス: `SYSTEM DROP MARK`, `DROP MARK CACHE`, `DROP MARKS`
        - `SYSTEM DROP UNCOMPRESSED CACHE`. レベル: `GLOBAL`. エイリアス: `SYSTEM DROP UNCOMPRESSED`, `DROP UNCOMPRESSED CACHE`, `DROP UNCOMPRESSED`
    - `SYSTEM RELOAD`. レベル: `GROUP`
        - `SYSTEM RELOAD CONFIG`. レベル: `GLOBAL`. エイリアス: `RELOAD CONFIG`
        - `SYSTEM RELOAD DICTIONARY`. レベル: `GLOBAL`. エイリアス: `SYSTEM RELOAD DICTIONARIES`, `RELOAD DICTIONARY`, `RELOAD DICTIONARIES`
            - `SYSTEM RELOAD EMBEDDED DICTIONARIES`. レベル: `GLOBAL`. エイリアス: `RELOAD EMBEDDED DICTIONARIES`
    - `SYSTEM MERGES`. レベル: `TABLE`. エイリアス: `SYSTEM STOP MERGES`, `SYSTEM START MERGES`, `STOP MERGES`, `START MERGES`
    - `SYSTEM TTL MERGES`. レベル: `TABLE`. エイリアス: `SYSTEM STOP TTL MERGES`, `SYSTEM START TTL MERGES`, `STOP TTL MERGES`, `START TTL MERGES`
    - `SYSTEM FETCHES`. レベル: `TABLE`. エイリアス: `SYSTEM STOP FETCHES`, `SYSTEM START FETCHES`, `STOP FETCHES`, `START FETCHES`
    - `SYSTEM MOVES`. レベル: `TABLE`. エイリアス: `SYSTEM STOP MOVES`, `SYSTEM START MOVES`, `STOP MOVES`, `START MOVES`
    - `SYSTEM SENDS`. レベル: `GROUP`. エイリアス: `SYSTEM STOP SENDS`, `SYSTEM START SENDS`, `STOP SENDS`, `START SENDS`
        - `SYSTEM DISTRIBUTED SENDS`. レベル: `TABLE`. エイリアス: `SYSTEM STOP DISTRIBUTED SENDS`, `SYSTEM START DISTRIBUTED SENDS`, `STOP DISTRIBUTED SENDS`, `START DISTRIBUTED SENDS`
        - `SYSTEM REPLICATED SENDS`. レベル: `TABLE`. エイリアス: `SYSTEM STOP REPLICATED SENDS`, `SYSTEM START REPLICATED SENDS`, `STOP REPLICATED SENDS`, `START REPLICATED SENDS`
    - `SYSTEM REPLICATION QUEUES`. レベル: `TABLE`. エイリアス: `SYSTEM STOP REPLICATION QUEUES`, `SYSTEM START REPLICATION QUEUES`, `STOP REPLICATION QUEUES`, `START REPLICATION QUEUES`
    - `SYSTEM SYNC REPLICA`. レベル: `TABLE`. エイリアス: `SYNC REPLICA`
    - `SYSTEM RESTART REPLICA`. レベル: `TABLE`. エイリアス: `RESTART REPLICA`
    - `SYSTEM FLUSH`. レベル: `GROUP`
        - `SYSTEM FLUSH DISTRIBUTED`. レベル: `TABLE`. エイリアス: `FLUSH DISTRIBUTED`
        - `SYSTEM FLUSH LOGS`. レベル: `GLOBAL`. エイリアス: `FLUSH LOGS`

`SYSTEM RELOAD EMBEDDED DICTIONARIES` 特権は、`SYSTEM RELOAD DICTIONARY ON *.*` 特権によって暗黙に付与されます。
### INTROSPECTION {#introspection}

[イントロスペクション](../../operations/optimizing-performance/sampling-query-profiler.md) 関数を使用することを許可します。

- `INTROSPECTION`. レベル: `GROUP`. エイリアス: `INTROSPECTION FUNCTIONS`
    - `addressToLine`. レベル: `GLOBAL`
    - `addressToLineWithInlines`. レベル: `GLOBAL`
    - `addressToSymbol`. レベル: `GLOBAL`
    - `demangle`. レベル: `GLOBAL`
### SOURCES {#sources}

外部データソースを使用することを許可します。これは [テーブルエンジン](../../engines/table-engines/index.md) および [テーブル関数](/sql-reference/table-functions) に適用されます。

- `SOURCES`. レベル: `GROUP`
    - `AZURE`. レベル: `GLOBAL`
    - `FILE`. レベル: `GLOBAL`
    - `HDFS`. レベル: `GLOBAL`
    - `HIVE`. レベル: `GLOBAL`
    - `JDBC`. レベル: `GLOBAL`
    - `KAFKA`. レベル: `GLOBAL`
    - `MONGO`. レベル: `GLOBAL`
    - `MYSQL`. レベル: `GLOBAL`
    - `NATS`. レベル: `GLOBAL`
    - `ODBC`. レベル: `GLOBAL`
    - `POSTGRES`. レベル: `GLOBAL`
    - `RABBITMQ`. レベル: `GLOBAL`
    - `REDIS`. レベル: `GLOBAL`
    - `REMOTE`. レベル: `GLOBAL`
    - `S3`. レベル: `GLOBAL`
    - `SQLITE`. レベル: `GLOBAL`
    - `URL`. レベル: `GLOBAL`

`SOURCES` 特権はすべてのソースの使用を可能にします。また、各ソースに個別に特権を付与することもできます。ソースを使用するには、追加の特権が必要です。

例:

- [MySQL テーブルエンジン](../../engines/table-engines/integrations/mysql.md) でテーブルを作成するには、`CREATE TABLE (ON db.table_name)` と `MYSQL` 特権が必要です。
- [mysql 関数](../../sql-reference/table-functions/mysql.md) を使用するには、`CREATE TEMPORARY TABLE` と `MYSQL` 特権が必要です。
### dictGet {#dictget}

- `dictGet`. エイリアス: `dictHas`, `dictGetHierarchy`, `dictIsIn`

ユーザーが [dictGet](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)、[dictHas](../../sql-reference/functions/ext-dict-functions.md#dicthas)、[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)、[dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictisin) 関数を実行することを許可します。

特権レベル: `DICTIONARY`.

**例**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`
### displaySecretsInShowAndSelect {#displaysecretsinshowandselect}

ユーザーが `SHOW` および `SELECT` クエリで秘密情報を表示できるようにします。条件として、両方の [`display_secrets_in_show_and_select` サーバー設定](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select) および [`format_display_secrets_in_show_and_select` フォーマット設定](../../operations/settings/formats#format_display_secrets_in_show_and_select) がオンになっている必要があります。

### NAMED COLLECTION ADMIN {#named-collection-admin}

指定されたデータコレクションに対して特定の操作を許可します。バージョン 23.7 以前は NAMED COLLECTION CONTROL と呼ばれており、23.7 の後に NAMED COLLECTION ADMIN が追加され、NAMED COLLECTION CONTROL はエイリアスとして保持されています。

- `NAMED COLLECTION ADMIN`. レベル: `NAMED_COLLECTION`. エイリアス: `NAMED COLLECTION CONTROL`
    - `CREATE NAMED COLLECTION`. レベル: `NAMED_COLLECTION`
    - `DROP NAMED COLLECTION`. レベル: `NAMED_COLLECTION`
    - `ALTER NAMED COLLECTION`. レベル: `NAMED_COLLECTION`
    - `SHOW NAMED COLLECTIONS`. レベル: `NAMED_COLLECTION`. エイリアス: `SHOW NAMED COLLECTIONS`
    - `SHOW NAMED COLLECTIONS SECRETS`. レベル: `NAMED_COLLECTION`. エイリアス: `SHOW NAMED COLLECTIONS SECRETS`
    - `NAMED COLLECTION`. レベル: `NAMED_COLLECTION`. エイリアス: `NAMED COLLECTION USAGE, USE NAMED COLLECTION`

他のすべての権限 (CREATE, DROP, ALTER, SHOW) と異なり、NAMED COLLECTION の付与は 23.7 に追加され、他のすべては以前の 22.12 に追加されました。

**例**

データコレクションが abc と呼ばれると仮定し、ユーザー john に CREATE NAMED COLLECTION の権限を付与します。
- `GRANT CREATE NAMED COLLECTION ON abc TO john`

### TABLE ENGINE {#table-engine}

テーブル作成時に指定されたテーブルエンジンを使用できるようにします。[テーブルエンジン](../../engines/table-engines/index.md)に適用されます。

**例**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`

### ALL {#all}

<CloudNotSupportedBadge/>

規制対象のエンティティに対するすべての権限をユーザーアカウントまたはロールに付与します。

:::note
権限 `ALL` は ClickHouse Cloud ではサポートされておらず、`default` ユーザーには制限された権限があります。ユーザーは `default_role` を付与することによって、他のユーザーに最大の権限を付与できます。詳細については[こちら](/cloud/security/cloud-access-management/overview#initial-settings)を参照してください。
ユーザーはまた、デフォルトユーザーとして `GRANT CURRENT GRANTS` を使用して `ALL` に類似した効果を得ることができます。
:::

### NONE {#none}

いかなる権限も付与しません。

### ADMIN OPTION {#admin-option}

`ADMIN OPTION` 権限は、ユーザーが自分のロールを他のユーザーに付与できるようにします。
