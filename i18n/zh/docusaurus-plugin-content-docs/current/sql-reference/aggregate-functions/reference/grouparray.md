---
slug: /sql-reference/aggregate-functions/reference/grouparray
sidebar_position: 139
title: 'groupArray'
description: '创建参数值的数组。值可以以任何（不确定）顺序添加到数组中。'
---


# groupArray

语法: `groupArray(x)` 或 `groupArray(max_size)(x)`

创建参数值的数组。  
值可以以任何（不确定）顺序添加到数组中。

第二种版本（带有 `max_size` 参数）将结果数组的大小限制为 `max_size` 个元素。例如，`groupArray(1)(x)` 相当于 `[any (x)]`。

在某些情况下，您仍然可以依赖执行的顺序。这适用于 `SELECT` 来自一个使用 `ORDER BY` 的子查询的情况，如果子查询结果足够小。

**示例**

``` text
SELECT * FROM default.ck;

┌─id─┬─name─────┐
│  1 │ zhangsan │
│  1 │ ᴺᵁᴸᴸ     │
│  1 │ lisi     │
│  2 │ wangwu   │
└────┴──────────┘

```

查询：

``` sql
select id, groupArray(10)(name) from default.ck group by id;
```

结果：

``` text
┌─id─┬─groupArray(10)(name)─┐
│  1 │ ['zhangsan','lisi']  │
│  2 │ ['wangwu']           │
└────┴──────────────────────┘
```

groupArray 函数将根据上述结果移除 ᴺᵁᴸᴸ 值。

- 别名: `array_agg`.
