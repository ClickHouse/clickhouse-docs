---
description: 'LIMIT 子句文档'
sidebar_label: 'LIMIT'
slug: /sql-reference/statements/select/limit
title: 'LIMIT 子句'
doc_type: 'reference'
---

# LIMIT 子句 {#limit-clause}

`LIMIT m` 允许从结果中选取前 `m` 行。

`LIMIT n, m` 允许在跳过前 `n` 行之后，从结果中选取接下来的 `m` 行。语法 `LIMIT m OFFSET n` 与其等价。

在上述标准形式中，`n` 和 `m` 是非负整数。

此外，还支持负值 LIMIT：

`LIMIT -m` 从结果中选取最后的 `m` 行。

`LIMIT -m OFFSET -n` 在跳过最后的 `n` 行之后，选取最后的 `m` 行。语法 `LIMIT -n, -m` 与其等价。

另外，也支持按结果的一定比例进行选取：

`LIMIT m` —— 如果 0 &lt; m &lt; 1，则返回结果中前 m * 100% 的行。

`LIMIT m OFFSET n` —— 如果 0 &lt; m &lt; 1 且 0 &lt; n &lt; 1，则在跳过结果中前 n * 100% 的行之后，返回接下来 m * 100% 的结果。语法 `LIMIT n, m` 与其等价。

示例：
• `LIMIT 0.1` —— 选取结果中前 10% 的行。
• `LIMIT 1 OFFSET 0.5` —— 选取中位数所在的那一行。
• `LIMIT 0.25 OFFSET 0.5` —— 选取结果中的第三四分位数部分。

> **注意**
> • 比例必须是大于 0 且小于 1 的 [Float64](../../data-types/float.md) 数值。
> • 如果计算得到的行数为小数，则向上取整到下一个整数。

> **注意**
> • 可以将标准 LIMIT 与小数 OFFSET 结合使用，反之亦然。
> • 可以将标准 LIMIT 与负 OFFSET 结合使用，反之亦然。

如果没有显式对结果进行排序的 [ORDER BY](../../../sql-reference/statements/select/order-by.md) 子句，则结果中被选取的行可能是任意的、非确定性的。

:::note\
结果集中的行数也可能取决于 [limit](../../../operations/settings/settings.md#limit) 设置。
:::

## LIMIT ... WITH TIES 修饰符 {#limit--with-ties-modifier}

当你为 `LIMIT n[,m]` 设置 `WITH TIES` 修饰符并指定 `ORDER BY expr_list` 时，结果中会返回符合 `LIMIT n` 或 `LIMIT n,m` 条件的前 `n` 行或 `n,m` 行，以及所有在 `LIMIT n` 情况下与第 `n` 行、或在 `LIMIT n,m` 情况下与第 `m` 行具有相同 `ORDER BY` 字段值的行。

> **注意**\
> • 目前 `WITH TIES` 不支持与负数的 `LIMIT` 一起使用。

此修饰符也可以与 [ORDER BY ... WITH FILL 修饰符](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier) 组合使用。

例如，下面的查询：

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5
```

返回值

```text
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
└───┘
```

但在使用 `WITH TIES` 修饰符之后

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5 WITH TIES
```

它会返回另一组行

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

因为第 6 行中字段 `n` 的值也是 &quot;2&quot;，与第 5 行相同
