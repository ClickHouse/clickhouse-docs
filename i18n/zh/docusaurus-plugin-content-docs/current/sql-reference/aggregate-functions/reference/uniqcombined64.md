---
slug: /sql-reference/aggregate-functions/reference/uniqcombined64
sidebar_position: 206
title: 'uniqCombined64'
description: '计算不同参数值的近似数量。它与 uniqCombined 相同，但对所有数据类型使用 64 位哈希，而不仅限于字符串数据类型。'
---


# uniqCombined64

计算不同参数值的近似数量。它与 [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) 相同，但对所有数据类型使用 64 位哈希，而不仅限于字符串数据类型。

``` sql
uniqCombined64(HLL_precision)(x[, ...])
```

**参数**

- `HLL_precision`： [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 中单元格数量的基础 2 对数。可选地，您可以使用函数 `uniqCombined64(x[, ...])`。默认值为 `HLL_precision` 为 17，相当于 96 KiB 的空间（2^17 个单元格，每个 6 位）。
- `X`：可变数量的参数。参数可以是 `Tuple`、`Array`、`Date`、`DateTime`、`String` 或数字类型。

**返回值**

- 一个 [UInt64](../../../sql-reference/data-types/int-uint.md) 类型的数字。

**实现细节**

`uniqCombined64` 函数：
- 为聚合中所有参数计算哈希（对所有数据类型使用 64 位哈希），然后在计算中使用它。
- 使用数组、哈希表和带有错误校正表的 HyperLogLog 三种算法的组合。
    - 当不同元素数量较少时，使用数组。
    - 当集合大小更大时，使用哈希表。
    - 对于较大数量的元素，使用 HyperLogLog，它将占用固定数量的内存。
- 提供确定性的结果（不依赖于查询处理顺序）。

:::note
由于对所有类型使用 64 位哈希，结果不会像 [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md) 使用的 32 位哈希那么高，后者在基数明显大于 `UINT_MAX` 时会产生极高的误差。
:::

与 [uniq](/sql-reference/aggregate-functions/reference/uniq) 函数相比，`uniqCombined64` 函数：

- 消耗的内存少几倍。
- 计算的准确性高几倍。

**示例**

在下面的示例中，对 `1e10` 不同数字运行 `uniqCombined64`，返回不同参数值数量的非常接近的近似值。

查询：

```sql
SELECT uniqCombined64(number) FROM numbers(1e10);
```

结果：

```response
┌─uniqCombined64(number)─┐
│             9998568925 │ -- 10.00 亿
└────────────────────────┘
```

相比之下，`uniqCombined` 函数对于此大小的输入返回了相当糟糕的近似值。

查询：

```sql
SELECT uniqCombined(number) FROM numbers(1e10);
```

结果：

```response
┌─uniqCombined(number)─┐
│           5545308725 │ -- 5.55 亿
└──────────────────────┘
```

**参见**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
