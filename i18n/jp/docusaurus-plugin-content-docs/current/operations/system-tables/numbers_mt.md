---
description: '`system.numbers` と類似したシステムテーブルですが、リードは並列化されており、数値は任意の順序で返されます。'
keywords: ['system table', 'numbers_mt']
slug: /operations/system-tables/numbers_mt
title: 'system.numbers_mt'
---

[`system.numbers`](../../operations/system-tables/numbers.md) と同様ですが、リードは並列化されています。数値は任意の順序で返されます。

テスト用に使用されます。

**例**

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

10 行の結果がセットされました。経過時間: 0.001 秒。
```
