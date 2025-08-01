---
description: 'Return an intersection of given arrays (Return all items of arrays,
  that are in all given arrays).'
sidebar_position: 141
slug: '/sql-reference/aggregate-functions/reference/grouparrayintersect'
title: 'groupArrayIntersect'
---




# groupArrayIntersect

与えられた配列の交差を返します（すべての与えられた配列に含まれるすべての項目を返します）。

**構文**

```sql
groupArrayIntersect(x)
```

**引数**

- `x` — 引数（カラム名または式）。

**戻り値の型**

- すべての配列に含まれる要素を含む配列。

型: [Array](../../data-types/array.md)。

**例**

`numbers` テーブルを考えます：

```text
┌─a──────────────┐
│ [1,2,4]        │
│ [1,5,2,8,-1,0] │
│ [1,5,7,5,8,2]  │
└────────────────┘
```

カラム名を引数とするクエリ：

```sql
SELECT groupArrayIntersect(a) as intersection FROM numbers;
```

結果：

```text
┌─intersection──────┐
│ [1, 2]            │
└───────────────────┘
```
