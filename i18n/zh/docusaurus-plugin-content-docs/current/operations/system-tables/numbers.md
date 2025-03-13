---
description: '包含一个名为 `number` 的 UInt64 列的系统表，该列几乎包含从零开始的所有自然数。'
slug: /operations/system-tables/numbers
title: 'system.numbers'
keywords: ['系统表', '数字']
---

此表包含一个名为 `number` 的 UInt64 列，该列几乎包含从零开始的所有自然数。

您可以使用此表进行测试，或者如果您需要进行暴力搜索时。

对此表的读取不会并行化。

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

10 行在集合中。耗时：0.001 秒。
```

您还可以通过谓词限制输出。

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

10 行在集合中。耗时：0.001 秒。
```
