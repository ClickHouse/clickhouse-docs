---
slug: /sql-reference/statements/grant
sidebar_position: 38
sidebar_label: '授予'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 授予语句

- 将 [权限](#privileges) 授予 ClickHouse 用户帐户或角色。
- 将角色分配给用户帐户或其他角色。

要撤销权限，请使用 [REVOKE](../../sql-reference/statements/revoke.md) 语句。您还可以使用 [SHOW GRANTS](../../sql-reference/statements/show.md#show-grants) 语句列出授予的权限。

## 授予权限语法 {#granting-privilege-syntax}

``` sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — 权限类型。
- `role` — ClickHouse 用户角色。
- `user` — ClickHouse 用户帐户。

`WITH GRANT OPTION` 子句授予 `user` 或 `role` 执行 `GRANT` 查询的权限。用户可以授予他们拥有的同等范围及更少的权限。
`WITH REPLACE OPTION` 子句将旧权限替换为 `user` 或 `role` 的新权限，如果未指定，则附加权限。

## 分配角色语法 {#assigning-role-syntax}

``` sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

- `role` — ClickHouse 用户角色。
- `user` — ClickHouse 用户帐户。

`WITH ADMIN OPTION` 子句将 [ADMIN OPTION](#admin-option) 权限授予 `user` 或 `role`。
`WITH REPLACE OPTION` 子句将旧角色替换为 `user` 或 `role` 的新角色，如果未指定，则附加角色。

## 授予当前权限语法 {#grant-current-grants-syntax}

``` sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

-   `privilege` — 权限类型。
-   `role` — ClickHouse 用户角色。
-   `user` — ClickHouse 用户帐户。

使用 `CURRENT GRANTS` 语句可以将所有指定的权限授予给给定用户或角色。
如果未指定任何权限，则给定用户或角色将接收所有可用的 `CURRENT_USER` 权限。

## 使用方法 {#usage}

要使用 `GRANT`，您的帐户必须具有 `GRANT OPTION` 权限。您只能在您帐户权限的范围内授予权限。

例如，管理员通过如下查询将权限授予 `john` 帐户：

``` sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

这意味着 `john` 有权执行：

- `SELECT x,y FROM db.table`。
- `SELECT x FROM db.table`。
- `SELECT y FROM db.table`。

`john` 无法执行 `SELECT z FROM db.table`。`SELECT * FROM db.table` 也不可用。在处理此查询时，ClickHouse 不会返回任何数据，即使 `x` 和 `y` 也不返回。唯一的例外是如果表中仅包含 `x` 和 `y` 列。在这种情况下，ClickHouse 将返回所有数据。

另外，`john` 拥有 `GRANT OPTION` 权限，因此可以向其他用户授予相同或更小范围的权限。

对 `system` 数据库的访问始终被允许（因为该数据库用于处理查询）。

您可以在一个查询中授予多个帐户多个权限。查询 `GRANT SELECT, INSERT ON *.* TO john, robin` 允许帐户 `john` 和 `robin` 在服务器上所有数据库的所有表中执行 `INSERT` 和 `SELECT` 查询。

## 通配符授予 {#wildcard-grants}

指定权限时，您可以使用星号（`*`）代替表或数据库名称。例如，`GRANT SELECT ON db.* TO john` 查询允许 `john` 在 `db` 数据库中执行 `SELECT` 查询。
您还可以省略数据库名称。在这种情况下，权限会授予当前数据库。
例如，`GRANT SELECT ON * TO john` 授予当前数据库中所有表的权限，`GRANT SELECT ON mytable TO john` 授予当前数据库中 `mytable` 表的权限。

:::note
以下描述的功能自 24.10 ClickHouse 版本开始可用。
:::

您还可以在表或数据库名称的末尾加上星号。这一特性允许您在表路径的抽象前缀上授予权限。
示例：`GRANT SELECT ON db.my_tables* TO john`。此查询允许 `john` 在所有以 `my_tables*` 为前缀的 `db` 数据库表中执行 `SELECT` 查询。

更多示例：

`GRANT SELECT ON db.my_tables* TO john`
```sql
SELECT * FROM db.my_tables -- 授予
SELECT * FROM db.my_tables_0 -- 授予
SELECT * FROM db.my_tables_1 -- 授予

SELECT * FROM db.other_table -- 未授予
SELECT * FROM db2.my_tables -- 未授予
```

`GRANT SELECT ON db*.* TO john`
```sql
SELECT * FROM db.my_tables -- 授予
SELECT * FROM db.my_tables_0 -- 授予
SELECT * FROM db.my_tables_1 -- 授予
SELECT * FROM db.other_table -- 授予
SELECT * FROM db2.my_tables -- 授予
```

在授予路径内新创建的所有表将自动继承其父表的所有权限。
例如，如果您运行 `GRANT SELECT ON db.* TO john` 查询，然后创建新表 `db.new_table`，用户 `john` 将能够运行 `SELECT * FROM db.new_table` 查询。

您可以 **仅** 为前缀指定星号：
```sql
GRANT SELECT ON db.* TO john -- 正确
GRANT SELECT ON db*.* TO john -- 正确

GRANT SELECT ON *.my_table TO john -- 错误
GRANT SELECT ON foo*bar TO john -- 错误
GRANT SELECT ON *suffix TO john -- 错误
GRANT SELECT(foo) ON db.table* TO john -- 错误
```

## 权限 {#privileges}

权限是授予用户执行特定类型查询的权限。

权限具有层级结构，并且允许的查询集取决于权限范围。

ClickHouse 中权限的层次结构如下所示：

- [`所有`](#all)
    - [`访问管理`](#access-management)
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
    - [`备份`](#backup)
    - [`集群`](#cluster)
    - [`创建`](#create)
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
    - [`删除`](#drop)
        - `DROP DATABASE`
        - `DROP DICTIONARY`
        - `DROP FUNCTION`
        - `DROP RESOURCE`
        - `DROP TABLE`
        - `DROP VIEW` 
        - `DROP WORKLOAD`
    - [`插入`](#insert)
    - [`内部调试`](#introspection)
        - `addressToLine`
        - `addressToLineWithInlines`
        - `addressToSymbol`
        - `demangle`
    - `KILL QUERY`
    - `KILL TRANSACTION`
    - `MOVE PARTITION BETWEEN SHARDS`
    - [`命名集合管理`](#named-collection-admin)
        - `ALTER NAMED COLLECTION`
        - `CREATE NAMED COLLECTION`
        - `DROP NAMED COLLECTION`
        - `NAMED COLLECTION`
        - `SHOW NAMED COLLECTIONS`
        - `SHOW NAMED COLLECTIONS SECRETS`
    - [`优化`](#optimize)
    - [`选择`](#select)
    - [`SET DEFINER`](/sql-reference/statements/create/view#sql_security)
    - [`SHOW`](#show)
        - `SHOW COLUMNS` 
        - `SHOW DATABASES`
        - `SHOW DICTIONARIES`
        - `SHOW TABLES`
    - `SHOW FILESYSTEM CACHES`
    - [`数据源`](#sources)
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
    - [`系统`](#system)
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
    - [`表引擎`](#table-engine)
    - [`TRUNCATE`](#truncate)
    - `UNDROP TABLE` 

权限在不同层级应用。了解层级暗示了可用于权限的语法。

层级（从低到高）：

- `COLUMN` — 权限可以授予列、表、数据库或全局。
- `TABLE` — 权限可以授予表、数据库或全局。
- `VIEW` — 权限可以授予视图、数据库或全局。
- `DICTIONARY` — 权限可以授予字典、数据库或全局。
- `DATABASE` — 权限可以授予数据库或全局。
- `GLOBAL` — 权限仅可以全局授予。
- `GROUP` — 将不同层级的权限组合在一起。当授予 `GROUP` 级别的权限时，仅授予与所使用语法相对应的组权限。

允许语法的示例：

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

不允许语法的示例：

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

特殊权限 [ALL](#all) 授予用户帐户或角色所有权限。

默认情况下，用户帐户或角色没有任何权限。

如果用户或角色没有权限，它将显示为 [NONE](#none) 权限。

某些查询由于其实现需要一组权限。例如，执行 [RENAME](../../sql-reference/statements/optimize.md) 查询需要以下权限：`SELECT`、`CREATE TABLE`、`INSERT` 和 `DROP TABLE`。

### 选择 {#select}

允许执行 [SELECT](../../sql-reference/statements/select/index.md) 查询。

权限级别：`COLUMN`。

**描述**

获得此权限的用户可以对指定表和数据库中的指定列列表执行 `SELECT` 查询。如果用户包含其他列，则指定的查询不返回任何数据。

考虑以下权限：

``` sql
GRANT SELECT(x,y) ON db.table TO john
```

此权限允许 `john` 执行涉及 `db.table` 中 `x` 和/或 `y` 列数据的任何 `SELECT` 查询，例如 `SELECT x FROM db.table`。`john` 无法执行 `SELECT z FROM db.table`。`SELECT * FROM db.table` 也不可用。处理此查询时，ClickHouse 不会返回任何数据，即使 `x` 和 `y`。唯一的例外是如果表中仅包含 `x` 和 `y` 列，在这种情况下，ClickHouse 将返回所有数据。

### 插入 {#insert}

允许执行 [INSERT](../../sql-reference/statements/insert-into.md) 查询。

权限级别：`COLUMN`。

**描述**

获得此权限的用户可以对指定表和数据库中的指定列列表执行 `INSERT` 查询。如果用户包含其他列，则指定的查询不会插入任何数据。

**示例**

``` sql
GRANT INSERT(x,y) ON db.table TO john
```

授予的权限允许 `john` 向 `db.table` 中的 `x` 和/或 `y` 列插入数据。

### ALTER {#alter}

允许执行 [ALTER](../../sql-reference/statements/alter/index.md) 查询，按照以下权限层次结构：

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
    - `ALTER VIEW` 级别：`GROUP`
        - `ALTER VIEW REFRESH`。级别：`VIEW`。别名：`ALTER LIVE VIEW REFRESH`、`REFRESH VIEW`
        - `ALTER VIEW MODIFY QUERY`。级别：`VIEW`。别名：`ALTER TABLE MODIFY QUERY`
        - `ALTER VIEW MODIFY SQL SECURITY`。级别：`VIEW`。别名：`ALTER TABLE MODIFY SQL SECURITY`

如何处理此层次结构的示例：

- `ALTER` 权限包含所有其他 `ALTER*` 权限。
- `ALTER CONSTRAINT` 包括 `ALTER ADD CONSTRAINT` 和 `ALTER DROP CONSTRAINT` 权限。

**注意事项**

- `MODIFY SETTING` 权限允许修改表引擎设置。它不影响设置或服务器配置参数。
- `ATTACH` 操作需要 [CREATE](#create) 权限。
- `DETACH` 操作需要 [DROP](#drop) 权限。
- 要通过 [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation)查询停止突变，需要有启动该突变的权限。例如，如果要停止 `ALTER UPDATE` 查询，需要 `ALTER UPDATE`、`ALTER TABLE` 或 `ALTER` 权限。

### 备份 {#backup}

允许在查询中执行 [`BACKUP`]。有关备份的更多信息，请参见["备份和恢复"](../../operations/backup.md)。

### 创建 {#create}

允许执行 [CREATE](../../sql-reference/statements/create/index.md) 和 [ATTACH](../../sql-reference/statements/attach.md) DDL 查询，按照以下权限层次结构：

- `CREATE`。级别：`GROUP`
    - `CREATE DATABASE`。级别：`DATABASE`
    - `CREATE TABLE`。级别：`TABLE`
        - `CREATE ARBITRARY TEMPORARY TABLE`。级别：`GLOBAL`
            - `CREATE TEMPORARY TABLE`。级别：`GLOBAL`
    - `CREATE VIEW`。级别：`VIEW`
    - `CREATE DICTIONARY`。级别：`DICTIONARY`

**注意事项**

- 要删除所创建的表，用户需要 [DROP](#drop)。

### 集群 {#cluster}

允许执行 `ON CLUSTER` 查询。

```sql title="语法"
GRANT CLUSTER ON *.* TO <用户名>
```

默认情况下，带有 `ON CLUSTER` 的查询要求用户具有 `CLUSTER` 授权。
如果您尝试在未先授予 `CLUSTER` 权限的查询中使用 `ON CLUSTER`，则会出现以下错误：

```text
权限不足。要执行此查询，必须有权限授予 CLUSTER ON *.*。 
```

默认行为可以通过设置 `on_cluster_queries_require_cluster_grant` 设置进行更改，该设置位于 `config.xml` 的 `access_control_improvements` 部分（见下文），设置为 `false`。

```yaml title="config.xml"
<access_control_improvements>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```

### 删除 {#drop}

允许执行 [DROP](../../sql-reference/statements/drop.md) 和 [DETACH](../../sql-reference/statements/detach.md) 查询，按照以下权限层次结构：

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

允许执行 `SHOW`、`DESCRIBE`、`USE` 和 `EXISTS` 查询，按照以下权限层次结构：

- `SHOW`。级别：`GROUP`
    - `SHOW DATABASES`。级别：`DATABASE`。允许执行 `SHOW DATABASES`、`SHOW CREATE DATABASE`、`USE <数据库>` 查询。
    - `SHOW TABLES`。级别：`TABLE`。允许执行 `SHOW TABLES`、`EXISTS <表>`、`CHECK <表>` 查询。
    - `SHOW COLUMNS`。级别：`COLUMN`。允许执行 `SHOW CREATE TABLE`、`DESCRIBE` 查询。
    - `SHOW DICTIONARIES`。级别：`DICTIONARY`。允许执行 `SHOW DICTIONARIES`、`SHOW CREATE DICTIONARY`、`EXISTS <字典>` 查询。

**注意事项**

用户如果具有与指定表、字典或数据库相关的任何其他权限，则拥有 `SHOW` 权限。

### KILL QUERY {#kill-query}

允许执行 [KILL](../../sql-reference/statements/kill.md#kill-query) 查询，按照以下权限层次结构：

权限级别：`GLOBAL`。

**注意事项**

`KILL QUERY` 权限允许一个用户终止其他用户的查询。

### 访问管理 {#access-management}

允许用户执行管理用户、角色和行策略的查询。

- `访问管理`。级别：`GROUP`
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

`ROLE ADMIN` 权限允许用户分配和撤回任何角色，包括未向用户分配的具有管理员选项的角色。

### 系统 {#system}

允许用户执行 [SYSTEM](../../sql-reference/statements/system.md) 查询，按照以下权限层次结构。

- `系统`。级别：`GROUP`
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

`SYSTEM RELOAD EMBEDDED DICTIONARIES` 权限隐式地通过 `SYSTEM RELOAD DICTIONARY ON *.*` 权限授予。

### 内部调试 {#introspection}

允许使用 [内部调试](../../operations/optimizing-performance/sampling-query-profiler.md) 函数。

- `内部调试`。级别：`GROUP`。别名：`INTROSPECTION FUNCTIONS`
    - `addressToLine`。级别：`GLOBAL`
    - `addressToLineWithInlines`。级别：`GLOBAL`
    - `addressToSymbol`。级别：`GLOBAL`
    - `demangle`。级别：`GLOBAL`

### 数据源 {#sources}

允许使用外部数据源。适用于 [表引擎](../../engines/table-engines/index.md) 和 [表函数](/sql-reference/table-functions)。

- `数据源`。级别：`GROUP`
    - `AZURE`。级别：`GLOBAL`
    - `FILE`。级别：`GLOBAL`
    - `HDFS`。级别：`GLOBAL`
    - `HIVE`。级别：`GLOBAL`
    - `JDBC`。级别：`GLOBAL`
    - `KAFKA`。级别：`GLOBAL`
    - `MONGO`。级别：`GLOBAL`
    - `MYSQL`。级别：`GLOBAL`
    - `NATS`。级别：`GLOBAL`
    - `ODBC`。级别：`GLOBAL`
    - `POSTGRES`。级别：`GLOBAL`
    - `RABBITMQ`。级别：`GLOBAL`
    - `REDIS`。级别：`GLOBAL`
    - `REMOTE`。级别：`GLOBAL`
    - `S3`。级别：`GLOBAL`
    - `SQLITE`。级别：`GLOBAL`
    - `URL`。级别：`GLOBAL`

`数据源` 权限允许使用所有的数据源。您还可以单独为每个数据源授予权限。要使用数据源，您需要额外的权限。

示例：

- 要使用 [MySQL 表引擎](../../engines/table-engines/integrations/mysql.md) 创建表，您需要具有 `CREATE TABLE (ON db.table_name)` 和 `MYSQL` 权限。
- 要使用 [mysql 表函数](../../sql-reference/table-functions/mysql.md)，您需要 `CREATE TEMPORARY TABLE` 和 `MYSQL` 权限。

### dictGet {#dictget}

- `dictGet`。别名：`dictHas`、`dictGetHierarchy`、`dictIsIn`

允许用户执行 [dictGet](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull)、[dictHas](../../sql-reference/functions/ext-dict-functions.md#dicthas)、[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy)、[dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictisin) 函数。

权限级别：`DICTIONARY`。

**示例**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`

### displaySecretsInShowAndSelect {#displaysecretsinshowandselect}

允许用户在 `SHOW` 和 `SELECT` 查询中查看秘密，如果 [`display_secrets_in_show_and_select` 服务器设置](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select) 和 [`format_display_secrets_in_show_and_select` 格式设置](../../operations/settings/formats#format_display_secrets_in_show_and_select) 都开启。
### 命名集合管理 {#named-collection-admin}

允许在指定的命名集合上执行某项操作。在 23.7 版本之前称为命名集合控制，23.7 版本后添加了命名集合管理，并将命名集合控制作为别名保留。

- `命名集合管理`. 级别: `NAMED_COLLECTION`. 别名: `命名集合控制`
    - `创建命名集合`. 级别: `NAMED_COLLECTION`
    - `删除命名集合`. 级别: `NAMED_COLLECTION`
    - `修改命名集合`. 级别: `NAMED_COLLECTION`
    - `显示命名集合`. 级别: `NAMED_COLLECTION`. 别名: `显示命名集合`
    - `显示命名集合的秘密`. 级别: `NAMED_COLLECTION`. 别名: `显示命名集合的秘密`
    - `命名集合`. 级别: `NAMED_COLLECTION`. 别名: `命名集合使用, 使用命名集合`

与所有其他授权（创建、删除、修改、显示）不同，命名集合的授权仅在 23.7 中添加，而其他所有授权则早在 22.12 中添加。

**示例**

假设命名集合名为 abc，我们授予用户 john 创建命名集合的权限。
- `GRANT CREATE NAMED COLLECTION ON abc TO john`
### 表引擎 {#table-engine}

允许在创建表时使用指定的表引擎。适用于 [表引擎](../../engines/table-engines/index.md)。

**示例**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`
### 所有 {#all}

<CloudNotSupportedBadge/>

向用户账户或角色授予对受监管实体的所有权限。

:::note
权限`ALL`在 ClickHouse Cloud 中不被支持，其中`default`用户的权限有限。用户可以通过授予`default_role`权限来向用户授予最大权限。有关详细信息，请参见 [此处](/cloud/security/cloud-access-management/overview#initial-settings)。
用户还可以使用`GRANT CURRENT GRANTS`作为默认用户来实现与 `ALL` 类似的效果。
:::
### 无 {#none}

不授予任何权限。
### 管理选项 {#admin-option}

`ADMIN OPTION` 权限允许用户将其角色授予其他用户。
