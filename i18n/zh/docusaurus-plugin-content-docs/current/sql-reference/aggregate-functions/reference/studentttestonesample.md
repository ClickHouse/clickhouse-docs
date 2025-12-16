---
description: '对一个样本与已知总体均值进行单样本 Student t 检验。'
sidebar_label: 'studentTTestOneSample'
sidebar_position: 195
slug: /sql-reference/aggregate-functions/reference/studentttestonesample
title: 'studentTTestOneSample'
doc_type: 'reference'
---

# studentTTestOneSample {#studentttestonesample}

对单个样本进行 Student t 检验，以确定该样本的均值是否不同于已知的总体均值。

假定数据服从正态分布。原假设为样本均值等于总体均值。

**语法**

```sql
studentTTestOneSample([confidence_level])(sample_data, population_mean)
```

可选参数 `confidence_level` 用于启用置信区间计算。

**参数说明**

* `sample_data` — 样本数据。Integer、Float 或 Decimal。
* `population_mean` — 用于检验的已知总体均值。Integer、Float 或 Decimal（通常为常量）。

**可选参数**

* `confidence_level` — 置信区间的置信水平。取值为区间 (0, 1) 内的 Float。

注意：

* 至少需要 2 个观测值；否则结果为 `(nan, nan)`（如果请求返回置信区间，则区间值为 `nan`）。
* 常量或近似常量的输入也会由于标准误为 0（或接近 0）而返回 `nan`。

**返回值**

返回一个包含两个或四个元素的 [Tuple](../../../sql-reference/data-types/tuple.md)（如果指定了 `confidence_level`）：

* 计算得到的 t 统计量。Float64。
* 计算得到的 p 值（双尾）。Float64。
* 计算得到的置信区间下界。Float64。（可选）
* 计算得到的置信区间上界。Float64。（可选）

置信区间是针对给定置信水平下的样本均值计算的。

**示例**

输入表：

```text
┌─value─┐
│  20.3 │
│  21.1 │
│  21.7 │
│  19.9 │
│  21.8 │
└───────┘
```

不含置信区间：

```sql
SELECT studentTTestOneSample()(value, 20.0) FROM t;
-- or simply
SELECT studentTTestOneSample(value, 20.0) FROM t;
```

95% 置信区间：

```sql
SELECT studentTTestOneSample(0.95)(value, 20.0) FROM t;
```

**另请参阅**

* [Student t 检验](https://en.wikipedia.org/wiki/Student%27s_t-test)
* [studentTTest 函数](/sql-reference/aggregate-functions/reference/studentttest)
