---
'description': 'Creates an array of argument values. Values can be added to the array
  in any (indeterminate) order.'
'sidebar_position': 139
'slug': '/sql-reference/aggregate-functions/reference/grouparray'
'title': 'groupArray'
---




# groupArray

语法： `groupArray(x)` 或 `groupArray(max_size)(x)`

创建一个包含参数值的数组。  
值可以以任何（不确定的）顺序添加到数组中。

第二种版本（带有 `max_size` 参数）将结果数组的大小限制为 `max_size` 个元素。例如， `groupArray(1)(x)` 相当于 `[any (x)]`。

在某些情况下，您仍然可以依赖执行顺序。这适用于 `SELECT` 来自使用 `ORDER BY` 的子查询的情况，当子查询结果足够小时适用。

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
select id, groupArray(10)(name) from default.ck group by id;
```

结果：

```text
┌─id─┬─groupArray(10)(name)─┐
│  1 │ ['zhangsan','lisi']  │
│  2 │ ['wangwu']           │
└────┴──────────────────────┘
```

groupArray 函数将基于上述结果移除 ᴺᵁᴸᴸ 值。

- 别名： `array_agg`。
