---
description: '0 から始まるほとんどすべての自然数を格納する、`number` という名前の単一の UInt64 型列を持つシステムテーブル。'
keywords: ['システムテーブル', 'numbers']
slug: /operations/system-tables/numbers
title: 'system.numbers'
doc_type: 'reference'
---

# system.numbers

このテーブルには、`number` という名前の単一の UInt64 列があり、ゼロから始まるほとんどすべての自然数が含まれています。

このテーブルは、テスト用途や総当たり検索を行う必要がある場合に使用できます。

このテーブルに対する読み取り処理は並列化されません。

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

10行のセット。経過時間: 0.001秒。
```

述語を指定して出力を制限することもできます。

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

10行のセット。経過時間: 0.001秒。
```
