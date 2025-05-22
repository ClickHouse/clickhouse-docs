
# uniqCombined

计算不同参数值的近似数量。

```sql
uniqCombined(HLL_precision)(x[, ...])
```

`uniqCombined` 函数是计算不同值数量的良好选择。

**参数**

- `HLL_precision`：HyperLogLog 中单元格数量的二进制对数。可选，您可以使用 `uniqCombined(x[, ...])` 的形式调用该函数。`HLL_precision` 的默认值是 17，这实际上占用 96 KiB 的空间（2^17 个单元格，每个 6 位）。
- `X`：一个可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数字类型。


**返回值**

- 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数字。

**实现细节**

`uniqCombined` 函数：

- 为聚合中的所有参数计算一个哈希（`String` 使用 64 位哈希，其他类型使用 32 位），然后用于计算。
- 使用三种算法的组合：数组、哈希表和具有错误修正表的 HyperLogLog。
    - 对于少量不同元素，使用数组。
    - 当集合大小较大时，使用哈希表。
    - 对于更多元素，使用 HyperLogLog，它将占用固定量的内存。
- 提供确定性的结果（不依赖于查询处理顺序）。

:::note    
由于对非 `String` 类型使用 32 位哈希，因此对于显著大于 `UINT_MAX` 的基数，结果将具有非常高的误差（在数十亿个不同值后误差将迅速增加），因此在这种情况下，您应该使用 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)。
:::

与 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数相比，`uniqCombined` 函数：

- 消耗的内存少了几倍。
- 计算的准确性高了几倍。
- 性能通常稍微低一些。在某些场景下，例如在网络上传输大量聚合状态的分布式查询中，`uniqCombined` 的性能可能优于 `uniq`。

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

请参见 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) 的示例部分，以了解 `uniqCombined` 和 `uniqCombined64` 在更大输入上的区别。

**另请参阅**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
