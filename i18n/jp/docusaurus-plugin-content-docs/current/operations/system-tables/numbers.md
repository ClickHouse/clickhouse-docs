---
description: '0 から始まるほとんどの自然数を格納する、`number` という名前の単一の UInt64 型列を持つシステムテーブル。'
keywords: ['システムテーブル', 'numbers']
slug: /operations/system-tables/numbers
title: 'system.numbers'
doc_type: 'reference'
---

# system.numbers \\{#systemnumbers\\}

このテーブルには、`number` という名前の単一の UInt64 列があり、0 から始まるほぼすべての自然数が含まれます。

このテーブルはテスト用途や、総当たり検索を行う必要がある場合に使用できます。

このテーブルからの読み取りは並列化されません。

**例**

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

出力を条件で絞り込むこともできます。

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
