---
'description': 'LIMIT 子句的文档'
'sidebar_label': 'LIMIT'
'slug': '/sql-reference/statements/select/limit'
'title': 'LIMIT 子句'
'doc_type': 'reference'
---


# LIMIT 子句

`LIMIT m` 允许从结果中选择前 `m` 行。

`LIMIT n, m` 允许选择跳过前 `n` 行后的 `m` 行。`LIMIT m OFFSET n` 语法是等效的。

`n` 和 `m` 必须是非负整数。

如果没有显式排序结果的 [ORDER BY](../../../sql-reference/statements/select/order-by.md) 子句，则结果集中的行选择可能是任意的且非确定性的。

:::note    
结果集中的行数也可能依赖于 [limit](../../../operations/settings/settings.md#limit) 设置。
:::

## LIMIT ... WITH TIES 修饰符 {#limit--with-ties-modifier}

当为 `LIMIT n[,m]` 设置 `WITH TIES` 修饰符并指定 `ORDER BY expr_list` 时，结果中将返回前 `n` 或 `n,m` 行，以及所有字段值与第 `n` 行（对于 `LIMIT n`）和第 `m` 行（对于 `LIMIT n,m`）的 `ORDER BY` 字段值相等的行。

这个修饰符还可以与 [ORDER BY ... WITH FILL 修饰符](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier) 组合使用。

例如，以下查询

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5
```

返回

```text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
└───┘
```

但在应用 `WITH TIES` 修饰符后

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5 WITH TIES
```

它返回另一个行集

```text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
│ 2 │
└───┘
```

因为第 6 行在 `n` 字段上与第 5 行具有相同的值 "2"。
