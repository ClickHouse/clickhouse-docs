---
'description': '计算不同参数值的近似数量。它与 uniqCombined 相同，但对所有数据类型使用 64 位哈希，而不仅仅是对字符串数据类型使用。'
'sidebar_position': 206
'slug': '/sql-reference/aggregate-functions/reference/uniqcombined64'
'title': 'uniqCombined64'
---


# uniqCombined64

计算不同参数值的近似数量。它与 [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) 相同，但对所有数据类型使用 64 位哈希，而不仅仅是对字符串数据类型使用。

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**参数**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 中单元格数量的以 2 为底的对数。可选地，您可以将函数用作 `uniqCombined64(x[, ...])`。`HLL_precision` 的默认值为 17，这有效地表示 96 KiB 的空间（2^17 个单元，每个 6 位）。
- `X`: 可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**返回值**

- 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数字。

**实现细节**

`uniqCombined64` 函数：
- 为聚合中的所有参数计算一个哈希（所有数据类型的 64 位哈希），然后在计算中使用它。
- 使用三种算法的组合：数组、哈希表和具有错误校正表的 HyperLogLog。
    - 对于少量不同元素，使用数组。
    - 当集合大小较大时，使用哈希表。
    - 对于更多元素，使用 HyperLogLog，这将占用固定数量的内存。
- 提供确定性的结果（不依赖于查询处理顺序）。

:::note
由于对所有类型使用 64 位哈希，因此结果不会因为基数显著大于 `UINT_MAX` 而遭受非常高的误差，就像 [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md) 对非 `String` 类型使用 32 位哈希一样。
:::

与 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数相比，`uniqCombined64` 函数：

- 内存消耗少几倍。
- 准确度提高了几倍。

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

相比之下，`uniqCombined` 函数对于如此大小的输入返回的近似值相当差。

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

**另见**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
