---
description: 'DROP 语句文档'
sidebar_label: 'DROP'
sidebar_position: 44
slug: /sql-reference/statements/drop
title: 'DROP 语句'
doc_type: 'reference'
---



# DROP 语句

删除现有实体。如果指定了 `IF EXISTS` 子句，当实体不存在时查询不会返回错误。如果指定了 `SYNC` 修饰符，实体会被立即删除，不会有延迟。



## DROP DATABASE {#drop-database}

删除 `db` 数据库内的所有表,然后删除 `db` 数据库本身。

语法:

```sql
DROP DATABASE [IF EXISTS] db [ON CLUSTER cluster] [SYNC]
```


## DROP TABLE {#drop-table}

删除一个或多个表。

:::tip
要撤销表的删除操作,请参阅 [UNDROP TABLE](/sql-reference/statements/undrop.md)
:::

语法:

```sql
DROP [TEMPORARY] TABLE [IF EXISTS] [IF EMPTY]  [db1.]name_1[, [db2.]name_2, ...] [ON CLUSTER cluster] [SYNC]
```

限制:

- 如果指定了 `IF EMPTY` 子句,服务器仅在接收查询的副本上检查表是否为空。
- 同时删除多个表不是原子操作,即如果某个表删除失败,后续的表将不会被删除。


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

删除角色。已删除的角色将从所有已分配该角色的实体中撤销。

语法：

```sql
DROP ROLE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```


## DROP ROW POLICY {#drop-row-policy}

删除行策略。删除的行策略将从所有已分配该策略的实体中撤销。

语法：

```sql
DROP [ROW] POLICY [IF EXISTS] name [,...] ON [database.]table [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```


## DROP QUOTA {#drop-quota}

删除配额。已删除的配额将从所有已分配该配额的实体中撤销。

语法：

```sql
DROP QUOTA [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```


## DROP SETTINGS PROFILE {#drop-settings-profile}

删除设置配置文件。被删除的设置配置文件将从所有已分配该配置文件的实体中撤销。

语法：

```sql
DROP [SETTINGS] PROFILE [IF EXISTS] name [,...] [ON CLUSTER cluster_name] [FROM access_storage_type]
```


## DROP VIEW {#drop-view}

删除视图。视图也可以使用 `DROP TABLE` 命令删除,但 `DROP VIEW` 会检查 `[db.]name` 是否为视图。

语法:

```sql
DROP VIEW [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```


## DROP FUNCTION {#drop-function}

删除通过 [CREATE FUNCTION](./create/function.md) 创建的用户定义函数。
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
