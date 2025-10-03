---
description: 'Returns an array with the first N items in ascending order.'
sidebar_position: 146
slug: '/sql-reference/aggregate-functions/reference/grouparraysorted'
title: 'groupArraySorted'
---




# groupArraySorted

返された配列は、最初の N 個のアイテムを昇順に並べたものです。

```sql
groupArraySorted(N)(column)
```

**引数**

- `N` – 返す要素の数。

- `column` – 値 (整数、文字列、浮動小数点数およびその他の汎用型)。

**例**

最初の 10 個の数字を取得します:

```sql
SELECT groupArraySorted(10)(number) FROM numbers(100)
```

```text
┌─groupArraySorted(10)(number)─┐
│ [0,1,2,3,4,5,6,7,8,9]        │
└──────────────────────────────┘
```

カラム内のすべての数字の文字列実装を取得します:

```sql
SELECT groupArraySorted(5)(str) FROM (SELECT toString(number) as str FROM numbers(5));
```

```text
┌─groupArraySorted(5)(str)─┐
│ ['0','1','2','3','4']    │
└──────────────────────────┘
```
