---
description: '系统表，包含一行且仅有一个名为 `dummy` 的 UInt8 列，列值为 0。类似于其他 DBMS 中的 `DUAL` 表。'
keywords: ['系统表', 'one']
slug: /operations/system-tables/one
title: 'system.one'
doc_type: 'reference'
---

# system.one \\{#systemone\\}

该表包含一行数据，只有一个名为 `dummy` 的 UInt8 列，列中的值为 0。

当 `SELECT` 查询中未指定 `FROM` 子句时，会使用该表。

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
