---
description: 'system 表，包含一个名为 `prime` 的 UInt64 单列，该列按从 2 开始的升序存储素数。'
keywords: ['system 表', '素数']
slug: /operations/system-tables/primes
title: 'system.primes'
doc_type: 'reference'
---

# system.primes \{#systemprimes\}

该表包含一个名为 `prime` 的 UInt64 列，按升序存储从 2 开始的素数。

可以将此表用于测试，或者在需要对素数进行暴力穷举搜索时使用。

从此表读取数据时不会并行化。

这与 [`primes`](/sql-reference/table-functions/primes) 表函数类似。

你也可以通过谓词来限制输出。

**示例**

前 10 个素数。

```sql
SELECT * FROM system.primes LIMIT 10;
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

大于 1e15 的第一个质数。

```sql
SELECT prime FROM system.primes WHERE prime > toUInt64(1e15) LIMIT 1;
```

```response
  ┌────────────prime─┐
  │ 1000000000000037 │ -- 1.00 quadrillion
  └──────────────────┘
```
