---
description: '系统表，包含一个名为 `number` 的 UInt64 类型单列，含有从零开始的几乎所有自然数。'
keywords: ['system table', 'numbers']
slug: /operations/system-tables/numbers
title: 'system.numbers'
doc_type: 'reference'
---

# system.numbers

此表包含一个名为 `number` 的 UInt64 类型单列，其中包含几乎所有从零开始的自然数。

可以将此表用于测试，或在需要进行穷举搜索时使用。

从此表读取数据时不会进行并行化。

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

返回 10 行。耗时: 0.001 秒。
```

你也可以使用谓词来限制输出结果。

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

返回 10 行。耗时: 0.001 秒。
```
