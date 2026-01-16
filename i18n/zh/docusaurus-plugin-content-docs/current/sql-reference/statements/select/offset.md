---
description: 'OFFSET 文档'
sidebar_label: 'OFFSET'
slug: /sql-reference/statements/select/offset
title: 'OFFSET FETCH 子句'
doc_type: 'reference'
---

`OFFSET` 和 `FETCH` 可用于按批次检索数据。它们用于指定希望通过单条查询获取的一段行数据。

```sql
-- SQL Standard style:
[OFFSET offset_row_count {ROW | ROWS}] [FETCH {FIRST | NEXT} fetch_row_count {ROW | ROWS} {ONLY | WITH TIES}]

-- MySQL/PostgreSQL style:
[LIMIT [n, ]m] [OFFSET offset_row_count]
```

`offset_row_count` 或 `fetch_row_count` 的值可以是数字或字面常量。可以省略 `fetch_row_count`；默认情况下，它为 1。

`OFFSET` 指定在开始返回查询结果集中的行之前需要跳过的行数。`OFFSET n` 会跳过结果中的前 `n` 行。

支持负值 OFFSET：`OFFSET -n` 会跳过结果中的最后 `n` 行。

也支持小数形式的 OFFSET：`OFFSET n` —— 如果 0 &lt; n &lt; 1，则跳过结果中前 n * 100% 的部分。

示例：
• `OFFSET 0.1` —— 跳过结果的前 10%。

> **注意**
> • 该小数必须是一个 [Float64](../../data-types/float.md) 类型的数字，小于 1 且大于 0。
> • 如果根据计算得到的是一个小数行数，则向上取整为下一个整数。

`FETCH` 指定查询结果中最多可以包含的行数。

`ONLY` 选项用于返回紧跟在 `OFFSET` 所跳过的行之后的行。在这种情况下，`FETCH` 是 [LIMIT](../../../sql-reference/statements/select/limit.md) 子句的替代方案。例如，下面的查询

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 1 ROW FETCH FIRST 3 ROWS ONLY;
```

与下列查询完全等价

```sql
SELECT * FROM test_fetch ORDER BY a LIMIT 3 OFFSET 1;
```

`WITH TIES` 选项用于根据 `ORDER BY` 子句，在结果集中返回所有与“最后一名”并列的额外行。例如，如果 `fetch_row_count` 设置为 5，但又有两行与第 5 行在 `ORDER BY` 列上的值相同，那么结果集中将包含 7 行。

:::note
根据标准，当两者同时存在时，`OFFSET` 子句必须位于 `FETCH` 子句之前。
:::

:::note
实际偏移量也可能取决于 [offset](../../../operations/settings/settings.md#offset) 设置。
:::

## 示例 \{#examples\}

输入表：

```text
┌─a─┬─b─┐
│ 1 │ 1 │
│ 2 │ 1 │
│ 3 │ 4 │
│ 1 │ 3 │
│ 5 │ 4 │
│ 0 │ 6 │
│ 5 │ 7 │
└───┴───┘
```

`ONLY` 选项的用法：

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS ONLY;
```

结果：

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
└───┴───┘
```

`WITH TIES` 选项的使用方法：

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS WITH TIES;
```

结果：

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
│ 5 │ 7 │
└───┴───┘
```
