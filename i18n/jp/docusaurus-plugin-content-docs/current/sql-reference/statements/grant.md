---
description: 'GRANTステートメントのドキュメント'
sidebar_label: 'GRANT'
sidebar_position: 38
slug: /sql-reference/statements/grant
title: 'GRANTステートメント'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# GRANTステートメント

- ClickHouseユーザーアカウントまたはロールに[特権](#privileges)を付与します。
- ユーザーアカウントまたは他のロールにロールを割り当てます。

特権を取り消すには、[REVOKE](../../sql-reference/statements/revoke.md)ステートメントを使用します。また、付与された特権のリストは[SHOW GRANTS](../../sql-reference/statements/show.md#show-grants)ステートメントで表示できます。

## 特権付与構文 {#granting-privilege-syntax}

```sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — 特権の種類。
- `role` — ClickHouseユーザーロール。
- `user` — ClickHouseユーザーアカウント。

`WITH GRANT OPTION`句は、`user`または`role`に`GRANT`クエリを実行する権限を付与します。ユーザーは自分が持つのと同じ範囲またはそれ以下の特権を付与できます。  
`WITH REPLACE OPTION`句は、指定されていない場合、`user`または`role`の古い特権を新しい特権に置き換えます。

## ロール割り当て構文 {#assigning-role-syntax}

```sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

- `role` — ClickHouseユーザーロール。
- `user` — ClickHouseユーザーアカウント。

`WITH ADMIN OPTION`句は、`user`または`role`に[ADMIN OPTION](#admin-option)特権を付与します。  
`WITH REPLACE OPTION`句は、指定されていない場合、`user`または`role`の古いロールを新しいロールに置き換えます。

## 現在の特権付与構文 {#grant-current-grants-syntax}

```sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

-   `privilege` — 特権の種類。
-   `role` — ClickHouseユーザーロール。
-   `user` — ClickHouseユーザーアカウント。

`CURRENT GRANTS`ステートメントを使用すると、指定された特権を指定されたユーザーまたはロールに付与できます。  
特権が指定されていない場合、指定されたユーザーまたはロールは、`CURRENT_USER`のすべての利用可能な特権を受け取ります。

## 使用法 {#usage}

`GRANT`を使用するには、あなたのアカウントに`GRANT OPTION`特権が必要です。あなたは、自分のアカウント特権の範囲内でのみ特権を付与できます。

例えば、管理者は以下のクエリで`john`アカウントに特権を付与しました：

```sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

これは、`john`が以下のクエリを実行する権限を持つことを意味します：

- `SELECT x,y FROM db.table`。
- `SELECT x FROM db.table`。
- `SELECT y FROM db.table`。

`john`は`SELECT z FROM db.table`を実行できません。また`SELECT * FROM db.table`も利用できません。このクエリを処理すると、ClickHouseはデータを返さず、`x`と`y`でさえも返しません。例外は、テーブルが`x`と`y`のカラムのみを含む場合です。この場合、ClickHouseはすべてのデータを返します。

また、`john`は`GRANT OPTION`特権を持っているため、同じかそれ以下の範囲の特権を他のユーザーに付与できます。

`system`データベースへのアクセスは常に許可されています（このデータベースはクエリ処理に使用されます）。

1回のクエリで複数のアカウントに複数の特権を付与できます。クエリ`GRANT SELECT, INSERT ON *.* TO john, robin`は、アカウント`john`と`robin`がサーバー上のすべてのデータベースのすべてのテーブルで`INSERT`および`SELECT`クエリを実行できることを許可します。

## ワイルドカード付与 {#wildcard-grants}

特権を指定する際に、アスタリスク（`*`）をテーブルまたはデータベース名の代わりに使用できます。例えば、`GRANT SELECT ON db.* TO john`クエリは、`john`が`db`データベース内のすべてのテーブルで`SELECT`クエリを実行することを許可します。  
また、データベース名を省略することもできます。この場合、特権は現在のデータベースに対して付与されます。  
例えば、`GRANT SELECT ON * TO john`は、現在のデータベース内のすべてのテーブルに対して特権を付与し、`GRANT SELECT ON mytable TO john`は、現在のデータベースの`mytable`テーブルに対して特権を付与します。

:::note
以下の機能は、24.10のClickHouseバージョンから利用可能です。
:::

テーブルまたはデータベース名の末尾にアスタリスクを付けることもできます。この機能により、テーブルのパスの抽象的なプレフィックスに特権を付与できます。  
例：`GRANT SELECT ON db.my_tables* TO john`。このクエリは、`john`が`my_tables*`プレフィックスを持つすべての`db`データベースのテーブルで`SELECT`クエリを実行できるようにします。

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

付与されたパス内に新しく作成されたすべてのテーブルは、自動的に親からのすべての付与を継承します。  
例えば、`GRANT SELECT ON db.* TO john`クエリを実行してから新しいテーブル`db.new_table`を作成すると、ユーザー`john`は`SELECT * FROM db.new_table`クエリを実行できます。

プレフィックスに対してのみアスタリスクを指定できます：
```sql
GRANT SELECT ON db.* TO john -- correct
GRANT SELECT ON db*.* TO john -- correct

GRANT SELECT ON *.my_table TO john -- wrong
GRANT SELECT ON foo*bar TO john -- wrong
GRANT SELECT ON *suffix TO john -- wrong
GRANT SELECT(foo) ON db.table* TO john -- wrong
```

## 特権 {#privileges}

特権とは、ユーザーが特定の種類のクエリを実行するための許可です。

特権は階層構造を持っており、許可されるクエリのセットは特権の範囲によって異なります。

ClickHouseにおける特権の階層は以下の通りです：

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

この階層がどのように扱われるかの例：

- `ALTER`特権は、他のすべての`ALTER*`特権を含みます。
- `ALTER CONSTRAINT`は、`ALTER ADD CONSTRAINT`および`ALTER DROP CONSTRAINT`特権を含みます。

特権は異なるレベルで適用されます。特定のレベルを知ることで、特権のために利用可能な構文を示唆します。

レベル（低いものから高いものへ）：

- `COLUMN` — 特権はカラム、テーブル、データベース、または全体に対して付与できます。
- `TABLE` — 特権はテーブル、データベース、または全体に対して付与できます。
- `VIEW` — 特権はビュー、データベース、または全体に対して付与できます。
- `DICTIONARY` — 特権は辞書、データベース、または全体に対して付与できます。
- `DATABASE` — 特権はデータベースまたは全体に対して付与できます。
- `GLOBAL` — 特権は全体にのみ付与できます。
- `GROUP` — 異なるレベルの特権をグループ化します。`GROUP`レベルの特権が付与されると、使用された構文に対応するグループからの特権のみが付与されます。

許可される構文の例：

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

許可されない構文の例：

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

特別な特権[ALL](#all)は、ユーザーアカウントまたはロールにすべての特権を付与します。

デフォルトでは、ユーザーアカウントまたはロールには特権がありません。

ユーザーまたはロールに特権がない場合、それは[NONE](#none)特権として表示されます。

一部のクエリは、その実装によって特権のセットを要求します。例えば、[RENAME](../../sql-reference/statements/optimize.md)クエリを実行するには、次の特権が必要です：`SELECT`、`CREATE TABLE`、`INSERT`、および`DROP TABLE`。

### SELECT {#select}

[SELECT](../../sql-reference/statements/select/index.md)クエリを実行することを許可します。

特権レベル：`COLUMN`。

**説明**

この特権が付与されたユーザーは、指定されたテーブルとデータベースの指定されたカラムのリストに対して`SELECT`クエリを実行できます。ユーザーが他のカラムを含めると、指定されたクエリはデータを返しません。

以下の特権を考慮してください：

```sql
GRANT SELECT(x,y) ON db.table TO john
```

この特権は、`john`が`db.table`の`x`および/または`y`カラムのデータを含む任意の`SELECT`クエリを実行できることを許可します。例えば、`SELECT x FROM db.table`。`john`は`SELECT z FROM db.table`を実行できません。`SELECT * FROM db.table`も利用できません。このクエリを処理すると、ClickHouseはデータを返さず、`x`と`y`でさえも返しません。例外は、テーブルが`x`と`y`カラムのみを含む場合です。この場合、ClickHouseはすべてのデータを返します。

### INSERT {#insert}

[INSERT](../../sql-reference/statements/insert-into.md)クエリを実行することを許可します。

特権レベル：`COLUMN`。

**説明**

この特権が付与されたユーザーは、指定されたテーブルとデータベース内の指定されたカラムのリストに対して`INSERT`クエリを実行できます。ユーザーが他のカラムを含めると、指定されたクエリはデータを挿入しません。

**例**

```sql
GRANT INSERT(x,y) ON db.table TO john
```

付与された特権は、`john`が`db.table`の`x`および/または`y`カラムにデータを挿入できることを許可します。

### ALTER {#alter}

次の特権の階層に従って、[ALTER](../../sql-reference/statements/alter/index.md)クエリを実行することを許可します：

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
    - `ALTER VIEW` レベル: `GROUP`
        - `ALTER VIEW REFRESH`。レベル：`VIEW`。エイリアス：`ALTER LIVE VIEW REFRESH`、`REFRESH VIEW`
        - `ALTER VIEW MODIFY QUERY`。レベル：`VIEW`。エイリアス：`ALTER TABLE MODIFY QUERY`
        - `ALTER VIEW MODIFY SQL SECURITY`。レベル：`VIEW`。エイリアス：`ALTER TABLE MODIFY SQL SECURITY`

この階層がどのように扱われるかの例：

- `ALTER`特権は、他のすべての`ALTER*`特権を含みます。
- `ALTER CONSTRAINT`は、`ALTER ADD CONSTRAINT`および`ALTER DROP CONSTRAINT`特権を含みます。

**注**

- `MODIFY SETTING`特権は、テーブルエンジンの設定を変更できます。設定やサーバー構成パラメータには影響しません。
- `ATTACH`操作には[CREATE](#create)特権が必要です。
- `DETACH`操作には[DROP](#drop)特権が必要です。
- [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation)クエリによって変異を停止するには、この変異を開始する特権が必要です。例えば、`ALTER UPDATE`クエリを停止したい場合は、`ALTER UPDATE`、`ALTER TABLE`、または`ALTER`特権が必要です。

### BACKUP {#backup}

[`BACKUP`](../../sql-reference/statements/backup.md)クエリの実行を許可します。バックアップに関する詳細は["バックアップと復元"](../../operations/backup.md)を参照してください。

### CREATE {#create}

次の特権の階層に従って、[CREATE](../../sql-reference/statements/create/index.md)および[ATTACH](../../sql-reference/statements/attach.md) DDLクエリを実行することを許可します：

- `CREATE`。レベル：`GROUP`
    - `CREATE DATABASE`。レベル：`DATABASE`
    - `CREATE TABLE`。レベル：`TABLE`
        - `CREATE ARBITRARY TEMPORARY TABLE`。レベル：`GLOBAL`
            - `CREATE TEMPORARY TABLE`。レベル：`GLOBAL`
    - `CREATE VIEW`。レベル：`VIEW`
    - `CREATE DICTIONARY`。レベル：`DICTIONARY`

**注**

- 作成されたテーブルを削除するには、ユーザーは[DROP](#drop)特権が必要です。

### CLUSTER {#cluster}

`ON CLUSTER`クエリを実行することを許可します。

```sql title="構文"
GRANT CLUSTER ON *.* TO <username>
```

デフォルトでは、`ON CLUSTER`を含むクエリには、ユーザーが`CLUSTER`特権を持っている必要があります。  
`CLUSTER`特権を最初に付与せずに`ON CLUSTER`をクエリ内で使おうとすると、次のエラーが表示されます：

```text
十分な特権がありません。このクエリを実行するには、*.*でのCLUSTERの付与が必要です。
```

デフォルトの動作は、`on_cluster_queries_require_cluster_grant`設定を設定することで変更できます。この設定は、`config.xml`の`access_control_improvements`セクションにあります（以下を参照）。

```yaml title="config.xml"
<access_control_improvements>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```

### DROP {#drop}

次の特権の階層に従って、[DROP](../../sql-reference/statements/drop.md)および[DETACH](../../sql-reference/statements/detach.md)クエリを実行することを許可します：

- `DROP`。レベル：`GROUP`
    - `DROP DATABASE`。レベル：`DATABASE`
    - `DROP TABLE`。レベル：`TABLE`
    - `DROP VIEW`。レベル：`VIEW`
    - `DROP DICTIONARY`。レベル：`DICTIONARY`

### TRUNCATE {#truncate}

[TRUNCATE](../../sql-reference/statements/truncate.md)クエリを実行することを許可します。

特権レベル：`TABLE`。

### OPTIMIZE {#optimize}

[OPTIMIZE TABLE](../../sql-reference/statements/optimize.md)クエリを実行することを許可します。

特権レベル：`TABLE`。

### SHOW {#show}

`SHOW`、`DESCRIBE`、`USE`、および`EXISTS`クエリを次の特権の階層に従って実行することを許可します：

- `SHOW`。レベル：`GROUP`
    - `SHOW DATABASES`。レベル：`DATABASE`。`SHOW DATABASES`、`SHOW CREATE DATABASE`、`USE <database>`クエリを実行することを許可します。
    - `SHOW TABLES`。レベル：`TABLE`。`SHOW TABLES`、`EXISTS <table>`、`CHECK <table>`クエリを実行することを許可します。
    - `SHOW COLUMNS`。レベル：`COLUMN`。`SHOW CREATE TABLE`、`DESCRIBE`クエリを実行することを許可します。
    - `SHOW DICTIONARIES`。レベル：`DICTIONARY`。`SHOW DICTIONARIES`、`SHOW CREATE DICTIONARY`、`EXISTS <dictionary>`クエリを実行することを許可します。

**注**

ユーザーは、指定されたテーブル、辞書、またはデータベースに関する他の特権を持つ場合、`SHOW`特権を持っています。

### KILL QUERY {#kill-query}

[キル](../../sql-reference/statements/kill.md#kill-query)クエリを実行することを許可します。

特権レベル：`GLOBAL`。

**注**

`KILL QUERY`特権により、1人のユーザーが他のユーザーのクエリを停止できます。

### アクセス管理 {#access-management}

ユーザーがユーザー、ロール、および行ポリシーを管理するクエリを実行することを許可します。

- `ACCESS MANAGEMENT`。レベル：`GROUP`
    - `CREATE USER`。レベル：`GLOBAL`
    - `ALTER USER`。レベル：`GLOBAL`
    - `DROP USER`。レベル：`GLOBAL`
    - `CREATE ROLE`。レベル：`GLOBAL`
    - `ALTER ROLE`。レベル：`GLOBAL`
    - `DROP ROLE`。レベル：`GLOBAL`
    - `ROLE ADMIN`。レベル：`GLOBAL`
    - `CREATE ROW POLICY`。レベル：`GLOBAL`。エイリアス：`CREATE POLICY`
    - `ALTER ROW POLICY`。レベル：`GLOBAL`。エイリアス：`ALTER POLICY`
    - `DROP ROW POLICY`。レベル：`GLOBAL`。エイリアス：`DROP POLICY`
    - `CREATE QUOTA`。レベル：`GLOBAL`
    - `ALTER QUOTA`。レベル：`GLOBAL`
    - `DROP QUOTA`。レベル：`GLOBAL`
    - `CREATE SETTINGS PROFILE`。レベル：`GLOBAL`。エイリアス：`CREATE PROFILE`
    - `ALTER SETTINGS PROFILE`。レベル：`GLOBAL`。エイリアス：`ALTER PROFILE`
    - `DROP SETTINGS PROFILE`。レベル：`GLOBAL`。エイリアス：`DROP PROFILE`
    - `SHOW ACCESS`。レベル：`GROUP`
        - `SHOW_USERS`。レベル：`GLOBAL`。エイリアス：`SHOW CREATE USER`
        - `SHOW_ROLES`。レベル：`GLOBAL`。エイリアス：`SHOW CREATE ROLE`
        - `SHOW_ROW_POLICIES`。レベル：`GLOBAL`。エイリアス：`SHOW POLICIES`、`SHOW CREATE ROW POLICY`、`SHOW CREATE POLICY`
        - `SHOW_QUOTAS`。レベル：`GLOBAL`。エイリアス：`SHOW CREATE QUOTA`
        - `SHOW_SETTINGS_PROFILES`。レベル：`GLOBAL`。エイリアス：`SHOW PROFILES`、`SHOW CREATE SETTINGS PROFILE`、`SHOW CREATE PROFILE`
    - `ALLOW SQL SECURITY NONE`。レベル：`GLOBAL`。エイリアス：`CREATE SQL SECURITY NONE`、`SQL SECURITY NONE`、`SECURITY NONE`

`ROLE ADMIN`特権は、ユーザーが管理オプションで割り当てまたは取り消すすべてのロールを操作することを許可します。

### SYSTEM {#system}

ユーザーが[SYSTEM](../../sql-reference/statements/system.md)クエリを実行することを許可します。

- `SYSTEM`。レベル：`GROUP`
    - `SYSTEM SHUTDOWN`。レベル：`GLOBAL`。エイリアス：`SYSTEM KILL`、`SHUTDOWN`
    - `SYSTEM DROP CACHE`。エイリアス：`DROP CACHE`
        - `SYSTEM DROP DNS CACHE`。レベル：`GLOBAL`。エイリアス：`SYSTEM DROP DNS`、`DROP DNS CACHE`、`DROP DNS`
        - `SYSTEM DROP MARK CACHE`。レベル：`GLOBAL`。エイリアス：`SYSTEM DROP MARK`、`DROP MARK CACHE`、`DROP MARKS`
        - `SYSTEM DROP UNCOMPRESSED CACHE`。レベル：`GLOBAL`。エイリアス：`SYSTEM DROP UNCOMPRESSED`、`DROP UNCOMPRESSED CACHE`、`DROP UNCOMPRESSED`
    - `SYSTEM RELOAD`。レベル：`GROUP`
        - `SYSTEM RELOAD CONFIG`。レベル：`GLOBAL`。エイリアス：`RELOAD CONFIG`
        - `SYSTEM RELOAD DICTIONARY`。レベル：`GLOBAL`。エイリアス：`SYSTEM RELOAD DICTIONARIES`、`RELOAD DICTIONARY`、`RELOAD DICTIONARIES`
            - `SYSTEM RELOAD EMBEDDED DICTIONARIES`。レベル：`GLOBAL`。エイリアス：`RELOAD EMBEDDED DICTIONARIES`
    - `SYSTEM MERGES`。レベル：`TABLE`。エイリアス：`SYSTEM STOP MERGES`、`SYSTEM START MERGES`、`STOP MERGES`、`START MERGES`
    - `SYSTEM TTL MERGES`。レベル：`TABLE`。エイリアス：`SYSTEM STOP TTL MERGES`、`SYSTEM START TTL MERGES`、`STOP TTL MERGES`、`START TTL MERGES`
    - `SYSTEM FETCHES`。レベル：`TABLE`。エイリアス：`SYSTEM STOP FETCHES`、`SYSTEM START FETCHES`、`STOP FETCHES`、`START FETCHES`
    - `SYSTEM MOVES`。レベル：`TABLE`。エイリアス：`SYSTEM STOP MOVES`、`SYSTEM START MOVES`、`STOP MOVES`、`START MOVES`
    - `SYSTEM SENDS`。レベル：`GROUP`。エイリアス：`SYSTEM STOP SENDS`、`SYSTEM START SENDS`、`STOP SENDS`、`START SENDS`
        - `SYSTEM DISTRIBUTED SENDS`。レベル：`TABLE`。エイリアス：`SYSTEM STOP DISTRIBUTED SENDS`、`SYSTEM START DISTRIBUTED SENDS`、`STOP DISTRIBUTED SENDS`、`START DISTRIBUTED SENDS`
        - `SYSTEM REPLICATED SENDS`。レベル：`TABLE`。エイリアス：`SYSTEM STOP REPLICATED SENDS`、`SYSTEM START REPLICATED SENDS`、`STOP REPLICATED SENDS`、`START REPLICATED SENDS`
    - `SYSTEM REPLICATION QUEUES`。レベル：`TABLE`。エイリアス：`SYSTEM STOP REPLICATION QUEUES`、`SYSTEM START REPLICATION QUEUES`、`STOP REPLICATION QUEUES`、`START REPLICATION QUEUES`
    - `SYSTEM SYNC REPLICA`。レベル：`TABLE`。エイリアス：`SYNC REPLICA`
    - `SYSTEM RESTART REPLICA`。レベル：`TABLE`。エイリアス：`RESTART REPLICA`
    - `SYSTEM FLUSH`。レベル：`GROUP`
        - `SYSTEM FLUSH DISTRIBUTED`。レベル：`TABLE`。エイリアス：`FLUSH DISTRIBUTED`
        - `SYSTEM FLUSH LOGS`。レベル：`GLOBAL`。エイリアス：`FLUSH LOGS`

`SYSTEM RELOAD EMBEDDED DICTIONARIES`特権は、`SYSTEM RELOAD DICTIONARY ON *.*`特権によって暗黙的に付与されます。

### INTROSPECTION {#introspection}

[インタロスペクション](../../operations/optimizing-performance/sampling-query-profiler.md)関数を使用することを許可します。

- `INTROSPECTION`。レベル：`GROUP`。エイリアス：`INTROSPECTION FUNCTIONS`
    - `addressToLine`。レベル：`GLOBAL`
    - `addressToLineWithInlines`。レベル：`GLOBAL`
    - `addressToSymbol`。レベル：`GLOBAL`
    - `demangle`。レベル：`GLOBAL`

### SOURCES {#sources}

外部データソースを使用することを許可します。[テーブルエンジン](../../engines/table-engines/index.md)や[テーブル関数](/sql-reference/table-functions)に適用されます。

- `SOURCES`。レベル：`GROUP`
    - `AZURE`。レベル：`GLOBAL`
    - `FILE`。レベル：`GLOBAL`
    - `HDFS`。レベル：`GLOBAL`
    - `HIVE`。レベル：`GLOBAL`
    - `JDBC`。レベル：`GLOBAL`
    - `KAFKA`。レベル：`GLOBAL`
    - `MONGO`。レベル：`GLOBAL`
    - `MYSQL`。レベル：`GLOBAL`
    - `NATS`。レベル：`GLOBAL`
    - `ODBC`。レベル：`GLOBAL`
    - `POSTGRES`。レベル：`GLOBAL`
    - `RABBITMQ`。レベル：`GLOBAL`
    - `REDIS`。レベル：`GLOBAL`
    - `REMOTE`。レベル：`GLOBAL`
    - `S3`。レベル：`GLOBAL`
    - `SQLITE`。レベル：`GLOBAL`
    - `URL`。レベル：`GLOBAL`

`SOURCES`特権を使用すると、すべてのソースを使用できます。また、各ソースの特権を個別に付与することもできます。ソースを使用するには、追加の特権が必要です。

例：

- [MySQLテーブルエンジン](../../engines/table-engines/integrations/mysql.md)でテーブルを作成するには、`CREATE TABLE (ON db.table_name)`および`MYSQL`特権が必要です。
- [mysqlテーブル関数](../../sql-reference/table-functions/mysql.md)を使用するには、`CREATE TEMPORARY TABLE`および`MYSQL`特権が必要です。

### dictGet {#dictget}

- `dictGet`。エイリアス：`dictHas`、`dictGetHierarchy`、`dictIsIn`

ユーザーが[dictGet](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)、[dictHas](../../sql-reference/functions/ext-dict-functions.md#dicthas)、[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)、[dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictisin)関数を実行できるようにします。

特権レベル：`DICTIONARY`。

**例**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`

### displaySecretsInShowAndSelect {#displaysecretsinshowandselect}

ユーザーが`SHOW`および`SELECT`クエリ内の秘密を表示できるようにします（両方の [`display_secrets_in_show_and_select` サーバー設定](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select) と [`format_display_secrets_in_show_and_select` format setting](../../operations/settings/formats#format_display_secrets_in_show_and_select) がオンになっている場合）。


### NAMED COLLECTION ADMIN {#named-collection-admin}

指定された名前付きコレクションに対して特定の操作を許可します。バージョン 23.7 より前は NAMED COLLECTION CONTROL と呼ばれており、23.7 後に NAMED COLLECTION ADMIN が追加され、NAMED COLLECTION CONTROL は別名として保持されています。

- `NAMED COLLECTION ADMIN`. レベル: `NAMED_COLLECTION`. 別名: `NAMED COLLECTION CONTROL`
    - `CREATE NAMED COLLECTION`. レベル: `NAMED_COLLECTION`
    - `DROP NAMED COLLECTION`. レベル: `NAMED_COLLECTION`
    - `ALTER NAMED COLLECTION`. レベル: `NAMED_COLLECTION`
    - `SHOW NAMED COLLECTIONS`. レベル: `NAMED_COLLECTION`. 別名: `SHOW NAMED COLLECTIONS`
    - `SHOW NAMED COLLECTIONS SECRETS`. レベル: `NAMED_COLLECTION`. 別名: `SHOW NAMED COLLECTIONS SECRETS`
    - `NAMED COLLECTION`. レベル: `NAMED_COLLECTION`. 別名: `NAMED COLLECTION USAGE, USE NAMED COLLECTION`

他のすべての権限 (CREATE, DROP, ALTER, SHOW) とは異なり、NAMED COLLECTION に対する権限は 23.7 で新たに追加されたものであり、他の全ては 22.12 より前に追加されています。

**例**

名前付きコレクションが abc と呼ばれていると仮定し、ユーザー john に CREATE NAMED COLLECTION の権限を付与します。
- `GRANT CREATE NAMED COLLECTION ON abc TO john`
### TABLE ENGINE {#table-engine}

テーブルを作成する際に指定されたテーブルエンジンを使用することを許可します。これは [テーブルエンジン](../../engines/table-engines/index.md) に適用されます。

**例**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`
### ALL {#all}

<CloudNotSupportedBadge/>

規制されたエンティティに対してすべての権限をユーザーアカウントまたはロールに付与します。

:::note
権限 `ALL` は ClickHouse Cloud ではサポートされていません。この環境では `default` ユーザーは限られた権限を持っています。ユーザーは `default_role` を付与することで他のユーザーに最大の権限を付与できます。詳細は [こちら](/cloud/security/cloud-access-management/overview#initial-settings) を参照してください。
ユーザーはまた、`GRANT CURRENT GRANTS` をデフォルトユーザーとして使用することで `ALL` に類似した効果を得ることができます。
:::
### NONE {#none}

いかなる権限も付与しません。
### ADMIN OPTION {#admin-option}

`ADMIN OPTION` 権限は、ユーザーが自身のロールを他のユーザーに付与することを許可します。
