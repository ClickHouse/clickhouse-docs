---
'description': '计算不同参数值的近似数量。'
'sidebar_position': 205
'slug': '/sql-reference/aggregate-functions/reference/uniqcombined'
'title': 'uniqCombined'
---


# uniqCombined

计算不同参数值的近似数量。

```sql
uniqCombined(HLL_precision)(x[, ...])
```

`uniqCombined` 函数是计算不同值数量的良好选择。

**参数**

- `HLL_precision`： [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 中单元格数量的以2为基数的对数。可选，您可以使用 `uniqCombined(x[, ...])` 的形式调用该函数。`HLL_precision` 的默认值为 17，这实际上占用了 96 KiB 的空间（2^17 单元格，每个 6 位）。
- `X`：可变数量的参数。参数可以是 `Tuple`，`Array`，`Date`，`DateTime`，`String` 或数字类型。

**返回值**

- 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数字。

**实现细节**

`uniqCombined` 函数：

- 对所有参数计算哈希值（对于 `String` 使用64位哈希，其他类型使用32位），然后用于计算。
- 使用三种算法的组合：数组、哈希表和具有误差校正表的 HyperLogLog。
    - 对于少量不同元素，使用数组。
    - 当集合大小较大时，使用哈希表。
    - 对于大量元素，使用 HyperLogLog，它将占用固定数量的内存。
- 提供确定性的结果（不依赖于查询处理顺序）。

:::note    
由于对非 `String` 类型使用 32 位哈希，因此对于数量大大超过 `UINT_MAX` 的基数，结果将有很高的误差（在几百亿的不同值之后，误差会迅速增加），因此在这种情况下您应该使用 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)。
:::

与 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数相比，`uniqCombined` 函数：

- 消耗的内存少几倍。
- 计算的准确性高几倍。
- 通常性能稍低。在某些场景下，`uniqCombined` 的性能可能优于 `uniq`，例如，当有大量聚合状态通过网络传输的分布式查询时。

**示例**

查询：

```sql
SELECT uniqCombined(number) FROM numbers(1e6);
```

结果：

```response
┌─uniqCombined(number)─┐
│              1001148 │ -- 1.00 million
└──────────────────────┘
```

请参见 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) 的示例部分，了解在处理更大输入时 `uniqCombined` 和 `uniqCombined64` 之间的区别。

**另请参阅**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
