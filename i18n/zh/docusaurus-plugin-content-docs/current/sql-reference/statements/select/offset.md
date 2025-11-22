---
description: 'OFFSET 文档'
sidebar_label: 'OFFSET'
slug: /sql-reference/statements/select/offset
title: 'OFFSET FETCH 子句'
doc_type: 'reference'
---

`OFFSET` 和 `FETCH` 用于分批检索数据。它们指定了希望通过单个查询获取的行块。

```sql
OFFSET offset_row_count {ROW | ROWS}] [FETCH {FIRST | NEXT} fetch_row_count {ROW | ROWS} {ONLY | WITH TIES}]
```

`offset_row_count` 或 `fetch_row_count` 的值可以是一个数字或字面量常数。可以省略 `fetch_row_count`；默认情况下，它等于 1。

`OFFSET` 指定在开始从查询结果集中返回行之前要跳过的行数。`OFFSET n` 会跳过结果中的前 `n` 行。

支持负值 OFFSET：`OFFSET -n` 会跳过结果中的最后 `n` 行。

也支持小数形式的 OFFSET：`OFFSET n` —— 如果 0 &lt; n &lt; 1，则会跳过结果中前 n * 100% 的行。

示例：
• `OFFSET 0.1` —— 跳过结果中前 10% 的行。

> **注意**
> • 小数必须是大于 0 且小于 1 的 [Float64](../../data-types/float.md) 数值。
> • 如果计算得到的是小数行数，则向上取整为下一个整数。

`FETCH` 指定查询结果中最多可以返回的行数。

`ONLY` 选项用于返回紧跟在 `OFFSET` 所跳过的那些行之后的行。在这种情况下，`FETCH` 是 [LIMIT](../../../sql-reference/statements/select/limit.md) 子句的替代方案。例如，下面的查询

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 1 ROW FETCH FIRST 3 ROWS ONLY;
```

与此查询完全相同

```sql
SELECT * FROM test_fetch ORDER BY a LIMIT 3 OFFSET 1;
```

`WITH TIES` 选项用于返回在结果集中“最后一行”位置上与其并列的所有额外行，这里的并列关系是根据 `ORDER BY` 子句确定的。例如，如果 `fetch_row_count` 被设置为 5，但如果另外有两行的 `ORDER BY` 列值与第 5 行相同，那么结果集将包含 7 行。

:::note\
根据标准，如果同时存在，`OFFSET` 子句必须出现在 `FETCH` 子句之前。
:::

:::note\
实际的偏移量也可能取决于 [offset](../../../operations/settings/settings.md#offset) 设置。
:::


## 示例 {#examples}

输入表:

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

使用 `ONLY` 选项:

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS ONLY;
```

结果:

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
└───┴───┘
```

使用 `WITH TIES` 选项:

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS WITH TIES;
```

结果:

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
│ 5 │ 7 │
└───┴───┘
```
