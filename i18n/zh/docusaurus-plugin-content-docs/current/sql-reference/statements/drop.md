---
description: 'DROP 语句文档'
sidebar_label: 'DROP'
sidebar_position: 44
slug: /sql-reference/statements/drop
title: 'DROP 语句'
doc_type: 'reference'
---

# DROP 语句 {#drop-statements}

删除已存在的实体。如果指定了 `IF EXISTS` 子句，当实体不存在时查询不会报错。如果指定了 `SYNC` 修饰符，则实体会被同步删除，不会产生延迟。

## DROP DATABASE {#drop-database}

删除名为 `db` 的数据库中的所有表，然后删除该数据库本身。

语法：

```sql
DROP DATABASE [IF EXISTS] db [ON CLUSTER cluster] [SYNC]
```

## DROP TABLE {#drop-table}

删除一个或多个表。

:::tip
若要撤销表的删除操作，请参阅 [UNDROP TABLE](/sql-reference/statements/undrop.md)。
:::

语法：

```sql
DROP [TEMPORARY] TABLE [IF EXISTS] [IF EMPTY]  [db1.]name_1[, [db2.]name_2, ...] [ON CLUSTER cluster] [SYNC]
```

限制：

* 如果指定了子句 `IF EMPTY`，服务器仅在接收该查询的副本上检查表是否为空。
* 同时删除多个表不是一个原子操作，即如果删除某个表失败，后续的表将不会被删除。

## DROP DICTIONARY {#drop-dictionary}

删除字典。

语法：

```sql
DROP DICTIONARY [IF EXISTS] [db.]name [SYNC]
```

## DROP USER {#drop-user}

删除用户。

语法：

```sql
DROP USER [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP ROLE {#drop-role}

删除角色。被删除的角色会在所有已被授予该角色的实体上被撤销。

语法：

```sql
DROP ROLE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP ROW POLICY {#drop-row-policy}

删除行策略。被删除的行策略会从所有已授予它的实体上撤销。

语法：

```sql
DROP [ROW] POLICY [IF EXISTS] name [,...] ON [database.]table [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP QUOTA {#drop-quota}

删除配额。被删除的配额会从所有已分配该配额的实体中取消。

语法：

```sql
DROP QUOTA [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP SETTINGS PROFILE {#drop-settings-profile}

删除设置配置文件。被删除的设置配置文件会从所有分配了该配置文件的实体上移除。

语法：

```sql
DROP [SETTINGS] PROFILE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```

## DROP VIEW {#drop-view}

删除视图。也可以使用 `DROP TABLE` 命令删除视图，但 `DROP VIEW` 会检查 `[db.]name` 是否为视图。

语法：

```sql
DROP VIEW [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

## DROP FUNCTION {#drop-function}

删除由 [CREATE FUNCTION](./create/function.md) 创建的用户定义函数。
系统函数无法删除。

**语法**

```sql
DROP FUNCTION [IF EXISTS] function_name [on CLUSTER cluster]
```

**示例**

```sql
CREATE FUNCTION linear_equation AS (x, k, b) -> k*x + b;
DROP FUNCTION linear_equation;
```

## DROP NAMED COLLECTION {#drop-named-collection}

删除一个命名集合。

**语法**

```sql
DROP NAMED COLLECTION [IF EXISTS] name [on CLUSTER cluster]
```

**示例**

```sql
CREATE NAMED COLLECTION foobar AS a = '1', b = '2';
DROP NAMED COLLECTION foobar;
```
