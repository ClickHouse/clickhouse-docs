---
slug: /sql-reference/statements/set-role
sidebar_position: 51
sidebar_label: SET ROLE
title: 'SET ROLE 语句'
---

激活当前用户的角色。

``` sql
SET ROLE {DEFAULT | NONE | role [,...] | ALL | ALL EXCEPT role [,...]}
```

## 设置默认角色 {#set-default-role}

为用户设置默认角色。

默认角色在用户登录时自动激活。您只能将先前授予的角色设置为默认角色。如果角色没有授予给用户，ClickHouse 将抛出异常。

``` sql
SET DEFAULT ROLE {NONE | role [,...] | ALL | ALL EXCEPT role [,...]} TO {user|CURRENT_USER} [,...]
```

## 示例 {#examples}

为用户设置多个默认角色：

``` sql
SET DEFAULT ROLE role1, role2, ... TO user
```

将所有授予的角色作为默认角色设置给用户：

``` sql
SET DEFAULT ROLE ALL TO user
```

从用户中清除默认角色：

``` sql
SET DEFAULT ROLE NONE TO user
```

将所有授予的角色作为默认角色设置给用户，但特定角色 `role1` 和 `role2` 除外：

``` sql
SET DEFAULT ROLE ALL EXCEPT role1, role2 TO user
```
