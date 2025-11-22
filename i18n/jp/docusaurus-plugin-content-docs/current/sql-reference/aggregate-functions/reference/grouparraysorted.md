---
description: '最初の N 個の要素を昇順に並べた配列を返します。'
sidebar_position: 146
slug: /sql-reference/aggregate-functions/reference/grouparraysorted
title: 'groupArraySorted'
doc_type: 'reference'
---

# groupArraySorted

先頭の N 個の要素を昇順に並べた配列を返します。

```sql
groupArraySorted(N)(column)
```

**引数**

* `N` – 返す要素の数。

* `column` – 値（Integer、String、Float およびその他の Generic 型）。

**例**

先頭の 10 個の数値を取得します。

```sql
SELECT groupArraySorted(10)(number) FROM numbers(100)
```

```text
┌─groupArraySorted(10)(number)─┐
│ [0,1,2,3,4,5,6,7,8,9]        │
└──────────────────────────────┘
```

列内のすべての数値を `String` 型の文字列表現として取得します。

```sql
SELECT groupArraySorted(5)(str) FROM (SELECT toString(number) AS str FROM numbers(5));
```

```text
┌─groupArraySorted(5)(str)─┐
│ ['0','1','2','3','4']    │
└──────────────────────────┘
```
