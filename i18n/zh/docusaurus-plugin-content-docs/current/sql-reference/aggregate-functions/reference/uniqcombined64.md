---
'description': '计算不同参数值的近似数量。它与 uniqCombined 相同，但对所有数据类型使用 64 位哈希，而不仅仅是对字符串数据类型。'
'sidebar_position': 206
'slug': '/sql-reference/aggregate-functions/reference/uniqcombined64'
'title': 'uniqCombined64'
'doc_type': 'reference'
---


# uniqCombined64

计算不同参数值的近似数量。它与 [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) 相同，但对所有数据类型使用64位哈希，而不仅仅对字符串数据类型使用。

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**参数**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 中单元格数量的以2为底的对数。可选地，您可以将此函数用作 `uniqCombined64(x[, ...])`。`HLL_precision` 的默认值为17，相当于96 KiB的空间（2^17个单元格，每个单元格6位）。
- `X`: 可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数字类型。

**返回值**

- 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数字。

**实现细节**

`uniqCombined64` 函数：
- 为聚合中的所有参数计算哈希（针对所有数据类型的64位哈希），然后在计算中使用它。
- 使用三种算法的组合：数组、哈希表和带有误差修正表的 HyperLogLog。
  - 对于少量不同元素，使用数组。
  - 当集合大小较大时，使用哈希表。
  - 对于数量较大的元素，使用 HyperLogLog，它将占用固定数量的内存。
- 以确定性方式提供结果（不依赖于查询处理顺序）。

:::note
由于它对所有类型使用64位哈希，因此结果不会像 [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md) 那样在基数显著大于 `UINT_MAX` 时出现非常高的误差，因为后者对非 `String` 类型使用32位哈希。
:::

与 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数相比，`uniqCombined64` 函数：

- 消耗的内存少了几倍。
- 计算的准确度高了几倍。

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

相比之下，`uniqCombined` 函数返回的对如此规模输入的近似值相当差。

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
