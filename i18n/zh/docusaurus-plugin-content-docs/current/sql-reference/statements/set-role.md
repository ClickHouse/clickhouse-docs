---
description: 'SET ROLE 文档'
sidebar_label: 'SET ROLE'
sidebar_position: 51
slug: /sql-reference/statements/set-role
title: 'SET ROLE 语句'
doc_type: 'reference'
---

为当前用户启用角色。

```sql
SET ROLE {DEFAULT | NONE | role [,...] | ALL | ALL EXCEPT role [,...]}
```

## SET DEFAULT ROLE {#set-default-role}

为用户设置默认角色。

默认角色会在用户登录时自动激活。你只能将已授予的角色设置为默认角色。若某个角色尚未授予该用户，ClickHouse 会抛出异常。

```sql
SET DEFAULT ROLE {NONE | role [,...] | ALL | ALL EXCEPT role [,...]} TO {user|CURRENT_USER} [,...]
```

## 示例 {#examples}

为用户分配多个默认角色：

```sql
SET DEFAULT ROLE role1, role2, ... TO user
```

将所有已授予的角色设置为某个用户的默认角色：

```sql
SET DEFAULT ROLE ALL TO user
```

从用户中移除默认角色：

```sql
SET DEFAULT ROLE NONE TO user
```

将所有已授予角色都设为默认角色，但排除特定角色 `role1` 和 `role2`：

```sql
SET DEFAULT ROLE ALL EXCEPT role1, role2 TO user
```
