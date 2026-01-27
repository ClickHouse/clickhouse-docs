---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: 'generate_series'
title: 'generate_series (generateSeries)'
description: '開始値から終了値までの整数（両端を含む）を格納する、単一の `generate_series` 列 (UInt64) を持つテーブルを返します。'
doc_type: 'reference'
---

# generate&#95;series テーブル関数 \{#generate&#95;series-table-function\}

エイリアス: `generateSeries`

## 構文 \{#syntax\}

`start` から `stop` までの整数（両端を含む）を格納した、単一の `generate_series` 列（`UInt64`）を持つテーブルを返します。

```sql
generate_series(START, STOP)
```

単一の &#39;generate&#95;series&#39; 列（`UInt64`）を持つテーブルを返します。この列には、`STEP` で指定された間隔で、start から stop までの整数（両端を含む）が格納されます。

```sql
generate_series(START, STOP, STEP)
```

## 例 \{#examples\}

次のクエリは、同じ内容で列名だけが異なるテーブルを返します。

```sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

次のクエリは、同じ内容のテーブルを返しますが列名が異なります（ただし、2 番目の方がより効率的です）。

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3);
```
