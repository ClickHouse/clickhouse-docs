---
description: 'UNION 子句文档'
sidebar_label: 'UNION'
slug: /sql-reference/statements/select/union
title: 'UNION 子句'
doc_type: 'reference'
---

# UNION 子句

可以使用 `UNION` 并显式指定 `UNION ALL` 或 `UNION DISTINCT`。

如果不指定 `ALL` 或 `DISTINCT`，则行为取决于 `union_default_mode` 设置。`UNION ALL` 和 `UNION DISTINCT` 的区别在于，`UNION DISTINCT` 会对 UNION 结果集进行去重转换，这等价于对包含 `UNION ALL` 的子查询执行 `SELECT DISTINCT`。

可以使用 `UNION` 将任意数量的 `SELECT` 查询的结果组合在一起。例如：

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

结果列按它们的索引（在 `SELECT` 中的顺序）进行匹配。如果列名不匹配，则最终结果的列名取自第一个查询。

在执行 `UNION` 时会进行类型转换。例如，如果要合并的两个查询中存在同名字段，且它们分别是某一兼容类型的非 `Nullable` 和 `Nullable` 形式，则该 `UNION` 的结果中该字段将是 `Nullable` 类型。

作为 `UNION` 一部分的查询可以用圆括号括起来。[ORDER BY](../../../sql-reference/statements/select/order-by.md) 和 [LIMIT](../../../sql-reference/statements/select/limit.md) 作用于各个独立查询，而不是最终结果。如果你需要对最终结果进行转换，可以在 [FROM](../../../sql-reference/statements/select/from.md) 子句中将所有带有 `UNION` 的查询放入一个子查询中。

如果在使用 `UNION` 时没有显式指定 `UNION ALL` 或 `UNION DISTINCT`，则可以通过 [union&#95;default&#95;mode](/operations/settings/settings#union_default_mode) 设置来指定 UNION 模式。该设置的取值可以是 `ALL`、`DISTINCT` 或空字符串。然而，如果你在使用 `UNION` 时将 `union_default_mode` 设置为空字符串，将会抛出异常。以下示例演示在不同设置值下的查询结果。

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

`UNION/UNION ALL/UNION DISTINCT` 中的各个子查询可以并行执行，其结果会合并在一起。

**另请参阅**

* [insert&#95;null&#95;as&#95;default](../../../operations/settings/settings.md#insert_null_as_default) 设置。
* [union&#95;default&#95;mode](/operations/settings/settings#union_default_mode) 设置。
