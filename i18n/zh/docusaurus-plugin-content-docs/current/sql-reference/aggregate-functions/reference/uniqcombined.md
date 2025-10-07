---
'description': '计算不同参数值的近似数量。'
'sidebar_position': 205
'slug': '/sql-reference/aggregate-functions/reference/uniqcombined'
'title': 'uniqCombined'
'doc_type': 'reference'
---


# uniqCombined

计算不同参数值的近似数量。

```sql
uniqCombined(HLL_precision)(x[, ...])
```

`uniqCombined` 函数是计算不同值数量的好选择。

**参数**

- `HLL_precision`： [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 中单元格数量的以2为底的对数。可选，您可以将此函数用作 `uniqCombined(x[, ...])`。`HLL_precision` 的默认值为 17，这实际上占用 96 KiB 的空间（2^17 个单元格，每个 6 位）。
- `X`：可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数字类型。

**返回值**

- 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数字。

**实现细节**

`uniqCombined` 函数：

- 为聚合中的所有参数计算一个哈希（对于 `String` 类型是 64 位哈希，其他类型则为 32 位），然后在计算中使用它。
- 使用三种算法的组合：数组、哈希表和带有错误修正表的 HyperLogLog。
  - 对于少量不同元素，使用数组。
  - 当集合大小较大时，使用哈希表。
  - 对于数量更多的元素，使用 HyperLogLog，它将占用固定的内存量。
- 提供确定性的结果（它不依赖于查询处理顺序）。

:::note    
由于对非 `String` 类型使用 32 位哈希，因此对于显著大于 `UINT_MAX` 的基数，结果的误差将非常高（误差会在数十亿个不同值后迅速增加），因此在这种情况下，您应该使用 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)。
:::

与 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数相比，`uniqCombined` 函数：

- 消耗的内存少几倍。
- 计算精度高几倍。
- 通常性能略低。在某些情况下，`uniqCombined` 可以比 `uniq` 更好，例如在分布式查询中，网络上传输大量聚合状态的情况。

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

请参阅 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) 的示例部分，以了解 `uniqCombined` 和 `uniqCombined64` 对于更大输入的区别。

**另见**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
