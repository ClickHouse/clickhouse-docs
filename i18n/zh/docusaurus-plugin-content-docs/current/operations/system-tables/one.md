---
'description': '系统表包含一行和一个`dummy` UInt8 列，其值为 0。类似于其他 DBMS 中的 `DUAL` 表。'
'keywords':
- 'system table'
- 'one'
'slug': '/operations/system-tables/one'
'title': 'system.one'
'doc_type': 'reference'
---


# system.one

该表包含一行，包含一个 `dummy` UInt8 列，其中的值为 0。

当 `SELECT` 查询未指定 `FROM` 子句时，将使用该表。

这类似于在其他数据库管理系统中发现的 `DUAL` 表。

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
