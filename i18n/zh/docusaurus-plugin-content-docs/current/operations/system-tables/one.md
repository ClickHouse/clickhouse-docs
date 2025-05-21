---
'description': '系统表，包含一行数据，其中包含一个名为`dummy`的UInt8列，其值为0。类似于其他DBMS中的`DUAL`表。'
'keywords':
- 'system table'
- 'one'
'slug': '/operations/system-tables/one'
'title': '系统.one'
---




# system.one

此表包含一行，且仅包含一个 `dummy` UInt8 列，值为 0。

如果一个 `SELECT` 查询未指定 `FROM` 子句，将使用此表。

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
