---
description: '返回一个按升序排列的、包含前 N 个元素的数组。'
sidebar_position: 146
slug: /sql-reference/aggregate-functions/reference/grouparraysorted
title: 'groupArraySorted'
doc_type: 'reference'
---

# groupArraySorted

返回一个数组，其中包含按升序排序的前 N 个元素。

```sql
groupArraySorted(N)(column)
```

**参数**

* `N` – 要返回的元素数量。

* `column` – 值（整数、字符串、浮点数以及其他泛型类型）。

**示例**

获取前 10 个数：

```sql
SELECT groupArraySorted(10)(number) FROM numbers(100)
```

```text
┌─groupArraySorted(10)(number)─┐
│ [0,1,2,3,4,5,6,7,8,9]        │
└──────────────────────────────┘
```

获取列中所有数字的字符串表示：

```sql
SELECT groupArraySorted(5)(str) FROM (SELECT toString(number) AS str FROM numbers(5));
```

```text
┌─groupArraySorted(5)(str)─┐
│ ['0','1','2','3','4']    │
└──────────────────────────┘
```
