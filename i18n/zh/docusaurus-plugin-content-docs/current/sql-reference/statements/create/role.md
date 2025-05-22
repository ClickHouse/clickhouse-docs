创建新的 [角色](../../../guides/sre/user-management/index.md#role-management)。角色是一组 [权限](/sql-reference/statements/grant#granting-privilege-syntax)。被分配角色的 [用户](../../../sql-reference/statements/create/user.md) 获得该角色的所有权限。

语法：

```sql
CREATE ROLE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | PROFILE 'profile_name'] [,...]
```

## 管理角色 {#managing-roles}

用户可以被分配多个角色。用户可以通过 [SET ROLE](../../../sql-reference/statements/set-role.md) 语句以任意组合应用他们分配的角色。最终的权限范围是所有应用角色的所有权限的组合。如果用户直接授予了权限给其用户账户，这些权限也会与角色授予的权限进行组合。

用户可以拥有默认角色，这些角色在用户登录时适用。要设置默认角色，请使用 [SET DEFAULT ROLE](/sql-reference/statements/set-role#set-default-role) 语句或 [ALTER USER](/sql-reference/statements/alter/user) 语句。

要撤销角色，请使用 [REVOKE](../../../sql-reference/statements/revoke.md) 语句。

要删除角色，请使用 [DROP ROLE](/sql-reference/statements/drop#drop-role) 语句。被删除的角色将自动从其被分配的所有用户和角色中撤销。

## 示例 {#examples}

```sql
CREATE ROLE accountant;
GRANT SELECT ON db.* TO accountant;
```

这一系列查询创建了一个具有从 `db` 数据库读取数据权限的角色 `accountant`。

将角色分配给用户 `mira`：

```sql
GRANT accountant TO mira;
```

在角色分配后，用户可以应用该角色并执行允许的查询。例如：

```sql
SET ROLE accountant;
SELECT * FROM db.*;
```
