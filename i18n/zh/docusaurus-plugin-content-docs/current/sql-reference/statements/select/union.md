---
'description': 'UNION 子句的文档'
'sidebar_label': 'UNION'
'slug': '/sql-reference/statements/select/union'
'title': 'UNION 子句'
'doc_type': 'reference'
---


# UNION 子句

您可以使用 `UNION` 显式指定 `UNION ALL` 或 `UNION DISTINCT`。

如果您没有指定 `ALL` 或 `DISTINCT`，这将取决于 `union_default_mode` 设置。`UNION ALL` 和 `UNION DISTINCT` 之间的区别在于，`UNION DISTINCT` 会对联合结果进行去重转换，相当于从包含 `UNION ALL` 的子查询中执行 `SELECT DISTINCT`。

您可以使用 `UNION` 通过扩展结果来组合任意数量的 `SELECT` 查询。例如：

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

结果列根据它们在 `SELECT` 中的索引（顺序）进行匹配。如果列名不匹配，最终结果的名称将来自第一个查询。

在联合时会执行类型转换。例如，如果两个合并的查询具有相同字段，其中一个是非 `Nullable` 类型，另一个是 `Nullable` 类型，并且两者来自兼容类型，则结果 `UNION` 中将具有 `Nullable` 类型字段。

`UNION` 中的查询可以用圆括号括起来。[ORDER BY](../../../sql-reference/statements/select/order-by.md) 和 [LIMIT](../../../sql-reference/statements/select/limit.md) 应用于单独的查询，而不是最终结果。如果您需要对最终结果应用转换，可以将所有使用 `UNION` 的查询放在 [FROM](../../../sql-reference/statements/select/from.md) 子句中的子查询中。

如果您在未显式指定 `UNION ALL` 或 `UNION DISTINCT` 的情况下使用 `UNION`，可以使用 [union_default_mode](/operations/settings/settings#union_default_mode) 设置指定并集模式。设置值可以是 `ALL`、`DISTINCT` 或空字符串。但是，如果您使用 `union_default_mode` 设置为空字符串的 `UNION`，将会抛出异常。以下示例演示了具有不同值设置的查询结果。

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

作为 `UNION/UNION ALL/UNION DISTINCT` 组成部分的查询可以同时运行，其结果可以混合在一起。

**另见**

- [insert_null_as_default](../../../operations/settings/settings.md#insert_null_as_default) 设置。
- [union_default_mode](/operations/settings/settings#union_default_mode) 设置。
