
# LIMIT 子句

`LIMIT m` 允许从结果中选择前 `m` 行。

`LIMIT n, m` 允许在跳过前 `n` 行后，从结果中选择 `m` 行。`LIMIT m OFFSET n` 语法是等效的。

`n` 和 `m` 必须是非负整数。

如果没有明确排序结果的 [ORDER BY](../../../sql-reference/statements/select/order-by.md) 子句，结果集中的行选择可能是任意和非确定性的。

:::note    
结果集中的行数也可能依赖于 [limit](../../../operations/settings/settings.md#limit) 设置。
:::

## LIMIT ... WITH TIES 修饰符 {#limit--with-ties-modifier}

当你为 `LIMIT n[,m]` 设置 `WITH TIES` 修饰符并指定 `ORDER BY expr_list` 时，你将在结果中获得前 `n` 或 `n,m` 行，以及所有与位置 `n` 的行在 `ORDER BY` 字段值相同的行（对于 `LIMIT n`）和与位置 `m` 的行相同的行（对于 `LIMIT n,m`）。

此修饰符也可以与 [ORDER BY ... WITH FILL 修饰符](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier) 结合使用。

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

它返回另一组行集

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

因为第 6 行的 `n` 字段的值与第 5 行相同，都是 "2"。
