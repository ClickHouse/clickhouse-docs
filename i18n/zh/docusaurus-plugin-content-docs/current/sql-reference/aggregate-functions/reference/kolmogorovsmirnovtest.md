---
'description': '对来自两个总体的样本应用 Kolmogorov-Smirnov 检验。'
'sidebar_label': 'Kolmogorov-Smirnov检验'
'sidebar_position': 156
'slug': '/sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest'
'title': 'kolmogorovSmirnovTest'
---




# kolmogorovSmirnovTest

对来自两个总体的样本应用Kolmogorov-Smirnov检验。

**语法**

```sql
kolmogorovSmirnovTest([alternative, computation_method])(sample_data, sample_index)
```

两个样本的值在 `sample_data` 列中。如果 `sample_index` 等于 0，则该行中的值属于第一个总体的样本。否则，它属于第二个总体的样本。
样本必须属于连续的、无一维概率分布。

**参数**

- `sample_data` — 样本数据。 [整数](../../../sql-reference/data-types/int-uint.md)、 [浮点数](../../../sql-reference/data-types/float.md) 或 [小数](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — 样本索引。 [整数](../../../sql-reference/data-types/int-uint.md)。

**参数**

- `alternative` — 备择假设。 （可选，默认值：`'two-sided'`。） [字符串](../../../sql-reference/data-types/string.md)。
    设 F(x) 和 G(x) 分别是第一个和第二个分布的CDF。
    - `'two-sided'`
        零假设是样本来自相同的分布，例如 `F(x) = G(x)` 对于所有 x。
        备择假设是分布不相同。
    - `'greater'`
        零假设是第一个样本中的值 *随机小于* 第二个样本中的值，
        例如，第一个分布的CDF位于第二个分布的上方并因此在左侧。
        实际上，这意味着 `F(x) >= G(x)` 对于所有 x。 此时的备择假设是对于至少一个 x，`F(x) < G(x)`。
    - `'less'`。
        零假设是第一个样本中的值 *随机大于* 第二个样本中的值，
        例如，第一个分布的CDF位于第二个分布的下方并因此在右侧。
        实际上，这意味着 `F(x) <= G(x)` 对于所有 x。 此时的备择假设是对于至少一个 x，`F(x) > G(x)`。
- `computation_method` — 用于计算p值的方法。 （可选，默认值：`'auto'`。） [字符串](../../../sql-reference/data-types/string.md)。
    - `'exact'` - 使用测试统计量的精确概率分布进行计算。 除了小样本外，计算量大且浪费。
    - `'asymp'` (`'asymptotic'`) - 使用近似进行计算。 对于大样本大小，精确和渐近p值非常相似。
    - `'auto'`  - 当最大样本数量少于 10'000 时使用`'exact'` 方法。


**返回值**

[元组](../../../sql-reference/data-types/tuple.md)，包含两个元素：

- 计算的统计量。 [Float64](../../../sql-reference/data-types/float.md)。
- 计算的 p 值。 [Float64](../../../sql-reference/data-types/float.md)。


**示例**

查询：

```sql
SELECT kolmogorovSmirnovTest('less', 'exact')(value, num)
FROM
(
    SELECT
        randNormal(0, 10) AS value,
        0 AS num
    FROM numbers(10000)
    UNION ALL
    SELECT
        randNormal(0, 10) AS value,
        1 AS num
    FROM numbers(10000)
)
```

结果：

```text
┌─kolmogorovSmirnovTest('less', 'exact')(value, num)─┐
│ (0.009899999999999996,0.37528595205132287)         │
└────────────────────────────────────────────────────┘
```

注意：
P值大于0.05（对于95%的置信水平），因此未拒绝零假设。


查询：

```sql
SELECT kolmogorovSmirnovTest('two-sided', 'exact')(value, num)
FROM
(
    SELECT
        randStudentT(10) AS value,
        0 AS num
    FROM numbers(100)
    UNION ALL
    SELECT
        randNormal(0, 10) AS value,
        1 AS num
    FROM numbers(100)
)
```

结果：

```text
┌─kolmogorovSmirnovTest('two-sided', 'exact')(value, num)─┐
│ (0.4100000000000002,6.61735760482795e-8)                │
└─────────────────────────────────────────────────────────┘
```

注意：
P值小于0.05（对于95%的置信水平），因此拒绝零假设。


**另请参见**

- [Kolmogorov-Smirnov检验](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test)
