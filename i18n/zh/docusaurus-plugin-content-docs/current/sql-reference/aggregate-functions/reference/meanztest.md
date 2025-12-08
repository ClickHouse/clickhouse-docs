---
description: '对来自两个总体的样本进行均值 z 检验。'
sidebar_label: 'meanZTest'
sidebar_position: 166
slug: /sql-reference/aggregate-functions/reference/meanztest
title: 'meanZTest'
doc_type: 'reference'
---

# meanZTest {#meanztest}

对来自两个总体的样本执行均值 Z 检验。

**语法**

```sql
meanZTest(总体方差_x, 总体方差_y, 置信度)(样本数据, 样本索引)
```

两个样本的值都在 `sample_data` 列中。如果 `sample_index` 等于 0，则该行的值属于第一个总体的样本；否则，该行的值属于第二个总体的样本。

原假设是两个总体的均值相等。假设总体服从正态分布。两个总体的方差可以不相等，且方差是已知的。

**参数**

* `sample_data` — 样本数据。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) 或 [Decimal](../../../sql-reference/data-types/decimal.md)。
* `sample_index` — 样本索引。[Integer](../../../sql-reference/data-types/int-uint.md)。

**参数设置**

* `population_variance_x` — 总体 x 的方差。[Float](../../../sql-reference/data-types/float.md)。
* `population_variance_y` — 总体 y 的方差。[Float](../../../sql-reference/data-types/float.md)。
* `confidence_level` — 用于计算置信区间的置信水平。[Float](../../../sql-reference/data-types/float.md)。

**返回值**

包含四个元素的 [Tuple](../../../sql-reference/data-types/tuple.md)：

* 计算得到的 t-统计量。[Float64](../../../sql-reference/data-types/float.md)。
* 计算得到的 p 值。[Float64](../../../sql-reference/data-types/float.md)。
* 计算得到的置信区间下界。[Float64](../../../sql-reference/data-types/float.md)。
* 计算得到的置信区间上界。[Float64](../../../sql-reference/data-types/float.md)。

**示例**

输入表：

```text
┌─sample_data─┬─sample_index─┐
│        20.3 │            0 │
│        21.9 │            0 │
│        22.1 │            0 │
│        18.9 │            1 │
│          19 │            1 │
│        20.3 │            1 │
└─────────────┴──────────────┘
```

查询：

```sql
SELECT meanZTest(0.7, 0.45, 0.95)(sample_data, sample_index) FROM mean_ztest
```

结果：

```text
┌─meanZTest(0.7, 0.45, 0.95)(sample_data, sample_index)────────────────────────────┐
│ (3.2841296025548123,0.0010229786769086013,0.8198428246768334,3.2468238419898365) │
└──────────────────────────────────────────────────────────────────────────────────┘
```
