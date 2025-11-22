---
description: 'LIMIT 子句文档'
sidebar_label: 'LIMIT'
slug: /sql-reference/statements/select/limit
title: 'LIMIT 子句'
doc_type: 'reference'
---



# LIMIT 子句

`LIMIT m` 用于从结果中选取前 `m` 行。

`LIMIT n, m` 用于在跳过前 `n` 行之后，从结果中选取接下来的 `m` 行。语法 `LIMIT m OFFSET n` 与其等价。

在上述标准形式中，`n` 和 `m` 是非负整数。

此外，也支持负的限制值（negative limits）：

`LIMIT -m` 从结果中选取最后 `m` 行。

`LIMIT -m OFFSET -n` 在跳过最后 `n` 行之后，从结果中选取最后 `m` 行。语法 `LIMIT -n, -m` 与其等价。

另外，也支持按结果的比例进行选取：

`LIMIT m` —— 如果 0 < m < 1，则返回前 m * 100% 的行数。

`LIMIT m OFFSET n` —— 如果 0 < m < 1 且 0 < n < 1，则在跳过前 n * 100% 的行之后，返回前 m * 100% 的结果。语法 `LIMIT n, m` 与其等价。

示例：
    • `LIMIT 0.1` —— 选取结果的前 10%。
    • `LIMIT 1 OFFSET 0.5` —— 选取中位数所在的那一行。
    • `LIMIT 0.25 OFFSET 0.5` —— 选取结果中第三四分位（第 3 四分位）对应的部分。

> **Note**
> • 该比例必须是一个大于 0 且小于 1 的 [Float64](../../data-types/float.md) 类型的数。
> • 如果计算得到的是一个非整数的行数，则向上取整到下一个整数。

> **Note**
> • 可以将标准的 LIMIT 与小数（比例）偏移量组合使用，反之亦然。
> • 可以将标准的 LIMIT 与负偏移量组合使用，反之亦然。

如果没有带有 [ORDER BY](../../../sql-reference/statements/select/order-by.md) 子句对结果进行显式排序，那么结果中被选中的行可能是任意的且非确定性的。

:::note    
结果集中行的数量也可能取决于 [limit](../../../operations/settings/settings.md#limit) 设置。
:::



## LIMIT ... WITH TIES 修饰符 {#limit--with-ties-modifier}

当您为 `LIMIT n[,m]` 设置 `WITH TIES` 修饰符并指定 `ORDER BY expr_list` 时,结果将返回前 `n` 行或 `n,m` 行,以及所有与第 `n` 行(对于 `LIMIT n`)或第 `m` 行(对于 `LIMIT n,m`)具有相同 `ORDER BY` 字段值的行。

> **注意**  
> • `WITH TIES` 目前不支持负数 `LIMIT`。

此修饰符也可以与 [ORDER BY ... WITH FILL 修饰符](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier)组合使用。

例如,以下查询

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5
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

但应用 `WITH TIES` 修饰符后

```sql
SELECT * FROM (
    SELECT number%50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5 WITH TIES
```

将返回另一个行集

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

因为第 6 行的字段 `n` 与第 5 行具有相同的值 "2"
