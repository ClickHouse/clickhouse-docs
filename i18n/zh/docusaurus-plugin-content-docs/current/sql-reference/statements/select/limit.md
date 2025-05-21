---
'description': 'Documentation for LIMIT Clause'
'sidebar_label': 'LIMIT'
'slug': '/sql-reference/statements/select/limit'
'title': 'LIMIT Clause'
---




# LIMIT 子句

`LIMIT m` 允许从结果中选择前 `m` 行。

`LIMIT n, m` 允许在跳过前 `n` 行后从结果中选择 `m` 行。`LIMIT m OFFSET n` 语法等价。

`n` 和 `m` 必须是非负整数。

如果没有 [ORDER BY](../../../sql-reference/statements/select/order-by.md) 子句明确排序结果，则结果中选择的行可能是任意的且不确定的。

:::note    
结果集中的行数也可能依赖于 [limit](../../../operations/settings/settings.md#limit) 设置。
:::

## LIMIT ... WITH TIES 修饰符 {#limit--with-ties-modifier}

当您为 `LIMIT n[,m]` 设置 `WITH TIES` 修饰符并指定 `ORDER BY expr_list` 时，结果将返回前 `n` 或 `n,m` 行，以及所有与位置 `n` 对应的 `ORDER BY` 字段值相同的行，适用于 `LIMIT n` 和 `m` 的情况。

此修饰符还可以与 [ORDER BY ... WITH FILL 修饰符](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier) 结合使用。

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

但是在应用 `WITH TIES` 修饰符后

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0,5 WITH TIES
```

它返回另一组行

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

因为第 6 行在字段 `n` 上与第 5 行具有相同的值 "2"。
