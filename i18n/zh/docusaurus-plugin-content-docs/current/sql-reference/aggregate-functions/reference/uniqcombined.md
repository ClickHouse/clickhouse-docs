---
slug: /sql-reference/aggregate-functions/reference/uniqcombined
sidebar_position: 205
title: 'uniqCombined'
description: '计算不同参数值的近似数量。'
---


# uniqCombined

计算不同参数值的近似数量。

``` sql
uniqCombined(HLL_precision)(x[, ...])
```

`uniqCombined` 函数是计算不同值数量的一个好选择。

**参数**

- `HLL_precision`：在 [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 中单元格数量的以2为底的对数。可选，你可以将该函数用作 `uniqCombined(x[, ...])`。 `HLL_precision` 的默认值是 17，相当于 96 KiB 的空间（2^17 个单元格，每个 6 位）。
- `X`：可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数字类型。

**返回值**

- 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数字。

**实现细节**

`uniqCombined` 函数：

- 对聚合中的所有参数计算一个哈希（对于 `String` 为 64 位哈希，其他为 32 位哈希），然后在计算中使用它。
- 使用三种算法的组合：数组、哈希表和带有误差修正表的 HyperLogLog。
    - 对于较少的不同元素，使用数组。
    - 当集合大小较大时，使用哈希表。
    - 对于更多的元素，使用 HyperLogLog，它将占用固定数量的内存。
- 提供确定性的结果（它不依赖于查询处理顺序）。

:::note    
由于它对非 `String` 类型使用 32 位哈希，因此对于大于 `UINT_MAX` 的基数，结果将具有非常高的误差（在几个十亿个不同值之后，误差会迅速增加），因此在这种情况下您应该使用 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)。
:::

与 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数相比，`uniqCombined` 函数：

- 消耗的内存少几倍。
- 计算精度高几倍。
- 通常具有略低的性能。在某些情况下，`uniqCombined` 的性能优于 `uniq`，例如，在通过网络传输大量聚合状态的分布式查询中。

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

请参阅 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) 的示例部分，以了解 `uniqCombined` 和 `uniqCombined64` 在处理更大输入时的区别。

**参见**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
