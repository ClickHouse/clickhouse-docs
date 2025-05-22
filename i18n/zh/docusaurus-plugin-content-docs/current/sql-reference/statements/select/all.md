
# ALL 子句

如果表中有多个匹配的行，那么 `ALL` 将返回所有这些行。 `SELECT ALL` 与没有 `DISTINCT` 的 `SELECT` 相同。如果同时指定 `ALL` 和 `DISTINCT`，则会抛出异常。

`ALL` 可以在聚合函数内指定，尽管它对查询结果没有实际影响。

例如：

```sql
SELECT sum(ALL number) FROM numbers(10);
```

等效于：

```sql
SELECT sum(number) FROM numbers(10);
```
