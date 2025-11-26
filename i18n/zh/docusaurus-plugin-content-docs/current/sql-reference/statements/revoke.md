---
description: 'REVOKE 语句说明'
sidebar_label: 'REVOKE'
sidebar_position: 39
slug: /sql-reference/statements/revoke
title: 'REVOKE 语句'
doc_type: 'reference'
---



# REVOKE 语句

从用户或角色撤销已授予的权限。



## 语法

**撤销用户权限**

```sql
REVOKE [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*} FROM {user | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user | CURRENT_USER} [,...]
```

**撤销用户的角色**

```sql
REVOKE [ON CLUSTER cluster_name] [ADMIN OPTION FOR] role [,...] FROM {user | role | CURRENT_USER} [,...] | ALL | ALL EXCEPT {user_name | role_name | CURRENT_USER} [,...]
```


## 描述 {#description}

要撤销某些权限时，可以使用作用范围比计划撤销的权限更宽泛的权限。例如，如果某个用户拥有 `SELECT (x,y)` 权限，管理员可以执行 `REVOKE SELECT(x,y) ...`，或者 `REVOKE SELECT * ...`，甚至执行 `REVOKE ALL PRIVILEGES ...` 查询来撤销该权限。

### 部分撤销 {#partial-revokes}

可以仅撤销权限的一部分。例如，如果用户拥有 `SELECT *.*` 权限，你可以撤销其中从某些表或某个数据库读取数据的权限。



## 示例

为用户账户 `john` 授予在除 `accounts` 数据库之外的所有数据库上执行 `SELECT` 的权限：

```sql
GRANT SELECT ON *.* TO john;
REVOKE SELECT ON accounts.* FROM john;
```

授予 `mira` 用户账户对 `accounts.staff` 表中除 `wage` 列以外所有列的 `SELECT` 权限。

```sql
GRANT SELECT ON accounts.staff TO mira;
REVOKE SELECT(wage) ON accounts.staff FROM mira;
```

[原文](/operations/settings/settings/)
