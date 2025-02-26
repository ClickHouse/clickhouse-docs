---
slug: /sql-reference/statements/grant
sidebar_position: 38
sidebar_label: GRANT
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# GRANT ステートメント

- ClickHouse ユーザーアカウントまたはロールに [権限](#privileges) を付与します。
- ユーザーアカウントや他のロールにロールを割り当てます。

権限を取り消すには、[REVOKE](../../sql-reference/statements/revoke.md) ステートメントを使用します。また、付与された権限をリスト表示するには、[SHOW GRANTS](../../sql-reference/statements/show.md#show-grants) ステートメントを使用できます。

## 権限付与の構文 {#granting-privilege-syntax}

``` sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — 権限の種類。
- `role` — ClickHouse のユーザーロール。
- `user` — ClickHouse ユーザーアカウント。

`WITH GRANT OPTION` 句は、`user` または `role` に `GRANT` クエリを実行する権限を付与します。ユーザーは、持っている権限の範囲と同じ、またはそれ以下の権限を付与できます。  
`WITH REPLACE OPTION` 句は、指定しない場合、古い権限を新しい権限で置き換えます。

## ロール割当の構文 {#assigning-role-syntax}

``` sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

- `role` — ClickHouse ユーザーロール。
- `user` — ClickHouse ユーザーアカウント。

`WITH ADMIN OPTION` 句は、`user` または `role` に [ADMIN OPTION](#admin-option) 権限を付与します。  
`WITH REPLACE OPTION` 句は、指定しない場合、`user` または `role` の古いロールを新しいロールに置き換えます。

## 現在の権限付与の構文 {#grant-current-grants-syntax}
``` sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

-   `privilege` — 権限の種類。
-   `role` — ClickHouse ユーザーロール。
-   `user` — ClickHouse ユーザーアカウント。

`CURRENT GRANTS` ステートメントを使用することで、指定されたユーザーまたはロールにすべての指定された権限を付与できます。  
権限が指定されていない場合、指定されたユーザーまたはロールは `CURRENT_USER` に対してすべての利用可能な権限を受け取ります。

## 使用法 {#usage}

`GRANT` を使用するには、アカウントが `GRANT OPTION` 権限を持っている必要があります。  
ユーザーは自分のアカウントの権限の範囲内でしか権限を付与できません。

たとえば、管理者が次のクエリで `john` アカウントに権限を付与しました：

``` sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

これは、`john` が以下を実行する権限を持っていることを意味します：

- `SELECT x,y FROM db.table`。
- `SELECT x FROM db.table`。
- `SELECT y FROM db.table`。

`john` は `SELECT z FROM db.table` を実行できません。また、`SELECT * FROM db.table` も利用できません。このクエリを処理する際、ClickHouse は `x` と `y` のデータさえも返しません。唯一の例外は、テーブルが `x` と `y` カラムのみを含む場合です。この場合、ClickHouse はすべてのデータを返します。

また、`john` は `GRANT OPTION` 権限を持っているので、他のユーザーに同じまたはそれ以下の範囲の権限を付与できます。

`system` データベースへのアクセスは常に許可されます（このデータベースはクエリ処理のために使用されます）。

1 つのクエリで複数のアカウントに複数の権限を付与できます。クエリ `GRANT SELECT, INSERT ON *.* TO john, robin` は、アカウント `john` と `robin` にサーバー上のすべてのデータベースのすべてのテーブルで `INSERT` および `SELECT` クエリを実行することを許可します。

## ワイルドカードによる権限付与 {#wildcard-grants}

権限を指定する際、アスタリスク (`*`) をテーブル名やデータベース名の代わりに使用できます。例えば、`GRANT SELECT ON db.* TO john` クエリは、`john` に `db` データベース内のすべてのテーブルで `SELECT` クエリを実行することを許可します。  
また、データベース名を省略することもできます。この場合、権限は現在のデータベースに付与されます。  
例えば、`GRANT SELECT ON * TO john` は、現在のデータベース内のすべてのテーブルに対する権限を付与し、`GRANT SELECT ON mytable TO john` は、現在のデータベース内の `mytable` テーブルに対する権限を付与します。

:::note
以下の機能は、ClickHouse バージョン 24.10 以降で利用可能です。
:::

テーブル名やデータベース名の末尾にアスタリスクを置くこともできます。この機能により、テーブルのパスの抽象的なプレフィックスに対して権限を付与できます。  
例: `GRANT SELECT ON db.my_tables* TO john`。このクエリは、`john` に `my_tables*` プレフィックスを持つすべての `db` データベースのテーブルで `SELECT` クエリを実行することを許可します。

他の例：

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

付与されたパス内に新しく作成されたテーブルは、自動的に親からすべての権限を継承します。  
例えば、`GRANT SELECT ON db.* TO john` クエリを実行した後に新しいテーブル `db.new_table` を作成すると、ユーザー `john` は `SELECT * FROM db.new_table` クエリを実行できます。

プレフィックスに対してのみアスタリスクを指定できます：
```sql
GRANT SELECT ON db.* TO john -- 正しい
GRANT SELECT ON db*.* TO john -- 正しい

GRANT SELECT ON *.my_table TO john -- 間違い
GRANT SELECT ON foo*bar TO john -- 間違い
GRANT SELECT ON *suffix TO john -- 間違い
GRANT SELECT(foo) ON db.table* TO john -- 間違い
```

## 権限 {#privileges}

権限とは、ユーザーに特定の種類のクエリを実行するために与えられる許可のことです。

権限は階層構造を持ち、許可されているクエリのセットは権限の範囲に依存します。

ClickHouse における権限の階層は以下の通りです：

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
    - [`SET DEFINER`](/en/sql-reference/statements/create/view#sql_security)
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

この階層がどのように扱われるかの例：

- `ALTER` 権限は他のすべての `ALTER*` 権限を含みます。
- `ALTER CONSTRAINT` は `ALTER ADD CONSTRAINT` および `ALTER DROP CONSTRAINT` 権限を含みます。

権限は異なるレベルで適用されます。レベルを知ると、権限に対して利用可能な構文を示唆します。

レベル（下から上へ）：

- `COLUMN` — 権限はカラム、テーブル、データベース、またはグローバルに付与できます。
- `TABLE` — 権限はテーブル、データベース、またはグローバルに付与できます。
- `VIEW` — 権限はビュー、データベース、またはグローバルに付与できます。
- `DICTIONARY` — 権限は辞書、データベース、またはグローバルに付与できます。
- `DATABASE` — 権限はデータベースまたはグローバルに付与できます。
- `GLOBAL` — 権限はグローバルにのみ付与できます。
- `GROUP` — 異なるレベルの権限をグループ化します。`GROUP` レベルの権限が付与されると、使用された構文に対応するグループからのみその権限が付与されます。

許可されている構文の例：

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

許可されていない構文の例：

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

特別な権限 [ALL](#all) は、ユーザーアカウントまたはロールにすべての権限を付与します。

デフォルトでは、ユーザーアカウントまたはロールには権限がありません。

ユーザーやロールに権限がない場合、権限は [NONE](#none) と表示されます。

いくつかのクエリは、その実装によって特定の権限のセットを必要とします。例えば、[RENAME](../../sql-reference/statements/optimize.md) クエリを実行するには、次の権限が必要です：`SELECT`、`CREATE TABLE`、`INSERT` および `DROP TABLE`。

### SELECT {#select}

[SELECT](../../sql-reference/statements/select/index.md) クエリを実行することを許可します。

権限レベル: `COLUMN`。

**説明**

この権限が付与されたユーザーは、指定されたテーブルおよびデータベース内の指定されたカラムのリストに対する `SELECT` クエリを実行できます。ユーザーが他のカラムを含む場合、指定されたクエリはデータを返しません。

以下の権限を考えてみましょう：

``` sql
GRANT SELECT(x,y) ON db.table TO john
```

この権限は、`john` が `db.table` の `x` および/または `y` カラムのデータを含む任意の `SELECT` クエリを実行することを許可します。たとえば、`SELECT x FROM db.table`。`john` は `SELECT z FROM db.table` を実行できません。`SELECT * FROM db.table` も利用できません。このクエリを処理する際、ClickHouse は `x` と `y` のデータさえも返しません。唯一の例外は、テーブルが `x` と `y` カラムのみを含む場合です。この場合、ClickHouse はすべてのデータを返します。

### INSERT {#insert}

[INSERT](../../sql-reference/statements/insert-into.md) クエリを実行することを許可します。

権限レベル: `COLUMN`。

**説明**

この権限が付与されたユーザーは、指定されたテーブルおよびデータベース内の指定されたカラムのリストに対する `INSERT` クエリを実行できます。ユーザーが他のカラムを含む場合、指定されたクエリはデータを挿入しません。

**例**

``` sql
GRANT INSERT(x,y) ON db.table TO john
```

付与された権限により、`john` は `db.table` の `x` および/または `y` カラムにデータを挿入できます。

### ALTER {#alter}

[ALTER](../../sql-reference/statements/alter/index.md) クエリを実行することを許可します。以下の権限の階層に応じて：

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
            - `ALTER ORDER BY`。レベル: `TABLE`。エイリアス: `ALTER MODIFY ORDER BY`, `MODIFY ORDER BY`
            - `ALTER SAMPLE BY`。レベル: `TABLE`。エイリアス: `ALTER MODIFY SAMPLE BY`, `MODIFY SAMPLE BY`
            - `ALTER ADD INDEX`。レベル: `TABLE`。エイリアス: `ADD INDEX`
            - `ALTER DROP INDEX`。レベル: `TABLE`。エイリアス: `DROP INDEX`
            - `ALTER MATERIALIZE INDEX`。レベル: `TABLE`。エイリアス: `MATERIALIZE INDEX`
            - `ALTER CLEAR INDEX`。レベル: `TABLE`。エイリアス: `CLEAR INDEX`
        - `ALTER CONSTRAINT`。レベル: `GROUP`。エイリアス: `CONSTRAINT`
            - `ALTER ADD CONSTRAINT`。レベル: `TABLE`。エイリアス: `ADD CONSTRAINT`
            - `ALTER DROP CONSTRAINT`。レベル: `TABLE`。エイリアス: `DROP CONSTRAINT`
        - `ALTER TTL`。レベル: `TABLE`。エイリアス: `ALTER MODIFY TTL`, `MODIFY TTL`
            - `ALTER MATERIALIZE TTL`。レベル: `TABLE`。エイリアス: `MATERIALIZE TTL`
        - `ALTER SETTINGS`。レベル: `TABLE`。エイリアス: `ALTER SETTING`, `ALTER MODIFY SETTING`, `MODIFY SETTING`
        - `ALTER MOVE PARTITION`。レベル: `TABLE`。エイリアス: `ALTER MOVE PART`, `MOVE PARTITION`, `MOVE PART`
        - `ALTER FETCH PARTITION`。レベル: `TABLE`。エイリアス: `ALTER FETCH PART`, `FETCH PARTITION`, `FETCH PART`
        - `ALTER FREEZE PARTITION`。レベル: `TABLE`。エイリアス: `FREEZE PARTITION`
    - `ALTER VIEW` レベル: `GROUP`
        - `ALTER VIEW REFRESH`。レベル: `VIEW`。エイリアス: `ALTER LIVE VIEW REFRESH`, `REFRESH VIEW`
        - `ALTER VIEW MODIFY QUERY`。レベル: `VIEW`。エイリアス: `ALTER TABLE MODIFY QUERY`
        - `ALTER VIEW MODIFY SQL SECURITY`。レベル: `VIEW`。エイリアス: `ALTER TABLE MODIFY SQL SECURITY`

この階層がどのように扱われるかの例：

- `ALTER` 権限は他のすべての `ALTER*` 権限を含みます。
- `ALTER CONSTRAINT` は `ALTER ADD CONSTRAINT` および `ALTER DROP CONSTRAINT` 権限を含みます。

**注意点**

- `MODIFY SETTING` 権限は、テーブルエンジン設定を変更することを許可します。サーバー設定や構成パラメーターには影響しません。
- `ATTACH` 操作には [CREATE](#create) 権限が必要です。
- `DETACH` 操作には [DROP](#drop) 権限が必要です。
- [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation) クエリによるミューテーションの停止には、このミューテーションを開始するための権限が必要です。たとえば、`ALTER UPDATE` クエリを停止するには、`ALTER UPDATE`、`ALTER TABLE`、または `ALTER` 権限が必要です。

### BACKUP {#backup}

[`BACKUP`] クエリを実行することを許可します。バックアップに関する詳細は ["バックアップと復元"](../../operations/backup.md) を参照してください。

### CREATE {#create}

[CREATE](../../sql-reference/statements/create/index.md) および [ATTACH](../../sql-reference/statements/attach.md) DDLクエリを実行することを許可します。以下の権限の階層に従います：

- `CREATE`。レベル: `GROUP`
    - `CREATE DATABASE`。レベル: `DATABASE`
    - `CREATE TABLE`。レベル: `TABLE`
        - `CREATE ARBITRARY TEMPORARY TABLE`。レベル: `GLOBAL`
            - `CREATE TEMPORARY TABLE`。レベル: `GLOBAL`
    - `CREATE VIEW`。レベル: `VIEW`
    - `CREATE DICTIONARY`。レベル: `DICTIONARY`

**注意点**

- 作成したテーブルを削除するには、ユーザーは [DROP](#drop) 権限が必要です。

### CLUSTER {#cluster}

`ON CLUSTER` クエリを実行することを許可します。

```sql title="構文"
GRANT CLUSTER ON *.* TO <username>
```

デフォルトでは、`ON CLUSTER` を含むクエリにはユーザーが `CLUSTER` 権限を持っている必要があります。  
最初に `CLUSTER` 権限を付与せずに `ON CLUSTER` を使用しようとすると、次のエラーが表示されます：

```text
権限が不足しています。このクエリを実行するには、*.* に対する CLUSTER 権限を持っている必要があります。
```

デフォルトの動作は、`config.xml` の `access_control_improvements` セクションにある `on_cluster_queries_require_cluster_grant` 設定を `false` に設定することで変更できます。

```yaml title="config.xml"
<access_control_improvements>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```

### DROP {#drop}

[DROP](../../sql-reference/statements/drop.md) および [DETACH](../../sql-reference/statements/detach.md) クエリを実行することを許可します。以下の権限の階層に従います：

- `DROP`。レベル: `GROUP`
    - `DROP DATABASE`。レベル: `DATABASE`
    - `DROP TABLE`。レベル: `TABLE`
    - `DROP VIEW`。レベル: `VIEW`
    - `DROP DICTIONARY`。レベル: `DICTIONARY`

### TRUNCATE {#truncate}

[TRUNCATE](../../sql-reference/statements/truncate.md) クエリを実行することを許可します。

権限レベル: `TABLE`。

### OPTIMIZE {#optimize}

[OPTIMIZE TABLE](../../sql-reference/statements/optimize.md) クエリを実行することを許可します。

権限レベル: `TABLE`。

### SHOW {#show}

`SHOW`、`DESCRIBE`、`USE`、および `EXISTS` クエリを実行することを許可します。以下の権限の階層に従います：

- `SHOW`。レベル: `GROUP`
    - `SHOW DATABASES`。レベル: `DATABASE`。`SHOW DATABASES`、`SHOW CREATE DATABASE`、`USE <database>` クエリを実行できます。
    - `SHOW TABLES`。レベル: `TABLE`。`SHOW TABLES`、`EXISTS <table>`、`CHECK <table>` クエリを実行できます。
    - `SHOW COLUMNS`。レベル: `COLUMN`。`SHOW CREATE TABLE`、`DESCRIBE` クエリを実行できます。
    - `SHOW DICTIONARIES`。レベル: `DICTIONARY`。`SHOW DICTIONARIES`、`SHOW CREATE DICTIONARY`、`EXISTS <dictionary>` クエリを実行できます。

**注意点**

ユーザーは、指定されたテーブル、辞書、またはデータベースに関する他の権限を持っている場合、そのユーザーは `SHOW` 権限を持っています。

### KILL QUERY {#kill-query}

[KILL](../../sql-reference/statements/kill.md#kill-query) クエリを実行することを許可します。以下の権限の階層に従います：

権限レベル: `GLOBAL`。

**注意点**

`KILL QUERY` 権限により、1 人のユーザーが他のユーザーのクエリを停止できます。

### ACCESS MANAGEMENT {#access-management}

ユーザーがユーザー、ロール、および行ポリシーを管理するクエリを実行できるようにします。

- `ACCESS MANAGEMENT`。レベル: `GROUP`
    - `CREATE USER`。レベル: `GLOBAL`
    - `ALTER USER`。レベル: `GLOBAL`
    - `DROP USER`。レベル: `GLOBAL`
    - `CREATE ROLE`。レベル: `GLOBAL`
    - `ALTER ROLE`。レベル: `GLOBAL`
    - `DROP ROLE`。レベル: `GLOBAL`
    - `ROLE ADMIN`。レベル: `GLOBAL`
    - `CREATE ROW POLICY`。レベル: `GLOBAL`。エイリアス: `CREATE POLICY`
    - `ALTER ROW POLICY`。レベル: `GLOBAL`。エイリアス: `ALTER POLICY`
    - `DROP ROW POLICY`。レベル: `GLOBAL`。エイリアス: `DROP POLICY`
    - `CREATE QUOTA`。レベル: `GLOBAL`
    - `ALTER QUOTA`。レベル: `GLOBAL`
    - `DROP QUOTA`。レベル: `GLOBAL`
    - `CREATE SETTINGS PROFILE`。レベル: `GLOBAL`。エイリアス: `CREATE PROFILE`
    - `ALTER SETTINGS PROFILE`。レベル: `GLOBAL`。エイリアス: `ALTER PROFILE`
    - `DROP SETTINGS PROFILE`。レベル: `GLOBAL`。エイリアス: `DROP PROFILE`
    - `SHOW ACCESS`。レベル: `GROUP`
        - `SHOW_USERS`。レベル: `GLOBAL`。エイリアス: `SHOW CREATE USER`
        - `SHOW_ROLES`。レベル: `GLOBAL`。エイリアス: `SHOW CREATE ROLE`
        - `SHOW_ROW_POLICIES`。レベル: `GLOBAL`。エイリアス: `SHOW POLICIES`、`SHOW CREATE ROW POLICY`、`SHOW CREATE POLICY`
        - `SHOW_QUOTAS`。レベル: `GLOBAL`。エイリアス: `SHOW CREATE QUOTA`
        - `SHOW_SETTINGS_PROFILES`。レベル: `GLOBAL`。エイリアス: `SHOW PROFILES`、`SHOW CREATE SETTINGS PROFILE`、`SHOW CREATE PROFILE`
    - `ALLOW SQL SECURITY NONE`。レベル: `GLOBAL`。エイリアス: `CREATE SQL SECURITY NONE`、`SQL SECURITY NONE`、`SECURITY NONE`

`ROLE ADMIN` 権限により、ユーザーは管理オプションで割り当てられていないロールを含むすべてのロールを割り当ておよび取り消すことができます。

### SYSTEM {#system}

ユーザーが [SYSTEM](../../sql-reference/statements/system.md) クエリを実行できるようにします。以下の権限の階層に従います。

- `SYSTEM`。レベル: `GROUP`
    - `SYSTEM SHUTDOWN`。レベル: `GLOBAL`。エイリアス: `SYSTEM KILL`、`SHUTDOWN`
    - `SYSTEM DROP CACHE`。エイリアス: `DROP CACHE`
        - `SYSTEM DROP DNS CACHE`。レベル: `GLOBAL`。エイリアス: `SYSTEM DROP DNS`、`DROP DNS CACHE`、`DROP DNS`
        - `SYSTEM DROP MARK CACHE`。レベル: `GLOBAL`।エイリアス: `SYSTEM DROP MARK`、`DROP MARK CACHE`、`DROP MARKS`
        - `SYSTEM DROP UNCOMPRESSED CACHE`。レベル: `GLOBAL`。エイリアス: `SYSTEM DROP UNCOMPRESSED`、`DROP UNCOMPRESSED CACHE`、`DROP UNCOMPRESSED`
    - `SYSTEM RELOAD`。レベル: `GROUP`
        - `SYSTEM RELOAD CONFIG`。レベル: `GLOBAL`。エイリアス: `RELOAD CONFIG`
        - `SYSTEM RELOAD DICTIONARY`。レベル: `GLOBAL`。エイリアス: `SYSTEM RELOAD DICTIONARIES`、`RELOAD DICTIONARY`、`RELOAD DICTIONARIES`
            - `SYSTEM RELOAD EMBEDDED DICTIONARIES`。レベル: `GLOBAL`。エイリアス: `RELOAD EMBEDDED DICTIONARIES`
    - `SYSTEM MERGES`。レベル: `TABLE`。エイリアス: `SYSTEM STOP MERGES`、`SYSTEM START MERGES`、`STOP MERGES`、`START MERGES`
    - `SYSTEM TTL MERGES`。レベル: `TABLE`。エイリアス: `SYSTEM STOP TTL MERGES`、`SYSTEM START TTL MERGES`、`STOP TTL MERGES`、`START TTL MERGES`
    - `SYSTEM FETCHES`。レベル: `TABLE`。エイリアス: `SYSTEM STOP FETCHES`、`SYSTEM START FETCHES`、`STOP FETCHES`、`START FETCHES`
    - `SYSTEM MOVES`。レベル: `TABLE`。エイリアス: `SYSTEM STOP MOVES`、`SYSTEM START MOVES`、`STOP MOVES`、`START MOVES`
    - `SYSTEM SENDS`。レベル: `GROUP`。エイリアス: `SYSTEM STOP SENDS`、`SYSTEM START SENDS`、`STOP SENDS`、`START SENDS`
        - `SYSTEM DISTRIBUTED SENDS`。レベル: `TABLE`。エイリアス: `SYSTEM STOP DISTRIBUTED SENDS`、`SYSTEM START DISTRIBUTED SENDS`、`STOP DISTRIBUTED SENDS`、`START DISTRIBUTED SENDS`
        - `SYSTEM REPLICATED SENDS`。レベル: `TABLE`。エイリアス: `SYSTEM STOP REPLICATED SENDS`、`SYSTEM START REPLICATED SENDS`、`STOP REPLICATED SENDS`、`START REPLICATED SENDS`
    - `SYSTEM REPLICATION QUEUES`。レベル: `TABLE`。エイリアス: `SYSTEM STOP REPLICATION QUEUES`、`SYSTEM START REPLICATION QUEUES`、`STOP REPLICATION QUEUES`、`START REPLICATION QUEUES`
    - `SYSTEM SYNC REPLICA`。レベル: `TABLE`。エイリアス: `SYNC REPLICA`
    - `SYSTEM RESTART REPLICA`。レベル: `TABLE`。エイリアス: `RESTART REPLICA`
    - `SYSTEM FLUSH`。レベル: `GROUP`
        - `SYSTEM FLUSH DISTRIBUTED`。レベル: `TABLE`。エイリアス: `FLUSH DISTRIBUTED`
        - `SYSTEM FLUSH LOGS`。レベル: `GLOBAL`。エイリアス: `FLUSH LOGS`

`SYSTEM RELOAD EMBEDDED DICTIONARIES` 権限は、`SYSTEM RELOAD DICTIONARY ON *.*` 権限で暗黙に付与されます。

### INTROSPECTION {#introspection}

[introspection](../../operations/optimizing-performance/sampling-query-profiler.md) 関数を使用することを許可します。

- `INTROSPECTION`。レベル: `GROUP`。エイリアス: `INTROSPECTION FUNCTIONS`
    - `addressToLine`。レベル: `GLOBAL`
    - `addressToLineWithInlines`。レベル: `GLOBAL`
    - `addressToSymbol`。レベル: `GLOBAL`
    - `demangle`。レベル: `GLOBAL`

### SOURCES {#sources}

外部データソースを使用することを許可します。これは [テーブルエンジン](../../engines/table-engines/index.md) と [テーブル関数](../../sql-reference/table-functions/index.md#table-functions) に適用されます。

- `SOURCES`。レベル: `GROUP`
    - `AZURE`。レベル: `GLOBAL`
    - `FILE`。レベル: `GLOBAL`
    - `HDFS`。レベル: `GLOBAL`
    - `HIVE`。レベル: `GLOBAL`
    - `JDBC`。レベル: `GLOBAL`
    - `KAFKA`。レベル: `GLOBAL`
    - `MONGO`。レベル: `GLOBAL`
    - `MYSQL`。レベル: `GLOBAL`
    - `NATS`。レベル: `GLOBAL`
    - `ODBC`。レベル: `GLOBAL`
    - `POSTGRES`。レベル: `GLOBAL`
    - `RABBITMQ`。レベル: `GLOBAL`
    - `REDIS`。レベル: `GLOBAL`
    - `REMOTE`。レベル: `GLOBAL`
    - `S3`。レベル: `GLOBAL`
    - `SQLITE`。レベル: `GLOBAL`
    - `URL`。レベル: `GLOBAL`

`SOURCES` 権限は、すべてのソースの使用を可能にします。また、各ソースごとに個別に権限を付与することもできます。ソースを使用するには、追加の権限が必要です。

例：

- [MySQL テーブルエンジン](../../engines/table-engines/integrations/mysql.md) を使用してテーブルを作成するには、`CREATE TABLE (ON db.table_name)` および `MYSQL` 権限が必要です。
- [mysql テーブル関数](../../sql-reference/table-functions/mysql.md) を使用するには、`CREATE TEMPORARY TABLE` および `MYSQL` 権限が必要です。

### dictGet {#dictget}

- `dictGet`。エイリアス: `dictHas`、`dictGetHierarchy`、`dictIsIn`

ユーザーが [dictGet](../../sql-reference/functions/ext-dict-functions.md#dictget)、[dictHas](../../sql-reference/functions/ext-dict-functions.md#dicthas)、[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)、[dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictisin) 関数を実行できるようにします。

権限レベル: `DICTIONARY`。

**例**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`


### displaySecretsInShowAndSelect {#displaysecretsinshowandselect}

ユーザーが `SHOW` および `SELECT` クエリで秘密情報を表示できるようにします。これには、両方の [`display_secrets_in_show_and_select` サーバー設定](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select) および [`format_display_secrets_in_show_and_select` 形式設定](../../operations/settings/formats#format_display_secrets_in_show_and_select) が有効である必要があります。


### NAMED COLLECTION ADMIN {#named-collection-admin}

指定された名前付きコレクションに対して特定の操作を許可します。バージョン 23.7 以前は、NAMED COLLECTION CONTROL と呼ばれ、23.7 以降 NAMED COLLECTION ADMIN が追加され、NAMED COLLECTION CONTROL はエイリアスとして保存されています。

- `NAMED COLLECTION ADMIN`。レベル: `NAMED_COLLECTION`。エイリアス: `NAMED COLLECTION CONTROL`
- `CREATE NAMED COLLECTION`。レベル: `NAMED_COLLECTION`
- `DROP NAMED COLLECTION`。レベル: `NAMED_COLLECTION`
- `ALTER NAMED COLLECTION`。レベル: `NAMED_COLLECTION`
- `SHOW NAMED COLLECTIONS`。レベル: `NAMED_COLLECTION`。エイリアス: `SHOW NAMED COLLECTIONS`
- `SHOW NAMED COLLECTIONS SECRETS`。レベル: `NAMED_COLLECTION`。エイリアス: `SHOW NAMED COLLECTIONS SECRETS`
- `NAMED COLLECTION`. レベル: `NAMED_COLLECTION`. エイリアス: `NAMED COLLECTION USAGE, USE NAMED COLLECTION`

他のすべての権限（CREATE, DROP, ALTER, SHOW）とは異なり、NAMED COLLECTIONの権限は23.7で新たに追加されましたが、他の権限はすべて22.12で追加されました。

**例**

命名されたコレクションがabcと呼ばれていると仮定し、ユーザーjohnにCREATE NAMED COLLECTION権限を付与します。
- `GRANT CREATE NAMED COLLECTION ON abc TO john`


### テーブルエンジン {#table-engine}

テーブルを作成する際に指定されたテーブルエンジンを使用することを許可します。これは[テーブルエンジン](../../engines/table-engines/index.md)に適用されます。

**例**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`


### ALL {#all}

<CloudNotSupportedBadge/>

規制対象のエンティティに対するすべての権限をユーザーアカウントまたはロールに付与します。

:::note
`ALL`権限はClickHouse Cloudではサポートされておらず、`default`ユーザーは制限された権限を持っています。ユーザーは`default_role`を付与することでユーザーに最大限の権限を付与できます。詳細については[こちら](/cloud/security/cloud-access-management#initial-settings)をご覧ください。
ユーザーは`GRANT CURRENT GRANTS`をデフォルトユーザーとして使用することで、`ALL`と同様の効果を達成することもできます。
:::

### NONE {#none}

いかなる権限も付与しません。

### ADMIN OPTION {#admin-option}

`ADMIN OPTION`権限は、ユーザーが自分の役割を他のユーザーに付与することを許可します。
