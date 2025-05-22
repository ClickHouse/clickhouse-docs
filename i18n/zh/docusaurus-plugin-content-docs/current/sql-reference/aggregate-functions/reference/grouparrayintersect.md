---
'description': '返回给定数组的交集（返回所有存在于所有给定数组中的数组项）。'
'sidebar_position': 141
'slug': '/sql-reference/aggregate-functions/reference/grouparrayintersect'
'title': 'groupArrayIntersect'
---


# groupArrayIntersect

返回给定数组的交集（返回所有在所有给定数组中的项目）。

**语法**

```sql
groupArrayIntersect(x)
```

**参数**

- `x` — 参数（列名或表达式）。

**返回值**

- 包含所有数组中元素的数组。

类型: [Array](../../data-types/array.md)。

**示例**

考虑表 `numbers`：

```text
┌─a──────────────┐
│ [1,2,4]        │
│ [1,5,2,8,-1,0] │
│ [1,5,7,5,8,2]  │
└────────────────┘
```

以列名作为参数的查询：

```sql
SELECT groupArrayIntersect(a) as intersection FROM numbers;
```

结果：

```text
┌─intersection──────┐
│ [1, 2]            │
└───────────────────┘
```
