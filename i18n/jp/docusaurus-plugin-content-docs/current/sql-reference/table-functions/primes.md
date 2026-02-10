---
slug: /sql-reference/table-functions/primes
sidebar_position: 145
sidebar_label: 'primes'
title: 'primes'
description: '素数を格納した単一の `prime` カラムのみを持つテーブルを返します。'
doc_type: 'reference'
---

# primes テーブル関数 \{#primes-table-function\}

`primes()` – 2 から始まる昇順の素数を含む `prime` カラム (UInt64) を 1 つだけ持つ無限テーブルを返します。行数を制限するには `LIMIT`（および必要に応じて `OFFSET`）を使用します。
`primes(N)` – 2 から始まる最初の `N` 個の素数を含む `prime` カラム (UInt64) を 1 つだけ持つテーブルを返します。
`primes(N, M)` - `N` 番目（0 始まり）の素数から始まる `M` 個の素数を含む `prime` カラム (UInt64) を 1 つだけ持つテーブルを返します。
`primes(N, M, S)` - `N` 番目（0 始まり）の素数から、ステップ `S`（素数のインデックス単位）で進みながら `M` 個の素数を含む `prime` カラム (UInt64) を 1 つだけ持つテーブルを返します。返される素数はインデックス `N, N + S, N + 2S, ..., N + (M - 1)S` に対応します。`S` は 1 以上である必要があります。

これは [`system.primes`](/operations/system-tables/primes) システムテーブルと同様です。

次のクエリは同等です。

```sql
SELECT * FROM primes(10);
SELECT * FROM primes(0, 10);
SELECT * FROM primes() LIMIT 10;
SELECT * FROM system.primes LIMIT 10;
SELECT * FROM system.primes WHERE prime IN (2, 3, 5, 7, 11, 13, 17, 19, 23, 29);
```

次のクエリは等価です：

```sql
SELECT * FROM primes(10, 10);
SELECT * FROM primes() LIMIT 10 OFFSET 10;
SELECT * FROM system.primes LIMIT 10 OFFSET 10;
```

### 使用例 \{#examples\}

最初の 10 個の素数

```sql
SELECT * FROM primes(10);
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
SELECT prime FROM primes() WHERE prime > toUInt64(1e15) LIMIT 1;
```

```response
  ┌────────────prime─┐
  │ 1000000000000037 │ -- 1.00 quadrillion
  └──────────────────┘
```

最初の7つのメルセンヌ素数

```sql
SELECT prime
FROM primes()
WHERE bitAnd(prime, prime + 1) = 0
LIMIT 7;
```

```response
  ┌──prime─┐
  │      3 │
  │      7 │
  │     31 │
  │    127 │
  │   8191 │
  │ 131071 │
  │ 524287 │
  └────────┘
```

### 注記 \{#note\}

* 最も高速なのは、デフォルトのステップ（`1`）を使う単純な範囲およびポイントフィルタのバリアントで、例えば `primes(N)` や `primes() LIMIT N` です。これらの形式では、最適化された素数ジェネレーターを使用して、非常に大きな素数を効率的に計算します。例えば、次のクエリはほぼ瞬時に実行されます。

```sql
SELECT sum(prime)
FROM primes()
WHERE prime BETWEEN toUInt64(1e6) AND toUInt64(1e6) + 100
   OR prime BETWEEN toUInt64(1e12) AND toUInt64(1e12) + 100
   OR prime BETWEEN toUInt64(1e15) AND toUInt64(1e15) + 100
   OR prime IN (9999999967, 9999999971, 9999999973)
   OR prime == 1000000000000037;
```

```response
  ┌───────sum(prime)─┐
  │ 2004010006000641 │ -- 2.00 quadrillion
  └──────────────────┘
```

* 非ゼロの `offset` および/または 1 より大きい `step`（`primes(offset, count)` / `primes(offset, count, step)`）を使用すると、内部的に追加の素数を生成してスキップする必要が生じるため、より遅くなる場合があります。`offset` や `step` が不要な場合は、省略してください。
