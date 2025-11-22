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

若要撤销权限，请使用 [REVOKE](../../sql-reference/statements/revoke.md) 语句。还可以使用 [SHOW GRANTS](../../sql-reference/statements/show.md#show-grants) 语句列出已授予的权限。



## 授予权限语法 {#granting-privilege-syntax}

```sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — 权限类型。
- `role` — ClickHouse 用户角色。
- `user` — ClickHouse 用户账户。

`WITH GRANT OPTION` 子句授予 `user` 或 `role` 执行 `GRANT` 查询的权限。用户可以授予其拥有的相同范围或更小范围的权限。
`WITH REPLACE OPTION` 子句将 `user` 或 `role` 的旧权限替换为新权限,如果未指定该选项则追加权限。


## 分配角色语法 {#assigning-role-syntax}

```sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

- `role` — ClickHouse 用户角色。
- `user` — ClickHouse 用户账户。

`WITH ADMIN OPTION` 子句将 [ADMIN OPTION](#admin-option) 权限授予 `user` 或 `role`。
`WITH REPLACE OPTION` 子句使用新角色替换 `user` 或 `role` 的旧角色,如果未指定该选项则追加角色。


## 授予当前权限语法 {#grant-current-grants-syntax}

```sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — 权限类型。
- `role` — ClickHouse 用户角色。
- `user` — ClickHouse 用户账户。

使用 `CURRENT GRANTS` 语句可以将所有指定的权限授予给定的用户或角色。
如果未指定任何权限,则给定的用户或角色将获得 `CURRENT_USER` 的所有可用权限。


## 用法 {#usage}

要使用 `GRANT`,您的账户必须具有 `GRANT OPTION` 权限。您只能在自己账户的权限范围内授予权限。

例如,管理员通过以下查询向 `john` 账户授予了权限:

```sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

这意味着 `john` 有权执行:

- `SELECT x,y FROM db.table`.
- `SELECT x FROM db.table`.
- `SELECT y FROM db.table`.

`john` 无法执行 `SELECT z FROM db.table`。`SELECT * FROM db.table` 同样不可用。处理此查询时,ClickHouse 不会返回任何数据,即使是 `x` 和 `y` 也不返回。唯一的例外是当表仅包含 `x` 和 `y` 列时,在这种情况下 ClickHouse 会返回所有数据。

此外,`john` 拥有 `GRANT OPTION` 权限,因此可以向其他用户授予相同或更小范围的权限。

始终允许访问 `system` 数据库(因为该数据库用于处理查询)。

:::note
虽然新用户默认可以访问许多系统表,但在没有授权的情况下,他们可能无法默认访问所有系统表。
此外,出于安全原因,ClickHouse Cloud 用户对某些系统表(如 `system.zookeeper`)的访问受到限制。
:::

您可以在一个查询中向多个账户授予多个权限。查询 `GRANT SELECT, INSERT ON *.* TO john, robin` 允许账户 `john` 和 `robin` 对服务器上所有数据库中的所有表执行 `INSERT` 和 `SELECT` 查询。


## 通配符授权 {#wildcard-grants}

在指定权限时,可以使用星号(`*`)代替表名或数据库名。例如,`GRANT SELECT ON db.* TO john` 查询允许 `john` 对 `db` 数据库中的所有表执行 `SELECT` 查询。
此外,可以省略数据库名。在这种情况下,权限将授予当前数据库。
例如,`GRANT SELECT ON * TO john` 授予当前数据库中所有表的权限,`GRANT SELECT ON mytable TO john` 授予当前数据库中 `mytable` 表的权限。

:::note
下述功能从 ClickHouse 24.10 版本开始提供。
:::

还可以在表名或数据库名的末尾添加星号。此功能允许对表路径的抽象前缀授予权限。
示例:`GRANT SELECT ON db.my_tables* TO john`。此查询允许 `john` 对 `db` 数据库中所有以 `my_tables` 为前缀的表执行 `SELECT` 查询。

更多示例:

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

在已授权路径内新创建的所有表将自动继承其父级的所有授权。
例如,如果运行 `GRANT SELECT ON db.* TO john` 查询,然后创建一个新表 `db.new_table`,用户 `john` 将能够运行 `SELECT * FROM db.new_table` 查询。

星号**只能**用于前缀:

```sql
GRANT SELECT ON db.* TO john -- 正确
GRANT SELECT ON db*.* TO john -- 正确

GRANT SELECT ON *.my_table TO john -- 错误
GRANT SELECT ON foo*bar TO john -- 错误
GRANT SELECT ON *suffix TO john -- 错误
GRANT SELECT(foo) ON db.table* TO john -- 错误
```


## 权限 {#privileges}

权限是授予用户执行特定类型查询的许可。

权限具有层次结构,允许执行的查询集合取决于权限的作用域。

ClickHouse 中的权限层次结构如下所示:


* [`ALL`](#all)
  * [`访问管理`](#access-management)
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
  * [`自省（INTROSPECTION）`](#introspection)
    * `addressToLine`
    * `addressToLineWithInlines`
    * `addressToSymbol`
    * `demangle`
  * `KILL QUERY`
  * `KILL TRANSACTION`
  * `在分片之间移动分区`
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

层次结构的处理示例：

- `ALTER` 权限包含所有其他 `ALTER*` 权限。
- `ALTER CONSTRAINT` 包含 `ALTER ADD CONSTRAINT` 和 `ALTER DROP CONSTRAINT` 权限。

权限应用于不同级别。了解级别可以确定该权限可用的语法。

级别（从低到高）：

- `COLUMN` — 权限可授予列、表、数据库或全局级别。
- `TABLE` — 权限可授予表、数据库或全局级别。
- `VIEW` — 权限可授予视图、数据库或全局级别。
- `DICTIONARY` — 权限可授予字典、数据库或全局级别。
- `DATABASE` — 权限可授予数据库或全局级别。
- `GLOBAL` — 权限只能授予全局级别。
- `GROUP` — 对不同级别的权限进行分组。授予 `GROUP` 级别权限时,仅授予该组中与所用语法相对应的权限。

允许的语法示例：

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

不允许的语法示例：

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

特殊权限 [ALL](#all) 向用户账户或角色授予所有权限。

默认情况下,用户账户或角色没有任何权限。

如果用户或角色没有权限,则显示为 [NONE](#none) 权限。

某些查询根据其实现需要一组权限。例如,要执行 [RENAME](../../sql-reference/statements/optimize.md) 查询,需要以下权限：`SELECT`、`CREATE TABLE`、`INSERT` 和 `DROP TABLE`。

### SELECT {#select}

允许执行 [SELECT](../../sql-reference/statements/select/index.md) 查询。

权限级别：`COLUMN`。

**描述**

被授予此权限的用户可以对指定表和数据库中的指定列列表执行 `SELECT` 查询。如果用户包含指定之外的其他列,查询将不返回任何数据。

考虑以下权限：

```sql
GRANT SELECT(x,y) ON db.table TO john
```

此权限允许 `john` 执行任何涉及 `db.table` 中 `x` 和/或 `y` 列数据的 `SELECT` 查询,例如 `SELECT x FROM db.table`。`john` 无法执行 `SELECT z FROM db.table`。`SELECT * FROM db.table` 也不可用。处理此查询时,ClickHouse 不会返回任何数据,即使是 `x` 和 `y` 也不会。唯一的例外是表仅包含 `x` 和 `y` 列,在这种情况下 ClickHouse 会返回所有数据。

### INSERT {#insert}

允许执行 [INSERT](../../sql-reference/statements/insert-into.md) 查询。

权限级别：`COLUMN`。

**描述**

被授予此权限的用户可以对指定表和数据库中的指定列列表执行 `INSERT` 查询。如果用户包含指定之外的其他列,查询将不会插入任何数据。

**示例**

```sql
GRANT INSERT(x,y) ON db.table TO john
```

授予的权限允许 `john` 向 `db.table` 中的 `x` 和/或 `y` 列插入数据。

### ALTER {#alter}

允许根据以下权限层次结构执行 [ALTER](../../sql-reference/statements/alter/index.md) 查询：


- `ALTER`。级别:`COLUMN`。
  - `ALTER TABLE`。级别:`GROUP`
  - `ALTER UPDATE`。级别:`COLUMN`。别名:`UPDATE`
  - `ALTER DELETE`。级别:`COLUMN`。别名:`DELETE`
  - `ALTER COLUMN`。级别:`GROUP`
  - `ALTER ADD COLUMN`。级别:`COLUMN`。别名:`ADD COLUMN`
  - `ALTER DROP COLUMN`。级别:`COLUMN`。别名:`DROP COLUMN`
  - `ALTER MODIFY COLUMN`。级别:`COLUMN`。别名:`MODIFY COLUMN`
  - `ALTER COMMENT COLUMN`。级别:`COLUMN`。别名:`COMMENT COLUMN`
  - `ALTER CLEAR COLUMN`。级别:`COLUMN`。别名:`CLEAR COLUMN`
  - `ALTER RENAME COLUMN`。级别:`COLUMN`。别名:`RENAME COLUMN`
  - `ALTER INDEX`。级别:`GROUP`。别名:`INDEX`
  - `ALTER ORDER BY`。级别:`TABLE`。别名:`ALTER MODIFY ORDER BY`、`MODIFY ORDER BY`
  - `ALTER SAMPLE BY`。级别:`TABLE`。别名:`ALTER MODIFY SAMPLE BY`、`MODIFY SAMPLE BY`
  - `ALTER ADD INDEX`。级别:`TABLE`。别名:`ADD INDEX`
  - `ALTER DROP INDEX`。级别:`TABLE`。别名:`DROP INDEX`
  - `ALTER MATERIALIZE INDEX`。级别:`TABLE`。别名:`MATERIALIZE INDEX`
  - `ALTER CLEAR INDEX`。级别:`TABLE`。别名:`CLEAR INDEX`
  - `ALTER CONSTRAINT`。级别:`GROUP`。别名:`CONSTRAINT`
  - `ALTER ADD CONSTRAINT`。级别:`TABLE`。别名:`ADD CONSTRAINT`
  - `ALTER DROP CONSTRAINT`。级别:`TABLE`。别名:`DROP CONSTRAINT`
  - `ALTER TTL`。级别:`TABLE`。别名:`ALTER MODIFY TTL`、`MODIFY TTL`
  - `ALTER MATERIALIZE TTL`。级别:`TABLE`。别名:`MATERIALIZE TTL`
  - `ALTER SETTINGS`。级别:`TABLE`。别名:`ALTER SETTING`、`ALTER MODIFY SETTING`、`MODIFY SETTING`
  - `ALTER MOVE PARTITION`。级别:`TABLE`。别名:`ALTER MOVE PART`、`MOVE PARTITION`、`MOVE PART`
  - `ALTER FETCH PARTITION`。级别:`TABLE`。别名:`ALTER FETCH PART`、`FETCH PARTITION`、`FETCH PART`
  - `ALTER FREEZE PARTITION`。级别:`TABLE`。别名:`FREEZE PARTITION`
  - `ALTER VIEW`。级别:`GROUP`
  - `ALTER VIEW REFRESH`。级别:`VIEW`。别名:`REFRESH VIEW`
  - `ALTER VIEW MODIFY QUERY`。级别:`VIEW`。别名:`ALTER TABLE MODIFY QUERY`
  - `ALTER VIEW MODIFY SQL SECURITY`。级别:`VIEW`。别名:`ALTER TABLE MODIFY SQL SECURITY`

层次结构处理示例:

- `ALTER` 权限包含所有其他 `ALTER*` 权限。
- `ALTER CONSTRAINT` 包含 `ALTER ADD CONSTRAINT` 和 `ALTER DROP CONSTRAINT` 权限。

**注意事项**

- `MODIFY SETTING` 权限允许修改表引擎设置,不影响服务器配置参数。
- `ATTACH` 操作需要 [CREATE](#create) 权限。
- `DETACH` 操作需要 [DROP](#drop) 权限。
- 要通过 [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation) 查询停止变更操作,您需要拥有启动该变更操作的权限。例如,如果要停止 `ALTER UPDATE` 查询,则需要 `ALTER UPDATE`、`ALTER TABLE` 或 `ALTER` 权限。

### BACKUP {#backup}

允许在查询中执行 [`BACKUP`]。有关备份的更多信息,请参阅["备份和恢复"](../../operations/backup.md)。

### CREATE {#create}

允许根据以下权限层次结构执行 [CREATE](../../sql-reference/statements/create/index.md) 和 [ATTACH](../../sql-reference/statements/attach.md) DDL 查询:

- `CREATE`。级别:`GROUP`
  - `CREATE DATABASE`。级别:`DATABASE`
  - `CREATE TABLE`。级别:`TABLE`
    - `CREATE ARBITRARY TEMPORARY TABLE`。级别:`GLOBAL`
      - `CREATE TEMPORARY TABLE`。级别:`GLOBAL`
  - `CREATE VIEW`。级别:`VIEW`
  - `CREATE DICTIONARY`。级别:`DICTIONARY`

**注意事项**

- 要删除已创建的表,用户需要 [DROP](#drop) 权限。

### CLUSTER {#cluster}

允许执行 `ON CLUSTER` 查询。


```sql title="语法"
GRANT CLUSTER ON *.* TO <username>
```

默认情况下,带有 `ON CLUSTER` 的查询要求用户具有 `CLUSTER` 授权。
如果在未授予 `CLUSTER` 权限的情况下尝试在查询中使用 `ON CLUSTER`,将会收到以下错误:

```text
权限不足。要执行此查询,必须拥有 CLUSTER ON *.* 授权。
```

可以通过将 `config.xml` 中 `access_control_improvements` 部分的 `on_cluster_queries_require_cluster_grant` 配置项(见下文)设置为 `false` 来更改默认行为。

```yaml title="config.xml"
<access_control_improvements>
<on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```

### DROP {#drop}

允许根据以下权限层级执行 [DROP](../../sql-reference/statements/drop.md) 和 [DETACH](../../sql-reference/statements/detach.md) 查询:

- `DROP`. 级别:`GROUP`
  - `DROP DATABASE`. 级别:`DATABASE`
  - `DROP TABLE`. 级别:`TABLE`
  - `DROP VIEW`. 级别:`VIEW`
  - `DROP DICTIONARY`. 级别:`DICTIONARY`

### TRUNCATE {#truncate}

允许执行 [TRUNCATE](../../sql-reference/statements/truncate.md) 查询。

权限级别:`TABLE`。

### OPTIMIZE {#optimize}

允许执行 [OPTIMIZE TABLE](../../sql-reference/statements/optimize.md) 查询。

权限级别:`TABLE`。

### SHOW {#show}

允许根据以下权限层级执行 `SHOW`、`DESCRIBE`、`USE` 和 `EXISTS` 查询:

- `SHOW`. 级别:`GROUP`
  - `SHOW DATABASES`. 级别:`DATABASE`。允许执行 `SHOW DATABASES`、`SHOW CREATE DATABASE`、`USE <database>` 查询。
  - `SHOW TABLES`. 级别:`TABLE`。允许执行 `SHOW TABLES`、`EXISTS <table>`、`CHECK <table>` 查询。
  - `SHOW COLUMNS`. 级别:`COLUMN`。允许执行 `SHOW CREATE TABLE`、`DESCRIBE` 查询。
  - `SHOW DICTIONARIES`. 级别:`DICTIONARY`。允许执行 `SHOW DICTIONARIES`、`SHOW CREATE DICTIONARY`、`EXISTS <dictionary>` 查询。

**注意**

如果用户拥有与指定表、字典或数据库相关的任何其他权限,则该用户具有 `SHOW` 权限。

### KILL QUERY {#kill-query}

允许根据以下权限层级执行 [KILL](../../sql-reference/statements/kill.md#kill-query) 查询:

权限级别:`GLOBAL`。

**注意**

`KILL QUERY` 权限允许用户终止其他用户的查询。

### ACCESS MANAGEMENT {#access-management}

允许用户执行管理用户、角色和行策略的查询。


- `ACCESS MANAGEMENT`。级别:`GROUP`
  - `CREATE USER`。级别:`GLOBAL`
  - `ALTER USER`。级别:`GLOBAL`
  - `DROP USER`。级别:`GLOBAL`
  - `CREATE ROLE`。级别:`GLOBAL`
  - `ALTER ROLE`。级别:`GLOBAL`
  - `DROP ROLE`。级别:`GLOBAL`
  - `ROLE ADMIN`。级别:`GLOBAL`
  - `CREATE ROW POLICY`。级别:`GLOBAL`。别名:`CREATE POLICY`
  - `ALTER ROW POLICY`。级别:`GLOBAL`。别名:`ALTER POLICY`
  - `DROP ROW POLICY`。级别:`GLOBAL`。别名:`DROP POLICY`
  - `CREATE QUOTA`。级别:`GLOBAL`
  - `ALTER QUOTA`。级别:`GLOBAL`
  - `DROP QUOTA`。级别:`GLOBAL`
  - `CREATE SETTINGS PROFILE`。级别:`GLOBAL`。别名:`CREATE PROFILE`
  - `ALTER SETTINGS PROFILE`。级别:`GLOBAL`。别名:`ALTER PROFILE`
  - `DROP SETTINGS PROFILE`。级别:`GLOBAL`。别名:`DROP PROFILE`
  - `SHOW ACCESS`。级别:`GROUP`
    - `SHOW_USERS`。级别:`GLOBAL`。别名:`SHOW CREATE USER`
    - `SHOW_ROLES`。级别:`GLOBAL`。别名:`SHOW CREATE ROLE`
    - `SHOW_ROW_POLICIES`。级别:`GLOBAL`。别名:`SHOW POLICIES`、`SHOW CREATE ROW POLICY`、`SHOW CREATE POLICY`
    - `SHOW_QUOTAS`。级别:`GLOBAL`。别名:`SHOW CREATE QUOTA`
    - `SHOW_SETTINGS_PROFILES`。级别:`GLOBAL`。别名:`SHOW PROFILES`、`SHOW CREATE SETTINGS PROFILE`、`SHOW CREATE PROFILE`
  - `ALLOW SQL SECURITY NONE`。级别:`GLOBAL`。别名:`CREATE SQL SECURITY NONE`、`SQL SECURITY NONE`、`SECURITY NONE`

`ROLE ADMIN` 权限允许用户分配和撤销任何角色,包括那些未以管理员选项分配给该用户的角色。

### SYSTEM {#system}

允许用户根据以下权限层级执行 [SYSTEM](../../sql-reference/statements/system.md) 查询。


- `SYSTEM`。级别：`GROUP`
  - `SYSTEM SHUTDOWN`。级别：`GLOBAL`。别名：`SYSTEM KILL`、`SHUTDOWN`
  - `SYSTEM DROP CACHE`。别名：`DROP CACHE`
    - `SYSTEM DROP DNS CACHE`。级别：`GLOBAL`。别名：`SYSTEM DROP DNS`、`DROP DNS CACHE`、`DROP DNS`
    - `SYSTEM DROP MARK CACHE`。级别：`GLOBAL`。别名：`SYSTEM DROP MARK`、`DROP MARK CACHE`、`DROP MARKS`
    - `SYSTEM DROP UNCOMPRESSED CACHE`。级别：`GLOBAL`。别名：`SYSTEM DROP UNCOMPRESSED`、`DROP UNCOMPRESSED CACHE`、`DROP UNCOMPRESSED`
  - `SYSTEM RELOAD`。级别：`GROUP`
    - `SYSTEM RELOAD CONFIG`。级别：`GLOBAL`。别名：`RELOAD CONFIG`
    - `SYSTEM RELOAD DICTIONARY`。级别：`GLOBAL`。别名：`SYSTEM RELOAD DICTIONARIES`、`RELOAD DICTIONARY`、`RELOAD DICTIONARIES`
      - `SYSTEM RELOAD EMBEDDED DICTIONARIES`。级别：`GLOBAL`。别名：`RELOAD EMBEDDED DICTIONARIES`
  - `SYSTEM MERGES`。级别：`TABLE`。别名：`SYSTEM STOP MERGES`、`SYSTEM START MERGES`、`STOP MERGES`、`START MERGES`
  - `SYSTEM TTL MERGES`。级别：`TABLE`。别名：`SYSTEM STOP TTL MERGES`、`SYSTEM START TTL MERGES`、`STOP TTL MERGES`、`START TTL MERGES`
  - `SYSTEM FETCHES`。级别：`TABLE`。别名：`SYSTEM STOP FETCHES`、`SYSTEM START FETCHES`、`STOP FETCHES`、`START FETCHES`
  - `SYSTEM MOVES`。级别：`TABLE`。别名：`SYSTEM STOP MOVES`、`SYSTEM START MOVES`、`STOP MOVES`、`START MOVES`
  - `SYSTEM SENDS`。级别：`GROUP`。别名：`SYSTEM STOP SENDS`、`SYSTEM START SENDS`、`STOP SENDS`、`START SENDS`
    - `SYSTEM DISTRIBUTED SENDS`。级别：`TABLE`。别名：`SYSTEM STOP DISTRIBUTED SENDS`、`SYSTEM START DISTRIBUTED SENDS`、`STOP DISTRIBUTED SENDS`、`START DISTRIBUTED SENDS`
    - `SYSTEM REPLICATED SENDS`。级别：`TABLE`。别名：`SYSTEM STOP REPLICATED SENDS`、`SYSTEM START REPLICATED SENDS`、`STOP REPLICATED SENDS`、`START REPLICATED SENDS`
  - `SYSTEM REPLICATION QUEUES`。级别：`TABLE`。别名：`SYSTEM STOP REPLICATION QUEUES`、`SYSTEM START REPLICATION QUEUES`、`STOP REPLICATION QUEUES`、`START REPLICATION QUEUES`
  - `SYSTEM SYNC REPLICA`。级别：`TABLE`。别名：`SYNC REPLICA`
  - `SYSTEM RESTART REPLICA`。级别：`TABLE`。别名：`RESTART REPLICA`
  - `SYSTEM FLUSH`。级别：`GROUP`
    - `SYSTEM FLUSH DISTRIBUTED`。级别：`TABLE`。别名：`FLUSH DISTRIBUTED`
    - `SYSTEM FLUSH LOGS`。级别：`GLOBAL`。别名：`FLUSH LOGS`

`SYSTEM RELOAD EMBEDDED DICTIONARIES` 权限由 `SYSTEM RELOAD DICTIONARY ON *.*` 权限隐式授予。

### INTROSPECTION {#introspection}

允许使用[内省](../../operations/optimizing-performance/sampling-query-profiler.md)函数。

- `INTROSPECTION`。级别：`GROUP`。别名：`INTROSPECTION FUNCTIONS`
  - `addressToLine`。级别：`GLOBAL`
  - `addressToLineWithInlines`。级别：`GLOBAL`
  - `addressToSymbol`。级别：`GLOBAL`
  - `demangle`。级别：`GLOBAL`

### SOURCES {#sources}

允许使用外部数据源。适用于[表引擎](../../engines/table-engines/index.md)和[表函数](/sql-reference/table-functions)。

- `READ`。级别：`GLOBAL_WITH_PARAMETER`
- `WRITE`。级别：`GLOBAL_WITH_PARAMETER`

可用参数：

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
从版本 25.7 开始支持对数据源的 READ/WRITE 授权分离,且仅在启用服务器设置
`access_control_improvements.enable_read_write_grants` 时可用

否则,您应使用语法 `GRANT AZURE ON *.* TO user`,它等同于新语法 `GRANT READ, WRITE ON AZURE TO user`
:::

示例:

- 要使用 [MySQL 表引擎](../../engines/table-engines/integrations/mysql.md) 创建表,需要 `CREATE TABLE (ON db.table_name)` 和 `MYSQL` 权限。
- 要使用 [mysql 表函数](../../sql-reference/table-functions/mysql.md),需要 `CREATE TEMPORARY TABLE` 和 `MYSQL` 权限。

### 数据源过滤授权 {#source-filter-grants}

:::note
此功能从版本 25.8 开始支持,且仅在启用服务器设置
`access_control_improvements.enable_read_write_grants` 时可用
:::

您可以使用正则表达式过滤器授予对特定数据源 URI 的访问权限。这允许对用户可访问的外部数据源进行细粒度控制。

**语法:**

```sql
GRANT READ ON S3('regexp_pattern') TO user
```

此授权将允许用户仅从匹配指定正则表达式模式的 S3 URI 读取数据。

**示例:**

授予对特定 S3 存储桶路径的访问权限:

```sql
-- 允许用户仅从 s3://foo/ 路径读取
GRANT READ ON S3('s3://foo/.*') TO john

-- 允许用户从特定文件模式读取
GRANT READ ON S3('s3://mybucket/data/2024/.*\.parquet') TO analyst

-- 可以向同一用户授予多个过滤器
GRANT READ ON S3('s3://foo/.*') TO john
GRANT READ ON S3('s3://bar/.*') TO john
```

:::warning
数据源过滤器使用 **正则表达式** 作为参数,因此授权
`GRANT READ ON URL('http://www.google.com') TO john;`

将允许以下查询

```sql
SELECT * FROM url('https://www.google.com');
SELECT * FROM url('https://www-google.com');
```

因为 `.` 在正则表达式中被视为 `任意单个字符`。
这可能导致潜在的安全漏洞。正确的授权应为

```sql
GRANT READ ON URL('https://www\.google\.com') TO john;
```

:::

**使用 GRANT OPTION 重新授权:**

如果原始授权具有 `WITH GRANT OPTION`,则可以使用 `GRANT CURRENT GRANTS` 重新授权:

```sql
-- 带有 GRANT OPTION 的原始授权
GRANT READ ON S3('s3://foo/.*') TO john WITH GRANT OPTION

-- John 现在可以将此访问权限重新授予其他人
GRANT CURRENT GRANTS(READ ON S3) TO alice
```

**重要限制:**

- **不允许部分撤销:** 您不能撤销已授予过滤器模式的子集。如需更改,必须撤销整个授权并使用新模式重新授权。
- **不允许通配符授权:** 您不能使用 `GRANT READ ON *('regexp')` 或类似的仅通配符模式。必须指定具体的数据源。

### dictGet {#dictget}

- `dictGet`。别名:`dictHas`、`dictGetHierarchy`、`dictIsIn`

允许用户执行 [dictGet](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)、[dictHas](../../sql-reference/functions/ext-dict-functions.md#dicthas)、[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)、[dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictisin) 函数。

权限级别:`DICTIONARY`。

**示例**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`

### displaySecretsInShowAndSelect {#displaysecretsinshowandselect}

如果同时启用了
[`display_secrets_in_show_and_select` 服务器设置](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select)
和
[`format_display_secrets_in_show_and_select` 格式设置](../../operations/settings/formats#format_display_secrets_in_show_and_select),
则允许用户在 `SHOW` 和 `SELECT` 查询中查看敏感信息。

### NAMED COLLECTION ADMIN {#named-collection-admin}

允许对指定的命名集合执行特定操作。在版本 23.7 之前称为 NAMED COLLECTION CONTROL,版本 23.7 之后添加了 NAMED COLLECTION ADMIN,并将 NAMED COLLECTION CONTROL 保留为别名。


- `NAMED COLLECTION ADMIN`。级别:`NAMED_COLLECTION`。别名:`NAMED COLLECTION CONTROL`
  - `CREATE NAMED COLLECTION`。级别:`NAMED_COLLECTION`
  - `DROP NAMED COLLECTION`。级别:`NAMED_COLLECTION`
  - `ALTER NAMED COLLECTION`。级别:`NAMED_COLLECTION`
  - `SHOW NAMED COLLECTIONS`。级别:`NAMED_COLLECTION`。别名:`SHOW NAMED COLLECTIONS`
  - `SHOW NAMED COLLECTIONS SECRETS`。级别:`NAMED_COLLECTION`。别名:`SHOW NAMED COLLECTIONS SECRETS`
  - `NAMED COLLECTION`。级别:`NAMED_COLLECTION`。别名:`NAMED COLLECTION USAGE, USE NAMED COLLECTION`

与所有其他授权(CREATE、DROP、ALTER、SHOW)不同,NAMED COLLECTION 授权仅在 23.7 版本中添加,而其他授权则在更早的 22.12 版本中添加。

**示例**

假设命名集合名为 abc,我们将 CREATE NAMED COLLECTION 权限授予用户 john。

- `GRANT CREATE NAMED COLLECTION ON abc TO john`

### TABLE ENGINE {#table-engine}

允许在创建表时使用指定的表引擎。适用于[表引擎](../../engines/table-engines/index.md)。

**示例**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`

### ALL {#all}

<CloudNotSupportedBadge />

将受管实体上的所有权限授予用户账户或角色。

:::note
ClickHouse Cloud 不支持 `ALL` 权限,其中 `default` 用户具有受限权限。用户可以通过授予 `default_role` 来向用户授予最大权限。详情请参阅[此处](/cloud/security/manage-cloud-users)。
用户也可以作为 default 用户使用 `GRANT CURRENT GRANTS` 来实现与 `ALL` 类似的效果。
:::

### NONE {#none}

不授予任何权限。

### ADMIN OPTION {#admin-option}

`ADMIN OPTION` 权限允许用户将其角色授予其他用户。
