---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: generate_series
---

# generate_series

`generate_series(START, STOP)` - 開始から終了まで（終了を含む）の整数を含む単一の 'generate_series' カラム（UInt64）を持つテーブルを返します。

`generate_series(START, STOP, STEP)` - 開始から終了まで（終了を含む）の整数を含む単一の 'generate_series' カラム（UInt64）を持つテーブルを返し、値の間隔はSTEPで指定された値になります。

以下のクエリは同じ内容を持つテーブルを返しますが、カラム名が異なります：

``` sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

以下のクエリも同じ内容を持つテーブルを返しますが、カラム名が異なります（ただし、2番目のオプションの方が効率的です）：

``` sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3) ;
```
