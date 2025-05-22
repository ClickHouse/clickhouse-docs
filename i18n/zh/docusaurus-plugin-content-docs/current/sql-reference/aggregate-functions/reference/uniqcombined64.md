
# uniqCombined64

计算不同参数值的近似数量。它与 [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) 相同，但对所有数据类型使用 64 位哈希，而不仅仅是对字符串数据类型。

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**参数**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 中单元格数量的以 2 为底的对数。您可以选择将该函数用作 `uniqCombined64(x[, ...])`。`HLL_precision` 的默认值为 17，这相当于 96 KiB 的空间（2^17 个单元格，每个单元格 6 位）。
- `X`: 可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**返回值**

- 一个 [UInt64](../../../sql-reference/data-types/int-uint.md)-类型的数字。

**实现细节**

`uniqCombined64` 函数：
- 为聚合中的所有参数计算哈希（所有数据类型的 64 位哈希），然后用于计算。
- 使用三种算法的组合：数组、哈希表和带有错误修正表的 HyperLogLog。
    - 对于少量不同元素，使用数组。
    - 当集合大小较大时，使用哈希表。
    - 对于更多的元素，使用 HyperLogLog，这将占用固定数量的内存。
- 提供确定性的结果（不依赖于查询处理顺序）。

:::note
由于对所有类型使用 64 位哈希，因此结果不会像 [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md) 那样，对于远大于 `UINT_MAX` 的基数出现很高的误差，后者对非 `String` 类型使用的是 32 位哈希。
:::

与 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数相比，`uniqCombined64` 函数：

- 消耗的内存少了几倍。
- 计算的准确性高了几倍。

**示例**

在下面的示例中，对 `1e10` 个不同数字运行 `uniqCombined64`，返回不同参数值数量的非常接近的近似值。

查询：

```sql
SELECT uniqCombined64(number) FROM numbers(1e10);
```

结果：

```response
┌─uniqCombined64(number)─┐
│             9998568925 │ -- 10.00 billion
└────────────────────────┘
```

相比之下，`uniqCombined` 函数对如此大小的输入返回了相当不准确的近似值。

查询：

```sql
SELECT uniqCombined(number) FROM numbers(1e10);
```

结果：

```response
┌─uniqCombined(number)─┐
│           5545308725 │ -- 5.55 billion
└──────────────────────┘
```

**另请参阅**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
