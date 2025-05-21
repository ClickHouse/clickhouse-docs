---
description: '与えられた配列の交差を返します（すべての与えられた配列に含まれる配列の項目を返します）。'
sidebar_position: 141
slug: /sql-reference/aggregate-functions/reference/grouparrayintersect
title: 'groupArrayIntersect'
---


# groupArrayIntersect

与えられた配列の交差を返します（すべての与えられた配列に含まれる配列の項目を返します）。

**構文**

```sql
groupArrayIntersect(x)
```

**引数**

- `x` — 引数（カラム名または式）。

**返される値**

- すべての配列に存在する要素を含む配列。

型: [Array](../../data-types/array.md)。

**例**

テーブル `numbers` を考えます：

```text
┌─a──────────────┐
│ [1,2,4]        │
│ [1,5,2,8,-1,0] │
│ [1,5,7,5,8,2]  │
└────────────────┘
```

カラム名を引数として使用したクエリ：

```sql
SELECT groupArrayIntersect(a) as intersection FROM numbers;
```

結果：

```text
┌─intersection──────┐
│ [1, 2]            │
└───────────────────┘
```
