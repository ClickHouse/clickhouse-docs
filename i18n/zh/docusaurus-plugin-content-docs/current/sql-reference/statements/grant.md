---
description: 'GRANT 语句文档'
sidebar_label: 'GRANT'
sidebar_position: 38
slug: /sql-reference/statements/grant
title: 'GRANT 语句'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# GRANT 语句

- 向 ClickHouse 用户账户或角色授予[权限](#privileges)。
- 将角色分配给用户账户或其他角色。

要撤销权限，请使用 [REVOKE](../../sql-reference/statements/revoke.md) 语句。还可以使用 [SHOW GRANTS](../../sql-reference/statements/show.md#show-grants) 语句列出已授予的权限。



## 授予权限的语法

```sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

* `privilege` — 权限类型。
* `role` — ClickHouse 用户角色。
* `user` — ClickHouse 用户账户。

`WITH GRANT OPTION` 子句授予 `user` 或 `role` 执行 `GRANT` 查询的权限。用户只能授予与其自身权限范围相同或更小范围的权限。
`WITH REPLACE OPTION` 子句会将 `user` 或 `role` 的旧权限替换为新权限；如果未指定该子句，则会将新权限追加到现有权限上。


## 分配角色的语法

```sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

* `role` — ClickHouse 用户角色。
* `user` — ClickHouse 用户账户。

`WITH ADMIN OPTION` 子句为 `user` 或 `role` 授予 [ADMIN OPTION](#admin-option) 权限。
`WITH REPLACE OPTION` 子句会将 `user` 或 `role` 的旧角色替换为新角色；如果未指定该子句，则会在原有角色基础上追加新角色。


## GRANT CURRENT GRANTS 语法

```sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

* `privilege` — 权限类型。
* `role` — ClickHouse 用户角色。
* `user` — ClickHouse 用户账号。

使用 `CURRENT GRANTS` 语句可以将所有指定的权限授予指定的用户或角色。
如果未指定任何权限，则给定的用户或角色将获得 `CURRENT_USER` 的所有可用权限。


## 用法

要使用 `GRANT`，你的账户必须具有 `GRANT OPTION` 权限。你只能在自己账户权限范围内授予权限。

例如，管理员通过如下查询向 `john` 账户授予了权限：

```sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

这意味着 `john` 拥有执行以下语句的权限：

* `SELECT x,y FROM db.table`。
* `SELECT x FROM db.table`。
* `SELECT y FROM db.table`。

`john` 不能执行 `SELECT z FROM db.table`。`SELECT * FROM db.table` 也不可用。在处理这个查询时，ClickHouse 不会返回任何数据，连 `x` 和 `y` 也不会返回。唯一的例外是，当一个表只包含 `x` 和 `y` 两列时，在这种情况下 ClickHouse 会返回所有数据。

此外，`john` 拥有 `GRANT OPTION` 权限，因此他可以将相同或更小范围的权限授予其他用户。

对 `system` 数据库的访问始终是允许的（因为该数据库用于处理查询）。

:::note
虽然新用户默认可以访问许多 system 表，但如果没有授权，他们可能默认无法访问每一个 system 表。
另外，出于安全原因，对于 Cloud 用户，访问某些 system 表（如 `system.zookeeper`）是受限的。
:::

你可以在一个查询中将多个权限授予多个账号。查询 `GRANT SELECT, INSERT ON *.* TO john, robin` 允许账号 `john` 和 `robin` 在服务器上所有数据库的所有表上执行 `INSERT` 和 `SELECT` 查询。


## 通配符授权

在指定权限时，可以使用星号（`*`）代替表名或数据库名。例如，查询 `GRANT SELECT ON db.* TO john` 允许 `john` 在 `db` 数据库中的所有表上执行 `SELECT` 查询。
也可以省略数据库名。在这种情况下，权限会授予当前数据库。
例如，`GRANT SELECT ON * TO john` 会授予当前数据库中所有表的权限，`GRANT SELECT ON mytable TO john` 会授予当前数据库中 `mytable` 表的权限。

:::note
下文所述的功能从 ClickHouse 24.10 版本开始提供。
:::

还可以在表名或数据库名的末尾使用星号。此功能允许基于表路径的前缀来授予权限。
示例：`GRANT SELECT ON db.my_tables* TO john`。该查询允许 `john` 在 `db` 数据库中所有以 `my_tables` 为前缀的表上执行 `SELECT` 查询。

更多示例：

`GRANT SELECT ON db.my_tables* TO john`

```sql
SELECT * FROM db.my_tables -- 已授权
SELECT * FROM db.my_tables_0 -- 已授权
SELECT * FROM db.my_tables_1 -- 已授权

SELECT * FROM db.other_table -- 未授权
SELECT * FROM db2.my_tables -- 未授权
```

`GRANT SELECT ON db*.* TO john`

```sql
SELECT * FROM db.my_tables -- 已授权
SELECT * FROM db.my_tables_0 -- 已授权
SELECT * FROM db.my_tables_1 -- 已授权
SELECT * FROM db.other_table -- 已授权
SELECT * FROM db2.my_tables -- 已授权
```

在已授予权限的路径中新建的所有表都会自动继承其父对象上的所有授权。
例如，如果你运行 `GRANT SELECT ON db.* TO john` 查询，然后创建一个新表 `db.new_table`，则用户 `john` 将能够运行 `SELECT * FROM db.new_table` 查询。

星号（*）**只**能用于前缀：

```sql
GRANT SELECT ON db.* TO john -- correct
GRANT SELECT ON db*.* TO john -- 正确

GRANT SELECT ON *.my_table TO john -- 错误
GRANT SELECT ON foo*bar TO john -- 错误
GRANT SELECT ON *suffix TO john -- 错误
GRANT SELECT(foo) ON db.table* TO john -- 错误
```


## 权限 {#privileges}

权限是授予用户的操作许可，用于执行特定类型的查询。

权限具有层级结构，具体允许执行哪些查询取决于权限的作用范围。

ClickHouse 中的权限层级如下所示：



* [`ALL`](#all)
  * [`访问控制`](#access-management)
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
  * [`内省`](#introspection)
    * `addressToLine`
    * `addressToLineWithInlines`
    * `addressToSymbol`
    * `demangle`
  * `KILL QUERY`
  * `KILL TRANSACTION`
  * `在分片之间移动分区`
  * [`命名集合管理`](#named-collection-admin)
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
  * [`来源`](#sources)
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

此层级结构的处理示例：

* `ALTER` 权限包含所有其他 `ALTER*` 权限。
* `ALTER CONSTRAINT` 包含 `ALTER ADD CONSTRAINT` 和 `ALTER DROP CONSTRAINT` 权限。

权限可以应用在不同的层级上。了解各层级有助于理解可用于授予权限的语法。

层级（从低到高）：

* `COLUMN` — 权限可以授予列、表、数据库或全局。
* `TABLE` — 权限可以授予表、数据库或全局。
* `VIEW` — 权限可以授予视图、数据库或全局。
* `DICTIONARY` — 权限可以授予字典、数据库或全局。
* `DATABASE` — 权限可以授予数据库或全局。
* `GLOBAL` — 权限只能全局授予。
* `GROUP` — 将不同层级的权限进行分组。当授予 `GROUP` 层级的权限时，仅会授予与所使用语法相对应的那部分组内权限。

允许使用的语法示例：

* `GRANT SELECT(x) ON db.table TO user`
* `GRANT SELECT ON db.* TO user`

不允许使用的语法示例：

* `GRANT CREATE USER(x) ON db.table TO user`
* `GRANT CREATE USER ON db.* TO user`

特殊权限 [ALL](#all) 会为用户账号或角色授予所有权限。

默认情况下，用户账号或角色不具有任何权限。

如果用户或角色没有任何权限，则会显示为 [NONE](#none) 权限。

某些查询在其实现上需要一组权限。例如，要执行 [RENAME](../../sql-reference/statements/optimize.md) 查询，需要具有以下权限：`SELECT`、`CREATE TABLE`、`INSERT` 和 `DROP TABLE`。

### SELECT

允许执行 [SELECT](../../sql-reference/statements/select/index.md) 查询。

权限层级：`COLUMN`。

**描述**

被授予此权限的用户可以在指定数据库和表中，对指定的列列表执行 `SELECT` 查询。如果用户在查询中包含了未被授权的其他列，则查询不会返回任何数据。

考虑以下权限：

```sql
授予 john 在 db.table 上的 SELECT(x,y) 权限
```

此权限允许 `john` 执行任何涉及 `db.table` 中 `x` 和/或 `y` 列数据的 `SELECT` 查询，例如 `SELECT x FROM db.table`。`john` 不能执行 `SELECT z FROM db.table`。`SELECT * FROM db.table` 也不可用。在处理该查询时，ClickHouse 不会返回任何数据，哪怕是 `x` 和 `y`。唯一的例外是当某个表只包含 `x` 和 `y` 两列时，在这种情况下 ClickHouse 会返回所有数据。

### INSERT

允许执行 [INSERT](../../sql-reference/statements/insert-into.md) 查询。

权限级别：`COLUMN`。

**描述**

被授予此权限的用户可以在指定数据库中的指定表上，针对指定列列表执行 `INSERT` 查询。如果用户在查询中包含了未被指定的其他列，该查询将不会插入任何数据。

**示例**

```sql
GRANT INSERT(x,y) ON db.table TO john
```

被授予的权限允许 `john` 向 `db.table` 的 `x` 和/或 `y` 列插入数据。

### ALTER

允许根据以下权限层级执行 [ALTER](../../sql-reference/statements/alter/index.md) 查询：


- `ALTER`。级别：`COLUMN`。
  - `ALTER TABLE`。级别：`GROUP`
  - `ALTER UPDATE`。级别：`COLUMN`。别名：`UPDATE`
  - `ALTER DELETE`。级别：`COLUMN`。别名：`DELETE`
  - `ALTER COLUMN`。级别：`GROUP`
  - `ALTER ADD COLUMN`。级别：`COLUMN`。别名：`ADD COLUMN`
  - `ALTER DROP COLUMN`。级别：`COLUMN`。别名：`DROP COLUMN`
  - `ALTER MODIFY COLUMN`。级别：`COLUMN`。别名：`MODIFY COLUMN`
  - `ALTER COMMENT COLUMN`。级别：`COLUMN`。别名：`COMMENT COLUMN`
  - `ALTER CLEAR COLUMN`。级别：`COLUMN`。别名：`CLEAR COLUMN`
  - `ALTER RENAME COLUMN`。级别：`COLUMN`。别名：`RENAME COLUMN`
  - `ALTER INDEX`。级别：`GROUP`。别名：`INDEX`
  - `ALTER ORDER BY`。级别：`TABLE`。别名：`ALTER MODIFY ORDER BY`、`MODIFY ORDER BY`
  - `ALTER SAMPLE BY`。级别：`TABLE`。别名：`ALTER MODIFY SAMPLE BY`、`MODIFY SAMPLE BY`
  - `ALTER ADD INDEX`。级别：`TABLE`。别名：`ADD INDEX`
  - `ALTER DROP INDEX`。级别：`TABLE`。别名：`DROP INDEX`
  - `ALTER MATERIALIZE INDEX`。级别：`TABLE`。别名：`MATERIALIZE INDEX`
  - `ALTER CLEAR INDEX`。级别：`TABLE`。别名：`CLEAR INDEX`
  - `ALTER CONSTRAINT`。级别：`GROUP`。别名：`CONSTRAINT`
  - `ALTER ADD CONSTRAINT`。级别：`TABLE`。别名：`ADD CONSTRAINT`
  - `ALTER DROP CONSTRAINT`。级别：`TABLE`。别名：`DROP CONSTRAINT`
  - `ALTER TTL`。级别：`TABLE`。别名：`ALTER MODIFY TTL`、`MODIFY TTL`
  - `ALTER MATERIALIZE TTL`。级别：`TABLE`。别名：`MATERIALIZE TTL`
  - `ALTER SETTINGS`。级别：`TABLE`。别名：`ALTER SETTING`、`ALTER MODIFY SETTING`、`MODIFY SETTING`
  - `ALTER MOVE PARTITION`。级别：`TABLE`。别名：`ALTER MOVE PART`、`MOVE PARTITION`、`MOVE PART`
  - `ALTER FETCH PARTITION`。级别：`TABLE`。别名：`ALTER FETCH PART`、`FETCH PARTITION`、`FETCH PART`
  - `ALTER FREEZE PARTITION`。级别：`TABLE`。别名：`FREEZE PARTITION`
  - `ALTER VIEW`。级别：`GROUP`
  - `ALTER VIEW REFRESH`。级别：`VIEW`。别名：`REFRESH VIEW`
  - `ALTER VIEW MODIFY QUERY`。级别：`VIEW`。别名：`ALTER TABLE MODIFY QUERY`
  - `ALTER VIEW MODIFY SQL SECURITY`。级别：`VIEW`。别名：`ALTER TABLE MODIFY SQL SECURITY`

以下示例说明该层级结构的含义：

- `ALTER` 权限包含所有其他 `ALTER*` 权限。
- `ALTER CONSTRAINT` 包含 `ALTER ADD CONSTRAINT` 和 `ALTER DROP CONSTRAINT` 权限。

**注意**

- `MODIFY SETTING` 权限允许修改表引擎设置。它不会影响设置或服务器配置参数。
- `ATTACH` 操作需要 [CREATE](#create) 权限。
- `DETACH` 操作需要 [DROP](#drop) 权限。
- 要通过 [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation) 查询停止一次变更操作，你需要拥有启动该变更的权限。例如，如果你想停止 `ALTER UPDATE` 查询，你需要具有 `ALTER UPDATE`、`ALTER TABLE` 或 `ALTER` 权限。

### BACKUP {#backup}

允许在查询中执行 [`BACKUP`]。关于备份的更多信息，请参阅 ["Backup and Restore"](../../operations/backup.md)。

### CREATE {#create}

允许根据以下权限层级结构执行 [CREATE](../../sql-reference/statements/create/index.md) 和 [ATTACH](../../sql-reference/statements/attach.md) DDL 查询：

- `CREATE`。级别：`GROUP`
  - `CREATE DATABASE`。级别：`DATABASE`
  - `CREATE TABLE`。级别：`TABLE`
    - `CREATE ARBITRARY TEMPORARY TABLE`。级别：`GLOBAL`
      - `CREATE TEMPORARY TABLE`。级别：`GLOBAL`
  - `CREATE VIEW`。级别：`VIEW`
  - `CREATE DICTIONARY`。级别：`DICTIONARY`

**注意**

- 要删除已创建的表，用户需要 [DROP](#drop)。

### CLUSTER {#cluster}

允许执行 `ON CLUSTER` 查询。

```sql title="Syntax"
GRANT CLUSTER ON *.* TO <用户名>
```

默认情况下，使用 `ON CLUSTER` 的查询要求用户具有 `CLUSTER` 权限。
如果在未先授予 `CLUSTER` 权限的情况下在查询中尝试使用 `ON CLUSTER`，将会收到如下错误：

```text
权限不足。执行此查询需要 CLUSTER ON *.* 授权。 
```

可以通过将 `config.xml` 中 `access_control_improvements` 部分里的 `on_cluster_queries_require_cluster_grant` 设置为 `false`（见下文），来更改默认行为。

```yaml title="config.xml"
<access_control_improvements>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```

### DROP

允许根据以下权限层级执行 [DROP](../../sql-reference/statements/drop.md) 和 [DETACH](../../sql-reference/statements/detach.md) 查询：

* `DROP`。级别：`GROUP`
  * `DROP DATABASE`。级别：`DATABASE`
  * `DROP TABLE`。级别：`TABLE`
  * `DROP VIEW`。级别：`VIEW`
  * `DROP DICTIONARY`。级别：`DICTIONARY`

### TRUNCATE

允许执行 [TRUNCATE](../../sql-reference/statements/truncate.md) 查询。

权限级别：`TABLE`。

### OPTIMIZE

允许执行 [OPTIMIZE TABLE](../../sql-reference/statements/optimize.md) 查询。

权限级别：`TABLE`。

### SHOW

允许根据以下权限层级执行 `SHOW`、`DESCRIBE`、`USE` 和 `EXISTS` 查询：

* `SHOW`。级别：`GROUP`
  * `SHOW DATABASES`。级别：`DATABASE`。允许执行 `SHOW DATABASES`、`SHOW CREATE DATABASE`、`USE <database>` 查询。
  * `SHOW TABLES`。级别：`TABLE`。允许执行 `SHOW TABLES`、`EXISTS <table>`、`CHECK <table>` 查询。
  * `SHOW COLUMNS`。级别：`COLUMN`。允许执行 `SHOW CREATE TABLE`、`DESCRIBE` 查询。
  * `SHOW DICTIONARIES`。级别：`DICTIONARY`。允许执行 `SHOW DICTIONARIES`、`SHOW CREATE DICTIONARY`、`EXISTS <dictionary>` 查询。

**注意**

如果用户对指定的表、字典或数据库拥有任何其他相关权限，则该用户同时拥有 `SHOW` 权限。

### KILL QUERY

允许根据以下权限层级执行 [KILL](../../sql-reference/statements/kill.md#kill-query) 查询：

权限级别：`GLOBAL`。

**注意**

`KILL QUERY` 权限允许某个用户终止其他用户的查询。

### ACCESS MANAGEMENT

允许用户执行用于管理用户、角色和行级策略的相关查询。


- `ACCESS MANAGEMENT`. 级别：`GROUP`
  - `CREATE USER`. 级别：`GLOBAL`
  - `ALTER USER`. 级别：`GLOBAL`
  - `DROP USER`. 级别：`GLOBAL`
  - `CREATE ROLE`. 级别：`GLOBAL`
  - `ALTER ROLE`. 级别：`GLOBAL`
  - `DROP ROLE`. 级别：`GLOBAL`
  - `ROLE ADMIN`. 级别：`GLOBAL`
  - `CREATE ROW POLICY`. 级别：`GLOBAL`。别名：`CREATE POLICY`
  - `ALTER ROW POLICY`. 级别：`GLOBAL`。别名：`ALTER POLICY`
  - `DROP ROW POLICY`. 级别：`GLOBAL`。别名：`DROP POLICY`
  - `CREATE QUOTA`. 级别：`GLOBAL`
  - `ALTER QUOTA`. 级别：`GLOBAL`
  - `DROP QUOTA`. 级别：`GLOBAL`
  - `CREATE SETTINGS PROFILE`. 级别：`GLOBAL`。别名：`CREATE PROFILE`
  - `ALTER SETTINGS PROFILE`. 级别：`GLOBAL`。别名：`ALTER PROFILE`
  - `DROP SETTINGS PROFILE`. 级别：`GLOBAL`。别名：`DROP PROFILE`
  - `SHOW ACCESS`. 级别：`GROUP`
    - `SHOW_USERS`. 级别：`GLOBAL`。别名：`SHOW CREATE USER`
    - `SHOW_ROLES`. 级别：`GLOBAL`。别名：`SHOW CREATE ROLE`
    - `SHOW_ROW_POLICIES`. 级别：`GLOBAL`。别名：`SHOW POLICIES`, `SHOW CREATE ROW POLICY`, `SHOW CREATE POLICY`
    - `SHOW_QUOTAS`. 级别：`GLOBAL`。别名：`SHOW CREATE QUOTA`
    - `SHOW_SETTINGS_PROFILES`. 级别：`GLOBAL`。别名：`SHOW PROFILES`, `SHOW CREATE SETTINGS PROFILE`, `SHOW CREATE PROFILE`
  - `ALLOW SQL SECURITY NONE`. 级别：`GLOBAL`。别名：`CREATE SQL SECURITY NONE`, `SQL SECURITY NONE`, `SECURITY NONE`

`ROLE ADMIN` 权限允许用户分配和撤销任意角色，包括那些未以管理员选项授予给该用户的角色。

### SYSTEM {#system}

允许用户根据以下权限层级执行 [SYSTEM](../../sql-reference/statements/system.md) 查询。



- `SYSTEM`. 级别：`GROUP`
  - `SYSTEM SHUTDOWN`. 级别：`GLOBAL`。别名：`SYSTEM KILL`, `SHUTDOWN`
  - `SYSTEM DROP CACHE`. 别名：`DROP CACHE`
    - `SYSTEM DROP DNS CACHE`. 级别：`GLOBAL`。别名：`SYSTEM DROP DNS`, `DROP DNS CACHE`, `DROP DNS`
    - `SYSTEM DROP MARK CACHE`. 级别：`GLOBAL`。别名：`SYSTEM DROP MARK`, `DROP MARK CACHE`, `DROP MARKS`
    - `SYSTEM DROP UNCOMPRESSED CACHE`. 级别：`GLOBAL`。别名：`SYSTEM DROP UNCOMPRESSED`, `DROP UNCOMPRESSED CACHE`, `DROP UNCOMPRESSED`
  - `SYSTEM RELOAD`. 级别：`GROUP`
    - `SYSTEM RELOAD CONFIG`. 级别：`GLOBAL`。别名：`RELOAD CONFIG`
    - `SYSTEM RELOAD DICTIONARY`. 级别：`GLOBAL`。别名：`SYSTEM RELOAD DICTIONARIES`, `RELOAD DICTIONARY`, `RELOAD DICTIONARIES`
      - `SYSTEM RELOAD EMBEDDED DICTIONARIES`. 级别：`GLOBAL`。别名：`RELOAD EMBEDDED DICTIONARIES`
  - `SYSTEM MERGES`. 级别：`TABLE`。别名：`SYSTEM STOP MERGES`, `SYSTEM START MERGES`, `STOP MERGES`, `START MERGES`
  - `SYSTEM TTL MERGES`. 级别：`TABLE`。别名：`SYSTEM STOP TTL MERGES`, `SYSTEM START TTL MERGES`, `STOP TTL MERGES`, `START TTL MERGES`
  - `SYSTEM FETCHES`. 级别：`TABLE`。别名：`SYSTEM STOP FETCHES`, `SYSTEM START FETCHES`, `STOP FETCHES`, `START FETCHES`
  - `SYSTEM MOVES`. 级别：`TABLE`。别名：`SYSTEM STOP MOVES`, `SYSTEM START MOVES`, `STOP MOVES`, `START MOVES`
  - `SYSTEM SENDS`. 级别：`GROUP`。别名：`SYSTEM STOP SENDS`, `SYSTEM START SENDS`, `STOP SENDS`, `START SENDS`
    - `SYSTEM DISTRIBUTED SENDS`. 级别：`TABLE`。别名：`SYSTEM STOP DISTRIBUTED SENDS`, `SYSTEM START DISTRIBUTED SENDS`, `STOP DISTRIBUTED SENDS`, `START DISTRIBUTED SENDS`
    - `SYSTEM REPLICATED SENDS`. 级别：`TABLE`。别名：`SYSTEM STOP REPLICATED SENDS`, `SYSTEM START REPLICATED SENDS`, `STOP REPLICATED SENDS`, `START REPLICATED SENDS`
  - `SYSTEM REPLICATION QUEUES`. 级别：`TABLE`。别名：`SYSTEM STOP REPLICATION QUEUES`, `SYSTEM START REPLICATION QUEUES`, `STOP REPLICATION QUEUES`, `START REPLICATION QUEUES`
  - `SYSTEM SYNC REPLICA`. 级别：`TABLE`。别名：`SYNC REPLICA`
  - `SYSTEM RESTART REPLICA`. 级别：`TABLE`。别名：`RESTART REPLICA`
  - `SYSTEM FLUSH`. 级别：`GROUP`
    - `SYSTEM FLUSH DISTRIBUTED`. 级别：`TABLE`。别名：`FLUSH DISTRIBUTED`
    - `SYSTEM FLUSH LOGS`. 级别：`GLOBAL`。别名：`FLUSH LOGS`

`SYSTEM RELOAD EMBEDDED DICTIONARIES` 权限会通过 `SYSTEM RELOAD DICTIONARY ON *.*` 权限被隐式授予。

### INTROSPECTION {#introspection}

允许使用 [introspection](../../operations/optimizing-performance/sampling-query-profiler.md) 函数。

- `INTROSPECTION`. 级别：`GROUP`。别名：`INTROSPECTION FUNCTIONS`
  - `addressToLine`. 级别：`GLOBAL`
  - `addressToLineWithInlines`. 级别：`GLOBAL`
  - `addressToSymbol`. 级别：`GLOBAL`
  - `demangle`. 级别：`GLOBAL`

### SOURCES {#sources}

允许使用外部数据源。适用于[表引擎](../../engines/table-engines/index.md)和[表函数](/sql-reference/table-functions)。

- `READ`. 级别：`GLOBAL_WITH_PARAMETER`  
- `WRITE`. 级别：`GLOBAL_WITH_PARAMETER`

可能的参数：
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
对数据源的读/写权限分离自 25.7 版本起可用，并且仅在服务器设置
`access_control_improvements.enable_read_write_grants`
启用时生效。

否则，你应使用语法 `GRANT AZURE ON *.* TO user`，它等价于新的 `GRANT READ, WRITE ON AZURE TO user`。
:::

示例：

* 要使用 [MySQL table engine](../../engines/table-engines/integrations/mysql.md) 创建表，你需要 `CREATE TABLE (ON db.table_name)` 和 `MYSQL` 权限。
* 要使用 [mysql table function](../../sql-reference/table-functions/mysql.md)，你需要 `CREATE TEMPORARY TABLE` 和 `MYSQL` 权限。

### 源过滤授权（Source Filter Grants）

:::note
该功能自 25.8 版本起可用，并且仅在服务器设置
`access_control_improvements.enable_read_write_grants`
启用时生效。
:::

你可以通过正则表达式过滤器来授予对特定源 URI 的访问权限，从而对用户可以访问的外部数据源进行细粒度控制。

**语法：**

```sql
GRANT READ ON S3('regexp_pattern') TO user
```

此授权仅允许用户读取与指定正则表达式模式匹配的 S3 URI。

**示例：**

授予对特定 S3 存储桶路径的访问权限：

```sql
-- 仅允许用户从 s3://foo/ 路径读取
GRANT READ ON S3('s3://foo/.*') TO john

-- 允许用户读取特定文件模式
GRANT READ ON S3('s3://mybucket/data/2024/.*\.parquet') TO analyst

-- 可以向同一用户授予多个过滤条件
GRANT READ ON S3('s3://foo/.*') TO john
GRANT READ ON S3('s3://bar/.*') TO john
```

:::warning
Source filter 接受 **regexp** 作为参数，因此如下授权语句：
`GRANT READ ON URL('http://www.google.com') TO john;`

将允许以下查询

```sql
SELECT * FROM url('https://www.google.com');
SELECT * FROM url('https://www-google.com');
```

因为在正则表达式中，`.` 会被视为“任意单个字符”（Any Single Character）。
这可能会导致潜在的安全漏洞。正确的授权语句应该是

```sql
授予 john 对 URL('https://www\.google\.com') 的 读取 权限;
```

:::

**使用 GRANT OPTION 重新授予权限：**

如果原始授权包含 `WITH GRANT OPTION` 选项，可以使用 `GRANT CURRENT GRANTS` 重新授予权限：

```sql
-- 带有 GRANT OPTION 的原始授权
GRANT READ ON S3('s3://foo/.*') TO john WITH GRANT OPTION

-- John 现在可以将此访问权限再授予其他人
GRANT CURRENT GRANTS(READ ON S3) TO alice
```

**重要限制：**

* **不允许部分撤销：** 不能只撤销已授予过滤模式中的一部分。如果需要更改，必须撤销整个授权，并使用新的模式重新授权。
* **不允许使用通配符授权：** 不能使用 `GRANT READ ON *('regexp')` 或类似仅包含通配符的模式。必须提供具体的源（source）。

### dictGet

* `dictGet`。别名：`dictHas`、`dictGetHierarchy`、`dictIsIn`

允许用户执行 [dictGet](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)、[dictHas](../../sql-reference/functions/ext-dict-functions.md#dicthas)、[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)、[dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictisin) 函数。

权限级别：`DICTIONARY`。

**示例**

* `GRANT dictGet ON mydb.mydictionary TO john`
* `GRANT dictGet ON mydictionary TO john`

### displaySecretsInShowAndSelect

如果同时开启
[`display_secrets_in_show_and_select` 服务器设置](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select)
和
[`format_display_secrets_in_show_and_select` 格式设置](../../operations/settings/formats#format_display_secrets_in_show_and_select)，则允许用户在 `SHOW` 和 `SELECT` 查询中查看机密信息（secrets）。

### NAMED COLLECTION ADMIN

允许对指定的命名集合（named collection）执行特定操作。在 23.7 版本之前，它被称为 NAMED COLLECTION CONTROL，自 23.7 起新增了 NAMED COLLECTION ADMIN，并保留 NAMED COLLECTION CONTROL 作为其别名。


- `NAMED COLLECTION ADMIN`。级别：`NAMED_COLLECTION`。别名：`NAMED COLLECTION CONTROL`
  - `CREATE NAMED COLLECTION`。级别：`NAMED_COLLECTION`
  - `DROP NAMED COLLECTION`。级别：`NAMED_COLLECTION`
  - `ALTER NAMED COLLECTION`。级别：`NAMED_COLLECTION`
  - `SHOW NAMED COLLECTIONS`。级别：`NAMED_COLLECTION`。别名：`SHOW NAMED COLLECTIONS`
  - `SHOW NAMED COLLECTIONS SECRETS`。级别：`NAMED_COLLECTION`。别名：`SHOW NAMED COLLECTIONS SECRETS`
  - `NAMED COLLECTION`。级别：`NAMED_COLLECTION`。别名：`NAMED COLLECTION USAGE, USE NAMED COLLECTION`

与其他所有授权（CREATE、DROP、ALTER、SHOW）不同，授权 NAMED COLLECTION 仅在 23.7 中添加，而其他所有授权更早在 22.12 中就已添加。

**示例**

假设一个 named collection 名为 abc，我们将 CREATE NAMED COLLECTION 权限授予用户 john。
- `GRANT CREATE NAMED COLLECTION ON abc TO john`

### TABLE ENGINE {#table-engine}

允许在创建表时使用指定的表引擎。适用于[表引擎](../../engines/table-engines/index.md)。

**示例**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`

### ALL {#all}

<CloudNotSupportedBadge/>

授予用户账户或角色对受管对象的所有权限。

:::note
在 ClickHouse Cloud 中不支持 `ALL` 权限，其中 `default` 用户的权限是受限的。用户可以通过授予 `default_role` 来为某个用户授予最大权限。有关更多详情，请参见[此处](/cloud/security/manage-cloud-users)。
用户还可以以 `default` 用户身份使用 `GRANT CURRENT GRANTS` 来实现与 `ALL` 类似的效果。
:::

### NONE {#none}

不会授予任何权限。

### ADMIN OPTION {#admin-option}

`ADMIN OPTION` 权限允许用户将其角色授予另一个用户。
