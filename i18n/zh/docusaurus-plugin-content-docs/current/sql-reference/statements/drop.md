---
slug: /sql-reference/statements/drop
sidebar_position: 44
sidebar_label: DROP
---


# DROP 语句

删除现有实体。如果指定了 `IF EXISTS` 子句，当实体不存在时，这些查询不会返回错误。如果指定了 `SYNC` 修饰符，则实体会立即被删除。

## DROP DATABASE {#drop-database}

删除 `db` 数据库中的所有表，然后删除 `db` 数据库本身。

语法：

``` sql
DROP DATABASE [IF EXISTS] db [ON CLUSTER cluster] [SYNC]
```

## DROP TABLE {#drop-table}

删除一个或多个表。

:::tip
要撤销删除表的操作，请参见 [UNDROP TABLE](/sql-reference/statements/undrop.md)
:::

语法：

``` sql
DROP [TEMPORARY] TABLE [IF EXISTS] [IF EMPTY]  [db1.]name_1[, [db2.]name_2, ...] [ON CLUSTER cluster] [SYNC]
```

限制：
- 如果指定了 `IF EMPTY` 子句，服务器只检查接收到查询的副本中的表是否为空。  
- 同时删除多个表不是原子操作，即如果某个表的删除失败，后续的表将不会被删除。

## DROP DICTIONARY {#drop-dictionary}

删除字典。

语法：

``` sql
DROP DICTIONARY [IF EXISTS] [db.]name [SYNC]
```

## DROP USER {#drop-user}

删除用户。

语法：

``` sql
DROP USER [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP ROLE {#drop-role}

删除角色。被删除的角色从所有被分配的实体中撤销。

语法：

``` sql
DROP ROLE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP ROW POLICY {#drop-row-policy}

删除行策略。被删除的行策略从所有被分配的实体中撤销。

语法：

``` sql
DROP [ROW] POLICY [IF EXISTS] name [,...] ON [database.]table [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP QUOTA {#drop-quota}

删除配额。被删除的配额从所有被分配的实体中撤销。

语法：

``` sql
DROP QUOTA [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP SETTINGS PROFILE {#drop-settings-profile}

删除设置配置文件。被删除的设置配置文件从所有被分配的实体中撤销。

语法：

``` sql
DROP [SETTINGS] PROFILE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP VIEW {#drop-view}

删除视图。视图也可以通过 `DROP TABLE` 命令删除，但 `DROP VIEW` 确保 `[db.]name` 是一个视图。

语法：

``` sql
DROP VIEW [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

## DROP FUNCTION {#drop-function}

删除用户定义的函数，该函数通过 [CREATE FUNCTION](./create/function.md) 创建。
系统函数不能被删除。

**语法**

``` sql
DROP FUNCTION [IF EXISTS] function_name [on CLUSTER cluster]
```

**示例**

``` sql
CREATE FUNCTION linear_equation AS (x, k, b) -> k*x + b;
DROP FUNCTION linear_equation;
```

## DROP NAMED COLLECTION {#drop-named-collection}

删除命名集合。

**语法**

``` sql
DROP NAMED COLLECTION [IF EXISTS] name [on CLUSTER cluster]
```

**示例**

``` sql
CREATE NAMED COLLECTION foobar AS a = '1', b = '2';
DROP NAMED COLLECTION foobar;
```
