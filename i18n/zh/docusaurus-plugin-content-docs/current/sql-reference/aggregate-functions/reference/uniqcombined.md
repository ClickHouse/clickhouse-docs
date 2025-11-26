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

函数 `uniqCombined` 是计算不同值数量的一个不错选择。

**参数**

* `HLL_precision`： [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 中单元数量的以 2 为底的对数。可选，你可以以 `uniqCombined(x[, ...])` 的形式使用该函数。`HLL_precision` 的默认值为 17，在实际中占用约 96 KiB 空间（2^17 个单元，每个 6 位）。
* `X`：可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**返回值**

* 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数值。

**实现细节**

`uniqCombined` 函数：

* 为聚合中的所有参数计算哈希（`String` 使用 64 位哈希，其他类型使用 32 位哈希），并在计算中使用该哈希值。
* 使用三种算法的组合：数组、哈希表以及带误差修正表的 HyperLogLog。
  * 对于不同元素数量较少的情况，使用数组。
  * 当集合规模更大时，使用哈希表。
  * 对于元素数量更多的情况，使用 HyperLogLog，其将占用固定大小的内存。
* 以确定性的方式给出结果（不依赖查询处理顺序）。

:::note\
由于对非 `String` 类型使用 32 位哈希，当基数显著大于 `UINT_MAX` 时，结果误差会非常大（在数百亿个不同值之后误差会快速增大），因此在这种情况下你应使用 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)。
:::

与 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数相比，`uniqCombined` 函数：

* 内存消耗可降低数倍。
* 计算精度可提高数倍。
* 通常性能略低。在某些场景下，`uniqCombined` 的性能可以优于 `uniq`，例如在通过网络传输大量聚合状态的分布式查询中。

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

请参阅 [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) 的示例部分，以了解在更大规模输入数据时 `uniqCombined` 与 `uniqCombined64` 之间差异的示例。

**另请参阅**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
