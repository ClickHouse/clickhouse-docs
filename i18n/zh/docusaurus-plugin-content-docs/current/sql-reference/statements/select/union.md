
# UNION子句

您可以使用 `UNION`，也可以明确指定 `UNION ALL` 或 `UNION DISTINCT`。

如果不指定 `ALL` 或 `DISTINCT`，则将依赖于 `union_default_mode` 设置。 `UNION ALL` 和 `UNION DISTINCT` 之间的区别在于，`UNION DISTINCT` 将对联合结果进行去重转换。它等同于从包含 `UNION ALL` 的子查询中执行 `SELECT DISTINCT`。

您可以使用 `UNION` 来结合任意数量的 `SELECT` 查询，扩展它们的结果。示例：

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

结果列通过它们在 `SELECT` 中的索引进行匹配。如果列名不匹配，最终结果的名称将取自第一个查询。

在联合时会执行类型转换。例如，如果两个要合并的查询具有相同字段，但一个为非 `Nullable` 类型另一个为 `Nullable` 类型且来自兼容类型，则结果的 `UNION` 会拥有一个 `Nullable` 类型的字段。

`UNION` 的部分查询可以用圆括号括起来。[ORDER BY](../../../sql-reference/statements/select/order-by.md) 和 [LIMIT](../../../sql-reference/statements/select/limit.md) 适用于单独的查询，而不是最终结果。如果您需要对最终结果应用转换，可以将所有的 `UNION` 查询放在 [FROM](../../../sql-reference/statements/select/from.md) 子句的子查询中。

如果您使用 `UNION` 而不明确指定 `UNION ALL` 或 `UNION DISTINCT`，您可以使用 [union_default_mode](/operations/settings/settings#union_default_mode) 设置来指定联合模式。该设置值可以为 `ALL`、`DISTINCT` 或空字符串。但如果您使用 `UNION` 并将 `union_default_mode` 设置为一个空字符串，将会抛出异常。以下示例演示具有不同设置值的查询结果。

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

**另请参见**

- [insert_null_as_default](../../../operations/settings/settings.md#insert_null_as_default) 设置。
- [union_default_mode](/operations/settings/settings#union_default_mode) 设置。
