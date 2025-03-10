---
slug: /sql-reference/statements/select/where
sidebar_label: WHERE
---


# WHERE 子句

`WHERE` 子句用于过滤来自 `SELECT` 的 [FROM](../../../sql-reference/statements/select/from.md) 子句的数据。

如果存在 `WHERE` 子句，它必须包含一个 `UInt8` 类型的表达式。这通常是一个包含比较和逻辑运算符的表达式。当该表达式的值为 `0` 时，这些行将被排除在后续的转换或结果之外。

`WHERE` 表达式的评估依赖于是否能够使用索引与分区修剪，如果底层表引擎支持这一功能。

:::note    
有一种称为 [PREWHERE](../../../sql-reference/statements/select/prewhere.md) 的过滤优化。
:::

如果需要测试一个值是否为 [NULL](/sql-reference/syntax#null)，请使用 [IS NULL](/sql-reference/operators#is_null) 和 [IS NOT NULL](/sql-reference/operators#is_not_null) 运算符或 [isNull](../../../sql-reference/functions/functions-for-nulls.md#isnull) 和 [isNotNull](../../../sql-reference/functions/functions-for-nulls.md#isnotnull) 函数。否则包含 `NULL` 的表达式将永远不会通过。

**示例**

要查找是 3 的倍数且大于 10 的数字，请在 [numbers 表](../../../sql-reference/table-functions/numbers.md) 上执行以下查询：

``` sql
SELECT number FROM numbers(20) WHERE (number > 10) AND (number % 3 == 0);
```

结果：

``` text
┌─number─┐
│     12 │
│     15 │
│     18 │
└────────┘
```

带有 `NULL` 值的查询：

``` sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
```

结果：

``` text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```
