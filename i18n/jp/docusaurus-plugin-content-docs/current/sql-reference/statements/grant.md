---
description: 'GRANT 文に関するドキュメント'
sidebar_label: 'GRANT'
sidebar_position: 38
slug: /sql-reference/statements/grant
title: 'GRANT 文'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# GRANT ステートメント

- ClickHouse のユーザーアカウントまたはロールに[権限](#privileges)を付与します。
- ロールをユーザーアカウントまたは他のロールに割り当てます。

権限を取り消すには、[REVOKE](../../sql-reference/statements/revoke.md) ステートメントを使用します。[SHOW GRANTS](../../sql-reference/statements/show.md#show-grants) ステートメントを使用すると、付与されている権限を一覧表示できます。



## 権限付与の構文

```sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

* `privilege` — 権限の種別。
* `role` — ClickHouse のユーザーロール。
* `user` — ClickHouse のユーザーアカウント。

`WITH GRANT OPTION` 句は、`user` または `role` に対して `GRANT` クエリを実行する権限を付与します。ユーザーは、自身が持つスコープと同じ、またはそれより狭いスコープの権限を付与できます。
`WITH REPLACE OPTION` 句は、`user` または `role` に対する既存の権限を新しい権限で置き換えます。指定されていない場合は、権限を追加します。


## ロール割り当て構文

```sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

* `role` — ClickHouse ユーザーロール。
* `user` — ClickHouse ユーザーアカウント。

`WITH ADMIN OPTION` 句は、`user` または `role` に [ADMIN OPTION](#admin-option) 権限を付与します。
`WITH REPLACE OPTION` 句は、`user` または `role` に対して既存のロールを新しいロールに置き換えます。指定しない場合は、ロールが追加されます。


## GRANT CURRENT GRANTS 構文

```sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

* `privilege` — 権限の種類。
* `role` — ClickHouse ユーザーロール。
* `user` — ClickHouse ユーザーアカウント。

`CURRENT GRANTS` ステートメントを使用すると、指定されたすべての権限を指定したユーザーまたはロールに付与できます。
権限が一つも指定されていない場合、そのユーザーまたはロールには、`CURRENT_USER` に利用可能なすべての権限が付与されます。


## 使用方法

`GRANT` を使用するには、自身のアカウントに `GRANT OPTION` 権限を持っている必要があります。権限を付与できるのは、自身のアカウントが持つ権限の範囲内に限られます。

例えば、管理者が次のクエリを実行して `john` アカウントに権限を付与したとします。

```sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

これは、`john` が次のクエリを実行する権限を持っていることを意味します。

* `SELECT x,y FROM db.table`
* `SELECT x FROM db.table`
* `SELECT y FROM db.table`

`john` は `SELECT z FROM db.table` を実行できません。`SELECT * FROM db.table` も実行できません。このクエリを処理する際、ClickHouse は `x` と `y` であっても、どのようなデータも返しません。唯一の例外は、テーブルが `x` と `y` の列だけを含んでいる場合です。この場合には、ClickHouse はすべてのデータを返します。

また、`john` は `GRANT OPTION` 特権も持っているため、同じ範囲またはそれ以下の範囲の特権を他のユーザーに付与できます。

`system` データベースへのアクセスは常に許可されています（このデータベースはクエリの処理に使用されるためです）。

:::note
多くの `system` テーブルには、新しいユーザーでもデフォルトでアクセスできますが、すべての `system` テーブルに対して、GRANT なしでデフォルトでアクセスできるとは限りません。
また、`system.zookeeper` など特定の `system` テーブルへのアクセスは、セキュリティ上の理由から Cloud のユーザーには制限されています。
:::

1 回のクエリで複数のアカウントに複数の特権を付与できます。`GRANT SELECT, INSERT ON *.* TO john, robin` クエリは、`john` と `robin` アカウントに、サーバー上のすべてのデータベース内のすべてのテーブルに対して `INSERT` および `SELECT` クエリを実行することを許可します。


## ワイルドカードを用いた権限付与

権限を指定する際には、テーブル名やデータベース名の代わりにアスタリスク（`*`）を使用できます。例えば、`GRANT SELECT ON db.* TO john` クエリにより、`john` は `db` データベース内のすべてのテーブルに対して `SELECT` クエリを実行できるようになります。
また、データベース名を省略することもできます。この場合、権限は現在のデータベースに対して付与されます。
例えば、`GRANT SELECT ON * TO john` は現在のデータベース内のすべてのテーブルに対する権限を付与し、`GRANT SELECT ON mytable TO john` は現在のデータベース内の `mytable` テーブルに対する権限を付与します。

:::note
以下で説明する機能は ClickHouse バージョン 24.10 以降で利用できます。
:::

テーブル名またはデータベース名の末尾にアスタリスクを付けることもできます。この機能により、テーブルパスの抽象的なプレフィックス（共通接頭辞）に対して権限を付与できます。
例: `GRANT SELECT ON db.my_tables* TO john`。このクエリにより、`john` は `db` データベース内の、プレフィックス `my_tables` を持つすべてのテーブルに対して `SELECT` クエリを実行できるようになります。

その他の例:

`GRANT SELECT ON db.my_tables* TO john`

```sql
SELECT * FROM db.my_tables -- 許可
SELECT * FROM db.my_tables_0 -- 許可
SELECT * FROM db.my_tables_1 -- 許可

SELECT * FROM db.other_table -- 不許可
SELECT * FROM db2.my_tables -- 不許可
```

`GRANT SELECT ON db*.* TO john`

```sql
SELECT * FROM db.my_tables -- 権限あり
SELECT * FROM db.my_tables_0 -- 権限あり
SELECT * FROM db.my_tables_1 -- 権限あり
SELECT * FROM db.other_table -- 権限あり
SELECT * FROM db2.my_tables -- 権限あり
```

権限が付与されたパス内で新しく作成されたすべてのテーブルは、その上位オブジェクトからすべての権限を自動的に継承します。
たとえば、`GRANT SELECT ON db.* TO john` クエリを実行してから新しいテーブル `db.new_table` を作成すると、ユーザー `john` は `SELECT * FROM db.new_table` クエリを実行できるようになります。

アスタリスク（`*`）はプレフィックスに対して **のみ** 指定できます。

```sql
GRANT SELECT ON db.* TO john -- 正しい
GRANT SELECT ON db*.* TO john -- 正しい

GRANT SELECT ON *.my_table TO john -- 誤り
GRANT SELECT ON foo*bar TO john -- 誤り
GRANT SELECT ON *suffix TO john -- 誤り
GRANT SELECT(foo) ON db.table* TO john -- 誤り
```


## 権限 {#privileges}

権限とは、ユーザーが特定の種類のクエリを実行できるようにするための許可です。

権限には階層構造があり、許可されるクエリの集合は権限の適用範囲によって決まります。

ClickHouse における権限の階層構造は次のとおりです。



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

この権限階層の取り扱い例:

* `ALTER` 権限には、他のすべての `ALTER*` 権限が含まれます。
* `ALTER CONSTRAINT` には、`ALTER ADD CONSTRAINT` および `ALTER DROP CONSTRAINT` 権限が含まれます。

権限はさまざまなレベルで適用されます。どのレベルで適用されるかを知ることで、その権限に対して使用できる構文が分かります。

レベル（低いものから高いものへ）:

* `COLUMN` — 権限はカラム、テーブル、データベース、またはグローバルに対して付与できます。
* `TABLE` — 権限はテーブル、データベース、またはグローバルに対して付与できます。
* `VIEW` — 権限はビュー、データベース、またはグローバルに対して付与できます。
* `DICTIONARY` — 権限はディクショナリ、データベース、またはグローバルに対して付与できます。
* `DATABASE` — 権限はデータベースまたはグローバルに対して付与できます。
* `GLOBAL` — 権限はグローバルにのみ付与できます。
* `GROUP` — 異なるレベルの権限をグループ化します。`GROUP` レベルの権限が付与されるとき、実際に付与されるのは、使用された構文に対応するそのグループ内の権限のみです。

許可される構文の例:

* `GRANT SELECT(x) ON db.table TO user`
* `GRANT SELECT ON db.* TO user`

許可されない構文の例:

* `GRANT CREATE USER(x) ON db.table TO user`
* `GRANT CREATE USER ON db.* TO user`

特別な権限である [ALL](#all) は、ユーザーアカウントまたはロールにすべての権限を付与します。

デフォルトでは、ユーザーアカウントまたはロールには何の権限も付与されていません。

ユーザーまたはロールに権限がない場合、それは [NONE](#none) 権限として表示されます。

一部のクエリは、その実装上、一連の権限を必要とします。たとえば、[RENAME](../../sql-reference/statements/optimize.md) クエリを実行するには、`SELECT`、`CREATE TABLE`、`INSERT`、`DROP TABLE` の各権限が必要です。

### SELECT

[SELECT](../../sql-reference/statements/select/index.md) クエリの実行を許可します。

権限レベル: `COLUMN`。

**説明**

この権限が付与されたユーザーは、指定されたテーブルおよびデータベース内の、指定されたカラム一覧に対して `SELECT` クエリを実行できます。ユーザーが指定されていない他のカラムを含めた場合、そのクエリはデータを返しません。

次の権限を考えてみます:

```sql
GRANT SELECT(x,y) ON db.table TO john
```

この権限により、`john` は `db.table` の `x` 列および/または `y` 列からのデータを含む任意の `SELECT` クエリ、たとえば `SELECT x FROM db.table` を実行できます。`john` は `SELECT z FROM db.table` を実行できません。`SELECT * FROM db.table` も実行できません。このクエリを処理するとき、ClickHouse は `x` および `y` を含め、いかなるデータも返しません。唯一の例外は、テーブルが `x` と `y` 列のみを含む場合であり、この場合には ClickHouse はすべてのデータを返します。

### INSERT

[INSERT](../../sql-reference/statements/insert-into.md) クエリの実行を許可します。

権限レベル: `COLUMN`。

**説明**

この権限を付与されたユーザーは、指定されたデータベースおよびテーブルにおいて、指定された列の一覧に対して `INSERT` クエリを実行できます。ユーザーが指定された列以外の列をクエリに含めた場合、そのクエリでは一切データは挿入されません。

**例**

```sql
GRANT INSERT(x,y) ON db.table TO john
```

付与された権限により、`john` は `db.table` の `x` 列および/または `y` 列にデータを挿入できます。

### ALTER

次に示す権限の階層構造に基づいて、[ALTER](../../sql-reference/statements/alter/index.md) クエリを実行できます。


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
  - `ALTER VIEW`. レベル: `GROUP`
  - `ALTER VIEW REFRESH`. レベル: `VIEW`. エイリアス: `REFRESH VIEW`
  - `ALTER VIEW MODIFY QUERY`. レベル: `VIEW`. エイリアス: `ALTER TABLE MODIFY QUERY`
  - `ALTER VIEW MODIFY SQL SECURITY`. レベル: `VIEW`. エイリアス: `ALTER TABLE MODIFY SQL SECURITY`

この階層がどのように扱われるかの例:

- `ALTER` 権限には、他のすべての `ALTER*` 権限が含まれます。
- `ALTER CONSTRAINT` には、`ALTER ADD CONSTRAINT` 権限と `ALTER DROP CONSTRAINT` 権限が含まれます。

**注意**

- `MODIFY SETTING` 権限により、テーブルエンジンの設定を変更できます。これは、その他の設定やサーバー構成パラメータには影響しません。
- `ATTACH` 操作には [CREATE](#create) 権限が必要です。
- `DETACH` 操作には [DROP](#drop) 権限が必要です。
- [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation) クエリによってミューテーションを停止するには、そのミューテーションを開始するための権限が必要です。たとえば、`ALTER UPDATE` クエリを停止したい場合、`ALTER UPDATE`、`ALTER TABLE`、または `ALTER` 権限が必要です。

### BACKUP {#backup}

クエリで [`BACKUP`] を実行できるようにします。バックアップの詳細については、[Backup and Restore](../../operations/backup.md) を参照してください。

### CREATE {#create}

次の権限の階層に従って、[CREATE](../../sql-reference/statements/create/index.md) および [ATTACH](../../sql-reference/statements/attach.md) の DDL クエリを実行できるようにします:

- `CREATE`. レベル: `GROUP`
  - `CREATE DATABASE`. レベル: `DATABASE`
  - `CREATE TABLE`. レベル: `TABLE`
    - `CREATE ARBITRARY TEMPORARY TABLE`. レベル: `GLOBAL`
      - `CREATE TEMPORARY TABLE`. レベル: `GLOBAL`
  - `CREATE VIEW`. レベル: `VIEW`
  - `CREATE DICTIONARY`. レベル: `DICTIONARY`

**注意**

- 作成したテーブルを削除するには、ユーザーに [DROP](#drop) 権限が必要です。

### CLUSTER {#cluster}

`ON CLUSTER` クエリを実行できるようにします。

```sql title="Syntax"
GRANT CLUSTER ON *.* TO <ユーザー名>
```

デフォルトでは、クエリで `ON CLUSTER` を使用するには、ユーザーに `CLUSTER` 権限が付与されている必要があります。
`CLUSTER` 権限を付与していない状態でクエリ内で `ON CLUSTER` を使用しようとすると、次のエラーが発生します。

```text
権限が不足しています。このクエリを実行するには、CLUSTER ON *.* の権限が必要です。 
```

デフォルトの動作は、`config.xml` の `access_control_improvements` セクション内にある `on_cluster_queries_require_cluster_grant` 設定（以下参照）を `false` に設定することで変更できます。

```yaml title="config.xml"
<access_control_improvements>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```

### DROP

次の権限階層に従って、[DROP](../../sql-reference/statements/drop.md) および [DETACH](../../sql-reference/statements/detach.md) クエリを実行できます。

* `DROP`。レベル: `GROUP`
  * `DROP DATABASE`。レベル: `DATABASE`
  * `DROP TABLE`。レベル: `TABLE`
  * `DROP VIEW`。レベル: `VIEW`
  * `DROP DICTIONARY`。レベル: `DICTIONARY`

### TRUNCATE

[TRUNCATE](../../sql-reference/statements/truncate.md) クエリを実行できます。

権限レベル: `TABLE`。

### OPTIMIZE

[OPTIMIZE TABLE](../../sql-reference/statements/optimize.md) クエリを実行できます。

権限レベル: `TABLE`。

### SHOW

次の権限階層に従って、`SHOW`、`DESCRIBE`、`USE`、`EXISTS` クエリを実行できます。

* `SHOW`。レベル: `GROUP`
  * `SHOW DATABASES`。レベル: `DATABASE`。`SHOW DATABASES`、`SHOW CREATE DATABASE`、`USE <database>` クエリの実行を許可します。
  * `SHOW TABLES`。レベル: `TABLE`。`SHOW TABLES`、`EXISTS <table>`、`CHECK <table>` クエリの実行を許可します。
  * `SHOW COLUMNS`。レベル: `COLUMN`。`SHOW CREATE TABLE`、`DESCRIBE` クエリの実行を許可します。
  * `SHOW DICTIONARIES`。レベル: `DICTIONARY`。`SHOW DICTIONARIES`、`SHOW CREATE DICTIONARY`、`EXISTS <dictionary>` クエリの実行を許可します。

**Notes**

ユーザーは、指定されたテーブル、ディクショナリ、またはデータベースに関して何らかの他の権限を持っている場合、`SHOW` 権限を持ちます。

### KILL QUERY

次の権限階層に従って、[KILL](../../sql-reference/statements/kill.md#kill-query) クエリを実行できます。

権限レベル: `GLOBAL`。

**Notes**

`KILL QUERY` 権限を持つユーザーは、他のユーザーのクエリを強制終了できます。

### ACCESS MANAGEMENT

ユーザー、ロール、および行ポリシーを管理するクエリを実行できます。


- `ACCESS MANAGEMENT`. レベル: `GROUP`
  - `CREATE USER`. レベル: `GLOBAL`
  - `ALTER USER`. レベル: `GLOBAL`
  - `DROP USER`. レベル: `GLOBAL`
  - `CREATE ROLE`. レベル: `GLOBAL`
  - `ALTER ROLE`. レベル: `GLOBAL`
  - `DROP ROLE`. レベル: `GLOBAL`
  - `ROLE ADMIN`. レベル: `GLOBAL`
  - `CREATE ROW POLICY`. レベル: `GLOBAL`. 別名: `CREATE POLICY`
  - `ALTER ROW POLICY`. レベル: `GLOBAL`. 別名: `ALTER POLICY`
  - `DROP ROW POLICY`. レベル: `GLOBAL`. 別名: `DROP POLICY`
  - `CREATE QUOTA`. レベル: `GLOBAL`
  - `ALTER QUOTA`. レベル: `GLOBAL`
  - `DROP QUOTA`. レベル: `GLOBAL`
  - `CREATE SETTINGS PROFILE`. レベル: `GLOBAL`. 別名: `CREATE PROFILE`
  - `ALTER SETTINGS PROFILE`. レベル: `GLOBAL`. 別名: `ALTER PROFILE`
  - `DROP SETTINGS PROFILE`. レベル: `GLOBAL`. 別名: `DROP PROFILE`
  - `SHOW ACCESS`. レベル: `GROUP`
    - `SHOW_USERS`. レベル: `GLOBAL`. 別名: `SHOW CREATE USER`
    - `SHOW_ROLES`. レベル: `GLOBAL`. 別名: `SHOW CREATE ROLE`
    - `SHOW_ROW_POLICIES`. レベル: `GLOBAL`. 別名: `SHOW POLICIES`, `SHOW CREATE ROW POLICY`, `SHOW CREATE POLICY`
    - `SHOW_QUOTAS`. レベル: `GLOBAL`. 別名: `SHOW CREATE QUOTA`
    - `SHOW_SETTINGS_PROFILES`. レベル: `GLOBAL`. 別名: `SHOW PROFILES`, `SHOW CREATE SETTINGS PROFILE`, `SHOW CREATE PROFILE`
  - `ALLOW SQL SECURITY NONE`. レベル: `GLOBAL`. 別名: `CREATE SQL SECURITY NONE`, `SQL SECURITY NONE`, `SECURITY NONE`

`ROLE ADMIN` 権限を持つユーザーは、自身には管理オプション付きで付与されていないロールも含め、任意のロールを付与および取り消すことができます。

### SYSTEM {#system}

ユーザーは、以下の権限階層に従って [SYSTEM](../../sql-reference/statements/system.md) クエリを実行できます。



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

`SYSTEM RELOAD EMBEDDED DICTIONARIES` 権限は、`SYSTEM RELOAD DICTIONARY ON *.*` 権限によって暗黙的に付与されます。

### INTROSPECTION {#introspection}

[イントロスペクション](../../operations/optimizing-performance/sampling-query-profiler.md)関数を使用できるようにします。

- `INTROSPECTION`. レベル: `GROUP`. エイリアス: `INTROSPECTION FUNCTIONS`
  - `addressToLine`. レベル: `GLOBAL`
  - `addressToLineWithInlines`. レベル: `GLOBAL`
  - `addressToSymbol`. レベル: `GLOBAL`
  - `demangle`. レベル: `GLOBAL`

### SOURCES {#sources}

外部データソースの使用を許可します。[テーブルエンジン](../../engines/table-engines/index.md)および[テーブル関数](/sql-reference/table-functions)に適用されます。

- `READ`. レベル: `GLOBAL_WITH_PARAMETER`  
- `WRITE`. レベル: `GLOBAL_WITH_PARAMETER`

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
ソースに対する READ/WRITE 権限の分離は、バージョン 25.7 以降で、かつサーバー設定
`access_control_improvements.enable_read_write_grants`
が有効化されている場合にのみ利用できます。

それ以外の場合は、構文 `GRANT AZURE ON *.* TO user` を使用する必要があります。これは新しい `GRANT READ, WRITE ON AZURE TO user` と同等です。
:::

例：

* [MySQL table engine](../../engines/table-engines/integrations/mysql.md) を使用してテーブルを作成するには、`CREATE TABLE (ON db.table_name)` と `MYSQL` 権限が必要です。
* [mysql table function](../../sql-reference/table-functions/mysql.md) を使用するには、`CREATE TEMPORARY TABLE` と `MYSQL` 権限が必要です。

### Source Filter Grants

:::note
この機能はバージョン 25.8 以降で、かつサーバー設定
`access_control_improvements.enable_read_write_grants`
が有効化されている場合にのみ利用できます。
:::

正規表現フィルタを使用して、特定のソース URI へのアクセスを付与できます。これにより、ユーザーがアクセスできる外部データソースをきめ細かく制御できます。

**構文:**

```sql
GRANT READ ON S3('regexp_pattern') TO user
```

この権限を付与すると、ユーザーは指定した正規表現パターンに一致する S3 URI からのみデータを読み取ることができます。

**例:**

特定の S3 バケットパスへのアクセス権を付与する:

```sql
-- ユーザーに s3://foo/ パスからの読み取りのみを許可
GRANT READ ON S3('s3://foo/.*') TO john

-- ユーザーに特定のファイルパターンからの読み取りを許可
GRANT READ ON S3('s3://mybucket/data/2024/.*\.parquet') TO analyst

-- 同一ユーザーに複数のフィルターを付与可能
GRANT READ ON S3('s3://foo/.*') TO john
GRANT READ ON S3('s3://bar/.*') TO john
```

:::warning
Source filter は **regexp** をパラメータとして受け取るため、次のような権限付与
`GRANT READ ON URL('http://www.google.com') TO john;`

によって、この URL へのクエリが実行可能になります

```sql
SELECT * FROM url('https://www.google.com');
SELECT * FROM url('https://www-google.com');
```

正規表現では `.` は「任意の1文字」として扱われます。
これにより潜在的な脆弱性が生じる可能性があります。正しい GRANT は次のとおりです。

```sql
GRANT READ ON URL('https://www\.google\.com') TO john;
```

:::

**GRANT OPTION を使用した再付与:**

元の GRANT 文で `WITH GRANT OPTION` が指定されている場合、`GRANT CURRENT GRANTS` を使用して権限を再付与できます：

```sql
-- GRANT OPTIONを指定した権限付与
GRANT READ ON S3('s3://foo/.*') TO john WITH GRANT OPTION

-- johnはこのアクセス権を他のユーザーに再付与できます
GRANT CURRENT GRANTS(READ ON S3) TO alice
```

**重要な制限事項:**

* **一部だけの取り消しはできません:** 付与されたフィルターパターンの一部だけを取り消すことはできません。必要に応じて、付与全体を取り消したうえで、新しいパターンで再度付与する必要があります。
* **ワイルドカードでの付与はできません:** `GRANT READ ON *('regexp')` のような、ワイルドカードのみのパターンは使用できません。特定のソースを明示的に指定する必要があります。

### dictGet

* `dictGet`。別名: `dictHas`, `dictGetHierarchy`, `dictIsIn`

ユーザーが [dictGet](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)、[dictHas](../../sql-reference/functions/ext-dict-functions.md#dicthas)、[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)、[dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictisin) 関数を実行できるようにします。

権限レベル: `DICTIONARY`。

**例**

* `GRANT dictGet ON mydb.mydictionary TO john`
* `GRANT dictGet ON mydictionary TO john`

### displaySecretsInShowAndSelect

[`display_secrets_in_show_and_select` サーバー設定](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select)
と
[`format_display_secrets_in_show_and_select` フォーマット設定](../../operations/settings/formats#format_display_secrets_in_show_and_select)
の両方が有効な場合に、ユーザーが `SHOW` および `SELECT` クエリ内のシークレットを表示できるようにします。

### NAMED COLLECTION ADMIN

指定された Named Collection に対する特定の操作を許可します。バージョン 23.7 以前は NAMED COLLECTION CONTROL と呼ばれており、23.7 以降では NAMED COLLECTION ADMIN が追加され、NAMED COLLECTION CONTROL は別名として維持されています。


- `NAMED COLLECTION ADMIN`. レベル: `NAMED_COLLECTION`. 別名: `NAMED COLLECTION CONTROL`
  - `CREATE NAMED COLLECTION`. レベル: `NAMED_COLLECTION`
  - `DROP NAMED COLLECTION`. レベル: `NAMED_COLLECTION`
  - `ALTER NAMED COLLECTION`. レベル: `NAMED_COLLECTION`
  - `SHOW NAMED COLLECTIONS`. レベル: `NAMED_COLLECTION`. 別名: `SHOW NAMED COLLECTIONS`
  - `SHOW NAMED COLLECTIONS SECRETS`. レベル: `NAMED_COLLECTION`. 別名: `SHOW NAMED COLLECTIONS SECRETS`
  - `NAMED COLLECTION`. レベル: `NAMED_COLLECTION`. 別名: `NAMED COLLECTION USAGE, USE NAMED COLLECTION`

他のすべての権限（CREATE、DROP、ALTER、SHOW）とは異なり、`GRANT NAMED COLLECTION` は 23.7 で追加されましたが、他のものはすでに 22.12 で追加されています。

**例**

名前付きコレクション名が abc であると仮定し、ユーザー john に `CREATE NAMED COLLECTION` 権限を付与します。
- `GRANT CREATE NAMED COLLECTION ON abc TO john`

### TABLE ENGINE {#table-engine}

テーブルを作成する際に、指定したテーブルエンジンを使用できるようにします。[テーブルエンジン](../../engines/table-engines/index.md) に適用されます。

**例**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`

### ALL {#all}

<CloudNotSupportedBadge/>

対象エンティティに対するすべての権限を、ユーザーアカウントまたはロールに付与します。

:::note
`ALL` 権限は ClickHouse Cloud ではサポートされていません。ClickHouse Cloud では `default` ユーザーの権限は制限されています。ユーザーは `default_role` を付与することで、ユーザーに可能な最大限の権限を付与できます。詳細は[こちら](/cloud/security/manage-cloud-users)を参照してください。
ユーザーはまた、`GRANT CURRENT GRANTS` を `default` ユーザーとして実行することで、`ALL` と同様の効果を得ることもできます。
:::

### NONE {#none}

いかなる権限も付与しません。

### ADMIN OPTION {#admin-option}

`ADMIN OPTION` 権限により、ユーザーは自身のロールを別のユーザーに付与できます。
