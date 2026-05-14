---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: 'generate_series'
title: 'generate_series (generateSeries)'
description: '開始値から終了値までの整数（両端を含む）を格納する、単一の `generate_series` 列 (UInt64) を持つテーブルを返します。'
doc_type: 'reference'
---

エイリアス: `generateSeries`

## 構文 \{#syntax\}

`start` から `stop` までの整数 (両端を含む) を格納した、単一の `generate_series` 列 (`UInt64`) を持つテーブルを返します。

```sql
generate_series(START, STOP)
```

単一の &#39;generate&#95;series&#39; 列 (`UInt64`) を持つテーブルを返します。この列には、`STEP` で指定された間隔で、start から stop までの整数 (両端を含む) が格納されます。

```sql
generate_series(START, STOP, STEP)
```

`STEP` は負の値にすることもでき、その場合は `START` から `STOP` までの系列が降順で生成されます。`STEP` が負で `START < STOP` の場合、結果は空です。

## 例 \{#examples\}

次のクエリは、同じ内容で列名だけが異なるテーブルを返します。

```sql
SELECT * FROM numbers(10, 5);
```

```response
┌─number─┐
│     10 │
│     11 │
│     12 │
│     13 │
│     14 │
└────────┘
```

```sql
SELECT * FROM generate_series(10, 14);
```

```response
┌─generate_series─┐
│              10 │
│              11 │
│              12 │
│              13 │
│              14 │
└─────────────────┘
```

次のクエリは、同じ内容のテーブルを返しますが列名が異なります (ただし、2 番目の方がより効率的です) 。

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
```

```response
┌─number─┐
│     10 │
│     13 │
│     16 │
│     19 │
└────────┘
```

```sql
SELECT * FROM generate_series(10, 20, 3);
```

```response
┌─generate_series─┐
│              10 │
│              13 │
│              16 │
│              19 │
└─────────────────┘
```

降順の数列を生成します:

```sql
SELECT * FROM generate_series(9, 0, -1);
```

```response
┌─generate_series─┐
│               9 │
│               8 │
│               7 │
│               6 │
│               5 │
│               4 │
│               3 │
│               2 │
│               1 │
│               0 │
└─────────────────┘
```