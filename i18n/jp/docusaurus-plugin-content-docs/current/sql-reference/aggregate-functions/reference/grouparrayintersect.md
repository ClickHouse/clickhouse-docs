---
description: '指定された配列の共通部分を返します（すべての指定された配列に共通して含まれる要素を返します）。'
sidebar_position: 141
slug: /sql-reference/aggregate-functions/reference/grouparrayintersect
title: 'groupArrayIntersect'
doc_type: 'reference'
---

# groupArrayIntersect

指定された配列の共通部分を返します（指定されたすべての配列に共通して含まれる要素を返します）。

**構文**

```sql
groupArrayIntersect(x)
```

**引数**

* `x` — 引数（列名または式）。

**返される値**

* すべての配列に共通して含まれる要素から成る配列。

型: [Array](../../data-types/array.md)。

**例**

`numbers` テーブルを考えます。

```text
┌─a──────────────┐
│ [1,2,4]        │
│ [1,5,2,8,-1,0] │
│ [1,5,7,5,8,2]  │
└────────────────┘
```

列名を引数に取るクエリ:

```sql
SELECT groupArrayIntersect(a) AS intersection FROM numbers;
```

結果:

```text
┌─intersection──────┐
│ [1, 2]            │
└───────────────────┘
```
