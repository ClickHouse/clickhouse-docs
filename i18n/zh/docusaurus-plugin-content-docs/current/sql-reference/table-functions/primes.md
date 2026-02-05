---
slug: /sql-reference/table-functions/primes
sidebar_position: 145
sidebar_label: 'primes'
title: 'primes'
description: '返回一个仅包含一个名为 `prime` 的列且其中包含素数的表。'
doc_type: 'reference'
---

# primes 表函数 \{#primes-table-function\}

* `primes()` – 返回一个具有无限行、仅包含名为 `prime` 的单列（UInt64）的表，该列按升序包含从 2 开始的素数。使用 `LIMIT`（以及可选的 `OFFSET`）来限制行数。

* `primes(N)` – 返回一个仅包含 `prime` 列（UInt64）的表，该列包含从 2 开始的前 `N` 个素数。

* `primes(N, M)` - 返回一个仅包含 `prime` 列（UInt64）的表，该列包含从第 `N` 个素数开始的 `M` 个素数（素数索引从 0 开始计数）。

* `primes(N, M, S)` - 返回一个仅包含 `prime` 列（UInt64）的表，该列包含从第 `N` 个素数开始、按步长 `S`（按素数索引）的 `M` 个素数（素数索引从 0 开始计数）。返回的素数对应索引 `N, N + S, N + 2S, ..., N + (M - 1)S`。`S` 必须 ≥ 1。

这与 [`system.primes`](/operations/system-tables/primes) 系统表类似。

以下查询是等价的：

```sql
SELECT * FROM primes(10);
SELECT * FROM primes(0, 10);
SELECT * FROM primes() LIMIT 10;
SELECT * FROM system.primes LIMIT 10;
SELECT * FROM system.primes WHERE prime IN (2, 3, 5, 7, 11, 13, 17, 19, 23, 29);
```

下面的查询也是等价的：

```sql
SELECT * FROM primes(10, 10);
SELECT * FROM primes() LIMIT 10 OFFSET 10;
SELECT * FROM system.primes LIMIT 10 OFFSET 10;
```

### 示例 \{#examples\}

前 10 个质数。

```sql
SELECT * FROM primes(10);
```

```response
  ┌─prime─┐
  │     2 │
  │     3 │
  │     5 │
  │     7 │
  │    11 │
  │    13 │
  │    17 │
  │    19 │
  │    23 │
  │    29 │
  └───────┘
```

第一个大于 1e15 的素数。

```sql
SELECT prime FROM primes() WHERE prime > toUInt64(1e15) LIMIT 1;
```

```response
  ┌────────────prime─┐
  │ 1000000000000037 │ -- 1.00 quadrillion
  └──────────────────┘
```

前 7 个梅森素数。

```sql
SELECT prime
FROM primes()
WHERE bitAnd(prime, prime + 1) = 0
LIMIT 7;
```

```response
  ┌──prime─┐
  │      3 │
  │      7 │
  │     31 │
  │    127 │
  │   8191 │
  │ 131071 │
  │ 524287 │
  └────────┘
```

### 注意事项 \{#notes\}

* 速度最快的是使用默认步长（`1`）的简单区间形式和点过滤查询，例如 `primes(N)` 或 `primes() LIMIT N`。这些形式使用经过优化的素数生成器，可以高效地计算非常大的素数。例如，下面的查询几乎可以瞬间完成：

```sql
SELECT sum(prime)
FROM primes()
WHERE prime BETWEEN toUInt64(1e6) AND toUInt64(1e6) + 100
   OR prime BETWEEN toUInt64(1e12) AND toUInt64(1e12) + 100
   OR prime BETWEEN toUInt64(1e15) AND toUInt64(1e15) + 100
   OR prime IN (9999999967, 9999999971, 9999999973)
   OR prime = 1000000000000037;
```

```response
  ┌───────sum(prime)─┐
  │ 2004010006000641 │ -- 2.00 quadrillion
  └──────────────────┘

1 row in set. Elapsed: 0.090 sec. 
```

* 使用非零偏移量和/或大于 1 的步长（`primes(offset, count)` / `primes(offset, count, step)`）可能会更慢，因为内部可能需要先生成并跳过额外的质数。如果你不需要偏移量或步长，可以省略这两个参数。
