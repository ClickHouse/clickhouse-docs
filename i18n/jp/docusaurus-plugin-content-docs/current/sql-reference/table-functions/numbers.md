---
slug: /sql-reference/table-functions/numbers
sidebar_position: 145
sidebar_label: 'numbers'
title: 'numbers'
description: '指定された整数を含む単一の `number` カラムのテーブルを返します。'
---


# numbers テーブル関数

`numbers(N)` – 0 から N-1 までの整数を含む単一の 'number' カラム (UInt64) を持つテーブルを返します。  
`numbers(N, M)` - N から (N + M - 1) までの整数を含む単一の 'number' カラム (UInt64) を持つテーブルを返します。  
`numbers(N, M, S)` - N から (N + M - 1) までの整数をステップ S で含む単一の 'number' カラム (UInt64) を持つテーブルを返します。

`system.numbers` テーブルと似ており、値の生成やテストに使用できますが、`numbers(N, M)` の方が `system.numbers` より効率的です。

次のクエリは等価です：

```sql
SELECT * FROM numbers(10);
SELECT * FROM numbers(0, 10);
SELECT * FROM system.numbers LIMIT 10;
SELECT * FROM system.numbers WHERE number BETWEEN 0 AND 9;
SELECT * FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
```

次のクエリも等価です：

```sql
SELECT number * 2 FROM numbers(10);
SELECT (number - 10) * 2 FROM numbers(10, 10);
SELECT * FROM numbers(0, 20, 2);
```

例：

```sql
-- 2010-01-01 から 2010-12-31 までの日付のシーケンスを生成する
SELECT toDate('2010-01-01') + number AS d FROM numbers(365);
```
