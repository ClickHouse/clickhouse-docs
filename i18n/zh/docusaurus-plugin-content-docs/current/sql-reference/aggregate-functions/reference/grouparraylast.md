---
'description': '创建一个包含最后一个参数值的数组。'
'sidebar_position': 142
'slug': '/sql-reference/aggregate-functions/reference/grouparraylast'
'title': 'groupArrayLast'
'doc_type': 'reference'
---


# groupArrayLast

语法: `groupArrayLast(max_size)(x)`

创建一个包含最后参数值的数组。
例如，`groupArrayLast(1)(x)` 相当于 `[anyLast (x)]`。

在某些情况下，您仍然可以依赖执行顺序。这适用于当 `SELECT` 来自一个使用 `ORDER BY` 的子查询，并且子查询结果足够小的情况。

**示例**

查询：

```sql
SELECT groupArrayLast(2)(number+1) numbers FROM numbers(10)
```

结果：

```text
┌─numbers─┐
│ [9,10]  │
└─────────┘
```

与 `groupArray` 相比：

```sql
SELECT groupArray(2)(number+1) numbers FROM numbers(10)
```

```text
┌─numbers─┐
│ [1,2]   │
└─────────┘
```
