---
description: '2 から始まる素数を昇順で格納する、`prime` という名前の単一の UInt64 カラムを持つ system テーブル。'
keywords: ['システムテーブル', '素数']
slug: /operations/system-tables/primes
title: 'system.primes'
doc_type: 'reference'
---

# system.primes \{#systemprimes\}

このテーブルには `prime` という名前の単一の UInt64 カラムがあり、2 から始まる素数が昇順で格納されています。

このテーブルはテスト用途や、素数に対する総当たり検索が必要な場合に利用できます。

このテーブルからの読み取りは並列実行されません。

これは [`primes`](/sql-reference/table-functions/primes) テーブル関数に似ています。

述語条件によって出力を制限することもできます。

**例**

最初の 10 個の素数。

```sql
SELECT * FROM system.primes LIMIT 10;
```

```response
  ┌─prime─┐
  │     2 │
  │     3 │
  │     5 │
  │     7 │
  │    11 │
  │    13 │
  │    17 │
  │    19 │
  │    23 │
  │    29 │
  └───────┘
```

1e15 を超える最初の素数。

```sql
SELECT prime FROM system.primes WHERE prime > toUInt64(1e15) LIMIT 1;
```

```response
  ┌────────────prime─┐
  │ 1000000000000037 │ -- 1.00 quadrillion
  └──────────────────┘
```
