
# welchTTest

应用 Welch 的 t 检验来对来自两个总体的样本进行分析。

**语法**

```sql
welchTTest([confidence_level])(sample_data, sample_index)
```

两个样本的值在 `sample_data` 列中。如果 `sample_index` 等于 0，则该行的值属于第一个总体的样本。否则，它属于第二个总体的样本。
原假设是总体的均值相等。假设符合正态分布。总体可能具有不等的方差。

**参数**

- `sample_data` — 样本数据。 [整数](../../../sql-reference/data-types/int-uint.md)、[浮点数](../../../sql-reference/data-types/float.md) 或 [小数](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — 样本索引。 [整数](../../../sql-reference/data-types/int-uint.md)。

**参数**

- `confidence_level` — 用于计算置信区间的置信水平。 [浮点数](../../../sql-reference/data-types/float.md)。

**返回值**

[元组](../../../sql-reference/data-types/tuple.md)，包含两个或四个元素（如果指定了可选的 `confidence_level`）

- 计算的 t 统计量。 [Float64](../../../sql-reference/data-types/float.md)。
- 计算的 p 值。 [Float64](../../../sql-reference/data-types/float.md)。
- 计算的置信区间下限。 [Float64](../../../sql-reference/data-types/float.md)。
- 计算的置信区间上限。 [Float64](../../../sql-reference/data-types/float.md)。

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

**参见**

- [Welch 的 t 检验](https://en.wikipedia.org/wiki/Welch%27s_t-test)
- [studentTTest 函数](/sql-reference/aggregate-functions/reference/studentttest)
