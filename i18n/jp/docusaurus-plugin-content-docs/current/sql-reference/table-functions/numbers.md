---
slug: /sql-reference/table-functions/numbers
sidebar_position: 145
sidebar_label: 'numbers'
title: 'numbers'
description: '整数のシーケンスを含む単一の `number` 列のみから成るテーブルを返します。'
doc_type: 'reference'
---

# numbers テーブル関数 \{#numbers-table-function\}

* `numbers()` – 0 から始まる昇順の整数を含む、単一の `number` カラム (UInt64) を持つ無限テーブルを返します。行数を制限するには `LIMIT`（および必要に応じて `OFFSET`）を使用します。

* `numbers(N)` – 0 から `N - 1` までの整数を含む、単一の `number` カラム (UInt64) を持つテーブルを返します。

* `numbers(N, M)` – `N` から `N + M - 1` までの `M` 個の整数を含む、単一の `number` カラム (UInt64) を持つテーブルを返します。

* `numbers(N, M, S)` – ステップ `S`（切り上げでおおよそ `M / S` 行）で `[N, N + M)` の範囲の値を含む、単一の `number` カラム (UInt64) を持つテーブルを返します。`S` は `>= 1` でなければなりません。

これは [`system.numbers`](/operations/system-tables/numbers) システムテーブルと同様です。テストや連続値の生成に使用できます。

次のクエリは同じ結果になります。

```sql
SELECT * FROM numbers(10);
SELECT * FROM numbers(0, 10);
SELECT * FROM numbers() LIMIT 10;
SELECT * FROM system.numbers LIMIT 10;
SELECT * FROM system.numbers WHERE number BETWEEN 0 AND 9;
SELECT * FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
```

以下のクエリも同等です。

```sql
SELECT * FROM numbers(10, 10);
SELECT * FROM numbers() LIMIT 10 OFFSET 10;
SELECT * FROM system.numbers LIMIT 10 OFFSET 10;
```

次のクエリも等価です。

```sql
SELECT number * 2 FROM numbers(10);
SELECT (number - 10) * 2 FROM numbers(10, 10);
SELECT * FROM numbers(0, 20, 2);
```


### 例 \{#examples\}

先頭の 10 個の数値。

```sql
SELECT * FROM numbers(10);
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
```

2010-01-01 から 2010-12-31 までの日付の連番を生成します。

```sql
SELECT toDate('2010-01-01') + number AS d FROM numbers(365);
```

`sipHash64(number)` の値の下位 20 ビットが 0 であり、かつ `>= 10^15` を満たす最初の `UInt64` を見つけます。

```sql
SELECT number
FROM numbers()
WHERE number >= toUInt64(1e15)
  AND bitAnd(sipHash64(number), 0xFFFFF) = 0
LIMIT 1;
```

```response
 ┌───────────number─┐
 │ 1000000000056095 │ -- 1.00 quadrillion
 └──────────────────┘
```


### 注意 \{#notes\}

- パフォーマンス上の理由から、必要な行数が分かっている場合は、無制限の `numbers()` / `system.numbers` よりも、上限を指定した形式（`numbers(N)`、`numbers(N, M[, S])`）を優先して使用してください。
- 並列に生成する場合は、`numbers_mt(...)` または [`system.numbers_mt`](/operations/system-tables/numbers_mt) テーブルを使用してください。結果は任意の順序で返される可能性がある点に注意してください。