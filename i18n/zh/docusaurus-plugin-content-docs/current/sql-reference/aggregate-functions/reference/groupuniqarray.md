---
'description': '从不同的参数值创建一个数组。'
'sidebar_position': 154
'slug': '/sql-reference/aggregate-functions/reference/groupuniqarray'
'title': 'groupUniqArray'
---


# groupUniqArray

语法: `groupUniqArray(x)` 或 `groupUniqArray(max_size)(x)`

从不同的参数值创建一个数组。内存消耗与 [uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md) 函数相同。

第二个版本（带有 `max_size` 参数）限制生成的数组大小为 `max_size` 个元素。 
例如，`groupUniqArray(1)(x)` 相当于 `[any(x)]`。
