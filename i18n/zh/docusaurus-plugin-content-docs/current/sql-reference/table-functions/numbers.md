---
slug: /sql-reference/table-functions/numbers
sidebar_position: 145
sidebar_label: 'numbers'
title: 'numbers'
description: '返回仅包含单个 `number` 列的表，该列中包含可指定的整数。'
doc_type: 'reference'
---

# numbers 表函数 \\{#numbers-table-function\\}

`numbers(N)` – 返回一张仅包含单个 &#39;number&#39; 列（UInt64 类型）的表，其中包含从 0 到 N-1 的整数。
`numbers(N, M)` - 返回一张仅包含单个 &#39;number&#39; 列（UInt64 类型）的表，其中包含从 N 到 (N + M - 1) 的整数。
`numbers(N, M, S)` - 返回一张仅包含单个 &#39;number&#39; 列（UInt64 类型）的表，其中包含从 N 到 (N + M - 1)，步长为 S 的整数。

与 `system.numbers` 表类似，它可以用于测试和生成连续数值，`numbers(N, M)` 比 `system.numbers` 更高效。

以下查询是等价的：

```sql
SELECT * FROM numbers(10);
SELECT * FROM numbers(0, 10);
SELECT * FROM system.numbers LIMIT 10;
SELECT * FROM system.numbers WHERE number BETWEEN 0 AND 9;
SELECT * FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
```

下列查询等价：

```sql
SELECT number * 2 FROM numbers(10);
SELECT (number - 10) * 2 FROM numbers(10, 10);
SELECT * FROM numbers(0, 20, 2);
```

示例：

```sql
-- Generate a sequence of dates from 2010-01-01 to 2010-12-31
SELECT toDate('2010-01-01') + number AS d FROM numbers(365);
```
