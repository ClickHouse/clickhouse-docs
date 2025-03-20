---
description: '与 `system.numbers` 类似的系统表，但读取经过并行化，并且数字可以以任意顺序返回。'
slug: /operations/system-tables/numbers_mt
title: 'system.numbers_mt'
keywords: ['system table', 'numbers_mt']
---

与 [`system.numbers`](../../operations/system-tables/numbers.md) 相同，但读取经过并行化。数字可以以任意顺序返回。

用于测试。

**示例**

```sql
SELECT * FROM system.numbers_mt LIMIT 10;
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

10 rows in set. Elapsed: 0.001 sec.
```
