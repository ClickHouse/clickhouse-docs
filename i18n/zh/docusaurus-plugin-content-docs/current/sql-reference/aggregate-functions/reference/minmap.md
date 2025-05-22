
# minMap

计算根据 `key` 数组中指定的键，从 `value` 数组中获取最小值。

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
- 传递键和值数组的元组与传递键数组和值数组是相同的。
- 对于每一行的总计，`key` 和 `value` 中的元素数量必须相同。
:::

**参数**

- `key` — 键数组。 [Array](../../data-types/array.md).
- `value` — 值数组。 [Array](../../data-types/array.md).

**返回值**

- 返回一个包含两个数组的元组：按排序顺序的键和为相应键计算的值。 [Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md))。

**示例**

查询:

```sql
SELECT minMap(a, b)
FROM values('a Array(Int32), b Array(Int64)', ([1, 2], [2, 2]), ([2, 3], [1, 1]))
```

结果:

```text
┌─minMap(a, b)──────┐
│ ([1,2,3],[2,1,1]) │
└───────────────────┘
```
