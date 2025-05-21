---
'description': 'Documentation for UNION Clause'
'sidebar_label': 'UNION'
'slug': '/sql-reference/statements/select/union'
'title': 'UNION Clause'
---




# UNION 子句

您可以使用 `UNION` 并明确指定 `UNION ALL` 或 `UNION DISTINCT`。

如果不指定 `ALL` 或 `DISTINCT`，则将根据 `union_default_mode` 设置而定。`UNION ALL` 和 `UNION DISTINCT` 之间的区别在于，`UNION DISTINCT` 会对联合结果进行去重处理，它相当于从包含 `UNION ALL` 的子查询中 `SELECT DISTINCT`。

您可以使用 `UNION` 来结合任意数量的 `SELECT` 查询，通过扩展它们的结果。示例：

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

结果列通过它们的索引（`SELECT` 内的顺序）进行匹配。如果列名不匹配，则最终结果的名称取自第一个查询。

在联合时会执行类型转换。例如，如果两个被合并的查询在兼容类型中具有同一字段，其中一个为非 `Nullable` 类型，另一个为 `Nullable` 类型，则结果 `UNION` 的字段将为 `Nullable` 类型。

`UNION` 中的查询可以用圆括号括起来。[ORDER BY](../../../sql-reference/statements/select/order-by.md) 和 [LIMIT](../../../sql-reference/statements/select/limit.md) 应用于单独的查询，而不是最终结果。如果需要对最终结果应用转换，可以将所有含有 `UNION` 的查询放在 [FROM](../../../sql-reference/statements/select/from.md) 子句中的子查询内。

如果您使用 `UNION` 而不明确指定 `UNION ALL` 或 `UNION DISTINCT`，可以通过 [union_default_mode](/operations/settings/settings#union_default_mode) 设置来指定联合模式。设置值可以是 `ALL`、`DISTINCT` 或空字符串。但是，如果您使用 `UNION` 并将 `union_default_mode` 设置为空字符串，则会引发异常。以下示例演示了不同值设置查询的结果。

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

`UNION/UNION ALL/UNION DISTINCT` 中的查询可以同时运行，并且它们的结果可以混合在一起。

**另见**

- [insert_null_as_default](../../../operations/settings/settings.md#insert_null_as_default) 设置。
- [union_default_mode](/operations/settings/settings#union_default_mode) 设置。
