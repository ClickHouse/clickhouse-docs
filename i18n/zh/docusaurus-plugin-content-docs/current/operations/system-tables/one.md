---
description: '系统表，仅包含一行和一个名为 `dummy` 的 UInt8 列，其值为 0。类似于其他 DBMS 中的 `DUAL` 表。'
keywords: ['系统表', 'one']
slug: /operations/system-tables/one
title: 'system.one'
doc_type: 'reference'
---

# system.one

该表只包含一行数据，且仅有一个名为 `dummy` 的 UInt8 列，其值为 0。

当 `SELECT` 查询未指定 `FROM` 子句时，会使用该表。

这类似于其他 DBMS 中的 `DUAL` 表。

**示例**

```sql
SELECT * FROM system.one LIMIT 10;
```

```response
┌─dummy─┐
│     0 │
└───────┘

结果集包含 1 行。用时：0.001 秒。
```
