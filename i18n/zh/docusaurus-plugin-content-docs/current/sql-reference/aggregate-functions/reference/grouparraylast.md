---
slug: /sql-reference/aggregate-functions/reference/grouparraylast
sidebar_position: 142
title: 'groupArrayLast'
description: '创建一个最后参数值的数组。'
---


# groupArrayLast

语法： `groupArrayLast(max_size)(x)`

创建一个最后参数值的数组。
例如，`groupArrayLast(1)(x)` 等价于 `[anyLast (x)]`。

在某些情况下，您仍然可以依赖执行顺序。这适用于 `SELECT` 来自使用 `ORDER BY` 的子查询的情况，如果子查询结果足够小。

**示例**

查询：

```sql
select groupArrayLast(2)(number+1) numbers from numbers(10)
```

结果：

```text
┌─numbers─┐
│ [9,10]  │
└─────────┘
```

与 `groupArray` 相比：

```sql
select groupArray(2)(number+1) numbers from numbers(10)
```

```text
┌─numbers─┐
│ [1,2]   │
└─────────┘
```
