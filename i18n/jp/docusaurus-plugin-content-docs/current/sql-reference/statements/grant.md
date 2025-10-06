---
'description': 'GRANT ステートメントに関するドキュメント'
'sidebar_label': 'GRANT'
'sidebar_position': 38
'slug': '/sql-reference/statements/grant'
'title': 'GRANT ステートメント'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# GRANT ステートメント

- [特権](#privileges) を ClickHouse ユーザーアカウントまたはロールに付与します。
- ユーザーアカウントまたは他のロールにロールを割り当てます。

特権を取り消すには、[REVOKE](../../sql-reference/statements/revoke.md) ステートメントを使用します。また、[SHOW GRANTS](../../sql-reference/statements/show.md#show-grants) ステートメントを使用して、付与された特権のリストを表示することもできます。

## 特権付与構文 {#granting-privilege-syntax}

```sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — 特権の種類。
- `role` — ClickHouse ユーザーのロール。
- `user` — ClickHouse ユーザーアカウント。

`WITH GRANT OPTION` 句は、`user` または `role` に `GRANT` クエリを実行する権限を付与します。ユーザーは、自分が持っているものと同じ範囲またはそれ以下の特権を付与できます。
`WITH REPLACE OPTION` 句は、指定されていない場合、`user` または `role` の古い特権を新しい特権で置き換えます。

## ロール割り当て構文 {#assigning-role-syntax}

```sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

- `role` — ClickHouse ユーザーのロール。
- `user` — ClickHouse ユーザーアカウント。

`WITH ADMIN OPTION` 句は、`user` または `role` に [ADMIN OPTION](#admin-option) の特権を付与します。
`WITH REPLACE OPTION` 句は、指定されていない場合、`user` または `role` の古いロールを新しいロールに置き換えます。

## 現在の特権付与構文 {#grant-current-grants-syntax}
```sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — 特権の種類。
- `role` — ClickHouse ユーザーのロール。
- `user` — ClickHouse ユーザーアカウント。

`CURRENT GRANTS` ステートメントを使用すると、指定されたユーザーまたはロールにすべての特権を付与できます。
特権が指定されていない場合、そのユーザーまたはロールは `CURRENT_USER` に対してすべての利用可能な特権を受け取ります。

## 使用法 {#usage}

`GRANT` を使用するには、アカウントに `GRANT OPTION` の特権が必要です。ユーザーは、自分のアカウントの特権の範囲内でのみ特権を付与できます。

たとえば、管理者は次のクエリによって `john` アカウントに特権を付与しました。

```sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

これは、`john` が次のクエリを実行する権限を持っていることを意味します：

- `SELECT x,y FROM db.table`。
- `SELECT x FROM db.table`。
- `SELECT y FROM db.table`。

`john` は `SELECT z FROM db.table` を実行できません。また、`SELECT * FROM db.table` も利用できません。このクエリを処理すると、ClickHouse はデータを返しません。例外的に、テーブルが `x` と `y` のカラムのみを含む場合、ClickHouse はすべてのデータを返します。

さらに、`john` には `GRANT OPTION` の特権があり、同じ範囲またはそれ以下の特権を持つ他のユーザーに特権を付与できます。

`system` データベースへのアクセスは常に許可されています（このデータベースはクエリ処理に使用されます）。

:::note
多くのシステムテーブルには、新しいユーザーがデフォルトでアクセスできるが、特権なしでデフォルトですべてのシステムテーブルにアクセスできるわけではありません。
また、特定のシステムテーブル（たとえば `system.zookeeper`）へのアクセスは、セキュリティ上の理由からクラウドユーザーに制限されています。
:::

1つのクエリで複数のアカウントに複数の特権を付与できます。クエリ`GRANT SELECT, INSERT ON *.* TO john, robin`は、アカウント `john` と `robin` にサーバー上のすべてのデータベースのすべてのテーブルで `INSERT` および `SELECT` クエリを実行することを許可します。

## ワイルドカード付与 {#wildcard-grants}

特権を指定する際に、アスタリスク（`*`）をテーブル名やデータベース名の代わりに使用できます。たとえば、`GRANT SELECT ON db.* TO john` クエリは `john` に対して `db` データベース内のすべてのテーブルで `SELECT` クエリを実行することを許可します。
また、データベース名を省略することもできます。この場合、特権は現在のデータベースに対して付与されます。
たとえば、`GRANT SELECT ON * TO john` は現在のデータベース内のすべてのテーブルに対して特権を付与し、`GRANT SELECT ON mytable TO john` は現在のデータベース内の `mytable` テーブルに特権を付与します。

:::note
以下に説明する機能は、バージョン 24.10 以降から利用可能です。
:::

テーブル名やデータベース名の末尾にアスタリスクを置くこともできます。この機能では、テーブルパスの抽象的な接頭辞に特権を付与できます。
例：`GRANT SELECT ON db.my_tables* TO john`。このクエリは `john` に対して接頭辞が `my_tables*` の `db` データベース内のすべてのテーブルで `SELECT` クエリを実行することを許可します。

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

付与されたパス内に新たに作成されたテーブルは、自動的に親からすべての特権を継承します。
たとえば、`GRANT SELECT ON db.* TO john` クエリを実行し、その後に新しいテーブル `db.new_table` を作成した場合、ユーザー `john` は `SELECT * FROM db.new_table` クエリを実行できるようになります。

接頭辞にはアスタリスクを**のみ**指定できます：
```sql
GRANT SELECT ON db.* TO john -- correct
GRANT SELECT ON db*.* TO john -- correct

GRANT SELECT ON *.my_table TO john -- wrong
GRANT SELECT ON foo*bar TO john -- wrong
GRANT SELECT ON *suffix TO john -- wrong
GRANT SELECT(foo) ON db.table* TO john -- wrong
```

## 特権 {#privileges}

特権は、特定の種類のクエリを実行するためにユーザーに与えられた権限です。

特権は階層構造を持ち、特権の範囲に応じて許可されるクエリのセットは異なります。

ClickHouse の特権の階層は以下の通りです：

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

- `ALTER` 特権にはすべての `ALTER*` 特権が含まれます。
- `ALTER CONSTRAINT` には `ALTER ADD CONSTRAINT` および `ALTER DROP CONSTRAINT` 特権が含まれます。

特権は異なるレベルで適用されます。レベルを知ることは、特権に利用可能な構文を示唆します。

レベル（下から上）：

- `COLUMN` — 特権はカラム、テーブル、データベース、または全体に対して付与することができます。
- `TABLE` — 特権はテーブル、データベース、または全体に対して付与することができます。
- `VIEW` — 特権はビュー、データベース、または全体に対して付与することができます。
- `DICTIONARY` — 特権は辞書、データベース、または全体に対して付与することができます。
- `DATABASE` — 特権はデータベースまたは全体に対して付与することができます。
- `GLOBAL` — 特権は全体に対してのみ付与することができます。
- `GROUP` — 異なるレベルの特権をグループ化します。`GROUP` レベルの特権が付与されると、その特権が使用される構文に対応する特権のみが付与されます。

許可された構文の例：

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

許可されていない構文の例：

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

特別な特権である [ALL](#all) は、ユーザーアカウントまたはロールにすべての特権を付与します。

デフォルトでは、ユーザーアカウントまたはロールは特権を持ちません。

ユーザーまたはロールが特権を持っていない場合、それは [NONE](#none) 特権として表示されます。

いくつかのクエリはその実装に特権のセットを必要とします。たとえば、[RENAME](../../sql-reference/statements/optimize.md) クエリを実行するには、次の特権が必要です：`SELECT`、`CREATE TABLE`、`INSERT` および `DROP TABLE`。

### SELECT {#select}

[SELECT](../../sql-reference/statements/select/index.md) クエリを実行することを許可します。

特権レベル: `COLUMN`。

**説明**

この特権を付与されたユーザーは、指定されたテーブルおよびデータベース内の指定されたカラムのリストに対して `SELECT` クエリを実行することができます。ユーザーが他のカラムを含めた場合、指定されたクエリはデータを返しません。

以下の特権を考慮してください：

```sql
GRANT SELECT(x,y) ON db.table TO john
```

この特権は `john` に対して `db.table` の `x` および/または `y` カラムからのデータを含む任意の `SELECT` クエリを実行することを許可します。たとえば、`SELECT x FROM db.table`。`john` は `SELECT z FROM db.table` を実行できません。`SELECT * FROM db.table` も利用できません。このクエリを処理すると、ClickHouse はデータを返しません。例外的に、テーブルが `x` と `y` のカラムのみを含む場合、ClickHouse はすべてのデータを返します。

### INSERT {#insert}

[INSERT](../../sql-reference/statements/insert-into.md) クエリを実行することを許可します。

特権レベル: `COLUMN`。

**説明**

この特権を付与されたユーザーは、指定されたテーブルおよびデータベース内の指定されたカラムのリストに対して `INSERT` クエリを実行することができます。ユーザーが他のカラムを含めた場合、指定されたクエリはデータを挿入しません。

**例**

```sql
GRANT INSERT(x,y) ON db.table TO john
```

付与された特権は `john` が `db.table` の `x` および/または `y` カラムにデータを挿入することを許可します。

### ALTER {#alter}

[ALTER](../../sql-reference/statements/alter/index.md) クエリを階層構造に基づいて実行することを許可します：

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
  - `ALTER VIEW`。レベル: `GROUP`
  - `ALTER VIEW REFRESH`。レベル: `VIEW`。エイリアス: `ALTER LIVE VIEW REFRESH`, `REFRESH VIEW`
  - `ALTER VIEW MODIFY QUERY`。レベル: `VIEW`。エイリアス: `ALTER TABLE MODIFY QUERY`
  - `ALTER VIEW MODIFY SQL SECURITY`。レベル: `VIEW`。エイリアス: `ALTER TABLE MODIFY SQL SECURITY`

この階層がどのように扱われるかの例：

- `ALTER` 特権にはすべての `ALTER*` 特権が含まれます。
- `ALTER CONSTRAINT` には `ALTER ADD CONSTRAINT` および `ALTER DROP CONSTRAINT` 特権が含まれます。

**注意点**

- `MODIFY SETTING` 特権はテーブルエンジンの設定を変更することができます。設定やサーバーの構成パラメーターには影響しません。
- `ATTACH` 操作には [CREATE](#create) 特権が必要です。
- `DETACH` 操作には [DROP](#drop) 特権が必要です。
- [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation) クエリによって変異を停止するには、この変異を開始する特権が必要です。たとえば、`ALTER UPDATE` クエリを停止したい場合、`ALTER UPDATE`、`ALTER TABLE`、または `ALTER` 特権が必要です。

### BACKUP {#backup}

[`BACKUP`] のクエリを実行することを許可します。バックアップに関する詳細については、「[バックアップと復元](../../operations/backup.md)」を参照してください。

### CREATE {#create}

[CREATE](../../sql-reference/statements/create/index.md) および [ATTACH](../../sql-reference/statements/attach.md) DDL クエリを以下の階層構造に基づいて実行することを許可します：

- `CREATE`。レベル: `GROUP`
  - `CREATE DATABASE`。レベル: `DATABASE`
  - `CREATE TABLE`。レベル: `TABLE`
    - `CREATE ARBITRARY TEMPORARY TABLE`。レベル: `GLOBAL`
      - `CREATE TEMPORARY TABLE`。レベル: `GLOBAL`
  - `CREATE VIEW`。レベル: `VIEW`
  - `CREATE DICTIONARY`。レベル: `DICTIONARY`

**注意点**

- 作成したテーブルを削除するには、ユーザーは [DROP](#drop) 特権が必要です。

### CLUSTER {#cluster}

`ON CLUSTER` クエリを実行することを許可します。

```sql title="Syntax"
GRANT CLUSTER ON *.* TO <username>
```

デフォルトでは、`ON CLUSTER` が付いたクエリはユーザーに `CLUSTER` の付与を要求します。
`CLUSTER` 特権を付与せずにクエリで `ON CLUSTER` を使用しようとすると、次のエラーが表示されます：

```text
Not enough privileges. To execute this query, it's necessary to have the grant CLUSTER ON *.*. 
```

デフォルトの動作は、設定 `access_control_improvements` セクションの `on_cluster_queries_require_cluster_grant` 設定を `false` にすることで変更できます。

```yaml title="config.xml"
<access_control_improvements>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```

### DROP {#drop}

[DROP](../../sql-reference/statements/drop.md) および [DETACH](../../sql-reference/statements/detach.md) クエリを以下の階層構造に基づいて実行することを許可します：

- `DROP`。レベル: `GROUP`
  - `DROP DATABASE`。レベル: `DATABASE`
  - `DROP TABLE`。レベル: `TABLE`
  - `DROP VIEW`。レベル: `VIEW`
  - `DROP DICTIONARY`。レベル: `DICTIONARY`

### TRUNCATE {#truncate}

[TRUNCATE](../../sql-reference/statements/truncate.md) クエリを実行することを許可します。

特権レベル: `TABLE`。

### OPTIMIZE {#optimize}

[OPTIMIZE TABLE](../../sql-reference/statements/optimize.md) クエリを実行することを許可します。

特権レベル: `TABLE`。

### SHOW {#show}

`SHOW`、`DESCRIBE`、`USE`、および `EXISTS` クエリを以下の階層構造に基づいて実行することを許可します：

- `SHOW`。レベル: `GROUP`
  - `SHOW DATABASES`。レベル: `DATABASE`。`SHOW DATABASES`、`SHOW CREATE DATABASE`、`USE <database>` クエリを実行することを許可します。
  - `SHOW TABLES`。レベル: `TABLE`。`SHOW TABLES`、`EXISTS <table>`、`CHECK <table>` クエリを実行することを許可します。
  - `SHOW COLUMNS`。レベル: `COLUMN`。`SHOW CREATE TABLE`、`DESCRIBE` クエリを実行することを許可します。
  - `SHOW DICTIONARIES`。レベル: `DICTIONARY`。`SHOW DICTIONARIES`、`SHOW CREATE DICTIONARY`、`EXISTS <dictionary>` クエリを実行することを許可します。

**注意点**

ユーザーが指定されたテーブル、辞書、またはデータベースに関連する特権を持っている場合、そのユーザーは `SHOW` 特権を持っています。

### KILL QUERY {#kill-query}

[KILL](../../sql-reference/statements/kill.md#kill-query) クエリを以下の階層構造に基づいて実行することを許可します：

特権レベル: `GLOBAL`。

**注意点**

`KILL QUERY` 特権は、あるユーザーが他のユーザーのクエリを停止することを許可します。

### アクセス管理 {#access-management}

ユーザー、ロール、および行ポリシを管理するクエリを実行できるようにします。

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

`ROLE ADMIN` 特権は、ユーザーが自分のロールを他のユーザーに付与および取り消しできるようにします。

### システム {#system}

ユーザーが [SYSTEM](../../sql-reference/statements/system.md) クエリを以下の階層構造に基づいて実行できるようにします。

- `SYSTEM`。レベル: `GROUP`
  - `SYSTEM SHUTDOWN`。レベル: `GLOBAL`。エイリアス: `SYSTEM KILL`、`SHUTDOWN`
  - `SYSTEM DROP CACHE`。エイリアス: `DROP CACHE`
    - `SYSTEM DROP DNS CACHE`。レベル: `GLOBAL`。エイリアス: `SYSTEM DROP DNS`、`DROP DNS CACHE`、`DROP DNS`
    - `SYSTEM DROP MARK CACHE`。レベル: `GLOBAL`。エイリアス: `SYSTEM DROP MARK`、`DROP MARK CACHE`、`DROP MARKS`
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

`SYSTEM RELOAD EMBEDDED DICTIONARIES` 特権は、`SYSTEM RELOAD DICTIONARY ON *.*` 特権によって暗黙的に付与されます。

### INTROSPECTION {#introspection}

[インストロスペクション](../../operations/optimizing-performance/sampling-query-profiler.md) 関数の使用を許可します。

- `INTROSPECTION`。レベル: `GROUP`。エイリアス: `INTROSPECTION FUNCTIONS`
  - `addressToLine`。レベル: `GLOBAL`
  - `addressToLineWithInlines`。レベル: `GLOBAL`
  - `addressToSymbol`。レベル: `GLOBAL`
  - `demangle`。レベル: `GLOBAL`

### SOURCES {#sources}

外部データソースの使用を許可します。これは、[テーブルエンジン](../../engines/table-engines/index.md) および [テーブル関数](/sql-reference/table-functions) に適用されます。

- `READ`。レベル: `GLOBAL_WITH_PARAMETER`
- `WRITE`。レベル: `GLOBAL_WITH_PARAMETER`

利用可能なパラメータ：
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
データソースの読み取り/書き込みの特権に対する分離は、バージョン 25.7 から利用可能で、サーバー設定 `access_control_improvements.enable_read_write_grants` を有効にする必要があります。

それ以外の場合、`GRANT AZURE ON *.* TO user` 構文を使用する必要があります。これは新しい `GRANT READ, WRITE ON AZURE TO user` に相当します。
:::

例：

- [MySQL テーブルエンジン](../../engines/table-engines/integrations/mysql.md)を使用してテーブルを作成するには、`CREATE TABLE (ON db.table_name)` および `MYSQL` の特権が必要です。
- [mysql テーブル関数](../../sql-reference/table-functions/mysql.md) を使用するには、`CREATE TEMPORARY TABLE` と `MYSQL` の特権が必要です。

### ソースフィルター特権 {#source-filter-grants}

:::note
この機能は、バージョン 25.8 以降およびサーバー設定 `access_control_improvements.enable_read_write_grants` のみで利用可能です。
:::

正規表現フィルターを使用して特定のソース URI へのアクセスを付与できます。これにより、ユーザーがアクセスできる外部データソースの詳細な制御が可能になります。

**構文：**

```sql
GRANT READ ON S3('regexp_pattern') TO user
```

この特権は、指定された正規表現パターンに一致する S3 URI からのみ読み取ることをユーザーに許可します。

**例：**

特定の S3 バケットパスへのアクセスを付与：
```sql
-- Allow user to read only from s3://foo/ paths
GRANT READ ON S3('s3://foo/.*') TO john

-- Allow user to read from specific file patterns
GRANT READ ON S3('s3://mybucket/data/2024/.*\.parquet') TO analyst

-- Multiple filters can be granted to the same user
GRANT READ ON S3('s3://foo/.*') TO john
GRANT READ ON S3('s3://bar/.*') TO john
```

**GRANT OPTION での再付与：**

元の特権に `WITH GRANT OPTION` がある場合、それを使用して `GRANT CURRENT GRANTS` で再付与できます：
```sql
-- Original grant with GRANT OPTION
GRANT READ ON S3('s3://foo/.*') TO john WITH GRANT OPTION

-- John can now regrant this access to others
GRANT CURRENT GRANTS(READ ON S3) TO alice
```

**重要な制限：**

- **部分的取り消しは許可されていません:** 付与されたフィルターパターンの一部を取り消すことはできません。必要に応じて全体を取り消し、新しいパターンで再付与する必要があります。
- **ワイルドカード付与は許可されていません:** `GRANT READ ON *('regexp')` またはそのようなワイルドカード専用パターンを使用することはできません。特定のソースを指定する必要があります。

### dictGet {#dictget}

- `dictGet`。エイリアス: `dictHas`、`dictGetHierarchy`、`dictIsIn`

ユーザーが [dictGet](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)、[dictHas](../../sql-reference/functions/ext-dict-functions.md#dicthas)、[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)、[dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictisin) 関数を実行できるようにします。

特権レベル: `DICTIONARY`。

**例**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`

### displaySecretsInShowAndSelect {#displaysecretsinshowandselect}

ユーザーが `SHOW` および `SELECT` クエリの機密情報を表示できるようにします。ただし、両方の
[`display_secrets_in_show_and_select` サーバー設定](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select)
と
[`format_display_secrets_in_show_and_select` フォーマット設定](../../operations/settings/formats#format_display_secrets_in_show_and_select)
がオンになっている必要があります。

### NAMED COLLECTION ADMIN {#named-collection-admin}

指定された名前付きコレクションに対して特定の操作を許可します。バージョン 23.7 より前は NAMED COLLECTION CONTROL と呼ばれていましたが、23.7 以降は NAMED COLLECTION ADMIN が追加され、NAMED COLLECTION CONTROL はエイリアスとして保持されています。

- `NAMED COLLECTION ADMIN`。レベル: `NAMED_COLLECTION`。エイリアス: `NAMED COLLECTION CONTROL`
  - `CREATE NAMED COLLECTION`。レベル: `NAMED_COLLECTION`
  - `DROP NAMED COLLECTION`。レベル: `NAMED_COLLECTION`
  - `ALTER NAMED COLLECTION`。レベル: `NAMED_COLLECTION`
  - `SHOW NAMED COLLECTIONS`。レベル: `NAMED_COLLECTION`。エイリアス: `SHOW NAMED COLLECTIONS`
  - `SHOW NAMED COLLECTIONS SECRETS`。レベル: `NAMED_COLLECTION`。エイリアス: `SHOW NAMED COLLECTIONS SECRETS`
  - `NAMED COLLECTION`。レベル: `NAMED_COLLECTION`。エイリアス: `NAMED COLLECTION USAGE, USE NAMED COLLECTION`

他のすべての特権（CREATE、DROP、ALTER、SHOW）とは異なり、NAMED COLLECTION の付与は 23.7 でのみ追加され、他のものは以前の 22.12 に追加されました。

**例**

名前付きコレクションが abc と呼ばれると仮定し、ユーザー john に CREATE NAMED COLLECTION 特権を付与します。
- `GRANT CREATE NAMED COLLECTION ON abc TO john`

### TABLE ENGINE {#table-engine}

テーブルを作成する際に指定されたテーブルエンジンを使用できるようにします。これは [テーブルエンジン](../../engines/table-engines/index.md) に適用されます。

**例**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`

### ALL {#all}

<CloudNotSupportedBadge/>

規制されたエンティティに対するすべての特権をユーザーアカウントまたはロールに付与します。

:::note
特権 `ALL` は ClickHouse Cloud ではサポートされておらず、`default` ユーザーには制限付きの権限があります。ユーザーは `default_role` を付与することで最大限の権限をユーザーに与えることができます。詳細については [こちら](/cloud/security/cloud-access-management/overview#initial-settings) を参照してください。
ユーザーは、デフォルトのユーザーとして `GRANT CURRENT GRANTS` を使って、`ALL` と同様の効果を得ることもできます。
:::

### NONE {#none}

特権を付与しません。

### ADMIN OPTION {#admin-option}

`ADMIN OPTION` 特権は、ユーザーが自分のロールを別のユーザーに付与できるようにします。
