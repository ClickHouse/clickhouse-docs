---
description: 'SETTINGS PROFILE 文档'
sidebar_label: 'SETTINGS PROFILE'
sidebar_position: 43
slug: /sql-reference/statements/create/settings-profile
title: '创建 SETTINGS PROFILE'
doc_type: 'reference'
---

创建可以分配给用户或角色的 [settings profile](../../../guides/sre/user-management/index.md#settings-profiles-management)。

语法：

```sql
CREATE SETTINGS PROFILE [IF NOT EXISTS | OR REPLACE] name1 [, name2 [,...]] 
    [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [SETTINGS variable [= value] [MIN [=] min_value] [MAX [=] max_value] [CONST|READONLY|WRITABLE|CHANGEABLE_IN_READONLY] | INHERIT 'profile_name'] [,...]
    [TO {{role1 | user1 [, role2 | user2 ...]} | NONE | ALL | ALL EXCEPT {role1 | user1 [, role2 | user2 ...]}}]
```

`ON CLUSTER` 子句允许在集群上创建 SETTINGS PROFILE，参见 [Distributed DDL](../../../sql-reference/distributed-ddl.md)。

## 示例 {#example}

创建用户：

```sql
CREATE USER robin IDENTIFIED BY 'password';
```

创建 `max_memory_usage_profile` SETTINGS PROFILE，为 `max_memory_usage` 设置指定取值和约束，并将其分配给用户 `robin`：

```sql
CREATE
SETTINGS PROFILE max_memory_usage_profile SETTINGS max_memory_usage = 100000001 MIN 90000000 MAX 110000000
TO robin
```
