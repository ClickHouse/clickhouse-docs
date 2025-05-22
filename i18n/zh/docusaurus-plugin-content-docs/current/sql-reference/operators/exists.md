
# EXISTS

`EXISTS` 操作符检查子查询结果中有多少记录。如果为空，则操作符返回 `0`。否则，它返回 `1`。

`EXISTS` 也可以在 [WHERE](../../sql-reference/statements/select/where.md) 子句中使用。

:::tip    
子查询不支持对主查询表和列的引用。
:::

**语法**

```sql
EXISTS(subquery)
```

**示例**

检查子查询中值存在性的查询：

```sql
SELECT EXISTS(SELECT * FROM numbers(10) WHERE number > 8), EXISTS(SELECT * FROM numbers(10) WHERE number > 11)
```

结果：

```text
┌─in(1, _subquery1)─┬─in(1, _subquery2)─┐
│                 1 │                 0 │
└───────────────────┴───────────────────┘
```

返回多个行的子查询的查询：

```sql
SELECT count() FROM numbers(10) WHERE EXISTS(SELECT number FROM numbers(10) WHERE number > 8);
```

结果：

```text
┌─count()─┐
│      10 │
└─────────┘
```

返回空结果的子查询的查询：

```sql
SELECT count() FROM numbers(10) WHERE EXISTS(SELECT number FROM numbers(10) WHERE number > 11);
```

结果：

```text
┌─count()─┐
│       0 │
└─────────┘
```
