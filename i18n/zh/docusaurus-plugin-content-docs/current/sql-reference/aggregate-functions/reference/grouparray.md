---
'description': '创建一个参数值的数组。值可以以任何（不确定的）顺序添加到数组中。'
'sidebar_position': 139
'slug': '/sql-reference/aggregate-functions/reference/grouparray'
'title': 'groupArray'
'doc_type': 'reference'
---


# groupArray

语法: `groupArray(x)` 或 `groupArray(max_size)(x)`

创建一个包含参数值的数组。值可以以任意（不确定的）顺序添加到数组中。

第二种版本（带有 `max_size` 参数）将生成的数组的大小限制为 `max_size` 元素。例如，`groupArray(1)(x)` 等价于 `[any (x)]`。

在某些情况下，您仍然可以依赖执行顺序。这适用于 `SELECT` 来自一个使用 `ORDER BY` 的子查询的情况，前提是子查询结果足够小。

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

查询:

```sql
SELECT id, groupArray(10)(name) FROM default.ck GROUP BY id;
```

结果:

```text
┌─id─┬─groupArray(10)(name)─┐
│  1 │ ['zhangsan','lisi']  │
│  2 │ ['wangwu']           │
└────┴──────────────────────┘
```

根据上述结果，groupArray 函数将删除 ᴺᵁᴸᴸ 值。

- 别名: `array_agg`.
