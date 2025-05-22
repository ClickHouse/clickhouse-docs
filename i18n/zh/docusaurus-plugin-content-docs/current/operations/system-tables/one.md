
# system.one

此表包含一行，具有一个 `dummy` UInt8 列，值为 0。

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
