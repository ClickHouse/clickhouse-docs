---
description: '计算不同参数值的近似数量。与 uniqCombined 相同，但对所有数据类型都使用 64 位哈希，而不是仅对 String 数据类型使用。'
sidebar_position: 206
slug: /sql-reference/aggregate-functions/reference/uniqcombined64
title: 'uniqCombined64'
doc_type: 'reference'
---

# uniqCombined64

计算不同参数值的近似个数。它与 [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) 相同，但对所有数据类型都使用 64 位哈希，而不仅仅是对 String 数据类型使用 64 位哈希。

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**参数**

* `HLL_precision`：在 [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 中单元格数量的以 2 为底的对数。你也可以将函数写为 `uniqCombined64(x[, ...])`。`HLL_precision` 的默认值为 17，这相当于占用 96 KiB 的空间（2^17 个单元格，每个 6 位）。
* `X`：可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数值类型。

**返回值**

* 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数字。

**实现细节**

`uniqCombined64` 函数：

* 为聚合中的所有参数计算哈希（对所有数据类型使用 64 位哈希），然后在计算中使用该哈希。
* 使用三种算法的组合：数组、哈希表以及带误差修正表的 HyperLogLog。
  * 对于不同元素数量较少的情况，使用数组。
  * 当集合大小更大时，使用哈希表。
  * 对于元素数量更大的情况，使用 HyperLogLog，它将占用固定数量的内存。
* 以确定性的方式返回结果（不依赖于查询处理顺序）。

:::note
由于对所有类型都使用 64 位哈希，对于显著大于 `UINT_MAX` 的基数，其结果不会像 [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md) 那样出现非常高的误差；后者对非 `String` 类型使用 32 位哈希。
:::

与 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数相比，`uniqCombined64` 函数：

* 内存消耗减少数倍。
* 计算精度提高数倍。

**示例**

在下面的示例中，`uniqCombined64` 运行在 `1e10` 个不同数字上，返回一个与不同参数值数量非常接近的近似值。

查询：

```sql
SELECT uniqCombined64(number) FROM numbers(1e10);
```

结果：

```response
┌─uniqCombined64(number)─┐
│             9998568925 │ -- 100亿
└────────────────────────┘
```

相比之下，对于这样的输入规模，`uniqCombined` 函数返回的近似结果相当不理想。

查询：

```sql
SELECT uniqCombined(number) FROM numbers(1e10);
```

结果：

```response
┌─uniqCombined(number)─┐
│           5545308725 │ -- 55.5 亿
└──────────────────────┘
```

**另请参阅**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
