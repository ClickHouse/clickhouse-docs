---
'description': 'Documentation for WHERE Clause'
'sidebar_label': 'WHERE'
'slug': '/sql-reference/statements/select/where'
'title': 'WHERE Clause'
---




# WHERE 子句

`WHERE` 子句允许过滤来自 `SELECT` 语句的 [FROM](../../../sql-reference/statements/select/from.md) 子句的数据。

如果有 `WHERE` 子句，它必须包含一个 `UInt8` 类型的表达式。通常这是一个包含比较和逻辑运算符的表达式。该表达式计算结果为 `0` 的行将被排除在进一步的转换或结果之外。

`WHERE` 表达式的评估取决于是否能够使用索引和分区裁剪，如果基础表引擎支持的话。

:::note    
有一种过滤优化称为 [PREWHERE](../../../sql-reference/statements/select/prewhere.md)。
:::

如果您需要测试一个值是否为 [NULL](/sql-reference/syntax#null)，可以使用 [IS NULL](/sql-reference/operators#is_null) 和 [IS NOT NULL](/sql-reference/operators#is_not_null) 运算符或 [isNull](../../../sql-reference/functions/functions-for-nulls.md#isnull) 和 [isNotNull](../../../sql-reference/functions/functions-for-nulls.md#isnotnull) 函数。
否则，包含 `NULL` 的表达式永远不会通过。

**示例**

要查找3的倍数且大于10的数字，请在 [numbers table](../../../sql-reference/table-functions/numbers.md) 上执行以下查询：

```sql
SELECT number FROM numbers(20) WHERE (number > 10) AND (number % 3 == 0);
```

结果：

```text
┌─number─┐
│     12 │
│     15 │
│     18 │
└────────┘
```

包含 `NULL` 值的查询：

```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
```

结果：

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```
