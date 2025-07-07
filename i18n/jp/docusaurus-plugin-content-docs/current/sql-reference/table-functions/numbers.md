---
'slug': '/sql-reference/table-functions/numbers'
'sidebar_position': 145
'sidebar_label': 'numbers'
'title': 'numbers'
'description': 'Returns tables with a single `number` column that contains specifiable
  integers.'
---




# numbers テーブル関数

`numbers(N)` – 0 から N-1 までの整数を含む単一の 'number' カラム (UInt64) を持つテーブルを返します。  
`numbers(N, M)` - N から (N + M - 1) までの整数を含む単一の 'number' カラム (UInt64) を持つテーブルを返します。  
`numbers(N, M, S)` - N から (N + M - 1) までの整数を S ステップで含む単一の 'number' カラム (UInt64) を持つテーブルを返します。

`system.numbers` テーブルと似ており、テストや連続的な値の生成に使用できます。 `numbers(N, M)` は `system.numbers` よりも効率的です。

以下のクエリは同等です：

```sql
SELECT * FROM numbers(10);
SELECT * FROM numbers(0, 10);
SELECT * FROM system.numbers LIMIT 10;
SELECT * FROM system.numbers WHERE number BETWEEN 0 AND 9;
SELECT * FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
```

そして、以下のクエリは同等です：

```sql
SELECT number * 2 FROM numbers(10);
SELECT (number - 10) * 2 FROM numbers(10, 10);
SELECT * FROM numbers(0, 20, 2);
```

例：

```sql
-- 2010-01-01 から 2010-12-31 までの日付のシーケンスを生成
select toDate('2010-01-01') + number as d FROM numbers(365);

