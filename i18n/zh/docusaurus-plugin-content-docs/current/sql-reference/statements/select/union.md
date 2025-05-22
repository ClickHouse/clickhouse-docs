---
'description': 'UNION 子句 的文档'
'sidebar_label': 'UNION'
'slug': '/sql-reference/statements/select/union'
'title': 'UNION 子句'
---


# UNION 子句

您可以使用 `UNION` 并明确指定 `UNION ALL` 或 `UNION DISTINCT`。

如果您没有指定 `ALL` 或 `DISTINCT`，则会根据 `union_default_mode` 设置来决定。`UNION ALL` 和 `UNION DISTINCT` 之间的区别在于，`UNION DISTINCT` 会对联合结果进行去重转换，相当于从包含 `UNION ALL` 的子查询中执行 `SELECT DISTINCT`。

您可以使用 `UNION` 通过扩展结果来组合任何数量的 `SELECT` 查询。例如：

```sql
SELECT CounterID, 1 AS table, toInt64(count()) AS c
    FROM test.hits
    GROUP BY CounterID

UNION ALL

SELECT CounterID, 2 AS table, sum(Sign) AS c
    FROM test.visits
    GROUP BY CounterID
    HAVING c > 0
```

结果列通过它们的索引（在 `SELECT` 中的顺序）进行匹配。如果列名不匹配，最终结果的名称将来自第一个查询。

对于联合会执行类型转换。例如，如果两个要合并的查询具有相同的字段，且类型分别为非 `Nullable` 和 `Nullable` 的兼容类型，则所得的 `UNION` 将具有 `Nullable` 类型字段。

`UNION` 中的查询可以用圆括号括起来。[ORDER BY](../../../sql-reference/statements/select/order-by.md) 和 [LIMIT](../../../sql-reference/statements/select/limit.md) 适用于单独的查询，而不是最终结果。如果需要对最终结果应用转换，可以将所有带有 `UNION` 的查询放入 [FROM](../../../sql-reference/statements/select/from.md) 子句中的子查询中。

如果您使用 `UNION` 而没有明确指定 `UNION ALL` 或 `UNION DISTINCT`，可以使用 [union_default_mode](/operations/settings/settings#union_default_mode) 设置指定联合模式。该设置的值可以是 `ALL`、`DISTINCT` 或空字符串。但是，如果您使用 `union_default_mode` 设置为空字符串，则会抛出异常。以下示例演示了具有不同值设置的查询结果。

查询：

```sql
SET union_default_mode = 'DISTINCT';
SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 2;
```

结果：

```text
┌─1─┐
│ 1 │
└───┘
┌─1─┐
│ 2 │
└───┘
┌─1─┐
│ 3 │
└───┘
```

查询：

```sql
SET union_default_mode = 'ALL';
SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 2;
```

结果：

```text
┌─1─┐
│ 1 │
└───┘
┌─1─┐
│ 2 │
└───┘
┌─1─┐
│ 2 │
└───┘
┌─1─┐
│ 3 │
└───┘
```

`UNION/UNION ALL/UNION DISTINCT` 的部分查询可以同时运行，并且它们的结果可以混合在一起。

**另请参阅**

- [insert_null_as_default](../../../operations/settings/settings.md#insert_null_as_default) 设置。
- [union_default_mode](/operations/settings/settings#union_default_mode) 设置。
