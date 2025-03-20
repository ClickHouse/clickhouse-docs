---
slug: /sql-reference/statements/move
sidebar_position: 54
sidebar_label: MOVE
---


# MOVE 访问实体语句

此语句允许将一个访问实体从一个访问存储移动到另一个。

语法：

```sql
MOVE {USER, ROLE, QUOTA, SETTINGS PROFILE, ROW POLICY} name1 [, name2, ...] TO access_storage_type
```

目前，ClickHouse 中有五种访问存储：
 - `local_directory`
 - `memory`
 - `replicated`
 - `users_xml` (只读)
 - `ldap` (只读)

示例：

```sql
MOVE USER test TO local_directory
```

```sql
MOVE ROLE test TO memory
```
