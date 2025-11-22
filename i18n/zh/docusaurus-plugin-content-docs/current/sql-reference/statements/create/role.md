---
description: '角色相关文档'
sidebar_label: 'ROLE'
sidebar_position: 40
slug: /sql-reference/statements/create/role
title: 'CREATE ROLE（创建角色）'
doc_type: 'reference'
---

创建新的[角色](../../../guides/sre/user-management/index.md#role-management)。角色是一组[权限](/sql-reference/statements/grant#granting-privilege-syntax)。被授予某个角色的[用户](../../../sql-reference/statements/create/user.md)将获得该角色的所有权限。

语法：

```sql
CREATE ROLE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | PROFILE 'profile_name'] [,...]
```


## 管理角色 {#managing-roles}

一个用户可以被分配多个角色。用户可以通过 [SET ROLE](../../../sql-reference/statements/set-role.md) 语句以任意组合方式应用已分配的角色。最终的权限范围是所有已应用角色的全部权限的组合集合。如果用户账户直接被授予了权限,这些权限也会与通过角色授予的权限组合在一起。

用户可以设置默认角色,这些角色会在用户登录时自动应用。要设置默认角色,请使用 [SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) 语句或 [ALTER USER](/sql-reference/statements/alter/user) 语句。

要撤销角色,请使用 [REVOKE](../../../sql-reference/statements/revoke.md) 语句。

要删除角色,请使用 [DROP ROLE](/sql-reference/statements/drop#drop-role) 语句。被删除的角色会自动从所有被分配该角色的用户和角色中撤销。


## 示例 {#examples}

```sql
CREATE ROLE accountant;
GRANT SELECT ON db.* TO accountant;
```

此查询序列创建了角色 `accountant`,该角色拥有从 `db` 数据库读取数据的权限。

将角色分配给用户 `mira`:

```sql
GRANT accountant TO mira;
```

角色分配后,用户可以应用该角色并执行被允许的查询。例如:

```sql
SET ROLE accountant;
SELECT * FROM db.*;
```
