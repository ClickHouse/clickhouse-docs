---
description: '将 Kolmogorov-Smirnov 检验应用于来自两个总体的样本。'
sidebar_label: 'kolmogorovSmirnovTest'
sidebar_position: 156
slug: /sql-reference/aggregate-functions/reference/kolmogorovsmirnovtest
title: 'kolmogorovSmirnovTest'
doc_type: 'reference'
---

# kolmogorovSmirnovTest

对来自两个总体的样本执行 Kolmogorov-Smirnov 检验。

**语法**

```sql
kolmogorovSmirnovTest([alternative, computation_method])(sample_data, sample_index)
```

两个样本的取值都存放在 `sample_data` 列中。如果 `sample_index` 等于 0，则该行的值属于第一总体的样本；否则，该值属于第二总体的样本。\
样本必须来自一维连续型概率分布。

**参数**

* `sample_data` — 样本数据。[Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) 或 [Decimal](../../../sql-reference/data-types/decimal.md)。
* `sample_index` — 样本索引。[Integer](../../../sql-reference/data-types/int-uint.md)。

**设置项**

* `alternative` — 备择假设。（可选，默认值：`'two-sided'`。）[String](../../../sql-reference/data-types/string.md)。\
  令 F(x) 和 G(x) 分别为第一和第二分布的累积分布函数（CDF）。
  * `'two-sided'`\
    原假设是样本来自同一分布，例如对所有 x 有 `F(x) = G(x)`。\
    备择假设是两个分布并不相同。
  * `'greater'`\
    原假设是第一样本中的值在*随机意义上小于*第二样本中的值，\
    即第一分布的 CDF 位于第二分布的 CDF 之上，从而在其左侧。\
    这实际上意味着对所有 x 有 `F(x) >= G(x)`。在这种情况下，备择假设是存在至少一个 x 使得 `F(x) < G(x)`。
  * `'less'`。\
    原假设是第一样本中的值在*随机意义上大于*第二样本中的值，\
    即第一分布的 CDF 位于第二分布的 CDF 之下，从而在其右侧。\
    这实际上意味着对所有 x 有 `F(x) <= G(x)`。在这种情况下，备择假设是存在至少一个 x 使得 `F(x) > G(x)`。
* `computation_method` — 用于计算 p 值的方法。（可选，默认值：`'auto'`。）[String](../../../sql-reference/data-types/string.md)。
  * `'exact'` - 使用检验统计量的精确概率分布进行计算。除小样本外，计算开销较大且效率较低。
  * `'asymp'`（`'asymptotic'`）- 使用近似方法进行计算。对于大样本，精确和渐近 p 值非常接近。
  * `'auto'`  - 当样本总数的最大值小于 10&#39;000 时使用 `'exact'` 方法。

**返回值**

包含两个元素的 [Tuple](../../../sql-reference/data-types/tuple.md)：

* 计算得到的统计量。[Float64](../../../sql-reference/data-types/float.md)。
* 计算得到的 p 值。[Float64](../../../sql-reference/data-types/float.md)。

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
P-value 大于 0.05（在 95% 置信水平下），因此不拒绝原假设。

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
p 值小于 0.05（对应 95% 置信水平），因此应当拒绝原假设。

**另请参阅**

- [Kolmogorov-Smirnov 检验](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test)