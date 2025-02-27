---
description: "システムテーブルは `system.numbers` に似ていますが、読み取りは並列化されており、数値は任意の順序で返されます。"
slug: /operations/system-tables/numbers_mt
title: "numbers_mt"
keywords: ["システムテーブル", "numbers_mt"]
---

[`system.numbers`](../../operations/system-tables/numbers.md) と同様ですが、読み取りは並列化されています。数値は任意の順序で返されます。

テストに使用されます。

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

10 行がセットに含まれています。経過時間: 0.001 秒。
```
