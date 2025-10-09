---
'slug': '/sql-reference/table-functions/numbers'
'sidebar_position': 145
'sidebar_label': '数字'
'title': '数字'
'description': '返すのは、指定可能な整数を含む単一の `number` カラムを持つテーブルです。'
'doc_type': 'reference'
---


# numbers テーブル関数

`numbers(N)` – 0 から N-1 までの整数を含む単一の 'number' カラム (UInt64) を持つテーブルを返します。  
`numbers(N, M)` - N から (N + M - 1) までの整数を含む単一の 'number' カラム (UInt64) を持つテーブルを返します。  
`numbers(N, M, S)` - N から (N + M - 1) までの整数を S のステップで含む単一の 'number' カラム (UInt64) を持つテーブルを返します。  

`system.numbers` テーブルと同様に、テストや連続した値の生成に使用でき、`numbers(N, M)` は `system.numbers` よりも効率的です。

次のクエリは同等です：

```sql
SELECT * FROM numbers(10);
SELECT * FROM numbers(0, 10);
SELECT * FROM system.numbers LIMIT 10;
SELECT * FROM system.numbers WHERE number BETWEEN 0 AND 9;
SELECT * FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
```

次のクエリも同等です：

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
