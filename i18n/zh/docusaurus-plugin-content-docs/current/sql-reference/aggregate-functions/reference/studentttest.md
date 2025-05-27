---
'description': '对两个总体的样本应用 student t-test。'
'sidebar_label': 'studentTTest'
'sidebar_position': 194
'slug': '/sql-reference/aggregate-functions/reference/studentttest'
'title': 'studentTTest'
---


# studentTTest

对来自两个总体的样本应用Student的t检验。

**语法**

```sql
studentTTest([confidence_level])(sample_data, sample_index)
```

两个样本的值在 `sample_data` 列中。如果 `sample_index` 等于 0，则该行中的值属于第一个总体的样本。否则，它属于第二个总体的样本。原假设是两个总体的均值相等。假设具有相等方差的正态分布。

**参数**

- `sample_data` — 样本数据。[整数](../../../sql-reference/data-types/int-uint.md), [浮点数](../../../sql-reference/data-types/float.md) 或 [十进制](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — 样本索引。[整数](../../../sql-reference/data-types/int-uint.md)。

**参数说明**

- `confidence_level` — 用于计算置信区间的置信水平。[浮点数](../../../sql-reference/data-types/float.md)。

**返回值**

[元组](../../../sql-reference/data-types/tuple.md)，包含两个或四个元素（如果指定了可选的 `confidence_level`）：

- 计算的 t 统计量。[Float64](../../../sql-reference/data-types/float.md)。
- 计算的 p 值。[Float64](../../../sql-reference/data-types/float.md)。
- [计算的置信区间低值。[Float64](../../../sql-reference/data-types/float.md)。]
- [计算的置信区间高值。[Float64](../../../sql-reference/data-types/float.md)。]

**示例**

输入表：

```text
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

```sql
SELECT studentTTest(sample_data, sample_index) FROM student_ttest;
```

结果：

```text
┌─studentTTest(sample_data, sample_index)───┐
│ (-0.21739130434783777,0.8385421208415731) │
└───────────────────────────────────────────┘
```

**另见**

- [Student's t-test](https://en.wikipedia.org/wiki/Student%27s_t-test)
- [welchTTest 函数](/sql-reference/aggregate-functions/reference/welchttest)
