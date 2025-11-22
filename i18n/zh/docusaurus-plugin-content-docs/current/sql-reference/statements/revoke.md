---
description: 'REVOKE 语句文档'
sidebar_label: 'REVOKE'
sidebar_position: 39
slug: /sql-reference/statements/revoke
title: 'REVOKE 语句'
doc_type: 'reference'
---



# REVOKE 语句

从用户或角色收回权限。



## 语法 {#syntax}

**从用户撤销权限**

```sql
REVOKE [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*} FROM {user | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user | CURRENT_USER} [,...]
```

**从用户撤销角色**

```sql
REVOKE [ON CLUSTER cluster_name] [ADMIN OPTION FOR] role [,...] FROM {user | role | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user_name | role_name | CURRENT_USER} [,...]
```


## 描述 {#description}

要撤销某个权限,可以使用比计划撤销的权限范围更广的权限。例如,如果用户拥有 `SELECT (x,y)` 权限,管理员可以执行 `REVOKE SELECT(x,y) ...`、`REVOKE SELECT * ...` 甚至 `REVOKE ALL PRIVILEGES ...` 查询来撤销该权限。

### 部分撤销 {#partial-revokes}

可以撤销权限的一部分。例如,如果用户拥有 `SELECT *.*` 权限,可以撤销其从某个表或数据库读取数据的权限。


## 示例 {#examples}

授予 `john` 用户账户对所有数据库的查询权限,但 `accounts` 数据库除外:

```sql
GRANT SELECT ON *.* TO john;
REVOKE SELECT ON accounts.* FROM john;
```

授予 `mira` 用户账户对 `accounts.staff` 表所有列的查询权限,但 `wage` 列除外。

```sql
GRANT SELECT ON accounts.staff TO mira;
REVOKE SELECT(wage) ON accounts.staff FROM mira;
```

[原始文章](/operations/settings/settings/)
