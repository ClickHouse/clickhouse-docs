---
'description': 'Calculates the maximum from `value` array according to the keys specified
  in the `key` array.'
'sidebar_position': 165
'slug': '/sql-reference/aggregate-functions/reference/maxmap'
'title': 'maxMap'
---




# maxMap

根据在 `key` 数组中指定的键计算 `value` 数组中的最大值。

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
- 传递一组键和数值数组的元组与传递两个键数组和值数组是相同的。
- `key` 和 `value` 的元素数量对于每一行的总和必须相同。
:::

**参数**

- `key` — 键数组。 [Array](../../data-types/array.md)。
- `value` — 值数组。 [Array](../../data-types/array.md)。

**返回值**

- 返回一个包含两组数组的元组：已排序的键和对应键计算的值。 [Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md))。

**示例**

查询：

```sql
SELECT maxMap(a, b)
FROM values('a Array(Char), b Array(Int64)', (['x', 'y'], [2, 2]), (['y', 'z'], [3, 1]))
```

结果：

```text
┌─maxMap(a, b)───────────┐
│ [['x','y','z'],[2,3,1]]│
└────────────────────────┘
```
