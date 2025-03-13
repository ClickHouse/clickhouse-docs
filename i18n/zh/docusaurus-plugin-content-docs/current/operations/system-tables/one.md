---
description: '系统表，包含一行和一个 `dummy` UInt8 列，值为 0。类似于其他 DBMS 中的 `DUAL` 表。'
slug: /operations/system-tables/one
title: 'system.one'
keywords: ['system table', 'one']
---

该表包含一行和一个 `dummy` UInt8 列，值为 0。

如果 `SELECT` 查询没有指定 `FROM` 子句，则使用该表。

这类似于其他 DBMS 中的 `DUAL` 表。

**示例**

```sql
SELECT * FROM system.one LIMIT 10;
```

```response
┌─dummy─┐
│     0 │
└───────┘

1 rows in set. Elapsed: 0.001 sec.
```
