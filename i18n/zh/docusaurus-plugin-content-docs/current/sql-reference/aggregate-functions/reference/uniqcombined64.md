---
'description': 'Calculates the approximate number of different argument values. It
  is the same as uniqCombined, but uses a 64-bit hash for all data types rather than
  just for the String data type.'
'sidebar_position': 206
'slug': '/sql-reference/aggregate-functions/reference/uniqcombined64'
'title': 'uniqCombined64'
---




# uniqCombined64

计算不同参数值的近似数量。它与 [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) 相同，但对所有数据类型使用 64 位哈希，而不仅仅是对字符串数据类型。

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**参数**

- `HLL_precision`： [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 中单元格数量的二进制对数。您可以选择将函数用作 `uniqCombined64(x[, ...])`。`HLL_precision` 的默认值为 17，实际上占用 96 KiB 的空间（2^17 个单元格，每个 6 位）。
- `X`：可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**返回值**

- 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数字。

**实现细节**

`uniqCombined64` 函数：
- 计算所有参数的哈希（所有数据类型的 64 位哈希），然后用于计算。
- 使用三种算法的组合：数组、哈希表和带有错误校正表的 HyperLogLog。
    - 对于少量不同元素，使用数组。
    - 当集合大小较大时，使用哈希表。
    - 对于更大量的元素，使用 HyperLogLog，它将占用固定数量的内存。
- 提供确定性的结果（不依赖于查询处理顺序）。

:::note
由于对所有类型使用 64 位哈希，结果不会因为基数显著大于 `UINT_MAX` 而导致非常高的误差，这是 [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md) 所使用的 32 位哈希对于非 `String` 类型所产生的问题。
:::

与 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数相比，`uniqCombined64` 函数：

- 消耗的内存少几倍。
- 计算的精度高几倍。

**示例**

在下面的示例中，`uniqCombined64` 在 `1e10` 个不同数字上运行，返回非常接近不同参数值数量的近似值。

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

相比之下，`uniqCombined` 函数对这个输入大小返回的近似值相当差。

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

**另请参见**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
