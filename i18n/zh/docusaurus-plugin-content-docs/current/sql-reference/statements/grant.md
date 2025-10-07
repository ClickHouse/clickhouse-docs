---
'description': 'GRANT 语句 的文档'
'sidebar_label': 'GRANT'
'sidebar_position': 38
'slug': '/sql-reference/statements/grant'
'title': 'GRANT 语句'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# GRANT 语句

- 将 [权限](#privileges) 授予 ClickHouse 用户账户或角色。
- 将角色分配给用户账户或其他角色。

要撤销权限，请使用 [REVOKE](../../sql-reference/statements/revoke.md) 语句。您还可以使用 [SHOW GRANTS](../../sql-reference/statements/show.md#show-grants) 语句列出已授予的权限。

## 授予权限语法 {#granting-privilege-syntax}

```sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` - 权限的类型。
- `role` - ClickHouse 用户角色。
- `user` - ClickHouse 用户账户。

`WITH GRANT OPTION` 子句授予 `user` 或 `role` 执行 `GRANT` 查询的权限。用户可以授予他们拥有的相同范围及以下的权限。
`WITH REPLACE OPTION` 子句用新的权限替换 `user` 或 `role` 的旧权限，如果未指定，则附加权限。

## 分配角色语法 {#assigning-role-syntax}

```sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

- `role` - ClickHouse 用户角色。
- `user` - ClickHouse 用户账户。

`WITH ADMIN OPTION` 子句授予 `user` 或 `role` [ADMIN OPTION](#admin-option) 权限。
`WITH REPLACE OPTION` 子句用新角色替换 `user` 或 `role` 的旧角色，如果未指定，则附加角色。

## 授予当前权限语法 {#grant-current-grants-syntax}
```sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` - 权限的类型。
- `role` - ClickHouse 用户角色。
- `user` - ClickHouse 用户账户。

使用 `CURRENT GRANTS` 语句可以将所有指定的权限授予给指定的用户或角色。
如果未指定任何权限，则指定的用户或角色将会获得 `CURRENT_USER` 的所有可用权限。

## 使用方法 {#usage}

要使用 `GRANT`，您的账户必须具有 `GRANT OPTION` 权限。您只能在您账户权限的范围内授予权限。

例如，管理员通过以下查询将权限授予 `john` 账户：

```sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

这意味着 `john` 有权限执行：

- `SELECT x,y FROM db.table`。
- `SELECT x FROM db.table`。
- `SELECT y FROM db.table`。

`john` 不能执行 `SELECT z FROM db.table`。`SELECT * FROM db.table` 也不可用。在处理此查询时，ClickHouse 不会返回任何数据，即使是 `x` 和 `y`。唯一的例外是，如果表中仅包含 `x` 和 `y` 列。在这种情况下，ClickHouse 返回所有数据。

同时 `john` 拥有 `GRANT OPTION` 权限，因此可以授予其他用户相同或更小范围的权限。

对 `system` 数据库的访问总是被允许（因为该数据库用于处理查询）。

:::note
虽然有许多系统表新的用户默认可以访问，但他们可能无法在没有授权的情况下访问每个系统表。
此外，由于安全原因，Cloud 用户对某些系统表（如 `system.zookeeper`）的访问受到限制。
:::

您可以在一个查询中将多个权限授予多个账户。查询 `GRANT SELECT, INSERT ON *.* TO john, robin` 允许账户 `john` 和 `robin` 执行对服务器上所有数据库中所有表的 `INSERT` 和 `SELECT` 查询。

## 通配符授权 {#wildcard-grants}

在指定权限时，您可以使用星号（`*`）而不是表名或数据库名。例如，查询 `GRANT SELECT ON db.* TO john` 允许 `john` 执行对 `db` 数据库中所有表的 `SELECT` 查询。
此外，您也可以省略数据库名。在这种情况下，权限将授予当前数据库。
例如，`GRANT SELECT ON * TO john` 授予对当前数据库中所有表的权限，`GRANT SELECT ON mytable TO john` 授予对当前数据库中 `mytable` 表的权限。

:::note
以下描述的特性在 24.10 ClickHouse 版本中可用。
:::

您还可以在表名或数据库名后添加星号。这一特性允许您在表路径的抽象前缀上授予权限。
示例：`GRANT SELECT ON db.my_tables* TO john`。此查询允许 `john` 执行对 `db` 数据库中所有以 `my_tables*` 为前缀的表的 `SELECT` 查询。

更多示例：

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

在授予路径内创建的所有新表将自动继承其父级的所有权限。
例如，如果您运行 `GRANT SELECT ON db.* TO john` 查询，然后创建新表 `db.new_table`，用户 `john` 将能够运行 `SELECT * FROM db.new_table` 查询。

您只能为前缀指定星号：
```sql
GRANT SELECT ON db.* TO john -- correct
GRANT SELECT ON db*.* TO john -- correct

GRANT SELECT ON *.my_table TO john -- wrong
GRANT SELECT ON foo*bar TO john -- wrong
GRANT SELECT ON *suffix TO john -- wrong
GRANT SELECT(foo) ON db.table* TO john -- wrong
```

## 权限 {#privileges}

权限是授予用户执行特定类型查询的权限。

权限具有分层结构，允许的查询集取决于权限范围。

ClickHouse 中权限的层次结构如下所示：

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

该层次结构处理的示例：

- `ALTER` 权限包括所有其他 `ALTER*` 权限。
- `ALTER CONSTRAINT` 包括 `ALTER ADD CONSTRAINT` 和 `ALTER DROP CONSTRAINT` 权限。

权限在不同层次上应用。了解某个层次可以指示可用于权限的语法。

层次（从低到高）：

- `COLUMN` - 权限可授予列、表、数据库或全局。
- `TABLE` - 权限可授予表、数据库或全局。
- `VIEW` - 权限可授予视图、数据库或全局。
- `DICTIONARY` - 权限可授予字典、数据库或全局。
- `DATABASE` - 权限可授予数据库或全局。
- `GLOBAL` - 权限只能全局授予。
- `GROUP` - 将不同层次的权限分组。当授予 `GROUP` 级别的权限时，仅授予与所用语法对应的权限。

允许的语法示例：

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

不允许的语法示例：

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

特殊权限 [ALL](#all) 将所有权限授予用户账户或角色。

默认情况下，用户账户或角色没有权限。

如果用户或角色没有权限，则显示为 [NONE](#none) 权限。

某些查询根据其实现需要一组权限。例如，要执行 [RENAME](../../sql-reference/statements/optimize.md) 查询，您需要以下权限：`SELECT`、`CREATE TABLE`、`INSERT` 和 `DROP TABLE`。

### SELECT {#select}

允许执行 [SELECT](../../sql-reference/statements/select/index.md) 查询。

权限级别：`COLUMN`。

**描述**

获得此权限的用户可以在指定的表和数据库上针对指定列列表执行 `SELECT` 查询。如果用户包括其他列，则指定的查询不会返回数据。

考虑以下权限：

```sql
GRANT SELECT(x,y) ON db.table TO john
```

该权限允许 `john` 执行任何涉及 `db.table` 的 `x` 和/或 `y` 列数据的 `SELECT` 查询，例如，`SELECT x FROM db.table`。`john` 无法执行 `SELECT z FROM db.table`。`SELECT * FROM db.table` 也不可用。在处理此查询时，ClickHouse 不会返回任何数据，即使是 `x` 和 `y`。唯一的例外是，如果一个表仅包含 `x` 和 `y` 列，这种情况下 ClickHouse 返回所有数据。

### INSERT {#insert}

允许执行 [INSERT](../../sql-reference/statements/insert-into.md) 查询。

权限级别：`COLUMN`。

**描述**

获得此权限的用户可以在指定的表和数据库上针对指定列列表执行 `INSERT` 查询。如果用户包括其他列，则指定的查询不会插入任何数据。

**示例**

```sql
GRANT INSERT(x,y) ON db.table TO john
```

授予的权限允许 `john` 向 `db.table` 中的 `x` 和/或 `y` 列插入数据。

### ALTER {#alter}

允许根据以下权限层次结构执行 [ALTER](../../sql-reference/statements/alter/index.md) 查询：

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
  - `ALTER VIEW REFRESH`。级别：`VIEW`。别名：`ALTER LIVE VIEW REFRESH`、`REFRESH VIEW`
  - `ALTER VIEW MODIFY QUERY`。级别：`VIEW`。别名：`ALTER TABLE MODIFY QUERY`
  - `ALTER VIEW MODIFY SQL SECURITY`。级别：`VIEW`。别名：`ALTER TABLE MODIFY SQL SECURITY`

如何处理此层次结构的示例：

- `ALTER` 权限包括所有其他 `ALTER*` 权限。
- `ALTER CONSTRAINT` 包括 `ALTER ADD CONSTRAINT` 和 `ALTER DROP CONSTRAINT` 权限。

**备注**

- `MODIFY SETTING` 权限允许修改表引擎设置。它不影响设置或服务器配置参数。
- `ATTACH` 操作需要 [CREATE](#create) 权限。
- `DETACH` 操作需要 [DROP](#drop) 权限。
- 要通过 [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation) 查询停止突变，您需要有权启动此突变。例如，如果您想停止 `ALTER UPDATE` 查询，则需要 `ALTER UPDATE`、`ALTER TABLE` 或 `ALTER` 权限。

### BACKUP {#backup}

允许在查询中执行 [`BACKUP`]。有关备份的更多信息，请参阅 ["备份和恢复"](../../operations/backup.md)。

### CREATE {#create}

允许根据以下权限层次结构执行 [CREATE](../../sql-reference/statements/create/index.md) 和 [ATTACH](../../sql-reference/statements/attach.md) DDL 查询：

- `CREATE`。级别：`GROUP`
  - `CREATE DATABASE`。级别：`DATABASE`
  - `CREATE TABLE`。级别：`TABLE`
    - `CREATE ARBITRARY TEMPORARY TABLE`。级别：`GLOBAL`
      - `CREATE TEMPORARY TABLE`。级别：`GLOBAL`
  - `CREATE VIEW`。级别：`VIEW`
  - `CREATE DICTIONARY`。级别：`DICTIONARY`

**备注**

- 要删除创建的表，用户需要 [DROP](#drop) 权限。

### CLUSTER {#cluster}

允许执行带有 `ON CLUSTER` 的查询。

```sql title="Syntax"
GRANT CLUSTER ON *.* TO <username>
```

默认情况下，带有 `ON CLUSTER` 的查询需要用户具有 `CLUSTER` 授权。
如果您在没有首先授予 `CLUSTER` 权限的情况下尝试在查询中使用 `ON CLUSTER`，则会收到以下错误：

```text
Not enough privileges. To execute this query, it's necessary to have the grant CLUSTER ON *.*. 
```

默认行为可以通过将 `on_cluster_queries_require_cluster_grant` 设置为 `false` 来更改，该设置位于 `config.xml` 的 `access_control_improvements` 部分（见下文）。

```yaml title="config.xml"
<access_control_improvements>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```

### DROP {#drop}

允许根据以下权限层次结构执行 [DROP](../../sql-reference/statements/drop.md) 和 [DETACH](../../sql-reference/statements/detach.md) 查询：

- `DROP`。级别：`GROUP`
  - `DROP DATABASE`。级别：`DATABASE`
  - `DROP TABLE`。级别：`TABLE`
  - `DROP VIEW`。级别：`VIEW`
  - `DROP DICTIONARY`。级别：`DICTIONARY`

### TRUNCATE {#truncate}

允许执行 [TRUNCATE](../../sql-reference/statements/truncate.md) 查询。

权限级别：`TABLE`。

### OPTIMIZE {#optimize}

允许执行 [OPTIMIZE TABLE](../../sql-reference/statements/optimize.md) 查询。

权限级别：`TABLE`。

### SHOW {#show}

允许根据以下权限层次结构执行 `SHOW`、`DESCRIBE`、`USE` 和 `EXISTS` 查询：

- `SHOW`。级别：`GROUP`
  - `SHOW DATABASES`。级别：`DATABASE`。允许执行 `SHOW DATABASES`、`SHOW CREATE DATABASE`、`USE <database>` 查询。
  - `SHOW TABLES`。级别：`TABLE`。允许执行 `SHOW TABLES`、`EXISTS <table>`、`CHECK <table>` 查询。
  - `SHOW COLUMNS`。级别：`COLUMN`。允许执行 `SHOW CREATE TABLE`、`DESCRIBE` 查询。
  - `SHOW DICTIONARIES`。级别：`DICTIONARY`。允许执行 `SHOW DICTIONARIES`、`SHOW CREATE DICTIONARY`、`EXISTS <dictionary>` 查询。

**备注**

如果用户拥有与指定表、字典或数据库相关的任何其他权限，则该用户具有 `SHOW` 权限。

### KILL QUERY {#kill-query}

允许根据以下权限层次结构执行 [KILL](../../sql-reference/statements/kill.md#kill-query) 查询。

权限级别：`GLOBAL`。

**备注**

`KILL QUERY` 权限允许一个用户终止其他用户的查询。

### ACCESS MANAGEMENT {#access-management}

允许用户执行管理用户、角色和行策略的查询。

- `ACCESS MANAGEMENT`。级别：`GROUP`
  - `CREATE USER`。级别：`GLOBAL`
  - `ALTER USER`。级别：`GLOBAL`
  - `DROP USER`。级别：`GLOBAL`
  - `CREATE ROLE`。级别：`GLOBAL`
  - `ALTER ROLE`。级别：`GLOBAL`
  - `DROP ROLE`。级别：`GLOBAL`
  - `ROLE ADMIN`。级别：`GLOBAL`
  - `CREATE ROW POLICY`。级别：`GLOBAL`。别名：`CREATE POLICY`
  - `ALTER ROW POLICY`。级别：`GLOBAL`。别名：`ALTER POLICY`
  - `DROP ROW POLICY`。级别：`GLOBAL`。别名：`DROP POLICY`
  - `CREATE QUOTA`。级别：`GLOBAL`
  - `ALTER QUOTA`。级别：`GLOBAL`
  - `DROP QUOTA`。级别：`GLOBAL`
  - `CREATE SETTINGS PROFILE`。级别：`GLOBAL`。别名：`CREATE PROFILE`
  - `ALTER SETTINGS PROFILE`。级别：`GLOBAL`。别名：`ALTER PROFILE`
  - `DROP SETTINGS PROFILE`。级别：`GLOBAL`。别名：`DROP PROFILE`
  - `SHOW ACCESS`。级别：`GROUP`
    - `SHOW_USERS`。级别：`GLOBAL`。别名：`SHOW CREATE USER`
    - `SHOW_ROLES`。级别：`GLOBAL`。别名：`SHOW CREATE ROLE`
    - `SHOW_ROW_POLICIES`。级别：`GLOBAL`。别名：`SHOW POLICIES`、`SHOW CREATE ROW POLICY`、`SHOW CREATE POLICY`
    - `SHOW_QUOTAS`。级别：`GLOBAL`。别名：`SHOW CREATE QUOTA`
    - `SHOW_SETTINGS_PROFILES`。级别：`GLOBAL`。别名：`SHOW PROFILES`、`SHOW CREATE SETTINGS PROFILE`、`SHOW CREATE PROFILE`
  - `ALLOW SQL SECURITY NONE`。级别：`GLOBAL`。别名：`CREATE SQL SECURITY NONE`、`SQL SECURITY NONE`、`SECURITY NONE`

`ROLE ADMIN` 权限允许用户分配和撤销任何角色，包括未分配给具有管理员选项的用户的角色。

### SYSTEM {#system}

允许用户根据以下权限层次结构执行 [SYSTEM](../../sql-reference/statements/system.md) 查询。

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

允许使用 [introspection](../../operations/optimizing-performance/sampling-query-profiler.md) 函数。

- `INTROSPECTION`。级别：`GROUP`。别名：`INTROSPECTION FUNCTIONS`
  - `addressToLine`。级别：`GLOBAL`
  - `addressToLineWithInlines`。级别：`GLOBAL`
  - `addressToSymbol`。级别：`GLOBAL`
  - `demangle`。级别：`GLOBAL`

### SOURCES {#sources}

允许使用外部数据源。适用于 [表引擎](../../engines/table-engines/index.md) 和 [表函数](/sql-reference/table-functions)。

- `READ`。级别：`GLOBAL_WITH_PARAMETER`  
- `WRITE`。级别：`GLOBAL_WITH_PARAMETER`

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
对于源的读取/写入权限的分离，从 25.7 版本开始可用，并且仅在服务器设置 `access_control_improvements.enable_read_write_grants` 启用时可用。

否则，您应该使用语法 `GRANT AZURE ON *.* TO user`，这等同于新的 `GRANT READ, WRITE ON AZURE TO user` 
:::

示例：

- 要创建一个使用 [MySQL 表引擎](../../engines/table-engines/integrations/mysql.md) 的表，您需要 `CREATE TABLE (ON db.table_name)` 和 `MYSQL` 权限。
- 要使用 [mysql 表函数](../../sql-reference/table-functions/mysql.md)，您需要 `CREATE TEMPORARY TABLE` 和 `MYSQL` 权限。

### 源过滤器授权 {#source-filter-grants}

:::note
此功能从版本 25.8 开始可用，并且仅在服务器设置 `access_control_improvements.enable_read_write_grants` 启用时可用
:::

您可以使用正则表达式过滤器授予对特定源 URI 的访问权限。这允许对用户可以访问哪些外部数据源进行细粒度控制。

**语法：**

```sql
GRANT READ ON S3('regexp_pattern') TO user
```

此授权将允许用户仅从与指定正则表达式模式匹配的 S3 URI 中读取。

**示例：**

授予对特定 S3 桶路径的访问：
```sql
-- Allow user to read only from s3://foo/ paths
GRANT READ ON S3('s3://foo/.*') TO john

-- Allow user to read from specific file patterns
GRANT READ ON S3('s3://mybucket/data/2024/.*\.parquet') TO analyst

-- Multiple filters can be granted to the same user
GRANT READ ON S3('s3://foo/.*') TO john
GRANT READ ON S3('s3://bar/.*') TO john
```

**使用 GRANT OPTION 重新授权：**

如果原始授权带有 `WITH GRANT OPTION`，可以使用 `GRANT CURRENT GRANTS` 进行重新授权：
```sql
-- Original grant with GRANT OPTION
GRANT READ ON S3('s3://foo/.*') TO john WITH GRANT OPTION

-- John can now regrant this access to others
GRANT CURRENT GRANTS(READ ON S3) TO alice
```

**重要限制：**

- **不允许部分撤销：** 您不能撤销授予的过滤器模式的子集。如果需要，必须撤销整个授权并使用新模式重新授权。
- **不允许通配符授权：** 您不能使用 `GRANT READ ON *('regexp')` 或类似仅通配符的模式。必须提供具体源。

### dictGet {#dictget}

- `dictGet`。别名：`dictHas`、`dictGetHierarchy`、`dictIsIn`

允许用户执行 [dictGet](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)、[dictHas](../../sql-reference/functions/ext-dict-functions.md#dicthas)、[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)、[dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictisin) 函数。

权限级别：`DICTIONARY`。

**示例**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`

### displaySecretsInShowAndSelect {#displaysecretsinshowandselect}

允许用户在 `SHOW` 和 `SELECT` 查询中查看机密，如果同时启用
[`display_secrets_in_show_and_select` 服务器设置](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select)
和
[`format_display_secrets_in_show_and_select` 格式设置](../../operations/settings/formats#format_display_secrets_in_show_and_select)。

### NAMED COLLECTION ADMIN {#named-collection-admin}

允许对指定命名集合执行特定操作。在 23.7 版本之前称为 NAMED COLLECTION CONTROL，在 23.7 之后添加了 NAMED COLLECTION ADMIN，并将 NAMED COLLECTION CONTROL 保留为别名。

- `NAMED COLLECTION ADMIN`。级别：`NAMED_COLLECTION`。别名：`NAMED COLLECTION CONTROL`
  - `CREATE NAMED COLLECTION`。级别：`NAMED_COLLECTION`
  - `DROP NAMED COLLECTION`。级别：`NAMED_COLLECTION`
  - `ALTER NAMED COLLECTION`。级别：`NAMED_COLLECTION`
  - `SHOW NAMED COLLECTIONS`。级别：`NAMED_COLLECTION`。别名：`SHOW NAMED COLLECTIONS`
  - `SHOW NAMED COLLECTIONS SECRETS`。级别：`NAMED_COLLECTION`。别名：`SHOW NAMED COLLECTIONS SECRETS`
  - `NAMED COLLECTION`。级别：`NAMED_COLLECTION`。别名：`NAMED COLLECTION USAGE`、`USE NAMED COLLECTION`

与所有其他授权（CREATE、DROP、ALTER、SHOW）不同，授予 NAMED COLLECTION 的权限仅在 23.7 中添加，而所有其他授权则在早期（22.12）添加。

**示例**

假设一个命名集合叫 abc，我们授予用户 john CREATE NAMED COLLECTION 权限。
- `GRANT CREATE NAMED COLLECTION ON abc TO john`

### TABLE ENGINE {#table-engine}

允许在创建表时使用指定的表引擎。适用于 [表引擎](../../engines/table-engines/index.md)。

**示例**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`

### ALL {#all}

<CloudNotSupportedBadge/>

授予用户账户或角色对受管实体的所有权限。

:::note
在 ClickHouse Cloud 中不支持 `ALL` 权限，其中 `default` 用户的权限有限。用户可以通过授予 `default_role` 来最大程度地授权其他用户。有关详细信息，请参见 [here](/cloud/security/cloud-access-management/overview#initial-settings)。
用户也可以作为默认用户使用 `GRANT CURRENT GRANTS` 来实现与 `ALL` 类似的效果。
:::

### NONE {#none}

不授予任何权限。

### ADMIN OPTION {#admin-option}

`ADMIN OPTION` 权限允许用户将其角色授予另一个用户。
