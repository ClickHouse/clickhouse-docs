---
description: '对一个样本和已知总体均值进行单样本 Student t 检验。'
sidebar_label: 'studentTTestOneSample'
sidebar_position: 195
slug: /sql-reference/aggregate-functions/reference/studentttestonesample
title: 'studentTTestOneSample'
doc_type: 'reference'
---

# studentTTestOneSample

对单样本数据应用 Student&#39;s t 检验，以判断样本均值是否与已知总体均值不同。

假定数据服从正态分布。原假设为样本均值等于总体均值。

**语法**

```sql
studentTTestOneSample([置信水平])(样本数据, 总体均值)
```

可选参数 `confidence_level` 用于启用置信区间计算。

**参数**

* `sample_data` — 样本数据。Integer、Float 或 Decimal。
* `population_mean` — 已知的总体均值，用于进行检验。Integer、Float 或 Decimal（通常为常量）。

**可选设置**

* `confidence_level` — 置信区间的置信水平。取值范围为 (0, 1) 的 Float。

注意：

* 至少需要 2 个观测值；否则返回结果为 `(nan, nan)`（如果请求置信区间，则区间为 `nan`）。
* 输入为常量或近似常量时，也会由于标准误为零（或趋近于零）而返回 `nan`。

**返回值**

[Tuple](../../../sql-reference/data-types/tuple.md)，包含两个或四个元素（如果指定了 `confidence_level`）：

* 计算得到的 t 统计量。Float64。
* 计算得到的 p 值（双尾）。Float64。
* 计算得到的置信区间下界。Float64。（可选）
* 计算得到的置信区间上界。Float64。（可选）

置信区间是针对给定置信水平下样本均值的区间。

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

无置信区间：

```sql
SELECT studentTTestOneSample()(value, 20.0) FROM t;
-- 或者简写为
SELECT studentTTestOneSample(value, 20.0) FROM t;
```

使用 95% 置信区间：

```sql
SELECT studentTTestOneSample(0.95)(value, 20.0) FROM t;
```

**另请参阅**

* [Student t 检验](https://en.wikipedia.org/wiki/Student%27s_t-test)
* [studentTTest 函数](/sql-reference/aggregate-functions/reference/studentttest)
