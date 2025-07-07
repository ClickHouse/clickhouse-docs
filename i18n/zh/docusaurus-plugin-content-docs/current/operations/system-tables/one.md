---
'description': '系统表包含一个行和一个 `dummy` UInt8 列，值为 0。类似于其他 DBMS 中找到的 `DUAL` 表。'
'keywords':
- 'system table'
- 'one'
'slug': '/operations/system-tables/one'
'title': 'system.one'
---


# system.one

这个表包含一行，具有一个 `dummy` UInt8 列，其值为 0。

如果 `SELECT` 查询未指定 `FROM` 子句，则使用此表。

这类似于其他数据库管理系统中的 `DUAL` 表。

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
