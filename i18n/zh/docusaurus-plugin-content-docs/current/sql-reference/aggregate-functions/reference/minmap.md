---
'description': '根据`key`数组中指定的键计算`value`数组的最小值。'
'sidebar_position': 169
'slug': '/sql-reference/aggregate-functions/reference/minmap'
'title': 'minMap'
'doc_type': 'reference'
---


# minMap

根据 `key` 数组中指定的键计算 `value` 数组的最小值。

**语法**

```sql
`minMap(key, value)`
```
或
```sql
minMap(Tuple(key, value))
```

别名: `minMappedArrays`

:::note
- 传递一个键元组和一个值数组与传递一个键数组和一个值数组是相同的。
- 每一行的 `key` 和 `value` 中的元素数量必须相同。
:::

**参数**

- `key` — 键的数组。 [Array](../../data-types/array.md)。
- `value` — 值的数组。 [Array](../../data-types/array.md)。

**返回值**

- 返回两个数组的元组：按排序顺序排列的键和对应键计算得出的值。 [Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md))。

**示例**

查询：

```sql
SELECT minMap(a, b)
FROM VALUES('a Array(Int32), b Array(Int64)', ([1, 2], [2, 2]), ([2, 3], [1, 1]))
```

结果：

```text
┌─minMap(a, b)──────┐
│ ([1,2,3],[2,1,1]) │
└───────────────────┘
```
