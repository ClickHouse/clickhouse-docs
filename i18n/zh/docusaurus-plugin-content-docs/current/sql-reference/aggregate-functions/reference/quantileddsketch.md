---
description: '在提供相对误差保证的前提下计算样本的近似分位数。'
sidebar_position: 171
slug: /sql-reference/aggregate-functions/reference/quantileddsketch
title: 'quantileDD'
doc_type: 'reference'
---

在提供相对误差保证的前提下计算样本的近似[分位数](https://en.wikipedia.org/wiki/Quantile)。其工作原理是通过构建一个 [DD](https://www.vldb.org/pvldb/vol12/p2195-masson.pdf) 结构来实现。

**语法**

```sql
quantileDD(relative_accuracy, [level])(expr)
```

**参数**

* `expr` — 包含数值型数据的列。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md)。

**参数说明**

* `relative_accuracy` — 分位数的相对精度。取值范围为 0 到 1。[Float](../../../sql-reference/data-types/float.md)。sketch 的大小取决于数据范围和相对精度。范围越大且相对精度越小，sketch 越大。sketch 的大致内存占用为 `log(max_value/min_value)/relative_accuracy`。推荐值为 0.001 或更高。

* `level` — 分位数水平。可选。取值范围为 0 到 1。默认值：0.5。[Float](../../../sql-reference/data-types/float.md)。

**返回值**

* 指定水平的近似分位数。

类型：[Float64](/sql-reference/data-types/float)。

**示例**

输入表包含一个整数列和一个浮点数列：

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

计算 0.75 分位数（第三四分位数）的查询：

```sql
SELECT quantileDD(0.01, 0.75)(a), quantileDD(0.01, 0.75)(b) FROM example_table;
```

结果：

```text
┌─quantileDD(0.01, 0.75)(a)─┬─quantileDD(0.01, 0.75)(b)─┐
│               2.974233423476717 │                            1.01 │
└─────────────────────────────────┴─────────────────────────────────┘
```

**另请参阅**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
