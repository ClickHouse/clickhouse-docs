---
description: '与 `system.numbers` 类似的系统表，但读取是并行执行的，且返回的数字顺序不固定。'
keywords: ['system table', 'numbers_mt']
slug: /operations/system-tables/numbers_mt
title: 'system.numbers_mt'
doc_type: 'reference'
---

与 [`system.numbers`](../../operations/system-tables/numbers.md) 相同，但读取是并行执行的。返回的数字顺序不固定。

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

返回 10 行。耗时: 0.001 秒。
```
