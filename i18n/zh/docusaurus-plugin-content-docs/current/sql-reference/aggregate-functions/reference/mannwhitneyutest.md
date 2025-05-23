---
'description': '对来自两个种群的样本应用 Mann-Whitney 排名测试。'
'sidebar_label': 'mannWhitneyUTest'
'sidebar_position': 161
'slug': '/sql-reference/aggregate-functions/reference/mannwhitneyutest'
'title': 'mannWhitneyUTest'
---


# mannWhitneyUTest

对来自两个种群的样本应用曼-惠特尼秩检验。

**语法**

```sql
mannWhitneyUTest[(alternative[, continuity_correction])](sample_data, sample_index)
```

两个样本的值在 `sample_data` 列中。如果 `sample_index` 等于 0，则该行中的值属于第一个种群的样本。否则，它属于第二个种群的样本。
零假设是两个种群在统计上是相等的。同时可以测试单边假设。该检验不假设数据具有正态分布。

**参数**

- `sample_data` — 样本数据。 [整数](../../../sql-reference/data-types/int-uint.md)、[浮点数](../../../sql-reference/data-types/float.md) 或 [小数](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — 样本索引。 [整数](../../../sql-reference/data-types/int-uint.md)。

**参数**

- `alternative` — 替代假设。 （可选，默认: `'two-sided'`。） [字符串](../../../sql-reference/data-types/string.md)。
    - `'two-sided'`；
    - `'greater'`；
    - `'less'`。
- `continuity_correction` — 如果不为 0，则在 p 值的正态近似中应用连续性修正。 （可选，默认: 1。） [UInt64](../../../sql-reference/data-types/int-uint.md)。

**返回值**

包含两个元素的 [元组](../../../sql-reference/data-types/tuple.md)：

- 计算的 U 统计量。 [Float64](../../../sql-reference/data-types/float.md)。
- 计算的 p 值。 [Float64](../../../sql-reference/data-types/float.md)。

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

- [曼-惠特尼 U 检验](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test)
- [随机排序](https://en.wikipedia.org/wiki/Stochastic_ordering)
