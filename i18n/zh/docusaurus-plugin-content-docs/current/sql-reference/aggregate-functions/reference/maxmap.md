---
'description': '根据 `key` 数组中指定的键计算 `value` 数组中的最大值。'
'sidebar_position': 165
'slug': '/sql-reference/aggregate-functions/reference/maxmap'
'title': 'maxMap'
---


# maxMap

根据在 `key` 数组中指定的键，计算 `value` 数组的最大值。

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
- 传递一组键和值数组的元组与分别传递两个键数组和值数组是相同的。
- 每一行的 `key` 和 `value` 中的元素数量必须相同。
:::

**参数**

- `key` — 键的数组。 [Array](../../data-types/array.md).
- `value` — 值的数组。 [Array](../../data-types/array.md).

**返回值**

- 返回一个包含两个数组的元组：按排序顺序排列的键，以及为相应键计算的值。 [Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md)).

**示例**

查询:

```sql
SELECT maxMap(a, b)
FROM values('a Array(Char), b Array(Int64)', (['x', 'y'], [2, 2]), (['y', 'z'], [3, 1]))
```

结果:

```text
┌─maxMap(a, b)───────────┐
│ [['x','y','z'],[2,3,1]]│
└────────────────────────┘
```
