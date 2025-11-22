---
description: '创建一个由参数值组成的数组。可以以任意顺序（顺序不确定）将值添加到数组中。'
sidebar_position: 139
slug: /sql-reference/aggregate-functions/reference/grouparray
title: 'groupArray'
doc_type: 'reference'
---

# groupArray

语法：`groupArray(x)` 或 `groupArray(max_size)(x)`

创建一个由参数值构成的数组。
数组中的值可以以任意（不确定）顺序添加。

第二种形式（带有 `max_size` 参数）将结果数组的大小限制为 `max_size` 个元素。例如，`groupArray(1)(x)` 等价于 `[any (x)]`。

在某些情况下，仍然可以依赖执行顺序。当 `SELECT` 来自一个使用了 `ORDER BY` 的子查询且该子查询的结果集足够小时，这一点是成立的。

**示例**

```text
SELECT * FROM default.ck;

┌─id─┬─name─────┐
│  1 │ zhangsan │
│  1 │ ᴺᵁᴸᴸ     │
│  1 │ lisi     │
│  2 │ wangwu   │
└────┴──────────┘

```

查询：

```sql
SELECT id, groupArray(10)(name) FROM default.ck GROUP BY id;
```

结果：

```text
┌─id─┬─groupArray(10)(name)─┐
│  1 │ ['zhangsan','lisi']  │
│  2 │ ['wangwu']           │
└────┴──────────────────────┘
```

`groupArray` 函数会根据上述结果排除 ᴺᵁᴸᴸ 值。

* 别名：`array_agg`。
