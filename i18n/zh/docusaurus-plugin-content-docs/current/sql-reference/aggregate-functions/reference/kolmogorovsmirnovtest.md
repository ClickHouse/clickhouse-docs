---
'description': '对来自两个总体的样本应用 Kolmogorov-Smirnov 检验。'
'sidebar_label': 'kolmogorovSmirnovTest'
'sidebar_position': 156
'slug': '/sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest'
'title': 'kolmogorovSmirnovTest'
---


# kolmogorovSmirnovTest

对来自两个总体的样本应用 Kolmogorov-Smirnov 检验。

**语法**

```sql
kolmogorovSmirnovTest([alternative, computation_method])(sample_data, sample_index)
```

两个样本的值在 `sample_data` 列中。如果 `sample_index` 等于 0，则该行的值属于第一个总体的样本。否则，它属于第二个总体的样本。
样本必须属于连续的一维概率分布。

**参数**

- `sample_data` — 样本数据。 [整数](../../../sql-reference/data-types/int-uint.md), [浮点数](../../../sql-reference/data-types/float.md)或[小数](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — 样本索引。 [整数](../../../sql-reference/data-types/int-uint.md)。

**参数说明**

- `alternative` — 备择假设。（可选，默认值：`'two-sided'`。） [字符串](../../../sql-reference/data-types/string.md)。
    设 F(x) 和 G(x) 分别为第一个和第二个分布的 CDF。
    - `'two-sided'`
        零假设是样本来自同一分布，例如对于所有 x 有 `F(x) = G(x)`。
        备择假设是分布不相同。
    - `'greater'`
        零假设是第一个样本中的值 *随机地小于* 第二个样本中的值，
        例如，第一个分布的 CDF 位于第二个分布的左上方。
        这实际上意味着对于所有 x 有 `F(x) >= G(x)`。此情况下的备择假设是至少存在一个 x，使得 `F(x) < G(x)`。
    - `'less'`
        零假设是第一个样本中的值 *随机地大于* 第二个样本中的值，
        例如，第一个分布的 CDF 位于第二个分布的右下方。
        这实际上意味着对于所有 x 有 `F(x) <= G(x)`。此情况下的备择假设是至少存在一个 x，使得 `F(x) > G(x)`。
- `computation_method` — 用于计算 p 值的方法。（可选，默认值：`'auto'`。） [字符串](../../../sql-reference/data-types/string.md)。
    - `'exact'` - 计算是使用检验统计量的精确概率分布进行的。计算密集且浪费，除非样本较小。
    - `'asymp'` (`'asymptotic'`) - 计算是使用近似进行的。对于大样本大小，精确和渐近的 p 值非常相似。
    - `'auto'`  - 当最大样本数量少于 10,000 时，使用 `'exact'` 方法。

**返回值**

包含两个元素的 [元组](../../../sql-reference/data-types/tuple.md)：

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
p 值大于 0.05（在 95% 置信水平下），因此不拒绝零假设。

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
p 值小于 0.05（在 95% 置信水平下），因此拒绝零假设。

**另见**

- [Kolmogorov-Smirnov检验](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test)
