---
'description': '对样本和已知总体均值应用单样本 Student t 检验。'
'sidebar_label': 'studentTTestOneSample'
'sidebar_position': 195
'slug': '/sql-reference/aggregate-functions/reference/studentttestonesample'
'title': 'studentTTestOneSample'
'doc_type': 'reference'
---


# studentTTestOneSample

应用单样本 Student t 检验，以确定样本的均值是否与已知的总体均值不同。

假设正态分布。零假设是样本均值等于总体均值。

**语法**

```sql
studentTTestOneSample([confidence_level])(sample_data, population_mean)
```

可选的 `confidence_level` 使得置信区间的计算成为可能。

**参数**

- `sample_data` — 样本数据。整数、浮点数或小数。
- `population_mean` — 用于测试的已知总体均值。整数、浮点数或小数（通常为常量）。

**参数说明**

- `confidence_level` — 置信区间的置信水平。介于 (0, 1) 之间的浮点数。

注意：
- 至少需要 2 个观察值；否则结果为 `(nan, nan)`（如果请求了区间，则区间为 `nan`）。
- 常量或接近常量的输入也会返回 `nan`，由于零（或有效为零）的标准误差。

**返回值**

[元组](../../../sql-reference/data-types/tuple.md)，包含两个或四个元素（如果指定了 `confidence_level`）：

- 计算出的 t 统计量。Float64。
- 计算出的 p 值（双尾）。Float64。
- 计算出的置信区间下限。Float64。（可选）
- 计算出的置信区间上限。Float64。（可选）

置信区间是针对给定置信水平的样本均值。

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

没有置信区间：

```sql
SELECT studentTTestOneSample()(value, 20.0) FROM t;
-- or simply
SELECT studentTTestOneSample(value, 20.0) FROM t;
```

有置信区间（95%）：

```sql
SELECT studentTTestOneSample(0.95)(value, 20.0) FROM t;
```

**另见**

- [Student t 检验](https://en.wikipedia.org/wiki/Student%27s_t-test)
- [studentTTest 函数](/sql-reference/aggregate-functions/reference/studentttest)
