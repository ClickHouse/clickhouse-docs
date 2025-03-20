---
slug: /sql-reference/aggregate-functions/reference/studentttest
sidebar_position: 194
sidebar_label: studentTTest
title: 'studentTTest'
description: '对两个总体的样本应用学生t检验。'
---


# studentTTest

对两个总体的样本应用学生t检验。

**语法**

``` sql
studentTTest([confidence_level])(sample_data, sample_index)
```

两个样本的值都在 `sample_data` 列中。如果 `sample_index` 等于 0，则该行中的值属于第一个总体的样本。否则，它属于第二个总体的样本。原假设是总体的均值相等。假设服从具有相等方差的正态分布。

**参数**

- `sample_data` — 样本数据。[整数](../../../sql-reference/data-types/int-uint.md)、[浮点数](../../../sql-reference/data-types/float.md)或 [十进制](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — 样本索引。[整数](../../../sql-reference/data-types/int-uint.md)。

**参数**

- `confidence_level` — 计算置信区间的置信水平。[浮点数](../../../sql-reference/data-types/float.md)。

**返回值**

[元组](../../../sql-reference/data-types/tuple.md)，包含两个或四个元素（如果指定了可选的 `confidence_level`）：

- 计算出的 t 统计量。[Float64](../../../sql-reference/data-types/float.md)。
- 计算出的 p 值。[Float64](../../../sql-reference/data-types/float.md)。
- [计算出的置信区间下限。[Float64](../../../sql-reference/data-types/float.md)。]
- [计算出的置信区间上限。[Float64](../../../sql-reference/data-types/float.md)。]

**示例**

输入表：

``` text
┌─sample_data─┬─sample_index─┐
│        20.3 │            0 │
│        21.1 │            0 │
│        21.9 │            1 │
│        21.7 │            0 │
│        19.9 │            1 │
│        21.8 │            1 │
└─────────────┴──────────────┘
```

查询：

``` sql
SELECT studentTTest(sample_data, sample_index) FROM student_ttest;
```

结果：

``` text
┌─studentTTest(sample_data, sample_index)───┐
│ (-0.21739130434783777,0.8385421208415731) │
└───────────────────────────────────────────┘
```

**另见**

- [学生t检验](https://en.wikipedia.org/wiki/Student%27s_t-test)
- [welchTTest函数](/sql-reference/aggregate-functions/reference/welchttest)
