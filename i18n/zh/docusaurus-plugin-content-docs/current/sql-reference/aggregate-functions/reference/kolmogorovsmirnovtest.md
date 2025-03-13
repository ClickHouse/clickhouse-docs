---
slug: /sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest
sidebar_position: 156
sidebar_label: kolmogorovSmirnovTest
title: "kolmogorovSmirnovTest"
description: "对两个群体的样本应用Kolmogorov-Smirnov检验。"
---


# kolmogorovSmirnovTest

对两个群体的样本应用Kolmogorov-Smirnov检验。

**语法**

``` sql
kolmogorovSmirnovTest([alternative, computation_method])(sample_data, sample_index)
```

两个样本的值在 `sample_data` 列中。如果 `sample_index` 等于 0，则该行中的值属于第一个群体的样本。否则，它属于第二个群体的样本。
样本必须属于连续的一维概率分布。

**参数**

- `sample_data` — 样本数据。[整型](../../../sql-reference/data-types/int-uint.md)、[浮点型](../../../sql-reference/data-types/float.md)或[十进制型](../../../sql-reference/data-types/decimal.md)。
- `sample_index` — 样本索引。[整型](../../../sql-reference/data-types/int-uint.md)。

**参数说明**

- `alternative` — 备择假设。（可选，默认值：`'two-sided'`。）[字符串](../../../sql-reference/data-types/string.md)。
    设 F(x) 和 G(x) 为第一个和第二个分布的CDF。
    - `'two-sided'`
        零假设是样本来自同一分布，例如对所有 x，有 `F(x) = G(x)`。
        备择假设是这两个分布不相同。
    - `'greater'`
        零假设是第一个样本中的值在*随机上小于*第二个样本中的值，
        例如，第一个分布的CDF位于第二个分布的上方，因此位于其左侧。
        这实际上意味着对所有 x，有 `F(x) >= G(x)`。在这种情况下，备择假设是 `F(x) < G(x)` 在至少一个 x。
    - `'less'`
        零假设是第一个样本中的值在*随机上大于*第二个样本中的值，
        例如，第一个分布的CDF位于第二个分布的下方，因此位于其右侧。
        这实际上意味着对所有 x，有 `F(x) <= G(x)`。在这种情况下，备择假设是 `F(x) > G(x)` 在至少一个 x。
- `computation_method` — 用于计算p值的方法。（可选，默认值：`'auto'`。）[字符串](../../../sql-reference/data-types/string.md)。
    - `'exact'` - 使用测试统计量的精确概率分布进行计算。除小样本外，计算密集且浪费。
    - `'asymp'` (`'asymptotic'`) - 使用近似值进行计算。对于大样本，精确和渐近的p值非常相似。
    - `'auto'`  - 当样本的最大数量小于 10'000 时使用 `'exact'` 方法。

**返回值**

[元组](../../../sql-reference/data-types/tuple.md)包含两个元素：

- 计算的统计量。[Float64](../../../sql-reference/data-types/float.md)。
- 计算的 p 值。[Float64](../../../sql-reference/data-types/float.md)。

**示例**

查询：

``` sql
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

``` text
┌─kolmogorovSmirnovTest('less', 'exact')(value, num)─┐
│ (0.009899999999999996,0.37528595205132287)         │
└────────────────────────────────────────────────────┘
```

注意：
P 值大于 0.05（在 95% 的置信水平下），因此未拒绝零假设。

查询：

``` sql
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

``` text
┌─kolmogorovSmirnovTest('two-sided', 'exact')(value, num)─┐
│ (0.4100000000000002,6.61735760482795e-8)                │
└─────────────────────────────────────────────────────────┘
```

注意：
P 值小于 0.05（在 95% 的置信水平下），因此拒绝了零假设。

**另见**

- [Kolmogorov-Smirnov's test](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test)
