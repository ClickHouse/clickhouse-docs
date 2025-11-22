---
description: '对来自两个总体的样本进行 Mann-Whitney 秩和检验。'
sidebar_label: 'mannWhitneyUTest'
sidebar_position: 161
slug: /sql-reference/aggregate-functions/reference/mannwhitneyutest
title: 'mannWhitneyUTest'
doc_type: 'reference'
---

# mannWhitneyUTest

对来自两个总体的样本执行 Mann-Whitney U 秩和检验。

**语法**

```sql
mannWhitneyUTest[(alternative[, continuity_correction])](sample_data, sample_index)
```

两个样本的值都存储在 `sample_data` 列中。如果 `sample_index` 等于 0，则该行中的值属于第一总体的样本；否则属于第二总体的样本。

原假设为两个总体在随机意义上等同。也可以检验单侧假设。该检验不假定数据服从正态分布。

**参数**

* `sample_data` — 样本数据。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) 或 [Decimal](../../../sql-reference/data-types/decimal.md)。
* `sample_index` — 样本索引。[Integer](../../../sql-reference/data-types/int-uint.md)。

**设置项**

* `alternative` — 备择假设。（可选，默认：`'two-sided'`。）[String](../../../sql-reference/data-types/string.md)。
  * `'two-sided'`；
  * `'greater'`；
  * `'less'`。
* `continuity_correction` — 如果不为 0，则在计算 p 值的正态近似时应用连续性校正。（可选，默认：1。）[UInt64](../../../sql-reference/data-types/int-uint.md)。

**返回值**

包含两个元素的 [Tuple](../../../sql-reference/data-types/tuple.md)：

* 计算得到的 U 统计量。[Float64](../../../sql-reference/data-types/float.md)。
* 计算得到的 p 值。[Float64](../../../sql-reference/data-types/float.md)。

**示例**

输入表：

```text
┌─sample_data─┬─sample_index─┐
│          10 │            0 │
│          11 │            0 │
│          12 │            0 │
│           1 │            1 │
│           2 │            1 │
│           3 │            1 │
└─────────────┴──────────────┘
```

查询：

```sql
SELECT mannWhitneyUTest('greater')(sample_data, sample_index) FROM mww_ttest;
```

结果：

```text
┌─mannWhitneyUTest('greater')(sample_data, sample_index)─┐
│ (9,0.04042779918503192)                                │
└────────────────────────────────────────────────────────┘
```

**另请参阅**

* [Mann–Whitney U 检验](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test)
* [随机序关系](https://en.wikipedia.org/wiki/Stochastic_ordering)
