---
description: 'GRANT 语句文档'
sidebar_label: 'GRANT'
sidebar_position: 38
slug: /sql-reference/statements/grant
title: 'GRANT 语句'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# GRANT 语句 \\{#grant-statement\\}

- 向 ClickHouse 用户账户或角色授予[权限](#privileges)。
- 将角色分配给用户账户或其他角色。

要撤销权限，请使用 [REVOKE](../../sql-reference/statements/revoke.md) 语句。还可以使用 [SHOW GRANTS](../../sql-reference/statements/show.md#show-grants) 语句列出已授予的权限。

## 授予权限的语法 \\{#granting-privilege-syntax\\}

```sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

* `privilege` — 权限类型。
* `role` — ClickHouse 用户角色。
* `user` — ClickHouse 用户账户。

`WITH GRANT OPTION` 子句为 `user` 或 `role` 授予执行 `GRANT` 查询的权限。用户可以授予与自己权限范围相同或更小范围的权限。
`WITH REPLACE OPTION` 子句会将 `user` 或 `role` 的现有权限替换为新权限；如果未指定该子句，则会将新权限追加到现有权限上，而不是进行替换。

## 分配角色的语法 \\{#assigning-role-syntax\\}

```sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

* `role` — ClickHouse 用户角色。
* `user` — ClickHouse 用户帐户。

`WITH ADMIN OPTION` 子句向 `user` 或 `role` 授予 [ADMIN OPTION](#admin-option) 权限。
`WITH REPLACE OPTION` 子句会用新的角色替换该 `user` 或 `role` 现有的角色；如果未指定该子句，则会在原有角色基础上追加新角色。

## GRANT CURRENT GRANTS 语法 \\{#grant-current-grants-syntax\\}

```sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

* `privilege` — 权限类型。
* `role` — ClickHouse 用户角色。
* `user` — ClickHouse 用户账号。

使用 `CURRENT GRANTS` 语句可以为指定的用户或角色授予所有列出的权限。
如果未指定任何权限，则该用户或角色将获得 `CURRENT_USER` 的所有可用权限。

## 用法 \\{#usage\\}

要使用 `GRANT`，您的账户必须具有 `GRANT OPTION` 权限。您只能在自身账户权限范围内授予权限。

例如，管理员通过如下查询向 `john` 账户授予了权限：

```sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

这意味着 `john` 拥有执行以下操作的权限：

* `SELECT x,y FROM db.table`。
* `SELECT x FROM db.table`。
* `SELECT y FROM db.table`。

`john` 不能执行 `SELECT z FROM db.table`。`SELECT * FROM db.table` 也不可用。处理该查询时，ClickHouse 不会返回任何数据，甚至连 `x` 和 `y` 也不会返回。唯一的例外情况是，当一张表只包含 `x` 和 `y` 这两列时，此时 ClickHouse 会返回所有数据。

此外，`john` 拥有 `GRANT OPTION` 权限，因此他可以将相同或更小范围的权限授予其他用户。

对 `system` 数据库的访问始终是允许的（因为该数据库用于处理查询）。

:::note
虽然许多 system 表默认对新用户可访问，但如果没有显式授权，他们可能无法默认访问所有的 system 表。
另外，出于安全原因，对某些 system 表（例如 `system.zookeeper`）的访问对 Cloud 用户是受限的。
:::

你可以在一个查询中为多个账号授予多个权限。查询 `GRANT SELECT, INSERT ON *.* TO john, robin` 允许账号 `john` 和 `robin` 在服务器上所有数据库的所有表上执行 `INSERT` 和 `SELECT` 查询。

## 通配符授权 \\{#wildcard-grants\\}

在指定权限时，可以使用星号（`*`）来代替表名或数据库名。例如，`GRANT SELECT ON db.* TO john` 查询允许 `john` 在 `db` 数据库中的所有表上执行 `SELECT` 查询。
也可以省略数据库名。在这种情况下，权限会被授予当前数据库。
例如，`GRANT SELECT ON * TO john` 会在当前数据库中的所有表上授予该权限，`GRANT SELECT ON mytable TO john` 会在当前数据库中的 `mytable` 表上授予该权限。

:::note
下述功能自 ClickHouse 24.10 版本起可用。
:::

还可以在表名或数据库名的末尾使用星号。该功能允许基于表路径的抽象前缀来授予权限。
示例：`GRANT SELECT ON db.my_tables* TO john`。此查询允许 `john` 在 `db` 数据库中所有表名以 `my_tables` 为前缀的表上执行 `SELECT` 查询。

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

在已授权路径中新创建的所有表都会自动继承其父对象的所有权限。
例如，如果你运行 `GRANT SELECT ON db.* TO john` 查询，然后创建一个新表 `db.new_table`，则用户 `john` 将能够运行 `SELECT * FROM db.new_table` 查询。

你**只能**为前缀指定星号（asterisk）：

```sql
GRANT SELECT ON db.* TO john -- correct
GRANT SELECT ON db*.* TO john -- correct

GRANT SELECT ON *.my_table TO john -- wrong
GRANT SELECT ON foo*bar TO john -- wrong
GRANT SELECT ON *suffix TO john -- wrong
GRANT SELECT(foo) ON db.table* TO john -- wrong
```

## 权限 \\{#privileges\\}

权限是授予用户以执行特定类型查询的许可。

权限具有层次结构，允许执行的查询范围取决于权限的作用域。

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

以下是该层级关系的处理方式示例：

- `ALTER` 权限包含所有其他 `ALTER*` 权限。
- `ALTER CONSTRAINT` 包含 `ALTER ADD CONSTRAINT` 和 `ALTER DROP CONSTRAINT` 权限。

权限可以应用在不同层级。知道存在某个层级，意味着该层级上有相应可用的权限语法。

层级（从低到高）：

- `COLUMN` — 权限可以授予给列、表、数据库或全局。
- `TABLE` — 权限可以授予给表、数据库或全局。
- `VIEW` — 权限可以授予给视图、数据库或全局。
- `DICTIONARY` — 权限可以授予给字典、数据库或全局。
- `DATABASE` — 权限可以授予给数据库或全局。
- `GLOBAL` — 权限只能在全局范围内授予。
- `GROUP` — 聚合不同层级的权限。当授予 `GROUP` 级别的权限时，仅授予该组中与所使用语法相对应的那些权限。

允许的语法示例：

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

不允许的语法示例：

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

特殊权限 [ALL](#all) 会向用户账户或角色授予所有权限。

默认情况下，用户账户或角色没有任何权限。

如果用户或角色没有任何权限，则会显示为 [NONE](#none) 权限。

某些查询在实现上需要一组权限。例如，要执行 [RENAME](../../sql-reference/statements/optimize.md) 查询，需要以下权限：`SELECT`、`CREATE TABLE`、`INSERT` 和 `DROP TABLE`。

### SELECT \\{#select\\}

允许执行 [SELECT](../../sql-reference/statements/select/index.md) 查询。

权限级别：`COLUMN`。

**说明**

拥有此权限的用户可以在指定数据库中针对指定表的一组列执行 `SELECT` 查询。如果用户在查询中包含了该列表之外的其他列，则查询不会返回任何数据。

考虑以下权限：

```sql
GRANT SELECT(x,y) ON db.table TO john
```

该权限允许 `john` 执行任何涉及 `db.table` 中 `x` 和/或 `y` 列数据的 `SELECT` 查询，例如 `SELECT x FROM db.table`。`john` 不能执行 `SELECT z FROM db.table`。也不能执行 `SELECT * FROM db.table`。在处理此查询时，ClickHouse 不会返回任何数据，连 `x` 和 `y` 也不会返回。唯一的例外是当表只包含 `x` 和 `y` 列时，在这种情况下，ClickHouse 会返回该表中的所有数据。

### INSERT \\{#insert\\}

允许执行 [INSERT](../../sql-reference/statements/insert-into.md) 查询。

权限级别：`COLUMN`。

**描述**

被授予此权限的用户可以在指定数据库中指定表的一组列上执行 `INSERT` 查询。如果用户在查询中包含了未在该列表中的其他列，则该查询不会插入任何数据。

**示例**

```sql
GRANT INSERT(x,y) ON db.table TO john
```

授予的权限允许 `john` 向 `db.table` 表中的 `x` 和/或 `y` 列插入数据。

### ALTER \\{#alter\\}

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

以下是该层级的使用示例：

- `ALTER` 权限包含所有其他 `ALTER*` 权限。
- `ALTER CONSTRAINT` 包含 `ALTER ADD CONSTRAINT` 和 `ALTER DROP CONSTRAINT` 权限。

**说明**

- `MODIFY SETTING` 权限允许修改表引擎设置。它不影响设置或服务器配置参数。
- `ATTACH` 操作需要具有 [CREATE](#create) 权限。
- `DETACH` 操作需要具有 [DROP](#drop) 权限。
- 要通过 [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation) 查询停止一次 mutation，需要具有启动该 mutation 的相应权限。例如，如果你想停止 `ALTER UPDATE` 查询，你需要具有 `ALTER UPDATE`、`ALTER TABLE` 或 `ALTER` 权限。

### BACKUP \\{#backup\\}

允许在查询中执行 [`BACKUP`] 语句。有关备份的更多信息，请参阅[《备份与恢复》](/operations/backup/overview)。

### CREATE \\{#create\\}

允许按照以下权限层级执行 [CREATE](../../sql-reference/statements/create/index.md) 和 [ATTACH](../../sql-reference/statements/attach.md) DDL 查询：

- `CREATE`。级别：`GROUP`
  - `CREATE DATABASE`。级别：`DATABASE`
  - `CREATE TABLE`。级别：`TABLE`
    - `CREATE ARBITRARY TEMPORARY TABLE`。级别：`GLOBAL`
      - `CREATE TEMPORARY TABLE`。级别：`GLOBAL`
  - `CREATE VIEW`。级别：`VIEW`
  - `CREATE DICTIONARY`。级别：`DICTIONARY`

**注意**

- 若要删除已创建的表，用户需要 [DROP](#drop) 权限。

### CLUSTER \\{#cluster\\}

支持执行 `ON CLUSTER` 查询。

```sql title="Syntax"
GRANT CLUSTER ON *.* TO <username>
```

默认情况下，使用 `ON CLUSTER` 的查询要求用户具备 `CLUSTER` 权限。
如果在未先授予 `CLUSTER` 权限的情况下尝试在查询中使用 `ON CLUSTER`，则会收到如下错误：

```text
Not enough privileges. To execute this query, it's necessary to have the grant CLUSTER ON *.*. 
```

可以通过在 `config.xml` 的 `access_control_improvements` 部分（见下文）中将 `on_cluster_queries_require_cluster_grant` 设置项设为 `false` 来更改默认行为。

```yaml title="config.xml"
<access_control_improvements>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```

### DROP \\{#drop\\}

允许按照以下权限层级执行 [DROP](../../sql-reference/statements/drop.md) 和 [DETACH](../../sql-reference/statements/detach.md) 查询语句：

- `DROP`。级别：`GROUP`
  - `DROP DATABASE`。级别：`DATABASE`
  - `DROP TABLE`。级别：`TABLE`
  - `DROP VIEW`。级别：`VIEW`
  - `DROP DICTIONARY`。级别：`DICTIONARY`

### TRUNCATE \\{#truncate\\}

允许执行 [TRUNCATE](../../sql-reference/statements/truncate.md) 查询。

所需权限级别：`TABLE`。

### OPTIMIZE \\{#optimize\\}

允许执行 [OPTIMIZE TABLE](../../sql-reference/statements/optimize.md) 查询。

权限级别：`TABLE`。

### SHOW \\{#show\\}

允许根据以下权限层级执行 `SHOW`、`DESCRIBE`、`USE` 和 `EXISTS` 查询：

- `SHOW`。级别：`GROUP`
  - `SHOW DATABASES`。级别：`DATABASE`。允许执行 `SHOW DATABASES`、`SHOW CREATE DATABASE`、`USE <database>` 查询。
  - `SHOW TABLES`。级别：`TABLE`。允许执行 `SHOW TABLES`、`EXISTS <table>`、`CHECK <table>` 查询。
  - `SHOW COLUMNS`。级别：`COLUMN`。允许执行 `SHOW CREATE TABLE`、`DESCRIBE` 查询。
  - `SHOW DICTIONARIES`。级别：`DICTIONARY`。允许执行 `SHOW DICTIONARIES`、`SHOW CREATE DICTIONARY`、`EXISTS <dictionary>` 查询。

**注意**

如果用户对指定的表、字典或数据库拥有任意其他相关权限，则该用户自动具有 `SHOW` 权限。

### KILL QUERY \\{#kill-query\\}

允许根据以下权限层级执行 [KILL](../../sql-reference/statements/kill.md#kill-query) 查询：

权限级别：`GLOBAL`。

**注意**

具有 `KILL QUERY` 权限的用户可以终止其他用户的查询。

### 访问管理 \\{#access-management\\}

允许用户执行用于管理用户、角色和行策略的查询。

- `ACCESS MANAGEMENT`. 等级：`GROUP`
  - `CREATE USER`. 等级：`GLOBAL`
  - `ALTER USER`. 等级：`GLOBAL`
  - `DROP USER`. 等级：`GLOBAL`
  - `CREATE ROLE`. 等级：`GLOBAL`
  - `ALTER ROLE`. 等级：`GLOBAL`
  - `DROP ROLE`. 等级：`GLOBAL`
  - `ROLE ADMIN`. 等级：`GLOBAL`
  - `CREATE ROW POLICY`. 等级：`GLOBAL`。别名：`CREATE POLICY`
  - `ALTER ROW POLICY`. 等级：`GLOBAL`。别名：`ALTER POLICY`
  - `DROP ROW POLICY`. 等级：`GLOBAL`。别名：`DROP POLICY`
  - `CREATE QUOTA`. 等级：`GLOBAL`
  - `ALTER QUOTA`. 等级：`GLOBAL`
  - `DROP QUOTA`. 等级：`GLOBAL`
  - `CREATE SETTINGS PROFILE`. 等级：`GLOBAL`。别名：`CREATE PROFILE`
  - `ALTER SETTINGS PROFILE`. 等级：`GLOBAL`。别名：`ALTER PROFILE`
  - `DROP SETTINGS PROFILE`. 等级：`GLOBAL`。别名：`DROP PROFILE`
  - `SHOW ACCESS`. 等级：`GROUP`
    - `SHOW_USERS`. 等级：`GLOBAL`。别名：`SHOW CREATE USER`
    - `SHOW_ROLES`. 等级：`GLOBAL`。别名：`SHOW CREATE ROLE`
    - `SHOW_ROW_POLICIES`. 等级：`GLOBAL`。别名：`SHOW POLICIES`、`SHOW CREATE ROW POLICY`、`SHOW CREATE POLICY`
    - `SHOW_QUOTAS`. 等级：`GLOBAL`。别名：`SHOW CREATE QUOTA`
    - `SHOW_SETTINGS_PROFILES`. 等级：`GLOBAL`。别名：`SHOW PROFILES`、`SHOW CREATE SETTINGS PROFILE`、`SHOW CREATE PROFILE`
  - `ALLOW SQL SECURITY NONE`. 等级：`GLOBAL`。别名：`CREATE SQL SECURITY NONE`、`SQL SECURITY NONE`、`SECURITY NONE`

`ROLE ADMIN` 权限允许用户分配和撤销任意角色，包括那些并未授予给该用户（即使带有 admin 选项）的角色。

### SYSTEM \\{#system\\}

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

`SYSTEM RELOAD EMBEDDED DICTIONARIES` 权限会通过 `SYSTEM RELOAD DICTIONARY ON *.*` 权限隐式授予。

### 自省 \\{#introspection\\}

允许使用[自省](../../operations/optimizing-performance/sampling-query-profiler.md)函数。

- `INTROSPECTION`。级别：`GROUP`。别名：`INTROSPECTION FUNCTIONS`
  - `addressToLine`。级别：`GLOBAL`
  - `addressToLineWithInlines`。级别：`GLOBAL`
  - `addressToSymbol`。级别：`GLOBAL`
  - `demangle`。级别：`GLOBAL`

### SOURCES \\{#sources\\}

允许使用外部数据源。适用于[表引擎](../../engines/table-engines/index.md)和[表函数](/sql-reference/table-functions)。

- `READ`。级别：`GLOBAL_WITH_PARAMETER`  
- `WRITE`。级别：`GLOBAL_WITH_PARAMETER`

可用的参数：

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
对于数据源（sources）的 READ/WRITE 权限分离从 25.7 版本开始提供，并且仅在服务端配置项
`access_control_improvements.enable_read_write_grants`
启用时生效。

否则，应使用语法 `GRANT AZURE ON *.* TO user`，它等价于新的 `GRANT READ, WRITE ON AZURE TO user`。
:::

示例：

- 要创建一个使用 [MySQL 表引擎](../../engines/table-engines/integrations/mysql.md)的表，您需要具备 `CREATE TABLE (ON db.table_name)` 和 `MYSQL` 权限。
- 要使用 [mysql 表函数](../../sql-reference/table-functions/mysql.md)，您需要具备 `CREATE TEMPORARY TABLE` 和 `MYSQL` 权限。

### 源过滤器授权 \\{#source-filter-grants\\}

:::note
此功能自 25.8 版本起可用，并且仅在服务器设置
`access_control_improvements.enable_read_write_grants`
启用时生效。
:::

可以通过使用正则表达式过滤器为特定源 URI 授予访问权限，从而对用户可访问的外部数据源进行精细化控制。

**语法：**

```sql
GRANT READ ON S3('regexp_pattern') TO user
```

此授权使用户只能从与指定正则表达式模式匹配的 S3 URI 中读取。

**示例：**

授予对特定 S3 bucket 路径的访问权限：

```sql
-- Allow user to read only from s3://foo/ paths
GRANT READ ON S3('s3://foo/.*') TO john

-- Allow user to read from specific file patterns
GRANT READ ON S3('s3://mybucket/data/2024/.*\.parquet') TO analyst

-- Multiple filters can be granted to the same user
GRANT READ ON S3('s3://foo/.*') TO john
GRANT READ ON S3('s3://bar/.*') TO john
```

:::warning
源过滤器接受 **regexp** 作为参数，因此如下授权
`GRANT READ ON URL('http://www.google.com') TO john;`

将允许查询

```sql
SELECT * FROM url('https://www.google.com');
SELECT * FROM url('https://www-google.com');
```

因为在正则表达式中，`.` 被视为“任意单个字符”。
这可能会带来潜在的安全漏洞。正确的授权应为

```sql
GRANT READ ON URL('https://www\.google\.com') TO john;
```

:::

**使用 GRANT OPTION 重新授予权限：**

如果原有授权带有 `WITH GRANT OPTION`，则可以使用 `GRANT CURRENT GRANTS` 重新授予权限：

```sql
-- Original grant with GRANT OPTION
GRANT READ ON S3('s3://foo/.*') TO john WITH GRANT OPTION

-- John can now regrant this access to others
GRANT CURRENT GRANTS(READ ON S3) TO alice
```

**重要限制：**

* **不允许部分撤销：** 不能只撤销已授予过滤模式中的一部分。如有需要，必须撤销整个授权，然后使用新的模式重新授权。
* **不允许使用通配符授权：** 不能使用 `GRANT READ ON *('regexp')` 或类似仅包含通配符的模式。必须提供具体的数据源。

### dictGet \\{#dictget\\}

- `dictGet`。别名：`dictHas`、`dictGetHierarchy`、`dictIsIn`

允许执行 [dictGet](/sql-reference/functions/ext-dict-functions#dictGet)、[dictHas](../../sql-reference/functions/ext-dict-functions.md#dictHas)、[dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictGetHierarchy)、[dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictIsIn) 函数。

权限级别：`DICTIONARY`。

**示例**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`

### displaySecretsInShowAndSelect \\{#displaysecretsinshowandselect\\}

允许用户在 `SHOW` 和 `SELECT` 查询中查看机密信息（secrets），前提是
[`display_secrets_in_show_and_select` 服务器设置](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select)
和
[`format_display_secrets_in_show_and_select` 格式设置](../../operations/settings/formats#format_display_secrets_in_show_and_select)
都已开启。

### NAMED COLLECTION ADMIN \\{#named-collection-admin\\}

允许对指定的 named collection 执行某项操作。在 23.7 版本之前，它被称为 NAMED COLLECTION CONTROL，从 23.7 开始新增了 NAMED COLLECTION ADMIN，同时保留 NAMED COLLECTION CONTROL 作为别名。

- `NAMED COLLECTION ADMIN`。级别：`NAMED_COLLECTION`。别名：`NAMED COLLECTION CONTROL`
  - `CREATE NAMED COLLECTION`。级别：`NAMED_COLLECTION`
  - `DROP NAMED COLLECTION`。级别：`NAMED_COLLECTION`
  - `ALTER NAMED COLLECTION`。级别：`NAMED_COLLECTION`
  - `SHOW NAMED COLLECTIONS`。级别：`NAMED_COLLECTION`。别名：`SHOW NAMED COLLECTIONS`
  - `SHOW NAMED COLLECTIONS SECRETS`。级别：`NAMED_COLLECTION`。别名：`SHOW NAMED COLLECTIONS SECRETS`
  - `NAMED COLLECTION`。级别：`NAMED_COLLECTION`。别名：`NAMED COLLECTION USAGE, USE NAMED COLLECTION`

与所有其他授权（CREATE、DROP、ALTER、SHOW）不同，授权 NAMED COLLECTION 仅在 23.7 中才添加，而其他所有授权则更早在 22.12 中就已添加。

**示例**

假设 named collection 名为 abc，我们将 CREATE NAMED COLLECTION 权限授予用户 john。

- `GRANT CREATE NAMED COLLECTION ON abc TO john`

### TABLE ENGINE \\{#table-engine\\}

在创建表时允许使用指定的表引擎。适用于[表引擎](../../engines/table-engines/index.md)。

**示例**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`

:::note
默认情况下，出于向后兼容的考虑，使用特定表引擎创建表时会忽略权限授权，
但你可以通过在 config.xml 中将 [`table_engines_require_grant` 设置为 true](https://github.com/ClickHouse/ClickHouse/blob/df970ed64eaf472de1e7af44c21ec95956607ebb/programs/server/config.xml#L853-L855)
来更改这一行为。
:::

### ALL \\{#all\\}

<CloudNotSupportedBadge/>

将某个受管对象上的所有权限授予用户账户或角色。

:::note
在 ClickHouse Cloud 中不支持 `ALL` 权限，且 `default` 用户的权限是受限的。用户可以通过授予 `default_role`，为某个用户授予可用的最大权限。更多细节参见[此处](/cloud/security/manage-cloud-users)。
用户也可以以 `default` 用户的身份使用 `GRANT CURRENT GRANTS`，来实现与 `ALL` 类似的效果。
:::

### NONE \\{#none\\}

不赋予任何权限。

### ADMIN OPTION \\{#admin-option\\}

`ADMIN OPTION` 权限允许用户将自己的角色授予其他用户。