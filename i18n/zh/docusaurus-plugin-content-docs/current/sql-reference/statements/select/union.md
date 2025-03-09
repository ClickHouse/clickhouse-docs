---
slug: /sql-reference/statements/select/union
sidebar_label: 'UNION'
---


# UNION 子句

您可以使用 `UNION` 明确指定 `UNION ALL` 或 `UNION DISTINCT`。

如果您未指定 `ALL` 或 `DISTINCT`，结果将取决于 `union_default_mode` 设置。 `UNION ALL` 和 `UNION DISTINCT` 之间的区别在于，`UNION DISTINCT` 会对联合结果进行去重变换，等效于对包含 `UNION ALL` 的子查询执行 `SELECT DISTINCT`。

您可以使用 `UNION` 通过扩展其结果来结合任何数量的 `SELECT` 查询。示例：

``` sql
SELECT CounterID, 1 AS table, toInt64(count()) AS c
    FROM test.hits
    GROUP BY CounterID

UNION ALL

SELECT CounterID, 2 AS table, sum(Sign) AS c
    FROM test.visits
    GROUP BY CounterID
    HAVING c > 0
```

结果列按其索引（在 `SELECT` 中的顺序）匹配。如果列名不匹配，最终结果的名称将来自第一个查询。

联合查询之间会执行类型转换。例如，如果两个合并的查询具有相同字段，并且这些字段具有兼容类型中的非 `Nullable` 和 `Nullable` 类型，则 resulting `UNION` 将具有 `Nullable` 类型字段。

`UNION` 参与的查询可以用圆括号括起来。[ORDER BY](../../../sql-reference/statements/select/order-by.md) 和 [LIMIT](../../../sql-reference/statements/select/limit.md) 适用于单独的查询，而不是最终结果。如果您希望对最终结果应用转换，可以将所有带有 `UNION` 的查询放在 [FROM](../../../sql-reference/statements/select/from.md) 子句的子查询中。

如果您在不明确指定 `UNION ALL` 或 `UNION DISTINCT` 的情况下使用 `UNION`，则可以使用 [union_default_mode](/operations/settings/settings#union_default_mode) 设置指定合并模式。设置的值可以是 `ALL`、`DISTINCT` 或空字符串。但是，如果您将 `UNION` 与 `union_default_mode` 设置为空字符串一起使用，则会抛出异常。以下示例演示了具有不同设置值的查询结果。

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

`UNION/UNION ALL/UNION DISTINCT` 的参与查询可以同时运行，并且它们的结果可以混合在一起。

**参见**

- [insert_null_as_default](../../../operations/settings/settings.md#insert_null_as_default) 设置。
- [union_default_mode](/operations/settings/settings#union_default_mode) 设置。
