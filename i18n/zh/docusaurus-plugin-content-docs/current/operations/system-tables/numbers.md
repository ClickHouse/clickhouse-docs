---
description: '系统表，包含一个名为 `number` 的 UInt64 类型单列表，用于存储从零开始的几乎所有自然数。'
keywords: ['系统表', 'numbers']
slug: /operations/system-tables/numbers
title: 'system.numbers'
doc_type: 'reference'
---

# system.numbers \{#systemnumbers\}

该表包含一个名为 `number` 的 `UInt64` 列，存储从零开始的几乎所有自然数。

你可以将此表用于测试，或在需要进行暴力搜索时使用。

从该表读取数据时不支持并行化。

**示例**

```sql
SELECT * FROM system.numbers LIMIT 10;
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

你还可以使用谓词来限制输出结果。

```sql
SELECT * FROM system.numbers < 10;
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
