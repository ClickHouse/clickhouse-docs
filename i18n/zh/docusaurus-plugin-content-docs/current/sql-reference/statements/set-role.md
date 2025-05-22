激活当前用户的角色。

```sql
SET ROLE {DEFAULT | NONE | role [,...] | ALL | ALL EXCEPT role [,...]}
```

## SET DEFAULT ROLE {#set-default-role}

为用户设置默认角色。

默认角色在用户登录时会自动激活。您只能将先前授予的角色设置为默认角色。如果该角色未授予用户，ClickHouse 将抛出异常。

```sql
SET DEFAULT ROLE {NONE | role [,...] | ALL | ALL EXCEPT role [,...]} TO {user|CURRENT_USER} [,...]
```

## 示例 {#examples}

为用户设置多个默认角色：

```sql
SET DEFAULT ROLE role1, role2, ... TO user
```

将所有已授予的角色设置为用户的默认角色：

```sql
SET DEFAULT ROLE ALL TO user
```

从用户中清除默认角色：

```sql
SET DEFAULT ROLE NONE TO user
```

将所有已授予的角色设置为默认角色，排除特定角色 `role1` 和 `role2`：

```sql
SET DEFAULT ROLE ALL EXCEPT role1, role2 TO user
```
