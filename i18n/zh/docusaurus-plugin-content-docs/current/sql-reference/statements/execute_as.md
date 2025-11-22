---
description: 'EXECUTE AS 语句文档'
sidebar_label: 'EXECUTE AS'
sidebar_position: 53
slug: /sql-reference/statements/execute_as
title: 'EXECUTE AS 语句'
doc_type: 'reference'
---



# EXECUTE AS 语句

允许以其他用户的身份执行查询。



## 语法 {#syntax}

```sql
EXECUTE AS target_user;
EXECUTE AS target_user subquery;
```

第一种形式(不带 `subquery`)将当前会话中的所有后续查询设置为以指定的 `target_user` 身份执行。

第二种形式(带 `subquery`)仅以指定的 `target_user` 身份执行指定的 `subquery`。

这两种形式都需要将服务器设置 [allow_impersonate_user](/operations/server-configuration-parameters/settings#allow_impersonate_user) 设为 `1`,并授予 `IMPERSONATE` 权限。例如,以下命令

```sql
GRANT IMPERSONATE ON user1 TO user2;
GRANT IMPERSONATE ON * TO user3;
```

允许用户 `user2` 执行 `EXECUTE AS user1 ...` 命令,同时允许用户 `user3` 以任意用户身份执行命令。

在模拟其他用户时,函数 [currentUser()](/sql-reference/functions/other-functions#currentUser) 返回被模拟用户的名称,而函数 [authenticatedUser()](/sql-reference/functions/other-functions#authenticatedUser) 返回实际通过身份验证的用户名称。


## 示例 {#examples}

```sql
SELECT currentUser(), authenticatedUser(); -- 输出 "default    default"
CREATE USER james;
EXECUTE AS james SELECT currentUser(), authenticatedUser(); -- 输出 "james    default"
```
