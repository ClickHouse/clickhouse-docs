---
description: 'EXECUTE AS 语句文档'
sidebar_label: 'EXECUTE AS'
sidebar_position: 53
slug: /sql-reference/statements/execute_as
title: 'EXECUTE AS 语句'
doc_type: 'reference'
---

# EXECUTE AS 语句 {#execute-as-statement}

允许以其他用户身份执行查询。

## 语法 {#syntax}

```sql
EXECUTE AS target_user;
EXECUTE AS target_user subquery;
```

第一种形式（不带 `subquery`）会将当前会话中后续的所有查询，都以指定的 `target_user` 身份执行。

第二种形式（带有 `subquery`）只会以指定的 `target_user` 身份执行给定的 `subquery`。

为了使这两种形式生效，服务器配置项 [allow&#95;impersonate&#95;user](/operations/server-configuration-parameters/settings#allow_impersonate_user)
必须设置为 `1`，并且需要授予 `IMPERSONATE` 权限。例如，下面的命令

```sql
GRANT IMPERSONATE ON user1 TO user2;
GRANT IMPERSONATE ON * TO user3;
```

允许用户 `user2` 执行命令 `EXECUTE AS user1 ...`，并且还允许用户 `user3` 以任意用户身份执行命令。

在模拟另一个用户时，函数 [currentUser()](/sql-reference/functions/other-functions#currentUser) 返回被模拟用户的名称，
而函数 [authenticatedUser()](/sql-reference/functions/other-functions#authenticatedUser) 返回实际通过认证的用户名。

## 示例 {#examples}

```sql
SELECT currentUser(), authenticatedUser(); -- outputs "default    default"
CREATE USER james;
EXECUTE AS james SELECT currentUser(), authenticatedUser(); -- outputs "james    default"
```
