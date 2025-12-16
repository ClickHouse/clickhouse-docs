---
description: '对来自两个总体的样本执行 Welch t 检验。'
sidebar_label: 'welchTTest'
sidebar_position: 214
slug: /sql-reference/aggregate-functions/reference/welchttest
title: 'welchTTest'
doc_type: 'reference'
---

# welchTTest {#welchttest}

将 Welch t 检验应用于来自两个总体的样本。

**语法**

```sql
welchTTest([confidence_level])(sample_data, sample_index)
```

两个样本的值都在 `sample_data` 列中。如果 `sample_index` 等于 0，则该行中的值属于来自第一总体的样本，否则属于来自第二总体的样本。

原假设是两个总体的均值相等。假定总体服从正态分布，总体方差可以不相等。

**参数**

* `sample_data` — 样本数据。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) 或 [Decimal](../../../sql-reference/data-types/decimal.md)。
* `sample_index` — 样本索引。[Integer](../../../sql-reference/data-types/int-uint.md)。

**参数**

* `confidence_level` — 用于计算置信区间的置信水平（可选）。[Float](../../../sql-reference/data-types/float.md)。

**返回值**

包含两个或四个元素的 [Tuple](../../../sql-reference/data-types/tuple.md)（如果指定了可选的 `confidence_level`）。

* 计算得到的 t 统计量。[Float64](../../../sql-reference/data-types/float.md)。
* 计算得到的 p 值。[Float64](../../../sql-reference/data-types/float.md)。
* 计算得到的置信区间下界。[Float64](../../../sql-reference/data-types/float.md)。
* 计算得到的置信区间上界。[Float64](../../../sql-reference/data-types/float.md)。

**示例**

输入表：

```text
┌─sample_data─┬─sample_index─┐
│        20.3 │            0 │
│        22.1 │            0 │
│        21.9 │            0 │
│        18.9 │            1 │
│        20.3 │            1 │
│          19 │            1 │
└─────────────┴──────────────┘
```

查询：

```sql
SELECT welchTTest(sample_data, sample_index) FROM welch_ttest;
```

结果：

```text
┌─welchTTest(sample_data, sample_index)─────┐
│ (2.7988719532211235,0.051807360348581945) │
└───────────────────────────────────────────┘
```

**另请参阅**

* [Welch t 检验](https://en.wikipedia.org/wiki/Welch%27s_t-test)
* [studentTTest 函数](/sql-reference/aggregate-functions/reference/studentttest)
