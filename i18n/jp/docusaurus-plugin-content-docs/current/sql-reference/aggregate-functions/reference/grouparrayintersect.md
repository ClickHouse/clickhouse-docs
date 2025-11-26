---
description: '指定された配列の共通部分（すべての配列に共通して含まれる要素）を返します。'
sidebar_position: 141
slug: /sql-reference/aggregate-functions/reference/grouparrayintersect
title: 'groupArrayIntersect'
doc_type: 'reference'
---

# groupArrayIntersect

指定された配列同士の共通部分（指定されたすべての配列に共通して含まれるすべての要素）を返します。

**構文**

```sql
groupArrayIntersect(x)
```

**引数**

* `x` — 引数（列名または式）。

**返される値**

* すべての配列に共通して含まれる要素を集めた配列。

型: [Array](../../data-types/array.md)。

**使用例**

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

結果：

```text
┌─intersection──────┐
│ [1, 2]            │
└───────────────────┘
```
