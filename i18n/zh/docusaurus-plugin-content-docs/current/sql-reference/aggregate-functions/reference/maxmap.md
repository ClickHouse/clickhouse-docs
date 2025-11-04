---
'description': '根据 `key` 数组中指定的键计算 `value` 数组中的最大值。'
'sidebar_position': 165
'slug': '/sql-reference/aggregate-functions/reference/maxmap'
'title': 'maxMap'
'doc_type': 'reference'
---


# maxMap

根据 `key` 数组中指定的键计算 `value` 数组中的最大值。

**语法**

```sql
maxMap(key, value)
```
或
```sql
maxMap(Tuple(key, value))
```

别名: `maxMappedArrays`

:::note
- 传入键和值数组的元组与传入两个键和值数组是相同的。
- 每一行的 `key` 和 `value` 的元素数量必须相同。
:::

**参数**

- `key` — 键数组。 [Array](../../data-types/array.md)。
- `value` — 值数组。 [Array](../../data-types/array.md)。

**返回值**

- 返回一个包含两个数组的元组：排序后的键，以及为相应键计算得到的值。 [Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md))。

**示例**

查询：

```sql
SELECT maxMap(a, b)
FROM VALUES('a Array(Char), b Array(Int64)', (['x', 'y'], [2, 2]), (['y', 'z'], [3, 1]))
```

结果：

```text
┌─maxMap(a, b)───────────┐
│ [['x','y','z'],[2,3,1]]│
└────────────────────────┘
```
