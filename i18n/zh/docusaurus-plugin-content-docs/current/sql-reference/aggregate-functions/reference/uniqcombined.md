---
description: '计算不同参数值的近似数量。'
sidebar_position: 205
slug: /sql-reference/aggregate-functions/reference/uniqcombined
title: 'uniqCombined'
doc_type: 'reference'
---

# uniqCombined

计算参数不同取值的近似数量。

```sql
uniqCombined(HLL_precision)(x[, ...])
```

函数 `uniqCombined` 是用于计算不同取值数量的一个不错的选择。

**参数**

* `HLL_precision`： [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 中单元格数量的以 2 为底的对数。可选，你可以以 `uniqCombined(x[, ...])` 的形式使用该函数。`HLL_precision` 的默认值为 17，这在实际中对应约 96 KiB 的空间（2^17 个单元格，每个单元格 6 比特）。
* `X`：可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**返回值**

* 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数值。

**实现细节**

`uniqCombined` 函数：

* 对聚合中的所有参数计算哈希值（`String` 使用 64 位哈希，否则使用 32 位哈希），然后在计算中使用该哈希值。
* 使用三种算法的组合：数组、哈希表和带误差修正表的 HyperLogLog。
  * 当不同元素数量较少时，使用数组。
  * 当集合规模更大时，使用哈希表。
  * 当元素数量进一步增大时，使用 HyperLogLog，它将占用固定数量的内存。
* 以确定性的方式返回结果（结果不依赖于查询的处理顺序）。

:::note\
由于对非 `String` 类型使用 32 位哈希，当基数显著大于 `UINT_MAX` 时，结果会有非常大的误差（在达到数百亿个不同值后误差会迅速增大），因此在这种情况下你应使用 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)。
:::

与 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数相比，`uniqCombined` 函数：

* 内存消耗降低数倍。
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
│              1001148 │ -- 100 万
└──────────────────────┘
```

请参阅 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) 的示例部分，以了解在输入规模大得多时 `uniqCombined` 与 `uniqCombined64` 之间的差异。

**另请参阅**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
