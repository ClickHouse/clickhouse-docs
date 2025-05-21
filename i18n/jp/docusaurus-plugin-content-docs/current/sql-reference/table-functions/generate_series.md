---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: 'generate_series'
title: 'generate_series (generateSeries)'
description: '開始から終了までの整数を含む単一の `generate_series` カラム (UInt64) を持つテーブルを返します。'
---


# generate_series (generateSeries) テーブル関数

`generate_series(START, STOP)` (エイリアス: `generateSeries`) - 開始から終了までの整数を含む単一の 'generate_series' カラム (UInt64) を持つテーブルを返します。

`generate_series(START, STOP, STEP)` - 開始から終了までの整数を含む単一の 'generate_series' カラム (UInt64) を持つテーブルを返し、値の間の間隔は STEP によって与えられます。

次のクエリは、同じ内容のテーブルを返しますが、カラム名が異なります：

```sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

次のクエリも同じ内容のテーブルを返しますが、カラム名が異なります（ただし、2番目のオプションの方が効率的です）：

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3);
```
