---
'description': 'REVOKE 语句的文档'
'sidebar_label': 'REVOKE'
'sidebar_position': 39
'slug': '/sql-reference/statements/revoke'
'title': 'REVOKE 语句'
---


# REVOKE 语句

从用户或角色中撤销权限。

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

要撤销某些权限，您可以使用比您计划撤销的权限范围更广泛的权限。例如，如果用户拥有 `SELECT (x,y)` 权限，管理员可以执行 `REVOKE SELECT(x,y) ...`，或 `REVOKE SELECT * ...`，甚至 `REVOKE ALL PRIVILEGES ...` 查询来撤销此权限。

### 部分撤销 {#partial-revokes}

您可以撤销部分权限。例如，如果用户拥有 `SELECT *.*` 权限，您可以从中撤销对某个表或数据库读取数据的权限。

## 示例 {#examples}

授予 `john` 用户账户从所有数据库中选择的权限，除了 `accounts` 数据库：

```sql
GRANT SELECT ON *.* TO john;
REVOKE SELECT ON accounts.* FROM john;
```

授予 `mira` 用户账户从 `accounts.staff` 表中选择所有列的权限，除了 `wage` 列。

```sql
GRANT SELECT ON accounts.staff TO mira;
REVOKE SELECT(wage) ON accounts.staff FROM mira;
```

[原文文章](/operations/settings/settings/)
