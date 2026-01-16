---
slug: /sql-reference/table-functions/numbers
sidebar_position: 145
sidebar_label: 'numbers'
title: 'numbers'
description: '任意の整数値を含む単一の `number` 列のみから成るテーブルを返します。'
doc_type: 'reference'
---

# numbers テーブル関数 \\{#numbers-table-function\\}

`numbers(N)` – 単一の &#39;number&#39; 列 (UInt64) を持つテーブルを返し、この列には 0 から N-1 までの整数が含まれます。
`numbers(N, M)` - 単一の &#39;number&#39; 列 (UInt64) を持つテーブルを返し、この列には N から (N + M - 1) までの整数が含まれます。
`numbers(N, M, S)` - 単一の &#39;number&#39; 列 (UInt64) を持つテーブルを返し、この列には N から (N + M - 1) までの整数がステップ幅 S で含まれます。

`system.numbers` テーブルと同様に、テストや連続した値の生成に利用できます。`numbers(N, M)` は `system.numbers` より効率的です。

次のクエリは同等です。

```sql
SELECT * FROM numbers(10);
SELECT * FROM numbers(0, 10);
SELECT * FROM system.numbers LIMIT 10;
SELECT * FROM system.numbers WHERE number BETWEEN 0 AND 9;
SELECT * FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
```

次のクエリは等価です。

```sql
SELECT number * 2 FROM numbers(10);
SELECT (number - 10) * 2 FROM numbers(10, 10);
SELECT * FROM numbers(0, 20, 2);
```

例：

```sql
-- Generate a sequence of dates from 2010-01-01 to 2010-12-31
SELECT toDate('2010-01-01') + number AS d FROM numbers(365);
```
