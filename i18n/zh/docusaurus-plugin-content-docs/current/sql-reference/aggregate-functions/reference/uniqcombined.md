---
description: '计算不同参数值的近似数量。'
sidebar_position: 205
slug: /sql-reference/aggregate-functions/reference/uniqcombined
title: 'uniqCombined'
doc_type: 'reference'
---

# uniqCombined {#uniqcombined}

计算不同参数值的近似个数。

```sql
uniqCombined(HLL_precision)(x[, ...])
```

`uniqCombined` 函数是用于计算不同取值数量的一个很好的选择。

**参数**

* `HLL_precision`：在 [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 中单元格数量的以 2 为底的对数。可选，你可以以 `uniqCombined(x[, ...])` 的形式使用该函数。`HLL_precision` 的默认值为 17，这实际上占用 96 KiB 的空间（2^17 个单元格，每个 6 位）。
* `X`：可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**返回值**

* 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数字。

**实现细节**

`uniqCombined` 函数：

* 为聚合中的所有参数计算哈希（`String` 使用 64 位哈希，其他类型使用 32 位哈希），然后在计算中使用该哈希。
* 组合使用三种算法：数组、哈希表和带误差校正表的 HyperLogLog。
  * 对于数量较少的不同元素，使用数组。
  * 当集合大小更大时，使用哈希表。
  * 对于数量更大的元素，使用 HyperLogLog，其占用固定大小的内存。
* 以确定性的方式返回结果（不依赖于查询处理顺序）。

:::note
由于对非 `String` 类型使用 32 位哈希，当基数显著大于 `UINT_MAX` 时，结果将具有非常高的误差（在数百亿个不同值之后误差会迅速增大），因此在这种情况下你应该使用 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)。
:::

与 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数相比，`uniqCombined` 函数：

* 内存消耗减少数倍。
* 计算精度提高数倍。
* 通常性能略低。在某些场景下，`uniqCombined` 的性能可能优于 `uniq`，例如在通过网络传输大量聚合状态的分布式查询中。

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

请参阅 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) 的示例部分，了解在输入规模更大时 `uniqCombined` 与 `uniqCombined64` 之间差异的示例。

**另请参阅**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
