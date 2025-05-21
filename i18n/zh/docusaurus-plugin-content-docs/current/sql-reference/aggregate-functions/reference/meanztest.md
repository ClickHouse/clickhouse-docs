---
'description': '对来自两个群体的样本应用均值 z 检验。'
'sidebar_label': '均值Z检验'
'sidebar_position': 166
'slug': '/sql-reference/aggregate-functions/reference/meanztest'
'title': '均值Z检验'
---




# meanZTest

对两个种群的样本应用均值z检验。

**语法**

```sql
meanZTest(population_variance_x, population_variance_y, confidence_level)(sample_data, sample_index)
```

两个样本的值位于 `sample_data` 列中。如果 `sample_index` 等于 0，则该行中的值属于第一个种群的样本。否则，它属于第二个种群的样本。
原假设是种群的均值相等。假设服从正态分布。种群可能具有不等方差，并且方差是已知的。

**参数**

- `sample_data` — 样本数据。 [整数](../../../sql-reference/data-types/int-uint.md)， [浮点数](../../../sql-reference/data-types/float.md) 或 [十进制](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — 样本索引。 [整数](../../../sql-reference/data-types/int-uint.md)。

**参数说明**

- `population_variance_x` — 种群 x 的方差。 [浮点数](../../../sql-reference/data-types/float.md)。
- `population_variance_y` — 种群 y 的方差。 [浮点数](../../../sql-reference/data-types/float.md)。
- `confidence_level` — 用于计算置信区间的置信水平。 [浮点数](../../../sql-reference/data-types/float.md)。

**返回值**

[元组](../../../sql-reference/data-types/tuple.md) 包含四个元素：

- 计算得到的 t 统计量。 [Float64](../../../sql-reference/data-types/float.md)。
- 计算得到的 p 值。 [Float64](../../../sql-reference/data-types/float.md)。
- 计算得到的置信区间下限。 [Float64](../../../sql-reference/data-types/float.md)。
- 计算得到的置信区间上限。 [Float64](../../../sql-reference/data-types/float.md)。

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
