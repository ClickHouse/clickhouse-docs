---
slug: /sql-reference/aggregate-functions/reference/grouparrayintersect
sidebar_position: 141
title: "groupArrayIntersect"
description: "与えられた配列の交差を返します（与えられたすべての配列に含まれる配列のすべてのアイテムを返します）。"
---


# groupArrayIntersect

与えられた配列の交差を返します（与えられたすべての配列に含まれる配列のすべてのアイテムを返します）。

**構文**

``` sql
groupArrayIntersect(x)
```

**引数**

- `x` — 引数（カラム名または式）。

**返される値**

- すべての配列に含まれる要素を含む配列。

型: [Array](../../data-types/array.md)。

**例**

テーブル `numbers` を考えてみましょう：

``` text
┌─a──────────────┐
│ [1,2,4]        │
│ [1,5,2,8,-1,0] │
│ [1,5,7,5,8,2]  │
└────────────────┘
```

引数としてカラム名を用いたクエリ：

``` sql
SELECT groupArrayIntersect(a) as intersection FROM numbers;
```

結果：

```text
┌─intersection──────┐
│ [1, 2]            │
└───────────────────┘
```
