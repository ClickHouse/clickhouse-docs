---
'description': '关于 WHERE Clause 的文档'
'sidebar_label': 'WHERE'
'slug': '/sql-reference/statements/select/where'
'title': 'WHERE 子句'
'doc_type': 'reference'
---


# WHERE 子句

`WHERE` 子句允许过滤来自 `SELECT` 的 [FROM](../../../sql-reference/statements/select/from.md) 子句的数据。

如果存在 `WHERE` 子句，它必须包含一个 `UInt8` 类型的表达式。这个表达式通常使用比较和逻辑运算符。该表达式评估为 `0` 的行将被排除在进一步的转换或结果之外。

`WHERE` 表达式的评估依赖于是否能够使用索引和分区裁剪，前提是底层表引擎支持这些功能。

:::note    
有一个名为 [PREWHERE](../../../sql-reference/statements/select/prewhere.md) 的过滤优化。
:::

如果你需要测试一个值是否为 [NULL](/sql-reference/syntax#null)，可以使用 [IS NULL](/sql-reference/operators#is_null) 和 [IS NOT NULL](/sql-reference/operators#is_not_null) 运算符，或 [isNull](../../../sql-reference/functions/functions-for-nulls.md#isNull) 和 [isNotNull](../../../sql-reference/functions/functions-for-nulls.md#isNotNull) 函数。
否则，即使表达式包含 `NULL`，也永远不会通过。

**示例**

要查找是 3 的倍数且大于 10 的数字，请在 [numbers table](../../../sql-reference/table-functions/numbers.md) 上执行以下查询：

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
