---
description: '返回给定数组的交集（返回所有在所有给定数组中都存在的元素）。'
sidebar_position: 141
slug: /sql-reference/aggregate-functions/reference/grouparrayintersect
title: 'groupArrayIntersect'
doc_type: 'reference'
---

# groupArrayIntersect

返回给定数组的交集（即所有在每个数组中都出现的元素）。

**语法**

```sql
groupArrayIntersect(x)
```

**参数**

* `x` — 参数（列名或表达式）。

**返回值**

* 一个数组，包含同时出现在所有数组中的元素。

类型：[Array](../../data-types/array.md)。

**示例**

假设有表 `numbers`：

```text
┌─a──────────────┐
│ [1,2,4]        │
│ [1,5,2,8,-1,0] │
│ [1,5,7,5,8,2]  │
└────────────────┘
```

使用列名作为参数的查询：

```sql
SELECT groupArrayIntersect(a) AS intersection FROM numbers;
```

结果：

```text
┌─intersection──────┐
│ [1, 2]            │
└───────────────────┘
```
