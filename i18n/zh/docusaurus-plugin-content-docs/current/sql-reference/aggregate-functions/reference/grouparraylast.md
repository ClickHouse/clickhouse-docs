---
description: '创建由最后一个参数的值构成的数组。'
sidebar_position: 142
slug: /sql-reference/aggregate-functions/reference/grouparraylast
title: 'groupArrayLast'
doc_type: 'reference'
---

# groupArrayLast

语法：`groupArrayLast(max_size)(x)`

创建一个由最后若干个参数值组成的数组。
例如，`groupArrayLast(1)(x)` 等价于 `[anyLast (x)]`。

在某些情况下，仍然可以依赖执行顺序。这适用于以下场景：当 `SELECT` 来自一个使用了 `ORDER BY` 的子查询，并且该子查询的结果集足够小时。

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
