---
description: '对来自两个总体的样本进行均值Z检验。'
sidebar_label: 'meanZTest'
sidebar_position: 166
slug: /sql-reference/aggregate-functions/reference/meanztest
title: 'meanZTest'
doc_type: 'reference'
---

# meanZTest

对来自两个总体的样本进行均值Z检验。

**语法**

```sql
meanZTest(population_variance_x, population_variance_y, confidence_level)(sample_data, sample_index)
```

两个样本的取值都在 `sample_data` 列中。如果 `sample_index` 等于 0，则该行的值属于第一总体的样本；否则，该值属于第二总体的样本。

原假设是两个总体的均值相等。假定总体服从正态分布。总体方差可以不相等，且方差已知。

**参数（Arguments）**

* `sample_data` — 样本数据。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) 或 [Decimal](../../../sql-reference/data-types/decimal.md)。
* `sample_index` — 样本索引。[Integer](../../../sql-reference/data-types/int-uint.md)。

**参数（Parameters）**

* `population_variance_x` — 总体 x 的方差。[Float](../../../sql-reference/data-types/float.md)。
* `population_variance_y` — 总体 y 的方差。[Float](../../../sql-reference/data-types/float.md)。
* `confidence_level` — 用于计算置信区间的置信水平。[Float](../../../sql-reference/data-types/float.md)。

**返回值**

包含四个元素的 [Tuple](../../../sql-reference/data-types/tuple.md)：

* 计算得到的 t 统计量。[Float64](../../../sql-reference/data-types/float.md)。
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
