---
slug: /sql-reference/table-functions/numbers
sidebar_position: 145
sidebar_label: 'numbers'
title: 'numbers'
description: '返回仅包含单个 `number` 列的表，该列中包含整数序列。'
doc_type: 'reference'
---

# numbers 表函数 \{#numbers-table-function\}

* `numbers()` – 返回一个只有一列 `number`（UInt64）的无限行表，其中包含从 0 开始按升序排列的整数。使用 `LIMIT`（以及可选的 `OFFSET`）来限制行数。

* `numbers(N)` – 返回一个只有一列 `number`（UInt64）的表，其中包含从 0 到 `N - 1` 的整数。

* `numbers(N, M)` – 返回一个只有一列 `number`（UInt64）的表，其中包含从 `N` 到 `N + M - 1` 的 `M` 个整数。

* `numbers(N, M, S)` – 返回一个只有一列 `number`（UInt64）的表，其中包含区间 `[N, N + M)` 内、按步长 `S` 递增的值（大约 `M / S` 行，向上取整）。`S` 必须 `>= 1`。

这类似于 [`system.numbers`](/operations/system-tables/numbers) 系统表。它可用于测试和生成连续的值。

以下查询是等价的：

```sql
SELECT * FROM numbers(10);
SELECT * FROM numbers(0, 10);
SELECT * FROM numbers() LIMIT 10;
SELECT * FROM system.numbers LIMIT 10;
SELECT * FROM system.numbers WHERE number BETWEEN 0 AND 9;
SELECT * FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
```

下列查询也都是等价的：

```sql
SELECT * FROM numbers(10, 10);
SELECT * FROM numbers() LIMIT 10 OFFSET 10;
SELECT * FROM system.numbers LIMIT 10 OFFSET 10;
```

下列查询也是等价的：

```sql
SELECT number * 2 FROM numbers(10);
SELECT (number - 10) * 2 FROM numbers(10, 10);
SELECT * FROM numbers(0, 20, 2);
```


### 示例 \{#examples\}

前 10 个数字。

```sql
SELECT * FROM numbers(10);
```

```response
 ┌─number─┐
 │      0 │
 │      1 │
 │      2 │
 │      3 │
 │      4 │
 │      5 │
 │      6 │
 │      7 │
 │      8 │
 │      9 │
 └────────┘
```

生成 2010-01-01 至 2010-12-31 的日期序列。

```sql
SELECT toDate('2010-01-01') + number AS d FROM numbers(365);
```

找到第一个 `UInt64` `>= 10^15`，其 `sipHash64(number)` 结果的二进制形式末尾有 20 个连续的 0 位。

```sql
SELECT number
FROM numbers()
WHERE number >= toUInt64(1e15)
  AND bitAnd(sipHash64(number), 0xFFFFF) = 0
LIMIT 1;
```

```response
 ┌───────────number─┐
 │ 1000000000056095 │ -- 1.00 quadrillion
 └──────────────────┘
```


### 注意事项 \{#notes\}

- 出于性能考虑，如果你知道需要多少行，优先使用有界形式（`numbers(N)`、`numbers(N, M[, S])`），而不是无界的 `numbers()` / `system.numbers`。
- 若要进行并行生成，可以使用 `numbers_mt(...)` 或 [`system.numbers_mt`](/operations/system-tables/numbers_mt) 表。请注意，结果返回的顺序可能是不确定的。