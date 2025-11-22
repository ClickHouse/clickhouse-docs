---
description: '`system.numbers` と同様の system テーブルですが、読み出しが並列化されており、数値は任意の順序で返されます。'
keywords: ['system テーブル', 'numbers_mt']
slug: /operations/system-tables/numbers_mt
title: 'system.numbers_mt'
doc_type: 'reference'
---

[`system.numbers`](../../operations/system-tables/numbers.md) と同様ですが、読み出しが並列化されています。数値は任意の順序で返される可能性があります。

テスト用途で使用されます。

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

10行のデータセット。経過時間: 0.001秒
```
