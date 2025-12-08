---
description: 'LIMIT 子句文档'
sidebar_label: 'LIMIT'
slug: /sql-reference/statements/select/limit
title: 'LIMIT 子句'
doc_type: 'reference'
---

# LIMIT 子句 {#limit-clause}

`LIMIT` 子句用于控制查询结果返回的行数。

## 基本语法 {#basic-syntax}

**选择前几行数据：**

```sql
LIMIT m
```

从结果中返回前 `m` 行；如果结果行数小于 `m`，则返回所有记录。

**另一种 TOP 语法（兼容 MS SQL Server）：**

```sql
-- SELECT TOP 数字|百分比 列名 FROM 表名
SELECT TOP 10 * FROM numbers(100);
SELECT TOP 0.1 * FROM numbers(100);
```

这等价于 `LIMIT m`，可用于与 Microsoft SQL Server 的查询保持兼容。

**带偏移量的 SELECT：**

```sql
LIMIT m OFFSET n
-- 或等同于：
LIMIT n, m
```

跳过前 `n` 行，然后返回接下来的 `m` 行。

在这两种形式中，`n` 和 `m` 都必须是非负整数。

## 负数 LIMIT {#negative-limits}

使用负值从结果集的*末尾*选择行：

| 语法 | 结果 |
|--------|--------|
| `LIMIT -m` | 最后的 `m` 行 |
| `LIMIT -m OFFSET -n` | 跳过最后 `n` 行后，再取最后的 `m` 行 |
| `LIMIT m OFFSET -n` | 跳过最后 `n` 行后，再取最前面的 `m` 行 |
| `LIMIT -m OFFSET n` | 跳过最前面的 `n` 行后，再取最后的 `m` 行 |

`LIMIT -n, -m` 语法等价于 `LIMIT -m OFFSET -n`。

## 分数限制 {#fractional-limits}

使用介于 0 和 1 之间的小数值来选择一定百分比的行：

| 语法 | 结果 |
|--------|--------|
| `LIMIT 0.1` | 前 10% 的行 |
| `LIMIT 1 OFFSET 0.5` | 中位所在的行 |
| `LIMIT 0.25 OFFSET 0.5` | 第三四分位数（跳过前 50% 后的 25% 行） |

:::note

- 分数必须是大于 0 且小于 1 的 [Float64](../../data-types/float.md) 值。
- 分数对应的行数会四舍五入到最接近的整数。
:::

## 组合限制类型 {#combining-limit-types}

你可以将标准整数与小数或负数偏移量组合使用：

```sql
LIMIT 10 OFFSET 0.5    -- 从中点开始的 10 行
LIMIT 10 OFFSET -20    -- 跳过最后 20 行后的 10 行
```

## LIMIT ... WITH TIES {#limit--with-ties-modifier}

`WITH TIES` 修饰符会额外返回那些 `ORDER BY` 值与 LIMIT 结果中最后一行相同的行。

```sql
SELECT * FROM (
    SELECT number % 50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5
```

```response
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
└───┘
```

使用 `WITH TIES` 时，所有与最后一个值相同的行都会被返回：

```sql
SELECT * FROM (
    SELECT number % 50 AS n FROM numbers(100)
) ORDER BY n LIMIT 0, 5 WITH TIES
```

```response
┌─n─┐
│ 0 │
│ 0 │
│ 1 │
│ 1 │
│ 2 │
│ 2 │
└───┘
```

第 6 行之所以被包含在结果中，是因为它与第 5 行具有相同的值（`2`）。

:::note
`WITH TIES` 不支持与负的 LIMIT 值一起使用。
:::

此修饰符可以与 [`ORDER BY ... WITH FILL`](/sql-reference/statements/select/order-by#order-by-expr-with-fill-modifier) 修饰符组合使用。

## 注意事项 {#considerations}

**非确定性结果：** 如果未使用 [`ORDER BY`](../../../sql-reference/statements/select/order-by.md) 子句，返回的行可能不固定，并且在不同的查询执行中可能会有所不同。

**服务器端限制：** 返回的行数也可能会受到 [limit](../../../operations/settings/settings.md#limit) SETTING 的影响。

## 另请参阅 {#see-also}

- [LIMIT BY](/sql-reference/statements/select/limit-by) — 按值分组后限制每组的行数，可用于在每个类别中获取前 N 个结果。