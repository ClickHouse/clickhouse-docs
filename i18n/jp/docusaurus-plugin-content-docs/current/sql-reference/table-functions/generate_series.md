---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: 'generate_series'
title: 'generate_series (generateSeries)'
description: '単一の `generate_series` 列 (UInt64) を持つテーブルを返します。この列には `start` から `stop` までの整数が両端を含めて格納されます。'
doc_type: 'reference'
---



# generate_series テーブル関数

エイリアス: `generateSeries`



## 構文 {#syntax}

開始値から終了値までの整数を含む単一の 'generate_series' 列（`UInt64`）を持つテーブルを返します（終了値を含む）：

```sql
generate_series(START, STOP)
```

開始値から終了値までの整数を含む単一の 'generate_series' 列（`UInt64`）を持つテーブルを返します（終了値を含む）。値の間隔は `STEP` で指定されます：

```sql
generate_series(START, STOP, STEP)
```


## Examples {#examples}

以下のクエリは、同じ内容のテーブルを返しますが、列名が異なります：

```sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

また、以下のクエリも同じ内容のテーブルを返しますが、列名が異なります（ただし、2番目のオプションの方が効率的です）：

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3);
```
